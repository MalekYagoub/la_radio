<template>
    <div class="musics-list-container">
        <v-card class="mx-auto">
            <v-toolbar height="64" color="secondary" dark>
                <v-toolbar-title>
                    Bibliothèque
                    <span class="white--text overline font-weight-bold">
                        ({{musics.length}})
                    </span>
                </v-toolbar-title>
                <div class="flex-grow-1"></div>

                <v-text-field
                    class="mt-6"
                    prepend-icon="search"
                    label="Recherche"
                    dense
                    v-model="query"
                    style="width: 100px;"
                ></v-text-field>
            </v-toolbar>

            <v-list v-if="musics.length > 0" one-line class="musics-list">
                <template v-for="(music, index) in computedMusicsList">
                    <MusicRow :music="music" :index="findMusicIndex(music)" :key="index"/>
                </template>
            </v-list>
            <v-card-text v-else class="primary--text text-center font-weight-medium">
                <div class="d-flex flex-column">
                    <span>Aucune musique n'est présente dans la bibliothèque</span>
                    <v-icon class="mt-2" x-large color="secondary">music_off</v-icon>
                </div>
            </v-card-text>
            <v-card-text v-if="query.length > 0 && computedMusicsList.length === 0" class="primary--text text-center font-weight-medium">
                <div class="d-flex flex-column">
                    <span>Aucune musique ne correspond à votre recherche</span>
                    <v-icon class="mt-2" x-large color="secondary">youtube_searched_for</v-icon>
                </div>
            </v-card-text>
        </v-card>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import MusicRow from '@/components/MusicRow';

export default {
    components: {
        MusicRow
    },
    data () {
        return {
            query: '',
            showSearchInput: false
        }
    },
    computed: {
        ...mapGetters(['socket', 'musics', 'currentMusicIndex', 'initFirstMusic']),
        computedMusicsList: function () {
            if (this.musics.length > 0) {
                let vm = this;
                return this.musics.filter((music) => {
                    return music.videoTitle.toLowerCase().indexOf(vm.query.toLowerCase()) !== -1;
                });
            }
            return this.musics;
        }
    },
    methods: {
        findMusicIndex (musicToCheck) {
            return this.musics.findIndex((music) => musicToCheck.videoId === music.videoId);
        }
    },
    mounted () {
        if (this.musics.length > 0 && this.currentMusicIndex) this.socket.emit('server_getCurrentMusic');
        this.socket.on('client_getCurrentMusic', (music) => {
            // ON coupe le chargment du player dans l'overlay quand on recoit la musique
            if (!this.$store.getters.playerLoaded) this.$store.commit('setPlayerLoaded', true);
            this.$store.commit('setCurrentMusic', music.base64Music);
            if (this.currentMusicIndex !== music.index) this.$store.commit('setCurrentMusicIndex', music.index);
        });

        this.socket.on('client_loadingNewMusic', (data) => {
            this.$store.commit('setLoadingNewMusicIndex', data.index);
        })

        this.socket.on('client_deleteMusic', (deletedMusicInfo) => {
            if (this.musics.length === 1) {
                this.$store.commit('setInitFirstMusic', true);
            }

            if (this.currentMusicIndex === deletedMusicInfo.index) {
                if (this.musics.length === 1) {
                    this.$store.commit('deleteMusic', deletedMusicInfo);
                    this.$store.commit('setCurrentMusic', null);
                    this.$store.commit('setCurrentMusicIndex', null);
                    this.$store.commit('setSnackbar', {color: 'secondary', message: 'Une musique a été supprimée'});
                } else {
                    let indexToPass = this.currentMusicIndex === this.musics.length - 1 ? 0 : this.currentMusicIndex;

                    this.$store.commit('setMusicToDelete', deletedMusicInfo);
                    this.socket.emit('server_changeCurrentMusic', indexToPass, false, null, true);
                }
            } else {
                // Décrementer l'index de 1 pour garder la même musique en cours
                this.$store.commit('deleteMusic', deletedMusicInfo);
                if (this.currentMusicIndex > deletedMusicInfo.index) {
                    this.$store.commit('setCurrentMusicIndex', this.currentMusicIndex - 1);
                }
                this.$store.commit('setSnackbar', {color: 'secondary', message: 'Une musique a été supprimée'});
            }
        });

        this.socket.on('client_deleteMusicError', (message) => {
            this.$store.commit('setSnackbar', {color: "error", message});
        });
    },
    watch: {
        currentMusicIndex (newVal, oldVal) {
            if (!oldVal && this.musics.length > 0 && !this.initFirstMusic) {
                this.socket.emit('server_getCurrentMusic');
            } else {
                // Si on rentre là, on n'a pas de musique à charger donc on coupe le chargement de l'overlay
                this.$store.commit('setPlayerLoaded', true);
            }
        }
    }
}
</script>

<style scoped lang="scss">
    .musics-list-container {
        height: 445px;
    }

    .musics-list {
        max-height: 380px;
        overflow-y: auto;
    }    
</style>