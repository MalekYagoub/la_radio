import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    socket: null,
    sessionId: null,
    musics: [],
    playlists: [],
    currentMusic: null,
    currentMusicIndex: null,
    currentPlaylistId: null,
    snackbar: null,
    allowToPlay: true,
    musicState: 'pause',
    lastCurrentMusicToDelete: null,
    initFirstMusic: false,
    loadingNewMusicIndex: null,
    playerLoaded: false,
    shouldAutoSkip: false,
    closeAddMusicToPlaylistsModal: false
  },
  mutations: {
    setSocket (state, payload) {
      state.socket = payload;
    },
    setSessionId (state, payload) {
      state.sessionId = payload;
    },
    setMusics (state, payload) {
      state.musics = payload;
    },
    setPlaylists (state, payload) {
      state.playlists = payload;
    },
    appendMusic (state, payload) {
      state.musics.push(payload);
    },
    appendPlaylist (state, payload) {
      state.playlists.push(payload);
    },
    editPlaylist (state, payload) {
      state.playlists[payload.index].title = payload.title;
    },
    deleteMusic (state, payload) {
      state.musics.splice(payload.index, 1);
    },
    deletePlaylist (state, payload) {
      state.playlists.splice(payload.index, 1);
    },
    setSnackbar (state, payload) {
      state.snackbar = payload;
    },
    setAllowToPlay (state, payload) {
      state.allowToPlay = payload;
    },
    setCurrentMusic (state, payload) {
      state.currentMusic = payload;
    },
    setCurrentMusicIndex (state, payload) {
      state.currentMusicIndex = payload;
    },
    setMusicState (state, payload) {
      state.musicState = payload;
    },
    setLastCurrentMusicToDelete (state, payload) {
      state.lastCurrentMusicToDelete = payload;
    },
    setInitFirstMusic (state, payload) {
      state.initFirstMusic = payload;
    },
    setLoadingNewMusicIndex (state, payload) {
      state.loadingNewMusicIndex = payload;
    },
    setPlayerLoaded (state, payload) {
      state.playerLoaded = payload;
    },
    setShouldAutoSkip (state, payload) {
      state.shouldAutoSkip = payload;
    },
    setCloseAddMusicToPlaylistsModal (state, payload) {
      state.closeAddMusicToPlaylistsModal = payload;
    },
    addMusicToPlaylists (state, payload) {
      delete payload.music.playlists;
      payload.playlists.forEach((playlist) => {
        const playlistIndex = state.playlists.findIndex((statePlaylist) => playlist.id === statePlaylist.id);
        state.playlists[playlistIndex].musics[payload.music.videoId] = payload.music;
      });
    },
    addPlaylistToMusic (state, payload) {
      const musicIndex = state.musics.findIndex((music) => payload.music.videoId === music.videoId);
      payload.playlists.forEach((playlist) => {
        delete playlist.musics;
        state.musics[musicIndex].playlists[playlist.id] = playlist;
      });
    },
    deleteMusicFromPlaylists (state, payload) {
      state.playlists.forEach((playlist) => {
        if (playlist.musics[payload.musicId]) {
          delete playlist.musics[payload.musicId];
        }
      });
    },
    deletePlaylistFromMusics (state, payload) {
      state.musics.forEach((music) => {
        if (music.playlists[payload.playlist.id]) {
          delete music.playlists[payload.playlist.id];
        }
      });
    },
    deleteMusicFromPlaylist (state, payload) {
      const musicIndex = state.musics.findIndex((music) => payload.musicId === music.videoId);
      const playlistIndex = state.playlists.findIndex((playlist) => payload.playlistId === playlist.id);
      delete state.musics[musicIndex].playlists[payload.playlistId];
      delete state.playlists[playlistIndex].musics[payload.musicId];
    },
    setCurrentPlaylistId (state, payload) {
      state.currentPlaylistId = payload;
    }
  },
  getters: {
    socket: state => state.socket,
    sessionId: state => state.sessionId,
    musics: state => state.musics,
    playlists: state => state.playlists,
    snackbar: state => state.snackbar,
    currentMusic: state => state.currentMusic,
    currentMusicIndex: state => state.currentMusicIndex,
    allowToPlay: state => state.allowToPlay,
    musicState: state => state.musicState,
    lastCurrentMusicToDelete: state => state.lastCurrentMusicToDelete,
    initFirstMusic: state => state.initFirstMusic,
    loadingNewMusicIndex: state => state.loadingNewMusicIndex,
    playerLoaded: state => state.playerLoaded,
    shouldAutoSkip: state => state.shouldAutoSkip,
    closeAddMusicToPlaylistsModal: state => state.closeAddMusicToPlaylistsModal,
    currentPlaylistId: state => state.currentPlaylistId,
    currentPlaylist (state) {
      const playlistIndex = state.playlists.findIndex((playlist) => state.currentPlaylistId === playlist.id);
      return state.playlists[playlistIndex];
    }
  }
})
