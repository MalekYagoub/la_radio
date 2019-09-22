<template>
    <v-row justify="center" align="center">
        <v-col cols="auto">
            <span style="width: 55px;" class="grey--text">{{musicPositionFormatted[0]}}</span>
        </v-col>
        <v-col cols="4">
            <v-slider
                v-model="musicSliderPositionSeconds"
                min="0"
                :max="musics[currentMusicIndex].duration"
                @change="onMusicPositionChange"
                :height="0"
                :color="'#3949AB'"
                track-color="#3949AB"
                inverse-label
                style="width: 600px;"
                class="pt-5"
            ></v-slider>
        </v-col>
        <v-col cols="auto">
            <span style="width: 55px;" class="grey--text">{{musicPositionFormatted[1]}}</span>
        </v-col>
    </v-row>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    props: ['howler', 'musicSliderPosition', 'lastMusicInfo'],
    computed: {
        ...mapGetters(['socket', 'currentMusicIndex', 'currentMusic', 'musics', 'musicState']),
        musicPositionFormatted () {
            const minutes = Math.floor(this.musicSliderPositionSeconds / 60);
            let seconds = this.musicSliderPositionSeconds % 60;
            if (seconds < 10) seconds = '0' + seconds;
            const totalSecondsLeft = this.musics[this.currentMusicIndex].duration - this.musicSliderPositionSeconds;
            const minutesLeft = Math.floor(totalSecondsLeft / 60);
            let secondsLeft = totalSecondsLeft % 60;
            if (secondsLeft < 10) secondsLeft = '0' + secondsLeft;
            return [`${minutes}:${seconds}`, `- ${minutesLeft}:${secondsLeft}`];
        }
    },
    data () {
        return {
            musicSliderPositionSeconds: this.musicSliderPosition / 1000,
            lastInterval: null
        }
    },
    methods: {
        onMusicPositionChange (position) {
            this.socket.emit('server_changeMusicPosition', position * 1000);
        }
    },
    mounted () {
        this.socket.on('client_changeMusicPosition', (currentMusicPosition) => {
            this.musicSliderPositionSeconds = currentMusicPosition / 1000;
        });
    },
    watch: {
        musicState () {
            if (this.musicState === 'pause') {
                if (this.lastInterval)  {
                    clearInterval(this.lastInterval);
                }
            } else {
                this.lastInterval = setInterval(() => {
                    this.musicSliderPositionSeconds += 1;
                }, 1000);
            }
        },
        currentMusic () {
            this.musicSliderPositionSeconds = 0;
            if (this.lastInterval) clearInterval(this.lastInterval);
            if (this.musicState === 'play') {
                this.lastInterval = setInterval(() => {
                    this.musicSliderPositionSeconds += 1;
                }, 1000);
            }
        },
        musicSliderPosition () {
            this.musicSliderPositionSeconds = this.musicSliderPosition / 1000;
        },
        lastMusicInfo () {
            if (this.lastMusicInfo) {
                this.musicSliderPositionSeconds = this.lastMusicInfo.currentMusicPosition / 1000;
            }
        }
    }
}
</script>

<style>
</style>