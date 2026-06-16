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
    ];
  }

  function getExercises() {
    const stored = get('exercises');
    if (stored && stored.length) return stored;
    const defaults = getDefaultExercises();
    set('exercises', defaults);
    return defaults;
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
