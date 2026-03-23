const audio = document.getElementById("audio");
const lyricsDiv = document.getElementById("lyrics");
const playlistItems = document.querySelectorAll("#playlist li");
const songTitle = document.getElementById("song-title");

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
        displayLyrics(text);
      });
  });
});
function displayLyrics(text) {
  const paragraphs = text.split("\n\n"); // separa estrofas

  lyricsDiv.innerHTML = paragraphs.map(p => {

    const lines = p.split("\n");

    return `
      <div class="stanza">
        ${lines.map(line => `<div class="line">${line}</div>`).join("")}
      </div>
    `;

  }).join("");
}

// FORMATO BONITO DE LETRAS
function displayLyrics(text) {
  const lines = text.split("\n");

  lyricsDiv.innerHTML = lines.map(line => {
    return `<div class="line">${line}</div>`;
  }).join("");
}
const canvas = document.getElementById("visualizer");
const ctx = canvas.getContext("2d");

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

let audioCtx;
let analyser;
let source;

function setupVisualizer() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioCtx.createAnalyser();

  source = audioCtx.createMediaElementSource(audio);

  source.connect(analyser);
  analyser.connect(audioCtx.destination);

  analyser.fftSize = 512;

  draw();
}

function draw() {
  requestAnimationFrame(draw);

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  analyser.getByteFrequencyData(dataArray);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const centerY = canvas.height / 2;

  ctx.beginPath();

  for (let i = 0; i < bufferLength; i++) {
    const x = (i / bufferLength) * canvas.width;
    const y = centerY - dataArray[i] * 0.4;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  // línea inferior reflejada
  for (let i = bufferLength - 1; i >= 0; i--) {
    const x = (i / bufferLength) * canvas.width;
    const y = centerY + dataArray[i] * 0.4;
    ctx.lineTo(x, y);
  }

  ctx.closePath();

  // GRADIENTE
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
  gradient.addColorStop(0, "#ffcc88");
  gradient.addColorStop(1, "#aa3344");

  ctx.fillStyle = gradient;
  ctx.globalAlpha = 0.8;
  ctx.fill();

  // GLOW
  ctx.shadowBlur = 20;
  ctx.shadowColor = "#ffcc88";

  ctx.strokeStyle = "#ffd9a0";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.shadowBlur = 0;
}

// ACTIVAR SOLO UNA VEZ
audio.addEventListener("play", () => {
  if (!audioCtx) {
    setupVisualizer();
  }
});
