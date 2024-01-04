<template>
    <v-container style="max-width: 100px;">
       <div id="time_wrapper">
            <div id="time_input">
                <label for="hours">
                    <input type="number" id="hours" v-model="hours" @focus="onFocus" @keyup="onKeyUpHrs">
                    <span class="label lbl-hrs">hours</span>
                </label>
                <span>:</span>
                <label for="minutes">
                    <input type="number" id="minutes" v-model="minutes" @focus="onFocus" @keyup="onKeyUpMins">
                    <span class="label lbl-min">minutes</span>
                </label>
            </div>
        </div>
        <div v-if="errorMsg" class="invalid">{{errorMsg}}</div>
    </v-container>
</template>

<script>
//THis is a test component for time input. Leaving it here so I can come back to it later MA 04/11/2023
export default {
    name: 'TimeInput2',
    props: [
        'value',
    ],
    data() {
        return {
            time: null,
            prevTime: null,
            invalidTime: false,

            hours: '0',
            minutes: '00',
            errorMsg: '',
        };
    },

    watch: {
        value: function (val) {
            this.prevTime = this.time;
            this.time = val;
        },
    },
 
    computed: {
      
    },

    async mounted() {
       
    },
    async created() {
        
        //break reference to the value prop
        this.prevTime = this.value;
        this.time = this.value;

    },
    methods: {
        validInput(val) {
            return val.replace(/[^0-9]+/g, "");
        },

        onFocus() {
            this.errorMsg = '';
        },

        onKeyUpHrs(){
            // only allow digits
            this.hours = validInput(hours);
            
            // restrict input characters
            if(this.hours.length > 2) {
                this.hours= this.hours.substring(0,2);
            }

            // set max value allowed
            if (this.hours > 24) {
                // handle error
                isInvalid = true;
                // e.target.classList.add('invalid');
                mssg = `It can't be more than ${max}`;
            
                this.errorMsg = mssg;
            } else {
                this.errorMsg = '';
            }

        },

         onKeyUpMins(){
            // only allow digits
            input.value = validInput(val);
            
            // restrict input characters
            if(e.target.value.length > 2) {
                input.value = e.target.value.substring(0,2);
            }

            var max = type == 'hours' ? 23 : 59;
            
            // set max value allowed
            if (+input.value > max) {
                // handle error
                isInvalid = true;
                // e.target.classList.add('invalid');
                mssg = `It can't be more than ${max}`;
            
                this.errorMsg = mssg;
            } else {
                this.errorMsg = '';
            }

        },
       
        //***********************************************************************************
        // update the value of the date
        updateValue(mBtnType) {

            //check if the time is valid

            // this.invalidTime = false;
            // this.$emit('invalidTime', false)


            this.$emit(`timeChanged`, this.time);

            if(mBtnType == 'ENTER'){
                this.$emit('closeTimePicker')
            }
        }, //updateValue

    },
};
</script>

<style scoped>
:root {
  --inactive: #acd4ae;
  --active: #2b662e;
}

body {
  font-family: sans-serif;
}

#time_wrapper {
  width: fit-content;
  margin: 0 auto;
  /*   background: pink; */
  position: relative;
  top: 150px;
  transform: scale(1.5);
}

#time_input {
  border: 2px solid var(--inactive);
  width: fit-content;
  color: #86c288;
  display: flex;
  align-items: center;
}

input {
  width: 60px;
  height: 60px;
  border: none;
  box-sizing: border-box;
  padding: auto 15px;
  text-align: center;
  color: #132c14;
}

label {
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
}

.label {
  font-size: 0.55rem;
  position: absolute;
  top: 4.5px;
}

.label.lbl-hrs {
  left: 20px;
}

.label.lbl-min {
  left: 14px;
}

.label.lbl-sec {
  left: 13px;
}

/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type="number"] {
  -moz-appearance: textfield;
}

#time_input,
input {
  border-radius: 8px;
  font-size: 1.5rem;
}

input:focus {
  outline: 3px solid var(--active);
}

input:focus + .label {
  color: var(--active);
}

input.invalid:focus {
  outline: 3px solid red;
}

input.invalid:focus + .label {
  color: red;
}

#error {
  width: 280px;
  position: relative;
  top: 170px;
  margin: 0 auto;
  color: red;
  visibility: hidden;
}
</style>