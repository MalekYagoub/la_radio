<template>
    <v-row justify="center" class="mt-4 slider">
        <v-col cols="4">
            <v-slider
                v-model="musicSliderPositionSeconds"
                min="0"
                :max="musics[currentMusicIndex].duration"
                thumb-label
                :thumb-size="24"
                @change="onMusicPositionChange"
            ></v-slider>
        </v-col>
    </v-row>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    props: ['howler', 'musicSliderPosition'],
    computed: {
        ...mapGetters(['socket', 'currentMusicIndex', 'musics'])
    },
    data () {
        return {
            musicSliderPositionSeconds: this.musicSliderPosition / 1000
        }
    },
    methods: {
        onMusicPositionChange (position) {
            // * 1000 pour retransformer en millisecondes
            this.socket.emit('server_changeMusicPosition', position * 1000);
        }
    },
    watch: {
        musicSliderPosition () {
            this.musicSliderPositionSeconds = this.musicSliderPosition / 1000;
        }
    }
}
</script>

<style>
    
</style>