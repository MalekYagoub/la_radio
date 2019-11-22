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
            <template v-slot:badge>{{usersCount}}</template>
            <v-icon
              color="grey lighten-1"
              large
              v-on="on"
            >
              account_circle
            </v-icon>
          </v-badge>
        </template>
        <span>{{usersCount}} utilisateur<template v-if="usersCount > 1">s</template> sur LaRadio</span>
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
          <v-col sm="12" lg="4" xl="3">
            <MusicsList/>
          </v-col>
          <v-col sm="12" lg="6" xl="4">
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
    ...mapGetters(['lastCurrentMusicToDelete', 'currentMusic', 'sessionId'])
  },
  data () {
    return {
      usersCount: 0
    }
  },
  mounted () {
    // Light theme
    this.$vuetify.theme.themes.light.primary = '#363237';
    this.$vuetify.theme.themes.light.secondary = '#2D4262';
    this.$vuetify.theme.themes.light.accent = '#00ac98';

    // Dark theme
    this.$vuetify.theme.themes.dark.primary = '#363237';
    this.$vuetify.theme.themes.dark.secondary = '#2D4262';
    this.$vuetify.theme.themes.dark.accent = '#00ac98';

    // On crée notre socket
    const socket = io(process.env.VUE_APP_SERVER_URL);
    // On l'enregistre dans notre state pour ne pas le perdre
    this.$store.commit('setSocket', socket);

    socket.on('client_usersCount', (data) => {
      this.usersCount = data.usersCount;
      if (data.type === 'disconnection') {
        this.$store.commit('setShouldAutoSkip', this.sessionId === data.autoSkipClientId);
      }
    });

    socket.on('client_userConnection', (data) => {
      this.$store.commit('setSessionId', data.clientId);
      this.$store.commit('setShouldAutoSkip', data.clientId === data.autoSkipClientId);
    });

    socket.emit('server_getMusics');
    socket.on('client_getMusics', (musics) => {
      this.$store.commit('setMusics', musics);
    });

    socket.emit('server_getPlaylists');
    socket.on('client_getPlaylists', (playlists) => {
      this.$store.commit('setPlaylists', playlists);
    });

    socket.emit('server_getCurrentMusicIndex');
    socket.on('client_getCurrentMusicIndex', (musicIndex) => {
      if (!musicIndex && musicIndex !== 0) this.$store.commit('setPlayerLoaded', true);
      this.$store.commit('setCurrentMusicIndex', musicIndex);
    });

    socket.emit('server_getCurrentPlaylistMusicIndex');
    socket.on('client_getCurrentPlaylistMusicIndex', (playlistMusicIndex) => {
      this.$store.commit('setCurrentPlaylistMusicIndex', playlistMusicIndex);
    });

    socket.emit('server_getCurrentPlaylistId');
    socket.on('client_getCurrentPlaylistId', (playlistId) => {
      this.$store.commit('setCurrentPlaylistId', playlistId);
    });

    // Récupérer la musique en base 64 à chaque fois qu'on change de musique en changeant l'index dans la MusicList
    socket.on('client_changeCurrentMusic', (music) => {
      if (this.$store.getters.shouldAutoSkip) {
        socket.emit('server_validateMusicReceived');
      }
      this.$store.commit('setLoadingNewMusicIndex', null);

      if (!this.currentMusic) {
        // On passe de pas de musique à une musique
        this.$store.commit('setInitFirstMusic', true);
      }
      this.$store.commit('setMusicState', 'play');
      this.$store.commit('setCurrentMusic', music.base64Music);
      this.$store.commit('setCurrentMusicIndex', music.index);

      if (this.lastCurrentMusicToDelete) {
        this.$store.commit('deleteMusic', this.lastCurrentMusicToDelete);
        this.$store.commit('deleteMusicFromPlaylists', this.lastCurrentMusicToDelete);
        this.$store.commit('setSnackbar', {color: 'secondary', message: 'Une musique a été supprimée'});
        this.$store.commit('setLastCurrentMusicToDelete', null);
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
