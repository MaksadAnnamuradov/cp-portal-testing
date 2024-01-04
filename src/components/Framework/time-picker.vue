<template>
    <v-dialog
        ref="datePicker"
        v-model="showDatePicker"
        :return-value.sync="time"
        persistent
        
        :width="maxWidth + 'px'"
        :color="Sublib.getColor('header')" >

        
        <v-card :style="cardLocStyle" >
            <!-- Not showing on smAndDown since it is similar to the time picker we already have. On desktop it goes to input field, but on 
            mobile it goes to the time picker. MA 04/11/2023 -->
            <v-card-title style="justify-content: center;" v-if="!$vuetify.breakpoint.smAndDown">
                <!-- This was breaking on iOS devices. Taking out so we can do a quick fix update. SRR 04/11/2023 -->
                
                <!-- <input v-if="Sublib.isTestingIP(true)" v-model="time" v-on:keyup.enter="btnOKClicked()" autofocus type="time" id="time-input"  required> -->

                <cp-time :value="time" @timeChanged="handleTimeChange" @closeTimePicker="btnOKClicked()" @invalidTime="invalidTm = $event" :autofocus="true"></cp-time>

                <!-- okay button -->
                <cp-btn
                    small fob
                    @click="btnOKClicked()"
                    style="margin-left: 10px;"
                    :disabled="invalidTm"
                    :icon="Sublib.getIcon('ok')"
                    >
                    <!-- <v-icon class="date-picker-close-bar" >check</v-icon> -->
                </cp-btn>
            </v-card-title>
        
            <v-time-picker
                v-model="time"
                scrollable
                :color="Sublib.getColor('header')"
                full-width
                format="ampm"
                ampm-in-title
                >

                <!-- <div class=flex-grow-1></div>
                <cp-btn
                    text
                    @click="btnOKClicked"
                    :label="Sublib.getLbl('OK')"
                    >
                </cp-btn>
                <cp-btn 
                    text
                    @click="btnCancelClicked"
                    :label="Sublib.getLbl('cancel')"
                    >
                </cp-btn> -->

                <!-- This layout matches the date picker -->
                <v-layout justify-end>
                    <cp-btn
                        text
                        @click="btnOKClicked"
                        :label="Sublib.getLbl('ok')"
                        >
                    </cp-btn>
                    <cp-btn 
                        text
                        @click="btnCancelClicked"
                        :label="Sublib.getLbl('cancel')"
                        >
                    </cp-btn>
                </v-layout>
            </v-time-picker>

        </v-card>
        <!-- </v-badge> -->
    </v-dialog>
</template>
<script>
export default {
    name: 'time-picker',
    data: () => ({
        showDatePicker: true,   

        invalidTm: false, // this is a hack to get the dialog to show up
        maxWidth: 290,
    }),
    props: [
        // these can be passed in, the 'data' stuff can't
        'time',
        'retval',
        'topXPos', // override where to show it (i.e. called from a time picker, show in the same spot as the time picker instead of where clicked 'ok' on the time picker)
        'topYPos',
        'center' // centers instead of trying to go off of last click position
    ],

    components: {
    },

    created(){    
        //this.date = this.date.toISOString().substr(0, 10); // converts to UTC, don't want that.    
        if (!this.$vuetify || !this.$vuetify.theme || !this.$vuetify.breakpoint){
            this.$vuetify = this.Sublib.oVuetify;
        }
        //this.time = this.Sublib.AmPm(this.time);
        // must be in hh:mm format but it's mil time... weird
        //just make sure time exists before doing left on it otherwise it will throw error MA 10/02/2023
        if(this.time){
            this.time = this.Sublib.left(this.time, 2) + ':' + this.Sublib.right(this.time, 2);
        }
        this.showDatePicker = true;

        this.topX = this.topXPos || window.mouseX;
        if (this.topX + this.maxWidth >= window.innerWidth){
            this.topX = window.innerWidth - this.maxWidth - 20
        }
        this.topY = this.topYPos || window.mouseY;
        if (this.topY + 550 >= window.innerHeight){
            // NOTE: Don't know the size until it renders but looking at it in the dev tools it was 530 so rounded up to 550. SRR 09/05/2023
            this.topY = window.innerHeight - 550;
        }

    }, 

    async mounted(){
        //apply focus to the first input. not doing this anymore MA 04/11/2023
        // var inputEl = document.querySelector('#time-input');

        // if(!inputEl){
        //     //wait 
        //     await this.Sublib.sleep(500);
        // }

        // inputEl = document.querySelector('#time-input');

        // try{
        //     inputEl.focus();
        //     inputEl.select();
        // } catch(e){
        //     console.log(e);
        // }
    },

    computed: {
        cardLocStyle: function(){
            if (!this.center && this.$vuetify.breakpoint.lgAndUp){
                return {
                    position: 'fixed', // absolute
                    top: this.topY + 'px ', 
                    left: this.topX + 'px', 
                    width: this.maxWidth + 'px' 
                }
            } else {
                // Vuetify centers all v-dialogs by default so nothing we need to do. SRR 09/05/2023
                return {};
            }
        }, // 
    }, // computed

    methods: {
        btnCancelClicked(){
            this.retval = ''; // watcher in Sublib will detect this value has changed
            this.showDatePicker = false;
        }, // btnCancelClicked

        btnOKClicked (){
            // time is returned in hh:mm but it's miltime, just strip out the ':'  
            this.retval = this.time.replace(':', ''); // watcher in Sublib will detect this value has changed
            this.showDatePicker = false;
        }, // btnOKClicked

        handleTimeChange (mTime){
            this.time = mTime;

            // this.date = this.Sublib.DTOC(this.date, 'YMD', '-')
            // this.btnOKClicked();
        }, // handleDateChange


    } // methods
} // export default
</script>
<style scoped>
.date-picker-close-bar { float:right; }
</style>