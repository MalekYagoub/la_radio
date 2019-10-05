<template>
    <v-btn color="primary" :disabled="disableButton" @click="changeMusic" fab large>
        <v-icon v-if="nextOrPrev === 'prev'">skip_previous</v-icon>
        <v-icon v-else>skip_next</v-icon>
    </v-btn>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    props: ['nextOrPrev'],
    computed: {
        ...mapGetters(['socket', 'currentMusicIndex', 'musics', 'loadingNewMusicIndex']),
        disableButton () {
            return this.loadingNewMusicIndex !== null;
        }
    },
    methods: {
        changeMusic () {
            let indexToPass;
            if (this.nextOrPrev === 'prev' ) {
                indexToPass = this.currentMusicIndex === 0 ? this.musics.length - 1 : this.currentMusicIndex - 1;
                this.socket.emit('server_changeCurrentMusic', indexToPass, false, 'prev');
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