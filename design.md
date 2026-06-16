# Kasrat — Design Document

> **Status:** Finalized v1 design. All major product decisions resolved; remaining items are build-time tuning, noted in §13.

## 1. Overview

**Kasrat** is a mobile application for tracking gym workouts, routines, and fitness progress, inspired by apps like Hevy. It enables users to log exercises in real time, maintain a complete and trustworthy workout history, visualize progress through rich dashboards, and stay motivated through streaks, milestones, and achievement badges — without punishing rest or normal life.

### 1.1 Goals
- Make workout logging fast and frictionless (minimal taps mid-set).
- Give users a clear, motivating picture of their progress over time.
- Surface muscle-group-based insights that help users train in balance.
- Build durable habits through consistency mechanics that reward what users can control.

### 1.2 Non-Goals (v1)
- Social feed / following other users.
- In-app video coaching or live classes.
- Nutrition / calorie tracking.
- Goal-setting flows (no weight-loss/muscle-gain goal types in v1).
- Full cardio analytics (distance/incline are supported as routine inputs and logging, not deep cardio dashboards).
- Per-exercise instructional video/GIFs (text + muscle diagrams only in v1; media licensing deferred).
- Wearable / smartwatch integration.
- Body-measurement tracking (a single optional bodyweight number is supported for volume math — see §6).
- Health platform integration (Apple Health / Google Fit).
- Cloud accounts / multi-device sync (single device + local backup/export only).

These are explicitly deferred to later phases (see Roadmap, §11).

---

## 2. Target Users & Personas

| Persona | Description | Core Need |
|---|---|---|
| **The Beginner** | New to the gym, follows a simple weekly split | Guidance, simple logging, encouragement |
| **The Consistent Lifter** | Trains 3–5x/week, tracks progressive overload | Fast logging, PR tracking, trends |
| **The Data Nerd** | Loves analytics and balance optimization | Deep charts, muscle balance, volume analysis |

---

## 3. Core Features

### 3.1 Routines & Weekly Schedule
A **Routine** is a reusable training-day template — a named, ordered set of exercises (e.g., "Routine A," "Routine B," "Routine C"). Routines are assigned to days of the week to form the user's weekly plan.

- Build one **active weekly plan** by assigning a routine to each day (Mon–Sun), including **rest days**.
- Routines are simply named (**Routine A / B / C …**) — no preset split templates are shipped; every routine is user-created.
- Each routine holds an ordered list of exercises with **target sets, target rep range, and target weight** (and **distance/incline** for cardio-type exercises).
- Add exercises from a built-in **exercise library** or from the user's **custom exercises** (filterable by muscle group, equipment, difficulty).
- Reorder, **superset/group**, and arrange exercises within a routine.
- **Today's workout** surfaces automatically on the home screen based on the day's assigned routine.
- Start the scheduled routine in one tap, **or freely start any other routine on any day** — the schedule is a suggestion, not a restriction. Any completed session counts regardless of which day it was performed.
- **Repeat last workout**: a one-tap path from history to redo a prior session, with last time's numbers shown as reference.

### 3.2 Live Workout Logging
Logging speed is the single most important UX property; the flow is built around minimal taps.

- Log **weight × reps** per set. For time-based exercises (plank, dead hang), log **duration**; for cardio-type exercises, log **distance and incline**.
- **Bodyweight exercises** (pull-ups, dips, push-ups): logged as reps with **no weight required**, plus an **optional added weight** field (e.g., +20 kg) for weighted variations, and an **assisted mode** (negative load) per set. Volume is computed using a biomechanical bodyweight coefficient (see §6 / §7).
- **Set types**: normal, warm-up, drop, failure. **Every set defaults to "normal"**; type is changed only on the exception via a quick toggle/long-press — the common case requires zero extra taps.
- **Weight entry**: free numeric input (kg), with **quick-step buttons (+1.25 / +2.5 / +5 kg)** as a convenience — never the only option, so users are never nudged to feel capped.
- **No auto pre-fill of target numbers**: the input stays blank, but the **previous session's numbers are shown as reference** ("last time: 80kg × 8") so users choose their own load without being anchored to a ceiling.
- **Live progress cue (traffic-light)**: as a set is entered, a subtle colour compares it to the same exercise's previous performance — **green** = beating last time, **yellow** = matching, **red** = below — delivering the progressive-overload dopamine hit in the moment. Rule: a heavier top set is green; equal weight at **more reps** is green; equal weight and reps is yellow; fewer reps or less weight is red.
- **Inline plate calculator**: the per-side plate breakdown displays next to the entered weight automatically (e.g., "100 kg = 20+20+5 / side"), rather than living behind a separate tool.
- **Supersets**: group 2+ exercises performed back-to-back. On marking a set complete, the logger **auto-advances to the next exercise in the group**; the rest timer fires only **after the last exercise** in the superset. Supports pairs or larger circuits; per-exercise rest configurable.
- **In-workout exercise swap**: replace an exercise in the active session (machine taken, equipment unavailable) while keeping the slot — choose "this session only" or "save the swap to the routine."
- **Add an exercise mid-workout** that wasn't in the routine. On finishing, choose to **update this session only** or **save it to the routine** permanently.
- Built-in **rest timer**: auto-starts after a completed set (or superset round) and can be started/stopped manually.
  - **Category-based defaults**: longer for **compound** lifts, shorter for **isolation** (per-exercise override). (Tuned in build, e.g. ~2–3 min compound, ~60–90 s isolation.)
  - **Alert = simple vibration only** (no sound), firing even when the phone is locked or the app is backgrounded, via a local notification.
  - **Rest screen shows what's next** — the upcoming exercise/set and its last-time numbers — so the user is ready to go.
- **Workout duration** auto-tracked (start → finish), with pause support.
- Save partial workouts and resume later.
- **Edit after finishing**: fully edit a completed workout at any time; stats recompute (see §7).

### 3.3 History & Personal Records (PRs)
- Chronological **workout history** with per-session summary (volume, duration, PRs hit).
- **PR types are deliberately limited to keep them rare and exciting**: **heaviest weight** and **best estimated 1RM** per exercise (plus **longest duration** for time-based and **longest distance** for cardio). Low-signal variations (e.g., "most reps at an arbitrary light weight") do **not** trigger celebrations.
- **PR celebrations appear on the post-workout summary**, not live mid-set — keeping the in-gym flow distraction-free and saving the reward for a satisfying recap.
- Per-exercise detail view: all historical sets + a progression chart.
- **Manually add a past (backdated) workout** that was forgotten.
- **Delete a workout**; stats recalculate (badges excepted — see §7).
- **Estimated 1RM** via the **Epley formula**: `1RM = weight × (1 + reps / 30)`. Epley is the most widely used estimator, accurate within ~2–4% for trained lifters in the 1–10 rep range; accuracy degrades above ~10–12 reps, so estimates from very high-rep sets are flagged low-confidence and de-emphasized in charts.

### 3.4 Progress Tracking & Dashboards
- **Home dashboard** widgets: current weekly streak, weekly volume, recent PRs, today's routine.
- **Charts**: volume over time, estimated 1RM progression per lift, workout-frequency heatmap (contribution-calendar style).
  - **Per-lift progression defaults to estimated 1RM** (toggle to top-set weight or total volume).
  - **Per-muscle-group strength number**: each broad muscle group shows one headline figure — the **best estimated 1RM among that muscle's primary lifts** (the single strongest representative lift, not a sum), tracked as a **trend**. Using the best lift means a missing exercise never tanks the number and adding one never causes a phantom jump — it rises only when the user actually lifts heavier. To stay motivating rather than haunting, the number reflects **current capability (best within a recent rolling window, e.g. last 8 weeks)**, not an all-time best the user may no longer be able to hit. Mirrors how established trackers (e.g., Fitbod) derive per-muscle strength from estimated 1RM.
- **Muscle-group breakdown**: training-volume distribution across groups, highlighting under-/over-trained areas (radar / donut). Uses the fractional method (§3.7).
- **Consistency trends**: routines completed per week/month.
- Time-range filters: **daily, weekly, monthly, yearly**.

### 3.5 Streaks (Consistency Engine)
A **consecutive streak creates the loss-aversion pull** that drives return, but must be **forgiving of rest and real life**, or it backfires (anxiety, avoidance, churn).

- **Hero metric = Weekly Streak**: consecutive weeks meeting a personal **weekly target** (default 3 workouts/week, adjustable). Weekly — not daily — because rest is part of healthy training and a daily streak would punish it.
- **Week boundary = Monday–Sunday**, using **device-local time at the moment of logging**.
- **Changing the weekly target preserves the current streak** — the app never punishes raised ambition.
- **Streak Freeze (accumulating, capped)**: users **earn a freeze every N completed workouts**, bankable to a cap. A missed week auto-consumes a freeze instead of resetting — preventing the demotivating all-or-nothing collapse.
- **Planned deload / rest week**: users can **deliberately mark a week as a planned rest/deload**, which protects the streak intentionally (smart training shouldn't break a streak).
- **Lifetime total** ("147 workouts completed") is tracked as a milestone stat, separate from the streak.

**Completion threshold:** a session counts as a "completed routine" when **at least 30% of the routine's planned exercises** have ≥1 logged set (e.g., ≥3 of 10). Ad-hoc workouts count with ≥1 logged exercise. Prevents accidental/empty sessions from inflating or breaking streaks.

### 3.6 Notifications & Reminders
- **Learned, not fixed**: the app observes when the user typically trains and schedules a gentle reminder around that window.
- **Full user control**: notifications can be turned off entirely in-app.
- **No streak-at-risk nagging** in v1 (deliberately omitted to avoid pressure/annoyance).

### 3.7 Gamification & Badges
The app's primary retention hook — intentionally rich, combining **streaks (engagement)** with **milestones (long-term retention)**.

**Design principle — Process Over Outcome.** The reward system weights **controllable process metrics (consistency, volume, frequency, showing up)** at least as heavily as **outcome metrics (PRs, strength gains)**. Rationale (elite-athlete motivation research): outcome rewards fire constantly for beginners but **stall for advanced lifters**, exactly when they most need encouragement — whereas process metrics are always within the user's control. So **every user, at every level, always has an open and achievable reward path**: beginners get frequent PR dopamine; advanced lifters get continuous recognition for disciplined work. Rewards stay tied to real training benefit (not vanity points), supporting intrinsic motivation (autonomy, mastery, purpose).

- **Badge categories**:
  - *Milestone* — total workouts (1, 10, 25, 50, 100, 250, 500…), total volume lifted (10k, 100k, 1M kg…).
  - *Strength* — plate-milestone lifts (60 / 100 / 140 kg…), new estimated-1RM PRs.
  - *Consistency* — weekly target hit, N-week streaks, comeback after a break.
  - *Exploration* — distinct exercises tried, all muscle groups trained in one week ("Full Coverage").
  - *Volume/effort* — single-session volume records, longest workout, most sets in a day.
- **Milestones** with progress indicators ("3 more workouts to your 50-workout badge").
- Celebratory animations on PRs and badge unlocks; shareable badge cards.

### 3.8 Muscle-Group Insights
- Insights are **muscle-group-focused**: surface imbalances and coverage gaps.
- **Volume attribution (fractional method)** — backed by hypertrophy research: a set credits its **primary muscle group at 1.0×** and **each secondary muscle group at 0.5×** (e.g., a bench press set = 1.0 chest, 0.5 triceps, 0.5 front delts). All balance charts and insights use this weighting.
- **Neglected-muscle alert** fires when a muscle group hasn't been trained in **7 days** (configurable later).
- Examples: "You haven't trained legs in 7 days," "Back volume is 3× shoulders this month," "Chest trained 4× this week — consider balancing with back," "All major muscle groups covered this week 🎉".
- **Monthly Wrapped**: a once-a-month recap (à la Spotify Wrapped) — workouts, total volume, PRs, muscle-group balance, streak status, badges earned. A high-impact, shareable retention beat (monthly cadence keeps it special and avoids fatigue). For low-activity months, framed via Process-Over-Outcome so it encourages rather than shames.
- Suggested next-session focus based on least-recently / least-trained muscle groups.

---

## 4. Information Architecture / Navigation

Bottom tab navigation (5 tabs):

1. **Home** — dashboard, weekly streak, today's routine, quick-start, muscle insights.
2. **Workout** — start workout, manage routines & weekly schedule, exercise library, custom exercises.
3. **History** — past sessions, calendar/heatmap, repeat-last-workout.
4. **Progress** — charts, PRs, muscle-group analytics.
5. **Profile** — badges gallery, settings, backup/export, account.

Key flows:
- *Start a workout*: Home → "Start" → today's routine, another routine, repeat-last, or empty → log → finish → summary (PRs revealed here).
- *Build the week*: Workout → Weekly Schedule → assign Routine A/B/C or rest to each day.
- *Create a superset*: routine editor or mid-workout → select 2+ exercises → "Group as superset."
- *Swap an exercise*: in-session → exercise menu → "Swap" → this session only / save to routine.
- *Create custom exercise*: Exercise Library → "+ New" → name + muscle groups + equipment + tracking type.
- *Export / restore*: Profile → Backup → export file or restore from backup.

---

## 5. Onboarding (First-Run Experience)

The first 3–7 days decide retention (most apps lose the majority of users in the first three days). The flow is **minimal-friction but guarantees a "first win"** — the strongest driver of fitness-app stickiness — rather than dropping users into a cold, empty app or forcing a long quiz.

1. **Name entry** — one field, no personal data (matches name-only auth).
2. **One question — "How many days a week do you want to train?"** — sets the weekly streak target.
3. **Guided first routine (Routine A)** — pick a few exercises; an optional one-tap starter pre-fills a basic routine so the screen is never blank.
4. **Land on Home with "Start Workout" prominent** — the shortest path to the first logged session (the activation moment).
5. **First-Win badge** unlocks on completing that first workout, immediately closing the motivation loop.

Activation metric: **% of new users who complete their first logged workout within 7 days.**

---

## 6. Data Model

Core entities (relational; adaptable to NoSQL):

### User
- `id`, `name`, `weeklyTargetWorkouts` (default 3), `bodyweightKg (optional, single number for volume math only)`, `createdAt`
- *No personal information collected* beyond a display name. No email/password. Units are **kg-only by design** (no lb support, even later — keeps data model and UI simple). **One user per device** (no multi-profile). The optional bodyweight is a single figure used only to compute bodyweight-exercise volume; it is not a measurements/tracking feature.

### Exercise (library + custom)
- `id`, `name`, `primaryMuscleGroup`, `secondaryMuscleGroups[]`, `equipment`, `category (compound/isolation)`, `trackingType (weight_reps | bodyweight | time | distance)`, `bodyweightCoefficient (for bodyweight movements; e.g. pull-up 1.0, push-up ~0.65, dip ~0.95)`, `instructions`, `isCustom`, `ownerId (if custom)`
- **Custom exercises**: user-created; **must specify a primary muscle group** (secondary optional) so analytics stay accurate. Tags are editable later (recalculates).
- **Cardio/distance** exercises support distance + incline inputs.

### Routine (a training-day template)
- `id`, `userId`, `name` (e.g., "Routine A"), `targetMuscleGroups[]`, `createdAt`
- **RoutineExercise** (join): `routineId`, `exerciseId`, `order`, `targetSets`, `targetRepRange`, `targetWeight`, `targetDistance (nullable)`, `targetIncline (nullable)`, `supersetGroup (nullable; shared id groups a superset)`, `restSec`

### WeeklySchedule (the user's single active weekly plan)
- `id`, `userId` (unique — exactly one active schedule per user)
- **ScheduleDay** (join): `scheduleId`, `dayOfWeek (MON–SUN)`, `routineId (nullable = rest day)`
- **DeloadWeek**: `userId`, `weekStart` — marks a week as planned rest (protects streak).

### Workout (session — an immutable historical record)
- `id`, `userId`, `routineId (nullable — ad-hoc allowed)`, `startedAt`, `endedAt`, `durationSec`, `notes`, `totalVolume`, `isEdited`, `countsTowardStreak (derived)`

### WorkoutExercise
- `id`, `workoutId`, `exerciseId`, `order`, `notes`, `supersetGroup (nullable)`, `addedMidWorkout (bool)`, `swappedFromExerciseId (nullable)`

### SetEntry
- `id`, `workoutExerciseId`, `setNumber`, `weight (nullable)`, `addedWeight (nullable; weighted bodyweight)`, `isAssisted (bool)`, `reps (nullable)`, `durationSec (nullable)`, `distance (nullable)`, `incline (nullable)`, `setType (normal | warmup | drop | failure)`, `isCompleted`, `restSec`

### PersonalRecord
- `id`, `userId`, `exerciseId`, `recordType (max_weight | est_1rm | max_duration | max_distance)`, `value`, `achievedAt`, `workoutId`

### Achievement / Badge
- `id`, `userId`, `badgeKey`, `category (milestone | strength | consistency | exploration | volume)`, `unlockedAt`, `progress`

### StreakState
- `userId`, `totalCompletedWorkouts`, `currentWeeklyStreak`, `longestWeeklyStreak`, `freezesAvailable`, `freezesEarnedCounter`, `lastWeekMetTarget`, `lastWorkoutAt`

### MuscleVolume (derived / cached for analytics)
- `userId`, `muscleGroup`, `periodStart`, `fractionalSets`, `totalVolume`
- Computed with the 1.0× primary / 0.5× secondary fractional rule; bodyweight volume uses `bodyweightCoefficient × bodyweightKg + addedWeight`.

> Deferred entities (future phases): Goal, BodyMetric (measurements), cloud Account.

---

## 7. Data Integrity & Edge-Case Rules

These keep logged history trustworthy over months and years — the most important property of a tracking app. Decided up front because retrofitting corrupts existing data.

- **Templates are mutable, logs are immutable.** A **Routine** is a template, editable freely. A **Workout** is a frozen snapshot — editing a routine never retroactively changes past workouts. Past sessions always reflect what actually happened.
- **Badges are permanent once earned.** Editing, backdating, or deleting a workout recalculates streaks, PRs, milestones, and muscle volume — but **already-unlocked badges are never revoked** (removing an achievement is demoralizing and a churn trigger).
- **Custom exercises: trust-but-correct.** Users tag their own exercises (primary group required); v1 trusts these (constraints add friction for a rare problem), but tags are **editable later** with **recalculation**, making mis-tags fixable rather than permanent.
- **Soft-delete for exercises with history.** Deleting a custom exercise (or hiding a built-in one) that appears in past workouts is a **soft-delete**: removed from library/pickers but **retained in history and all stats**. Logged data is never silently destroyed.
- **Streak day boundary = device-local time at the moment of logging.** A late-night or cross-time-zone session counts toward whatever Mon–Sun week it is in local time — no surprising reclassification.
- **Recalculation is deterministic.** Streaks, PRs, milestones, and fractional muscle volume are always derivable from the raw workout log, so any edit/delete/backdate triggers a clean recompute from source data (badges excepted, per above).

---

## 8. Exercise Library & Muscle Taxonomy

### 8.1 Starter Library
- Ship with **~200 exercises** covering all muscle groups, weighted toward the most commonly programmed movements.
- **Sourced from open exercise datasets** rather than hand-built: e.g. the open-source **exercemus/wger** data, which already provides primary/secondary muscle mappings, equipment, and categories in structured JSON.
- **Bundled in-app (offline), not fetched at runtime** — a curated ~200-exercise subset ships inside the app so the library and logging work with no network and no startup dependency. Updates ship with app releases.
- **Licensing**: the cleanest free source (wger) is **CC-BY-SA 3.0** — requires **attribution** and is **share-alike** (a modified/redistributed exercise dataset inherits the license). Action items: include an in-app attribution credit; keep the *exercise dataset* licensed separately from the proprietary app code. Visual media (GIFs/images) have murkier licensing and are **deferred** — v1 ships text + muscle diagrams, not per-exercise video.
- Each library exercise is pre-tagged with primary/secondary muscle groups, equipment, category, tracking type, and (where relevant) a bodyweight coefficient.
- Users extend the library with **custom exercises** (muscle-group tagging required).

### 8.2 Muscle Taxonomy (two-level)
A **two-level hierarchy**: coarse main groups for high-level dashboards and badges, fine sub-groups for detailed insights and accurate fractional volume.

- **Chest** → Upper, Mid, Lower
- **Back** → Lats, Traps, Rhomboids/Mid-Back, Lower Back
- **Shoulders** → Front Delts, Side Delts, Rear Delts
- **Arms** → Biceps, Triceps, Forearms
- **Legs** → Quads, Hamstrings, Glutes, Calves, Adductors
- **Core** → Abs, Obliques

Dashboards default to the **coarse** view; the muscle-analytics screen drills into **sub-groups**. Fractional volume is computed at the sub-group level and rolled up.

---

## 9. Technical Architecture

### 9.1 Frontend (Mobile)
- **Framework**: React Native (Expo) or Flutter — single codebase for iOS & Android.
- **State management**: Redux Toolkit / Zustand (RN) or Riverpod (Flutter).
- **Charts**: Victory Native / react-native-svg-charts, or fl_chart (Flutter).
- **Local-first store**: SQLite (WatermelonDB / Drift) — the primary store, since the app is single-device.
- **Navigation**: React Navigation (bottom tabs + stacks).

### 9.2 Backend / Storage
- v1 is **device-local**; no backend required for core functionality.
- **Auth**: **name-only lightweight sign-in** — a display name creates/accesses a local account; no email, password, or personal data. A device-bound identifier backs the account. **One profile per device.**
- **Backup strategy** (no cloud in v1, so data safety is local):
  - **Automatic on-device backup every two weeks** — the app silently writes a restore point on a bi-weekly cadence, protecting users who never manually export.
  - **Manual export** anytime (JSON for full restore; CSV for portable history).
  - **Import/restore** from an automatic backup or a manual export on a new install.
  - To reduce loss risk, the backup file is written to **user-visible storage / share-sheet** (so it can be sent to a cloud drive), not only app-private storage.
  - *Known limitation*: losing the device without having moved a backup off-device means history is unrecoverable — **cloud sync is the Phase-2 fix**. Bi-weekly local backup + export mitigate this for v1.

### 9.3 Insights Engine
- v1: rule-based, focused on **muscle-group balance and coverage** (neglected groups at 7 days, volume imbalance via fractional sets, weekly coverage), plus PR detection.
- Future: trend-based and ML recommendations (plateau detection, periodization).

---

## 10. UI/UX Design Principles

- **Speed first**: one tap to log a set (normal by default); large touch targets for sweaty-hand use.
- **Dark mode default**: gym-friendly, high contrast, low eye strain.
- **No anchoring on numbers**: show last-session reference, never pre-fill or cap, so users push themselves; the traffic-light cue rewards beating it.
- **Motivating but not punishing**: celebratory animations on PRs and badge unlocks, streak flames — paired with forgiving streak mechanics (earned freezes, deload weeks) so the app never shames a missed week.
- **Glanceable dashboards**: most important number front and center; drill down for detail.
- **Consistent design system**: defined typography scale, spacing tokens, accent color for actions, semantic colors per muscle group (reused across charts and badges).
- **Accessibility**: WCAG AA contrast, scalable text, screen-reader labels, haptic feedback on set completion.

### Empty States (Critical for First-Week Retention)
Each empty state is **motivating and action-oriented**, never a dead end:
- **Dashboard (no workouts)**: "Log your first workout to watch your progress grow" + prominent **Start Workout**.
- **Progress charts (no data)**: a ghosted preview chart — "Your strength curve appears here after your first few sessions."
- **PRs (none)**: "Every set you log is a chance at your first personal record."
- **Streak (zero)**: "Train {weeklyTarget}× this week to start your streak," with a weekly progress indicator.
- **History (empty)**: encourages starting today; shows the first-win badge as a near-term goal.
- **Badges (locked)**: show the **next attainable badge** with a progress bar, not a wall of greyed-out icons.

### Suggested Screens
1. Home dashboard (weekly streak, today's routine, muscle insights)
2. Weekly schedule editor (assign Routine A/B/C to days; mark deload week)
3. Routine list & routine editor (with superset grouping)
4. Active workout logger (normal-by-default sets, inline plates, traffic-light cue, swap & add mid-workout, superset auto-advance)
5. Rest timer overlay (shows what's next)
6. Exercise library, detail & custom-exercise creator
7. Workout history list + calendar heatmap + repeat-last-workout
8. Session summary (PRs revealed, "save to routine?" prompts)
9. Progress charts (per-lift e1RM default, volume, frequency)
10. Muscle-group analytics (radar/donut, coarse + sub-group, fractional volume)
11. Badges / achievements gallery
12. Monthly Wrapped recap
13. Profile, settings & backup/export

---

## 11. Roadmap (Phased)

### Phase 1 — MVP
Name-only sign-in; ~200-exercise library (open-data sourced, offline) + custom exercises; two-level muscle taxonomy; routine creation; weekly schedule with planned-deload weeks; live logging (weight×reps + bodyweight w/ assisted + time + distance/incline, set types normal-by-default, supersets, in-workout swap, mid-workout add, quick steps, inline plate calc); live traffic-light progress cue; rest timer (category defaults, vibration, shows next); edit/backdate/delete with recalculation; workout history + repeat-last-workout; PR detection (Epley e1RM, limited PR types) on summary; home dashboard; automatic bi-weekly local backup + manual export/restore; learned reminders (toggleable).

### Phase 2 — Analytics & Gamification
Charts (volume, e1RM, heatmap); muscle-group breakdown with fractional volume + sub-group drill-down; per-muscle current-capability strength number; weekly streaks + earned-freeze mechanic; rich badge system (Process-Over-Outcome weighting); Monthly Wrapped; milestones; **cloud sync (addresses v1 data-loss limitation)**.

### Phase 3 — Intelligence
Deeper muscle/trend insights; weekly recaps; smart next-session suggestions; yearly review; plateau detection.

### Phase 4 — Ecosystem (deferred features)
Goal-setting (weight loss, muscle gain, strength); body-measurement tracking; Apple Health / Google Fit integration; smartwatch/wearable support; per-exercise media/video; optional sharing & social.

---

## 12. Success Metrics
- **Activation**: % of new users who log their first workout within 7 days.
- **Retention**: D7 / D30 retention; weekly active loggers.
- **Engagement**: avg workouts logged per active user per week; weekly-streak-length and badge-unlock distributions.
- **Habit formation**: % of users reaching a 4-week streak (proxy for durable habit).

---

## 13. Open Questions (Build-Time Tuning)
All major product decisions are resolved. Remaining items are quantitative tuning, best finalized during build with real data:
- Exact **freeze economy** ("earn 1 per N workouts," and the cap).
- Precise **badge thresholds** and which lifts qualify for strength badges.
- The **rolling window** length for the per-muscle current-capability strength number (e.g., 6 vs. 8 weeks).
- Default **rest durations** per exercise category, and the default **bodyweight reference** when a user leaves bodyweight unset.
- Bodyweight **coefficients** per movement (seed from biomechanical references; refine over time).
- **Attribution placement** for CC-BY-SA exercise data (settings credits screen vs. per-exercise).
- Localization scope for launch (kg-only is fixed; language support TBD).
