<template>
    <v-hover v-slot:default="{ hover }">
        <v-list-item>
            <v-list-item-avatar>
                <v-img :src="music.thumbnail"></v-img>
                <v-icon @click="selectMusicToPlay(index)" :class="{ 'play-arrow-icon--hover': hover, 'play-arrow-icon': true }">play_arrow</v-icon>
            </v-list-item-avatar>

            <v-list-item-content>
                <v-list-item-title v-html="music.videoTitle + ' - ' + music.artist"></v-list-item-title>
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
        ...mapGetters(['socket']),
        minutesAndSeconds () {
            const minutes = Math.floor(this.music.duration / 60);
            const seconds = this.music.duration % 60;
            return `${minutes}:${seconds}`;
        }
    },
    methods: {
        selectMusicToPlay (index) {
            this.socket.emit('server_changeCurrentMusic', index);
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
</style>