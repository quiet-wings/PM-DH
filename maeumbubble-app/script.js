const PALETTES = {
  forest: ["#247e36", "#4f9513", "#8e4824", "#0b6778", "#599e0d"],
  ocean: ["#0b4f6c", "#01baef", "#20a4f3", "#1b998b", "#3d5a80"],
  sunset: ["#d64550", "#ea7317", "#f2a65a", "#9e2a2b", "#e07a5f"],
  pastel: ["#e07a9b", "#81b29a", "#f2cc8f", "#7aa6c2", "#b5838d"],
};

const GREETINGS = {
  en: "Hello",
  ko: "안녕하세요",
  es: "Hola",
};

const helloDisplay = document.getElementById("hello-display");
const bubbleLayer = document.getElementById("bubble-layer");
const stressBtn = document.getElementById("stress-btn");
const paletteSelect = document.getElementById("palette-select");
const tabButtons = document.querySelectorAll(".tab-btn");
const tabPreview = document.getElementById("tab-preview");

let currentLang = "en";
let currentPalette = "forest";

function renderGreeting() {
  const word = GREETINGS[currentLang];
  const colors = PALETTES[currentPalette];

  helloDisplay.innerHTML = "";
  helloDisplay.classList.toggle("is-korean", currentLang === "ko");

  Array.from(word).forEach((char, index) => {
    const span = document.createElement("span");
    span.className = "hello-letter";
    span.textContent = char;
    span.style.color = colors[index % colors.length];
    helloDisplay.appendChild(span);
  });

  tabPreview.textContent = word;
}

function triggerStressRelief() {
  const letters = helloDisplay.querySelectorAll(".hello-letter");
  const colors = PALETTES[currentPalette];

  letters.forEach((letter, index) => {
    letter.classList.remove("is-bouncing");
    // 강제 리플로우로 반복 클릭 시 애니메이션 재실행
    void letter.offsetWidth;
    const tilt = (index % 2 === 0 ? -1 : 1) * (6 + (index % 3) * 4);
    letter.style.setProperty("--tilt", `${tilt}deg`);
    letter.style.animationDelay = `${index * 45}ms`;
    letter.classList.add("is-bouncing");
  });

  for (let i = 0; i < 14; i++) {
    const bubble = document.createElement("span");
    const size = 10 + Math.random() * 18;
    const startX = 15 + Math.random() * 70;
    const startY = 35 + Math.random() * 40;
    const dx = (Math.random() - 0.5) * 140;
    const dy = -(80 + Math.random() * 120);

    bubble.className = "stress-bubble";
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${startX}%`;
    bubble.style.top = `${startY}%`;
    bubble.style.backgroundColor = colors[i % colors.length];
    bubble.style.setProperty("--dx", `${dx}px`);
    bubble.style.setProperty("--dy", `${dy}px`);

    bubbleLayer.appendChild(bubble);
    bubble.addEventListener("animationend", () => bubble.remove());
  }
}

stressBtn.addEventListener("click", triggerStressRelief);

paletteSelect.addEventListener("change", (event) => {
  currentPalette = event.target.value;
  renderGreeting();
});

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const lang = btn.dataset.lang;
    if (lang === currentLang) return;

    currentLang = lang;
    tabButtons.forEach((tab) => {
      const isSelected = tab === btn;
      tab.classList.toggle("is-active", isSelected);
      tab.setAttribute("aria-selected", String(isSelected));
    });

    renderGreeting();
  });
});

renderGreeting();
