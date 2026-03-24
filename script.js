// =========================
// ELEMENTOS
// =========================
const audio = document.getElementById("audio");
const lyricsDiv = document.getElementById("lyrics");
const songs = document.querySelectorAll(".song");

const canvas = document.getElementById("visualizer");
const ctx = canvas.getContext("2d");

// =========================
// RESPONSIVE CANVAS
// =========================
function resizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

let audioCtx;
let analyser;
let source;

// =========================
// PLAYLIST
// =========================
songs.forEach(song => {
  song.addEventListener("click", () => {

    // activar visual
    songs.forEach(s => s.classList.remove("active"));
    song.classList.add("active");

    const src = song.getAttribute("data-src");
    const lyricsFile = song.getAttribute("data-lyrics");

    // cargar audio
    audio.src = src;
    audio.load();
    audio.play().catch(() => {});

    // cargar letras
    fetch(lyricsFile)
      .then(res => res.text())
      .then(text => {
        displayLyrics(text);

        // scroll suave hacia letras en móvil
        lyricsDiv.scrollIntoView({ behavior: "smooth" });
      })
      .catch(() => {
        lyricsDiv.innerHTML = "No se pudieron cargar las letras.";
      });
  });
});

// =========================
// FORMATO DE LETRAS (POESÍA)
// =========================
function displayLyrics(text) {

  const paragraphs = text.split("\n\n");

  lyricsDiv.innerHTML = paragraphs.map(p => {

    const lines = p.split("\n");

    return `
      <div class="stanza">
        ${lines.map(line => `<div class="line">${line}</div>`).join("")}
      </div>
    `;

  }).join("");
}

// =========================
// VISUALIZER MODERNO
// =========================
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

  // onda superior
  for (let i = 0; i < bufferLength; i++) {
    const x = (i / bufferLength) * canvas.width;
    const y = centerY - dataArray[i] * 0.35;

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }

  // espejo inferior
  for (let i = bufferLength - 1; i >= 0; i--) {
    const x = (i / bufferLength) * canvas.width;
    const y = centerY + dataArray[i] * 0.35;
    ctx.lineTo(x, y);
  }

  ctx.closePath();

  // gradiente pastel
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
  gradient.addColorStop(0, "#d9a7ff");
  gradient.addColorStop(1, "#a7d8ff");

  ctx.fillStyle = gradient;
  ctx.globalAlpha = 0.8;
  ctx.fill();

  // glow suave
  ctx.shadowBlur = 15;
  ctx.shadowColor = "#d9a7ff";

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.shadowBlur = 0;
}

// activar visualizer
audio.addEventListener("play", () => {
  if (!audioCtx) setupVisualizer();
});
