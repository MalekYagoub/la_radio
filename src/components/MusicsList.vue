<template>
    <v-card max-width="550" class="mx-auto">
        <v-toolbar color="accent" dark>
            <v-toolbar-title>Bibliothèque</v-toolbar-title>
            <div class="flex-grow-1"></div>

            <v-btn icon>
                <v-icon>mdi-magnify</v-icon>
            </v-btn>
        </v-toolbar>

        <v-list v-if="musics.length > 0" one-line class="musics-list">
            <template v-for="(music, index) in musics">
                <MusicRow :music="music" :index="index" :key="index"/>
            </template>
        </v-list>
        <v-card-text v-else class="primary--text text-center font-weight-medium">
            <div class="d-flex flex-column">
                <span>Aucune musique n'est présente dans la bibliothèque</span>
                <v-icon class="mt-2" x-large color="secondary">music_off</v-icon>
            </div>
        </v-card-text>
    </v-card>
</template>

<script>
import { mapGetters } from 'vuex';
import MusicRow from '@/components/MusicRow';

export default {
    components: {
        MusicRow
    },
    computed: {
        ...mapGetters(['socket', 'musics', 'currentMusicIndex', 'initFirstMusic'])
    },
    mounted () {
        if (this.musics.length > 0 && this.currentMusicIndex) this.socket.emit('server_getCurrentMusic');
        this.socket.on('client_getCurrentMusic', (music) => {
            this.$store.commit('setCurrentMusic', music.base64Music);
            this.$store.commit('setCurrentMusicIndex', music.index);
        });

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
                    let indexToPass = this.currentMusicIndex === this.musics.length - 1 ? 0 : this.currentMusicIndex + 1;
                    if (this.currentMusicIndex < this.musics.length - 1) {
                        indexToPass--;
                    }
                    this.$store.commit('setMusicToDelete', deletedMusicInfo);
                    this.socket.emit('server_changeCurrentMusic', indexToPass);
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
            }
        }
    }
}
</script>

<style scoped lang="scss">
    .musics-list {
        max-height: 380px;
        overflow-y: auto;
    }    
</style>