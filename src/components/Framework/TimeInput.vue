<template>
    <v-container style="max-width: 100px;">
        <v-row>
            <div class="FormDate">
                <input v-model="time" v-on:keyup.enter="updateValue('ENTER')" @input="updateValue" type="time" :id="'time-input' + uniqueId"  required>
            </div>

            <cp-btn 
                v-if="showClock"
                text 
                size="xs"
                :icon="Sublib.getIcon('time')"
                iconSize="md"
                @click="btnClockClicked(time)"
                class="float-right pointer margin-left-10 margin-top-5"
                style="padding:0; min-width:15px;" 
                >
            </cp-btn>
        </v-row>
        <v-row v-if="invalidTime" style="max-height: 10px;">
            <!-- write a custom field to show error message if the date is invalid -->
            <div class="date-error">{{Sublib.getLbl('Invalid Date')}}</div>
        </v-row>
    </v-container>
</template>

<script>
export default {
    name: 'TimeInput',
    props: [
        'value',
        'showClock',
        'showDfltClock',
        'autofocus',
    ],
    data() {
        return {
            time: null,
            prevTime: null,
            invalidTime: false,

            uniqueId: '', //if there are 2 date input (like on the table) and they click the click icon, the setFocus was not working because of 2 matching refs or ids
        };
    },

    watch: {
        value: function (val) {
            this.prevTime = this.time;

            if(val && !this.Sublib.contains(val, ':')){
                this.time = this.Sublib.left(val, 2) + ':' + this.Sublib.right(val, 2)
            }else{
                this.time = val;
            }

        },
    },
 
    computed: {
      
    },

    async created() {
        
        //break reference to the value prop
        this.prevTime = this.value;

        if (!this.value){
            this.value = this.Sublib.milTime(this.Sublib.newDate());
        }

        if(!this.Sublib.contains(this.value, ':')){
            this.time = this.Sublib.left(this.value, 2) + ':' + this.Sublib.right(this.value, 2)
        }else{
            this.time = this.value;
        }

        this.uniqueId = this.Sublib.getAddId(true)

    },

    async mounted() {
        //if showClock is false, then hide the clock icon
        if(!this.showDfltClock){
            //add this style to the style sheet
            //get element by id and set display clock to none

            //hide webnative calendar picker

            //not using this anymore MA 04/11/2023
            try {
                //for some reason, it was removing the whole time input on iPads only MA 10/02/2023
                if(this.Sublib.isIOS() && !this.Sublib.isIOS('ipad')){
                    var el = document.getElementById("time-input" + this.uniqueId)
                    if(!el){
                        await this.Sublib.sleep(500);
        
                        el = document.getElementById("time-input" + this.uniqueId)
        
                        if(el){
                            el.style.display = "none";
                            el.style.background = "none";
                        }
                    }
                } else if (this.Sublib.isMac()){
                    // nothing to hide / do. Errors out on the querySelector in the else so making it seperate. SRR 05/31/2023
                
                } else{
                    var el = document.querySelector("input[type='time']::-webkit-calendar-picker-indicator")
        
                    if(!el){
                        await this.Sublib.sleep(500);

                        el = document.querySelector("input[type='time']::-webkit-calendar-picker-indicator")
        
                        if(el){
                            el.style.display = "none";
                            el.style.background = "none";
                        }
                    }
                }
            }catch(badSelect){
                // safari errors out on the querySelecter, just keep going? SRR 05/31/2023
            }
        } // if !this.showClock


        //  //apply focus to the first input
        // var inputEl = document.querySelector('#time-input');

        // if(!inputEl){
        //     //wait 
        //     await this.Sublib.sleep(500);
        // }

        // //inputEl = document.querySelector('#time-input');
        // this.Sublib.setFocus('time-input');

        // try{
        //     inputEl.focus();
        //     inputEl.select();
        // } catch(e){
        //     // console.log(e);
        // }

        if (this.autofocus){
            let oRef = 'time-input' + this.uniqueId;

            this.Sublib.setFocus(oRef, false, true);
        }

    },
  
    methods: {

        // handleInput() {

        //     debugger

        //     var before = this.prevTime;
        //     var after = this.time;
        //     var partsBefore = before.split(":");
        //     var partsAfter = after.split(":");
        //     if (partsBefore[0] == partsAfter[0]) {
        //         if (partsBefore[1] == partsAfter[1]) {
        //             // $("#result").text("Nothing changed");
        //             //no change
        //         } else {
        //             // $("#result").text("Minutes changed");
                    
        //         }
        //     } else {
        //         // $("#result").text("Hours changed");

        //     }
        //     this.prevTime = after;
        // },
       
        //***********************************************************************************
        // update the value of the date
        updateValue(mBtnType) {

            //check if the time is valid

            // this.invalidTime = false;
            // this.$emit('invalidTime', false)

            //remove the colon from the time so that it matches the miltime format
            var mTime = this.time.replace(':', '');

            this.$emit(`timeChanged`, mTime);

            if(mBtnType == 'ENTER'){
                this.$emit('closeTimePicker')
            }
        }, //updateValue

        //****************************************************************** */
        async btnClockClicked(time){

            var mHold = await this.Sublib.timePicker(time); // defaults to now if !mHold
            if (!mHold){
                return;
            }

            this.time = mHold;
            this.updateValue()
        }, //btnClockClicked

    },
};
</script>

<style scoped>
.FormDate {
    max-height: 40px;
    font-size: 18px;;
    display: inline-flex;
    position: relative;
    overflow: hidden;
    border: 1px solid #888;
    align-content: center;
    border-radius: 0.25em;
}
/* .FormDate__input {
    max-width: 60px;
    border: none;
    text-align: center;
    -moz-appearance: textfield;
} */

.FormDate input[type="time"]::-webkit-calendar-picker-indicator { background: none; display:none; }

.date-error {
    color: red;
    font-size: 12px;
    font-weight: bold;
}

input[type="time"]::-webkit-calendar-picker-indicator {
    background: none;
}

/* .input-container input {
    border: none;
    box-sizing: border-box;
    outline: 0;
    padding: .75rem;
    position: relative;
    width: 100%;
}

input[type="date"]::-webkit-calendar-picker-indicator {
    background: transparent;
    bottom: 0;
    color: transparent;
    cursor: pointer;
    height: auto;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    width: auto;
} */
</style>