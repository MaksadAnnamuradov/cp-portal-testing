<template>
    
    <!-- For whatever reason the 'shaped' and transition properties aren't working but the top, bottom, right, left, centered are... SRR 11/02/2022 -->
    <v-snackbar 
        :value="showMbox"
        multi-line
        shaped
        dark
        top
        right
        :color="Sublib.getColor('header')"
        :bottom="false"
        :centered="false"
        :timeout="timeOut"
        :transition="'expand-x-transition'"
        @dblclick="timeOut = 1; showMbox = false;"
        >
        <!-- Added the double click to force shut it down so if it's set to indefinite progress bar and it covers something we need, have a way to force close it. SRR 12/13/2023 -->
        
        <span 
            id="toast_msg" 
            v-html="msg" 
            :style="{ 'margin-bottom': (typeof indefiniteProgBar == 'number' ? (Math.max(Sublib.occurs(msg, '<br'), Sublib.occurs(msg, '\n')) * 5) + 'px' : '')}"></span>

        <v-progress-linear 
            v-if="typeof indefiniteProgBar == 'boolean' && indefiniteProgBar"
            :style="{ 'position':'absolute', 'bottom':'5px', 'max-width': progBarWidth + 'px'} "  
            :indeterminate="true"
            >
        </v-progress-linear>
        <v-progress-linear 
            v-else-if="typeof indefiniteProgBar == 'number'"
            :style="{ 'position':'absolute', 'bottom':'5px', 'max-width': progBarWidth + 'px'} "  
            :value="indefiniteProgBar"
            height="10"
            :buffer-value="indefiniteProgBar"
            stream
            >
            <template v-slot:default="{ value }">
                <span style="font-size:11px; color:white;">{{Math.ceil(value)}}%</span>
            </template>
        </v-progress-linear>

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
    name: 'toast',
    data: () => ({
        showMbox: true,   
    }),
    props: [
        // these can be passed in, the 'data' stuff can't
        'msg',
        'timeOut',
        'indefiniteProgBar' // can also be a number to show an actual %
    ],
    computed: {
        progBarWidth(){
            if (!this.showMbox){
                return -1
            } else {
                try {     
                    return document.getElementsByClassName('v-snack__content').style[0].width;
                } catch(oError){
                    return 310
                }
            }
        }, // progBarWidth
    }, // computed
    created(){
        // don't put anything here
        if (!this.$vuetify || !this.$vuetify.theme || !this.$vuetify.breakpoint){
            this.$vuetify = this.Sublib.oVuetify;
        }

        if (!this.msg){  
            // hide the toast
            this.showMbox = false;
            this.timeOut = 1; // milisecond
            return;
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