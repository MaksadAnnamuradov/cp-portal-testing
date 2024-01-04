<template>
    <div class="journalReg"  v-resize="setStickyHeaderWidth" :style="popUpMode ? '' : Sublib.pageCenterStyle(cardWidth)">
        <v-flex>

            <v-card class="journalReg-header" :max-width="cardWidth" :min-width="cardWidth">
                <v-toolbar 
                    dense 
                    :color="Sublib.getColor('header')" 
                    dark 
                    id="journalReg-search" 
                    :height="(oFilters.reconcile ? 180 : 0) + ($vuetify.breakpoint.mdAndDown ? 130 : 60)"
                    :width="cardWidth"
                    >
                    <v-container style="padding-top:4px; margin-top:30px;">
                    </v-container>
                </v-toolbar>

                <!-- Results Grid -->
                <v-card-text id="journalReg-grdBldrs" style="padding: 0px; padding-left: 5px;">
                    <cp-loading v-if="showLoading" linear></cp-loading>
                    <div v-if="showNoResultsMsg && $vuetify.breakpoint.mdAndDown">
                        {{Sublib.getLbl('no results found')}}
                    </div>

                    <div v-if="!$vuetify.breakpoint.mdAndDown && !showLoading">
                        <div>

                            <cp-data-table
                                :headers="getTableHeader"
                                :items="oJournals"
                                itemKey="journalid"
                                name="journalReg"
                                :ref="'dataTable' + 2"
                                :saveGridInfo="false"
                                @contentReady="setFutureLineStyle()"
                                >
                                <!-- NOTE: To shrink line heights, HAVE to get rid of padding on elements we are using. Really annoying -->
                                
                                <!-- Date -->
                                <template v-slot:dt="{ item }">
                                    <cp-date 
                                        :value="item.dt" 
                                        :disabled="item.readOnly" 
                                        @dateChanged="(newDate)=> { item.dt = newDate; fieldChanged('dt', item) }"  
                                        :showCal="true"
                                        style="padding:0;"
                                        >
                                    </cp-date>   
                                </template>

                                <!-- Number / Type -->
                                <template v-slot:refidtype="{ item }">
                                    <v-flex 
                                        :class="{'pointer' : item.readOnly }"
                                        @click="item.readOnly ? Sublib.viewJournalRefType(item): ''" 
                                        @click.right.prevent="item.readOnly ? Sublib.viewJournalRefType(item, true): ''"
                                        >
                                        <!-- Check # -->
                                        <cp-txt
                                            :ref="'extra1_' + item.journalid"
                                            v-if="!item.readOnly"
                                            style="padding:0; font-size:14px; margin:0;"
                                            v-model="item.extra1"
                                            hideDetails
                                            @blur="fieldChanged('extra1', item);"
                                            :disabled="item.readOnly"
                                            tabindex="1"
                                            >
                                        </cp-txt>

                                        <div v-else class="border-bottom-gray text-hyperlinkblue">{{Sublib.trimZeros(item.refid || item.journalid, 5)}}</div> <!-- Show the payment Id, jrnl Id, etc. -->
                                        <div>{{item.refidtype}}</div>
                                    </v-flex>
                                </template>

                                <!-- Customer / Vendor / User -->
                                <template v-slot:whoidunique="{ item }">
                                    <v-row dense style="margin-top: 2px;">
                                        <v-col cols="11" style="padding: 0px; padding-left: 12px;">
                                            <cp-auto
                                                v-model="item.whoidunique"
                                                :search-input.sync="item.searchVal" 
                                                :items="oBldrVends"
                                                desc="name"
                                                code="idunique"
                                                @update:search-input="popAutoFill(item)"
                                                @blur="fieldChanged('whoidunique', item)"
                                                :filterFunc="function(item, filterStr, itemText) {
                                                    return this.Sublib.contains(item.name_np, this.Sublib.killPunctuation(filterStr, true)); // make it a more forgiving search
                                                }"
                                                
                                                style="padding:0"
                                                :disabled="item.readOnly"
                                            >
                                                <template v-slot:selection="{ item }">
                                                    <!-- NOTE: Need the width calc() so if it's too long it doesn't go onto 2 lines -->
                                                    <span class="auto-comp-text-truncate">
                                                        {{item.name}}
                                                    </span>
                                                </template>
                                                <template v-slot:item="{ item }">       
                                                        <v-container style="padding:0">
                                                            <v-row style="padding:0">
                                                                <v-col style="padding:0">
                                                                    {{item.name}}
                                                                </v-col>
                                                                <v-col cols="2" style="padding:0">
                                                                    {{(item.src == 'B' ? Sublib.getLbl('cust') : (item.src == 'V' ? Sublib.getLbl('vend') : (item.src == 'U' ? Sublib.getLbl('user') : Sublib.getLbl('unknown'))))}}
                                                                </v-col>
                                                            </v-row>
                                                        </v-container>     
                                                </template>
                                            </cp-auto>
                                        </v-col>
                                    </v-row>
                                </template>

                                <!-- GL Account -->
                                <template v-slot:glcodesid="{ item }">
                                    <v-row dense style="margin-top: 2px;">
                                      
                                        <v-col v-if="item.oJrnDtlDisp.length == 1 && !item.showItemized" cols="11" style="padding: 0px; padding-left: 6px;">

                                            <cp-gl-codes
                                                :ref="'gl_' + item.journalid"
                                                v-model="item.oJrnDtlDisp[0].glcodesid"
                                                :label="''"
                                                :items="oGLCodes" 
                                                @blur="fieldChanged('glcodesid', item);"
                                                :disabled="item.readOnly"
                                                style="padding:0"
                                                >
                                            </cp-gl-codes>
                                        </v-col>
                                    </v-row>
                                </template>

                                <!-- Notes -->
                                <template v-slot:notes="{item}">
                                    <cp-txt
                                        :ref="'notes_' + item.journalid"
                                        style="padding:0; min-width: 100%;"
                                        v-model="item.notes"
                                        hideDetails
                                        @blur="fieldChanged('notes', item);"
                                        :disabled="item.readOnly"
                                        :dxTextBox="true"
                                        >
                                    </cp-txt>
                                </template>

                                <!-- Deposit -->
                                <template v-slot:deposit="{ item }">
                                    <cp-input-mask 
                                        v-model="item.deposit"
                                        inputMask="##,###,###.##"
                                        style="padding:0; color:green; min-width:125px; max-width:125px;"
                                        :emitBlurEvent="true"
                                        @blur="fieldChanged('deposit', item);"
                                        emptyChar=""
                                        hideDetails
                                        :disabled="item.readOnly"
                                        >
                                    </cp-input-mask>
                                </template>

                                <!-- Withdrawal -->
                                <template v-slot:withdrawal="{ item }">
                                    <!-- NOTE: If you update the v-model, update withdrawalVModel in the data below!! -->
                                    <cp-input-mask 
                                        v-model="item.withdrawal *(isBankGL ? -1 : 1)"
                                        inputMask="##,###,###.##"
                                        style="min-width:125px; max-width:125px; padding:0"
                                        :emitBlurEvent="true"
                                        @blur="fieldChanged('withdrawal', item);"
                                        emptyChar=""
                                        hideDetails
                                        :disabled="item.readOnly"
                                        >
                                    </cp-input-mask>
                                </template>

                            </cp-data-table>   
                        </div> 
                    </div>
                </v-card-text>
            </v-card>
        </v-flex>
    </div>
</template>


<!-------------------------------------------------------------------------------------------------------------------------------------------------->
<script>
import EventBus from './components/Event-Bus.vue';
import JRNDTL from './components/JrnDtl.vue';

export default {
    name: 'journalReg',
    props: [
        'select', // true or false
        'popUpMode', // true or false - if true, then we're in a popup
        'retObj',
        'banksOnlyProp', // true or false - if true, then we're only showing bank GLs
        'oDfltFilters',
    ],

    data: function (){
        return {
            showLoading: false,
            showNoResultsMsg: false,
            txtSearch: '',
            //maxDaysBack: 3, // set once we get the sched

            withdrawalVModel: 'withdrawal *(isBankGL ? -1 : 1)', // 'withdrawal *-1' // putting here so it's easier to update in the future. Does whacky stuff to the JSON object properties. SRR 12/04/2023

            oBanks: [],
            banksOnly: true,

            oJournals: [],
            oJournalsOrig: [],
            oJournalsNew: [],
            oJournalsMaster: [], // so we can do an applyFilter
            oJrnDtl: [],
            oGLCodes: [],
            oBldrVends: [],
            
            disableDel: false,

            showFilters: false, // toggles the 'nav-bar'
            oFilters: { 
                branchesId: '!ALL!', //localStorage.getItem('userBranchesId'),
                bankGL: '',
                amount: 0.00,
                type: '',
                payee: '',
                notes: '',
                showSlideOutOnLoad: false,
                startDt: new Date(1900,0,1),
                endDt: new Date(1900,0,1),
                noStartBal: false,
                orderDir: 'DESC',
                hideZeroBalEntries: false,

                reconcile: false,
                recType: '!ALL!', // 'D' (debit) or 'C' (credit)

            },

            oReconcile: {
                startingBal: 0.00,
                //startBalDt: new Date(1900,0,1),
                endBal: 0.00,
                endBalDt: new Date(1900,0,1),
                clearedDepAmt: 0.00,
                clearedDepCnt: 0,
                clearedWthAmt: 0.00,
                clearedWthCnt: 0,
                statementDt: new Date(1900,0,1),
                statementBal: 0.00,
            },
            oBankRec: {}, // this matches bankRec.dbf
            showSavingBankRec: false,

            oOrderDir: [],
            oRecTypes: [],

            filterHidingData: false,
            
            oBranches: [],
            showNewEntry: false,

            endingBal: 0, 
            futureBal: 0, 


            tableHeight: '400px', //set via setStickyHeaderWidth

            showPrinting: false,

            cardWidth: 0,
            startingBal: 0,

            leaveWhenRecDone: false,
        }
    }, 
    

    //**************************************************************************************************************
    computed: {
        // Couldn't get grid to re-render unless I did this way.
        getTableHeader: function(){
            let isBank = this.isBankGL || this.banksOnly; // do it here so vue picks it up
            let aRetVal = [
                    { text: this.Sublib.getLbl('date'),  value: 'dt', width: '190px', date: true, bold: true, editInPlace: true, },
                    { text: this.Sublib.getLbl('number') + '\n' + this.Sublib.getLbl('type'),  value: 'refidtype', width: '65px', bold: true, editInPlace: true, },
                    { text: this.Sublib.getLbl('payee'),  value: 'whoidunique', width: '300px', bold: true, editInPlace: true, },
                    { text: this.Sublib.getLbl('account'),  value: 'glcodesid', width: '300px', bold: true, editInPlace: true, },
                    { text: this.Sublib.getLbl('notes'),  value: 'notes', width: '300px', bold: true, editInPlace: true},

                    { text: isBank ? this.Sublib.getLbl('deposit') : this.Sublib.getLbl('debit'), align: 'end', value: 'deposit', width: '125px', bold: true, editInPlace: true, },
                    { text: isBank ? this.Sublib.getLbl('withdrawal') : this.Sublib.getLbl('credit'), align: 'end', value: 'withdrawal', width: '125px', bold: true, editInPlace: true, },
                    { text: this.Sublib.getLbl('balance'), align: 'end', value: 'balance', number: true, width: '130px', editInPlace: true,},
                    { text: '',  value: 'cleared', width: '30px', check: true, align: 'center' },
                ]


            if (this.oJournalsNew && this.oJournalsNew[0] && this.showNewEntry){
                aRetVal.deleteFor(obj => obj.value == 'cleared');
            }

            if (this.oJournalsNew && this.oJournalsNew[0] && this.oJournalsNew[0].showItemized){
                aRetVal.replaceFor({width: '600px'}, obj => obj.value == 'glcodesid'); 
                aRetVal.deleteFor(obj => obj.value == 'notes');

            } // showItemized
            

            if (this.oFilters.reconcile){
                aRetVal.deleteFor(obj => obj.value == 'balance');
                //aRetVal.push({ text: this.Sublib.getLbl('cleared'), align: 'center', value: 'cleared', width: '100px', bold: true });
                let oHold = aRetVal.find(obj => obj.value == 'cleared');
                if (oHold){
                    oHold.text = this.Sublib.getLbl('cleared');
                    oHold.width = '100px';
                    oHold.bold = true;
                }
            }

            return aRetVal;
        },

        //**************************************************************************************************************
        isBankGL: function(){
            return this.oBanks.find(obj => obj.glcodesid == this.oFilters.bankGL) && this.oBanks.find(obj => obj.glcodesid == this.oFilters.bankGL).glsubtype == 'BNK';
        },

        //**************************************************************************************************************
        payeeName: function(whoId){
            var vendor = this.oBldrVends.find(obj => obj.whoidunique == whoId)
            if (vendor)
                return vendor.name;
            else
                return '';
        },

    },


    //**************************************************************************************************************
    watch: { 
        txtSearch: function(){
            // NOTE: have to watch txtSearch instead of calling @keychange="applyFilter()" on the text box because it calls the funciton before this.txtSearch value is updated!
            this.applyFilter();
        },
        showFilters: async function(){
            // if we are on the desktop, always show 
            // NOTE: Cobra wanted to hide them (were scared they'd click a filter accidentally so want to hide it)
            // Just store whether they left it open or not so we know how to load next time. SRR 11.14.2019
            if (this.$vuetify.breakpoint.lgAndUp){
                this.oFilters.showSlideOutOnLoad = this.showFilters;
            }

            await this.Sublib.sleep(.2*1000);
            this.setStickyHeaderWidth(); // recalc max width we can show
        },

        // ***************************************
        // Recalc the table height(s) when showing a new entry
        showNewEntry: async function(){
            // if (this.$refs.dataTable2)
            //     this.$refs.dataTable2[0].clearMaxHeight();

            await this.$nextTick();
            await this.$forceUpdate();

            if (this.$refs.dataTable1){
                if (!this.$refs.dataTable1[0]) {
                    while (!this.$refs.dataTable1[0]){
                        await this.Sublib.sleep(.1*1000);
                    }
                } else {
                    //await this.Sublib.sleep(5*1000);
                }

                //this.$refs.dataTable1[0].minHeight = (110 + 20 + (46*(this.oJournalsNew[0].oJrnDtlDisp.length -1))) + 'px'
                this.setNewEntryMinHeight();
                this.$refs.dataTable1[0].calcMaxHeight();
            }

            if (this.$refs.dataTable2)
                this.$refs.dataTable2[0].calcMaxHeight(true);
        }
    },


    //**************************************************************************************************************
    components: {
    },


    //**************************************************************************************************************
    // NOTE: This page was originally written as just a bank register but has since been enhanced to be more a general 'GL' register.
    async created(){
        //this.$router.replace('/');
        EventBus.$emit('updtAppTitleBar', this.Sublib.getLbl('bank register'));

        if (!await this.Sublib.doDefaultCreated()){
            // not signed in, redirect to home screen
            return;
        }


        if (!this.banksOnly)
            EventBus.$emit('updtAppTitleBar', this.Sublib.getLbl('journal register')); // switch from bank to journal


        if (this.$vuetify.breakpoint.lgAndUp){
            this.oFilters.showSlideOutOnLoad = true;
        }

        if (this.oFilters.showSlideOutOnLoad){
            this.showFilters = true;
        }


        this.oOrderDir = [
            { desc: this.Sublib.getLbl('ascending'), code: 'ASC' },
            { desc: this.Sublib.getLbl('descending'), code: 'DESC' },
        ]

        this.showLoading = true;

      
        let oResps = await Promise.all([
            this.getBanks(),
            this.getGLCodes(),
        ]);

        this.oBranches = [
        {
                "branchname": "(All)",
                "branchesid": "!ALL!",
                "dfltbranch": false,
                "dfltsate": "",
                "datadt": "2024-01-04T08:53:20"
            },
            {
                "branchname": "Test 1",
                "branchesid": "0000000006",
                "dfltbranch": false,
                "dfltsate": "",
            },
            {
                "branchname": "Test 2",
                "branchesid": "0000000009",
                "dfltbranch": true,
                "dfltsate": "",
            }
        ]


        this.oRecTypes = [
            { desc: this.Sublib.getLbl('all'), code: '!ALL!' },
            { desc: this.Sublib.getLbl(this.isBankGL ? 'deposits' : 'debits'), code: 'D' },
            { desc: this.Sublib.getLbl(this.isBankGL ? 'withdrawals' : 'credits'), code: 'C' },
        ]

        
        
        var mSetFilterDates = false;
        

        //merge the dflt filters with the saved filters
        if(this.oDfltFilters){
            this.oFilters = {...this.oFilters, ...this.oDfltFilters}
        }

        if (this.Sublib.emptyDt(this.oFilters.startDt)){
            mSetFilterDates = true;

        } else if (this.Sublib.newDate(this.oFilters.endDt).addDays(1) == await this.Sublib.getDate(true)){
            // set to yesterday, update dates by 1
            this.oFilters.endDt = this.Sublib.newDate(this.oFilters.endDt).addDays(1); // might be a string after leaving the page and coming back
            this.oFilters.startDt = this.Sublib.newDate(this.oFilters.startDt).addDays(1)
        }

        if (mSetFilterDates){
            // default to anytime
            this.oFilters.endDt = this.Sublib.newDate().addMonth(12);
            //this.oFilters.startDt = this.oFilters.endDt.addDays(-1 * this.math.round(365/2, 0)); // default to a year, scratch that, 6 months. SRR 09/29/2022
            this.oFilters.startDt = this.Sublib.newDate().addMonth(6 * -1); // 12 months was too much data, struggled on refreshes, etc. Go back 6 months to try to help with this. SRR 12/04/2023
        } else {
            this.oFilters.endDt = this.Sublib.newDate(this.oFilters.endDt); // might be a string after leaving the page and coming back
            this.oFilters.startDt = this.Sublib.newDate(this.oFilters.startDt)
        }


        var popDataOnLoad = this.Sublib.convFromStr(localStorage.getItem('popDataOnLoad'));

        if (this.oFilters.reconcile){
            this.oFilters.bankGL = ''; // make them choose it so we don't create a bank rec for a bank they don't want to do. SRR 12/18/2023
            this.leaveWhenRecDone = true; // called from another page specifically to reconcile, go back to that page when done. SRR 12/12/2023
            await this.btnReconcileClicked(true); // calls popgrid

        } else if(true || popDataOnLoad){
            await this.popGrid()
        }

        this.showLoading = false;
     

    }, // created


    //**************************************************************************************************************
    async mounted(){       
        this.setStickyHeaderWidth();

        this.scroller = this.$refs.journalRegRecycleScroller;


      
    }, // mounted


    //**************************************************************************************************************
    beforeRouteLeave (to, from, next) {
        // called when the route that renders this component is about to
        // be navigated away from.
        // has access to `this` component instance.
        // see https://router.vuejs.org/guide/advanced/navigation-guards.html
        
        //localStorage.setItem('journalRegFilters', JSON.stringify(this.oFilters));
        next(); // must call or will get stuck on this page!
    },

    //**************************************************************************************************************
    methods: {

        //**************************************************************************************************************
        // Get the combo box options from the web service
        async getBanks(){
            
        
            var oData = [
                {
                    "glcodesid": "0000001525",
                    "glcode": "10000",
                    "descript": "Cash",
                    "taxgl": false,
                    "active": true,
                    "required": false,
                    "parentgl": "0000001513",
                    "gltype": "A",
                    "glsubtype": "BNK",
                    "notes": "Imported from QB on 14 Nov 2023 11:34:48 AM\rQB Descript:",
                    "oldid": "80000063-1486740440",
                    "glcode_orderby": 10000,
                    "datadt": "2024-01-04T08:59:22"
                },
                {
                    "glcodesid": "0000001526",
                    "glcode": "10005",
                    "descript": "Bank of the West 1940 General",
                    "taxgl": false,
                    "active": true,
                    "required": false,
                    "parentgl": "0000001525",
                    "gltype": "A",
                    "glsubtype": "BNK",
                    "notes": "Imported from QB on 14 Nov 2023 11:34:48 AM\rQB Descript:",
                    "oldid": "800000F5-1490975582",
                    "glcode_orderby": 10005
                },
                {
                    "glcodesid": "0000001527",
                    "glcode": "10006",
                    "descript": "BMO MONEY MKT 7820 SAVINGS",
                    "taxgl": false,
                    "active": true,
                    "required": false,
                    "parentgl": "0000001525",
                    "gltype": "A",
                    "glsubtype": "BNK",
                    "notes": "Imported from QB on 14 Nov 2023 11:34:48 AM\rQB Descript: BMO-MONEY MARKET",
                    "oldid": "800001E5-1698334782",
                    "glcode_orderby": 10006
                },
            ]
          

            this.oBanks = oData;
            if (!this.oFilters.bankGL)
                this.oFilters.bankGL = this.oBanks[0].glcodesid;
            
        }, // getBanks


        //**************************************************************************************************************
        // Get the list of GL Codes
        async getGLCodes(){
           
            var oData = [
                {
                    "glcodesid": "0000001602",
                    "glcode": "",
                    "descript": "30030-CHASE BANK- VISA",
                    "taxgl": false,
                    "active": true,
                    "required": false,
                    "parentgl": "0000001601",
                    "gltype": "L",
                    "glsubtype": "CUR",
                    "notes": "Imported from QB on 14 Nov 2023 11:34:48 AM\rQB Descript:",
                    "oldid": "800001C9-1674061438",
                    "glcode_orderby": -1,
                    "datadt": "2024-01-04T09:01:09"
                },
                {
                    "glcodesid": "0000001673",
                    "glcode": "",
                    "descript": "41071-Ally Loan Payable- 4906",
                    "taxgl": false,
                    "active": true,
                    "required": false,
                    "parentgl": "0000001672",
                    "gltype": "L",
                    "glsubtype": "LNG",
                    "notes": "Imported from QB on 14 Nov 2023 11:34:48 AM\rQB Descript:",
                    "oldid": "800001C2-1654538187",
                    "glcode_orderby": -1
                },
                {
                    "glcodesid": "0000001674",
                    "glcode": "",
                    "descript": "41075-MT. AMERICA CREDIT-5044",
                    "taxgl": false,
                    "active": true,
                    "required": false,
                    "parentgl": "0000001672",
                    "gltype": "L",
                    "glsubtype": "LNG",
                    "notes": "Imported from QB on 14 Nov 2023 11:34:48 AM\rQB Descript: 2023 RAM 1500- VIN 1C6SRFU93P",
                    "oldid": "800001D6-1683753039",
                    "glcode_orderby": -1
                },
                {
                    "glcodesid": "0000001675",
                    "glcode": "",
                    "descript": "41085-CAT FINANCIAL-2221",
                    "taxgl": false,
                    "active": true,
                    "required": false,
                    "parentgl": "0000001672",
                    "gltype": "L",
                    "glsubtype": "LNG",
                    "notes": "Imported from QB on 14 Nov 2023 11:34:48 AM\rQB Descript: 2022 CATERPILLAR 246D3 SKID S",
                    "oldid": "800001C4-1654887395",
                    "glcode_orderby": -1
                },
                {
                    "glcodesid": "0000001676",
                    "glcode": "",
                    "descript": "41090-Stellantis Loan- 5641",
                    "taxgl": false,
                    "active": true,
                    "required": false,
                    "parentgl": "0000001672",
                    "gltype": "L",
                    "glsubtype": "LNG",
                    "notes": "Imported from QB on 14 Nov 2023 11:34:48 AM\rQB Descript: 2018 DODGE RAM CHASSIS\rVIN-3",
                    "oldid": "800001C5-1657291043",
                    "glcode_orderby": -1
                },
            ]

            this.oGLCodes = oData;
        }, // getGLCodes


        //**************************************************************************************************************
        // Get the list of invoices for the given parameters
        async popGrid(){


            var oData = [
                {
                    "journalid": "0000400572",
                    "dt": "2024-12-05T00:00:00Z",
                    "amount": 235,
                    "refidtype": "BKR",
                    "refid": "0000000003",
                    "notes": "",
                    "createdby": "0000000190",
                    "createdt": "2024-01-03T08:55:01Z",
                    "lasteditby": "0000000190",
                    "lasteditdt": "2024-01-03T11:49:51Z",
                    "branchesid": "0000000003",
                    "trantype": "E",
                    "trantypeid": "",
                    "whoid": "0000000484",
                    "whoidtype": "U",
                    "extra1": "sdfsdf",
                    "reversed": false,
                    "branchname": "Jcord LLC",
                    "createdby_name": "Tamra Cuno",
                    "whoname": "Abarr Nicholas",
                    "whonameid": "0000000484",
                    "whoidunique": "U0000000484",
                    "whonamesrc": "U",
                    "bldrjrnid": "",
                    "bldrjrnname": "",
                    "bldrinvid": "",
                    "bldrinvname": "",
                    "bldrpmtid": "",
                    "bldrpmtname": "",
                    "bldrsurwid": "",
                    "bldrsurwname": "",
                    "bldrsurrid": "",
                    "bldrsurrname": "",
                    "vendjrnid": "",
                    "vendjrnname": "",
                    "vendinv_id": "",
                    "vendinv_name": "",
                    "vendexpid": "",
                    "vendexpname": "",
                    "userjrnid": "0000000484",
                    "userjrnname": "Abarr Nicholas",
                    "userexpid": "",
                    "userexpname": "",
                    "datadt": "2024-01-04T08:56:10"
                },
                {
                    "journalid": "0000400567",
                    "dt": "2023-12-18T00:00:00Z",
                    "amount": 659512.10,
                    "refidtype": "JRN",
                    "refid": "",
                    "notes": "Bank Rec Discrepancy Adjustment",
                    "createdby": "0000000190",
                    "createdt": "2023-12-18T10:57:06Z",
                    "lasteditby": "",
                    "lasteditdt": "1900-01-01T00:00:00Z",
                    "branchesid": "0000000003",
                    "trantype": "E",
                    "trantypeid": "",
                    "whoid": "",
                    "whoidtype": "",
                    "extra1": "",
                    "reversed": false,
                    "branchname": "Jcord LLC",
                    "createdby_name": "Tamra Cuno",
                    "whoname": "",
                    "whonameid": "",
                    "whoidunique": "",
                    "whonamesrc": "",
                    "bldrjrnid": "",
                    "bldrjrnname": "",
                    "bldrinvid": "",
                    "bldrinvname": "",
                    "bldrpmtid": "",
                    "bldrpmtname": "",
                    "bldrsurwid": "",
                    "bldrsurwname": "",
                    "bldrsurrid": "",
                    "bldrsurrname": "",
                    "vendjrnid": "",
                    "vendjrnname": "",
                    "vendinv_id": "",
                    "vendinv_name": "",
                    "vendexpid": "",
                    "vendexpname": "",
                    "userjrnid": "",
                    "userjrnname": "",
                    "userexpid": "",
                    "userexpname": ""
                },
                {
                    "journalid": "0000400566",
                    "dt": "2023-12-14T00:00:00Z",
                    "amount": 49684.40,
                    "refidtype": "JRN",
                    "refid": "",
                    "notes": "Bank Rec Discrepancy Adjustment",
                    "createdby": "0000000190",
                    "createdt": "2023-12-18T08:44:32Z",
                    "lasteditby": "",
                    "lasteditdt": "1900-01-01T00:00:00Z",
                    "branchesid": "0000000003",
                    "trantype": "E",
                    "trantypeid": "",
                    "whoid": "",
                    "whoidtype": "",
                    "extra1": "",
                    "reversed": false,
                    "branchname": "Jcord LLC",
                    "createdby_name": "Tamra Cuno",
                    "whoname": "",
                    "whonameid": "",
                    "whoidunique": "",
                    "whonamesrc": "",
                    "bldrjrnid": "",
                    "bldrjrnname": "",
                    "bldrinvid": "",
                    "bldrinvname": "",
                    "bldrpmtid": "",
                    "bldrpmtname": "",
                    "bldrsurwid": "",
                    "bldrsurwname": "",
                    "bldrsurrid": "",
                    "bldrsurrname": "",
                    "vendjrnid": "",
                    "vendjrnname": "",
                    "vendinv_id": "",
                    "vendinv_name": "",
                    "vendexpid": "",
                    "vendexpname": "",
                    "userjrnid": "",
                    "userjrnname": "",
                    "userexpid": "",
                    "userexpname": ""
                }
            ]

            this.showNoResultsMsg = false;

            // add some properties to make them re-active
            oData = oData.addProps({ showLoading: false, searchVal: '', deposit: 0, withdrawal: 0, readOnly: false, showItemized: false, cleared: false, } );

            let oData2 = [
                {
                    "jrndtlid": "0003908461",
                    "journalid": "0000400567",
                    "glcodesid": "0000001525",
                    "debit": 659512.10,
                    "credit": 0,
                    "notes": "",
                    "bankrecid": "0000000002",
                    "glcode": "10000",
                    "gldescript": "Cash"
                },
                {
                    "jrndtlid": "0003908471",
                    "journalid": "0000400572",
                    "glcodesid": "0000001525",
                    "debit": 0,
                    "credit": 235,
                    "notes": "",
                    "bankrecid": "",
                    "glcode": "10000",
                    "gldescript": "Cash"
                },
                {
                    "jrndtlid": "0003908462",
                    "journalid": "0000400567",
                    "glcodesid": "0000001967",
                    "debit": 0,
                    "credit": 659512.10,
                    "notes": "",
                    "bankrecid": "",
                    "glcode": "",
                    "gldescript": "Bank Rec Discrepancies"
                },
                {
                    "jrndtlid": "0003908472",
                    "journalid": "0000400572",
                    "glcodesid": "0000001968",
                    "debit": 235,
                    "credit": 0,
                    "notes": "",
                    "bankrecid": "",
                    "glcode": "",
                    "gldescript": "Inventory"
                },
                {
                    "jrndtlid": "0003908460",
                    "journalid": "0000400566",
                    "glcodesid": "0000001967",
                    "debit": 49684.40,
                    "credit": 0,
                    "notes": "",
                    "bankrecid": "",
                    "glcode": "",
                    "gldescript": "Bank Rec Discrepancies"
                },
                {
                    "jrndtlid": "0003908459",
                    "journalid": "0000400566",
                    "glcodesid": "0000001525",
                    "debit": 0,
                    "credit": 49684.40,
                    "notes": "",
                    "bankrecid": "0000000001",
                    "glcode": "10000",
                    "gldescript": "Cash"
                }
            ]


            let oBankRec, oRepeated;
            for (var mx = 0; mx < oData.length; mx++){
                if (oData[mx].repeat){
                    // already did this one
                    continue;
                }



                oData[mx].oJrnDtl = oData2.filter(obj => obj.journalid == oData[mx].journalid);
                oData[mx].cleared = (oData[mx].oJrnDtl.find(obj => obj.glcodesid == this.oFilters.bankGL && obj.bankrecid != '') ? true : false);

                oRepeated = oData[mx].oJrnDtl.filter(obj => obj.glcodesid == this.oFilters.bankGL);
                if (oRepeated.length > 1){
                    // should only really hit this if we are looking at Revenue or Expense GL that we imported and we have multiple
                    // jrnDtl records for the same GL code but 1 journal record. SRR 11/15/2023

                    for (var my = 1; my < oRepeated.length; my++){                    
                        let oDataCopy = JSON.parse(JSON.stringify(oData[mx])); 

                        // make the journalId unique so .find(), etc. can find the right record
                        oDataCopy.journalid = oDataCopy.journalid + '_' + my;

                        oDataCopy.oJrnDtl.deleteFor(obj => obj.jrndtlid != oRepeated[my].jrndtlid); // only keep the one we want                        
                        
                        // this is purely so it's easier to display in the HTML
                        oBankRec = oDataCopy.oJrnDtl.find(obj => obj.glcodesid == this.oFilters.bankGL);
                        if (oBankRec.debit){
                            oDataCopy.deposit = oBankRec.debit
                        } else {
                            oDataCopy.withdrawal = oBankRec.credit;
                        }

                        oDataCopy.oJrnDtlDisp = oDataCopy.oJrnDtl.filter(obj => obj.glcodesid != this.oFilters.bankGL);

                        oDataCopy.repeat = true; // set so we know to loop on in

                        oDataCopy.readOnly = oDataCopy.refidtype != 'BKR' // BanK Register
                        oData.splice(mx+1, 0, oDataCopy); // insert a new record

                        // delete the repeated record from the original
                        oData[mx].oJrnDtl.deleteFor(obj => obj.jrndtlid == oRepeated[my].jrndtlid);
                    } // for (my
                }

                oData[mx].oJrnDtlDisp = oData[mx].oJrnDtl.filter(obj => obj.glcodesid != this.oFilters.bankGL);

                // this is purely so it's easier to display in the HTML
                oBankRec = oData[mx].oJrnDtl.find(obj => obj.glcodesid == this.oFilters.bankGL);
                if (oBankRec.debit){
                    oData[mx].deposit = oBankRec.debit
                } else {
                    oData[mx].withdrawal = oBankRec.credit;
                }

                oData[mx].readOnly = oData[mx].refidtype != 'BKR' // BanK Register
            }
            // console.log('oData', oData);



            // if we don't have an ID for a customer or vendor, assume it was deleted / reversed and we don't need to show it here
            //oData.deleteFor(obj => (!obj.whonameid && !this.Sublib.inList(obj.refidtype, 'JRN', 'BKR', 'DEP', 'STB', 'CLS'))  || obj.trantype == 'R' || obj.reversed); 
            oData.deleteFor(obj => obj.trantype == 'R' || obj.reversed); 


            this.oJournals = oData;
            this.oJournalsMaster = oData;
            this.oJournalsOrig = this.oJournals.breakRef();

            
            // Update our list of builders / vendors for the display
            let oHold;
            for (var mx = 0; mx < this.oJournals.length; mx++){
                this.oBldrVends.push({ id: this.oJournals[mx].whonameid, name: this.oJournals[mx].whoname, src: this.oJournals[mx].whonamesrc, idunique: this.oJournals[mx].whoidunique });
            } // for

            // make sure we don't have dups and the order is right
            this.oBldrVends = sqlExec(`select distinct * 
                                    from ?
                                    where id != ''
                                    order by upper(name)`, [this.oBldrVends]);

            for (var mx = 0; mx < this.oBldrVends.length; mx++){
                if (!this.oBldrVends[mx].name_np)
                    this.oBldrVends[mx].name_np = this.Sublib.killPunctuation(this.oBldrVends[mx].name, true);
            } // for



            await this.getStartingBal(); 


            this.showLoading = false;
            this.Sublib.showMsg();

            this.applyFilter();

        }, // popGrid


        //**************************************************************************************************************
        // get my bank account balance before this date range so I can show the bank balance correctly
        async getStartingBal(){
            
            var oData = [
                {
                    "glcodesid": "0000001525",
                    "debits": 0,
                    "credits": 336545,
                    "bal": -336545,
                    "asofdt": "2023-07-03T00:00:00Z",
                    "startdt": "1900-01-01T00:00:00Z",
                    "enddt": "1900-01-01T00:00:00Z",
                    "gltype": "A",
                    "glsubtype": "BNK",
                    "datadt": "2024-01-04T09:06:29"
                }
            ]

            this.startingBal = oData[0].bal;

        }, // getStartingBal


        //**************************************************************************************************************
        // Set the new entry data table min height
        setNewEntryMinHeight(){
            if (this.$refs.dataTable1 && this.$refs.dataTable1[0])
                this.$refs.dataTable1[0].minHeight = (110 + 20 + (46*(this.oJournalsNew[0].oJrnDtlDisp.length -1))) + 'px';

            if (this.$refs.dataTable2 && this.$refs.dataTable2[0])
                this.$refs.dataTable2[0].calcMaxHeight(true)

        }, // setNewEntryMinHeight


        //**************************************************************************************************************
        setStickyHeaderWidth(){
            // NOTE: The 'sticky' header MUST have a width (ignores elements previous width once you make it 'fixed')
            // Manipulate the css tag
            this.cardWidth = this.Sublib.getPopupWidth(2.4, false, true);

      
        }, // setStickyHeaderWidth


        //**************************************************************************************************************
        applyFilter(){  
            
            //var oFilters = this.oFilters; // lose the reference in the filter
            var _this = this; // we lose reference to this in the filter
            
            //let startPerf = performance.now();

            if (this.oJournalsMaster.length){

                let filterType = _this.Sublib.killPunctuation(_this.oFilters.type, true);
                let filterAmount = _this.oFilters.amount.toFixed(2);
                let filterPayee = _this.Sublib.killPunctuation(_this.oFilters.payee, true);
                let filterNotes = _this.Sublib.killPunctuation(_this.oFilters.notes, true)

                

                this.oJournals = this.oJournalsMaster.filter(function(obj) {                    
                    return (
                            (filterType ? _this.Sublib.contains(_this.Sublib.killPunctuation(_this.Sublib.formatJournalRefType(obj), true), filterType) : true)
                            && (_this.oFilters.amount ? _this.Sublib.contains(obj.amount.toFixed(2), filterAmount) : true)
                            && (_this.oFilters.payee ? _this.Sublib.contains(_this.Sublib.killPunctuation(obj.whoname, true), filterPayee) : true)
                            && (_this.oFilters.notes ? _this.Sublib.contains(_this.Sublib.killPunctuation(obj.notes, true), filterNotes) : true)
                            && (_this.oFilters.hideZeroBalEntries ? obj.deposit != 0 || obj.withdrawal != 0 : true)
                            && (_this.oFilters.recType == '!ALL!' ? true : _this.oFilters.recType == 'D' ? obj.deposit != 0 : obj.withdrawal != 0)
                    )
                });

                if (this.oJournals.length != this.oJournalsMaster.length){
                    this.filterHidingData = true;
                } else {
                    this.filterHidingData = false;
                }
            }

           
            // Now figure out my 'balance'
            if (this.oJournals.length != this.oJournalsMaster.length){
                // filtered, don't change balancess, etc. SRR 09/06/2023
                return;
            }

            this.calcBal();

            // put our 'new' record at the top
            //this.oJournals.unshift(this.oJournals.blankrec);


            
                this.resetNewEntry();


//             let oHold = this.oJournals.appendBlank();
            
//             oHold = JSON.parse(JSON.stringify(oHold));
//             oHold.dt = this.Sublib.newDate();

//             this.oJournals.splice(this.oJournals.length - 1, 1);

//             //this.oJournals.unshift(oHold);
//             this.oJournalsNew = [];

//             let oHold2;
//             if (oHold.oJrnDtlDisp[0]){
//                 oHold2 = JSON.parse(JSON.stringify(oHold.oJrnDtlDisp[0])); // it's technically an object, so force it back to an array
//             } else {
//                 // Ryan hit this in testing where the GL account for both the debit and credit was the bank account
//                 oHold2 = JSON.parse(JSON.stringify(oHold.oJrnDtl[0])); // it's technically an object, so force it back to an array
//             }
//             oHold.readOnly = false;
//             oHold.showLoading = false;
//             oHold.refidtype = 'BKR' // Bank Register
//             oHold.oJrnDtlDisp = [];
//             oHold.oJrnDtlDisp.push(oHold2);
//             oHold.oJrnDtl = [];
//             oHold.oJrnDtl.push(oHold2);
// //            aHold[0].oJrnDtl.push(oHold2);
            
//             this.oJournalsNew.push(oHold);

            //let endPerf = performance.now();

            //console.log('applyFilter took ' + (endPerf - startPerf) + ' milliseconds to complete (' + this.oJournals.length + ' records)');


        }, // applyFilter



        //**************************************************************************************************************
        // If the come into this screen it loads blank. If the first thing they do is type a customer or job name (really a filter)
        // Try to be nice and do a popgrid first and then apply filter
        // If the grid already has recs, just do a regular apply filter...
        applyFilter2(){
            if (true || this.oJournalsMaster.length > 0){
                this.applyFilter();
            } else {
                this.popGrid(); // does apply filter at the end
            }
        }, // applyFilter2



        // **************************************************************************************************************
        // Populate the structure for a 'new' record. SRR 12/05/2023
        resetNewEntry(){
            // put our 'new' record at the top
            //this.oJournals.unshift(this.oJournals.blankrec);
            if (this.oJournals.length > 0){
                let oHold = this.oJournals.appendBlank();
                oHold = JSON.parse(JSON.stringify(oHold));
                oHold.dt = this.Sublib.newDate();

                this.oJournals.splice(this.oJournals.length - 1, 1);

                //this.oJournals.unshift(oHold);
                this.oJournalsNew = [];

                let oHold2;
                if (oHold.oJrnDtlDisp[0]){
                    oHold2 = JSON.parse(JSON.stringify(oHold.oJrnDtlDisp[0])); // it's technically an object, so force it back to an array
                } else {
                    // Ryan hit this in testing where the GL account for both the debit and credit was the bank account
                    oHold2 = JSON.parse(JSON.stringify(oHold.oJrnDtl[0])); // it's technically an object, so force it back to an array
                }
                oHold.readOnly = false;
                oHold.showLoading = false;
                oHold.refidtype = 'BKR' // Bank Register
                oHold.oJrnDtlDisp = [];
                oHold.oJrnDtlDisp.push(oHold2);
                oHold.oJrnDtl = [];
                oHold.oJrnDtl.push(oHold2);
    //            aHold[0].oJrnDtl.push(oHold2);
                
                this.oJournalsNew.push(oHold);
            } else {
                // nothing to copy, make it up. This works until we add new fields and forget to update this... SRR 12/05/2023
                // create a dummy record so we can add a new one if they have 0 history to use for the structure. SRR 12/04/2023
                this.oJournalsNew = [{ 
                    journalid: this.Sublib.getAddId(),
                    dt: this.Sublib.newDate(),
                    refidtype: 'BKR',
                    notes: '',
                    amount: 0.00,
                    deposit: 0.00,
                    withdrawal: 0.00,
                    balance: 0.00,
                    oJrnDtlDisp: [{
                        jrndtlid: this.Sublib.getAddId(), 
                        glcodesid: '', 
                        amount: 0, 
                        debit: 0.00, 
                        credit: 0.00, 
                        deposit: 0.00,
                        withdrawal: 0.00,
                        notes: ''
                    }],
                    oJrnDtl: [{
                        jrndtlid: this.Sublib.getAddId(), 
                        glcodesid: this.oFilters.bankGL, 
                        amount: 0, 
                        debit: 0.00, 
                        credit: 0.00, 
                        deposit: 0.00,
                        withdrawal: 0.00,
                        notes: ''
                    }],
                    showItemized: false,
                    showLoading: false,
                    showPayeeLoading: false,
                    showGLLoading: false,
                    readOnly: false,
                    repeat: false,
                }];
            }
        }, // resetNewEntry



        //**************************************************************************************************************
        // Populate auto fill drop down as they type
        async popAutoFill(oEntry){

            if (!oEntry.searchVal || oEntry.searchVal.length < 2) return;


            var mURL = this.Sublib.getWSUrl() + 'cpCust/getCustAndMore';
            var oParams = {
                name: oEntry.searchVal,
                branchesId: this.oFilters.branchesId,
            }

            var resp = await this.RestClient.getNoCache(mURL, oParams);
            let oData = this.Sublib.wsResp2Obj(resp);
            if (oData.errorMsg){
                if (this.Sublib.contains(oData.errorMsg, 'no data', true)){

                } else {
                    this.Sublib.mbox(oData.errorMsg);
                }
                return;
            }

            // Keep a list of builders we have previously gotten;
            if (this.oBldrVends.length == 0){
                this.oBldrVends = oData;
            } else {
                this.oBldrVends.appendFrom(oData);
            }

            // make sure we don't have dups and the order is right
            this.oBldrVends = sqlExec(`select distinct * 
                                    from ?
                                    where id != ''
                                    order by upper(name)`, [this.oBldrVends]);


            for (var mx = 0; mx < this.oBldrVends.length; mx++) {
                if (!this.oBldrVends[mx].name_np)
                    this.oBldrVends[mx].name_np = this.Sublib.killPunctuation(this.oBldrVends[mx].name, true);
            } // for



        }, // popAutoFill


        //**************************************************************************************************************
        // Calculate the running balance field
        calcBal(){
            // Remember, these are in reverse order by date, switch the order so our scan is oldest to newest
            let bal = 0 || (this.oFilters.noStartBal ? 0 : this.startingBal);
            //let oHold = this.oJournals.breakRef();

            let reverseOrder = this.oFilters.orderDir != 'DESC' ? true : false;
            
            if (reverseOrder)
                this.oJournals.reverse();
            
            

            let today = this.Sublib.newDate();
            let oGL = this.oBanks.find(obj => obj.glcodesid == this.oFilters.bankGL);

            // when there are 1000s of recs, just want a logical to evaluate instead of calling inList 1000s of times. SRR 12/02/2023
            let assetAcct = (oGL.gltype == 'A' || this.Sublib.inList(oGL.glsubtype, 'EXP', 'CRV'));

            for (var mx = this.oJournals.length-1; mx >= 0; mx--){ // revese order is our default
                if (assetAcct){
                    // Asset or Expense or Contra-Revenue Account
                    if (this.oJournals[mx].deposit){
                        bal = this.math.round(bal + this.oJournals[mx].deposit, 2)
                    } else {
                        bal = this.math.round(bal - this.oJournals[mx].withdrawal, 2)
                    }
                } else {
                    // Liability or Equity or Revenue Account
                    if (this.oJournals[mx].deposit){
                        bal = this.math.round(bal - this.oJournals[mx].deposit, 2)
                    } else {
                        bal = this.math.round(bal + this.oJournals[mx].withdrawal, 2)
                    }
                }

                //this.oJournals.find(obj => obj.journalid == oHold[mx].journalid).balance = bal;
                this.oJournals[mx].balance = bal;

                if (this.Sublib.daysBetween(today, this.oJournals[mx].dt) > 0){
                    // future
                    this.futureBal = bal;
                } else {
                    // current bank balance
                    this.endingBal = bal;
                    this.futureBal = bal;
                }
            } // for

            if (reverseOrder)
                this.oJournals.reverse(); // set it back

            this.setFutureLineStyle(); 

            this.$nextTick();
            this.$forceUpdate();
            

        }, // calcBal


        //**************************************************************************************************************
        // Add our class to make it so future transsactions are seperated by a line so it's easy to tell today versus future
        // NOTE: Can't style individual rows with Vuetify so have to do it this way. SRR 09/05/2023
        async setFutureLineStyle(){
            
            let lineClassDesc = 'journalReg-futureDateSeperatorDesc'; // class defined below
            let lineClassAsc = 'journalReg-futureDateSeperatorAsc'; // class defined below
            let lineClass;

            // first, remove the class if we previously put it on a  record
            let oElements = document.querySelectorAll('.' + lineClassDesc);
            oElements.forEach(obj => {
                obj.classList.remove(lineClassDesc);
            });
            oElements = document.querySelectorAll('.' + lineClassAsc);
            oElements.forEach(obj => {
                obj.classList.remove(lineClassAsc);
            });


            if (this.oJournals.length == 0)
                return;

            while (Object.keys(this.$refs).length < 3){ // first 2 refs are the glCBO and the grid control itself
                // wait for the refs to be populated (really just tells me the grid is painted)
                await this.Sublib.sleep(.1*1000);
            }

            // Now get the element we want to style
            var today = this.Sublib.newDate();
            //let oFutures = this.oJournals.filter(obj => this.Sublib.daysBetween(today, obj.dt) > 1);

            //let oFutures = this.oJournals.filter(obj => this.Sublib.newDate(obj.dt) > today).orderBy('dt', 'asc')[0];
            let mSQL = `select top 1 *
                            from ?
                            where newDate(dt) > ?
                            order by serializeDt(dt), journalid asc`;
            let oFutures = sqlExec(mSQL, [this.oJournals, today]); 


            if (!oFutures || oFutures.length == 0)
                return; // no future records

            if (this.oFilters.orderDir == 'ASC'){
                // our line class sets a border bottom. We want a border top if we are ascending instead of descending. SRR 11/28/2023
                lineClass = 'journalReg-futureDateSeperatorAsc'; 
            } else {
                lineClass = 'journalReg-futureDateSeperatorDesc';
            }
                

            
            // Find the parent of the reference object
            //let oHold = this.$refs['notes_' + oFutures[0].journalid]; // may not have the GL reference if it's 'split' between multiple accounts
            // Notes sometimes disappears too. Not sure why yet.. SRR 12/05/2023
            let oHold = this.$refs['extra1_' + oFutures[0].journalid]; // may not have the GL reference if it's 'split' between multiple accounts
            if (!oHold || !oHold[0] || !oHold[0].$el)
                return;

            if (!oHold[0])
                debugger

            oHold = oHold[0].$el;


            while (true){
                if (oHold.tagName == 'TR')
                    break;

                if (!oHold.parentElement){
                    oHold = null;
                    break;
                }

                oHold = oHold.parentElement;
            } // while

            if (!oHold)
                return;


            oHold.classList.add(lineClass);


        }, // setFutureLineStyle


        //**************************************************************************************************************
        async fieldChanged(field, oJournal){

            if (oJournal.readOnly) 
                return;

            field = field.toLowerCase();
            if (field == 'withdrawal'){             
                if (typeof oJournal[this.withdrawalVModel] == 'number'){ // oJournal['withdrawal *-1']
                    oJournal.withdrawal = Math.abs(oJournal[this.withdrawalVModel]); // because our v-model being withdrawal *-1 it can show up funny here
                    delete oJournal[this.withdrawalVModel];
                }
            }
 
            if (oJournal.showItemized && field == 'itemamount'){

                // typing in the grid for an itemized gl breakdown
                // control source is always the debit since we just show 1 field. Assume the itemization is to pay a bill... I guess?
                 if (!oJournal.journalid || this.Sublib.contains(oJournal.journalid, '!ADD!', true)){     
                    if (oJournal.deposit){
                        // They already explicity moved it to deposit, stick with that.
                        oJournal.deposit = oJournal.oJrnDtlDisp.calcSum(obj => obj.amount);
                    } else {
                        oJournal.withdrawal = oJournal.oJrnDtlDisp.calcSum(obj => obj.amount);
                    }
                    await this.Sublib.sleep(.1*1000); // every once in a while it doesn't update and I can't figure out why but the code seems to be fiiring. Try to force Vue to update it
                }
                await this.$nextTick();
                await this.$forceUpdate();
            }


            // see if it actually changed or if they are just tabbing through fields. 
            let oOrig = this.oJournalsOrig.find(obj => obj.journalid == oJournal.journalid);

            if (oOrig){            
                if (oOrig[field] == oJournal[field]) {
                        return;
                }                    
            }

            if (this.Sublib.inList(field, 'deposit', 'withdrawal', true)){
                // If they are typing in 'deposit', blank out withdrawal if it's there and vice versa
                let swapDC = false;
                if (field == 'deposit' && oJournal[field]){
                    if (oJournal.withdrawal){
                        swapDC = true;
                    }
                    oJournal.withdrawal = 0;
                }

                if (field == 'withdrawal' && oJournal[field]){
                    if (oJournal.deposit){
                        swapDC = true;
                    }
                    oJournal.deposit = 0;
                }


                oJournal.amount = 0; // will pull from deposit || withdrawal

                if (oJournal.showItemized || (oJournal.oJrnDtlDisp.length > 1 && swapDC)){
                    // see if I need to 'swap' debits and credits
                    oJournal.oJrnDtl.replaceFor({debit: '$$credit', credit: '$$debit' }, true); // swap
                    oJournal.oJrnDtlDisp.replaceFor({debit: '$$credit', credit: '$$debit' }, true); // swap

                } else {
                    oJournal.oJrnDtl.replaceFor({debit: 0, credit: 0}, true); // reset
                    oJournal.oJrnDtlDisp.replaceFor({debit: 0, credit: 0}, true); // reset
                }
                
            }


            if (field == 'whoidunique' 
                && oJournal.whoidunique
                && (!oJournal.journalid || this.Sublib.contains(oJournal.journalid, '!ADD!', true)) 
                && oJournal.oJrnDtlDisp.length == 1 
                && !oJournal.oJrnDtlDisp[0].glcodesid){
                // try to auto fill in the account for them if we can. SRR 12/05/2023

                let oJrnDtls = [], aHold;
                for (var mx = 0; mx < this.oJournals.length; mx++){
                    if (this.oJournals[mx].whoidunique != oJournal.whoidunique) 
                        continue;

                    aHold = this.oJournals[mx].oJrnDtlDisp.addProps({dt: this.Sublib.newDate(this.oJournals[mx].dt)});

                    oJrnDtls.appendFrom(aHold);
                }

                // alasql min()/max() only works on numbers... see: https://github.com/AlaSQL/alasql/issues/411 
                // convert the datetime to a number
                // let sql = `select jrnDtl.glcodesid, max(newDate(journal.dt)) as lastUsed, count(*) as cnt
                //             from ? as jrnDtl
                //                 inner join ? as journal on jrnDtl.journalid = journal.journalid
                //             group by glcodesid
                //             order by dt desc
                //             `

                let sql = `select jrnDtl.glcodesid, max(newDate(jrnDtl.dt).getTime()) as lastused, count(*) as cnt
                            from ? as jrnDtl
                            group by glcodesid
                            order by lastused desc
                            `

                let oUsed = sqlExec(sql, [oJrnDtls, this.oJournals]);
                if (oUsed.length == 1){
                    oJournal.oJrnDtlDisp[0].glcodesid = oUsed[0].glcodesid;

                } else if (oUsed.length > 1){
                    if (this.Sublib.daysBetween(oUsed[0].lastused, oUsed[1].lastused) > 10
                        || oUsed[0].cnt - oUsed[1].cnt > 5){
                        // if the last used date is more than 10 days ago or the count is more than 5 greater, use it
                        oJournal.oJrnDtlDisp[0].glcodesid = oUsed[0].glcodesid;
                    }
                }
            }


            if (!oJournal.journalid || this.Sublib.contains(oJournal.journalid, '!ADD!', true))
                return;


            // await this.btnSaveClicked(oJournal); // does a bunch of error checking


            
        }, // fieldChanged


        //**************************************************************************************************************
        // delete journal entry
        async btnDelClicked(oJournal){

            return;

            if (!oJournal){
                return;
            }

            var mChoice = await this.Sublib.mbox(this.Sublib.getLbl('confirm delete record'), this.Sublib.getLbl('delete'), this.Sublib.getLbl('cancel'));
            if (mChoice == 2){
                // Cancel
                return;
            }

            var mURL = this.Sublib.getWSUrl() + 'journal/reverseJournal';
            var oParams = { journalId: oJournal.journalid }

            var resp = await this.RestClient.getNoCache(mURL, oParams);

            oJournal.showLoading = false;
            
            var oData = this.Sublib.wsResp2Obj(resp);
            if (oData.errorMsg){
                this.Sublib.mbox(oData.errorMsg);
                return;
            }

            oJournal.showLoading = false;
            
            this.popGrid(); // refresh to pick up any changes they did

            return;
            
        }, // btnDelClicked

         

        //**************************************************************************************************************
        // show the user the filters they can chose
        async btnFiltersClicked(){
            this.showFilters = !this.showFilters;
            await this.Sublib.sleep(.5*1000);

            this.setStickyHeaderWidth(); // recalc max width we can show

            //this.oFilters.showAddls = !this.oFilters.showAddls;
        }, //btnFiltersClicked


        //**************************************************************************************************************
        btnResetFiltersClicked(){
            this.oFilters.branchesId = '!ALL!'; //localStorage.getItem('userBranchesId')
            this.oFilters.amount = 0.00
            this.oFilters.type = ''
            this.oFilters.payee = '';
            this.oFilters.notes = '';
            this.oFilters.showSlideOutOnLoad = false
                

            //just reset the date filters as well to the last 6 months
            this.oFilters.endDt = this.Sublib.newDate();
            this.oFilters.startDt = this.oFilters.endDt.addMonth(-6);

            //this will make sure to call popGrid if there are no results in the grid so when we reset we see most data
            this.applyFilter2();

            if (!this.oFilters.showSlideOutOnLoad){
                this.showFilters = false; // close down the filter screen (just make it easier)
            }
        }, // btnResetFiltersClicked



        //**************************************************************************************************************
        // Update the date filter
        async btnFilterDtClicked(mStartDt, mEndDt){
            
            this.oFilters.startDt = mStartDt;
            this.oFilters.endDt = mEndDt;

            this.popGrid();

        }, // btnFilterDtClicked



        //**************************************************************************************************************
        handleBranchSelected(branchesId){
            this.oFilters.branchesId = branchesId;

            this.popGrid();
        }, // handleBranchSelected


        //**************************************************************************************************************
        // Show the calandar to pick date
        async btnCalendarClicked(oJournal){
            var mDt = await this.Sublib.datePicker(oJournal.dt, true);
            if (!mDt){
                // pressed cancel
                return;
            }

            oJournal.dt = this.Sublib.newDate(mDt);

            this.fieldChanged('dt', oJournal);

        }, // btnCalendarClicked



        //**************************************************************************************************************
        // Let them 'quick add' a customer, vendor, or user
        async btnPayeeClicked(oJournal){
            if (!oJournal || oJournal.readOnly)
                return;


            // The name can disappear when the autocomplete loses focus since it's not a valid option. Capture it before we show the menu
            let dfltName = oJournal.searchVal || ''; // use what they typed in. SRR 12/05/2023
            

            var oMenu = [
                { desc: this.Sublib.getLbl('new customer'), code: "CUST", icon: this.Sublib.getIcon('cust'), },
                { desc: this.Sublib.getLbl('new vendor'), code: "VEND", icon: this.Sublib.getIcon('vendor'), },
                { desc: this.Sublib.getLbl('new user'), code: "USER", icon: this.Sublib.getIcon('user'), },
            ];

            
            let mChoice = await this.Sublib.showMenu(oMenu);
            mChoice = mChoice.toUpperCase();
            if (!mChoice)
                return;
                
            let mGoon;
            let url, oParams, resp, oData;
            

            if (mChoice == 'CUST'){
                mGoon = await this.Sublib.builders_popup('!ADD!', { name: dfltName });
                if (!mGoon || mGoon == '!CANCEL!')
                    return;

                // Get the new cust Info and default to the new customer for this entry
                url = this.Sublib.getWSUrl() + 'cpCust/GetCustDetail';
                oParams = {
                    buildersId: mGoon,
                    limited: true,
                }

                resp = await this.RestClient.getNoCache(url, oParams);
                oData = this.Sublib.wsResp2Obj(resp);
                if (oData.errorMsg){
                    this.Sublib.mbox(oData.errorMsg);
                    return;
                }

                this.oBldrVends.appendBlank({ name: oData[0].custname, idunique: 'B' + mGoon });
                oJournal.whoidunique = 'B' + mGoon;

                this.fieldChanged('whoidunique', oJournal); // save it out


            } else if (mChoice == 'VEND'){
                mGoon = await this.Sublib.vendor_popUp('!ADD!', '', { name: dfltName });
                if (!mGoon || mGoon == '!CANCEL!')
                    return;
                
                // Get the vendor detail
                url = this.Sublib.getWSUrl() + 'vendor/GetVendor';
                oParams = {
                    vendorId: mGoon,
                }

                resp = await this.RestClient.getNoCache(url, oParams);
                oData = this.Sublib.wsResp2Obj(resp);
                if (oData.errorMsg){
                    this.Sublib.mbox(oData.errorMsg);
                    return;
                }

                this.oBldrVends.appendBlank({ name: oData[0].name, idunique: 'V' + mGoon });
                oJournal.whoidunique = 'V' + mGoon;

                this.fieldChanged('whoidunique', oJournal); // save it out



            } else if (mChoice == 'USER'){
                this.Sublib.mbox(this.Sublib.getLbl('feature coming soon'));
                return;
                mGoon = await this.Sublib.users_popup('!ADD!');
            }


        }, // btnPayeeClicked



        //**************************************************************************************************************
        // Itemize the GL Codes for the break down
        async btnItemizeGLClicked(oJournal){
            // oJournal Object. Reference to journal we are editing
            if (!oJournal || oJournal.readOnly)
                return;

            let oMenu = [
                { desc: this.Sublib.getLbl('itemize'), code: "ITEMIZE",  },
            ];

            
            let mChoice;
            if (oJournal.oJrnDtlDisp.length > 1){
                // already itemized
                mChoice = 'ITEMIZE'
            } else {
                mChoice = await this.Sublib.showMenu(oMenu);
                mChoice = mChoice.toUpperCase();
                if (!mChoice)
                    return;
            }
            

            if (!oJournal.journalid || this.Sublib.contains(oJournal.journalid, '!ADD!', true)){
                // on the 'add', just show it in the grid for simplicity. SRR 09/11/2023
                oJournal.showItemized = true;
                // make sure the grid header / columns refresh
                this.showNewEntry = false;
                await this.Sublib.sleep(.1*1000);
                this.showNewEntry = true;

                // if (oJournal.oJrnDtlDisp.length == 1){
                //     oJournal.oJrnDtlDisp.appendBlank({jrndtlid: this.Sublib.getAddId() }); // make sure there are at least 2 records
                // }
                return;
            }

            // mChoice == 'ITEMIZE'
            let oJournalOrig = JSON.parse(JSON.stringify(oJournal));
            let oLocalData = {
                oJournal: oJournal, 
                oJrnDtl: oJournal.oJrnDtl
            }
            let oParams = {
                journalId: oJournal.journalid || '!ADD!', 
                oLocalData: oLocalData,
                // debitLbl: this.Sublib.getLbl('deposit'),
                // creditLbl: this.Sublib.getLbl('withdrawal'),
                retOnly: true,
            }
            let mGoon = await this.Sublib.showSimplePopUp(this.Sublib.Vue.extend(JRNDTL), oParams);

            if (!mGoon || mGoon == '!CANCEL!'){
                // Since oJournal is by reference, set things back
                Object.keys(oJournalOrig).forEach((key) => {
                    oJournal[key] = oJournalOrig[key];
                });
                return;
            }

            let oHold = JSON.parse(mGoon);
            if (!oHold.oJrnDtl.find(obj => obj.glcodesid == this.oFilters.bankGL)){
                this.Sublib.mbox(this.Sublib.getLbl('bank reg rec must have bank account'));
                return;
            }


            // so we don't lose the reference, copy over the fields. SRR 09/06/2023
            // oJournal = oHold.oJournal;
            Object.keys(oHold.oJournal).forEach((key) => {
                oJournal[key] = oHold.oJournal[key];
            });
            oJournal.oJrnDtl = oHold.oJrnDtl;
            oJournal.oJrnDtlDisp = oHold.oJrnDtl.filter(obj => obj.glcodesid != this.oFilters.bankGL);

            let oHold2 = oHold.oJrnDtl.find(obj => obj.glcodesid == this.oFilters.bankGL);
            if (oHold2.debit){
                oJournal.deposit = oHold2.debit;
                oJournal.withdrawal = 0;
            } else {
                oJournal.deposit = 0;
                oJournal.withdrawal = oHold2.credit;
            }

            if (oJournal.journalid && !this.Sublib.contains(oJournal.journalid, '!ADD!', true)){
                this.btnSaveClicked(oJournal);
            }


        }, // btnItemizeGLClicked    
        
        

        //**************************************************************************************************************
        // Save out a new entry
        async btnSaveClicked(oJournal){

            let mChoice;
            if (oJournal[this.withdrawalVModel]){
                oJournal.withdrawal = oJournal[this.withdrawalVModel]; // because our v-model being withdrawal *-1 it can show up funny here
                delete oJournal[this.withdrawalVModel];
            }

            // *** Errror Checking *** 
            if (!oJournal.whoidunique){
                this.Sublib.mbox(this.Sublib.getLbl('must select a blank').replace('<DESC>', this.Sublib.getLbl('payee')));
                return;

            } else if (!oJournal.oJrnDtlDisp[0].glcodesid){
                this.Sublib.mbox(this.Sublib.getLbl('must select an blank').replace('<DESC>', this.Sublib.getLbl('account')));
                return;

            } else if (!oJournal.deposit && !oJournal.withdrawal 
                && (!oJournal.journalid || this.Sublib.contains(oJournal.journalid, '!ADD!')) // if they editing an existing transaction, make it so they can switch it from a 'deposit' to a withdrawal and vice versa
                ){
                
                this.Sublib.mbox(this.Sublib.getLbl('must enter an blank').replace('<DESC>', this.Sublib.getLbl('amount')));
                return;
            } 

            if (!oJournal.extra1){
                mChoice = await this.Sublib.mbox(this.Sublib.getLbl('check no ref no'), this.Sublib.getLbl('enter it now'), this.Sublib.getLbl('dont enter it'));
                if (mChoice == 1){
                    // enter it
                    return;
                }
            }
            // *** End Error Checking ***

            if (oJournal.showItemized){
                // make sure my debits / credits go to the right place
                if (oJournal.withdrawal){
                    oJournal.oJrnDtl.replaceFor({debit: '$$amount'}, (obj) => obj.glcodesid != this.oFilters.bankGL);
                    oJournal.oJrnDtlDisp.replaceFor({debit: '$$amount'}, (obj) => obj.glcodesid != this.oFilters.bankGL);
                } else { // oJournal.deposit
                    oJournal.oJrnDtl.replaceFor({credit: '$$amount'}, (obj) => obj.glcodesid != this.oFilters.bankGL);
                    oJournal.oJrnDtlDisp.replaceFor({credit: '$$amount'}, (obj) => obj.glcodesid != this.oFilters.bankGL);
                }
            }


            // NOTE: Since they are only typing 1 amount and most likely only selecting 1 account, create the actual journal structure below. 
            // Can look a little messy... SRR 09/01/2023

            oJournal.showLoading = true;

            oJournal.amount = Math.abs(oJournal.deposit || oJournal.withdrawal);
            oJournal.dt = this.Sublib.DTOC(oJournal.dt);
            oJournal.branchesid = oJournal.branchesid || this.oFilters.branchesId;
            oJournal.whoid = this.Sublib.right(oJournal.whoidunique, 10); // 'B0000000020'
            oJournal.whoidtype = this.Sublib.left(oJournal.whoidunique, 1);

            let oJrnDtl = [];
            // Bank Account Rec
            oJrnDtl.push({
                glcodesid: this.oFilters.bankGL,
                debit: Math.abs(oJournal.deposit),
                credit: Math.abs(oJournal.withdrawal),
                journalid: oJournal.journalid,
                jrndtlid: oJournal.oJrnDtl.find(obj => obj.glcodesid == this.oFilters.bankGL) ? oJournal.oJrnDtl.find(obj => obj.glcodesid == this.oFilters.bankGL).jrndtlid : '',
                bankrecid: oJournal.oJrnDtl.find(obj => obj.glcodesid == this.oFilters.bankGL) ? oJournal.oJrnDtl.find(obj => obj.glcodesid == this.oFilters.bankGL).bankrecid : '',
                deleted: false,
            });

            // Other account(s)
            for (var mx = 0; mx < oJournal.oJrnDtlDisp.length; mx++){
                oJournal.oJrnDtlDisp[mx].debit = Math.abs(oJournal.oJrnDtlDisp[mx].debit || oJournal.withdrawal)
                oJournal.oJrnDtlDisp[mx].credit =  Math.abs(oJournal.oJrnDtlDisp[mx].credit || oJournal.deposit) // oposite of money flow from bank

                oJrnDtl.push({
                    glcodesid: oJournal.oJrnDtlDisp[mx].glcodesid,
                    debit: oJournal.oJrnDtlDisp[mx].debit,
                    credit: oJournal.oJrnDtlDisp[mx].credit, 
                    journalid: oJournal.journalid,
                    jrndtlid: oJournal.oJrnDtlDisp[mx].jrndtlid, // empty is okay
                    deleted: oJournal.oJrnDtlDisp[mx].deleted,
                    notes: oJournal.oJrnDtlDisp[mx].notes.trim(),
                    bankrecid: oJournal.oJrnDtlDisp[mx].bankrecid,
                });
            } // for

            let oJournalHold = JSON.parse(JSON.stringify(oJournal));
            delete oJournalHold.oJrnDtlDisp;
            delete oJournalHold.oJrnDtl;


            var mURL = this.Sublib.getWSUrl() + 'journal/saveBankRegEntry';
            var oParams = {
            }
            let oBodyParams = {
                journal: JSON.stringify(oJournalHold),
                jrnDtl: JSON.stringify(oJrnDtl)
            }

            var resp = await this.RestClient.postNoCache(mURL, oParams, oBodyParams);

            oJournal.showLoading = false;
            
            var oData = this.Sublib.wsResp2Obj(resp);
            if (oData.errorMsg){
                await this.Sublib.mbox(oData.errorMsg);
                if (oData.errorMsg.contains('out of balance', true) && oJournal.journalid && !oJournal.journalid.contains('!ADD!', true)){
                    // editing an existing transaction and it would case it to go out of balance (i.e. because they itemized it)
                    // Refresh so we have the original data. SRR 09/18/2023
                    this.popGrid();
                }
                return;
            }


            let sql = `select *
                            from ?
                            order by serializeDt(dt) desc, serializeDt(createdt) desc
                            `


            if (!oJournal.journalid || this.Sublib.contains(oJournal.journalid, '!ADD!', true)){
                //this.showNewEntry = false;
                //await this.popGrid(); // calls calcBal
                //this.showNewEntry = true; // does some stuff with auto focus, etc. 
                // Popgrid takes too long with 1000s of recs. Just push into the array and calcBal so if they are entering several it's faster. SRR 12/05/2023

                let needToRedrawGrid = (oJournal.showItemized && this.showNewEntry); // capture before stuff gets reset below

                oJournal.journalid = oData.journalid;
                oJournal.showItemized = false;
                oJournal.oJrnDtl = oJrnDtl
                oJournal.deposit = Math.abs(oJournal.deposit);
                oJournal.withdrawal = Math.abs(oJournal.withdrawal); // because our v-model being withdrawal *-1 it can show up funny here
                
                this.oJournals.push(oJournal);

                this.oJournals = sqlExec(sql, [this.oJournals]); 

                // the grid has to be updated for the future line style to get set correctly.
                await this.$nextTick();
                await this.$forceUpdate();

                this.calcBal(); // calls setFutureLineStyle()
                this.oJournalsOrig = this.oJournals.breakRef(); // make sure we pick up future changes (i.e. change to withdrawal and then back to deposit, won't save change back if we don't update oJournalsOrig)

                
                this.resetNewEntry();

                if (needToRedrawGrid || true){
                    // when we reset, the notes will be missing. Have to destroy the table and reshow it to get the notes column back since it's a computed field. SRR 12/14/2023
                    this.showNewEntry = false;
                    await this.Sublib.sleep(.1*1000);
                    this.showNewEntry = true;
                }

                while (!this.$refs['dt_!ADD!']){
                    await this.Sublib.sleep(.1*1000);
                }
                this.Sublib.setFocus(this.$refs['dt_!ADD!'])
                


            } else if (oJournal.oJrnDtlDisp.length != this.oJournalsOrig.find(obj => obj.journalid == oJournal.journalid).oJrnDtlDisp.length
                || oJournal.oJrnDtlDisp.find(obj => obj.deleted)){
                await this.popGrid(); // calls calcBal

            } else {
                // don't need to refesh with a minor change they just did since we show it in the grid already. SRR 09/01/2023

                // re-order in case they changed the date
                // oJournal is by reference but with lots of reqs, have to give it a little time to update. SRR 12/05/2023
                // await this.$nextTick(); 
                // await this.$forceUpdate();
                //await this.Sublib.sleep(.5*1000);
                let jrnIndex = this.oJournals.findIndex(obj => obj.journalid == oJournal.journalid);
                this.oJournals[jrnIndex] = oJournal; // update the record in the array (should do it automatically but it wasn't). SRR 12/05/2023

                this.oJournals = sqlExec(sql, [this.oJournals]); 

                this.calcBal();
                this.oJournalsOrig = this.oJournals.breakRef(); // make sure we pick up future changes (i.e. change to withdrawal and then back to deposit, won't save change back if we don't update oJournalsOrig)
            }

        }, // btnSaveClicked


        //**************************************************************************************************************
        // Open / view journal entry, etc. 
        async btnOptionsClicked(oJournal){
            if (!oJournal){
                return;
            }

            var oMenu = [
                { desc: this.Sublib.getLbl('view'), code: "VIEW", icon: '', disabled: !oJournal.readOnly},
                { isDivider: true },
                { desc: this.Sublib.getLbl('delete'), code: "DELETE", icon: '', disabled: oJournal.readOnly },
            ];

            var mChoice = await this.Sublib.showMenu(oMenu);
            mChoice = mChoice.toUpperCase();

            if (!mChoice){
                return;
            }
            
            let mGoon;
            if (mChoice == 'VIEW'){
                mGoon = await this.Sublib.viewJournalRefType(oJournal)
                if (mGoon == '!CANCEL!'){
                    return;
                }

            } else if (mChoice == 'DELETE'){
               await this.btnDelClicked(oJournal);
            }

            this.popGrid(); // refresh to pick up any changes they did

            return;
            
        }, // btnOptionsClicked



        //**************************************************************************************************************
        // Beging or end a reconciliation
        async btnReconcileClicked(startRec){
            // startRec = Logical. True if we are starting a reconciliation, false if we are ending it
            //          If not passed, just swaps this.oFilters.reconcile

            if (typeof startRec != 'boolean')
                startRec = !this.oFilters.reconcile; // assume we are just switching what's currently going on
            
            startRec = true; // only way to call this

            if (startRec){
                this.oFilters.reconcile = true;

                if (!this.oFilters.bankGL){
                    this.Sublib.select_dropDown(this.$refs.cboGlCodes);

                    while(!this.oFilters.bankGL){
                        await this.Sublib.sleep(1*1000);
                    }
                }

                this.showNewEntry = false;
                // this.showLoading = true; // force it to repaint the grid / update the headers / columns now that oFilters.reconcile = true
                // await this.Sublib.sleep(.5*1000); // give it a chance to repaint
                // this.showLoading = false;

                // get the data we need
                let mURL = this.Sublib.getWSUrl() + 'bankRec/getOpenBankRec';
                let oParams = {
                    //branchesId: this.oFilters.branchesId,
                    glCodesId: this.oFilters.bankGL,
                }
                let resp = await this.RestClient.getNoCache(mURL, oParams);
                let oData = this.Sublib.wsResp2Obj(resp);
                if (oData.errorMsg && !this.Sublib.contains(oData.errorMsg, 'no data', true)){
                    this.oFilters.reconcile = false;
                    this.Sublib.mbox(oData.errorMsg);
                    return;

                } else if (!oData.length){
                    // start one
                    mURL = this.Sublib.getWSUrl() + 'bankRec/startBankRec';
                    oParams = {
                        glCodesId: this.oFilters.bankGL,
                    }
                    resp = await this.RestClient.getNoCache(mURL, oParams);
                    oData = this.Sublib.wsResp2Obj(resp);
                    if (oData.errorMsg){
                        this.oFilters.reconcile = false;
                        this.Sublib.mbox(oData.errorMsg);
                        return;
                    }
                }

                this.oBankRec = oData[0];
                this.oReconcile.statementBal = this.oBankRec.stateamt;
                //this.oReconcile.statementDt = (!this.Sublib.emptyDt(this.oBankRec.statedt) ? this.Sublib.newDate(this.oBankRec.statedt) : this.Sublib.newDate());

                // get the starting balance
                mURL = this.Sublib.getWSUrl() + 'bankRec/getLastBankRec';
                oParams = {
                    glCodesId: this.oFilters.bankGL,
                }
                resp = await this.RestClient.getNoCache(mURL, oParams);
                oData = this.Sublib.wsResp2Obj(resp);
                if (oData.errorMsg && !this.Sublib.contains(oData.errorMsg, 'no data', true)){
                    this.oFilters.reconcile = false;
                    this.Sublib.mbox(oData.errorMsg);
                    return;

                } else if (!oData.length){
                    // no previous recs, assume 0
                    this.oReconcile.startingBal = 0.00;
                } else {
                    this.oReconcile.startingBal = oData[0].stateamt;
                }


                this.oFilters.startDt = this.Sublib.newDate().addMonth(-1*12); // go back a year
                this.oFilters.endDt = this.oBankRec.statedt; // use the statement date

                await this.popGrid(); // filters down the results nicely

                this.calcRecAmts();


            } else {
                this.oFilters.reconcile = false;
            }



        }, // btnReconcileClicked


        // **************************************************************************************************************
        // Checked / unchecked the cleared checkbox
        async chkClearedClicked(oJournal, noAwait){
            // oJournal = Object. Reference to the journal we are editing
            // noAwait = Logical. True if we don't want to wait for the save to finish.

            if (!oJournal){
                return;
            }

            
            oJournal.oJrnDtl.replaceFor({bankrecid: oJournal.cleared ? this.oBankRec.bankrecid : '' }, obj => obj.glcodesid == this.oFilters.bankGL );
            if (noAwait){
                // shoot it off but don't wait for it (i.e. we are bulk doing these from the all / none buttons)
                this.btnSaveClicked(oJournal);
            } else {
                await this.btnSaveClicked(oJournal);
            }

            this.calcRecAmts();
        }, // chkClearedClicked


        //**************************************************************************************************************
        // Calculate the reconciled amounts
        calcRecAmts(){
            this.oReconcile.clearedDepAmt = this.oJournals.filter(obj => obj.cleared && obj.deposit).calcSum(obj => obj.deposit);
            this.oReconcile.clearedDepCnt = this.oJournals.filter(obj => obj.cleared && obj.deposit).length;

            this.oReconcile.clearedWthAmt = this.oJournals.filter(obj => obj.cleared && obj.withdrawal).calcSum(obj => obj.withdrawal);
            this.oReconcile.clearedWthCnt = this.oJournals.filter(obj => obj.cleared && obj.withdrawal).length;

            this.oReconcile.endBal = (this.oReconcile.startingBal + this.oReconcile.clearedDepAmt - this.oReconcile.clearedWthAmt).round(2);

        }, // calcRecAmts


        //**************************************************************************************************************
        // Update the bank rec summary record
        async updtBankRec(field){
            // field = String. The field that changed. 
            //  Pass 'completedt' to finish the bank rec

            if (!this.oFilters.reconcile)
                return;


            let url = this.Sublib.getWSUrl() + 'bankRec/saveBankRec';
            let oParams = {
                bankRecId: this.oBankRec.bankrecid,
            }

            // if (field == 'completedt'){
            //     this.oBankRec.completedt = this.Sublib.serializeDt(this.Sublib.newDate());
            //     this.oBankRec.completeby = localStorage.getItem('userId');
            // }

            let oBodyParams = {
                fields: JSON.stringify([{
                    field: field,
                    value: this.oBankRec[field],
                }])
            }

            // if (field == 'completedt'){
            //     let aHold = JSON.parse(oBodyParams.fields);
            //     aHold.push({
            //         field: 'completeby',
            //         value: this.oBankRec.completeby,
            //     });
            //     oBodyParams.fields = JSON.stringify(
            //        aHold
            //     );
            //     // oBodyParams.fields.push({
            //     //     field: 'deposits',
            //     //     value: this.oReconcile.clearedDepAmt,
            //     // });
            //     // oBodyParams.fields.push({
            //     //     field: 'withdrawals',
            //     //     value: this.oReconcile.clearedWthAmt,
            //     // });
            // }


            let resp = await this.RestClient.postNoCache(url, oParams, oBodyParams);
            let oData = this.Sublib.wsResp2Obj(resp);
            if (oData.errorMsg){
                this.Sublib.mbox(oData.errorMsg);
                return;
            }

        }, // updtBankRec


        //**************************************************************************************************************
        // Save / finish or cancel the bank rec
        async btnBankRecClicked(action){
            // action = Char. either '!SAVE!', '!CANCEL!', or '!SAVE4LATER!'

            let choice, goon, url, oParams, resp, oData;

            if (!this.oFilters.reconcile)
                return;

            if (action == '!SAVE!'){
                this.showSavingBankRec = true;
                if (this.oReconcile.endBal != this.oReconcile.statementBal){
                    choice = await this.Sublib.mbox(this.Sublib.getLbl('bank rec out of balance').replace('<AMT>', this.Sublib.formatCurrency((this.oReconcile.endBal - this.oReconcile.statementBal).round(2))), 
                                                    this.Sublib.getLbl('fix'), this.Sublib.getLbl('auto fix bank rec'), this.Sublib.getLbl('save for later'));
                    if (choice == 1){
                        // manually fix it
                        this.showSavingBankRec = false;
                        return;

                    } else if (choice == 2){
                        // auto fix
                        // Create a journal entry for the difference
                        url = this.Sublib.getWSUrl() + 'bankRec/makeAdjEntry';
                        oParams = {
                            bankRecId: this.oBankRec.bankrecid,
                            offBy: (this.oReconcile.endBal - this.oReconcile.statementBal).round(2),
                        }

                        resp = await this.RestClient.getNoCache(url, oParams);
                        oData = this.Sublib.wsResp2Obj(resp);
                        if (oData.errorMsg){
                            this.showSavingBankRec = false;
                            this.Sublib.mbox(oData.errorMsg);
                            return;
                        }

                        // Let the code continue below. SRR 12/12/2023


                    } else if (choice == 3){
                        // save for later
                        this.showSavingBankRec = false;
                        return this.btnBankRecClicked('!SAVE4LATER!'); // recursive call
                    }
                } // if (this.oReconcile.endBal != this.oReconcile.statementBal)


                this.oBankRec.completedt = this.Sublib.serializeDt(this.Sublib.newDate());
                this.oBankRec.completeby = localStorage.getItem('userId');
                // this.oBankRec.debits = this.oReconcile.clearedDepAmt; // summary fields, not storing, just calc on the fly
                // this.oBankRec.credits = this.oReconcile.clearedWthAmt;

                await this.updtBankRec('completedt'); // save it out (adds in the other final fields as well)

                // show the bank rec report
                url = this.Sublib.getWSUrl() + 'bankRec/prtBankRec';
                oParams = {
                    bankRecId: this.oBankRec.bankrecid,
                }
                resp = await this.RestClient.getNoCache(url, oParams);
                oData = this.Sublib.wsResp2Obj(resp);
                if (oData.errorMsg){
                    this.Sublib.mbox(oData.errorMsg);
                    //return; // don't return, want to finish the bank rec below
                } else {
                    // show the report
                    await this.Sublib.outRept(oData[0].downloadpath);
                }

                this.showSavingBankRec = false;



            } else if (action == '!CANCEL!'){
                choice = await this.Sublib.mbox(this.Sublib.getLbl('cancel bank rec desc'), this.Sublib.getLbl('cancel bank rec'), this.Sublib.getLbl('dont cancel'));
                if (choice == 2){
                    // don't cancel
                    return;
                }

                if (this.oBankRec.bankrecid){
                    // since it's save as you go, have to go nuke a few records / update others
                    let url = this.Sublib.getWSUrl() + 'bankRec/deleteBankRec';
                    let oParams = {
                        bankRecId: this.oBankRec.bankrecid,
                    }
                    let resp = await this.RestClient.getNoCache(url, oParams);
                    let oData = this.Sublib.wsResp2Obj(resp);
                    if (oData.errorMsg){
                        this.Sublib.mbox(oData.errorMsg);
                        return;
                    }
                }


            } else if (action == '!SAVE4LATER!'){
                // Nothing to do, it's save as you go, so just hide it now. 
                
            }


            if (this.leaveWhenRecDone){
                // we are done, so leave
                if (this.popUpMode){
                    this.$emit('journalSel', action);
                } else {
                    this.$router.go(-1);
                }
                return;
            }

            this.oFilters.reconcile = false;
            this.oBankRec = {};
            await this.popGrid(); // refresh to pick up any changes they did

        }, // btnBankRecClicked


        //**************************************************************************************************************
        // Mark all as not cleared
        // Since we do save as you go, this could be a little slow...
        async btnBankRecNoneClicked(){
            for (var mx = 0; mx < this.oJournals.length; mx++){
                if (this.oJournals[mx].cleared){
                    this.oJournals[mx].cleared = false;
                    this.chkClearedClicked(this.oJournals[mx], true); // no await
                }
            } // for
        }, // btnBankRecNoneClicked


        //**************************************************************************************************************
        // Mark all as cleared
        // Since we do save as you go, this could be a little slow...
        async btnBankRecAllClicked(){
            for (var mx = 0; mx < this.oJournals.length; mx++){
                if (!this.oJournals[mx].cleared){
                    this.oJournals[mx].cleared = true;
                    this.chkClearedClicked(this.oJournals[mx], true); // no await
                }
            } // for
        }, // btnBankRecAllClicked


        //**************************************************************************************************************
        // Clicked the add button
        async btnAddClicked(){
            if (this.oFilters.branchesId == '!ALL!'){
                this.Sublib.mbox(this.Sublib.getLbl('must select a branch'));
                return;
            }
            
            this.showNewEntry = true;
            
            // while (!this.$refs['dt_!ADD!']){
            //     await this.Sublib.sleep(1*1000);
            // }
            // this.Sublib.setFocus(this.$refs['dt_!ADD!'], true);

        }, // btnAddClicked


    } // methods
} // export default
</script>


<!-------------------------------------------------------------------------------------------------------------------------------------------------->
<!-- Add "scoped" attribute to limit CSS to this component only (also affects components you import on this page!) -->
<style scoped>
 .journalReg { margin:0 auto; }
 h2 { margin-bottom:20px; }

/* .journalReg-search-btn { margin-left: -10px; } */
.journalReg-filter-btn { margin-left: -20px; }

>>>#journalReg-search .v-input__slot { margin-bottom: 0; }
>>>#journalReg-search .v-messages { min-height: 0; }


>>>#journalRegTable tr { line-height: 10px; height: 10px;}
>>>#journalRegTable td { max-height: 10px;}


/* >>>#journalReg-filters .v-select__slot { margin-bottom:-15px; } */
.journalReg-filters-cbo { margin-top: -5px; margin-bottom: -15px; }
>>>#journalReg-filters .v-list-item__title { min-width: 150px; max-width: 150px; }

#journalReg-search { z-index:2;  width:325px; } /* Width is updated via JS above to be the right width*/
#journalReg-search .container { margin-top:40px; }
#journalReg-search .col { padding-top: 0; padding-bottom: 0;}

>>>#journalReg-search .v-toolbar__content { padding: 0; padding-left:0px; padding-right:0px;   }

#journalReg-grdBldrs { padding: 8px 0px}
#journalReg-grdBldrs-row { padding-top: 0px; padding-bottom: 0px; }
#journalReg-grdBldrs-row .v-list-item { padding-left:2px; padding-right:2px; padding-top:0px; margin-bottom:0px;  }

.journalReg-chkActiveOnly { position: absolute; z-index:3; top:1px; right:10px; }

.journalReg-scroller { height: 400px; } /* Set Via JS */

/* Make it so we draw a 'line' to indicate future versus current/past transactions */
>>>.journalReg-futureDateSeperatorDesc td { border-bottom: 3px solid #3C6880 !important; }
>>>.journalReg-futureDateSeperatorAsc td { border-top: 3px solid #3C6880 !important; }


/* .scroller-xs { height: 400px; }
.scroller-sm { height: 600px; }
.scroller-md { height: 600px; }
.scroller-lg { height: 750px; } */

</style>