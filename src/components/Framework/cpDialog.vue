<template>
    <v-dialog
        v-bind="$attrs"
        v-on="$listeners"

        v-if="showPopUp"

        :persistent="dialPersistent"
        :content-class="contentClass"
        :color="color" 

        :dark="dark" 
        :light="light"

        style="position: abosolute;"
        :ref="refId"
        @mousedown.self="onMouseDown"
        @mousemove.self="dragMbox"
        @mouseup="onMouseUp"
        @click="alert('click')"

        :max-width="maxWidth"
        >

        <!-- v-slot:activator MUST be here, NOT child or it won't work -->
        <template v-slot:activator="{on}">
            <v-btn :id="mBoxBtnId" v-on="on"></v-btn>
        </template>

        <template
            v-for="(_, slot) of $scopedSlots"
            v-slot:[slot]="scope"
            >
            <slot :name="slot" v-bind="scope"/>
        </template>

    </v-dialog>

     <!-- @blur="cboBlur()"
        @focus="cboFocus()" -->
</template>

<!-------------------------------------------------------------------------------------------------------------------------------------------------->
<script>
export default {
    name: 'cpSelect',
    data: () => ({
        updtFromParent: false,
        refId: '',
        showPopUp: true,

        pos1: 0,
        pos2: 0,
        pos3: 0,
        pos4: 0, 
    }),
    props: [
        // these can be passed in, the 'data' stuff can't
        'mBoxBtnId', // so we can keep track of multiple mboxs at once

        'value', // bound through v-model
        'persistent', // vuejs prop
        'contentClass', // vuejs prop
        'color', // vuejs prop
        'dark', // vuejs prop
        'light', // vuejs prop
        'maxWidth', // vuejs prop
    ],

    //**************************************************************************************************************
    computed: {
        dialPersistent: function(){
            return this.persistent || typeof this.persistent === 'string';
        },
    }, // computed


    //**************************************************************************************************************
    watch: {
        value: async function(){
            // updated from the parent
            this.showPopUp = this.value; 
            await this.$nextTick();
            await this.$forceUpdate();

        },
        items: async function(){
            // updated from the parent
            this.selectVal = this.value; 
            await this.$nextTick();
            await this.$forceUpdate();

        },
        // selectVal: function(){
        //     if (!this.updtFromParent){
        //         this.$emit('change', this.selectVal);
        //     }
        //     this.updtFromParent = false;
        // }
    },

    //**************************************************************************************************************
    async created(){    
        if (!this.$vuetify || !this.$vuetify.theme || !this.$vuetify.breakpoint){
            this.$vuetify = this.Sublib.oVuetify;
        }

        this.showPopUp = this.value;

        this.refId = 'cpDialog-' + this.Sublib.right(String(Math.random()), 5);

        await this.$nextTick();
        await this.$forceUpdate();


    }, // created


    //**************************************************************************************************************
    methods: {
         // *****************************************
        // Make the popup draggable so it feels more like a desktop app
        // see https://www.w3schools.com/howto/howto_js_draggable.asp#:~:text=Create%20a%20Draggable%20DIV%20Element%201%20Step%201%29,background-color%3A%20%23f1f1f1%3B%20...%203%20Step%203%29%20Add%20JavaScript%3A
        onMouseDown(e){
debugger            
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
debugger            
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
            var elmnt = this.$refs[this.refId].$el;
            elmnt.style.top = (elmnt.offsetTop - this.pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - this.pos1) + "px";
        }, // dragMbox

    } // methods
} // export default
</script>
<style scoped>
.cpSelect { max-height: 400px !important ;}
</style>