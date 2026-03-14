const KEY = "studyTrackerData_v1";

const state = JSON.parse(localStorage.getItem(KEY)) || {
  plans: [],
  chapters: [],
  questionCounts: {},
  revision: [],
  backlog: [],
  examDate: "",
  distractions: [],
  goals: [],
  timerSeconds: 0,
  totalFocusSeconds: 0,
  streak: { lastDate: "", days: 0 },
};

const quotes = [
  "Success is the sum of small efforts repeated daily.",
  "Discipline beats motivation when motivation fades.",
  "One chapter at a time, one victory at a time.",
  "Focused hours today build your results tomorrow.",
  "Progress, not perfection."
];

let timerInterval = null;

const $ = (id) => document.getElementById(id);

function save() {
  localStorage.setItem(KEY, JSON.stringify(state));
}

function asDateKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function updateStreak() {
  const today = asDateKey();
  const last = state.streak.lastDate;
  if (!last) {
    state.streak = { lastDate: today, days: 1 };
  } else if (last !== today) {
    const diffDays = Math.round((new Date(today) - new Date(last)) / 86400000);
    state.streak.days = diffDays === 1 ? state.streak.days + 1 : 1;
    state.streak.lastDate = today;
  }
  $("streakDays").textContent = state.streak.days;
}

function formatTime(totalSeconds) {
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function renderPlans() {
  const list = $("planList");
  list.innerHTML = "";
  state.plans.forEach((p, idx) => {
    const li = document.createElement("li");
    li.className = p.done ? "done" : "";
    li.innerHTML = `${p.subject}: ${p.chapter}`;
    li.onclick = () => {
      state.plans[idx].done = !state.plans[idx].done;
      save();
      renderAll();
    };
    list.appendChild(li);
  });
}

function renderChapters() {
  const list = $("chapterList");
  list.innerHTML = "";
  state.chapters.forEach((ch, idx) => {
    const li = document.createElement("li");
    li.innerHTML = `${ch.subject}: ${ch.name}`;
    const sel = document.createElement("select");
    ["Not started", "In progress", "Completed"].forEach((s) => {
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s;
      if (s === ch.status) opt.selected = true;
      sel.appendChild(opt);
    });
    sel.onchange = (e) => {
      state.chapters[idx].status = e.target.value;
      save();
      renderAll();
    };
    li.appendChild(sel);
    list.appendChild(li);
  });
}

function renderSubjectProgress() {
  const subjects = {};
  state.chapters.forEach((c) => {
    subjects[c.subject] ||= { total: 0, done: 0 };
    subjects[c.subject].total += 1;
    if (c.status === "Completed") subjects[c.subject].done += 1;
  });

  const box = $("subjectProgress");
  box.innerHTML = "";
  Object.entries(subjects).forEach(([subject, v]) => {
    const pct = v.total ? Math.round((v.done / v.total) * 100) : 0;
    const p = document.createElement("p");
    p.innerHTML = `${subject}: ${pct}% <small class="badge">${v.done}/${v.total}</small>`;
    box.appendChild(p);
  });
  if (!Object.keys(subjects).length) box.textContent = "Add chapters to see progress.";
}

function renderQuestions() {
  const list = $("questionSummary");
  list.innerHTML = "";
  Object.entries(state.questionCounts).forEach(([subject, count]) => {
    const li = document.createElement("li");
    li.textContent = `${subject}: ${count} questions solved`;
    list.appendChild(li);
  });
}

function renderRevision() {
  const list = $("revisionList");
  list.innerHTML = "";
  state.revision.forEach((r, idx) => {
    const li = document.createElement("li");
    li.textContent = `${r.topic} — revise on ${r.date}`;
    li.onclick = () => {
      state.revision.splice(idx, 1);
      save();
      renderAll();
    };
    list.appendChild(li);
  });
}

function renderBacklog() {
  const list = $("backlogList");
  list.innerHTML = "";
  state.backlog.forEach((b, idx) => {
    const li = document.createElement("li");
    li.textContent = b;
    li.onclick = () => {
      state.backlog.splice(idx, 1);
      save();
      renderAll();
    };
    list.appendChild(li);
  });
}

function renderCountdown() {
  const input = $("examDate");
  input.value = state.examDate;
  const out = $("countdownText");
  if (!state.examDate) {
    out.textContent = "Set your date to begin countdown.";
    return;
  }
  const diff = Math.ceil((new Date(state.examDate) - new Date(asDateKey())) / 86400000);
  if (diff >= 0) out.textContent = `${diff} days remaining`;
  else out.textContent = `Exam date passed ${Math.abs(diff)} days ago`;
}

function renderDistractions() {
  const list = $("distractionList");
  list.innerHTML = "";
  let total = 0;
  state.distractions.forEach((d) => {
    total += d.minutes;
    const li = document.createElement("li");
    li.textContent = `${d.reason}: ${d.minutes} min`;
    list.appendChild(li);
  });
  $("distractionTotal").textContent = total;
}

function renderGoals() {
  const list = $("goalList");
  list.innerHTML = "";
  state.goals.forEach((g, idx) => {
    const li = document.createElement("li");
    li.className = g.done ? "done" : "";
    li.textContent = g.text;
    li.onclick = () => {
      state.goals[idx].done = !state.goals[idx].done;
      save();
      renderAll();
    };
    list.appendChild(li);
  });
}

function renderTimerAndReport() {
  $("timerDisplay").textContent = formatTime(state.timerSeconds);
  $("weeklyHours").textContent = (state.totalFocusSeconds / 3600).toFixed(2);

  const completedTopics = state.chapters.filter((c) => c.status === "Completed").length;
  const report = [
    `Focused hours: ${(state.totalFocusSeconds / 3600).toFixed(2)}`,
    `Daily plan tasks done: ${state.plans.filter((p) => p.done).length}/${state.plans.length}`,
    `Chapters completed: ${completedTopics}`,
    `Questions solved: ${Object.values(state.questionCounts).reduce((a, b) => a + b, 0)}`,
    `Backlog items: ${state.backlog.length}`,
  ];

  const list = $("weeklyReport");
  list.innerHTML = "";
  report.forEach((line) => {
    const li = document.createElement("li");
    li.textContent = line;
    list.appendChild(li);
  });
}

function renderAll() {
  renderPlans();
  renderChapters();
  renderSubjectProgress();
  renderQuestions();
  renderRevision();
  renderBacklog();
  renderCountdown();
  renderDistractions();
  renderGoals();
  renderTimerAndReport();
  save();
}

$("addPlanBtn").onclick = () => {
  const subject = $("planSubject").value.trim();
  const chapter = $("planChapter").value.trim();
  if (!subject || !chapter) return;
  state.plans.push({ subject, chapter, done: false });
  $("planSubject").value = "";
  $("planChapter").value = "";
  renderAll();
};

$("addChapterBtn").onclick = () => {
  const subject = $("chapterSubject").value.trim();
  const name = $("chapterName").value.trim();
  if (!subject || !name) return;
  state.chapters.push({ subject, name, status: "Not started" });
  $("chapterSubject").value = "";
  $("chapterName").value = "";
  renderAll();
};

$("addQuestionBtn").onclick = () => {
  const subject = $("questionSubject").value.trim();
  const count = parseInt($("questionCount").value, 10);
  if (!subject || !count) return;
  state.questionCounts[subject] = (state.questionCounts[subject] || 0) + count;
  $("questionSubject").value = "";
  $("questionCount").value = "";
  renderAll();
};

$("addRevisionBtn").onclick = () => {
  const topic = $("revisionTopic").value.trim();
  const date = $("revisionDate").value;
  if (!topic || !date) return;
  state.revision.push({ topic, date });
  $("revisionTopic").value = "";
  $("revisionDate").value = "";
  renderAll();
};

$("addBacklogBtn").onclick = () => {
  const topic = $("backlogTopic").value.trim();
  if (!topic) return;
  state.backlog.push(topic);
  $("backlogTopic").value = "";
  renderAll();
};

$("examDate").onchange = (e) => {
  state.examDate = e.target.value;
  renderAll();
};

$("addDistractionBtn").onclick = () => {
  const reason = $("distractionReason").value.trim();
  const minutes = parseInt($("distractionMinutes").value, 10);
  if (!reason || !minutes) return;
  state.distractions.push({ reason, minutes });
  $("distractionReason").value = "";
  $("distractionMinutes").value = "";
  renderAll();
};

$("addGoalBtn").onclick = () => {
  const text = $("goalText").value.trim();
  if (!text) return;
  state.goals.push({ text, done: false });
  $("goalText").value = "";
  renderAll();
};

$("startTimerBtn").onclick = () => {
  if (timerInterval) return;
  timerInterval = setInterval(() => {
    state.timerSeconds += 1;
    state.totalFocusSeconds += 1;
    renderTimerAndReport();
    save();
  }, 1000);
};

$("pauseTimerBtn").onclick = () => {
  clearInterval(timerInterval);
  timerInterval = null;
};

$("resetTimerBtn").onclick = () => {
  state.timerSeconds = 0;
  renderAll();
};

$("newQuoteBtn").onclick = () => {
  $("motivationQuote").textContent = quotes[Math.floor(Math.random() * quotes.length)];
};

updateStreak();
$("newQuoteBtn").click();
renderAll();
