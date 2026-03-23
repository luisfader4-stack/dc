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

// PLAYLIST
playlistItems.forEach(item => {
  item.addEventListener("click", () => {

    playlistItems.forEach(i => i.classList.remove("active"));
    item.classList.add("active");

    const src = item.getAttribute("data-src");
    const lyricsFile = item.getAttribute("data-lyrics");
    const title = item.textContent;

    audio.src = src;
    audio.play();

    songTitle.textContent = title;

    fetch(lyricsFile)
      .then(res => res.text())
      .then(text => {
        lyricsDiv.textContent = text;
      });
  });
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
