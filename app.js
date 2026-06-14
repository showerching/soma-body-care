/* 體態照顧 · Body Care — claude prototype
   純前端、無框架、資料存 localStorage。 */

const STORAGE_KEY = "bodyCare.claude.v1";

/* ---------- 主題與類型 ---------- */
const TOPIC_ORDER = ["shoulder", "pelvis", "breath"];
const TOPICS = {
  shoulder: { short: "肩膀", name: "肩膀容易聳肩與圓肩", emoji: "🙆", metric: "shoulderTight" },
  pelvis: { short: "骨盆", name: "髂腰肌與骨盆前外側不適", emoji: "🦵", metric: "hipTight" },
  breath: { short: "呼吸", name: "360 度呼吸與呼吸受限", emoji: "🌬️", metric: "breathShallow" },
};

const TYPE_ORDER = ["strength", "core", "stability", "stretch", "breath", "reset", "assessment", "reduce"];
const TYPES = {
  strength: "肌力",
  core: "核心",
  stability: "臀髖穩定",
  stretch: "伸展放鬆",
  breath: "呼吸",
  reset: "日常重置",
  assessment: "評估",
  reduce: "暫時降強度",
};

/* ---------- 線條圖示（取代 emoji，統一視覺） ---------- */
const ICON_PATHS = {
  shoulder: '<circle cx="12" cy="6" r="2.4"/><path d="M4.8 19c0-4.3 3-7.2 7.2-7.2s7.2 2.9 7.2 7.2"/>',
  pelvis: '<path d="M12 8v7.5"/><path d="M12 9.4C10.4 7.5 6.2 6.8 4.9 9.1c-1 1.9.3 4.8 3.1 4.8 2.4 0 4-1.8 4-3.7"/><path d="M12 9.4c1.6-1.9 5.8-2.6 7.1-.3 1 1.9-.3 4.8-3.1 4.8-2.4 0-4-1.8-4-3.7"/>',
  breath: '<path d="M3 9h10a2.4 2.4 0 1 0-2.4-2.6"/><path d="M3 13h13a2.6 2.6 0 1 1-2.6 2.8"/><path d="M3 17h7a2 2 0 1 1-2 2.2"/>',
  home: '<circle cx="12" cy="12" r="8.4"/><circle cx="12" cy="12" r="3.1"/>',
  library: '<path d="M8 6.5h12M8 12h12M8 17.5h12"/><circle cx="4.2" cy="6.5" r="1.2" fill="currentColor" stroke="none"/><circle cx="4.2" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="4.2" cy="17.5" r="1.2" fill="currentColor" stroke="none"/>',
  records: '<rect x="4" y="5.5" width="16" height="14.5" rx="2.2"/><path d="M4 10h16"/><path d="M8.5 3.5v4M15.5 3.5v4"/>',
  review: '<path d="M4.5 5v14.5H19"/><path d="M8 15l3-3.5 2.5 2L19 7.5"/>',
  reminders: '<path d="M6.5 10a5.5 5.5 0 0 1 11 0c0 4.5 2 5.8 2 5.8H4.5s2-1.3 2-5.8Z"/><path d="M10 19a2 2 0 0 0 4 0"/>',
  compass: '<circle cx="12" cy="12" r="8.4"/><path d="M15.3 8.7l-1.8 4.8-4.8 1.8 1.8-4.8z"/>',
  alert: '<path d="M12 4.5l8.5 15H3.5z"/><path d="M12 10v4.2"/><path d="M12 17.2v.01"/>',
  check: '<circle cx="12" cy="12" r="8.4"/><path d="M8.5 12.4l2.4 2.4 4.6-5.2"/>',
  ban: '<circle cx="12" cy="12" r="8.4"/><path d="M6.4 6.4l11.2 11.2"/>',
  dumbbell: '<path d="M3.5 9.5v5M6.5 7.5v9M17.5 7.5v9M20.5 9.5v5M6.5 12h11"/>',
  edit: '<path d="M13.5 5.5l5 5L9 20H4v-5z"/><path d="M12 7l5 5"/>',
};
function icon(name, cls) {
  const p = ICON_PATHS[name] || "";
  return `<svg class="ico${cls ? " " + cls : ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
}

/* ---------- 問題脈絡（取自三份分析報告） ---------- */
const TOPIC_CONTEXT = {
  shoulder: {
    summary: "核心問題不是背肌太弱，而是圓肩、肩胛控制不足、上斜方肌代償，形成習慣性聳肩。",
    flow: "圓肩 → 肩胛位置異常 → 上斜方肌長期代償 → 習慣性聳肩 → 訓練時用肩膀發力",
    effects: ["肩頸緊繃", "下拉、面拉、划船容易聳肩", "背部發力感下降", "圓肩與頭前引更難改善"],
    principles: ["調整工作與手機姿勢", "建立肩膀放下來的感覺", "強化划船類動作", "優先追求不聳肩，而非重量進步"],
    avoid: ["重量面拉（起始就聳肩）", "重量闊背肌下拉", "重量肩推"],
  },
  pelvis: {
    summary: "不是單純髂腰肌太緊，而是核心與臀髖穩定不足，讓髖前側與骨盆前外側代償。",
    flow: "核心與骨盆穩定不足 → 臀部穩定肌群啟動不足 → 髖前側代償 → 久坐或坐機車後座起身不適",
    effects: ["久坐後起身骨盆前側痠", "前髖緊、弓箭步伸展感明顯", "單腳站不穩", "咳嗽用力時腰側到骨盆有拉扯感"],
    principles: ["建立核心與腹壓控制", "強化臀中肌、臀小肌與臀大肌", "降低髂腰肌、闊筋膜張肌、股直肌代償", "避免高髖屈核心動作過度刺激"],
    avoid: ["仰臥起坐、仰臥抬腿、懸垂抬腿", "大跨步弓箭步", "很深的深蹲與腿推"],
  },
  breath: {
    summary: "呼吸偏淺、路徑單一，側肋與後背擴張不足，是肩頸與骨盆穩定之間的底層橋樑。",
    flow: "呼吸偏淺 → 只用上胸或腹部單一路徑 → 側肋與後背擴張不足 → 360 度腹壓不足 → 肩頸、核心、骨盆都受影響",
    effects: ["吸氣時容易聳肩", "肩頸更容易緊", "核心訓練變成憋氣或只收肚子", "下肢與背部訓練時軀幹穩定下降"],
    principles: ["練習側面呼吸擴張", "練習後側呼吸擴張", "練習前側胸腹同步擴張", "把 360 呼吸整合到核心、下肢與背部訓練"],
    avoid: ["用力鼓肚子當成 360 呼吸", "吸氣時聳肩", "吐氣太急"],
  },
};

/* ---------- 每日身體感受指標 ---------- */
const DAILY_METRICS = [
  { key: "shoulderTight", label: "肩頸緊繃", kind: "scale", topic: "shoulder" },
  { key: "shrug", label: "是否容易聳肩", kind: "bool", topic: "shoulder" },
  { key: "hipTight", label: "前髖/骨盆前側緊繃", kind: "scale", topic: "pelvis" },
  { key: "waistPull", label: "腰側到骨盆拉扯感", kind: "scale", topic: "pelvis" },
  { key: "breathShallow", label: "呼吸淺度", kind: "scale", topic: "breath" },
  { key: "sideRib", label: "側肋擴張感", kind: "scale", topic: "breath" },
  { key: "backRib", label: "後背擴張感", kind: "scale", topic: "breath" },
  { key: "sitting", label: "今日久坐感受", kind: "level", topic: null },
  { key: "trained", label: "今日是否健身", kind: "bool", topic: null },
];

/* ---------- 日常提醒 ---------- */
const REMINDERS = [
  { id: "sit", title: "久坐重置", desc: "起身做骨盆前後傾、站姿髖伸展或走動。", when: "每 60 分鐘" },
  { id: "phone", title: "手機姿勢", desc: "手機抬高、手肘靠近身體、肩膀放鬆。", when: "滑手機時" },
  { id: "shoulder", title: "肩膀歸位", desc: "肩膀聳到最高 → 向後繞 → 完全放下，重複 3-5 次。", when: "每小時一次" },
  { id: "breath", title: "360 呼吸", desc: "做 3 次側肋與後背呼吸，肩膀不聳。", when: "感覺肩頸緊時" },
  { id: "bag", title: "背包輪替", desc: "側背包左右輪替，避免固定同一側。", when: "出門前" },
  { id: "warmup", title: "健身前啟動", desc: "先做呼吸與臀髖啟動，不直接進大重量。", when: "重訓前" },
];

/* ---------- 預設動作資料庫 ---------- */
let _aid = 0;
const A = (name, topic, type, purpose, caution) => ({
  id: "a" + ++_aid,
  name,
  topic,
  type,
  purpose,
  caution,
  custom: false,
});

const DEFAULT_ACTIONS = [
  // 肩膀
  A("胸靠划船", "shoulder", "strength", "建立背部發力、降低代償、強化肩胛穩定。", "胸口貼穩靠墊，肩膀遠離耳朵。"),
  A("坐姿划船", "shoulder", "strength", "訓練中背、改善圓肩。", "手肘向後，肩膀不要前跑、不要聳肩。"),
  A("反向飛鳥", "shoulder", "strength", "強化後三角、改善圓肩。", "重量輕，動作品質優先。"),
  A("直臂下拉", "shoulder", "strength", "建立闊背肌感受、降低肩膀代償。", "肩膀遠離耳朵，想像腋下夾東西。"),
  A("滑輪單臂下拉", "shoulder", "strength", "單側建立下背與闊背連結。", "不要用聳肩帶動。"),
  A("胸小肌伸展", "shoulder", "stretch", "放鬆前胸、改善圓肩。", "角度小，不要硬壓肩前。"),
  A("門框胸肌伸展", "shoulder", "stretch", "打開胸口，對抗內縮。", "手肘約肩高，身體緩緩前傾。"),
  A("胸椎伸展", "shoulder", "stretch", "增加胸椎活動度，幫助挺胸。", "動作慢，不要用腰代償。"),
  A("上斜方肌輕伸展", "shoulder", "stretch", "降低肩頸過度緊繃。", "力道溫和，不要硬拉脖子。"),
  A("肩頸輕按摩", "shoulder", "stretch", "緩解肩頸緊繃。", "出現刺痛或麻立即停止。"),
  A("肩膀歸位重置", "shoulder", "reset", "重建肩膀放鬆位置的感覺。", "聳高→向後繞→完全放下，3-5 次。"),
  A("重量面拉", "shoulder", "reduce", "暫時降強度，先求不聳肩。", "目前起始就聳肩，先用很輕重量。"),
  // 骨盆
  A("死蟲", "pelvis", "core", "建立深層核心與腹壓控制。", "下背不要拱起，吐氣肋骨往下收。"),
  A("抗旋轉推", "pelvis", "core", "側腹與下腹抗旋轉穩定。", "骨盆保持正面，肋骨不外翻。"),
  A("棒式", "pelvis", "core", "整體核心穩定。", "不要塌腰或翹臀。"),
  A("側棒式", "pelvis", "core", "腰側與側腹穩定。", "可先從跪姿開始，不要用鼠蹊硬撐。"),
  A("髖關節外展", "pelvis", "stability", "改善單腳站不穩、減少 TFL 代償。", "骨盆不要往後翻。"),
  A("單腳站", "pelvis", "stability", "訓練支撐腳臀部側向穩定。", "骨盆保持水平，可先扶牆。"),
  A("羅馬尼亞硬舉", "pelvis", "strength", "臀腿後側肌力、臀部主導髖伸展。", "髖往後推，前髖不應夾痛。"),
  A("深蹲", "pelvis", "strength", "下肢與臀腿肌力。", "不追求蹲很深，膝蓋對腳尖。"),
  A("臀推", "pelvis", "strength", "臀大肌主導髖伸展。", "頂端夾臀，不要拱腰。"),
  A("保加利亞分腿蹲", "pelvis", "strength", "單側臀腿肌力與穩定。", "前髖夾痛就縮小幅度。"),
  A("低台階登階", "pelvis", "strength", "單腳臀腿穩定發力。", "台階不要太高，骨盆不要歪。"),
  A("半跪姿髖屈肌伸展", "pelvis", "stretch", "放鬆髂腰肌、改善前髖緊。", "先收肚子、微微後傾，不要拱腰。"),
  A("股直肌伸展", "pelvis", "stretch", "放鬆前大腿與髖屈張力。", "保持骨盆後傾，膝蓋不適就降幅度。"),
  A("闊筋膜張肌輕放鬆", "pelvis", "stretch", "降低 ASIS 外下方緊繃。", "不要壓骨頭，出現放射痛停止。"),
  A("腰側與腹斜肌呼吸放鬆", "pelvis", "stretch", "降低腰側到骨盆緊繃、重建腹壓。", "吐氣時肋骨往下收。"),
  A("臀中肌輕按摩", "pelvis", "stretch", "放鬆臀部側邊。", "力道溫和。"),
  A("仰臥抬腿", "pelvis", "reduce", "暫時降強度的高髖屈動作。", "骨盆穩定改善前先少做。"),
  // 呼吸
  A("呼吸評估", "breath", "assessment", "確認前下肋、側肋、上胸、後背哪裡會動。", "每個位置觀察 3-5 次呼吸。"),
  A("橫膈膜放鬆", "breath", "breath", "降低下肋緣緊繃，幫助呼吸從橫膈膜啟動。", "力道溫和，頭暈或噁心立即停止。"),
  A("側面呼吸擴張", "breath", "breath", "把氣吸到側邊肋骨，撐開側肋。", "吸氣不要聳肩，讓側肋往外撐。"),
  A("後側呼吸擴張", "breath", "breath", "把氣吸到後背肋骨，改善後側僵硬。", "不要聳肩或用脖子硬壓。"),
  A("前側胸腹同步擴張", "breath", "breath", "胸腔與下腹同步擴張，避免單一路徑。", "追求胸腹起伏接近 1:1。"),
  A("死蟲前 360 呼吸設定", "breath", "reset", "把 360 呼吸整合到核心訓練。", "先吸氣建立腹壓再動。"),
  A("划船時吐氣放肩", "breath", "reset", "把呼吸整合到背部訓練。", "拉的時候肩膀遠離耳朵。"),
];

/* ---------- 狀態 ---------- */
let state = loadState();
const ui = {
  tab: "home",
  date: todayISO(),
  topicFilter: "all",
  typeFilter: "all",
  period: 7,
  calMonth: startOfMonth(new Date()),
  selectedDay: todayISO(),
  openTopic: null,
};
const el = {};

/* ---------- 啟動 ---------- */
document.addEventListener("DOMContentLoaded", init);

function init() {
  cache();
  bind();
  fillCustomOptions();
  ui.date = todayISO();
  renderAll();
}

function cache() {
  const ids = [
    "screen", "backBtn", "resetBtn", "appbarTitle", "appbarEyebrow",
    "dayBanner",
    "breathRing", "ringFocus", "ringSuggest",
    "statusCards", "homeQuickLog", "homeDoneCount", "goLibraryFromHome",
    "topicFilter", "typeFilter", "libraryCount", "actionList",
    "openCustomForm", "customForm", "cancelCustom",
    "detailDateSub", "detailList", "saveDetail", "addMissing",
    "monthPrev", "monthNext", "monthLabel", "calGrid", "dayRecord", "dayRecordTitle",
    "periodFilter", "coverage", "trends", "advice",
    "reminderList", "toast",
  ];
  ids.forEach((id) => (el[id] = document.getElementById(id)));
}

function bind() {
  document.querySelectorAll(".tab").forEach((b) =>
    b.addEventListener("click", () => goTab(b.dataset.tab))
  );
  el.backBtn.addEventListener("click", () => goTab(ui.tab));
  el.resetBtn.addEventListener("click", resetDemo);

  el.dayBanner.addEventListener("click", () => {
    ui.date = todayISO();
    renderHome();
  });
  el.goLibraryFromHome.addEventListener("click", () => goTab("library"));

  el.openCustomForm.addEventListener("click", () => {
    el.customForm.hidden = false;
    el.openCustomForm.hidden = true;
  });
  el.cancelCustom.addEventListener("click", closeCustomForm);
  el.customForm.addEventListener("submit", addCustomAction);

  el.saveDetail.addEventListener("click", saveDetailForm);
  el.addMissing.addEventListener("click", () => goTab("library"));

  el.monthPrev.addEventListener("click", () => shiftMonth(-1));
  el.monthNext.addEventListener("click", () => shiftMonth(1));
}

/* ---------- 導覽 ---------- */
const TAB_VIEW = {
  home: { view: "view-home", title: "今天", eyebrow: "SOMA" },
  library: { view: "view-library", title: "練習清單", eyebrow: "動作資料庫" },
  records: { view: "view-records", title: "練習紀錄", eyebrow: "日曆" },
  review: { view: "view-review", title: "回顧", eyebrow: "近期趨勢" },
  reminders: { view: "view-reminders", title: "日常提醒", eyebrow: "重置清單" },
};

function goTab(tab) {
  ui.tab = tab;
  ui.openTopic = null;
  showView(TAB_VIEW[tab].view, TAB_VIEW[tab].title, TAB_VIEW[tab].eyebrow, false);
  document.querySelectorAll(".tab").forEach((b) => b.classList.toggle("is-active", b.dataset.tab === tab));
  el.screen.scrollTop = 0;
  renderAll();
}

function showView(viewId, title, eyebrow, isPush) {
  document.querySelectorAll(".view").forEach((v) => v.classList.toggle("is-active", v.id === viewId));
  el.appbarTitle.textContent = title;
  el.appbarEyebrow.textContent = eyebrow;
  el.backBtn.hidden = !isPush;
  el.screen.scrollTop = 0;
}

function openTopic(topic) {
  ui.openTopic = topic;
  renderTopicView(topic);
  showView("view-topic", TOPICS[topic].name, "問題脈絡", true);
}

function openDetail() {
  renderDetail();
  showView("view-detail", "延伸紀錄", formatDate(ui.date), true);
}

/* ---------- 全部渲染 ---------- */
function renderAll() {
  renderHome();
  renderFilters();
  renderLibrary();
  renderCalendar();
  renderReview();
  renderReminders();
}

/* ---------- 今日 ---------- */
function renderHome() {
  // 非今天才顯示返回橫幅
  if (ui.date === todayISO()) {
    el.dayBanner.hidden = true;
  } else {
    el.dayBanner.hidden = false;
    el.dayBanner.innerHTML = `檢視 ${formatDate(ui.date)}<span class="day-banner-back">回到今天 ›</span>`;
  }
  // 呼吸核心環
  renderBreathRing();
  // 主題粉彩卡
  el.statusCards.innerHTML = "";
  TOPIC_ORDER.forEach((topic) => {
    const st = computeStatus(topic);
    const card = document.createElement("button");
    card.type = "button";
    card.className = `status-card t-${topic}`;
    card.innerHTML = `
      <span class="status-badge">${icon(topic)}</span>
      <span class="status-name">${TOPICS[topic].short}</span>
      <span class="status-tag">${st.label}</span>`;
    card.addEventListener("click", () => openTopic(topic));
    el.statusCards.appendChild(card);
  });

  // 今日快速勾選
  renderQuickLog();
}

function renderQuickLog() {
  const s = getSession(ui.date);
  const chosen = Object.keys(s.done);
  el.homeDoneCount.textContent = `${chosen.filter((k) => s.done[k]).length} 個動作`;
  el.homeQuickLog.innerHTML = "";

  if (chosen.length === 0) {
    el.homeQuickLog.innerHTML = `<div class="empty"><strong>今天還沒有選動作</strong>從練習清單加入想做的動作，再回來勾選。</div>`;
    return;
  }
  TOPIC_ORDER.forEach((topic) => {
    const items = chosen.map(getAction).filter((a) => a && a.topic === topic);
    if (!items.length) return;
    const label = document.createElement("div");
    label.className = "group-label";
    label.innerHTML = `<i class="dot dot-${topic}"></i>${TOPICS[topic].short}`;
    el.homeQuickLog.appendChild(label);
    items.forEach((a) => {
      const row = document.createElement("div");
      row.className = "check-row" + (s.done[a.id] ? " is-done" : "");
      row.innerHTML = `<span class="check-box">${s.done[a.id] ? "✓" : ""}</span>
        <span class="check-name">${escapeHTML(a.name)}</span>
        <span class="check-topic tg-${topic}">${TYPES[a.type]}</span>`;
      row.addEventListener("click", () => toggleDone(a.id));
      el.homeQuickLog.appendChild(row);
    });
  });

  const detailBtn = document.createElement("button");
  detailBtn.className = "ghost-btn full with-ico";
  detailBtn.style.marginTop = "10px";
  detailBtn.innerHTML = `${icon("edit")}整頁延伸紀錄（組數 / 疼痛 / 緊繃）`;
  detailBtn.addEventListener("click", openDetail);
  el.homeQuickLog.appendChild(detailBtn);
}

function toggleDone(actionId) {
  const s = getSession(ui.date);
  s.done[actionId] = !s.done[actionId];
  saveState();
  renderHome();
  renderCalendar();
}

/* ---------- 主題脈絡頁 ---------- */
function renderTopicView(topic) {
  const c = TOPIC_CONTEXT[topic];
  const t = TOPICS[topic];
  const container = document.getElementById("view-topic");
  const acts = allActions().filter((a) => a.topic === topic);
  container.innerHTML = `
    <div class="topic-hero t-${topic}">
      <h2><span class="hero-ico">${icon(topic)}</span>${t.name}</h2>
      <p>${c.summary}</p>
    </div>
    <div class="topic-section">
      <h3><span class="sec-ico">${icon("compass")}</span>為什麼會這樣</h3>
      <div class="flow-box">${c.flow.replace(/→/g, "<br>↓<br>")}</div>
    </div>
    <div class="topic-section">
      <h3><span class="sec-ico">${icon("alert")}</span>會造成什麼影響</h3>
      <ul class="bullet-list">${c.effects.map((x) => `<li>${x}</li>`).join("")}</ul>
    </div>
    <div class="topic-section">
      <h3><span class="sec-ico">${icon("check")}</span>改善原則</h3>
      <ul class="bullet-list">${c.principles.map((x) => `<li>${x}</li>`).join("")}</ul>
    </div>
    <div class="topic-section">
      <h3><span class="sec-ico">${icon("ban")}</span>暫時避免</h3>
      <ul class="bullet-list">${c.avoid.map((x) => `<li>${x}</li>`).join("")}</ul>
    </div>
    <div class="topic-section">
      <h3><span class="sec-ico">${icon("dumbbell")}</span>這個主題可以練</h3>
      <div class="action-list" id="topicActions"></div>
    </div>`;
  const list = container.querySelector("#topicActions");
  acts.forEach((a) => list.appendChild(actionCard(a)));
}

/* ---------- 練習清單 ---------- */
function renderFilters() {
  const topics = [{ key: "all", label: "全部主題" }, ...TOPIC_ORDER.map((k) => ({ key: k, label: TOPICS[k].short }))];
  el.topicFilter.innerHTML = "";
  topics.forEach((t) => {
    const c = document.createElement("button");
    c.className = "chip" + (ui.topicFilter === t.key ? " is-on" : "");
    c.textContent = t.label;
    c.addEventListener("click", () => { ui.topicFilter = t.key; renderFilters(); renderLibrary(); });
    el.topicFilter.appendChild(c);
  });

  const types = [{ key: "all", label: "全部類型" }, ...TYPE_ORDER.map((k) => ({ key: k, label: TYPES[k] }))];
  el.typeFilter.innerHTML = "";
  types.forEach((t) => {
    const c = document.createElement("button");
    c.className = "chip" + (ui.typeFilter === t.key ? " is-on" : "");
    c.textContent = t.label;
    c.addEventListener("click", () => { ui.typeFilter = t.key; renderFilters(); renderLibrary(); });
    el.typeFilter.appendChild(c);
  });

  // 回顧區間
  el.periodFilter.innerHTML = "";
  [7, 14, 30].forEach((p) => {
    const c = document.createElement("button");
    c.className = "chip" + (ui.period === p ? " is-on" : "");
    c.textContent = `最近 ${p} 天`;
    c.addEventListener("click", () => { ui.period = p; renderFilters(); renderReview(); });
    el.periodFilter.appendChild(c);
  });
}

function renderLibrary() {
  const acts = allActions().filter((a) => {
    if (ui.topicFilter !== "all" && a.topic !== ui.topicFilter) return false;
    if (ui.typeFilter !== "all" && a.type !== ui.typeFilter) return false;
    return true;
  });
  el.libraryCount.textContent = `${acts.length} 個動作`;
  el.actionList.innerHTML = "";
  if (!acts.length) {
    el.actionList.innerHTML = `<div class="empty"><strong>沒有符合的動作</strong>換個篩選，或新增自訂動作。</div>`;
    return;
  }
  acts.forEach((a) => el.actionList.appendChild(actionCard(a)));
}

function actionCard(a) {
  const s = getSession(ui.date);
  const inToday = a.id in s.done;
  const card = document.createElement("div");
  card.className = "action-card";
  card.innerHTML = `
    <div class="action-top">
      <span class="check-topic tg-${a.topic}">${TOPICS[a.topic].short}</span>
      <span class="action-name">${escapeHTML(a.name)}</span>
      <span class="type-tag">${TYPES[a.type]}</span>
    </div>
    ${a.purpose ? `<div class="action-purpose">${escapeHTML(a.purpose)}</div>` : ""}
    ${a.caution ? `<div class="action-caution">注意：${escapeHTML(a.caution)}</div>` : ""}`;
  const btn = document.createElement("button");
  btn.className = "action-add" + (inToday ? " is-in" : "");
  btn.textContent = inToday ? "✓ 已在今日清單" : "＋ 加入今日";
  btn.addEventListener("click", () => addToToday(a.id));
  card.appendChild(btn);
  return card;
}

function addToToday(actionId) {
  const s = getSession(ui.date);
  if (!(actionId in s.done)) s.done[actionId] = false;
  saveState();
  toast("已加入今日清單");
  renderLibrary();
  if (ui.openTopic) renderTopicView(ui.openTopic);
  renderHome();
}

function closeCustomForm() {
  el.customForm.reset();
  el.customForm.hidden = true;
  el.openCustomForm.hidden = false;
}

function fillCustomOptions() {
  const ts = el.customForm.elements.topic;
  const tp = el.customForm.elements.type;
  ts.innerHTML = TOPIC_ORDER.map((k) => `<option value="${k}">${TOPICS[k].name}</option>`).join("");
  tp.innerHTML = TYPE_ORDER.map((k) => `<option value="${k}">${TYPES[k]}</option>`).join("");
}

function addCustomAction(e) {
  e.preventDefault();
  const f = e.target.elements;
  const name = f.name.value.trim();
  if (!name) return;
  state.customActions.push({
    id: "c" + Date.now(),
    name,
    topic: f.topic.value,
    type: f.type.value,
    purpose: f.purpose.value.trim(),
    caution: f.caution.value.trim(),
    custom: true,
  });
  saveState();
  closeCustomForm();
  toast("已新增自訂動作");
  renderLibrary();
}

/* ---------- 延伸紀錄 ---------- */
function renderDetail() {
  el.detailDateSub.textContent = formatDate(ui.date) + " · 預設只顯示已勾選完成的動作";
  const s = getSession(ui.date);
  const ids = Object.keys(s.done).filter((id) => s.done[id]);
  el.detailList.innerHTML = "";
  if (!ids.length) {
    el.detailList.innerHTML = `<div class="empty"><strong>還沒有完成的動作</strong>先到今日把有做的動作勾起來。</div>`;
    return;
  }
  TOPIC_ORDER.forEach((topic) => {
    const items = ids.map(getAction).filter((a) => a && a.topic === topic);
    if (!items.length) return;
    const label = document.createElement("div");
    label.className = "group-label";
    label.innerHTML = `<i class="dot dot-${topic}"></i>${TOPICS[topic].short}`;
    el.detailList.appendChild(label);
    items.forEach((a) => el.detailList.appendChild(detailItem(a, s.details[a.id] || {})));
  });
}

function detailItem(a, d) {
  const wrap = document.createElement("details");
  wrap.className = "detail-item";
  wrap.dataset.id = a.id;
  const isBreath = a.topic === "breath";
  wrap.innerHTML = `
    <summary>${escapeHTML(a.name)} <span class="type-tag">${TYPES[a.type]}</span></summary>
    <div class="detail-grid">
      ${isBreath ? field(a.id, "breaths", "呼吸次數", d.breaths) : field(a.id, "sets", "組數", d.sets) + field(a.id, "reps", "次數", d.reps)}
      ${isBreath ? "" : field(a.id, "weight", "重量(kg)", d.weight)}
      ${field(a.id, "pain", "疼痛 0-10", d.pain)}
      ${field(a.id, "tight", "緊繃 0-10", d.tight)}
      <label class="field span-2"><span>備註</span><textarea data-f="note" rows="2">${escapeHTML(d.note || "")}</textarea></label>
    </div>
    <label class="detail-comp"><input type="checkbox" data-f="comp" ${d.comp ? "checked" : ""}/> 出現代償（聳肩 / 前髖緊 / 憋氣…）</label>`;
  return wrap;
}

function field(id, key, label, value) {
  const v = value === undefined || value === null ? "" : value;
  return `<label class="field"><span>${label}</span><input type="number" inputmode="decimal" data-f="${key}" value="${v}" /></label>`;
}

function saveDetailForm() {
  const s = getSession(ui.date);
  el.detailList.querySelectorAll(".detail-item").forEach((node) => {
    const id = node.dataset.id;
    const d = {};
    node.querySelectorAll("[data-f]").forEach((inp) => {
      const f = inp.dataset.f;
      if (f === "comp") d.comp = inp.checked;
      else if (f === "note") d.note = inp.value.trim();
      else if (inp.value !== "") d[f] = Number(inp.value);
    });
    s.details[id] = d;
  });
  saveState();
  toast("延伸紀錄已儲存");
  goTab("home");
}

/* ---------- 日曆 ---------- */
function shiftMonth(delta) {
  const m = new Date(ui.calMonth);
  m.setMonth(m.getMonth() + delta);
  ui.calMonth = startOfMonth(m);
  renderCalendar();
}

function renderCalendar() {
  const first = ui.calMonth;
  el.monthLabel.textContent = `${first.getFullYear()} 年 ${first.getMonth() + 1} 月`;
  el.calGrid.innerHTML = "";
  ["一", "二", "三", "四", "五", "六", "日"].forEach((d) => {
    const h = document.createElement("div");
    h.className = "cal-cell is-head";
    h.textContent = d;
    el.calGrid.appendChild(h);
  });
  const startWeekday = (first.getDay() + 6) % 7; // 週一為首
  for (let i = 0; i < startWeekday; i++) {
    const e = document.createElement("div");
    e.className = "cal-cell is-empty";
    el.calGrid.appendChild(e);
  }
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    const iso = toISO(new Date(first.getFullYear(), first.getMonth(), day));
    const topics = sessionTopics(iso);
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "cal-cell";
    if (iso === todayISO()) cell.classList.add("is-today");
    if (iso === ui.selectedDay) cell.classList.add("is-selected");
    cell.innerHTML = `<span>${day}</span><span class="cal-dots">${topics.map((t) => `<i class="dot dot-${t}"></i>`).join("")}</span>`;
    cell.addEventListener("click", () => { ui.selectedDay = iso; renderCalendar(); renderDayRecord(); });
    el.calGrid.appendChild(cell);
  }
  renderDayRecord();
}

function renderDayRecord() {
  const iso = ui.selectedDay;
  el.dayRecordTitle.textContent = formatDate(iso);
  const s = state.sessions[iso];
  const done = s ? Object.keys(s.done).filter((k) => s.done[k]) : [];
  if (!done.length) {
    el.dayRecord.innerHTML = `<div class="empty"><strong>這天沒有完成紀錄</strong><button class="ghost-btn" id="jumpToDay">在這天記錄</button></div>`;
    const j = document.getElementById("jumpToDay");
    if (j) j.addEventListener("click", () => { ui.date = iso; goTab("home"); });
    return;
  }
  let html = "";
  TOPIC_ORDER.forEach((topic) => {
    const items = done.map(getAction).filter((a) => a && a.topic === topic);
    if (!items.length) return;
    html += `<div class="day-rec-group"><div class="group-label"><i class="dot dot-${topic}"></i>${TOPICS[topic].short}</div>`;
    items.forEach((a) => {
      const d = s.details[a.id];
      const extra = d ? detailSummary(d) : "";
      html += `<div class="day-rec-line"><span class="tick">✓</span>${escapeHTML(a.name)}${extra ? `<span class="muted">· ${extra}</span>` : ""}</div>`;
    });
    html += `</div>`;
  });
  html += `<button class="ghost-btn full" id="editDay" style="margin-top:8px">編輯這天（延伸紀錄）</button>`;
  el.dayRecord.innerHTML = html;
  document.getElementById("editDay").addEventListener("click", () => {
    ui.date = iso;
    openDetail();
  });
}

function detailSummary(d) {
  const parts = [];
  if (d.sets) parts.push(`${d.sets}組`);
  if (d.reps) parts.push(`${d.reps}下`);
  if (d.breaths) parts.push(`${d.breaths}次呼吸`);
  if (d.weight) parts.push(`${d.weight}kg`);
  if (d.pain != null) parts.push(`痛${d.pain}`);
  if (d.tight != null) parts.push(`緊${d.tight}`);
  return parts.join(" ");
}

/* ---------- 回顧 ---------- */
function renderReview() {
  const dates = recentDates(ui.period);
  // 主題覆蓋
  const cov = {};
  TOPIC_ORDER.forEach((t) => (cov[t] = { days: 0, count: 0 }));
  dates.forEach((iso) => {
    const s = state.sessions[iso];
    if (!s) return;
    const done = Object.keys(s.done).filter((k) => s.done[k]).map(getAction).filter(Boolean);
    const seen = new Set();
    done.forEach((a) => {
      cov[a.topic].count++;
      seen.add(a.topic);
    });
    seen.forEach((t) => cov[t].days++);
  });
  const maxCount = Math.max(1, ...TOPIC_ORDER.map((t) => cov[t].count));
  el.coverage.innerHTML = TOPIC_ORDER.map((t) => `
    <div class="cov-row">
      <div class="cov-top"><span class="cov-name">${TOPICS[t].short}</span><span class="muted">${cov[t].count} 次 / ${cov[t].days} 天</span></div>
      <div class="cov-bar"><div class="cov-fill t-${t}" style="width:${(cov[t].count / maxCount) * 100}%"></div></div>
    </div>`).join("");

  // 症狀趨勢
  const trendKeys = [
    { key: "shoulderTight", label: "肩頸緊繃", color: "var(--shoulder)" },
    { key: "hipTight", label: "前髖/骨盆緊繃", color: "var(--pelvis)" },
    { key: "breathShallow", label: "呼吸淺度", color: "var(--breath)" },
  ];
  el.trends.innerHTML = trendKeys.map((tk) => {
    const series = dates.map((iso) => {
      const s = state.sessions[iso];
      const v = s && s.feeling ? s.feeling[tk.key] : undefined;
      return typeof v === "number" ? v : null;
    });
    const points = series.filter((v) => v !== null);
    if (points.length < 2) {
      return `<div class="trend-row"><div class="trend-top"><span>${tk.label}</span><span class="muted">資料不足</span></div><div class="trend-empty">至少填 2 天才畫趨勢。</div></div>`;
    }
    const first = points[0], last = points[points.length - 1];
    const arrow = last < first ? "↓ 下降" : last > first ? "↑ 上升" : "→ 持平";
    return `<div class="trend-row"><div class="trend-top"><span>${tk.label}</span><span class="muted">${first} → ${last} ${arrow}</span></div>${sparkline(series, tk.color)}</div>`;
  }).join("");

  // 下週建議
  el.advice.innerHTML = buildAdvice(dates, cov);
}

function sparkline(series, color) {
  const W = 280, H = 48, pad = 4;
  const vals = series.map((v) => (v === null ? null : v));
  const max = 10, min = 0;
  const n = vals.length;
  const x = (i) => pad + (i * (W - 2 * pad)) / Math.max(1, n - 1);
  const y = (v) => H - pad - ((v - min) / (max - min)) * (H - 2 * pad);
  let d = "";
  let started = false;
  vals.forEach((v, i) => {
    if (v === null) { started = false; return; }
    d += `${started ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)} `;
    started = true;
  });
  const dots = vals.map((v, i) => (v === null ? "" : `<circle cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="2.5" fill="${color}"/>`)).join("");
  return `<svg class="trend-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><path d="${d}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round"/>${dots}</svg>`;
}

/* ---------- 粒子分數環（今日建議加強部位） ---------- */
const PILL_RANK = { "pill-need": 3, "pill-over": 2, "pill-none": 4, "pill-ok": 0 };
const RING_PALETTE = {
  shoulder: ["#e0894f", "#e89f68", "#f1c69e", "#f3d488", "#d9b48a"],
  pelvis: ["#8a72a6", "#a88fc4", "#c4b2d6", "#d6c7e2", "#b6a0cf"],
  breath: ["#2f9d8a", "#54bdac", "#8fd0c2", "#bfe3db", "#6cc3b4"],
};
const RING_GLOW = { shoulder: "#fcecdd", pelvis: "#efe9f5", breath: "#ddeeea" };

function topicDays7(topic) {
  let days = 0;
  recentDates(7).forEach((iso) => {
    const s = state.sessions[iso];
    if (!s) return;
    const done = Object.keys(s.done).filter((k) => s.done[k]).map(getAction).filter(Boolean);
    if (done.some((a) => a.topic === topic)) days++;
  });
  return days;
}

function pickFocusTopic() {
  // 取近 7 天「練得最少」的主題；同分時以狀態較需補強者優先。
  const rows = TOPIC_ORDER.map((topic) => ({
    topic,
    days: topicDays7(topic),
    st: computeStatus(topic),
  }));
  const minDays = Math.min(...rows.map((r) => r.days));
  const maxDays = Math.max(...rows.map((r) => r.days));
  const tied = rows.filter((r) => r.days === minDays);
  tied.sort((a, b) => (PILL_RANK[b.st.pill] ?? 1) - (PILL_RANK[a.st.pill] ?? 1));
  const focus = tied[0];
  focus.allEqual = minDays === maxDays;
  return focus;
}

function renderBreathRing() {
  const focus = pickFocusTopic();
  const palette = RING_PALETTE[focus.topic];
  const cx = 160, cy = 160, inner = 96, outer = 150;

  let dots = "";
  // 以固定種子讓粒子穩定，不會每次 render 都跳動。
  let seed = focus.topic.length * 97 + focus.days * 13 + 7;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  for (let i = 0; i < 150; i++) {
    const a = rand() * Math.PI * 2;
    const rr = inner + Math.pow(rand(), 0.7) * (outer - inner);
    const x = (cx + Math.cos(a) * rr).toFixed(1);
    const y = (cy + Math.sin(a) * rr).toFixed(1);
    const rad = (2 + rand() * 3.3).toFixed(1);
    const col = palette[(rand() * palette.length) | 0];
    const op = (0.45 + rand() * 0.5).toFixed(2);
    dots += `<circle cx="${x}" cy="${y}" r="${rad}" fill="${col}" opacity="${op}"/>`;
  }

  el.breathRing.innerHTML = `
    <svg class="ring-svg" viewBox="0 0 320 320" role="img" aria-label="今日建議加強：${TOPICS[focus.topic].short}">
      <defs>
        <radialGradient id="ringGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${RING_GLOW[focus.topic]}"/>
          <stop offset="60%" stop-color="${RING_GLOW[focus.topic]}" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <g>${dots}</g>
      <circle cx="160" cy="160" r="98" fill="url(#ringGlow)"/>
    </svg>
    <div class="ring-center">
      <span class="ring-center-label">今日建議加強</span>
      <span class="ring-badge t-${focus.topic}">${icon(focus.topic)}</span>
      <span class="ring-center-name t-${focus.topic}">${TOPICS[focus.topic].short}</span>
    </div>`;
  el.ringFocus.className = `ring-focus t-${focus.topic}`;
  el.ringFocus.innerHTML = focusSentence(focus);
  el.ringSuggest.className = `ring-suggest t-${focus.topic}`;
  el.ringSuggest.innerHTML = focusSuggestion(focus);
}

function focusSentence(f) {
  const name = `<b>${TOPICS[f.topic].short}</b>`;
  if (f.allEqual && f.days === 0) return `三個主題都還沒開始，今天先動 ${name}`;
  if (f.allEqual) return `三個主題照顧得很平均`;
  if (f.days === 0) return `近 7 天還沒練到 ${name}`;
  return `近 7 天 ${name} 練最少，只有 ${f.days} 天`;
}

// 每個主題的建議優先序（招牌動作在前，其餘依資料庫順序補在後）
const SUGGEST_PRIORITY = {
  shoulder: ["胸靠划船", "坐姿划船", "反向飛鳥", "胸椎伸展"],
  pelvis: ["死蟲", "髖關節外展", "臀推", "半跪姿髖屈肌伸展"],
  breath: ["後側呼吸擴張", "側面呼吸擴張", "橫膈膜放鬆", "前側胸腹同步擴張"],
};

// 取最近 n 個「有完成紀錄」的訓練日，回傳這些日子做過的動作 id 集合
function recentTrainingDoneIds(sessionCount) {
  const dates = Object.keys(state.sessions)
    .filter((iso) => iso <= todayISO())
    .filter((iso) => {
      const s = state.sessions[iso];
      return s && Object.keys(s.done).some((k) => s.done[k]);
    })
    .sort()
    .slice(-sessionCount);
  const ids = new Set();
  dates.forEach((iso) => {
    const s = state.sessions[iso];
    Object.keys(s.done).forEach((k) => { if (s.done[k]) ids.add(k); });
  });
  return ids;
}

// 主題的候選動作池：招牌優先序在前，其餘在後，排除「降強度」類
function topicSuggestPool(topic) {
  const all = allActions().filter((a) => a.topic === topic && a.type !== "reduce");
  const priority = SUGGEST_PRIORITY[topic] || [];
  const head = priority.map((n) => all.find((a) => a.name === n)).filter(Boolean);
  const headIds = new Set(head.map((a) => a.id));
  return [...head, ...all.filter((a) => !headIds.has(a.id))];
}

function focusSuggestion(f) {
  const done = recentTrainingDoneIds(2);
  const fresh = topicSuggestPool(f.topic).find((a) => !done.has(a.id));
  if (fresh) {
    return `<span class="suggest-pill">今日建議</span>加入 <b>${fresh.name}</b>`;
  }
  return `<span class="suggest-pill">今日建議</span><b>${TOPICS[f.topic].short}</b> 近期都顧到了，維持就好`;
}

/* ---------- 狀態評估 ---------- */
function computeStatus(topic) {
  const dates = recentDates(7);
  let count = 0;
  const scores = [];
  dates.forEach((iso) => {
    const s = state.sessions[iso];
    if (!s) return;
    const done = Object.keys(s.done).filter((k) => s.done[k]).map(getAction).filter(Boolean);
    if (done.some((a) => a.topic === topic)) count++;
    const mk = TOPICS[topic].metric;
    if (s.feeling && typeof s.feeling[mk] === "number") scores.push({ iso, v: s.feeling[mk] });
  });

  if (count === 0 && scores.length === 0) {
    return { label: "缺少資料", short: "缺資料", pill: "pill-none", detail: "近 7 天沒有這個主題的紀錄。" };
  }
  const recentScore = scores.length ? scores[scores.length - 1].v : null;
  let trend = 0;
  if (scores.length >= 2) trend = scores[scores.length - 1].v - scores[0].v;

  if (recentScore != null && trend > 1) {
    return { label: "可能刺激過多", short: "刺激過多", pill: "pill-over", detail: `症狀分數上升（${scores[0].v} → ${recentScore}），下次可降強度。` };
  }
  if (recentScore != null && recentScore >= 6 && count < 2) {
    return { label: "需要補強", short: "需補強", pill: "pill-need", detail: `緊繃偏高（${recentScore}/10）但近期練習少。` };
  }
  if (count === 0) {
    return { label: "需要補強", short: "需補強", pill: "pill-need", detail: "近 7 天沒有練習這個主題。" };
  }
  return { label: "穩定中", short: "穩定", pill: "pill-ok", detail: `近 7 天練了 ${count} 天${recentScore != null ? `，分數 ${recentScore}/10` : ""}。` };
}

function leadAction(topic) {
  const lead = { shoulder: "胸靠划船", pelvis: "死蟲 + 髖關節外展", breath: "後側呼吸擴張" };
  return lead[topic];
}

function buildAdvice(dates, cov) {
  const blocks = [];
  // 觀察：哪個主題覆蓋最低
  const lowest = [...TOPIC_ORDER].sort((a, b) => cov[a].count - cov[b].count)[0];
  const lowestEmpty = cov[lowest].count === 0;
  // 症狀高點
  let highSymptom = null;
  TOPIC_ORDER.forEach((t) => {
    const mk = TOPICS[t].metric;
    const last = lastScore(dates, mk);
    if (last != null && last >= 6 && (highSymptom == null || last > highSymptom.v)) highSymptom = { topic: t, v: last };
  });

  let observe = "";
  if (lowestEmpty) observe = `近 ${ui.period} 天「${TOPICS[lowest].short}」主題沒有紀錄。`;
  else observe = `近 ${ui.period} 天「${TOPICS[lowest].short}」主題覆蓋最少（${cov[lowest].count} 次）。`;
  if (highSymptom) observe += `「${TOPICS[highSymptom.topic].short}」相關緊繃仍偏高（${highSymptom.v}/10）。`;

  let cause = "";
  if (lowest === "breath") cause = "呼吸淺或後背擴張不足，可能讓肩頸與骨盆更容易代償。";
  else if (lowest === "shoulder") cause = "肩胛與背部練習不足，肩膀放鬆位置不容易建立。";
  else cause = "核心與臀髖穩定練習不足，前髖容易代償。";

  const recs = [];
  recs.push(`每次重訓前做 ${leadAction(lowest)} 6 次`);
  if (highSymptom) recs.push(`針對「${TOPICS[highSymptom.topic].short}」加入 ${leadAction(highSymptom.topic)}`);
  recs.push("工作日下午加入肩膀歸位重置");

  blocks.push(`<div class="advice-block"><h4>本週觀察</h4><p>${observe}</p></div>`);
  blocks.push(`<div class="advice-block"><h4>可能原因</h4><p>${cause}</p></div>`);
  blocks.push(`<div class="advice-block"><h4>下週建議</h4><ol>${recs.map((r) => `<li>${r}</li>`).join("")}</ol></div>`);
  return blocks.join("");
}

function lastScore(dates, key) {
  for (let i = dates.length - 1; i >= 0; i--) {
    const s = state.sessions[dates[i]];
    if (s && s.feeling && typeof s.feeling[key] === "number") return s.feeling[key];
  }
  return null;
}

/* ---------- 提醒 ---------- */
function renderReminders() {
  const today = todayISO();
  const checks = state.reminderChecks[today] || {};
  el.reminderList.innerHTML = "";
  REMINDERS.forEach((r) => {
    const done = !!checks[r.id];
    const card = document.createElement("div");
    card.className = "reminder-card" + (done ? " is-done" : "");
    card.innerHTML = `
      <span class="check-box" style="${done ? "background:var(--accent);border-color:var(--accent)" : ""}">${done ? "✓" : ""}</span>
      <span class="reminder-body">
        <span class="reminder-title ${done ? "is-done" : ""}">${r.title}</span>
        <span class="reminder-desc">${r.desc}</span>
        <span class="reminder-when">${r.when}</span>
      </span>`;
    card.addEventListener("click", () => {
      if (!state.reminderChecks[today]) state.reminderChecks[today] = {};
      state.reminderChecks[today][r.id] = !state.reminderChecks[today][r.id];
      saveState();
      renderReminders();
    });
    el.reminderList.appendChild(card);
  });
}

/* ---------- 每日感受表單（嵌在今日延伸入口下，簡化為快速記錄） ---------- */
// 為維持手機單欄體驗，感受記錄整合在延伸頁；此處保留資料結構供趨勢使用。

/* ---------- 資料存取 ---------- */
function allActions() {
  return [...DEFAULT_ACTIONS, ...state.customActions];
}
function getAction(id) {
  return allActions().find((a) => a.id === id) || null;
}
function getSession(iso) {
  if (!state.sessions[iso]) state.sessions[iso] = { date: iso, done: {}, details: {}, feeling: {} };
  return state.sessions[iso];
}
function sessionTopics(iso) {
  const s = state.sessions[iso];
  if (!s) return [];
  const done = Object.keys(s.done).filter((k) => s.done[k]).map(getAction).filter(Boolean);
  return TOPIC_ORDER.filter((t) => done.some((a) => a.topic === t));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return seedState();
}
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
function resetDemo() {
  state = seedState();
  saveState();
  ui.date = todayISO();
  ui.selectedDay = todayISO();
  ui.calMonth = startOfMonth(new Date());
  toast("已重置示範資料");
  goTab("home");
}

function seedState() {
  const s = { sessions: {}, customActions: [], reminderChecks: {} };
  // 用動作名稱對應 id，方便種資料
  const byName = {};
  DEFAULT_ACTIONS.forEach((a) => (byName[a.name] = a.id));
  const demo = [
    { offset: -5, done: ["胸靠划船", "肩膀歸位重置", "死蟲"], feeling: { shoulderTight: 6, hipTight: 5, breathShallow: 7 } },
    { offset: -3, done: ["後側呼吸擴張", "側面呼吸擴張", "髖關節外展", "單腳站"], feeling: { shoulderTight: 5, hipTight: 5, breathShallow: 6 } },
    { offset: -1, done: ["胸靠划船", "直臂下拉", "死蟲", "臀推", "前側胸腹同步擴張"], feeling: { shoulderTight: 4, hipTight: 4, breathShallow: 6 } },
  ];
  demo.forEach((d) => {
    const iso = dateOffsetISO(d.offset);
    const session = { date: iso, done: {}, details: {}, feeling: d.feeling };
    d.done.forEach((name) => {
      if (byName[name]) session.done[byName[name]] = true;
    });
    // 加一筆延伸示範
    if (d.offset === -1 && byName["胸靠划船"]) {
      session.details[byName["胸靠划船"]] = { sets: 3, reps: 12, pain: 0, tight: 4, comp: true, note: "胸口貼穩後比較能感覺背部出力" };
    }
    s.sessions[iso] = session;
  });
  return s;
}

/* ---------- 小工具 ---------- */
function toast(msg) {
  el.toast.textContent = msg;
  el.toast.classList.add("is-show");
  clearTimeout(el.toast._t);
  el.toast._t = setTimeout(() => el.toast.classList.remove("is-show"), 1600);
}
function escapeHTML(v) {
  return String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function todayISO() { return toISO(new Date()); }
function toISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function parseISO(v) {
  const [y, m, d] = v.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function startOfMonth(d) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function dateOffsetISO(off) { return toISO(addDays(new Date(), off)); }
function recentDates(count) {
  const out = [];
  for (let i = count - 1; i >= 0; i--) out.push(dateOffsetISO(-i));
  return out;
}
function formatDate(iso) {
  const d = parseISO(iso);
  const wk = ["日", "一", "二", "三", "四", "五", "六"][d.getDay()];
  return `${d.getMonth() + 1} 月 ${d.getDate()} 日（${wk}）`;
}
