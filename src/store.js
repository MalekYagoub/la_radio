import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    socket: null,
    musics: [],
    currentMusic: null,
    currentMusicIndex: null,
    snackbar: null,
    allowToPlay: true,
    musicState: 'pause',
    musicToDelete: null,
    initFirstMusic: false
  },
  mutations: {
    setSocket (state, payload) {
      state.socket = payload;
    },
    setMusics (state, payload) {
      state.musics = payload;
    },
    appendMusic (state, payload) {
      state.musics.push(payload);
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
    }
  },
  getters: {
    socket: state => state.socket,
    musics: state => state.musics,
    snackbar: state => state.snackbar,
    currentMusic: state => state.currentMusic,
    currentMusicIndex: state => state.currentMusicIndex,
    allowToPlay: state => state.allowToPlay,
    musicState: state => state.musicState,
    musicToDelete: state => state.musicToDelete,
    initFirstMusic: state => state.initFirstMusic
  }
})
