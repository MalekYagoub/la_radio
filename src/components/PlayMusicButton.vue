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
    data () {
        return {
            howler: null,
            allowedToGetMusicState: false
        }
    },
    computed: {
        ...mapGetters(['socket', 'musicState', 'currentMusic', 'allowToPlay'])
    },
    methods: {
        changeMusicState () {
            // Indique au serveur si on doit mettre la musique en pause ou en play pour tout le monde
            this.musicState === 'play' ? this.$store.commit('setMusicState', 'pause') : this.$store.commit('setMusicState', 'play');
            this.socket.emit('server_setMusicState', this.musicState);
        },
        playPauseHowler (currentMusicInfo) {
            // Lance ou coupe l'audio de la musique en cours avec Howler et met à jour le musicState des clients qui n'ont pas lancé l'action
            this.$store.commit('setMusicState', currentMusicInfo.musicState);

            console.log(currentMusicInfo.currentMusicPosition / 1000);
            if (this.musicState === 'play' && this.howler) {
                this.howler.seek(currentMusicInfo.currentMusicPosition / 1000);
                this.howler.play();
            } else if (this.musicState === 'pause' && this.howler) {
                this.howler.pause();
            }
        }
    },
    mounted () {
        let sound = new Howl({
            src: ['data:audio/mp3;base64,' + this.currentMusic]
        });
        this.howler = sound;

        this.socket.on('client_setMusicState', (currentMusicInfo) => {
            this.playPauseHowler(currentMusicInfo);
        });

        this.socket.on('client_pauseMusic', () => {
            this.howler.pause();
            this.$store.commit('setMusicState', 'pause');
        });

        this.socket.on('client_resumeMusic', () => {
            console.log('testo n passe');
            this.howler.play();
            this.$store.commit('setMusicState', 'play');
        });

        this.socket.emit('server_getMusicState');
        this.socket.on('client_getMusicState', (currentMusicInfo) => {
            if (currentMusicInfo.musicState === 'play' && !this.allowedToGetMusicState) {
                this.$store.commit('setAllowToPlay', false);
            } else {
                this.lastCurrentMusicInfo = currentMusicInfo;
                this.playPauseHowler(currentMusicInfo);
            }
        });
    },
    watch: {
        allowToPlay () {
            if (this.allowToPlay) {
                this.allowedToGetMusicState = true;
                this.socket.emit('server_getMusicState');
            }
        },
        currentMusic (newValue, oldValue) {
            if (this.howler) this.howler.unload();

            let sound = new Howl({
            src: ['data:audio/mp3;base64,' + this.currentMusic]
            });
            this.howler = sound;

            this.playPauseHowler({
                musicState: this.musicState,
                currentMusicPosition: 0
            });

            // if (oldValue !== null) {
            //     this.playPauseHowler({
            //         musicState: this.musicState,
            //         currentMusicPosition: 0
            //     });
            // } else {
            //     this.playPauseHowler(this.lastCurrentMusicInfo);
            // }
        }
    }
}
</script>

<style lang="">
    
</style>