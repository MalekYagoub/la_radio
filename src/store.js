import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    socket: null,
    musics: [],
    currentMusic: null,
    currentMusicIndex: null,
    buttonDisabled: false,
    snackbar: null,
    allowToPlay: true,
    musicState: 'pause'
  },
  mutations: {
    setSocket (state, payload) {
      state.socket = payload;
    },
    setButtonDisabled (state, payload) {
      state.buttonDisabled = payload;
    },
    setMusics (state, payload) {
      state.musics = payload;
    },
    appendMusic (state, payload) {
      state.musics.push(payload);
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
    }
  },
  getters: {
    socket: state => state.socket,
    buttonDisabled: state => state.buttonDisabled,
    musics: state => state.musics,
    snackbar: state => state.snackbar,
    currentMusic: state => state.currentMusic,
    currentMusicIndex: state => state.currentMusicIndex,
    allowToPlay: state => state.allowToPlay,
    musicState: state => state.musicState
  }
})
