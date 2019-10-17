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
    snackbar: null,
    allowToPlay: true,
    musicState: 'pause',
    musicToDelete: null,
    initFirstMusic: false,
    loadingNewMusicIndex: null,
    playerLoaded: false,
    shouldAutoSkip: false,
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
    deleteMusic (state, payload) {
      state.musics.splice(payload.index, 1);
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
    setMusicToDelete (state, payload) {
      state.musicToDelete = payload;
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
    musicToDelete: state => state.musicToDelete,
    initFirstMusic: state => state.initFirstMusic,
    loadingNewMusicIndex: state => state.loadingNewMusicIndex,
    playerLoaded: state => state.playerLoaded,
    shouldAutoSkip: state => state.shouldAutoSkip
  }
})
