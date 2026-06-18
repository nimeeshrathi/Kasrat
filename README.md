# Kasrat

A mobile-first gym workout tracker — log lifts in real time, build reusable routines, and watch your progress through streaks, personal records, and muscle-balance insights. Inspired by apps like Hevy, with forgiving consistency mechanics that reward showing up rather than punishing rest.

Kasrat is a [Capacitor](https://capacitorjs.com/) app: a self-contained web front-end (vanilla HTML/CSS/JS, no build step) packaged for Android. All data lives on-device in `localStorage` — no account, no server, no network dependency.

## Features

- **201-exercise library** — covering chest, back, shoulders, arms, legs, and core, each tagged with muscle groups, equipment, category (compound/isolation), tracking type, and bodyweight coefficients. Add your own custom exercises too.
- **Routines with sections** — organise each routine into collapsible **Warm Up / Mobility / Primary / Secondary / Static Stretch** sections. Routines are reusable templates you can start any time — no day-based restrictions.
- **Fast live logging** — weight × reps per set with the previous session's numbers shown as reference, quick-step weight buttons (+1.25 / +2.5 / +5 kg), an inline plate calculator, and a traffic-light cue (green = beating last time, yellow = matching, red = below).
- **Inline set types** — tap **W / N / D / F** (warm-up / normal / drop / failure) directly on the active set; normal by default, no menu.
- **Rest timer** — auto-starts after a logged set with category-based defaults, and vibrates when done.
- **History & PRs** — chronological session history with a contribution heatmap; personal records for heaviest weight and best estimated 1RM (Epley formula), revealed on the post-workout summary.
- **Progress & muscle balance** — estimated-1RM progression per lift and a fractional-volume breakdown across muscle groups (1.0× primary, 0.5× secondary) to surface neglected areas.
- **Weekly streaks & badges** — a forgiving weekly-target streak (1–7 workouts/week, your choice) plus milestone and consistency badges.
- **Backup** — export all your data to a JSON file from the Profile tab.

## Tech

- **Framework:** Capacitor 8 (`@capacitor/core`, `@capacitor/cli`, `@capacitor/android`)
- **Front-end:** plain HTML/CSS/JavaScript — no framework, no bundler
- **Storage:** browser `localStorage` (keys prefixed `kasrat_`)
- **App ID:** `com.kasrat.app` · **Web dir:** `www/`

## Project structure

```
.
├── capacitor.config.json   # Capacitor config (appId, appName, webDir)
├── package.json
├── design.md               # Full product/design document
├── kasrat-ui-mockup.html   # Static UI reference mockup
└── www/                    # The app (Capacitor web root)
    ├── index.html          # Screen shells, SVG icon sprite, tab bar
    ├── css/styles.css      # Design system + per-screen theming
    └── js/
        ├── storage.js      # Data layer: exercises, routines, workouts, PRs, streaks, badges
        └── app.js          # UI rendering, navigation, and workout-logging logic
```

## Getting started

### Prerequisites
- [Node.js](https://nodejs.org/) (for Capacitor tooling)
- For Android builds: Android Studio + JDK

### Install
```bash
npm install
```

### Run in a browser
The front-end is fully static, so you can preview it without Capacitor by serving the `www/` directory:
```bash
cd www
python3 -m http.server 8000
# then open http://localhost:8000
```
> Tip: use a narrow (phone-width) viewport — the layout is capped at 430px.

### Build & run on Android
```bash
npx cap add android      # first time only
npx cap sync             # copy www/ into the native project
npx cap open android     # open in Android Studio to run/build
```
Because the front-end has no build step, after editing files in `www/` just run `npx cap sync` (or `npx cap copy`) to push the changes into the native shell.

## Data & privacy

Kasrat collects no personal information beyond a display name and keeps everything on the device. Units are kilograms only. To move your data to another device, use **Profile → Export data** and restore from the JSON backup.

See [`design.md`](./design.md) for the full product vision, data model, and roadmap.
