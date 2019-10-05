<template>
    <v-container v-if="howler && allowToPlay">
        <v-row justify="center" align="end">
            <div class="d-inline-flex flex-column" style="width: 742px;">
                <div class="d-inline-flex">
                    <v-col cols="auto">
                        <v-card width="200" height="125" :elevation="10">
                            <v-img :src="musics[currentMusicIndex].thumbnail"
                                width="200"
                                height="125"/>
                        </v-card>
                    </v-col>
                    <div class="d-flex flex-column">
                        <v-col cols="auto">
                            <span class="title font-weight-medium">{{musics[currentMusicIndex].videoTitle}}</span>
                        </v-col>
                        <v-col cols="auto">
                            <div class="d-flex align-center">
                                <NextPrevMusicButton nextOrPrev="prev" class="mx-2"/>
                                <PlayMusicButton :howler="howler" class="mx-2"/>
                                <NextPrevMusicButton nextOrPrev="next" class="mx-2"/>
                                <div class="pl-1">
                                    <v-tooltip right>
                                        <template v-slot:activator="{ on }">
                                            <v-btn v-on="on" @click="setRandomState" icon :color="randomState === 0 ? 'primary' : 'teal darken-2'">
                                                <v-icon>shuffle</v-icon>
                                            </v-btn>
                                        </template>
                                        <span>Lecture aléatoire {{randomState === 0 ? 'désactivé' : 'activé'}}</span>
                                    </v-tooltip>
                                    <MusicVolume class="pl-2" :volume="volume" @changeVolume="changeVolume"/>
                                </div>
                            </div>
                        </v-col>
                    </div>
                </div>
                <MusicSlider class="mt-2" v-if="musicSliderPosition !== null" :howler="howler" :lastMusicInfo="lastMusicInfo" :musicSliderPosition="musicSliderPosition"/>
            </div>
        </v-row>
    </v-container>
</template>

<script>
import { Howl } from 'howler';
import { mapGetters } from 'vuex';

import PlayMusicButton from '@/components/PlayMusicButton';
import NextPrevMusicButton from '@/components/NextPrevMusicButton';
import MusicSlider from '@/components/MusicSlider';
import MusicVolume from '@/components/MusicVolume';

export default {
    // Remonter toutes les actions du PlayButton dans le player
    components: {
        PlayMusicButton,
        NextPrevMusicButton,
        MusicSlider,
        MusicVolume
    },
    computed: {
        ...mapGetters(['socket', 'currentMusic', 'allowToPlay', 'musicState', 'musics', 'currentMusicIndex', 'initFirstMusic'])
    },
    data () {
        return {
            howler: null,
            allowedToGetMusicState: false,
            musicSliderPosition: null,
            lastMusicInfo: null,
            volume: 1,
            randomState: 0,
            getMusicStateHandler: () => {}
        }
    },
    methods: {
        playPauseHowler (currentMusicInfo) {
            // Lance ou coupe l'audio de la musique en cours avec Howler et met à jour le musicState des clients qui n'ont pas lancé l'action
            this.$store.commit('setMusicState', currentMusicInfo.musicState);

            if (this.musicState === 'play' && this.howler) {
                this.howler.seek(currentMusicInfo.currentMusicPosition / 1000);
                this.howler.play();
            } else if (this.musicState === 'pause' && this.howler) {
                this.howler.pause();
            }
        },
        changeVolume (volume) {
            this.volume = volume / 100;
            if (this.howler) this.howler.volume(this.volume);
        },
        setRandomState () {
            this.socket.emit('server_setRandomState');
        }
    },
    mounted () {
        let sound = new Howl({
            src: ['data:audio/mp3;base64,' + this.currentMusic],
            volume: this.volume
        });
        this.howler = sound;

        this.howler.on('end', () => {
            // const indexToPass = this.currentMusicIndex === this.musics.length - 1 ? 0 : this.currentMusicIndex + 1;
            const indexToPass = (this.currentMusicIndex + 1) % (this.musics.length);
            this.socket.emit('server_changeCurrentMusic', indexToPass);
        });

        this.socket.on('client_setMusicState', (currentMusicInfo) => {
            this.playPauseHowler(currentMusicInfo);
            this.lastMusicInfo = currentMusicInfo;
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
            this.howler.seek(currentMusicPosition / 1000);
        });

        this.socket.on('client_setRandomState', (randomStateValue) => {
            this.randomState = randomStateValue;
        });

        const vm = this;
        this.socket.emit('server_getMusicState');
        this.getMusicStateHandler = (currentMusicInfo) => {
            vm.musicSliderPosition = currentMusicInfo.currentMusicPosition;
            vm.randomState = currentMusicInfo.randomState;
            if (currentMusicInfo.musicState === 'play' && !vm.allowedToGetMusicState && !vm.initFirstMusic) {
                vm.$store.commit('setAllowToPlay', false);
            } else {
                if (vm.initFirstMusic) vm.$store.commit('setInitFirstMusic', false);
                vm.playPauseHowler(currentMusicInfo);
            }
        }
        this.socket.on('client_getMusicState', this.getMusicStateHandler);
    },
    beforeDestroy () {
        // A chaque fois qu'on destroy le player, on enlève l'écoute du getMusicState, pour ne pas accumuler les écoutes
        this.socket.removeListener('client_getMusicState', this.getMusicStateHandler);
        if (this.howler) this.howler.unload();
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
                src: ['data:audio/mp3;base64,' + this.currentMusic],
                volume: this.volume
            });
            this.howler = sound;

            this.howler.on('end', () => {
                // const indexToPass = this.currentMusicIndex === this.musics.length - 1 ? 0 : this.currentMusicIndex + 1;
                const indexToPass = (this.currentMusicIndex + 1) % (this.musics.length);
                this.socket.emit('server_changeCurrentMusic', indexToPass);
            });

            this.playPauseHowler({
                musicState: this.musicState,
                currentMusicPosition: 0
            });
        }
    }
}
</script>

<style>
    .music-player {
        display: flex;
        flex-direction: column;
    }
</style>