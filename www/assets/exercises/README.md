# Exercise demo clips

Looping demo clips shown in each exercise's detail card (Library → tap an exercise).
Built from **[free-exercise-db](https://github.com/yuhonas/free-exercise-db)** (The Unlicense /
public domain) via `tools/build_exercise_media.py`, which bakes the dataset's two stills
(start → end position) into a small looping animated WebP per exercise.

## Adding / fixing a clip

- **Filename = the exercise `id`** (left column), e.g. `bench_press.webp`. Drop it here and
  it appears automatically — no code changes. Formats tried: `.webp` → `.gif` → `.png`.
- To regenerate from the dataset: `python3 tools/build_exercise_media.py` (add ids to
  `MANUAL_MATCH` to pin a better source, or `SKIP` to leave text-only). Review matches in
  `tools/exercise_media_matches.tsv`.
- Everything stays **on-device** — clips are bundled files, no network at runtime.

## Status — 177/200 have a clip · 23 need one

| Exercise | File | Clip |
|---|---|---|
| Bench Press | `bench_press.webp` | ✅ |
| Incline DB Press | `incline_db_press.webp` | ✅ |
| Cable Fly | `cable_fly.webp` | ✅ |
| Push-Up | `pushup.webp` | ✅ |
| Dips | `dips.webp` | ✅ |
| Pull-Up | `pullup.webp` | ✅ |
| Lat Pulldown | `lat_pulldown.webp` | ✅ |
| Barbell Row | `barbell_row.webp` | ✅ |
| Cable Row | `cable_row.webp` | ✅ |
| Deadlift | `deadlift.webp` | ✅ |
| Overhead Press | `ohp.webp` | ✅ |
| DB Lateral Raise | `db_lateral_raise.webp` | ✅ |
| Face Pull | `face_pull.webp` | ✅ |
| Arnold Press | `arnold_press.webp` | ✅ |
| Barbell Curl | `barbell_curl.webp` | ✅ |
| Tricep Pushdown | `tricep_pushdown.webp` | ✅ |
| Hammer Curl | `hammer_curl.webp` | ✅ |
| Skull Crusher | `skull_crusher.webp` | ✅ |
| Barbell Squat | `squat.webp` | ✅ |
| Romanian Deadlift | `rdl.webp` | ✅ |
| Leg Press | `leg_press.webp` | ✅ |
| Leg Curl | `leg_curl.webp` | ✅ |
| Calf Raise | `calf_raise.webp` | ✅ |
| Bulgarian Split Squat | `bulgarian_split_squat.webp` | ✅ |
| Plank | `plank.webp` | ✅ |
| Crunches | `crunches.webp` | ✅ |
| Russian Twist | `russian_twist.webp` | ✅ |
| Incline Barbell Press | `incline_barbell_press.webp` | ✅ |
| Decline Barbell Press | `decline_barbell_press.webp` | ✅ |
| Flat DB Press | `flat_db_press.webp` | ✅ |
| Decline DB Press | `decline_db_press.webp` | ✅ |
| Machine Chest Press | `machine_chest_press.webp` | ✅ |
| Smith Machine Bench Press | `smith_bench_press.webp` | ✅ |
| Pec Deck | `pec_deck.webp` | — needs clip |
| Machine Fly | `machine_fly.webp` | — needs clip |
| Incline Cable Fly | `incline_cable_fly.webp` | ✅ |
| Low Cable Fly | `low_cable_fly.webp` | ✅ |
| High Cable Fly | `high_cable_fly.webp` | — needs clip |
| Dumbbell Fly | `db_fly.webp` | ✅ |
| Incline DB Fly | `incline_db_fly.webp` | ✅ |
| Cable Crossover | `cable_crossover.webp` | ✅ |
| Svend Press | `svend_press.webp` | ✅ |
| Floor Press | `floor_press.webp` | ✅ |
| DB Floor Press | `db_floor_press.webp` | ✅ |
| Wide Push-Up | `wide_pushup.webp` | ✅ |
| Incline Push-Up | `incline_pushup.webp` | ✅ |
| Decline Push-Up | `decline_pushup.webp` | ✅ |
| Diamond Push-Up | `diamond_pushup.webp` | ✅ |
| Archer Push-Up | `archer_pushup.webp` | ✅ |
| Around The World | `around_the_world.webp` | ✅ |
| Guillotine Press | `guillotine_press.webp` | ✅ |
| Chin-Up | `chinup.webp` | ✅ |
| Wide-Grip Pull-Up | `wide_pullup.webp` | ✅ |
| Neutral-Grip Pull-Up | `neutral_pullup.webp` | ✅ |
| Assisted Pull-Up | `assisted_pullup.webp` | ✅ |
| T-Bar Row | `t_bar_row.webp` | ✅ |
| Pendlay Row | `pendlay_row.webp` | ✅ |
| One-Arm DB Row | `db_row.webp` | ✅ |
| Chest-Supported Row | `chest_supported_row.webp` | — needs clip |
| Machine Row | `machine_row.webp` | ✅ |
| Inverted Row | `inverted_row.webp` | ✅ |
| Straight-Arm Pulldown | `straight_arm_pulldown.webp` | ✅ |
| Close-Grip Pulldown | `close_grip_pulldown.webp` | ✅ |
| Wide-Grip Pulldown | `wide_grip_pulldown.webp` | ✅ |
| Single-Arm Lat Pulldown | `single_arm_pulldown.webp` | ✅ |
| Seated Cable Row | `seated_cable_row.webp` | ✅ |
| Meadows Row | `meadows_row.webp` | ✅ |
| Rack Pull | `rack_pull.webp` | ✅ |
| Snatch-Grip Deadlift | `snatch_grip_deadlift.webp` | ✅ |
| Sumo Deadlift | `sumo_deadlift.webp` | ✅ |
| Trap Bar Deadlift | `trap_bar_deadlift.webp` | ✅ |
| Good Morning | `good_morning.webp` | ✅ |
| Back Extension | `hyperextension.webp` | ✅ |
| Barbell Shrug | `shrug_barbell.webp` | ✅ |
| Dumbbell Shrug | `shrug_dumbbell.webp` | ✅ |
| Cable Shrug | `cable_shrug.webp` | ✅ |
| Dumbbell Pullover | `pullover_db.webp` | ✅ |
| Cable Pullover | `pullover_cable.webp` | — needs clip |
| Renegade Row | `renegade_row.webp` | ✅ |
| Seal Row | `seal_row.webp` | ✅ |
| Gorilla Row | `gorilla_row.webp` | ✅ |
| Band Pull-Apart | `band_pull_apart.webp` | ✅ |
| Deficit Deadlift | `deficit_deadlift.webp` | ✅ |
| Seated DB Press | `seated_db_press.webp` | ✅ |
| Standing DB Press | `db_shoulder_press.webp` | ✅ |
| Machine Shoulder Press | `machine_shoulder_press.webp` | ✅ |
| Smith Machine Press | `smith_shoulder_press.webp` | ✅ |
| Push Press | `push_press.webp` | ✅ |
| Cable Lateral Raise | `cable_lateral_raise.webp` | ✅ |
| Machine Lateral Raise | `machine_lateral_raise.webp` | ✅ |
| Leaning Lateral Raise | `leaning_lateral_raise.webp` | ✅ |
| DB Front Raise | `front_raise_db.webp` | ✅ |
| Plate Front Raise | `front_raise_plate.webp` | ✅ |
| Cable Front Raise | `front_raise_cable.webp` | ✅ |
| Rear Delt Fly | `rear_delt_fly.webp` | ✅ |
| Reverse Pec Deck | `reverse_pec_deck.webp` | — needs clip |
| Cable Rear Delt Fly | `cable_rear_delt_fly.webp` | ✅ |
| Bent-Over Lateral Raise | `bent_over_lateral_raise.webp` | ✅ |
| Barbell Upright Row | `upright_row_barbell.webp` | ✅ |
| Cable Upright Row | `upright_row_cable.webp` | ✅ |
| DB Upright Row | `upright_row_db.webp` | ✅ |
| Landmine Press | `landmine_press.webp` | ✅ |
| Behind-the-Neck Press | `behind_neck_press.webp` | ✅ |
| Viking Press | `viking_press.webp` | ✅ |
| Lu Raise | `lu_raise.webp` | ✅ |
| Cable Y-Raise | `cable_y_raise.webp` | ✅ |
| W-Raise | `w_raise.webp` | ✅ |
| Scarecrow | `scarecrow.webp` | — needs clip |
| Dumbbell Curl | `db_curl.webp` | ✅ |
| Incline DB Curl | `incline_db_curl.webp` | ✅ |
| Preacher Curl | `preacher_curl.webp` | ✅ |
| EZ-Bar Curl | `ez_bar_curl.webp` | ✅ |
| Cable Curl | `cable_curl.webp` | ✅ |
| Concentration Curl | `concentration_curl.webp` | ✅ |
| Spider Curl | `spider_curl.webp` | ✅ |
| Drag Curl | `drag_curl.webp` | ✅ |
| Zottman Curl | `zottman_curl.webp` | ✅ |
| Reverse Curl | `reverse_curl.webp` | ✅ |
| Machine Curl | `machine_curl.webp` | ✅ |
| Cable Hammer Curl | `cable_hammer_curl.webp` | ✅ |
| Rope Hammer Curl | `rope_hammer_curl.webp` | ✅ |
| Close-Grip Bench Press | `close_grip_bench.webp` | ✅ |
| Overhead Tricep Extension | `overhead_tricep_extension.webp` | ✅ |
| DB Overhead Extension | `db_overhead_extension.webp` | ✅ |
| Rope Pushdown | `rope_pushdown.webp` | ✅ |
| Single-Arm Pushdown | `single_arm_pushdown.webp` | — needs clip |
| Tricep Kickback | `tricep_kickback.webp` | ✅ |
| Bench Dip | `bench_dip.webp` | ✅ |
| JM Press | `jm_press.webp` | ✅ |
| Cable Overhead Extension | `cable_overhead_extension.webp` | ✅ |
| Machine Tricep Dip | `tricep_dip_machine.webp` | ✅ |
| Wrist Curl | `wrist_curl.webp` | ✅ |
| Reverse Wrist Curl | `reverse_wrist_curl.webp` | ✅ |
| Plate Pinch | `plate_pinch.webp` | ✅ |
| Reverse EZ-Bar Curl | `reverse_ez_curl.webp` | ✅ |
| Front Squat | `front_squat.webp` | ✅ |
| Hack Squat | `hack_squat.webp` | ✅ |
| Goblet Squat | `goblet_squat.webp` | ✅ |
| Smith Machine Squat | `smith_squat.webp` | ✅ |
| Box Squat | `box_squat.webp` | ✅ |
| Pause Squat | `pause_squat.webp` | ✅ |
| Pistol Squat | `pistol_squat.webp` | ✅ |
| Zercher Squat | `zercher_squat.webp` | ✅ |
| Lunge | `lunge.webp` | ✅ |
| Walking Lunge | `walking_lunge.webp` | ✅ |
| Reverse Lunge | `reverse_lunge.webp` | ✅ |
| Lateral Lunge | `lateral_lunge.webp` | ✅ |
| Step-Up | `step_up.webp` | ✅ |
| Leg Extension | `leg_extension.webp` | ✅ |
| Seated Leg Curl | `seated_leg_curl.webp` | ✅ |
| Lying Leg Curl | `lying_leg_curl.webp` | ✅ |
| Nordic Curl | `nordic_curl.webp` | — needs clip |
| Glute-Ham Raise | `glute_ham_raise.webp` | ✅ |
| Hip Thrust | `hip_thrust.webp` | ✅ |
| Glute Bridge | `glute_bridge.webp` | ✅ |
| Cable Glute Kickback | `cable_kickback.webp` | ✅ |
| Hip Abduction | `hip_abduction.webp` | — needs clip |
| Hip Adduction | `hip_adduction.webp` | ✅ |
| Seated Calf Raise | `seated_calf_raise.webp` | ✅ |
| Standing Calf Raise | `standing_calf_raise.webp` | ✅ |
| Leg Press Calf Raise | `leg_press_calf_raise.webp` | ✅ |
| Donkey Calf Raise | `donkey_calf_raise.webp` | ✅ |
| Sissy Squat | `sissy_squat.webp` | ✅ |
| Belt Squat | `belt_squat.webp` | ✅ |
| Sumo Squat | `sumo_squat.webp` | ✅ |
| Curtsy Lunge | `curtsy_lunge.webp` | ✅ |
| Single-Leg Press | `single_leg_press.webp` | ✅ |
| Kettlebell Swing | `kettlebell_swing.webp` | — needs clip |
| Hanging Leg Raise | `hanging_leg_raise.webp` | ✅ |
| Hanging Knee Raise | `hanging_knee_raise.webp` | ✅ |
| Cable Crunch | `cable_crunch.webp` | ✅ |
| Decline Sit-Up | `decline_situp.webp` | ✅ |
| Sit-Up | `situp.webp` | ✅ |
| Ab Wheel Rollout | `ab_wheel.webp` | ✅ |
| Mountain Climber | `mountain_climber.webp` | — needs clip |
| Bicycle Crunch | `bicycle_crunch.webp` | ✅ |
| Side Plank | `side_plank.webp` | ✅ |
| Lying Leg Raise | `leg_raise.webp` | ✅ |
| Flutter Kicks | `flutter_kicks.webp` | ✅ |
| V-Up | `v_up.webp` | ✅ |
| Toe Touch | `toe_touch.webp` | ✅ |
| Dead Bug | `dead_bug.webp` | ✅ |
| Hollow Hold | `hollow_hold.webp` | — needs clip |
| Dragon Flag | `dragon_flag.webp` | — needs clip |
| Woodchopper | `woodchopper.webp` | — needs clip |
| Pallof Press | `pallof_press.webp` | ✅ |
| Cable Woodchop | `cable_woodchop.webp` | — needs clip |
| DB Side Bend | `side_bend.webp` | ✅ |
| L-Sit | `l_sit.webp` | — needs clip |
| Reverse Crunch | `reverse_crunch.webp` | ✅ |
| Oblique Crunch | `oblique_crunch.webp` | ✅ |
| Plank Shoulder Tap | `plank_shoulder_tap.webp` | ✅ |
| Treadmill Run | `treadmill_run.webp` | ✅ |
| Stationary Bike | `stationary_bike.webp` | — needs clip |
| Rowing Machine | `rowing_machine.webp` | — needs clip |
| Elliptical | `elliptical.webp` | ✅ |
| Stair Climber | `stair_climber.webp` | — needs clip |
| Jump Rope | `jump_rope.webp` | — needs clip |
| Burpee | `burpee.webp` | — needs clip |
| Battle Ropes | `battle_ropes.webp` | — needs clip |
