<template>
    <v-btn color="primary" :disabled="disableButton" @click="changeMusic" fab large>
        <v-icon v-if="nextOrPrev === 'prev'">skip_previous</v-icon>
        <v-icon v-else>skip_next</v-icon>
    </v-btn>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    props: ['nextOrPrev', 'randomState'],
    computed: {
        ...mapGetters(['socket', 'currentMusicIndex', 'currentPlaylistMusicIndex', 'musics', 'loadingNewMusicIndex', 'currentPlaylist']),
        disableButton () {
            return this.loadingNewMusicIndex !== null;
        }
    },
    methods: {
        changeMusic () {
            let indexOrIdToPass;
            if (this.nextOrPrev === 'prev' ) {
                if (this.currentPlaylist) {
                    indexOrIdToPass = this.currentPlaylistMusicIndex === 0 ? Object.keys(this.currentPlaylist.musics)[Object.keys(this.currentPlaylist.musics).length - 1] : Object.keys(this.currentPlaylist.musics)[this.currentPlaylistMusicIndex - 1];
                } else {
                    indexOrIdToPass = this.currentMusicIndex === 0 ? this.musics.length - 1 : this.currentMusicIndex - 1;
                }
                this.socket.emit('server_changeCurrentMusic', indexOrIdToPass, false, 'prev');
            } else {
                if (this.currentPlaylist) {
                    indexOrIdToPass = Object.keys(this.currentPlaylist.musics)[(this.currentPlaylistMusicIndex + 1) % (Object.keys(this.currentPlaylist.musics).length)];
                } else {
                    indexOrIdToPass = this.currentMusicIndex === this.musics.length - 1 ? 0 : this.currentMusicIndex + 1;
                }
                console.log(indexOrIdToPass);
                this.socket.emit('server_changeCurrentMusic', indexOrIdToPass);
            }
        }
    }
}
</script>

<style lang="">
    
</style>