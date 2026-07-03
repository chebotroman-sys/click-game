let score = 0;
let timeLeft = 30;

const scoreText = document.getElementById("score");
const timerText = document.getElementById("timer");
const button = document.getElementById("clickButton");
const playArea = document.getElementById("playArea");
const message = document.getElementById("message");

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

button.addEventListener("click", function () {
  if (timeLeft <= 0) return;

  score++;
  scoreText.textContent = score;
  moveButton();
});

const timer = setInterval(function () {
  timeLeft--;
  timerText.textContent = timeLeft;

  if (timeLeft <= 0) {
    clearInterval(timer);
    button.disabled = true;
    button.textContent = "Стоп!";
    message.textContent = "Игра окончена! Очки: " + score;
  }
}, 1000);

moveButton();