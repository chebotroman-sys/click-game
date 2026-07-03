let score = 0;
let time = 10;
let timer;

const button = document.getElementById("scoreButton");
const scoreText = document.getElementById("score");

const timerText = document.createElement("p");
document.getElementById("game").appendChild(timerText);

const resultText = document.createElement("p");
document.getElementById("game").appendChild(resultText);

const restartButton = document.createElement("button");
restartButton.textContent = "Начать заново";
restartButton.style.display = "none";
document.getElementById("game").appendChild(restartButton);

function startGame() {
  score = 0;
  time = 10;

  scoreText.textContent = score;
  timerText.textContent = "Время: " + time;
  resultText.textContent = "";
  button.disabled = false;
  restartButton.style.display = "none";

  clearInterval(timer);

  timer = setInterval(function () {
    time = time - 1;
    timerText.textContent = "Время: " + time;

    if (time <= 0) {
      clearInterval(timer);
      button.disabled = true;
      resultText.textContent = "Игра окончена! Твой результат: " + score;
      restartButton.style.display = "inline-block";
    }
  }, 1000);
}

button.addEventListener("click", function () {
  score = score + 1;
  scoreText.textContent = score;

const playArea = document.getElementById("playArea");

const maxX = playArea.clientWidth - button.offsetWidth;
const maxY = playArea.clientHeight - button.offsetHeight;

  const randomX = Math.random() * maxX;
  const randomY = Math.random() * maxY;

  button.style.left = randomX + "px";
  button.style.top = randomY + "px";
});