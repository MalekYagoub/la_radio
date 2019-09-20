<template>
    <v-btn :disabled="!currentMusic" fab large @click="changeMusicState">
        <v-icon dark v-if="musicState === 'play'">pause</v-icon>
        <v-icon dark v-else>play_arrow</v-icon>
    </v-btn>
</template>

<script>
import {Howl} from 'howler';
import { mapGetters } from 'vuex';

export default {
    props: ['howler'],
    data () {
        return {
            allowedToGetMusicState: false
        }
    },
    computed: {
        ...mapGetters(['socket', 'musicState', 'currentMusic'])
    },
    methods: {
        changeMusicState () {
            // Indique au serveur si on doit mettre la musique en pause ou en play pour tout le monde
            this.musicState === 'play' ? this.$store.commit('setMusicState', 'pause') : this.$store.commit('setMusicState', 'play');
            this.socket.emit('server_setMusicState', this.musicState);
        },
    }
}
</script>

<style lang="">
    
</style>