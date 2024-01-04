<template>
    <!-- <span> -->
        <v-progress-linear
            v-if="cpLinear"
            :indeterminate="true"
            :color="color2use"   
        >
        </v-progress-linear>

        <v-progress-circular 
            v-else
            :indeterminate="true"
            :size="size || 25"
            :width="size && size < 20 ? 3 : 3"
            :color="color2use"
            >
        </v-progress-circular>
    
</template>
<script>
export default {
    name: 'cp-progress',
    data: () => ({
        color2use: '',
        cpLinear: false, //circular default
    }),
    props: [
        // these can be passed in, the 'data' stuff can't
        'color', // vuejs prop
        'disabled', // vuejs prop
        'hint', // vuejs prop
        'linear', // vuejs prop
        'size', // vuejsprop, circular only
    ],

    async created(){           

        if (!this.$vuetify || !this.$vuetify.theme || !this.$vuetify.breakpoint){
            this.$vuetify = this.Sublib.oVuetify;
        }

        if (!this.color){
            this.color2use = 'primary';
        } else {
            this.color2use = this.color;
        }

        if(this.linear || typeof this.linear == 'string') { // this.linear == '' || this.linear){
            this.cpLinear = true;
        } else {
            //default circular
            this.cpLinear = false;
        }

        // await this.$nextTick();
        // await this.$forceUpdate();

    }, // created
  
} // export default
</script>
<style scoped>
</style>