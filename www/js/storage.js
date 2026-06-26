const Storage = (() => {
  const P = 'kasrat_';

  function get(key) {
    try { const v = localStorage.getItem(P + key); return v ? JSON.parse(v) : null; }
    catch(e) { return null; }
  }
  function set(key, val) {
    try { localStorage.setItem(P + key, JSON.stringify(val)); return true; }
    catch(e) { return false; }
  }
  function remove(key) { localStorage.removeItem(P + key); }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function localDateStr(d) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  function getWeekKey(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const mon = new Date(d);
    mon.setDate(d.getDate() + diff);
    mon.setHours(0,0,0,0);
    return localDateStr(mon);
  }

  function getPrevWeekKey(wk) {
    const d = new Date(wk + 'T00:00:00');
    d.setDate(d.getDate() - 7);
    return localDateStr(d);
  }

  function getUser() { return get('user'); }
  function saveUser(user) {
    if (!user.id) user.id = uid();
    if (!user.createdAt) user.createdAt = new Date().toISOString();
    user.weeklyTargetWorkouts = user.weeklyTargetWorkouts || 3;
    set('user', user);
    return user;
  }

  function isOnboarded() { return !!get('onboarded'); }
  function setOnboarded() { set('onboarded', true); }

  // Body-weight history for the BMI trend. One entry per day (latest wins);
  // height lives on the user record since it rarely changes.
  function getWeightLog() { return get('weightLog') || []; }
  function logWeight(kg) {
    kg = Math.round(parseFloat(kg) * 10) / 10;
    if (!(kg > 0)) return getWeightLog();
    const log = getWeightLog();
    const today = new Date().toISOString().slice(0, 10);
    const entry = { t: new Date().toISOString(), kg };
    const idx = log.findIndex(e => (e.t || '').slice(0, 10) === today);
    if (idx >= 0) log[idx] = entry; else log.push(entry);
    log.sort((a, b) => (a.t || '').localeCompare(b.t || ''));
    set('weightLog', log);
    const user = getUser();
    if (user) { user.weightKg = kg; saveUser(user); }
    return log;
  }

  function getDefaultExercises() {
    return [
      { id: 'bench_press', name: 'Bench Press', primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['triceps', 'shoulders'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'incline_db_press', name: 'Incline DB Press', primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders'], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'cable_fly', name: 'Cable Fly', primaryMuscleGroup: 'chest', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'pushup', name: 'Push-Up', primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['triceps'], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', bodyweightCoefficient: 0.65, isCustom: false },
      { id: 'dips', name: 'Dips', primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['triceps'], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', bodyweightCoefficient: 0.95, isCustom: false },
      { id: 'pullup', name: 'Pull-Up', primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms'], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', bodyweightCoefficient: 1.0, isCustom: false },
      { id: 'lat_pulldown', name: 'Lat Pulldown', primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms'], equipment: 'Cable', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'barbell_row', name: 'Barbell Row', primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms', 'shoulders'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'cable_row', name: 'Cable Row', primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms'], equipment: 'Cable', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'deadlift', name: 'Deadlift', primaryMuscleGroup: 'back', secondaryMuscleGroups: ['legs', 'core'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'ohp', name: 'Overhead Press', primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'db_lateral_raise', name: 'DB Lateral Raise', primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'face_pull', name: 'Face Pull', primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'arnold_press', name: 'Arnold Press', primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'barbell_curl', name: 'Barbell Curl', primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Barbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'tricep_pushdown', name: 'Tricep Pushdown', primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'hammer_curl', name: 'Hammer Curl', primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'skull_crusher', name: 'Skull Crusher', primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Barbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'squat', name: 'Barbell Squat', primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['core'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'rdl', name: 'Romanian Deadlift', primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['back'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'leg_press', name: 'Leg Press', primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Machine', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'leg_curl', name: 'Leg Curl', primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Machine', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'calf_raise', name: 'Calf Raise', primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Machine', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'bulgarian_split_squat', name: 'Bulgarian Split Squat', primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'plank', name: 'Plank', primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'isolation', trackingType: 'time', isCustom: false },
      { id: 'crunches', name: 'Crunches', primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'isolation', trackingType: 'bodyweight', bodyweightCoefficient: 0.3, isCustom: false },
      { id: 'russian_twist', name: 'Russian Twist', primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'isolation', trackingType: 'weight_reps', isCustom: false },

      /* ── CHEST ── */
      { id: 'incline_barbell_press', name: 'Incline Barbell Press', primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders','arms'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'decline_barbell_press', name: 'Decline Barbell Press', primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['arms'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'flat_db_press', name: 'Flat DB Press', primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders','arms'], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'decline_db_press', name: 'Decline DB Press', primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['arms'], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'machine_chest_press', name: 'Machine Chest Press', primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['arms'], equipment: 'Machine', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'smith_bench_press', name: 'Smith Machine Bench Press', primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['arms'], equipment: 'Machine', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'pec_deck', name: 'Pec Deck', primaryMuscleGroup: 'chest', secondaryMuscleGroups: [], equipment: 'Machine', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'machine_fly', name: 'Machine Fly', primaryMuscleGroup: 'chest', secondaryMuscleGroups: [], equipment: 'Machine', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'incline_cable_fly', name: 'Incline Cable Fly', primaryMuscleGroup: 'chest', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'low_cable_fly', name: 'Low Cable Fly', primaryMuscleGroup: 'chest', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'high_cable_fly', name: 'High Cable Fly', primaryMuscleGroup: 'chest', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'db_fly', name: 'Dumbbell Fly', primaryMuscleGroup: 'chest', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'incline_db_fly', name: 'Incline DB Fly', primaryMuscleGroup: 'chest', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'cable_crossover', name: 'Cable Crossover', primaryMuscleGroup: 'chest', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'svend_press', name: 'Svend Press', primaryMuscleGroup: 'chest', secondaryMuscleGroups: [], equipment: 'Plate', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'floor_press', name: 'Floor Press', primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['arms'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'db_floor_press', name: 'DB Floor Press', primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['arms'], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'wide_pushup', name: 'Wide Push-Up', primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['arms'], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', bodyweightCoefficient: 0.64, isCustom: false },
      { id: 'incline_pushup', name: 'Incline Push-Up', primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['arms'], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', bodyweightCoefficient: 0.5, isCustom: false },
      { id: 'decline_pushup', name: 'Decline Push-Up', primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders','arms'], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', bodyweightCoefficient: 0.7, isCustom: false },
      { id: 'diamond_pushup', name: 'Diamond Push-Up', primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['arms'], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', bodyweightCoefficient: 0.65, isCustom: false },
      { id: 'archer_pushup', name: 'Archer Push-Up', primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['arms'], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', bodyweightCoefficient: 0.8, isCustom: false },
      { id: 'around_the_world', name: 'Around The World', primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders'], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'guillotine_press', name: 'Guillotine Press', primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },

      /* ── BACK ── */
      { id: 'chinup', name: 'Chin-Up', primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms'], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', bodyweightCoefficient: 1.0, isCustom: false },
      { id: 'wide_pullup', name: 'Wide-Grip Pull-Up', primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms'], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', bodyweightCoefficient: 1.0, isCustom: false },
      { id: 'neutral_pullup', name: 'Neutral-Grip Pull-Up', primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms'], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', bodyweightCoefficient: 1.0, isCustom: false },
      { id: 'assisted_pullup', name: 'Assisted Pull-Up', primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms'], equipment: 'Machine', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 't_bar_row', name: 'T-Bar Row', primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'pendlay_row', name: 'Pendlay Row', primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'db_row', name: 'One-Arm DB Row', primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms'], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'chest_supported_row', name: 'Chest-Supported Row', primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms'], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'machine_row', name: 'Machine Row', primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms'], equipment: 'Machine', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'inverted_row', name: 'Inverted Row', primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms'], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', bodyweightCoefficient: 0.5, isCustom: false },
      { id: 'straight_arm_pulldown', name: 'Straight-Arm Pulldown', primaryMuscleGroup: 'back', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'close_grip_pulldown', name: 'Close-Grip Pulldown', primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms'], equipment: 'Cable', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'wide_grip_pulldown', name: 'Wide-Grip Pulldown', primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms'], equipment: 'Cable', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'single_arm_pulldown', name: 'Single-Arm Lat Pulldown', primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms'], equipment: 'Cable', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'seated_cable_row', name: 'Seated Cable Row', primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms'], equipment: 'Cable', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'meadows_row', name: 'Meadows Row', primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'rack_pull', name: 'Rack Pull', primaryMuscleGroup: 'back', secondaryMuscleGroups: ['legs'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'snatch_grip_deadlift', name: 'Snatch-Grip Deadlift', primaryMuscleGroup: 'back', secondaryMuscleGroups: ['legs'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'sumo_deadlift', name: 'Sumo Deadlift', primaryMuscleGroup: 'back', secondaryMuscleGroups: ['legs'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'trap_bar_deadlift', name: 'Trap Bar Deadlift', primaryMuscleGroup: 'back', secondaryMuscleGroups: ['legs'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'good_morning', name: 'Good Morning', primaryMuscleGroup: 'back', secondaryMuscleGroups: ['legs'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'hyperextension', name: 'Back Extension', primaryMuscleGroup: 'back', secondaryMuscleGroups: ['legs'], equipment: 'Bodyweight', category: 'isolation', trackingType: 'bodyweight', bodyweightCoefficient: 0.55, isCustom: false },
      { id: 'shrug_barbell', name: 'Barbell Shrug', primaryMuscleGroup: 'back', secondaryMuscleGroups: [], equipment: 'Barbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'shrug_dumbbell', name: 'Dumbbell Shrug', primaryMuscleGroup: 'back', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'cable_shrug', name: 'Cable Shrug', primaryMuscleGroup: 'back', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'pullover_db', name: 'Dumbbell Pullover', primaryMuscleGroup: 'back', secondaryMuscleGroups: ['chest'], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'pullover_cable', name: 'Cable Pullover', primaryMuscleGroup: 'back', secondaryMuscleGroups: ['chest'], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'renegade_row', name: 'Renegade Row', primaryMuscleGroup: 'back', secondaryMuscleGroups: ['core','arms'], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'seal_row', name: 'Seal Row', primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'gorilla_row', name: 'Gorilla Row', primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms'], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'band_pull_apart', name: 'Band Pull-Apart', primaryMuscleGroup: 'back', secondaryMuscleGroups: ['shoulders'], equipment: 'Band', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'deficit_deadlift', name: 'Deficit Deadlift', primaryMuscleGroup: 'back', secondaryMuscleGroups: ['legs'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },

      /* ── SHOULDERS ── */
      { id: 'seated_db_press', name: 'Seated DB Press', primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms'], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'db_shoulder_press', name: 'Standing DB Press', primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms'], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'machine_shoulder_press', name: 'Machine Shoulder Press', primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms'], equipment: 'Machine', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'smith_shoulder_press', name: 'Smith Machine Press', primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms'], equipment: 'Machine', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'push_press', name: 'Push Press', primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms','legs'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'cable_lateral_raise', name: 'Cable Lateral Raise', primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'machine_lateral_raise', name: 'Machine Lateral Raise', primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Machine', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'leaning_lateral_raise', name: 'Leaning Lateral Raise', primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'front_raise_db', name: 'DB Front Raise', primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'front_raise_plate', name: 'Plate Front Raise', primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Plate', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'front_raise_cable', name: 'Cable Front Raise', primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'rear_delt_fly', name: 'Rear Delt Fly', primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'reverse_pec_deck', name: 'Reverse Pec Deck', primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Machine', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'cable_rear_delt_fly', name: 'Cable Rear Delt Fly', primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'bent_over_lateral_raise', name: 'Bent-Over Lateral Raise', primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'upright_row_barbell', name: 'Barbell Upright Row', primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'upright_row_cable', name: 'Cable Upright Row', primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms'], equipment: 'Cable', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'upright_row_db', name: 'DB Upright Row', primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms'], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'landmine_press', name: 'Landmine Press', primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['chest','arms'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'behind_neck_press', name: 'Behind-the-Neck Press', primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'viking_press', name: 'Viking Press', primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms'], equipment: 'Machine', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'lu_raise', name: 'Lu Raise', primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'cable_y_raise', name: 'Cable Y-Raise', primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'w_raise', name: 'W-Raise', primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'scarecrow', name: 'Scarecrow', primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },

      /* ── ARMS (biceps / triceps / forearms) ── */
      { id: 'db_curl', name: 'Dumbbell Curl', primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'incline_db_curl', name: 'Incline DB Curl', primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'preacher_curl', name: 'Preacher Curl', primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Barbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'ez_bar_curl', name: 'EZ-Bar Curl', primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'EZ Bar', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'cable_curl', name: 'Cable Curl', primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'concentration_curl', name: 'Concentration Curl', primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'spider_curl', name: 'Spider Curl', primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'drag_curl', name: 'Drag Curl', primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Barbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'zottman_curl', name: 'Zottman Curl', primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'reverse_curl', name: 'Reverse Curl', primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Barbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'machine_curl', name: 'Machine Curl', primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Machine', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'cable_hammer_curl', name: 'Cable Hammer Curl', primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'rope_hammer_curl', name: 'Rope Hammer Curl', primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'close_grip_bench', name: 'Close-Grip Bench Press', primaryMuscleGroup: 'arms', secondaryMuscleGroups: ['chest'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'overhead_tricep_extension', name: 'Overhead Tricep Extension', primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Barbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'db_overhead_extension', name: 'DB Overhead Extension', primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'rope_pushdown', name: 'Rope Pushdown', primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'single_arm_pushdown', name: 'Single-Arm Pushdown', primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'tricep_kickback', name: 'Tricep Kickback', primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'bench_dip', name: 'Bench Dip', primaryMuscleGroup: 'arms', secondaryMuscleGroups: ['chest'], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', bodyweightCoefficient: 0.45, isCustom: false },
      { id: 'jm_press', name: 'JM Press', primaryMuscleGroup: 'arms', secondaryMuscleGroups: ['chest'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'cable_overhead_extension', name: 'Cable Overhead Extension', primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'tricep_dip_machine', name: 'Machine Tricep Dip', primaryMuscleGroup: 'arms', secondaryMuscleGroups: ['chest'], equipment: 'Machine', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'wrist_curl', name: 'Wrist Curl', primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Barbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'reverse_wrist_curl', name: 'Reverse Wrist Curl', primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Barbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'farmers_carry', name: "Farmer's Carry", primaryMuscleGroup: 'arms', secondaryMuscleGroups: ['core','legs'], equipment: 'Dumbbell', category: 'compound', trackingType: 'time', isCustom: false },
      { id: 'plate_pinch', name: 'Plate Pinch', primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Plate', category: 'isolation', trackingType: 'time', isCustom: false },
      { id: 'reverse_ez_curl', name: 'Reverse EZ-Bar Curl', primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'EZ Bar', category: 'isolation', trackingType: 'weight_reps', isCustom: false },

      /* ── LEGS ── */
      { id: 'front_squat', name: 'Front Squat', primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['core'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'hack_squat', name: 'Hack Squat', primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Machine', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'goblet_squat', name: 'Goblet Squat', primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['core'], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'smith_squat', name: 'Smith Machine Squat', primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Machine', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'box_squat', name: 'Box Squat', primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'pause_squat', name: 'Pause Squat', primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['core'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'pistol_squat', name: 'Pistol Squat', primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['core'], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', bodyweightCoefficient: 0.9, isCustom: false },
      { id: 'zercher_squat', name: 'Zercher Squat', primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['core'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'lunge', name: 'Lunge', primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'walking_lunge', name: 'Walking Lunge', primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'reverse_lunge', name: 'Reverse Lunge', primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'lateral_lunge', name: 'Lateral Lunge', primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'step_up', name: 'Step-Up', primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'leg_extension', name: 'Leg Extension', primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Machine', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'seated_leg_curl', name: 'Seated Leg Curl', primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Machine', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'lying_leg_curl', name: 'Lying Leg Curl', primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Machine', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'nordic_curl', name: 'Nordic Curl', primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'isolation', trackingType: 'bodyweight', bodyweightCoefficient: 0.85, isCustom: false },
      { id: 'glute_ham_raise', name: 'Glute-Ham Raise', primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'isolation', trackingType: 'bodyweight', bodyweightCoefficient: 0.6, isCustom: false },
      { id: 'hip_thrust', name: 'Hip Thrust', primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'glute_bridge', name: 'Glute Bridge', primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'cable_kickback', name: 'Cable Glute Kickback', primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'hip_abduction', name: 'Hip Abduction', primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Machine', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'hip_adduction', name: 'Hip Adduction', primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Machine', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'seated_calf_raise', name: 'Seated Calf Raise', primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Machine', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'standing_calf_raise', name: 'Standing Calf Raise', primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Machine', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'leg_press_calf_raise', name: 'Leg Press Calf Raise', primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Machine', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'donkey_calf_raise', name: 'Donkey Calf Raise', primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Machine', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'sissy_squat', name: 'Sissy Squat', primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'isolation', trackingType: 'bodyweight', bodyweightCoefficient: 0.6, isCustom: false },
      { id: 'belt_squat', name: 'Belt Squat', primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Machine', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'sumo_squat', name: 'Sumo Squat', primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'curtsy_lunge', name: 'Curtsy Lunge', primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'single_leg_press', name: 'Single-Leg Press', primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Machine', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'kettlebell_swing', name: 'Kettlebell Swing', primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['back','core'], equipment: 'Kettlebell', category: 'compound', trackingType: 'weight_reps', isCustom: false },

      /* ── CORE ── */
      { id: 'hanging_leg_raise', name: 'Hanging Leg Raise', primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'isolation', trackingType: 'bodyweight', bodyweightCoefficient: 0.5, isCustom: false },
      { id: 'hanging_knee_raise', name: 'Hanging Knee Raise', primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'isolation', trackingType: 'bodyweight', bodyweightCoefficient: 0.4, isCustom: false },
      { id: 'cable_crunch', name: 'Cable Crunch', primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'decline_situp', name: 'Decline Sit-Up', primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'isolation', trackingType: 'bodyweight', bodyweightCoefficient: 0.4, isCustom: false },
      { id: 'situp', name: 'Sit-Up', primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'isolation', trackingType: 'bodyweight', bodyweightCoefficient: 0.35, isCustom: false },
      { id: 'ab_wheel', name: 'Ab Wheel Rollout', primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'isolation', trackingType: 'bodyweight', bodyweightCoefficient: 0.5, isCustom: false },
      { id: 'mountain_climber', name: 'Mountain Climber', primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'isolation', trackingType: 'bodyweight', bodyweightCoefficient: 0.3, isCustom: false },
      { id: 'bicycle_crunch', name: 'Bicycle Crunch', primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'isolation', trackingType: 'bodyweight', bodyweightCoefficient: 0.3, isCustom: false },
      { id: 'side_plank', name: 'Side Plank', primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'isolation', trackingType: 'time', isCustom: false },
      { id: 'leg_raise', name: 'Lying Leg Raise', primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'isolation', trackingType: 'bodyweight', bodyweightCoefficient: 0.4, isCustom: false },
      { id: 'flutter_kicks', name: 'Flutter Kicks', primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'isolation', trackingType: 'time', isCustom: false },
      { id: 'v_up', name: 'V-Up', primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'isolation', trackingType: 'bodyweight', bodyweightCoefficient: 0.4, isCustom: false },
      { id: 'toe_touch', name: 'Toe Touch', primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'isolation', trackingType: 'bodyweight', bodyweightCoefficient: 0.3, isCustom: false },
      { id: 'dead_bug', name: 'Dead Bug', primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'isolation', trackingType: 'time', isCustom: false },
      { id: 'hollow_hold', name: 'Hollow Hold', primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'isolation', trackingType: 'time', isCustom: false },
      { id: 'dragon_flag', name: 'Dragon Flag', primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'isolation', trackingType: 'bodyweight', bodyweightCoefficient: 0.6, isCustom: false },
      { id: 'woodchopper', name: 'Woodchopper', primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'pallof_press', name: 'Pallof Press', primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'cable_woodchop', name: 'Cable Woodchop', primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'side_bend', name: 'DB Side Bend', primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'l_sit', name: 'L-Sit', primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'isolation', trackingType: 'time', isCustom: false },
      { id: 'reverse_crunch', name: 'Reverse Crunch', primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'isolation', trackingType: 'bodyweight', bodyweightCoefficient: 0.35, isCustom: false },
      { id: 'oblique_crunch', name: 'Oblique Crunch', primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'isolation', trackingType: 'bodyweight', bodyweightCoefficient: 0.3, isCustom: false },
      { id: 'plank_shoulder_tap', name: 'Plank Shoulder Tap', primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'isolation', trackingType: 'time', isCustom: false },

      /* ── CARDIO / CONDITIONING ── */
      { id: 'treadmill_run', name: 'Treadmill Run', primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['core'], equipment: 'Machine', category: 'compound', trackingType: 'distance', isCustom: false },
      { id: 'stationary_bike', name: 'Stationary Bike', primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Machine', category: 'compound', trackingType: 'distance', isCustom: false },
      { id: 'rowing_machine', name: 'Rowing Machine', primaryMuscleGroup: 'back', secondaryMuscleGroups: ['legs','arms'], equipment: 'Machine', category: 'compound', trackingType: 'distance', isCustom: false },
      { id: 'elliptical', name: 'Elliptical', primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Machine', category: 'compound', trackingType: 'distance', isCustom: false },
      { id: 'stair_climber', name: 'Stair Climber', primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Machine', category: 'compound', trackingType: 'time', isCustom: false },
      { id: 'jump_rope', name: 'Jump Rope', primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'compound', trackingType: 'time', isCustom: false },
      { id: 'burpee', name: 'Burpee', primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['chest','core'], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', bodyweightCoefficient: 0.6, isCustom: false },
      { id: 'battle_ropes', name: 'Battle Ropes', primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms','core'], equipment: 'Cable', category: 'compound', trackingType: 'time', isCustom: false },
      { id: '3_4_sit_up', name: "3/4 Sit-Up", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: '90_90_hamstring', name: "90/90 Hamstring", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'ab_crunch_machine', name: "Ab Crunch Machine", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Machine', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'ab_roller', name: "Ab Roller", primaryMuscleGroup: 'core', secondaryMuscleGroups: ['shoulders'], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'adductor', name: "Adductor", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Foam Roller', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'adductor_groin', name: "Adductor/Groin", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'advanced_kettlebell_windmill', name: "Advanced Kettlebell Windmill", primaryMuscleGroup: 'core', secondaryMuscleGroups: ['legs', 'shoulders'], equipment: 'Kettlebell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'air_bike', name: "Air Bike", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'all_fours_quad_stretch', name: "All Fours Quad Stretch", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'alternate_hammer_curl', name: "Alternate Hammer Curl", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'alternate_heel_touchers', name: "Alternate Heel Touchers", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'isolation', trackingType: 'bodyweight', isCustom: false },
      { id: 'alternate_incline_dumbbell_curl', name: "Alternate Incline Dumbbell Curl", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'alternate_leg_diagonal_bound', name: "Alternate Leg Diagonal Bound", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'alternating_cable_shoulder_press', name: "Alternating Cable Shoulder Press", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms'], equipment: 'Cable', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'alternating_deltoid_raise', name: "Alternating Deltoid Raise", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'alternating_floor_press', name: "Alternating Floor Press", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['core', 'shoulders', 'arms'], equipment: 'Kettlebell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'alternating_hang_clean', name: "Alternating Hang Clean", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['arms', 'back'], equipment: 'Kettlebell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'alternating_kettlebell_press', name: "Alternating Kettlebell Press", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms'], equipment: 'Kettlebell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'alternating_kettlebell_row', name: "Alternating Kettlebell Row", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms'], equipment: 'Kettlebell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'alternating_renegade_row', name: "Alternating Renegade Row", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['core', 'arms', 'chest'], equipment: 'Kettlebell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'ankle_circles', name: "Ankle Circles", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'ankle_on_the_knee', name: "Ankle On The Knee", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'anterior_tibialis_smr', name: "Anterior Tibialis-SMR", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Other', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'anti_gravity_press', name: "Anti-Gravity Press", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['back', 'arms'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'arm_circles', name: "Arm Circles", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['back'], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'arnold_dumbbell_press', name: "Arnold Dumbbell Press", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms'], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'around_the_worlds', name: "Around The Worlds", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders'], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'atlas_stone_trainer', name: "Atlas Stone Trainer", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms', 'legs'], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'atlas_stones', name: "Atlas Stones", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['core', 'legs', 'arms'], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'axle_deadlift', name: "Axle Deadlift", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms', 'legs'], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'back_flyes_with_bands', name: "Back Flyes - With Bands", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['back', 'arms'], equipment: 'Band', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'backward_drag', name: "Backward Drag", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['arms', 'back'], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'backward_medicine_ball_throw', name: "Backward Medicine Ball Throw", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Medicine Ball', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'balance_board', name: "Balance Board", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'ball_leg_curl', name: "Ball Leg Curl", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Exercise Ball', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'band_assisted_pull_up', name: "Band Assisted Pull-Up", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['core', 'arms'], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'band_good_morning', name: "Band Good Morning", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['back'], equipment: 'Band', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'band_good_morning_pull_through', name: "Band Good Morning (Pull Through)", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['back'], equipment: 'Band', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'band_hip_adductions', name: "Band Hip Adductions", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Band', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'band_skull_crusher', name: "Band Skull Crusher", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Band', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'barbell_ab_rollout', name: "Barbell Ab Rollout", primaryMuscleGroup: 'core', secondaryMuscleGroups: ['back', 'shoulders'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'barbell_ab_rollout_on_knees', name: "Barbell Ab Rollout - On Knees", primaryMuscleGroup: 'core', secondaryMuscleGroups: ['back', 'shoulders'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'barbell_bench_press_medium_grip', name: "Barbell Bench Press - Medium Grip", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders', 'arms'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'barbell_curls_lying_against_an_incline', name: "Barbell Curls Lying Against An Incline", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Barbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'barbell_deadlift', name: "Barbell Deadlift", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['legs', 'arms'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'barbell_full_squat', name: "Barbell Full Squat", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['back'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'barbell_glute_bridge', name: "Barbell Glute Bridge", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'barbell_guillotine_bench_press', name: "Barbell Guillotine Bench Press", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders', 'arms'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'barbell_hack_squat', name: "Barbell Hack Squat", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['arms'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'barbell_hip_thrust', name: "Barbell Hip Thrust", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'barbell_incline_bench_press_medium_grip', name: "Barbell Incline Bench Press - Medium Grip", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders', 'arms'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'barbell_incline_shoulder_raise', name: "Barbell Incline Shoulder Raise", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['chest'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'barbell_lunge', name: "Barbell Lunge", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'barbell_rear_delt_row', name: "Barbell Rear Delt Row", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms', 'back'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'barbell_rollout_from_bench', name: "Barbell Rollout from Bench", primaryMuscleGroup: 'core', secondaryMuscleGroups: ['legs', 'back', 'shoulders'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'barbell_seated_calf_raise', name: "Barbell Seated Calf Raise", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Barbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'barbell_shoulder_press', name: "Barbell Shoulder Press", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['chest', 'arms'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'barbell_shrug_behind_the_back', name: "Barbell Shrug Behind The Back", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms'], equipment: 'Barbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'barbell_side_bend', name: "Barbell Side Bend", primaryMuscleGroup: 'core', secondaryMuscleGroups: ['back'], equipment: 'Barbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'barbell_side_split_squat', name: "Barbell Side Split Squat", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['back'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'barbell_squat_to_a_bench', name: "Barbell Squat To A Bench", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['back'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'barbell_step_ups', name: "Barbell Step Ups", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'barbell_walking_lunge', name: "Barbell Walking Lunge", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'battling_ropes', name: "Battling Ropes", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['chest', 'arms'], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'bear_crawl_sled_drags', name: "Bear Crawl Sled Drags", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'behind_head_chest_stretch', name: "Behind Head Chest Stretch", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders'], equipment: 'Other', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'bench_dips', name: "Bench Dips", primaryMuscleGroup: 'arms', secondaryMuscleGroups: ['chest', 'shoulders'], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'bench_jump', name: "Bench Jump", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'bench_press_powerlifting', name: "Bench Press - Powerlifting", primaryMuscleGroup: 'arms', secondaryMuscleGroups: ['chest', 'back', 'shoulders'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'bench_press_with_bands', name: "Bench Press - With Bands", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders', 'arms'], equipment: 'Band', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'bench_press_with_chains', name: "Bench Press with Chains", primaryMuscleGroup: 'arms', secondaryMuscleGroups: ['chest', 'back', 'shoulders'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'bench_sprint', name: "Bench Sprint", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'bent_arm_barbell_pullover', name: "Bent-Arm Barbell Pullover", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['chest', 'shoulders', 'arms'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'bent_arm_dumbbell_pullover', name: "Bent-Arm Dumbbell Pullover", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['back', 'shoulders', 'arms'], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'bent_knee_hip_raise', name: "Bent-Knee Hip Raise", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'bent_over_barbell_row', name: "Bent Over Barbell Row", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms', 'shoulders'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'bent_over_dumbbell_rear_delt_raise_with_head_on_bench', name: "Bent Over Dumbbell Rear Delt Raise With Head On Bench", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'bent_over_low_pulley_side_lateral', name: "Bent Over Low-Pulley Side Lateral", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['back'], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'bent_over_one_arm_long_bar_row', name: "Bent Over One-Arm Long Bar Row", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'bent_over_two_arm_long_bar_row', name: "Bent Over Two-Arm Long Bar Row", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'bent_over_two_dumbbell_row', name: "Bent Over Two-Dumbbell Row", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms', 'shoulders'], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'bent_over_two_dumbbell_row_with_palms_in', name: "Bent Over Two-Dumbbell Row With Palms In", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms'], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'bent_press', name: "Bent Press", primaryMuscleGroup: 'core', secondaryMuscleGroups: ['legs', 'back', 'shoulders', 'arms'], equipment: 'Kettlebell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'bicycling', name: "Bicycling", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Other', category: 'cardio', trackingType: 'time', isCustom: false },
      { id: 'bicycling_stationary', name: "Bicycling, Stationary", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Machine', category: 'cardio', trackingType: 'time', isCustom: false },
      { id: 'board_press', name: "Board Press", primaryMuscleGroup: 'arms', secondaryMuscleGroups: ['chest', 'back', 'shoulders'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'body_up', name: "Body-Up", primaryMuscleGroup: 'arms', secondaryMuscleGroups: ['core'], equipment: 'Bodyweight', category: 'isolation', trackingType: 'bodyweight', isCustom: false },
      { id: 'body_tricep_press', name: "Body Tricep Press", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'isolation', trackingType: 'bodyweight', isCustom: false },
      { id: 'bodyweight_flyes', name: "Bodyweight Flyes", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['core', 'shoulders', 'arms'], equipment: 'EZ Bar', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'bodyweight_mid_row', name: "Bodyweight Mid Row", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms'], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'bodyweight_squat', name: "Bodyweight Squat", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'bodyweight_walking_lunge', name: "Bodyweight Walking Lunge", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'bosu_ball_cable_crunch_with_side_bends', name: "Bosu Ball Cable Crunch With Side Bends", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'bottoms_up_clean_from_the_hang_position', name: "Bottoms-Up Clean From The Hang Position", primaryMuscleGroup: 'arms', secondaryMuscleGroups: ['shoulders'], equipment: 'Kettlebell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'bottoms_up', name: "Bottoms Up", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'box_jump_multiple_response', name: "Box Jump (Multiple Response)", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'box_skip', name: "Box Skip", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'box_squat_with_bands', name: "Box Squat with Bands", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['back'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'box_squat_with_chains', name: "Box Squat with Chains", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['back'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'brachialis_smr', name: "Brachialis-SMR", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Foam Roller', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'bradford_rocky_presses', name: "Bradford/Rocky Presses", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'butt_ups', name: "Butt-Ups", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'butt_lift_bridge', name: "Butt Lift (Bridge)", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'isolation', trackingType: 'bodyweight', isCustom: false },
      { id: 'butterfly', name: "Butterfly", primaryMuscleGroup: 'chest', secondaryMuscleGroups: [], equipment: 'Machine', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'cable_chest_press', name: "Cable Chest Press", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders', 'arms'], equipment: 'Cable', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'cable_deadlifts', name: "Cable Deadlifts", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['arms', 'back'], equipment: 'Cable', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'cable_hammer_curls_rope_attachment', name: "Cable Hammer Curls - Rope Attachment", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'cable_hip_adduction', name: "Cable Hip Adduction", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'cable_incline_pushdown', name: "Cable Incline Pushdown", primaryMuscleGroup: 'back', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'cable_incline_triceps_extension', name: "Cable Incline Triceps Extension", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'cable_internal_rotation', name: "Cable Internal Rotation", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Cable', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'cable_iron_cross', name: "Cable Iron Cross", primaryMuscleGroup: 'chest', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'cable_judo_flip', name: "Cable Judo Flip", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Cable', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'cable_lying_triceps_extension', name: "Cable Lying Triceps Extension", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'cable_one_arm_tricep_extension', name: "Cable One Arm Tricep Extension", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'cable_preacher_curl', name: "Cable Preacher Curl", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'cable_reverse_crunch', name: "Cable Reverse Crunch", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'cable_rope_overhead_triceps_extension', name: "Cable Rope Overhead Triceps Extension", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'cable_rope_rear_delt_rows', name: "Cable Rope Rear-Delt Rows", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms', 'back'], equipment: 'Cable', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'cable_russian_twists', name: "Cable Russian Twists", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Cable', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'cable_seated_crunch', name: "Cable Seated Crunch", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'cable_seated_lateral_raise', name: "Cable Seated Lateral Raise", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['back'], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'cable_shoulder_press', name: "Cable Shoulder Press", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms'], equipment: 'Cable', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'cable_shrugs', name: "Cable Shrugs", primaryMuscleGroup: 'back', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'cable_wrist_curl', name: "Cable Wrist Curl", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'calf_machine_shoulder_shrug', name: "Calf-Machine Shoulder Shrug", primaryMuscleGroup: 'back', secondaryMuscleGroups: [], equipment: 'Machine', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'calf_press', name: "Calf Press", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Machine', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'calf_press_on_the_leg_press_machine', name: "Calf Press On The Leg Press Machine", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Machine', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'calf_raise_on_a_dumbbell', name: "Calf Raise On A Dumbbell", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'calf_raises_with_bands', name: "Calf Raises - With Bands", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Band', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'calf_stretch_elbows_against_wall', name: "Calf Stretch Elbows Against Wall", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'calf_stretch_hands_against_wall', name: "Calf Stretch Hands Against Wall", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'calves_smr', name: "Calves-SMR", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Foam Roller', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'car_deadlift', name: "Car Deadlift", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['arms', 'back'], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'car_drivers', name: "Car Drivers", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms'], equipment: 'Barbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'carioca_quick_step', name: "Carioca Quick Step", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['core'], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'cat_stretch', name: "Cat Stretch", primaryMuscleGroup: 'back', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'catch_and_overhead_throw', name: "Catch and Overhead Throw", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['core', 'chest', 'shoulders'], equipment: 'Medicine Ball', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'chain_handle_extension', name: "Chain Handle Extension", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Other', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'chain_press', name: "Chain Press", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders', 'arms'], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'chair_leg_extended_stretch', name: "Chair Leg Extended Stretch", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Other', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'chair_lower_back_stretch', name: "Chair Lower Back Stretch", primaryMuscleGroup: 'back', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'chair_squat', name: "Chair Squat", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Machine', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'chair_upper_body_stretch', name: "Chair Upper Body Stretch", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms', 'chest'], equipment: 'Other', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'chest_and_front_of_shoulder_stretch', name: "Chest And Front Of Shoulder Stretch", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders'], equipment: 'Other', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'chest_push_from_3_point_stance', name: "Chest Push from 3 point stance", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['core', 'shoulders', 'arms'], equipment: 'Medicine Ball', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'chest_push_multiple_response', name: "Chest Push (multiple response)", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['core', 'shoulders', 'arms'], equipment: 'Medicine Ball', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'chest_push_single_response', name: "Chest Push (single response)", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['core', 'shoulders', 'arms'], equipment: 'Medicine Ball', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'chest_push_with_run_release', name: "Chest Push with Run Release", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['core', 'shoulders', 'arms'], equipment: 'Medicine Ball', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'chest_stretch_on_stability_ball', name: "Chest Stretch on Stability Ball", primaryMuscleGroup: 'chest', secondaryMuscleGroups: [], equipment: 'Exercise Ball', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'child_s_pose', name: "Child\'s Pose", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['legs'], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'chin_to_chest_stretch', name: "Chin To Chest Stretch", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['back'], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'circus_bell', name: "Circus Bell", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms', 'legs', 'back'], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'clean', name: "Clean", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['arms', 'back', 'shoulders'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'clean_deadlift', name: "Clean Deadlift", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['arms', 'back'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'clean_pull', name: "Clean Pull", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['arms', 'back'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'clean_shrug', name: "Clean Shrug", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms', 'shoulders'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'clean_and_jerk', name: "Clean and Jerk", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['core', 'legs', 'back', 'arms'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'clean_and_press', name: "Clean and Press", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['core', 'legs', 'back', 'arms'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'clean_from_blocks', name: "Clean from Blocks", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['shoulders', 'back'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'clock_push_up', name: "Clock Push-Up", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders', 'arms'], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'close_grip_barbell_bench_press', name: "Close-Grip Barbell Bench Press", primaryMuscleGroup: 'arms', secondaryMuscleGroups: ['chest', 'shoulders'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'close_grip_dumbbell_press', name: "Close-Grip Dumbbell Press", primaryMuscleGroup: 'arms', secondaryMuscleGroups: ['chest', 'shoulders'], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'close_grip_ez_bar_curl_with_band', name: "Close-Grip EZ-Bar Curl with Band", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'EZ Bar', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'close_grip_ez_bar_press', name: "Close-Grip EZ-Bar Press", primaryMuscleGroup: 'arms', secondaryMuscleGroups: ['chest', 'shoulders'], equipment: 'EZ Bar', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'close_grip_ez_bar_curl', name: "Close-Grip EZ Bar Curl", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Barbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'close_grip_front_lat_pulldown', name: "Close-Grip Front Lat Pulldown", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms', 'shoulders'], equipment: 'Cable', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'close_grip_push_up_off_of_a_dumbbell', name: "Close-Grip Push-Up off of a Dumbbell", primaryMuscleGroup: 'arms', secondaryMuscleGroups: ['core', 'chest', 'shoulders'], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'close_grip_standing_barbell_curl', name: "Close-Grip Standing Barbell Curl", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Barbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'cocoons', name: "Cocoons", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'conan_s_wheel', name: "Conan\'s Wheel", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['core', 'arms', 'back', 'shoulders'], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'concentration_curls', name: "Concentration Curls", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'cross_body_crunch', name: "Cross-Body Crunch", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'cross_body_hammer_curl', name: "Cross Body Hammer Curl", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'cross_over_with_bands', name: "Cross Over - With Bands", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['arms', 'shoulders'], equipment: 'Band', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'crossover_reverse_lunge', name: "Crossover Reverse Lunge", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['core', 'legs'], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'crucifix', name: "Crucifix", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms'], equipment: 'Other', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'crunch_hands_overhead', name: "Crunch - Hands Overhead", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'isolation', trackingType: 'bodyweight', isCustom: false },
      { id: 'crunch_legs_on_exercise_ball', name: "Crunch - Legs On Exercise Ball", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'isolation', trackingType: 'bodyweight', isCustom: false },
      { id: 'cuban_press', name: "Cuban Press", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['back'], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'dancer_s_stretch', name: "Dancer\'s Stretch", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['legs'], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'deadlift_with_bands', name: "Deadlift with Bands", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms', 'legs'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'deadlift_with_chains', name: "Deadlift with Chains", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms', 'legs'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'decline_barbell_bench_press', name: "Decline Barbell Bench Press", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders', 'arms'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'decline_close_grip_bench_to_skull_crusher', name: "Decline Close-Grip Bench To Skull Crusher", primaryMuscleGroup: 'arms', secondaryMuscleGroups: ['chest', 'shoulders'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'decline_crunch', name: "Decline Crunch", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'isolation', trackingType: 'bodyweight', isCustom: false },
      { id: 'decline_dumbbell_bench_press', name: "Decline Dumbbell Bench Press", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders', 'arms'], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'decline_dumbbell_flyes', name: "Decline Dumbbell Flyes", primaryMuscleGroup: 'chest', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'decline_dumbbell_triceps_extension', name: "Decline Dumbbell Triceps Extension", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'decline_ez_bar_triceps_extension', name: "Decline EZ Bar Triceps Extension", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Barbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'decline_oblique_crunch', name: "Decline Oblique Crunch", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'decline_reverse_crunch', name: "Decline Reverse Crunch", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'decline_smith_press', name: "Decline Smith Press", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders', 'arms'], equipment: 'Machine', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'depth_jump_leap', name: "Depth Jump Leap", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'dip_machine', name: "Dip Machine", primaryMuscleGroup: 'arms', secondaryMuscleGroups: ['chest', 'shoulders'], equipment: 'Machine', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'dips_chest_version', name: "Dips - Chest Version", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders', 'arms'], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'dips_triceps_version', name: "Dips - Triceps Version", primaryMuscleGroup: 'arms', secondaryMuscleGroups: ['chest', 'shoulders'], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'donkey_calf_raises', name: "Donkey Calf Raises", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Other', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'double_kettlebell_alternating_hang_clean', name: "Double Kettlebell Alternating Hang Clean", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['arms', 'back'], equipment: 'Kettlebell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'double_kettlebell_jerk', name: "Double Kettlebell Jerk", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['legs', 'arms'], equipment: 'Kettlebell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'double_kettlebell_push_press', name: "Double Kettlebell Push Press", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['legs', 'arms'], equipment: 'Kettlebell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'double_kettlebell_snatch', name: "Double Kettlebell Snatch", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['legs'], equipment: 'Kettlebell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'double_kettlebell_windmill', name: "Double Kettlebell Windmill", primaryMuscleGroup: 'core', secondaryMuscleGroups: ['legs', 'shoulders', 'arms'], equipment: 'Kettlebell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'double_leg_butt_kick', name: "Double Leg Butt Kick", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'downward_facing_balance', name: "Downward Facing Balance", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['core'], equipment: 'Exercise Ball', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'drop_push', name: "Drop Push", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders', 'arms'], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'dumbbell_alternate_bicep_curl', name: "Dumbbell Alternate Bicep Curl", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'dumbbell_bench_press', name: "Dumbbell Bench Press", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders', 'arms'], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'dumbbell_bench_press_with_neutral_grip', name: "Dumbbell Bench Press with Neutral Grip", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders', 'arms'], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'dumbbell_bicep_curl', name: "Dumbbell Bicep Curl", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'dumbbell_clean', name: "Dumbbell Clean", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['arms', 'back', 'shoulders'], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'dumbbell_floor_press', name: "Dumbbell Floor Press", primaryMuscleGroup: 'arms', secondaryMuscleGroups: ['chest', 'shoulders'], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'dumbbell_flyes', name: "Dumbbell Flyes", primaryMuscleGroup: 'chest', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'dumbbell_incline_row', name: "Dumbbell Incline Row", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms', 'shoulders'], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'dumbbell_incline_shoulder_raise', name: "Dumbbell Incline Shoulder Raise", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms'], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'dumbbell_lunges', name: "Dumbbell Lunges", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'dumbbell_lying_one_arm_rear_lateral_raise', name: "Dumbbell Lying One-Arm Rear Lateral Raise", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['back'], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'dumbbell_lying_pronation', name: "Dumbbell Lying Pronation", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'dumbbell_lying_rear_lateral_raise', name: "Dumbbell Lying Rear Lateral Raise", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'dumbbell_lying_supination', name: "Dumbbell Lying Supination", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'dumbbell_one_arm_shoulder_press', name: "Dumbbell One-Arm Shoulder Press", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms'], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'dumbbell_one_arm_triceps_extension', name: "Dumbbell One-Arm Triceps Extension", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'dumbbell_one_arm_upright_row', name: "Dumbbell One-Arm Upright Row", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms', 'back'], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'dumbbell_prone_incline_curl', name: "Dumbbell Prone Incline Curl", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'dumbbell_raise', name: "Dumbbell Raise", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms'], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'dumbbell_rear_lunge', name: "Dumbbell Rear Lunge", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'dumbbell_scaption', name: "Dumbbell Scaption", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['back'], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'dumbbell_seated_box_jump', name: "Dumbbell Seated Box Jump", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'dumbbell_seated_one_leg_calf_raise', name: "Dumbbell Seated One-Leg Calf Raise", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'dumbbell_shoulder_press', name: "Dumbbell Shoulder Press", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms'], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'dumbbell_side_bend', name: "Dumbbell Side Bend", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'dumbbell_squat', name: "Dumbbell Squat", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['back'], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'dumbbell_squat_to_a_bench', name: "Dumbbell Squat To A Bench", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['back'], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'dumbbell_step_ups', name: "Dumbbell Step Ups", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'dumbbell_tricep_extension_pronated_grip', name: "Dumbbell Tricep Extension -Pronated Grip", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'dynamic_back_stretch', name: "Dynamic Back Stretch", primaryMuscleGroup: 'back', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'dynamic_chest_stretch', name: "Dynamic Chest Stretch", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['back'], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'ez_bar_skullcrusher', name: "EZ-Bar Skullcrusher", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'EZ Bar', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'elbow_circles', name: "Elbow Circles", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['back'], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'elbow_to_knee', name: "Elbow to Knee", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'elbows_back', name: "Elbows Back", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders'], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'elevated_back_lunge', name: "Elevated Back Lunge", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'elevated_cable_rows', name: "Elevated Cable Rows", primaryMuscleGroup: 'back', secondaryMuscleGroups: [], equipment: 'Cable', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'elliptical_trainer', name: "Elliptical Trainer", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Machine', category: 'cardio', trackingType: 'time', isCustom: false },
      { id: 'exercise_ball_crunch', name: "Exercise Ball Crunch", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Exercise Ball', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'exercise_ball_pull_in', name: "Exercise Ball Pull-In", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Exercise Ball', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'extended_range_one_arm_kettlebell_floor_press', name: "Extended Range One-Arm Kettlebell Floor Press", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders', 'arms'], equipment: 'Kettlebell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'external_rotation', name: "External Rotation", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'external_rotation_with_band', name: "External Rotation with Band", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Band', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'external_rotation_with_cable', name: "External Rotation with Cable", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'farmer_s_walk', name: "Farmer\'s Walk", primaryMuscleGroup: 'arms', secondaryMuscleGroups: ['core', 'legs', 'back'], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'fast_skipping', name: "Fast Skipping", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'finger_curls', name: "Finger Curls", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Barbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'flat_bench_cable_flyes', name: "Flat Bench Cable Flyes", primaryMuscleGroup: 'chest', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'flat_bench_leg_pull_in', name: "Flat Bench Leg Pull-In", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'flat_bench_lying_leg_raise', name: "Flat Bench Lying Leg Raise", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'isolation', trackingType: 'bodyweight', isCustom: false },
      { id: 'flexor_incline_dumbbell_curls', name: "Flexor Incline Dumbbell Curls", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'floor_glute_ham_raise', name: "Floor Glute-Ham Raise", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'isolation', trackingType: 'bodyweight', isCustom: false },
      { id: 'floor_press_with_chains', name: "Floor Press with Chains", primaryMuscleGroup: 'arms', secondaryMuscleGroups: ['chest', 'shoulders'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'foot_smr', name: "Foot-SMR", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Other', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'forward_drag_with_press', name: "Forward Drag with Press", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['legs', 'shoulders', 'arms'], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'frankenstein_squat', name: "Frankenstein Squat", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['core'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'freehand_jump_squat', name: "Freehand Jump Squat", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'frog_hops', name: "Frog Hops", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'frog_sit_ups', name: "Frog Sit-Ups", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'isolation', trackingType: 'bodyweight', isCustom: false },
      { id: 'front_barbell_squat', name: "Front Barbell Squat", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'front_barbell_squat_to_a_bench', name: "Front Barbell Squat To A Bench", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'front_box_jump', name: "Front Box Jump", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'front_cable_raise', name: "Front Cable Raise", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'front_cone_hops_or_hurdle_hops', name: "Front Cone Hops (or hurdle hops)", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'front_dumbbell_raise', name: "Front Dumbbell Raise", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'front_incline_dumbbell_raise', name: "Front Incline Dumbbell Raise", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'front_leg_raises', name: "Front Leg Raises", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'front_plate_raise', name: "Front Plate Raise", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Other', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'front_raise_and_pullover', name: "Front Raise And Pullover", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['back', 'shoulders', 'arms'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'front_squat_clean_grip', name: "Front Squat (Clean Grip)", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['core'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'front_squats_with_two_kettlebells', name: "Front Squats With Two Kettlebells", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Kettlebell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'front_two_dumbbell_raise', name: "Front Two-Dumbbell Raise", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'full_range_of_motion_lat_pulldown', name: "Full Range-Of-Motion Lat Pulldown", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms', 'shoulders'], equipment: 'Cable', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'gironda_sternum_chins', name: "Gironda Sternum Chins", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms'], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'glute_kickback', name: "Glute Kickback", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'good_morning_off_pins', name: "Good Morning off Pins", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['core', 'back'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'gorilla_chin_crunch', name: "Gorilla Chin/Crunch", primaryMuscleGroup: 'core', secondaryMuscleGroups: ['arms', 'back'], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'groin_and_back_stretch', name: "Groin and Back Stretch", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'groiners', name: "Groiners", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'hammer_curls', name: "Hammer Curls", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'hammer_grip_incline_db_bench_press', name: "Hammer Grip Incline DB Bench Press", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders', 'arms'], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'hamstring_smr', name: "Hamstring-SMR", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Foam Roller', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'hamstring_stretch', name: "Hamstring Stretch", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'handstand_push_ups', name: "Handstand Push-Ups", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms'], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'hang_clean', name: "Hang Clean", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['arms', 'back', 'shoulders'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'hang_clean_below_the_knees', name: "Hang Clean - Below the Knees", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['arms', 'back', 'shoulders'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'hang_snatch', name: "Hang Snatch", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['core', 'arms', 'back', 'shoulders'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'hang_snatch_below_knees', name: "Hang Snatch - Below Knees", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['core', 'arms', 'back', 'shoulders'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'hanging_bar_good_morning', name: "Hanging Bar Good Morning", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['core', 'back'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'hanging_pike', name: "Hanging Pike", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'heaving_snatch_balance', name: "Heaving Snatch Balance", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['core', 'arms', 'shoulders'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'heavy_bag_thrust', name: "Heavy Bag Thrust", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['core', 'shoulders', 'arms'], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'high_cable_curls', name: "High Cable Curls", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Cable', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'hip_circles_prone', name: "Hip Circles (prone)", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'hip_extension_with_bands', name: "Hip Extension with Bands", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Band', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'hip_flexion_with_band', name: "Hip Flexion with Band", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Band', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'hip_lift_with_band', name: "Hip Lift with Band", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Band', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'hug_a_ball', name: "Hug A Ball", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['legs'], equipment: 'Exercise Ball', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'hug_knees_to_chest', name: "Hug Knees To Chest", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['legs'], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'hurdle_hops', name: "Hurdle Hops", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'hyperextensions_back_extensions', name: "Hyperextensions (Back Extensions)", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['legs'], equipment: 'Other', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'hyperextensions_with_no_hyperextension_bench', name: "Hyperextensions With No Hyperextension Bench", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['legs'], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'it_band_and_glute_stretch', name: "IT Band and Glute Stretch", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Other', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'iliotibial_tract_smr', name: "Iliotibial Tract-SMR", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Foam Roller', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'inchworm', name: "Inchworm", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'incline_barbell_triceps_extension', name: "Incline Barbell Triceps Extension", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Barbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'incline_bench_pull', name: "Incline Bench Pull", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['shoulders'], equipment: 'Barbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'incline_cable_chest_press', name: "Incline Cable Chest Press", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders', 'arms'], equipment: 'Cable', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'incline_cable_flye', name: "Incline Cable Flye", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders'], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'incline_dumbbell_bench_with_palms_facing_in', name: "Incline Dumbbell Bench With Palms Facing In", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders', 'arms'], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'incline_dumbbell_curl', name: "Incline Dumbbell Curl", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'incline_dumbbell_flyes', name: "Incline Dumbbell Flyes", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders'], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'incline_dumbbell_flyes_with_a_twist', name: "Incline Dumbbell Flyes - With A Twist", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders'], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'incline_dumbbell_press', name: "Incline Dumbbell Press", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders', 'arms'], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'incline_hammer_curls', name: "Incline Hammer Curls", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'incline_inner_biceps_curl', name: "Incline Inner Biceps Curl", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'incline_push_up_close_grip', name: "Incline Push-Up Close-Grip", primaryMuscleGroup: 'arms', secondaryMuscleGroups: ['chest', 'shoulders'], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'incline_push_up_depth_jump', name: "Incline Push-Up Depth Jump", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders', 'arms'], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'incline_push_up_medium', name: "Incline Push-Up Medium", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['core', 'shoulders', 'arms'], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'incline_push_up_reverse_grip', name: "Incline Push-Up Reverse Grip", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['core', 'shoulders', 'arms'], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'incline_push_up_wide', name: "Incline Push-Up Wide", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['core', 'shoulders', 'arms'], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'intermediate_groin_stretch', name: "Intermediate Groin Stretch", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Other', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'intermediate_hip_flexor_and_quad_stretch', name: "Intermediate Hip Flexor and Quad Stretch", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Other', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'internal_rotation_with_band', name: "Internal Rotation with Band", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Band', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'inverted_row_with_straps', name: "Inverted Row with Straps", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms'], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'iron_cross', name: "Iron Cross", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['chest', 'legs', 'back'], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'iron_crosses_stretch', name: "Iron Crosses (stretch)", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'isometric_chest_squeezes', name: "Isometric Chest Squeezes", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders', 'arms'], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'isometric_neck_exercise_front_and_back', name: "Isometric Neck Exercise - Front And Back", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'isolation', trackingType: 'bodyweight', isCustom: false },
      { id: 'isometric_neck_exercise_sides', name: "Isometric Neck Exercise - Sides", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'isolation', trackingType: 'bodyweight', isCustom: false },
      { id: 'isometric_wipers', name: "Isometric Wipers", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['core', 'shoulders', 'arms'], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'jackknife_sit_up', name: "Jackknife Sit-Up", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'janda_sit_up', name: "Janda Sit-Up", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'isolation', trackingType: 'bodyweight', isCustom: false },
      { id: 'jefferson_squats', name: "Jefferson Squats", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['back'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'jerk_balance', name: "Jerk Balance", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['legs', 'arms'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'jerk_dip_squat', name: "Jerk Dip Squat", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['core'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'jogging_treadmill', name: "Jogging, Treadmill", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Machine', category: 'cardio', trackingType: 'time', isCustom: false },
      { id: 'keg_load', name: "Keg Load", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['core', 'arms', 'legs', 'shoulders'], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'kettlebell_arnold_press', name: "Kettlebell Arnold Press", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms'], equipment: 'Kettlebell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'kettlebell_dead_clean', name: "Kettlebell Dead Clean", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['back'], equipment: 'Kettlebell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'kettlebell_figure_8', name: "Kettlebell Figure 8", primaryMuscleGroup: 'core', secondaryMuscleGroups: ['legs', 'shoulders'], equipment: 'Kettlebell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'kettlebell_hang_clean', name: "Kettlebell Hang Clean", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['back', 'shoulders'], equipment: 'Kettlebell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'kettlebell_one_legged_deadlift', name: "Kettlebell One-Legged Deadlift", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['back'], equipment: 'Kettlebell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'kettlebell_pass_between_the_legs', name: "Kettlebell Pass Between The Legs", primaryMuscleGroup: 'core', secondaryMuscleGroups: ['legs', 'shoulders'], equipment: 'Kettlebell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'kettlebell_pirate_ships', name: "Kettlebell Pirate Ships", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['core'], equipment: 'Kettlebell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'kettlebell_pistol_squat', name: "Kettlebell Pistol Squat", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['shoulders'], equipment: 'Kettlebell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'kettlebell_seated_press', name: "Kettlebell Seated Press", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms'], equipment: 'Kettlebell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'kettlebell_seesaw_press', name: "Kettlebell Seesaw Press", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms'], equipment: 'Kettlebell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'kettlebell_sumo_high_pull', name: "Kettlebell Sumo High Pull", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['legs', 'shoulders'], equipment: 'Kettlebell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'kettlebell_thruster', name: "Kettlebell Thruster", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['legs', 'arms'], equipment: 'Kettlebell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'kettlebell_turkish_get_up_lunge_style', name: "Kettlebell Turkish Get-Up (Lunge style)", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['core', 'legs', 'arms'], equipment: 'Kettlebell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'kettlebell_turkish_get_up_squat_style', name: "Kettlebell Turkish Get-Up (Squat style)", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['core', 'legs', 'arms'], equipment: 'Kettlebell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'kettlebell_windmill', name: "Kettlebell Windmill", primaryMuscleGroup: 'core', secondaryMuscleGroups: ['legs', 'shoulders', 'arms'], equipment: 'Kettlebell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'kipping_muscle_up', name: "Kipping Muscle Up", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['core', 'arms', 'shoulders'], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'knee_across_the_body', name: "Knee Across The Body", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['back'], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'knee_circles', name: "Knee Circles", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'knee_hip_raise_on_parallel_bars', name: "Knee/Hip Raise On Parallel Bars", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Other', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'knee_tuck_jump', name: "Knee Tuck Jump", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'kneeling_arm_drill', name: "Kneeling Arm Drill", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['core'], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'kneeling_cable_crunch_with_alternating_oblique_twists', name: "Kneeling Cable Crunch With Alternating Oblique Twists", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'kneeling_cable_triceps_extension', name: "Kneeling Cable Triceps Extension", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'kneeling_forearm_stretch', name: "Kneeling Forearm Stretch", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'kneeling_high_pulley_row', name: "Kneeling High Pulley Row", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms'], equipment: 'Cable', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'kneeling_hip_flexor', name: "Kneeling Hip Flexor", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'kneeling_jump_squat', name: "Kneeling Jump Squat", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'kneeling_single_arm_high_pulley_row', name: "Kneeling Single-Arm High Pulley Row", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms'], equipment: 'Cable', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'kneeling_squat', name: "Kneeling Squat", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['core', 'back'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'landmine_180_s', name: "Landmine 180\'s", primaryMuscleGroup: 'core', secondaryMuscleGroups: ['legs', 'back', 'shoulders'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'landmine_linear_jammer', name: "Landmine Linear Jammer", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['core', 'legs', 'chest', 'arms'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'lateral_bound', name: "Lateral Bound", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'lateral_box_jump', name: "Lateral Box Jump", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'lateral_cone_hops', name: "Lateral Cone Hops", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'lateral_raise_with_bands', name: "Lateral Raise - With Bands", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Band', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'latissimus_dorsi_smr', name: "Latissimus Dorsi-SMR", primaryMuscleGroup: 'back', secondaryMuscleGroups: [], equipment: 'Foam Roller', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'leg_over_floor_press', name: "Leg-Over Floor Press", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders', 'arms'], equipment: 'Kettlebell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'leg_up_hamstring_stretch', name: "Leg-Up Hamstring Stretch", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'leg_extensions', name: "Leg Extensions", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Machine', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'leg_lift', name: "Leg Lift", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'isolation', trackingType: 'bodyweight', isCustom: false },
      { id: 'leg_pull_in', name: "Leg Pull-In", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'leverage_chest_press', name: "Leverage Chest Press", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders', 'arms'], equipment: 'Machine', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'leverage_deadlift', name: "Leverage Deadlift", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Machine', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'leverage_decline_chest_press', name: "Leverage Decline Chest Press", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders', 'arms'], equipment: 'Machine', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'leverage_high_row', name: "Leverage High Row", primaryMuscleGroup: 'back', secondaryMuscleGroups: [], equipment: 'Machine', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'leverage_incline_chest_press', name: "Leverage Incline Chest Press", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders', 'arms'], equipment: 'Machine', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'leverage_iso_row', name: "Leverage Iso Row", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms'], equipment: 'Machine', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'leverage_shoulder_press', name: "Leverage Shoulder Press", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms'], equipment: 'Machine', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'leverage_shrug', name: "Leverage Shrug", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms'], equipment: 'Machine', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'linear_3_part_start_technique', name: "Linear 3-Part Start Technique", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'linear_acceleration_wall_drill', name: "Linear Acceleration Wall Drill", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'linear_depth_jump', name: "Linear Depth Jump", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'log_lift', name: "Log Lift", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['core', 'chest', 'legs', 'back', 'arms'], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'london_bridges', name: "London Bridges", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms'], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'looking_at_ceiling', name: "Looking At Ceiling", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'low_cable_crossover', name: "Low Cable Crossover", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders'], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'low_cable_triceps_extension', name: "Low Cable Triceps Extension", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'low_pulley_row_to_neck', name: "Low Pulley Row To Neck", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms', 'back'], equipment: 'Cable', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'lower_back_smr', name: "Lower Back-SMR", primaryMuscleGroup: 'back', secondaryMuscleGroups: [], equipment: 'Foam Roller', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'lower_back_curl', name: "Lower Back Curl", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'lunge_pass_through', name: "Lunge Pass Through", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Kettlebell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'lunge_sprint', name: "Lunge Sprint", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Machine', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'lying_bent_leg_groin', name: "Lying Bent Leg Groin", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Other', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'lying_cable_curl', name: "Lying Cable Curl", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'lying_cambered_barbell_row', name: "Lying Cambered Barbell Row", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms'], equipment: 'Barbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'lying_close_grip_bar_curl_on_high_pulley', name: "Lying Close-Grip Bar Curl On High Pulley", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'lying_close_grip_barbell_triceps_extension_behind_the_head', name: "Lying Close-Grip Barbell Triceps Extension Behind The Head", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Barbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'lying_close_grip_barbell_triceps_press_to_chin', name: "Lying Close-Grip Barbell Triceps Press To Chin", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'EZ Bar', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'lying_crossover', name: "Lying Crossover", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'lying_dumbbell_tricep_extension', name: "Lying Dumbbell Tricep Extension", primaryMuscleGroup: 'arms', secondaryMuscleGroups: ['chest', 'shoulders'], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'lying_face_down_plate_neck_resistance', name: "Lying Face Down Plate Neck Resistance", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Other', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'lying_face_up_plate_neck_resistance', name: "Lying Face Up Plate Neck Resistance", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Other', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'lying_glute', name: "Lying Glute", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'lying_hamstring', name: "Lying Hamstring", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Other', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'lying_high_bench_barbell_curl', name: "Lying High Bench Barbell Curl", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Barbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'lying_leg_curls', name: "Lying Leg Curls", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Machine', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'lying_machine_squat', name: "Lying Machine Squat", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Machine', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'lying_one_arm_lateral_raise', name: "Lying One-Arm Lateral Raise", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'lying_prone_quadriceps', name: "Lying Prone Quadriceps", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'lying_rear_delt_raise', name: "Lying Rear Delt Raise", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'lying_supine_dumbbell_curl', name: "Lying Supine Dumbbell Curl", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'lying_t_bar_row', name: "Lying T-Bar Row", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms'], equipment: 'Machine', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'lying_triceps_press', name: "Lying Triceps Press", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'EZ Bar', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'machine_bench_press', name: "Machine Bench Press", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders', 'arms'], equipment: 'Machine', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'machine_bicep_curl', name: "Machine Bicep Curl", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Machine', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'machine_preacher_curls', name: "Machine Preacher Curls", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Machine', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'machine_shoulder_military_press', name: "Machine Shoulder (Military) Press", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms'], equipment: 'Machine', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'machine_triceps_extension', name: "Machine Triceps Extension", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Machine', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'medicine_ball_chest_pass', name: "Medicine Ball Chest Pass", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders', 'arms'], equipment: 'Medicine Ball', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'medicine_ball_full_twist', name: "Medicine Ball Full Twist", primaryMuscleGroup: 'core', secondaryMuscleGroups: ['shoulders'], equipment: 'Medicine Ball', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'medicine_ball_scoop_throw', name: "Medicine Ball Scoop Throw", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['core', 'legs'], equipment: 'Medicine Ball', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'middle_back_shrug', name: "Middle Back Shrug", primaryMuscleGroup: 'back', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'middle_back_stretch', name: "Middle Back Stretch", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['core'], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'mixed_grip_chin', name: "Mixed Grip Chin", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms'], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'monster_walk', name: "Monster Walk", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Band', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'mountain_climbers', name: "Mountain Climbers", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['chest', 'shoulders'], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'moving_claw_series', name: "Moving Claw Series", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'muscle_snatch', name: "Muscle Snatch", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['back', 'shoulders', 'arms'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'muscle_up', name: "Muscle Up", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['core', 'arms', 'shoulders'], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'narrow_stance_hack_squats', name: "Narrow Stance Hack Squats", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Machine', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'narrow_stance_leg_press', name: "Narrow Stance Leg Press", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Machine', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'narrow_stance_squats', name: "Narrow Stance Squats", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['back'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'natural_glute_ham_raise', name: "Natural Glute Ham Raise", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['back'], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'neck_smr', name: "Neck-SMR", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Other', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'neck_press', name: "Neck Press", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders', 'arms'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'oblique_crunches', name: "Oblique Crunches", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'isolation', trackingType: 'bodyweight', isCustom: false },
      { id: 'oblique_crunches_on_the_floor', name: "Oblique Crunches - On The Floor", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'isolation', trackingType: 'bodyweight', isCustom: false },
      { id: 'olympic_squat', name: "Olympic Squat", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'on_your_back_quad_stretch', name: "On-Your-Back Quad Stretch", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Other', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'on_your_side_quad_stretch', name: "On Your Side Quad Stretch", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'one_arm_dumbbell_row', name: "One-Arm Dumbbell Row", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms', 'shoulders'], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'one_arm_flat_bench_dumbbell_flye', name: "One-Arm Flat Bench Dumbbell Flye", primaryMuscleGroup: 'chest', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'one_arm_high_pulley_cable_side_bends', name: "One-Arm High-Pulley Cable Side Bends", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'one_arm_incline_lateral_raise', name: "One-Arm Incline Lateral Raise", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'one_arm_kettlebell_clean', name: "One-Arm Kettlebell Clean", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['back', 'shoulders'], equipment: 'Kettlebell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'one_arm_kettlebell_clean_and_jerk', name: "One-Arm Kettlebell Clean and Jerk", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Kettlebell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'one_arm_kettlebell_floor_press', name: "One-Arm Kettlebell Floor Press", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['arms'], equipment: 'Kettlebell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'one_arm_kettlebell_jerk', name: "One-Arm Kettlebell Jerk", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['legs', 'arms'], equipment: 'Kettlebell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'one_arm_kettlebell_military_press_to_the_side', name: "One-Arm Kettlebell Military Press To The Side", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms'], equipment: 'Kettlebell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'one_arm_kettlebell_para_press', name: "One-Arm Kettlebell Para Press", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms'], equipment: 'Kettlebell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'one_arm_kettlebell_push_press', name: "One-Arm Kettlebell Push Press", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['legs', 'arms'], equipment: 'Kettlebell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'one_arm_kettlebell_row', name: "One-Arm Kettlebell Row", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms'], equipment: 'Kettlebell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'one_arm_kettlebell_snatch', name: "One-Arm Kettlebell Snatch", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['legs', 'back', 'arms'], equipment: 'Kettlebell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'one_arm_kettlebell_split_jerk', name: "One-Arm Kettlebell Split Jerk", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['legs', 'arms'], equipment: 'Kettlebell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'one_arm_kettlebell_split_snatch', name: "One-Arm Kettlebell Split Snatch", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['legs'], equipment: 'Kettlebell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'one_arm_kettlebell_swings', name: "One-Arm Kettlebell Swings", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['back', 'shoulders'], equipment: 'Kettlebell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'one_arm_long_bar_row', name: "One-Arm Long Bar Row", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'one_arm_medicine_ball_slam', name: "One-Arm Medicine Ball Slam", primaryMuscleGroup: 'core', secondaryMuscleGroups: ['back', 'shoulders'], equipment: 'Medicine Ball', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'one_arm_open_palm_kettlebell_clean', name: "One-Arm Open Palm Kettlebell Clean", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['arms', 'back', 'shoulders'], equipment: 'Kettlebell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'one_arm_overhead_kettlebell_squats', name: "One-Arm Overhead Kettlebell Squats", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['shoulders'], equipment: 'Kettlebell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'one_arm_side_deadlift', name: "One-Arm Side Deadlift", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['core', 'back'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'one_arm_side_laterals', name: "One-Arm Side Laterals", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'one_legged_cable_kickback', name: "One-Legged Cable Kickback", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'one_arm_against_wall', name: "One Arm Against Wall", primaryMuscleGroup: 'back', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'one_arm_chin_up', name: "One Arm Chin-Up", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms'], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'one_arm_dumbbell_bench_press', name: "One Arm Dumbbell Bench Press", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders', 'arms'], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'one_arm_dumbbell_preacher_curl', name: "One Arm Dumbbell Preacher Curl", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'one_arm_floor_press', name: "One Arm Floor Press", primaryMuscleGroup: 'arms', secondaryMuscleGroups: ['chest', 'shoulders'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'one_arm_lat_pulldown', name: "One Arm Lat Pulldown", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms'], equipment: 'Cable', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'one_arm_pronated_dumbbell_triceps_extension', name: "One Arm Pronated Dumbbell Triceps Extension", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'one_arm_supinated_dumbbell_triceps_extension', name: "One Arm Supinated Dumbbell Triceps Extension", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'one_half_locust', name: "One Half Locust", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['core', 'arms', 'chest'], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'one_handed_hang', name: "One Handed Hang", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms'], equipment: 'Other', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'one_knee_to_chest', name: "One Knee To Chest", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['back'], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'one_leg_barbell_squat', name: "One Leg Barbell Squat", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'open_palm_kettlebell_clean', name: "Open Palm Kettlebell Clean", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['back', 'shoulders'], equipment: 'Kettlebell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'otis_up', name: "Otis-Up", primaryMuscleGroup: 'core', secondaryMuscleGroups: ['chest', 'shoulders', 'arms'], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'overhead_cable_curl', name: "Overhead Cable Curl", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'overhead_lat', name: "Overhead Lat", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms'], equipment: 'Other', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'overhead_slam', name: "Overhead Slam", primaryMuscleGroup: 'back', secondaryMuscleGroups: [], equipment: 'Medicine Ball', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'overhead_squat', name: "Overhead Squat", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['core', 'back', 'shoulders', 'arms'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'overhead_stretch', name: "Overhead Stretch", primaryMuscleGroup: 'core', secondaryMuscleGroups: ['chest', 'arms', 'back'], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'overhead_triceps', name: "Overhead Triceps", primaryMuscleGroup: 'arms', secondaryMuscleGroups: ['back'], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'pallof_press_with_rotation', name: "Pallof Press With Rotation", primaryMuscleGroup: 'core', secondaryMuscleGroups: ['chest', 'shoulders', 'arms'], equipment: 'Cable', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'palms_down_dumbbell_wrist_curl_over_a_bench', name: "Palms-Down Dumbbell Wrist Curl Over A Bench", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'palms_down_wrist_curl_over_a_bench', name: "Palms-Down Wrist Curl Over A Bench", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Barbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'palms_up_barbell_wrist_curl_over_a_bench', name: "Palms-Up Barbell Wrist Curl Over A Bench", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Barbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'palms_up_dumbbell_wrist_curl_over_a_bench', name: "Palms-Up Dumbbell Wrist Curl Over A Bench", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'parallel_bar_dip', name: "Parallel Bar Dip", primaryMuscleGroup: 'arms', secondaryMuscleGroups: ['chest', 'shoulders'], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'pelvic_tilt_into_bridge', name: "Pelvic Tilt Into Bridge", primaryMuscleGroup: 'back', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'peroneals_smr', name: "Peroneals-SMR", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Foam Roller', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'peroneals_stretch', name: "Peroneals Stretch", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Other', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'physioball_hip_bridge', name: "Physioball Hip Bridge", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Exercise Ball', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'pin_presses', name: "Pin Presses", primaryMuscleGroup: 'arms', secondaryMuscleGroups: ['chest', 'back', 'shoulders'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'piriformis_smr', name: "Piriformis-SMR", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Foam Roller', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'plate_twist', name: "Plate Twist", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'platform_hamstring_slides', name: "Platform Hamstring Slides", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Other', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'plie_dumbbell_squat', name: "Plie Dumbbell Squat", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['core'], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'plyo_kettlebell_pushups', name: "Plyo Kettlebell Pushups", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders', 'arms'], equipment: 'Kettlebell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'plyo_push_up', name: "Plyo Push-up", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders', 'arms'], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'posterior_tibialis_stretch', name: "Posterior Tibialis Stretch", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Other', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'power_clean', name: "Power Clean", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['arms', 'back', 'shoulders'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'power_clean_from_blocks', name: "Power Clean from Blocks", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'power_jerk', name: "Power Jerk", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['core', 'shoulders', 'arms'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'power_partials', name: "Power Partials", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'power_snatch', name: "Power Snatch", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['back', 'shoulders', 'arms'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'power_snatch_from_blocks', name: "Power Snatch from Blocks", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['arms', 'back', 'shoulders'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'power_stairs', name: "Power Stairs", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['back', 'shoulders'], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'preacher_hammer_dumbbell_curl', name: "Preacher Hammer Dumbbell Curl", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'press_sit_up', name: "Press Sit-Up", primaryMuscleGroup: 'core', secondaryMuscleGroups: ['chest', 'shoulders', 'arms'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'prone_manual_hamstring', name: "Prone Manual Hamstring", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'isolation', trackingType: 'bodyweight', isCustom: false },
      { id: 'prowler_sprint', name: "Prowler Sprint", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['chest', 'shoulders'], equipment: 'Other', category: 'cardio', trackingType: 'time', isCustom: false },
      { id: 'pull_through', name: "Pull Through", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['back'], equipment: 'Cable', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'pullups', name: "Pullups", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms'], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'push_up_wide', name: "Push-Up Wide", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['core', 'shoulders', 'arms'], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'push_ups_close_triceps_position', name: "Push-Ups - Close Triceps Position", primaryMuscleGroup: 'arms', secondaryMuscleGroups: ['chest', 'shoulders'], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'push_ups_with_feet_elevated', name: "Push-Ups With Feet Elevated", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders', 'arms'], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'push_ups_with_feet_on_an_exercise_ball', name: "Push-Ups With Feet On An Exercise Ball", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders', 'arms'], equipment: 'Exercise Ball', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'push_press_behind_the_neck', name: "Push Press - Behind the Neck", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['legs', 'arms'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'push_up_to_side_plank', name: "Push Up to Side Plank", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['core', 'shoulders', 'arms'], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'pushups', name: "Pushups", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders', 'arms'], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'pushups_close_and_wide_hand_positions', name: "Pushups (Close and Wide Hand Positions)", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders', 'arms'], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'pyramid', name: "Pyramid", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['shoulders'], equipment: 'Exercise Ball', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'quad_stretch', name: "Quad Stretch", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Other', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'quadriceps_smr', name: "Quadriceps-SMR", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Foam Roller', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'quick_leap', name: "Quick Leap", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'rack_delivery', name: "Rack Delivery", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms', 'back'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'rack_pull_with_bands', name: "Rack Pull with Bands", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms', 'legs'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'rack_pulls', name: "Rack Pulls", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms', 'legs'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'rear_leg_raises', name: "Rear Leg Raises", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'recumbent_bike', name: "Recumbent Bike", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Machine', category: 'cardio', trackingType: 'time', isCustom: false },
      { id: 'return_push_from_stance', name: "Return Push from Stance", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['chest', 'arms'], equipment: 'Medicine Ball', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'reverse_band_bench_press', name: "Reverse Band Bench Press", primaryMuscleGroup: 'arms', secondaryMuscleGroups: ['chest', 'back', 'shoulders'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'reverse_band_box_squat', name: "Reverse Band Box Squat", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['arms', 'back'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'reverse_band_deadlift', name: "Reverse Band Deadlift", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['legs'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'reverse_band_power_squat', name: "Reverse Band Power Squat", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['back'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'reverse_band_sumo_deadlift', name: "Reverse Band Sumo Deadlift", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['arms', 'back'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'reverse_barbell_curl', name: "Reverse Barbell Curl", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Barbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'reverse_barbell_preacher_curls', name: "Reverse Barbell Preacher Curls", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'EZ Bar', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'reverse_cable_curl', name: "Reverse Cable Curl", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'reverse_flyes', name: "Reverse Flyes", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'reverse_flyes_with_external_rotation', name: "Reverse Flyes With External Rotation", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'reverse_grip_bent_over_rows', name: "Reverse Grip Bent-Over Rows", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms', 'shoulders'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'reverse_grip_triceps_pushdown', name: "Reverse Grip Triceps Pushdown", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'reverse_hyperextension', name: "Reverse Hyperextension", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Machine', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'reverse_machine_flyes', name: "Reverse Machine Flyes", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Machine', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'reverse_plate_curls', name: "Reverse Plate Curls", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Other', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'reverse_triceps_bench_press', name: "Reverse Triceps Bench Press", primaryMuscleGroup: 'arms', secondaryMuscleGroups: ['chest', 'shoulders'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'rhomboids_smr', name: "Rhomboids-SMR", primaryMuscleGroup: 'back', secondaryMuscleGroups: [], equipment: 'Foam Roller', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'rickshaw_carry', name: "Rickshaw Carry", primaryMuscleGroup: 'arms', secondaryMuscleGroups: ['core', 'legs', 'back'], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'rickshaw_deadlift', name: "Rickshaw Deadlift", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['arms', 'back'], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'ring_dips', name: "Ring Dips", primaryMuscleGroup: 'arms', secondaryMuscleGroups: ['chest', 'shoulders'], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'rocket_jump', name: "Rocket Jump", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'rocking_standing_calf_raise', name: "Rocking Standing Calf Raise", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Barbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'rocky_pull_ups_pulldowns', name: "Rocky Pull-Ups/Pulldowns", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms', 'shoulders'], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'romanian_deadlift_from_deficit', name: "Romanian Deadlift from Deficit", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['arms', 'back'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'rope_climb', name: "Rope Climb", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms', 'shoulders'], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'rope_crunch', name: "Rope Crunch", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'rope_jumping', name: "Rope Jumping", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Other', category: 'cardio', trackingType: 'time', isCustom: false },
      { id: 'rope_straight_arm_pulldown', name: "Rope Straight-Arm Pulldown", primaryMuscleGroup: 'back', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'round_the_world_shoulder_stretch', name: "Round The World Shoulder Stretch", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms', 'chest'], equipment: 'Other', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'rowing_stationary', name: "Rowing, Stationary", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['arms', 'back'], equipment: 'Machine', category: 'cardio', trackingType: 'time', isCustom: false },
      { id: 'runner_s_stretch', name: "Runner\'s Stretch", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'running_treadmill', name: "Running, Treadmill", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Machine', category: 'cardio', trackingType: 'time', isCustom: false },
      { id: 'sandbag_load', name: "Sandbag Load", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['core', 'arms', 'back', 'shoulders'], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'scapular_pull_up', name: "Scapular Pull-Up", primaryMuscleGroup: 'back', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'isolation', trackingType: 'bodyweight', isCustom: false },
      { id: 'scissor_kick', name: "Scissor Kick", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'scissors_jump', name: "Scissors Jump", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'seated_band_hamstring_curl', name: "Seated Band Hamstring Curl", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Other', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'seated_barbell_military_press', name: "Seated Barbell Military Press", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'seated_barbell_twist', name: "Seated Barbell Twist", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Barbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'seated_bent_over_one_arm_dumbbell_triceps_extension', name: "Seated Bent-Over One-Arm Dumbbell Triceps Extension", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'seated_bent_over_rear_delt_raise', name: "Seated Bent-Over Rear Delt Raise", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'seated_bent_over_two_arm_dumbbell_triceps_extension', name: "Seated Bent-Over Two-Arm Dumbbell Triceps Extension", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'seated_biceps', name: "Seated Biceps", primaryMuscleGroup: 'arms', secondaryMuscleGroups: ['chest', 'shoulders'], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'seated_cable_rows', name: "Seated Cable Rows", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms', 'shoulders'], equipment: 'Cable', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'seated_cable_shoulder_press', name: "Seated Cable Shoulder Press", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms'], equipment: 'Cable', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'seated_calf_stretch', name: "Seated Calf Stretch", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['back'], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'seated_close_grip_concentration_barbell_curl', name: "Seated Close-Grip Concentration Barbell Curl", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Barbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'seated_dumbbell_curl', name: "Seated Dumbbell Curl", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'seated_dumbbell_inner_biceps_curl', name: "Seated Dumbbell Inner Biceps Curl", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'seated_dumbbell_palms_down_wrist_curl', name: "Seated Dumbbell Palms-Down Wrist Curl", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'seated_dumbbell_palms_up_wrist_curl', name: "Seated Dumbbell Palms-Up Wrist Curl", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'seated_dumbbell_press', name: "Seated Dumbbell Press", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms'], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'seated_flat_bench_leg_pull_in', name: "Seated Flat Bench Leg Pull-In", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'seated_floor_hamstring_stretch', name: "Seated Floor Hamstring Stretch", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'seated_front_deltoid', name: "Seated Front Deltoid", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['chest'], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'seated_glute', name: "Seated Glute", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'seated_good_mornings', name: "Seated Good Mornings", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['legs'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'seated_hamstring', name: "Seated Hamstring", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'seated_hamstring_and_calf_stretch', name: "Seated Hamstring and Calf Stretch", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Other', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'seated_head_harness_neck_resistance', name: "Seated Head Harness Neck Resistance", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Other', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'seated_leg_tucks', name: "Seated Leg Tucks", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'isolation', trackingType: 'bodyweight', isCustom: false },
      { id: 'seated_one_arm_dumbbell_palms_down_wrist_curl', name: "Seated One-Arm Dumbbell Palms-Down Wrist Curl", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'seated_one_arm_dumbbell_palms_up_wrist_curl', name: "Seated One-Arm Dumbbell Palms-Up Wrist Curl", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'seated_one_arm_cable_pulley_rows', name: "Seated One-arm Cable Pulley Rows", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms'], equipment: 'Cable', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'seated_overhead_stretch', name: "Seated Overhead Stretch", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'seated_palm_up_barbell_wrist_curl', name: "Seated Palm-Up Barbell Wrist Curl", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Barbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'seated_palms_down_barbell_wrist_curl', name: "Seated Palms-Down Barbell Wrist Curl", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Barbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'seated_side_lateral_raise', name: "Seated Side Lateral Raise", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'seated_triceps_press', name: "Seated Triceps Press", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'seated_two_arm_palms_up_low_pulley_wrist_curl', name: "Seated Two-Arm Palms-Up Low-Pulley Wrist Curl", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'see_saw_press_alternating_side_press', name: "See-Saw Press (Alternating Side Press)", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['core', 'arms'], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'shotgun_row', name: "Shotgun Row", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms'], equipment: 'Cable', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'shoulder_circles', name: "Shoulder Circles", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['back'], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'shoulder_press_with_bands', name: "Shoulder Press - With Bands", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms'], equipment: 'Band', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'shoulder_raise', name: "Shoulder Raise", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['back'], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'shoulder_stretch', name: "Shoulder Stretch", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'side_lying_floor_stretch', name: "Side-Lying Floor Stretch", primaryMuscleGroup: 'back', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'side_bridge', name: "Side Bridge", primaryMuscleGroup: 'core', secondaryMuscleGroups: ['shoulders'], equipment: 'Bodyweight', category: 'isolation', trackingType: 'bodyweight', isCustom: false },
      { id: 'side_hop_sprint', name: "Side Hop-Sprint", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'side_jackknife', name: "Side Jackknife", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'side_lateral_raise', name: "Side Lateral Raise", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'side_laterals_to_front_raise', name: "Side Laterals to Front Raise", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['back'], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'side_leg_raises', name: "Side Leg Raises", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'side_lying_groin_stretch', name: "Side Lying Groin Stretch", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'side_neck_stretch', name: "Side Neck Stretch", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'side_standing_long_jump', name: "Side Standing Long Jump", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'side_to_side_chins', name: "Side To Side Chins", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms', 'shoulders'], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'side_wrist_pull', name: "Side Wrist Pull", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms', 'back'], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'side_to_side_box_shuffle', name: "Side to Side Box Shuffle", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'single_arm_cable_crossover', name: "Single-Arm Cable Crossover", primaryMuscleGroup: 'chest', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'single_arm_linear_jammer', name: "Single-Arm Linear Jammer", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['chest', 'arms'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'single_arm_push_up', name: "Single-Arm Push-Up", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders', 'arms'], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'single_cone_sprint_drill', name: "Single-Cone Sprint Drill", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'single_leg_high_box_squat', name: "Single-Leg High Box Squat", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'single_leg_hop_progression', name: "Single-Leg Hop Progression", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'single_leg_lateral_hop', name: "Single-Leg Lateral Hop", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'single_leg_leg_extension', name: "Single-Leg Leg Extension", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Machine', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'single_leg_stride_jump', name: "Single-Leg Stride Jump", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'single_dumbbell_raise', name: "Single Dumbbell Raise", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms', 'back'], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'single_leg_butt_kick', name: "Single Leg Butt Kick", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'single_leg_glute_bridge', name: "Single Leg Glute Bridge", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'isolation', trackingType: 'bodyweight', isCustom: false },
      { id: 'single_leg_push_off', name: "Single Leg Push-off", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'sit_squats', name: "Sit Squats", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'skating', name: "Skating", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Other', category: 'cardio', trackingType: 'time', isCustom: false },
      { id: 'sled_drag_harness', name: "Sled Drag - Harness", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'sled_overhead_backward_walk', name: "Sled Overhead Backward Walk", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['legs', 'back'], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'sled_overhead_triceps_extension', name: "Sled Overhead Triceps Extension", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Other', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'sled_push', name: "Sled Push", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['chest', 'arms'], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'sled_reverse_flye', name: "Sled Reverse Flye", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Other', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'sled_row', name: "Sled Row", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms'], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'sledgehammer_swings', name: "Sledgehammer Swings", primaryMuscleGroup: 'core', secondaryMuscleGroups: ['legs', 'arms', 'back', 'shoulders'], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'smith_incline_shoulder_raise', name: "Smith Incline Shoulder Raise", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['chest'], equipment: 'Barbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'smith_machine_behind_the_back_shrug', name: "Smith Machine Behind the Back Shrug", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['shoulders'], equipment: 'Machine', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'smith_machine_bent_over_row', name: "Smith Machine Bent Over Row", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms', 'shoulders'], equipment: 'Machine', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'smith_machine_calf_raise', name: "Smith Machine Calf Raise", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Machine', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'smith_machine_close_grip_bench_press', name: "Smith Machine Close-Grip Bench Press", primaryMuscleGroup: 'arms', secondaryMuscleGroups: ['chest', 'shoulders'], equipment: 'Machine', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'smith_machine_decline_press', name: "Smith Machine Decline Press", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders', 'arms'], equipment: 'Machine', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'smith_machine_hang_power_clean', name: "Smith Machine Hang Power Clean", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['back', 'shoulders'], equipment: 'Machine', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'smith_machine_hip_raise', name: "Smith Machine Hip Raise", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Machine', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'smith_machine_incline_bench_press', name: "Smith Machine Incline Bench Press", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders', 'arms'], equipment: 'Machine', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'smith_machine_leg_press', name: "Smith Machine Leg Press", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Machine', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'smith_machine_one_arm_upright_row', name: "Smith Machine One-Arm Upright Row", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms', 'back'], equipment: 'Machine', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'smith_machine_overhead_shoulder_press', name: "Smith Machine Overhead Shoulder Press", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms'], equipment: 'Machine', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'smith_machine_pistol_squat', name: "Smith Machine Pistol Squat", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Machine', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'smith_machine_reverse_calf_raises', name: "Smith Machine Reverse Calf Raises", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Machine', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'smith_machine_stiff_legged_deadlift', name: "Smith Machine Stiff-Legged Deadlift", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['back'], equipment: 'Machine', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'smith_machine_upright_row', name: "Smith Machine Upright Row", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms', 'shoulders'], equipment: 'Machine', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'smith_single_leg_split_squat', name: "Smith Single-Leg Split Squat", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Machine', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'snatch', name: "Snatch", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['arms', 'back', 'shoulders'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'snatch_balance', name: "Snatch Balance", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['shoulders', 'arms'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'snatch_deadlift', name: "Snatch Deadlift", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['arms', 'back'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'snatch_pull', name: "Snatch Pull", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['back'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'snatch_shrug', name: "Snatch Shrug", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms', 'shoulders'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'snatch_from_blocks', name: "Snatch from Blocks", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['arms', 'back', 'shoulders'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'speed_band_overhead_triceps', name: "Speed Band Overhead Triceps", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Band', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'speed_box_squat', name: "Speed Box Squat", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'speed_squats', name: "Speed Squats", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['back'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'spell_caster', name: "Spell Caster", primaryMuscleGroup: 'core', secondaryMuscleGroups: ['legs', 'shoulders'], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'spider_crawl', name: "Spider Crawl", primaryMuscleGroup: 'core', secondaryMuscleGroups: ['chest', 'shoulders', 'arms'], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'spinal_stretch', name: "Spinal Stretch", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['shoulders'], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'split_clean', name: "Split Clean", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['arms', 'back', 'shoulders'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'split_jerk', name: "Split Jerk", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['shoulders', 'arms'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'split_jump', name: "Split Jump", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'split_snatch', name: "Split Snatch", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['arms', 'back', 'shoulders'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'split_squat_with_dumbbells', name: "Split Squat with Dumbbells", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'split_squats', name: "Split Squats", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'squat_jerk', name: "Squat Jerk", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['shoulders', 'arms'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'squat_with_bands', name: "Squat with Bands", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['back'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'squat_with_chains', name: "Squat with Chains", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['back'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'squat_with_plate_movers', name: "Squat with Plate Movers", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'squats_with_bands', name: "Squats - With Bands", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['back'], equipment: 'Band', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'stairmaster', name: "Stairmaster", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Machine', category: 'cardio', trackingType: 'time', isCustom: false },
      { id: 'standing_alternating_dumbbell_press', name: "Standing Alternating Dumbbell Press", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms'], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'standing_barbell_calf_raise', name: "Standing Barbell Calf Raise", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Barbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'standing_barbell_press_behind_neck', name: "Standing Barbell Press Behind Neck", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'standing_bent_over_one_arm_dumbbell_triceps_extension', name: "Standing Bent-Over One-Arm Dumbbell Triceps Extension", primaryMuscleGroup: 'arms', secondaryMuscleGroups: ['shoulders'], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'standing_bent_over_two_arm_dumbbell_triceps_extension', name: "Standing Bent-Over Two-Arm Dumbbell Triceps Extension", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'standing_biceps_cable_curl', name: "Standing Biceps Cable Curl", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'standing_biceps_stretch', name: "Standing Biceps Stretch", primaryMuscleGroup: 'arms', secondaryMuscleGroups: ['chest', 'shoulders'], equipment: 'Other', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'standing_bradford_press', name: "Standing Bradford Press", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'standing_cable_chest_press', name: "Standing Cable Chest Press", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders', 'arms'], equipment: 'Cable', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'standing_cable_lift', name: "Standing Cable Lift", primaryMuscleGroup: 'core', secondaryMuscleGroups: ['shoulders'], equipment: 'Cable', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'standing_cable_wood_chop', name: "Standing Cable Wood Chop", primaryMuscleGroup: 'core', secondaryMuscleGroups: ['shoulders'], equipment: 'Cable', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'standing_calf_raises', name: "Standing Calf Raises", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Machine', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'standing_concentration_curl', name: "Standing Concentration Curl", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'standing_dumbbell_calf_raise', name: "Standing Dumbbell Calf Raise", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'standing_dumbbell_press', name: "Standing Dumbbell Press", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms'], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'standing_dumbbell_reverse_curl', name: "Standing Dumbbell Reverse Curl", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'standing_dumbbell_straight_arm_front_delt_raise_above_head', name: "Standing Dumbbell Straight-Arm Front Delt Raise Above Head", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'standing_dumbbell_triceps_extension', name: "Standing Dumbbell Triceps Extension", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'standing_dumbbell_upright_row', name: "Standing Dumbbell Upright Row", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms', 'shoulders'], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'standing_elevated_quad_stretch', name: "Standing Elevated Quad Stretch", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Other', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'standing_front_barbell_raise_over_head', name: "Standing Front Barbell Raise Over Head", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: [], equipment: 'Barbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'standing_gastrocnemius_calf_stretch', name: "Standing Gastrocnemius Calf Stretch", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'standing_hamstring_and_calf_stretch', name: "Standing Hamstring and Calf Stretch", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Other', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'standing_hip_circles', name: "Standing Hip Circles", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'standing_hip_flexors', name: "Standing Hip Flexors", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'standing_inner_biceps_curl', name: "Standing Inner-Biceps Curl", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'standing_lateral_stretch', name: "Standing Lateral Stretch", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'standing_leg_curl', name: "Standing Leg Curl", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Machine', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'standing_long_jump', name: "Standing Long Jump", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'standing_low_pulley_deltoid_raise', name: "Standing Low-Pulley Deltoid Raise", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms'], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'standing_low_pulley_one_arm_triceps_extension', name: "Standing Low-Pulley One-Arm Triceps Extension", primaryMuscleGroup: 'arms', secondaryMuscleGroups: ['chest', 'shoulders'], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'standing_military_press', name: "Standing Military Press", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'standing_olympic_plate_hand_squeeze', name: "Standing Olympic Plate Hand Squeeze", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Other', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'standing_one_arm_cable_curl', name: "Standing One-Arm Cable Curl", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'standing_one_arm_dumbbell_curl_over_incline_bench', name: "Standing One-Arm Dumbbell Curl Over Incline Bench", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'standing_one_arm_dumbbell_triceps_extension', name: "Standing One-Arm Dumbbell Triceps Extension", primaryMuscleGroup: 'arms', secondaryMuscleGroups: ['chest', 'shoulders'], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'standing_overhead_barbell_triceps_extension', name: "Standing Overhead Barbell Triceps Extension", primaryMuscleGroup: 'arms', secondaryMuscleGroups: ['shoulders'], equipment: 'Barbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'standing_palm_in_one_arm_dumbbell_press', name: "Standing Palm-In One-Arm Dumbbell Press", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms'], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'standing_palms_in_dumbbell_press', name: "Standing Palms-In Dumbbell Press", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms'], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'standing_palms_up_barbell_behind_the_back_wrist_curl', name: "Standing Palms-Up Barbell Behind The Back Wrist Curl", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Barbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'standing_pelvic_tilt', name: "Standing Pelvic Tilt", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['legs'], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'standing_rope_crunch', name: "Standing Rope Crunch", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'standing_soleus_and_achilles_stretch', name: "Standing Soleus And Achilles Stretch", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'standing_toe_touches', name: "Standing Toe Touches", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'standing_towel_triceps_extension', name: "Standing Towel Triceps Extension", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'isolation', trackingType: 'bodyweight', isCustom: false },
      { id: 'standing_two_arm_overhead_throw', name: "Standing Two-Arm Overhead Throw", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['chest', 'back'], equipment: 'Medicine Ball', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'star_jump', name: "Star Jump", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['shoulders'], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'step_up_with_knee_raise', name: "Step-up with Knee Raise", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'step_mill', name: "Step Mill", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Machine', category: 'cardio', trackingType: 'time', isCustom: false },
      { id: 'stiff_legged_barbell_deadlift', name: "Stiff-Legged Barbell Deadlift", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['back'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'stiff_legged_dumbbell_deadlift', name: "Stiff-Legged Dumbbell Deadlift", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['back'], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'stiff_leg_barbell_good_morning', name: "Stiff Leg Barbell Good Morning", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['legs'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'stomach_vacuum', name: "Stomach Vacuum", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'straight_arm_dumbbell_pullover', name: "Straight-Arm Dumbbell Pullover", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['back', 'shoulders', 'arms'], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'straight_bar_bench_mid_rows', name: "Straight Bar Bench Mid Rows", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'straight_raises_on_incline_bench', name: "Straight Raises on Incline Bench", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['back'], equipment: 'Barbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'stride_jump_crossover', name: "Stride Jump Crossover", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'sumo_deadlift_with_bands', name: "Sumo Deadlift with Bands", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['arms', 'back'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'sumo_deadlift_with_chains', name: "Sumo Deadlift with Chains", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['arms', 'back'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'superman', name: "Superman", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['legs'], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'supine_chest_throw', name: "Supine Chest Throw", primaryMuscleGroup: 'arms', secondaryMuscleGroups: ['chest', 'shoulders'], equipment: 'Medicine Ball', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'supine_one_arm_overhead_throw', name: "Supine One-Arm Overhead Throw", primaryMuscleGroup: 'core', secondaryMuscleGroups: ['chest', 'back', 'shoulders'], equipment: 'Medicine Ball', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'supine_two_arm_overhead_throw', name: "Supine Two-Arm Overhead Throw", primaryMuscleGroup: 'core', secondaryMuscleGroups: ['chest', 'back', 'shoulders'], equipment: 'Medicine Ball', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'suspended_fallout', name: "Suspended Fallout", primaryMuscleGroup: 'core', secondaryMuscleGroups: ['chest', 'back', 'shoulders'], equipment: 'Other', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'suspended_push_up', name: "Suspended Push-Up", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders', 'arms'], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'suspended_reverse_crunch', name: "Suspended Reverse Crunch", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Other', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'suspended_row', name: "Suspended Row", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms'], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'suspended_split_squat', name: "Suspended Split Squat", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 't_bar_row_with_handle', name: "T-Bar Row with Handle", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'tate_press', name: "Tate Press", primaryMuscleGroup: 'arms', secondaryMuscleGroups: ['chest', 'shoulders'], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'the_straddle', name: "The Straddle", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'thigh_abductor', name: "Thigh Abductor", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Machine', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'thigh_adductor', name: "Thigh Adductor", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Machine', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'tire_flip', name: "Tire Flip", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['chest', 'arms', 'back', 'shoulders'], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'toe_touchers', name: "Toe Touchers", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'torso_rotation', name: "Torso Rotation", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Exercise Ball', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'trail_running_walking', name: "Trail Running/Walking", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'cardio', trackingType: 'time', isCustom: false },
      { id: 'tricep_dumbbell_kickback', name: "Tricep Dumbbell Kickback", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'tricep_side_stretch', name: "Tricep Side Stretch", primaryMuscleGroup: 'arms', secondaryMuscleGroups: ['shoulders'], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'triceps_overhead_extension_with_rope', name: "Triceps Overhead Extension with Rope", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'triceps_pushdown', name: "Triceps Pushdown", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'triceps_pushdown_rope_attachment', name: "Triceps Pushdown - Rope Attachment", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'triceps_pushdown_v_bar_attachment', name: "Triceps Pushdown - V-Bar Attachment", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Cable', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'triceps_stretch', name: "Triceps Stretch", primaryMuscleGroup: 'arms', secondaryMuscleGroups: ['back'], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'tuck_crunch', name: "Tuck Crunch", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'isolation', trackingType: 'bodyweight', isCustom: false },
      { id: 'two_arm_dumbbell_preacher_curl', name: "Two-Arm Dumbbell Preacher Curl", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'two_arm_kettlebell_clean', name: "Two-Arm Kettlebell Clean", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['legs', 'back'], equipment: 'Kettlebell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'two_arm_kettlebell_jerk', name: "Two-Arm Kettlebell Jerk", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['legs', 'arms'], equipment: 'Kettlebell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'two_arm_kettlebell_military_press', name: "Two-Arm Kettlebell Military Press", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['arms'], equipment: 'Kettlebell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'two_arm_kettlebell_row', name: "Two-Arm Kettlebell Row", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms'], equipment: 'Kettlebell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'underhand_cable_pulldowns', name: "Underhand Cable Pulldowns", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms', 'shoulders'], equipment: 'Cable', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'upper_back_leg_grab', name: "Upper Back-Leg Grab", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['back'], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'upper_back_stretch', name: "Upper Back Stretch", primaryMuscleGroup: 'back', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'upright_barbell_row', name: "Upright Barbell Row", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['back'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'upright_cable_row', name: "Upright Cable Row", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['shoulders'], equipment: 'Cable', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'upright_row_with_bands', name: "Upright Row - With Bands", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['shoulders'], equipment: 'Band', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'upward_stretch', name: "Upward Stretch", primaryMuscleGroup: 'shoulders', secondaryMuscleGroups: ['chest', 'back'], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'v_bar_pulldown', name: "V-Bar Pulldown", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms', 'shoulders'], equipment: 'Cable', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'v_bar_pullup', name: "V-Bar Pullup", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms', 'shoulders'], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'vertical_swing', name: "Vertical Swing", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['shoulders'], equipment: 'Dumbbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'walking_treadmill', name: "Walking, Treadmill", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Machine', category: 'cardio', trackingType: 'time', isCustom: false },
      { id: 'weighted_ball_hyperextension', name: "Weighted Ball Hyperextension", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['legs'], equipment: 'Exercise Ball', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'weighted_ball_side_bend', name: "Weighted Ball Side Bend", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Exercise Ball', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'weighted_bench_dip', name: "Weighted Bench Dip", primaryMuscleGroup: 'arms', secondaryMuscleGroups: ['chest', 'shoulders'], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'weighted_crunches', name: "Weighted Crunches", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Medicine Ball', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'weighted_jump_squat', name: "Weighted Jump Squat", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['back'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'weighted_pull_ups', name: "Weighted Pull Ups", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms'], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'weighted_sissy_squat', name: "Weighted Sissy Squat", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'weighted_sit_ups_with_bands', name: "Weighted Sit-Ups - With Bands", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Other', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'weighted_squat', name: "Weighted Squat", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'wide_grip_barbell_bench_press', name: "Wide-Grip Barbell Bench Press", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders', 'arms'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'wide_grip_decline_barbell_bench_press', name: "Wide-Grip Decline Barbell Bench Press", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders', 'arms'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'wide_grip_decline_barbell_pullover', name: "Wide-Grip Decline Barbell Pullover", primaryMuscleGroup: 'chest', secondaryMuscleGroups: ['shoulders', 'arms'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'wide_grip_lat_pulldown', name: "Wide-Grip Lat Pulldown", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms', 'shoulders'], equipment: 'Cable', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'wide_grip_pulldown_behind_the_neck', name: "Wide-Grip Pulldown Behind The Neck", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms', 'shoulders'], equipment: 'Cable', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'wide_grip_rear_pull_up', name: "Wide-Grip Rear Pull-Up", primaryMuscleGroup: 'back', secondaryMuscleGroups: ['arms', 'shoulders'], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'wide_grip_standing_barbell_curl', name: "Wide-Grip Standing Barbell Curl", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Barbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'wide_stance_barbell_squat', name: "Wide Stance Barbell Squat", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['back'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'wide_stance_stiff_legs', name: "Wide Stance Stiff Legs", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['back'], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'wind_sprints', name: "Wind Sprints", primaryMuscleGroup: 'core', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'compound', trackingType: 'bodyweight', isCustom: false },
      { id: 'windmills', name: "Windmills", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['back'], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'world_s_greatest_stretch', name: "World\'s Greatest Stretch", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'wrist_circles', name: "Wrist Circles", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Bodyweight', category: 'stretch', trackingType: 'time', isCustom: false },
      { id: 'wrist_roller', name: "Wrist Roller", primaryMuscleGroup: 'arms', secondaryMuscleGroups: ['shoulders'], equipment: 'Other', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'wrist_rotations_with_straight_bar', name: "Wrist Rotations with Straight Bar", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Barbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
      { id: 'yoke_walk', name: "Yoke Walk", primaryMuscleGroup: 'legs', secondaryMuscleGroups: ['core', 'back'], equipment: 'Other', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'zercher_squats', name: "Zercher Squats", primaryMuscleGroup: 'legs', secondaryMuscleGroups: [], equipment: 'Barbell', category: 'compound', trackingType: 'weight_reps', isCustom: false },
      { id: 'zottman_preacher_curl', name: "Zottman Preacher Curl", primaryMuscleGroup: 'arms', secondaryMuscleGroups: [], equipment: 'Dumbbell', category: 'isolation', trackingType: 'weight_reps', isCustom: false },
    ];
  }

  // In-memory cache: the exercise list is read in tight render loops, so we parse
  // localStorage once per session and back lookups with an id→exercise Map.
  let _exCache = null, _exById = null;
  function _cacheExercises(list) { _exCache = list; _exById = new Map(list.map(e => [e.id, e])); return list; }
  function _invalidateExercises() { _exCache = null; _exById = null; }

  function getExercises() {
    if (_exCache) return _exCache;
    const defaults = getDefaultExercises();
    let stored = get('exercises');
    if (!stored || !stored.length) {
      set('exercises', defaults);
      return _cacheExercises(defaults);
    }
    // Merge in any built-in exercises shipped in a newer version, while keeping
    // the user's custom exercises and any edits/soft-deletes to existing ones.
    const ids = new Set(stored.map(e => e.id));
    const added = defaults.filter(d => !ids.has(d.id));
    if (added.length) {
      stored = stored.concat(added);
      set('exercises', stored);
    }
    return _cacheExercises(stored);
  }
  function getExerciseById(id) {
    if (!_exById) getExercises();
    return _exById.get(id) || null;
  }
  function saveExercise(ex) {
    const list = getExercises();
    const idx = list.findIndex(e => e.id === ex.id);
    if (idx >= 0) { list[idx] = ex; }
    else { ex.id = ex.id || uid(); ex.isCustom = true; list.push(ex); }
    set('exercises', list);
    _invalidateExercises();
    return ex;
  }
  function deleteExercise(id) {
    const ex = getExerciseById(id);
    if (!ex || !ex.isCustom) return;
    ex.deleted = true;
    saveExercise(ex);
  }

  function getRoutines() { return get('routines') || []; }
  function getRoutineById(id) { return getRoutines().find(r => r.id === id) || null; }
  function saveRoutine(routine) {
    const list = getRoutines();
    const idx = list.findIndex(r => r.id === routine.id);
    if (idx >= 0) { list[idx] = routine; }
    else { routine.id = routine.id || uid(); routine.createdAt = new Date().toISOString(); list.push(routine); }
    set('routines', list);
    return routine;
  }
  function deleteRoutine(id) { set('routines', getRoutines().filter(r => r.id !== id)); }

  function getSchedule() {
    return get('schedule') || { MON: null, TUE: null, WED: null, THU: null, FRI: null, SAT: null, SUN: null };
  }
  function saveSchedule(sched) { set('schedule', sched); }

  function getWorkouts() { return get('workouts') || []; }
  function getWorkoutById(id) { return getWorkouts().find(w => w.id === id) || null; }
  function saveWorkout(w) {
    const list = getWorkouts();
    const idx = list.findIndex(x => x.id === w.id);
    if (idx >= 0) { w.isEdited = true; list[idx] = w; }
    else { w.id = w.id || uid(); list.unshift(w); }
    set('workouts', list);
    _updateStreak(list);
    return w;
  }
  function deleteWorkout(id) {
    const list = getWorkouts().filter(w => w.id !== id);
    set('workouts', list);
    _updateStreak(list);
  }

  function _updateStreak(workouts) {
    const user = getUser();
    const target = user ? (user.weeklyTargetWorkouts || 3) : 3;
    const weekMap = {};
    workouts.forEach(w => {
      const wk = getWeekKey(new Date(w.startedAt));
      weekMap[wk] = (weekMap[wk] || 0) + 1;
    });
    const todayWk = getWeekKey(new Date());
    let cur = 0, longest = 0, checkWk = todayWk;
    for (let i = 0; i < 520; i++) {
      if ((weekMap[checkWk] || 0) >= target) { cur++; longest = Math.max(longest, cur); checkWk = getPrevWeekKey(checkWk); }
      else if (checkWk === todayWk) { checkWk = getPrevWeekKey(checkWk); }
      else { break; }
    }
    set('streak', {
      currentWeeklyStreak: cur,
      longestWeeklyStreak: longest,
      totalCompletedWorkouts: workouts.length,
      freezesAvailable: Math.floor(workouts.length / 10),
      lastWorkoutAt: workouts.length ? workouts[0].startedAt : null,
      currentWeekWorkouts: weekMap[todayWk] || 0,
      weeklyTarget: target
    });
  }

  function getStreak() {
    const s = get('streak');
    if (s) return s;
    _updateStreak(getWorkouts());
    return get('streak');
  }

  function getPRs() { return get('prs') || {}; }
  function checkAndUpdatePRs(workout) {
    const prs = getPRs();
    const newPRs = [];
    (workout.exercises || []).forEach(we => {
      const ex = getExerciseById(we.exerciseId);
      if (!ex) return;
      const ep = prs[we.exerciseId] || {};
      let exBestE1rm = ep.est1rm ? ep.est1rm.value : 0;
      let exBestWeight = ep.maxWeight ? ep.maxWeight.value : 0;
      let exNewE1rm = null, exNewWeight = null;
      (we.sets || []).filter(s => s.isCompleted).forEach(set => {
        if ((ex.trackingType === 'weight_reps' || ex.trackingType === 'bodyweight') && set.reps) {
          const w = set.weight || 0;
          if (w > 0 && w > exBestWeight) {
            exBestWeight = w;
            ep.maxWeight = { value: w, achievedAt: workout.startedAt, workoutId: workout.id };
            exNewWeight = { exerciseId: we.exerciseId, exerciseName: ex.name, type: 'max_weight', value: w };
          }
          if (w > 0) {
            const e1rm = Math.round(w * (1 + set.reps / 30) * 10) / 10;
            if (e1rm > exBestE1rm) {
              exBestE1rm = e1rm;
              ep.est1rm = { value: e1rm, achievedAt: workout.startedAt, workoutId: workout.id };
              exNewE1rm = { exerciseId: we.exerciseId, exerciseName: ex.name, type: 'est_1rm', value: e1rm };
            }
          }
        }
        if (ex.trackingType === 'time' && set.durationSec) {
          if (!ep.maxDuration || set.durationSec > ep.maxDuration.value) {
            ep.maxDuration = { value: set.durationSec, achievedAt: workout.startedAt, workoutId: workout.id };
            newPRs.push({ exerciseId: we.exerciseId, exerciseName: ex.name, type: 'max_duration', value: set.durationSec });
          }
        }
        if (ex.trackingType === 'distance' && set.distance) {
          if (!ep.maxDistance || set.distance > ep.maxDistance.value) {
            ep.maxDistance = { value: set.distance, achievedAt: workout.startedAt, workoutId: workout.id };
            newPRs.push({ exerciseId: we.exerciseId, exerciseName: ex.name, type: 'max_distance', value: set.distance });
          }
        }
      });
      if (exNewE1rm) newPRs.push(exNewE1rm);
      else if (exNewWeight) newPRs.push(exNewWeight);
      prs[we.exerciseId] = ep;
    });
    set('prs', prs);
    return newPRs;
  }

  function getBadges() { return get('badges') || []; }
  function checkAndUnlockBadges() {
    const badges = getBadges();
    const earned = new Set(badges.map(b => b.key));
    const streak = getStreak();
    const newBadges = [];
    const checks = [
      { key: 'first_win', label: 'First Win', icon: 'trophy', color: 'var(--amber)', condition: () => streak.totalCompletedWorkouts >= 1 },
      { key: 'workouts_10', label: '10 Workouts', icon: 'trophy', color: 'var(--ink-2)', condition: () => streak.totalCompletedWorkouts >= 10 },
      { key: 'workouts_25', label: '25 Workouts', icon: 'trophy', color: 'var(--ink-2)', condition: () => streak.totalCompletedWorkouts >= 25 },
      { key: 'workouts_50', label: '50 Workouts', icon: 'trophy', color: 'var(--red)', condition: () => streak.totalCompletedWorkouts >= 50 },
      { key: 'workouts_100', label: '100 Workouts', icon: 'trophy', color: 'var(--red)', condition: () => streak.totalCompletedWorkouts >= 100 },
      { key: 'streak_4wk', label: '4-Wk Streak', icon: 'flame', color: 'var(--warm)', condition: () => streak.currentWeeklyStreak >= 4 },
      { key: 'streak_8wk', label: '8-Wk Streak', icon: 'flame', color: 'var(--warm)', condition: () => streak.currentWeeklyStreak >= 8 },
      { key: 'streak_12wk', label: '12-Wk Streak', icon: 'flame', color: 'var(--warm)', condition: () => streak.currentWeeklyStreak >= 12 },
    ];
    checks.forEach(c => {
      if (!earned.has(c.key) && c.condition()) {
        const b = { key: c.key, label: c.label, icon: c.icon, color: c.color, unlockedAt: new Date().toISOString() };
        badges.push(b);
        newBadges.push(b);
        earned.add(c.key);
      }
    });
    if (newBadges.length) set('badges', badges);
    return newBadges;
  }

  function getActiveWorkout() { return get('active_workout'); }
  function saveActiveWorkout(w) { set('active_workout', w); }
  function clearActiveWorkout() { remove('active_workout'); }

  function getLastSessionNumbers(exerciseId) {
    const workouts = getWorkouts();
    for (const w of workouts) {
      const we = (w.exercises || []).find(e => e.exerciseId === exerciseId);
      if (we) {
        const done = (we.sets || []).filter(s => s.isCompleted);
        if (done.length) return done;
      }
    }
    return null;
  }

  function computeWeeklyVolume(weeks = 1) {
    const workouts = getWorkouts();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - weeks * 7);
    let vol = 0;
    workouts.filter(w => new Date(w.startedAt) >= cutoff).forEach(w => {
      (w.exercises || []).forEach(we => {
        (we.sets || []).filter(s => s.isCompleted).forEach(s => {
          if (s.weight && s.reps) vol += s.weight * s.reps;
        });
      });
    });
    return vol;
  }

  function getMuscleVolume(weeks = 4) {
    const workouts = getWorkouts();
    const exercises = getExercises();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - weeks * 7);
    const vol = { chest: 0, back: 0, shoulders: 0, arms: 0, legs: 0, core: 0 };
    const sgMap = { triceps:'arms', biceps:'arms', forearms:'arms', front_delts:'shoulders', side_delts:'shoulders', rear_delts:'shoulders', lats:'back', traps:'back', lower_back:'back', quads:'legs', hamstrings:'legs', glutes:'legs', calves:'legs', adductors:'legs', abs:'core', obliques:'core' };
    workouts.filter(w => new Date(w.startedAt) >= cutoff).forEach(w => {
      (w.exercises || []).forEach(we => {
        const ex = exercises.find(e => e.id === we.exerciseId);
        if (!ex) return;
        const sets = (we.sets || []).filter(s => s.isCompleted).length;
        if (sets === 0) return;
        const pm = ex.primaryMuscleGroup;
        if (vol[pm] !== undefined) vol[pm] += sets;
        (ex.secondaryMuscleGroups || []).forEach(sg => {
          const g = sgMap[sg] || sg;
          if (vol[g] !== undefined) vol[g] += sets * 0.5;
        });
      });
    });
    return vol;
  }

  function getLatestPR() {
    const prs = getPRs();
    const exercises = getExercises();
    let latest = null;
    const consider = (exName, rec, type) => {
      if (!rec) return;
      if (!latest || new Date(rec.achievedAt) > new Date(latest.achievedAt)) {
        latest = { exerciseName: exName, type, value: rec.value, achievedAt: rec.achievedAt };
      }
    };
    Object.entries(prs).forEach(([exId, ep]) => {
      const ex = exercises.find(e => e.id === exId);
      if (!ex) return;
      consider(ex.name, ep.est1rm, 'est_1rm');
      consider(ex.name, ep.maxDuration, 'max_duration');
      consider(ex.name, ep.maxDistance, 'max_distance');
    });
    return latest;
  }

  function computeTotalVolume() {
    return getWorkouts().reduce((sum, w) => {
      return sum + (w.exercises || []).reduce((ws, we) => {
        return ws + (we.sets || []).filter(s => s.isCompleted).reduce((ss, s) => ss + (s.weight || 0) * (s.reps || 0), 0);
      }, 0);
    }, 0);
  }

  function exportData() {
    return JSON.stringify({
      version: 1, exportedAt: new Date().toISOString(),
      user: getUser(), exercises: getExercises().filter(e => e.isCustom),
      routines: getRoutines(), schedule: getSchedule(),
      workouts: getWorkouts(), prs: getPRs(), badges: getBadges(),
      weightLog: getWeightLog()
    }, null, 2);
  }

  // Non-destructive import: merge another user's routines (and any custom
  // exercises they reference) into this device without touching existing data.
  // Accepts the same file produced by exportData(). Returns {ok, count} | {ok:false, error}.
  function importRoutines(json) {
    let d;
    try { d = JSON.parse(json); } catch (e) { return { ok: false, error: 'That file isn’t valid Kasrat data.' }; }
    const incoming = Array.isArray(d.routines) ? d.routines : null;
    if (!incoming || !incoming.length) return { ok: false, error: 'No routines found in this file.' };

    // De-dupe imported custom exercises against what's already here, by name.
    // Built-in exercises aren't in the file — their stable IDs resolve on their own.
    const byName = new Map(getExercises().map(e => [e.name.trim().toLowerCase(), e]));
    const idRemap = {};  // exerciseId in the file -> exerciseId on this device
    (Array.isArray(d.exercises) ? d.exercises : []).forEach(ex => {
      if (!ex || !ex.id || !ex.name) return;
      const key = ex.name.trim().toLowerCase();
      const match = byName.get(key);
      if (match) { idRemap[ex.id] = match.id; return; }   // already have this exercise
      const copy = { ...ex, id: uid(), isCustom: true };
      delete copy.deleted;
      saveExercise(copy);
      byName.set(key, copy);
      idRemap[ex.id] = copy.id;
    });

    const names = new Set(getRoutines().map(r => (r.name || '').trim().toLowerCase()));
    let count = 0;
    incoming.forEach(r => {
      if (!r || !Array.isArray(r.exercises)) return;
      const exercises = r.exercises.map(re => {
        const resolved = idRemap[re.exerciseId] || re.exerciseId;
        return getExerciseById(resolved) ? { ...re, exerciseId: resolved } : null;
      }).filter(Boolean);
      if (!exercises.length) return;
      // Keep a friend's "Push Day" distinct from yours instead of silently overlapping.
      let name = (r.name || 'Imported Routine').trim();
      if (names.has(name.toLowerCase())) {
        let n = 2;
        while (names.has(`${name} (${n})`.toLowerCase())) n++;
        name = `${name} (${n})`;
      }
      names.add(name.toLowerCase());
      saveRoutine({ id: null, name, exercises });
      count++;
    });
    return { ok: true, count };
  }

  function importData(json) {
    try {
      const d = JSON.parse(json);
      if (d.user) set('user', d.user);
      if (d.routines) set('routines', d.routines);
      if (d.schedule) set('schedule', d.schedule);
      if (d.workouts) { set('workouts', d.workouts); _updateStreak(d.workouts); }
      if (d.prs) set('prs', d.prs);
      if (d.badges) set('badges', d.badges);
      if (d.weightLog) set('weightLog', d.weightLog);
      if (d.exercises) {
        const defaults = getDefaultExercises();
        const customs = d.exercises.filter(e => e.isCustom);
        set('exercises', [...defaults, ...customs]);
        _invalidateExercises();
      }
      return true;
    } catch(e) { return false; }
  }

  return {
    uid,
    getUser, saveUser,
    isOnboarded, setOnboarded,
    getWeightLog, logWeight,
    getExercises, getExerciseById, saveExercise, deleteExercise,
    getRoutines, getRoutineById, saveRoutine, deleteRoutine,
    getSchedule, saveSchedule,
    getWorkouts, getWorkoutById, saveWorkout, deleteWorkout,
    getStreak,
    getPRs, checkAndUpdatePRs, getLatestPR,
    getBadges, checkAndUnlockBadges,
    getActiveWorkout, saveActiveWorkout, clearActiveWorkout,
    getLastSessionNumbers,
    computeWeeklyVolume, getMuscleVolume, computeTotalVolume,
    exportData, importData, importRoutines,
  };
})();
