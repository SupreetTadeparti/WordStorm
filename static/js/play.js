const pages = document.querySelectorAll(".page");
const wordsContainer = document.querySelector(".words-container");
const typeInput = document.querySelector(".type-input");
const startBtn = document.querySelector(".start-btn");
const instructionsBtn = document.querySelector(".instructions-btn");
const backBtn = document.querySelector(".back-btn");
const playAgainBtn = document.querySelector(".play-again-btn");
const mainMenuBtn = document.querySelector(".main-menu-btn");
const coinText = document.querySelector(".coin-text");

const SECOND = 1000;
const TOTAL_TIME = 60 * SECOND;
const NEW_WORD_INTERVAL = SECOND / 4;
const MEDIAN_FALL_TIME = SECOND * 10;

let wordBank = [];
let wordsTyped = [];
let fallingWords = {};

let score = 0;

const random = (start, end) =>
  start + Math.floor(Math.random() * (end - start));

const init = async () => {
  const file = await fetch("json/common.json");
  const res = await file.json();
  wordBank = res.commonWords;
};

const randWord = () => {
  const idx = random(0, wordBank.length);
  const val = wordBank[idx];
  wordBank.splice(idx, 1);
  return val;
};

const newWord = () => {
  const wordEl = document.createElement("div");

  const word = randWord();

  const fallTime = MEDIAN_FALL_TIME + random(-2000, 2000);

  wordEl.textContent = word;

  wordEl.classList.add("falling-word");

  wordEl.style.animationDuration = `${fallTime}ms`;

  wordsContainer.appendChild(wordEl);

  wordEl.style.left = `${random(
    0,
    document.body.offsetWidth - wordEl.clientWidth
  )}px`;

  const wordInterval = setTimeout(() => {
    wordsContainer.removeChild(wordEl);
    delete fallingWords[word];
  }, fallTime);

  const points = word.length;

  fallingWords[word] = [wordEl, wordInterval, points];
};

const main = () => {
  startBtn.addEventListener("click", async () => {
    pages.forEach((page) => page.classList.toggle("hidden"));

    await init();

    typeInput.focus();

    const newWordInterval = setInterval(newWord, NEW_WORD_INTERVAL);

    setTimeout(async () => {
      clearInterval(newWordInterval);

      if (wordsTyped.length > 0) {
        const data = {
          score: score,
          avgWordLen:
            wordsTyped
              .map((word) => word.length)
              .reduce((prev, curr) => prev + curr) / wordsTyped.length,
        };

        const raw = await fetch("http://localhost:3000/game", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
      }

      coinText.textContent = Math.round(score / 10);

      document.querySelector(".type-input").style.display = "none";
      document.querySelector(".result-page").classList.remove("hidden");
    }, TOTAL_TIME);
  });

  instructionsBtn.addEventListener("click", () => {
    document.querySelector(".main-panel").classList.add("hidden");
    document.querySelector(".instructions-panel").classList.remove("hidden");
  });

  backBtn.addEventListener("click", () => {
    document.querySelector(".main-panel").classList.remove("hidden");
    document.querySelector(".instructions-panel").classList.add("hidden");
  });

  playAgainBtn.addEventListener("click", () => {
    window.location.reload();
  });

  mainMenuBtn.addEventListener("click", () => {
    window.location.href = "http://localhost:3000/";
  });

  typeInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      const word = typeInput.value.trim();
      if (word in fallingWords) {
        const [wordEl, wordInterval, points] = fallingWords[word];
        clearInterval(wordInterval);
        wordsContainer.removeChild(wordEl);
        delete fallingWords[word];
        score += points;
        wordsTyped.push(word);
        wordBank.push(word);
        document.querySelector(".score-display").innerHTML = `Score: ${score}`;
        typeInput.value = "";
        e.preventDefault();
      }
    }
  });
};

main();
