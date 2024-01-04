<template>
    <div id="container">
        <DxPopup
            :visible="showPopUp"
            :drag-enabled="true"
            :hide-on-outside-click="false"
            :show-close-button="true"
            :width="width || 1000"
            :height="height || 1000"
            container=".dx-viewport"
            :resize-enabled="true"
            :drag-outside-boundary="true"
            :shading="false"
            content-template="myContent"  
            position="center"
        >
            <!-- :show-title="true" -->
            <!-- title="Information" -->
            <!-- <DxPosition
                at="bottom"
                my="center"
                collision="fit"
                :of="positionOf"
                /> -->

            <!-- <DxToolbarItem
                widget="dxButton"
                toolbar="bottom"
                location="before"
                :options="emailButtonOptions"
            /> -->
            <DxToolbarItem
                widget="dxButton"
                toolbar="bottom"
                location="after"
                :options="closeButtonOptions"
                @click="showPopUp = false"
            />
            <!-- 
            <div slot="myContent" slot-scope="data">  
            </div>   -->

            <template v-for="(_, name) in $scopedSlots" v-slot:[name]="{ data }">
                <slot :name="name" :item="data"></slot>
            </template>

            <!-- <p>
                Full Name:
                <span>Test</span>
                <span>Test</span>
            </p> -->
        </DxPopup>
    </div>
</template>

<!-------------------------------------------------------------------------------------------------------------------------------------------------->
<script>
// THis is a trial component to test DxPopup
import { DxPopup, DxPosition, DxToolbarItem } from 'devextreme-vue/popup';

export default {
    name: 'cpCard',
    data: () => ({
        updtFromParent: false,
        refId: '',
        showPopUp: false,

        closeButtonOptions: {
            text: 'Close',
            stylingMode: 'outlined',
            type: 'normal',
        },

        emailButtonOptions: {
            icon: 'email',
            stylingMode: 'contained',
            text: 'Send',
            onClick: () => {
                // const message = `Email is sent to ${currentEmployee.value.FirstName} ${currentEmployee.value.LastName}`;
                // notify({
                //     message,
                //     position: {
                //         my: 'center top',
                //         at: 'center top',
                //     },
                // }, 'success', 3000);
            },
        },

        positionOf: {
            my: 'center top',
            at: 'center top',
        },
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
        'height', // vuejs prop
        'width', // vuejs prop
    ],

    //**************************************************************************************************************
    computed: {
        dialPersistent: function(){
            return this.persistent || typeof this.persistent === 'string';
        },
    }, // computed

    components: {
        DxPopup,
        DxPosition,
        DxToolbarItem,
    },


    //**************************************************************************************************************
    watch: {
        value: async function(){
            // updated from the parent
            this.showPopUp = this.value; 
            this.positionOf = document.getElementById('dxPopUpBtn');

            await this.$nextTick();
            await this.$forceUpdate();

            console.log('cpDialog2 watch value ' + this.value);
        },
    },

    //**************************************************************************************************************
    async created(){    

        this.showPopUp = this.value;

        console.log('cpDialog2 created');

        // console.log(this.$scopedSlots)

        //loop through the slots
        for (const [key, value] of Object.entries(this.$scopedSlots)) {
            console.log(key, value)
        }


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