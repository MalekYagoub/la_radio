<template>
    <v-btn @click="changeMusic" fab large>
        <v-icon dark v-if="nextOrPrev === 'prev'">skip_previous</v-icon>
        <v-icon dark v-else>skip_next</v-icon>
    </v-btn>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    props: ['nextOrPrev'],
    computed: {
        ...mapGetters(['socket', 'currentMusicIndex', 'musics'])
    },
    methods: {
        changeMusic () {
            let indexToPass;
            if (this.nextOrPrev === 'prev' ) {
                indexToPass = this.currentMusicIndex === 0 ? this.musics.length - 1 : this.currentMusicIndex - 1;
                this.socket.emit('server_changeCurrentMusic', indexToPass);
            } else {
                indexToPass = this.currentMusicIndex === this.musics.length - 1 ? 0 : this.currentMusicIndex + 1;
                this.socket.emit('server_changeCurrentMusic', indexToPass);
            }
        }
    }
}
</script>

<style lang="">
    
</style>