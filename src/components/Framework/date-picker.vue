<template>
    <v-dialog
        ref="datePicker"
        v-model="showDatePicker"
        :return-value.sync="date"
        persistent
        :width="maxWidth + 'px'"
        :color="Sublib.getColor('header')"
        >

        <v-card :style="cardLocStyle" >
            <v-card-title style="justify-content: center;">
                <!-- <input type="date" id="birthday" name="birthday"> -->

               <!-- <cp-txt 
                    v-model="typedDate"
                    type="date" 
                    class="date-input" 
                    autofocus
                    id="datePickerTxt"
                    required
                    pattern="\d{4}-\d{2}-\d{2}"
                    value="2018-06-12T19:30" min="1978-01-01T00:00" max="2072-12-31T00:00"
                >
                </cp-txt> -->

                <!-- <input type="datetime-local" id="meeting-time" name="meeting-time" value="2018-06-12T19:30" min="1978-01-01T00:00" max="2072-12-31T00:00"> -->

                <!-- <input type="time" id="appt" name="appt" min="09:00" max="18:00" required> -->

                <!-- Make it a com  showCalByDeflt -->
                <!-- <input autofocus type="date" id="date-input" name="meeting-time" value="2018-06-12" min="1978-01-01" max="2072-12-31"> -->
                <!-- <date-input :date="date" @input="handleDateChange"></date-input> -->

                <!-- onfocus="this.showPicker()" -->
                <cp-date :value="date" @dateChanged="handleDateChange" @closeDatePicker="btnOKClicked()" @invalidDate="invalidDt = $event" :autofocus="true" :emitAsYouGo="true"></cp-date>

                <!-- okay button -->
                <cp-btn
                    small fob right
                    @click="btnOKClicked()"
                    style="margin-left: 10px;"
                    :disabled="invalidDt"
                    :icon="Sublib.getIcon('ok')"
                    >
                    <!-- <v-icon class="date-picker-close-bar" >check</v-icon> -->
                </cp-btn>
            </v-card-title>

            <v-date-picker
                v-model="date"
                scrollable
                :color="Sublib.getColor('header')"
                @input="!okCancelBtns ? btnOKClicked(): ''" 
                :title-date-format="formatDtLbl"
                :header-date-format="formatMonthLbl"
                :weekday-format="formatDOWLbl"
                :month-format="formatMonthsListLbl"
                >

                <cp-btn v-if="!okCancelBtns"
                    small top right fab
                    @click="btnCancelClicked"
                    style="margin-top: 25px;"
                    :icon="Sublib.getIcon('close')"
                >
                    <!-- <v-icon class="date-picker-close-bar" >close</v-icon> -->
                </cp-btn>

                <v-layout v-if="okCancelBtns" justify-end>
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
            </v-date-picker>
        </v-card>
    </v-dialog>
</template>
<script>
export default {
    name: 'date-picker',
    data: () => ({
        showDatePicker: true,   
        oMonths: ['january', 'febuary', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'],
        oMonthsAbbr: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        oDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],

        invalidDt: false, // this is a hack to get the dialog to show up
        topX: 0,
        topY: 0,
        maxWidth: 290,
        
    }),
    props: [
        // these can be passed in, the 'data' stuff can't
        'date',
        'retval',
        'okCancelBtns',
        'topXPos', // override where to show it (i.e. called from a time picker, show in the same spot as the time picker instead of where clicked 'ok' on the time picker)
        'topYPos',
        'center' // centers instead of trying to go off of last click position
    ],

    components: {
    },

    async created(){    
        //this.date = this.date.toISOString().substr(0, 10); // converts to UTC, don't want that.    
        if (!this.$vuetify || !this.$vuetify.theme || !this.$vuetify.breakpoint){
            this.$vuetify = this.Sublib.oVuetify;
        }

        if (!this.date || this.Sublib.emptyDt(this.date) || (typeof this.date === 'string' && isNaN(this.Sublib.newDate(this.date).getTime()))){
            this.date = this.Sublib.newDate();
        }

        this.date = this.Sublib.DTOC(this.date, 'YMD', '-')
        this.showDatePicker = true;


        this.topX = this.topXPos || window.mouseX;
        if (this.topX + this.maxWidth >= window.innerWidth){
            this.topX = window.innerWidth - this.maxWidth - 20
        }
        this.topY = this.topYPos || window.mouseY;
        if (this.topY + 500 >= window.innerHeight){
            // NOTE: Don't know the size until it renders but looking at it in the dev tools it was 479 so rounded up to 500. SRR 09/05/2023
            this.topY = window.innerHeight - 500;
        }
    }, 

    computed: {
        mainColor: function(){            
            return ;
        },

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

    async mounted() {
        // document.getElementById('date-input')
        // await this.Sublib.sleep(500);
        // document.getElementById('date-input').focus(); 
    },

    methods: {
        // *****************************************************************
        btnCancelClicked(){
            this.retval = false; // watcher in Sublib will detect this value has changed
            this.showDatePicker = false;
        }, // btnCancelClicked


        // *****************************************************************
        btnOKClicked (){
            // NOTE: Dates are UTC, and since there is not time, is defaulting to a day before
            // call Sublib.getUTCDate() to get the real date (a little wierd but it works). SRR 07.17.2019   
            
            // my new method deals with no time passed. SRR 11.20.2019            
            this.retval = this.Sublib.newDate(this.date); // watcher in Sublib will detect this value has changed
            this.showDatePicker = false;
        }, // btnOKClicked


        // *****************************************************************
        // This formats the main label (vue calls it the 'title label') that says 'Tue, Oct 22' for the selected date
        formatDtLbl(mDtLbl){
            // mDtLbl = Char. i.e. '2019-10-22'
            // NOTE: This formats the selected date (i.e. Tue, Oct 22)
            // Overriding the default so I can support mutliple languages

            // NOTE: Can't just call Sublib.obviousDt(mDtLbl)
            // as new Date('2019-10-22') returns a date of 2019-10-21 18:00 (it assumes I'm passing in a UTC date)
            return this.Sublib.obviousDt(mDtLbl + 'T00:00:00');
        }, // formatDtLbl


        // *****************************************************************
        // Format the month lbl (i.e. October 2019) (vuetify calls it the header-date)
        formatMonthLbl (mMonthLbl){
            // mMonthLbl = Char. i.e. '2019-10'

            //var mDtHold = new Date(mMonthLbl + '-01T00:00:00' + this.Sublib.getTimeZone(false, true));
            // NOTE: If the month passed was not during daylight savings and it currently is daylight savings, the browser tries to be smart and subtract an hour
            // Defaulting to noon of the same day to try to account for it
            //var mDtHold = new Date(mMonthLbl + '-12T00:00:00' + this.Sublib.getTimeZone(false, true));
            var mDtHold = this.Sublib.newDate(mMonthLbl + '-12T00:00:00'); 
            var mMonth = this.Sublib.getLbl(this.oMonths[mDtHold.getMonth()]);

            return mMonth + ' ' + String(mDtHold.getFullYear());
        }, // formatMonthLbl


        // *****************************************************************
        // Format the day of week lable lbl i.e. 'S' for Sunday, 'M' for Monday, etc. (vuetify calls it the weekday-format)
        formatDOWLbl (mDOWLbl){
            // mDOWLbl = Char. i.e. '2017-01-15' (get the DOW from this)
 
            // NOTE: vuetify passed in '2017-01-15' for the 'Sunday' date. If this was not during daylight savings and it current is daylight savings, the browser tries to be smart and subtract an hour
            // Defaulting to noon of the same day to try to account for it
            //var mDtHold = new Date(mDOWLbl + 'T12:00:00' + this.Sublib.getTimeZone(false, true));
            var mDtHold = this.Sublib.newDate(mDOWLbl + 'T12:00:00'); 
            var mRetVal = this.Sublib.getLbl(this.oDays[mDtHold.getDay()]);
            mRetVal = this.Sublib.left(mRetVal, 1);

            return mRetVal;
        }, // formatDOWLbl


        // *****************************************************************
        // Format the month abbreviations when they are just looking at a months list (vuetify calls it 'month-format')
        formatMonthsListLbl (mMonthLbl){
            // mMonthLbl = Char. i.e. '2019-10'

            // mMonthLbl = Char. i.e. '2019-10'
            //var mDtHold = new Date(mMonthLbl + '-01T00:00:00' + this.Sublib.getTimeZone(false, true));
            var mDtHold = this.Sublib.newDate(mMonthLbl + '-01T00:00:00');
            var mMonth = this.Sublib.getLbl(this.oMonthsAbbr[mDtHold.getMonth()]);
            return mMonth;

        }, // formatMonthsListLbl

        handleDateChange (mDate){
            // mDate = Char. i.e. '2019-10-22'
            this.date = mDate;

            this.date = this.Sublib.DTOC(this.date, 'YMD', '-')
            // this.btnOKClicked();
        }, // handleDateChange



    } // methods
} // export default
</script>
<style scoped>
.date-picker-close-bar { float:right; }

>>>.v-text-field__slot input::-webkit-calendar-picker-indicator {
    display: none;
    -webkit-appearance: none;
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

/* 
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
} */


</style>