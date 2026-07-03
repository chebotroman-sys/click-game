// Режимы и игроки
let gameMode = 1;

let player1Name = "Ученик 1";
let player2Name = "Ученик 2";

let player1Score = 0;
let player2Score = 0;
let activePlayer = 1;

// Таймеры и состояния
let timeLeft = 30;
let timer;
let curseTimer;
let moveTimer;
let buttonSize = 130;
let gameStarted = false;

// Текущий уровень (по умолчанию — самый простой)
let currentLevel = {
  key: "novice",
  time: 30,
  curseInterval: 1100,
  curseLife: 3000,
  buttonShrink: 3,
  minButtonSize: 90,
  buttonMoveInterval: 1400, // авто‑движение кнопки
  buttonBaseSize: 140,      // стартовый размер
  cursePenalty: 2,
  name: "Первый курс: Новобранец",
  recordKey: "arcaneRecordNovice"
};

// Уровни сложности: дальше — сложнее
const levels = {
  30: {
    key: "novice",
    time: 30,
    curseInterval: 1100,
    curseLife: 3000,
    buttonShrink: 3,
    minButtonSize: 90,
    buttonMoveInterval: 1400,
    buttonBaseSize: 140,
    cursePenalty: 2,
    name: "Первый курс: Новобранец",
    recordKey: "arcaneRecordNovice"
  },
  20: {
    key: "exam",
    time: 20,
    curseInterval: 850,
    curseLife: 2600,
    buttonShrink: 5,
    minButtonSize: 68,
    buttonMoveInterval: 950,
    buttonBaseSize: 130,
    cursePenalty: 3,
    name: "Экзамен мага: Архивные тени",
    recordKey: "arcaneRecordExam"
  },
  15: {
    key: "tower",
    time: 15,
    curseInterval: 550,
    curseLife: 2000,
    buttonShrink: 8,   // быстрее уменьшается
    minButtonSize: 48, // меньше минимум
    buttonMoveInterval: 550, // чаще «прыгает»
    buttonBaseSize: 120,
    cursePenalty: 5,
    name: "Запретная башня: Ступени Бездны",
    recordKey: "arcaneRecordTower"
  }
};

// Тексты
const sparkTexts = ["✨ Искра", "⚡ Молния", "🔮 Сфера", "🌟 Звезда", "💫 Вспышка"];
const curseTexts = ["☠️", "💀", "🕳️", "🧿"];

const professorPhrases = [
  "Профессор поднял бровь. Это редко к добру.",
  "Где-то в аудитории нервно скрипнул мел.",
  "Портреты директоров сделали вид, что всё под контролем.",
  "Профессор записал что-то в журнал. Лучше бы это был плюс.",
  "Магия шипит. Значит, ты почти справляешься."
];

const cursePhrases = [
  "Проклятие! Минус мана. Кто вообще положил это на экзамене?",
  "Ай. Совет магов это видел.",
  "Проклятие щёлкнуло по пальцам. Неприятно, зато поучительно.",
  "Мана утекла. Профессор сделал вид, что не смеётся.",
  "Это было не заклинание. Это была проблема."
];

// DOM
const scoreText = document.getElementById("score");
const timerText = document.getElementById("timer");
const recordText = document.getElementById("record");
const button = document.getElementById("clickButton");
const playArea = document.getElementById("playArea");
const message = document.getElementById("message");
const restartButton = document.getElementById("restartButton");
const levelButtons = document.querySelectorAll(".level");

// Окно истории и инструкций
const introOverlay = document.getElementById("introOverlay");
const introContinueButton = document.getElementById("introContinueButton");

// Окно выбора режима/имён
const setupOverlay = document.getElementById("setupOverlay");
const setupPlayer1 = document.getElementById("setupPlayer1");
const setupPlayer2 = document.getElementById("setupPlayer2");
const setupPlayer2Wrap = document.getElementById("setupPlayer2Wrap");
const startSetupButton = document.getElementById("startSetupButton");
const modeCards = document.querySelectorAll(".mode-card");
let selectedSetupMode = 1;

// Аудио
let audioContext;

// Утилиты
function updateLevelBackground() {
  document.body.classList.remove(
    "level-novice-bg",
    "level-exam-bg",
    "level-tower-bg"
  );

  if (currentLevel.key === "novice") {
    document.body.classList.add("level-novice-bg");
  }

  if (currentLevel.key === "exam") {
    document.body.classList.add("level-exam-bg");
  }

  if (currentLevel.key === "tower") {
    document.body.classList.add("level-tower-bg");
  }
}
function getRandomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function getRecordKey() {
  return gameMode === 2 ? currentLevel.recordKey + "TwoPlayers" : currentLevel.recordKey;
}

function getRecord() {
  const savedRecord = localStorage.getItem(getRecordKey());
  return savedRecord === null ? 0 : Number(savedRecord);
}

function saveRecord(value) {
  localStorage.setItem(getRecordKey(), value);
}

function updateRecordText() {
  recordText.textContent = getRecord() + " маны";
}

function getActivePlayerName() {
  return activePlayer === 1 ? player1Name : player2Name;
}

function getTotalScore() {
  return gameMode === 1 ? player1Score : player1Score + player2Score;
}

function updateScoreText() {
  if (gameMode === 1) {
    scoreText.textContent = player1Score + " маны";
    return;
  }
  scoreText.textContent =
    player1Name + ": " + player1Score + " маны | " + player2Name + ": " + player2Score + " маны";
}

function updateWaitingMessage() {
  if (gameMode === 1) {
    message.textContent = "Испытание «" + currentLevel.name + "». Поймай первую искру, чтобы запустить экзамен.";
    return;
  }
  message.textContent =
    "Испытание «" + currentLevel.name + "». Первым кастует " + player1Name + ". Поймайте первую искру, чтобы запустить дуэль.";
}

function updateTurnMessage() {
  if (gameMode === 1) {
    message.textContent = getRandomItem(professorPhrases);
    return;
  }
  message.textContent = "Сейчас кастует: " + getActivePlayerName() + ". Проклятия не трогать. Профессор смотрит.";
}

function switchPlayer() {
  if (gameMode === 1) return;
  activePlayer = activePlayer === 1 ? 2 : 1;
  updateTurnMessage();
}

// Звук
function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

function playSound(frequency, duration, type, volume) {
  const context = getAudioContext();
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gainNode.gain.value = volume;
  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  oscillator.start();
  gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
  oscillator.stop(context.currentTime + duration);
}

function playClickSound() {
  playSound(760, 0.07, "sine", 0.12);
  setTimeout(function () {
    playSound(1040, 0.08, "sine", 0.08);
  }, 45);
}

function playCurseSound() {
  playSound(90, 0.2, "sawtooth", 0.16);
  setTimeout(function () {
    playSound(55, 0.18, "square", 0.08);
  }, 70);
}

function playEndSound() {
  playSound(330, 0.14, "triangle", 0.12);
  setTimeout(function () {
    playSound(260, 0.16, "triangle", 0.12);
  }, 130);
}

function playRecordSound() {
  playSound(520, 0.1, "sine", 0.14);
  setTimeout(function () {
    playSound(690, 0.1, "sine", 0.14);
  }, 100);
  setTimeout(function () {
    playSound(880, 0.16, "sine", 0.14);
  }, 210);
  setTimeout(function () {
    playSound(1120, 0.2, "sine", 0.12);
  }, 340);
}

function vibrate(time) {
  if (navigator.vibrate) {
    navigator.vibrate(time);
  }
}

// Движение
function moveElement(element) {
  const areaWidth = playArea.clientWidth;
  const areaHeight = playArea.clientHeight;
  const elementWidth = element.offsetWidth;
  const elementHeight = element.offsetHeight;
  const maxX = Math.max(0, areaWidth - elementWidth);
  const maxY = Math.max(0, areaHeight - elementHeight);
  const x = Math.floor(Math.random() * (maxX + 1));
  const y = Math.floor(Math.random() * (maxY + 1));
  element.style.left = x + "px";
  element.style.top = y + "px";
}

// Логика старта
function startTimerAndCurses() {
  if (gameStarted) return;
  gameStarted = true;
  updateTurnMessage();

  // Таймер времени
  timer = setInterval(function () {
    timeLeft--;
    timerText.textContent = timeLeft;
    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);

  // Появление проклятий
  curseTimer = setInterval(function () {
    createCurse();
  }, currentLevel.curseInterval);

  // Авто‑движение кнопки: чем сложнее, тем чаще
  moveTimer = setInterval(function () {
    moveElement(button);
  }, currentLevel.buttonMoveInterval);
}

function createCurse() {
  if (!gameStarted || timeLeft <= 0) return;

  const curse = document.createElement("button");
  curse.className = "bomb";
  curse.textContent = getRandomItem(curseTexts);
  curse.title = "Проклятие! Не трогать!";
  playArea.appendChild(curse);
  moveElement(curse);

  function hitCurse(event) {
    event.preventDefault();
    if (timeLeft <= 0) return;
    if (!curse.parentElement) return;

    if (gameMode === 1 || activePlayer === 1) {
      player1Score = Math.max(0, player1Score - currentLevel.cursePenalty);
    } else {
      player2Score = Math.max(0, player2Score - currentLevel.cursePenalty);
    }

    updateScoreText();
    message.textContent = getRandomItem(cursePhrases);
    playCurseSound();
    vibrate(120);

    curse.remove();
    switchPlayer();
  }

  curse.addEventListener("pointerdown", hitCurse);

  setTimeout(function () {
    curse.remove();
  }, currentLevel.curseLife);
}

function clearCurses() {
  document.querySelectorAll(".bomb").forEach(function (curse) {
    curse.remove();
  });
}

function prepareGame() {
  clearInterval(timer);
  clearInterval(curseTimer);
  clearInterval(moveTimer);
  clearCurses();

  gameStarted = false;

  player1Score = 0;
  player2Score = 0;
  activePlayer = 1;

timeLeft = currentLevel.time;
buttonSize = currentLevel.buttonBaseSize;

updateLevelBackground();

updateScoreText();
timerText.textContent = timeLeft;
updateRecordText();
updateWaitingMessage();


  button.disabled = false;
  button.textContent = getRandomItem(sparkTexts);
  button.style.width = buttonSize + "px";
  button.style.height = "55px";

  restartButton.style.display = "none";

  moveElement(button);
}

function getResultText() {
  if (gameMode === 1) {
    return "Экзамен окончен! " + player1Name + " собрал " + player1Score + " маны";
  }
  if (player1Score > player2Score) {
    return "Победил " + player1Name + "! Совет магов одобрительно шуршит мантиями. " +
      player1Name + ": " + player1Score + " маны, " +
      player2Name + ": " + player2Score + " маны";
  }
  if (player2Score > player1Score) {
    return "Победил " + player2Name + "! Профессор делает вид, что всегда в него верил. " +
      player1Name + ": " + player1Score + " маны, " +
      player2Name + ": " + player2Score + " маны";
  }
  return "Ничья! Профессор вздохнул и назначил переэкзаменовку. " +
    player1Name + ": " + player1Score + " маны, " +
    player2Name + ": " + player2Score + " маны";
}

function endGame() {
  clearInterval(timer);
  clearInterval(curseTimer);
  clearInterval(moveTimer);
  clearCurses();

  gameStarted = false;

  const totalScore = getTotalScore();
  const currentRecord = getRecord();
  const resultText = getResultText();

  button.disabled = true;
  button.textContent = "Экзамен окончен";
  restartButton.style.display = "inline-block";

  if (totalScore > currentRecord) {
    saveRecord(totalScore);
    updateRecordText();
    message.textContent =
      resultText +
      ". Новый рекорд академии на испытании «" +
      currentLevel.name +
      "»: " +
      totalScore +
      " маны 🔥";
    playRecordSound();
    vibrate([80, 50, 80]);
  } else {
    message.textContent = resultText + ". Лучший результат академии: " + currentRecord + " маны";
    playEndSound();
    vibrate(80);
  }
}

// Кнопка искры
button.addEventListener("pointerdown", function (event) {
  event.preventDefault();
  if (timeLeft <= 0) return;

  startTimerAndCurses();

  if (gameMode === 1 || activePlayer === 1) {
    player1Score++;
  } else {
    player2Score++;
  }

  updateScoreText();

  button.textContent = getRandomItem(sparkTexts);

  playClickSound();
  vibrate(25);

  if (buttonSize > currentLevel.minButtonSize) {
    buttonSize = buttonSize - currentLevel.buttonShrink;
    button.style.width = buttonSize + "px";
  }

  moveElement(button);
  switchPlayer();
});

// Рестарт — вернуться к окну выбора
restartButton.addEventListener("click", function () {
  showSetupPanel();
});

// Кнопки уровней
levelButtons.forEach(function (levelButton) {
  levelButton.addEventListener("click", function () {
    levelButtons.forEach(function (b) {
      b.classList.remove("active");
    });
    levelButton.classList.add("active");

    const selectedTime = Number(levelButton.dataset.time);
    currentLevel = levels[selectedTime] || currentLevel;

    prepareGame();
  });

  // Подписи уровней на названия
  const t = Number(levelButton.dataset.time);
  if (levels[t]) {
    levelButton.textContent = levels[t].name;
  }
});

// Окно выбора режима/имён
function selectSetupMode(mode) {
  selectedSetupMode = mode;
  modeCards.forEach(function (card) {
    const cardMode = Number(card.dataset.mode);
    if (cardMode === mode) {
      card.classList.add("active");
    } else {
      card.classList.remove("active");
    }
  });
  if (mode === 2) {
    setupPlayer2Wrap.classList.remove("hidden");
  } else {
    setupPlayer2Wrap.classList.add("hidden");
  }
}

function showSetupPanel() {
  clearInterval(timer);
  clearInterval(curseTimer);
  clearInterval(moveTimer);
  clearCurses();

  gameStarted = false;

  setupOverlay.classList.add("show");

  button.disabled = true;
  button.textContent = "Ждём ученика";
  restartButton.style.display = "none";

  message.textContent = "Заполни экзаменационный свиток и начни испытание.";
}

function startGameFromSetup() {
  gameMode = selectedSetupMode;

  const firstName = setupPlayer1.value.trim();
  const secondName = setupPlayer2.value.trim();

  player1Name = firstName !== "" ? firstName : "Ученик 1";
  player2Name = gameMode === 2 ? (secondName !== "" ? secondName : "Ученик 2") : "Ученик 2";

  setupOverlay.classList.remove("show");
  prepareGame();
}

// Окно истории/инструкций
function showIntroPanel() {
  introOverlay.classList.add("show");
}

function hideIntroPanel() {
  introOverlay.classList.remove("show");
}

// Обработчики стартовых окон
modeCards.forEach(function (card) {
  card.addEventListener("click", function () {
    const mode = Number(card.dataset.mode);
    selectSetupMode(mode);
  });
});

startSetupButton.addEventListener("click", function () {
  startGameFromSetup();
});

if (introContinueButton) {
  introContinueButton.addEventListener("click", function () {
    hideIntroPanel();
    showSetupPanel();
  });
}

// Значения по умолчанию на загрузке
selectSetupMode(1);
updateLevelBackground();
showIntroPanel();