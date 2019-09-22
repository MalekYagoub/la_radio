<template>
    <v-slider
        v-model="volumeCmp"
        style="height: 32px; width: 170px;"
        color="secondary"
        track-color="secondary"
        @change="changeVolume"
    >
        <template v-slot:prepend>
          <v-icon
            color="secondary"
            style="cursor: pointer;"
            @click.native="muteVolume"
          >
            {{iconToShow}}
          </v-icon>
        </template>
    </v-slider>
</template>

<script>
export default {
    props: ['volume'],
    data () {
        return {
            volumeCmp: this.volume * 100,
            lastVolume: 100
        }
    },
    computed: {
        iconToShow () {
            return this.volumeCmp > 50 ? 'volume_up' : this.volumeCmp > 0 ? 'volume_down' : 'volume_off';
        }
    },
    methods: {
        changeVolume (val) {
            this.$emit('changeVolume', val);
        },
        muteVolume () {
            if (this.volumeCmp > 0) {
                this.lastVolume = this.volumeCmp;
                this.volumeCmp = 0;
                this.$emit('changeVolume', 0);
            } else {
                this.$emit('changeVolume', this.lastVolume);
                this.volumeCmp = this.lastVolume;
            }
        }
    }
}
</script>

<style>
    
</style>