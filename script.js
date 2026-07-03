let gameMode = 1;

let player1Name = "Игрок 1";
let player2Name = "Игрок 2";

let player1Score = 0;
let player2Score = 0;
let activePlayer = 1;

let timeLeft = 30;
let timer;
let bombTimer;
let buttonSize = 130;
let gameStarted = false;

let currentLevelKey = "easy";

let currentLevel = {
  time: 30,
  bombInterval: 1200,
  bombLife: 3200,
  buttonShrink: 2,
  minButtonSize: 80,
  bombPenalty: 2,
  name: "Лёгкий",
  recordKey: "clickerRecordEasy"
};

const levels = {
  30: {
    key: "easy",
    time: 30,
    bombInterval: 1200,
    bombLife: 3200,
    buttonShrink: 2,
    minButtonSize: 80,
    bombPenalty: 2,
    name: "Лёгкий",
    recordKey: "clickerRecordEasy"
  },
  20: {
    key: "normal",
    time: 20,
    bombInterval: 900,
    bombLife: 2800,
    buttonShrink: 3,
    minButtonSize: 70,
    bombPenalty: 3,
    name: "Нормальный",
    recordKey: "clickerRecordNormal"
  },
  15: {
    key: "hard",
    time: 15,
    bombInterval: 650,
    bombLife: 2300,
    buttonShrink: 5,
    minButtonSize: 55,
    bombPenalty: 5,
    name: "Хард",
    recordKey: "clickerRecordHard"
  }
};

const scoreText = document.getElementById("score");
const timerText = document.getElementById("timer");
const recordText = document.getElementById("record");
const button = document.getElementById("clickButton");
const playArea = document.getElementById("playArea");
const message = document.getElementById("message");
const restartButton = document.getElementById("restartButton");
const levelButtons = document.querySelectorAll(".level");

function askGameMode() {
  const selectedMode = prompt("Выберите режим: 1 — один игрок, 2 — два игрока", "1");

  if (selectedMode === "2") {
    gameMode = 2;

    const firstName = prompt("Введите имя первого игрока:", "Игрок 1");
    const secondName = prompt("Введите имя второго игрока:", "Игрок 2");

    player1Name = firstName && firstName.trim() !== "" ? firstName.trim() : "Игрок 1";
    player2Name = secondName && secondName.trim() !== "" ? secondName.trim() : "Игрок 2";
  } else {
    gameMode = 1;

    const firstName = prompt("Введите имя игрока:", "Игрок 1");

    player1Name = firstName && firstName.trim() !== "" ? firstName.trim() : "Игрок 1";
    player2Name = "Игрок 2";
  }
}

function getRecordKey() {
  if (gameMode === 2) {
    return currentLevel.recordKey + "TwoPlayers";
  }

  return currentLevel.recordKey;
}

function getRecord() {
  const savedRecord = localStorage.getItem(getRecordKey());

  if (savedRecord === null) {
    return 0;
  }

  return Number(savedRecord);
}

function saveRecord(value) {
  localStorage.setItem(getRecordKey(), value);
}

function updateRecordText() {
  recordText.textContent = getRecord();
}

function getActivePlayerName() {
  return activePlayer === 1 ? player1Name : player2Name;
}

function getTotalScore() {
  if (gameMode === 1) {
    return player1Score;
  }

  return player1Score + player2Score;
}

function updateScoreText() {
  if (gameMode === 1) {
    scoreText.textContent = player1Score;
    return;
  }

  scoreText.textContent =
    player1Name + ": " + player1Score + " | " + player2Name + ": " + player2Score;
}

function updateWaitingMessage() {
  if (gameMode === 1) {
    message.textContent =
      "Уровень: " + currentLevel.name + ". Нажмите кнопку, чтобы запустить таймер.";
    return;
  }

  message.textContent =
    "Уровень: " +
    currentLevel.name +
    ". Первым ходит " +
    player1Name +
    ". Нажмите кнопку, чтобы запустить таймер.";
}

function updateTurnMessage() {
  if (gameMode === 1) {
    message.textContent = "Уровень: " + currentLevel.name;
    return;
  }

  message.textContent =
    "Уровень: " + currentLevel.name + ". Сейчас ходит: " + getActivePlayerName();
}

function switchPlayer() {
  if (gameMode === 1) return;

  activePlayer = activePlayer === 1 ? 2 : 1;
  updateTurnMessage();
}

function startTimerAndBombs() {
  if (gameStarted) return;

  gameStarted = true;

  timer = setInterval(function () {
    timeLeft--;
    timerText.textContent = timeLeft;

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);

  bombTimer = setInterval(function () {
    createBomb();
  }, currentLevel.bombInterval);
}

updateRecordText();

let audioContext;

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

  gainNode.gain.exponentialRampToValueAtTime(
    0.001,
    context.currentTime + duration
  );

  oscillator.stop(context.currentTime + duration);
}

function playClickSound() {
  playSound(650, 0.08, "sine", 0.15);
}

function playBombSound() {
  playSound(120, 0.18, "sawtooth", 0.18);
}

function playEndSound() {
  playSound(260, 0.15, "triangle", 0.14);

  setTimeout(function () {
    playSound(200, 0.18, "triangle", 0.14);
  }, 130);
}

function playRecordSound() {
  playSound(520, 0.12, "sine", 0.16);

  setTimeout(function () {
    playSound(660, 0.12, "sine", 0.16);
  }, 120);

  setTimeout(function () {
    playSound(820, 0.18, "sine", 0.16);
  }, 240);
}

function vibrate(time) {
  if (navigator.vibrate) {
    navigator.vibrate(time);
  }
}

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

function createBomb() {
  if (!gameStarted) return;
  if (timeLeft <= 0) return;

  const bomb = document.createElement("button");
  bomb.className = "bomb";
  bomb.textContent = "💣";

  playArea.appendChild(bomb);
  moveElement(bomb);

  function hitBomb(event) {
    event.preventDefault();

    if (timeLeft <= 0) return;
    if (!bomb.parentElement) return;

    if (gameMode === 1 || activePlayer === 1) {
      player1Score = player1Score - currentLevel.bombPenalty;

      if (player1Score < 0) {
        player1Score = 0;
      }
    } else {
      player2Score = player2Score - currentLevel.bombPenalty;

      if (player2Score < 0) {
        player2Score = 0;
      }
    }

    updateScoreText();

    playBombSound();
    vibrate(120);

    bomb.remove();
    switchPlayer();
  }

  bomb.addEventListener("pointerdown", hitBomb);

  setTimeout(function () {
    bomb.remove();
  }, currentLevel.bombLife);
}

function clearBombs() {
  const bombs = document.querySelectorAll(".bomb");

  bombs.forEach(function (bomb) {
    bomb.remove();
  });
}

function prepareGame() {
  clearInterval(timer);
  clearInterval(bombTimer);
  clearBombs();

  gameStarted = false;

  player1Score = 0;
  player2Score = 0;
  activePlayer = 1;

  timeLeft = currentLevel.time;
  buttonSize = 130;

  updateScoreText();
  timerText.textContent = timeLeft;
  updateRecordText();
  updateWaitingMessage();

  button.disabled = false;
  button.textContent = "Жми!";
  button.style.width = buttonSize + "px";
  button.style.height = "55px";

  restartButton.style.display = "none";

  moveElement(button);
}

function getResultText() {
  if (gameMode === 1) {
    return "Игра окончена! " + player1Name + " набрал: " + player1Score;
  }

  if (player1Score > player2Score) {
    return (
      "Победил " +
      player1Name +
      "! " +
      player1Name +
      ": " +
      player1Score +
      ", " +
      player2Name +
      ": " +
      player2Score
    );
  }

  if (player2Score > player1Score) {
    return (
      "Победил " +
      player2Name +
      "! " +
      player1Name +
      ": " +
      player1Score +
      ", " +
      player2Name +
      ": " +
      player2Score
    );
  }

  return (
    "Ничья! " +
    player1Name +
    ": " +
    player1Score +
    ", " +
    player2Name +
    ": " +
    player2Score
  );
}

function endGame() {
  clearInterval(timer);
  clearInterval(bombTimer);
  clearBombs();

  gameStarted = false;

  const totalScore = getTotalScore();
  const currentRecord = getRecord();
  const resultText = getResultText();

  button.disabled = true;
  button.textContent = "Стоп!";
  restartButton.style.display = "inline-block";

  if (totalScore > currentRecord) {
    saveRecord(totalScore);
    updateRecordText();

    message.textContent =
      resultText +
      ". Новый рекорд на уровне «" +
      currentLevel.name +
      "»: " +
      totalScore +
      " 🔥";

    playRecordSound();
    vibrate([80, 50, 80]);
  } else {
    message.textContent =
      resultText + ". Рекорд уровня: " + currentRecord;

    playEndSound();
    vibrate(80);
  }
}

button.addEventListener("pointerdown", function (event) {
  event.preventDefault();

  if (timeLeft <= 0) return;

  startTimerAndBombs();

  if (gameMode === 1 || activePlayer === 1) {
    player1Score++;
  } else {
    player2Score++;
  }

  updateScoreText();

  playClickSound();
  vibrate(25);

  if (buttonSize > currentLevel.minButtonSize) {
    buttonSize = buttonSize - currentLevel.buttonShrink;
    button.style.width = buttonSize + "px";
  }

  moveElement(button);
  switchPlayer();
});

restartButton.addEventListener("click", function () {
  askGameMode();
  prepareGame();
});

levelButtons.forEach(function (levelButton) {
  levelButton.addEventListener("click", function () {
    levelButtons.forEach(function (button) {
      button.classList.remove("active");
    });

    levelButton.classList.add("active");

    const selectedTime = Number(levelButton.dataset.time);
    currentLevel = levels[selectedTime];
    currentLevelKey = currentLevel.key;

    prepareGame();
  });
});

askGameMode();
prepareGame();