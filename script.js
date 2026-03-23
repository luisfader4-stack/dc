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
