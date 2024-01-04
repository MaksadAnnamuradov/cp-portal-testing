<template>
    <v-dialog 
        :max-width="Sublib.getStyle('cardheader', $vuetify).width -30" 
        persistent 
        v-if="showMbox" 
        :dark="themeColor == 'dark'" 
        :light="themeColor == 'light'"
        ref="dialog"
        >
        <template v-slot:activator="{on}">
            <v-btn :id="mBoxBtnId" v-on="on"></v-btn>
        </template>
        <!-- :max-width="Sublib.getStyle('cardheader', $vuetify).width -30"
            style="position: abosolute;"
            @mousedown="onMouseDown"
            @mousemove="dragMbox"
            @mouseup="onMouseUp" -->
        <v-card 
            ref="mboxCard"
            >
            <v-card-title v-if="title" class="subtitle-1">{{title}}</v-card-title>
            <!-- <v-card-text id="mbox_msg">{{msg}}</v-card-text> -->
            <v-card-text id="mbox_msg" v-html="msg"></v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <cp-btn :color="btnColor" dark v-if="btnCap1" @click="btnClicked('1')" :label="btnCap1" :autofocus="!btnDfltFocus || btnDfltFocus == 1"></cp-btn>
                <cp-btn :color="btnColor" dark v-if="btnCap2" @click="btnClicked('2')" :label="btnCap2" :autofocus="btnDfltFocus && btnDfltFocus == 2" ></cp-btn>
                <cp-btn :color="btnColor" dark v-if="btnCap3" @click="btnClicked('3')" :label="btnCap3" :autofocus="btnDfltFocus && btnDfltFocus == 3"></cp-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <!-- Left this code here for reference MA 01/02/2024 -->
    <cp-dialog v-else-if="false" v-model="showMbox" height="200px" :width="Sublib.getStyle('cardheader', $vuetify).width -30">
            <template #myContent>
                <v-card 
                    ref="mboxCard"
                    >
                    <v-card-title v-if="title" class="subtitle-1">{{title}}</v-card-title>
                    <!-- <v-card-text id="mbox_msg">{{msg}}</v-card-text> -->
                    <v-card-text id="mbox_msg" v-html="msg"></v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <cp-btn :color="btnColor" dark v-if="btnCap1" @click="btnClicked('1')" :label="btnCap1" :autofocus="!btnDfltFocus || btnDfltFocus == 1"></cp-btn>
                        <cp-btn :color="btnColor" dark v-if="btnCap2" @click="btnClicked('2')" :label="btnCap2" :autofocus="btnDfltFocus && btnDfltFocus == 2" ></cp-btn>
                        <cp-btn :color="btnColor" dark v-if="btnCap3" @click="btnClicked('3')" :label="btnCap3" :autofocus="btnDfltFocus && btnDfltFocus == 3"></cp-btn>
                    </v-card-actions>
                
                </v-card>
            </template>
        </cp-dialog>
</template>


<script>
export default {
    name: 'mbox',
    data: () => ({
        showMbox: true,

        // These are used for dragging the mbox around
        // NOTE: this only works if the element has position:abosulte on it!
        pos1: 0,
        pos2: 0,
        pos3: 0,
        pos4: 0, 
        origRouterBeforeEach: null, // so we can restore it when we're done
    }),
    props: [
        // these can be passed in, the 'data' stuff can't
        'msg',
        'title',
        'btnCap1',
        'btnCap2',
        'btnCap3',
        'btnDfltFocus', // which button to auto focus on

        'themeColor', // 'light' or 'dark', '' = use default
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

        //needed for cp-dialog MA 01/02/2024
        // await this.Sublib.sleep(500);
        // await this.$nextTick();
        // await this.$forceUpdate();

        // This works but want to figure out how best to implment it. SRR 11/07/2023
        // this.origRouterBeforeEach = [...this.Sublib.router.beforeHooks]; // break reference / copy
        // let _this = this;
        
        // this.Sublib.router.beforeEach((to, from, next) => {
        //     // make it so when they press the back button we click the cancel button
        //     if (_this.btnCap2){
        //         // multiple buttons. Don't exit
        //         next(false);
        //         return;
        //     }

        //     _this.btnClicked('1');
        //     next();
        // });
        
     
        this.showMbox = true;
        this.msg = this.Sublib.replaceAll(this.msg, '\\\\n', '<br />'); // works in conjection with v-html above
        // this.msg = this.Sublib.replaceAll(this.msg, '\\t', '    '); // &#9;
    }, 



    // *****************************************
    watch: {
        showMbox: function(){
            if (!this.showMbox && this.origRouterBeforeEach){
                // shutting down, reset
                this.Sublib.router.beforeHooks = this.origRouterBeforeEach; // restore the original
            }
        }, // showMbox
    }, // beforeUnmount

    

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
            // this.$refs.dialog.animateClick();
            // return;
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

    } // methods
} // export default
</script>
<style>
/* .mbox_msg { word-break: break-all; white-space: pre-line; } */
#mbox_msg { white-space: pre-line; padding-top:15px; padding-bottom:0; }

/* button:focus, button:hover {
    outline: 2px solid #2D4E60 !important;
} */

</style>