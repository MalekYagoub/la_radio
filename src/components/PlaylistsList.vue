<template>
    <v-card height="445" class="mx-auto">
        <v-toolbar height="64" class="playlists-toolbar" color="secondary" style="z-index: 1;" dark>
            <v-toolbar-title class="d-flex align-center justify-start">
                <v-slide-x-transition mode="out-in">
                    <div class="pl-3" style="display: inherit;" v-if="selectedPlaylist !== null">
                        <v-btn small class="mr-2" @click="unselectPlaylist" text icon>
                            <v-icon>arrow_back</v-icon>
                        </v-btn>
                        <div v-if="selectedPlaylist !== null">
                            {{selectedPlaylist.title}}
                        </div>
                    </div>
                    <span class="pl-4 playlists-label" v-else>
                        Playlists
                        <span class="white--text overline font-weight-bold">
                            ({{playlists.length}})
                        </span>
                    </span>
                </v-slide-x-transition>
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
        <v-card-text class="playlists-container">
            <!-- <v-container class="h-100" style="padding: 0;">
                <v-row class="h-100" v-if="playlists.length > 0">
                    <v-col v-for="playlist in playlists" :key="playlist.id" xs="6" sm="4" md="4" lg="4" xl="4">
                            <PlaylistCard :playlist="playlist" @on-playlist-click="changeSelectedPlaylist" />
                    </v-col>
                </v-row>
            </v-container> -->
            <v-scale-transition group tag="div" style="width: 100%;" class="d-flex flex-wrap">
                <div class="playlist-card-container"  v-for="playlist in playlists" :key="playlist.id">
                    <PlaylistCard class="playlist-card" :playlist="playlist" @on-playlist-click="changeSelectedPlaylist" />
                </div>
            </v-scale-transition>
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

export default {
    components: {
        PlaylistCard
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
            showEditModal: false
        }
    },
    computed: {
        ...mapGetters(['socket', 'playlists'])
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
            this.selectedPlaylist = playlist;
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
        }
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
            this.$store.commit('editPlaylist', {
                title: data.title,
                index: data.index
            })
            this.$store.commit('setSnackbar', {color: 'secondary', message: 'Une playlist à été modifiée'});
        })
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
        /* padding-top: 22px; */
        padding: 22px 0 0 0;
    }

    .playlists-toolbar {
        border-bottom-left-radius: 0 !important;
        border-bottom-right-radius: 0 !important;
    }

    .playlist-card-container {
        width: 33%;
        display: flex;
        justify-content: center;
        margin-bottom: 15px;
    }

    .playlist-card {
        width: 170px;
        height: 150px;
    }
</style>