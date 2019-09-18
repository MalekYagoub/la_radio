<template>
    <v-btn fab large>
        <v-icon dark v-if="nextOrPrev === 'prev'">skip_previous</v-icon>
        <v-icon dark v-else>skip_next</v-icon>
    </v-btn>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    props: ['nextOrPrev'],
    data () {
        return {
            skipMusic () {}
        }
    },
    methods: {

    },
    computed: {
        ...mapGetters(['socket', 'currentMusicId'])
    }
}
</script>

<style lang="">
    
</style>