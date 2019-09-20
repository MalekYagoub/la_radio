<template>
  <v-app>
    <v-app-bar app>
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

    <v-content v-if="$store.getters.musics.length > 0 && $store.getters.socket">
      <UrlForm/>
      <v-container v-if="$store.getters.currentMusic">
        <v-row
          align="center"
          justify="center">
          <NextPrevMusicButton nextOrPrev="prev" class="mx-4"/>
          <PlayMusicButton class="mx-4"/>
          <NextPrevMusicButton nextOrPrev="next" class="mx-4"/>
        </v-row>
      </v-container>
      <v-container>
        <MusicsList/>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import UrlForm from '@/components/UrlForm';
import Snack from '@/components/shared/Snack';
import PlayMusicButton from '@/components/PlayMusicButton';
import NextPrevMusicButton from '@/components/NextPrevMusicButton';
import MusicsList from '@/components/MusicsList';
import io from 'socket.io-client';

export default {
  name: 'App',
  components: {
    UrlForm,
    Snack,
    PlayMusicButton,
    NextPrevMusicButton,
    MusicsList
  },
  data () {
    return {
      base64Music: null,
      musicSeconds: null
    }
  },
  mounted () {
    // On crée notre socket
    const socket = io('http://127.0.0.1:3000');
    // On l'enregistre dans notre state pour ne pas le perdre
    this.$store.commit('setSocket', socket);

    // Récupérer toutes les data importantes (play / stop, volume, combien de secondes on en est)
    socket.emit('server_getMusics');
    socket.on('client_getMusics', (musics) => {
      this.$store.commit('setMusics', musics);
    });

    // Récupérer la musique en base 64 à chaque fois qu'on change de musique en changeant l'index dans la MusicList
    socket.on('client_changeCurrentMusic', (music) => {
      console.log(music);
      this.$store.commit('setMusicState', 'play');
      this.$store.commit('setCurrentMusic', music.base64Music);
      this.$store.commit('setCurrentMusicIndex', music.index);
    })
  }
};
</script>
