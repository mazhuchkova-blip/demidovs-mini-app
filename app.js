const eventGrid = document.getElementById('eventGrid');
const ctaBlock = document.getElementById('ctaBlock');
const toast = document.getElementById('toast');
const tabItems = document.querySelectorAll('.tabbar__item');

const viewHome = document.getElementById('viewHome');
const viewMatch = document.getElementById('viewMatch');
const viewHosts = document.getElementById('viewHosts');
const viewDate = document.getElementById('viewDate');

const matchTopbar = document.getElementById('matchTopbar');
const matchBack = document.getElementById('matchBack');
const matchProgressText = document.getElementById('matchProgressText');
const matchProgressFill = document.getElementById('matchProgressFill');
const matchContext = document.getElementById('matchContext');
const matchContextEvent = document.getElementById('matchContextEvent');

const panelEvent = document.getElementById('panelEvent');
const panelStep1 = document.getElementById('panelStep1');
const panelStep2 = document.getElementById('panelStep2');
const panelStep3 = document.getElementById('panelStep3');
const panelResult = document.getElementById('panelResult');

const matchEventGrid = document.getElementById('matchEventGrid');
const matchStep1Grid = document.getElementById('matchStep1Grid');
const matchStep2Grid = document.getElementById('matchStep2Grid');
const matchStep3List = document.getElementById('matchStep3List');
const btnShowResult = document.getElementById('btnShowResult');

let toastTimer = null;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('toast--visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('toast--visible');
  }, 2500);
}

/* ---------- Home screen (unchanged behaviour) ---------- */

eventGrid.addEventListener('click', (e) => {
  const card = e.target.closest('.event-card');
  if (!card) return;

  eventGrid.querySelectorAll('.event-card').forEach((el) => {
    el.classList.remove('event-card--selected');
  });
  card.classList.add('event-card--selected');

  matchState.eventType = card.dataset.event;
  ctaBlock.classList.add('cta--visible');
});

document.getElementById('ctaMatch').addEventListener('click', () => {
  openMatch();
});

document.getElementById('ctaDate').addEventListener('click', () => {
  openDate();
});

/* ---------- View switching ---------- */

function showView(name) {
  viewHome.hidden = name !== 'home';
  viewMatch.hidden = name !== 'match';
  viewHosts.hidden = name !== 'hosts';
  viewDate.hidden = name !== 'date';

  tabItems.forEach((item) => {
    const isRelevant = ['home', 'match', 'hosts', 'date'].includes(item.dataset.tab);
    if (!isRelevant) return;
    item.classList.toggle('tabbar__item--active', item.dataset.tab === name);
  });

  window.scrollTo(0, 0);
}

tabItems.forEach((item) => {
  item.addEventListener('click', () => {
    const tab = item.dataset.tab;
    if (tab === 'home') {
      showView('home');
      return;
    }
    if (tab === 'match') {
      openMatch();
      return;
    }
    if (tab === 'hosts') {
      openHosts();
      return;
    }
    if (tab === 'date') {
      openDate();
      return;
    }
  });
});

/* ---------- Match (Подбор) flow ---------- */

const EVENT_LABELS = {
  wedding: 'СВАДЬБА',
  corporate: 'КОРПОРАТИВ',
  anniversary: 'ЮБИЛЕЙ',
  private: 'ЧАСТНОЕ СОБЫТИЕ',
};

const matchState = {
  eventType: null,
  answers: { guests: null, vibe: null, priorities: [] },
};

let lastRecommendation = null;

function resetAnswers() {
  matchState.answers = { guests: null, vibe: null, priorities: [] };
  [matchStep1Grid, matchStep2Grid].forEach((grid) => {
    grid.querySelectorAll('.event-card').forEach((el) => el.classList.remove('event-card--selected'));
  });
  matchStep3List.querySelectorAll('.event-card').forEach((el) => el.classList.remove('event-card--selected'));
  btnShowResult.disabled = true;
}

function openMatch() {
  showView('match');
  resetAnswers();

  matchEventGrid.querySelectorAll('.event-card').forEach((el) => {
    el.classList.toggle('event-card--selected', el.dataset.event === matchState.eventType);
  });

  showPanel(matchState.eventType ? '1' : 'event');
}

function updateContext() {
  if (matchState.eventType) {
    matchContextEvent.textContent = EVENT_LABELS[matchState.eventType] || '';
    matchContext.hidden = false;
  } else {
    matchContext.hidden = true;
  }
}

function showPanel(panel) {
  [panelEvent, panelStep1, panelStep2, panelStep3, panelResult].forEach((p) => {
    p.hidden = p.dataset.panel !== panel;
  });

  const isQuestionStep = panel === '1' || panel === '2' || panel === '3';
  matchTopbar.hidden = !isQuestionStep;
  updateContext();
  if (panel === 'event' || panel === 'result') {
    matchContext.hidden = true;
  }

  matchBack.hidden = panel === '1';

  if (isQuestionStep) {
    const stepNumber = { '1': 1, '2': 2, '3': 3 }[panel];
    matchProgressText.textContent = `${stepNumber} / 3`;
    matchProgressFill.style.width = `${(stepNumber / 3) * 100}%`;
  }
}

matchBack.addEventListener('click', () => {
  const current = [panelEvent, panelStep1, panelStep2, panelStep3, panelResult]
    .find((p) => !p.hidden).dataset.panel;

  if (current === '2') showPanel('1');
  else if (current === '3') showPanel('2');
});

matchEventGrid.addEventListener('click', (e) => {
  const card = e.target.closest('.event-card');
  if (!card) return;

  matchEventGrid.querySelectorAll('.event-card').forEach((el) => el.classList.remove('event-card--selected'));
  card.classList.add('event-card--selected');
  matchState.eventType = card.dataset.event;

  setTimeout(() => showPanel('1'), 250);
});

matchStep1Grid.addEventListener('click', (e) => {
  const card = e.target.closest('.event-card');
  if (!card) return;

  matchStep1Grid.querySelectorAll('.event-card').forEach((el) => el.classList.remove('event-card--selected'));
  card.classList.add('event-card--selected');
  matchState.answers.guests = card.dataset.value;

  setTimeout(() => showPanel('2'), 250);
});

matchStep2Grid.addEventListener('click', (e) => {
  const card = e.target.closest('.event-card');
  if (!card) return;

  matchStep2Grid.querySelectorAll('.event-card').forEach((el) => el.classList.remove('event-card--selected'));
  card.classList.add('event-card--selected');
  matchState.answers.vibe = card.dataset.value;

  setTimeout(() => showPanel('3'), 250);
});

matchStep3List.addEventListener('click', (e) => {
  const card = e.target.closest('.event-card');
  if (!card) return;

  const value = card.dataset.value;
  const index = matchState.answers.priorities.indexOf(value);

  if (index === -1) {
    matchState.answers.priorities.push(value);
    card.classList.add('event-card--selected');
  } else {
    matchState.answers.priorities.splice(index, 1);
    card.classList.remove('event-card--selected');
  }

  btnShowResult.disabled = matchState.answers.priorities.length === 0;
});

btnShowResult.addEventListener('click', () => {
  renderResult();
  showPanel('result');
});

/* ---------- Scoring ---------- */

const SCORES_STEP2 = {
  light: { petr: 2 },
  emotional: { natalia: 2 },
  dynamic: { petr: 2 },
  balance: { duet: 3 },
};

const SCORES_STEP3 = {
  humor: { petr: 2 },
  ceremony: { natalia: 2 },
  attention: { petr: 1, natalia: 1 },
  control: { natalia: 1, duet: 1 },
};

const GUEST_BONUS = {
  under30: {},
  '30-70': {},
  '70-120': { duet: 0.5 },
  '120+': { duet: 1 },
};

function computeScores() {
  const scores = { petr: 0, natalia: 0, duet: 0 };
  const add = (map) => {
    for (const key in map) scores[key] += map[key];
  };

  add(SCORES_STEP2[matchState.answers.vibe] || {});
  matchState.answers.priorities.forEach((p) => add(SCORES_STEP3[p] || {}));
  add(GUEST_BONUS[matchState.answers.guests] || {});

  return scores;
}

function decideResult(scores) {
  const { petr, natalia, duet } = scores;
  const maxPN = Math.max(petr, natalia);
  const diffPN = Math.abs(petr - natalia);

  if (duet >= maxPN) {
    return { primary: 'duet', alternative: null };
  }

  if (diffPN <= 1) {
    return { primary: 'duet', alternative: petr >= natalia ? 'petr' : 'natalia' };
  }

  const primary = petr > natalia ? 'petr' : 'natalia';
  const secondary = primary === 'petr' ? 'natalia' : 'petr';
  const primaryScore = primary === 'petr' ? petr : natalia;
  const secondaryScore = primary === 'petr' ? natalia : petr;
  const alternative = (primaryScore - secondaryScore) <= 2 ? secondary : null;

  return { primary, alternative };
}

/* ---------- Result rendering ---------- */

const PERSONAS = {
  petr: {
    name: 'ПЁТР',
    role: 'ВЕДУЩИЙ',
    photo: 'http://demidovs.ru/images/petr-hero-original.jpg',
    price: 'от 70 000 ₽',
    hours: '6 часов',
    explanation: 'Вы хотите лёгкости, юмора и живой импровизации. Пётр мягко вовлекает гостей и держит зал в тонусе без давления.',
  },
  natalia: {
    name: 'НАТАЛЬЯ',
    role: 'ВЕДУЩАЯ',
    photo: 'http://demidovs.ru/images/natalia-hero-new.webp',
    price: 'от 70 000 ₽',
    hours: '6 часов',
    explanation: 'Для вас важны эмоции, церемония и внимание к гостям. Наталья выстраивает драматургию вечера, эмоциональные переходы и финал.',
  },
  duet: {
    name: 'ПЁТР & НАТАЛЬЯ',
    role: 'ДУЭТ ВЕДУЩИХ',
    photo: 'http://demidovs.ru/images/duet-hero-premium.jpg',
    price: '120 000 ₽',
    hours: '6 часов',
    explanation: 'Вы хотите, чтобы в вечере были и лёгкость, и эмоции. В дуэте Пётр отвечает за юмор и импровизацию, Наталья — за драматургию, церемонию и эмоциональные моменты.',
  },
};

function renderResult() {
  const scores = computeScores();
  const { primary, alternative } = decideResult(scores);
  lastRecommendation = primary;
  const p = PERSONAS[primary];

  let altHtml = '';
  if (alternative) {
    const a = PERSONAS[alternative];
    altHtml = `
      <div class="result__alt">
        <p class="result__alt-label">Ещё один вариант</p>
        <div class="result__alt-card">
          <img class="result__alt-photo" src="${a.photo}" alt="${a.name}">
          <div class="result__alt-info">
            <p class="result__alt-name">${a.name}</p>
            <p class="result__alt-price">${a.price} · ${a.hours}</p>
          </div>
        </div>
      </div>`;
  }

  panelResult.innerHTML = `
    <div class="result__photo-wrap">
      <img class="result__photo" src="${p.photo}" alt="${p.name}">
    </div>
    <p class="result__kicker">Вам может подойти</p>
    <h1 class="result__name">${p.name}</h1>
    <p class="result__role">${p.role}</p>
    <p class="result__explanation">${p.explanation}</p>
    <div class="result__price">
      <span class="result__price-value">${p.price}</span>
      <span class="result__price-hours">${p.hours} ведения</span>
    </div>
    <div class="result__actions">
      <button class="cta__button cta__button--primary" id="resultSeeAction" type="button">ПОСМОТРЕТЬ В ДЕЛЕ</button>
      <button class="cta__button cta__button--secondary" id="resultCheckDate" type="button">ПРОВЕРИТЬ ДАТУ</button>
    </div>
    ${altHtml}
  `;

  document.getElementById('resultSeeAction').addEventListener('click', () => {
    showToast('Раздел будет добавлен на следующем этапе');
  });
  document.getElementById('resultCheckDate').addEventListener('click', () => {
    openDate();
  });
}

/* ---------- Hosts (Ведущие) ---------- */

const HOST_VIDEOS = {
  petr: {
    src: 'http://demidovs.ru/media/videos/showreel.mp4',
    poster: 'http://demidovs.ru/images/petr-hero-original.jpg',
    caption: 'Шоурил',
  },
  natalia: {
    src: 'http://demidovs.ru/media/videos/showreel.mp4',
    poster: 'http://demidovs.ru/images/natalia-hero-new.webp',
    caption: 'Шоурил',
  },
  duet: {
    src: 'http://demidovs.ru/media/videos/about-us.mp4',
    poster: 'http://demidovs.ru/images/duet-hero-premium.jpg',
    caption: 'Знакомство',
  },
};

const recoBadges = {
  petr: document.getElementById('recoPetr'),
  natalia: document.getElementById('recoNatalia'),
  duet: document.getElementById('recoDuet'),
};

let pendingDateSource = null;

function openHosts() {
  showView('hosts');

  Object.keys(recoBadges).forEach((key) => {
    recoBadges[key].hidden = key !== lastRecommendation;
  });
}

viewHosts.addEventListener('click', (e) => {
  const watchBtn = e.target.closest('.host-card__watch');
  if (watchBtn) {
    openVideo(watchBtn.dataset.host);
    return;
  }

  const dateBtn = e.target.closest('.host-card__date');
  if (dateBtn) {
    pendingDateSource = dateBtn.dataset.host;
    openDate();
  }
});

/* ---------- Video modal ---------- */

const videoModal = document.getElementById('videoModal');
const videoModalPlayer = document.getElementById('videoModalPlayer');
const videoModalCaption = document.getElementById('videoModalCaption');
const videoModalClose = document.getElementById('videoModalClose');
const videoModalBackdrop = document.getElementById('videoModalBackdrop');

function openVideo(hostKey) {
  const v = HOST_VIDEOS[hostKey];
  if (!v) return;

  videoModalPlayer.src = v.src;
  videoModalPlayer.poster = v.poster;
  videoModalCaption.textContent = v.caption;
  videoModal.hidden = false;
}

function closeVideo() {
  videoModal.hidden = true;
  videoModalPlayer.pause();
  videoModalPlayer.removeAttribute('src');
  videoModalPlayer.load();
}

videoModalClose.addEventListener('click', closeVideo);
videoModalBackdrop.addEventListener('click', closeVideo);

/* ---------- Date (Дата) ---------- */

const dateForm = document.getElementById('dateForm');
const dateSuccess = document.getElementById('dateSuccess');
const datePickerBtn = document.getElementById('datePickerBtn');
const dateInput = document.getElementById('dateInput');
const dateUnknownCheckbox = document.getElementById('dateUnknownCheckbox');
const dateEventGrid = document.getElementById('dateEventGrid');
const dateHostList = document.getElementById('dateHostList');
const nameInput = document.getElementById('nameInput');
const contactTypeGrid = document.getElementById('contactTypeGrid');
const phoneInput = document.getElementById('phoneInput');
const telegramInput = document.getElementById('telegramInput');
const privacyConsentCheckbox = document.getElementById('privacyConsent');
const dateSubmitBtn = document.getElementById('dateSubmitBtn');
const dateHomeBtn = document.getElementById('dateHomeBtn');

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

dateInput.min = todayISO();

const dateState = {
  date: null,
  dateUnknown: false,
  eventType: null,
  host: null,
  name: '',
  contactType: null,
  contact: '',
  privacyConsent: false,
};

function updateDateSubmitState() {
  const dateOk = Boolean(dateState.date) || dateState.dateUnknown;

  const isValid = Boolean(
    dateOk &&
    dateState.eventType &&
    dateState.host &&
    dateState.name.trim() &&
    dateState.contactType &&
    dateState.contact.trim() &&
    dateState.privacyConsent
  );
  dateSubmitBtn.disabled = !isValid;
  dateSubmitBtn.textContent = dateState.dateUnknown ? 'ОБСУДИТЬ МЕРОПРИЯТИЕ' : 'ПРОВЕРИТЬ ДАТУ';
}

function resetDatePicker() {
  dateState.date = null;
  dateInput.value = '';
  datePickerBtn.textContent = 'Выбрать дату';
  datePickerBtn.classList.remove('date-picker-btn--filled');
}

function openDate() {
  showView('date');

  dateForm.hidden = false;
  dateSuccess.hidden = true;

  dateState.eventType = matchState.eventType || null;
  dateState.host = pendingDateSource || lastRecommendation || null;
  dateState.name = '';
  dateState.contactType = null;
  dateState.contact = '';
  dateState.dateUnknown = false;
  dateState.privacyConsent = false;

  resetDatePicker();
  dateUnknownCheckbox.checked = false;
  privacyConsentCheckbox.checked = false;
  nameInput.value = '';
  phoneInput.value = '';
  telegramInput.value = '';
  phoneInput.hidden = true;
  telegramInput.hidden = true;

  dateEventGrid.querySelectorAll('.event-card').forEach((el) => {
    el.classList.toggle('event-card--selected', el.dataset.event === dateState.eventType);
  });
  dateHostList.querySelectorAll('.event-card').forEach((el) => {
    el.classList.toggle('event-card--selected', el.dataset.host === dateState.host);
  });
  contactTypeGrid.querySelectorAll('.event-card').forEach((el) => {
    el.classList.remove('event-card--selected');
  });

  updateDateSubmitState();
}

datePickerBtn.addEventListener('click', () => {
  if (typeof dateInput.showPicker === 'function') {
    dateInput.showPicker();
  } else {
    dateInput.focus();
    dateInput.click();
  }
});

dateInput.addEventListener('change', () => {
  if (dateInput.value && dateInput.value < todayISO()) {
    resetDatePicker();
    showToast('Нельзя выбрать прошедшую дату');
    updateDateSubmitState();
    return;
  }

  dateState.date = dateInput.value || null;

  if (dateState.date) {
    const parsed = new Date(`${dateState.date}T00:00:00`);
    const formatted = parsed.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    datePickerBtn.textContent = formatted.replace(/\s*г\.$/, '');
    datePickerBtn.classList.add('date-picker-btn--filled');

    dateState.dateUnknown = false;
    dateUnknownCheckbox.checked = false;
  } else {
    resetDatePicker();
  }

  updateDateSubmitState();
});

dateUnknownCheckbox.addEventListener('change', () => {
  dateState.dateUnknown = dateUnknownCheckbox.checked;

  if (dateState.dateUnknown) {
    resetDatePicker();
  }

  updateDateSubmitState();
});

privacyConsentCheckbox.addEventListener('change', () => {
  dateState.privacyConsent = privacyConsentCheckbox.checked;
  updateDateSubmitState();
});

document.getElementById('privacyLink').addEventListener('click', (e) => {
  e.stopPropagation();
});

dateEventGrid.addEventListener('click', (e) => {
  const card = e.target.closest('.event-card');
  if (!card) return;

  dateEventGrid.querySelectorAll('.event-card').forEach((el) => el.classList.remove('event-card--selected'));
  card.classList.add('event-card--selected');
  dateState.eventType = card.dataset.event;
  updateDateSubmitState();
});

dateHostList.addEventListener('click', (e) => {
  const card = e.target.closest('.event-card');
  if (!card) return;

  dateHostList.querySelectorAll('.event-card').forEach((el) => el.classList.remove('event-card--selected'));
  card.classList.add('event-card--selected');
  dateState.host = card.dataset.host;
  updateDateSubmitState();
});

nameInput.addEventListener('input', () => {
  dateState.name = nameInput.value;
  updateDateSubmitState();
});

contactTypeGrid.addEventListener('click', (e) => {
  const card = e.target.closest('.event-card');
  if (!card) return;

  contactTypeGrid.querySelectorAll('.event-card').forEach((el) => el.classList.remove('event-card--selected'));
  card.classList.add('event-card--selected');
  dateState.contactType = card.dataset.contact;
  dateState.contact = '';

  phoneInput.hidden = dateState.contactType !== 'phone';
  telegramInput.hidden = dateState.contactType !== 'telegram';
  phoneInput.value = '';
  telegramInput.value = '';

  updateDateSubmitState();
});

phoneInput.addEventListener('input', () => {
  dateState.contact = phoneInput.value;
  updateDateSubmitState();
});

telegramInput.addEventListener('input', () => {
  dateState.contact = telegramInput.value;
  updateDateSubmitState();
});

dateSubmitBtn.addEventListener('click', () => {
  const payload = {
    date: dateState.dateUnknown ? null : dateState.date,
    dateUnknown: dateState.dateUnknown,
    eventType: dateState.eventType,
    host: dateState.host,
    name: dateState.name.trim(),
    contactType: dateState.contactType,
    contact: dateState.contact.trim(),
    privacyConsent: dateState.privacyConsent,
  };

  console.log('Заявка на проверку даты:', payload);

  dateForm.hidden = true;
  dateSuccess.hidden = false;
});

dateHomeBtn.addEventListener('click', () => {
  showView('home');
});
