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
    ];
  }

  function getExercises() {
    const defaults = getDefaultExercises();
    let stored = get('exercises');
    if (!stored || !stored.length) {
      set('exercises', defaults);
      return defaults;
    }
    // Merge in any built-in exercises shipped in a newer version, while keeping
    // the user's custom exercises and any edits/soft-deletes to existing ones.
    const ids = new Set(stored.map(e => e.id));
    const added = defaults.filter(d => !ids.has(d.id));
    if (added.length) {
      stored = stored.concat(added);
      set('exercises', stored);
    }
    return stored;
  }
  function getExerciseById(id) { return getExercises().find(e => e.id === id) || null; }
  function saveExercise(ex) {
    const list = getExercises();
    const idx = list.findIndex(e => e.id === ex.id);
    if (idx >= 0) { list[idx] = ex; }
    else { ex.id = ex.id || uid(); ex.isCustom = true; list.push(ex); }
    set('exercises', list);
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
    Object.entries(prs).forEach(([exId, ep]) => {
      const ex = exercises.find(e => e.id === exId);
      if (!ex) return;
      if (ep.est1rm) {
        if (!latest || new Date(ep.est1rm.achievedAt) > new Date(latest.achievedAt)) {
          latest = { exerciseName: ex.name, type: 'est 1RM', value: ep.est1rm.value, achievedAt: ep.est1rm.achievedAt };
        }
      }
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
      workouts: getWorkouts(), prs: getPRs(), badges: getBadges()
    }, null, 2);
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
      if (d.exercises) {
        const defaults = getDefaultExercises();
        const customs = d.exercises.filter(e => e.isCustom);
        set('exercises', [...defaults, ...customs]);
      }
      return true;
    } catch(e) { return false; }
  }

  return {
    uid,
    getUser, saveUser,
    isOnboarded, setOnboarded,
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
    exportData, importData,
  };
})();
