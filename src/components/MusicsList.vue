<template>
    <v-card max-width="550" class="mx-auto">
        <v-toolbar color="#537072" dark>
            <v-toolbar-title>Bibliothèque</v-toolbar-title>
            <div class="flex-grow-1"></div>

            <v-btn icon>
                <v-icon>mdi-magnify</v-icon>
            </v-btn>
        </v-toolbar>

        <v-list one-line>
            <template v-for="(music, index) in musics">
                <MusicRow :music="music" :index="index" :key="index"/>
            </template>
        </v-list>
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
        ...mapGetters(['socket', 'musics'])
    },
    mounted () {
        this.socket.emit('server_getCurrentMusic');
        this.socket.on('client_getCurrentMusic', (music) => {
            this.$store.commit('setCurrentMusic', music.base64Music);
            this.$store.commit('setCurrentMusicIndex', music.index);
        });
    }
}
</script>

<style lang="">
    
</style>