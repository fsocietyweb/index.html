let musicLibrary = [];

/* JSON PATH */

const MUSIC_JSON_PATH =
  "../assets/music/music-list.json";

/* TERMINAL */

const terminal =
  document.getElementById("terminal");

/* AUDIO */

const audio =
  document.getElementById("audio");

/* LYRICS */

let currentLyrics = [];
let lyricInterval = null;

/* LOAD MUSIC LIBRARY */

async function loadMusicLibrary() {

  const resultsContainer =
    document.getElementById("searchResults");

  try {

    console.log(
      "Loading JSON:",
      MUSIC_JSON_PATH
    );

    const response =
      await fetch(MUSIC_JSON_PATH);

    if (!response.ok) {

      throw new Error(
        `HTTP Error: ${response.status}`
      );
    }

    const data =
      await response.json();

    musicLibrary =
      data.music || [];

    console.log(
      `Loaded ${musicLibrary.length} songs`
    );

    renderLibrary(musicLibrary);

  } catch (err) {

    console.error(err);

    resultsContainer.innerHTML = `
      <p style="
        color:#ff6666;
        text-align:center;
        padding:25px;
      ">
        Failed to load music-list.json
      </p>
    `;
  }
}

/* SEARCH */

function searchMusic() {

  const query =
    document.getElementById("searchInput")
      .value
      .toLowerCase()
      .trim();

  if (!query) {

    renderLibrary(musicLibrary);

    return;
  }

  const filtered =
    musicLibrary.filter(track =>

      track.title
        .toLowerCase()
        .includes(query)

      ||

      (
        track.artist &&
        track.artist
          .toLowerCase()
          .includes(query)
      )
    );

  renderLibrary(filtered);
}

/* RENDER SONGS */

function renderLibrary(tracks) {

  const container =
    document.getElementById("searchResults");

  container.innerHTML = "";

  if (tracks.length === 0) {

    container.innerHTML = `
      <p style="
        text-align:center;
        padding:30px;
        opacity:0.7;
      ">
        No Songs Found
      </p>
    `;

    return;
  }

  tracks.forEach(track => {

    const div =
      document.createElement("div");

    div.className =
      "track-result";

    div.innerHTML = `
      <div style="flex:1;">
        <strong>${track.title}</strong><br>

        <small>
          ${track.artist || 'Unknown Artist'}
        </small>
      </div>

      <button
        onclick="playLocalTrack('${track.file}')"
      >
        ▶ Play
      </button>
    `;

    container.appendChild(div);
  });
}

/* PARSE LRC */

function parseLRC(lrc) {

  const lines =
    lrc.split("\n");

  const parsed = [];

  lines.forEach(line => {

    const match =
      line.match(
        /\[(\d+):(\d+\.\d+)\](.*)/
      );

    if(match) {

      const minutes =
        parseInt(match[1]);

      const seconds =
        parseFloat(match[2]);

      parsed.push({

        time:
          minutes * 60 + seconds,

        text:
          match[3].trim()
      });
    }
  });

  return parsed;
}

/* FETCH SYNCED LYRICS */

async function fetchLyrics(title, artist) {

  try {

    console.log(
      "Searching lyrics:",
      artist,
      "-",
      title
    );

    const response = await fetch(
      `https://lrclib.net/api/get?artist_name=${encodeURIComponent(artist)}&track_name=${encodeURIComponent(title)}`
    );

    if(!response.ok) {

      throw new Error(
        `Lyrics HTTP ${response.status}`
      );
    }

    const data =
      await response.json();

    console.log(data);

    if(data.syncedLyrics) {

      currentLyrics =
        parseLRC(
          data.syncedLyrics
        );

    } else {

      currentLyrics = [];
    }

  } catch(err) {

    console.error(err);

    currentLyrics = [];
  }

  if(terminal) {

    terminal.innerHTML = "";
  }
}

/* SHOW SYNCED LYRICS */

function showLyrics() {

  if(
    !terminal ||
    currentLyrics.length === 0
  ) return;

  const currentTime =
    audio.currentTime;

  const currentLine =
    currentLyrics.find(
      (line, index) => {

        const next =
          currentLyrics[index + 1];

        return (

          currentTime >= line.time &&

          (
            !next ||
            currentTime < next.time
          )
        );
      }
    );

  if(!currentLine) return;

  if(
    terminal.lastChild &&
    terminal.lastChild.textContent ===
    currentLine.text
  ) return;

  const line =
    document.createElement("div");

  line.className =
    "terminal-line";

  line.textContent =
    currentLine.text;

  terminal.appendChild(line);

  terminal.scrollTop =
    terminal.scrollHeight;

  if(
    terminal.children.length > 14
  ) {

    terminal.removeChild(
      terminal.firstChild
    );
  }
}

/* PLAY SONG */

function playLocalTrack(filename) {

  const fullPath =
    `../assets/music/${filename}`;

  console.log(
    "Playing:",
    fullPath
  );

  audio.src = fullPath;

  audio.load();

  audio.play().catch(err => {

    console.error(err);

    alert(
      "Could not play:\n" +
      fullPath
    );
  });

  const track =
    musicLibrary.find(
      t => t.file === filename
    );

  if(track) {

    document.getElementById("title")
      .textContent =
      track.title;

    document.getElementById("artist")
      .textContent =
      track.artist || '';

    fetchLyrics(
      track.title,
      track.artist || ''
    );
  }
}

/* AUDIO VISUALIZER */

const canvas =
  document.getElementById("canvas");

const ctx =
  canvas.getContext("2d");

canvas.width =
  canvas.offsetWidth;

canvas.height =
  canvas.offsetHeight;

const audioContext =
  new (
    window.AudioContext ||
    window.webkitAudioContext
  )();

const analyser =
  audioContext.createAnalyser();

analyser.fftSize = 256;

const source =
  audioContext
    .createMediaElementSource(audio);

source.connect(analyser);

analyser.connect(
  audioContext.destination
);

const bufferLength =
  analyser.frequencyBinCount;

const dataArray =
  new Uint8Array(bufferLength);

/* DRAW VISUALIZER */

function drawVisualizer() {

  requestAnimationFrame(
    drawVisualizer
  );

  analyser.getByteFrequencyData(
    dataArray
  );

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  let barWidth =
    (canvas.width / bufferLength) * 1.8;

  let x = 0;

  for (
    let i = 0;
    i < bufferLength;
    i++
  ) {

    let barHeight =
      dataArray[i] / 1.6;

    let gradient =
      ctx.createLinearGradient(
        0,
        canvas.height,
        0,
        0
      );

    gradient.addColorStop(
      0,
      "rgba(255,255,255,0.3)"
    );

    gradient.addColorStop(
      1,
      "rgba(255,255,255,1)"
    );

    ctx.fillStyle =
      gradient;

    ctx.fillRect(
      x,
      canvas.height - barHeight,
      barWidth,
      barHeight
    );

    x += barWidth + 2;
  }
}

/* START AUDIO CONTEXT */

audio.addEventListener(
  "play",
  async () => {

    if(
      audioContext.state ===
      "suspended"
    ) {

      await audioContext.resume();
    }
  }
);

/* START */

drawVisualizer();

window.addEventListener(
  "load",
  loadMusicLibrary
);

/* START LYRIC LOOP */

setInterval(showLyrics, 100);