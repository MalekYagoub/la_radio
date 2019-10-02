<template>
    <v-container>
        <v-form v-model="isValid">
            <v-row
                align="center"
                justify="center">
                <v-col md="4">
                    <v-text-field
                        v-model="url"
                        label="Entrez l'url de la musique youtube"
                        required
                        clearable
                        prepend-icon="music_note"
                        :rules="urlRules"
                    ></v-text-field>
                </v-col>
                <v-col cols="auto">
                    <v-btn
                        @click="addMusic"
                        :disabled="!isValid || loading || userIsAddingMusicBoolean"
                        :loading="loading"
                        color="secondary">
                        <span v-if="!userIsAddingMusic">Ajouter</span>
                        <span class="caption" v-else>Ajout en cours</span>
                    </v-btn>
                </v-col>
            </v-row>
        </v-form>
    </v-container>
</template>

<script>
import youtubeRegex from 'youtube-regex';
import { mapGetters } from 'vuex';

export default {
    computed: {
        ...mapGetters(['socket', 'snackbar', 'musics']),
        userIsAddingMusicBoolean () {
            return this.userIsAddingMusic === 0 || !this.userIsAddingMusic ? false : true;
        }
    },
    data () {
        return {
            isValid: false,
            url: '',
            urlRules: [
                v => !!v || 'Url requise',
                v => youtubeRegex().test(v) && v.split(' ').length === 1 || 'Entrez une url youtube valide'
            ],
            loading: false,
            userIsAddingMusic: 0, // Un autre utilisateur ajoute une musique
        }
    },
    methods: {
        addMusic () {
            this.socket.emit('server_addMusic', this.url);
            this.loading = true;
        }
    },
    mounted () {
        this.socket.on('client_addedMusicError', (message) => {
            this.loading = false;
            this.$store.commit('setSnackbar', {color: "error", message});
        });

        this.socket.on('client_addedMusic', (music) => {
            this.$store.commit('appendMusic', music);
            this.$store.commit('setSnackbar', {color: 'secondary', message: 'Une musique a été ajoutée'});
            this.loading = false;
        });

        this.socket.on('client_loadingAddMusic', (payload) => {
            this.userIsAddingMusic = payload;
        });
    }
}
</script>

<style lang="scss">

</style>