const audio = document.getElementById("audio");
const lyricsDiv = document.getElementById("lyrics");
const playlistItems = document.querySelectorAll("#playlist li");
const songTitle = document.getElementById("song-title");

const canvas = document.getElementById("visualizer");
const ctx = canvas.getContext("2d");

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

let audioCtx;
let analyser;
let source;

// TOOLTIP
const tooltip = document.createElement("div");
tooltip.className = "tooltip";
document.body.appendChild(tooltip);

// PLAYLIST
playlistItems.forEach(item => {
  item.addEventListener("click", () => {

    playlistItems.forEach(i => i.classList.remove("active"));
    item.classList.add("active");

    const src = item.getAttribute("data-src");
    const lyricsFile = item.getAttribute("data-lyrics");
    const title = item.textContent;

    audio.src = src;
    audio.load();

    audio.play().catch(() => {});

    songTitle.textContent = title;

    fetch(lyricsFile)
      .then(res => res.text())
      .then(text => {
        lyricsDiv.innerHTML = processLyrics(text);
      });
  });
});

// PROCESAR PALABRAS
function processLyrics(text) {
  return text.split(/\s+/).map(word => {
    const clean = word.toLowerCase().replace(/[.,—!?]/g, "");
    return `<span class="word" data-word="${clean}">${word}</span>`;
  }).join(" ");
}

// TRADUCCIÓN AUTOMÁTICA
async function translateWord(word) {
  try {
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=sr&tl=ru&dt=t&q=${encodeURIComponent(word)}`
    );
    const data = await res.json();
    return data[0][0][0];
  } catch {
    return null;
  }
}

// EVENTO HOVER / TOUCH
document.addEventListener("mouseover", showTranslation);
document.addEventListener("touchstart", showTranslation);

async function showTranslation(e) {
  if (e.target.classList.contains("word")) {

    const word = e.target.dataset.word;

    tooltip.textContent = "...";
    tooltip.style.display = "block";

    const rect = e.target.getBoundingClientRect();
    tooltip.style.left = rect.left + "px";
    tooltip.style.top = (rect.top - 30) + "px";

    const translation = await translateWord(word);

    tooltip.textContent = translation || "—";
  }
}

document.addEventListener("mouseout", () => {
  tooltip.style.display = "none";
});

// VISUALIZER
function setupVisualizer() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioCtx.createAnalyser();

  source = audioCtx.createMediaElementSource(audio);

  source.connect(analyser);
  analyser.connect(audioCtx.destination);

  analyser.fftSize = 128;

  draw();
}

function draw() {
  requestAnimationFrame(draw);

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  analyser.getByteFrequencyData(dataArray);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const barWidth = canvas.width / bufferLength;

  for (let i = 0; i < bufferLength; i++) {
    const barHeight = dataArray[i];
    const x = i * barWidth;
    const y = canvas.height - barHeight;

    ctx.fillStyle = "#ffd9a0";
    ctx.fillRect(x, y, barWidth - 1, barHeight);
  }
}

audio.addEventListener("play", () => {
  if (!audioCtx) setupVisualizer();
});
