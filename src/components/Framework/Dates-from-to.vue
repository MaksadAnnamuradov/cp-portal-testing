<template>
    <v-container id="dates-from-to">
        <v-row v-if="multiLine">
            <v-col cols="6" sm="6" xs="6" md="6">
                <cp-date 
                    v-if="showDateInput"
                    :value="sDt" 
                    @dateChanged="(mDate) => {sDt = mDate; btnFilterDtClicked('sDt', true)}" 
                    @closeDatePicker="(mDate) => {sDt = mDate; btnFilterDtClicked('sDt', true)}" 
                    :label="fromLblTxt"
                    :showCalendar="showCalendar"
                >
                </cp-date>

                <cp-btn
                    v-else
                    class="date-btn"
                    @click="btnFilterDtClicked('sDt')" 
                    :style="{'min-height': (!hideY || !hideYear) ? '45px': '35px'}"
                    :dark="$vuetify.theme.isDark"
                    :light="!$vuetify.theme.isDark"
                    >
                    <v-flex style="font-size: 10px;" v-if="sDt">
                        <div>{{fromLblTxt}}</div>
                        <div>{{hideDOW ? Sublib.obviousDt(sDt, false, true) : Sublib.obviousDt(sDt, false, false)}}</div>
                        <div v-if="(!hideY || !hideYear)">{{sDt.getFullYear()}}</div>
                    </v-flex>
                    
                </cp-btn>

            </v-col>

            <v-col cols="6" sm="6" xs="6" md="6">
                <cp-date 
                    v-if="showDateInput"
                    :value="eDt" 
                    @dateChanged="(mDate) => {eDt = mDate; btnFilterDtClicked('eDt', true)}"  
                    @closeDatePicker="(mDate) => {eDt = mDate; btnFilterDtClicked('eDt', true)}" 
                    :label="toLblTxt"
                    :showCalendar="showCalendar"
                    >
                </cp-date>

                <cp-btn
                    v-else
                    class="date-btn"
                    @click="btnFilterDtClicked('eDt')" 
                    :style="{'min-height': (!hideY || !hideYear) ? '45px': '35px', 'color': 'white !important'}"
                    :dark="$vuetify.theme.isDark"
                    :light="!$vuetify.theme.isDark"
                    >
                    <v-flex style="font-size: 10px;" v-if="eDt">
                        <span >{{toLblTxt}}</span>
                        <div>{{hideDOW ? Sublib.obviousDt(eDt, false, true) : Sublib.obviousDt(eDt, false, false)}}</div>
                        <div v-if="(!hideY || !hideYear)">{{eDt.getFullYear()}}</div>
                    </v-flex>
                    
                </cp-btn>
            </v-col>

            <v-col v-if="!hideQuickDates" cols="12" sm="12" md="12" xs="12" :style="{'text-align': 'center'}">

                <v-menu
                    bottom
                    origin="center center"
                    transition="scale-transition"
                    >
                    <template v-slot:activator=" { on }">
                        <v-btn
                            small
                            style="padding: 4px; margin-top: -10px;"
                            v-on="on"
                            :dark="$vuetify.theme.isDark"
                            :light="!$vuetify.theme.isDark"
                            >
                            {{Sublib.getLbl('quick dates')}}
                        </v-btn>
                    </template>
                    <v-list v-for="date in quickDateList" dense  :key="date.code">
                        <v-list-item v-if="date.desc != '\-'"  @click="selectQuickDate(date.code)">
                            <v-list-item-content style="padding: 4px;">
                                <v-list-item-title v-text="date.desc"></v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                        <v-divider v-if="date.desc == '\-'" disabled></v-divider>
                    </v-list>
                </v-menu>
                                        
            </v-col>

        </v-row>

        <v-row v-else justify="start">
            <v-col cols="5" :style="{'margin-right': showCalendar ? '10px' : '0px', 'padding': '2px'}">
                <cp-date 
                    v-if="showDateInput"
                    :value="sDt" 
                    @dateChanged="(mDate) => {sDt = mDate; btnFilterDtClicked('sDt', true)}" 
                    @closeDatePicker="(mDate) => {sDt = mDate; btnFilterDtClicked('sDt', true)}" 
                    :small="true"
                    :label="fromLblTxt"
                    :showCalendar="showCalendar"
                >
                </cp-date>

                <cp-btn
                    v-else
                    class="date-btn"
                    @click="btnFilterDtClicked('sDt')" 
                    :style="{'min-height': (!hideY || !hideYear) ? '45px': '35px', 'padding': '0 4px'}"
                    :dark="$vuetify.theme.isDark"
                    :light="!$vuetify.theme.isDark"
                    >
                    <v-flex style="font-size: 10px;" v-if="sDt">
                        <div>{{fromLblTxt}}</div>
                        <div>{{hideDOW ? Sublib.obviousDt(sDt, false, true, true) : Sublib.obviousDt(sDt, false, false, true)}}</div>
                        <div v-if="(!hideY || !hideYear)">{{!Sublib.emptyDt(sDt) ? sDt.getFullYear() : ''}}</div>
                    </v-flex>
                    
                </cp-btn>

            </v-col>

            <v-col cols="4" :style="{'margin-right': showCalendar ? '10px' : '0px', 'padding': '2px'}">
                <cp-date 
                    v-if="showDateInput"
                    :value="eDt"
                    @dateChanged="(mDate) => {eDt = mDate; btnFilterDtClicked('eDt', true)}"  
                    @closeDatePicker="(mDate) => {eDt = mDate; btnFilterDtClicked('eDt', true)}" 
                    :small="true"
                    :label="toLblTxt"
                    :showCalendar="showCalendar"
                >
                </cp-date>

                <cp-btn
                    v-else
                    class="date-btn"
                    @click="btnFilterDtClicked('eDt')" 
                    :style="{'min-height': (!hideY || !hideYear) ? '45px': '35px', 'padding': '0 4px'}"
                    :dark="$vuetify.theme.isDark"
                    :light="!$vuetify.theme.isDark"
                    >
                    <v-flex style="font-size: 10px;" v-if="eDt">
                        <span >{{toLblTxt}}</span>
                        <div>{{hideDOW ? Sublib.obviousDt(eDt, false, true, true) : Sublib.obviousDt(eDt, false, false, true)}}</div>
                        <div v-if="(!hideY || !hideYear)">{{!Sublib.emptyDt(eDt) ? eDt.getFullYear() : ''}}</div>
                    </v-flex>
                    
                </cp-btn>
            </v-col>

            <v-col v-if="!hideQuickDates" cols="1" :style="{'text-align': 'center', 'margin-left': '10px', 'margin-top': showDateInput ? '10px' : ''}">

                <v-menu
                    bottom
                    origin="center center"
                    transition="scale-transition"
                    >
                    <template v-slot:activator=" { on }">
                        <v-btn
                            x-small
                            v-on="on"
                            :dark="$vuetify.theme.isDark"
                            :light="!$vuetify.theme.isDark"
                            >
                            ...
                        </v-btn>
                    </template>
                    <v-list v-for="date in quickDateList" dense  :key="date.code">
                        <v-list-item v-if="date.desc != '\-'"  @click="selectQuickDate(date.code)">
                            <v-list-item-content style="padding: 4px;">
                                <v-list-item-title v-text="date.desc"></v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                        <v-divider v-if="date.desc == '\-'" disabled></v-divider>
                    </v-list>
                </v-menu>
                                        
            </v-col>

        </v-row>


    </v-container>
</template>
<script>
export default {
    name: 'Dates-from-to',

    data() {
        return {

        quickDateList: [],
        sDt : '',
        eDt : '',
        hideY: true,

        fromLblTxt: '',
        toLblTxt: '',

        showDateInput: false,
        

        //Data from getdaterange.prg on desktop
        
        // oMenu.addBar('popScreen', 'Week To Date', 'WEEKTODATE')
        // oMenu.addBar('popScreen', 'Month To Date', 'MONTHTODATE')
        // oMenu.addBar('popScreen', 'Year To Date', 'YEARTODATE')
        // oMenu.addBar('popScreen', '\-', '')
        // oMenu.addBar('popScreen', 'Last Week', 'LASTWEEK')
        // oMenu.addBar('popScreen', 'Last Two Weeks', 'LASTTWOWEEKS')
        // oMenu.addBar('popScreen', 'Last Month', 'LASTMONTH')
        // oMenu.addBar('popScreen', 'Last Quarter', 'LASTQUARTER')
        // oMenu.addBar('popScreen', 'Last Year', 'LASTYEAR')
        // oMenu.addBar('popScreen', 'Last Year To Date', 'LASTYEARTODATE')
        // oMenu.addBar('popScreen', '\-', '')
        // oMenu.addBar('popScreen', 'Last Pay Week', 'LASTPAYWEEK')
        // oMenu.addBar('popScreen', '\-', '')
        // oMenu.addBar('popScreen', 'Anytime', 'ANYTIME')
        // oMenu.addBar('popScreen', 'Yesterday', 'YESTERDAY') && SRR 04/07/2022
        // oMenu.addBar('popScreen', 'Today', 'TODAY')

        // IF m.includeFutureStuff
        //     oMenu.addBar('popScreen', '\-', '')
        //     oMenu.addBar('popScreen', 'Next Week', 'NEXTWEEK')
        //     oMenu.addBar('popScreen', 'Next Two Weeks', 'NEXTTWOWEEKS')
        //     oMenu.addBar('popScreen', 'Next Month', 'NEXTMONTH')
        //     oMenu.addBar('popScreen', 'Next Quarter', 'NEXTQUARTER')
        //     oMenu.addBar('popScreen', 'Next Year', 'NEXTYEAR')
        //     oMenu.addBar('popScreen', 'Next Year To Date', 'NEXTYEARTODATE')
        // ENDIF 	
            
        }
    },
    props: [
        // these can be passed in. Default values are false 
        'startDt',
        'endDt',
        'hideDOW',
        'hideYear',
        'hideQuickDates',
        'includePayWeek',
        'includeFutureDates',
        'multiLine',
        'branchesId', // only used if payweek is true
        'fromLbl',
        'toLbl',
        'dateInput', //logical, if true, then show the date input boxes instead of the buttons
        'showCalendar', //logical, if true, then show the calendar icon next to the date input boxes
    ],

    watch: {
        startDt: function(){
            this.sDt = this.Sublib.newDate(this.startDt);
        },
        endDt: function(){
            this.eDt = this.Sublib.newDate(this.endDt);
        }
    }, // watch

    async created(){    
        if (!this.$vuetify || !this.$vuetify.theme || !this.$vuetify.breakpoint){
            this.$vuetify = this.Sublib.oVuetify;
        }

        this.hideY = this.hideYear;
        
        if(this.dateInput || this.$vuetify.breakpoint.mdAndUp){
            this.showDateInput = true; 
        }

        // debugger


        if(this.startDt && this.endDt){
            this.sDt = this.Sublib.newDate(this.startDt);
            this.eDt = this.Sublib.newDate(this.endDt);
        }else{
            var curDate = await this.Sublib.getDate(true);
            this.sDt = curDate;
            this.eDt = curDate;
        }


        //if the year does not equal the current year, then set hideY to false
        var curDate = await this.Sublib.getDate();
        if(this.sDt.getFullYear() != curDate.getFullYear() || this.eDt.getFullYear() != curDate.getFullYear()){
            this.hideY = false;
        }

        if(this.fromLbl){
            this.fromLblTxt = this.fromLbl
        }else{
            this.fromLblTxt = this.Sublib.getLbl('from')
        }

        if(this.toLbl){
            this.toLblTxt = this.toLbl
        }else{
            this.toLblTxt = this.Sublib.getLbl('to')
        }



        // this.sDt = new Date(2023, 0, 1);
        // this.eDt = new Date(2023, 0, 1);

        // 
        // if(!this.branchesId){
        //     this.branchesId = localStorage.getItem('userBranchesId')
        // }

        //populate the quick date list based on the optional props passed in
        this.quickDateList.push({code: 'WEEKTODATE', desc: this.Sublib.getLbl('week to date')})
        this.quickDateList.push({code: 'MONTHTODATE', desc: this.Sublib.getLbl('month to date')})
        this.quickDateList.push({code: 'YEARTODATE', desc: this.Sublib.getLbl('year to date')})
        this.quickDateList.push({code: '1', desc: '\-'})
        this.quickDateList.push({code: 'LASTWEEK', desc: this.Sublib.getLbl('last week')})
        this.quickDateList.push({code: 'LASTTWOWEEKS', desc: this.Sublib.getLbl('last two weeks')})
        this.quickDateList.push({code: 'LASTMONTH', desc: this.Sublib.getLbl('last month')})
        this.quickDateList.push({code: 'LASTQUARTER', desc: this.Sublib.getLbl('last quarter')})
        this.quickDateList.push({code: 'LASTYEAR', desc: this.Sublib.getLbl('last year')})
        this.quickDateList.push({code: 'LASTYEARTODATE', desc: this.Sublib.getLbl('last year to date')})

        if (this.includePayWeek){
            this.quickDateList.push({code: '2', desc: '\-'})
            this.quickDateList.push({code: 'LASTPAYWEEK', desc: this.Sublib.getLbl('last pay week')})
        }
        this.quickDateList.push({code: '3', desc: '\-'})
        this.quickDateList.push({code: 'ANYTIME', desc: this.Sublib.getLbl('anytime')})
        this.quickDateList.push({code: 'YESTERDAY', desc: this.Sublib.getLbl('yesterday')})
        this.quickDateList.push({code: 'TODAY', desc: this.Sublib.getLbl('today')})

        if(this.includeFutureDates){
            this.quickDateList.push({code: '4', desc: '\-'})
            this.quickDateList.push({code: 'NEXTWEEK', desc: this.Sublib.getLbl('next week')})
            this.quickDateList.push({code: 'NEXTTWOWEEKS', desc: this.Sublib.getLbl('next two weeks')})
            this.quickDateList.push({code: 'NEXTMONTH', desc: this.Sublib.getLbl('next month')})
            this.quickDateList.push({code: 'NEXTQUARTER', desc: this.Sublib.getLbl('next quarter')})
            this.quickDateList.push({code: 'NEXTYEAR', desc: this.Sublib.getLbl('next year')})
            this.quickDateList.push({code: 'NEXTYEARTODATE', desc: this.Sublib.getLbl('next year to date')})
        }
    }, 

    computed: {

    }, // computed

    methods: {
        //**************************************************************************************************************
        // Manually clicked start or end date button, NOT the quick list Update the date filter
        async btnFilterDtClicked(mDtName, mNoDatePicker){
            // mDtName = Char. either 'sDt' or 'eDt', can do this.oFilters[mDt] on it
            //mNoDatePicker = logical. If true, then do not show the date picker. They are entering from date-input manually
            
            if(!mNoDatePicker){
                var curDate = await this.Sublib.getDate(true);
    
                var mDt
    
                if(mDtName == 'sDt'){
                    mDt = await this.Sublib.datePicker(!this.Sublib.emptyDt(this.sDt) ? this.sDt : curDate, true);
                }else{
                    mDt = await this.Sublib.datePicker(!this.Sublib.emptyDt(this.eDt) ? this.eDt : curDate, true);
                }
                
                if (!mDt){
                    // pressed cancel. Nothing to do
                    return;
                }
    
                if(mDtName == 'sDt'){
                    this.sDt = mDt;
                }else{
                    this.eDt = mDt;
                }

                //if start date is the same as end date, then do not emit event
                // False. People run reports for 1 day. Need to fire the event. SRR 11/22/2023
                // if(this.Sublib.DTOC(this.sDt) == this.Sublib.DTOC(this.eDt)){
                //     return;
                // }
    
                //if the year does not equal the current year, then set hideY to false
                if(this.sDt.getFullYear() != curDate.getFullYear() || this.eDt.getFullYear() != curDate.getFullYear()){
                    this.hideY = false;
                }else{
                    this.hideY = true;
                }
            }



            this.$emit('dtUpdated', this.sDt, this.eDt);

        }, // btnFilterDtClicked


        //**************************************************************************************************************
        //  Picked from our list of quick options
        async selectQuickDate(quickDate){
            this.hideY = true;

            var curDate = await this.Sublib.getDate(true);

            var oDates = await this.Sublib.getDateRange(quickDate, this.branchesId);
            this.sDt = oDates.startDt;
            this.eDt = oDates.endDt;

            //if the year does not equal the current year, then set hideY to false
            if(this.sDt.getFullYear() != curDate.getFullYear() || this.eDt.getFullYear() != curDate.getFullYear()){
                this.hideY = false;
            }else{
                this.hideY = true;
            }

            this.$emit('dtUpdated', this.sDt, this.eDt);

            return;


            // ******** moved to sublib
        },

        
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
#dates-from-to {
    max-width:275px;
    margin: 0px;
}
.v-list--dense .v-list-item, .v-list-item--dense {
    min-height: 20px;
}

.date-btn{
    max-width:100px;
    min-width:70px;
    padding: 2px 0px 2px 0px;
    max-height: 60px;
}

/* Make it so the date range selector doesn't have a scroll bar */
.v-menu__content { max-height: 600px !important; }

</style>