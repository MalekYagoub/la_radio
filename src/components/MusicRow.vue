<template>
    <v-hover v-slot:default="{ hover }">
        <v-list-item :class="{ 'music-row--selected': index === currentMusicIndex }">
            <div style="width: 46px; margin-right: 24px;">
                <v-progress-circular
                    v-show="loadingNewMusicIndex !== null && loadingNewMusicIndex === index"
                    indeterminate
                    color="secondary"
                    :size="46"
                    >
                    <v-list-item-avatar style="margin: auto;">
                        <v-img :src="music.thumbnail"></v-img>
                        <v-icon v-if="musicState === 'pause' || index !== currentMusicIndex" @click="selectMusicToPlay(index)" :class="{ 'play-arrow-icon--hover': hover, 'play-arrow-icon': true }">play_arrow</v-icon>
                        <v-icon v-else @click="pauseMusic" :class="{ 'play-arrow-icon--hover': hover, 'play-arrow-icon': true }">pause</v-icon>
                    </v-list-item-avatar>
                </v-progress-circular>
                <v-list-item-avatar style="margin-left: 3px" v-show="loadingNewMusicIndex === null || loadingNewMusicIndex !== index">
                    <v-img :src="music.thumbnail"></v-img>
                    <v-icon v-if="musicState === 'pause' || index !== currentMusicIndex" @click="selectMusicToPlay(index)" :class="{ 'play-arrow-icon--hover': hover, 'play-arrow-icon': true }">play_arrow</v-icon>
                    <v-icon v-else @click="pauseMusic" :class="{ 'play-arrow-icon--hover': hover, 'play-arrow-icon': true }">pause</v-icon>
                </v-list-item-avatar>
            </div>

            <v-list-item-content>
                <v-list-item-title :class="{ 'secondary--text font-weight-medium': index === currentMusicIndex }" v-html="music.videoTitle"></v-list-item-title>
                <v-list-item-subtitle class="flex-center">
                    <v-icon small color="grey">access_time</v-icon>
                    <span class="grey--text ml-1">
                        {{minutesAndSeconds}}
                    </span>
                </v-list-item-subtitle>
            </v-list-item-content>

            <v-menu bottom right transition="scale-transition">
                <template v-slot:activator="{ on }">
                <v-btn
                    color="primary"
                    icon
                    v-on="on"
                >
                    <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
                </template>

                <v-list flat dense>
                    <v-list-item>
                        <v-list-item-icon><v-icon color="secondary">playlist_add</v-icon></v-list-item-icon>
                        <v-list-item-title>Ajouter à la playlist</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="showDeleteModal = true">
                        <v-list-item-icon><v-icon color="#b30000">delete</v-icon></v-list-item-icon>
                        <v-list-item-title>Supprimer la musique</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>

            <v-dialog v-model="showDeleteModal" max-width="290">
                <v-card>
                    <v-card-title class="subtitle-1">Voulez vous vraiment supprimer cette musique ?</v-card-title>
                    <v-card-actions>
                        <div class="flex-grow-1"></div>
                        <v-btn color="secondary" text @click="showDeleteModal = false">Annuler</v-btn>
                        <v-btn color="secondary" text @click="deleteMusic">Valider</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-list-item>
    </v-hover>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    props: ['music', 'index'],
    data () {
        return {
            showDeleteModal: false
        }
    },
    computed: {
        ...mapGetters(['socket', 'musicState', 'currentMusicIndex', 'musics', 'loadingNewMusicIndex']),
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
                this.socket.emit('server_changeCurrentMusic', index, true);
            } else {
                // reprendre la lecture de la musique en cours
                this.socket.emit('server_setMusicState', 'play');
            }
        },
        pauseMusic () {
            this.socket.emit('server_setMusicState', 'pause');
        },
        deleteMusic () {
            this.socket.emit('server_deleteMusic', this.index);
            this.showDeleteModal = false;
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