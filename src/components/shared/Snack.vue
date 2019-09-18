<template>
  <v-snackbar
    absolute
    top
    v-model="snackbarCmp"
    :timeout="3000"
    :color="snackColor"
  >
    <span v-if="snackbar">{{snackbar.message}}</span>
    <v-btn color="white" text @click.native="snackbarCmp = false">Fermer</v-btn>
  </v-snackbar>
</template>

<script>
  import { mapGetters } from 'vuex';
  export default {
    data () {
      return {
        snackbarCmp: false
      }
    },
    computed: {
      ...mapGetters(['snackbar']),
      snackColor () {
        if (this.snackbar) {
          return this.snackbar.color;
        } else {
          return 'grey darken-2';
        }
      }
    },
    watch: {
      snackbar () {
        if (this.snackbar != null) {
          this.snackbarCmp = true;
        }
      },
      snackbarCmp () {
        if (this.snackbarCmp === false) {
          this.$store.commit('setSnackbar', null);
        }
      }
    }
  }
</script>