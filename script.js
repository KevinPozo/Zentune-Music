const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const resultsSection = document.getElementById('results');
const audioPlayer = document.getElementById('audio-player');
const nowPlaying = document.getElementById('now-playing');

// Cambiar la constante GIF_URL a la ruta local
const GIF_URL = 'assets/Fondo.gif';

// Cambiar la constante del PNG
const PNG_FONDO = 'assets/Fondo2.png';

document.addEventListener('DOMContentLoaded', async () => {
  const artistsList = document.getElementById('artists-list');
  const searchInput = document.getElementById('search-input');
  const nowPlaying = document.getElementById('now-playing');
  const youtubePlayerContainer = document.getElementById('youtube-player-container');
  const visualizer = document.getElementById('visualizer');
  const artistSearchForm = document.getElementById('artist-search-form');
  const songFilterSection = document.getElementById('song-filter-section');
  const songChips = document.getElementById('song-chips');
  const queueSection = document.getElementById('queue-section');
  const customControls = document.getElementById('custom-controls');
  const playPauseBtn = document.getElementById('playpause-btn');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const currentTimeEl = document.getElementById('current-time');
  const durationEl = document.getElementById('duration');
  const progressBar = document.getElementById('progress-bar');
  const progressBarBg = document.getElementById('progress-bar-bg');
  const ytOverlay = document.getElementById('yt-overlay');

  // Sección de favoritos
  let favSection = document.createElement('section');
  favSection.id = 'favorites-section';
  favSection.style.marginBottom = '2rem';
  artistsList.parentNode.insertBefore(favSection, artistsList);

  let player = null;
  let currentTrack = null;
  let currentArtistObj = null;
  let currentColor = '#181818';
  let allArtists = [];
  let isPlaying = false;
  let progressInterval = null;
  let queue = JSON.parse(localStorage.getItem('zentune_queue') || '[]');
  let queueIndex = -1;
  let artistSongIndex = -1;

  // Favoritos en localStorage
  function getFavs() {
    return JSON.parse(localStorage.getItem('zentune_favs') || '[]');
  }
  function setFavs(favs) {
    localStorage.setItem('zentune_favs', JSON.stringify(favs));
  }
  function isFav(song) {
    const favs = getFavs();
    return favs.some(f => f.youtube === song.youtube);
  }
  function toggleFav(song, artistObj) {
    let favs = getFavs();
    if (isFav(song)) {
      favs = favs.filter(f => f.youtube !== song.youtube);
    } else {
      favs.push({ ...song, artist: artistObj.artist, color: artistObj.color });
    }
    setFavs(favs);
    renderArtists(searchInput.value);
    renderFavs();
  }

  // Cola de reproducción en localStorage
  function saveQueue() {
    localStorage.setItem('zentune_queue', JSON.stringify(queue));
  }

  function addToQueue(song, artistObj) {
    queue.push({ ...song, artist: artistObj.artist, color: artistObj.color });
    saveQueue();
    renderQueue();
  }

  function removeFromQueue(index) {
    queue.splice(index, 1);
    saveQueue();
    renderQueue();
  }

  function renderQueue() {
    queueSection.innerHTML = '';
    if (queue.length === 0) return;
    const title = document.createElement('h2');
    title.textContent = 'Cola de reproducción';
    queueSection.appendChild(title);
    queue.forEach((song, idx) => {
      const songDiv = document.createElement('div');
      songDiv.className = 'song-item';
      songDiv.style.background = '#2a2a2a';
      // Info
      const info = document.createElement('div');
      info.className = 'song-info';
      info.innerHTML = `
        <img class="song-cover" src="${song.cover}" alt="cover">
        <div class="song-meta">
          <span class="song-title">${song.title}</span>
          <span class="song-artist">${song.artist}</span>
          <span class="song-extra">${song.genre} • ${song.year} • ${song.duration}</span>
        </div>
      `;
      // Acciones
      const actions = document.createElement('div');
      actions.className = 'song-actions';
      // Botón reproducir
      const playBtn = document.createElement('button');
      playBtn.className = 'song-btn';
      playBtn.innerHTML = '▶️';
      playBtn.onclick = () => playTrack(song, song, true, idx);
      actions.appendChild(playBtn);
      // Botón quitar de la cola
      const removeBtn = document.createElement('button');
      removeBtn.className = 'song-btn';
      removeBtn.innerHTML = '🗑️';
      removeBtn.onclick = () => removeFromQueue(idx);
      actions.appendChild(removeBtn);
      songDiv.appendChild(info);
      songDiv.appendChild(actions);
      queueSection.appendChild(songDiv);
    });
  }

  // Cargar la lista de canciones NCS
  try {
    const res = await fetch('data/ncs_tracks.json');
    allArtists = await res.json();
  } catch (e) {
    artistsList.innerHTML = '<p>Error al cargar la lista de canciones.</p>';
    return;
  }

  // Renderizar favoritos
  function renderFavs() {
    const favs = getFavs();
    favSection.innerHTML = '';
    if (favs.length === 0) return;
    const title = document.createElement('h2');
    title.textContent = 'Favoritos';
    favSection.appendChild(title);
    favs.forEach(song => {
      const songDiv = document.createElement('div');
      songDiv.className = 'song-item';
      songDiv.style.background = '#333';
      // Info
      const info = document.createElement('div');
      info.className = 'song-info';
      info.innerHTML = `
        <img class="song-cover" src="${song.cover}" alt="cover">
        <div class="song-meta">
          <span class="song-title">${song.title}</span>
          <span class="song-artist">${song.artist}</span>
          <span class="song-extra">${song.genre} • ${song.year} • ${song.duration}</span>
        </div>
      `;
      // Acciones
      const actions = document.createElement('div');
      actions.className = 'song-actions';
      // Botón reproducir
      const playBtn = document.createElement('button');
      playBtn.className = 'song-btn';
      playBtn.innerHTML = '▶️';
      playBtn.onclick = () => playTrack(song, song);
      actions.appendChild(playBtn);
      // Botón favoritos
      const favBtn = document.createElement('button');
      favBtn.className = 'song-btn fav active';
      favBtn.innerHTML = '★';
      favBtn.onclick = () => toggleFav(song, song);
      actions.appendChild(favBtn);
      // Botón agregar a cola
      const queueBtn = document.createElement('button');
      queueBtn.className = 'song-btn';
      queueBtn.innerHTML = '➕';
      queueBtn.title = 'Agregar a la cola';
      queueBtn.onclick = () => addToQueue(song, song);
      actions.appendChild(queueBtn);
      // Botón compartir
      const shareBtn = document.createElement('button');
      shareBtn.className = 'song-btn share';
      shareBtn.title = 'Compartir';
      shareBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98"/><path d="M15.41 6.51l-6.82 3.98"/></svg>`;
      shareBtn.onclick = () => window.open(song.youtube, '_blank');
      actions.appendChild(shareBtn);
      songDiv.appendChild(info);
      songDiv.appendChild(actions);
      favSection.appendChild(songDiv);
    });
  }

  const songDropdownContainer = document.getElementById('song-dropdown-container');
  const songDropdown = document.getElementById('song-dropdown');
  let lastArtistFiltered = null;

  // Renderizar artistas y canciones
  function renderArtists(filter = '') {
    artistsList.innerHTML = '';
    let filteredArtist = null;
    allArtists.forEach(artistObj => {
      // Filtrar canciones por búsqueda
      const filteredSongs = artistObj.songs.filter(song => {
        const q = filter.toLowerCase();
        return (
          song.title.toLowerCase().includes(q) ||
          artistObj.artist.toLowerCase().includes(q)
        );
      });
      if (filteredSongs.length === 0) return;
      // Si solo hay un artista filtrado, mostrar el dropdown
      if (!filteredArtist) filteredArtist = artistObj;
      // Crear carpeta de artista
      const folder = document.createElement('div');
      folder.className = 'artist-folder';
      const header = document.createElement('div');
      header.className = 'artist-header';
      header.innerHTML = `<span class="artist-color" style="background:${artistObj.color}"></span>${artistObj.artist}`;
      folder.appendChild(header);
      const songsDiv = document.createElement('div');
      songsDiv.className = 'artist-songs';
      filteredSongs.forEach(song => {
        const songDiv = document.createElement('div');
        songDiv.className = 'song-item';
        // Info
        const info = document.createElement('div');
        info.className = 'song-info';
        info.innerHTML = `
          <img class="song-cover" src="${song.cover}" alt="cover">
          <div class="song-meta">
            <span class="song-title">${song.title}</span>
            <span class="song-artist">${artistObj.artist}</span>
            <span class="song-extra">${song.genre} • ${song.year} • ${song.duration}</span>
          </div>
        `;
        // Acciones
        const actions = document.createElement('div');
        actions.className = 'song-actions';
        // Botón reproducir
        const playBtn = document.createElement('button');
        playBtn.className = 'song-btn';
        playBtn.innerHTML = '▶️';
        playBtn.onclick = () => playTrack(song, artistObj);
        actions.appendChild(playBtn);
        // Botón favoritos
        const favBtn = document.createElement('button');
        favBtn.className = 'song-btn fav' + (isFav(song) ? ' active' : '');
        favBtn.innerHTML = '★';
        favBtn.onclick = () => toggleFav(song, artistObj);
        actions.appendChild(favBtn);
        // Botón agregar a cola
        const queueBtn = document.createElement('button');
        queueBtn.className = 'song-btn';
        queueBtn.innerHTML = '➕';
        queueBtn.title = 'Agregar a la cola';
        queueBtn.onclick = () => addToQueue(song, artistObj);
        actions.appendChild(queueBtn);
        // Botón compartir
        const shareBtn = document.createElement('button');
        shareBtn.className = 'song-btn share';
        shareBtn.title = 'Compartir';
        shareBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98"/><path d="M15.41 6.51l-6.82 3.98"/></svg>`;
        shareBtn.onclick = () => window.open(song.youtube, '_blank');
        actions.appendChild(shareBtn);
        songDiv.appendChild(info);
        songDiv.appendChild(actions);
        songsDiv.appendChild(songDiv);
      });
      folder.appendChild(songsDiv);
      // Desplegable
      header.onclick = () => {
        folder.classList.toggle('open');
      };
      artistsList.appendChild(folder);
    });
    // Mostrar el dropdown solo si hay un artista filtrado
    if (filteredArtist) {
      songDropdownContainer.style.display = 'flex';
      songDropdown.innerHTML = '';
      const allOpt = document.createElement('option');
      allOpt.value = 'all';
      allOpt.textContent = 'Todas las canciones';
      songDropdown.appendChild(allOpt);
      filteredArtist.songs.forEach((song, idx) => {
        const opt = document.createElement('option');
        opt.value = idx;
        opt.textContent = song.title;
        songDropdown.appendChild(opt);
      });
      lastArtistFiltered = filteredArtist;
    } else {
      songDropdownContainer.style.display = 'none';
      lastArtistFiltered = null;
    }
  }

  // Búsqueda en tiempo real
  searchInput.addEventListener('input', e => {
    renderArtists(searchInput.value);
  });

  // Reproducir canción y adaptar colores
  // Modificado para soportar reproducción automática de la cola
  // Visualizer animado (barras)
  function showVisualizer(color) {
    visualizer.innerHTML = '';
    for (let i = 0; i < 5; i++) {
      const bar = document.createElement('div');
      bar.className = 'visualizer-bar';
      bar.style.background = `linear-gradient(180deg, ${color} 0%, #1db954 100%)`;
      visualizer.appendChild(bar);
    }
  }

  // --- Controles personalizados ---
  function showCustomControls(show) {
    customControls.style.display = show ? 'flex' : 'none';
  }

  function formatTime(sec) {
    sec = Math.floor(sec);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    } else {
      return `${m}:${s.toString().padStart(2, '0')}`;
    }
  }

  function updateProgressBar() {
    if (!player || typeof player.getCurrentTime !== 'function') return;
    const cur = player.getCurrentTime();
    const dur = player.getDuration();
    currentTimeEl.textContent = formatTime(cur);
    durationEl.textContent = formatTime(dur);
    progressBar.style.width = dur ? `${(cur / dur) * 100}%` : '0%';
  }

  function startProgressUpdater() {
    stopProgressUpdater();
    progressInterval = setInterval(updateProgressBar, 500);
  }
  function stopProgressUpdater() {
    if (progressInterval) clearInterval(progressInterval);
    progressInterval = null;
  }

  playPauseBtn.onclick = () => {
    if (!player) return;
    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  };

  prevBtn.onclick = () => {
    if (queue.length > 0 && queueIndex > 0) {
      playTrack(queue[queueIndex - 1], queue[queueIndex - 1], true, queueIndex - 1);
    } else if (currentArtistObj && artistSongIndex > 0) {
      const prevSong = currentArtistObj.songs[artistSongIndex - 1];
      playTrack(prevSong, currentArtistObj, false, 0, artistSongIndex - 1);
    }
  };

  nextBtn.onclick = () => {
    if (queue.length > 0 && queueIndex < queue.length - 1) {
      playTrack(queue[queueIndex + 1], queue[queueIndex + 1], true, queueIndex + 1);
    } else if (currentArtistObj && artistSongIndex < currentArtistObj.songs.length - 1) {
      const nextSong = currentArtistObj.songs[artistSongIndex + 1];
      playTrack(nextSong, currentArtistObj, false, 0, artistSongIndex + 1);
    }
  };

  progressBarBg.onclick = (e) => {
    if (!player || typeof player.getDuration !== 'function') return;
    const rect = progressBarBg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    const seekTo = percent * player.getDuration();
    player.seekTo(seekTo, true);
    updateProgressBar();
  };

  // Bloquear interacción con el video
  ytOverlay.onmousedown = ytOverlay.onmouseup = ytOverlay.onclick = (e) => {
    e.preventDefault();
    return false;
  };

  // Modificar playTrack para controles personalizados
  async function playTrack(song, artistObj, fromQueue = false, qIndex = 0, aSongIndex = -1) {
    const videoId = getYouTubeId(song.youtube);
    if (!videoId) {
      youtubePlayerContainer.style.display = 'none';
      showCustomControls(false);
      nowPlaying.textContent = 'No se pudo reproducir esta canción.';
      return;
    }
    await loadYouTubeAPI();
    youtubePlayerContainer.style.display = 'block';
    youtubePlayerContainer.innerHTML = '<div id="ytplayer"></div><div id="yt-overlay" style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:2;"></div>';
    nowPlaying.textContent = `Reproduciendo: ${song.title} - ${artistObj.artist}`;
    if (player) player.destroy();
    player = new YT.Player('ytplayer', {
      videoId: videoId,
      width: '100%',
      height: '360',
      playerVars: {
        autoplay: 1,
        controls: 0,
        rel: 0,
        showinfo: 0,
        modestbranding: 1,
        fs: 0,
        disablekb: 1
      },
      events: {
        'onStateChange': (event) => onPlayerStateChange(event, fromQueue, qIndex, artistObj, aSongIndex)
      }
    });
    // Obtener el ID del video de YouTube
    // (ya está declarado arriba)
    // Usar la miniatura de YouTube como fondo
    const thumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '';
    const overlay = document.getElementById('background-overlay');
    // Fondo especial para Radio Lo-Fi o canciones Lofi
    if ((artistObj.artist && artistObj.artist.toLowerCase().includes('lo-fi')) || (song.genre && song.genre.toLowerCase().includes('lofi'))) {
      overlay.style.background = `linear-gradient(rgba(20,20,30,0.4), rgba(20,20,30,0.4)), url('assets/FondoLoffi.gif') center center / cover no-repeat`;
    } else {
      overlay.style.background = `linear-gradient(rgba(20,20,30,0.4), rgba(20,20,30,0.4)), url('${GIF_URL}') center center / cover no-repeat`;
    }
    // Eliminar el video de fondo si existe
    const videoBgContainer = document.getElementById('background-video-container');
    if (videoBgContainer) {
      videoBgContainer.innerHTML = '';
      videoBgContainer.style.display = 'none';
    }
    currentColor = artistObj.color;
    showVisualizer(artistObj.color);
    showCustomControls(true);
    isPlaying = true;
    currentTrack = song;
    currentArtistObj = artistObj;
    queueIndex = fromQueue ? qIndex : -1;
    artistSongIndex = (!fromQueue && aSongIndex >= 0) ? aSongIndex : (artistObj.songs.findIndex(s => s.youtube === song.youtube));
    setTimeout(updateProgressBar, 1000);
    startProgressUpdater();
    playPauseBtn.innerHTML = '⏸️';
  }

  // Modificar onPlayerStateChange para controles personalizados
  function onPlayerStateChange(event, fromQueue = false, qIndex = 0, artistObj = null, aSongIndex = -1) {
    if (event.data === YT.PlayerState.ENDED) {
      youtubePlayerContainer.style.display = 'none';
      showCustomControls(false);
      nowPlaying.textContent = '';
      visualizer.innerHTML = '';
      const overlay = document.getElementById('yt-overlay');
      overlay.style.background = 'rgba(20,20,30,0.4)';
      document.body.style.background = '#181818';
      document.body.style.backgroundSize = 'cover';
      stopProgressUpdater();
      isPlaying = false;
      playPauseBtn.innerHTML = '▶️';
      // Siguiente canción
      if (fromQueue && queue.length > qIndex + 1) {
        playTrack(queue[qIndex + 1], queue[qIndex + 1], true, qIndex + 1);
      } else if (!fromQueue && artistObj && aSongIndex < artistObj.songs.length - 1) {
        playTrack(artistObj.songs[aSongIndex + 1], artistObj, false, 0, aSongIndex + 1);
      }
      const overlayBg = document.getElementById('background-overlay');
      overlayBg.style.background = 'rgba(20,20,30,0.4)';
      const videoBgContainer = document.getElementById('background-video-container');
      if (videoBgContainer) {
        videoBgContainer.innerHTML = '';
        videoBgContainer.style.display = 'none';
      }
    } else if (event.data === YT.PlayerState.PLAYING) {
      isPlaying = true;
      playPauseBtn.innerHTML = '⏸️';
      startProgressUpdater();
    } else if (event.data === YT.PlayerState.PAUSED) {
      isPlaying = false;
      playPauseBtn.innerHTML = '▶️';
      stopProgressUpdater();
    }
  }

  function getYouTubeId(url) {
    const regExp = /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[1].length === 11) ? match[1] : null;
  }

  // Cargar la API de YouTube
  function loadYouTubeAPI() {
    if (window.YT && window.YT.Player) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
      window.onYouTubeIframeAPIReady = () => resolve();
    });
  }

  let selectedArtistObj = null;

  // Buscar artista y mostrar chips de canciones
  artistSearchForm.addEventListener('submit', e => {
    e.preventDefault();
    const query = searchInput.value.trim().toLowerCase();
    if (!query) return;
    // Buscar artistas por coincidencia parcial
    const matches = allArtists.filter(artistObj => artistObj.artist.toLowerCase().includes(query));
    artistsList.innerHTML = '';
    songFilterSection.style.display = 'none';
    if (matches.length === 0) {
      artistsList.innerHTML = '<p style="text-align:center;">No se encontraron artistas.</p>';
      selectedArtistObj = null;
      return;
    }
    // Mostrar artistas encontrados
    matches.forEach(artistObj => {
      const folder = document.createElement('div');
      folder.className = 'artist-folder open';
      const header = document.createElement('div');
      header.className = 'artist-header';
      header.innerHTML = `<span class="artist-color" style="background:${artistObj.color}"></span>${artistObj.artist}`;
      folder.appendChild(header);
      const songsDiv = document.createElement('div');
      songsDiv.className = 'artist-songs';
      artistObj.songs.forEach(song => {
        const songDiv = document.createElement('div');
        songDiv.className = 'song-item';
        // Info
        const info = document.createElement('div');
        info.className = 'song-info';
        info.innerHTML = `
          <img class="song-cover" src="${song.cover}" alt="cover">
          <div class="song-meta">
            <span class="song-title">${song.title}</span>
            <span class="song-artist">${artistObj.artist}</span>
            <span class="song-extra">${song.genre} • ${song.year} • ${song.duration}</span>
          </div>
        `;
        // Acciones
        const actions = document.createElement('div');
        actions.className = 'song-actions';
        // Botón reproducir
        const playBtn = document.createElement('button');
        playBtn.className = 'song-btn';
        playBtn.innerHTML = '▶️';
        playBtn.onclick = () => playTrack(song, artistObj);
        actions.appendChild(playBtn);
        // Botón favoritos
        const favBtn = document.createElement('button');
        favBtn.className = 'song-btn fav' + (isFav(song) ? ' active' : '');
        favBtn.innerHTML = '★';
        favBtn.onclick = () => toggleFav(song, artistObj);
        actions.appendChild(favBtn);
        // Botón agregar a cola
        const queueBtn = document.createElement('button');
        queueBtn.className = 'song-btn';
        queueBtn.innerHTML = '➕';
        queueBtn.title = 'Agregar a la cola';
        queueBtn.onclick = () => addToQueue(song, artistObj);
        actions.appendChild(queueBtn);
        // Botón compartir
        const shareBtn = document.createElement('button');
        shareBtn.className = 'song-btn share';
        shareBtn.title = 'Compartir';
        shareBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98"/><path d="M15.41 6.51l-6.82 3.98"/></svg>`;
        shareBtn.onclick = () => window.open(song.youtube, '_blank');
        actions.appendChild(shareBtn);
        songDiv.appendChild(info);
        songDiv.appendChild(actions);
        songsDiv.appendChild(songDiv);
      });
      folder.appendChild(songsDiv);
      artistsList.appendChild(folder);
    });
    // Si solo hay un artista, mostrar chips de canciones
    if (matches.length === 1) {
      selectedArtistObj = matches[0];
      showSongChips(selectedArtistObj);
    } else {
      selectedArtistObj = null;
      songFilterSection.style.display = 'none';
    }
  });

  // Mostrar chips de canciones del artista seleccionado
  function showSongChips(artistObj) {
    songChips.innerHTML = '';
    artistObj.songs.forEach(song => {
      const chip = document.createElement('span');
      chip.className = 'song-chip';
      chip.textContent = song.title;
      chip.onclick = () => playTrack(song, artistObj);
      songChips.appendChild(chip);
    });
    songFilterSection.style.display = 'block';
  }

  // Evento para filtrar canciones al seleccionar en el dropdown
  songDropdown.addEventListener('change', function() {
    if (!lastArtistFiltered) return;
    if (songDropdown.value === 'all') {
      renderArtists(lastArtistFiltered.artist); // Muestra todas las canciones del artista filtrado
      return;
    }
    const idx = parseInt(songDropdown.value);
    if (isNaN(idx)) return;
    // Filtrar la lista para mostrar solo la canción seleccionada
    artistsList.innerHTML = '';
    const artistObj = lastArtistFiltered;
    const song = artistObj.songs[idx];
    const folder = document.createElement('div');
    folder.className = 'artist-folder open';
    const header = document.createElement('div');
    header.className = 'artist-header';
    header.innerHTML = `<span class="artist-color" style="background:${artistObj.color}"></span>${artistObj.artist}`;
    folder.appendChild(header);
    const songsDiv = document.createElement('div');
    songsDiv.className = 'artist-songs';
    const songDiv = document.createElement('div');
    songDiv.className = 'song-item';
    // Info
    const info = document.createElement('div');
    info.className = 'song-info';
    info.innerHTML = `
      <img class="song-cover" src="${song.cover}" alt="cover">
      <div class="song-meta">
        <span class="song-title">${song.title}</span>
        <span class="song-artist">${artistObj.artist}</span>
        <span class="song-extra">${song.genre} • ${song.year} • ${song.duration}</span>
      </div>
    `;
    // Acciones
    const actions = document.createElement('div');
    actions.className = 'song-actions';
    // Botón reproducir
    const playBtn = document.createElement('button');
    playBtn.className = 'song-btn';
    playBtn.innerHTML = '▶️';
    playBtn.onclick = () => playTrack(song, artistObj);
    actions.appendChild(playBtn);
    // Botón favoritos
    const favBtn = document.createElement('button');
    favBtn.className = 'song-btn fav' + (isFav(song) ? ' active' : '');
    favBtn.innerHTML = '★';
    favBtn.onclick = () => toggleFav(song, artistObj);
    actions.appendChild(favBtn);
    // Botón agregar a cola
    const queueBtn = document.createElement('button');
    queueBtn.className = 'song-btn';
    queueBtn.innerHTML = '➕';
    queueBtn.title = 'Agregar a la cola';
    queueBtn.onclick = () => addToQueue(song, artistObj);
    actions.appendChild(queueBtn);
    // Botón compartir
    const shareBtn = document.createElement('button');
    shareBtn.className = 'song-btn share';
    shareBtn.title = 'Compartir';
    shareBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98"/><path d="M15.41 6.51l-6.82 3.98"/></svg>`;
    shareBtn.onclick = () => window.open(song.youtube, '_blank');
    actions.appendChild(shareBtn);
    songDiv.appendChild(info);
    songDiv.appendChild(actions);
    songsDiv.appendChild(songDiv);
    folder.appendChild(songsDiv);
    artistsList.appendChild(folder);
  });

  // Render inicial (muestra todos los artistas y oculta chips)
  renderArtists();
  renderFavs();
  renderQueue();
  songFilterSection.style.display = 'none';
  // Al final de la carga inicial, establecer el fondo GIF
  const overlayInit = document.getElementById('background-overlay');
  // En la carga inicial (DOMContentLoaded), dejar solo el fondo oscuro:
  overlayInit.style.background = 'rgba(20,20,30,0.4)';
  // El GIF solo se aplica en playTrack (cuando se reproduce una canción).
});

function updateDateTime() {
  const dt = new Date();
  const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
  const dateStr = dt.toLocaleDateString('es-ES', options);
  const timeStr = dt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  document.getElementById('datetime').textContent = `${dateStr} | ${timeStr}`;
}
setInterval(updateDateTime, 1000);
updateDateTime(); 