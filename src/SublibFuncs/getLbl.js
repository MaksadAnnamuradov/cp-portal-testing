
//import multiLanguage from '../labels.vue';

import enCSVFile from '../LangPack/en.csv';
import spCSVFile from '../LangPack/sp.csv';
import geCSVFile from '../LangPack/ge.csv';
import ptCSVFile from '../LangPack/pt.csv';


// NOTE: because we do Vue.prototype.Sublib.getLbl = GETLBL.bind(Vue.prototype.Sublib); // bind the 'this' to the Sublib object so I can access it's properties
// this in the method below references Sublib!. SRR 11/28/2023

export function getLbl (mLbl, mForceLang, mForceCntry) {
        // mLbl = Char. i.e. 'welcome'
        // mForceLang = Char. Optional. either 'en' or 'sp' (or any other future languages we support)
        //              Even though we are in spanish in our settings, get an english label (nice for things like signatures where the customer probably speaks english)

        if (!mLbl){
            mLbl = ''; // don't error out on the .toLowerCase below
        }
        mLbl = mLbl.toLowerCase();

        var mLang, mLangCntry;
        if (mForceLang){
            mLang = mForceLang
        } else {
            mLang = localStorage.getItem('lang');
            if (!mLang){
                this.getSelLang() // read from the browser their default language / country. SRR 06/21/2023
                mLang = localStorage.getItem('lang');
            }

            if (!mLang || mLang == 'us'){
                mLang = 'en'; // default to u.s.a.
                localStorage.setItem('lang', mLang);
            }
        }

        if (mForceCntry){
            mLangCntry = mForceCntry
        } else {
            mLangCntry = localStorage.getItem('langCntry');
            if (!mLangCntry){
                mLangCntry = '';
            }
        }
        
       //var mRetVal = multiLanguage.getLbl(mLbl, mLang, mLangCntry); // old way, uses the gian JSON array file in labels.vue

       // New Way, use our CSV files / lang packs. SRR 12/07/2023
       // NOTE: this.getLangPack() should be called BEFORE this method or this.aLabels will NOT be populated. SRR 12/07/2023
        if (!this.aLbls || !this.aLbls.length){
            this.loadLangPack(mLang); // async method, and this one is not. sets this.aLabels
            //return ''; // just don't error out
        }


        let mRetVal = this.getLbl2(mLbl, mLang, mLangCntry);
        
        
        // account for a few global replaces. SRR 06/29/2023
        //mRetVal = this.strtran(mRetVal, '<APPNAME>', multiLanguage.getLbl('app name', mLang, mLangCntry));
        let holderCnt = this.occurs(mRetVal, '<');
        let mStart = -1, mEnd = -1, holdVal = '', swapped = 0;
        let replaceVal = '';

        for (var mx = 1; mx <= holderCnt; mx++){
            if (mx == 1) {
                mStart = mRetVal.indexOf("<");
                mEnd = mRetVal.indexOf(">");

            } else {       
                //mStart = this.getIndex(mRetVal, '<', mx - 1);
                mStart = this.getIndex(mRetVal, '<', mx - swapped);
                //holdVal = mRetVal.substring(mStart);
                //mEnd = this.getIndex(mRetVal, '>', mx - 1);
                mEnd = this.getIndex(mRetVal, '>', mx - swapped);
            }

            holdVal = mRetVal.substring(mStart, mEnd + 1);
            if (this.contains(holdVal, ' ')){
                continue; // not a real place holder
            }
            
            replaceVal = this.getLbl2(holdVal, mLang, mLangCntry);
            if (replaceVal && !this.contains(replaceVal, 'lbl not defined', true) && !this.contains(replaceVal, 'not found', true)){

                // found it. See if we need to do anything with the case (i.e. lower, upper, or proper)
                if (mRetVal.substr(mStart -1, 1) == '(' && mRetVal.substr(mEnd + 1, 1) == ')'){
                    // wrapped in a function. Figure out what it is. (i.e. lower(<lblbranch>)
                    try {
                        if (mRetVal.substr(mStart - (1 + 5), 5).toLowerCase() == 'lower'){
                            // want to lower it
                            replaceVal = replaceVal.toLowerCase();
                            holdVal = mRetVal.substr(mStart - (1 + 5), 5) + '(' + holdVal + ')'; // make sure the strtran takes out the command as well
                        } else if (mRetVal.substr(mStart - (1 + 5), 5).toLowerCase() == 'upper'){
                            // upper it
                            replaceVal = replaceVal.toUpperCase();
                            holdVal = mRetVal.substr(mStart - (1 + 5), 5) + '(' + holdVal + ')'; // make sure the strtran takes out the command as well

                        } else if (mRetVal.substr(mStart - (1 + 6), 6).toLowerCase() == 'proper'){
                            // proper case it
                            replaceVal = replaceVal.toProperCase();
                            holdVal = mRetVal.substr(mStart - (1 + 6), 6) + '(' + holdVal + ')'; // make sure the strtran takes out the command as well
                        } else {
                            // nothing to do, not supported
                        }
                    }catch(ignore){
                        // just put the word in (), not actually a function and index may go negative, don't error out
                    }

                }
                
                swapped++;
                mRetVal = this.strtran(mRetVal, holdVal, replaceVal, 1);
            }
            
        } // for


        return mRetVal;
    
 } // getLbl


 // *********************************************************************************
 // Since this can be called multiple times from getLbl, making it it's own function (kind of what multilangage.getLbl() used to do) SRR 12/07/2023
 export function getLbl2 (mLbl, mLang, mLangCntry) {
    let mRetVal;

    mLbl = mLbl.toLowerCase();

    var oLbl = this.aLbls.find((obj) => {
        return obj.lbl == mLbl;
    });

    if (!oLbl){
        mRetVal = 'Label: ' + mLbl + ' not found';
        return mRetVal;
    }

    mRetVal = oLbl[mLangCntry] || oLbl.dflt;
    
    if (typeof mRetVal == 'object'){
        // New way of doing it so countries can have an override (i.e. our locale table). SRR 12/21/2022
        if (mCountry && mRetVal[mCountry]){
            // country has an override from the default english label
            mRetVal = mRetVal[mCountry];
        } else {
            mRetVal = mRetVal.dflt;
        }
    }

    
    if (!mRetVal){
        //mRetVal = '';
        mRetVal = "'" + mLbl + "' lbl not defined in " + mLang;
        return mRetVal
    }

    return mRetVal;

 } // getLbl2



// *********************************************************************************
// Load the lang pack they want since we no longer use a giant JSON file
// Got it to import the actual file so don't have to be async anymore. Wahoo! (see vue.conifg raw-loader). SRR 12/07/2023
//export async function loadLangPack (lang){
export function loadLangPack (lang){

    if (window.g_loadingLangPack)
        return;

    window.g_loadingLangPack = true;

    if (!lang)
        lang = localStorage.getItem('lang');

    if (!lang){
        this.getSelLang(); // read from the browser their default language / country. SRR 06/21/2023
        lang = localStorage.getItem('lang');
    }

    let csvStr;
    if (lang == 'en'){
        //console.log(enCSVFile);
        //csvStr = await fetch(enCSVFile).then(response => response.text());
        this.aLbls = this.csv2JSON(enCSVFile);
    } else if (lang == 'sp'){
        //csvStr = await fetch(spCSVFile).then(response => response.text());
        this.aLbls = this.csv2JSON(spCSVFile);
    } else if (lang == 'ge'){
        //csvStr = await fetch(geCSVFile).then(response => response.text());
        this.aLbls = this.csv2JSON(geCSVFile);
    } else if (lang == 'pt'){
        //csvStr = await fetch(ptCSVFile).then(response => response.text());
        this.aLbls = this.csv2JSON(ptCSVFile);
    } else {
    }


    //this.aLbls = await this.csv2JSON(csvStr);

    window.g_loadingLangPack = false;

} // loadLangPack


 // *********************************************************************************
// this will copy a JSON string to the clipboard so I can then run a prg in VFP to convert it to an excel table I can send to people to translate
// in webconnect, run "DO [proc] in lbls"
export function copyLblList2Clipboard() {
    var mHold = JSON.stringify(multiLanguage.aLabels);
    this.copy2Clipboard(mHold);

} // copyLblList2Clipboard

// *********************************************************************************
// Make it so I can access the lbls list in the console. SRR 07/31/2023
export function lblListArray() {
    return multiLanguage.aLabels;
} // lblListArray


// *********************************************************************************
// Check to see if we have any dups in our labels list so don't have to pay for dup tranlsations
export function checkLbls4Dups() {
    var aHold = multiLanguage.aLabels.breakRef();
    var aHold2 = aHold.breakRef();

    var aDups = [];
    var mDupFound;
    var oDup;

    for (var mx = 0; mx < aHold.length; mx++){
        mDupFound = false;
        oDup = { lbl: '', lblNos: [], dupObjs: []};

        if (aDups.length && aDups.find(obj => obj.lblNos.find(num => num == mx))){
            // already hit this on the my loop side
            continue;
        }


        for (var my = 0; my < aHold2.length; my++){
            if (mx == my){
                continue;

            } else if (aHold[mx].lbl == aHold2[my].en.lbl){
                // got a dup
                if (!oDup.lbl){
                    oDup.lbl = aHold[mx].lbl;
                }
                if (!oDup.lblNos.find(num => num == mx)){
                    oDup.dupObjs.push(aHold[mx]);
                    oDup.lblNos.push(mx)
                }
                oDup.lblNos.push(my)
                oDup.dupObjs.push(aHold[my]);
                //break;
            } else if (aHold[mx].en.dflt == aHold2[my].en.dflt){
                // got a dup
                if (!oDup.lblNos.find(num => num == mx)){
                    oDup.dupObjs.push(aHold[mx]);
                    oDup.lblNos.push(mx)
                }
                oDup.lblNos.push(my)
                oDup.dupObjs.push(aHold[my]);
                //break;
            }
        } // for my

        if (oDup.dupObjs.length){
            aDups.push(oDup);
        }

    } // for mx

    return aDups;

} // checkLbls4Dups