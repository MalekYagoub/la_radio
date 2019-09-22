<template>
    <v-hover v-slot:default="{ hover }">
        <v-list-item :class="{ 'music-row--selected': index === currentMusicIndex }">
            <v-list-item-avatar>
                <v-img :src="music.thumbnail"></v-img>
                <v-icon v-if="musicState === 'pause' || index !== currentMusicIndex" @click="selectMusicToPlay(index)" :class="{ 'play-arrow-icon--hover': hover, 'play-arrow-icon': true }">play_arrow</v-icon>
                <v-icon v-else @click="pauseMusic" :class="{ 'play-arrow-icon--hover': hover, 'play-arrow-icon': true }">pause</v-icon>
            </v-list-item-avatar>

            <v-list-item-content>
                <v-list-item-title :class="{ 'secondary--text font-weight-medium': index === currentMusicIndex }" v-html="music.videoTitle"></v-list-item-title>
                <v-list-item-subtitle class="flex-center">
                    <v-icon small color="grey">access_time</v-icon>
                    <span class="grey--text ml-1">
                        {{minutesAndSeconds}}
                    </span>
                </v-list-item-subtitle>
            </v-list-item-content>

            <v-btn icon class="mx-2">
                <v-icon color="red">delete</v-icon>
            </v-btn>
            <v-btn icon>
                <v-icon color="blue">playlist_add</v-icon>
            </v-btn>
        </v-list-item>
    </v-hover>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    props: ['music', 'index'],
    computed: {
        ...mapGetters(['socket', 'musicState', 'currentMusicIndex']),
        minutesAndSeconds () {
            const minutes = Math.floor(this.music.duration / 60);
            let seconds = this.music.duration % 60;
            if (seconds < 10) seconds = '0' + seconds;
            return `${minutes}:${seconds}`;
        }
    },
    methods: {
        selectMusicToPlay (index) {
            if (index !== this.currentMusicIndex) {
                // on entre dans ce if uniquement si on souhaite jouer une musique différente de celle qui a été joué la derniere fois avec les thumbnails
                this.socket.emit('server_changeCurrentMusic', index);
            } else {
                // reprendre la lecture de la musique en cours
                this.socket.emit('server_setMusicState', 'play');
            }
        },
        pauseMusic () {
            this.socket.emit('server_setMusicState', 'pause');
        }
    }
}
</script>

<style>
    .flex-center {
        display: flex;
        align-items: center;
    }

    .play-arrow-icon {
        position: absolute;
        z-index: 1;
        transition: all 0.2s;
        opacity: 0;
        cursor: pointer;
    }

    .play-arrow-icon--hover {
        background-color: rgba(20, 20, 20, 0.5);
        color: white !important;
        opacity: 1;
    }

    .music-row--selected {
        transition: 0.3s all;
        background-color: #EEEEEE;
    }
</style>