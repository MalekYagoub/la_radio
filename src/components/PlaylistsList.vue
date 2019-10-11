<template>
    <v-card height="445" class="mx-auto" style="z-index: 0;">
        <v-toolbar height="64" class="playlists-toolbar" color="secondary" dark>
            <v-toolbar-title>
                Playlists
            </v-toolbar-title>
            <template>
              <v-btn @click="showAddPlaylistModal = true" color="accent" dark absolute bottom right fab>
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </template>
        </v-toolbar>
        <v-card-text class="playlists-container">
            <v-container class="h-100" style="padding: 0;">
                <v-row class="h-100">
                    <v-col style="z-index: -1;" class="card-col" cols="6" v-for="index in testArray" :key="index">
                        <v-card height="150">
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
                        ></v-text-field>
                        <v-file-input v-model="playlistImage" prepend-icon="add_photo_alternate" label="Image de la playlist"></v-file-input>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <div class="flex-grow-1"></div>
                    <v-btn color="secondary" text @click="cancelAddPlaylist">Annuler</v-btn>
                    <v-btn color="secondary" :disabled="!isValid" text @click="addPlaylist">Valider</v-btn>
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
            isValid: false,
            testArray: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            showAddPlaylistModal: false,
            playlistTitle: '',
            playlistImage: null,
            playlistRules: [
                v => !!v || 'Nom requis',
                v => v !== null && v.length >= 3 || 'Entrez au moins 3 caractères'
            ],
        }
    },
    computed: {
        ...mapGetters(['socket'])
    },
    methods: {
        addPlaylist () {
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
            this.showAddPlaylistModal = false;
            this.playlistTitle = '';
            this.playlistImage = null;
        },
        cancelAddPlaylist () {
            this.showAddPlaylistModal = false;
        }
    },
    mounted () {
        this.socket.on('client_addedPlaylist', (playlist) => {
            this.$store.commit('setSnackbar', {color: 'secondary', message: 'Une playlist à été créée'});
            console.log(playlist);
        });
        this.socket.on('client_addedPlaylistError', (message) => {
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
</style>