let score = 0;
let timeLeft = 30;
let timer;

const scoreText = document.getElementById("score");
const timerText = document.getElementById("timer");
const recordText = document.getElementById("record");
const button = document.getElementById("clickButton");
const playArea = document.getElementById("playArea");
const message = document.getElementById("message");
const restartButton = document.getElementById("restartButton");

let record = localStorage.getItem("clickerRecord");

if (record === null) {
  record = 0;
} else {
  record = Number(record);
}

recordText.textContent = record;

function moveButton() {
  const areaWidth = playArea.clientWidth;
  const areaHeight = playArea.clientHeight;

  const buttonWidth = button.offsetWidth;
  const buttonHeight = button.offsetHeight;

  const maxX = areaWidth - buttonWidth;
  const maxY = areaHeight - buttonHeight;

  const x = Math.floor(Math.random() * maxX);
  const y = Math.floor(Math.random() * maxY);

  button.style.left = x + "px";
  button.style.top = y + "px";
}

function startGame() {
  score = 0;
  timeLeft = 30;

  scoreText.textContent = score;
  timerText.textContent = timeLeft;
  message.textContent = "";

  button.disabled = false;
  button.textContent = "Жми!";
  restartButton.style.display = "none";

  moveButton();

  timer = setInterval(function () {
    timeLeft--;
    timerText.textContent = timeLeft;

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function endGame() {
  clearInterval(timer);

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
  moveButton();
});

restartButton.addEventListener("click", function () {
  clearInterval(timer);
  startGame();
});

startGame();