let score = 0;
let timeLeft = 30;
let gameTime = 30;
let timer;
let bombTimer;
let buttonSize = 130;

const scoreText = document.getElementById("score");
const timerText = document.getElementById("timer");
const recordText = document.getElementById("record");
const button = document.getElementById("clickButton");
const playArea = document.getElementById("playArea");
const message = document.getElementById("message");
const restartButton = document.getElementById("restartButton");
const levelButtons = document.querySelectorAll(".level");

let record = localStorage.getItem("clickerRecord");

if (record === null) {
  record = 0;
} else {
  record = Number(record);
}

recordText.textContent = record;

function moveElement(element) {
  const areaWidth = playArea.clientWidth;
  const areaHeight = playArea.clientHeight;

  const elementWidth = element.offsetWidth;
  const elementHeight = element.offsetHeight;

  const maxX = areaWidth - elementWidth;
  const maxY = areaHeight - elementHeight;

  const x = Math.floor(Math.random() * maxX);
  const y = Math.floor(Math.random() * maxY);

  element.style.left = x + "px";
  element.style.top = y + "px";
}

function createBomb() {
  if (timeLeft <= 0) return;

  const bomb = document.createElement("button");
  bomb.className = "bomb";
  bomb.textContent = "💣";

  playArea.appendChild(bomb);
  moveElement(bomb);

  bomb.addEventListener("click", function () {
    score = score - 3;

    if (score < 0) {
      score = 0;
    }

    scoreText.textContent = score;
    bomb.remove();
  });

  setTimeout(function () {
    bomb.remove();
  }, 1800);
}

function clearBombs() {
  const bombs = document.querySelectorAll(".bomb");

  bombs.forEach(function (bomb) {
    bomb.remove();
  });
}

function startGame() {
  clearInterval(timer);
  clearInterval(bombTimer);
  clearBombs();

  score = 0;
  timeLeft = gameTime;
  buttonSize = 130;

  scoreText.textContent = score;
  timerText.textContent = timeLeft;
  message.textContent = "";

  button.disabled = false;
  button.textContent = "Жми!";
  button.style.width = buttonSize + "px";
  button.style.height = "55px";

  restartButton.style.display = "none";

  moveElement(button);

  timer = setInterval(function () {
    timeLeft--;
    timerText.textContent = timeLeft;

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);

  bombTimer = setInterval(function () {
    createBomb();
  }, 1200);
}

function endGame() {
  clearInterval(timer);
  clearInterval(bombTimer);
  clearBombs();

  button.disabled = true;
  button.textContent = "Стоп!";
  restartButton.style.display = "inline-block";

  if (score > record) {
    record = score;
    localStorage.setItem("clickerRecord", record);
    recordText.textContent = record;
    message.textContent = "Новый рекорд! Очки: " + score + " 🔥";
  } else {
    message.textContent = "Игра окончена! Очки: " + score;
  }
}

button.addEventListener("click", function () {
  if (timeLeft <= 0) return;

  score++;
  scoreText.textContent = score;

  if (buttonSize > 70) {
    buttonSize = buttonSize - 3;
    button.style.width = buttonSize + "px";
  }

  moveElement(button);
});

restartButton.addEventListener("click", function () {
  startGame();
});

levelButtons.forEach(function (levelButton) {
  levelButton.addEventListener("click", function () {
    levelButtons.forEach(function (button) {
      button.classList.remove("active");
    });

    levelButton.classList.add("active");
    gameTime = Number(levelButton.dataset.time);
    startGame();
  });
});

startGame();