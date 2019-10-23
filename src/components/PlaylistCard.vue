<template>
    <v-card
        @click="$emit('on-playlist-click', playlist)"
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
</template>

<script>
export default {
    props: ['playlist'],
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
</style>