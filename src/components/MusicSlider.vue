<template>
    <v-row justify="center" class="mt-4 slider">
        <v-col cols="4">
            <v-slider
                v-model="sliderMusicPosition"
                min="0"
                :max="musics[currentMusicIndex].duration"
                thumb-label
            ></v-slider>
        </v-col>
    </v-row>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    props: ['howler'],
    computed: {
        ...mapGetters(['socket', 'currentMusicIndex', 'musics'])
    },
    data () {
        return {
            sliderMusicPosition: 0
        }
    },
    mounted () {
        // récupérer le currentMusicPosition depuis le parent et mettre le slider au bon endroit
    }
}
</script>

<style>
    
</style>