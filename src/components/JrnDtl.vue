<template>
    <v-dialog :max-width="Sublib.getPopupWidth(1.25, false, true)" persistent v-if="showMbox">
        <template v-slot:activator="{on}">
            <v-btn :id="mBoxBtnId" v-on="on"></v-btn>
        </template>
        <v-flex>
            <!-- Finder text box -->
            <v-card>
                <v-toolbar 
                    dense 
                    :color="Sublib.getColor('header')" 
                    dark 
                    >
                    <v-toolbar-title>
                        <v-icon>{{Sublib.getIcon('gl codes')}}</v-icon>
                        
                        <!-- <img src="" height="30px" width="30px" class="float-left" /> -->
                        
                        <!-- <span class="tasks-card-title-text">{{oTask.taskname}}</span> -->
                        <span class="margin-left-10">{{Sublib.getLbl('journal entry') + ($vuetify.breakpoint.smAndDown ? '' : ' - ' + Sublib.trimZeros(oJournal.journalid, 5))}}</span>
                    </v-toolbar-title>
                </v-toolbar>

                <v-card-text id="jrnDtl-info" class="margin-top-10n">
                    <cp-loading v-if="showLoading" linear></cp-loading>
                     <v-container v-show="!showLoading">
                        <v-row>
                            <!-- { text: Sublib.getLbl('date'),  value: 'dt', width: '150px', date: true, },
                            { text: Sublib.getLbl('type'),  value: 'refidtype', width: '150px'},
                            { text: Sublib.getLbl('amount'), align: 'end', value: 'amount', width: '120px', currency: true},
                            { text: Sublib.getLbl('notes'),  value: 'notes'},
                            { text: Sublib.getLbl('created by'), value: 'createdby_name', width: '160px'},
                            { text: Sublib.getLbl('created dt'),  value: 'createdt', width: '150px', datetime: true, }, -->
                            <v-col align-self="end" v-if="this.readOnly">
                                <cp-txt
                                    disabled
                                    :label="Sublib.getLbl('date')"
                                    :value="$vuetify.breakpoint.smAndDown ? Sublib.DTOC2(oJournal.dt) : Sublib.obviousDt(oJournal.dt, true)"
                                    >
                                </cp-txt>
                            </v-col>
                            <v-col align-self="center" v-if="!this.readOnly">
                                <cp-btn
                                    :disabled="readOnly"
                                    :label="$vuetify.breakpoint.smAndDown ? Sublib.DTOC2(oJournal.dt) : Sublib.obviousDt(oJournal.dt, true)"
                                    @click="btnDtClicked()"
                                    >
                                </cp-btn>
                            </v-col>
                            <v-col>
                                <cp-sel-branch
                                    v-model="oJournal.branchesid" 
                                    :oItems="oBranches"
                                    :disabled="readOnly"
                                    ref="cboBranches"
                                    >
                                </cp-sel-branch>
                                
                                
                            </v-col>
                            <v-col align-self="end" v-if="$vuetify.breakpoint.mdAndUp">
                                <!-- This is not a great place for this as you can't see the 'who' on a phone but not sure yet on layout where a better place would be. SRR 11/30/2023 -->
                                 <cp-txt
                                    disabled
                                    :label="Sublib.getLbl('who')"
                                    :value="oJournal.whoname"
                                    >
                                </cp-txt>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                               <cp-txt
                                    disabled
                                    :label="Sublib.getLbl('type')"
                                    :value="Sublib.formatJournalRefType(oJournal)"
                                    >
                                </cp-txt>
                            </v-col>
                            <v-col>
                                <cp-input-mask 
                                    v-model="oJournal.amount"
                                    :disabled="readOnly"
                                    :inputMask="inputMask"
                                    :label="Sublib.getLbl('amount')"
                                    style="max-width:125px"
                                    :autofocus="(!oJournal.journalid || oJournal.journalid.contains('!ADD!'))"
                                    >
                                </cp-input-mask>
                            </v-col>
                            <v-col v-if="$vuetify.breakpoint.mdAndUp">
                                <cp-txt
                                    v-model="oJournal.extra1"
                                    :disabled="readOnly"
                                    :label="Sublib.getLbl('addl info')"
                                    >
                                </cp-txt>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col>
                                <cp-txt-area
                                    v-model="oJournal.notes"
                                    maxlength="200"
                                    rows="1"
                                    auto-grow
                                    :label="Sublib.getLbl('general notes')"
                                    :disabled="readOnly"
                                    >
                                </cp-txt-area>
                            </v-col>
                        </v-row>



                       


                        <!-- <v-row class="margin-top-25 margin-bottom-5">
                            <v-col>
                                {{Sublib.getLbl('details')}}
                            </v-col>
                        </v-row> -->
                        <v-tabs
                            show-arrows
                            v-model="selTab"
                            class="margin-bottom-10"
                            >
                            <v-tab
                                ref="tabDtl"
                                >
                                <span>{{Sublib.getLbl('details')}}</span>
                            </v-tab>
                            <v-tab
                                >
                                <span>{{Sublib.getLbl('addl info')}}</span>
                            </v-tab>
                        </v-tabs>

                        <div v-if="selTab == 0">
                            <!-- Details -->
                            <v-row v-for="x in oJrnDtl.filter(obj => !obj.deleted)" :key="x.jrndtlid"> 
                                <v-col cols="12" md="4" style="padding-top:0">
                                    <!-- <cp-gl-codes
                                        v-model="x.glcodesid" 
                                        :items="oGLCodes" 
                                        :disabled="readOnly"
                                        :ref="'cboGlCodes' + x.jrndtlid"
                                        >
                                    </cp-gl-codes> -->
                                    <!-- <cp-auto
                                        v-model="x.glcodesid"
                                        :disabled="readOnly"
                                        :items="oGLCodes"
                                        desc="descript"
                                        code="glcodesid"
                                        :label="Sublib.getLbl('gl code')"
                                        :filterFunc="function(item, filterStr, itemText) {
                                            return this.Sublib.contains(this.Sublib.killPunctuation(Sublib.formatGL(item), true), this.Sublib.killPunctuation(filterStr, true)); // make it a more forgiving search
                                        }"
                                        :autofocus="!x.glcodesid"
                                    >
                                        <template v-slot:selection="{ item }">
                                            <span class="auto-comp-text-truncate">
                                                {{Sublib.formatGL(item)}}
                                            </span>
                                        </template>

                                        <template v-slot:item="{ item }">            
                                                {{Sublib.formatGL(item)}}
                                        </template>
                                    </cp-auto> -->

                                    <cp-gl-codes
                                        v-model="x.glcodesid"
                                        :disabled="readOnly || oJournal.refidtype == 'STB'"
                                        :items="oGLCodes"
                                        :autofocus="!x.glcodesid"
                                        >
                                    </cp-gl-codes>


                                </v-col>
                                <v-col align-self="start" :style="{'padding': $vuetify.smAndDown ? '0': '', 'max-width': '145px'}">
                                    <cp-input-mask 
                                        :ref="'debit_' + x.jrndtlid"
                                        v-model="x.debit"
                                        :disabled="readOnly"
                                        :inputMask="inputMask"
                                        :label="(debitLbl ? debitLbl + ' (' + Sublib.getLbl('debit') + ')' : Sublib.getLbl('debit'))"
                                        >
                                    </cp-input-mask>
                                </v-col>
                                <v-col align-self="start" :style="{'padding': $vuetify.smAndDown ? '0': '', 'max-width': '145px'}">
                                    <cp-input-mask 
                                        v-model="x.credit"
                                        :disabled="readOnly"
                                        :inputMask="inputMask"
                                        :label="(creditLbl ? creditLbl + ' (' + Sublib.getLbl('credit') + ')' : Sublib.getLbl('credit'))"
                                        style="max-width:125px"
                                        >
                                    </cp-input-mask>
                                </v-col>
                                <v-col>
                                    <!-- <cp-txt
                                        v-model="x.notes"
                                        hideDetails
                                        :label="Sublib.getLbl('notes')"
                                        :disabled="readOnly"
                                        >
                                    </cp-txt> -->
                                    <cp-txt-area
                                        v-model="x.notes"
                                        maxlength="200"
                                        rows="1"
                                        auto-grow
                                        :label="Sublib.getLbl('notes')"
                                        :disabled="readOnly"
                                        hideDetails
                                        >
                                    </cp-txt-area>
                                </v-col>
                                <v-col align-self="center" cols="1">
                                    <!-- <v-icon @click="oJrnDtl.deleteFor(obj => obj.jrndtlid == x.jrndtlid)" small>{{Sublib.getIcon('trash')}}</v-icon> -->
                                    <cp-btn
                                        :disabled="readOnly || oJournal.refidtype == 'STB'"
                                        @click="x.deleted = true"
                                        :icon="Sublib.getIcon('trash')"
                                        iconSize="sm"
                                        size="sm"
                                        >

                                    </cp-btn>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="4" align-self="center">
                                    <cp-btn
                                        :disabled="readOnly || oJournal.refidtype == 'STB'"
                                        @click="oJrnDtl.appendBlank({jrndtlid: Sublib.getAddId()})"
                                        :icon="Sublib.getIcon('add')"
                                        >
                                    </cp-btn>
                                </v-col>
                            <v-col align-self="end" style="max-width:145px">
                                    <cp-input-mask 
                                        disabled
                                        :value="oJrnDtl.calcSum(obj => !obj.deleted ? obj.debit : 0)"
                                        :inputMask="inputMask"
                                        :label="Sublib.getLbl('total debits')"
                                        >
                                    </cp-input-mask>
                                </v-col>
                                <v-col align-self="end" style="max-width:145px">
                                    <cp-input-mask 
                                        disabled
                                        :value="oJrnDtl.calcSum(obj => !obj.deleted ? obj.credit: 0)"
                                        :inputMask="inputMask"
                                        :label="Sublib.getLbl('total credits')"
                                        style="max-width:125px"
                                        >
                                    </cp-input-mask>
                                </v-col>
                            </v-row>

                        </div>
                        <div v-if="selTab == 1">
                            <!-- Addl Info -->
                            <v-row>
                                <v-col>
                                    <cp-txt
                                        disabled
                                        :label="Sublib.getLbl('created dt')"
                                        :value="($vuetify.breakpoint.smAndDown ? Sublib.DTOC2(oJournal.createdt) : Sublib.obviousDt(oJournal.createdt, true)) + ' - ' + Sublib.AmPm(oJournal.createdt)"
                                        >
                                    </cp-txt>
                                </v-col>
                                <v-col>
                                    <cp-txt
                                        disabled
                                        :label="Sublib.getLbl('created by')"
                                        :value="oJournal.createdby_name"
                                        >
                                    </cp-txt>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col>
                                    <cp-txt
                                        disabled
                                        :label="Sublib.getLbl('last edit dt')"
                                        :value="!Sublib.emptyDt(oJournal.lasteditdt) ? ($vuetify.breakpoint.smAndDown ? Sublib.DTOC2(oJournal.lasteditdt) : Sublib.obviousDt(oJournal.lasteditdt, true)) 
                                                + ' - ' + Sublib.AmPm(oJournal.lasteditdt) : ''"
                                        >
                                    </cp-txt>
                                </v-col>
                                <v-col>
                                    <cp-txt
                                        disabled
                                        :label="Sublib.getLbl('last edit by')"
                                        :value="oJournal.lasteditby_name"
                                        >
                                    </cp-txt>
                                </v-col>
                            </v-row>
                        </div>

                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <cp-btn 
                        :color="Sublib.getColor('header')" dark 
                        @click="btnOKClicked()"
                        :label="Sublib.getLbl('ok')"
                        :loading="showSaving"
                        v-if="!readOnly"
                    >
                    </cp-btn>
                    <cp-btn :color="Sublib.getColor('header')" dark 
                        @click="btnCancelClicked()"
                        :label="Sublib.getLbl('cancel')"
                    >
                    </cp-btn>
                </v-card-actions>
            </v-card>
        </v-flex>
    </v-dialog>
</template>


<!-------------------------------------------------------------------------------------------------------------------------------------------------->
<script>

export default {
    name: 'jrnDtl',
    data: () => ({
        showMbox: true,
        chkActiveOnly: true,
        txtSearch: '', // used for the applyFilter
        showLoading: false,
        showNoResultsMsg: false,
        showSaving: false,

        oJournalOrig: {},
        oJournal: {},
        oJrnDtl: [],
        oGLCodes: [],
        oBranches: [],

        selTab: 0,
        readOnly: false,
        inputMask: '###,###,###.##'
    }),
    props: [
        // these can be passed in, the 'data' stuff can't
        //'dfltClockOut', // Logical, if true, defaults to clock out stuff, if false, defaults to clock in stuff. if not passed, looks up current status
        'retval', // this.Sublib watches this so we know when they clicked something and can close this
        'mBoxBtnId', // so we can keep track of multiple mboxs at once
        'action', // Char, either '!ADD!' or '!MODIFY!'
        'journalId', // Char. jrnDtlid to modify

        'oLocalData', // contains 2 properties, oJournal & oJrnDtl, pass in the breakdown (i.e. from bank register so they can itemize)
        'retOnly', // only return the data, don't save it (i.e. called from bank register and it will save)
        'debitLbl', // override the 'debit' label (i.e. deposit) NOTE: STill shows 'debit' after this label: Deposit (Debit)
        'creditLbl', // override the 'credit' label (i.e. withdrawal)
    ],
    components: {
    },
   

    async created(){
        // don't put anything here
       

        if (!this.Sublib.doDefaultCreatedPopUp(this)){
            this.btnCancelClicked();
            return;
        }

        if (this.action == '!ADD!'){
            this.journalId = '!ADD!';
        }

        this.selTab = 0; // 0 based
        this.showMbox = true;
        await this.getjrnDtl();

        // try {
        //     this.$refs.tabDtl.$el.click();
        // } catch (ignore){
        // }

    }, // created


    //**************************************************************************************************************
    methods: {
        //**************************************************************************************************************
        async getjrnDtl(){
            this.showLoading = true;

            var mURL = this.Sublib.getWSUrl() + 'journal/getJrnDtl'; 
            var oParams = {
                journalId: this.journalId
            }

            var resp = await this.RestClient.getNoCache(mURL, oParams);
            var oData = this.Sublib.wsResp2Obj(resp);          
            
            this.showLoading = false;

            if (oData.errorMsg){
                this.Sublib.mbox(oData.errorMsg);
                this.oJournal = {};
                return;
            }

            if (!this.oLocalData){
                // This is the default
                this.oJournal = oData[0];
                // if (!this.Sublib.inList(this.oJournal.refidtype, 'JRN', 'STB') 
                //     || (this.Sublib.left(this.oJournal.refid, 3) == 'IMP' && this.oJournal.refidtype != 'STB')){
                if (!this.Sublib.inList(this.oJournal.refidtype, 'JRN', 'STB') && this.Sublib.left(this.oJournal.refid, 3) != 'IMP'){
                    // transactions from other types (i.e. invoice) are read only
                    this.readOnly = true;
                }

                this.oJournalOrig = JSON.parse(JSON.stringify(oData[0]));
                this.oJrnDtl = this.Sublib.wsResp2Obj(resp, 2).addProps({'deleted': false });

            } else {
                // passed some values in (i.e. from the bank register), use those
                this.readOnly = false;
                this.oJournal = this.oLocalData.oJournal;
                this.oJrnDtl = this.oLocalData.oJrnDtl.addProps({'deleted': false });
            }

            
            this.oGLCodes = this.Sublib.wsResp2Obj(resp, 3);
            this.oBranches = this.Sublib.wsResp2Obj(resp, 4);
            //this.$refs.cboBranches.itemsChanged(); // Switching to v-show instead of v-if fixed it. watcher on cpSelBranches wasn't picking up that oBranches changed, force it to render the CSS Styling for branch color. SRR 08/17/2023
            //this.$set(this.oBranches, false, this.Sublib.wsResp2Obj(resp, 4));
            //this.oBranches.appendFrom(this.Sublib.wsResp2Obj(resp, 4));

            
        }, // getjrnDtl


        //**************************************************************************************************************
        async btnDtClicked(){
            // mField = Char. Field directly off of job to set
            var mDateHold = this.oJournal.dt;

            if (this.Sublib.emptyDt(mDateHold)){
                mDateHold = await this.Sublib.getDate(true);
            }

            mDateHold = this.Sublib.newDate(mDateHold);

            mDateHold = await this.Sublib.datePicker(mDateHold);
            if (!mDateHold){
                return 
            }

            this.oJournal.dt = mDateHold;
        }, // btnDtClicked

        
        //**************************************************************************************************************
        btnCancelClicked() {
            this.retval = '!CANCEL!'; // watcher in this.Sublib will detect this value has changed
            this.showMbox = false;
        }, // btnCancelClicked


        

        //**************************************************************************************************************
        // Save out the term
        async btnOKClicked(){

            let msg = '', choice;
            // *** Error Checking ***
            let debits = this.oJrnDtl.calcSum(obj => !obj.deleted ? obj.debit : 0);
            let credits = this.oJrnDtl.calcSum(obj => !obj.deleted ? obj.credit : 0);

            if (this.oJournal.refidtype == 'STB'){
                // Starting balance entry. does NOT have an offsetting entry, only 1 JrnDtl rec!
                // Can also be 0.00. SRR 11/14/2023
                if ((debits + credits) && !this.oJournal.amount){
                    // default in the amount
                    this.oJournal.amount = debits + credits;

                } else if (!(debits + credits) && this.oJournal.amount){
                    // default in the debits and credits
                    let oGL = this.oGLCodes.find(obj => obj.glcodesid == this.oJrnDtl[0].glcodesid);
                    if (oGL.gltype == 'A' || this.Sublib.inList(oGL.glsubtype, 'EXP', 'CRV')){
                        // Asset or Expense / Contra-Revenue account
                        this.oJrnDtl[0].debit = this.oJournal.amount;
                    } else {
                        this.oJrnDtl[0].credit = this.oJournal.amount;
                    }

                } else if ((debits + credits) != this.oJournal.amount){
                    msg = this.Sublib.getLbl('journal details dont match journal total update');
                    msg = msg.replace('<JOURNALAMT>', this.Sublib.applyInputMask(this.oJournal.amount, '###,###.##'));
                    msg = msg.replace('<DEBITAMT>', this.Sublib.applyInputMask(debits || credits, '###,###.##'));
                    choice = await this.Sublib.mbox(msg, this.Sublib.getLbl('update'), this.Sublib.getLbl('cancel'));
                    if (choice == 2){
                        // cancel
                        return false;
                    }

                    // update the journal summary to match what they typed in
                    this.oJournal.amount = debits;
                }

            } else {

                if (!this.oJournal.branchesid){
                    this.Sublib.mbox(this.Sublib.getLbl('must select a branch'));
                    return false;

                } if (this.oJrnDtl.find(obj => obj.glcodesid && !obj.debit && !obj.credit && !obj.deleted)){
                    // selected a GL Code but no dollar amounts. Basically pointless. Don't let it through.
                    this.Sublib.mbox(this.Sublib.getLbl('gl code must have a debit or credit'));
                    return false;
                
                } else if (this.oJrnDtl.find(obj => !obj.glcodesid && (obj.debit || obj.credit) && !obj.deleted)){
                    this.Sublib.mbox(this.Sublib.getLbl('jouranl entry must have gl codes'));
                    return false;

                } else if (this.oJrnDtl.calcCnt(obj => !obj.deleted) < 2){
                    this.Sublib.mbox(this.Sublib.getLbl('journal must have entries'))
                    return false;
            
                } else if (debits != credits){
                    this.Sublib.mbox(this.Sublib.getLbl('debits credits must equal'))
                    return false;

                } else if (debits != this.oJournal.amount){
                    // Show an error message or just update the summary field amount? Let's ask them
                    msg = this.Sublib.getLbl('journal details dont match journal total update');
                    msg = msg.replace('<JOURNALAMT>', this.Sublib.applyInputMask(this.oJournal.amount, '###,###.##'));
                    msg = msg.replace('<DEBITAMT>', this.Sublib.applyInputMask(debits, '###,###.##'));
                    choice = await this.Sublib.mbox(msg, this.Sublib.getLbl('update'), this.Sublib.getLbl('cancel'));
                    if (choice == 2){
                        // cancel
                        return false;
                    }

                    // update the journal summary to match what they typed in
                    this.oJournal.amount = debits;
                } 
                
                
                if (this.oJournal.refidtype != 'JRN' 
                    && this.Sublib.left(this.oJournal.refid, 3) != 'IMP' // Imported transactions don't have an offsetting entry. SRR 12/21/2023
                    && this.oJournal.amount != this.oJournalOrig.amount 
                    && !this.retOnly){

                    choice = await this.Sublib.mbox(this.Sublib.getLbl('journal amount out of balance with original transaction').replace('<ORIG>', this.Sublib.formatJournalRefType(this.oJournal)), 
                                                    this.Sublib.getLbl('save'), this.Sublib.getLbl('cancel'));
                    if (choice == 2){
                        // cancel
                        return false;
                    }
                }
            }

            // *** End Error Checking ***
            
            this.oJrnDtl.deleteFor(obj => this.Sublib.contains(obj.jrndtlid, '!ADD!', true) && !obj.glcodesid && !obj.debit && !obj.credit); // Clicked add but never actually 'added' anything or cleared everything out but didn't click 'delete'.

            

            this.showSaving = true;


            if (this.retOnly){
                // Don't save anything, just send the data back
                this.retval = JSON.stringify({
                    oJournal: this.oJournal,
                    oJrnDtl: this.oJrnDtl,
                });

                this.showMbox = false;
                return;
            }


            // NOTE: Desktop doesn't do any error checking (i.e. name cannot be blank) so I'm mirroing that
            var mURL = this.Sublib.getWSUrl() + 'journal/saveJournal'; 
            let oParams = {};
            let oBodyoParams = {
                journal: JSON.stringify(this.oJournal),
                jrnDtl: JSON.stringify(this.oJrnDtl)
            }

            var resp = await this.RestClient.postNoCache(mURL, oParams, oBodyoParams);
            var oData = this.Sublib.wsResp2Obj(resp);          
            
            this.showSaving = false;

            if (oData.errorMsg){
                this.Sublib.mbox(oData.errorMsg);
                return;
            }

            this.retval = oData.journalid;
            this.showMbox = false;

        }, // btnOKClicked

    } // methods
} // export default
</script>

<!-------------------------------------------------------------------------------------------------------------------------------------------------->
<style scoped>
 .jrnDtl { margin:0 auto; }
 h2 { margin-bottom:20px; }

#jrnDtl-info .container { padding: 4px; }
#jrnDtl-info .col { padding-top: 0px; padding-bottom: 0px; }
</style>