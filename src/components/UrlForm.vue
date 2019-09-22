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
                        :disabled="!isValid || loading"
                        :loading="loading">
                        Ajouter
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
        ...mapGetters(['socket'])
    },
    data () {
        return {
            isValid: false,
            url: '',
            urlRules: [
                v => !!v || 'Url requise',
                v => youtubeRegex().test(v) && v.split(' ').length === 1 || 'Entrez une url youtube valide'
            ],
            loading: false
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
            this.loading = false;
            this.$store.commit('appendMusic', music);
            this.$store.commit('setSnackbar', {color: '#3949AB', message: 'Une musique a été ajoutée'});
        });

    }
}
</script>

<style lang="scss">

</style>