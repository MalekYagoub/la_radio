<template>
  <v-app>
    <v-app-bar app dark class="primary">
      <v-toolbar-title class="headline text-uppercase">
        <span>La Radio <v-icon>radio</v-icon></span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
    </v-app-bar>

    <Snack />

    <v-overlay
      :opacity="0.9"
      :value="!$store.getters.allowToPlay"
      @click.native="$store.commit('setAllowToPlay', true)"
    >
      <v-container>
        <v-row>
          <span class="title">Cliquez pour reprendre la diffusion</span>
        </v-row>
        <v-row class="mt-5" justify="center">
          <v-icon x-large>blur_on</v-icon>
        </v-row>
      </v-container>
    </v-overlay>

    <v-content v-if="$store.getters.socket">
      <UrlForm/>
      <v-container>
        <MusicsList/>
      </v-container>
      <template v-if="$store.getters.currentMusic">
        <MusicPlayer class="mt-6"/>
      </template>
    </v-content>
  </v-app>
</template>

<script>
import UrlForm from '@/components/UrlForm';
import Snack from '@/components/shared/Snack';
import MusicsList from '@/components/MusicsList';
import io from 'socket.io-client';
import MusicPlayer from '@/components/MusicPlayer';
import { mapGetters } from 'vuex';

export default {
  name: 'App',
  components: {
    UrlForm,
    Snack,
    MusicsList,
    MusicPlayer
  },
  computed: {
    ...mapGetters(['musicToDelete', 'currentMusic'])
  },
  data () {
    return {
      base64Music: null,
      musicSeconds: null
    }
  },
  mounted () {
    // Light theme
    this.$vuetify.theme.themes.light.primary = '#363237';
    this.$vuetify.theme.themes.light.secondary = '#2D4262';
    this.$vuetify.theme.themes.light.accent = '#655450';

    // Dark theme
    this.$vuetify.theme.themes.dark.primary = '#363237';
    this.$vuetify.theme.themes.dark.secondary = '#2D4262';
    this.$vuetify.theme.themes.dark.accent = '#655450';

    // On crée notre socket
    const socket = io('http://127.0.0.1:3000');
    // On l'enregistre dans notre state pour ne pas le perdre
    this.$store.commit('setSocket', socket);

    // Récupérer toutes les data importantes (play / stop, volume, combien de secondes on en est)
    socket.emit('server_getMusics');
    socket.on('client_getMusics', (musics) => {
      this.$store.commit('setMusics', musics);
    });

    socket.emit('server_getCurrentMusicIndex');
    socket.on('client_getCurrentMusicIndex', (currentMusicIndex) => {
      this.$store.commit('setCurrentMusicIndex', currentMusicIndex);
    });

    // Récupérer la musique en base 64 à chaque fois qu'on change de musique en changeant l'index dans la MusicList
    socket.on('client_changeCurrentMusic', (music) => {
      socket.emit('server_refreshPreviousMusicEnded');
      if (!this.currentMusic) {
        // On passe de pas de musique à une musique
        this.$store.commit('setInitFirstMusic', true);
      }
      this.$store.commit('setMusicState', 'play');
      this.$store.commit('setCurrentMusic', music.base64Music);
      this.$store.commit('setCurrentMusicIndex', music.index);

      if (this.musicToDelete) {
        this.$store.commit('deleteMusic', this.musicToDelete);
        this.$store.commit('setSnackbar', {color: 'secondary', message: 'Une musique a été supprimée'});
        this.$store.commit('setMusicToDelete', null);
      }
    });
  }
};
</script>

<style scoped>
  main {
    background-color: #f5f5f5;
  }
</style>
