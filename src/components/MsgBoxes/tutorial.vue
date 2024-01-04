<template>
    <v-dialog :max-width="Sublib.getStyle('cardheader', $vuetify).width -30" persistent v-if="showMbox">
        <template v-slot:activator="{on}">
            <v-btn :id="mBoxBtnId" v-on="on"></v-btn>
        </template>
        <v-card>
            <v-card outlined>
                <!-- <v-card-title v-if="title" class="subtitle-1">{{title}}</v-card-title> -->
                <v-toolbar 
                    v-if="title"
                    :style="Sublib.getStyle('cardheader')" 
                    dark 
                    flat 
                    :height="Sublib.getStyle('cardheader').height"
                    > 
                    <v-toolbar-title>
                        <span>{{title}}</span>
                    </v-toolbar-title>
                </v-toolbar>

                <!-- <v-card-text id="mbox_msg">{{msg}}</v-card-text> -->
                <v-card-text id="mbox_msg" v-html="msg">
                    
                </v-card-text>
                <v-card-actions> 
                    <v-spacer></v-spacer>
                    <cp-btn :color="btnColor" dark v-if="btnCap1" @click="btnClicked('1')">{{btnCap1}}</cp-btn>
                    <cp-btn :color="btnColor" dark v-if="btnCap2" @click="btnClicked('2')">{{btnCap2}}</cp-btn>
                    <cp-btn :color="btnColor" dark v-if="btnCap3" @click="btnClicked('3')">{{btnCap3}}</cp-btn>
                </v-card-actions>
            </v-card>
            <v-card-actions v-if="!noDoNotShow">
                <cp-check
                    id="tutorial-chk-dont-show-again"
                    v-model="dontShowAgain"
                    :label="Sublib.getLbl('dont show again')"
                    >
                </cp-check>
                <v-spacer></v-spacer>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script>
export default {
    name: 'tutorial',
    data: () => ({
        showMbox: true, 
        dontShowAgain: false,
    }),
    props: [
        // these can be passed in, the 'data' stuff can't
        'udsVal',
        'msg',
        'title',
        'noDoNotShow',
        'isLocalStorage',
        'btnCap1',
        'btnCap2',
        'btnCap3',
        'retval', // Sublib watches this so we know when they clicked something
        'mBoxBtnId', // so we can keep track of multiple mboxs at once
    ],

    created(){
        if (!this.$vuetify || !this.$vuetify.theme || !this.$vuetify.breakpoint){
            this.$vuetify = this.Sublib.oVuetify;
        }
        
        this.showMbox = true;
        this.msg = this.Sublib.replaceAll(this.msg, '\\\\n', '<br />'); // works in conjection with v-html above

        if(!this.title){
            this.title = this.Sublib.getLbl('tip');
        }

        if(!this.btnCap1){
            this.btnCap1 = this.Sublib.getLbl('close');
        }
    }, 
    computed: {
        btnColor: function(){
            return this.Sublib.getColor('header');
        }
    }, 

    methods: {
        btnClicked: async function(mBtnClicked){
            if (this.dontShowAgain && this.udsVal){

                if(this.isLocalStorage){
                    // localstorage value and the key is udsVal
                    localStorage.setItem(this.udsVal, true);
                }else{
                    // clicked don't show this again, saving uds val
                    this.Sublib.putUDS(this.udsVal, localStorage.getItem('userId'), true, true, 3);
                }
            }

            // mBtnClicked = Char. Has to be a character in order for it to pass it in. Not sure why, numerics didn't work
            mBtnClicked = Number(mBtnClicked);
            this.retval = mBtnClicked; // watcher in Sublib will detect this value has changed
            this.showMbox = false;

        } // btnClicked
    } // methods
} // export default
</script>
<style scoped>
/* .mbox_msg { word-break: break-all; white-space: pre-line; } */
#mbox_msg { white-space: pre-line; padding-top:15px; padding-bottom:0;font-size: 16px; }
>>>#tutorial-chk-dont-show-again { margin-top: 0; }
>>>#tutorial-chk-dont-show-again .v-input__slot { margin-bottom: 0; }
>>>#tutorial-chk-dont-show-again .v-messages { margin-top:-10px; }


>>> .v-messages{
    display: none;
}
>>> .v-input__slot{
    margin: 0px;
    padding: 0px;
}



</style>