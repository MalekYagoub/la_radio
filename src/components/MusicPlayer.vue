<template>
    <v-container v-if="howler">
        <v-row
            align="center"
            justify="center">
            <NextPrevMusicButton nextOrPrev="prev" class="mx-4"/>
            <PlayMusicButton :howler="howler" class="mx-4"/>
            <NextPrevMusicButton nextOrPrev="next" class="mx-4"/>
        </v-row>
        <MusicSlider v-if="musicSliderPosition !== null" :howler="howler" :musicSliderPosition="musicSliderPosition"/>
    </v-container>
</template>

<script>
import { mapGetters } from 'vuex';

import PlayMusicButton from '@/components/PlayMusicButton';
import NextPrevMusicButton from '@/components/NextPrevMusicButton';
import MusicSlider from '@/components/MusicSlider';

export default {
    // Remonter toutes les actions du PlayButton dans le player
    components: {
        PlayMusicButton,
        NextPrevMusicButton,
        MusicSlider
    },
    computed: {
        ...mapGetters(['socket', 'currentMusic', 'allowToPlay', 'musicState', 'musics', 'currentMusicIndex'])
    },
    data () {
        return {
            howler: null,
            allowedToGetMusicState: false,
            musicSliderPosition: null
        }
    },
    methods: {
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

        this.howler.on('end', () => {
            const indexToPass = this.currentMusicIndex === this.musics.length - 1 ? 0 : this.currentMusicIndex + 1;
            this.socket.emit('server_changeCurrentMusic', indexToPass);
        });

        this.socket.on('client_setMusicState', (currentMusicInfo) => {
            this.playPauseHowler(currentMusicInfo);
            this.musicSliderPosition = currentMusicInfo.currentMusicPosition;
        });

        this.socket.on('client_pauseMusic', () => {
            this.howler.pause();
            this.$store.commit('setMusicState', 'pause');
        });

        this.socket.on('client_resumeMusic', () => {
            this.howler.play();
            this.$store.commit('setMusicState', 'play');
        });

        this.socket.on('client_changeMusicPosition', (currentMusicPosition) => {
            console.log('la nouvelle position: ' + currentMusicPosition);
            this.musicSliderPosition = currentMusicPosition;
            this.howler.seek(currentMusicPosition / 1000);
        });

        this.socket.emit('server_getMusicState');
        this.socket.on('client_getMusicState', (currentMusicInfo) => {
            console.log(currentMusicInfo);
            this.musicSliderPosition = currentMusicInfo.currentMusicPosition;
            if (currentMusicInfo.musicState === 'play' && !this.allowedToGetMusicState) {
                this.$store.commit('setAllowToPlay', false);
            } else {
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
        currentMusic () {
            if (this.howler) this.howler.unload();
            let sound = new Howl({
                src: ['data:audio/mp3;base64,' + this.currentMusic]
            });
            this.howler = sound;

            this.howler.on('end', () => {
                const indexToPass = this.currentMusicIndex === this.musics.length - 1 ? 0 : this.currentMusicIndex + 1;
                this.socket.emit('server_changeCurrentMusic', indexToPass);
            });

            this.musicSliderPosition = 0;
            this.playPauseHowler({
                musicState: this.musicState,
                currentMusicPosition: 0
            });
        }
    }
}
</script>

<style>
    
</style>