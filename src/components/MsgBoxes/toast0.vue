<template>
    <v-snackbar 
        v-model="showMbox"
        multi-line
        dark
        bottom
        shaped
        :color="Sublib.getColor('header')"
        :centered='true'
        :timeout="timeOut">

        <span id="toast_msg" v-html="msg"></span>
        <!-- {{msg}} -->
    </v-snackbar>
    <!-- <v-snackbar 
        v-model="showMbox"
        multi-line
        shaped
        dark
        bottom
        :color="Sublib.getColor('header')"
        :timeout="timeOut"
        v-html="msg">
    </v-snackbar> -->
</template>
<script>
export default {
    name: 'mbox',
    data: () => ({
        showMbox: true,   
    }),
    props: [
        // these can be passed in, the 'data' stuff can't
        'msg',
        'timeOut'
    ],
    created(){
        // don't put anything here
        if (!this.$vuetify || !this.$vuetify.theme || !this.$vuetify.breakpoint){
            this.$vuetify = this.Sublib.oVuetify;
        }

        this.showMbox = true;
        this.msg = this.Sublib.replaceAll(this.msg, '\\\\n', '<br />'); // works in conjection with v-html above
    }, 
    methods: {
        btnClicked: function(mBtnClicked){
            // mBtnClicked = Char. Has to be a character in order for it to pass it in. Not sure why, numerics didn't work
            mBtnClicked = Number(mBtnClicked);
            this.retval = mBtnClicked; // watcher in Sublib will detect this value has changed
            this.showMbox = false;
        } // btnClicked
    } // methods
} // export default
</script>
<style scoped>
#toast_msg { white-space: pre-line; }
</style>