# Kasrat

**A fast, private, offline workout tracker for Android.** Log every set, build and schedule routines, and watch your strength and BMI trend over time — no account, no cloud, no ads. Your training lives on your phone.

### 📲 Get it

- **[Download the APK](https://github.com/nimeeshrathi/Kasrat/releases/latest/download/Kasrat.apk)** (Android 7.0+)
- **[Visit the site](https://nimeeshrathi.github.io/Kasrat/)** for an overview and install steps

Open the downloaded file on your phone, allow installing from unknown sources if prompted, and tap Install.

---

## What it does

- **Log workouts fast** — track weight × reps, bodyweight, time, and distance. Each set shows your previous session's numbers for reference, with a traffic-light cue (green = beating last time, amber = matching, red = below). Quick-step weight buttons (+1.25 / +2.5 / +5 kg) build on the weight you already lifted, plus an inline plate calculator.

- **Routines & schedule** — build reusable routines organised into sections (Warm Up / Primary / Secondary / Stretch) and pin them to weekdays. Start a planned session in one tap from the home screen.

- **Rest timer that buzzes** — auto-starts after a logged set with sensible defaults, and vibrates *and* notifies you when it's time for the next set — even with the phone locked.

- **Strength progress** — estimated-1RM trend lines per exercise, automatic personal records (heaviest weight and best est. 1RM), and a fractional muscle-balance breakdown that surfaces neglected areas.

- **BMI tracking** — add your height and weight and plot your BMI over time against the healthy range, updated whenever you log a new weight.

- **Streaks & badges** — a forgiving weekly-target streak (you pick 1–7 workouts/week) plus milestone and consistency badges to keep momentum.

- **History** — a chronological session log with a contribution heatmap.

- **Share routines** — export all your data to a file, and import a friend's routines — merged in safely without touching your own.

- **Private & offline** — no login, no servers, no tracking. Everything is stored on your device, and you own a one-tap backup file (Profile → Export data). Units are kilograms.

---

## Privacy

Kasrat collects no personal information beyond a display name and optional height/weight, and never connects to a server. To move your data to another device, use **Profile → Export data** and import the JSON backup on the new device.

It's a self-contained app built with [Capacitor](https://capacitorjs.com/) — all data lives on-device. The full product and design notes are in [`design.md`](./design.md).
