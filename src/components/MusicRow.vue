<template>
    <v-hover v-slot:default="{ hover }">
        <v-list-item :class="{ 'music-row': true, 'ml-5': index === currentMusicIndex, 'music-row--selected': index === currentMusicIndex }">
            <v-list-item-avatar style="margin-left: 3px">
                <v-img :src="music.thumbnail"></v-img>
                <v-icon v-if="hover && musicState === 'pause' || index !== currentMusicIndex" @click="selectMusicToPlay(index)" :class="{ 'play-arrow-icon--hover': hover, 'play-arrow-icon': true }">play_arrow</v-icon>
                <v-icon v-else-if="hover" @click="pauseMusic" :class="{ 'play-arrow-icon--hover': hover, 'play-arrow-icon': true }">pause</v-icon>
            </v-list-item-avatar>

            <v-list-item-content>
                <v-list-item-title :class="{ 'accent--text font-weight-medium': index === currentMusicIndex }" v-html="music.videoTitle"></v-list-item-title>
                <v-list-item-subtitle class="flex-center">
                    <v-icon small color="grey">access_time</v-icon>
                    <span class="grey--text ml-1">
                        {{minutesAndSeconds}}
                    </span>
                </v-list-item-subtitle>
            </v-list-item-content>

            <v-tooltip v-if="playlist" right>
                <template v-slot:activator="{ on }">
                    <v-list-item-action v-on="on">
                        <v-btn icon @click="showDeleteMusicFromPlaylistModal = true">
                            <v-icon color="grey">delete</v-icon>
                        </v-btn>
                    </v-list-item-action>
                </template>
                <span>Supprimer la musique de la playlist</span>
            </v-tooltip>

            <v-menu v-if="!playlist" bottom right transition="scale-transition">
                <template v-slot:activator="{ on }">
                <v-btn
                    color="primary"
                    icon
                    v-on="on"
                >
                    <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
                </template>

                <v-list v-if="!playlist" flat dense>
                    <v-list-item @click="showAddToPlaylistsModal = true">
                        <v-list-item-icon><v-icon color="secondary">playlist_add</v-icon></v-list-item-icon>
                        <v-list-item-title>Ajouter à une playlist</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="showDeleteModal = true">
                        <v-list-item-icon><v-icon color="secondary">delete</v-icon></v-list-item-icon>
                        <v-list-item-title>Supprimer la musique</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>

            <v-dialog v-if="!playlist" v-model="showDeleteModal" max-width="290">
                <v-card>
                    <v-card-title class="subtitle-1">Voulez vous vraiment supprimer cette musique ?</v-card-title>
                    <v-card-actions>
                        <div class="flex-grow-1"></div>
                        <v-btn color="secondary" text @click="showDeleteModal = false">Annuler</v-btn>
                        <v-btn color="secondary" text @click="deleteMusic">Valider</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>

            <v-dialog v-if="!playlist" v-model="showAddToPlaylistsModal" max-width="290">
                <v-card>
                    <v-card-title class="subtitle-1">Enregistrer dans</v-card-title>
                    <v-card-text style="max-height: 300px; overflow: auto;">
                        <v-checkbox
                            v-for="playlist in playlists"
                            hide-details
                            color="secondary"
                            dense
                            v-model="selectedPlaylists"
                            :disabled="music.playlists[playlist.id] !== undefined"
                            :indeterminate="music.playlists[playlist.id] !== undefined"
                            :key="playlist.id"
                            :label="playlist.title"
                            :value="playlist" />
                    </v-card-text>
                    <v-card-actions>
                        <div class="flex-grow-1"></div>
                        <v-btn color="secondary" text @click="showAddToPlaylistsModal = false">Annuler</v-btn>
                        <v-btn color="secondary" :disabled="selectedPlaylists.length === 0" text @click="addMusicToPlaylists">Valider</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>

            <v-dialog v-if="playlist" v-model="showDeleteMusicFromPlaylistModal" max-width="290">
                <v-card>
                    <v-card-title class="subtitle-1">Voulez vous vraiment supprimer cette musique de la playlist ?</v-card-title>
                    <v-card-actions>
                        <div class="flex-grow-1"></div>
                        <v-btn color="secondary" text @click="showDeleteMusicFromPlaylistModal = false">Annuler</v-btn>
                        <v-btn color="secondary" text @click="deleteMusicFromPlaylist">Valider</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-list-item>
    </v-hover>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    props: ['music', 'index', 'listIndex', 'playlist'],
    data () {
        return {
            showDeleteModal: false,
            showAddToPlaylistsModal: false,
            isRowAddingMusicToPlaylists: false,
            showDeleteMusicFromPlaylistModal: false,
            selectedPlaylists: []
        }
    },
    computed: {
        ...mapGetters(['socket', 'musicState', 'currentMusicIndex', 'musics', 'playlists', 'loadingNewMusicIndex', 'closeAddMusicToPlaylistsModal', 'currentPlaylistId']),
        minutesAndSeconds () {
            const minutes = Math.floor(this.music.duration / 60);
            let seconds = this.music.duration % 60;
            if (seconds < 10) seconds = '0' + seconds;
            return `${minutes}:${seconds}`;
        }
    },
    methods: {
        selectMusicToPlay (index) {
            if (this.playlist) {
                // On change la playlist en cours
                this.socket.emit('server_changeCurrentPlaylistId', this.playlist.id);
                this.socket.emit('server_changeCurrentPlaylistMusicIndex', this.listIndex);
            } else {
                this.socket.emit('server_changeCurrentPlaylistId', 0);
            }

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
        },
        addMusicToPlaylists () {
            this.isRowAddingMusicToPlaylists = true;
            this.socket.emit('server_addMusicToPlaylists', {
                music: this.music,
                playlists: this.selectedPlaylists,
                index: this.index
            });
            this.selectedPlaylists = [];
        },
        deleteMusicFromPlaylist () {
            this.socket.emit('server_deleteMusicFromPlaylist', {
                musicId: this.music.videoId,
                playlistId: this.playlist.id,
                playlistMusicIndex: this.listIndex
            });
            this.showDeleteMusicFromPlaylistModal = false;
        }
    },
    watch: {
        closeAddMusicToPlaylistsModal () {
            if (this.closeAddMusicToPlaylistsModal && this.isRowAddingMusicToPlaylists) {
                this.showAddToPlaylistsModal = false;
                this.isRowAddingMusicToPlaylists = false;
                this.$store.commit('setCloseAddMusicToPlaylistsModal', false);
            }
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

    .music-row {
        transition: 0.3s all;
    }

    .music-row--selected {
        background-color: #EEEEEE;
        border-radius: 30px 0 0 30px !important;
    }
</style>