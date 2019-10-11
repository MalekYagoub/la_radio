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
                        <v-col :class="{'text-box': videoTitleWidth >= 438}" cols="auto">
                            <span ref="musicTitle" class="title font-weight-medium">{{musics[currentMusicIndex].videoTitle}}</span>
                        </v-col>
                        <v-col cols="auto">
                            <div class="d-flex align-center">
                                <NextPrevMusicButton nextOrPrev="prev" class="mx-2"/>
                                <PlayMusicButton :howler="howler" class="mx-2"/>
                                <NextPrevMusicButton nextOrPrev="next" class="mx-2"/>
                                <div class="pl-1">
                                    <div>
                                        <v-tooltip right>
                                            <template v-slot:activator="{ on }">
                                                <v-btn v-on="on" @click="setRandomState" icon :color="randomState === 0 ? 'primary' : 'accent'">
                                                    <v-icon>shuffle</v-icon>
                                                </v-btn>
                                            </template>
                                            <span>Lecture aléatoire {{randomState === 0 ? 'désactivé' : 'activé'}}</span>
                                        </v-tooltip>
                                        <v-btn class="ml-1" icon color="secondary">
                                            <v-icon>star_border</v-icon>
                                        </v-btn>
                                    </div>
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
        MusicVolume,
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
            getMusicStateHandler: () => {},
            videoTitleWidth: null // contient la largeur du titre pour savoir si on doit le faire scroll horizontalement ou pas
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
            if (this.howler) this.howler.volume(this.volume * this.volume);
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
        this.$nextTick(() => {
            this.videoTitleWidth = this.$refs.musicTitle.offsetWidth;
        })
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
            this.$nextTick(() => {
                this.videoTitleWidth = this.$refs.musicTitle.offsetWidth;
            })

            if (this.howler) this.howler.unload();
            let sound = new Howl({
                src: ['data:audio/mp3;base64,' + this.currentMusic],
                volume: this.volume * this.volume
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

<style lang="scss" scoped>
    .music-player {
        display: flex;
        flex-direction: column;
    }

    .text-box {
        width: 450px;
        height: 30px;
        overflow: hidden;
        line-height: 30px;
        padding: 0;
        margin-top: 12px;
        margin-bottom: 14px;
        padding-left: 12px;
        position: relative;
    }

    .text-box span {
        position: absolute;
        white-space: nowrap;
        transform: translateX(0);
        display: inline;
    }

    .text-box:hover span {
        transition: 5s;
        transform: translateX(calc(200px - 70%));
    }
</style>