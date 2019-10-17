<template>
    <v-card height="445" class="mx-auto">
        <v-toolbar height="64" class="playlists-toolbar" color="secondary" style="z-index: 1;" dark>
            <v-toolbar-title class="d-flex align-center justify-start">
                <v-slide-x-transition mode="out-in">
                    <div class="pl-3" style="display: inherit;" v-if="selectedPlaylist !== null">
                        <v-btn small class="mr-3" @click="unselectPlaylist" text icon>
                            <v-icon>arrow_back</v-icon>
                        </v-btn>
                        <div class="selected-playlist-title" v-if="selectedPlaylist !== null">
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
                        <v-btn fab dark small color="accent">
                            <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn fab dark small color="accent">
                            <v-icon>mdi-delete</v-icon>
                        </v-btn>
                    </v-speed-dial>
                </v-fab-transition>
            </template>
        </v-toolbar>
        <v-card-text class="playlists-container">
            <v-container class="h-100" style="padding: 0;">
                <v-row class="h-100" v-if="playlists.length > 0">
                    <v-col v-for="playlist in playlists" :key="playlist.id" xs="6" sm="4" md="4" lg="4" xl="4">
                        <v-card
                            @click="selectedPlaylist = playlist"
                            style="cursor: pointer;" :color="!playlist.imagePath ? 'grey lighten-2' : undefined"
                            :class="{'d-flex justify-center align-center playlist-no-image': !playlist.imagePath}"
                            height="150"
                        >
                            <v-img
                                v-if="playlist.imagePath"
                                class="align-center"
                                height="150px"
                                :src="serverUrl + playlist.imagePath"
                            >
                                <div class="white--text subtitle-2 text-center">
                                    <div class="playlist-title">
                                        <span class="">{{playlist.title}}</span>
                                    </div>
                                </div>
                            </v-img>
                            <div v-else style="width: 100%;" class="white--text subtitle-2 text-center">
                                <div class="playlist-title">
                                    <span class="">{{playlist.title}}</span>
                                </div>
                            </div>
                        </v-card>
                    </v-col>
                </v-row>
            </v-container>
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
                        <v-file-input v-model="playlistImage" prepend-icon="add_photo_alternate" label="Image de la playlist"></v-file-input>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <div class="flex-grow-1"></div>
                    <v-btn color="secondary" text @click="cancelAddPlaylist">Annuler</v-btn>
                    <v-btn color="secondary" :disabled="!isValid || loading" :loading="loading" text @click="addPlaylist">Valider</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-card>
</template>

<script>
import axios from 'axios';
import { mapGetters } from 'vuex';

export default {
    data () {
        return {
            selectedPlaylist: null,
            isValid: false,
            loading: false,
            showAddPlaylistModal: false,
            playlistTitle: '',
            playlistImage: null,
            playlistRules: [
                v => !!v || 'Nom requis',
                v => v !== null && v.length >= 3 || 'Entrez au moins 3 caractères',
                v => v !== null && v.length <= 40 || 'Réduisez le nombre de caractères'
            ],
            showPlaylistsActions: false,
            serverUrl: process.env.VUE_APP_SERVER_URL
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
                        this.$store.commit('setSnackbar', {color: "error", message: err.response.data});
                    });
            } else {
                // Ajout playlist sans image
                this.socket.emit('server_addPlaylist', this.playlistTitle);
            }
        },
        cancelAddPlaylist () {
            this.showAddPlaylistModal = false;
        },
        unselectPlaylist () {
            this.selectedPlaylist = null;
            this.showPlaylistsActions = false;
        }
    },
    mounted () {
        this.socket.on('client_addedPlaylist', (playlist) => {
            this.$store.commit('appendPlaylist', playlist);
            this.loading = false;
            this.showAddPlaylistModal = false;
            this.playlistTitle = '';
            this.playlistImage = null;
            this.$store.commit('setSnackbar', {color: 'secondary', message: 'Une playlist à été créée'});
        });
        this.socket.on('client_addedPlaylistError', (message) => {
            this.loading = false;
            this.showAddPlaylistModal = false;
            this.playlistTitle = '';
            this.playlistImage = null;
            this.$store.commit('setSnackbar', {color: "error", message});
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
    }

    .playlists-toolbar {
        border-bottom-left-radius: 0 !important;
        border-bottom-right-radius: 0 !important;
    }

    .playlist-title {
        padding: 5px 10px;
        border-radius: 20px;
        display: inline-block;
        max-width: 90%;
        background-color: rgba(98, 98, 98, 0.6);
    }

    .selected-playlist-title {
        position: relative;
        left: -30px;
        transition: all 0.3s;
        transform: translateX(30px);
    }

    header .v-toolbar__extension {
        padding-left: 0 !important;
    }
</style>