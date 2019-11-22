<template>
    <v-card height="445" class="mx-auto">
        <v-toolbar height="64" class="playlists-toolbar" color="secondary" style="z-index: 3;" dark>
            <v-toolbar-title style="width: 100%;" class="d-flex align-center justify-space-between">
                <v-slide-x-transition mode="out-in">
                    <div class="pl-3" style="display: inherit;" v-if="selectedPlaylist !== null">
                        <v-btn small class="mr-2" @click="unselectPlaylist" text icon>
                            <v-icon>arrow_back</v-icon>
                        </v-btn>
                        <div v-if="selectedPlaylist !== null">
                            {{playlistTitleSliced}}
                            <span class="white--text overline font-weight-bold">
                                ({{selectedPlaylist.musics.length}})
                            </span>
                        </div>
                    </div>
                    <span class="pl-4 playlists-label" v-else>
                        Playlists
                        <span class="white--text overline font-weight-bold">
                            ({{playlists.length}})
                        </span>
                    </span>
                </v-slide-x-transition>
                <v-fade-transition>
                    <span class="selected-playlist-title" v-if="currentPlaylist">
                        {{currentPlaylistTitleSliced}} - en cours
                    </span>
                </v-fade-transition>
            </v-toolbar-title>
            <template>
                <v-fab-transition>
                    <v-btn :key="0" v-if="!selectedPlaylist" @click="showAddPlaylistModal = true" color="accent" dark absolute bottom right fab style="margin-bottom: 4px;">
                        <v-icon>mdi-plus</v-icon>
                    </v-btn>
                    <v-speed-dial
                        :key="1"
                        v-else
                        v-model="showPlaylistsActions"
                        direction="bottom"
                        transition="slide-y-reverse-transition"
                        right
                        absolute
                        top
                        style="margin-top: 16px;"
                    >
                        <template v-slot:activator>
                            <v-btn v-model="showPlaylistsActions" color="accent" dark fab>
                                <v-icon v-if="showPlaylistsActions">mdi-close</v-icon>
                                <v-icon v-else>mdi-dots-vertical</v-icon>
                            </v-btn>
                        </template>
                        <v-btn @click="showEditPlaylistModal" fab dark small color="accent">
                            <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn @click="showDeleteModal = true" fab dark small color="accent">
                            <v-icon>mdi-delete</v-icon>
                        </v-btn>
                    </v-speed-dial>
                </v-fab-transition>
            </template>
        </v-toolbar>
        <v-card-text class="playlists-container" v-if="playlists.length > 0">
            <v-fade-transition mode="out-in">
                <v-scale-transition v-if="!selectedPlaylist" group tag="div" style="width: 100%;" class="d-flex flex-wrap">
                    <div class="playlist-card-container"  v-for="playlist in playlists" :key="playlist.id">
                        <PlaylistCard class="playlist-card" :playlist="playlist" @on-playlist-click="changeSelectedPlaylist" />
                    </div>
                </v-scale-transition>
                <v-list v-else-if="selectedPlaylist && selectedPlaylist.musics.length > 0" one-line class="musics-list">
                    <template v-for="(music, index) in selectedPlaylist.musics">
                        <MusicRow
                            :music="music"
                            :index="findMusicIndex(music)"
                            :listIndex="index"
                            :key="music.videoId"
                            :playlist="selectedPlaylist"
                        />
                    </template>
                </v-list>
                <div v-else class="mt-6 primary--text text-center font-weight-medium">
                    <div  class="d-flex flex-column">
                        <span>Aucune musique n'est présente dans cette playlist</span>
                        <v-icon class="mt-2" x-large color="secondary">music_off</v-icon>
                    </div>
                </div>
            </v-fade-transition>
        </v-card-text>
        <v-card-text v-else class="primary--text text-center font-weight-medium">
            <div class="d-flex flex-column">
                <span>Aucune playlist n'est présente</span>
                <v-icon class="mt-2" x-large color="secondary">music_off</v-icon>
            </div>
        </v-card-text>

        <v-dialog v-model="showAddPlaylistModal" max-width="400">
            <v-card>
                <v-card-title class="subtitle-1">Ajout d'une playlist</v-card-title>
                <v-card-text>
                    <v-form v-model="isValid">
                        <v-text-field
                            v-model="playlistTitle"
                            label="Entrez le nom de la playlist"
                            required
                            clearable
                            prepend-icon="music_note"
                            :rules="playlistRules"
                            counter="40"
                        ></v-text-field>
                        <v-file-input accept="image/*" v-model="playlistImage" prepend-icon="add_photo_alternate" label="Image de la playlist"></v-file-input>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <div class="flex-grow-1"></div>
                    <v-btn color="secondary" text @click="showAddPlaylistModal = false">Annuler</v-btn>
                    <v-btn color="secondary" :disabled="!isValid || loading" :loading="loading" text @click="addPlaylist">Valider</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-if="selectedPlaylist" v-model="showDeleteModal" max-width="290">
            <v-card>
                <v-card-title class="subtitle-1">Voulez vous vraiment supprimer la playlist "{{selectedPlaylist.title}}" ?</v-card-title>
                <v-card-actions>
                    <div class="flex-grow-1"></div>
                    <v-btn color="secondary" text @click="showDeleteModal = false">Annuler</v-btn>
                    <v-btn color="secondary" text @click="deletePlaylist">Valider</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-if="selectedPlaylist" v-model="showEditModal" max-width="400">
            <v-card>
                <v-card-title class="subtitle-1">Modification de "{{selectedPlaylist.title}}"</v-card-title>
                <v-card-text>
                    <v-form v-model="isValid">
                        <v-text-field
                            v-model="playlistTitle"
                            label="Entrez le nom de la playlist"
                            required
                            clearable
                            prepend-icon="music_note"
                            :rules="playlistRules"
                            counter="40"
                        ></v-text-field>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <div class="flex-grow-1"></div>
                    <v-btn color="secondary" text @click="cancelEditPlaylist">Annuler</v-btn>
                    <v-btn color="secondary" :disabled="!isValid || loading" :loading="loading" text @click="editPlaylist">Valider</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-card>
</template>

<script>
import axios from 'axios';
import { mapGetters } from 'vuex';
import PlaylistCard from '@/components/PlaylistCard';
import MusicRow from '@/components/MusicRow';

export default {
    components: {
        PlaylistCard,
        MusicRow
    },
    data () {
        return {
            selectedPlaylist: null,
            isValid: false,
            loading: false,
            showAddPlaylistModal: false,
            playlistTitle: '',
            playlistImage: null,
            playlistTitleToEdit: '',
            playlistRules: [
                v => !!v || 'Nom requis',
                v => v !== null && v.length >= 3 || 'Entrez au moins 3 caractères',
                v => v !== null && v.length <= 40 || 'Réduisez le nombre de caractères'
            ],
            showPlaylistsActions: false,
            showDeleteModal: false,
            showEditModal: false,
        }
    },
    computed: {
        ...mapGetters(['socket', 'shouldAutoSkip', 'randomState', 'playlists', 'musics', 'currentPlaylistId', 'currentPlaylist', 'currentMusicIndex', 'currentPlaylistMusicIndex']),
        currentPlaylistTitleSliced () {
            if (this.currentPlaylist) {
                return this.currentPlaylist.title.length > 12 ? this.currentPlaylist.title.slice(0, 12) + '...' : this.currentPlaylist.title;
            }
            return null;
        },
        playlistTitleSliced () {
            return this.selectedPlaylist.title.length > 12 ? this.selectedPlaylist.title.slice(0, 12) + '...' : this.selectedPlaylist.title;
        }
    },
    methods: {
        addPlaylist () {
            this.loading = true;
            if (this.playlistImage) {
                // Ajout playlist avec image
                let playlistFormData = new FormData();
                playlistFormData.append('image', this.playlistImage);
                playlistFormData.append('title', this.playlistTitle);
                axios.post(`${process.env.VUE_APP_SERVER_URL}/add-playlist-with-image`, playlistFormData)
                    .catch((err) => {
                        this.loading = false;
                        this.$store.commit('setSnackbar', {color: "error", message: err.response.data});
                    });
            } else {
                // Ajout playlist sans image
                this.socket.emit('server_addPlaylist', this.playlistTitle);
            }
        },
        editPlaylist () {
            this.loading = true;
            this.socket.emit('server_editPlaylist', {
                newPlaylistTitle: this.playlistTitle,
                playlist: this.selectedPlaylist
            });
        },
        deletePlaylist () {
            this.socket.emit('server_deletePlaylist', this.selectedPlaylist);
            this.showDeleteModal = false;
            this.selectedPlaylist = null;
        },
        changeSelectedPlaylist (playlist) {
            const playlistParsed = JSON.parse(JSON.stringify(playlist));
            const playlistMusicsArr = [];
            for (const musicIndex in playlistParsed.musics) {
                playlistMusicsArr.push(playlistParsed.musics[musicIndex]);
            }
            this.selectedPlaylist = playlistParsed;
            this.selectedPlaylist.musics = playlistMusicsArr;
        },
        unselectPlaylist () {
            this.selectedPlaylist = null;
            this.showPlaylistsActions = false;
        },
        showEditPlaylistModal () {
            this.playlistTitle = this.selectedPlaylist.title;
            this.showEditModal = true;
        },
        cancelEditPlaylist () {
            this.showEditModal = false;
            this.playlistTitle = '';
        },
        findMusicIndex (musicToCheck) {
            return this.musics.findIndex((music) => musicToCheck.videoId === music.videoId);
        },
    },
    mounted () {
        this.socket.on('client_addedPlaylist', (playlist) => {
            setTimeout(() => {
                // setTimeout pour avoir l'animation scale
                this.$store.commit('appendPlaylist', playlist);
            }, 100);
            this.loading = false;
            this.showAddPlaylistModal = false;
            this.playlistTitle = '';
            this.playlistImage = null;
            this.$store.commit('setSnackbar', {color: 'secondary', message: 'Une playlist à été créée'});
        });

        this.socket.on('client_addedPlaylistError', (message) => {
            this.loading = false;
            this.$store.commit('setSnackbar', {color: "error", message});
        });

        this.socket.on('client_deletePlaylist', (deletedPlaylistInfo) => {
            if (this.selectedPlaylist && this.selectedPlaylist.id === this.playlists[deletedPlaylistInfo.index].id) {
                // on doit déselectionner la playlist car elle a été supprimée
                this.selectedPlaylist = null;
            }

            if (deletedPlaylistInfo.currentPlaylistDeleted) {
                this.$store.commit('setCurrentPlaylistId', null);
            }

            this.$store.commit('setSnackbar', {color: 'secondary', message: 'Une playlist a été supprimée'});
            this.$store.commit('deletePlaylistFromMusics', deletedPlaylistInfo);
            this.$store.commit('deletePlaylist', {index: deletedPlaylistInfo.index});
        });

        this.socket.on('client_deletePlaylistError', (message) => {
            this.$store.commit('setSnackbar', {color: "error", message});
        });

        this.socket.on('client_editedPlaylist', (data) => {
            this.loading = false;
            this.showEditModal = false;
            this.playlistTitle = '';
            this.selectedPlaylist.title = data.title;
            this.$store.commit('editPlaylist', {
                title: data.title,
                index: data.index
            })
            this.$store.commit('setSnackbar', {color: 'secondary', message: 'Une playlist à été modifiée'});
        });

        this.socket.on('client_addedMusicToPlaylists', (data) => {
            data.playlists.forEach((playlist) => {
                if (this.selectedPlaylist && this.selectedPlaylist.id === playlist.id) {
                    this.selectedPlaylist.musics.push(data.music);
                }
            });
        });

        this.socket.on('client_deletedMusicFromPlaylist', (data) => {
            if (this.selectedPlaylist) {
                for (let i = 0; i < this.selectedPlaylist.musics.length; i++) {
                    if (this.selectedPlaylist.musics[i].videoId === data.musicId) {
                        this.selectedPlaylist.musics.splice(i, 1);
                        break;
                    }
                }
            }

            if (this.currentPlaylistId === data.playlistId && this.currentMusicIndex === data.musicIndex) {
                // Si on a supprimé une musique de la playlist qu'on écoute, faut passer à la suivante
                let idToPass;
                if (data.shouldGetFirstMusic) {
                    idToPass = Object.keys(this.currentPlaylist.musics)[0];
                } else {
                    idToPass = Object.keys(this.currentPlaylist.musics)[(this.currentPlaylistMusicIndex + 1) % (Object.keys(this.currentPlaylist.musics).length)];
                }
                this.socket.emit('server_changeCurrentMusic', idToPass, false, null, true);
            }

            this.$store.commit('deleteMusicFromPlaylist', data);
        });

        this.socket.on('client_deleteMusic', (deletedMusicInfo) => {
            // écoute de l'event deleteMusic pour supprimer la musique qui vient d'être supprimé de la selectedPlaylist s'il y en a une
            // Et passer à la prochaine musique de la currentPlaylist s'il y a une currentPlaylist

            if (this.currentPlaylistId) {
                // Index de la musique dans la playlist qu'on écoute pour passer à la suivante
                const currentPlaylistMusicToDeleteIndex = Object.keys(this.currentPlaylist.musics).indexOf(deletedMusicInfo.musicId);

                if (Object.keys(this.currentPlaylist.musics).length === 1 && this.shouldAutoSkip) {
                    // On supprime la dernière musique de la playlist depuis la biblio donc il faut deselect la playlist et jouer la première musique de la biblio
                    // this.socket.emit('server_changeCurrentPlaylistMusicIndex', 0);
                    if (this.musics.length > 0) this.socket.emit('server_changeCurrentMusic', this.musics[0].videoId);
                    this.socket.emit('server_changeCurrentPlaylistId', 0);
                } else if (this.shouldAutoSkip && currentPlaylistMusicToDeleteIndex === this.currentPlaylistMusicIndex) {
                    // Si on vient de supprimer une musique de la bibliothèque qu'on jouait dans la playlist qu'on écoute, il faut passer à la suivante
                    // après l'avoir supprimé des réferences de la playlist
                    const idToPass = Object.keys(this.currentPlaylist.musics)[(this.currentPlaylistMusicIndex + 1) % (Object.keys(this.currentPlaylist.musics).length)];
                    this.socket.emit('server_changeCurrentMusic', idToPass, false, null, true);
                }
            }

            if (this.selectedPlaylist) {
                // Index de la musique dans la playlist qu'on a séléctionné pour la supprimer de celle-ci en reactive
                const selectedPlaylistMusicIndex = this.selectedPlaylist.musics.findIndex((music) => deletedMusicInfo.musicId === music.videoId);
                if (selectedPlaylistMusicIndex !== -1) this.selectedPlaylist.musics.splice(selectedPlaylistMusicIndex, 1);
            }
        });

        this.socket.on('client_changedCurrentPlaylistId', (playlistId) => {
            this.$store.commit('setCurrentPlaylistId', playlistId);
        });

        this.socket.on('client_changedCurrentPlaylistMusicIndex', (currentPlaylistMusicIndex) => {
            this.$store.commit('setCurrentPlaylistMusicIndex', currentPlaylistMusicIndex);
        });
    }
}
</script>

<style scoped>
    .h-100 {
        height: 100%;
    }

    .playlists-container {
        height: calc(100% - 64px);
        overflow: auto;
        padding: 0;
    }

    .playlists-toolbar {
        border-bottom-left-radius: 0 !important;
        border-bottom-right-radius: 0 !important;
    }

    .playlist-card-container {
        width: 33%;
        display: flex;
        justify-content: center;
        margin-top: 22px;
        margin-bottom: 15px;
    }

    .playlist-card {
        width: 170px;
        height: 150px;
    }

    .musics-list {
        max-height: 380px;
        overflow-y: none;
    }

    .selected-playlist-title {
        margin-right: 70px;
    }
</style>