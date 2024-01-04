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
                <v-card-text id="mbox_msg" v-html="msg"></v-card-text>
                <v-card-actions>
                    <!-- <cp-check
                        style="padding: 0px; margin-left: 10px; font-size: 10px;"
                        :label="Sublib.getLbl('do not remind me again')"
                        v-model="dontShowAgain"
                    ></cp-check>
                    <v-spacer></v-spacer> -->
                    <v-spacer></v-spacer>
                    <cp-btn :color="btnColor" dark v-if="btnCap1" :label="btnCap1" @click="btnClicked('1')"></cp-btn>
                    <cp-btn :color="btnColor" dark v-if="btnCap2" :label="btnCap2" @click="btnClicked('2')"></cp-btn>
                     <cp-btn :color="btnColor" dark v-if="btnCap3" :label="btnCap3" @click="btnClicked('3')"></cp-btn>
                </v-card-actions>
            </v-card>
            <v-card-actions style="padding-top: 3px; padding-bottom: 5px;" v-if="!noDoNotShow">
                <cp-check
                    id="confirm-chk-dont-show-again"
                    v-model="dontShowAgain"
                    :label="Sublib.getLbl('do not remind me again')"
                    >
                </cp-check>
                <v-spacer></v-spacer>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script>
export default {
    //*******************************************
    //BIG DISCLAIMER! For now this screen is not pulling down the udsVal on its own, but the parent form is getting the value
    // we might need to improve this in the future, but for now, it's not a big deal since the parent form is getting the value MA 04/06/2023 
    //*******************************************
    name: 'confirm-save', 
    data: () => ({
        showMbox: true,

        // These are used for dragging the mbox around
        // NOTE: this only works if the element has position:abosulte on it!
        pos1: 0,
        pos2: 0,
        pos3: 0,
        pos4: 0, 

        dontShowAgain: false,
    }),
    props: [
        // these can be passed in, the 'data' stuff can't
        'msg',
        'title',
        'btnCap1',
        'btnCap2',
        'btnCap3',
        'udsVal', // if this is passed in, then we'll use it to set the check box
        'isLocalStorage', // if this is true, then we'll use local storage to store the value of the checkbox
        'noDoNotShow',
        'retval', // Sublib watches this so we know when they clicked something
        'mBoxBtnId', // so we can keep track of multiple mboxs at once
        //'oVuetify', // Vuetify 2.0 breaks when I manually add a component to the dom, specifcy vuetify obj and add the prop so it doesn't break
    ],
    // *****************************************
    created(){
        //this.$vuetify.breakpoint= {}; // don't have the values but at least it won't error out... 
        if (!this.$vuetify || !this.$vuetify.theme || !this.$vuetify.breakpoint){
            this.$vuetify = this.Sublib.oVuetify;
        }
     
        this.showMbox = true;
        if(this.msg){
            this.msg = this.Sublib.replaceAll(this.msg, '\\\\n', '<br />'); // works in conjection with v-html above
            // this.msg = this.Sublib.replaceAll(this.msg, '\\t', '    '); // &#9;
        }else{
            this.msg = this.Sublib.getLbl('save to proceed msg');
        }

        if(!this.title){
            this.title = this.Sublib.getLbl('confirm save');
        }

        if(!this.btnCap1){
            this.btnCap1 = this.Sublib.getLbl('save and proceed');
        }

        if(!this.btnCap2){
            this.btnCap2 = this.Sublib.getLbl('cancel');
        }

        if(!this.udsVal){
            this.udsVal = 'LTTRSAVE';
        }
    }, 

    // *****************************************
    computed: {
        btnColor: function(){
            return this.Sublib.getColor('header');
        }
    }, 

    // *****************************************
    methods: {
        // *****************************************
        btnClicked: function(mBtnClicked){

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
        }, // btnClicked

        // *****************************************
        // Make the popup draggable so it feels more like a desktop app
        // see https://www.w3schools.com/howto/howto_js_draggable.asp#:~:text=Create%20a%20Draggable%20DIV%20Element%201%20Step%201%29,background-color%3A%20%23f1f1f1%3B%20...%203%20Step%203%29%20Add%20JavaScript%3A
        onMouseDown(e){
            e = e || window.event;
            e.preventDefault();

            // get the mouse cursor position at startup:
            this.pos3 = e.clientX;
            this.pos4 = e.clientY;
        }, // makePopupDraggable

        onMouseUp(e){
            // turn off the drag
            this.pos3 = 0;
            this.pos4 = 0; 
        }, // onMouseUp

        dragMbox(e){
            if (!this.pos3 && !this.pos4){
                return;
            }

            e = e || window.event;
            e.preventDefault();
            // calculate the new cursor position:
            this.pos1 = this.pos3 - e.clientX;
            this.pos2 = this.pos4 - e.clientY;
            this.pos3 = e.clientX;
            this.pos4 = e.clientY;
            // set the element's new position:
            var elmnt = this.$refs.mboxCard.$el;
            elmnt.style.top = (elmnt.offsetTop - this.pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - this.pos1) + "px";
        }, // dragMbox

        // *****************************************
        async btnNoShowClicked(){
            if (this.noShow){
                // Sublib.putUDS = async function(mID_, mUserID_, mValue_, maddrecord, msizevar, mdecvar){
                this.Sublib.putUDS(this.udsVal, localStorage.getItem('userId'), false, true, 3);
            }
        }, // btnNoShowClicked

    } // methods
} // export default
</script>
<style scoped>
/* .mbox_msg { word-break: break-all; white-space: pre-line; } */
#mbox_msg { white-space: pre-line; padding-top:15px; padding-bottom:0; font-size: 16px; }

>>> .v-messages{
    display: none;
}
>>> .v-input__slot{
    margin: 0px;
    padding: 0px;
}

>>>#confirm-chk-dont-show-again { margin-top: 0; }
>>>#confirm-chk-dont-show-again .v-input__slot { margin-bottom: 0; }
>>>#confirm-chk-dont-show-again .v-messages { margin-top:-10px; }

</style>