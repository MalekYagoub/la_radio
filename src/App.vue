<template>
  <v-app>
    <v-app-bar app dark class="primary">
      <v-toolbar-title class="headline text-uppercase">
        <span>La Radio <v-icon>radio</v-icon></span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-tooltip left>
        <template v-slot:activator="{ on }">
          <v-badge
            color="red darken-3"
            right
            overlap
            class="mr-5"
          >
            <template v-slot:badge>{{usersConnected}}</template>
            <v-icon
              color="grey lighten-1"
              large
              v-on="on"
            >
              account_circle
            </v-icon>
          </v-badge>
        </template>
        <span>{{usersConnected}} utilisateur<template v-if="usersConnected > 1">s</template> sur LaRadio</span>
      </v-tooltip>
    </v-app-bar>

    <Snack />

    <v-overlay
      :opacity="0.9"
      :value="!$store.getters.allowToPlay || !$store.getters.playerLoaded"
      @click.native="$store.commit('setAllowToPlay', true)"
    >
      <v-container v-if="!$store.getters.allowToPlay">
        <v-row>
          <span class="title">Cliquez pour reprendre la diffusion</span>
        </v-row>
        <v-row class="mt-5" justify="center">
          <v-icon x-large>blur_on</v-icon>
        </v-row>
      </v-container>
      <v-container v-else>
        <v-row justify="center" align="center">
          <v-progress-circular
            :size="70"
            :width="7"
            color="white"
            indeterminate
          ></v-progress-circular>
        </v-row>
      </v-container>
    </v-overlay>

    <v-content v-if="$store.getters.socket">
      <UrlForm/>
      <v-container>
        <v-row justify="center">
          <v-col sm="12" md="3">
            <MusicsList/>
          </v-col>
          <v-col sm="12" md="4">
            <PlaylistsList />
          </v-col>
        </v-row>
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
import PlaylistsList from '@/components/PlaylistsList';
import io from 'socket.io-client';
import MusicPlayer from '@/components/MusicPlayer';
import { mapGetters } from 'vuex';

export default {
  name: 'App',
  components: {
    UrlForm,
    Snack,
    MusicsList,
    PlaylistsList,
    MusicPlayer
  },
  computed: {
    ...mapGetters(['musicToDelete', 'currentMusic'])
  },
  data () {
    return {
      base64Music: null,
      musicSeconds: null,
      usersConnected: 0
    }
  },
  mounted () {
    // Light theme
    this.$vuetify.theme.themes.light.primary = '#363237';
    this.$vuetify.theme.themes.light.secondary = '#2D4262';
    this.$vuetify.theme.themes.light.accent = '#00796B';

    // Dark theme
    this.$vuetify.theme.themes.dark.primary = '#363237';
    this.$vuetify.theme.themes.dark.secondary = '#2D4262';
    this.$vuetify.theme.themes.dark.accent = '#00796B';

    // On crée notre socket
    const socket = io(process.env.VUE_APP_SERVER_URL);
    // On l'enregistre dans notre state pour ne pas le perdre
    this.$store.commit('setSocket', socket);

    socket.on('client_usersConnected', (data) => {
      this.usersConnected = data.usersConnected;
    });

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
      this.$store.commit('setLoadingNewMusicIndex', null);

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
