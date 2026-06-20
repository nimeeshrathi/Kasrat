#!/usr/bin/env python3
"""
Build per-exercise demo clips for Kasrat from the free-exercise-db dataset.

Source : https://github.com/yuhonas/free-exercise-db  (The Unlicense / public domain)
What it does:
  1. Reads Kasrat's own exercises out of www/js/storage.js.
  2. Fuzzy-matches each one to a free-exercise-db entry (name + equipment + muscle).
  3. Downloads that entry's two stills (start / end position) and bakes them into a
     small looping animated WebP at  www/assets/exercises/<kasrat-id>.webp
     — which the app already picks up automatically (no code changes).
  4. Writes a review file (tools/exercise_media_matches.tsv) and prints an
     unmatched list so you can fill in MANUAL_MATCH / SKIP and re-run.

Usage:
  python3 tools/build_exercise_media.py --dry-run     # match only, no downloads
  python3 tools/build_exercise_media.py               # match + build clips
  python3 tools/build_exercise_media.py --force       # rebuild even if file exists
  python3 tools/build_exercise_media.py --only bench_press,squat
Needs: Pillow (pip install Pillow).
"""

import argparse, json, os, re, sys, urllib.request, difflib
from io import BytesIO

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STORAGE = os.path.join(ROOT, "www", "js", "storage.js")
OUT_DIR = os.path.join(ROOT, "www", "assets", "exercises")
REPORT  = os.path.join(ROOT, "tools", "exercise_media_matches.tsv")
RAW = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main"
DATA_URL = RAW + "/dist/exercises.json"
IMG_BASE = RAW + "/exercises"

# Force a specific free-exercise-db id for a Kasrat id (review the .tsv, then fill these).
MANUAL_MATCH = {
    # "kasrat_id": "Free_Exercise_DB_Id",  (verified canonical picks)
    "bench_press":  "Barbell_Bench_Press_-_Medium_Grip",
    "ohp":          "Barbell_Shoulder_Press",
    "deadlift":     "Barbell_Deadlift",
    "squat":        "Barbell_Squat",
    "pushup":       "Pushups",
    "pullup":       "Pullups",
    "lat_pulldown": "Wide-Grip_Lat_Pulldown",
    "cable_fly":        "Flat_Bench_Cable_Flyes",
    "db_lateral_raise": "Side_Lateral_Raise",
    "dips":             "Dips_-_Chest_Version",
    "hyperextension":   "Hyperextensions_Back_Extensions",
}
# Kasrat ids to leave without a clip — auto-match found only a *different* movement,
# so a clip would mislead. Better to fall back to text-only until a real clip is added.
SKIP = {
    "rowing_machine", "stationary_bike", "kettlebell_swing", "pullover_cable",
    "cable_woodchop", "machine_fly", "single_arm_pushdown", "high_cable_fly",
    "l_sit", "jump_rope",
}

# Map Kasrat equipment -> the free-exercise-db equipment string(s).
EQUIP_MAP = {
    "barbell": {"barbell"}, "dumbbell": {"dumbbell"}, "cable": {"cable"},
    "machine": {"machine"}, "bodyweight": {"body only"}, "kettlebell": {"kettlebells"},
    "ez bar": {"e-z curl bar"}, "band": {"bands"}, "plate": {"other", "barbell"},
}
# Map a free-exercise-db primary muscle -> Kasrat's coarse group.
MUSCLE_MAP = {
    "chest": "chest",
    "lats": "back", "middle back": "back", "lower back": "back", "traps": "back",
    "shoulders": "shoulders", "neck": "shoulders",
    "biceps": "arms", "triceps": "arms", "forearms": "arms",
    "quadriceps": "legs", "hamstrings": "legs", "glutes": "legs", "calves": "legs",
    "abductors": "legs", "adductors": "legs",
    "abdominals": "core",
}
# Word/abbreviation expansion so "Incline DB Press" matches "Incline Dumbbell Press".
EXPAND = {
    "db": "dumbbell", "bb": "barbell", "ohp": "overhead press", "rdl": "romanian deadlift",
    "sldl": "stiff legged deadlift", "ez": "e z", "situp": "sit up", "pushup": "push up",
    "pullup": "pull up", "chinup": "chin up", "pulldown": "pull down",
}
STOP = {"the", "a", "with", "and", "of", "to"}
# Qualifiers that signal a *different movement* — penalised so canonical lifts win
# over exotic variants (not equipment words; those are scored separately).
VARIANT_WORDS = {
    "clean", "snatch", "jerk", "sled", "smith", "plyo", "plyometric", "suspended",
    "chains", "chain", "deficit", "sumo", "axle", "car", "rickshaw", "handstand",
    "depth", "behind", "guillotine", "powerlifting", "rocky", "clock", "drop",
}


def load_kasrat():
    src = open(STORAGE, encoding="utf-8").read()
    pat = re.compile(
        r"\{ id: '([^']+)', name: '([^']+)'.*?primaryMuscleGroup: '([^']+)'"
        r".*?equipment: '([^']+)', category: '([^']+)'")
    out = []
    for m in pat.finditer(src):
        out.append(dict(id=m.group(1), name=m.group(2),
                        muscle=m.group(3), equipment=m.group(4).lower(),
                        category=m.group(5)))
    return out


def norm_tokens(name):
    s = name.lower()
    s = re.sub(r"[^a-z0-9 ]+", " ", s.replace("-", " ").replace("_", " ").replace("/", " "))
    toks = []
    for t in s.split():
        t = EXPAND.get(t, t)
        toks.extend(t.split())
    return [t for t in toks if t and t not in STOP]


def name_score(a_tokens, b_tokens):
    # Kasrat names are short & canonical ("Bench Press"); dataset names are long &
    # specific ("Barbell Bench Press - Medium Grip"). So reward *coverage of my
    # tokens* and lightly penalise extra qualifiers (heavily if they imply another
    # movement), instead of symmetric Jaccard which favours the shortest variant.
    a, b = set(a_tokens), set(b_tokens)
    if not a or not b:
        return 0.0
    coverage = len(a & b) / len(a)
    extra = b - a
    seq = difflib.SequenceMatcher(None, " ".join(a_tokens), " ".join(b_tokens)).ratio()
    score = 0.85 * coverage + 0.15 * seq - 0.035 * len(extra) - 0.12 * len(extra & VARIANT_WORDS)
    return max(0.0, score)


def best_match(k, theirs):
    kw = EQUIP_MAP.get(k["equipment"], set())
    ktoks = norm_tokens(k["name"])
    best, best_sc, best_ns = None, -1, 0
    for t in theirs:
        ns = name_score(ktoks, t["_toks"])
        if ns < 0.30:
            continue
        equip = 1 if (t.get("equipment") in kw) else 0
        muscles = {MUSCLE_MAP.get(m) for m in (t.get("primaryMuscles") or [])}
        muscle = 1 if k["muscle"] in muscles else 0
        sc = 0.72 * ns + 0.16 * equip + 0.12 * muscle
        if sc > best_sc:
            best, best_sc, best_ns = t, sc, ns
    return best, best_sc, best_ns


def fetch(url, timeout=30):
    req = urllib.request.Request(url, headers={"User-Agent": "kasrat-media-builder"})
    return urllib.request.urlopen(req, timeout=timeout).read()


def build_clip(img_urls, out_path, size=(480, 360)):
    from PIL import Image
    def cover(im):
        im = im.convert("RGB")
        tw, th = size
        sc = max(tw / im.width, th / im.height)
        im = im.resize((round(im.width * sc), round(im.height * sc)), Image.LANCZOS)
        x = (im.width - tw) // 2; y = (im.height - th) // 2
        return im.crop((x, y, x + tw, y + th))
    a = cover(Image.open(BytesIO(fetch(img_urls[0]))))
    b = cover(Image.open(BytesIO(fetch(img_urls[1]))) if len(img_urls) > 1 else a)
    # Hold A, cross-fade to B, hold B, cross-fade back — a smooth position-to-position loop.
    frames, durs = [], []
    frames += [a, a]; durs += [700, 240]
    for s in (0.25, 0.5, 0.75):
        frames.append(Image.blend(a, b, s)); durs.append(120)
    frames += [b, b]; durs += [700, 240]
    for s in (0.75, 0.5, 0.25):
        frames.append(Image.blend(a, b, s)); durs.append(120)
    frames[0].save(out_path, save_all=True, append_images=frames[1:],
                   duration=durs, loop=0, format="WEBP", quality=72, method=4)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true", help="match only; download nothing")
    ap.add_argument("--force", action="store_true", help="rebuild clips that already exist")
    ap.add_argument("--only", default="", help="comma-separated kasrat ids to limit to")
    ap.add_argument("--data", default="", help="local exercises.json (else download)")
    ap.add_argument("--accept", type=float, default=0.52, help="min combined score to auto-match")
    args = ap.parse_args()

    theirs = json.load(open(args.data)) if args.data else json.loads(fetch(DATA_URL))
    for t in theirs:
        t["_toks"] = norm_tokens(t["name"])
    by_id = {t["id"]: t for t in theirs}

    mine = load_kasrat()
    only = set(filter(None, args.only.split(",")))
    if only:
        mine = [k for k in mine if k["id"] in only]

    os.makedirs(OUT_DIR, exist_ok=True)
    rows, matched, unmatched, built = [], [], [], 0
    for k in mine:
        if k["id"] in SKIP:
            unmatched.append((k, "skipped")); continue
        if k["id"] in MANUAL_MATCH:
            t, sc, ns = by_id.get(MANUAL_MATCH[k["id"]]), 1.0, 1.0
        else:
            t, sc, ns = best_match(k, theirs)
        ok = bool(t) and sc >= args.accept
        rows.append((k["id"], k["name"], t["id"] if t else "", t["name"] if t else "",
                     f"{sc:.2f}", f"{ns:.2f}", "match" if ok else "low"))
        if not ok:
            unmatched.append((k, f"best={t['name'] if t else '—'} score={sc:.2f}")); continue
        matched.append((k, t))

    with open(REPORT, "w", encoding="utf-8") as f:
        f.write("kasrat_id\tkasrat_name\tfedb_id\tfedb_name\tscore\tname_score\tstatus\n")
        for r in rows:
            f.write("\t".join(r) + "\n")

    print(f"\nKasrat exercises: {len(mine)}   auto-matched: {len(matched)}   "
          f"unmatched: {len(unmatched)}   (threshold {args.accept})")
    print(f"Review file: {os.path.relpath(REPORT, ROOT)}")

    if args.dry_run:
        print("\n-- dry run: no clips built. Sample matches --")
        for k, t in matched[:25]:
            print(f"  {k['id']:<24} -> {t['name']}")
        print("\n-- unmatched (fill MANUAL_MATCH or add a clip by hand) --")
        for k, why in unmatched:
            print(f"  {k['id']:<24} {k['name']:<26} {why}")
        return

    for k, t in matched:
        out = os.path.join(OUT_DIR, k["id"] + ".webp")
        if os.path.exists(out) and not args.force:
            continue
        urls = [f"{IMG_BASE}/{p}" for p in t["images"]]
        try:
            build_clip(urls, out)
            built += 1
            print(f"  built {k['id']}.webp  <- {t['name']}")
        except Exception as e:
            print(f"  FAILED {k['id']}: {e}", file=sys.stderr)

    print(f"\nDone. Built {built} clips into {os.path.relpath(OUT_DIR, ROOT)}/")
    if unmatched:
        print(f"{len(unmatched)} unmatched — see the review file; add MANUAL_MATCH entries and re-run.")


if __name__ == "__main__":
    main()
