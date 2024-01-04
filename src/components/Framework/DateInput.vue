<template>
    <v-container :style="{'max-width': '165px', 'min-width': (showCal || showCalendar ? '160px' : '135px'), 'padding':0, 'margin':0, 'margin-top': label ? '20px' : '0px' }">
        

        <span v-if="label" style="position: absolute; margin-top: -20px; margin-left:2px; font-size:13px;">{{ label }}</span>

        <v-row class="col" style="padding-top:0px; padding-bottom:0px; padding-right:0px;">

            <div :class="small ? 'FormDateSmall' : 'FormDate'" :style="{'border': hasNotUpdated ? '1px solid yellow' : ''}">
                <!-- If monthFirst is true, then the month input will be first, otherwise the day input will be first -->
                <!-- NOTE: The onfocus & onmouseup make it so when you click in it / it gets focus it highlights/selects the whole field. 
                    see: https://stackoverflow.com/questions/480735/select-all-contents-of-textbox-when-it-receives-focus-vanilla-js-or-jquery SRR 09/05/2023 -->

                <!-- Month (if  month first, i.e. mm/dd/yyyy) -->
                <input
                    v-if="monthFirst"
                    ref="month"
                    :id="'month-input' + uniqueId"
                    v-model="month"
                    class="FormDate__input"
                    :style="{ 'max-width': small ? '25px' : '30px'}"
                    type="number"
                    placeholder="mm"
                    max='12'
                    min='1'
                    name="month"
                    pattern="[0-9]*"
                    @input="updateMonth"
                    @blur="month = month.padStart(2, 0);"
                    onfocus="this.select();"
                    onmouseup="return false;"
                    v-on:keyup.enter="updateValue('ENTER')"
                    @invalid="invalidDate = true"
                    required 
                    :disabled="disabled"
                    @focusout="focusOut"
                    @focus="focus"
                    tabindex="1"
                />

                <!-- <input
                    v-if="monthFirst"
                    :ref="monthFirst ? 'month' : 'day'"
                    :id="monthFirst ? 'month-input' : 'day-input'"
                    :v-model="monthFirst ? month : day"
                    class="FormDate__input FormDate__input--month"
                    type="number"
                    :placeholder="monthFirst? 'mm' : 'dd'"
                    :max='monthFirst ? 12 : 31'
                    min='1'
                    pattern="[0-9]*"
                    @input="(monthFirst ? updateMonth : updateDay)"
                    @blur="(monthFirst ? month = month.padStart(2, 0) : day = day.padStart(2, 0))"
                /> -->



                <div v-if="monthFirst" :class="small ? 'FormDate__dividerSmall' : 'FormDate__divider'">/</div>

                <!-- Day -->
                <input
                    title=""
                    ref="day"
                    :id="'day-input' + uniqueId"
                    v-model="day"
                    class="FormDate__input"
                    :style="{ 'max-width': small ? '22px' : '30px' }"
                    type="number"
                    placeholder="dd"
                    max="31"
                    min='1'
                    name="day"
                    pattern="[0-9]*"
                    @input="updateDay"
                    @blur="day = day.padStart(2, 0)"
                    onfocus="this.select();"
                    onmouseup="return false;"
                    v-on:keyup.enter="updateValue('ENTER', emitAsYouGo)"
                    v-on:keydown.tab="updateValue"
                    @invalid="invalidDate = true"
                    required 
                    :disabled="disabled"
                    @focusout="focusOut"
                    @focus="focus"
                    tabindex="1"
                    />
                    
                <span :class="small? 'FormDate__dividerSmall' : 'FormDate__divider'">/</span>

                <!-- Month (if not month first, i.e. dd/mm/yyyy) -->
                <input
                    v-if="!monthFirst"
                    ref="month"
                    :id="'month-input' + uniqueId"
                    v-model="month"
                    class="FormDate__input"
                    :style="{ 'max-width': small ? '25px' : '30px' }"
                    type="number"
                    placeholder="mm"
                    max='12'
                    min='1'
                    name="month"
                    pattern="[0-9]*"
                    @input="updateMonth"
                    @blur="month = month.padStart(2, 0)"
                    v-on:keyup.enter="updateValue('ENTER', emitAsYouGo)"
                    v-on:keydown.tab="updateValue"
                     @invalid="invalidDate = true"
                    required 
                    :disabled="disabled"
                    @focusout="focusOut"
                    @focus="focus"
                    tabindex="1"
                />

                <span v-if="!monthFirst" :class="small? 'FormDate__dividerSmall' : 'FormDate__divider'">/</span>

                <input
                    ref="year"
                    :id="'year-input' + uniqueId"
                    v-model="year"
                    class="FormDate__input FormDate__input--year"
                    :style="{ 'max-width': small ? '38px' : '50px' }"
                    type="number"
                    :max='maxYear'
                    :min='minYear'
                    placeholder="yyyy"
                    @input="startYearTimer"
                    @blur="updateYear"
                    v-on:keyup.enter="updateValue('ENTER', emitAsYouGo)"
                    v-on:keydown.tab="updateValue"
                    @invalid="invalidDate = true"
                    required 
                    :disabled="disabled"
                    @focusout="focusOut"
                    @focus="focus"
                    tabindex="1"
                />

                <!-- onfocus="this.showPicker()"  automaticallly show calender-->  

                <input v-if="showDefCalendar" :disabled="disabled" type="date" id="date-input" name="date-input" :value="date" style="max-width: 25px; padding: 0px; margin: 0px;" @input="handleCalendarChange">

             
            </div>
            
            <cp-btn 
                v-if="showCalendar || showCal"
                tabindex="-1"
                text 
                size="xs"
                :icon="Sublib.getIcon('calendar')"
                iconSize="sm"
                @click="btnCalendarClicked(date)"
                class="pointer margin-top-5"
                style="padding:0; min-width:15px; margin-left:7px; margin-top:6px; margin-right: 2px; " 
                :disabled="disabled"
                >
            </cp-btn>
          
        </v-row>
        <v-row v-if="invalidDate" style="max-height: 10px;">
            <!-- write a custom field to show error message if the date is invalid -->
            <div class="date-error">{{Sublib.getLbl('Invalid Date')}}</div>
        </v-row>
    </v-container>
</template>

<script>
export default {
    name: 'DateInput',
    props: [
        'value',
        'minDate',
        'maxDate',
        'showCalendar',
        'showCal',
        'disabled',
        'autofocus',
        'showDefCalendar',
        'emitAsYouGo', //in date picker we want to update the value as they type, but not on other screen where we wait for onBlur MA 10/02/2023
                        //default behavior is to update on blur
        'label',
        'small', //logical, if true it will recude font size etc to fit
    ],
    data() {
        return {
            day: "",
            month: "",
            year: "",

            origDay: '',
            origMonth: '',
            origYear: '',

            minYear: 1950,
            maxYear: 2050,

            invalidDate: false,
            monthFirst: true,

            showingDatePicker: false,

            uniqueId: '', //if there are 2 date input (like on the table) and they click the calendar icon, the setFocus was not working because of 2 matching refs or ids
            tmrYearInput: null,

            hasNotUpdated: false, //logical, if true then we have not updated the value yet, so don't emit the dateChanged event yet MA 01/02/2024
            focusedElName: '', 
        };
    },
    watch: {
        value() {
            var mDate = this.Sublib.newDate(this.value);

            // this.day = `${mDate ? (mDate.getDate()).toString().padStart(2, 0) : ``}`
            // this.month = `${mDate ? (mDate.getMonth() + 1).toString().padStart(2, 0) : ``}`
            // this.year = `${mDate ? mDate.getFullYear() : ``}`
            this.setDMYVals(mDate);
        },
    },
    computed: {
        date () {
            return `${this.year}-${this.month}-${this.day}`;
        },
      
    },

    // *******************************************************************************
    async created() {
        //get day by reference and apply focus
        // this.$refs.day.select();

        var mDate = this.Sublib.newDate(this.value);

        // this.day = `${mDate ? (mDate.getDate()).toString().padStart(2, 0) : ``}`
        // this.month = `${mDate ? (mDate.getMonth() + 1).toString().padStart(2, 0) : ``}`
        // this.year = `${mDate ? mDate.getFullYear() : ``}`
        this.setDMYVals(mDate);

        this.maxYear = this.Sublib.newDate().getFullYear() + 50;  //50 years into the future support

        this.uniqueId = this.Sublib.getAddId(true)

        var format = this.Sublib.getDateFormat().toUpperCase();

        if(format == 'DMY'){
            this.monthFirst = false;  // EU format
        } else {
            this.monthFirst = true; // US format
        }

        // if (this.autofocus){
        //     var idToHightlight = this.monthFirst ? '#month-input' +  this.uniqueId : '#day-input' + this.uniqueId;

        //     //apply focus to the first input
        //     var inputEl = document.querySelector(idToHightlight);

        //     if(!inputEl){
        //         //wait 
        //         await this.Sublib.sleep(500);
        //     }

        //     inputEl = document.querySelector(idToHightlight);

        //     try{
        //         inputEl.focus();
        //         inputEl.select();
        //     } catch(e){
        //         // console.log(e);
        //     }
        // }

    
    }, // created

    //***********************************************************************************
    async mounted(){
        if (this.autofocus){
            let oRef;
            if (this.monthFirst){
                // oRef = this.$refs.month;
                oRef = 'month-input' + this.uniqueId
            } else {
                // oRef = this.$refs.day;
                oRef = 'day-input' + this.uniqueId
            }

            await this.Sublib.setFocus(oRef, true, true);
        }
        //create a tab key event listener to move to the next input
        this.$refs.month.addEventListener('keydown', this.tabListener);

        this.$refs.day.addEventListener('keydown', this.tabListener);

    }, // mounted


    //***********************************************************************************
    methods: {
        //***********************************************************************************
        // tab key listener
        async tabListener(event){

            let oRef;

            console.log(event.key)

            if (event.key === 'Tab' && !event.shiftKey) {
                await this.Sublib.sleep(100);

                if(this.focusedElName == 'day' || this.focusedElName == 'month'){
                    //move to the next input
                    oRef = 'year-input' + this.uniqueId
                    this.focusedElName = 'year'
                }else{
                    if (this.monthFirst){
                        oRef = 'day-input' + this.uniqueId
    
                        this.focusedElName = 'day'
                    } else {
                        oRef = 'month-input' + this.uniqueId
    
                        this.focusedElName = 'month'
                    } 
                }
            }else if(event.key === 'Tab' && event.shiftKey){
                //go in reverse order
                await this.Sublib.sleep(100);

                if(this.focusedElName == 'day' || this.focusedElName == 'month'){
                    //move to the next input
                    oRef = 'year-input' + this.uniqueId
                }else{
                    if (this.monthFirst){
                        oRef = 'month-input' + this.uniqueId
    
                    } else {
                        oRef = 'day-input' + this.uniqueId
    
                    } 
                }
            }else{
                return;
            }

            await this.Sublib.setFocus(oRef, true, true);
        }, // tabListenter


        //**************************************************************************************************************
        // Set day, month, and year values
        setDMYVals(dateVal){
            // dateVal = Date, Date to parse to day, month, and year strings. 
            if (!dateVal || this.Sublib.emptyDt(dateVal)){
                dateVal = '';
            } else {
                dateVal = this.Sublib.DTOC(dateVal)
            }

            // this.day = `${mDate ? (mDate.getDate()).toString().padStart(2, 0) : ``}`
            // this.month = `${mDate ? (mDate.getMonth() + 1).toString().padStart(2, 0) : ``}`
            // this.year = `${mDate ? mDate.getFullYear() : ``}`



            this.day = (dateVal ? this.Sublib.padL(this.Sublib.getDay(dateVal), 2, '0') : '');
            this.month = (dateVal ? this.Sublib.padL(this.Sublib.getMonth(dateVal), 2, '0') : '');
            this.year = (dateVal ? this.Sublib.getYear(dateVal) : '');

        }, // setDMYVals


        //***********************************************************************************
        // update the value of the date
        updateDay() {
            // if (!this.day.length || parseInt(this.day, 10) < 4) return;
            // else if(this.monthFirst) this.$refs.year.select();
            // else this.$refs.month.select();


            if (!this.day.length || this.day == '0'){
                return;
            } else if ((this.day.length == 2 || parseInt(this.day, 10) > 3) && this.monthFirst) {
                this.$refs.year.select();
            }
             else if ((this.day.length == 2 || parseInt(this.day, 10) > 3) && !this.monthFirst) {
                this.$refs.month.select();
            }

            this.updateValue('', this.emitAsYouGo);
        }, //updateDay

        //***********************************************************************************
        // update the value of the date
        updateMonth() {
            // if (!this.month.length || parseInt(this.month, 10) < 2) return;
            // else if(this.monthFirst) this.$refs.day.select();
            // else this.$refs.year.select();

            if (!this.month.length || this.day == '0'){
                return;
            } else if ((this.month.length == 2 || parseInt(this.month, 10) > 1) && this.monthFirst) {
                this.$refs.day.select();
            } else if ((this.month.length == 2 || parseInt(this.month, 10) > 1) && !this.monthFirst) {
                this.$refs.year.select();
            }

            this.updateValue('', this.emitAsYouGo);
        }, //updateMonth

        //***********************************************************************************
        // update the value of the date
        updateYear() {

            if (!this.year.length || parseInt(this.year, 10) < 4) return;

            if (this.tmrYearInput){
                clearInterval(this.tmrYearInput);
            }

            this.updateValue('', this.emitAsYouGo);
        }, //updateYear

        //***********************************************************************************
        // update the value of the date
        updateValue(mBtnType, emitValueChanged) {
            // mBtnType = Char. Either 'ENTER' or ''. 
            // emitValueChanged = Logical. If true, emits that the value changed on lost focus from dateInput

            // if (this.tmrYearInput){
            //     // pressed enter in the year field. Make sure we update the value so we send back what they were looking at. SRR 11/13/2023
            //     clearInterval(this.tmrYearInput);
            //     this.tmrYearInput = null;
            //     return;
            // }


            //if last digit of the year is 23, then set it to 2023
            if (this.year.length === 2 && parseInt(this.year, 10)) {
                this.year = `20${this.year}`;
            }

            this.year = this.year.padStart(4, 0)

            //check for max and min year
            if(parseInt(this.year) > this.maxYear || parseInt(this.year) < this.minYear){
                this.invalidDate = true;
                this.$emit('invalidDate', true)
                return;
            }

            // date parse was wrong since date is 0 based and this.month is not. SRR 03/03/2023
            // const timestamp = Date.parse(`${this.year}-${this.month}-${this.day}`);
            
            // if (Number.isNaN(timestamp)){
            //     this.invalidDate = true;
            //     this.$emit('invalidDate', true)
            //     return;
            // }

            // this.invalidDate = false;

            // this.$emit('invalidDate', false)

            // var mDate = this.Sublib.newDate(timestamp)

            // //add 1 day to the date
            // mDate = mDate.addDays(1);

            var mDate = this.Sublib.newDate(`${this.month}/${this.day}/${this.year}`);
            if (this.Sublib.emptyDt(mDate)){
                this.invalidDate = true;
                this.$emit('invalidDate', true)
                return;

            } else if (mDate.getDate() != Number(this.day) || mDate.getMonth() != Number(this.month) -1 || mDate.getFullYear() != Number(this.year)) {
                // Feb 30 wrapped to March 2 or something like that
                this.invalidDate = true;
                this.$emit('invalidDate', true)
                return;
            }


            this.invalidDate = false;
            this.$emit('invalidDate', false)


            if (emitValueChanged){
                this.hasNotUpdated = false;

                if (this.Sublib.DTOC(mDate) != this.Sublib.DTOC(this.Sublib.newDate(`${this.origMonth}/${this.origDay}/${this.origYear}`))){
                    this.$emit('dateChanged', mDate);
                }

                // we are losing focus so blank out orig vals so we can check next time
                this.origDay = '';
                this.origMonth = '';
                this.origYear = '';
            }else{
                // we are not losing focus so don't blank out orig vals
                this.hasNotUpdated = true;
            }

            if(mBtnType == 'ENTER'){
                this.$emit('closeDatePicker', mDate)
            }
        }, //updateValue

        //***********************************************************************************
        // update the value of the date if the user changes the date from the calendar
        handleCalendarChange(e) {
            const timestamp = Date.parse(e.target.value);

            //add 1 day to the date
            var mDate = this.Sublib.newDate(timestamp)
            mDate = mDate.addDays(1);


            //update the day, month and year
            // this.day = `${timestamp ? (new Date(timestamp).getDate()).toString().padStart(2, 0) : ``}`;
            // this.month = `${timestamp ? (new Date(timestamp).getMonth() + 1).toString().padStart(2, 0) : ``}`;
            // this.year = `${timestamp ? new Date(timestamp).getFullYear() : ``}`;
            this.setDMYVals(timestamp);

            if (Number.isNaN(timestamp)) return;
            this.$emit('dateChanged', mDate);

        }, //handleCalendarChange

        //*********************************************************** */
          //**************************************************************************************************************
        // Show the calandar to pick date
        async btnCalendarClicked(date){

            this.showingDatePicker = true;
            var mDt = await this.Sublib.datePicker(date, false);
            this.showingDatePicker = false;

            if (!mDt){
                // pressed cancel
                return;
            }

            var newDate = this.Sublib.DTOC(this.Sublib.newDate(mDt));

            // this.day = this.Sublib.getDay(newDate)
            // this.month = this.Sublib.getMonth(newDate) 
            // this.year = this.Sublib.getYear(newDate)
            this.setDMYVals(newDate);

            this.updateValue(false, true);

        }, // btnCalendarClicked


        //**************************************************************************************************************
        // Handle the 'focus out' event.
        //  Decide if the 'container' lost focus (i.e. check all children, really annoying but only way to do it.    
        async focusOut(event){

            // Nothing has 'focus' during the 'focus out' event so wait a second
            await this.Sublib.sleep(.1*1000);

            let cntHasFocus = false;
            for (var ref in this.$refs){
                document.activeElement                
                if (this.$refs[ref] && (this.$refs[ref].$el ? this.$refs[ref].$el : this.$refs[ref]) == document.activeElement){
                    cntHasFocus = true;
                    break;
                }
            } // for 

            if (cntHasFocus || this.showingDatePicker)
                return;


            this.updateValue(false, true); // emit that the date changed

        }, // focusOut


        //**************************************************************************************************************
        // Store out our original date values when we get focus
        focus(event){
            if (this.origDay || this.origMonth || this.origYear)
                return; // focus is moving from 1 element in our 'container' to another

            this.origDay = this.day;
            this.origMonth = this.month;
            this.origYear = this.year;
                

        }, // focus


        // **************************************************************************************************************
        startYearTimer(){
            if (this.tmrYearInput){
                clearTimeout(this.tmrYearInput);
                this.tmrYearInput = null;
            }
                

            let _this = this;
            this.tmrYearInput = setTimeout(() => {
                _this.updateYear();
            }, 1*1000);
        }, // startYearTimer

    },
};
</script>

<style>
.FormDate {
    max-height: 35px;
    font-size: 18px;;
    display: inline-flex;
    position: relative;
    overflow: hidden;
    border: 1px solid #888;
    align-content: center;
    border-radius: 0.25em;
}

.FormDateSmall {
    max-height: 25px;
    font-size: 16px;;
    display: inline-flex;
    position: relative;
    overflow: hidden;
    border: 1px solid #888;
    align-content: center;
    border-radius: 0.25em;
}

.FormDate__input {
    max-width: 50px;
    border: none;
    text-align: center;
    /* stylelint-disable-next-line property-no-vendor-prefix */
    -moz-appearance: textfield;
}

.FormDate__inputSmall {
    max-width: 30px;
    border: none;
    text-align: center;
    /* stylelint-disable-next-line property-no-vendor-prefix */
    -moz-appearance: textfield;
}


.FormDate__input::-webkit-inner-spin-button {
  display: none;
}

.FormDate__input:focus {
  outline: none;
}

/* Not used */
.FormDate__input--day,
.FormDate__input--month {
  width: 30px;
}

/* Not used */
.FormDate__input--year {
  width: 50px;
}
/* .FormDate__divider {
    padding-top: 1px;;
    padding-bottom: 0.75em;
    pointer-events: none;
} */
.FormDate__divider {
    padding-top: 4px;;
    padding-bottom: 4px;
    pointer-events: none;
    line-height: 25px;
    text-align: center;
}

.FormDate__dividerSmall {
    padding-top: 0px;;
    padding-bottom: 2px;
    pointer-events: none;
    line-height: 25px;
    text-align: center;
}

.date-error {
    color: red;
    font-size: 12px;
    font-weight: bold;
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


input[type="date"] {
    position: relative;
}

input[type="date"]:after {
    content: "\25BC"; 
    color: #555;
    padding: 0 5px;
}

input[type="date"]:hover:after {
    color: #bf1400;
}


input[type="date"]::-webkit-calendar-picker-indicator {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: auto;
    height: auto;
    color: transparent;
    background: transparent;
}

input[type="date"]::-webkit-inner-spin-button {
    z-index: 1;
}

input[type="date"]::-webkit-clear-button {
    z-index: 1;
}
</style>