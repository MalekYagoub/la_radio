<template>
    <v-card
        @click="$emit('on-playlist-click', playlist)"
        style="cursor: pointer;" :color="!playlist.imagePath ? 'grey lighten-2' : undefined"
        :class="{'d-flex justify-center align-center playlist-no-image': !playlist.imagePath, 'selected-playlist': playlist.id === currentPlaylistId}"
        height="150"
        :elevation="playlist.id === currentPlaylistId ? 15 : 2"
    >
        <v-img
            v-if="playlist.imagePath"
            class="align-center"
            height="150px"
            :src="serverUrl + playlist.imagePath"
        >
            <div class="white--text subtitle-2 text-center">
                <div :class="{'playlist-title': true, 'playlist-title--selected': playlist.id === currentPlaylistId}">
                    <span>{{playlist.title}}</span>
                </div>
            </div>
        </v-img>
        <div v-else style="width: 100%;" class="white--text subtitle-2 text-center">
            <div :class="{'playlist-title': true, 'playlist-title--selected': playlist.id === currentPlaylistId}">
                <span class="">{{playlist.title}}</span>
            </div>
        </div>
    </v-card>
</template>


<script>
import { mapGetters } from 'vuex'

export default {
    props: ['playlist'],
    computed: {
        ...mapGetters(['currentPlaylistId'])
    },
    data () {
        return {
            serverUrl: process.env.VUE_APP_SERVER_URL
        }
    }
}
</script>

<style scoped>
    .playlist-title {
        padding: 5px 10px;
        border-radius: 20px;
        display: inline-block;
        max-width: 90%;
        background-color: rgba(98, 98, 98, 0.6);
    }

    .playlist-title--selected {
        background-color: #00ac98;
    }

    .selected-playlist {
        z-index: 2;
    }
</style>