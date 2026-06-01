const todayKey = formatDateKey(new Date());
const storageKey = `discipline-console:${todayKey}`;
const calendarStorageKey = "discipline-console:calendar-goals";
const streakStorageKey = "discipline-console:streak";
const kpiStorageKey = "discipline-console:monthly-kpis";
const focusStorageKey = "discipline-console:focus-log";
const englishStorageKey = "discipline-console:english-learning";
const pythonStorageKey = "discipline-console:python-roadmap";
const thesisStorageKey = "discipline-console:thesis-tracker";

const defaultKpis = [
  { id: "englishHours", label: "English Learning Hours", unit: "hours", current: 0, target: 30, lastMonth: 20 },
  { id: "pythonHours", label: "Python Learning Hours", unit: "hours", current: 0, target: 30, lastMonth: 18 },
  { id: "thesisProgress", label: "Thesis Progress", unit: "%", current: 0, target: 100, lastMonth: 25 },
  { id: "workouts", label: "Workout Sessions", unit: "sessions", current: 0, target: 16, lastMonth: 10 },
  { id: "reading", label: "Reading Sessions", unit: "sessions", current: 0, target: 20, lastMonth: 12 }
];

const cefrLevels = ["A1", "A2", "B1", "B2", "C1", "C2"];
const defaultEnglishMetrics = [
  { id: "vocabulary", label: "Vocabulary Learned", unit: "words", value: 0 },
  { id: "listening", label: "Listening Hours", unit: "hours", value: 0 },
  { id: "speaking", label: "Speaking Hours", unit: "hours", value: 0 },
  { id: "reading", label: "Reading Hours", unit: "hours", value: 0 },
  { id: "writing", label: "Writing Hours", unit: "hours", value: 0 }
];

const defaultPythonModules = [
  { id: "fundamentals", title: "Python Fundamentals", progress: 0, hours: 0, notes: "" },
  { id: "oop", title: "OOP", progress: 0, hours: 0, notes: "" },
  { id: "dataStructures", title: "Data Structures", progress: 0, hours: 0, notes: "" },
  { id: "fileHandling", title: "File Handling", progress: 0, hours: 0, notes: "" },
  { id: "automation", title: "Automation", progress: 0, hours: 0, notes: "" },
  { id: "webDevelopment", title: "Web Development", progress: 0, hours: 0, notes: "" },
  { id: "dataAnalysis", title: "Data Analysis", progress: 0, hours: 0, notes: "" },
  { id: "machineLearning", title: "Machine Learning", progress: 0, hours: 0, notes: "" }
];

const defaultThesisStages = [
  { id: "proposal", title: "Proposal", done: false, notes: "" },
  { id: "chapter1", title: "Chapter 1", done: false, notes: "" },
  { id: "chapter2", title: "Chapter 2", done: false, notes: "" },
  { id: "chapter3", title: "Chapter 3", done: false, notes: "" },
  { id: "chapter4", title: "Chapter 4", done: false, notes: "" },
  { id: "chapter5", title: "Chapter 5", done: false, notes: "" },
  { id: "revision", title: "Revision", done: false, notes: "" },
  { id: "defensePrep", title: "Defense Preparation", done: false, notes: "" }
];

const defaultGoals = [
  {
    id: "english",
    title: "English Mastery",
    tone: "green",
    tasks: [
      { id: "read-listen", text: "Read or listen for 30 minutes" },
      { id: "speaking", text: "Speak out loud for 10 minutes" },
      { id: "technical-sentences", text: "Write 5 technical sentences" }
    ]
  },
  {
    id: "python",
    title: "Python Programming",
    tone: "blue",
    tasks: [
      { id: "coding-exercise", text: "Solve one coding exercise" },
      { id: "automation-code", text: "Review automation-related code" },
      { id: "new-concept", text: "Document one new concept" }
    ]
  },
  {
    id: "thesis",
    title: "Thesis Progress",
    tone: "amber",
    tasks: [
      { id: "section", text: "Write or revise one section" },
      { id: "paper", text: "Read one paper or reference" },
      { id: "research-action", text: "Record next research action" }
    ]
  },
  {
    id: "work",
    title: "Work Automation",
    tone: "steel",
    tasks: [
      { id: "line-check", text: "Check one automation issue or improvement" },
      { id: "fastener-process", text: "Review bolt and nut production data" },
      { id: "kaizen-note", text: "Write one practical kaizen note" }
    ]
  },
  {
    id: "discipline",
    title: "Health & Discipline",
    tone: "red",
    tasks: [
      { id: "exercise", text: "Exercise or stretch" },
      { id: "sleep-plan", text: "Sleep plan respected" },
      { id: "scrolling", text: "No unplanned scrolling block" }
    ]
  }
];

const defaultState = {
  goals: defaultGoals,
  tasks: {},
  health: {
    sleep: 0,
    water: 0,
    exercise: 0,
    sleepGoal: 7,
    waterGoal: 6,
    exerciseGoal: 30
  },
  focusBlocks: [
    { title: "Thesis writing", minutes: 90 },
    { title: "English practice", minutes: 45 },
    { title: "Python automation", minutes: 60 }
  ],
  notes: []
};

let state = loadState();
let calendarGoals = loadCalendarGoals();
let streakState = loadStreakState();
let kpiState = loadKpiState();
let focusLog = loadFocusLog();
let englishState = loadEnglishState();
let pythonRoadmap = loadPythonRoadmap();
let thesisState = loadThesisState();
let timerInterval = null;
let timerState = {
  mode: "focus25",
  secondsRemaining: 25 * 60,
  totalSeconds: 25 * 60,
  isRunning: false
};
let selectedCalendarDate = todayKey;
let calendarViewDate = new Date();

function loadState() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) return structuredClone(defaultState);

  try {
    const parsed = JSON.parse(saved);
    return normalizeState({ ...structuredClone(defaultState), ...parsed });
  } catch {
    return structuredClone(defaultState);
  }
}

function normalizeState(savedState) {
  const hasWorkBlock = savedState.goals.some((goal) => goal.id === "work");
  const goals = hasWorkBlock
    ? savedState.goals
    : [
        ...savedState.goals.filter((goal) => goal.id !== "discipline"),
        structuredClone(defaultGoals.find((goal) => goal.id === "work")),
        ...savedState.goals.filter((goal) => goal.id === "discipline")
      ];

  return {
    ...savedState,
    health: {
      ...structuredClone(defaultState.health),
      ...savedState.health
    },
    goals: goals.map((goal, goalIndex) => ({
      ...goal,
      id: goal.id || `goal-${goalIndex}-${Date.now()}`,
      tone: goal.tone || "blue",
      tasks: goal.tasks.map((task, taskIndex) => {
        if (typeof task === "string") {
          return { id: `task-${taskIndex}`, text: task };
        }

        return {
          id: task.id || `task-${taskIndex}`,
          text: task.text || "New daily action"
        };
      })
    }))
  };
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function loadCalendarGoals() {
  const saved = localStorage.getItem(calendarStorageKey);
  if (!saved) return {};

  try {
    return JSON.parse(saved);
  } catch {
    return {};
  }
}

function saveCalendarState() {
  localStorage.setItem(calendarStorageKey, JSON.stringify(calendarGoals));
}

function loadStreakState() {
  const saved = localStorage.getItem(streakStorageKey);
  const fallback = {
    current: 0,
    best: 0,
    completedDates: {}
  };

  if (!saved) return fallback;

  try {
    return {
      ...fallback,
      ...JSON.parse(saved)
    };
  } catch {
    return fallback;
  }
}

function saveStreakState() {
  localStorage.setItem(streakStorageKey, JSON.stringify(streakState));
}

function getMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function loadKpiState() {
  const saved = localStorage.getItem(kpiStorageKey);
  const fallback = {
    [getMonthKey()]: structuredClone(defaultKpis)
  };

  if (!saved) return fallback;

  try {
    const parsed = JSON.parse(saved);
    const monthKey = getMonthKey();
    return {
      ...parsed,
      [monthKey]: normalizeKpis(parsed[monthKey])
    };
  } catch {
    return fallback;
  }
}

function normalizeKpis(kpis) {
  if (!Array.isArray(kpis)) return structuredClone(defaultKpis);

  return defaultKpis.map((defaultKpi) => {
    const saved = kpis.find((kpi) => kpi.id === defaultKpi.id) || {};
    return {
      ...defaultKpi,
      ...saved,
      current: Number(saved.current ?? defaultKpi.current),
      target: Number(saved.target ?? defaultKpi.target),
      lastMonth: Number(saved.lastMonth ?? defaultKpi.lastMonth)
    };
  });
}

function saveKpiState() {
  localStorage.setItem(kpiStorageKey, JSON.stringify(kpiState));
}

function loadFocusLog() {
  const saved = localStorage.getItem(focusStorageKey);
  if (!saved) return {};

  try {
    return JSON.parse(saved);
  } catch {
    return {};
  }
}

function saveFocusLog() {
  localStorage.setItem(focusStorageKey, JSON.stringify(focusLog));
}

function loadEnglishState() {
  const fallback = {
    currentLevel: "A1",
    targetLevel: "B1",
    metricsByDate: {
      [todayKey]: structuredClone(defaultEnglishMetrics)
    }
  };
  const saved = localStorage.getItem(englishStorageKey);
  if (!saved) return fallback;

  try {
    const parsed = JSON.parse(saved);
    return {
      ...fallback,
      ...parsed,
      metricsByDate: {
        ...fallback.metricsByDate,
        ...parsed.metricsByDate,
        [todayKey]: normalizeEnglishMetrics(parsed.metricsByDate?.[todayKey])
      }
    };
  } catch {
    return fallback;
  }
}

function normalizeEnglishMetrics(metrics) {
  if (!Array.isArray(metrics)) return structuredClone(defaultEnglishMetrics);

  return defaultEnglishMetrics.map((defaultMetric) => {
    const saved = metrics.find((metric) => metric.id === defaultMetric.id) || {};
    return {
      ...defaultMetric,
      ...saved,
      value: Number(saved.value ?? defaultMetric.value)
    };
  });
}

function saveEnglishState() {
  localStorage.setItem(englishStorageKey, JSON.stringify(englishState));
}

function loadPythonRoadmap() {
  const saved = localStorage.getItem(pythonStorageKey);
  if (!saved) return structuredClone(defaultPythonModules);

  try {
    return normalizePythonRoadmap(JSON.parse(saved));
  } catch {
    return structuredClone(defaultPythonModules);
  }
}

function normalizePythonRoadmap(modules) {
  if (!Array.isArray(modules)) return structuredClone(defaultPythonModules);

  return defaultPythonModules.map((defaultModule) => {
    const saved = modules.find((module) => module.id === defaultModule.id) || {};
    return {
      ...defaultModule,
      ...saved,
      progress: clampNumber(Number(saved.progress ?? defaultModule.progress), 0, 100),
      hours: Math.max(Number(saved.hours ?? defaultModule.hours), 0),
      notes: saved.notes ?? defaultModule.notes
    };
  });
}

function savePythonRoadmap() {
  localStorage.setItem(pythonStorageKey, JSON.stringify(pythonRoadmap));
}

function loadThesisState() {
  const fallback = {
    deadline: "",
    stages: structuredClone(defaultThesisStages),
    meetings: []
  };
  const saved = localStorage.getItem(thesisStorageKey);
  if (!saved) return fallback;

  try {
    const parsed = JSON.parse(saved);
    return {
      ...fallback,
      ...parsed,
      stages: normalizeThesisStages(parsed.stages),
      meetings: Array.isArray(parsed.meetings) ? parsed.meetings : []
    };
  } catch {
    return fallback;
  }
}

function normalizeThesisStages(stages) {
  if (!Array.isArray(stages)) return structuredClone(defaultThesisStages);

  return defaultThesisStages.map((defaultStage) => {
    const saved = stages.find((stage) => stage.id === defaultStage.id) || {};
    return {
      ...defaultStage,
      ...saved,
      done: Boolean(saved.done),
      notes: saved.notes || ""
    };
  });
}

function saveThesisState() {
  localStorage.setItem(thesisStorageKey, JSON.stringify(thesisState));
}

function renderDate() {
  const date = new Date();
  document.querySelector("#dateLabel").textContent = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function renderGoals() {
  const board = document.querySelector("#goalBoard");
  board.innerHTML = "";

  state.goals.forEach((goal, goalIndex) => {
    const card = document.createElement("article");
    card.className = "goal-card";
    card.dataset.tone = goal.tone;

    const cardHeader = document.createElement("div");
    cardHeader.className = "goal-card-header";

    const heading = document.createElement("input");
    heading.className = "goal-title-input";
    heading.type = "text";
    heading.value = goal.title;
    heading.ariaLabel = "Goal block title";
    heading.addEventListener("input", () => {
      state.goals[goalIndex].title = heading.value;
      saveState();
    });

    const addTask = document.createElement("button");
    addTask.className = "mini-button";
    addTask.type = "button";
    addTask.textContent = "+ Task";
    addTask.addEventListener("click", () => {
      state.goals[goalIndex].tasks.push({
        id: `task-${Date.now()}`,
        text: "New daily action"
      });
      saveState();
      renderGoals();
      renderScore();
    });

    cardHeader.append(heading, addTask);
    card.append(cardHeader);

    goal.tasks.forEach((task, taskIndex) => {
      const id = `${goal.id}-${task.id}`;
      const row = document.createElement("div");
      row.className = "task";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.ariaLabel = "Mark task complete";
      checkbox.checked = Boolean(state.tasks[id]);
      checkbox.addEventListener("change", () => {
        state.tasks[id] = checkbox.checked;
        saveState();
        renderScore();
        taskInput.classList.toggle("done", checkbox.checked);
      });

      const taskInput = document.createElement("input");
      taskInput.className = "task-text-input";
      taskInput.type = "text";
      taskInput.value = task.text;
      taskInput.ariaLabel = "Daily goal task";
      taskInput.classList.toggle("done", checkbox.checked);
      taskInput.addEventListener("input", () => {
        state.goals[goalIndex].tasks[taskIndex].text = taskInput.value;
        saveState();
      });

      const deleteTask = document.createElement("button");
      deleteTask.className = "delete-task-button";
      deleteTask.type = "button";
      deleteTask.textContent = "×";
      deleteTask.title = "Delete task";
      deleteTask.ariaLabel = `Delete task: ${task.text}`;
      deleteTask.addEventListener("click", () => {
        state.goals[goalIndex].tasks.splice(taskIndex, 1);
        delete state.tasks[id];
        saveState();
        renderGoals();
        renderScore();
      });

      row.append(checkbox, taskInput, deleteTask);
      card.append(row);
    });

    board.append(card);
  });
}

function renderScore() {
  const visibleTaskIds = new Set(state.goals.flatMap((goal) => goal.tasks.map((task) => `${goal.id}-${task.id}`)));
  const totalTasks = visibleTaskIds.size;
  const completedTasks = Object.entries(state.tasks).filter(([id, done]) => done && visibleTaskIds.has(id)).length;
  const score = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  const allMainGoalsComplete = totalTasks > 0 && completedTasks === totalTasks;

  document.querySelector("#scoreValue").textContent = `${score}%`;
  document.querySelector("#scoreBar").style.width = `${score}%`;

  const message = score >= 85
    ? "Excellent day. Protect the routine tomorrow."
    : score >= 55
      ? "Good momentum. Finish one more important action."
      : "Start small. One checked action changes the day.";

  document.querySelector("#scoreMessage").textContent = message;
  updateDisciplineStreak(allMainGoalsComplete);
}

function updateDisciplineStreak(allMainGoalsComplete) {
  if (allMainGoalsComplete) {
    streakState.completedDates[todayKey] = true;
  } else {
    delete streakState.completedDates[todayKey];
  }

  streakState.current = countCompletedStreak(todayKey);
  streakState.best = Math.max(streakState.best || 0, streakState.current);
  saveStreakState();
  renderDisciplineStreak();
}

function countCompletedStreak(startDateKey) {
  let cursor = parseDateKey(startDateKey);
  let count = 0;

  while (streakState.completedDates[formatDateKey(cursor)]) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return count;
}

function renderDisciplineStreak() {
  const level = getDisciplineLevel(streakState.current);
  document.querySelector("#currentStreak").textContent = streakState.current;
  document.querySelector("#bestStreak").textContent = streakState.best || 0;
  document.querySelector("#disciplineLevel").textContent = level;
  document.querySelector("#streakMessage").textContent = streakState.current > 0
    ? `Keep going. You are at ${level} level.`
    : "Complete every main goal today to rebuild the streak.";
}

function getDisciplineLevel(streak) {
  if (streak >= 90) return "Elite";
  if (streak >= 31) return "Warrior";
  if (streak >= 8) return "Consistent";
  return "Beginner";
}

function renderCalendar() {
  const grid = document.querySelector("#calendarGrid");
  const monthLabel = document.querySelector("#calendarMonthLabel");
  const year = calendarViewDate.getFullYear();
  const month = calendarViewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const leadingDays = firstDay.getDay();
  const totalCells = Math.ceil((leadingDays + lastDay.getDate()) / 7) * 7;

  monthLabel.textContent = new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric"
  }).format(calendarViewDate);

  grid.innerHTML = "";

  for (let cell = 0; cell < totalCells; cell += 1) {
    const dayNumber = cell - leadingDays + 1;
    const button = document.createElement("button");
    button.className = "calendar-day";
    button.type = "button";

    if (dayNumber < 1 || dayNumber > lastDay.getDate()) {
      button.classList.add("is-empty");
      button.disabled = true;
      grid.append(button);
      continue;
    }

    const dateKey = formatDateKey(new Date(year, month, dayNumber));
    const hasGoals = Boolean(calendarGoals[dateKey]?.trim());

    button.dataset.date = dateKey;
    button.classList.toggle("is-today", dateKey === todayKey);
    button.classList.toggle("is-selected", dateKey === selectedCalendarDate);
    button.classList.toggle("has-goals", hasGoals);
    button.innerHTML = `<span>${dayNumber}</span>${hasGoals ? "<small>Goals</small>" : ""}`;
    button.addEventListener("click", () => {
      selectedCalendarDate = dateKey;
      renderCalendar();
      renderCalendarEditor();
    });

    grid.append(button);
  }

  renderCalendarEditor();
}

function renderCalendarEditor() {
  const date = parseDateKey(selectedCalendarDate);
  const savedGoals = calendarGoals[selectedCalendarDate] || "";
  document.querySelector("#selectedDateLabel").textContent = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(date);
  document.querySelector("#calendarGoalInput").value = savedGoals;
  renderCalendarPreview(savedGoals);
}

function renderCalendarPreview(text) {
  const preview = document.querySelector("#calendarGoalPreview");
  const goals = text.split("\n").map((goal) => goal.trim()).filter(Boolean);

  if (goals.length === 0) {
    preview.innerHTML = "<p>No goals saved for this date yet.</p>";
    return;
  }

  const list = document.createElement("ul");
  goals.forEach((goal) => {
    const item = document.createElement("li");
    item.textContent = goal;
    list.append(item);
  });

  preview.innerHTML = "";
  preview.append(list);
}

function renderKpis() {
  const monthKey = getMonthKey();
  const kpis = normalizeKpis(kpiState[monthKey]);
  const grid = document.querySelector("#kpiGrid");

  kpiState[monthKey] = kpis;
  document.querySelector("#kpiMonthLabel").textContent = new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric"
  }).format(new Date());

  grid.innerHTML = "";

  kpis.forEach((kpi, index) => {
    const percentage = calculatePercentage(kpi.current, kpi.target);
    const lastPercentage = calculatePercentage(kpi.lastMonth, kpi.target);
    const trend = percentage - lastPercentage;
    const card = document.createElement("article");
    card.className = "kpi-card";
    card.dataset.status = getKpiStatus(percentage);

    const header = document.createElement("div");
    header.className = "kpi-card-header";

    const title = document.createElement("h3");
    title.textContent = kpi.label;

    const badge = document.createElement("span");
    badge.textContent = `${percentage}%`;

    const fields = document.createElement("div");
    fields.className = "kpi-fields";

    fields.append(
      createKpiInput("Current Progress", kpi.current, kpi.unit, (value) => {
        kpiState[monthKey][index].current = value;
      }),
      createKpiInput("Monthly Target", kpi.target, kpi.unit, (value) => {
        kpiState[monthKey][index].target = value;
      }),
      createKpiInput("Last Month", kpi.lastMonth, kpi.unit, (value) => {
        kpiState[monthKey][index].lastMonth = value;
      })
    );

    const track = document.createElement("div");
    track.className = "kpi-progress-track";

    const fill = document.createElement("div");
    fill.className = "kpi-progress-fill";
    fill.style.width = `${percentage}%`;

    const trendText = document.createElement("p");
    trendText.className = "kpi-trend";
    trendText.textContent = `Trend vs. last month: ${formatTrend(trend)}`;

    header.append(title, badge);
    track.append(fill);
    card.append(header, fields, track, trendText);
    grid.append(card);
  });
}

function createKpiInput(labelText, value, unit, onChange) {
  const label = document.createElement("label");
  label.className = "kpi-input";
  label.textContent = labelText;

  const input = document.createElement("input");
  input.type = "number";
  input.min = "0";
  input.step = unit === "%" ? "1" : "0.5";
  input.value = value;
  input.addEventListener("input", () => {
    onChange(Number(input.value));
    saveKpiState();
    renderKpis();
  });

  const unitLabel = document.createElement("span");
  unitLabel.textContent = unit;

  label.append(input, unitLabel);
  return label;
}

function calculatePercentage(current, target) {
  if (target <= 0) return 0;
  return Math.min(Math.round((current / target) * 100), 100);
}

function getKpiStatus(percentage) {
  if (percentage > 80) return "green";
  if (percentage >= 50) return "yellow";
  return "red";
}

function formatTrend(trend) {
  if (trend > 0) return `+${trend}%`;
  if (trend < 0) return `${trend}%`;
  return "0%";
}

function renderPomodoro() {
  document.querySelector("#timerDisplay").textContent = formatTimer(timerState.secondsRemaining);
  document.querySelector("#pomodoroModeLabel").textContent = getTimerLabel(timerState.mode);
  document.querySelector("#startTimer").textContent = timerState.isRunning ? "Running" : "Start";
  document.querySelector("#startTimer").disabled = timerState.isRunning;

  document.querySelectorAll(".timer-preset").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.mode === timerState.mode);
  });

  renderFocusStats();
  renderFocusCharts();
}

function setTimerMode(mode) {
  timerState.mode = mode;
  timerState.totalSeconds = getTimerSeconds(mode);
  timerState.secondsRemaining = timerState.totalSeconds;
  stopTimer();
  renderPomodoro();
}

function getTimerSeconds(mode) {
  if (mode === "break5") return 5 * 60;
  if (mode === "focus50") return 50 * 60;
  if (mode === "custom") return Math.max(Number(document.querySelector("#customTimerInput").value) || 1, 1) * 60;
  return 25 * 60;
}

function getTimerLabel(mode) {
  if (mode === "break5") return "5 min break";
  if (mode === "focus50") return "50 min focus";
  if (mode === "custom") return "Custom timer";
  return "25 min focus";
}

function startTimer() {
  if (timerState.isRunning) return;

  if (timerState.mode === "custom") {
    timerState.totalSeconds = getTimerSeconds("custom");
    timerState.secondsRemaining = timerState.secondsRemaining || timerState.totalSeconds;
  }

  timerState.isRunning = true;
  timerInterval = setInterval(() => {
    timerState.secondsRemaining -= 1;

    if (timerState.secondsRemaining <= 0) {
      completeTimerSession();
    }

    renderPomodoro();
  }, 1000);
  renderPomodoro();
}

function stopTimer() {
  timerState.isRunning = false;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function pauseTimer() {
  stopTimer();
  renderPomodoro();
}

function resetTimer() {
  stopTimer();
  timerState.totalSeconds = getTimerSeconds(timerState.mode);
  timerState.secondsRemaining = timerState.totalSeconds;
  renderPomodoro();
}

function completeTimerSession() {
  const focusModes = ["focus25", "focus50", "custom"];
  const completedSeconds = timerState.totalSeconds;
  stopTimer();

  if (focusModes.includes(timerState.mode)) {
    focusLog[todayKey] = (focusLog[todayKey] || 0) + completedSeconds;
    saveFocusLog();
  }

  timerState.secondsRemaining = timerState.totalSeconds;
  renderPomodoro();
}

function renderFocusStats() {
  document.querySelector("#dailyFocusHours").textContent = secondsToHours(getFocusSecondsForDate(todayKey));
  document.querySelector("#weeklyFocusHours").textContent = secondsToHours(getFocusSecondsForRange(7));
  document.querySelector("#monthlyFocusHours").textContent = secondsToHours(getFocusSecondsForMonth(new Date()));
}

function renderFocusCharts() {
  renderBarChart("#dailyFocusChart", getRecentDailyFocus(), "h");
  renderBarChart("#weeklyFocusChart", getRecentWeeklyFocus(), "h");
  renderBarChart("#monthlyFocusChart", getRecentMonthlyFocus(), "h");
}

function renderBarChart(selector, data, unit) {
  const chart = document.querySelector(selector);
  const maxValue = Math.max(...data.map((item) => item.value), 1);
  chart.innerHTML = "";

  data.forEach((item) => {
    const bar = document.createElement("div");
    bar.className = "chart-bar";
    bar.style.height = `${Math.max((item.value / maxValue) * 100, item.value > 0 ? 8 : 2)}%`;
    bar.title = `${item.label}: ${item.value.toFixed(1)} ${unit}`;

    const value = document.createElement("span");
    value.textContent = item.value.toFixed(1);

    const label = document.createElement("small");
    label.textContent = item.label;

    bar.append(value, label);
    chart.append(bar);
  });
}

function getRecentDailyFocus() {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const dateKey = formatDateKey(date);
    return {
      label: new Intl.DateTimeFormat("en", { weekday: "short" }).format(date),
      value: getFocusSecondsForDate(dateKey) / 3600
    };
  });
}

function getRecentWeeklyFocus() {
  return Array.from({ length: 4 }, (_, index) => {
    const daysBack = (3 - index) * 7;
    return {
      label: `W${index + 1}`,
      value: getFocusSecondsForRange(7, daysBack) / 3600
    };
  });
}

function getRecentMonthlyFocus() {
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index), 1);
    return {
      label: new Intl.DateTimeFormat("en", { month: "short" }).format(date),
      value: getFocusSecondsForMonth(date) / 3600
    };
  });
}

function getFocusSecondsForDate(dateKey) {
  return Number(focusLog[dateKey] || 0);
}

function getFocusSecondsForRange(days, offsetDays = 0) {
  let total = 0;
  const end = new Date();
  end.setDate(end.getDate() - offsetDays);

  for (let index = 0; index < days; index += 1) {
    const date = new Date(end);
    date.setDate(end.getDate() - index);
    total += getFocusSecondsForDate(formatDateKey(date));
  }

  return total;
}

function getFocusSecondsForMonth(date) {
  const monthKey = getMonthKey(date);
  return Object.entries(focusLog).reduce((total, [dateKey, seconds]) => {
    return dateKey.startsWith(monthKey) ? total + Number(seconds || 0) : total;
  }, 0);
}

function secondsToHours(seconds) {
  return (seconds / 3600).toFixed(1);
}

function formatTimer(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function renderEnglishDashboard() {
  const metrics = normalizeEnglishMetrics(englishState.metricsByDate[todayKey]);
  const metricGrid = document.querySelector("#englishMetrics");
  englishState.metricsByDate[todayKey] = metrics;

  metricGrid.innerHTML = "";
  metrics.forEach((metric, index) => {
    const label = document.createElement("label");
    label.className = "english-metric-card";
    label.textContent = metric.label;

    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.step = metric.unit === "words" ? "1" : "0.25";
    input.value = metric.value;
    input.addEventListener("input", () => {
      englishState.metricsByDate[todayKey][index].value = Number(input.value);
      saveEnglishState();
      renderEnglishCharts();
    });

    const unit = document.createElement("span");
    unit.textContent = metric.unit;

    label.append(input, unit);
    metricGrid.append(label);
  });

  document.querySelector("#currentCefrLevel").value = englishState.currentLevel;
  document.querySelector("#targetCefrLevel").value = englishState.targetLevel;
  renderCefrRoadmap();
  renderEnglishCharts();
}

function renderPythonRoadmap() {
  const grid = document.querySelector("#pythonRoadmapGrid");
  const completion = calculatePythonCompletion();
  grid.innerHTML = "";

  document.querySelector("#pythonCompletionValue").textContent = `${completion}%`;
  document.querySelector("#pythonCompletionBadge").textContent = `${completion}% complete`;
  document.querySelector("#pythonCompletionBar").style.width = `${completion}%`;

  pythonRoadmap.forEach((module, index) => {
    const card = document.createElement("article");
    card.className = "python-module-card";
    card.dataset.status = getKpiStatus(module.progress);

    const header = document.createElement("div");
    header.className = "python-module-header";

    const title = document.createElement("h3");
    title.textContent = module.title;

    const badge = document.createElement("span");
    badge.textContent = `${module.progress}%`;

    const progressLabel = document.createElement("label");
    progressLabel.className = "python-module-field";
    progressLabel.textContent = "Progress %";

    const progressInput = document.createElement("input");
    progressInput.type = "number";
    progressInput.min = "0";
    progressInput.max = "100";
    progressInput.step = "1";
    progressInput.value = module.progress;
    progressInput.addEventListener("input", () => {
      pythonRoadmap[index].progress = clampNumber(Number(progressInput.value), 0, 100);
      savePythonRoadmap();
      renderPythonRoadmap();
    });

    const hoursLabel = document.createElement("label");
    hoursLabel.className = "python-module-field";
    hoursLabel.textContent = "Learning Hours";

    const hoursInput = document.createElement("input");
    hoursInput.type = "number";
    hoursInput.min = "0";
    hoursInput.step = "0.5";
    hoursInput.value = module.hours;
    hoursInput.addEventListener("input", () => {
      pythonRoadmap[index].hours = Math.max(Number(hoursInput.value), 0);
      savePythonRoadmap();
    });

    const notesLabel = document.createElement("label");
    notesLabel.className = "python-notes-field";
    notesLabel.textContent = "Notes";

    const notes = document.createElement("textarea");
    notes.rows = 4;
    notes.value = module.notes;
    notes.placeholder = "Concepts, project ideas, blockers, or next practice task.";
    notes.addEventListener("input", () => {
      pythonRoadmap[index].notes = notes.value;
      savePythonRoadmap();
    });

    const track = document.createElement("div");
    track.className = "python-module-track";

    const fill = document.createElement("div");
    fill.className = "python-module-fill";
    fill.style.width = `${module.progress}%`;

    header.append(title, badge);
    progressLabel.append(progressInput);
    hoursLabel.append(hoursInput);
    notesLabel.append(notes);
    track.append(fill);
    card.append(header, track, progressLabel, hoursLabel, notesLabel);
    grid.append(card);
  });
}

function calculatePythonCompletion() {
  const total = pythonRoadmap.reduce((sum, module) => sum + Number(module.progress || 0), 0);
  return Math.round(total / pythonRoadmap.length);
}

function clampNumber(value, min, max) {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

function renderThesisTracker() {
  const completed = thesisState.stages.filter((stage) => stage.done).length;
  const total = thesisState.stages.length;
  const completion = Math.round((completed / total) * 100);
  const remaining = total - completed;

  document.querySelector("#thesisCompletionValue").textContent = `${completion}%`;
  document.querySelector("#thesisRemainingValue").textContent = remaining;
  document.querySelector("#thesisCompletionBar").style.width = `${completion}%`;
  document.querySelector("#thesisDeadlineInput").value = thesisState.deadline;
  renderDeadlineCountdown();
  renderThesisStages();
  renderMeetings();
}

function renderThesisStages() {
  const grid = document.querySelector("#thesisStageGrid");
  grid.innerHTML = "";

  thesisState.stages.forEach((stage, index) => {
    const card = document.createElement("article");
    card.className = "thesis-stage-card";
    card.dataset.done = String(stage.done);

    const label = document.createElement("label");
    label.className = "thesis-stage-check";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = stage.done;
    checkbox.addEventListener("change", () => {
      thesisState.stages[index].done = checkbox.checked;
      saveThesisState();
      renderThesisTracker();
    });

    const title = document.createElement("strong");
    title.textContent = stage.title;

    const notes = document.createElement("textarea");
    notes.rows = 3;
    notes.placeholder = "Remaining task or note.";
    notes.value = stage.notes;
    notes.addEventListener("input", () => {
      thesisState.stages[index].notes = notes.value;
      saveThesisState();
    });

    label.append(checkbox, title);
    card.append(label, notes);
    grid.append(card);
  });
}

function renderDeadlineCountdown() {
  const badge = document.querySelector("#deadlineCountdown");
  if (!thesisState.deadline) {
    badge.textContent = "Set deadline";
    badge.style.background = "#e7efff";
    badge.style.color = "#2457a6";
    return;
  }

  const today = parseDateKey(todayKey);
  const deadline = parseDateKey(thesisState.deadline);
  const diffDays = Math.ceil((deadline - today) / 86400000);

  if (diffDays < 0) {
    badge.textContent = `${Math.abs(diffDays)} days overdue`;
    badge.style.background = "#ffe3e0";
    badge.style.color = "#9f2f27";
  } else if (diffDays <= 14) {
    badge.textContent = `${diffDays} days left`;
    badge.style.background = "#fff0d6";
    badge.style.color = "#82540b";
  } else {
    badge.textContent = `${diffDays} days left`;
    badge.style.background = "#dff5ec";
    badge.style.color = "#12634a";
  }
}

function renderMeetings() {
  const list = document.querySelector("#meetingList");
  list.innerHTML = "";

  if (thesisState.meetings.length === 0) {
    list.innerHTML = "<p>No supervisor meetings recorded yet.</p>";
    return;
  }

  thesisState.meetings.slice().reverse().forEach((meeting) => {
    const item = document.createElement("article");
    item.className = "meeting-item";

    const date = document.createElement("time");
    date.textContent = meeting.date || "No date";

    const note = document.createElement("p");
    note.textContent = meeting.note;

    item.append(date, note);
    list.append(item);
  });
}

function renderCefrRoadmap() {
  const roadmap = document.querySelector("#cefrRoadmap");
  const currentIndex = cefrLevels.indexOf(englishState.currentLevel);
  const targetIndex = cefrLevels.indexOf(englishState.targetLevel);
  document.querySelector("#englishLevelStatus").textContent = `${englishState.currentLevel} to ${englishState.targetLevel}`;
  roadmap.innerHTML = "";

  cefrLevels.forEach((level, index) => {
    const item = document.createElement("div");
    item.className = "cefr-level";
    item.classList.toggle("is-current", index === currentIndex);
    item.classList.toggle("is-target", index === targetIndex);
    item.classList.toggle("is-path", index >= Math.min(currentIndex, targetIndex) && index <= Math.max(currentIndex, targetIndex));
    item.innerHTML = `<strong>${level}</strong><span>${getCefrLabel(level)}</span>`;
    roadmap.append(item);
  });
}

function getCefrLabel(level) {
  const labels = {
    A1: "Beginner",
    A2: "Elementary",
    B1: "Intermediate",
    B2: "Upper intermediate",
    C1: "Advanced",
    C2: "Proficient"
  };
  return labels[level];
}

function renderEnglishCharts() {
  renderStackedChart("#weeklyEnglishChart", getRecentEnglishDays());
  renderStackedChart("#monthlyEnglishChart", getRecentEnglishWeeks());
}

function renderStackedChart(selector, data) {
  const chart = document.querySelector(selector);
  const maxTotal = Math.max(...data.map((item) => item.total), 1);
  chart.innerHTML = "";

  data.forEach((item) => {
    const bar = document.createElement("div");
    bar.className = "stacked-bar";
    bar.style.height = `${Math.max((item.total / maxTotal) * 100, item.total > 0 ? 8 : 2)}%`;
    bar.title = `${item.label}: ${item.total.toFixed(1)} total`;

    item.parts.forEach((part) => {
      const segment = document.createElement("span");
      segment.style.flexGrow = part.value;
      segment.dataset.metric = part.id;
      bar.append(segment);
    });

    const value = document.createElement("strong");
    value.textContent = item.total.toFixed(1);

    const label = document.createElement("small");
    label.textContent = item.label;

    bar.append(value, label);
    chart.append(bar);
  });
}

function getRecentEnglishDays() {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const dateKey = formatDateKey(date);
    return buildEnglishChartPoint(new Intl.DateTimeFormat("en", { weekday: "short" }).format(date), [dateKey]);
  });
}

function getRecentEnglishWeeks() {
  return Array.from({ length: 4 }, (_, index) => {
    const keys = [];
    const end = new Date();
    end.setDate(end.getDate() - ((3 - index) * 7));

    for (let day = 0; day < 7; day += 1) {
      const date = new Date(end);
      date.setDate(end.getDate() - day);
      keys.push(formatDateKey(date));
    }

    return buildEnglishChartPoint(`W${index + 1}`, keys);
  });
}

function buildEnglishChartPoint(label, dateKeys) {
  const totals = defaultEnglishMetrics.map((metric) => ({
    id: metric.id,
    value: 0
  }));

  dateKeys.forEach((dateKey) => {
    normalizeEnglishMetrics(englishState.metricsByDate[dateKey]).forEach((metric, index) => {
      totals[index].value += metric.id === "vocabulary" ? metric.value / 50 : metric.value;
    });
  });

  return {
    label,
    total: totals.reduce((sum, part) => sum + part.value, 0),
    parts: totals
  };
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function renderFocusBlocks() {
  const list = document.querySelector("#focusBlocks");
  list.innerHTML = "";

  state.focusBlocks.forEach((block, index) => {
    const row = document.createElement("div");
    row.className = "focus-item";

    const title = document.createElement("input");
    title.type = "text";
    title.value = block.title;
    title.ariaLabel = "Focus block title";
    title.addEventListener("input", () => {
      state.focusBlocks[index].title = title.value;
      saveState();
    });

    const minutes = document.createElement("input");
    minutes.className = "focus-minutes";
    minutes.type = "number";
    minutes.min = "0";
    minutes.step = "5";
    minutes.value = block.minutes;
    minutes.ariaLabel = "Focus block minutes";
    minutes.addEventListener("input", () => {
      state.focusBlocks[index].minutes = Number(minutes.value);
      saveState();
    });

    row.append(title, minutes);
    list.append(row);
  });
}

function renderHealth() {
  const sleep = document.querySelector("#sleepInput");
  const water = document.querySelector("#waterInput");
  const exercise = document.querySelector("#exerciseInput");
  const sleepGoal = document.querySelector("#sleepGoalInput");
  const waterGoal = document.querySelector("#waterGoalInput");
  const exerciseGoal = document.querySelector("#exerciseGoalInput");

  sleep.value = state.health.sleep;
  water.value = state.health.water;
  exercise.value = state.health.exercise;
  sleepGoal.value = state.health.sleepGoal;
  waterGoal.value = state.health.waterGoal;
  exerciseGoal.value = state.health.exerciseGoal;

  [sleep, water, exercise, sleepGoal, waterGoal, exerciseGoal].forEach((input) => {
    input.addEventListener("input", () => {
      state.health.sleep = Number(sleep.value);
      state.health.water = Number(water.value);
      state.health.exercise = Number(exercise.value);
      state.health.sleepGoal = Number(sleepGoal.value);
      state.health.waterGoal = Number(waterGoal.value);
      state.health.exerciseGoal = Number(exerciseGoal.value);
      saveState();
      renderScore();
      renderHealthStatus();
    });
  });

  renderHealthStatus();
}

function renderHealthStatus() {
  const status = document.querySelector("#healthStatus");
  const reached = getHealthTargetResults();
  const allReached = reached.every((metric) => metric.reached);
  const someReached = reached.some((metric) => metric.reached);
  renderTargetStatus();

  status.textContent = allReached ? "Targets met" : someReached ? "In progress" : "Not yet";
  status.style.background = allReached ? "#dff5ec" : someReached ? "#e7efff" : "#fff0d6";
  status.style.color = allReached ? "#12634a" : someReached ? "#2457a6" : "#82540b";
}

function getHealthTargetResults() {
  return [
    {
      label: "Sleep",
      actual: state.health.sleep,
      target: state.health.sleepGoal,
      unit: "h"
    },
    {
      label: "Water",
      actual: state.health.water,
      target: state.health.waterGoal,
      unit: "glasses"
    },
    {
      label: "Exercise",
      actual: state.health.exercise,
      target: state.health.exerciseGoal,
      unit: "min"
    }
  ].map((metric) => ({
    ...metric,
    reached: metric.actual >= metric.target,
    remaining: Math.max(metric.target - metric.actual, 0),
    progress: metric.target === 0 ? 100 : Math.min(Math.round((metric.actual / metric.target) * 100), 100)
  }));
}

function renderTargetStatus() {
  const grid = document.querySelector("#targetStatusGrid");
  const metrics = getHealthTargetResults();

  grid.innerHTML = "";

  metrics.forEach((metric) => {
    const card = document.createElement("article");
    card.className = "target-status-card";
    card.dataset.reached = String(metric.reached);

    const header = document.createElement("div");
    header.className = "target-status-header";

    const title = document.createElement("strong");
    title.textContent = metric.label;

    const badge = document.createElement("span");
    badge.textContent = metric.reached ? "Reached" : "Not yet";

    const numbers = document.createElement("p");
    numbers.textContent = `${metric.actual} / ${metric.target} ${metric.unit}`;

    const track = document.createElement("div");
    track.className = "target-progress-track";

    const fill = document.createElement("div");
    fill.className = "target-progress-fill";
    fill.style.width = `${metric.progress}%`;

    const note = document.createElement("small");
    note.textContent = metric.reached
      ? "Target achieved for today."
      : `${metric.remaining} ${metric.unit} remaining.`;

    header.append(title, badge);
    track.append(fill);
    card.append(header, numbers, track, note);
    grid.append(card);
  });
}

function renderNotes() {
  const log = document.querySelector("#reflectionLog");
  log.innerHTML = "";

  state.notes.slice().reverse().forEach((note) => {
    const entry = document.createElement("article");
    entry.className = "log-entry";

    const time = document.createElement("time");
    time.textContent = note.time;

    const text = document.createElement("div");
    text.textContent = note.text;

    entry.append(time, text);
    log.append(entry);
  });
}

function bindActions() {
  document.querySelector("#addGoalBlock").addEventListener("click", () => {
    state.goals.push({
      id: `goal-${Date.now()}`,
      title: "New Goal Block",
      tone: "blue",
      tasks: [{ id: `task-${Date.now()}`, text: "New daily action" }]
    });
    saveState();
    renderGoals();
    renderScore();
  });

  document.querySelector("#addBlock").addEventListener("click", () => {
    state.focusBlocks.push({ title: "New focus block", minutes: 25 });
    saveState();
    renderFocusBlocks();
  });

  document.querySelector("#prevMonth").addEventListener("click", () => {
    calendarViewDate = new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() - 1, 1);
    renderCalendar();
  });

  document.querySelector("#nextMonth").addEventListener("click", () => {
    calendarViewDate = new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1, 1);
    renderCalendar();
  });

  document.querySelector("#saveCalendarGoals").addEventListener("click", () => {
    const text = document.querySelector("#calendarGoalInput").value.trim();
    if (text) {
      calendarGoals[selectedCalendarDate] = text;
    } else {
      delete calendarGoals[selectedCalendarDate];
    }
    saveCalendarState();
    renderCalendar();
  });

  document.querySelector("#clearCalendarGoals").addEventListener("click", () => {
    document.querySelector("#calendarGoalInput").value = "";
    delete calendarGoals[selectedCalendarDate];
    saveCalendarState();
    renderCalendar();
  });

  document.querySelector("#calendarGoalInput").addEventListener("input", (event) => {
    renderCalendarPreview(event.target.value);
  });

  document.querySelectorAll(".timer-preset").forEach((button) => {
    button.addEventListener("click", () => setTimerMode(button.dataset.mode));
  });

  document.querySelector("#customTimerInput").addEventListener("input", () => {
    if (timerState.mode === "custom") {
      setTimerMode("custom");
    }
  });

  document.querySelector("#startTimer").addEventListener("click", startTimer);
  document.querySelector("#pauseTimer").addEventListener("click", pauseTimer);
  document.querySelector("#resetTimer").addEventListener("click", resetTimer);

  document.querySelector("#currentCefrLevel").addEventListener("change", (event) => {
    englishState.currentLevel = event.target.value;
    saveEnglishState();
    renderCefrRoadmap();
  });

  document.querySelector("#targetCefrLevel").addEventListener("change", (event) => {
    englishState.targetLevel = event.target.value;
    saveEnglishState();
    renderCefrRoadmap();
  });

  document.querySelector("#thesisDeadlineInput").addEventListener("input", (event) => {
    thesisState.deadline = event.target.value;
    saveThesisState();
    renderDeadlineCountdown();
  });

  document.querySelector("#addMeeting").addEventListener("click", () => {
    const date = document.querySelector("#meetingDateInput").value;
    const noteInput = document.querySelector("#meetingNoteInput");
    const note = noteInput.value.trim();
    if (!note) return;

    thesisState.meetings.push({
      date,
      note
    });
    noteInput.value = "";
    saveThesisState();
    renderMeetings();
  });

  document.querySelector("#saveNote").addEventListener("click", () => {
    const input = document.querySelector("#reflectionInput");
    const text = input.value.trim();
    if (!text) return;

    state.notes.push({
      text,
      time: new Intl.DateTimeFormat("en", {
        hour: "2-digit",
        minute: "2-digit",
        month: "short",
        day: "numeric"
      }).format(new Date())
    });
    input.value = "";
    saveState();
    renderNotes();
  });

  document.querySelector("#resetDay").addEventListener("click", () => {
    state = structuredClone(defaultState);
    saveState();
    renderGoals();
    renderFocusBlocks();
    renderHealth();
    renderNotes();
    renderScore();
  });
}

renderDate();
renderGoals();
renderCalendar();
renderKpis();
renderPomodoro();
renderEnglishDashboard();
renderPythonRoadmap();
renderThesisTracker();
renderFocusBlocks();
renderHealth();
renderNotes();
renderScore();
bindActions();
