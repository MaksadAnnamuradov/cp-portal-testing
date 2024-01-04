<template>
    <cp-dialog 
        :max-width="Sublib.getStyle('cardheader', $vuetify).width -30" 
        persistent
        v-model="showMbox" 
        :dark="themeColor == 'dark'" 
        :light="themeColor == 'light'"
        ref="dialog"
        :mBoxBtnId="mBoxBtnId"
        >
        
        <!-- :max-width="Sublib.getStyle('cardheader', $vuetify).width -30"
            style="position: abosolute;"
            @mousedown="onMouseDown"
            @mousemove="dragMbox"
            @mouseup="onMouseUp" -->
        <v-card 
            ref="mboxCard"
            >
            <v-toolbar 
                :style="Sublib.getStyle('cardheader')" 
                dark 
                flat 
                :height="Sublib.getStyle('cardheader').height"
                
                @mousedown="onMouseDown"
                @mousemove="dragMbox"
                @mouseup="onMouseUp"
                >
            <v-card-title 
                class="subtitle-1"
                >
                Message For you sir
            </v-card-title>
            </v-toolbar>
            <!-- <v-card-text id="mbox_msg">{{msg}}</v-card-text> -->
            <v-card-text id="mbox_msg" v-html="msg"></v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <cp-btn :color="btnColor" dark v-if="btnCap1" @click="btnClicked('1')" :label="btnCap1" :autofocus="!btnDfltFocus || btnDfltFocus == 1"></cp-btn>
                <cp-btn :color="btnColor" dark v-if="btnCap2" @click="btnClicked('2')" :label="btnCap2" :autofocus="btnDfltFocus && btnDfltFocus == 2" ></cp-btn>
                <cp-btn :color="btnColor" dark v-if="btnCap3" @click="btnClicked('3')" :label="btnCap3" :autofocus="btnDfltFocus && btnDfltFocus == 3"></cp-btn>
            </v-card-actions>
        </v-card>
    </cp-dialog>
</template>


<script>
import cpDialog from '../Framework/cpDialog.vue';
export default {
    name: 'mbox',
    components: {
        cpDialog
    },
    data: () => ({
        showMbox: true,

        // These are used for dragging the mbox around
        // NOTE: this only works if the element has position:abosulte on it!
        origX: 0,
        origY: 0,
        newX: 0,
        newY: 0,

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
            this.origX = e.clientX;
            this.origY = e.clientY;
        }, // makePopupDraggable

        onMouseUp(e){
            // turn off the drag
debugger            
            this.origX = 0;
            this.origY = 0; 
        }, // onMouseUp

        dragMbox(e){
            if (!this.origX && !this.origY){
                return;
            }

            e = e || window.event;
            e.preventDefault();
            // calculate the new cursor position:
            this.newX = this.origX - e.clientX;
            this.newY = this.origY - e.clientY;
            // this.pos3 = e.clientX;
            // this.pos4 = e.clientY;

            

            // set the element's new position:
            //var elmnt = this.$refs.mboxCard.$el;

            //var elmnt = this.$refs.dialog.$el;
            var elmnt = this.$refs.dialog.$children[0].$children[1].$el


            if (elmnt.style.position != "relative")
                elmnt.style.position = "relative"; // so it doesn't jump around     

            elmnt.style.top = this.newX + "px";
            elmnt.style.left = this.newY + "px";

            return;



            if (elmnt.style.position != "absolute")
                elmnt.style.position = "absolute"; // so it doesn't jump around        


            let newTop = (elmnt.offsetTop - this.pos2);
            let newLeft = (elmnt.offsetLeft - this.pos1);

console.log('dragMbox: pos1:' + this.pos1 + ' pos2:' + this.pos2 + ' pos3:' + this.pos3 + ' pos4:' + this.pos4 
            + ' e.clientX:' + e.clientX + ' e.clientY:' + e.clientY + 
            ' elmnt.offsetTop:' + elmnt.offsetTop + ' elmnt.offsetLeft:' + elmnt.offsetLeft + 
            ' newTop:' + newTop + ' newLeft:' + newLeft);


            if (newTop < 0){
                // don't let it go off the top of the screen
                newTop = 0;

            } else if (newTop > window.innerHeight - elmnt.offsetHeight){
                // don't let it go off the bottom of the screen
                newTop = window.innerHeight - elmnt.offsetHeight;
            }

            if (newLeft < 0){
                // don't let it go off the left of the screen
                newLeft = 0;

            } else if (newLeft > window.innerWidth - elmnt.offsetWidth){
                // don't let it go off the right of the screen
                newLeft = window.innerWidth - elmnt.offsetWidth;
            }


            elmnt.style.top = newTop + "px";
            elmnt.style.left = newLeft + "px";
            // elmnt.style.top = (this.pos2) + "px";
            // elmnt.style.left = (this.pos1) + "px";
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