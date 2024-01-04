//import multiLanguage from './labels.vue';



import icons from './icons.vue';
import colors from './colors.vue';
import styles from './styles.vue';

import TOAST from './components/MsgBoxes/toast.vue';

import { timeout } from 'q';

import platform from 'platform';

import html2canvas from 'html2canvas';
import domtoimage from 'dom-to-image';

import * as LBLFUNCS from './SublibFuncs/getLbl.js';
import * as GLOBALPOPUPS from './SublibFuncs/globalPopUps.js'; //<!--added -Nov 29, 2023 -->


// Import the functions you need from the SDKs you need
import { initializeApp as fb_initializeApp } from "firebase/app";
import { getAnalytics as fb_getAnalytics } from "firebase/analytics";
import { getMessaging as fb_getMessaging, getToken as fb_getToken, onMessage as fb_onMessage,  onNewToken as fb_onTokenRefresh } from "firebase/messaging";


export default {
    name: 'Sublib',
    
    install(Vue, params){

    Vue.prototype.Sublib = { Vue }; // give me access to the vue object when my methods are called
    //Vue.config.errorHandler = Vue.prototype.Sublib.handleError;

    Vue.prototype.Sublib.oVuetify; // set before the methods below are called so we have access to the props (can't figure out another way to reference it)
    Vue.prototype.Sublib.RestClient; // set before the methods below are called so we have access to the RestClient Methods (can't figure out another way to reference it)
    Vue.prototype.Sublib.IDB;
    Vue.prototype.Sublib.serviceWorkerReg;
    //Vue.prototype.Sublib.router; 
    Vue.prototype.Sublib.routerRef; 
    Vue.prototype.Sublib.math; // real math, what a concept.
    Vue.prototype.Sublib.cryptoJS; // couldn't get it to work via an import. Crazy. Set via app.vue. SRR 09/06/2023

    Vue.prototype.Sublib.pwaPrompt; // used to add app to home screen, actual value set by App.uve

    Vue.prototype.Sublib.openPopUpCnt = 0;
    Vue.prototype.Sublib.routeChangedByUs = false;

    Vue.prototype.Sublib.tmrNoActivity; // set below

    //Vue.prototype.Sublib.getLbl = GETLBL.bind(Vue.prototype.Sublib); // bind the 'this' to the Sublib object so I can access it's properties
    for (var func in LBLFUNCS){
        Vue.prototype.Sublib[func] = LBLFUNCS[func].bind(Vue.prototype.Sublib); // bind the 'this' to the Sublib object so I can access it's properties
    }

    Vue.prototype.Sublib.aLbls = []; // set below
    


    //Vue.prototype.Sublib = { ...Vue.prototype.Sublib, ...POPUPS }; 
    // For multiple functions in a .js file, have to add in this way. SRR 11/29/2023
    for (var func in GLOBALPOPUPS){
        Vue.prototype.Sublib[func] = GLOBALPOPUPS[func].bind(Vue.prototype.Sublib); // bind the 'this' to the Sublib object so I can access it's properties
    }

    //Vue.prototype.Sublib.loadLangPack(); // SRR 12/07/2023

    //Vue.prototype.Sublib.bgImgShowing = false;

//     // *********************************************************************************
//     // Despite the HTML5 enforcement of min and max on the up/down arrows of type=number control, to really make those values useful you still have to use Javascript.
//     // see https://stackoverflow.com/questions/32936352/html-number-input-min-and-max-not-working-properly
//     Vue.prototype.Sublib.htmlMinMax = function(oEl){
//         if (oEl.value != ""){
//             if (parseInt(oEl.value) < parseInt(oEl.min)){
//                 oEl.value = oEl.min;
//             }
//             if (parseInt(oEl.value) > parseInt(oEl.max)){
//                 oEl.value = oEl.max;
//             }
//         }
//     } // htmlMinMax


    
    


    // *********************************************************************************
    // In order to be able to 'block' the back button but still let popups change the URL, have to 'intercept' the router call and set a few properties
    // that we can reference. See App.vue  and this.Sublib.routerRef.beforeEach((to, from, next) => {}) for more info. SRR 11/10/2023
    // Sublib.routerRef = this.$router; // set in App.vue
    // Sublib.routerRef is what Sublib.router used to be. Now Sublib.router is a function that calls Sublib.routerRef so we can be backwards compatible
    Vue.prototype.Sublib.router = {
        SublibRef: null, // set via app.vue so we can reference Sublib stuff since in the object, 'this', refers to the object, NOT Sublib
        
        //__proto__: null, // set via app.vue
        //__proto__: this.SublibRef.routerRef,
        // Getter methods so I always return the accurate results without refactoring
        get currentRoute(){
            return this.SublibRef.routerRef.currentRoute;
        },
        get afterHooks(){
            return this.SublibRef.routerRef.afterHooks;
        },
        get beforeHooks(){
            return this.SublibRef.routerRef.beforeHooks;
        },
        get options(){
            return this.SublibRef.routerRef.options;
        },
        get history(){
            return this.SublibRef.routerRef.history;
        },
        get mode(){
            return this.SublibRef.routerRef.mode;
        },
        get app(){
            return this.SublibRef.routerRef.app;
        },
        get apps(){
            return this.SublibRef.routerRef.apps;
        },
        get fallback(){
            return this.SublibRef.routerRef.fallback;
        },
        get matcher(){
            return this.SublibRef.routerRef.matcher;
        },
        


        push: function(param1){
            // param1 = Char or object. Matches the router.push param1
            this.SublibRef.routeChangedByUs = true;
            this.SublibRef.routerRef.push(param1);
            this.SublibRef.routeChangedByUs = false;

        }, // push
        replace: function(param1){
            // param1 = Char or object. Matches the router.replace param1
            this.SublibRef.routeChangedByUs = true;
            this.SublibRef.routerRef.replace(param1);
            this.SublibRef.routeChangedByUs = false;

        }, // replace
        go: function(param1){
            // param1 = Number. Matches the router.go param1
            this.SublibRef.routeChangedByUs = true;
            this.SublibRef.routerRef.go(param1);
            this.SublibRef.routeChangedByUs = false;

        }, // go

    }, // router
    

    // *********************************************************************************
    // Run default code in Vue's created method
    // Returns: true if everything worked, otherwise false
    // NOTE: If this returns false, other code should kick out immediately
    Vue.prototype.Sublib.doDefaultCreated =  async function(){

        if (this.router && this.routerRef.currentRoute.hash){
            this.scrollTo(this.routerRef.currentRoute.hash);
        }

        //this.showBGImg(); // take off any bg Image. Only want on the home screen and it will manually reshow it. SRR 03/08/2023

        return true;
    }, // doDefaultCrated


    // *********************************************************************************
    // Run default code in Vue's created method
    // Returns: true if everything worked, otherwise false
    // NOTE: If this returns false, other code should kick out immediately
    // NOTE: This CANNOT be async or vuetify will not load right. Not sure why... SRR 09/25/2023
    Vue.prototype.Sublib.doDefaultCreatedPopUp =  function(_this, ignoreSignIn){
        // _this = Object. Reference to 'this' in the popup
        // ignoreSignIn = Logical. If true, ignores checking if they are signed in. Helpful when we need to do this on a page that a customer gets via a link. SRR 12/20/2023
        
        if (!_this.$vuetify || !_this.$vuetify.theme || !_this.$vuetify.breakpoint){
            _this.$vuetify = this.oVuetify;    
        }

        // Since I can't make this async, check this way. Crazy.
        let _SublibThis = this;

        if (!ignoreSignIn){
        }

        
        if (this.router && this.routerRef.currentRoute.hash){
            this.scrollTo(this.routerRef.currentRoute.hash);
        }

        //this.showBGImg(); // take off any bg Image. Only want on the home screen and it will manually reshow it. SRR 03/08/2023

        return true;
    }, // doDefaultCrated




    // *********************************************************************************
    // copy some text to the clipboard
    Vue.prototype.Sublib.copy2Clipboard = function(mText2Copy) {
        var textArea = document.createElement("textarea");
        textArea.value = mText2Copy;
        //textArea.style.display = 'none';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        //element.style.display = 'none';
        
        document.execCommand('copy');
        document.body.removeChild(textArea);

    }, // copy2Clipboard


    // *********************************************************************************
    // copy some text to the clipboard
    Vue.prototype.Sublib.copy2ClipboardAsync = async function(mText2Copy) {
        if (navigator.clipboard){
            await navigator.clipboard.writeText(mText2Copy);

        } else {
            // try the 'old' way (synchronous was way better)
            this.copy2Clipboard(mText2Copy);
        }

    }, // copy2Clipboard


    // *********************************************************************************
    // copy some text to the clipboard
    // NOTE: this doesn't actually work. Have to use the new clipboard api for 'security' reasons
    Vue.prototype.Sublib.readClipboard = function() {
        var textArea = document.createElement("textarea");
        
        //textArea.style.display = 'none';
        document.body.appendChild(textArea);
        textArea.focus();
        //textArea.select();
        //element.style.display = 'none';
        
        var mRetVal;
        if (document.execCommand('paste')){
            mRetVal = textArea.value;
        } else {
            mRetVal = '';
        }

        document.body.removeChild(textArea);

        return mRetVal;

    }, // readClipboard


    // *********************************************************************************
    // Read the content of the clipboard
    // NOTE: Must be triggered by a user 'action'
    Vue.prototype.Sublib.readClipboardAsync = async function() {
        var mRetVal;
        
        if (navigator.clipboard){
            mRetVal = await navigator.clipboard.readText();

        } else {
            mRetVal =  '';
        }

        return mRetVal;

    }, // readClipboardAsync


    // *********************************************************************************
    Vue.prototype.Sublib.getIcon = function(mIcon) {
        // mIcon = Char. i.e. 'sign in'
        mIcon = mIcon.toLowerCase();
        var mRetVal = icons.getIcon(mIcon);
        return mRetVal;
    }, // getIcon


    // *********************************************************************************
    Vue.prototype.Sublib.getColor = function(mColor) {
        mColor = mColor.toLowerCase();
        var mRetVal = colors.getColor(mColor);
        return mRetVal;
    }, // getColor


    // *********************************************************************************
    Vue.prototype.Sublib.getStyle = function(mStyle, oVuetify) {
        mStyle = mStyle.toLowerCase();
        var mRetVal = styles.getStyle(mStyle, oVuetify);
        return mRetVal;
    }, // getStyle


    // *********************************************************************************
    Vue.prototype.Sublib.getPopupWidth = function(mColumnCount, retColCnt, asBigAsPossible, popUpMode, sideBarId) {
        // mColumnCount = Numeric. Number of cards wide the popup can support on bigger screens
        //mGetColCount = Boolean. If true, then return the number of columns the popup can support
        // asBigAsPossible = Logical. If true and you pass 2 for mColumnCnt but 1.8 will fit, will do 1.8
        // popUpMode = Logical. If true, on mobile phones, it will remove -50 from the width so it does not scroll on the bottom side to side MA 10/10/2023
        // sideBarId = Char. Optinal. If passed, this is the side bar ID to see if it's open or not with filters to adjust the width with. SRR 11/02/2023

        if (!mColumnCount){
            mColumnCount = 1;
        }

        var mRetVal, mRetValColCnt;
        var mBaseWidth = this.getStyle('cardheader', this.oVuetify).width;

        if (mColumnCount > 1){
            mRetVal = mBaseWidth * (mColumnCount * 1.05);
            mRetValColCnt = mColumnCount;
        } else if(mColumnCount < 1){
            //we want smaller than the base width
            mRetVal = mBaseWidth * mColumnCount;
        } else {
            mRetVal = mBaseWidth
            mRetValColCnt = 1;
        }

        // see if a side pane is open and 'permanent' and if so, our max width is actually less that the window width. SRR 07/20/2023
        let sidePaneOpen = false, sidePandelWidth = 0;

        if (asBigAsPossible) {
            try {
                // this.contains(document.querySelectorAll('[permanet="true"]')[0].children[0].classList.value, 'v-navigation-drawer')
                let nodeList = document.querySelectorAll('[permanet="true"]');
                if (nodeList){
                    let nodeNo;
                    if (sideBarId){
                        nodeNo = [...nodeList].findIndex(x => x.id == sideBarId)

                        if (nodeNo < 0){ //return -1 if not found
                            // just default back to how we used to do it?
                            nodeNo = nodeList.length - 1; // max thinks we should check the most recent. Might want to check if any is open.. We shall see. SRR 10/31/2023
                        }
                    } else {
                        nodeNo = nodeList.length - 1; // max thinks we should check the most recent. Might want to check if any is open.. We shall see. SRR 10/31/2023
                    }

                    if (this.contains(nodeList[nodeNo].children[0].classList.value, 'v-navigation-drawer')){
                        // Make sure it's really 'visible'
                        // it basically slides off of the screen so have to calculate if it would be showing or not. SRR 08/08/2023
                        let oDimen = nodeList[nodeNo].children[0].getBoundingClientRect();   
                        if (oDimen.x + oDimen.width <= window.innerWidth){
                            // showing
                            sidePandelWidth = nodeList[nodeNo].getBoundingClientRect().width;
                            sidePaneOpen = true;
                        } else {
                            // hiding
                            sidePaneOpen = false;
                        }


                        // sidePandelWidth = nodeList[0].getBoundingClientRect().width;
                        // sidePaneOpen = true;
                    } else {
                        sidePaneOpen = false;
                    }
                }
            } catch (ignore){
                sidePaneOpen = false;
            }
        }

        
        let maxWidth = window.innerWidth - sidePandelWidth
        if (maxWidth < mRetVal){
            if (asBigAsPossible){
                // try to stay big;
                while (maxWidth - 15 < mRetVal){
                    mColumnCount-= .1;
                    mRetValColCnt = mColumnCount;
                    mRetVal = mBaseWidth * (mColumnCount * 1.05);
                }

                if (mRetVal < mBaseWidth && this.oVuetify.breakpoint.mdAndDown){
                    // just go full screen on the phone. SRR 08/09/2023
                    //mRetVal = mBaseWidth
                    //mRetValColCnt = 1;
                    mRetVal = window.innerWidth - (popUpMode ? 50 : 0);
                    mRetValColCnt = this.math.round(mRetVal / mBaseWidth, 1);
                }

            } else {
                mRetVal = mBaseWidth
                mRetValColCnt = 1;
            }
        }
        
        if(retColCnt) mRetVal = mRetValColCnt;

        return mRetVal;        
    }, // getPopupWidth


    // *********************************************************************************
    Vue.prototype.Sublib.pageCenterStyle = function(contentWidth = 0) {
        // contentWidth = Numeric. How wide we are expecting our content to be so we can center it

        let sidePaneOpen = false, sidePandelWidth = 0;
        try {
            // this.Sublib.contains(document.querySelectorAll('[permanet="true"]')[0].children[0].classList.value, 'v-navigation-drawer')
            let nodeList = document.querySelectorAll('[permanet="true"]');
            if (nodeList){
                if (this.contains(nodeList[0].children[0].classList.value, 'v-navigation-drawer')){
                    // sidePandelWidth = nodeList[0].getBoundingClientRect().width;
                    // sidePaneOpen = true;
                    
                    // Make sure it's really 'visible'
                    // it basically slides off of the screen so have to calculate if it would be showing or not. SRR 08/08/2023
                    let oDimen = nodeList[0].children[0].getBoundingClientRect();   
                    if (oDimen.x + oDimen.width <= window.innerWidth){ // firefox requires the = to in the <=
                        // showing
                        sidePandelWidth = nodeList[0].getBoundingClientRect().width;
                        sidePaneOpen = true;
                    } else {
                        // hiding
                        sidePaneOpen = false;
                    }
                } else {
                    sidePaneOpen = false;
                }
            }
        } catch (ignore){
            sidePaneOpen = false;
        }

        let oRetVal = {};

        if (sidePandelWidth ){
            let availSpace = window.innerWidth - sidePandelWidth - 15;

            if (false && contentWidth + sidePandelWidth < window.innerWidth){
                // just let it center how it wants
                oRetVal = { 'margin': '0 auto'}

            } else {
                oRetVal['margin-top'] = 0;
                oRetVal['margin-bottom'] = 0;
                oRetVal['margin-left'] = Math.floor((availSpace - contentWidth) / 2) + 'px';
                oRetVal['margin-right'] = Math.floor(((availSpace - contentWidth) / 2) + sidePandelWidth) + 'px';

                if (Number(this.strtran(oRetVal['margin-left'], 'px', '')) > sidePandelWidth){
                    // plenty of space. Center in the window instead so it's closer to the side panel for easier navigation. 
                    oRetVal = { 'margin': '0 auto'}
                }
            }

        } else {
            oRetVal = { 'margin': '0 auto'}
        }
        
        return oRetVal;
        
    }, // pageCenterStyle



    // *********************************************************************************
    // equivalent to '$' in VFP, except last param is case sensitive or not
    Vue.prototype.Sublib.contains = function(string2Search, searchVal, caseInsensitve) {
            if (typeof string2Search != 'string') {
                return false;
            }
            // if (caseInsensitve) {
            //     string2Search = string2Search.toUpperCase();
            //     searchVal = searchVal.toUpperCase();
            // }

            // return string2Search.indexOf(searchVal) > -1;

            return string2Search.contains(searchVal, caseInsensitve); // added it to the string prototype, just call that so if there are changes it's in 1 place
    },


    // *********************************************************************************
    // For now, this is a wrapper around Sublib.toast(), 
    // but in case we ever want toast to be at the bottom and showMsg() to be at the top, putting this here. SRR 11/14/2022
    Vue.prototype.Sublib.showMsg = function(mText, mTimeOut, mIndefiniteProgBar) {
        return this.toast(mText, mTimeOut, mIndefiniteProgBar);
    } // showMsg


    // *********************************************************************************
    Vue.prototype.Sublib.toast = function(mText, mTimeOut, mIndefiniteProgBar) {
        // mText = Char
        // mTimeOut = Numeric. Optional. Time in seconds to display the toast. Pass -1 (or false) to have no timeout, otherwise defaults to 5 seconds
        // mIndefiniteProgBar = logical. If true, shows the indefinite spinner
        //                  NOTE: Can also pass a number between 0-100 to show an actual progress bar

        return new Promise(async (resolve, reject) => {

            //if (!mTimeOut){ // want to let 0 be a valid param
            if (mTimeOut == undefined || mTimeOut == null){
                // not passed
                // default to 5 seconds
                mTimeOut = 5
            } else if (typeof mTimeOut == 'boolean'){
                // passed false, default to no timeout
                mTimeOut = -1;
            }

             // shut down any previous toast. If we don't do this and we are calling it in a loop (i.e. scanning some table)
             // The UI keeps getting darker and darker around the toast (kind of like when we launch a bunch of mboxs on top of each other)
             var oElHold = document.getElementsByClassName('v-snack--active');
             for (var mx = 0; mx < oElHold.length; mx++){
                 oElHold[mx].style.display = 'none'
             }

            if (!mText){ 
                // just want to shut down all previous toasts and I'm out
                resolve('');
                return;
            }

            if (mTimeOut > 0) {
                mTimeOut *= 1000 // timeout is in miliseconds
            } else {
                // -1 means no timeout
                mTimeOut = 0; // version we are using passes 0, newer versions pass -1. SRR 11/14/2022
            }
            
            // I'm combining a bunch of stuff to make this work.
            // First, create the vue component
            var toastInstance = this.Vue.extend(TOAST); // toast component, imported at top of Sublib
            var oComponent = new toastInstance({ 
                propsData: { 
                    msg: mText, 
                    timeOut: mTimeOut,
                    indefiniteProgBar : mIndefiniteProgBar
                }
            }).$mount();

            // now add it to the DOM
            var oEl = document.getElementById('app').appendChild(oComponent.$el);
              
            // Remove the toast after the timeout (should already be done but just in case, don't clutter the dom, keep it clean man, keep it clean)
            timeout(function(){
                oEl.remove();
                resolve('');
            }, mTimeOut + 100);
        }); // promise
    }, // toast


    // *********************************************************************************
    // this will display a full screen vue dialog and block them out until they turn location services back on.
    Vue.prototype.Sublib.noLocScreen = function(mMsg) {
        // mMsg = Char. Base user message to display (why are we showing this)

        return new Promise(async (resolve, reject) => {
            // I'm combining a bunch of stuff to make this work.
            // First, create the vue component
            var mboxInstance = this.Vue.extend(NOLOC); // mbox component, imported at top of Sublib
            var domID = 'mbox_' + String(Date.now()) + String(Math.random()); // has to be unique
            var oComponent = new mboxInstance({ 
                propsData: { 
                    msg: mMsg, 
                    // title: mTitle, 
                    // btnCap1: mBtnCap1, 
                    // btnCap2: mBtnCap2, 
                    // btnCap3: mBtnCap3,
                    // retval: 0,
                    mBoxBtnId: domID,
                }
            }).$mount();

            // now add it to the DOM
            var oEl = document.getElementById('app').appendChild(oComponent.$el);
            
            // NOTE: couldn't get it to work without adding a 'button' to activate it
            // progrmatically click it and make the button invisible
            // document.getElementById('mbox_btn_launch').click();
            //var oLuanchBtn = document.getElementById('mbox_btn_launch');
            var oLuanchBtn = document.getElementById(domID);
            oLuanchBtn.style.display = 'none';
            oLuanchBtn.click();
            
            // Add a listener so we can get the value and return it
            oComponent.$watch('retval', function(newVal, oldVal){
                // this is triggered when they chose an option
                // Delete the component / element now that I'm done
                oEl.remove();
                resolve(Number(newVal));
            })
        }); // promise
    }, // noLocScreen




    // *********************************************************************************
    // This will convert a WS response to a JSON array
    Vue.prototype.Sublib.wsResp2Obj = function(avfpStr, part, mAll) {
        // avfpStr = Char. Web service response to convert (called AVFP as that's what we originally used)
        // part = Numeric. 'part' to get. i.e. we piggy backed multiple calls so it looks like 'VFPData...part1...|R|VFPData...part2....|R|VFPData...part3
        // mAll = Logical. if true, will take all parts and return 1 array with multiple objects (i object per part)

        var oData, mUsableData;

        if (mAll) {
            // NOTE: This make recursive calls!
            // Take all 'responses' contained in the string and return 1 array with multiple objects (each object is a 'response');
            var oCache = [], oHold2, mRespCnt, mhold, oHold3;
            mRespCnt = 0;

            mhold =this.occurs(avfpStr, '|R') + 1;
            for (var mb = 1; mb <= mhold; mb++) {
                oHold3 =this.wsResp2Obj(avfpStr, mb);
                if (oHold3 
                    && (!oHold3.errorMsg 
                        ||this.inList(oHold3.wsData, ['|R|', '{"VFPData":{"rows":[]}}', '{"VFPData":{"rows":}}', '|R|{"VFPData":{"rows":[]}}', '|R|{"VFPData":{"rows":}}'])
                        )
                    ) {
                    // '|R|' is a valid response as a place holder for things like tasks / task lists (i.e. q1 entered at time of order (|R| place holder), q2 = list)
                    // '{"VFPData":{"rows":}}' is a valid place holder but may get parsed with an error message of ':rows:'
                    mRespCnt++;
                }
            }

            if (mRespCnt == 0) {
                oData = {
                    'errorMsg': 'Error (21): No Data Found',
                    'wsData': avfpStr
                }
                return oData;
            }

            for (var mz = 1; mz <= mRespCnt; mz++) {
                oHold2 =this.wsResp2Obj(avfpStr, mz);
                if (oHold2.length == 1) {
                    // only 1 object. This is standard
                    oCache.push(oHold2[0]);
                } else {
                    // array of objects. something like our ft location list. Add the whole array
                    oCache.push(oHold2);
                }

            } // for 

            oCache.errorMsg = '';
            oCache.wsData = avfpStr;

            return oCache;

        } // mAll


        if (!part) {
            part = 1
        }

        var oError;

        if (!avfpStr) {
            oData = {
                'errorMsg': 'Error (17): Server did not respond/ Could not communicate with server. Verify internet connection.',
                'wsData': avfpStr
            }
            return oData;

        } else if (typeof avfpStr != 'string') {

            try {
                if (this.contains(avfpStr.data, 'isCallBackError', true)) {
                    // Web connect error!
                    // Looks something like '{"isCallbackError":true,"message":Alias is not found."}'
                    oError = JSON.parse(avfpStr.data);
                    oData = {
                        'errorMsg': 'Error (19) Web Connect Error: "' + oError.message + '"',
                        'wsData': avfpStr
                    }
                    return oData;
                }
            } catch (ignore) {
            }

            oData = {
                'errorMsg': 'Error (16): Failed to convert web service data to object',
                'wsData': avfpStr
            }
            return oData;

        } else if (this.contains(avfpStr, 'isCallBackError', true)) {
            // Web connect error!
            // Looks something like '{"isCallbackError":true,"message":Alias is not found."}'
            oError = JSON.parse(avfpStr);
            oData = {
                'errorMsg': 'Error (18) Web Connect Error: "' + oError.message + '"',
                'wsData': avfpStr
            }

            // want to have them send these to us so we can get them fixed. SRR 07/13/2023
            //this.handleError({message: 'Error (18) Web Connect Error: "' + oError.message + '"' + "\n\nwsData: " + avfpStr });
            // Moved to Rest Client so we have more info to send up to us. SRR 08/16/2023
            //this.handleError('Error (18) Web Connect Error: "' + oError.message + '"' + "\n\nwsData: " + avfpStr);

            return oData;

        } else if (avfpStr == '{"VFPData":{"rows":}}"' || avfpStr == '{"VFPData":{"rows":[]}}'
            || (part == 1 && this.left(avfpStr, '{"VFPData":{"rows":[]}}'.length) == '{"VFPData":{"rows":[]}}')) {
                // multiple parts but part 1 had no data. Won't hit this case like we're expecting. SRR 03/18/2023
            oData = {
                'errorMsg': 'Error (20): No Data Found',
                'wsData': avfpStr
            }
            return oData;

        } else if (part == 1 && this.left(avfpStr, '{"errorCode":'.length) == '{"errorCode":') {
            // multiple parts but part 1 had no data. Won't hit this case like we're expecting. SRR 11/13/2023
            // {"errorCode":"0","errorDesc":"No work orders found.", "datadt":"2023-11-13T13:44:12"}

            avfpStr = avfpStr.substring(0, avfpStr.indexOf('}') + 1);
            avfpStr = this.replaceAll(avfpStr, '\\\\', '\\\\'); // escape it so our parse works
            avfpStr = this.replaceAll(avfpStr, '\\\\"', '\"'); // make it so if we already escaped a double quote (\") it isn't now (\\") from the line above, otherwise the JSON.parse fails. 

            // we may have inadvertently escaped a \n which causes an error if it's escaped. SRR 02/10/2021
            avfpStr = this.replaceAll(avfpStr, '\\\\n', 'n'); // new line
            avfpStr = this.replaceAll(avfpStr, '\\\\t', 't'); // tab

            try {
                oData = JSON.parse(avfpStr);

                oData.errorMsg = oData.errorDesc;
                oData.wsData = avfpStr;

            } catch (JSONParse) {
                oData = {
                    'errorMsg': 'Error (21): Failed to convert web service data to object',
                    'wsData': avfpStr
                }
            }

            return oData;

        }

        var mStart, mEnd;
        if (part == 1) {
            mStart = avfpStr.indexOf(":[{");
            //var mEnd = avfpStr.lastIndexOf("}]}");
            mEnd = avfpStr.indexOf("}]}");
        } else {       
            mStart =this.getIndex(avfpStr, '|R', part - 1); // note: not doing |R| because we have a few calls that do |R1|...|R2|...etc.
            avfpStr = avfpStr.substring(mStart);
            if (this.occurs(avfpStr, '|R') > 1) {
                // Substring even more. Try to account for a response that looks like:
                //|R|{"VFPData":{"rows":}}|R|{"VFPData":{"rows":[{"lead":tru....
                avfpStr = avfpStr.substring(0,this.getIndex(avfpStr, '|R', 2));
            }

            mStart = avfpStr.indexOf(":[{");
            mEnd = avfpStr.indexOf("}]}");
        }

        oData = {};

        if (this.inList(avfpStr, ['{"VFPData":{"rows":[]}}', '{"VFPData":{"rows":}}', '|R|{"VFPData":{"rows":[]}}', '|R|{"VFPData":{"rows":}}'])){
            // This is a double check for multiple sets of data returned in 1 big string (catch above only works for simple)    
            oData = {
                'errorMsg': 'Error (21): No Data Found',
                'wsData': avfpStr
            }
            return oData;

        } else if (mStart != -1 && mEnd != -1) {
            // actual data returned
            mUsableData = avfpStr.substring(mStart + 1, mEnd + 2);
            //mUsableData =this.replaceAll(mUsableData, '\\\\n', '\\\\n'); // escape '\n' with '\\n'
            //mUsableData =this.replaceAll(mUsableData, '\\\\r', '\\\\n'); // escape '\r' with '\\n' (i've had problems with '\r' but '\n' always seems to work. SRR 10.11.2018)

            try {
                oData = JSON.parse(mUsableData);
                oData.errorMsg = '';

            } catch (JSONParse) {
                oData = {
                    'errorMsg': 'Error (14): Failed to convert web service data to object',
                    'wsData': avfpStr
                }
            }


        } else if (this.left(avfpStr, 1) == '['){
            // reponse is just a regular JSON array of objects '[{...}]'
            // may contain extra stuff at the end so make sure I only try to parse the actual array
            mStart = 0;
            mEnd = avfpStr.indexOf(']') + 1;
            mUsableData = avfpStr.substring(mStart, mEnd);
            try {
                //oData = JSON.parse(avfpStr);
                oData = JSON.parse(mUsableData);
                oData.errorMsg = '';

            } catch(ignore){
                oData = {
                    'errorMsg': 'Error (16): Failed to convert web service data to object',
                    'wsData': avfpStr
                }
            }


        } else {
            try {
                // response may be a simple JSON String that contains an error
                // parts handled above      
                if (this.occurs(avfpStr, '{') > 1) {
                    // May come back like: 
                    // {"errorCode":"-1","errorDesc":"FTSrv save error. {"errorCode":"-4 (1526)","errorDesc":"SQL Error: Arithmetic overflow error converting float to data type numeric. [1526:8115]"}"}
                    avfpStr =this.replaceAll(avfpStr, '{', '');
                    avfpStr =this.replaceAll(avfpStr, '}', '');
                    //avfpStr =this.replaceAll(avfpStr, '""', '"');
                    var mHoldErrorCode = avfpStr.substring(avfpStr.indexOf(':') + 1, avfpStr.indexOf(',')); // "-1"
                    mHoldErrorCode =this.replaceAll(mHoldErrorCode, '"', '');

                    var mHoldErrorDesc = avfpStr.substr(avfpStr.indexOf('errorDesc":') + 'errorDesc":'.length + 1); // "FTSrv Save error....
                    mHoldErrorDesc =this.replaceAll(mHoldErrorDesc, '"', '');

                    //avfpStr = '{' + avfpStr + '}';
                    avfpStr = JSON.stringify({
                        errorCode: mHoldErrorCode,
                        errorDesc: mHoldErrorDesc
                    });
                }

                avfpStr = this.replaceAll(avfpStr, '\\\\', '\\\\'); // escape it so our parse works
                avfpStr = this.replaceAll(avfpStr, '\\\\"', '\"'); // make it so if we already escaped a double quote (\") it isn't now (\\") from the line above, otherwise the JSON.parse fails. 

                // we may have inadvertently escaped a \n which causes an error if it's escaped. SRR 02/10/2021
                avfpStr = this.replaceAll(avfpStr, '\\\\n', 'n'); // new line
                avfpStr = this.replaceAll(avfpStr, '\\\\t', 't'); // tab

                mStart = avfpStr.indexOf("{");
                mEnd = avfpStr.indexOf("}");


                mUsableData = avfpStr.substring(mStart, mEnd + 2);

                oData = JSON.parse(mUsableData);

                oData.errorMsg = oData.errorDesc;
                oData.wsData = mUsableData;


            } catch (Ignore) {
                oData = {
                    'errorMsg': 'Error (15): Failed to convert web service data to object',
                    'wsData': avfpStr
                }
            }
        }

        return oData;
    }, // wsResp2Obj


    //**************************************************************************************************************
    // this does the oppositve of this.wsResp2Obj.
    // this will convert an array of data to a string thatthis.wsResp2Obj can parse
    Vue.prototype.Sublib.obj2WSResp = function(aData, mPartNo, mAllParts) {
        // aData = array, contains all objects to be converted
        // mPartNo = Numeric. Optional. If passed, only want that object converted.
        // allParts = Logical. If true, will combined multiple objects into 1 VFP resposne (i.e. multiple recs)
        

        // format to be like how the web service sends it
        // {"VFPData":{"rows":[{"arrived":"",....}]}}
        // if multiple:
        // {"VFPData":{"rows":[{"arrived":"",....}]}}|R|{"VFPData":{"rows":[{"arrived":"",....}]}}
        var mWSData = ''

        if (mAllParts) {
            // combine, make it an array of an array for the code below
            // NOTE: to format like: {"VFPData":{"rows":[{"arrived":"",....},{"arrived":"",....}]}}, pass in the array inside of an array and pass 0 for mPartNo
            //          i.e. [[{"arrived": ""}, {"arrived": ""}, {"arrived": ""}]]
           
            // I can't find a good use case for this code. Not sure why we had it...
            // It seems to be trying to deal with if it's not passed as an array of an array but don't think it works... (and we don't always want it to)
            // commenting out for now and letting calling method decide if it want's to pass as an array of an array. SRR 08.27.2019
            // if (aData.length == 1){
            //     var mhold = [];
            //     mhold.push(aData);
            //     aData = mhold;
            // }
        }

        if (mPartNo) {
            // only return 1 of the objects
            mWSData = '{"VFPData":{"rows":'
                + (!aData[mPartNo].hasOwnProperty('length') ? '[' : '') + JSON.stringify(aData[mPartNo]) + (!aData[mPartNo].hasOwnProperty('length') ? ']' : '') + '}}';

            return mWSData
        }

        

        // return all 
        // format like:  {"VFPData":{"rows":[{"arrived":"",....}]}}|R|{"VFPData":{"rows":[{"arrived":"",....}]}}
        for (var ma = 0; ma < aData.length; ma++) {
            // NOTE: 'objects' don't have a 'length' property but arrays do.
            //      Since all of our stuff is expecting everything as an array, need to add the '[]'

            if (aData[ma].errorMsg 
                && (aData[ma].wsData == '|R|' 
                    ||this.inList(aData[ma].wsData, ['{"VFPData":{"rows":[]}}', '{"VFPData":{"rows":}}', '|R|{"VFPData":{"rows":[]}}', '|R|{"VFPData":{"rows":}}'])
                    )
                 ) {
                // 'empty' data, still need to distinguish parts (i.e. tasks or WO Equip)
                mWSData += aData[ma].wsData; //'|R|';
                continue;
            }

            mWSData += (mWSData ? '|R|' : '');
            mWSData += '{"VFPData":{"rows":'
                + (!aData[ma].hasOwnProperty('length') ? '[' : '') + JSON.stringify(aData[ma]) + (!aData[ma].hasOwnProperty('length') ? ']' : '') + '}}';
        } // for
        

        return mWSData;
    }, // obj2WSResp


    // *********************************************************************************
    // Convert a CSV string to a JSON array of objects
    // NOTE: this can be sync or async depending on if it has to fetch the file or not
    Vue.prototype.Sublib.csv2JSON = function(csvStr, delimeter, lineEndingChar, oLines) {
        // csvStr = Char. CSV string to convert to JSON
        //      NOTE: Can also be a URL to a CSV file. If so, will pull it down and convert it to JSON ('https://localwschicago.cenpoint.com/tempdocs/TEST2/0000000003/_6R70SY7YK20231110143025.CSV')
        // delimter = Char. Optional. Defaults to ','. i.e. ',' or '|'
        // lineEndingChar = Char. Optional. Defaults to '\r\n'. i.e. '\n' or '\r\n'

        // NOTE: When we were testing this on sending back a file path from the webservice vs sending back JSON, it was drastically faster to send back the CSV file. SRR 11/10/2023

        if (!delimeter) delimeter = ',';
        if (!lineEndingChar) lineEndingChar = '\r\n'; // vfp csv files come back with \r\n
        if (!csvStr && oLines) csvStr = ''; // if oLines is passed in, we are just passing in an array of lines (i.e. from a file import)

        let oRetVal;
        if (this.left(csvStr, 'https://'.length) == 'https://') {
            // Need to switch to async
            // Go get the file and then parse it
            let _this = this;
            let csvStrHold = csvStr; // have to declare or can't see them in the promise function
            let delimeterHold = delimeter;
            let lineEndingCharHold = lineEndingChar;
            return new Promise(async (resolve, reject) => {
                // URL
                let mURL = csvStrHold;
                var resp = await fetch(mURL); // fetch gives us a few more options to easily convert the 'blob' to base 64
                var csvStr = await resp.text();

                let aRetVal = _this.csv2JSON(csvStr, delimeterHold, lineEndingCharHold); // recursive call so method can be both sync and async
                resolve(aRetVal); 
            });
        } 
            
        // NOTE: this does not convert the numbers to numbers. They are still strings. SRR 11/10/2023
        // If you pass the checkFields: true it converts ids to numbers (i.e. 0000000001 => 1)
        //oRetVal = await csvtojson().fromString(csvStr); 

        // this works but it converts my Ids to numerics (i.e. 0000000001 => 1). SRR 11/11/2023
        //oRetval = await alasql.promise("select * from csv('https://localwschicago.cenpoint.com/tempdocs/TEST/0000000009/_6R80GLYC320231111074455.CSV', {headers:true})")

        let startTm = new Date();

        // Writing my own parser to better deal with data types. SRR 11/10/2023
        
        if (!oLines){
            // This is the default!
            oLines = csvStr.split(lineEndingChar);

        } else if (typeof oLines[0] != 'string') {
            // array of lines already passed in (this is how they come when import a CSV file)
            // Fix how it comes through (it's an array of arrays, want a string per line, not an array per value)
            //oLines.map(row => { return row.join()});
            for (var mx = 0; mx < oLines.length; mx++){
                oLines[mx] = oLines[mx].join();
            }
        } else {
            // oLines passed in in the format it needs. 
        }

        let oHeaders = oLines[0].split(delimeter);
        oRetVal = [];

        let oHold, oRowData, holdVal, dataType;
        let regExSplitter = new RegExp(`${delimeter}(?=(?:(?:[^"]*"){2})*[^"]*$)`); // split on comma but ignore commas inside of quotes (i.e. "1,000" or an addres). See https://stackoverflow.com/questions/11456850/split-a-string-by-commas-but-ignore-commas-within-double-quotes-using-javascript

        try {
            // this.convFromStr(holdVal) may want to enhance this method in the future and then call it?
            for (var mx = 1; mx < oLines.length; mx++){
                if (oLines[mx] == '') break; // (i.e. last line in file])

                //oRowData = oLines[mx].split(delimeter);
                oRowData = oLines[mx].split(regExSplitter); // split on comma but ignore commas inside of quotes (i.e. "1,000"
                if (oRowData.length != oHeaders.length){
                    // may have had a line break in the middle of something and we split it into multiple lines. Try to piece it back together
                    holdVal = oLines[mx];
                    while (true){
                        mx++;
                        oRowData = oLines[mx].split(regExSplitter); 
                        if (oRowData.length != oHeaders.length){
                            holdVal += oLines[mx];
                            oRowData = holdVal.split(regExSplitter); 
                            if (oRowData.length == oHeaders.length){
                                // got them all
                                break;
                            }

                        } else {
                            // got the end;
                            break;
                            mx--; // go back one so the next loop picks up the right record
                        }
                    }
                } // oRowData.length != oHeaders.length



                if (mx == 1){
                    // figure out the data types so we only have to do it once. SRR 11/11/2023
                    oHeaders = oHeaders.map((item, index) => {
                        holdVal = oRowData[index];

                        // NOTE: " inside of "" is escaped by ", i.e. "5-20" cores" => "5-20"" cores"
                        if (holdVal != '""')
                            holdVal = this.replaceAll(holdVal, '""', '"'); // unescape it / put it how we want
                        
                        // Figure out what vartype it should be
                        if (this.left(holdVal, 1) == '"' && this.right(holdVal, 1) == '"'){
                            // If it's wrapped in "", keep it as a string (i.e. it's an ID or something)
                            //holdVal = holdVal.substring(1, holdVal.length - 1);
                            dataType = 'C'

                        } else if (this.inList(holdVal, 'true', 'false', 'yes', 'no', 'y', 'n', 't', 'f', true)){
                            // logical
                            dataType = 'L'
                            // if (this.inList(holdVal, 'true', 'yes', 'y', 't', true)){
                            //     holdVal = true;
                            // } else {
                            //     holdVal = false;
                            // }

                        } else if ((this.occurs(holdVal,'/') == 2 || holdVal.contains('T')) && typeof this.newDate(holdVal).getMonth == 'function'){
                            // date '11/13/2023' or '2023-11-13T16:40:26'
                            //holdVal = this.newDate(holdVal);
                            dataType = 'D'

                        } else if (this.isNumeric(holdVal)){
                            // Numeric
                            //holdVal = Number(holdVal);
                            dataType = 'N'

                        } else {
                            dataType = 'C'
                        }

                        return {
                            header: item,
                            dataType: dataType
                        }

                    }); // map
                } // mx == 1


                oHold = {}; // reset

                for (var my = 0; my < oHeaders.length; my++){
                    holdVal = oRowData[my];

                    // NOTE: " inside of "" is escaped by ", i.e. "5-20" cores" => "5-20"" cores"
                    if (holdVal != '""')
                        holdVal = this.replaceAll(holdVal, '""', '"'); // unescape it / put it how we want
                    
                    // Figure out what vartype it should be
                    if (oHeaders[my].dataType == 'C'){
                        // If it's wrapped in "", keep it as a string (i.e. it's an ID or something)
                        holdVal = holdVal.substring(1, holdVal.length - 1);

                    } else if (oHeaders[my].dataType == 'L'){
                        // logical
                        if (this.inList(holdVal, 'true', 'yes', 'y', 't', true)){
                            holdVal = true;
                        } else {
                            holdVal = false;
                        }

                    } else if (oHeaders[my].dataType == 'D'){
                        // date
                        holdVal = this.newDate(holdVal);

                    } else if (oHeaders[my].dataType == 'N'){
                        // Numeric
                        holdVal = Number(holdVal);
                    }

                    oHold[oHeaders[my].header] = holdVal;
                } // for (my) / headers

                oRetVal.push(oHold);
            } // for (mx) / lines
        } catch (oError){
            console.log(oError)
        }

        let endDt = new Date();
        //this.mbox('csv2JSON took ' + (endDt - startTm) / 1000 + ' sec (' + oRetVal.length + ') rows');
        //16,000 recs took 0.8 sec


        return oRetVal;
        
    }, // csv2JSON


    // *********************************************************************************
    // Convert an array of objects to a CSV string that could easily go to a file
    // Returns: Char. 
    Vue.prototype.Sublib.json2CSV = function(array2Conv) {
        // array2Conv = Array of Objects. Array of objects to convert to CSV

        let retval = '', holdVal, dataType, lineEnding = '\r\n';
        let aFields = [];
        
        Object.keys(array2Conv[0]).forEach((key) => {

            holdVal = array2Conv[0][key];

            if (typeof holdVal == 'object'){
                // Datetiems report as an object. Make sure it's not that
                if (typeof holdVal.getMonth == 'function'){
                    dataType = 'D'
                } else {
                    dataType = ''; // skip it
                }

            } else if (typeof holdVal == 'string'){
                // make sure it's not really a serialized date
                if ((this.occurs(holdVal,'/') == 2 || holdVal.contains('T')) && typeof this.newDate(holdVal).getMonth == 'function'){
                    // date '11/13/2023' or '2023-11-13T16:40:26'
                    //holdVal = this.newDate(holdVal);
                    dataType = 'D'
                } else {
                    dataType = 'C'
                }

            } else if (typeof holdVal == 'number'){
                dataType = 'N'
            } else if (typeof holdVal == 'boolean'){
                dataType = 'L'
            } else {
                dataType = 'C'
            }

          aFields.push({ field: key, dataType: dataType});

          // write the header
          retval += (retval ? ',' : '') + key;
        });

        
        // now for the actual data
        let rowStr;
        array2Conv.forEach((obj) => {
            retval += lineEnding;

            rowStr = '';
            aFields.forEach((oField) => {
                holdVal = obj[oField.field];
                if (oField.dataType == 'D'){
                    // date
                    holdVal = this.serializeDt(holdVal);
                } else if (oField.dataType == 'C'){
                    // string
                    holdVal = '"' + holdVal + '"';
                }

                rowStr += (rowStr ? ',' : '') + holdVal;
            });
            retval += rowStr;
        });

        return retval;

    } // Array.toCSV


    // *********************************************************************************
    // get a .json file we wrote to disk on the webservice since it was too big to send down and parse it
    // Returns: Array of Objects
    Vue.prototype.Sublib.getWebJSON = async function(mJSONURL, returnStr){
        // mJSONURL = Char. URL to the JSON file. i.e. 'https://localwschicago.cenpoint.com/tempdocs/TEST2/0000000003/_6R70SY7YK20231110143025.JSON'
        // returnStr = Logical. If true, returns the string instead of parsing it to an object. Useful if it contains multiple responses

        var resp = await fetch(mJSONURL); // fetch gives us a few more options to easily convert the 'blob' to base 64
        if (returnStr)
            return await resp.text(); // useful if 
        
        return this.wsResp2Obj(await resp.text());

    }, // getWebJSON


    // *********************************************************************************
    // similar to VFP's occurs()
    // NOTE: is ALWAYS case insensitive
    // see https://stackoverflow.com/questions/2903542/javascript-how-many-times-a-character-occurs-in-a-string
    Vue.prototype.Sublib.occurs = function(string, searchVal) {
        //return string.split( new RegExp( searchVal, "gi" ) ).length-1;
        if (!string) {
            // null or empty
            return 0;
        }
        
        return string.toLowerCase().split(searchVal.toLowerCase()).length - 1;
    }, // occurs



    // *********************************************************************************
    // replace all instances
    Vue.prototype.Sublib.replaceAll = function(str, find, replace, caseInsensitive) {
        return str.replace(new RegExp(find, (caseInsensitive ? 'i' : '') + 'g'), replace);
    }, // replaceAll


    // *********************************************************************************
    // this is like vfps strtran() so I can pass in the occurance except you can only do 1 occurance or all. 
    Vue.prototype.Sublib.strtran = function(str, find, replace, occurance, caseInsensitive) {
        if (occurance){
            var mIndex = this.getIndex(str, find, occurance);
            var mRetVal;
            if (mIndex < 0){
                // not in the string, just return the original
                mRetVal = str;
            } else {
                mRetVal = str.substring(0, mIndex) + replace + str.substring(mIndex + find.length);
            }
            
            return mRetVal;
           
        } else {
            return this.replaceAll(str, find, replace, caseInsensitive);
        }
    }, // replaceAll



    // *********************************************************************************
    // returns index of nth occurance of search val inside of string
    Vue.prototype.Sublib.getIndex = function(string, searchVal, nOccur) {
        
        if (!nOccur) {
            nOccur = 1;
        }
        return string.split(searchVal, nOccur).join(searchVal).length;
    }, // getIndex



    // *********************************************************************************
    // This is equivalent to addbs() in vfp but adds a forward slash instead (it is the web duh). 
    Vue.prototype.Sublib.addFS = function(mText) {
        // mText = Char.
        if (mText.substr(mText.length - 1) != '/') {
            mText += '/';
        }

        return mText;
    },


    // *********************************************************************************
    // had a problem where Android / webview was losing variables if they left the app open / in the background
    // for hours and then tried to come back in and click a button. Making it a method I can call to make sure it's always around. SRR 08.20.2018
    Vue.prototype.Sublib.getConnectInfo = function(mCode, mNoCache) {
        // mNoCache = Logical. If true, does NOT pull from cache and returns the value as if it's not set (i.e. for a reset). SRR 10/10/2022

        if (!mCode) {
            return '';
        }

        mCode = mCode.toUpperCase();

        var mRetVal = '';

        if (mCode == 'SERVER' || mCode == 'BASEURL') {
            mRetVal = localStorage.getItem("baseServerURL");
            if (!mRetVal || mNoCache) {
                // mRetVal = '';
                if (this.isTestingIP(true)){
                    mRetVal = 'https://localws.cenpoint.com/'
                    
                } else if (this.isTestingIP(false)){
                    // Try to mirror what it came from (i.e. alphaportal uses alphaws. localportal uses localws.
                    var mDomain = location.host; // localportal.cenpoint.com
                    mRetVal = mDomain.substring(0, mDomain.indexOf('.')); // localportal
                    mRetVal = mRetVal.replace('portal', '');
                    mRetVal = 'https://' + mRetVal + 'ws.cenpoint.com/'; // https://localws.cenpoint.com or https://alphaws.cenpoint.com
                    
                } else {
                    mRetVal = 'https://ws.cenpoint.com/';
                }
            }
            // mRetVal = mRetVal.replace('mobile1', 'ws'); // Switched from 'mobile1.cenpoint.com' to 'ws.cenpoint.com'. SRR 01.15.2018
            // mRetVal = mRetVal.replace('mobile2', 'ws'); // Switched from 'mobile1.cenpoint.com' to 'ws.cenpoint.com'. SRR 01.15.2018
            // mRetVal = mRetVal.replace('mobile', 'ws'); // Switched from 'mobile1.cenpoint.com' to 'ws.cenpoint.com'. SRR 01.15.2018

        } else if (mCode == 'CUSTCODE') {
            mRetVal = localStorage.getItem("custCode");

        } else if (mCode == 'TOKEN') {
            mRetVal = localStorage.getItem("token");
        }

        if (!mRetVal) {
            mRetVal = '';
        }

        mRetVal = mRetVal.trim();

        return mRetVal
    }, // getConnectInfo


    // *********************************************************************************
    // Wanted to simplify / easier to remember for when I have to manually type this in. SRR 07/20/2023
    Vue.prototype.Sublib.getWSURL= function(){
        return this.addFS(this.getConnectInfo('baseURL'));
    }, // getBaseURL

    Vue.prototype.Sublib.getWSUrl= function(){
        return this.getWSURL();
    }, // getBaseURL

    


    // *********************************************************************************
    Vue.prototype.Sublib.isIOS = function(onlyWant){
        // onlyWant = char. either 'ipad' or 'iphone'

        //var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        //return iOS;

        var retval = false;
        var retval = this.contains(platform.description, 'ios', true) // || this.contains(platform.description, 'safari', true) || this.contains(platform.description, 'apple', true) ;
        if (retval && onlyWant){
            // only want iPad or iPhone
            onlyWant = onlyWant.toLowerCase();
            if (onlyWant == 'ipad' && !this.contains(platform.product, 'ipad', true)){
                retval = false;

            } else if (onlyWant == 'iphone' && this.contains(platform.product, 'ipad', true)){
                retval = false;
            }
        }

        return retval;
    }, // isIOS


    // *********************************************************************************
    Vue.prototype.Sublib.isMac = function(){
        //var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        //return iOS;

        return this.contains(this.getDeviceInfo().product, 'Mac'); // || this.contains(platform.description, 'safari', true) || this.contains(platform.description, 'apple', true) 
    }, // isMac


    // *********************************************************************************
    Vue.prototype.Sublib.isAndroid = function() {
        // var ua = navigator.userAgent.toLowerCase();
        // var mAndroid = ua.indexOf("android") > -1; //&& ua.indexOf("mobile");
        // return mAndroid;
        return this.contains(platform.description, 'android', true);
    }, // isAndroid


    // *********************************************************************************
    // This will pull down the security levels they have that are stored in the DB
    // NOTE: WS does a double check in case someone tampers on the client side. 
    Vue.prototype.Sublib.getSecLevels = async function() {
        // userId = Char. Optional. UserId to get security for. Uses logged in user if not passed
        // NOTE: MUST be an admin to view other's security. 

        var mURL =this.getWSUrl() + 'cpauth/getUserSec';
        let oParams = { userId: '' }
        let simUserid = sessionStorage.getItem('simUserId');
        if (simUserid)
            oParams.userId = simUserid
        
        
        var resp = await this.RestClient.get(mURL, oParams, 'userSec');

        var oData =this.wsResp2Obj(resp);
        if (oData.errorMsg){
            this.mbox(oData.errorMsg);
            return false;
        }

        localStorage.setItem('oSecurity', JSON.stringify(oData[0]));

        return true;

    }, //getSecLevels


    // *********************************************************************************
    // This will pull down the security levels they have that are stored in the DB
    // NOTE: WS does a double check in case someone tampers on the client side. 
    Vue.prototype.Sublib.getUserPreferences = async function() {
        var mURL =this.getWSUrl() + 'cpUsers/getUserPreferences';
        var resp = await this.RestClient.get(mURL, false, 'getUserPreferences');

        var oData =this.wsResp2Obj(resp);
        if (oData.errorMsg){
            this.mbox(oData.errorMsg);
            return false;
        }

        localStorage.setItem('jobAddMode', oData[0].jobaddmode);

        return true;

    }, //getSecLevels

    // *********************************************************************************
    // Returns: Logical. True if user has security level, false if they don't
    Vue.prototype.Sublib.hasSec = function(mSecLevel) {
        // mSecLevel = Char. Security level to check
        mSecLevel = String(mSecLevel);

        if (!this.getConnectInfo('token')){
            // not signed in yet
            return false; 
        }

        var mHold = localStorage.getItem('oSecurity');
        if (!mHold){
            // go get the security settings
            this.getSecLevels();
            return false;
        }

        var oSec = JSON.parse(mHold);
        if (!oSec){
            return false;
        }

        return oSec['access' + mSecLevel];

    }, // hasSec


    // *********************************************************************************
    // returns true if running through webview, otherwise false
    Vue.prototype.Sublib.usingWebview = function(mPlatform) {   
        // mPlatform = Char. either 'android' or 'ios'

        if (!mPlatform){
            //mPlatform = 'android' // backwards compatible
            // Auto detect the platform (generic call if using webview, may not be a case statement where you do different things based on ios vs android)
            if (this.isAndroid()){
                mPlatform = 'android';
                
            } else if (this.isIOS()){
                mPlatform = 'ios';

            } else {
                mPlatform = ''; // windows
            }
        }

        mPlatform = mPlatform.toLowerCase();

        if (mPlatform == 'android'){
            return typeof android != 'undefined';

        } else if (mPlatform == 'ios') {
            if(typeof webkit != 'undefined'){
                //new way, webkit was not around in the old way MA 04/21/2023
                return true;
            }else{
                return this.isIOS() && !this.contains(this.getDeviceInfo().ua, 'safari', true);
            }

        } else {
            return false;
        }
        
    }, // usingWebView



    // *********************************************************************************
    // async / promis way for us to get the location so I can actually do it inline. Crazy. SRR 10.15.2018
    Vue.prototype.Sublib.getLocation = async function(mLetNoLocThrough, mRevGeo) {
        // mLetNoLocThrough = Logical. SHOULD ONLY BE TRUE if this is called from no-loc.vue methods!
        // mRevGeo = Logical. if true, makes a call to our server to reverse geo code the lat / long and gives us an address

        return new Promise(async (resolve, reject) => {
            var oRetVal = {};
            oRetVal.errorMsg = '';
            oRetVal.lat = 0.00;
            oRetVal.lon = 0.00;
            oRetVal.addr1 = '';
            oRetVal.city = '';
            oRetVal.state = '';
            oRetVal.postalCode = '';
            oRetVal.county = '';
            oRetVal.country = '';
            oRetVal.distOff = '';

            oRetVal.locationOn = true; // may change below


            if (this.contains(location.href, 'cpkey') || this.contains(location.pathname, 'signUp', true) || this.contains(location.pathname, 'redirect', true)){
                // we sent a link to someone (a customer of our customer) to do something (i.e. sign a field ticket)
                // they don't need location or authentication. SRR 05/18/2020
                // the page they are going to will do additional authentication.
                oRetVal.errorMsg = 'Location not used for customer links';
                resolve(oRetVal);
                return;
            }



            if (!("geolocation" in navigator)){
                oRetVal.errorMsg = 'Browser does not support location services. CenPoint Mobile will only work with location services turned on.',
                oRetVal.locationOn = false;
                resolve(oRetVal);
                return;
            }

            if (this.contains(location.href, '192.168.10.')
                || this.contains(location.href, '192.168.1.') // CP Hotspot for trade shows
                || this.contains(location.href, '192.168.0.') // CP Hotspot for trade shows
                || this.contains(location.href, '10.0.0.') // CP Access point for trade show
                ){
                // testing, phones don't have access to location as it's not over https
                // default to our office
                // Herriman Office
                // oRetVal.lat = 40.51413530871576;
                // oRetVal.lon = -112.02983506054797;
                
                // Fountain Green Office. SRR 01/03/2023
                oRetVal.lat = 39.636751483500646;
                oRetVal.lon = -111.630383965796;

                if (mRevGeo){
                    var mURL = this.getWSUrl() + 'cpJobs/ReverseGeoCode';
                    var oParams = {
                        lat: oRetVal.lat,
                        lon: oRetVal.lon
                    }

                    var resp = await this.RestClient.getNoCache(mURL, oParams);
                    
                    var oData = this.wsResp2Obj(resp);
                    if (oData.errorMsg){
                        oRetVal.errorMsg = oData.errorMsg
                    } else {
                        oRetVal.addr1 = oData[0].addr1;
                        oRetVal.city = oData[0].city;
                        oRetVal.state = oData[0].state;
                        oRetVal.postalCode = oData[0].postalcode;
                        oRetVal.county = oData[0].county;
                        oRetVal.distOff = oData[0].distancefromtarget; // always in miles, -1 = not calced
                        oRetVal.country = oData[0].country;
                    }
                }

                resolve(oRetVal);
                return;
            }


            navigator.geolocation.getCurrentPosition(
                async (location) => {
                    // this code won't run until it actually gets a location.                   
                    window.locationOn = true;


                    oRetVal.lat = location.coords.latitude;
                    oRetVal.lon = location.coords.longitude;

                    if (mRevGeo){
                        var mURL = this.getWSUrl() + 'cpJobs/ReverseGeoCode';
                        var oParams = {
                            lat: oRetVal.lat,
                            lon: oRetVal.lon
                        }

                        var resp = await this.RestClient.getNoCache(mURL, oParams);
                        
                        var oData = this.wsResp2Obj(resp);                        
                        if (oData.errorMsg){
                            oRetVal.errorMsg = oData.errorMsg
                        } else {
                            oRetVal.addr1 = oData[0].addr1;
                            oRetVal.city = oData[0].city;
                            oRetVal.state = oData[0].state;
                            oRetVal.postalCode = oData[0].postalcode;
                            oRetVal.county = oData[0].county;
                            oRetVal.distOff = oData[0].distancefromtarget; // always in miles, -1 = not calced
                            oRetVal.country = oData[0].country;
                        }
                    }

                    resolve(oRetVal);
                    
                },
                async (nolocation) => {
                    // see https://developer.mozilla.org/en-US/docs/Web/API/PositionError for error codes
                    if (nolocation.code == 1){
                        // permission deneid
                        oRetVal.errorMsg = 'Location services must be enabled for CenPoint Mobile to work.' 
                                            + '\n\nYou will not be able to use this app until you turn on location services and CenPoint has been granted access.'; 
                        oRetVal.locationOn = false;

                    } else if (nolocation.code == 2){
                        // position unavailable
                        oRetVal.errorMsg = 'Location temporarily unavailable.'; 

                    } else if (nolocation.code == 3){
                        // timeout
                        oRetVal.errorMsg = 'Location timeout'; 

                    } 
                    
                    // Starting with Chrome 50, navigator.geolocation.getCurrentLocation() only works over https
                    if (this.contains(nolocation.message, 'only secure origins', true) &&  this.contains(location.href, '192.168.10.')){
                        // my testing is served over http://192.168.10.116. Don't block for that         
                        oRetVal.locationOn = true; 
                    }

                    if(nolocation.message){
                        oRetVal.errorMsg += '\n\nError Msg: ' + nolocation.message;
                    }
                   
                    window.locationOn = oRetVal.locationOn;
                    if (!window.locationOn && !mLetNoLocThrough){
                         // see if the noLocScreen is already showing
                        var oElem = document.getElementById('no-loc-card');
                        if (oElem){
                            // dialog is already showing
                            while(oElem){
                                await this.sleep(3000);
                                oElem = document.getElementById('no-loc-card'); // see if it's still showing
                            }
                        } else {
                            // launch dialog 
                            await this.noLocScreen(oRetVal.errorMsg); // Clocks them out! (And let them know!)
                        }

                        
                        // try to get it again
                        var oLoc = await this.getLocation();
                        if (oLoc.locationOn){
                            oRetVal = oLoc;
                        }
                    }

                    resolve(oRetVal);
                        
                }, {
                    // specify some default options
                    timeout: (20 * 1000), // 20 seconds
                    maximumAge: (1000 * 30 * 1), // 30 seconds, trying to get more accurate results // 1 minutes
                    enableHighAccuracy: true
                });
            }); // promise
    }, // getLocation



    // *********************************************************************************
    // Calc difference between two times (only have the time and it's a string)
    // NOTE: This is copied / tweaked from the desktop
    //
    // Returns: Nuemric: Minutes between the 2 times
    Vue.prototype.Sublib.timeDif = function(mTime1, mTime2, mNoAbs){
        // mTime1 = time 1 in mil time OR with a colon, i.e. '1930', END TIME
        // mTime2 = time 2 in mil time OR with a colon, i.e. '1730', START TIME

        var mT1, mT2, mRetVal;

        if (mTime1 == mTime2 || !mTime1 || !mTime2){
            return 0
        }

        mT1 = Number(this.left(mTime1, 2)) * 60 + Number(this.right(mTime1, 2));
        mT2 = Number(this.left(mTime2, 2)) * 60 + Number(this.right(mTime2, 2));

        mRetVal = mT1 - mT2;

        if (!mNoAbs){
            mRetVal = Math.abs(mRetVal);
        }

        return mRetVal;

    }; // timeDif


    // *********************************************************************************
    // Convert a date or datetime to mililtary time
    Vue.prototype.Sublib.milTime = function(date) {
        var d = this.newDate(date);
        var mHR = d.getHours().toString();
        if (mHR.length < 2) {
            mHR = "0" + mHR;
        }
        var mMIN = d.getMinutes().toString();
        if (mMIN.length < 2) {
            mMIN = "0" + mMIN;
        }
        // mTime should be hhmm. i.e. 9:07 = 0907
        var mTime = mHR + mMIN;
        return mTime;
    }, //milTime


    // *********************************************************************************
    // Convert Time (JS Date) to Char
    //  This should probably be called DTOC... but it's already in a bunch of places so sticking with the bad name. 
    //  May want to add another param that says to include the time since so far it's just been doing DTOC()... SRR 08.01.2019
    Vue.prototype.Sublib.DTOC = function(date, format, symbol, honorBranchFormat, retEmpty) {
        // date = Date to conver
        // format = Char. Optional Either 'MDY', 'YMD', or 'DMY'
        // symbo = Char. Optional. Either '-', '/' or '.'
        // retEmpty = Logical, sometimes in the grid, we want '/ /' if the date is emptyDt

        if(retEmpty && this.emptyDt(date)){
            return '/ /'; //trying to mimic what desktop does with empty dates
        }

        if (!format){
            // NOTE: If this is called to pass a date to the webservice, it MUST be in MDY (american) format!
            format = 'MDY'; // default to american
        }

        if(honorBranchFormat){
            format = this.getDateFormat().toUpperCase();
        }

        if (!symbol){
            symbol = '/';
        }
        if (!date){
            date = this.newDate('01/01/1900');
        }
        
        var d = this.newDate(date); //new Date(date);
        var month = '' + (d.getMonth() + 1);
        var day = '' + d.getDate();
        var year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        var mRetVal;
        if (format == 'MDY'){
            mRetVal = [month, day, year].join(symbol);

        } else if (format == 'YMD'){
            mRetVal = [year, month, day].join(symbol);

        } else if (format == 'DMY'){
            mRetVal = [day, month, year].join(symbol);
        }

        return mRetVal;
    }, // DTOC

    // *********************************************************************************
    // Convert Time (JS Date) to Char
    // This is identical to this.DTOC but always honors branch format
    Vue.prototype.Sublib.DTOC2 = function(date, format, symbol, retEmpty) {
        return this.DTOC(date, format, symbol, true, retEmpty);
    }, // DTOC


    // *********************************************************************************
    Vue.prototype.Sublib.getDay = function(date) {
        // expecting date to be a string like mm/dd/yyyy
        var mretval = '';
        mretval = date.substring(3, 5);
        return mretval;
    }, // getDay


    // *********************************************************************************
    Vue.prototype.Sublib.getMonth = function(date) {
        // expecting date to be a string like mm/dd/yyyy
        var mretval = '';
        mretval = date.substring(0, 2);
        return mretval;
    }, // getMonth


    // *********************************************************************************
    Vue.prototype.Sublib.getYear = function(date) {
         // expecting date to be a string like mm/dd/yyyy
        var mretval = '';
        mretval = date.substring(6);
        return mretval;
    }, // getYear


    // *********************************************************************************
    // Returns: Char
    Vue.prototype.Sublib.getTimeZone = function(onlyGMTOffset, onlyGMTOffsetNoLbl, mDate2Test, onlyLbl, onlyLblAbbr) {
        // onlyGMTOffset = Logical. If true, only returns the GMT offset (i.e. 'GMT -0700')
        // onlyGMTOffsetNoLbl = Logical. If true, only returns the GMT offset (i.e. '-07:00')
        // mDate2Test = Char or Date. Optional. If passed, uses this date to get the time zome. 
        //              This is needed becuase if today is Monday, daylight savings was yesterday (Sunday), and looking at a date that was on Friday, 
        //              when you say 'new Date()' the browser automatically adds or subtracts 1 hour to account for daylight savings. Really annoying. 
        //              Get the time zone off set for when the date was that I'm looking at (i.e. before daylight savings) SRR 03/09/2020
        // onlyLbl = Logical. If true, only returns the friendly name of the time zone (i.e. 'Mountain Standard Time')
        // onlyLblAbbr = Logical. If true, only returns the abbreviated friendly name of the time zone (i.e. 'MST')

        //return Intl.DateTimeFormat().resolvedOptions().timeZone; // this returns 'America/Denver' for Mountain Time.
        var mOrigDateVal = mDate2Test; // only used for debugging

        if (mDate2Test){
            mDate2Test = new Date(mDate2Test);
        } else {
            mDate2Test = new Date();
        }

        // make sure it's a valid date
        if (isNaN(mDate2Test.getTime())){
            // invalid date
            // Since we're just getting the time zone, use the local date
            mDate2Test = new Date();
        }


        var mRetVal = '';
        if (onlyGMTOffset) {
            mRetVal =  mDate2Test.toString().match(/([A-Z]+[\+-][0-9]+)/)[1]; // 'GMT-0700'

        } else if (onlyGMTOffsetNoLbl){
            // added. SRR 10.21.2019
            //return new Date().toString().match(/([-\+][0-9]+)\s/)[1]; // '-0700';
            // NOTE: iOS errored out when creating dates that looked like: '2019-10-18T12:13:21-0600', wants it to look like: '2019-10-18T12:13:21-06:00'
            // Android and Windows support both ('-0600' and '-06:00')

            mRetVal = mDate2Test.toString().match(/([-\+][0-9]+)\s/)[1]; // '-0700'; // or '+0200'
            mRetVal = this.left(mRetVal, 3) + ':' + this.right(mRetVal, 2); // convert '-0700' to '-07:00'
        
        } else if (onlyLbl){
            // return the friendly name of the time zone (i.e. 'Mountain Standard Time')
            mRetVal = mDate2Test.toString().match(/\(([A-Za-z\s].*)\)/)[1]; // looks something like: "Mountain Standard Time"

        } else if (onlyLblAbbr){
            // return the abbreviated friendly name of the time zone (i.e. 'MST')
            mRetVal = mDate2Test.toString().match(/\(([A-Za-z\s].*)\)/)[1].replace(/[^A-Z]+/g, "");

        } else {
            // return the offset + friendly name
            mRetVal = mDate2Test.toString().match(/([A-Z]+[\+-][0-9]+.*)/)[1]; // looks something like: "GMT-0700 (Mountain Standard Time)"
        }

        return mRetVal;

        // got this from: https://stackoverflow.com/questions/1091372/getting-the-clients-timezone-in-javascript
        //For "GMT-0400 (EDT)" :
        //    new Date().toString().match(/([A-Z]+[\+-][0-9]+.*)/)[1]

        //For "GMT-0400" :
        //    new Date().toString().match(/([A-Z]+[\+-][0-9]+)/)[1]

        //For just "EDT" :
        //    new Date().toString().match(/\(([A-Za-z\s].*)\)/)[1]

        //For just "-0400":
        //    new Date().toString().match(/([-\+][0-9]+)\s/)[1]
    }, // getTimeZone


    // *********************************************************************************
    // convert military time to am pm time
    Vue.prototype.Sublib.AmPm = function(mMilTime, noLeading0) {

        if (mMilTime instanceof Date || this.contains(mMilTime, 'T')){
            // Date or looks like: '2023-07-27T11:12:26Z'. SRR 07/31/2023
            mMilTime = this.milTime(mMilTime);
        }

        var mretval = '';
        if (!mMilTime){
            mMilTime = '0000';
        }

        if (mMilTime.length == 3) {
            mMilTime = '0' + mMilTime;
        }

        var hour = Number(mMilTime.substr(0, 2));
        // have to deal with midnight and noon seperately
        if (hour == 12) {
            hour = hour + 'PM';
        } else if (hour == '0') {
            hour = 12 + 'AM'
        } else {
            hour = hour > 12 ? hour - 12 + 'PM' : hour + 'AM';
        }
        hour = hour.toString();
        // add 0 to times like 2pm so it shows 02pm
        if (hour.length <= 3) {
            hour = '0' + hour;
        }
        var minutes = mMilTime.substr(2, 4);
        if (minutes.length < 2) {
            minutes = '0' + minutes;
        }

        // hour:minute am/pm
        mretval = hour.substr(0, 2) + ':' + minutes + ' ' + hour.substr(2, 4);

        if (noLeading0) {
            // no leading zero on times like 5:00 PM
            if (mretval.substr(0, 1) == '0') {
                mretval = mretval.substr(1);
            }
        }

        return mretval;
    }, // AmPm


    // *********************************************************************************
    Vue.prototype.Sublib.convertTemp = function(mTemp, mDecimals) {
        // mTemp = Char. i.e. '74 F' or '12.3 C'
        // mDecmials = Numeric. Decimal places for accuracy. If not included, rounds to 0 decimal places
        // NOTE: If mTemp does not have a unit (i.e. F or C), defaults to assume that Temp passed in is in Farenheit
        if (!mTemp) {
            return '';
        }

        // if (this.offline()) {
        //     return ''; // we don't show the picture (as it's not cached), so clear out the temp as well
        // }

        if (!mDecimals) {
            mDecimals = 0;
        }

        var mScale = localStorage.getItem('tempUnit');
        if (!mScale) {
            //mScale = 'F';
            mScale = this.getLocaleVal('TempUnit');

        } else {
            mScale = mScale.toUpperCase();
        }


        var mCurScale, mTemp2Convert;
        if (typeof mTemp == 'string') {
            mCurScale = mTemp.substring(mTemp.length - 1).toUpperCase(); // Get the right 1
            if (this.isNumeric(mCurScale)){
                // passed in just a temperature string
                mCurScale = 'F'; // default to Farenheit
                mTemp2Convert = Number(mTemp);
            } else {
                mTemp2Convert = Number(mTemp.substring(0, mTemp.length - 1)); // all but the right 1
            }
            
        } else {
            mCurScale = 'F'; // default to Farenheit
            mTemp2Convert = mTemp; // numeric passed in. Roll with it
        }

        if (mCurScale == mScale) {
            // already in the right units, just deal with rounding and send it back
            return mTemp2Convert.toFixed(mDecimals) + '° ' + mScale;

        } else if (mScale == 'F') {
            // convert from Celsius to Farenheit
            return ((mTemp2Convert * (9 / 5)) + 32).toFixed(mDecimals) + '° F';

        } else {
            // convert from Farenheit to Celsius (mScale = 'C')
            return ((mTemp2Convert - 32) * (5 / 9)).toFixed(mDecimals) + '° C';
        }
    }, // convertTemp



    // *********************************************************************************
    Vue.prototype.Sublib.getWeatherIcon = function(iconName, mIconSet) {
        // iconName = str. Name of the icon to get. i.e. 'clear-day'
        // mIconSet = str. Name of the icon set to use. i.e. '1' or '2' for displaying the icons in the dropdown

        //if not passed, then grab it from localStorage
        if(!mIconSet){
            var mIconSet = localStorage.getItem('weatherIconSet');
            if (!mIconSet) {
                mIconSet = '1';
                localStorage.setItem('weatherIconSet', mIconSet);
            }
        }

        iconName = iconName.toUpperCase();

        var mRootPath = '../img/WISet' + mIconSet + '/';

        var oIcons = JSON.parse(localStorage.getItem('weatherIcons'));

        if (!oIcons) {
            oIcons =this.defineWeatherIcons();
        }


        for (var mx = 0; mx < oIcons.length; mx++) {
            if (oIcons[mx].name.toUpperCase() == iconName) {
                return mRootPath + eval('oIcons[mx].set' + mIconSet);
            }
        }

        // didn't find it, just return a blank img (may need it as  space holder)
        return '../img/blank.png'; 

    }, // getWeatherIcon


    // *********************************************************************************
    Vue.prototype.Sublib.defineWeatherIcons = function() {
        // called on app load
        var oIcons = [
            {
                'name': 'day_clear',
                'set1': 'sunny.png',
                'set2': '01d.png',
                'set3': 'clear.png',
                'set4': 'wi-day-sunny.svg',
                'set5': 's5_d000.png'
            }, {
                'name': 'night_clear',
                'set1': 'clear_night.png',
                'set2': '01n.png',
                'set3': 'clear_night.png',
                'set4': 'wi-night-clear.svg',
                'set5': 's5_n000.png'
            }, {
                'name': 'day_partly_cloudy',
                'set1': 'cloudy.png',
                'set2': '02d.png',
                'set3': 'partlycloudy.png',
                'set4': 'wi-day-cloudy.svg',
                'set5': 's5_d200.png'
            }, {
                'name': 'night_partly_cloudy',
                'set1': 'cloudy_night.png',
                'set2': '02n.png',
                'set3': 'partlycloudy_night.png',
                'set4': 'wi-night-alt-cloudy.svg',
                'set5': 's5_n200.png'
            }, {
                'name': 'day_cloudy',
                'set1': 'overcast.png',
                'set2': '03d.png',
                'set3': 'cloudy.png',
                'set4': 'wi-cloud.svg',
                'set5': 's5_d400.png'
            }, {
                'name': 'night_cloudy',
                'set1': 'overcast.png',
                'set2': '03n.png',
                'set3': 'cloudy.png',
                'set4': 'wi-cloud.svg',
                'set5': 's5_n400.png'
            }, {
                'name': 'day_rain',
                'set1': 'rain.png',
                'set2': '09d.png',
                'set3': 'chancerain.png',
                'set4': 'wi-showers.svg',
                'set5': 's5_d430.png'
            }, {
                'name': 'night_rain',
                'set1': 'rain.png',
                'set2': '09n.png',
                'set3': 'chancerain.png',
                'set4': 'wi-showers.svg',
                'set5': 's5_n430.png'
            }, {
                'name': 'day_snow',
                'set1': 'snow.png',
                'set2': '13d.png',
                'set3': 'flurries.png',
                'set4': 'wi-snow.svg',
                'set5': 's5_d432.png'
            }, {
                'name': 'night_snow',
                'set1': 'snow.png',
                'set2': '13n.png',
                'set3': 'flurries.png',
                'set4': 'wi-snow.svg',
                'set5': 's5_n432.png'
            }, {
                'name': 'day_thunderstorm',
                'set1': 'rain_thunder.png',
                'set2': '11d.png',
                'set3': 'tstorms.png',
                'set4': 'wi-lightning.svg',
                'set5': 's5_d440.png'
            }, {
                'name': 'night_thunderstorm',
                'set1': 'rain_thunder.png',
                'set2': '11n.png',
                'set3': 'tstorms.png',
                'set4': 'wi-lightning.svg',
                'set5': 's5_n440.png'
            }, {
                'name': 'day_sleet',
                'set1': 'rain_snow.png',
                'set2': '13d.png',
                'set3': 'chancesleet.png',
                'set4': 'wi-sleet.svg',
                'set5': 's5_d431.png'
            }, {
                'name': 'night_sleet',
                'set1': 'rain_snow.png',
                'set2': '13n.png',
                'set3': 'chancesleet.png',
                'set4': 'wi-sleet.svg',
                'set5': 's5_n431.png'
            }, {
                'name': 'day_wind',
                'set1': 'windy.png',
                'set2': 'windy.png',
                'set3': 'windy.png',
                'set4': 'wi-day-cloudy-gusts.svg',
                'set5': 's5_windy.png'
            }, {
                'name': 'night_wind',
                'set1': 'windy.png',
                'set2': 'windy.png',
                'set3': 'windy.png',
                'set4': 'wi-night-alt-cloudy-gusts.svg',
                'set5': 's5_windy.png'
            }, {
                'name': 'day_fog',
                'set1': 'foggy.png',
                'set2': 'foggy.png',
                'set3': 'fog.png',
                'set4': 'wi-fog.svg',
                'set5': 's5_d600.png'
            }, {
                'name': 'night_fog',
                'set1': 'foggy.png',
                'set2': 'foggy.png',
                'set3': 'fog.png',
                'set4': 'wi-fog.svg',
                'set5': 's5_n600.png'
            }
        ];

        localStorage.setItem('weatherIcons', JSON.stringify(oIcons)); // storing in local storage as it doesn't take as much memory as $rootScope
        return oIcons;
    }, // defineWeatherIcons


    // *********************************************************************************
    Vue.prototype.Sublib.convFromStr = function(strToTrans) {
        // this converts a string to a number, logical, date, etc.
        var mRetVal;
        if (typeof strToTrans === 'undefined' || strToTrans == null) {
            mRetVal = null;
            
        } else if (typeof strToTrans != 'string'){
            // not a string, just return what it is
            mRetVal = strToTrans
        
        } else if (this.isNumeric(strToTrans) && !/[a-z]/i.test(strToTrans)) {
            // the i in the regex makes it case insensitive
            // number
            mRetVal = Number(strToTrans);
        } else if (strToTrans.toUpperCase() === 'TRUE' || strToTrans.toUpperCase() === 'FALSE') {
            // boolean
            mRetVal = (strToTrans.toUpperCase() == 'TRUE') ? true : false;
            
        } else if (strToTrans.toUpperCase() === 'UNDEFINED' || strToTrans.toUpperCase() === 'NULL') {
            // null
            mRetVal = null;
        } else {
            // string, no conversion necessary
            mRetVal = strToTrans;
        }

        return mRetVal;
    }, // convFromStr
    

    // *********************************************************************************
    Vue.prototype.Sublib.isNumeric = function(number) {
        // Note: number may be passed in as a string, number, etc
        // !isNaN will return true for +/- and infinite (i.e. 1/0), isFinite only returns true if it's positive and not infinite 
        //return !isNaN(parseFloat(number)) && !/[a-z]/i.test(String(number))//&& isFinite(number);        
        //return number.match(/^\d+$/);

        if (typeof number == 'number'){
            return true;
        }

        // m.testchar = ALLTRIM(m.testchar)
        // m.testchar = STRTRAN(m.testChar, ' ', '')
        // m.testchar = STRTRAN(m.testChar, ',', '')
        // m.testchar = STRTRAN(m.testChar, '.', '')
        // m.testchar = IIF(LEFT(m.testChar,1)='-',SUBSTR(m.testChar,2),m.testChar)

        if (typeof number == 'string'){
            number = this.replaceAll(number, ' ', '', true); // remove spaces
            number = this.replaceAll(number, ',', '', true); // remove commas
            number = this.replaceAll(number, '\\.', '', true); // remove periods
            number = this.left(number, 1) == '-' ? number.substring(1) : number; // remove leading minus sign
        }


        return /^\d+$/.test(number);
    }, // isNumeric


    // *********************************************************************************
    // this returns the html needed to get the image for the WO Status
    Vue.prototype.Sublib.getStatusPic = function(mStatus) {
            if(!mStatus){
                return 'img/blank.png';
            }
            mStatus = mStatus.toLowerCase();
            var mImg = '';

            if (this.contains(mStatus, 'returned')) {
                mImg = 'img/check.png';

            } else if (mStatus == 'completed') {
                mImg = 'img/checkered_flag.png';

            } else if (mStatus == 'departed') {
                mImg = 'img/truck_left.png'

            } else if (mStatus == 'arrived') {
                mImg = 'img/men_working.png'

            } else if (this.contains(mStatus, 'started')) {
                mImg = 'img/truck_right.png'

            } else if (this.inList(mStatus, 'confirmed', 'confirm')) {
                mImg = 'img/phone_green.png';

            } else if (this.contains(mStatus, 'call')) {
                mImg = 'img/phone_red.png';

            } else {
                // scheduled
                mImg = 'img/blank.png';
            }

            return mImg;
    }, // getStautsPic


    // *********************************************************************************
    // This will get rid of leading 0s. Copeid from desktop code
    Vue.prototype.Sublib.trimZeros = function(mCharVal, mDesiredLen) {
        // mCharVal = char. The string for which we want to kill leading zeros (eg "000B205")
        // mDesiredLen = Num. Optional. If passed, the return string will be at least this many char.

        if (!mCharVal){
            return '';
        }

        var mRetVal = mCharVal.trim();

        while(true){
            if (!mRetVal ||this.left(mRetVal, 1) != '0'){
                break;
            }

            mRetVal = mRetVal.substr(1);
        } // while

        if (mDesiredLen && mRetVal.length < mDesiredLen){
            // JS .repeat() isn't fully supported yet, just do a for loop. SRR 07.10.2019
            var mHold = '';
            for (var mx = 1; mx <= (mDesiredLen - mRetVal.length); mx++){
                mHold += '0';
            }
            mRetVal = mHold + mRetVal;
        }

        return mRetVal;
    }, // trimZeros


    // *********************************************************************************
    // This is the equivalent of LEFT() in VFP
    Vue.prototype.Sublib.left = function(string, numOfChar) {
        // string = string to check
        // numOfChar = Numeric. I.e. left 3 char

        return string.substr(0, numOfChar);
    }, // left

    // *********************************************************************************
    // This is the equivalent of RIGHT() in VFP
    Vue.prototype.Sublib.right = function(string, numOfChar) {
        // string = string to check
        // numOfChar = Numeric. I.e. right 3 char

        if (numOfChar > string.length){
            return string;
        }
        return string.substr(string.length - numOfChar);
    }, // left
      // *********************************************************************************
    Vue.prototype.Sublib.getInBetween = function(string, fstring, lstring) {

        //in between char vals
        if(typeof fstring === 'string'){
            const middle = string.slice(
                string.indexOf(fstring) + 1,
                string.lastIndexOf(lstring),
            );
            return middle;
        }else {  //in between two indexes
            const middle = string.slice(
                fstring,
                (fstring+lstring+1),
            );
            return middle;
        }

    }, // left


    // *********************************************************************************
    // Return a date like: 'Thu, Jan 25, 2019'
    Vue.prototype.Sublib.obviousDt = function(mDate, mIncludeYear, mExcludeDOW, retEmpty) {
        // mIncludeYear = Logical. If true, retval looks like, 'Fri, Nov 26, 2020'
        // NOTE: If current year != year on date, will force it to include so they can tell what year stuff was done in (unless excludeDOW is true for things like birthday)
        // mExcludeDOW = Logical. If true, retval looks like 'Nov 26' && useful for showing birthdays for contacts when you may not know the year and so the DOW will be wrong anyway
        //retEmpty = Logical. If true, will return '' if mDate is empty. Otherwise, will return '01/01/1900'


        var mRetVal = '';
        if (mDate){
            // if (typeof mDate == 'string'){
            //     // make sure it doesn't end with 'z'. Don't want to start converting time zones
            //     mDate =this.replaceAll(mDate, 'z', '', true);
            // }

            if(retEmpty && this.emptyDt(mDate)){
                return '';
            }
            
            mDate = this.newDate(mDate);
            var aMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            var aDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

            var mLang = localStorage.getItem('lang');
            if (!mLang){
                mLang = 'en'; // default to u.s.a.
                localStorage.setItem('lang', mLang);
            }

            var mDay = String(mDate.getDate());
            var mMonth = this.getLbl(aMonths[mDate.getMonth()]);
            var mYear = String(mDate.getFullYear())

            if (!mExcludeDOW){
                mRetVal =this.getLbl(aDays[mDate.getDay()]) + ', ';
            }
            

            if (mLang == 'en'){
                // English / US
                // 'Aug 15'
                mRetVal +=  mMonth + ' ' + mDay;

            } else if (mLang == 'sp'){
                // spanish
                // '15 Aug'
                mRetVal += mDay + ' ' + mMonth;

            }

            
            // if (!mIncludeYear && !mExcludeDOW){
            //     if (mYear != new Date().getFullYear()){
            //         // force the year on for older projects / WOs, etc. SRR 03/07/2023
            //         mIncludeYear = true;
            //     }
            // }



            if (mIncludeYear){
                mRetVal += ', ' + mYear;
            }
        }

        return mRetVal;
    }, // obviousDt


    // *********************************************************************************
    // since date math in js is a pain, writing this method
    Vue.prototype.Sublib.daysBetween = function(firstDate, secondDate, wantAbs) {
        // wantAbs = Logical. Optional. if true, does the absolute value so i can get back something like 1 days instead of -1 day
        // if you want to get -1, pass in today for firstDate and yesterday for secondDate because secondDate is -1 day from firstDate

        var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds

        // NOTE: had some weird stuff 2.7 days rounds to 3. Since we're just trying to get difference between monday at wednesday, strip off the times
        var date1 = this.newDate(firstDate, true); //new Date(this.DTOC(new Date(firstDate), 'MDY', '/'));
        var date2 = this.newDate(secondDate, true); //new Date(this.DTOC(new Date(secondDate), 'MDY', '/'));

        var mhold = (date1.getTime() - date2.getTime()) * -1;

        // Note: If one day is before daylight savings and one is day of or after, it scews our numbers. Account for that.
        if (this.getTimeZone(false, true, date1) != this.getTimeZone(false, true, date2)){
            // NOTE: I'm assuming that both offsets will be '-' or '+' of UTC, NOT one that's '-' and one that's '+'
            var mDate1OffSet = this.left(this.getTimeZone(false, true, date1).replace(':', '').replace('-', ''), 2); // '-07:00' => '07'
            var mDate2OffSet = this.left(this.getTimeZone(false, true, date2).replace(':', '').replace('-', ''), 2); // '-06:00' => '06'

            var mOffSetDif = Number(mDate1OffSet)  - Number(mDate2OffSet); // number of hours different
            var m1Hour = 1 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
            mhold += (m1Hour * mOffSetDif); // add it to my difference (may be negative)
        }

        var mDif;
        if (!wantAbs){
            mDif = Math.floor(mhold / (oneDay));
        } else {
            mDif = Math.floor(Math.abs(mhold / (oneDay)));
        }

        if (mDif == 0){
            // can sometimes be -0 which is just weird, take the abs
            mDif = Math.abs(mDif);
        }

        return mDif;
    }, // daysBetween


    // *********************************************************************************
    // this will return the current date/ time. instead of using JS Date(), using this since this
    // uses the date from their server so even if they change the date on their phone, they can't get around some of our error checking. 
    Vue.prototype.Sublib.getDate = async function(mGetFromCache, mNoRefresh) {
        // mGetFromCache = Logical. If true, just pulls from local cacche (for speed) instead of making a call to the webserver.
        // mNoRefresh = Logical. If true, stops us from calling this recursively so we don't get stuck in an endloos loop. SRR 05/26/2022

        if (this.offline()) { 
            mGetFromCache = true;
        }

        var mDateHold, mUTCMinOffset;
        // NOTE: If it is daylight savings time, the timezone that comes back (-06:00) is off
        // BUT the utcminoffset: 420 IS RIGHT!!! Use the utcminoffset and strip of the '-06:00' from the string when creating a date!
        if (!mGetFromCache) {
            var mURL = this.getWSUrl() + 'cpGetUsers/getServerDate'; 
            var resp = await this.RestClient.get(mURL, false, 'getServerDate');
            var oData = this.wsResp2Obj(resp);            
            if (oData.errorMsg){
                // crap! just default to date the phone gives us
                mGetFromCache = true;
                // mDateHold = new Date(new Date().toUTCString())
                mDateHold = this.getUTCDate();
                mUTCMinOffset = new Date().getTimezoneOffset();
            } else {
                // store it out for future use
                localStorage.setItem('srvDate', JSON.stringify(oData[0]));
                //mDateHold = new Date(oData[0].serverdate); can't use the 'time zone' that comes back from the web service

                // NOTE: Send in the time zone on the phone so there is NO time manipulation by the browser!
                //mDateHold = new Date(this.left(oData[0].serverdate, 19) + this.getTimeZone(false, true)); // '2019-10-18T12:13:21' + '-06:00'
                mDateHold = this.newDate(this.left(oData[0].serverdate, 19)); // '2019-10-18T12:13:21' + '-06:00'
                mUTCMinOffset = oData[0].utcminoffset;
            }

        } else {
            // just pull from local storage call
            try {
                var mHold = localStorage.getItem('srvDate');
                mHold = JSON.parse(mHold);
                //mDateHold = new Date(this.left(mHold.serverdate, 19) + this.getTimeZone(false, true));
                mDateHold = this.newDate(this.left(mHold.serverdate, 19));
                mUTCMinOffset = mHold.utcminoffset;

                // had problems where phones / tablets were left on and some of our code to get it from cache as expecting to to be semi-fresh. 
                // If it's over an hour stale, go get a fresh copy. SRR 05/26/2022
                if (!mNoRefresh && !this.offline() 
                    && Math.abs(mDateHold - this.getUTCDate(new Date())) / 1000 / 60 >= 60){
                        // more than 60 minutes old
                    return this.getDate(false, true); // recursive call
                }


            } catch (oError){
                mDateHold = null; // set below
            }
        }

        if (!mDateHold){
            // don't error out if we don't have it.
            //mDateHold = new Date(new Date().toUTCString()) 
            mDateHold = this.getUTCDate();
            mUTCMinOffset = new Date().getTimezoneOffset();
        }

        // Now convert it to the local time zone
        var mCurDate = this.convUTCDate2Local(mDateHold, mUTCMinOffset); 

        if (mGetFromCache){
            // NOTE: If they are offline, we still need to return the correct hr / min for things like setting FT Status time.
            // Typically people only change the date on their phone, not the time as that really screws them up. This should be okay... SRR 01.17.2019

            // make sure to return as if it was the server (i.e. different time zone)
            // i.e. curTime - (serverOffSet - phoneOffSet) = wantTime
            // i.e. 0700 - (420 (pacific - server) - 360 (mountain - phone)) = 0600;

            var mNow = new Date();
            var mOffFromServer = mUTCMinOffset - mNow.getTimezoneOffset(); // hopefully should be 0
            var mHrOffFromServer = mOffFromServer / 60; // should always be whole numbers
            //var mMinOffFromServer = mHrOffFromServer - (mOffFromServer / 60); // will alwasy be 0.


            mCurDate.setHours(mNow.getHours() - mHrOffFromServer);
            mCurDate.setMinutes(mNow.getMinutes());
            mCurDate.setSeconds(mNow.getSeconds());
            //mCurDate.set
        }

       return mCurDate;
    }, // getDate


    // *********************************************************************************
    // Since there is not a an easy way to return a UTC date where the browwer doesn't auto interpret it and convert it for back to local time zone, writing this. SRR 07.13.2019
    Vue.prototype.Sublib.getUTCDate = function(mDate) {
        // mDate = date to convert to UTC. Default to now if not passed
        
        if (!mDate){
            mDate = new Date();
        }
        var mUTCDate = new Date(mDate.getUTCFullYear(), mDate.getUTCMonth(), mDate.getUTCDate(), mDate.getUTCHours(), mDate.getUTCMinutes(), mDate.getUTCSeconds());
        return mUTCDate;
    }, // getUTCDate


    // *********************************************************************************
    // This will convert a UTC date to the local date / time
    Vue.prototype.Sublib.convUTCDate2Local = function(date2Conv, mUTCMinOffset) {
        // date2Conv = Date
        // mUTCMinOffset = numeric. Optional. Minutes off of utc time. If not passed, uses the phones time zone to determine (may want to use users server instead, hence the param)

        if (!mUTCMinOffset){
            mUTCMinOffset = date2Conv.getTimezoneOffset();
        }
        return new Date(date2Conv.getTime() - (mUTCMinOffset * 60 * 1000)); // * 60 * 1000 to get to miliseconds
    }, //convUTCDate2Local


    // *********************************************************************************
    // This is similar to Date.toISOString() but Date.toISOString ONLY returns UTC (no way around it) ('2019-08-30T15:09:13.969Z')
    // writing this so we can return it in local time (I'm excluding miliseconds (like our web service does))
    Vue.prototype.Sublib.serializeDt = function(date2Ser) {
        if (!date2Ser){
            date2Ser = this.newDate('01/01/1900');
        }
        date2Ser = new Date(date2Ser); // I get stuck in an infinite loop is I call this.newDate(date2Ser) since it calls serializeDt (this)
        return String(date2Ser.getFullYear()) + '-' +this.padL(String(date2Ser.getMonth() + 1), 2, '0') + '-' +this.padL(String(date2Ser.getDate()), 2, '0')
                + 'T' +this.padL(String(date2Ser.getHours()), 2, '0') + ':' +this.padL(String(date2Ser.getMinutes()), 2, '0') + ':' +this.padL(String(date2Ser.getSeconds()), 2, '0');
    }, // serializeDt


    // *********************************************************************************
    // this is like VFPs PADL()    
    Vue.prototype.Sublib.padL = function(str, length, char) {
            // PadL("Hi", 10, 'R') gives 'RRRRRRRRHi'
            var mRetVal = '';
            length = (typeof (length) == 'string') ? Number(length) : length;
            if (char == '' || char == null) {
                char = '0';
            }

            //had couple of errors from CIPAVE str being undefined, so what if we write a check for that MA 10.31.22
            // if (str == undefined || str == null || str == '') {
            //     return '';
            // }
            // need to be able to pass in an empty string and pad it. SRR 11/04/2022
            if (str == undefined || str == null){
                return ''; // NOTE: we may want it to error out in the future just so we can fix the actual root cause. SRR 11/04/2022   
            }


            for (var mx = 0; mx < length - str.length; mx++) {
                mRetVal = mRetVal + char;
            }

            mRetVal = mRetVal + str;
            return mRetVal;
    }, //padL


    // *********************************************************************************
    // this is like VFPs PADR()    
    Vue.prototype.Sublib.padR = function(str, length, char) {
        // PadR("Hi", 10, 'R') gives 'HiRRRRRRRR'
        var mRetVal = '';
        length = (typeof (length) == 'string') ? Number(length) : length;
        if (char == '' || char == null) {
            char = '0';
        }

        //had couple of errors from CIPAVE str being undefined, so what if we write a check for that MA 10.31.22
        // if (str == undefined || str == null || str == '') {
        //     return '';
        // }
        // need to be able to pass in an empty string and pad it. SRR 11/04/2022
        if (str == undefined || str == null){
            return ''; // NOTE: we may want it to error out in the future just so we can fix the actual root cause. SRR 11/04/2022   
        }


        for (var mx = 0; mx < length - str.length; mx++) {
            mRetVal = mRetVal + char;
        }

        mRetVal = str + mRetVal;
        return mRetVal;
}, //padL


    // *********************************************************************************
    // This will add a notification object to our array of notifications that are handled globally on the app
    Vue.prototype.Sublib.addAppNotif = async function(oNotification) {
        // oNotification = Object, goodNotifObj() looks like:
        // { msg: '', icon: ''}
        var aAppNotifs = JSON.parse(localStorage.getItem('appNotifs'));
        if (!aAppNotifs){
            aAppNotifs = [];
        }

        // if the exact same notification is already in the list, don't add it again (i.e. pretrip required for a certain date). SRR 07.15.2019
        var oAlreadyAddedNotif = aAppNotifs.find((obj) => {
            return obj.msg == oNotification.msg && !obj.cleared;
        });

        if (oAlreadyAddedNotif){
            // nothing to do. I'm out
            return;
        }


        oNotification.time = await this.getDate(true);
        oNotification.read = false;

        aAppNotifs.push(oNotification); // adds to the end

        localStorage.setItem('appNotifs', JSON.stringify(aAppNotifs));

        EventBus.$emit('updtAppNotifCnt', 1);

        return;

    }, // addAppNotif


    // *********************************************************************************
    Vue.prototype.Sublib.goodNotifObj = function() {
        return {
            msg: '',
            img: '', // material design image
            read: false,
            time: false,
            cleared: false, // this tells us they've cleared it but also makes sure it's still around so we don't add it again for them to clear again.
            clearedTime: false,
            clearOnClick: false, // auto 'dismiss' when the user clicks on it
            clearPermanent: false, // permanently delete when it's cleared
            onClick: {
                url: '', // redirect to a different page (uses query Params as well)
                queryParams: false,
                mbox: '', // launch an mbox on click
                applyUpdt: false
            }
        }
    }, // goodNotifObj


    // *********************************************************************************
    // clears an app notification so it doesn't display to the user any more (still stored in local storage)
    Vue.prototype.Sublib.clearAppNotif = async function(oNotification) {
        // oNotification = Object. goodNotifObj we want to clear
        var aAppNotifs = JSON.parse(localStorage.getItem('appNotifs'));
        if (!aAppNotifs){
            // nothing to do
            return;
        }

        for (var mx = 0; mx < aAppNotifs.length; mx++){     
            if (aAppNotifs[mx].msg != oNotification.msg || aAppNotifs[mx].time != oNotification.time){
                continue
            }

            aAppNotifs[mx].cleared = true;
            aAppNotifs[mx].clearedTime = await this.getDate(true);

            if (aAppNotifs[mx].clearPermanent){
                // permanantly delete
                aAppNotifs.splice(mx, 1);
            }

            break;
        } // for

        localStorage.setItem('appNotifs', JSON.stringify(aAppNotifs));

        return;

    }, // clearAppNotif


    // *********************************************************************************
    // returns: true if one test val is equals mStr
    // i.e.this.inList(mHold, ['TEST', 'Scott'])
    //Vue.prototype.Sublib.inList = function(mStr, aTestVals, ignoreCase) {
    Vue.prototype.Sublib.inList = function(...params) {
        // mStr = String variable to test against
        // aTestVals = Array, values to see if they are contained in mStr
        // ignoreCase = Logical. If true, is case insensitive
        // ...params lets there be an large number of params and then you can iterate through them. Basically, make calling it more like VFP. SRR 01/26/2023
        //  NOTE: Can't get the ...params to work like every says it should but I can access arugments object/ array so that seems to work
        //  see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters

        if (arguments.length < 2){
            return false;
        }

        // convert it here to how it used to be passed in
        var mStr, aTestVals, ignoreCase;
        mStr = arguments[0];
        if (typeof arguments[1] == 'object'){
            // passed in the old way (array shows as an object)
            aTestVals = arguments[1];
            if (arguments.length == 3){
                ignoreCase = arguments[2];
            }

        } else {
            // figure out all of the params I'm testing against
            aTestVals = [];
            for (var mx = 1; mx < arguments.length; mx++ ){
                if (mx == arguments.length -1 && typeof arguments[mx] == 'boolean'){
                    // last param and it's a logical, ignoreCase param
                    ignoreCase = arguments[mx];
                    break;
                }

                aTestVals.push(arguments[mx]);
            }
        }


        // now just let it run
        if (!mStr || !aTestVals) {
            return false;
        }

        if (!ignoreCase) {
            ignoreCase = false;
        } else if (typeof mStr != 'string'){
            ignoreCase = false;
        }

        if (ignoreCase) {
            mStr = mStr.toUpperCase();
        }


        var mRetVal = false;
        var mTestVal = '';
        for (var mx = 0; mx < aTestVals.length; mx++) {
            if (typeof aTestVals[mx] != typeof mStr){
                continue;
            }
            // if (this.isNumeric(aTestVals[mx])) {
            //     continue;
            // }

            mTestVal = aTestVals[mx];
            if (ignoreCase) {
                mTestVal = mTestVal.toUpperCase();
            }

            if (mStr == mTestVal) {
                mRetVal = true;
                break;
            }
        } // for

        return mRetVal;
    }, // inlist


    // *********************************************************************************
    // this will return the reccount of an object store. NOTE: If the obj Store is open, this may close it...
    Vue.prototype.Sublib.reccount = async function(mObjStore) {
        var oData = await this.IDB.IDBReq(mObjStore, 'getall');
        return oData.length;
    }, // reccount


    // *********************************************************************************
    Vue.prototype.Sublib.offline = function() {
        // this decides if the app is 'offline'
        // can be offline in 2 situations.
        // 1. They are really offline (i.e. no service)
        // 2. They are in an 'offline' mode where we act like they are offline

        // NOTE: navigator.onLine doesn't always get updated by the browser correctly. Switching to offline.js library. SRR 05.02.2019
        //if (this.convFromStr(localStorage.getItem('offline')) || !navigator.onLine) {
        //if (this.convFromStr(localStorage.getItem('offline')) || Offline.state != 'up') { //!Offline.check()) {
        //if (Offline.state != 'up') {
        
        // added a force offline mode. SRR 11/16/2021
        var mForceOffline;
        mForceOffline = localStorage.getItem('forceOffline');
        if (!mForceOffline){
            mForceOffline = false;
        } else {
            mForceOffline = this.convFromStr(mForceOffline);
        }

        if (Offline.state != 'up' || mForceOffline) { 
            Offline.check(); // do a double check in case something has changed. I've seen where it gets stuck and doesn't check for some reason...
            return true;
        } else {
            return false;
        }
    }, //offline


     // *********************************************************************************
     // This is simply a wrapper method in case we ever switch how we are determining if they are online / offline. SRR 11/15/2021
     // Returns: Check Sublib.offline()
     Vue.prototype.Sublib.checkOfflineStatus = async function() {
        //var oResp = await Offline.check(); // will set Offline.state so next time we call Sublib.offline() it's updated
        // since it's an XMLHttpRequest it doesn't actually wait for it...
        
        // added a force offline mode. SRR 11/16/2021
        var mForceOffline;
        mForceOffline = localStorage.getItem('forceOffline');
        if (!mForceOffline){
            mForceOffline = false;
        } else {
            mForceOffline = this.convFromStr(mForceOffline);
        }

        if (mForceOffline){
            // Nothing to check. I'm out
            return false; 
        }


        return new Promise(function (resolve, reject){
            var oReq = Offline.check(); // just update Offline.state for next time
            if (oReq){
                // XHR request
                oReq.timeout = 5*1000; // our server should respond in under a second but give it a little longer just in case the server is busy uploading photos or something
     
                oReq.onload = function(){
                    // NOTE: 'this' references the Offline.check() call, makes the response the same as Sublib.offline()
                    EventBus.$emit('serviceChanged', 'online');
                    resolve(this.offline);
                };
                oReq.onerror = function(){
                    this.offline = true;
                    Offline.state = 'down';
                    EventBus.$emit('serviceChanged', 'offline'); // doesn't always update correctly when we do it this way. Manually do it
                    resolve(this.offline); 
                    //reject();
                }
                oReq.ontimeout = function(){
                    this.offline = true;
                    Offline.state = 'down';
                    EventBus.$emit('serviceChanged', 'offline'); // doesn't always update correctly when we do it this way. Manually do it
                    resolve(this.offline);
                }
            } else {
                // checking an image on google
                resolve()
            }
         
            
        }); 
        


        //return this.offline();
     }, // verifyOffline




    // *********************************************************************************
    // convert 1234567890 to (123) 456-7890
    Vue.prototype.Sublib.applyPhoneMask = function(number) {
        // number = Numeric OR Char. phone number to apply formatting to

        // phonemask will look something like (###) ###-#### or ###.###.#### etc.
        //mMask = localStorage.getItem('phoneMask');
        
        var mMask = this.getLocaleVal('phoneMask');
            
        if (!mMask) {
            var mMask = '(###) ###-####';
        }

        var mRetNum = this.applyInputMask(number, mMask);
        return mRetNum;
    }, // applyPhoneMask


     // *********************************************************************************
    // getDate format MA 03/03/2023
    Vue.prototype.Sublib.getDateFormat = function() {
        
        var mDateFormat = this.getLocaleVal('dateformat');

        var mCountryCode = localStorage.getItem('userBranchCountryCode');

        // CASE VARTYPE(g_dateformat)<>'N'
		// * For some reason, our dateformat is not alive. Try to guess by the country code.
        //     DO CASE
        //         CASE VARTYPE(g_country)<>'C'
        //             SET DATE AMERICAN
        //         CASE g_country='US'
        //             SET DATE AMERICAN
        //         CASE g_country='CA'
        //             SET DATE BRITISH
        //         CASE INLIST(g_country,'AU','UK')
        //             SET DATE BRITISH
        //         OTHERWISE
        //             SET DATE AMERICAN
        //     ENDCASE
        // CASE g_dateformat=0
        //     * Undefined, default to US
        //     SET DATE AMERICAN
        // CASE g_dateformat=1  && american (mdy)
        //     SET DATE AMERICAN
        // CASE g_dateformat=2  && european (dmy)
        //     SET DATE BRITISH
        // OTHERWISE
        //     SET DATE AMERICAN


        if(!mDateFormat){
            // For some reason, our dateformat is not alive. Try to guess by the country code.\
            if (mCountryCode == 'US'){
                mDateFormat = 'mdy';
            }else if (mCountryCode == 'CA'){
                mDateFormat = 'dmy';
            }else if (this.inList(mCountryCode, 'AU','UK')){
                mDateFormat = 'dmy';
            }else{
                mDateFormat = 'mdy';
            }
        }else if (mDateFormat == '0'){
            // Undefined, default to US
            mDateFormat = 'mdy';
        }else if (mDateFormat == '1'){
            // american (mdy)
            mDateFormat = 'mdy';
        }else if (mDateFormat == '2'){
            // european (dmy)
            mDateFormat = 'dmy';
        }else{
            mDateFormat = 'mdy';
        }
            
        if (!mDateFormat) {
            mDateFormat = 'mdy';
        }

        return mDateFormat.toUpperCase();
    }, // getDateFormat



    // *********************************************************************************
    // convert 1234567890 to 123,456,7890
    Vue.prototype.Sublib.applyInputMask = function(number, mMask, retZero) {
        var mRetNum = '';
        if (!mMask){
            mMask = '';
        }

        // easier to apply input mask if you take off the negative and add it back in when done
        let numIsNeg;
        if (typeof number == 'number'){
            numIsNeg = number < 0;
            number = Math.abs(number);

        } else if (typeof number == 'string'){
            numIsNeg = this.left(number, 1) == '-';
            if (numIsNeg)
                number = number.substring(1);
        }

       
        if (typeof number != 'undefined' && mMask) {
            // work right to left in case the number is smaller than the input mask
            //var mCleanNum = this.cleanNumber(number, true);
            var mCleanNum = this.cleanNumber(number, (this.left(String(number), 1) == '-' && this.occurs(String(number), '-') == 1));

            if (mCleanNum.length > this.occurs(mMask, '#')){
                // Number bigger than input mask, treat like VFP and display *s
                mCleanNum = '*'.repeat(mCleanNum.length);

            } else if (this.math.eval(() => Number(number) - Math.floor(Number(number))) == 0 && this.occurs(mMask, '.')) {
                // we have a decimal in the input mask but not in the number passed in
                // make sure the number passed in isn't bigger than the decimal part
                var mHoldInputMask = mMask.substring(0, mMask.indexOf('.'));

                if (String(Math.floor(Number(number))).length > this.occurs(mHoldInputMask, '#')){
                    mCleanNum = '*'.repeat(mCleanNum.length);
                }
            }

            var mOffSet = 0;

            // since I want to work in reverse, easiest to keep the code that works from left to right and just reverse the strings
            mCleanNum = mCleanNum.split('').reverse().join('');
            mMask = mMask.split('').reverse().join('');

            var mDecPointsTotal = mMask.indexOf('.');
            var mDecPointAlready = 0;
            if (this.contains(String(number), '.')){
                //mDecPointAlready = String(number - Math.floor(number)).replace('.', '').length; // weird bug where 2840.3-2840 gave me 0.3000000000001819 (Submitted to Edge Team)
                mDecPointAlready = String(number).substr(String(number).indexOf('.')).replace('.', '').length;
            }

            if (this.contains(mMask, '.') 
                && (!this.contains(String(number), '.') || mDecPointAlready < mDecPointsTotal)){
                // deal with the input mask wanting decimals but a whole number was passed in
                // i.e. ###.## and passed in 125
                mCleanNum = this.padL('', mDecPointsTotal - mDecPointAlready, '0') + mCleanNum;
            } else if (this.contains(mMask, '.') && mDecPointAlready > mDecPointsTotal){
                // something like 17.205 and input mask of '##.##', strip off the extra decimals 
                // i.e. 17.205 => 17.20
                // it's reversed (50217), so do a simple substr
                mCleanNum = mCleanNum.substr(mDecPointAlready - mDecPointsTotal);
            }


            for (var mx = 0; mx < mMask.length; mx++) {
                var mHoldMask = mMask[mx];
                if (mHoldMask.indexOf('#') > -1) {
                    if (mCleanNum[mx - mOffSet]) {
                        mRetNum = mRetNum + mCleanNum[mx - mOffSet];
                    } else {
                        // mCleanNum may not be as long as phone mask
                        break;
                    }

                } else {
                    mRetNum = mRetNum + mHoldMask;
                    mOffSet = mOffSet + 1
                }
            } // for

            // now reverse it back to the order passed in
            mRetNum = mRetNum.split('').reverse().join('');

             // make sure the mask is back in the correct order
            mMask = mMask.split('').reverse().join('');

        } else {
            // just return what was passed in so it doesn't err out.
            if(!number && retZero){
                mRetNum = '0.00';
            }else{
                mRetNum = String(number); // just in case
            }
        }

    
        if (!this.isNumeric(this.left(mRetNum, 1))
            && this.left(mRetNum, 1) != '-' // let negatives through
            && mMask != '' 
            && this.left(mRetNum, 1) != this.left(mMask, 1)){
                // don't want to return ',116' for input mask of '###,###'
                mRetNum = mRetNum.substr(1);
        }

        if (numIsNeg){
            mRetNum = '-' + mRetNum;
        }

        return mRetNum;

    }, // applyInputMask


    // *********************************************************************************
    // This will strip off any type of formatting and return a clean number
    // RETURNS: String
    Vue.prototype.Sublib.cleanNumber = function(number, mKeepNeg, mKeepPeriod) {
        // mKeepNeg = Logical. If true, does NOT strip off '-' (good for negative numbers, bad for phone numbers)
        // mKeepPeriod = Logical. If true, does NOT strip off '.'        
        if (typeof number != 'undefined') {
            var mCleanNum = String(number);
            // clean up number
            mCleanNum = this.replaceAll(mCleanNum, ' ', '');
            // use \\ to escape ( ) .
            mCleanNum = this.replaceAll(mCleanNum, '\\(', '');
            mCleanNum = this.replaceAll(mCleanNum, '\\)', '');

            mCleanNum = this.replaceAll(mCleanNum, ',', '');
    
            mCleanNum = this.replaceAll(mCleanNum, '\\$', '');

            if (!mKeepPeriod){
                mCleanNum = this.replaceAll(mCleanNum, '\\.', '');
            }
            if (!mKeepNeg){
                mCleanNum = this.replaceAll(mCleanNum, '-', '');
            }

            return mCleanNum;
        } else {
            return '';
        }
    }, // cleanNumber


    // *********************************************************************************
    // Launch the phone dialer with a specific number
    Vue.prototype.Sublib.callNumber = function(number) {

        var mHasPhoneDialer = this.convFromStr(localStorage.getItem('devHasDialer'));
        if (mHasPhoneDialer){
            var mCleanNum =this.cleanNumber(number);
            if (!mCleanNum){
                return;
            }

            // luanch dialer
            //document.location.href = "tel:+" + mNumber; // This doesn't work. Both android and iPhone seem to think the tel:+ means make it an international call. SRR 11.21.2016
            document.location.href = "tel:" + mCleanNum;
        } else {
            // device doesn't support a phone dialer
            // still need to show the number so they can type it into their phone
            var mMsg = this.getLbl('no phone dialer for call');
            mMsg = mMsg.replace('<NUMBER>', this.applyPhoneMask(number));
            this.mbox(mMsg);
        }

    }, // callNumber


    // *********************************************************************************
    // launch the default SMS app with a specific number
    Vue.prototype.Sublib.textNumber = function(number) {
        var mCleanNum =this.cleanNumber(number);
        if (!mCleanNum){
            return;
        }


        // launch default SMS app
        // see https://stackoverflow.com/questions/31342336/opening-sms-app-from-feature-phones-mobile-browser
        if (this.isIOS()) {
            // sms:1234&body=hi
            document.location.href = "sms:" + mCleanNum
        } else {
            // android / windows
            // sms:1234?body=hi
            document.location.href = "sms:" + mCleanNum
        }
    }, // textNumber


    // *********************************************************************************
    // launch the default email client
    Vue.prototype.Sublib.email_DlftMailClient = function(email, subject, body) {
        // window.location.href = "mailto:user@example.com?subject=Subject&body=message%20goes%20here";
        //var email = 'sample@gmail.com';
        //var subject = 'Test';
        //var emailBody = 'Hi Sample,';
        //var attach = 'path';
        //document.location = "mailto:" + email + "?subject=" + subject + "&body=" + emailBody +
        //    "?attach=" + attach;

        var mEmail = "mailto:" + email;
        if (subject && body) {
            mEmail += '?subject=' + subject + '&body=' + body;
        } else if (subject) {
            mEmail += '?subject=' + subject;
        }


        //window.location.href = "mailto:" + email;
        window.location.href = mEmail;
        //document.location = mEmail;
    }, //email


    // *********************************************************************************
    // This will launch google maps / apple maps on their phone / tablet or a new tab with google maps if on the desktop
    // see https://stackoverflow.com/questions/15042283/current-location-google-maps-link-to-directions
    // and https://developers.google.com/maps/documentation/urls/guide#directions-action
    Vue.prototype.Sublib.nav2Addr = function(lat, long, physical, mailing, mStartingLoc, mStop1, mStop2, mStop3, mStop4, mStop5, mStop6, mStop7, mStop8, mStop9, retIFrameURL) {
        // lat = Char or Numeric
        // long = Char or Numeric
        // physical = Char.
        // mailing = Char. 
        // mStartingLoc = Char. Optional. Address. Only pass if starting location is NOT current location
        // mStop1 = Char. Optional. Address. Stop 1 between current location and final destination (only supported by google maps)
        // mStop2 = Char. Optional. Address. Stop 2 between current location and final destination (only supported by google maps)
        // mStop3 = Char. Optional. Address. Stop 3 between current location and final destination (only supported by google maps)
        // mStop4 = Char. Optional. Address. Stop 4 between current location and final destination (only supported by google maps)
        // mStop5 = Char. Optional. Address. Stop 5 between current location and final destination (only supported by google maps)
        // mStop6 = Char. Optional. Address. Stop 6 between current location and final destination (only supported by google maps)
        // mStop7 = Char. Optional. Address. Stop 7 between current location and final destination (only supported by google maps)
        // mStop8 = Char. Optional. Address. Stop 8 between current location and final destination (only supported by google maps)
        // mStop9 = Char. Optional. Address. Stop 9 between current location and final destination (only supported by google maps)
        // retIFrameURL = Logical. Optional. If passed, returns the google maps URL so you can do what you want with it

        
        // NOTE: This note is outdated!. SRR 10.21.2019 NOTE: Pass EITHER lat & long, OR physical / mailing, NOT both. If you do pass both, ONLY lat / long will be used. 


        // var iOS = this.isIOS();
        // var android = this.isAndroid();

        var mPrefMap = localStorage.getItem('prefMap');
        if (retIFrameURL)
            mPrefMap = 'google';


        var mTravMode = localStorage.getItem('travMode'); // SRR 08/30/2022

        if (!mTravMode){
            this.getTravMode(); // shoot it off so we have it next time. 
            mTravMode = 'DRIVE'; // backwards compatible
        }
        mTravMode = mTravMode.toUpperCase();

        if (mTravMode != 'DRIVE' && mPrefMap != 'google'){
            // force switch to google maps for other methods of transport
            mPrefMap = 'google';
            localStorage.setItem('prefMap', mPrefMap);
        }
        

        if (!physical){
            physical = '';
        }
        if (!mailing){
            mailing = ''
        }
        physical = physical.trim();
        mailing = mailing.trim();

        // // try to use lat and long (preferred)
        // if ((lat != '' && long != '') && (lat != '0' && long != '0') && (lat != null && long != null)) {
        //     // NOT ACTUALLY USING LAT & LONG!
        //     var latandlong = lat + ',' + long;

        //     if (iOS) {
        //         window.open("maps:" + latandlong, '_system');
        //     } else if (android) {
        //         window.open("geo:0,0?q=" + latandlong);
        //     } else {
        //         window.open("http://maps.google.com/?q=" + latandlong, '_system');
        //     }


        // } else {
        //     // use actual address (not Preferred)

            // NOTE: For Apple / google (and where possible)
            // Our preferred way to map is to use the actual address.
            // We had problems where an address was geo-coded wrong (or wasn't geo-coded at all)
            // but Google could resolve the address (i.e. new construction or an intersection)

            var mAddress;

            if (lat && long 
                && !((physical && physical != ', ,')
                    || (mailing && mailing != ', ,'))
                ){
                
                // Using Lat / Long. Last resort. Google resolves the address better. Weird. SRR 07/08/2021
                mAddress = String(lat) + ',' + String(long);

            } else {
                // using the actual address (preferred!)
                if (physical != '' && physical != ', ,') {
                    mAddress = physical;
                } else {
                    mAddress = mailing;
                }

                if (!mAddress || mAddress == ', ,'){
                    this.mbox(this.getLbl('no addr defined map'));
                    return;
                }

                // I was having a problem with the way some of the commas were coming through, google maps compensates if there are no commas.
                // just remove all of them.
                mAddress =this.replaceAll(mAddress, ',', '');
                mAddress =this.replaceAll(mAddress, ' ', '+');
                // depending on spaces, it may have inserted two '+', replace with one
                // use \\ to escape '+'
                mAddress =this.replaceAll(mAddress, '\\+\\+', '+');
                mAddress =this.replaceAll(mAddress, '&', '%26'); // a lot of people put '&' for a cross street. URL encode so google doesn't strip out the '&'
            }


            mStartingLoc = (mStartingLoc ? mStartingLoc : '');
            mStartingLoc =this.replaceAll(mStartingLoc, ',', '');
            mStartingLoc =this.replaceAll(mStartingLoc, ' ', '+');
            mStartingLoc =this.replaceAll(mStartingLoc, '\\+\\+', '+');
            mStartingLoc =this.replaceAll(mStartingLoc, '&', '%26'); // a lot of people put '&' for a cross street. URL encode so google doesn't strip out the '&'


            mStop1 = (mStop1 ? mStop1 : '');
            mStop1 =this.replaceAll(mStop1, ',', '');
            mStop1 =this.replaceAll(mStop1, ' ', '+');
            mStop1 =this.replaceAll(mStop1, '\\+\\+', '+');
            mStop1 =this.replaceAll(mStop1, '&', '%26'); // a lot of people put '&' for a cross street. URL encode so google doesn't strip out the '&'

            mStop2 = (mStop2 ? mStop2 : '');
            mStop2 =this.replaceAll(mStop2, ',', '');
            mStop2 =this.replaceAll(mStop2, ' ', '+');
            mStop2 =this.replaceAll(mStop2, '\\+\\+', '+');
            mStop2 =this.replaceAll(mStop2, '&', '%26'); // a lot of people put '&' for a cross street. URL encode so google doesn't strip out the '&'

            mStop3 = (mStop3 ? mStop3 : '');
            mStop3 =this.replaceAll(mStop3, ',', '');
            mStop3 =this.replaceAll(mStop3, ' ', '+');
            mStop3 =this.replaceAll(mStop3, '\\+\\+', '+');
            mStop3 =this.replaceAll(mStop3, '&', '%26'); // a lot of people put '&' for a cross street. URL encode so google doesn't strip out the '&'


            if (mStartingLoc || mStop1 || mStop2 || mStop3){
                // force google (haven't coded the others yet). SRR 01/14/2021
                this.toast('Switching from ' + mPrefMap + ' to google to map multiple locations');
                mPrefMap = 'google';
            }


            // see https://developers.google.com/maps/documentation/urls/guide#directions-action
            // Uses Google Maps API as of 04.06.2018. I was having a lot of problems (i.e. only showing 'preview' instead of 'start' so they could never actually get directions)
            // with passing in the address to maps.google.com. Switching to the API seems to have solved it.
            // NOTE: Starting place is optional, will automatically resolve to current location. SRR 04.06.2018
            var mURL;
            if (retIFrameURL){
                // see https://developers.google.com/maps/documentation/embed/embedding-map
                //mURL = 'https://www.google.com/maps/embed/v1/directions?key=<KEY>&destination=' + mAddress;
                mURL = 'https://www.google.com/maps/embed/v1/place?key=<KEY>&q=' + mAddress;
                // NOTE: As of right now, there is no charge to embed google maps on your page. SRR 06/01/2023
                // see https://developers.google.com/maps/documentation/embed/usage-and-billing
                mURL = mURL.replace('<KEY>', this.getMapIFrameKey()); // API key is limited to embed maps / our site
                
                
            } else {
                mURL = 'https://www.google.com/maps/dir/?api=1&destination=' + mAddress;
            }
            
            var mWayPoints = '';

            //if (iOS) {
            if (mPrefMap == 'apple'){
                try {
                    // try apple maps first
                    var mHold = 'maps:saddr=My+Location&daddr=' + mAddress;
                    window.location = mHold;
                } catch (launchURL) {
                    // apple failed, launch google maps (either in browser or in google maps if it's installed, google handles this)
                    window.open(mURL);
                }
               
            } else if (mPrefMap == 'google'){
                // google maps will redirect to the native app if it's installed
                
                if (mStartingLoc){
                    mURL += '&origin=' + mStartingLoc;
                } else if (false && retIFrameURL){
                    // origin is required
                    mURL += '&origin=Your+Location';
                }

                if (mStop1 || mStop2 || mStop3){
                    // According to https://developers.google.com/maps/documentation/urls/get-started#directions-action,
                    // "The number of waypoints allowed varies by the platform where the link opens, 
                    //  with up to three waypoints supported on mobile browsers, and a maximum of nine waypoints supported otherwise. 
                    //  Waypoints are displayed on the map in the same order they are listed in the URL."

                    // Basically, you can map 5 places, the starting location, the 3 way points, and the final destination. SRR 01/14/2021
                    if (mStop1){
                        mWayPoints += (mWayPoints ? '|' : '') + mStop1;
                    }
                    if (mStop2){
                        mWayPoints += (mWayPoints ? '|' : '') + mStop2;
                    }
                    if (mStop3){
                        mWayPoints += (mWayPoints ? '|' : '') + mStop3;
                    }
                    // From here on is only supported in the desktop browser
                    if (mStop4){
                        mWayPoints += (mWayPoints ? '|' : '') + mStop4;
                    }
                    if (mStop5){
                        mWayPoints += (mWayPoints ? '|' : '') + mStop5;
                    }
                    if (mStop6){
                        mWayPoints += (mWayPoints ? '|' : '') + mStop6;
                    }
                    if (mStop7){
                        mWayPoints += (mWayPoints ? '|' : '') + mStop7;
                    }
                    if (mStop8){
                        mWayPoints += (mWayPoints ? '|' : '') + mStop8;
                    }
                    if (mStop9){
                        mWayPoints += (mWayPoints ? '|' : '') + mStop9;
                    }

                    mWayPoints = this.replaceAll(mWayPoints, '\\|', '%7C');
                    mWayPoints = '&waypoints=' + mWayPoints;

                    mURL += mWayPoints;
                }

                if (mTravMode == 'PTRAN'){
                    // Public Transportation
                    mURL += '&travelmode=transit'
                } else { // mTravMode = 'DRIVE'
                    // nothing to do. Defaults to drive
                }

                if (retIFrameURL){
                    return mURL;

                } else if (this.usingWebview('ios')) {
                    window.location.href = mURL;

                } else {
                    window.open(mURL, '_system');
                }
                

            } else if (mPrefMap == 'here'){
                // see https://stackoverflow.com/questions/58418199/how-do-i-call-here-maps-app-from-js-in-the-browser/58483946#58483946
                // and https://developer.here.com/documentation/deeplink-web/topics/share-route.html
                // NOTE: HERE only supports using lat / long (can't pass in a raw address)
                var mLoc = String(lat) + ',' + String(long);
                // https://share.here.com/r/LATITUDE,LONGITUDE/LATITUDE,LONGITUDE
                // 12-Westminster-Way,-Mobile,-AL-

                mURL = 'https://share.here.com/r/mylocation/' + mLoc;
                //mURL = 'https://share.here.com/r/mylocation/' + mAddress; Doesn't work :(
                window.open(mURL, '_system');
            
            } else {
                // just launch in google maps (so something launches)
                window.open(mURL, '_system');
            }
            // } else if (android) {
            //     window.open(mURL);
            // } else {
            //     // windows
            //     window.open(mURL, '_system');
            // }

            return;

        //    if (iOS) {
        //        //window.open("http://maps.apple.com/?q=" + mAddress, '_system');
        //        //var mHold = 'maps:daddr=' + mAddress; // this opens the destination address without directions

        //        try {
        //            //var mHold = 'maps:saddr=Current+Location&daddr=' + mAddress;
        //            var mHold = 'maps:saddr=My+Location&daddr=' + mAddress;
        //            window.location = mHold;
        //        } catch (launchURL) {
        //            window.open("http://maps.google.com?saddr=My+Location&daddr=" + mAddress, '_system');
        //        }

        //        //window.open("maps:" + mAddress, '_system');
        //    } else if (android) {
        //        //window.open("geo:0,0?q=" + mAddress); // this opens just the address without directions
        //        //window.open("google.navigation:q=" + mAddress); // + '&mode=d' this immediately starts navigating from your current location to the address.
        //        //Doesn't give options on routes, just starts driving

        //        // Deprecated
        //        //window.open('http://maps.google.com?saddr=Current+Location&daddr=' + mAddress); // luanches google maps app, not a new tab // 
        //        window.open('http://maps.google.com?saddr=My+Location&daddr=' + mAddress); // luanches google maps app, not a new tab

        //    } else {
        //        window.open("http://maps.google.com?saddr=My+Location&daddr=" + mAddress, '_system');
        //        //window.open("http://maps.google.com/?q=" + mAddress, '_system'); // this opens just the address without directions
        //    }

        //} // else)
    }, // nav2Addr



    
    // *********************************************************************************
    // Figure out if the users branch uses driving or public transporation to get around
    Vue.prototype.Sublib.getTravMode = async function() {
        if (this.offline()){
            // offline, nothing to determine
            return true;
        }

        var mRetVal, mResp, mURL;
        mURL =this.getWSUrl() + 'cpGetUsers/getTravMode';

        mResp = await this.RestClient.getNoCache(mURL, {});
        var oData =this.wsResp2Obj(mResp);

        if (oData.errorMsg){        
            this.mbox('Error retrieving travel mode: ' + oData.errorMsg);
            return;
        }

        oData[0].travmode = oData[0].travmode.toUpperCase();
        localStorage.setItem('travMode', oData[0].travmode);


        var mPrefMap = localStorage.getItem('prefMap');
        if (oData[0].travmode != 'DRIVE' && mPrefMap != 'google'){
            // force switch to google maps for other methods of transport
            mPrefMap = 'google';
            localStorage.setItem('prefMap', mPrefMap);
        }

    }, // getTravMode



    // *********************************************************************************
    // This is basically a wrapper around this.nav2Addr so I don't have to pass 10 falses before a true
    Vue.prototype.Sublib.getMapIFrameURL = function(lat, long, addr){

        if (addr){
            // Google maps prefers southwest with no space it seems for the iFrame... SRR 08/14/2023
            addr = this.replaceAll(addr, 'south west', 'Southwest', true);
            addr = this.replaceAll(addr, 'south east', 'Southeast', true);
            addr = this.replaceAll(addr, 'north west', 'Northwest', true);
            addr = this.replaceAll(addr, 'nouth west', 'Northeast', true);
        }

        return this.nav2Addr(lat, long, addr, false, false, false, false, false, false, false, false, false, false, false, true);
    }, // getMapIFrameURL



    // *********************************************************************************
    // this will update a cached WS rec. especially useful when in offline mode and we are updating statuses, etc. SRR 07.22.2019
    Vue.prototype.Sublib.updtWSCache = async function(mCacheKey, mName, mValue, mRespObjNum, mRespObjSubNum) {
        // mCacheKey = Char. How to find the rec in IDB
        // mName = Char. Name in Name/Value Pair
        // mValue = Char. Value in Name/Value pair
        // mRespObjNum = Numeric. Optional. Defaults to 0 if not passed. Basically, the index of the name value pair on part 0, 1, 2, 3, etc. of the response
        // mRespObjSubNum = Numeric. Optional. i.e., object inside of object

        if (!mRespObjNum){
            mRespObjNum = 0;
        }
        
        var mCached = await this.IDB.req('cachedWSResp', 'get', mCacheKey);
        if (!mCached){
            // not cached. Crap!
            // don't error out
            return;
        }
        
        var oCache =this.wsResp2Obj(mCached, 0, true);
        if (oCache.errorMsg){
            // Crap! Don't error out
            return;
        }

        if (typeof mRespObjSubNum == 'number' && oCache[mRespObjNum][mRespObjSubNum]){
            oCache[mRespObjNum][mRespObjSubNum][mName] = mValue;

        } else if (oCache[mRespObjNum]) {
            oCache[mRespObjNum][mName] = mValue;

        } else {
            oCache[mName] = mValue;
        }
        
        var mNewCache =this.obj2WSResp(oCache, false, true);

        var mGoOn = await this.IDB.req('cachedWSResp', 'put', mCacheKey, mNewCache);

        return mGoOn;
    }, // updtWSCache



    // *********************************************************************************
    // this will query the web service to get the current status
    //      i.e. clocked in, started on ft, departed on errand, etc.
    // It then updates the tech status bar accross the bottom of the screen.
    Vue.prototype.Sublib.updtTimeStatus = async function(_this) {
        // _this = object reference to Sublib so I can call functions. If not passed, we are initing this function for the first time and have access to 'this'
        // NOTE: lose access to 'this' when the timer fires...

        if (!_this){
            _this = this;
        } 

        if (_this.offline()){        
            EventBus.$emit('updtTimeStatus', '', 'Unknown (Offline)');

            // Set a timer and call this every minute until we go online so we can figure out the status as soon as possible.
            setTimeout(_this.updtTimeStatus, 1000 *30, _this);
            return;
        }

        if (!localStorage.getItem('token')){
            // not signed in. nothing to get
            EventBus.$emit('updtTimeStatus', '', '');
            return;
        }

        var mImg, mLbl;
        // figure out what img / label to display
        // oData[0].ftickid // either FT id, errand Id, or 'Clock In' or 'Clock Out'
        // oData[0].status // either 'started', 'arrived', 'departed', 'completed' or clock in category
        // oData[0].type (either 'FT', 'ER', 'CL' or '' (if clocked out))

    }, // getStatus


   


    // *********************************************************************************
    // strip off all punctuation from a string
    Vue.prototype.Sublib.killPunctuation = function(mStr, mForceUppper) {
        // mStr = Char. String to remove punctuation from
        // mForceUppper = Logical. If true, returns UPPER(mStr) once all punctuation is remeoved

        if (!mStr){
            return '';
        }

        mStr =this.replaceAll(mStr, '\\.', '');
        mStr =this.replaceAll(mStr, ',', '');
        mStr =this.replaceAll(mStr, ' ', '');
        mStr =this.replaceAll(mStr, '_', '');
        mStr =this.replaceAll(mStr, "'", '');
        mStr =this.replaceAll(mStr, '"', '');
        mStr =this.replaceAll(mStr, '&', 'and');
        mStr =this.replaceAll(mStr, '\\(', '');
        mStr =this.replaceAll(mStr, '\\)', '');

        if (mForceUppper){
            mStr = mStr.toUpperCase();
        }

        return mStr;

    }, // killPunctuation


    // *********************************************************************************
    // download a base64 string to their device
    Vue.prototype.Sublib.downloadFile = function(base64Str, fileName, mFileOnServer, mForceFileOnServerDownload, file2SaveHandle) {
        // base64Str = Char. 
        // fileName = Char. file name including ext, i.e. 'test1.pdf'
        // mFileOnServer = Char. Path on server to directly download. i.e. 'docs/test/myDoc.pdf'
        // mForceFileOnServerDownload= Logical. If true, forces the base64 file download for mFileOnServer instead of possibly opening it in a new tab. SRR 03/08/2023
        // file2SaveHandle = Object { kind: 'file', name: 'myTest.pdf' }. Optional. If passed, we are using the new File System Access API. See https://web.dev/file-system-access/ SRR 10/21/2023

        // NOTE: because I can't create a 'CenPoint' subdirectory under downloads, I'm adding 'CP_' to the beggining of all file names for files
        // we download. SRR 9.5.2017

        
        if (!this.usingWebview() && !file2SaveHandle && window.showSaveFilePicker && (base64Str || mForceFileOnServerDownload)){
            // In Chrome / Chromium browsers NOT in a webview, user can specificy where they want to download the file.
            // see: https://developer.chrome.com/articles/file-system-access/ SRR 10/21/2023

            let ext = this.justExt(fileName);
            let mimeType = this.getMimeType(ext);
            let accept = {};
            accept[mimeType] = ['.' + ext];

            // startIn options:
            // desktop: The user's desktop directory, if such a thing exists.
            // documents: Directory in which documents created by the user would typically be stored.
            // downloads: Directory where downloaded files would typically be stored.
            // music: Directory where audio files would typically be stored.
            // pictures: Directory where photos and other still images would typically be stored.
            // videos: Directory where videos/movies would typically be stored.
            // or some handle from the File System Access API (previous call to window.showDirectoryPicker) 

            let options = {
                suggestedName: fileName,
                types: [
                    {
                        //description: 'Text Files',
                        //accept: { mimeType : ['.' + ext], },
                        accept,
                        startIn: "documents", //"downloads",
                    },
                ],
            }; // options

            var _this = this;
            window.showSaveFilePicker(options).then(function(fileHandle) {
                // since this method is syncronous, we can just call the downloadFile method again with the fileHandle
                if (fileHandle)
                    _this.downloadFile(base64Str, fileName, mFileOnServer, mForceFileOnServerDownload, fileHandle); // recursive call
            });
            return;
        }


        if (file2SaveHandle){
            // using the name they picked from the File System Access API. SRR 10/21/2023
            fileName = file2SaveHandle.name;

        } else if (this.left(fileName, 3).toUpperCase() != 'CP_') {
            fileName = 'CP_' + fileName;
        }

        this.toast(this.getLbl('downloading') + ' ' + fileName + '...', 3);
        
        var mDataStr = '';
        var mFileExt = fileName.substr(fileName.lastIndexOf('.') + 1).toUpperCase();

        
        mDataStr = this.getMimeType(mFileExt); // i.e. 'application/pdf' or "image/png"

        if (!mDataStr){
           this.mbox('File type not recognized.'
                        + '\nFile ext: ' + mFileExt + ', File name: ' + fileName);
            return;
        }
        

        var mIsImg = this.contains(mDataStr, 'image/', true);

        //sometimes the base64 string comes back with the 'base64,' in it. If so, strip it off
        if (this.contains(base64Str, 'base64,')){
            base64Str = base64Str.substr(base64Str.indexOf('base64,') + 7);
        }
        
        var mHRef;
        var element = document.createElement('a');


        if (!base64Str && mFileOnServer && (mForceFileOnServerDownload || this.isIOS() || this.isAndroid())){
            // have to pass in the base64 to the phone (at least for now). SRR 03/03/2023
            var _this = this;
            this.getBase64ForURL(mFileOnServer).then(function(base64Str){
                if (base64Str && _this.left(base64Str, 5).toUpperCase() != 'ERROR'){
                    _this.downloadFile(base64Str, fileName, '', false, file2SaveHandle); // recursive call

                } else if (_this.left(base64Str, 5).toUpperCase() == 'ERROR'){
                    _this.mbox(base64Str);
                }
            })
            return;
        }


        //catch it if we have a bad base64 string MA 01/23/2023
        if(!mFileOnServer && base64Str){
            try {
                window.atob(base64Str);
            } catch(e) {
                // something failed
            
                // if you want to be specific and only catch the error which means
                // the base 64 was invalid, then check for 'e.code === 5'.
                // (because 'DOMException.INVALID_CHARACTER_ERR === 5')

                // if the base64 string doesn't end with an '=' then it's not a valid base64 string.
                this.mbox(this.getLbl('corrupted file') + fileName + ' base64 string: ' + base64Str.substring(-10));
                return;

            }
        }

        if (mFileOnServer && !this.isIOS() && !this.isAndroid()){
            // We're doing a direct download via the browser, not a base64 string we sent back from the webservice
            if (this.contains(mFileOnServer, 'https://', true)){
                // already formatted. Started doing this to deal with round robin issues so it has the direct server. SRR 09/01/2022
                mHRef = mFileOnServer;

            } else {
                // just has the sub path on the server. Figure out the server name (what we did for a few years until we started doing sub round robins). SRR 09/01/2022
                var mBaseURL, oCurServer;
                mBaseURL = this.getWSUrl(); 
                oCurServer = JSON.parse(localStorage.getItem('curServer')); // this MUST be the same as the server they just hit or it won't have the file!

                mHRef = mBaseURL;

                if (!this.contains(mBaseURL, 'jamie')
                    && !this.contains(mBaseURL, 'alpha')
                    && !this.contains(location.href, '192.168.10.')) {

                        mHRef = mBaseURL.replace('ws', oCurServer.subdomain); // 'https://wssanfran.cenpoint.com/
                }

                mHRef += mFileOnServer; //  'docs/test/myDoc.pdf'
            }
            
            
            // since this is a download method, don't do launchURL for pictures. Want to actually download them even if we have a URL instead of the base64 string. SRR 01/23/2022
            // if (!this.isAndroid() && !this.isIOS()){
            if (true || !this.usingWebview()){
                // desktop, just open it in another tab (so they can still use the app in the other tab)
                // it kept opening the the current tab (not downloading)
                this.launchURL(mHRef);
                return;
            } 

        } else if (this.usingWebview('android')) {
            // NOTE: Anroid doesn't pass in the 'download' attribute where we put the file name from the webview to the android code.
            // Sneaking it in. android side will parse it out. SRR 9.4.2017
            // NOTE: Had a problem downloading a PDF with a '#' sign in (i.e. 'hrcc winter tips #4.pdf').
            // This is only happening when running through the webview. Strtran() it out so the PDf will download correctly. SRR 01/28/2020
            fileName = fileName.replace('#', '');
            // mHRef = 'data:' + mDataStr + ';name:' + fileName + ';base64,' + base64Str;

            // Android stopped calling me method altogher when I progrmatically click the a tag with an href. Not sure why. Wrote a custom method instead. SRR 10/02/2020
            if (android.saveBase64File){
                android.saveBase64File(fileName, base64Str);
                return;

            } else {
                // use the old way
                mHRef = 'data:' + mDataStr + ';name:' + fileName + ';base64,' + base64Str;
            }

        } else if (this.usingWebview('ios') && this.isIOS()) {
            // for whatever reason, safari is behind again and you have to do it special for them. 
            // don't support the 'download' attribute' // There is litterally no way to specify the file name on mobile iOS!
            // Don't actually generate a pdf / img, etc. if you put application/pdf. dumb.  SRR 03.01.2019
            //mHRef = 'data:application/octet-stream;base64,' + encodeURIComponent(base64Str);
            
           //as of MA 07/20/2023 this is working for both iPhone and iPad on webview    
         
            // Webview handles the downlod for us. Just pass in the base64 string and the file name.
            element.setAttribute('filename', fileName);    
            mHRef = 'data:' + mDataStr + ';name:' + fileName + ';base64,' + base64Str; // above code stopped working and it was downloading octet-stream which was causing problems. MA 05/04/2023

        } else if (this.isIOS()){  //account for safari browsers in ios   
            // as of MA 07/20/2023 this is working for both iPhone and iPad on safari
            mHRef = 'data:application/octet-stream;base64,' + encodeURIComponent(base64Str);
            element.setAttribute('filename', fileName);        
        }else {
            mHRef = 'data:' + mDataStr + ';base64,' + base64Str;
        }


        if (file2SaveHandle){
             // Create a FileSystemWritableFileStream to write to.
            // const writable = await fileHandle.createWritable();
            // // Write the contents of the file to the stream.
            // await writable.write(contents);
            // // Close the file and write the contents to disk.
            // await writable.close();

            // the file you write gets corrupted if you don't convert it to a byte array first. SRR 10/21/2023
            let byteArray = this.base64ToByteArray(base64Str);
            
            // since this method is async, do it the hard way. SRR 10/21/2023
            file2SaveHandle.createWritable().then(function(writable) {
                // Write the contents of the file to the stream.
                //writable.write(base64Str).then(function() {
                //writable.write(mHRef).then(function() {
                writable.write(byteArray).then(function() {    
                    // Close the file and write the contents to disk.
                    writable.close().then(function() {
                    }); // .close
                }); // .write
            }); // .createWritable

        } else {
            // save it the old way. 
            //element.setAttribute('href', 'data:application/pdf;base64,' + base64Str);
            element.setAttribute('href', mHRef);
            // element.setAttribute('target', '_blank'); // needed for iPads now apparently. SRR 06/02/2023  does nothing MA 07/19/2023
            element.setAttribute('download', fileName);

            element.style.display = 'none';
            document.body.appendChild(element);

            element.click();

            document.body.removeChild(element);
        }

        return;
    }, // downloadFile



    // *********************************************************************************
    // Convert a base64 string to a byte array
    Vue.prototype.Sublib.base64ToByteArray = function(base64Str) {
        
        if (this.contains(base64Str, 'base64,')){
            base64Str = base64Str.substr(base64Str.indexOf('base64,') + 7);
        }

        // console.log('base64ToByteArray', base64Str.substr(0, 100) + '...');
        let byteCharacters = atob(base64Str);
        let byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        let byteArray = new Uint8Array(byteNumbers);
        return byteArray;
    }, // base64ToByteArray



    // *********************************************************************************
    // print a base64 string (or url)
    // see https://stackoverflow.com/questions/33900689/how-to-print-a-base64-pdf (tried a few things and this is the only one that worked, others kept erroring out with permissions issues)
    // 
    // returns: logical. true if it worked (opened the print dialog, don't know if they clicked print or cancel), false if it didn't
    Vue.prototype.Sublib.printFile = async function(mURL) {
        // mURL = Char. Full path of URL to print. i.e. 'https://ws.cenpoint.com/cpwc.wc/docs/test/myDoc.pdf'
        // NOTE: can also be a base64 string

        if (!mURL){
            this.mbox(this.getLbl('no file to print'));
            return false;
        }

        let ext; // pdf, jpeg, etc.

        if (this.contains(mURL, 'https://', true)){
            // get the base64 string for the URL (only way this will work)
            ext = this.justExt(mURL); // pdf, jpeg, etc.
            mURL = await this.getBase64ForURL(mURL);

            if (!mURL){
                this.mbox(this.getLbl('no file to print'));
                return false;
            }
        } else {
            // 'data:application/pdf;base64,' + base64Str
            // extract out the 'data' part
            // ext = mURL.substr(mURL.indexOf('data:') + 'data:'.length);
            // ext = ext.substr(0, ext.indexOf(';')); // 'application/pdf'
            ext = this.getBase64FileExt(mURL);
        }


        if (this.contains(mURL, 'base64,')){
            mURL = mURL.substr(mURL.indexOf('base64,') + 7);
        }


        //await this.showSimplePopUp(this.Vue.extend(DOCVIEWER), { doc2Show: mURL});
        


        
//         if (!window.pdfjsLib){
//             await this.loadScript('pdfViewer.min.js'); // creates public varaible pdfjsLib
//         }
// debugger
//         return new Promise(async (resolve, reject) => {
//             // see https://mozilla.github.io/pdf.js/examples/index.html#interactive-examples
//             let loadingTask = pdfjsLib.getDocument({ data: atob(mURL) });
//         });

        

        
        // NOTE: This works but I could NOT get the call backs to work to tell when the user closed the dialog. Using printJS library fixed that. SRR 10/07/2023
        // let byteCharacters = atob(mURL);
        // let byteNumbers = new Array(byteCharacters.length);
        // for (let i = 0; i < byteCharacters.length; i++) {
        //     byteNumbers[i] = byteCharacters.charCodeAt(i);
        // }
        // let byteArray = new Uint8Array(byteNumbers);
        // let file = new Blob([byteArray], {type: 'application/pdf;base64'});
        // let fileURL = URL.createObjectURL(file);
        // let oWindow = window.open(fileURL);
        // oWindow.print();
        // await this.mbox('used different method')
        // return false;

        var _this = this;

        return new Promise(async (resolve, reject) => {
            
            let printDialogClosedFunc = function(error){
                // NOTE: When this is called, we do NOT know if they clicked 'print' or 'cancel', just that the print dialog closed. SRR 10/07/2023

                if (error){
                    // error
                    _this.mbox('Error printing file: ' + String(error));
                    resolve(false);

                } else {
                    // closed the dialog
                    resolve(true);
                }
// debugger;                
//                 window.removeEventListener('afterprint', tabClosedFunc);
//                 closedTab = true;
                
            }

            ext = ext.toUpperCase();

            // PrintJS options (from https://printjs.crabbly.com/) It seems to be in maintenance mode so making a copy here in case it goes away. SRR 10/16/2023
            // Property     Default                 Description
            // printable       null                    Document source: pdf or image url, html element id or json data object.
            // type            'pdf'                   Printable type. Availble print options are: pdf, html, image, json and raw-html.    
            // header          null                    Optional header to be used with HTML, Image or JSON printing. It will be placed on the top of the page. This property will accept text or raw HTML.
            // headerStyle     'font-weight: 300;'     Optional header style to be applied to the header text.
            // maxWidth        800                     Max document width in pixels. Change this as you need. Used when printing HTML, Images or JSON.
            // css             null                    This allow us to pass one or more css files URLs that should be applied to the html being printed. Value can be a string with a single URL or an array with multiple URLs.
            // style           null                    This allow us to pass a string with custom style that should be applied to the html being printed.
            // scanStyles      true                    When set to false, the library will not process styles applied to the html being printed. Useful when using the css parameter.
            // targetStyle     null                    By default, the library process some styles only, when printing HTML elements. This option allows you to pass an array of styles that you want to be processed. Ex.: ['padding-top', 'border-bottom']
            // targetStyles    null                    Same as `targetStyle`, however, this will process any a range of styles. Ex.: ['border', 'padding'], will include 'border-bottom', 'border-top', 'border-left', 'border-right', 'padding-top', etc.     
            //                                         You can also pass ['*'] to process all styles.
            // ignoreElements  [ ]                     Accepts an array of html ids that should be ignored when printing a parent html element.
            // properties      null                    Used when printing JSON. These are the object property names.
            // gridHeaderStyle 'font-weight: bold;'    Optional style for the grid header when printing JSON data.
            // gridStyle       'border: 1px solid lightgray; margin-bottom: -1px;' Optional style for the grid rows when printing JSON data.
            // repeatTableHeader   true                Used when printing JSON data. When set to false, the data table header will show in first page only.    
            // showModal       null                    Enable this option to show user feedback when retrieving or processing large PDF files.
            // modalMessage    'Retrieving Document...'Message displayed to users when showModal is set to true.
            // onLoadingStart  null                    Function to be executed when PDF is being loaded
            // onLoadingEnd    null                    Function to be executed after PDF has loaded
            // documentTitle   'Document'              When printing html, image or json, this will be shown as the document title.
            // fallbackPrintable   null                When printing pdf, if the browser is not compatible (check browser compatibility table), the library will open the pdf in a new tab. This allow you to pass a different pdf document to be opened instead of the original passed in `printable`. This may be useful if you inject javascript in your alternate pdf file.
            // onPdfOpen       null                    When printing pdf, if the browser is not compatible (check browser compatibility table), the library will open the pdf in a new tab. A callback function can be passed here, which will be executed when this happens. It may be useful in some situations where you want to handle your print flow, update user interface, etc.
            // onPrintDialogClose  null                Callback function executed once the browser print dialog is closed.
            // onError         error => throw error    Callback function to be executed when an error occurs.
            // base64          false                   Used when printing PDF documents passed as base64 data.
            // honorMarginPadding (deprecated )    true    This is used to keep or remove padding and margin from elements that are being printed. Sometimes these styling settings are great on screen but it looks pretty bad when printing. You can remove it by setting this to false.
            // honorColor (deprecated )    false       To print text in color, set this property to true. By default all text will be printed in black.
            // font (deprecated )  'TimesNewRoman'     Typeface used when printing HTML or JSON.
            // font_size (deprecated ) '12pt'          Font size used when printing HTML or JSON.
            // imageStyle (deprecated )    'width:100%;'   Used when printing images. Accepts a string with custom styles to be applied to each image.
            

            let byteArray = this.base64ToByteArray(mURL);
            let file = new Blob([byteArray], {type: this.getMimeType(ext) + ';base64'}); // {type: 'application/pdf;base64'}
            let fileURL = URL.createObjectURL(file);

            // printJS({
            //     printable: mURL, 
            //     type: (ext == 'PDF' || _this.contains(ext, 'pdf', true) ? 'pdf' : 'image'), // 'pdf', 'html', 'image' or 'json'
            //     base64: true, 
            //     onPrintDialogClose: printDialogClosedFunc, 
            //     onError: printDialogClosedFunc
            // });           

            printJS({
                printable: fileURL, 
                type: (ext == 'PDF' || _this.contains(ext, 'pdf', true) ? 'pdf' : 'image'), // 'pdf', 'html', 'image' or 'json'
                base64: false, 
                onPrintDialogClose: printDialogClosedFunc, 
                onError: printDialogClosedFunc
            });       
            //printJS({printable: fileURL, type: 'pdf', onPrintDialogClose: printDialogClosedFunc, onError: printDialogClosedFunc});           
        }); // new promise

        
    }, // printFile


    


    // *********************************************************************************
    // download a base64 string to their device from a doc on a website (i.e. https://ws.cenpoint.com.../test/my.pdf)
    Vue.prototype.Sublib.getBase64ForURL = async function(mURL) {
        //var resp = await this.RestClient.getNoCache(mURL);
        try {
            var resp = await fetch(mURL); // fetch gives us a few more options to easily convert the 'blob' to base 64
            var blob = await resp.blob();
            //return await blob.dataUrl();
            return this.getBase64ForFiles(blob);
        } catch (mError){
            return 'ERROR: ' + mError
        }
        
    }, // getBase64ForURL



    // *********************************************************************************
    // Get the mime string / type for a file extention
    Vue.prototype.Sublib.getMimeType = function(mFileExt){

        // NOTE: if you update the list of file types here, 
        // update Android code as well!

         /* Mime Types: (NOTE: Not an exhaustive list)
            For Text
            "text/plain"

            For PDF
            'application/pdf'

            For Image
            "image/jpeg"
            "image/bmp"
            "image/gif"
            "image/jpg"
            "image/png"

            For Video
            "video/wav"
            "video/mp4"
        */

        mFileExt = mFileExt.toUpperCase();

        var mDataStr;
        if (mFileExt == 'PDF') {
            mDataStr = 'application/pdf';
            
            // render the PDF on the page (if browser supports, otherwise broswer asks the user to download)
            // see //https://base64.guru/developers/javascript/examples/decode-pdf
            // NOTE: Works best on the desktop, not too great on the phone
            // var oPDF = document.createElement('object');
            // oPDF.style.width = '100%';
            // oPDF.style.height = '842pt';
            // oPDF.type = mDataStr;
            // oPDF.data = 'data:' + mDataStr + ';base64,' + base64Str;
            // document.body.appendChild(oPDF);

            // to get info about the file
            // var oPDFBinary = atob(base64Str);
            // console.log('File Size:', Math.round(oPDFBinary.length / 1024), 'KB');
            // console.log('PDF Version:', oPDFBinary.match(/^.PDF-([0-9.]+)/)[1]);
            // console.log('Create Date:', oPDFBinary.match(/<xmp:CreateDate>(.+?)<\/xmp:CreateDate>/)[1]);
            // console.log('Modify Date:', oPDFBinary.match(/<xmp:ModifyDate>(.+?)<\/xmp:ModifyDate>/)[1]);
            // console.log('Creator Tool:', oPDFBinary.match(/<xmp:CreatorTool>(.+?)<\/xmp:CreatorTool>/)[1]);
 

        } else if (mFileExt == 'JPG' || mFileExt == 'JPEG') {
            mDataStr = 'image/jpeg';

        } else if (mFileExt == 'PNG') {
            mDataStr = 'image/png';

        } else if (mFileExt == 'BMP'){
            mDataStr = "image/bmp";

        } else if (mFileExt == 'GIF'){
            mDataStr = "image/gif";
        
        } else if (mFileExt == 'CSV'){
            mDataStr = 'text/csv';
        
        } else if (mFileExt == 'XLSX' || mFileExt == 'XLS'){
            mDataStr = 'application/octet-stream'
        
        } else {
            // Catch all. Seems to work well...
            mDataStr = 'application/octet-stream';
        }

        return mDataStr;
    }, // getMimeType


    // *********************************************************************************
    // Get the file extention from a base64 string (i.e. 'PDF', 'JPG', etc.)
    // see: https://stackoverflow.com/questions/27886677/javascript-get-extension-from-base64-image
    // Returns: Char. Uppered() file extention
    Vue.prototype.Sublib.getBase64FileExt = function(base64Str) {
        // base64Str = Char. base64 string of file to get extention for

        if (!base64Str) return '';

        if (base64Str.contains('base64,'))
            base64Str = base64Str.substr(base64Str.indexOf('base64,') + 7);
        
        let retval = '';
        let firstChar = base64Str.charAt(0);

        if (firstChar == '/') {
            retval = 'JPG';

        } else if (firstChar == 'R') {
            retval = 'GIF';

        } else if (firstChar == 'U') { 
            retval = 'WEBP'; // could also be .avi?

        } else if (firstChar == 'i') {
            retval = 'PNG'; // could also be .tiff?

        } else if (firstChar == 'T'){
            retval = 'TIFF';

        } else if (firstChar == 'J') {
            retval = 'PDF';

        } else {
            retval = '';
        }

        return retval;
        
    }, // getBase64FileExt



    // *********************************************************************************
    // This will launch a URL in a new tab or if it's running through the webview, launch the default browser with the URL
    Vue.prototype.Sublib.launchURL = function(mURL, oWindowRef, mChangeCurTab) {
        // mURL = Char. URL to access
        // oWindowRef = Object. Optional
        //      From stack overflow: https://stackoverflow.com/questions/20696041/window-openurl-blank-not-working-on-imac-safari
        //      Safari is blocking any call to window.open() which is made inside an async call.
        //      The solution that I found to this problem is to call window.open before making an asnyc call and set the location when the promise resolves.
        //
        //      var windowReference = window.open();
        //      myService.getUrl().then(function(url) {
        //          windowReference.location = url;
        //      });
        // mChangeCurTab = Logical. If true and we are NOT in the webview, changes the current tab instead of opening a new one (i.e. for an oAuth flow or something).


        if (this.usingWebview()) {
            mURL = 'EXURL:' + mURL; // left 6 = 'EXURL:' is a special string the Android code looks for
        }

        if (this.usingWebview('ios')){
            window.location.href = mURL;

        } else if (oWindowRef){
            oWindowRef.location = mURL;
        } else {
            if (!mChangeCurTab){
                //window.open(mURL, '_system');
                // window.open(mURL, '_blank');
                var oDevice = Vue.prototype.Sublib.getDeviceInfo()

                var popup_window=window.open(mURL, '_blank');            
                if(!popup_window || popup_window.closed || typeof popup_window.closed=='undefined') 
                { 
                    //POPUP BLOCKED
                    //just putting a generic message for now, Scott said he will have the link for the help page MA 07/20/2023
                    //Jamie hit this message on Firefox and she says it is not Safari, so changing the message to be more generic MA 10/10/2023
                    let _this = this;
                    this.mbox(this.getLbl("popup blocker detected"), this.getLbl('instructions'), this.getLbl('close')).then(function(choice){
                        if (choice == 2){
                            // cancel
                            return;
                        }

                        let hash = '';
                        let oDevice = _this.getDeviceInfo();
                        // Scroll to the browser specific section if we can. SRR 10/11/2023
                        if (oDevice.browser == 'safari'){
                            hash = 'allow-popups-in-safari'

                        } else if (oDevice.browser == 'firefox'){
                            hash = 'allow-popups-in-firefox';
                        }

                        _this.launchHelp('https://help.cenpoint.com/docs/allow-pop-ups-for-printing' + (hash ? '#' + hash : ''));
                    });
                    return;
                }else{
                    //POPUP NOT BLOCKED
                    popup_window.focus();
                }
            } else {
                location.href = mURL;
            }
            
        }
        

    }, // launchURL


    // *********************************************************************************
    // Open the desktop app to a certain form (i.e. QB Desktop Push)
    // NOTE: URI Handler MUST be registered in Windows or this won't work!
    //
    // Returns: Logical. True if it opened it, false if it didn't
    Vue.prototype.Sublib.launchDesktop = async function(paramStr) {
        //paramStr = Char. Whatever we are passing to the desktop
        //      NOTE: Token & CustCode will auto be added to it to auto log them in!

        if (this.isIOS() || this.isMac() || this.isAndroid()){
            await this.mbox(this.getLbl('desktop only available on windows'));
            return false;

        } else if (this.getVersionType() != '!FULL!'){
            await this.mbox(this.getLbl('feature only avail in full version'));
            return false;
        }


        // This is all to see if the URI Handler has been registered
        // see https://stackoverflow.com/questions/24779312/simplest-cross-browser-check-if-protocol-handler-is-registered#:~:text=The%20core%20functionality%20that%20you%20need%20is%20setTimeout.,set%20before%20will%20kick%20in%20window.location%20%3D%20%22myapp%3A%2F%2Fsuperlink%22%3B
        var oWindow = window.open()
        oWindow.timeout = null;
        let worked = false;
        var listener = oWindow.addEventListener('blur', function(e){
            if (oWindow.timeout) {
                oWindow.clearTimeout(oWindow.timeout)
                worked = true;
            }
        });

        oWindow.timeout = oWindow.setTimeout(function() {
            //oWindow.location = 'http://localhost:8080'
            worked = false;
            oWindow.timeout = null;
            oWindow.close();

        }, 1000);

        // launch the desktop (if possible)
        oWindow.location.href = 'cenpoint:' + (paramStr ? paramStr : '');

        while (oWindow && !oWindow.closed && !worked){
            await this.sleep(1*1000);
        }

        if (!worked){
            // CenPoint is not installed or not updated to register the custom URI handler
            let choice = await this.mbox(this.getLbl('desktop app not installed'), this.getLbl('download') + ' ' + this.getLbl('<appname>'), this.getLbl('close'));
            if (choice == 1){
                // want to download it. For now, just do a direct download rather than going to our downloads page, feels cleaner. SRR 08/10/2023
                this.launchURL('https://www.cenpoint.com/CenPoint_Setup.exe');
            }
        }


        return worked;



    }, // launchDesktop



    // *********************************************************************************
    // Returns: Array of objects
    // This is our list of web service servers
    // NOTE: The lat and long are just general to the city they are in, NOT the exact location of the data center. (Got them by googling the city)
    Vue.prototype.Sublib.getServerList = function() {
        return [
            //{ label: 'Auto', subdomain: 'ws', lat: 0 , lon: 0 }, // round robin

            // These are alphabetical except for Salt Lake which should always be last!
            // note: order is stored out in local storage. just adding the field here
            //{ label: 'Boise', subdomain: 'wsboise', lat: 43.618881, lon: -116.215019, order: 0, dist: 0 }, // really out of Seattle, but want to pick up other traffic. SRR 01/31/2022
            { label: 'Chicago', subdomain: 'wschicago', lat: 41.878114, lon: -87.629798, order: 0, dist: 0 }, // chicago is a round robin of 3 servers since the traffic is so high there
            { label: 'Dallas', subdomain: 'wsdallas', lat: 32.7766642, lon: -96.7969879, order: 0, dist: 0 }, // Now a round robin to help with traffic load. SRR 03/15/2022
            // { label: 'New York', subdomain: 'wsnewyork', lat: 40.678431, lon: -73.982614, order: 0, dist: 0 }, // SRR 06/15/2023
            // { label: 'Pittsburgh', subdomain: 'wspittsburgh', lat: 40.444413, lon: -79.996639, order: 0, dist: 0 }, // really out of Chicago, but want to pick up other traffic. SRR 01/23/2020

            { label: 'New York', subdomain: 'wsnewyork', lat: 37.5278214, lon: -77.619953, order: 0, dist: 0 }, // Richmond, Virgina lat / long    SRR 06/15/2023
            { label: 'Pittsburgh', subdomain: 'wspittsburgh', lat: 39.102873, lon: -84.420557, order: 0, dist: 0 }, // Cincinatti Lat / Long     really out of Chicago, but want to pick up other traffic. SRR 01/23/2020

            { label: 'San Francisco', subdomain: 'wssanfran', lat: 37.774929, lon: -122.419416, order: 0, dist: 0 }, // now a round robin to help with A-Core. 1 server out of san fran, the other out of seattle. SRR 01/31/2022
            //{ label: 'Singapore', subdomain: 'wssingapore', lat: 1.290270, lon: 103.851959, order: 0, dist: 0 }, // SRR 06/28/2022. Took out. SRR 10/21/2022
            { label: 'Fountain Green', subdomain: 'wsfountaingreen', lat: 40.514115, lon: -112.032994, order: 0, dist: 0 } // Salt lake order will always be LAST! // Changed name to wsfountaingreen from wsherriman. SRR 07/28/2023
        ];
    }, // getServerList


    // *********************************************************************************
    // This will get the users current location and then calc the distanct to each web service server we have and determine the order
    // Will then store out the preferred order in local storage
    // NOTE: Also stores out  / updates 'current server' setting to the number 1 prefered server
    //
    // Returns: true if it worked, false if it failed
    Vue.prototype.Sublib.determineServerOrder = async function() {
        var oLoc = await this.getLocation();

        var aList =this.getServerList();

        if (oLoc.errorMsg){
            // NOTE: still need a preferred server!
            // set the 'order' so it can switch servers / not error out!
            for (var mx = 0; mx < aList.length; mx++){
                aList[mx].order = mx + 1; // I do it 1 based
            }

            localStorage.setItem('curServer', JSON.stringify(aList[0]));
            localStorage.setItem('prefServerOrder', JSON.stringify(aList));
            return aList; //false;
        }

        

        // First figure out the distance to each server 
        for (var mx = 0; mx < aList.length; mx++){
            aList[mx].dist =this.calcDistByGeoCodes(oLoc.lat, oLoc.lon, aList[mx].lat, aList[mx].lon);
        } // for

        // now figure out the order
        aList.sort((objA, objB) => {
            return objA.dist - objB.dist;
        });

        for (mx = 0; mx < aList.length; mx++){
            aList[mx].order = mx + 1; // 1 based
        } // for

        // now tweak it because Salt Lake needs to always be last (our office is a backup)
        // First figure out which order we decided Salt Lake was
        var oSL = aList.find(obj =>{
            //return obj.subdomain == 'wsherriman';
            return obj.subdomain == 'wsfountaingreen'; // SRR 07/28/2023
        });

        // NOTE: oSL is updated by reference (so updating aList[oSLIndex].order updates oSL.order)
        // make it a seperate variable so it's not tied together.
        var mSLOirgOrder = oSL.order;
        
        for (mx = 0; mx < aList.length; mx++){
            if (aList[mx].subdomain == oSL.subdomain){
                aList[mx].order = aList.length;
                continue;
            }
            if (aList[mx].order > mSLOirgOrder){
                aList[mx].order--;
            }
        } // for

        // now store it out in order (just for readability since the order flag is already set)
        aList.sort((objA, objB) => {
            return objA.order - objB.order;
        });

        localStorage.setItem('prefServerOrder', JSON.stringify(aList));
        localStorage.setItem('curServer', JSON.stringify(aList[0]));

        return aList;
    }, // determineServerOrder


    // *********************************************************************************
    // this decides which web service to hit. Starts with current server and then goes through the list by order (order set inthis.determineServerOrder)
    // order is based on geo proximity so closest servers get priority
    // NOTE: this has no wait indicators. Diplay your own if you call this and want them.
    // NOTE: This should only be called if we decided that a web service was down!
    // 
    // Returns: true if it connected to a web service, false if ALL web services failed.
    //
    // NOTE: This also sets to global variables (so other rest calls know what's going on.)
    // Public Variables: window.g_findingWS = true, window.g_foundWS (mRetVal)
    Vue.prototype.Sublib.determineWS = async function() {
        if (this.offline()){
            // offline, nothing to determine
            return true;
        }


        //this.checkOfflineStatus(); // just make sure we're not hitting this because they lost service and we don't know it yet. 

        
        window.g_findingWS = true;
        window.g_foundWS = false; // updated when we're done
        
        var mCurServerNo, aServerList;
        try {
            mCurServerNo = JSON.parse(localStorage.getItem('curServer')).order;
            aServerList = JSON.parse(localStorage.getItem('prefServerOrder')); //this.getServerList();
        } catch (notSet){
            // may get wiped out when they update. Figure it out again
            await this.determineServerOrder();
            mCurServerNo = JSON.parse(localStorage.getItem('curServer')).order;
            aServerList = JSON.parse(localStorage.getItem('prefServerOrder')); //this.getServerList();
        }

        var mTestingServerNo = mCurServerNo; // actually starts with the next one (assumes this one is down)

        var mRetVal, mResp, mURL;
        mURL =this.getWSUrl() + 'cpGetUsers/isWCUp';

        while (true){
            mTestingServerNo ++;
            if (mTestingServerNo > aServerList.length){
                // current test server is the last in on the list, start over
                mTestingServerNo = 1;
            }
            if (mCurServerNo == mTestingServerNo){
                // we tried them all. nothing worked. Crap!
                mRetVal = false;
                break;
            }

            // update local storage for current server (RestClient reads from localStorage, can't pass it in)
            var oTestServ = aServerList.find(obj => {
                return obj.order == mTestingServerNo;
            })            
            localStorage.setItem('curServer', JSON.stringify(oTestServ));


            mResp = await this.RestClient.getNoCache(mURL, {}, true);

            //if (!this.RestClient.respHasError(mResp, mURL)){
            // Pass in the server / subdomain we are trying to hit so if there's an error it logs it and I can see which servers are overloaded. SRR 07/21/2021
            if (!this.RestClient.respHasError(mResp,  mURL.replace('ws', oTestServ.subdomain))){
                // Successfully connected!
                mRetVal = true;
                break;
            }           
        } // while true

        window.g_findingWS = false;
        window.g_foundWS = mRetVal; 

        return mRetVal;
    }, // determineWS


    // *********************************************************************************
    // we want to be using the preferred web service.
    // however, we may be hitting a different one as the preferred is down.
    // This will check to see if the preferred one is up and if so, switch us back to it
    // (checks every 30 minutes)
    Vue.prototype.Sublib.switchToPrefWS = async function() {
        try {
            var oCurServer = JSON.parse(localStorage.getItem('curServer'));
        } catch (ignore){
            // curServer not set yet, nothing to do
            return;
        }
        
        var aServerList = JSON.parse(localStorage.getItem('prefServerOrder'));
        if (!aServerList || !aServerList.length){
            await this.determineServerOrder();
            aServerList = JSON.parse(localStorage.getItem('prefServerOrder'));
        }
        var oPrefServer = aServerList.find(obj => {
            return obj.order == 1;
        });

        if (!oPrefServer){
            return;
        }

        // check every 30 minutes
        var mCheckMin = 30 * 60 * 1000; // miliseconds

        if (!oCurServer){
            // Should never hit this!
            localStorage.setItem('curServer', JSON.stringify(oPrefServer));
            return;
        }

        if (oCurServer.subdomain == oPrefServer.subdomain){
            // already hitting preferred. nothing to do
            return;
        }

        var mNow = await this.getDate(true);
        var mLastCheck = localStorage.getItem('lastPrefWSCheck');
        if (!mLastCheck){
            mLastCheck = this.newDate('01/01/1900');
        } else {
            mLastCheck = this.newDate(mLastCheck);
        }

        if (mNow.getTime() - mLastCheck.getTime() < mCheckMin){
            // hasn't been long enough since our last check
            return;

        } else if (this.offline()){
            // can't check to see if it's up if we're offline. SRR 07/06/2021
            return;
        }


        localStorage.setItem('lastPrefWSCheck', mNow);
        localStorage.setItem('curServer', JSON.stringify(oPrefServer));
        
        var mURL =this.getWSUrl() + 'cpGetUsers/isWCUp';
        var mResp = await this.RestClient.getNoCache(mURL, {}, true);

        if (this.RestClient.respHasError(mResp, mURL)){
            // not up yet
            // set back to what they were using
            localStorage.setItem('curServer', JSON.stringify(oCurServer));
        }

        return;

    }, //switchToPrefWS


    // *********************************************************************************
    // Returns: Mileage between 2 geo points (as the crow flies) or -1 if it fails
    Vue.prototype.Sublib.calcDistByGeoCodes = function(lat1, long1, lat2, long2, mMethod, mRetIn) {
            //mMethod = numeric, optional, the method to use to calc the distance. If not passed, defaults to 3
            // mRetIn = Char. either 'M' or 'K' (can also be MI or KM)

            if (!lat1 || !long1 || !lat2 || !long2) {
                return -1;
            }

            if (lat1 == lat2 && long1 == long2) {
                return 0;
            }

            if (!mRetIn){
                mRetIn = 'M'; // default to miles
            }


            lat1 = Number(lat1);
            long1 = Number(long1);
            lat2 = Number(lat2);
            long2 = Number(long2);

            mMethod = (mMethod) ? mMethod : 3;

            //The following are 3 methods to calc the miles. Method 3 is supposed to be the most
            //accurate.
            var mDist;
            if (mMethod == 1) {
                mDist = 69.1 * Math.sqrt(Math.pow(lat2 - lat1, 2) + .6 * Math.pow(long2 - long1, 2));

            } else if (mMethod == 2) {
                var mDistLat = 69.1 * (lat2 - lat2);
                var mDistLong = 69.1 * (long2 - long1) * Math.cos(lat1 / 57.3); // 57.3 is the degrees to radians conversion (I think)
                mDist = Math.pow((Math.pow(mDist, 2) + Math.pow(mDistLong, 2)), .5);

            } else if (mMethod == 3) {    
                var mA1 = Math.sin(lat1 / 57.3) * Math.sin(lat2 / 57.3);
                var mA2 = Math.cos(lat1 / 57.3) * Math.cos(lat2 / 57.3) * Math.cos((long2 / 57.3) - (long1 / 57.3));
                var mA = mA1 + mA2;
                // mDist = 3958.75 * ATAN((1 - mA^2)^.5 / mA)
                mDist = 3958.75 * Math.atan(Math.pow(1 - Math.pow(mA, 2), .5) / mA); // 3958.75 is radius of the earth (in miles)

            } else {
                return -1
            }

            if (this.inList(mRetIn, ['K', 'KM'], true)){
                // convert to kilometers
                mDist = mDist * 1.60934  // 1.60934 km per mile
            }

            return Math.abs(Number(mDist.toFixed(1)));
    }, // calcDistByGeoCodes


    // *********************************************************************************
    // this allows me to 'wait' before continuing
    Vue.prototype.Sublib.sleep = async function(mMiliSec) {
        if (!mMiliSec){
            mMiliSec = 1000; // 1 second
        }

        await new Promise((resolve, reject) => {
            setTimeout(() => { resolve() }, mMiliSec);
        }); // promise
    }, // sleep



    // *********************************************************************************
    // Bulk add an array to some IDB object store. This is mostly used for debugging so if someone sends us object store data we can read it in. SRR 07/14/2023
    Vue.prototype.Sublib.bulkAddIDBRecs = async function(objectStore, aRecs){
        // objectStore = char. object store to add recs to
        // aRecs = array. Array of object store data

        for (var mx = 0; mx < aRecs.length; mx++){
            await this.IDB.req(objectStore, 'put', aRecs[mx].key, aRecs[mx].value);
        } // for

    }, // bulkAddIDBRecs


    // *********************************************************************************
    // This will go through all object stores in the indexedDB and wipe out all recs that are older than some time frame (24 hours). SRR 08.19.2019
    Vue.prototype.Sublib.clearIDB = async function() {

        // set the max time here only!!
        var mMaxHr, mMaxMiliSec;

        // convert to miliseconds
        


        if (this.offline()){
            // don't wipe out our cached if we don't have service.
            return;
        }        
        var oCPDB = this.IDB.aDBList.find((obj) => {
            return obj.db.toUpperCase() == 'CENPOINT';
        });

        var mNow = await this.getDate(true);
 
        // Cycle through all object stores for CenPoint
        var aCursor, oHold, mDataDt;
        for (var mx = 0; mx < oCPDB.aTables.length; mx++){
            if (oCPDB.aTables[mx].toUpperCase() == 'pendingWSSave'.toUpperCase()){
                // DO NOT delete the pending save!!!
                //continue; 
                // clear out 'old' recs in pendingWSSave 
                // if they haven't saved by now, probably aren't going to and don't want them to as we don't want data randomly changing weeks later. SRR 07/14/2023
                mMaxHr = 24*7; // 1 week    
            } else {
                mMaxHr = 24;
            }

            mMaxMiliSec = mMaxHr * 60 * 60 * 1000; // miliseconds

            aCursor = await this.IDB.req(oCPDB.aTables[mx], 'CURSOR');

            for (var my = 0; my < aCursor.length; my++){
                // Got some corrupt data in the IDB on a few phones (i.e. HTML from web connect after a server went down) 
                // and it kept erroring out parsing the 'JSON'
                // Just delete it out if it's no good anyways. SRR 03/18/2023
                if (oCPDB.aTables[mx].toUpperCase() == 'pendingWSSave'.toUpperCase()) {
                    // slightly different structure
                    // value: {url: '', query: {}, body: {} (or null), datadt: "2023-07-14T12:05:00.000Z"}
                    try {
                        oHold = JSON.parse(aCursor[my].value);
                    } catch (oError){
                        // delete it out (don't think I need to wait for it)
                        this.IDB.req(oCPDB.aTables[mx], 'delete', aCursor[my].key);
                        continue;
                    }

                    if (oHold.datadt){
                        mDataDt = this.newDate(oHold.datadt.replace('Z', '')); // 2023-03-02T22:32:42.000Z => 2023-03-02T22:32:42.000
                    } else {
                        mDataDt = this.newDate('01/01/1900');
                    }

                } else {
                    // all other object stores
                    try {
                        oHold =this.wsResp2Obj(aCursor[my].value);
                    } catch (oError){
                        // delete it out (don't think I need to wait for it)
                        this.IDB.req(oCPDB.aTables[mx], 'delete', aCursor[my].key);
                        continue;
                    }
                

                    if (oHold.errorMsg && !this.contains(oHold.errorMsg, 'No additional workers entered for Field Ticket', true)){
                        mDataDt = this.newDate('01/01/1900');
                    } else if ((!oHold[0] || !oHold[0].datadt) && !oHold.datadt){
                        mDataDt = this.newDate('01/01/1900');
                    } else if (oHold[0]){
                        mDataDt = this.newDate(oHold[0].datadt);
                    } else {
                        mDataDt = this.newDate(oHold.datadt);
                    }
                }

                if (mNow.getTime() - mDataDt.getTime() < mMaxMiliSec){
                    // hasn't been long enough
                    continue;
                }

                // delete it out (don't think I need to wait for it)
                this.IDB.req(oCPDB.aTables[mx], 'delete', aCursor[my].key);
        
            } // for (my)
        } // for (mx)
    }, // clearIDB


    // *********************************************************************************
    // This will get predifined notes, present a list to the user, and return the text of the note they chose or '' if they didn't choose anything
    //
    // NOTE: By default, this tries to use a cached copy (refreshed every 24 hours) as some notes can get quite long
    // 
    // Returns: Char.
    Vue.prototype.Sublib.getPredefinedNotes = async function(mNoteType, mForceFreshCopy, mShowQuickList, oTxtRef) {
        // mNoteType = Char. Either 'QUOT', 'WORD', or 'INVC', or 'ATP_'
        // mForceFresh = Logical, if true, will query the server (if online) for a fresh copy of the notes
        // oTxtRef = Object. Optional. If passed, this is a this.$refs.txtQtNotes type of thing so we can get the current position of the cursor so we know where to insert notes into
        //          NOTE: ALSO updates the v-model tied to this!

        if (!mNoteType){
            return '';
        }

        let mCursor, oTxtArea;
        if (oTxtRef && oTxtRef.$el){
            oTxtArea = oTxtRef.$el.querySelectorAll('textarea');
            if (oTxtArea){
                oTxtArea = oTxtArea[0];
            } else {
                // see if it's just a regular input
                oTxtArea = oTxtRef.$el.querySelectorAll('input');
                if (oTxtArea){
                    oTxtArea = oTxtArea[0];
                }
            }

            if (oTxtArea)
                mCursor = oTxtRef.$el.querySelectorAll('textarea')[0].selectionStart;
        }

        if (oTxtRef && typeof mCursor != 'number'){
            mCursor = (oTxtRef.value.length ? oTxtRef.value.length -1 : 0);
        }

        var oParams = {
            noteType: mNoteType,
            showQuickLst: mShowQuickList,
            forceFreshCopy: mForceFreshCopy,
        }


        let newNote =  await this.showSimplePopUp(this.Vue.extend(PREDEFINEDNOTES), oParams)

        if (!oTxtArea){
            return newNote;
        }

        if (newNote == '!CANCEL!'){
            return newNote;
        }

        // See if I can update an existing note / value
        var mPreText = (oTxtRef.value) ? oTxtRef.value.substring(0, mCursor) : '';
        var mPostText = (oTxtRef.value) ? oTxtRef.value.substring(mCursor) : '';
        var mNewLine = (mCursor == 0) ? '' : "\n"; // only insert 'new line' if this is NOT the first note

        
        //oTxtRef.value = mPreText + mNewLine + newNote + mPostText; // NOTE: This updates the v-model tied to this reference!
        oTxtArea.value = mPreText + mNewLine + newNote + mPostText; 
        oTxtArea.dispatchEvent(new Event('input')); // this is how Vue knows to update the v-model tied to this reference!
        await this.sleep(.5*1000); // give it time to deal with the event so the value is actually updated after this method returns;
        //this.Vue.set(oTxtRef, 'value', mPreText + mNewLine + newNote + mPostText);
        if (oTxtArea.focus){
            oTxtArea.focus();
        }

        oTxtArea.selectionStart = oTxtArea.value.length + 1; // set cursor to the end of the text I just added
        

        return newNote;


    }, // getPredefinedNotes


    // *********************************************************************************
    // This will return a blank template (i.e. vfp data but fields are empty) for desired rest calls (i.e. ftickDtl, task, etc)
    Vue.prototype.Sublib.getOfflineTemplate = async function(mTemplate, mForceFreshCopy) {
        // mTemplate = Char. Template to get
        // mForceFreshCopy = Logical. Forces us to go out and get a fresh copy of the template and update our cache. If true, we are in recursive code.

        /* Few steps:
        * Check to see if we already have it cached
        * if cache is less than 24 hours, return it
        * else nuke the cache and get a fresh copy (make sure we pick up new fields / changes) (if online)
        *      return new cache
        */

        if (!this.getConnectInfo('token')){
            return;
        }

        if (!mTemplate) {
            return JSON.stringify({ 'errorDesc': 'No Template Passed' });
        }

        mTemplate = mTemplate.toLowerCase();

        // set the basics for the URL
        var mURL =this.getWSUrl();

        var oParams = {
            "noAdd":'true'
        }

        // REMEMBER: Caps on the key (mKey) matters!
        if (mTemplate == 'ftickdtl') {
            mURL += 'cpFTick/getFTickDtl2';
            oParams.jobschedid = 'TEMPLATE';

        } else if (mTemplate == 'fttask') {
            mURL += 'cpFTick/getFTickTasks'
            oParams.ftickid = 'TEMPLATE';
            
        } else if (mTemplate == 'ftterms') {
            mURL += 'cpFTick/getFTTerms';
            oParams.branchesid = 'TEMPLATE'
            
        } else if (mTemplate == 'jsa') {
            mURL += 'cpJSA/getJSAQuestions';
            oParams.ftickid = 'TEMPLATE'

            
        } else if (mTemplate == 'atp') {
            mURL += 'cpftick/getATP';
            oParams.ftickid = 'TEMPLATE'

        } else if (mTemplate == 'photosview') {
            mURL += 'cpdocs/GetAllPics';
            oParams.type = 'TEMPLATE';
            oParams.typeid = 'TEMPLATE';

        } else if (mTemplate == 'jobinfo') {
            mURL += 'cpjobs/getjobinfo';
            oParams.jobsid = 'TEMPLATE';

        } else if (mTemplate == 'vehicles') {
            mURL += 'cppretrip/getvehicles';
            oParams.branchesid = 'TEMPLATE';
            oParams.vehicles = '';

        } else if (mTemplate == 'equipments') {
            mURL += 'cpequip/getequiplist';
            oParams.branchesid = 'TEMPLATE';
            oParams.equipments = '';

        } else if (mTemplate == 'branches'){
            mURL += 'cpGetUsers/getBranches';

        } else if (mTemplate == 'tasklist') {
            mURL += 'cpftick/gettasklist';
            oParams.source = 'ALL';
            oParams.tasktype = 'TEMPLATE';
            oParams.ftickid = 'TEMPLATE'

        } else if (mTemplate == 'inspdeflist') {
            mURL += 'cpinsp/getinspdeflist';
            oParams.branchesid = '';
            oParams.inspType = 'ALL';
            oParams.includeSchedBranches = true;

        } else if (mTemplate == 'prevaddedadtlworkers') {
            // this is the template for workers ON the field tickets
            mURL += 'cpftick/getworkers';
            oParams.ftickid = 'TEMPLATE';

        } else if (mTemplate == 'adltuserslist') {
            // this is the list of workers that COULD BE on the field ticket
            mURL += 'cpftick/getWOAdtlUsersList_2';
            oParams.ftickid = 'TEMPLATE';
            oParams.source = 'GETALL';

        } else if (mTemplate == 'adtlworkerdtl') {
            //mURL += 'cpftick/getftadtlwrkrdetail';
            mURL += 'cpFtick/getFTWorkerDtl2';
            oParams.ftworkerid = 'TEMPLATE';

        } else if (mTemplate == 'pretrip') {
            mURL += 'cpPretrip/getListItems';
            oParams.branchesid = 'TEMPLATE';
        
        } else if (mTemplate == 'dpartlst'){
            mURL += 'cpFTick/getDepartList';
        
        } else if (mTemplate == 'nosigreasons'){
            mURL += 'sublib/getPickList';
            oParams.phId = 'NOCUSTSIG';
            oParams.noUnknown = true;

        } else if (mTemplate == 'doccategories'){
            mURL += 'cpDocs/getAllDocTypes';
            oParams.mainType = '!ALL!';
        } else {
            return JSON.stringify({ 'errorDesc': 'Invalid template passed' });
        }


        var oData;

        // First, see if we already have it cached.
        if (!mForceFreshCopy) {
            //this.clearIDB() takes care of checking every 24 hours. So if I have it, assume it's valid
            var mHold = await this.IDB.req('offlineTemplates', 'get', mTemplate);
            
            // make sure it's not an error
            oData =this.wsResp2Obj(mHold);
            if (!oData.errorMsg){
                return mHold;
            }
        }

        // looks like we need to make a call to get it.
        var resp = await this.RestClient.getNoCache(mURL, oParams);

        oData =this.wsResp2Obj(resp);
        if (oData.errorMsg) {
            // error
            return JSON.stringify({ 'errorDesc': 'Template ' + mTemplate + ' not found! \n' + oData.errorMsg});    
        }

        await this.IDB.req('offlineTemplates', 'put', mTemplate, resp);

        return resp;

    }, // getOfflineTemplates



    // *********************************************************************************
    // This will make sure we have all of the offline templates we need.
    Vue.prototype.Sublib.getAllOfflineTemplates = async function() {
        
        if (!this.getConnectInfo('token')){
            return;
        }


        await Promise.all([
           this.getOfflineTemplate('ftickdtl'),
           this.getOfflineTemplate('ftterms'),
           this.getOfflineTemplate('fttask'),
           this.getOfflineTemplate('jsa'),
           this.getOfflineTemplate('photosview'),
           this.getOfflineTemplate('jobinfo'),
           this.getOfflineTemplate('vehicles'), // vehicle list, used on FT's, not really designed for pretrip but maybe could be... SRR 11.15.2018. Yup, works for pretrip. SRR 08.28.2019
           this.getOfflineTemplate('equipments'), // equipment list, used on inspection MA 10.0.2022
           this.getOfflineTemplate('branches'),
           this.getOfflineTemplate('tasklist'), // can be a pretty big list
           this.getOfflineTemplate('prevAddedAdtlWorkers'),
           this.getOfflineTemplate('adltuserslist'),
           this.getOfflineTemplate('adtlworkerdtl'),
           this.getOfflineTemplate('atp'), // NOTE: For now, we are not pulling down the ATP Predefined notes for the sake of bandwidth / storage. Should be okay as we are grabbing task default ATP.  SRR 05.03.2019
           this.getOfflineTemplate('pretrip'),
           this.getOfflineTemplate('dpartlst'), // SRR 11/25/2019
           this.getOfflineTemplate('nosigreasons'), // SRR 07/20/2020
           this.getOfflineTemplate('doccategories'), // MA 01/23/2023
           //this.getOfflineTemplate('pricingdec'), // SRR 10/14/2020 moved to a different method as I want it to be synchronous
        ]);

        this.getPricingDec(); // makes it's own rest call (if needed)
        this.getVersionType(); // make sure it's right, makes rest call (if needed)


        // Enhanced to pull down the ATP predefined notes.
        // NOTE: Can't usethis.getPredefinedNotes() as it shows a dailog for the user to pick from... SRR 09.04.2019
        var mNotes = await this.IDB.req('dfltnote', 'get', 'ATP_');
        var mGetFresh = false;
        if (!mNotes){
            mGetFresh = true;
        } else {
            var oNotes =this.wsResp2Obj(mNotes);
            if (oNotes.errorMsg){
                mGetFresh = true;
            } else {
                var mNowMiliSec = this.newDate(await this.getDate(true)).getTime();
                var mCachedAtMiliSec =this.newDate(oNotes[0].datadt).getTime();
                if (Math.abs(mNowMiliSec - mCachedAtMiliSec) >= 24 * 60 * 60 *1000){
                    mGetFresh = true;
                }
            }
        }

        var mURL, oParams;

        if (mGetFresh){
            mURL =this.getWSUrl() + 'cpQuote/getPredefinedNotes'; 
            oParams = {
                noteType: 'ATP_'
            }

            var mNoteHold = await this.RestClient.getNoCache(mURL, oParams, 'getNotes~type=' + oParams.notetype);

            this.IDB.req('dfltnote', 'put', 'ATP_', mNoteHold);
        }

        await this.getTaskList(); // make sure we have the task list
        await this.getInspList(); // make sure we have the inspection list

        return

    }, //getAllOfflineTemplates

    // *********************************************************************************************
    Vue.prototype.Sublib.getTaskList = async function () {

        var mTaskListSaved = await this.getOfflineTemplate('tasklist');
        var mURL, oParams, oBodayParams;

        // now that I have the tasklist, get the q/a
        if (mTaskListSaved){
            var mNowMiliSec = this.newDate(await this.getDate(true)).getTime();
            if (!this.wsResp2Obj(mTaskListSaved).errorMsg){
                var mCachedAtMiliSec =this.newDate(this.wsResp2Obj(mTaskListSaved)[0].datadt).getTime();
            } else {
                mCachedAtMiliSec = this.newDate('01/01/1900');
            }

            if (Math.abs(mNowMiliSec - mCachedAtMiliSec) < 24 * 60 * 60 *1000 
                && Math.abs(mNowMiliSec - mCachedAtMiliSec) > 2 * 60 * 1000) {
                // less than 24 hours old (and cached for at least 2 minutes), nothing to do
                // if cached less than 2 minutes, it's a new task List copy and I need to get the details below
                return;
            }

        } else {
            // shouldn't happen but account for it just in case
            mTaskListSaved = await this.getOfflineTemplate('tasklist');
        }

        // get the task details. 
        var aTasksAll =this.wsResp2Obj(mTaskListSaved);
        if (aTasksAll.errorMsg){
            return;
        }
        var aTasks, mTaskList = '';
        for (var mx = 0; mx < aTasksAll.length; mx++) {
            aTasks = aTasksAll[mx];

            if (this.contains(mTaskList, aTasks.tasksid)){
                continue;
            }

            mTaskList += (mTaskList ? ',' : '') + aTasks.tasksid;
        } // for (mx)
         

        mURL =this.getWSUrl() + 'cpFTick/getTaskQuestions_multi'; 
        // Cobra had 200+ tasks and the URL string was too big, switching to a body param. SRR 10/03/2022
        // oParams = {
        //     taskList: mTaskList
        // }
        oParams = {
            instancing: 'single' // tell web connect to start a new com instance to process this instead of the regular server pool (ignored in filebased)
        };
        oBodayParams = {
            taskList: mTaskList
        }

        //var resp = await this.RestClient.getNoCache(mURL, oParams);
        var resp = await this.RestClient.postNoCache(mURL, oParams, oBodayParams);

        // Make sure we didn't get an error
        var oData =this.wsResp2Obj(resp);
        if (oData.errorMsg) {
           this.mbox(oData.errorMsg);
            return;
        }

        // Now parse like crazy and store it like want (1 rec in IDB per task)
        var mHold, mStart, mKey, mTasksId, mNow;
        mNow = this.serializeDt(await this.getDate(true));

        for (mx = 1; mx <=this.occurs(resp, '|T|'); mx++) {

            if (mx == 1) {
                mStart = 0;
            } else {
                mStart =this.getIndex(resp, '|T', mx - 1) + '|T|'.length; // looks like: '|T|{"VFPData":....'. Strip off the '|T|'
            }

            mHold = resp.substring(mStart,this.getIndex(resp, '|T', mx));
            // make sure it has my 'datadt' property so it doesn't get deleted on the next app load
            mHold = mHold.replace('}', ', "datadt":"' + mNow + '"}');


            mTasksId =this.wsResp2Obj(mHold)[0].tasksid;
            mKey = 'task-' + mTasksId;

            await this.IDB.req('offlineTemplates', 'put', mKey, mHold);
        } // for
    }, //getTaskList


    // *********************************************************************************************
    Vue.prototype.Sublib.getInspList = async function () {

        var inspDefListSaved = await this.getOfflineTemplate('inspdeflist');

        var mURL, oParams;

        // now that I have the inspdeflist, get the q/a
        if (inspDefListSaved){
            var mNowMiliSec = this.newDate(await this.getDate(true)).getTime();
            if (!this.wsResp2Obj(inspDefListSaved).errorMsg){
                var mCachedAtMiliSec =this.newDate(this.wsResp2Obj(inspDefListSaved)[0].datadt).getTime();
            } else {
                mCachedAtMiliSec = this.newDate('01/01/1900');
            }


            if (Math.abs(mNowMiliSec - mCachedAtMiliSec) < 24 * 60 * 60 *1000 
                && Math.abs(mNowMiliSec - mCachedAtMiliSec) > 2 * 60 * 1000) {
                // less than 24 hours old (and cached for at least 2 minutes), nothing to do
                // if cached less than 2 minutes, it's a new task List copy and I need to get the details below
                return;
            }

        } else {
            // shouldn't happen but account for it just in case
            inspDefListSaved = await this.getOfflineTemplate('inspdeflist');
        }


        // get the inspDef details. 
        var inspDefAll =this.wsResp2Obj(inspDefListSaved);
        if (inspDefAll.errorMsg){
            return;
        }
        var aInspDefs, mInspDefList = '';
        for (var mx = 0; mx < inspDefAll.length; mx++) {
            aInspDefs = inspDefAll[mx];

            if (this.contains(mInspDefList, aInspDefs.inspdefid)){
                continue;
            }

            mInspDefList += (mInspDefList ? ',' : '') + aInspDefs.inspdefid;
        } // for (mx)


        mURL =this.getWSUrl() + 'cpInsp/getInspQuest_multi';
        oParams = {
            inspDefList: mInspDefList
        }

        var resp = await this.RestClient.getNoCache(mURL, oParams);

        // Make sure we didn't get an error
        var oData =this.wsResp2Obj(resp);
        if (oData.errorMsg) {
        this.mbox(oData.errorMsg);
            return;
        }

        // Now parse like crazy and store it like want (1 rec in IDB per task)
        var mHold, mStart, mKey, mInspDefId, mNow;
        mNow = this.serializeDt(await this.getDate(true));

        for (mx = 1; mx <=this.occurs(resp, '|T|'); mx++) {

            if (mx == 1) {
                mStart = 0;
            } else {
                mStart =this.getIndex(resp, '|T', mx - 1) + '|T|'.length; // looks like: '|T|{"VFPData":....'. Strip off the '|T|'
            }

            mHold = resp.substring(mStart,this.getIndex(resp, '|T', mx));
            
            // make sure it has my 'datadt' property so it doesn't get deleted on the next app load
            mHold = mHold.replace('}', ', "datadt":"' + mNow + '"}');

            var oResp = this.wsResp2Obj(mHold);

            if(oResp.errorMsg){
                continue;
            }

            mInspDefId =oResp[0].inspdefid;
            var mKey = 'inspdef-' + mInspDefId;

            await this.IDB.req('offlineTemplates', 'put', mKey, mHold);
        } // for
        
        
        return;

    }, //getInspList


    // *********************************************************************************
    // This will cycle through all recs in the pending save object store and try to upload them.
    // If the upload / save is successful, nukes the rec. If it fails, saves it so we can try again in the future.
    //
    // returns: '' if all went well, otherwise error message for uploads that failed
    Vue.prototype.Sublib.saveWSPendingSave = async function(mShowMsg) {
        // mShowMsg = Logical, if true displays a toast with what rec we are on, etc (default is silent mode)

    //     let aStackInfo = (new Error().stack || '').split('\n').map((line) => { return line.trim() } );
    //     let stackInfo;
    //     try {
    //         a = bb + ccc
    //     } catch(error){
    //         stackInfo = error.stack || '';
    //     }

    //     // let aStackInfo2 = await StackTrace.get()
    //     // let aStackInfo3 = await StackTrace.generateArtificially();
    //     let aStackInfo2 = '';
    //     sourceStackTrace.mapStackTrace(stackInfo, function(mappedStack){
    //         console.log(mappedStack);
    //         debugger
    //     });
    // debugger

        if (this.offline()){
            // can't upload if we're offline duh.
            return '';
        }

        var aData2Save = await this.IDB.req('pendingWSSave', 'CURSOR');


        // NOTE: make sure they're in the correct order (i.e. ftick has to be created before pics can be uploaded)
        aData2Save.sort((a, b) => { return this.newDate(JSON.parse(a.value).datadt) - this.newDate(JSON.parse(b.value).datadt) })
        
        var mMsgHold =this.getLbl('saving x of x msg'); // 'Saving <CUR> of <TOT>'
        var mMsg, resp, oData, o2Save, oRestCall, mError, mRetVal = '';

        for (var mx = 0; mx < aData2Save.length; mx++){
            if (mShowMsg){
                mMsg = mMsgHold;
                mMsg = mMsg.replace('<CUR>', String(mx + 1));
                mMsg = mMsg.replace('<TOT>', aData2Save.length);
               this.toast(mMsg, 3);
            }

            o2Save = aData2Save[mx];
            oRestCall = JSON.parse(o2Save.value);

            if (!oRestCall.url){
                // Not sure how but we were trying to make a bunch of restcalls where the URL was empty. Just nuke it
                // Don't delete real data!
                if (oRestCall.query && oRestCall.query.proc && oRestCall.query.prg){
                    oRestCall.url = this.getWSUrl() + oRestCall.query.prg + '/' + oRestCall.query.proc;  //'cpPayments/getStripePaymentMethod';

                } else {
                    await this.IDB.req('pendingWSSave', 'delete', o2Save.key);
                    continue;
                }
            }

            if (this.isTestingIP(true)){
                if ((oRestCall.query && oRestCall.query.prg && oRestCall.query.prg.toUpperCase() == 'CPERROR' && oRestCall.query && oRestCall.query.proc == 'LOGERROR')
                    || (oRestCall.url && this.contains(oRestCall.url, 'cpError/logError', true))){
                    // got sick of these taking forever to save after I had the webservice turned off writing code. SRR 03/30/2023
                    await this.IDB.req('pendingWSSave', 'delete', o2Save.key);
                    continue;
                }

            }
            

            if (oRestCall.body){
                resp = await this.RestClient.postNoCache(oRestCall.url, oRestCall.query, oRestCall.body);
            } else {
                resp = await this.RestClient.getNoCache(oRestCall.url, oRestCall.query);
            }

            oData = this.wsResp2Obj(resp);
            if (!oData.errorMsg){
                // save worked, go to the next rec
                mError = false;

            } else if (oData.wsData == 'OK'){
                // return val may literally be 'OK' and not a regular JSON string. (Nothing to)
                mError = false;

            } else if (this.contains(oData.errorMsg, 'status already set for this wo', true)){
                // field ticket saved first, nothing to do
                mError = false;

            } else if (this.contains(oRestCall.url, 'saveBreadCrumb', true) && this.contains(oData.errorMsg, 'clocked out', true)){
                // Trying to save a bread crumb but they are clocked out, don't try to send it up again.. SRR 07/23/2020
                mError = false;
            } else {
                // error!
                mError = true;
            }

            if (mError){
                mRetVal += (mRetVal ? '\n\n' : '') + oData.errorMsg;
                continue;
            }

            // delete out the pending save rec as it is now saved
            await this.IDB.req('pendingWSSave', 'delete', o2Save.key);

        } // for

        return mRetVal;

    }, //saveWSPendingSave


    // *********************************************************************************
    // Putting this here as Sublib doesn't go out of scope if they change the screen they're looking at. SRR 08.27.2019
    Vue.prototype.Sublib.cacheWO = async function(mJobschedId) {

        var oParams = {
            jobschedId_passed: mJobschedId,
            autoMode: true,
        }

        //return await this.showSimplePopUp(this.Vue.extend(WODTL), oParams) // can't do this as it flashes the WO, can't do the style.display = 'none'

        return new Promise(async (resolve, reject) => {
            // I'm combining a bunch of stuff to make this work.
            // First, create the vue component
            var mboxInstance = this.Vue.extend(WODTL); // mbox component, imported at top of Sublib
            var oComponent = new mboxInstance({ 
                propsData: { 
                    jobschedId_passed: mJobschedId,
                    autoMode: true,
                    retval: '',
                }
            }).$mount();

            // now add it to the DOM
            var oEl = document.getElementById('app').appendChild(oComponent.$el);
            oEl.style.display = 'none';
            
            // Add a listener so we can get the value and return it
            oComponent.$watch('retval', function(newVal, oldVal){
                // this is triggered when they chose an option
                // Delete the component / element now that I'm done
                oEl.remove();
                resolve(newVal);
            })
        }); // promise
    }, // cacheWO


    // *********************************************************************************
    // Putting this here as Sublib doesn't go out of scope if they change the screen they're looking at. SRR 08.27.2019
    Vue.prototype.Sublib.cacheErrand = async function(mErrandId) {

        var oParams = {
            errandId_passed: mErrandId,
            autoMode: true,
        }

        return await this.showSimplePopUp(this.Vue.extend(ERRANDDTL), oParams)

        return new Promise(async (resolve, reject) => {
            // I'm combining a bunch of stuff to make this work.
            // First, create the vue component
            var mboxInstance = this.Vue.extend(ERRANDDTL); // mbox component, imported at top of Sublib
            var oComponent = new mboxInstance({ 
                propsData: { 
                    errandId_passed: mErrandId,
                    autoMode: true,
                    retval: '',
                }
            }).$mount();

            // now add it to the DOM
            var oEl = document.getElementById('app').appendChild(oComponent.$el);
            oEl.style.display = 'none';
            
            // Add a listener so we can get the value and return it
            oComponent.$watch('retval', function(newVal, oldVal){
                // this is triggered when they chose an option
                // Delete the component / element now that I'm done
                oEl.remove();
                resolve(newVal);
            })
        }); // promise
    }, // cacheWO

    // *********************************************************************************
    // returns: String (either 'dark', 'light', or 'unknown')
    // NOTE: app.vue listens for changes to the media query (user changed device theme)
    Vue.prototype.Sublib.getSystemTheme = function() {
        var mRetVal = '';

        var mSystemLight = window.matchMedia('(prefers-color-scheme: light)').matches;
        var mSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (mSystemLight){
            mRetVal = 'light';
        } else if (mSystemDark){
            mRetVal = 'dark';
        } else {
            // not all browsers support the media queries, not sure what the system value is
            // see https://caniuse.com/#search=prefers-color-scheme
            if (this.isAndroid() &&this.usingWebview() && android.getSystemTheme){
                mRetVal = android.getSystemTheme();
            } else {
                mRetVal = 'unknown';
            }
        }

        return mRetVal;
    }, // getSystemTheme



    // *********************************************************************************
    // Returns: String
    //
    // see https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript for where I got this. SRR 09.04.2019
    // Guid length: 36
    Vue.prototype.Sublib.makeGUID = function() {
        if (crypto){
            // prefered method (more random number generations compared to Math.random() (see stack overflow post))
            return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            )
        } else {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
        
        
    }, //makeGUID
    

    // // *********************************************************************************
    // // Starting in Vuetify 2+, components added manaully get tell if they are in dark mode. This is a work around. SRR 09.06.2019
    // Vue.prototype.Sublib.isAppDarkMode = function() {
    //     return document.getElementById('app').classList.contains('theme--dark');
    // }


    // *********************************************************************************
    Vue.prototype.Sublib.getUserName = function (){
        return (localStorage.getItem('userFName') ? localStorage.getItem('userFName').trim() : '') + ' ' + (localStorage.getItem('userLName') ? localStorage.getItem('userLName').trim() : '');
    }, // getUserName



    // *********************************************************************************
    // In JS / HTML theres no real way to set a max length on a number input
    // This fixes that
    // NOTE: if mNumber = 123.45 and mTotalLen = 4 and mDecLen = 1, will return 23.4
    // if to get back 123.45 from 123.45, mTotalLen = 6 and mDecLen = 2 (6, 2)
    // Returns: Numeric
    Vue.prototype.Sublib.fixNumberInput = function(mNumber, mTotalLen, mDecLen, mAllowNeg){
        // mNumber = Char / Numeric. Number to Fix
        // mTotalLen = Numeric. Total len (including a spot for the dec AND the dec len)
        // mDecLen = Numeric. Dec Len
        // mAllowNeg = Logical. Allow negative numbers

        // NOTE: mTotalLen & mDecLen can be thought of as N(4, 1) in FOX (NOT sql)
        if (!mNumber){
            return 0;
        }

        if (typeof mNumber != 'string'){
            mNumber = String(mNumber);
        }

        if (!mDecLen){
            mNumber = this.replaceAll(mNumber, '\\.', '');
        }

        mNumber = mNumber.replace(/[^\d.-]/g, ''); // keeps the '.' and the '-'
        mNumber = this.trimZeros(mNumber);

        var oDtl = this.getNumberParts(mNumber);

        
        var mB4DecMaxLen;
        if (mDecLen) {
            mB4DecMaxLen = mTotalLen - 1 - mDecLen;
        } else {
            mB4DecMaxLen = mTotalLen;
        }

        var mRetVal = '';
        if (oDtl.lenB4Dec > mB4DecMaxLen && mB4DecMaxLen > 0){
            //mNumber = mNumber.slice(0, mB4DecMaxLen);
            // Reverse the Stiing and then do my substr and then reverse back
            mRetVal = String(oDtl.numB4Dec).split('').reverse().join('').slice(0, mB4DecMaxLen).split('').reverse().join('');
        } else if (mB4DecMaxLen <= 0) {
            // can't do a number before the dec
            mRetVal = '';
        } else {
            mRetVal = String(oDtl.numB4Dec);
        }

        if (mDecLen && oDtl.decLen > mDecLen){
            mRetVal += '.' + String(oDtl.decNum).slice(0, mDecLen);

        } else if (mDecLen && oDtl.hasDec){
            mRetVal += '.' + String(oDtl.decNum);
        }

        mRetVal = Number(mRetVal);

        if (!mAllowNeg && mRetVal < 0){
            mRetVal = mRetVal *-1;
        }

        return mRetVal;
    }, // fixNumberInput



    Vue.prototype.Sublib.goodPhotoSaveObj = function(){
        return {
                //base64: event.target.result.substr(event.target.result.indexOf('base64,') + 7),
                base64: '',
                descModifier: '',
                descript: '',
                picDate: '', // formated with DTOC
                picTime: '', // miltime
                picType: '', // JPEG, PNG, etc
                imgFilesId: '', // imgFilesId to update or save copy of
                imgFilesSaveType: '', // 'SAVE' or 'SAVECOPY', only used if imgFilesId is set
                category: '', // '', 'FT', 'QST'"
                picId: '', // picId to update or save copy of

            }
    }, // goodPhotoSaveObj


    // *********************************************************************************
    Vue.prototype.Sublib.savePhoto = async function(mType, mTypeId, oPhoto, mEdited, mSubIdType='', mSubId='', mURLEndPoint, oExtraParams, mSilentMode){
        // mType = Char. Either 'FTICK', 'JOB', or 'QUOTE', or 'BLDR'
        // mTypeId = Char. ftickid, jobsid, etc
        // oPhoto = Object. Photo to save (only does 1 at a time)
        // mEdited = Logical. If true picture is edited, calls a different web service for logging purposes (params are all the same)
        // mSubIdType = Char. Optional. If set, will save the photo to the subidtype table (ex: 'FTASK', 'QST')
        // mSubId = Char. Optional. If set, will save the photo to the subidtype table (ex: 'FTASK', 'QST')
        // mURL = Char. Optional. If set, will use this URL instead of the default
        // oExtraParams = Object. Optional. If set, will add these params to the web service call
        // fromParsePhoto = Logical. Optional. If true, will not show the progress bar (used when they upload from camera and want to edit)
        var mURL

        if(!mURLEndPoint){
            if (mEdited){
                mURL = this.getWSUrl() + 'cpDocs/saveCPPicEdited';
            } else {
                mURL = this.getWSUrl() + 'cpDocs/saveCPPic'; 
            }

        }else{
            mURL = this.getWSUrl() + mURLEndPoint;
        }
        
        if(!mSilentMode){
            // Show a little entertainment incase it takes a second. This gets called directly if they upload from camera and want to edit, not through parsePhotos. SRR 05/16/2023
            var picUploadMsg = this.getLbl('file upload progress');
                    
            picUploadMsg = picUploadMsg.replace('<CNT>', '1'); // 1-1, etc);
            picUploadMsg = picUploadMsg.replace('<TOT>', '1');
            this.showMsg(picUploadMsg, false, true);
        }
        
        var oParams = {
            type: mType.toUpperCase(),
            typeid: mTypeId,
            subid: mSubId,
            subidtype: mSubIdType,
        }

        var oBodyParams = {
            image: '[' + JSON.stringify(oPhoto) + ']',
        }
        if (oExtraParams){
            oBodyParams.oExtraParams = JSON.stringify(oExtraParams);
        }
        
        //if empty, then assign new value
        if (!oPhoto.picId){
            oPhoto.picId = '!ADD!' + String(Math.random() * 100);
        }
        
        //we are not using imgFilesId to make it unique, but we are using it to update the image

        var oPhotoSaveKey = 'savePhoto~type=' + mType + '~typeId=' + mTypeId + '~picType=Pic~picId=' + oPhoto.picId;
        var resp = await this.RestClient.post(mURL, oParams, oBodyParams, oPhotoSaveKey, true);

        var oData = this.wsResp2Obj(resp);
        if (oData.errorMsg){
            this.mbox(oData.errorMsg);
            return false;
        }
        
        if(!mSilentMode){
            this.showMsg();
        }

        return true;

    } // savePhoto


    //**************************************************************************************************************
    // NOTE: This is called via something like $('#ftick-photos-input-gallery').change(function(){
    // when we use the <input type="file" />
    Vue.prototype.Sublib.parsePhotos = async function(mType, mTypeId, aFileInput, mSubId='', mSubIdType='', mURL, oExtraParams){
        // mType = Char. Either 'FTICK', 'JOB', or 'QUOTE', or 'BLDR'
        // mTypeId = Char. ftickid, jobsid, etc
        // aFileInput = value of input that called this (whole object)
        // mSubId = Char. Optional. If set, will save the photo to the subidtype table (ex: 'FTASK', 'QST')
        // mSubIdType = Char. Optional. If set, will save the photo to the subidtype table (ex: 'FTASK', 'QST')
        // mURL = Char. Optional. If set, will use this URL instead of the default
        // oExtraParams = Object. Optional. If set, will add these params to the web service call

        if(!mURL){
            mURL = 'cpDocs/saveCPPic';
        }else{
            mURL = mURL;
        }

        var mMsg = '';
        var mStartTime, mMethodStart, mEndTime;

        mMethodStart = new Date();

        //var _this = this;
        // some people were uploading 15+ pictures at a time. 
        // This can overwhelm our servers since we can only process 15 requests at once and this backs up all the other requests.
        // Only upload 5 at at time. This will make it slower but should save our servers / prevent other errors

        var aRet = [], oPhoto, mShrunkDown, mHold, mExt, aPhotosPending = [], mFileIsImg;
        var mMaxPicsAtOnce = 3; //5;

        // when we do our getFileBase64 below it blanks out the whole input object and we lose all but the 1st file (file we are playing with). 
        // Make a copy and use that instead. SRR 01/27/2023
        var aFilesCopy = [...aFileInput.files];

        // for (var mx = 0; mx < aFileInput.files.length; mx++){
        //     var file = aFileInput.files[mx];
        var picUploadMsg, curBlockStr, curBlockStartNo;

        this.showMsg(this.getLbl('preparing files to upload'));

        for (var mx = 0; mx < aFilesCopy.length; mx++){
            var file = aFilesCopy[mx];

            // if(file.size/1024/1024 >= 10){
            //     // this is a file that is too big
            //     var mMsg = this.getLbl('upload-large-file');
            //     mMsg = mMsg.replace('<FILE>', file.name);
            //     mMsg = mMsg.replace('<MAX_FILE_SIZE>', 10);
            //     this.mbox(mMsg);
            //     continue;
            // }

            // console.log('file', file);

            mMsg += 'uploading file type ' + file.type + ' size, ' + Math.round(file.size/1024/1024 * 100) / 100 + 'mb, name ' + file.name + '\n'; 


            //if file is a pdf do not shrink it
            //if (file.type == 'application/pdf'){
            //for some reason, on windows, if it is .heic file, file.type is empty, but file.name has the extension
            var heicFile = false;
            heicFile = this.contains(file.name, 'heic', true) || this.contains(file.type, 'heic', true);
            mFileIsImg = this.contains(file.type, 'image', true) || heicFile;

            
            if (!mFileIsImg){
                if(file.size/1024/1024 >= 10){
                    // this is a file that is too big (over 10 MB, when we go to base64 it goes to 1.33 times the size)
                    var mMsg = this.getLbl('upload-large-file');
                    mMsg = mMsg.replace('<FILE>', file.name);
                    mMsg = mMsg.replace('<MAX_FILE_SIZE>', 10);
                    this.mbox(mMsg);
                    continue;
                }

                mStartTime = new Date();
                
                mShrunkDown = await this.getBase64ForFiles(file);

                if (this.isTestingIP()){
                    mEndTime = new Date();
                    
                    mMsg += 'pdf getting base64time : ' + (mEndTime.getTime() - mStartTime.getTime()) / 1000 + ' seconds' + '\n';
                }
            }else {
                // Don't check for it being too big as we shrink it down and a lot of phones are taking 18-20+ MB pictures (Samsung). SRR 06/14/2022
                mStartTime = new Date();

                   //if the type is heic convert it to jpeg
                if (this.contains(file.name, 'heic', true)){
                    mShrunkDown = await this.convertHeic2JPEG(file);
                }else{
                    mShrunkDown = await this.resizePhoto(file, 'UPLOAD');
                }

                if (this.isTestingIP()){
                    mEndTime = new Date();
                    var fileSizeMb = 4 * Math.ceil((mShrunkDown.length / 3))*0.5624896334383812/(1048576)
                    mMsg += 'resizing photo time: ' + (mEndTime.getTime() - mStartTime.getTime()) / 1000 + ' seconds and now it is ' +  Math.round(fileSizeMb * 100) / 100 + 'mb' + '\n';
                }
            }   

           

            // the canvas element defaults to png if it can't figure out what type you want. Go off of shrunkDown base64 instead of the actual picture ext
            //var mExt = file.name.substr(file.name.lastIndexOf('.') + 1).toUpperCase();
            mHold = mShrunkDown.substr(0, mShrunkDown.indexOf(';')); // data:image/jpeg
            if (this.contains(mHold, 'image')){
                mExt = mHold.substr(mHold.indexOf('/') + 1).toUpperCase();
            } else {
                // some other doc where the type doesn't match the actual file extension
                mExt = file.name.substr(file.name.lastIndexOf('.') + 1).toUpperCase();
            }

            var fileName = file.name;
            
            //changing the file to jpeg if it is heic, so that web service can read it and produce a thumbnail
            if (this.contains(fileName, 'heic', true)){
                fileName = fileName.replace('.heic', '.jpeg');
            }

            //on the iphones and ipads, the filenames were image.jpg when taken from a camera, if 2 pictures were taken withing one minute range, 
            //it was finding the existing image in %like% sql statement and overriding the existing image MA 08/16/2023
            let justFName = this.justStem(fileName, true)

            if(this.inList(justFName, 'IMAGE', 'IMG', 'PHOTO', 'DOC', 'DOCUMENT', 'NEW DOCUMENT', 'FILE')){
                fileName = this.justStem(fileName) + '_' + this.getAddId(true) + '.' + this.justExt(fileName) //image.jpeg => image_12345.jpeg
            }

            // on Chrome, it's lastModifiedDate, on iOS it's lastModified. Wierd
            // Scratch that, Chrome also supports lastModified. SRR 01/22/2020
            var mDate = file.lastModified; // file.lastModifiedDate || file.lastModified;
            mDate = this.newDate(mDate); // make sure it's not a string for our comparison
            if (mDate.getFullYear() < 1900) {
                // on Maylin's one+ phone, it was reporting 12/31/1600. Very weird
                mDate = this.newDate(null); // 01/01/1900
            }

            oPhoto = {
                imgFilesId: '!ADD!' + String(Math.random() * 100),  // had to attached imgFilesId for the offline mode so it would save the image when online
                base64: mShrunkDown.substr(mShrunkDown.indexOf('base64,') + 7),
                descModifier: '',
                descript: fileName,
                picDate: this.DTOC(mDate),
                picTime: this.milTime(mDate),
                picType: mExt
            }



            // switched to try to only save 5 at once instead of queing them all up.
            //this.savePhoto(mType, mTypeId, oPhoto);
            //aPhotoHold.push({type: mType, typeId: mTypeId, photo: oPhoto});
            aPhotosPending.push(this.savePhoto(mType, mTypeId, oPhoto, false, mSubId, mSubIdType, mURL, oExtraParams, true));
        
            if (aPhotosPending.length == mMaxPicsAtOnce || mx == aFileInput.files.length -1){

                mStartTime = new Date();

                // wait for the 3 photos to finish uploading    
                // wait for the 5 photos to finish uploading    

                // Show a little entertainment incase it takes a second. SRR 05/16/2023
                picUploadMsg = this.getLbl('file upload progress');
                if (aFileInput.files.length == 1){
                    // Don't show 1-1 of 1 for only one picture, just 1 of 1
                    curBlockStartNo = 1;
                    curBlockStr = '1'
                    
                } else {
                    curBlockStartNo = Math.floor((mx) / mMaxPicsAtOnce); // get the int
                    curBlockStartNo = 1 + (curBlockStartNo * mMaxPicsAtOnce);
                    curBlockStr = String(curBlockStartNo) + '-' + String(mx + 1); // 1-3, 4-6, etc);
                }
                        
                picUploadMsg = picUploadMsg.replace('<CNT>', curBlockStr); // 1-3, 4-6, etc);
                picUploadMsg = picUploadMsg.replace('<TOT>', aFilesCopy.length);
                this.showMsg(picUploadMsg, false, ((mx+1)/aFilesCopy.length) * 100);
    
                await Promise.all(aPhotosPending);

                if (this.isTestingIP()){
                    mEndTime = new Date();
                    mMsg += '----------uploading ' + aPhotosPending.length + ' pictures took ' + (mEndTime.getTime() - mStartTime.getTime()) / 1000 + ' seconds' + '\n';
                }

                aPhotosPending = []; // reset
            }

            mStartTime = new Date();

             //if file is not a pdf, then get thumb for it
            //if (file.type != 'application/pdf'){
            if (mFileIsImg){
                // return a thumbnail, not the bigger pic we save
                if(!heicFile){
                    mShrunkDown = file;
                    mShrunkDown = await this.resizePhoto(file, 'THUMB');
                }else{
                    //just use the original base64 we generated earlier for heic file
                }
                mHold = mShrunkDown.substr(0, mShrunkDown.indexOf(';')); // data:image/jpeg
                mExt = mHold.substr(mHold.indexOf('/') + 1).toUpperCase();
            }

            if (this.isTestingIP()){
                mEndTime = new Date();
                mMsg += 'getting thumbnail took ' + (mEndTime.getTime() - mStartTime.getTime()) / 1000 + ' seconds' + '\n\n';
            }

            oPhoto.base64 = mShrunkDown.substr(mShrunkDown.indexOf('base64,') + 7);
            oPhoto.picType = mExt;

            aRet.push(oPhoto);
        } // for

        if (this.isTestingIP()){
            mEndTime = new Date();
            mMsg += '\n' + 'parsePhotos in total took ' + (mEndTime.getTime() - mMethodStart.getTime()) / 1000 + ' seconds' + '\n';

            //this.mbox(mMsg);
        }

        this.showMsg()

        return aRet; 

    }, // parsePhotos

    //**************************************************************************************************************
    //Converting files to base64 data and returning it

    Vue.prototype.Sublib.getBase64ForFiles = async function(file){
        
        //if it is a .heic file, then convert it to jpeg and return the base64 data, this gets called when they upload picture and want to edit it MA 05/17/2023
        if(this.contains(file.name, 'heic', true) || this.contains(file.type, 'heic', true)){
            this.showMsg(this.getLbl('preparing files to upload'));

            return await this.convertHeic2JPEG(file);
        }else{
            return await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result);
                reader.onerror = error => reject(error);
            });
        }
    }, //getBase64ForFiles


     //**************************************************************************************************************
    //Converting  hiec files to base64 data and returning it
    Vue.prototype.Sublib.convertHeic2JPEG = async function(oFile){

        return new Promise((resolve, reject) => {
            const convert = require('heic-convert');

            const reader = new FileReader();
            reader.onload = () => {
              const arrayBuffer = reader.result;
              const buffer = Buffer.from(arrayBuffer);

              convert({buffer : buffer,  format: 'JPEG', quality: 0.6})  //tested out multiple times, and 0.6 seems to be the best quality and size ratio
                .then((result) => {
                    const convertedBlob = new Blob([result]);

                    const convertedFile = new File([convertedBlob], oFile.name, {
                        type: 'image/jpeg',
                    });

                    const reader = new FileReader();

                    reader.onloadend = () => {
                      const base64String = reader.result;
                      resolve(base64String);
                    };
                    reader.readAsDataURL(convertedFile);
                })
                .catch((error) => {
                  reject(error);
                });
            };
            reader.onerror = (error) => {
              reject(error);
            };
            reader.readAsArrayBuffer(oFile);
          });


    }, //convertHeic2JPEG

     //**************************************************************************************************************
    //Converting imgURL (downloadpath) to base64 data and returning it
    //This is not used currently, but in case we need it in the future MA 01/26/2023 
    // see getBase64ForURL instead
    Vue.prototype.Sublib.getBase64PicURL = async function(URL){

        return new Promise((resolve) => {
            var img = new Image();
            img.crossOrigin = 'Anonymous';
            img.src = URL;
            img.onload = function() {
                var canvas = document.createElement('CANVAS');
                var ctx = canvas.getContext('2d');
                var dataURL;
                canvas.height = this.naturalHeight;
                canvas.width = this.naturalWidth;
                ctx.drawImage(this, 0, 0);
                dataURL = canvas.toDataURL();
                resolve(dataURL);
            };
        })

    }, //getBase64ForPics


    //**************************************************************************************************************
    // NOTE: can't just send up the base64 string as it could be HUGE (10+ MB);
    // need to shrink it down first
    // RETURNS: String (base64 str)
    Vue.prototype.Sublib.resizePhoto = async function(oFile, mType){
        // oFile = Object
        // mType = Char. either 'UPLOAD' or 'THUMB'

        var mOrientation, mMaxSize;
            
        // NOTE: For the desktop (with my testing of a file approx 2MB to start with)
        // 1000 resulted in a file approx 180 kb
        // 1500 results in a file around 315 kb. 
        // 2000 results in a file around 485 kb. but easier to view on the desktop. I think it's work the extra size

        //We always want to shrink the image down to a max of 1000px
        if (true || mType == 'UPLOAD'){
            if (this.isIOS() || this.isAndroid()){
                mMaxSize = 1000; // mobile pictures are bigger to start with so scale them down more (still look good on the desktop when viewing)
            } else {
                // desktop
                mMaxSize = 2000;
            }
            
        } else { // mType == 'THUMB'
            mMaxSize = 400;
        }

        if(oFile.type == 'image/png'){
            mMaxSize = 1000;
        }

        var mCanvasId = 'imgReszing' + String(Math.random() *100);

        // loadImage is loaded in index.html
        await new Promise((resolve, reject) => {
            loadImage.parseMetaData(oFile, function(oData){
                // if (oData.exif){
                //     //alltags = oData.exif.getAll(); // currently not using this, but gives a ton of info we might want later
                //     mOrientation = oData.exif.get('Orientation');
                // } else {
                //     // couldn't get orientation, default in 1 (which means it won't get rotated from however it gets loaded in
                //     mOrientation = 1;
                // }
                // see https://github.com/blueimp/JavaScript-Load-Image/blob/master/README.md#orientation
                mOrientation = true; // it figures out what it needs to and seems to work better... SRR 03/30/2022

                loadImage(oFile, 
                    function(oImg){
                        // add it as a canvas element to the dom
                        oImg.id = mCanvasId;
                        oImg.style.visibility = 'hidden';
                        document.getElementById('app').appendChild(oImg);
                        resolve();
                    },
                    {
                        maxHeight: mMaxSize,
                        maxWidth: mMaxSize,
                        canvas: true,
                        pixelRatio: window.devicePixelRatio,
                        downsamplingRatio: 0.5,
                        orientation: mOrientation
                    } // options
                ); // loadImage
            }); // loadImage
        });

        var mExt = oFile.name.substr(oFile.name.lastIndexOf('.') + 1).toLowerCase();
        if (mExt == 'jpg'){
            mExt = 'jpeg'
        }
        mExt = 'image/' + mExt;

        var oCanvasEl = document.getElementById(mCanvasId);

        var mRetVal = oCanvasEl.toDataURL(mExt, .8); // the 1 can be a Number between 0 and 1 indicating image quality if the requested type is image/jpeg

        document.getElementById('app').removeChild(oCanvasEl);

        return mRetVal;
    } // resizePhoto

    // *************************************************************
    // Takes a data URI and returns the Data URI corresponding to the resized image at the wanted size.
    Vue.prototype.Sublib.resizePhotoBase64 = function(base64Str, maxWidth, maxHeight){
        return new Promise((resolve) => {
            let img = new Image()
            img.src = base64Str
            img.onload = () => {
              let canvas = document.createElement('canvas')
              const MAX_WIDTH = maxWidth
              const MAX_HEIGHT = maxHeight
              let width = img.width
              let height = img.height
        
              if (width > height) {
                if (width > MAX_WIDTH) {
                  height *= MAX_WIDTH / width
                  width = MAX_WIDTH
                }
              } else {
                if (height > MAX_HEIGHT) {
                  width *= MAX_HEIGHT / height
                  height = MAX_HEIGHT
                }
              }
              canvas.width = width
              canvas.height = height
              let ctx = canvas.getContext('2d')
              ctx.drawImage(img, 0, 0, width, height)
              resolve(canvas.toDataURL())
            }
          })
    }// Use it like : var newDataURI = await resizedataURL('yourDataURIHere', 50, 50);


   
    //**************************************************************************************************************
    // formats 1555 to $1,555.00 
    // mCurSym is $, £, etc.
    Vue.prototype.Sublib.formatCurrency = function (mNumToFormat, mCurSym, mFormatZeroAs, mStripeOffCurSym) {
        // formats 1555 to $1,555.00 
        // mCurSym is $, £, etc.
        // mFormatZeroAs = Char. Optional. Makes it so you can pass '-' for zero or '', etc.
        // mStripeOffCurSym = Logical. If true, after formatting is done, gets rid of the $ at the front

        if (mNumToFormat == 0 && typeof mFormatZeroAs == 'string'){
            return mFormatZeroAs;
        }

        var mLocale = 'en-US';
        var mCurrency = 'USD';

        if (!mCurSym || mCurSym == '$' || mCurSym == 'USD') {
            // nothing to do, set above
        } else if (mCurSym == '£' || mCurSym == '€' || mCurSym == 'EUR') {
            mLocale = 'en';
            mCurrency = 'EUR';
        }

        var formatter = new Intl.NumberFormat(mLocale, {
            style: 'currency',
            currency: mCurrency,
            minimumFractionDigits: 2
        });

        mNumToFormat = String(mNumToFormat); // verify it's string so formatter doesn't err out.
        mNumToFormat = formatter.format(mNumToFormat);

        if (mStripeOffCurSym){
            // want to keep the number formatting (i.e. decimals vs periods, include decimals for $ amounts)
            // but get rid of the $
            if (this.left(mNumToFormat, 1) == '-'){
                // -$1,555.00
                mNumToFormat = '-' + mNumToFormat.substring(2);
            } else {
                mNumToFormat = mNumToFormat.substring(1); 
            }
            
        }

        //check if it's a negative number
        

        return mNumToFormat;
    } // formatCurrenty


    //**************************************************************************************************************
    Vue.prototype.Sublib.getLocBreadCrumb = async function(_this){
        // _this = object reference to Sublib so I can call functions. If not passed, we are initing this function for the first time and have access to 'this'
        // NOTE: lose access to 'this' when the timer fires...

        if (!_this){
            _this = this;
        }

        if (!_this.getConnectInfo){
            // we got a bad reference. Something's not right (possibly from before we called it the right way). SRR 11/19/2020
            return;
        } else if (!_this.getConnectInfo('token')){
            // not signed in yet
            return;
        }
        
        
        var mURL, oParams, resp, mKey, oData;
        var mNow = await _this.getDate(true);

        if (!_this.locBreadCrumbTimer){    
            var mLocFreq = localStorage.getItem('breadCrumbFreq');
            var mLocFreqLastGetDt = this.newDate(localStorage.getItem('breadCrumbFreqDt'));

            // go get the freq if we don't have it or it's been a day since we did (want to honor the branch setting if it changed)
            if (mLocFreq == null || _this.daysBetween(mNow, mLocFreqLastGetDt, true) > 0){
                mURL = _this.getWSUrl() + 'cpGetUsers/getBreadCrumbFreq'; 
                oParams = {}
                
                mKey = 'getBreadCrumbFreq';
                resp = await _this.RestClient.get(mURL, oParams, mKey, true);

                oData = _this.wsResp2Obj(resp);
                if (oData.errorMsg || !oData[0]){
                    //_this.mbox(oData.errorMsg);
                    mLocFreq = 5; // minutes
                } else {
                    mLocFreq = oData[0].mobgpsfreq; // minutes

                    localStorage.setItem('breadCrumbFreq', mLocFreq);
                    localStorage.setItem('breadCrumbFreqDt', mNow);
                }
                
            } 

            mLocFreq = Number(mLocFreq);

            if (this.usingWebview('android')){
                // the android code handles this (see this.updtTimeStatus())
                android.setLocalStorage('breadCrumbFreq', mLocFreq)
                //return; // doesn't fully work yet, have this try as well
            }

            if (mLocFreq == 0){
                // 0 means turned off
                if (_this.locBreadCrumbTimer){
                    clearInterval(_this.locBreadCrumbTimer);
                }
                return;
            }

            
           


            //this.locBreadCrumbTimer = setInterval(this.getLocBreadCrumb, mLocFreq *60 *1000);
            _this.locBreadCrumbTimer = setInterval(_this.getLocBreadCrumb, mLocFreq * 60 *1000, _this);
        }

        
        var mStatus = await _this.IDB.req('cachedWSResp', 'get', 'getCurStatus');
        oData = _this.wsResp2Obj(mStatus);

        if (!oData.errorMsg){
            if (oData[0].type == 'FT'){
                // Ftick
                
            } else if (oData[0].type == 'ER'){
                // errand

            } else if (oData[0].type == 'CL'){
                // clocked in

            } else { // oData[0].type == ''
                // clocked out
                return false;
            }
        } else {
            // don't know the status, don't send up bread crumbs
            return false;
        }

        // if (this.mAutoRefreshTimer){
        //     clearInterval(this.mAutoRefreshTimer);
        // }
    
    
        var oLoc = await _this.getLocation();
        if (oLoc.errorMsg){
            //this.Sublib.mbox(oLoc.errorMsg);
            return false;
        } 
    

        mURL = _this.getWSUrl() + 'cpGetUsers/saveBreadCrumb'; 
        oParams = {
            dt: _this.DTOC(mNow),
            time: _this.milTime(mNow),
            lat: oLoc.lat,
            lon: oLoc.lon
        }
        

        mKey = 'saveBreadCrumb~dt=' + oParams.dt + '~time=' + oParams.time;
        resp = await _this.RestClient.get(mURL, oParams, mKey, true);

        oData = _this.wsResp2Obj(resp);
        if (oData.errorMsg){
            if (!_this.contains(oData.errorMsg, 'clocked out', true)){
                _this.mbox(oData.errorMsg);
            }
            return false;
        }
        
        return true;

    } // getLocBreadCrumb



    //**************************************************************************************************************
    // There is no way from a browswer to detect if a device supports a telephone dialer.
    // Found this on stack overflow to decide if the device is a phone. assume phone means dialer. SRR 10.07.2019
    // https://stackoverflow.com/questions/42876420/is-there-a-way-to-check-with-browsers-javascript-can-the-device-make-a-phone
    Vue.prototype.Sublib.deviceIsPhone = function(){
        var mTest = navigator.userAgent || navigator.vendor || window.opera;
        var mRetVal = /\bi?Phone\b|(?=.*\bAndroid\b)(?=.*\bMobile\b)|(?=.*\bAndroid\b)(?=.*\bSD4930UR\b)/i.test(mTest);

        return mRetVal;
    } // deviceIsPhone



    //**************************************************************************************************************
    // There is no way from a browswer to detect if a device supports a telephone dialer.
    // Found this on stack overflow to decide if the device is a phone. assume phone means dialer. SRR 10.07.2019
    // https://stackoverflow.com/questions/42876420/is-there-a-way-to-check-with-browsers-javascript-can-the-device-make-a-phone
    Vue.prototype.Sublib.setDeviceHasDialer = function(mOn){
        // mOn = Logical. if passed, sets our localStorage value to mOn value, 
        //          if not passed, tries to guess if device is a phone, and, if so assumes it has a dialer

        if (typeof mOn != 'boolean'){
            mOn = this.deviceIsPhone();
        }

        localStorage.setItem('devHasDialer', mOn);

    } // setDeviceHasDialer



    //**************************************************************************************************************
    // Returns: Object. oAutoLunch
    // Get oAuto lunch object used in wantAutoLunch
    // NOTE: Normally this is returned as part of some other query but there are times (i.e. office doing a clock in) when dates can change drastically as they back date something
    // and this makes it so we can call just the auto lunch portion. SRR 11/11/2022
    Vue.prototype.Sublib.getAutoLunchDetails = async function(mUserId, mDt, mIdType2Ignore, mId2Ignore){
        // m.userId = Char. User to check
        // m.dt = Date. Date to Check
        // m.idType2Ignore = Optional. either 'FT', 'ER' or 'CL'. Had a problem where they would close the app and reopen and re-go to the FTick and it would
        //					Pick up the same FT they were on so it would double their time and push them past the autolunch even though they weren't really there yet. SRR 02/24/2020
        // m.id2Ignore = Char. Optional. FTick Id, errand Id, or time Id to ignore.

        var mURL = this.getWSUrl() + 'cpGetUsers/getAutoLunchDetails';
        var oParams = { 
            userId: mUserId,
            dt: mDt,
            idType2Ignore: mIdType2Ignore,
            id2Ignore: mId2Ignore
        }

        var resp = await this.RestClient.getNoCache(mURL, oParams);
        
        var oData = this.wsResp2Obj(resp);
        if (oData.errorMsg){
            this.mbox(oData.errorMsg);
            return {};
        }

        return oData[0];

    }, // getAutoLunchDetails



    //**************************************************************************************************************
    // Returns: Object { want2Enable: logical, lunchMin: numeric }
    Vue.prototype.Sublib.wantAutoLunch = function(oUserTime, oAutoLunch, mIdType, mId){
        // oUserTime = Object. Contains user status times (started, arrived, departed, completed and dates)
        // oAutoLunch = Object. Basically the retval of cpGetUsers.autoLunchDetails() in web service
        // mIdType = Char. either 'FT', 'ER' or 'CL'
        // mId = Char. ftickid, errandid, or timeid (clock in)

        var mWant2Enable = false;

        // make sure that oUserTime has all the properties I want
        if (!oUserTime.starteddt && oUserTime.startedDt){
            oUserTime.starteddt = oUserTime.startedDt;
            oUserTime.arriveddt = oUserTime.arrivedDt;
            oUserTime.departeddt = oUserTime.departedDt;
            oUserTime.completedt = oUserTime.completedDt;
        }

        if (typeof oUserTime.starteddt == 'string'){
            oUserTime.starteddt = oUserTime.starteddt.replace('Z', '');
        }
        if (typeof oUserTime.arriveddt == 'string'){
            oUserTime.arriveddt = oUserTime.arriveddt.replace('Z', '');
        }
        if (typeof oUserTime.departeddt == 'string'){
            oUserTime.departeddt = oUserTime.departeddt.replace('Z', '');
        }
        if (typeof oUserTime.completedt == 'string'){
            oUserTime.completedt = oUserTime.completedt.replace('Z', '');
        }


        if (!oUserTime.startedDtTm){
            oUserTime.startedDtTm = this.newDate(this.DTOC(oUserTime.starteddt) + ' ' + this.AmPm(oUserTime.started));
            oUserTime.arrivedDtTm = this.newDate(this.DTOC(oUserTime.arriveddt) + ' ' + this.AmPm(oUserTime.arrived));
            oUserTime.departedDtTm = this.newDate(this.DTOC(oUserTime.departeddt) + ' ' + this.AmPm(oUserTime.departed));
            oUserTime.completedDtTm = this.newDate(this.DTOC(oUserTime.completedt) + ' ' + this.AmPm(oUserTime.completed));
        }
        

        if (!oAutoLunch.branchautolunch 
            || (oAutoLunch.lunchtaken && (mId != oAutoLunch.lunchtakenid || mIdType != oAutoLunch.lunchtakentype))){
            // auto lunch turned off in branch or already taken for the day, nothing to do
            mWant2Enable = false;

        } else if (!oUserTime.started && !oUserTime.completed){
            // no times set, don't want to enable
            mWant2Enable = false;

        } else if (oAutoLunch.branchlunchopt == 1){
            // Option 1 = Apply AutoLunch after ___ hours
            // Need to figure out how many hours they have already worked today
            // mPrevFTmin is all minutes from previously entered FT for the day
            // Add to that the current FT time

            var mEndTime;
            if (oUserTime.completed){
                mEndTime = oUserTime.completedDtTm;

            } else if (oUserTime.departed){
                mEndTime = oUserTime.departedDtTm;

            } else if (oUserTime.arrived){
                mEndTime = oUserTime.arrivedDtTm;
            }

            if (mEndTime){
                var mTotFTMin = Math.floor((mEndTime - oUserTime.startedDtTm) / 1000 / 60) + oAutoLunch.prevmintot;
                var mTotFTHrs = mTotFTMin / 60;

                if (mTotFTHrs > oAutoLunch.branchlunchafter){
                    mWant2Enable = true;
                } else {
                    mWant2Enable = false;
                }
            } else {
                // all we have is a start time, nothing to do
                mWant2Enable = false;
            }

        } else if (oAutoLunch.branchlunchopt == 2){
            // Option 2 = Apply AutoLunch between window
            // Want to compare start/arrive time to window, but one minute shy of completed time.
            // Don't want to flag as lunch if start time/arrive is the End of the lunch time. Make it one minute shy
            // Don't want to flag as lunch if departed/completed time is same as lunch start time. Add one minute
            var mDt = this.DTOC(oUserTime.starteddt);
            var mBranchLunchStart = this.newDate(mDt + ' ' + this.AmPm(oAutoLunch.branchlunchstart));
            var mBranchLunchEnd = this.newDate(mDt + ' ' + this.AmPm(oAutoLunch.branchlunchend));

            if ((mBranchLunchStart <= oUserTime.startedDtTm && oUserTime.startedDtTm < mBranchLunchEnd)
                || (mBranchLunchStart < oUserTime.arrivedDtTm && oUserTime.arrivedDtTm < mBranchLunchEnd)
                || (mBranchLunchStart < oUserTime.departedDtTm && oUserTime.departedDtTm <= mBranchLunchEnd)
                || (mBranchLunchStart < oUserTime.completedDtTm && oUserTime.completedDtTm <= mBranchLunchEnd)
                || (oUserTime.startedDtTm < mBranchLunchStart && mBranchLunchEnd < oUserTime.completedDtTm )){

                    mWant2Enable = true;
                } else {
                    mWant2Enable = false;
                }
        } else {
            // no branch lunch option
            mWant2Enable = false;
        }

        // Do a double check. Even though it meets the criteria, if it will make times negative, don't take it!
        // Remember, auto lunch comes off of on site time!
        // From Ryan's notes on the desktop: Had a scenario with TrueLine/Baltimore where the onsite time was 15 min, but it tried to deduct
        // a 30 min lunch. RHR. 02/08/2016
        if (mWant2Enable){
            if (!oUserTime.departed && !oUserTime.arrived){
                // don't know if we can take it yet as they haven't departed
                mWant2Enable = false;

            } else if (!oUserTime.departed && oUserTime.arrived){
                // have clicked arrived but not departed, do what I can
                var mNow = new Date(); //await this.Sublib.getDate(true); method is not async so just hope they didn't change the date / time
                if (((mNow - oUserTime.arrivedDtTm) / 1000 / 60) > oAutoLunch.branchlunchmin){
                    mWant2Enable = false;
                }
            
            } else {
                // make sure there's enough time on this ticket
                if (mIdType == 'FT' && ((oUserTime.departedDtTm - oUserTime.arrivedDtTm) / 1000 / 60) < oAutoLunch.branchlunchmin){
                    // FT, auto lunch is only taken out of onsite
                    mWant2Enable = false;

                } else if (((oUserTime.completedDtTm - oUserTime.startedDtTm) / 1000 / 60) < oAutoLunch.branchlunchmin){
                    // clock in rec or errand (time is paid as a clock in), use the started vs completed since it's all onsite 

                    if (this.emptyDt(oUserTime.completedDtTm) && ((mEndTime - oUserTime.startedDtTm) / 1000 / 60) >= oAutoLunch.branchlunchmin){
                        // used departed time or something like that since completed isn't set yet. 
                        // NOTE: Should only really hit this on errands.
                        // take the lunch break since completed will be bigger anyways. SRR 11/02/2022

                    } else {
                        mWant2Enable = false;
                    }
                    
                }
            }
        }


        return {
                want2Enable: mWant2Enable,
                lunchMin: oAutoLunch.branchlunchmin,
                lunchReq: oAutoLunch.branchlunchreq, // stop them from saying that they worked through lunch. NOTE: Only used on FT & Errands. SRR 11/01/2022
            }

    } // wantAutoLunch


    //**************************************************************************************************************
    // tell the user why auto lunch is disabled
    // either doesn't qualify yet or lunch already taken
    //
    // Returns: String
    Vue.prototype.Sublib.getAutoLunchDisabledMsg = function(mId, mIdType, oAutoLunch, mAutoLunchEnabled){
        var mRetVal = '';
        var mMsg = '';


        if (oAutoLunch.lunchtaken && oAutoLunch.lunchtakentype == 'NA'){
            // salary or paid via clock in only
            mRetVal = this.getLbl('auto lunch na');

        } else if (mAutoLunchEnabled && oAutoLunch.branchlunchreq && mIdType != 'CL'){
            // enabled but branch settings say they have to take the break so it will be disabled right after this call. SRR 11/01/2022
            mRetVal = this.getLbl('branch settings require lunch break');

        } else if (mAutoLunchEnabled){
            // enabled, no disabled message required
            mRetVal = '';

        } else if (oAutoLunch.lunchtakenid && oAutoLunch.lunchtakenid != mId && !oAutoLunch.lunchtakennolunch){
            // previosly took a lunch
            mMsg = this.getLbl('lunch prev taken on');
            mMsg = mMsg.replace('<FT>', oAutoLunch.lunchtakentype + ' ' + this.trimZeros(oAutoLunch.lunchtakenid, 5));
            mRetVal = mMsg;

        } else if (oAutoLunch.lunchtakenid && oAutoLunch.lunchtakenid != mId && oAutoLunch.lunchtakennolunch){
            // worked through lunch
            mMsg = this.getLbl('lunch worked through on');
            mMsg = mMsg.replace('<FT>', oAutoLunch.lunchtakentype + ' ' + this.trimZeros(oAutoLunch.lunchtakenid, 5));
            mRetVal = mMsg;

        } else if (oAutoLunch.lunchmanual && oAutoLunch.lunchtakenid == mId){
            // lunch manually taken right before this ft
            mMsg = this.getLbl('lunch manually taken');
            mMsg = mMsg.replace('<FT>', oAutoLunch.lunchtakentype); 
            mRetVal = mMsg;
        
        } else {
            // doesn't yet qualify for lunch
            mRetVal = this.getLbl('lunch not qualified'); // "Time doesn't qualify for lunch";
        }
        
        return mRetVal;
    } // getAutoLunchDisabledMsg



    //**************************************************************************************************************
    // Add the app to the home screen (if not running through webview AND the user is signed in)
    Vue.prototype.Sublib.addToHomeScreen = async function(mPromptNotSignedIn){
        // mPromptNotSignedIn = Logical. If true, tries to prompt even if they are not signed in

        if (!this.getConnectInfo('token') && !mPromptNotSignedIn){
            // not signed in
            return;
        }

        // NOTE: IOS doesn't currently support a native prompt. Dumb. SRR 2019.10.14
        if ((!this.pwaPrompt && !this.isIOS()) || this.usingWebview()){
            return false;
        }


        // NOTE: This may be called even though it was luanched via the 'installed' icon
        // See if it's already installed
        // https://developers.google.com/web/fundamentals/app-install-banners/
        var mAlreadyInstalled = false;
        if (this.isIOS()){
            mAlreadyInstalled = window.navigator.standalone;
        } else {
            mAlreadyInstalled = window.matchMedia('(display-mode: standalone)').matches;
        }

        if (mAlreadyInstalled){
            return false;
        }

        var mChoice;
        // mChoice = await this.mbox('Add app to home screen?', 'Yes', 'No');
        // if (mChoice == 2){
        //     // no
        //     return false;
        // }

        var mRetVal;

        if (!this.isIOS()){
            // android or desktop. Both support native prompt
            if (this.convFromStr(localStorage.getItem('showedAdd2HSPrompt'))){
                return false;
            }
            localStorage.setItem('showedAdd2HSPrompt', true);


            await this.pwaPrompt.prompt(); // Have to use the built in prompt screen thing and wait;
            mChoice = await this.pwaPrompt.userChoice;
            if (mChoice.outcome == 'aceepted'){
                // user choose to add it ot he home screen!
                mRetVal = true;
            } else {
                // user said no
                mRetVal = false;
            }
            this.pwaPrompt = null;

        } else {
            // ios, doesn't support native prompt. Doing our own (not perfect but better than nothing)
            // see if I've already prompted and only show if I haven't (browser handles this for android and desktop)
            if (this.convFromStr(localStorage.getItem('showedIOSAdd2HSPrompt')) || this.isTestingIP()){
                return false;
            }
            localStorage.setItem('showedIOSAdd2HSPrompt', true);
             
            
            mChoice = await this.mbox(this.getLbl('add to hs')
                                        + '<br />'
                                        + '<br />'
                                        + '<div>'
                                        +   '<img src="' + (this.contains(location.href, 'portalbeta', true) ? 'img/icons/beta/Icon192x192.png' : 'img/CPcircle.png') + '" style="width: 40px; height:40px; vertical-align:middle" />'
                                        +   '<span style="margin-left:10px;">CP Portal</span>'
                                        + '</div>',
                                        this.getLbl('add'), this.getLbl('cancel'));
            if (mChoice == 2){
                // no
                return false;
            } else {
                mRetVal = true;
            }

            // show our instructions
            await this.mbox(this.getLbl('ios add to hs') 
                            + '<br />'
                            + '<img src="img/iOSAdd2HS.png" style="width:100%"/>')
        }


        return mRetVal;
    } // addToHomeScreen



    //**************************************************************************************************************
    Vue.prototype.Sublib.startRemoteSupportSession = function () {
        // luanch teamviewer if installed or redirect to play / apple store / teamviewer.com
        // NOTE: Got all links from https://www.teamviewer.us/downloads/

        // NOTE: Switched to splashtop. SRR 03/24/2020
        if (this.isIOS()) {
            // https://itunes.apple.com/us/app/teamviewer-quicksupport/id661649585
            //window.open('https://itunes.apple.com/us/app/teamviewer-quicksupport/id661649585');
            var mIOSLink = 'https://apps.apple.com/us/app/splashtop-sos/id1230853703';
            if (this.usingWebview('ios')){
                window.location.href = mIOSLink;
            } else{
                window.open(mIOSLink);
            }
            

        } else if (this.isAndroid()) {
            // https://play.google.com/store/apps/details?id=com.teamviewer.quicksupport.market
            //window.open('https://play.google.com/store/apps/details?id=com.teamviewer.quicksupport.market');
            window.open('https://play.google.com/store/apps/details?id=com.splashtop.sos&hl=en_US');

        } else {
            // windows
            // download teamviewer quick support .exe
            //window.open('https://download.teamviewer.com/qs?__hstc=159622562.ae2e3f59b24c3f079de3dd51d675d540.1527600710228.1527947639186.1528317536942.3&__hssc=159622562.1.1528317536942&__hsfp=713890276', '_system');

             // windows or mac
             var oDevice = this.getDeviceInfo();
             var mOS, mExt;
             if (oDevice.product.toUpperCase() == 'MAC'){
                //window.open('https://www.cenpoint.com/TeamViewerQS.zip', 'iframe'); // Mac Zip File (NOTE: Can't figure out why but it keeps showing 404 - File or directory not found but if you click 'refresh' it downloads okay...)
                window.open('https://www.cenpoint.com/remoteSupport_splashTop.dmg', 'iframe'); 

             } else {
                //window.open('https://www.cenpoint.com/TeamViewerQS-idcw3wzuh7.exe', '_system');
                window.open('https://www.cenpoint.com/remoteSupport_splashTop.exe', '_system');
             }
        }



        // Our base, custom quick support link: https://get.teamviewer.com/w3wzuh7
        
        // These are the direct downloads. If you hit the 'generic' link for our quick support link it launches a teamviewer page that figures out the version, OS, etc.
        // The downside is you can't do a direct download, it now shows a TeamViewer site. 
        // If you hit the URL on an Android, takes you the generic TeamViewer QS support site for the play store 
        //      but it's in a browser and there's a button at the bottom of the screen that says 'open in play store'
        // iOS opens the actual app store to the right app. SRR 01/20/2020

        // Direct download links (NOTE: The 'version' part can change)
        // for Windows: https://customdesign.teamviewer.com/download/version_15x/w3wzuh7_windows/TeamViewerQS.exe
        // for Mac:     https://customdesign.teamviewer.com/download/version_15x/w3wzuh7_mac/TeamViewerQS.zip


//         var mVersion = '15x'; // As of 01.20.2020
//         var mURL = 'https://customdesign.teamviewer.com/download/version_<VERSION>/w3wzuh7_<OS>/TeamViewerQS.<EXT>'; //'https://customdesign.teamviewer.com/download/version_15x/w3wzuh7_windows/TeamViewerQS.exe';
//         var mGenURL = 'https://get.teamviewer.com/w3wzuh7';


//         if (this.isIOS()){
//             window.open(mGenURL); // goes straight to the app store

//         } else if (this.isAndroid()){
//             // don't use the teamviwer link because it doesn't actually open the play store
//             window.open('https://play.google.com/store/apps/details?id=com.teamviewer.quicksupport.market');

//         } else {
//             // windows or mac
//             var oDevice = this.getDeviceInfo();
//             var mOS, mExt;
//             if (oDevice.product.toUpperCase() == 'MAC'){
//                 mOS = 'mac';
//                 mExt = 'zip';
//             } else {
//                 mOS = 'windows';
//                 mExt = 'exe';
//             }
//             mURL = mURL.replace('<VERSION>', mVersion);
//             mURL = mURL.replace('<OS>', mOS);
//             mURL = mURL.replace('<EXT>', mExt);
//             window.open(mURL, '_system');
//         }



    } // startRemoteSupportSession



    //**************************************************************************************************************
    Vue.prototype.Sublib.check4Bday = async function() {
        // this will make a rest call to determine if we should show a birthday prompt. It's a nice touch. 

        if (!this.getConnectInfo('token')) {
            // not signed in yet, nothing to check
            return;
        }


        var mURL = this.getWSUrl() + 'cpGetUsers/checkBDay';
        var oParams = {};
        var mKey = 'checkBDay';

        var resp = await this.RestClient.get(mURL, oParams, mKey);

        var oData = this.wsResp2Obj(resp);
        if (oData.errorMsg){
            // bday is not critical, just kick out.
            return;
        }

        try {
            if (oData[0].prompt) {
                var mMsg = this.getLbl('happy bday');
                mMsg = mMsg.replace('<NAME>', oData[0].fname.trim());
                this.mbox(mMsg 
                        + '<br />'
                        + '<img src="img/bdaybatman.gif" style="width:100%"/>');
            }
        } catch (ignore) {
            // I've seen where if we are down, oData[0].prompt doesn't exist, since it's just the b-day, and it's not critical, ignore it.
            return;
        }

        return;

        

    }; //check4Bday


    //**************************************************************************************************************
    // This is copied / tweaked from Sublib.getDuartionParts in the web service
    // Break a time string into it's parts
    Vue.prototype.Sublib.getDurationParts = function(mTimeStr){
        // mTimeStr = Char. i.e. '04:15' (4 hrs, 15 min)
        if (!mTimeStr)
            mTimeStr = ''
        

        var oRetVal = {
            hrs: 0,
            min: 0,
            totMin: 0,
            timeStr: mTimeStr
        }

        oRetVal.hrs = Number(mTimeStr.substring(0, mTimeStr.indexOf(':')));
        oRetVal.min = Number(mTimeStr.substring(mTimeStr.indexOf(':') + 1));
        if (this.contains(mTimeStr, '-')){
            oRetVal.min *= -1;
        }
        oRetVal.totMin = (oRetVal.hrs * 60) + oRetVal.min;

        return oRetVal;
    } // getDuartion Parts


    //**************************************************************************************************************
    // Calculate the hours and minutes someone has
    // (ie in their time bank).
    // See HrToMin.
    // Returns: '3:45' for 225 min (or 3 hrs 45 min)
    Vue.prototype.Sublib.minToHr = function(mTotMin, mHrSize){
        // mTotMin = Total minutes (eg 75) that wil be converted into hours:minutes (eg 1:15)
        // mHrSize =  Num. How many digits the hours should be padded to (ie if m.hrsize=2, '01:15')
    
        if (!mHrSize){
            mHrSize = 1;
        }
    
        var mWantNeg = false;
        mTotMin = Math.ceil(mTotMin);

        var mHoldHr = Math.floor(mTotMin / 60); // get the int
        // Get the int (no built in Math.int(), dumb)
        //mHoldHr = mHoldHr - Number('.' + String(mHoldHr).substring(String(mHoldHr).indexOf('.') + 1));  
        if (mHoldHr < 0){
            mWantNeg = true;
        }

        var mHoldMin = mTotMin - (mHoldHr * 60);
        if (mHoldMin < 0){
            mWantNeg = true;
        }

        mHoldHr = String(Math.abs(mHoldHr)).trim();
        if (mHoldHr.length < mHrSize){
            mHoldHr = this.padL(mHoldHr, mHrSize, '0');
        }

        var mRetVal = mHoldHr + ':' + this.padL(String(Math.abs(mHoldMin)).trim(), 2, '0');
        if (mWantNeg){
            mRetVal = '-' + mRetVal;
        }

        return mRetVal;

    } // minToHr


    //**************************************************************************************************************
    // On the customer / job / quote, etc, we save as they go, need to make it so they can 'undo' a change
    // This will track a change on a particular field but must be called manaully.
    // i.e. 
    // html @blur="txtJobNameChanged()"
    // in JS: txtJobNameChanged(){
    //      this.oChanges.push(this.Sublib.addChange('job', 'jobdesc', this.txtJobName))          
    //  }
    // NOTE: Making it a method in sublib so the structure is always the same and this way my 'undo' method can be global as well
    Vue.prototype.Sublib.addChange = function(mTable, mField, mNewValue, mOrig){ 
        // mOrig = Logical. Set to true when 'initialzing'
        return {
            'table': mTable,
            'field': mField,
            'value': mNewValue,
            'orig': mOrig
        }
    } // trackChange


    //**************************************************************************************************************
    // Find the last change / value possible and return that
    Vue.prototype.Sublib.getLastChange = function(oChanges, mTable, mField){
        // Remember, the original values are on top and the newest changes are on the bottom

        var aHold = oChanges.filter(obj => obj.table == mTable && obj.field == mField);
        aHold.reverse();
        if (aHold.length == 0){
            // shouldn't hit this
            return {};
        }

        var oLastChange = aHold[0];
        return oLastChange; //oLastChange.value;

    } // undoChange



    // *********************************************************************************
    // Returns: Object
    // get a ton of info about the device
    Vue.prototype.Sublib.getDeviceInfo = function(mUAString){
        // mUSString = Char. Optional. Parse UA string instead of just going off of browser (mostly for testing)
        
        // iPhone 8 UA Str: 'Mozilla/5.0 (iPhone CPU iPhone OS 13_1_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.1 Mobile/15E148 Safari/604.1'
        // iPhone XR UA Str: 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1.2 Mobile/15E148 Safari/604.1'
        // iPad 6th Gen (ios 12) UA Str: 'Mozilla/5.0 (iPad; CPU OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1 Mobile/15E148 Safari/605.1'
        // iPad 6th Gen (ios 13) UA Str: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Safari/605.1.15' (as of iOS 13, no longer says 'iPad' like it used to. Dumb)
        // Mac UA Str: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Safari/605.1.15'
        
        // iPhone 8 UA Str (Webview): 'Mozilla/5.0(iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
        // iPad 6th Gen (ios 13) UA Str (WebView): 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/605.1.15 (KHTML, like Gecko)'


        // Chrome on Desktop: 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36'
        // Opera on Desktop: 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36 OPR/43.0.2442.1144'
        // Chrome on Android (Nexus 7): 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 7 Build/MOB30X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.132 Safari/537.36'
        // Chrome on Android (Moto G4): 'Mozilla/5.0 (Linux; Android 7.0; Moto G (4) Build/NPJ25.93-14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.132 Mobile Safari/537.36'
        // Chrome on Android (Pixel 3a): 'Mozilla/5.0 (Linux; Android 10; Pixel 3a) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Mobile Safari/537.36'
        // Chrome on Android (LG Thinq7): 'Mozilla/5.0 (Linux; Android 9; LM-G710) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.79 Mobile Safari/537.36'
        // Chrome on Android (Samsung J7): 'Mozilla/5.0 (Linux; Android 7.1.1; SM-J700T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Mobile Safari/537.36'

        //return platform; // imported above
        var oRetVal;
        if (mUAString){
            oRetVal = platform.parse(mUAString);
        } else {
            oRetVal = platform;
        }

        // NOTE: iPad detection no longer works (see https://stackoverflow.com/questions/56578799/tell-ipados-from-macos-on-the-web?noredirect=1&lq=1 and https://stackoverflow.com/questions/57765958/how-to-detect-ipad-and-ipad-os-version-in-ios-13-and-up)
        // Every answer I'm seeing is to see if there is more than 1 touch point (since Macs don't currently support touch screens)
        // Going with that for now. SRR 2019.11.11
        if ((this.contains(oRetVal.description, 'safari', true) || (oRetVal.browser == '' && oRetVal.product == 'Mac')) // in the webview, iPad doesn't register the browser at all and comes through as a Mac
            && !(this.contains(oRetVal.description, 'iphone', true) || this.contains(oRetVal.description, 'ipad', true))
            && navigator.maxTouchPoints > 1){

            // assume iPad registering as Mac
            // orig description: Safari 13.0.3 on OS X 10.15
            // make it match closer to the iPhone: Safari 13.0.1 on Apple iPhone (iOS 13.1.3)
            oRetVal.description = oRetVal.description.substring(0, oRetVal.description.indexOf('on')) + 'on Apple iPad (' + oRetVal.description.substring(oRetVal.description.indexOf('on') + 3) + ')';
            oRetVal.description = oRetVal.description.replace('OS X', 'iOS'); // 'iOS' is how we detect mobile in this.isIOS()
            oRetVal.product = 'iPad';
            oRetVal.manufacturer = 'Apple'

        } else if (!this.contains(oRetVal.description, 'ios', true) && !oRetVal.product){
            // see if I can figure out the product
            // this is all based on the UA string...
            if (this.contains(oRetVal.ua, 'Windows', true)){
                oRetVal.product = 'Windows';
                oRetVal.manufacturer = 'Microsoft';

            } else if (this.contains(oRetVal.ua, 'android', true)){
                var mHold = oRetVal.ua.substring(oRetVal.ua.indexOf('Android')); // strip to 'Android 7.0; Moto G (4) Build/NPJ25.93-14'
                var mHold2 = mHold.substring(mHold.indexOf(';') + 2); // strip to 'Moto G (4) Build/NPJ25.93-14' OR 'Pixel 3a)' or Nexus 7 Build/MOB30X
                var mHold3  = mHold2.substring(0, mHold2.indexOf(')')); // 'Moto G (4' or 'Pixel 3a' or 'Nexus 7 Build/MOB30X'
        
                if (this.contains(mHold3, 'build', true)){
                    // something like: Nexus 7 Build/MOB30X
                    mHold3 = mHold3.substring(0, mHold3.indexOf('Build')); // Nexus 7
                }

                if (this.contains(mHold3, '(') && this.right(mHold3, 1) != ')'){
                    mHold3 += ')'; // Moto G (4 => Moto G (4)
                }
                
                oRetVal.product = mHold3;
                //oRetVal.manufacturer = 'Android'; // may be samsung or something else

            } else if (this.contains(oRetVal.ua, 'macintosh', true)){
                // Mac
                // description something like: Safari 13.0.3 on OS X 10.15
                oRetVal.product = 'Mac';
                oRetVal.manufacturer = 'Apple'

            } else {
                oRetVal.product = 'Unknown';
                oRetVal.manufacturer = 'Unknown';
            }
        }

        // Add in the browser (may have to change layout based on the browser)
        oRetVal.browser = '';
        if (this.contains(oRetVal.name, 'edge', true) || oRetVal.ua.contains('Edg/', true)){
            // chromium edge or legacy edge
            if (oRetVal.layout.toUpperCase() == 'EDGEHTML'){
                oRetVal.browser = 'edgeOld';
            } else {
                // chromium based edge
                oRetVal.browser = 'edge';
            }
            

        } else if (this.contains(oRetVal.name, 'chrome', true)){
            // may be Brave, Chrome, etc., based on chromium
            oRetVal.browser = 'chrome';

        } else if (this.contains(oRetVal.name, 'firefox', true)){
            // Firefox
            oRetVal.browser = 'firefox';

        } else if (this.contains(oRetVal.name, 'opera', true)){
            // Opera
            oRetVal.browser = 'opera';

        } else if (this.contains(oRetVal.name, 'safari', true)){
            // Safari (may be on iPhone, iPad, or Mac)
            oRetVal.browser = 'safari';
        }

        return oRetVal;

    } // getDeviceInfo



    // *********************************************************************************
    // Returns: Date
    // 
    // I've had a bunch of problems with new Date() with iOS when passing in a serialized date
    // Stupid things like iOS error out if you use '-' instead of '/' if you only have the hours / minutes but no seconds
    // or the fact that even though I strip the 'Z' on the string, it still defaults to UTC time and so my days are off. Dumb
    // Got tired of rewriting code so this is one spot that deals with the issues
    // 
    // NOTE: This replaces the built in 'new Date()' in JS
    Vue.prototype.Sublib.newDate = function (mTimeStr, mNoTime){
        // mTimeStr = Char. something like '2019-11-19T16:37:23' or '11/19/2019' (american dates only) or '11/19/2019 07:44 AM'
        // mNoTime = Logical. If true, strips off the time and returns the date with 00:00:00 for the time

        if (typeof mTimeStr == 'undefined'){
            // treat it like new Date() with no params
            //return new Date(); //new Date(1900, 1, 1);
            mTimeStr = this.serializeDt(new Date()); // don't kick out yet so we can strip the time below if needed

        } else if (mTimeStr == null){
            mTimeStr = this.serializeDt(new Date(1900, 0, 1)); // month is 0 based
    
        } else if (this.isNumeric(mTimeStr)) {
            // Date in miliseconds
            mTimeStr = this.serializeDt(new Date(mTimeStr));

        } else if (typeof mTimeStr.getMonth == 'function') {
            // already a date, make it a string
            mTimeStr = this.serializeDt(mTimeStr);
            
        }

        

        if (!this.contains(mTimeStr, 'T', true) && mTimeStr.length == '11/19/2019'.length){
            // date looks like '11/19/2019' (may look like 2019-11-20)
            
            if (this.isNumeric(this.left(mTimeStr, 4))){
                // mTimeStr = 2019-11-20
                mTimeStr += 'T00:00:00';

            } else {
                // mTimeStr = '11/19/2019' or '11-19-2019'
                mTimeStr = this.getYear(mTimeStr) + '-' + this.getMonth(mTimeStr) + '-' + this.getDay(mTimeStr) + 'T00:00:00';
            }
            

        //} else if (this.contains(mTimeStr, 'time', true)){
        } else if (this.contains(mTimeStr, '(', true)){
            // mTimeStr looks like "Wed Nov 20 2019 07:16:40 GMT-0700 (Mountain Standard Time)"
            // on iOS, looks like "Wed Nov 20 2019 06:51:49 GMT-0700 (MST)"
            // just convert ito the format I Want
            mTimeStr = this.serializeDt(new Date(mTimeStr))

        } else if (this.contains(mTimeStr, 'M', true)) { // AM or PM
            // mTimeStr looks like '11/19/2019 07:44 AM'
            // Add on the time zone and it will work (i.e. '11/19/2019 07:44 AM-07:00')
            // Yes this is slightly reduntant but gets me to a 'standard' format for the code below to strip off the time if needed
            
            // Don't need this, serialize date does it right and adding the timezone here causes problems with daylight savings. SRR 11/02/2023
            // if (!this.contains(mTimeStr, 'M-', true)){ 
            //     mTimeStr += this.getTimeZone(false, true);
            // }

            //mTimeStr = this.serializeDt(new Date(mTimeStr));
            mTimeStr = this.serializeDt(mTimeStr); // 11/19/2019 07:44 AM => 2019-11-19T07:44:00

        } else if (mTimeStr.length > 19){
            // mTimeStr looks like '2019-11-22T00:00:00-07:00'
            mTimeStr = this.left(mTimeStr, 19); // strip off the time zone
        }

        if (mNoTime){
            mTimeStr = mTimeStr.substr(0, mTimeStr.toUpperCase().indexOf('T') +1) + '00:00:00';
        }

        mTimeStr = mTimeStr.replace('Z', '');
        mTimeStr += this.getTimeZone(false, true, mTimeStr); // NOTE: If I don't include the time zone (even though I strip the z), iOS converts to UTC so everything is a day before. Dumb

        // NOTE: if you don't include the seconds, safari errors out if the date string looks like '2019-11-19T00:00' but it WORKS if it looks like '2019/11/19T00:00'
        // Crazy. Chrome / firefox seem to support either way
        // Including the seconds seems to fix it.
        // mTimeStr = this.replaceAll(mTimeStr, '-', '/')


        var mRetVal = new Date(mTimeStr);
        if (typeof mRetVal.getMonth != 'function' || mRetVal.getFullYear() < 1900 || Number.isNaN(mRetVal.getFullYear())){
            // see https://stackoverflow.com/questions/643782/how-to-check-whether-an-object-is-a-date
            // Bill @ Custom Concrete had a weird bug where he got back a 12/31/1899 when trying to create a new job. Change it back to our defaults so we know if it's been set or not. SRR 08/17/2022
            // we had a similar issue again with IPads returning a date less than 1900, so putting back the check for it being less than 1900 
            mRetVal = new Date(1900, 0, 1);
        }

        return mRetVal;
    } // newDate



    // *********************************************************************************
    // Hanlde errors thrown by Vue
    // see https://vuejs.org/v2/api/#errorHandler
    Vue.prototype.Sublib.handleError = async function (err, vm, info){
        //console.log(err.stack);
        console.error(err);
        //Vue.rollbar.error(err);

        // NOTE: In the error handling cannot reference 'this', but can reference 'Vue.prototype.Sublib'
        // if ((Vue.prototype.Sublib.contains(location.href, '192.168.10.116') || Vue.prototype.Sublib.contains(location.href, 'localhost'))) {
        // } else {
            // production  
            Vue.prototype.Sublib.logError(err, vm, info);

            var mScreenShot = await Vue.prototype.Sublib.screenShot();

            var mChoice;
            var mErrorMsg = err.toString(); // 'ReferenceError: hold is not defined'

            mChoice = await Vue.prototype.Sublib.mbox('An error has occured, would you like to send support the error info (including a screen shot)?' 
                                                    + '\n\nError: ' + mErrorMsg, 'Send', 'Cancel');
            if (mChoice == 2){
                // clicked cancel
                return;
            }

            if (false) {
                var oCurVer = await Vue.prototype.Sublib.getAppVer();
                var oDevice = Vue.prototype.Sublib.getDeviceInfo();


                // NOTE: Can't get the error to come across clean when I convert it to a string. For now, include the error and see if I can figure out the .vue file it's in. SRR 11.21.2019
                // var aErrorStack = err.stack.split('    ');
                // // full string looks like: at VueComponent._callee$ (webpack-internal:///./node_modules/cache-loader/dist/cjs.js?!./node_modules/babel-loader/lib/index.js!./node_modules/cache-loader/dist/cjs.js?!./node_modules/vue-loader/lib/index.js?!./src/App.vue?vue&type=script&lang=js&:463:15)
                // // get it down to: /src/App.vue?vue&type=script&lang=js&:463:15) (line number may not be accurate!)
                // var mVuePrg = aErrorStack[1].substring(aErrorStack[1].indexOf('/src')); 

                var aErrorStack = err.stack.split('\n'); // works on both Mac and Chrome
                var mVuePrg;
                if (Vue.prototype.Sublib.isIOS() || Vue.prototype.Sublib.isMac()){
                    mVuePrg = aErrorStack[0].substring(0, aErrorStack[0].indexOf('@')); // btnForceErrorClicked@https://localportal.cenpoint.com/js/app.03cc42352.js:1:250395, strip it to btnForceErrorClicked
                } else {
                    mVuePrg = aErrorStack[1].substring(0, aErrorStack[1].indexOf('(')); // btnForceErrorClicked (https://localportal.cenpoint.com/js/app.03cc42352.js:1:250395), strip it to btnForceErrorClicked
                }
                //var mVuePrg = aErrorStack.find(str => str.indexOf('/src') > -1); // something like: VueComponent._callee$ (webpack-internal:///./node_modules/cache-loader/dist/cjs.js?!./node_modules/babel-loader/lib/index.js!./node_modules/cache-loader/dist/cjs.js?!./node_modules/vue-loader/lib/index.js?!./src/App.vue?vue&type=script&lang=js&:463:15)

                mVuePrg += '  @  ' + aErrorStack.find(str => (str.indexOf('chunk') > -1)); // either a chunk.js file or chunk-vendors.js. NOTE: Only has these files in production!

                if (!mVuePrg){
                    // shold never hit this, just don't want to get stuck in an infinite error handler loop
                    mVuePrg = '!UNKNOWN!'
                }
                // It comes through a little different on Chrome and Safari.
                // Strip it down to just what I want
                mVuePrg = mVuePrg.substring(mVuePrg.indexOf('/src')); // "/src/App.vue?vue&type=script&lang=js&:392:15)"

                // The email client looks funny with the &type=script (removes the rest of the message, get rid of it)
                mVuePrg = Vue.prototype.Sublib.replaceAll(mVuePrg, 'vue&type=script&lang=js&', '');
                mVuePrg = Vue.prototype.Sublib.replaceAll(mVuePrg, '\\)', ''); // /src/App.vue?:463:15


                var mTo = 'support@cenpoint.com';
                var mSubject = 'CP Portal Error (version: ' + oCurVer.version + ')'
                var mNL = '\n\r     '; // didn't always work, add in a few spaces too
                var mBody = 'Company: ' + localStorage.getItem('custCode')
                            + mNL + mNL + 'User: ' + localStorage.getItem('userFName') + ' ' + localStorage.getItem('userLName')
                            + mNL + mNL + 'Device: ' + oDevice.description
                            + mNL + mNL + 'Error: ' + mErrorMsg + ' - ' + mVuePrg //aErrorStack[0] + mNL + aErrorStack[1]
                            + mNL + mNL + 'Page:' + location.href
                            + mNL + mNL + 'Info: ' + info

                Vue.prototype.Sublib.email(mTo, mSubject, mBody);
            } // if false


            Vue.prototype.Sublib.toast('Sending error message to support...', 3);

            var mErrorStr = JSON.stringify(err, Object.getOwnPropertyNames(err)); // see https://stackoverflow.com/questions/18391212/is-it-not-possible-to-stringify-an-error-using-json-stringify
            var oError = JSON.parse(mErrorStr);

            var oCurVer = await Vue.prototype.Sublib.getAppVer();
            var oDevice = Vue.prototype.Sublib.getDeviceInfo();

            var oCachedWSResp;
            if (Vue.prototype.Sublib.contains(mErrorStr, 'Error (18) Web Connect Error', true)){
                // Web connect error. send back the pendingWSSave instead as that's most likely what's causing the error (but not gauranteed but for things like numeric overflow can help), not the cachedWSResp
                oCachedWSResp = await Vue.prototype.Sublib.IDB.req('pendingWSSave', 'cursor');
            } else {
                oCachedWSResp = await Vue.prototype.Sublib.IDB.req('cachedWSResp', 'cursor');
            }

            oCachedWSResp.deleteFor(obj => obj.key == 'userSec' || obj.key == 'locale' || obj.key.indexOf('getAllPics') > -1 || obj.key.indexOf('savePhoto') > -1); // don't want to email out the user sec and locale causes problems reparsing

            var mCachesWSRespStr = JSON.stringify(oCachedWSResp);

            // console.log(err.stack.split('\n'));
            // console.log(vm);
            // console.log(info);

            var mTimeStamp = await Vue.prototype.Sublib.getDate(true);
            //var mNotes =  //'CP Portal Error (version: ' + oCurVer.version + ')' // error is in the subject, don't need to duplicate. Also makes it easier to tell apart in outlook fi the company name is the first line
             var mNotes = 'Company: ' + localStorage.getItem('custCode')
                        + '\nUser: ' + localStorage.getItem('userFName').trim() + ' ' + localStorage.getItem('userLName').trim() + ' (' + localStorage.getItem('userId') + ')'
                        + '\nDevice: ' +  oDevice.description
                        + '\nTime: ' + Vue.prototype.Sublib.serializeDt(mTimeStamp)
                        + '\nPage: ' + location.href
                        + '\n'
                        + '\nError: ' + mErrorStr
                        + '\n'
                        + '\nCachedWSResp: ' + mCachesWSRespStr


            var mURL = Vue.prototype.Sublib.getWSUrl() + 'cpError/send2Support'; 
            var oBodyParams = {
                errorNo: 998, // made up
                errorMsg: oError.message,
                notes: mNotes,
                timeStamp: Vue.prototype.Sublib.serializeDt(mTimeStamp),
                screenShot: mScreenShot.substr(mScreenShot.indexOf('base64,') + 7),
                subject:  'CP Portal Error (version: ' + oCurVer.version + ')'
            }

            var resp = await Vue.prototype.Sublib.RestClient.saveData(mURL, {}, oBodyParams, 'errorSend2Support~timeStamp=' + oBodyParams.timeStamp);
            var oData = Vue.prototype.Sublib.wsResp2Obj(resp);
            if (oData.errorMsg){
            }

            Vue.prototype.Sublib.toast('Error message submitted', 4);

        // } // production

    } // handleError


    // *********************************************************************************
    // Send the eror up to the companies database / error log (helps with debugging as we can get to the info if needed)
    // NOTE: Also sends us an email (web service does this)
    Vue.prototype.Sublib.logError = async function (err, vm, info){
        //console.log(err);
        
        var mErrorStr = JSON.stringify(err, Object.getOwnPropertyNames(err)); // see https://stackoverflow.com/questions/18391212/is-it-not-possible-to-stringify-an-error-using-json-stringify
        var oError = JSON.parse(mErrorStr);

        var oCurVer = await Vue.prototype.Sublib.getAppVer();
        var oDevice = Vue.prototype.Sublib.getDeviceInfo();

        // console.log(err.stack.split('\n'));
        // console.log(vm);
        // console.log(info);

        //var mScreenShot = await Vue.prototype.Sublib.screenShot();

        var mTimeStamp = await Vue.prototype.Sublib.getDate(true);
        var mNotes =  'CP Portal Error (version: ' + oCurVer.version + ')'
                    + '\nUser: ' + localStorage.getItem('userFName').trim() + ' ' + localStorage.getItem('userLName').trim() + ' (' + localStorage.getItem('userId') + ')'
                    + '\nDevice: ' +  oDevice.description
                    + '\nError: ' + mErrorStr
                    + '\nPage: ' + location.href
                    + '\nInfo: ' + info


        var mURL = Vue.prototype.Sublib.getWSUrl() + 'cpError/logError'; 
        var oBodyParams = {
            errorNo: 998, // made up
            errorMsg: oError.message,
            notes: mNotes,
            timeStamp: mTimeStamp,
            //screenShot: mScreenShot.substr(mScreenShot.indexOf('base64,') + 7)
        }

        var resp = await Vue.prototype.Sublib.RestClient.saveData(mURL, {}, oBodyParams, 'logError~timeStamp=' + oBodyParams.timeStamp);
        var oData = Vue.prototype.Sublib.wsResp2Obj(resp);
        if (oData.errorMsg){
        }

    } // logError


    // *********************************************************************************
    // Get the current app version (only stored in About.vue)
    Vue.prototype.Sublib.getAppVer = async function(){
        return new Promise(async (resolve, reject) => {
            var mboxInstance = this.Vue.extend(ABOUT); //_Vue.extend(MBOX); // mbox component, imported at top of Sublib
            var domID = 'mbox_' + String(Date.now()) + String(Math.random()); // has to be unique
            var oComponent = new mboxInstance({ 
                propsData: { 
                    autoMode: true,
                    retval: 0,
                }
            }).$mount();

            // now add it to the DOM (destorys itselef)
            var oEl = document.getElementById('app').appendChild(oComponent.$el);
                        
            // NOTE: Since it's not a normal pop window, couldn't get the $watch to work like normal. Set's a global variable instead
            // watch for that
            while(!window.g_oAppVer){
                Vue.prototype.Sublib.sleep(500);
            }

            var oRetVal = window.g_oAppVer;
            window.g_oAppVer = undefined;
            resolve(oRetVal);
        }); // promise
    } // getAppVer


    // *********************************************************************************
    // Get details about a number (i.e. digits before and after decimal)
    // NOTE: This is needed because you can't guarantee 'floating' point math. See https://stackoverflow.com/questions/588004/is-floating-point-math-broken
    // Need this because I can't get an dec really easy (i.e. 2840.3-2840 you get 0.3000000000001819)
    Vue.prototype.Sublib.getNumberParts = function(mNumber){
        // mNumber = Numeric or String. Number to get info for

        var oRetVal = {
            number: Number(mNumber),
            numB4Dec: 0,
            lenB4Dec: 0,

            hasDec: false,
            decLen: 0,
            decNum: 0, // int
            decNumAsDec: 0, // 0.xxx
            decNumStr: '', // the decNum as an int falls apart if it's something like .02 (comes through as 2)
            
            totLen: 0, // decLen + lenB4Dec + 1 (for dec (if applicable))
        }

        mNumber = String(mNumber).trim();

        oRetVal.totLen = mNumber.length;
        if (this.contains(mNumber, '.')){
            oRetVal.hasDec = true;
            oRetVal.decLen = mNumber.length - (mNumber.indexOf('.') + 1);
            oRetVal.lenB4Dec = mNumber.indexOf('.');

            oRetVal.numB4Dec = Number(mNumber.substr(0, oRetVal.lenB4Dec)); // int
            oRetVal.decNum = Number(mNumber.substr(mNumber.indexOf('.') + 1)); // int

            oRetVal.decNumAsDec = Number('.' + mNumber.substr(mNumber.indexOf('.') + 1)); // 0.xxxx

            oRetVal.decNumStr = mNumber.substr(mNumber.indexOf('.') + 1);

        } else {
            oRetVal.decLen = 0;
            oRetVal.numB4Dec = oRetVal.number;
            oRetVal.lenB4Dec = oRetVal.totLen;

        }
        

        return oRetVal;

    } // getNumberParts



    // *********************************************************************************
    // Got tired of coding functions to say something was coming soon on a button. 
    Vue.prototype.Sublib.comingSoonMsg = function(){
        this.mbox('Coming soon');
        return;
    } // comingSoonMsg



    


    // *********************************************************************************
    // Got tired of duplicating this logic everywhere. This is equivalent to empty(VFPDate(mDate)) on the desktop
    Vue.prototype.Sublib.emptyDt = function(mDate2Test){
        // 1900 = SQL Date, 1970 = JS Date
        // NOTE: Do <= 1900 in case there's a 'Z' on the date that doesn't get striped of and it comes back as 1899. SRR 03/02/2020
        return this.newDate(mDate2Test).getFullYear() <= 1900 || this.newDate(mDate2Test).getFullYear() == 1970
    } // emptyDt



    // *********************************************************************************
    // Geo code an address / get some info about it
    Vue.prototype.Sublib.getAddressInfo = async function(mAddr1, mCity, mState){
        var mURL = this.getWSUrl() + 'cpJobs/getDtlAddressInfo';
        var oParams = {
            addr: mAddr1,
            city: mCity,
            state: mState
        }

        var resp = await this.RestClient.getNoCache(mURL, oParams);
        var oData = this.wsResp2Obj(resp);

        return oData;
    } // getAddressInfo



    // *********************************************************************************
    // got tired of putting this in multiple places. SRR 01/15/2020
    Vue.prototype.Sublib.isTestingIP = function(mOnlyDevIps){
        return (!mOnlyDevIps && (this.contains(location.href, 'jamie') || this.contains(location.href, 'max') || this.contains(location.href, 'alphaportal.') || this.contains(location.href, 'localportal.')))
                || this.contains(location.href, '192.168.10.')
                || this.contains(location.href, 'localhost')
                
    } // isTestingIP


    // *********************************************************************************
    // Check to see if we are connected to a production database or a testing one
    // NOTE: This function is also in the webservice, if you make a change here, make it there!
    Vue.prototype.Sublib.isProdDB = function(mDevOnly){
        // m.devOnly = Logical. If .T., treats all DBs EXCEPT dev DBS as production, otherwise, DBs like 'TESTEXT' are counted as non production
        var custCode = this.getConnectInfo('custcode').toUpperCase();
        if (!custCode){
            // haven't signed in yet
            if (this.isTestingIP()){
                return false;
            } else {
                return true;
            }
        }

        var retval = true;

        if (this.inList(custCode, 'TEST', 'TEST2', 'TEST3', 'DEMO', 'MAX')){
            retval = false;

        } else if (!mDevOnly){
            // treat testExt as non production
            if (this.inList(custCode, 'TESTEXT') || this.left(custCode, 2).toUpperCase() == 'CP'){ // i.e. 'CPCutting', etc.
                retval = false;
            }
        }

        return retval;
       
    } // isProdDB()



    // *********************************************************************************
    // See if a user can accept jobs
    // Returns: Object (goodFindTechObj).
    Vue.prototype.Sublib.canUserAcceptJobs = async function(mUserId, mDt, mStartTm, mEndTm, mJobschedId2Ignore, mJobschedId4Training, mSilent){
        // mUserId = Char. User to check for
        // mDt = Date. Date to check
        // mStartTm = Char. MilTime. 
        // mEndTm = Char. Miltime
        // mJobschedId2Ignore = Char. Optional. comma seperated list of jobschedid's to ignore (ie "'000052','000063'" OR "'000063'")
        // mJobschedId4Training = Char. Optional. If passed, does a final check to see if the user has passed a required training tied to the job. SRR 11/21/2019
        // mSilent = Bool. Optional. If true, will not show error messages. MA 03/08/2023

        var oRet = this.goodFindTechObj();
        oRet.selectedNewTech = false;
        oRet.retDate = this.DTOC(mDt);
        oRet.retStartTime = mStartTm;


        var mURL =this.getWSUrl() + 'sublib/canUserAcceptWO';
        var oParams = {
            userId: mUserId,
            date: mDt,
            startTime: mStartTm,
            endTime: mEndTm,
            jobschedId2Ignore: mJobschedId2Ignore,
            jobschedId4Training: mJobschedId4Training,
        }

        var resp = await this.RestClient.getNoCache(mURL, oParams);

        var oData =this.wsResp2Obj(resp);
        if (oData.errorMsg){
            if (this.contains(oData.errorMsg, 'Scheduling Conflict', true) || this.contains(oData.errorMsg, 'already has a job', true) || this.contains(oData.errorMsg, 'not scheduled to accept jobs', true)){

                if(!mSilent){
                    // NOTE: the desktop has a 'find a tech' option. Not currently supporting that... may need to in the future. SRR 01/15/2020
                    var mChoice = await this.mbox(oData.errorMsg, this.getLbl('assign anyway'), this.getLbl('cancel'));
                    if (mChoice == 1){
                        // assign anyways
                        oRet.retStatus = '!SUCCESS!'
    
                    } else {
                        // cancel
                        oRet.retStatus = '!FAILURE!'
                    }
                }else{
                    oRet.retStatus = '!FAILURE!'
                    oRet.retErrorMsg = oData.errorMsg;
                }

            } else {
                this.mbox(oData.errorMsg);
                oRet.retStatus = '!FAILURE!'
            }
        } else {
            // good to go
            oRet.retStatus = '!SUCCESS!'
        }

        return oRet;

    } // canUserAcceptJobs



    // *********************************************************************************
    // See if a user has passed a training
    // NOTE: This is just a wrapper around techPassJobTrain.prg in the web service
    // Returns: Object. Identical to the webserice retval
    Vue.prototype.Sublib.techPassJobTrain = async function(mUserId, mJobsId, mJobschedId, mTaskList, mAddlWorker){
        // m.userId = Char. Userid to check against
        // m.jobsId = Char. Optional (must pass jobschedId or jobsId)
        // m.jobschedId = Char. Optional (must pass jobschedId or jobsId)
        // m.taskList = Char. Optional. Comma seperated lists of tasks to check for specific task certs / trainings. Can already be formatted for sql or not, but must be comma seperated. SRR 10/19/2020	
        // mAddlWorker = Logical. If true, assumes add'l worker since some trainings aren't required for add'ls 

        // var oRet = this.goodFindTechObj();
        // oRet.selectedNewTech = false;
        // oRet.retDate = this.DTOC(mDt);
        // oRet.retStartTime = mStartTm;

        var mURL =this.getWSUrl() + 'sublib/techPassJobTrain_wrapper';
        var oParams = {
            userId: mUserId,
            jobsId: mJobsId,
            jobschedId: mJobschedId,
            taskList: mTaskList,
            addlWorker: mAddlWorker
        }

        var resp = await this.RestClient.getNoCache(mURL, oParams);

        var oData = this.wsResp2Obj(resp);
        if (oData.errorMsg){
            // Crap! shouldn't hit this
            await this.mbox(oData.errorMsg);
            return oData; // just return an object so we're consistent
        }
        
        return oData[0];
    } // techPassJobTrain


    // *********************************************************************************
    // This is copied from the desktop. May not use all the fields...
    Vue.prototype.Sublib.goodFindTechObj = function(){
        return {
            userId: '',
            date: this.newDate('01/01/1900'), 
            toDate: this.newDate('01/01/1900'), 
            startTime: '',
            endTime: '',
            hours: 0,
            branchesId: '',
            retUserId: '',
            retDate: '',
            retStartTime: '',
            retStatus: '!FAILURE!',
            selectedNewTech: false,
            techSched2Work: false,
            numberOfJobConflicts: 0,
            retErrorMsg: '',
        }
    } // goodFindTechObj



    



     // *********************************************************************************
     // Had several requests that when the COD amt is 0.00 that instead of the dollar amount we show a 'call office' label instead
     // This is one common place to take care of it so if it ever changes I'm not chaning it in a bunch of spots
     Vue.prototype.Sublib.formatCOD = function(mCODAmt, mNoCODLbl){
         // mCODAmt = Numeric. COD dollar amt
         // mNoCODLbl = Logical. If true, excludes the 'COD' precursor on the lbl    

        var mRetVal;
        if (mNoCODLbl){
            mRetVal = '';
        } else {
            mRetVal = 'COD';
        }
        
        mCODAmt = Number(mCODAmt);
        if (mCODAmt == 0){
            mRetVal += ' ' + this.getLbl('call office');
        } else {
            mRetVal += ' ' + this.formatCurrency(mCODAmt);
        }
                                        
        return mRetVal.trim();

     } // formatCOD



     // *********************************************************************************
     // Figure out labels based on locale.
     Vue.prototype.Sublib.getLocaleVal = function(mCode){
        // mCode = Char. A value found in locale.source field

        // Rmemeber, the webservice only returns back two columns from the locale table, 'source' and 'value'
        // It looks up the country code for the users default branch and then only returns that for simplicity.

        this.refreshLocale(); // async, don't wait for it

        var oLocale = JSON.parse(localStorage.getItem('oLocale'));
        if (!oLocale){
            return '';
        }

        mCode = mCode.toUpperCase();
        var oHold = oLocale.find(obj => obj.source.toUpperCase() == mCode);
        if (!oHold){
            this.refreshLocale(true);
            return '';
        }

        return oHold.value;
        
     } // getLocaleVal



     // *********************************************************************************
     // NOTE: this is a seperate method so that getLocaleVal can be synchronous
     Vue.prototype.Sublib.refreshLocale = async function(mForceFresh){
        // mForceFresh = Logical. If true, gets the locale from the server no matter what

        if (!this.getConnectInfo('token')){
            // not signed in (i.e. the sign up page)
            // nothing to do. 
            return; //SRR 07/19/2022
        }

        // refresh once a day
        var mLastGet = localStorage.getItem('localeDt');
        var mNeed2Get = false;

        if (mForceFresh){
            mNeed2Get = true;

        } else {
            if (!mLastGet){
                mNeed2Get = true;
            } else if (this.daysBetween(mLastGet, await this.getDate(true)) > 0){
                mNeed2Get = true;
            }
        }
        
        if (!mNeed2Get){
            return;
        }

        var mURL =this.getWSUrl() + 'cpGetUsers/getLocale';
        var resp = await this.RestClient.get(mURL, false, 'locale');

        var oData =this.wsResp2Obj(resp);
        if (oData.errorMsg){
            this.mbox(oData.errorMsg);
            return false;
        }

        var mNow = await this.getDate(true);

        localStorage.setItem('oLocale', JSON.stringify(oData));
        localStorage.setItem('localeDt', mNow);

     } // refreshLocale



    


    
    // *********************************************************************************
    // Convert a quote to a job. This can be called from either the findquote or the jobquote screen
    // Returns: Char. Either the jobsid of the newly converted job, or '' if it failed
    Vue.prototype.Sublib.convQt2Job = async function(mQuoteId){
        // mQuoteId = Char. QuoteId to convert to a job

        var mChoice = await this.mbox(this.getLbl('confirm convert quote'), this.getLbl('convert'), this.getLbl('cancel'));
        if (mChoice == 2){
            // cancel
            return '';
        }

        // the web service does the actual converting. Send it off
        var mURL = this.getWSUrl() + 'cpQuote/convQt2Job';
        var oParams = {
            quoteId: mQuoteId
        }

        var resp = await this.RestClient.getNoCache(mURL, oParams);
        
        var oData = this.wsResp2Obj(resp);
        if (oData.errorMsg){
            if (this.contains(oData.errorMsg, 'blacklisted', true)){
                // customer is blacklisted, can't do anything
                this.mbox('<img src="img/blacklisted.png" />' 
                                + '\n'
                                + '\n' + oData.errorMsg);

            } else {
                this.mbox(oData.errorMsg);
            }

            return '';
        }

        return oData[0].jobsid;

    } // convertQuote2Job


    // *********************************************************************************
    // Convert a quote to an NSI. This can be called from either the findquote or the jobquote screen
    // Returns: Char. Either the invoiceid of the newly converted invoice, or '' if it failed
    Vue.prototype.Sublib.convQt2NSI = async function(mQuoteId){
        // mQuoteId = Char. QuoteId to convert to a job

        var mChoice = await this.mbox(this.getLbl('confirm convert quote nsi'), this.getLbl('convert'), this.getLbl('cancel'));
        if (mChoice == 2){
            // cancel
            return '';
        }

        // the web service does the actual converting. Send it off
        var mURL = this.getWSUrl() + 'cpQuote/convQt2NSI';
        var oParams = {
            quoteId: mQuoteId
        }

        var resp = await this.RestClient.getNoCache(mURL, oParams);
        
        var oData = this.wsResp2Obj(resp);
        var mInvoiceId;
        if (oData.errorMsg){
            if (oData.invoiceid){
                // already converted but somehow got through, just roll with it
                mInvoiceId = oData.invoiceid;

            } else {
                if (this.contains(oData.errorMsg, 'blacklisted', true)){
                    // customer is blacklisted, can't do anything
                    this.mbox('<img src="img/blacklisted.png" />' 
                                    + '\n'
                                    + '\n' + oData.errorMsg);

                } else {
                    this.mbox(oData.errorMsg);
                }

                return '';
            }
        } else {
            mInvoiceId = oData[0].invoiceid;
        }

         

        // Putting this here instead of on calling method so it's only in 1 place. SRR 06/06/2023
        var oMenu = [
            { desc: this.getLbl('email - pdf'), code: "EmailPDFInv", icon: '' },
            { isDivider: true },

            { desc: this.getLbl('email - link'), code: "EmailLinkInv", icon: ''},
            { isDivider: true },

            { desc: this.getLbl('email - link pdf'), code: "EmailLinkPDFInv", icon: ''},
            { isDivider: true },

            { desc: this.getLbl('text - link'), code: "TextInv", icon: ''},
            { isDivider: true },
        ];

        var mChoice = await this.showMenu(oMenu);
        mChoice = mChoice.toUpperCase();
        if (!mChoice){
            return mInvoiceId;
        }


        // Now send out the invoices
        var emailExtraText, mBuildersId;
        var oQuickTo, mSubject, mBody, mGoOn;

        // Get The customer name / invoice $ amount
        // Used on both the email and send link forms
        emailExtraText = this.getLbl('customer') + ': ' + oData[0].bldrname
                        + '\n' + this.getLbl('job') + ': ' + this.getLbl('none')
                        + '\n' + this.getLbl('inv amt') + ': ' + this.formatCurrency(oData[0].invamt);



        mSubject = this.getLbl('invoice') + ' ' + this.trimZeros(mInvoiceId, 5);
        mBody = '';

        mBuildersId = oData[0].buildersid;

        if (mChoice == 'EMAILPDFINV'){
            // Email Invoice Only. 
            mURL = this.getWSUrl() + 'cpInvoice/prtInv';
            oParams = {
                invoiceid: mInvoiceId,
                retPath: true
            }

            resp = await this.RestClient.getNoCache(mURL, oParams);
            oData = this.wsResp2Obj(resp);
            if (oData.errorMsg){
                this.mbox(oData.errorMsg);
                //this.showLoadingCreateInv = false;
                return;
            }

            // First, figure out what number to send it to
            oQuickTo = await this.popQuickTo('invoice', mBuildersId, '', mInvoiceId, '', '', 'EMAIL');
            mGoOn = await this.email(oData[0].downloadpath, mSubject, mBody, '', oQuickTo, emailExtraText);

        } else if (this.contains(mChoice, 'EMAILLINK')){
            // Email a link to the invoice
            await this.sendCustInvLink(mInvoiceId, mBuildersId, true, this.contains(mChoice, 'INVFT'), emailExtraText, this.contains(mChoice, 'LINKPDF'));
            
        } else if (this.contains(mChoice, 'TEXT')){
            // Text a link to the invoice
            await this.sendCustInvLink(mInvoiceId, mBuildersId, false, this.contains(mChoice, 'INVFT'), emailExtraText);      
        } 


        return mInvoiceId

    } // convertQuote2NSI


    // *********************************************************************************
    // Make it so the user can zoom in on the app temporarily (i.e. to zoom in on a full size picture)
    Vue.prototype.Sublib.turnZoomOnOff = function(mTurnOnOff){
        // mTurnOnOff = Char. either 'ON' or 'OFF', defaults to 'OFF' if not passed

        if (!mTurnOnOff){
            mTurnOnOff = 'OFF';
        }
        mTurnOnOff = mTurnOnOff.toUpperCase();

        // Our meta tags prevent zooming on the app by default.
        var oViewPort =  document.querySelector("meta[name=viewport]");
        var mOrigContent = oViewPort.content;
        var mNewContent, mMaxScale = '10.0'; // max of 10.0 (between 1.0 and 10.0)
        
        if (mTurnOnOff == 'ON'){
            // make it zoomable
            //<meta name="viewport" content="width=device-width,initial-scale=1.0,shrink-to-fit=no,maximum-scale=1.0, user-scalable=no">
            mNewContent = mOrigContent.replace('maximum-scale=1,', 'maximum-scale=' + mMaxScale + ',') // may not have the .0, have to include the ',' so it doesn't replace it twice
                                        .replace('maximum-scale=1.0,', 'maximum-scale=' + mMaxScale + ',')
                                        .replace('user-scalable=no', 'user-scalable=yes');
        } else {
            // make it non-zoomable
            //<meta name="viewport" content="width=device-width,initial-scale=1.0,shrink-to-fit=no,maximum-scale=1.0, user-scalable=no">
            mNewContent = mOrigContent.replace('maximum-scale=' + mMaxScale, 'maximum-scale=1.0')
                                      .replace('user-scalable=yes', 'user-scalable=no');
        }

        oViewPort.content = mNewContent;

    } // turnZoomOnOff


    
    // *********************************************************************************
    // Simple way to show menu
    Vue.prototype.Sublib.showMenu = function(MenuOptions, mParam1Name, mParam1Val, mParam2Name, mParam2Val,  mParam3Name, mParam3Val, mParam4Name, mParam4Val, mParam5Name, mParam5Val){
        return new Promise(async (resolve, reject) => {
            // I'm combining a bunch of stuff to make this work.

            // First, create the vue component
            var domID = 'menu_' + String(Date.now()) + String(Math.random()); // has to be unique
            var oProps = {
                menuOptions: MenuOptions,
                isSubMenu: false,   //the first menu is not subMenu, so I set it to false
                isParentMenu: true, //the first menu is parent menu, so I set it to true, since isSubMenu can be the child of parent menu that does not have a parent menu
                isOffsetY: true,
                retval: null, // null so emptry string is valid retval
                mBoxBtnId: domID,
            }

            if (mParam1Name){
                oProps[mParam1Name] = mParam1Val
            }
            if (mParam2Name){
                oProps[mParam2Name] = mParam2Val;
            }
            if (mParam3Name){
                oProps[mParam3Name] = mParam3Val;
            }
            if (mParam4Name){
                oProps[mParam4Name] = mParam4Val;
            }
            if (mParam5Name){
                oProps[mParam5Name] = mParam5Val;
            }

            var mShowMenuInstance = this.Vue.extend(Menu); // imported at top of Sublib

            var oComponent = new mShowMenuInstance({ 
                propsData: oProps
            }).$mount();



            // now add it to the DOM
            var oEl = document.getElementById('app').appendChild(oComponent.$el);
            
            // NOTE: couldn't get it to work without adding a 'button' to activate it
            // progrmatically click it and make the button invisible
            // document.getElementById('mbox_btn_launch').click();
            //var oLuanchBtn = document.getElementById('mbox_btn_launch');
            var oLuanchBtn = document.getElementById(domID);

            // oLuanchBtn.style.position = 'absolute';
            // oLuanchBtn.style.left = window.mouseX + 'px';
            // oLuanchBtn.style.top = window.mouseY + 'px';

            oLuanchBtn.style.display = 'none';
            oLuanchBtn.click();
            
            // Add a listener so we can get the value and return it
            oComponent.$watch('retval', function(newVal, oldVal){
                // this is triggered when they chose an option
                // Delete the component / element now that I'm done
                oEl.remove();
                resolve(newVal.code);
            });

            

        }); // promise
    } // showMenu

    // *********************************************************************************
    // Get the width of a text string (in pixels)
    // see https://graphicdesign.stackexchange.com/questions/106427/pixel-width-of-characters-in-a-font
    // and https://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
    Vue.prototype.Sublib.getTextWidth = function(text, font){
        // re-use canvas object for better performance
        var canvas = this.getTextWidth.canvas || (this.getTextWidth.canvas = document.createElement("canvas"));
        var context = canvas.getContext("2d");
        context.font = font;
        var metrics = context.measureText(text);
        return metrics.width;
        
    } // getTextWidth



    // *********************************************************************************
    // Take a screet shot for the error log
    // 
    // Returns: Base64 String
    Vue.prototype.Sublib.screenShot = async function(hideBottomBar, htmlElement){
        // hideBottomBar = Logical. If true, hides the bottom bar before taking the screen shot
        // htmlElement = Char. Optional. If passed, takes a screen shot of that element instead of the whole screen

        if (!htmlElement){
            htmlElement = document.body;
        }

        // Make the botom bar see through (don't completely hide it as I want to see what their screen was actually showing)
        // But need to be able to see through it for any thing that might be relevant. SRR 12/14/2023
        let oBottomBar = document.getElementById('appBottomBar');
        if (oBottomBar){
            if (hideBottomBar){
                oBottomBar.style.display = 'none';
            } else {
                // just make it see fairly see through but can still tell if they are clocked in or not, etc. 
                oBottomBar.style.opacity = '0.3';
            }
            await this.sleep(.1*1000); // give it a second to hide
        }

        //return await this.screenShot_html2canvas();
        //return 
        let retval = await this.screenShot_domtoimage(htmlElement);

        // Put the bottom bar back
        if (oBottomBar){
            if (hideBottomBar){
                oBottomBar.style.display = '';
            } else {
                oBottomBar.style.opacity = '';
            }
        }

        return retval;

    } // screenShot


    // *********************************************************************************
    // Take a screet shot for the error log
    // 
    // Returns: Base64 String
    Vue.prototype.Sublib.screenShot_html2canvas = async function(htmlElement){
        // htmlElement = Char. Html Element to take screen shot of. Usually document.body

        if (!htmlElement)
            htmlElement = document.body;

        //var oCanvas = await html2canvas(document.body);
        var oCanvas = await html2canvas(htmlElement);

        var mBase64Raw = oCanvas.toDataURL("image/png");
        //var mBase64Str = mBase64Raw.substr(mBase64Raw.indexOf('base64,') + 'base64,'.length)
        //this.downloadFile(mBase64Str, 'testScreenShot.png');

        return mBase64Raw; // 'data:image/png;base64,iVBORw0KGgoA.......'
    }, // screenShot_html2canvas


     // *********************************************************************************
    // Take a screet shot for the error log
    // 
    // Returns: Base64 String
    Vue.prototype.Sublib.screenShot_domtoimage = async function(htmlElement){
        // htmlElement = Char. Html Element to take screen shot of. Usually document.body

        if (!htmlElement)
            htmlElement = document.body;

        var mBase64Raw = ''
        
        try {
            //mBase64Raw = await domtoimage.toPng(document.body);
            mBase64Raw = await domtoimage.toPng(htmlElement);
        } catch (oError){
            console.error('oops, something went wrong!', oError);
        }
        // mBase64Raw = domtoimage.toPng(document.body)
        // .then(function (dataUrl) {
        //     return dataUrl;
        // })
        // .catch(function (error) {
        //     console.error('oops, something went wrong!', error);
        // });

        return mBase64Raw; // 'data:image/png;base64,iVBORw0KGgoA.......'
    } // screenShot


    // *********************************************************************************
    Vue.prototype.Sublib.inLiteMode = function() {
        var lightMode = localStorage.getItem('liteMode');
        return this.convFromStr(lightMode);
    } // inLiteMode



    Vue.prototype.Sublib.getVersionOptions = function(){
        // NOTE: These labels are also in cpSignUp.sendWelcomeEmail
        return [
            { text: 'Free', value: '!FREE!'},
            { text: 'Lite', value: '!LITE!'},
            { text: 'Pro', value: '!FULL!'},
        ]
    } // getVersionOptions


    // *********************************************************************************
    // Figure out what 'version' of the app they have access to
    Vue.prototype.Sublib.getVersionType = function() {
        var mMode = localStorage.getItem('versionType');

        if (!mMode){
            // default to full until we actually rull this out so we don't block people from what they need. SRR 01/29/2021
            mMode = '!FULL!'; // default to free after we roll this out and everyone has it set. 
            this.refreshVersionType();

        } else {
            try {
                var oMode = JSON.parse(mMode);
                mMode = oMode.versiontype;

                // since this method is not async, just use the browsers date / time instead of this.getDate();
                if (!oMode.datadt || Math.abs(this.daysBetween(new Date(), oMode.datadt)) > 0){
                    // get it once a day
                    this.refreshVersionType();
                }

            } catch(ignore){
                mMode = '!FREE!'
                this.refreshVersionType();
            }
            
        }

        

        if (!this.inList(mMode, ['!FREE!', '!LITE!', '!FULL!'])){
            mMode = '!FREE!'
        }

        return mMode;
    } // getVersionType


    // *********************************************************************************
    // Figure out if they are expired or not
    Vue.prototype.Sublib.getVersionMode = function() {
        var mMode = localStorage.getItem('versionType');

        if (!mMode){
            // default to full until we actually rull this out so we don't block people from what they need. SRR 01/29/2021
            mMode = 'LICENSED'; // default to free after we roll this out and everyone has it set. 
            this.refreshVersionType();

        } else {
            try {
                var oMode = JSON.parse(mMode);
                mMode = oMode.mode;

                // since this method is not async, just use the browsers date / time instead of this.getDate();
                if (!oMode.datadt || Math.abs(this.daysBetween(new Date(), oMode.datadt)) > 0){
                    // get it once a day
                    this.refreshVersionType();
                }

            } catch(ignore){
                mMode = 'LICENSED'
                this.refreshVersionType();
            }
            
        }

        

        if (!this.inList(mMode, ['LICENSED', 'EXPIRED'])){
            mMode = 'EXPIRED'
        }

        return mMode;
    } // getVersionType


    // *********************************************************************************
    // Figure out what 'version' of the app they have access to
    // Query the webservice and store it out
    // Note: tThis now also returns modules that are activated. SRR 06/27/2023
    Vue.prototype.Sublib.refreshVersionType = async function() {
        if (!this.getConnectInfo('token')){
            // not signed in yet
            return;
        }
        
        var mURL =this.getWSUrl() + 'cpGetUsers/getVersionType';
        var oParams = {};

        var resp = await this.RestClient.getNoCache(mURL, oParams);
        var oData = this.wsResp2Obj(resp);

        if (oData.errorMsg){
            this.mbox(oData.errorMsg);
            return;
        }

        localStorage.setItem('versionType', JSON.stringify(oData[0]));
        localStorage.setItem('licModules', JSON.stringify(this.wsResp2Obj(resp, 2)));
        return;

    } // getModeVersion


    // *********************************************************************************
    // Temporarily alter the license stuff to force CP Books. 
    // NOTE: ONLY works if a testing IP
    //
    // Returns: Logical. true if it did it, otherwise false (so I know if I try to run it on a production box)
    Vue.prototype.Sublib.forceCPBooks = function() {
        if (!this.isTestingIP()){
            return false;
        }

        let licModules = localStorage.getItem('licModules');
        if (!licModules){
            return false;
        }

        let oMods = JSON.parse(licModules);
        oMods.replaceFor({ module10: true}, true);

        localStorage.setItem('licModules', JSON.stringify(oMods));

        return true;
    }, // forceCPBooks


    // *********************************************************************************
    // Figure out what 'version' of the app they have access to
    Vue.prototype.Sublib.hasCPAccounting = function(branchesId) {
        // branchesId = Char. Optional. Checking to see if this specific branch has the accounting turned on. 
        //              If not passed, just checks to if any branch has it turned on

        if (this.isTestingIP(true)){
            return true; // may take out in the future but for now, force to true
        }

        let licModules = localStorage.getItem('licModules');
        if (!licModules){
            this.refreshVersionType();
            return false;
        }

        let oMods = JSON.parse(licModules);
        //let userBranch = localStorage.getItem('userBranchesId');
        let retval;
        if (branchesId){
            let oLic = oMods.find(obj => obj.branchesid == branchesId);
            if (!oLic){
                // shouldn't really hit this.
                retval = false;
            } else {
                retval = oLic.module10; // 10 = CP Accounting
            }
        } else {
            let oLic = oMods.find(obj => obj.active && obj.module10 && obj.status != 'DEMO');
            if (oLic) {
                retval = true;
            } else {
                retval = false;
            }
            
        }

        return retval;
        

    } // hasCPAccounting




    // *********************************************************************************
    // Apply a payment against an invoice or invoices
    // Returns: Logical. true if it worked, false if it failed (displays it's own error messages)
    Vue.prototype.Sublib.applyPmt = async function(mType, mPmtDt, aInvs, mNotes, mAddURLAuth, 
                                                    mCCLast4, mRefNo, mAmt2Sur, mAdjReas, 
                                                    mBuildersId, mBranchesId, mSurType, mSurTypeId, 
                                                    mCCPreAutId, mFeeAmt, mFeeTaxAmt, mFeeTotAmt, 
                                                    oFTTasks){

        // mType = Char. type of pmt, either 'CA' (cash), 'CC' (credit card), 'CK' (check), 'OT' (other), 'AJ' (adjustment)
        // mPmtDt = Date. Date for the payment
        // aInvs = Array of objects [{invoiceid: '123', amount: 4110.99}, {invoiceid: '456', amount: 53.49}]
        // addURLAuth = Logical. If true, adds a param to let it through authentication via the customer portal (i.e. customer made the payment)
        // mCCLast4 = Char. Optional. Last 4 of the CC charged
        // mRefNo = Char. Optional.
        // mAmt2Sur = Numeric. Optional. Amount to surplus
        // mAdjReas = Char. Optional Adj Cat id for the adjustment. 
        // mBuildersId = Char. Optional. Req IF only making a payment to surplus (no invoices)
        // mBranchesId = Char. Optional. Req IF only making a payment to surplus (no invoices)
        // mSurType = Char. Optional. i.e. 'FT' for a surplus payment paying a COD FT (no invoice created yet so all goes to surplus)
        // mSurTypeId = Char. Optional. i.e. FT id for a surplus payment paying a COD FT (no invoice created yet so all goes to surplus)
        // mCCPreAutId = Char. Optional. i.e. we used a pre-authorized CC to make the payment, need to update the ccPreAut table
        // mFeeAmt = Numeric. Optional. Currently only used with a COD payment that goes to surplus so we can store out the fee to apply the invoice later on. SRR 10/12/2021
        // mFeeTaxAmt = Numeric. Optional. Currently only used with a COD payment that goes to surplus so we can store out the fee to apply the invoice later on. SRR 10/12/2021
        // mFeeTotAmt = Numeric. Optional. FeeAmt + TaxAmt, Currently only used with a COD payment that goes to surplus so we can store out the fee to apply the invoice later on. SRR 10/12/2021
        // oFTTasks =  Array of FtTasks to apply adjustment MA 08/22/2023

        if (!mType || this.emptyDt(mPmtDt) || ((!aInvs || !aInvs.length) && !mAmt2Sur)){
            return JSON.stringify({ errorDesc: 'Invalid params' });
        }

        if (!mNotes){
            mNotes = '';
        }
        if (!mCCLast4){
            mCCLast4 = '';
        }
        if (!mAdjReas){
            mAdjReas = '';
        }
        if (!mBuildersId){
            mBuildersId = '';
        }
        if (!mBranchesId){
            mBranchesId = '';
        }
        if (!mSurType){
            mSurType = '';
        }
        if (!mSurTypeId){
            mSurTypeId = '';
        }
        if (!mCCPreAutId){
            mCCPreAutId = '';
        }
        if (!mFeeAmt){
            mFeeAmt = 0.00;
        }
        if (!mFeeTaxAmt){
            mFeeTaxAmt = 0.00
        }
        if (!mFeeTotAmt){
            mFeeTotAmt = mFeeAmt + mFeeTaxAmt;
        }

        

        var mURL =this.getWSUrl() + 'cpPayments/applyPmt';
        var oParams = {};

        var oBodyParams = {
            type: mType,
            pmtDt: this.serializeDt(mPmtDt),
            pmtDtl: JSON.stringify(aInvs),
            fttasks: (oFTTasks && oFTTasks.length > 0 ? JSON.stringify(oFTTasks) : ''),
            pmtNotes: mNotes,
            last4: mCCLast4,
            refNo: mRefNo,

            surplus: mAmt2Sur,
            surplusType: mSurType,
            surplusTypeId: mSurTypeId,
            feeAmt: mFeeAmt, //  Fee Amt
            feeTax: mFeeTaxAmt, // Tax Amount included in 
            feeTotAmt: mFeeTotAmt, // Fee Amt + Tax Amt
            
            adjReas: mAdjReas,
            branchesId: mBranchesId,
            buildersId: mBuildersId,

            ccPreAutId: mCCPreAutId,

        }

        if (mAddURLAuth){
            oParams.url = location.href;
        }

        var resp = await this.RestClient.postNoCache(mURL, oParams, oBodyParams);

        return resp;

        // var oData =this.wsResp2Obj(resp);
        // if (oData.errorMsg){
        //     this.mbox(oData.errorMsg);
        //     return false;
        // }

        // return true;

    } // applyPmt


    // *********************************************************************************
    // Apply a payment against a vendor invoice(s) (copied / tweaked from applyPmt)
    // Returns: Logical. true if it worked, false if it failed (displays it's own error messages)
    Vue.prototype.Sublib.applyExpense = async function(bankGLCode, mType, mPmtDt, aInvs, mNotes, mAddURLAuth, 
                                                        need2Print, mRefNo, mAmt2Sur, mAdjReas, 
                                                        mVendorId, mBranchesId, mSurType, mSurTypeId, 
                                                        mCCPreAutId, mFeeAmt, mFeeTaxAmt, mFeeTotAmt, 
                                                        oFTTasks){

        // bankGLCode = Char. GL Code for the bank account the money is coming out off (may be a credit card in the future... ). SRR 10/04/2023
        // mType = Char. type of pmt, either 'CA' (cash), 'CC' (credit card), 'CK' (check), 'OT' (other), 'AJ' (adjustment)
        // mPmtDt = Date. Date for the payment
        // aInvs = Array of objects [{invoiceid: '123', amount: 4110.99}, {invoiceid: '456', amount: 53.49}]
        // addURLAuth = Logical. If true, adds a param to let it through authentication via the customer portal (i.e. customer made the payment)
        // need2Print = Logical. If true, mType needs to be 'CK' and it will queue it up to print later
        // mRefNo = Char. Optional.
        // mAmt2Sur = Numeric. Optional. Amount to surplus
        // mAdjReas = Char. Optional Adj Cat id for the adjustment. 
        // mVendorId = Char. Optional. Req IF only making a payment to surplus (no invoices)
        // mBranchesId = Char. Optional. Req IF only making a payment to surplus (no invoices)
        // mSurType = Char. Optional. i.e. 'FT' for a surplus payment paying a COD FT (no invoice created yet so all goes to surplus)
        // mSurTypeId = Char. Optional. i.e. FT id for a surplus payment paying a COD FT (no invoice created yet so all goes to surplus)
        // mCCPreAutId = Char. Optional. i.e. we used a pre-authorized CC to make the payment, need to update the ccPreAut table
        // mFeeAmt = Numeric. Optional. Currently only used with a COD payment that goes to surplus so we can store out the fee to apply the invoice later on. SRR 10/12/2021
        // mFeeTaxAmt = Numeric. Optional. Currently only used with a COD payment that goes to surplus so we can store out the fee to apply the invoice later on. SRR 10/12/2021
        // mFeeTotAmt = Numeric. Optional. FeeAmt + TaxAmt, Currently only used with a COD payment that goes to surplus so we can store out the fee to apply the invoice later on. SRR 10/12/2021
        // oFTTasks =  Array of FtTasks to apply adjustment MA 08/22/2023

        if ((!bankGLCode && mType != 'AJ') || !mType || this.emptyDt(mPmtDt) || ((!aInvs || !aInvs.length) && !mAmt2Sur)){
            return JSON.stringify({ errorDesc: 'Invalid params' });
        }

        if (!mNotes){
            mNotes = '';
        }
        if (!need2Print){
            need2Print = false;
        }
        if (!mAdjReas){
            mAdjReas = '';
        }
        if (!mVendorId){
            mVendorId = '';
        }
        if (!mBranchesId){
            mBranchesId = '';
        }
        if (!mSurType){
            mSurType = '';
        }
        if (!mSurTypeId){
            mSurTypeId = '';
        }
        if (!mCCPreAutId){
            mCCPreAutId = '';
        }
        if (!mFeeAmt){
            mFeeAmt = 0.00;
        }
        if (!mFeeTaxAmt){
            mFeeTaxAmt = 0.00
        }
        if (!mFeeTotAmt){
            mFeeTotAmt = mFeeAmt + mFeeTaxAmt;
        }





        var mURL =this.getWSUrl() + 'expense/applyPmt';
        var oParams = {};

        var oBodyParams = {
            paySrcGL: bankGLCode,
            type: mType,
            pmtDt: this.serializeDt(mPmtDt),
            pmtDtl: JSON.stringify(aInvs),
            //fttasks: (oFTTasks && oFTTasks.length > 0 ? JSON.stringify(oFTTasks) : ''),
            pmtNotes: mNotes,
            need2Print: need2Print,
            refNo: mRefNo,

            surplus: mAmt2Sur,
            surplusType: mSurType,
            surplusTypeId: mSurTypeId,
            feeAmt: mFeeAmt, //  Fee Amt
            feeTax: mFeeTaxAmt, // Tax Amount included in 
            feeTotAmt: mFeeTotAmt, // Fee Amt + Tax Amt

            adjReas: mAdjReas,
            branchesId: mBranchesId,
            vendorId: mVendorId,

            ccPreAutId: mCCPreAutId,

        }

        if (mAddURLAuth){
            oParams.url = location.href;
        }

        var resp = await this.RestClient.postNoCache(mURL, oParams, oBodyParams);

        return resp;

        // var oData =this.wsResp2Obj(resp);
        // if (oData.errorMsg){
        //     this.mbox(oData.errorMsg);
        //     return false;
        // }

        // return true;

    } // applyExpense


    // *********************************************************************************
    // Sign the user out. 
    // Moved from SignOut.vue so I can call from the restClient when we hit invalid credentials randomly
    Vue.prototype.Sublib.signOut = async function(mNoPageChange){
        // mNoPageChange = Logical. If true, signs them out but doesn't change the URL (i.e. called from this.checkSignIn())

        //clear out push token from localstorage and webservice as well
        await this.deleteFBMToken();
          
        //clear out push type 
        localStorage.setItem('pushType', '')
 
        localStorage.setItem('token', '');
        localStorage.setItem('userId', '');
        localStorage.setItem('userType', '');
        localStorage.setItem('userFName', '');
        localStorage.setItem('userLName', '');
        
        EventBus.$emit('updtUserAvatar');

        for (var key in localStorage){
            if (this.inList(key, 'custCode', 'baseServerURL', 'prefServerOrder', 'curServer', 'showQuickStart', 'appTheme', true)){
                continue;
            }
            localStorage.removeItem(key);
        }


        // now wipe out the indexedDB recs
        for (var mx = 0; mx < this.IDB.aDBList.length; mx++){
            for (var my = 0; my < this.IDB.aDBList[mx].aTables.length; my++){
                await this.IDB.req(this.IDB.aDBList[mx].aTables[my], 'deleteall', false, false, this.IDB.aDBList[mx].db);
            } // for (aTables)
        } // for (aDBList)

        // wipe out session storage as well. SRR 03/09/2023
        sessionStorage.clear();


        this.updtTimeStatus();
        this.toast(this.getLbl("sign out success"));

        if (!mNoPageChange){
            //this.$router.replace('/'); // go to the home screen
            // can't access $router here.
            // Since I'm just going to the home screen, I can use the built in stuff pretty easy. SRR 08/21/2020
            location.href = location.origin; // 'https://portal.cenpoint.com'
        }

        return '';
    } // signOut
    

    




    // *********************************************************************************
    // This is the portal version of getPricingDec.prg on the VFP side 
    // This will return back the number of decimal points that they use for pricing.
    // NOTE: This is syncronous so it's easier to use but techinically can make async calls to get a fresh value from the server 
    // 
    // Returns: Numeric
    Vue.prototype.Sublib.getPricingDec = function(mBranchesId){
        // mBranchesId = Char. Optional. If not passed, uses the users default branch

        if (!mBranchesId){
            mBranchesId = localStorage.getItem('userBranchesId'); // use the users default
        }

        var mHold = localStorage.getItem('pricingDec');

        var mForceUpdt = false;
        if (!mHold){
            mForceUpdt = true;
        }

        var mRetVal;
        var aBranchDec = this.wsResp2Obj(mHold);
        if (aBranchDec.errorMsg){
            // shouldn't ever really hit this
            mForceUpdt = true;
            mRetVal = 2; // backwards compatible

        } else {
            if (this.daysBetween(aBranchDec[0].datadt, new Date()) != 0){
                mForceUpdt = true; // it's been over a day, go look it up again
            }

            var oHold = aBranchDec.find(obj => obj.branchesid == mBranchesId);
            if (oHold){
                // found it
                mRetVal = oHold.declen;
            } else {
                // didn't find it.. they must now have access to a new branch that they didn't use to.
                mForceUpdt = true;
                mRetVal = 2; // backwards compatible
            }
        }

        if (mForceUpdt){
            // Go get a fresh copy from the web service
            this.refreshPricingDec();
        }

        return mRetVal;

    } // getPricingDec



    // *********************************************************************************
    // Make a web call to reget the pricingDec and store it out in local storage
    Vue.prototype.Sublib.refreshPricingDec = async function(){
        var mURL =this.getWSUrl() + 'sublib/getPricingDecCur';
        var oParams = {};

        var resp = await this.RestClient.get(mURL, oParams, 'getPricingDec');

        var oData = this.wsResp2Obj(resp);
        if (oData.errorMsg){
            // Got an error, I'm out.
            // this.mbox(oData.errorMsg);
            return false;
        } 

        // store it out in local storage
        localStorage.setItem('pricingDec', resp);

        return true;
    } // refreshPrcingDec





    // *********************************************************************************
    // Make a web call to reget the pricingDec and store it out in local storage
    Vue.prototype.Sublib.refreshPricingDec = async function(){
        var mURL =this.getWSUrl() + 'sublib/getPricingDecCur';
        var oParams = {};

        var resp = await this.RestClient.get(mURL, oParams, 'getPricingDec');

        var oData = this.wsResp2Obj(resp);
        if (oData.errorMsg){
            // Got an error, I'm out.
            // this.mbox(oData.errorMsg);
            return false;
        } 

        // store it out in local storage
        localStorage.setItem('pricingDec', resp);

        return true;
    } // refreshPrcingDec



    // *********************************************************************************
    // The Samsung keyboard doesn't report keys right on the keydown or keypress event
    // Prompt them to switch to the Google keyboard (if we haven't already done so)
    Vue.prototype.Sublib.promptSwitchKeyBoard = async function(mForceShow){
        if (!this.isAndroid()){
            return;
        }

        var mShowedPrompt = this.convFromStr(localStorage.getItem('inputMask_tryGBoard'));
        if (mShowedPrompt && !mForceShow){
            return;
        }

        localStorage.setItem('inputMask_tryGBoard', true);

        var mMsg = '<span style="color:red">The keyboard you are using will not work correctly with CenPoint.</span>' 
                + '\n'
                + '\n<span class="text-labelblue">We reccommend switching to "Gboard - the Google Keyboard" to avoid problems entering numbers in CenPoint</span>'; // looks too 'gray' after the red above

        var mChoice = await this.mbox(mMsg, 'Try Gboard', 'No Thanks');
        if (mChoice == 2){
            return;
        }

        var mGBoardLink = "https://play.google.com/store/apps/details?id=com.google.android.inputmethod.latin";
        window.open(mGBoardLink);

        return;

    } // showSwitchKeyBoard


    // *********************************************************************************
    // See if we can figure out what 'keyboard' they are using
    // Really so we can tell if it's a problem (i.e. the Samsung keyboard doesn't report the key on the keydown / keyup event)
    Vue.prototype.Sublib.getKeyboard = function(){

        var mRetVal = '';

        if (this.isAndroid()){
            if (this.usingWebview('android') && android.getSystemKeyBoard){
                // keyboards I've seen: 
                // com.google.android.inputmethod.latin/com.android.inputmethod.latin.LatinIME  - Default google keyboard / GBoard
                // com.sec.android.inputmethod/.SamsungKeypad  - Samsung. Causes problems (but is the default on Samsung devices!)
                // com.touchtype.swiftkey/com.touchtype.KeyboardService  - 'SwiftKey' by micorsoft
 
                mRetVal = android.getSystemKeyBoard(); 
            } else {
                // make a guess
                var oDevice = this.getDeviceInfo();
                if ((oDevice.manufacturer && oDevice.manufacturer.toLowerCase() == 'samsung') 
                    || (!oDevice.manufacturer && (this.left(oDevice.product, 2).toUpperCase() == 'SM' || this.contains(oDevice.product, 'galaxy', true)))
                    ){
                    // assume the samsung keyboard (most people don't change it)
                    // Want to specify this as Saumsung is an unsupported keyboard
                    mRetVal = 'com.sec.android.inputmethod/.SamsungKeypad';

                }else if ((oDevice.manufacturer && oDevice.manufacturer.toLowerCase() == 'lg')
                    || (!oDevice.manufacturer && this.left(oDevice.product, 3).toUpperCase() == 'LM-')){
                        // assume LG keyboard
                        mRetVal = 'com.lge.ime/.LgeImeImpl'; // got this from Jamie's LG Phone

                } else {
                    // some android keyboard
                    mRetVal = '!ANDROID!';
                }
            }
            
        } else if (this.isIOS()){
            mRetVal = '!IOS!';

        } else {
            // on a desktop computer (may be in tablet mode (i.e. a Surface));
            mRetVal = '!DESKTOP!';
        }

        return mRetVal;

    } // getKeyboard


    // *********************************************************************************
    // Decide if the keyboard is a problem (i.e. the Samsung keyboard doesn't report the key on the keydown / keyup event)
    Vue.prototype.Sublib.isKeyboardOkay = function(){
        var mKeyBoard = this.getKeyboard();

        var mRetVal;
        if (this.contains(mKeyBoard, 'samsung', true) // Samsung
            || this.contains(mKeyBoard, 'com.lge.', true) // LG
            ){
            
            mRetVal = false;
        } else {
            mRetVal = true;
        }

        return mRetVal;

    } // isKeyboardOkay




     
    

    // *********************************************************************************
    // Launch a help doc in the browser
    // This is a wrapper around launchURL in case we ever change how we do our help docs
    Vue.prototype.Sublib.launchHelp = function(mURL){
        this.launchURL(mURL);

    } // launchHelp


    // *********************************************************************************
    // This is like VFPs between() function, mostly putting here as between() is easier code to follow
    Vue.prototype.Sublib.between = function(mTestVal, mLowVal, mHighVal){
        // if (typeof mTestVal == 'number'){
        //     return ()

        // } else if (mTestVal instanceof Date){

        // }

        return (mLowVal <= mTestVal && mTestVal <= mHighVal);


    } // between


    // *********************************************************************************
    // Check to make sure a string only contains alpha / numeric characters
    // according to stack overflow, scanning the string is 66% faster than doing a regex
    // see https://stackoverflow.com/questions/4434076/best-way-to-alphanumeric-check-in-javascript
    Vue.prototype.Sublib.isAlphaNumeric = function(mTestString){
        var mAsciiVal;

        for (var mx = 0; mx < mTestString.length; mx++){
            mAsciiVal = mTestString.charCodeAt(mx);

            if (!this.between(mAsciiVal, 48, 57) // 0-9
                && !this.between(mAsciiVal, 65, 90) // A-Z
                && !this.between(mAsciiVal, 97, 122) // a-z
                ) {

                return false;
            }
        }
        
        return true;

    } // isAlphaNumeric


    // *********************************************************************************
    // Log that the user is logging in. This used to just be a flag the rest client set and the web service would geo code using the public IP
    // This wasn't accurate enough. Switching to be it's own method (still called via the Rest Client) so we can do it async. SRR 03/12/2021
    Vue.prototype.Sublib.logLogin = async function(){

        var oLoc = await this.getLocation();
        var oCurVer = await Vue.prototype.Sublib.getAppVer(); // SRR 07/07/2022

        // NOTE: You have 2 minutes from the time the token is generated to get the results. Shouldn't ever be an issue for us. 
        var mURL = this.getWSUrl() + 'sublib/logLogin';
        var oParams = {
            lat: oLoc.lat,
            lon: oLoc.lon,
            version:  oCurVer.version, // 1.0.5.3
        }

        var resp = await this.RestClient.getNoCache(mURL, oParams);
        var oData = this.wsResp2Obj(resp);
        if (oData.errorMsg){
        }

    } // logLogin



    


    // *********************************************************************************
    // $vuetify.goTo has no try / catch and just throws errors. Really annoying. 
    // Putting here so if the page changes and the element doesn't exist anymore we don't error out. SRR 08/16/2021
    Vue.prototype.Sublib.scrollTo = async function(mDomID, passedOffset, container){
        // mDomId = Char or object, i.e. '#signature-pad', will add '#' in front of it if not Passed
        //              if object, do something like: var oTxtPO = this.$refs['job-txt-po'];
        //                                              await this.Sublib.scrollTo(oTxtPO);
        // Container = String or htmlElement/object. 'parent' or 'container' div to scroll inside of (i.e. for a data type)
        if(!mDomID){
            return;
        }
        if (!passedOffset && typeof passedOffset != 'number'){
            passedOffset = 10;
        }

        if (typeof mDomId == 'string' && this.left(mDomID, 1) != '#'){
            mDomID = '#' + mDomID;
        }

        let oOptions = { offset: passedOffset, duration: 1000, easing: 'easeInOutCubic' };
        if (container){
            oOptions.container = container;
        }

        try {
            await this.oVuetify.goTo(mDomID, oOptions);

        } catch(ignore){
            // element doesn't exist anymore. Nothing to
            console.log('Scroll to element: ' + mDomID + ' failed. Error: ' + ignore.message);
        }

    } // scrollTo


    // *********************************************************************************
    // This is copied / tweaked from applyFee.prg on the desktop / webservice. Doesn't save anything, just calcs what the fee will be. SRR 10/12/2021
    // NOTE: Webserivce deals with taxable and adding tax to the fee. This does not!
    Vue.prototype.Sublib.calcFeeAmt = function(mAmt, mFeeType, mFeeAmt, mFeeType2, mFeeAmt2){
        // mAmt = Amount to base fee on
        // mFeeType = Char. either 'P', 'C', or 'F'
        // mFeeAMt = Numeric. Either the percentage or flat fee amount
        // mFeeType2 = Char. either 'P', 'C', or 'F'
        // mFeeAMt2 = Numeric. Either the percentage or flat fee amount

        var mRetVal = 0;

        if (mFeeType == 'P'){
            // Simple %
            mRetVal = this.math.round(mAmt * (mFeeAmt / 100), 2);

        } else if (mFeeType == 'C'){
            // CC %
            mRetVal = this.math.round((mAmt / ((100 - mFeeAmt) / 100)) - mAmt, 2);

        } else if (mFeeType == 'F'){
            // Flat Amount
            mRetVal = mFeeAmt;
        } else {
            // Invalid Fee type
            mRetVal = 0.00
        }

        var mNewFee2 = 0;
        if (mFeeType2 && mFeeAmt2){
            // Now add in the second fee. (i.e. 3% + $0.30 / transaction) SRR 12/14/2022
            if (mFeeType2 == 'P'){
                // Simple %
                mNewFee2 = this.math.round(mAmt * (mFeeAmt2 / 100), 2);
    
            } else if (mFeeType2 == 'C'){
                // CC %
                mNewFee2 = this.math.round((mAmt / ((100 - mFeeAmt2) / 100)) - mAmt, 2);
    
            } else if (mFeeType2 == 'F'){
                // Flat Amount
                mNewFee2 = mFeeAmt2;
            } else {
                // Invalid Fee type
                mRetVal = 0.00
            }
        }

        //mRetVal += mNewFee2;
        mRetVal = this.math.round(mRetVal + mNewFee2, 2);

        return mRetVal;

    } // calcFeeAmt



    // *********************************************************************************
    // Let us know that a server is having problems. SRR 02/09/2022
    Vue.prototype.Sublib.alertSupport = async function(mServer, mMsg, mSwitchServersFirst){
        // mServer = Char. Server that's having problems. i.e. 'wsdallas.cenpoint.com'
        // mMsg = Char. Error Message / what's going on
        // mSwitchServerFirst = Logical. If true, means the server in question is down so we need to switch servers before we can send us a message. 

        if (mSwitchServersFirst){
            await this.determineWS();
        }

        var mURL =this.getWSUrl() + 'Sublib/alertSupport';
        var oBodayParams = { server: mServer, msg: mMsg };

        
        var resp = await this.RestClient.postNoCache(mURL, {}, oBodayParams);

        var oData = this.wsResp2Obj(resp);
        if (oData.errorMsg){
            this.mbox('Server: ' + mServer + ' is experiencing problems and an error occurred alerting CenPoint. Please let CenPoint know!'
                            + '\nError: ' + oData.errorMsg);
        }

    } // alertSupport
    

     


    // *********************************************************************************
    // Check to see if they have any unsubmitted FTs from yesterday they need to submit before we let them into today's WO's / FT's. SRR 12/29/2021
    // NOTE: For now always does the user signed in.
    // Returns: Logical. true if they have unsubmitted FTs, otherwise false
    Vue.prototype.Sublib.hasUnsubmittedFTs = async function(mDate){
        // mDate = Date to check for. If not passed uses today as the date (checks FTs before date)
        if (this.offline()){
            // can't check, just let them through?
            return false; 
        }

        if (!mDate){
            mDate = await this.getDate(true);
        }

        var mURL = this.getWSUrl() + 'cpFTick/getPrevUnsubmittedFTs';
        var mParams = {
            'dt': this.DTOC(mDate)
        }

        //var resp = await this.RestClient.loadData(mURL, mParams);
        var resp = await this.RestClient.get(mURL, mParams, 'getPrevUnsubmittedFTs~dt=' + mParams.dt);

        var mRetVal;
        var oData = this.wsResp2Obj(resp);
        if (oData.errorMsg){
                this.mbox(oData.errorMsg);
            mRetVal = false; // let them through. Our bug

        } else if (oData.info && this.contains(oData.info, 'All FTs submitted', true)){
            // all FTs submitted or always an add'l worker. Good to go 
            mRetVal = false;

        } else {
            // Have unsubmitted FTs. open them and let them submit it. 
            mRetVal = true;

            var mMsg = this.getLbl('unsubmitted ft must submit before proceed');
            mMsg = mMsg.replace('<CNT>', oData.length);
            mMsg = mMsg.replace('<FTICKID>', oData[0].ftickid);
            mMsg = mMsg.replace('<DT>', this.obviousDt(oData[0].dt));

            var mChoice = await this.mbox(mMsg, this.getLbl('open ft'), this.getLbl('close'));
            if (mChoice == 1){
                // open the FT
                //this.btnViewFTClicked({ jobschedid: oData[0].ftickid, branchesid: oData[0].branchesid });
                this.router.push({ path: 'ftick', query: { jobschedid: oData[0].ftickid, branchesid: oData[0].branchesid }})
            } else {
                // nothing to do. 
            }
        }

        return mRetVal;
    } // hasUnsubmittedFTs




        // *********************************************************************************
    // Check to see if they have any unsubmitted FTs from yesterday they need to submit before we let them into today's WO's / FT's. SRR 12/29/2021
    // NOTE: For now always does the user signed in.
    // Returns: Logical. true if they have unsubmitted FTs, otherwise false
    Vue.prototype.Sublib.goodPhotoEditRetObj = function(){
        return {
            imageBase64: '', 
            saveType: ''
        }
    } // goodPhotoEditRetObj

    
    // *********************************************************************************
    //Set to local storage with expiration date passed in minutes (ttl = time to live)
    Vue.prototype.Sublib.setLocalStorage = async function(key, value, ttl){

        if (!ttl){
            ttl = 30;
        }

        var serverTime = await this.getDate(true)
        var expiration = serverTime.addMin(ttl)

        //`item` is an object which contains the original value as well as the time when it's supposed to expire
        var item = {
            value: value,
            expiry: expiration,

        }
        
        try {
            localStorage.setItem(key, JSON.stringify(item))
        } catch (error) {
            return;
        }

    }// setLocalStorage


    // *********************************************************************************
    Vue.prototype.Sublib.getLocalStorage = async function(key){
        var itemStr = localStorage.getItem(key)

        // if the item doesn't exist, return null
        if (!itemStr) {
            return null; // only doing null since that's what localStorage.getItem() returns if value doesn't exist and this keeps us consistent
        }

        try {
            var item = JSON.parse(itemStr)
        } catch (error) {
            localStorage.removeItem(key);
            return null;
        }

        var serverDate = await this.getDate(true)
        var expDate = new Date(item.expiry)

        // compare the expiry time of the item with the current time
        if (serverDate >= expDate) {
            // If the item is expired, delete the item from storage and return null
            localStorage.removeItem(key);
            return null;
        }

        // If the item is not expired, return the value
        return item.value

    } // getLocalStorage


    // *********************************************************************************
    // Cycle through and clean up local storage stuff that has expired
    Vue.prototype.Sublib.delExpiredLocalStorage = async function(){
        var eachitem;
        var eachkey;
        var dummyitem;

        // Loop all localStorage items that has an expiry date
        for (var i = 0; i < localStorage.length; i++){
            eachitem = localStorage.getItem(localStorage.key(i));
            eachkey = localStorage.key(i);
            // If value includes "expiry", call GetWithExpiry to read it and delete if expired
            if (eachitem.includes("expiry")) {
                // Call function to read it and delete if expired
                dummyitem = await this.getLocalStorage(eachkey);
            }
        }
    } // delExpiredLocalStorage
    
    //It is a shame that javascript has toUpper or toLower, but now capitalizing the first letter in sentence
    Vue.prototype.Sublib.capFLetter = function (sentence){

        //trim sentence of whitespaces
        sentence = sentence.trim();

        let words = sentence.split(" ").map(word => {
            return word[0].toUpperCase() + word.slice(1).toLowerCase();
        });

        return words.join(" ");
    }



    // *********************************************************************************
    // Calculate the travel vs onsite versus total time for an FT
    // NOTE: Technically this could work for clock ins / errands too. SRR 09/22/2022
    //
    // Returns: Object with errordesc, tottime, onsitetime, travel time (see cpFtick.calcFTTimes() in the webservice)
    Vue.prototype.Sublib.calcFTTimes = function(mStartedTime, mStartedDate, mArrivedTime, mArrivedDate,
                                                        mDepartedTime, mDepartedDate, mCompletedTime, mCompletedDate,
                                                        mBreakMinOnSite, mBreakMinTrav, mBreakMinLunch){
        // m.startedTime = Char. 4 digit mil time (i.e. '1525')
        // m.startedDate = DateTime (i.e. {07/08/2016 1:17:55 PM}), NOTE: Time will be dropped/not used
        // m.arrivedTime = Char. 4 digit mil time (i.e. '1525')
        // m.arrivedDate = DateTime (i.e. {07/08/2016 1:17:55 PM}), NOTE: Time will be dropped/not used 
        // m.departedTime = Char. 4 digit mil time (i.e. '1525')
        // m.departedDate = DateTime (i.e. {07/08/2016 1:17:55 PM}), NOTE: Time will be dropped/not used
        // m.completedTime = Char. 4 digit mil time (i.e. '1525')
        // m.completedDate = DateTime (i.e. {07/08/2016 1:17:55 PM}), NOTE: Time will be dropped/not used
        // m.breakMinX = numeric

        var oRetVal = {
            errorNum: 0,
            errorDesc: '',
            totTime: '',
            onSiteTime: '',
            travTime: ''
        }

        // *** First, a bunch of error checking ***
        if (!mStartedTime || mStartedTime == '-1-1' || !mCompletedTime || mCompletedTime == '-1-1'){
            oRetVal.errorNum = 0;
            oRetVal.errorDesc = 'started or completed time cannot be blank'
            return oRetVal;
        }
        if (!mStartedDate || this.emptyDt(mStartedDate)){
            oRetVal.errorNum = 0;
            oRetVal.errorDesc = 'Start date cannot be blank'
            return oRetVal;
        }

        if (!mStartedDate instanceof Date){
            mStartedDate = this.newDate(mStartedDate);
            // if (this.emptyDt(mStartedDate)){
            //     oRetVal.errorNum = 0;
            //     oRetVal.errorDesc = 'started date must be a date'
            //     return oRetVal;
            // }
        }
        if (!mArrivedDate instanceof Date){
            mArrivedDate = this.newDate(mArrivedDate);
            // if (this.emptyDt(mArrivedDate)){
            //     oRetVal.errorNum = 0;
            //     oRetVal.errorDesc = 'arrived date must be a date'
            //     return oRetVal;
            // }
        }
        if (!mDepartedDate instanceof Date){
            mDepartedDate = this.newDate(mDepartedDate);
            // if (this.emptyDt(mDepartedDate)){
            //     oRetVal.errorNum = 0;
            //     oRetVal.errorDesc = 'departed date must be a date'
            //     return oRetVal;
            // }
        }
        if (!mCompletedDate instanceof Date){
            mCompletedDate = this.newDate(mCompletedDate);
            // if (this.emptyDt(mCompletedDate)){
            //     oRetVal.errorNum = 0;
            //     oRetVal.errorDesc = 'completed date must be a date'
            //     return oRetVal;
            // }
        }



        if (this.emptyDt(mArrivedDate)){
            mArrivedDate = mStartedDate
        }
        if (this.emptyDt(mDepartedDate)){
            mDepartedDate = mArrivedDate;
        }
        if (this.emptyDt(mCompletedDate)){
            mCompletedDate = mDepartedDate
        }

        if (!mBreakMinOnSite){
            mBreakMinOnSite = 0;
        }
        if (!mBreakMinTrav){
            mBreakMinTrav = 0;
        }
        if (!mBreakMinLunch){
            mBreakMinLunch = 0;
        }
        // *** End, a bunch of error checking ***


        // Now format it all so I can calculate it. 
        mStartedTime = this.AmPm(mStartedTime);
        mArrivedTime = this.AmPm(mArrivedTime);
        mDepartedTime = this.AmPm(mDepartedTime);
        mCompletedTime = this.AmPm(mCompletedTime);

        var mStartedFull, mArrivedFull, mDepartedFull, mCompletedFull;
        mStartedFull = this.newDate(this.DTOC(mStartedDate) + ' ' + mStartedTime); // '11/19/2019 07:44 AM'
        mArrivedFull = this.newDate(this.DTOC(mArrivedDate) + ' ' + mArrivedTime);
        mDepartedFull = this.newDate(this.DTOC(mDepartedDate) + ' ' + mDepartedTime);
        mCompletedFull = this.newDate(this.DTOC(mCompletedDate) + ' ' + mCompletedTime);

        var mTot, mOnSite, mTravel;
        mTot = this.math.round((mCompletedFull - mStartedFull) / 1000 / 60, 0); // convert to minutes
        mOnSite = this.math.round((mDepartedFull - mArrivedFull) / 1000 / 60, 0); 
        mTravel = this.math.round(((mArrivedFull - mStartedFull) + (mCompletedFull - mDepartedFull)) / 1000 / 60, 0); 

        // Had a scenario with TrueLine/Baltimore where the onsite time was 15 min, but it tried to deduct
        // a 30 min lunch. RHR. 02/08/2016
        if (mBreakMinLunch && mOnSite < mBreakMinLunch){
            mBreakMinLunch = 0; // take the lunch back off, don't have enough onsite time for it
        }

        var mTotBreak, mActualTrav, mActualOnSite, mActualTot;
        mTotBreak = mBreakMinOnSite + mBreakMinTrav + mBreakMinLunch;


        // The following 'rules' are copied from the desktop code. We don't deal with everything it does so may not all apply. i.e. task time, 
        // *****
        // Our logic/rules (Important to follow!):
        // Actual Travel = the bigger of 'Travel From FT Time' or 'Travel from task time'
        // Actual Total Time = Total FT Time - Total Break Time
        // Actual On Site Time = Actual Total - Actual Travel
        //
        // If 'On site from tasks' == Actual onsite + break onsite, then we have 100% onsite allocation of time
        //	NOTE: labor/other only, travel time is not included in 100% allocation
        // *****

        mActualTrav = mTravel - mBreakMinTrav;
        mActualOnSite = mOnSite - mBreakMinOnSite - mBreakMinLunch;
        mActualTot = mTot - mTotBreak;

        // Convert minutes to hr:min
        oRetVal.totTime = this.minToHr(mActualTot);
        oRetVal.onSiteTime = this.minToHr(mActualOnSite);
        oRetVal.travTime = this.minToHr(mActualTrav);

        return oRetVal;

    } //calcFTTimes



    // *********************************************************************************
    // This is basically a wrapper method to call the same method on the web service
    Vue.prototype.Sublib.getBranchInfo = async function(mBranchesId, mWhat){
        // mWhat = Char. i.e. 'FinTxnNotAllowedDt'
        
        var mURL =this.getWSUrl() + 'Sublib/getBranchInfo';
        var oParams = { branchesId: mBranchesId, what: mWhat };

        
        var resp = await this.RestClient.get(mURL, oParams, 'getBranchInfo~branchesId=' + mBranchesId + '~what=' + mWhat);

        var oData = this.wsResp2Obj(resp);
        if (oData.errorMsg){
            this.mbox(oData.errorMsg);
        }

        return oData[0].value;


    } // getBranchInfo



    // *********************************************************************************
    // This is basically a wrapper method to call the same method on the web service
    Vue.prototype.Sublib.popQuickTo = async function(mSource, mBuildersId, mJobsId, mInvList, mAddtlWorkersList, mBranchesList, mWant){
        // m.jobsid = Optional. Used on some (but not all) m.source types.
        // m.invlist = Optional. List of invoices like: "'000123','000125'" OR "'000123'". Used on some (but not all) m.source types.
        // m.addtlworkerslist = Optional. List of addt'l workers like: "'000123','000125'". Used on some (but not all) m.source types.
        // m.brancheslist = Optional. List of branches like: "'000123','000125'". Used on some (but not all) m.source types.
        // mWant = Char. either 'EMAIl' or 'PHONE'. Defaults to email if not passed on the web service
        
        var mURL =this.getWSUrl() + 'Sublib/popQuickTo';
        var oParams = {};
        var oBodyParams = {
            source: mSource,
            buildersId: mBuildersId,
            jobsId: mJobsId,
            invList: mInvList,
            addtlWorkersList: mAddtlWorkersList,
            branchesList: mBranchesList,
            want: mWant,
        };

        
        var resp = await this.RestClient.postNoCache(mURL, oParams, oBodyParams);

        var oData = this.wsResp2Obj(resp);
        if (oData.errorMsg){
            if (!this.contains(oData.errorMsg, 'no data', true)){
                this.mbox(oData.errorMsg);
            }
            return [];
        }

        return oData


    } // popQuickTo



    // *********************************************************************************
    // This will send a text message to the customer with a link to get a signature for the Qt
    // Typically this is done by the sales rep in the field but this is just another option for the office to try to take care of it.
    // Returns: Logical. .T. if it worked, otherwise .F.
    Vue.prototype.Sublib.sendCustInvLink = async function(mInvoiceId2Send, mBuildersId, mEmailMode, mIncludeFT, mEmailExtraText, mIncludePDF){
        // m.invoiceId2Send = char. NOTE: CANNOT call it m.ftickId or when we try to add to the url params fox does a macro substitution on us
        // m.emailMode = Logical. If .T., sends an email instead of a text message
        // mEmailExtraText = Char. Optional. Extra text to show (i.e. customer: , job: , invAmt: )
        // mIncludePDF = Logical. If true, also attaches a PDF copy of the email to the email. NOTE: Only works if mEmailMode = true
        
        if (!mInvoiceId2Send){
            // should never hit this.
            this.mbox('No invoice passed');
            return false;
        }

        // First, figure out what number to send it to
        var oQuickTo = await this.popQuickTo('invoice', mBuildersId, '', mInvoiceId2Send, '', '', (mEmailMode ? 'EMAIL' : 'PHONE'));
        if (!mEmailMode){
            oQuickTo = oQuickTo.filter(obj => obj.dflt_recipient); // billing contacts
        }
        var mChoice;

        if (!oQuickTo || !oQuickTo.length){
            // didn't find a single contact. Crap!
        } else {
            if (oQuickTo[0].bldrnolinks){
                mChoice = await this.mbox(this.getLbl('cust not flagged for links send pdf'), this.getLbl('send link anyway'), this.getLbl('send pdf'), this.getLbl('cancel'));
                if (mChoice == 1){
                    // want to continue sending the link. Nothing to do

                } else if (mChoice == 2){
                    // Send a pdf instead
                    // not yet coded
                } else { // mChoice == 3
                    // Cancel
                    return false;
                }
            } // oQuickTo[0].bldrnolinks
        }


        // get the link
        var mURL = this.getWSUrl() + 'cpInvoice/getInvLink';
        var oParams = {
            invoiceId: mInvoiceId2Send,
            wantFT: mIncludeFT
        }

        var resp = await this.RestClient.getNoCache(mURL, oParams);

        var oData = this.wsResp2Obj(resp);
        if (oData.errorMsg){
            this.mbox(oData.errorMsg);
            return false;
        }


        if (mEmailMode){
            // email it out
            var mSubject = this.getLbl('invoice') + ' ' + this.trimZeros(mInvoiceId2Send, 5);
            var mBody = oData[0].msg;

            // Change the link to be an a tag so it's clickable
            //var mSigLink = mBody.substring(this.getIndex(mBody, 'bit.cenpoint.com')).trim();  // bit.cenpoint.com/j5l6
            var mSigLink = mBody.substring(this.getIndex(mBody, oData[0].url)).trim();  // bit.cenpoint.com/j5l6 or 'lnk.cenpoint.com/l?abcd (switched ot our own links. SRR 06/03/2023)
            if (this.contains(mSigLink, ' ')) {
                // Isn't the last think in the link, just get the link
                mSigLink = mSigLink.substring(0, this.getIndex(mSigLink, ' ')).trim();
            }

            var mSigLinkOrig = mSigLink;
            if (this.left(mSigLink, 'https://'.length) != 'https://'){
                mSigLink = 'https://' + mSigLink // not needed in texting but when emailing, some email clients don't open it right if it's missing
            }
            
            mBody = this.strtran(mBody, this.strtran(mSigLinkOrig, '\\?', '\\?'), '<a href="' + mSigLink + '">' + 'View Invoice' + '</a>'); // strtran doesn't work right with ? in it. SRR 06/03/2023
            
            var mPDFAttach = '';

            if (mIncludePDF){        
                // Get the PDF to also include on the email. SRR 04/24/2023
                if (mIncludeFT){
                    // Inv & FTs
                    mURL = this.getWSUrl() + 'cpInvoice/prtInvFT';
                } else {
                    // Inv only
                    mURL = this.getWSUrl() + 'cpInvoice/prtInv';
                }
                oParams = { invoiceId: mInvoiceId2Send, retPath: true}

                resp = await this.RestClient.postNoCache(mURL, oParams, {});

                oData = this.wsResp2Obj(resp);

                if (oData.errorMsg){
                    await this.mbox(oData.errorMsg);
                    return false;
                }

                mPDFAttach = oData[0].downloadpath;
            }

            mGoOn = await this.email(mPDFAttach, mSubject, mBody, '', oQuickTo, mEmailExtraText);
           

        } else {
            // send as a text
            // now figure out who to send it to / actually send it (can send to multiple peeps at once)
            var mGoOn = await this.sendLink2Cust(oData[0].msg, '', '', oQuickTo, mEmailExtraText, oData[0].url);
        }

        if (mGoOn == '!CANCEL!'){
            return false;
        }

        


        // flag it as sent to the customer
        mURL = this.getWSUrl() + 'cpInvoice/invLinkSent';
        oParams = {
            invoiceId: mInvoiceId2Send
        }

        resp = await this.RestClient.getNoCache(mURL, oParams);

        oData = this.wsResp2Obj(resp);
        if (oData.errorMsg){
            this.mbox('Error Updating Invoice Flags (but invoice was sent): ' + oData.errorMsg);
            //return;
        }

        return true;


    } // sendCustInvLink


    // *********************************************************************************
    // This will send a text message to the customer with a link to get a signature for the Qt
    // Typically this is done by the sales rep in the field but this is just another option for the office to try to take care of it.
    // Returns: Logical. .T. if it worked, otherwise .F.
    Vue.prototype.Sublib.sendCustQTLink = async function(mQuoteId2Send, mBuildersId, mEmailMode, mEmailExtraText, mDfltRecipient, mDfltRecipName){
        // m.invoiceId2Send = char. NOTE: CANNOT call it m.ftickId or when we try to add to the url params fox does a macro substitution on us
        // m.emailMode = Logical. If .T., sends an email instead of a text message
        // mEmailExtraText = Char. Optional. Extra text to show (i.e. customer: , job: , invAmt: )
        // mDfltRecipient = String. Optional. If passed, will use this as the default email or phone number to send to
        // mDfltRecipName = String. Optional. If passed, will use this as the default name to send to
        
        if (!mQuoteId2Send){
            // should never hit this.
            this.mbox('No quote passed');
            return false;
        }

        // First, figure out what number to send it to
        var oQuickTo = await this.popQuickTo('quote', mBuildersId, '', '', '', (mEmailMode ? 'EMAIL' : 'PHONE'));
        if (!mEmailMode){
            oQuickTo = oQuickTo.filter(obj => obj.dflt_recipient); // billing contacts
        }
        var mChoice;

        if (!oQuickTo || !oQuickTo.length){
            // didn't find a single contact. Crap!
        } else {
            if (oQuickTo[0].bldrnolinks){
                mChoice = await this.mbox(this.getLbl('cust not flagged for links send pdf'), this.getLbl('send link anyway'), this.getLbl('send pdf'), this.getLbl('cancel'));
                if (mChoice == 1){
                    // want to continue sending the link. Nothing to do

                } else if (mChoice == 2){
                    // Send a pdf instead
                    // not yet coded
                } else { // mChoice == 3
                    // Cancel
                    return false;
                }
            } // oQuickTo[0].bldrnolinks
        }


        // get the link
        var mURL = this.getWSUrl() + 'cpQuote/getQTLink';
        var oParams = {
            quoteId: mQuoteId2Send,
        }

        var resp = await this.RestClient.getNoCache(mURL, oParams);

        var oData = this.wsResp2Obj(resp);
        if (oData.errorMsg){
            this.mbox(oData.errorMsg);
            return false;
        }


        if (mEmailMode){
            // email it out
            var mSubject = this.getLbl('quote') + ' ' + this.trimZeros(mQuoteId2Send, 5);
            var mBody = oData[0].msg;

            // Change the link to be an a tag so it's clickable
            // var mSigLink = mBody.substring(this.getIndex(mBody, 'bit.cenpoint.com')).trim();  // bit.cenpoint.com/j5l6
            // if (this.contains(mSigLink, ' ')) {
            //     // Isn't the last think in the link, just get the link
            //     mSigLink = mSigLink.substring(0, this.getIndex(mSigLink, ' ')).trim();
            // }

            // var mSigLinkOrig = mSigLink;
            // if (this.left(mSigLink, 'https://'.length) != 'https://'){
            //     mSigLink = 'https://' + mSigLink // not needed in texting but when emailing, some email clients don't open it right if it's missing
            // }
     
            // mBody = this.strtran(mBody, mSigLinkOrig, '<a href="' + mSigLink + '">' + 'View Quote' + '</a>');
            var mSigLink = mBody.substring(this.getIndex(mBody, oData[0].url)).trim();  // bit.cenpoint.com/j5l6 or 'lnk.cenpoint.com/l?abcd (switched ot our own links. SRR 06/03/2023)
            if (this.contains(mSigLink, ' ')) {
                // Isn't the last think in the link, just get the link
                mSigLink = mSigLink.substring(0, this.getIndex(mSigLink, ' ')).trim();
            }

            var mSigLinkOrig = mSigLink;
            if (this.left(mSigLink, 'https://'.length) != 'https://'){
                mSigLink = 'https://' + mSigLink // not needed in texting but when emailing, some email clients don't open it right if it's missing
            }
            
            mBody = this.strtran(mBody, this.strtran(mSigLinkOrig, '\\?', '\\?'), '<a href="' + mSigLink + '">' + 'View Quote' + '</a>'); // strtran doesn't work right with ? in it. SRR 06/03/2023

 

            mGoOn = await this.email('', mSubject, mBody, mDfltRecipient, oQuickTo, mEmailExtraText);
           

        } else {
            // send as a text
            // now figure out who to send it to / actually send it (can send to multiple peeps at once)
            var mGoOn = await this.sendLink2Cust(oData[0].msg, mDfltRecipient, mDfltRecipName, oQuickTo, mEmailExtraText, oData[0].url);
        }

        if (mGoOn == '!CANCEL!'){
            return false;
        }

        


        // flag it as sent to the customer
        mURL = this.getWSUrl() + 'cpQuote/qtSigLinkSent';
        oParams = {
            quoteId: mQuoteId2Send
        }

        resp = await this.RestClient.getNoCache(mURL, oParams);

        oData = this.wsResp2Obj(resp);
        if (oData.errorMsg){
            this.mbox('Error Updating Quote Flag (but quote was sent): ' + oData.errorMsg);
            //return;
        }

        return true;


    } // sendCustQTLink



    


    // *********************************************************************************
    // This is like VFPs justFName()
    // NOTE: This doesn't currently work for actual file paths, just html paths
    Vue.prototype.Sublib.justFName = function (mString){
        if (!this.contains(mString, '/') && !this.contains(mString, '\\\\')){
            return mString;
        }
        var mSlashChar;
        if (this.contains(mString, '/')){
            mSlashChar = '/';
        } else {
            mSlashChar = '\\\\';
        }

        return mString.substr(this.getIndex(mString, mSlashChar, this.occurs(mString, mSlashChar)) + 1);

    } // justFNmae

        

    // *********************************************************************************
    // This is basically a wrapper around putUDS on the webservice
    Vue.prototype.Sublib.putUDS = async function(mID_, mUserID_, mValue_, maddrecord, msizevar, mdecvar){
        if (!mdecvar)
            mdecvar = 0;

        var mURL =this.getWSUrl() + 'Sublib/putUDS';
        var oParams = {};
        // pass as a JSON string so we don't lose the data type of mValue_
        var oBodyParams = {
            data: JSON.stringify({
                id: mID_,
                userId: mUserID_,
                value: mValue_,
                addRecord: maddrecord,
                sizeVar: msizevar,
                decVar: mdecvar
            })
        };

        
        var resp = await this.RestClient.postNoCache(mURL, oParams, oBodyParams);

        var oData = this.wsResp2Obj(resp);
        if (oData.errorMsg){
            this.mbox(oData.errorMsg);
        }

        return
    } // putUDS

    
    // *********************************************************************************
    // This method compares two object if they are equal to each other.Handy in detecting changes
    Vue.prototype.Sublib.areEqualObjs = function(obj1, obj2){
        var keys1 = Object.keys(obj1);
        var keys2 = Object.keys(obj2);

        if (keys1.length != keys2.length) {
            return false;
        }
        for (const key of keys1) {
            let val1 = obj1[key];
            let val2 = obj2[key];

            let areObjects = this.isObject(val1) && this.isObject(val2);


            if (areObjects && !this.areEqualObjs(val1, val2) || !areObjects && val1 !== val2) {
                return false;
            }
        }
        return true;

    } // areEqualObjs

    // *********************************************************************************
    // Checks if passed in value is object
    Vue.prototype.Sublib.isObject = function(object){
        return object != null && typeof object === 'object';
    } // isObject


    // *********************************************************************************
    // This is just a simple method so if we change our help docs we can change the baseURL in 1 spot easily. SRR 10/24/2022
    Vue.prototype.Sublib.getHelpDocsURL = function(){
        return 'https://help.cenpoint.com/docs/'
    } // getHelpDocsURL


    // *********************************************************************************
    // Get the height of our app top bar so we know the offset to do on some screens
    // This is just an easy common place to get it
    // Also makes it so I can call it from the HTML part since I can't reference document.___ directly from there. SRR 10/28/2022
    Vue.prototype.Sublib.getAppTopBarHeight = function(){
        var oTopBar = document.getElementById('appTopBar');
        var mRetVal;
        if (oTopBar){
            mRetVal = oTopBar.getBoundingClientRect().bottom;
        } else {
            // not showing, so 0
            mRetVal = 0; 
        }

        return mRetVal;
        
    } // getAppTopBarHeight

    // *********************************************************************************
    Vue.prototype.Sublib.getAppBottomBarHeight = function(){
        var oTopBar = document.getElementById('appBottomBar');
        var mRetVal;
        if (oTopBar){
            mRetVal = oTopBar.getBoundingClientRect().height;
        } else {
            // not showing, so 0
            mRetVal = 0; 
        }

        return mRetVal;
        
    } // getAppBottomBarHeight

    


    // *********************************************************************************
    // Get the quick date options
    // Moving to a seperate method so I can default date ranges in on reports
    Vue.prototype.Sublib.getDateRange = async function(quickDate, mBranchesId){
        // quickDate = Char. Date range we want
        // mBranchesId = Char. Optional. Only used if we need to calc last pay week for a certian branch.

        var curDate = await this.getDate(true);

        var mStartDt, mEndDt;

        //write all case statements for quick dates
        switch(quickDate){
            case 'WEEKTODATE':
                var mFow = this.newDate(curDate); // make sure it's not by reference

                while(mFow.getDay() != 0){
                    mFow = mFow.addDays(-1);
                }
                mStartDt = mFow;
                mEndDt = this.newDate(curDate); // make sure it's not by reference;
                break;
            case 'MONTHTODATE':
                //get month to date
                var mFom = this.newDate(curDate); // make sure it's not by reference;
                mFom.setDate(1);
                mStartDt = mFom;
                mEndDt = this.newDate(curDate); // make sure it's not by reference;
                break;
            case 'YEARTODATE':
                //get year to date
                var mFoy = this.newDate(curDate); // make sure it's not by reference;
                mFoy.setMonth(0);
                mFoy.setDate(1);
                mStartDt = mFoy;
                mEndDt = this.newDate(curDate); // make sure it's not by reference;
                break;
            case 'LASTWEEK':
            case 'NEXTWEEK':
                // var mFow = this.newDate(curDate); // make sure it's not by reference;
                // if(quickDate == 'LASTWEEK'){
                //     while(mFow.getDay() != 0){
                //         mFow = mFow.addDays(-1);
                //     }
                //     mStartDt = mFow.addDays(-7);
                //     mEndDt = mFow.addDays(-1);
                // }else{
                //     while(mFow.getDay() != 0){
                //         mFow = mFow.addDays(-1);
                //     }
                //     mStartDt = mFow.addDays(7);
                //     mEndDt = mFow.addDays(13);
                // }

                var mFd = this.newDate(curDate); // make sure it's not by reference;
                if(quickDate == 'LASTWEEK'){
                    mFd = mFd.addDays(-7);
                }else{
                    mFd = mFd.addDays(7);
                }
                
                //first day of week
                while(mFd.getDay() != 0){
                    mFd = mFd.addDays(-1);
                }
                mStartDt = mFd;

                //last day of week
                while(mFd.getDay() != 6){
                    mFd = mFd.addDays(1);
                }
                mEndDt = mFd;
                break;
            case 'LASTTWOWEEKS':
            case 'NEXTTWOWEEKS':
                // var mFow = this.newDate(curDate); // make sure it's not by reference;
                // if(quickDate == 'LASTTWOWEEKS'){
                //     while(mFow.getDay() != 0){
                //         mFow = mFow.addDays(-1);
                //     }
                //     mStartDt = mFow.addDays(-14);
                //     mEndDt = mFow.addDays(-1);
                // }else{
                //     while(mFow.getDay() != 0){
                //         mFow = mFow.addDays(-1);
                //     }
                //     mStartDt = mFow.addDays(14);
                //     mEndDt = mFow.addDays(27);
                // }

                var mFd = this.newDate(curDate); // make sure it's not by reference;
                if(quickDate == 'LASTTWOWEEKS'){
                    mFd = mFd.addDays(-14);
                }else{
                    mFd = mFd.addDays(7);
                }

                var mLd = mFd
                
                //first day of week
                while(mFd.getDay() != 0){
                    mFd = mFd.addDays(-1);
                }
                mStartDt = mFd;

                //last day of week
                while(mLd.getDay() != 6){
                    mLd = mLd.addDays(1);
                }
                mEndDt = mLd.addDays(7);
                break;
            case 'LASTMONTH':
            case 'NEXTMONTH':
                var mFom = this.newDate(curDate); // make sure it's not by reference;
                if(quickDate == 'LASTMONTH'){
                    mStartDt = new Date(mFom.getFullYear(), mFom.getMonth() - 1, 1);
                    mEndDt = new Date(mFom.getFullYear(), mFom.getMonth(), 0);
                }else{
                    mStartDt = new Date(mFom.getFullYear(), mFom.getMonth() + 1, 1);
                    mEndDt = new Date(mFom.getFullYear(), mFom.getMonth() + 2, 0);
                }
                break;
            case 'LASTQUARTER':
            case 'NEXTQUARTER':
                var mFom = this.newDate(curDate); // make sure it's not by reference;

                var mQtr = Math.floor((mFom.getMonth() + 3) / 3);

                if(quickDate == 'LASTQUARTER'){
                    mQtr = mQtr - 1;

                    if(mQtr == 0){
                        mQtr = 4;
                        //falling back a year
                        mFom.setFullYear(mFom.getFullYear() - 1);
                    }

                }else{
                    mQtr = mQtr + 1;
                    if(mQtr == 5){
                        mQtr = 1;

                        //falling forward a year
                        mFom.setFullYear(mFom.getFullYear() + 1);
                    }
                }
                switch(mQtr){
                    case 1:
                        mStartDt = new Date(mFom.getFullYear(), 0, 1);
                        mEndDt = new Date(mFom.getFullYear(), 2, 31);
                        break;
                    case 2:
                        mStartDt = new Date(mFom.getFullYear(), 3, 1);
                        mEndDt = new Date(mFom.getFullYear(), 5, 30);
                        break;
                    case 3:
                        mStartDt = new Date(mFom.getFullYear(), 6, 1);
                        mEndDt = new Date(mFom.getFullYear(), 8, 30);
                        break;
                    case 4:
                        mStartDt = new Date(mFom.getFullYear(), 9, 1);
                        mEndDt = new Date(mFom.getFullYear(), 11, 31);
                        break;
                }

                break;
            case 'LASTYEAR':
            case 'NEXTYEAR':
                var mFoy = this.newDate(curDate); // make sure it's not by reference;
                if(quickDate == 'LASTYEAR'){
                    mStartDt = new Date(mFoy.getFullYear() - 1, 0, 1);
                    mEndDt = new Date(mFoy.getFullYear() - 1, 11, 31);
                }else{
                    mStartDt = new Date(mFoy.getFullYear() + 1, 0, 1);
                    mEndDt = new Date(mFoy.getFullYear() + 1, 11, 31);
                }

                break;
            case 'LASTYEARTODATE':
            case 'NEXTYEARTODATE':
                var mFoy = this.newDate(curDate); // make sure it's not by reference;
                if(quickDate == 'LASTYEARTODATE'){
                    mStartDt = new Date(mFoy.getFullYear() - 1, 0, 1);
                    mEndDt = new Date(mFoy.getFullYear() - 1, mFoy.getMonth(), mFoy.getDate());
                }else{
                    mStartDt = new Date(mFoy.getFullYear() + 1, 0, 1);
                    mEndDt = new Date(mFoy.getFullYear() + 1, mFoy.getMonth(), mFoy.getDate());
                }

                break;
            case 'LASTPAYWEEK':
                //make a call to webservice to get last pay week
                var mURL = this.getWSUrl() + 'cpgetusers/getLastPayWeek';

                // keep vue happy and don't change props passe in
                if(!mBranchesId)
                    mBranchesId = localStorage.getItem('userBranchesId')
                

                var oParams = {
                    branchesid: mBranchesId,
                }

                var resp = await this.RestClient.getNoCache(mURL, oParams);

                var oData = this.wsResp2Obj(resp);
                if (oData.errorMsg){
                    this.mbox(oData.errorMsg);
                    return { startDt: this.newDate(null), endDt: this.newDate(null)}
                }

                mStartDt = new Date(oData[0].startdate);
                mEndDt = new Date(oData[0].enddate);

                break;
            case 'ANYTIME':
                var mFom = this.newDate(curDate); // make sure it's not by reference;
                mStartDt = new Date(2000, 0, 1);
                mEndDt = new Date(mFom.getFullYear() + 1, 11, 1);
                break;
            case 'YESTERDAY':
                var mFow = this.newDate(curDate); // make sure it's not by reference;
                mStartDt = mFow.addDays(-1);
                mEndDt = mFow.addDays(-1);
                break;
            case 'TODAY':
                mStartDt = this.newDate(curDate); // make sure it's not by reference;
                mEndDt = this.newDate(curDate); // make sure it's not by reference;
                break;
            default:
                break;
        } // switch

        return { startDt: mStartDt, endDt: mEndDt}

    } // getDateRange


    // *********************************************************************************
    // return back the current url. Doing this since it's not easily accessible via location.___ and we need this for some oAuth crap
    Vue.prototype.Sublib.getCurURL = function(mIncludeParams, mGetBaseUrl){
        var mRetVal;
        if (!mIncludeParams && !mGetBaseUrl){
            mRetVal = location.protocol + '//' + location.host + location.pathname;
        } else if(mGetBaseUrl){
            mRetVal = location.protocol + '//' + location.host;
        } else {
            mRetVal = location.href;
        }
        return mRetVal
    } // getCurURL


    // *********************************************************************************
    // Update the value of view time in decimals that's used all over
    Vue.prototype.Sublib.updtViewTmDec = async function(mNewVal){
        await this.putUDS('VIEWTMDEC', localStorage.getItem('userId'), mNewVal, true, 1);
    } // updtViewTmDec

    


     //**************************************************************************************************************
    // Get the users email signature
    // NOTE: We cache this locally for speed / less calls but also have a check digit to make sure it's not outdated. 
    // Returns: Char. Email sig or '' if no email sig defined.
    Vue.prototype.Sublib.getEmailSig = async function(mUserId){
        // mUserId = Char. Optional. If not passed, uses signed in user. 
        //      NOTE: mUserId should ONLY be passed if editing a user

        var mGetEmail = false, oData, oEmail;

        if (!mUserId)
            mUserId = localStorage.getItem('userId');


        if (mUserId != localStorage.getItem('userId')){
            // editing a different users signature
            mGetEmail = true;

        } else {
            // using my own sig
            // First, see if my cached copy is out of date.
            var mEmailSigResp = await this.IDB.req('users', 'get', 'emailSig');
            if (!mEmailSigResp){
                // Don't have it yet, check for it
                mGetEmail = true;

            } else {
                oEmail = this.wsResp2Obj(mEmailSigResp);
                if (oEmail.errorMsg){
                    mGetEmail = true;

                } else {
                    // get the check digit to compare
                    var mURL = this.getWSUrl() + 'cpUsers/getEmailSig'; 
                    var oParams = {
                        chkDigOnly: true
                    }
                    

                    var resp = await this.RestClient.getNoCache(mURL, oParams);

                    var oData = this.wsResp2Obj(resp);
                    if (oData.errorMsg){
                        // Crap! Not sure what to do other than get the email fresh?
                        this.mbox(oData.errorMsg);
                        mGetEmail = true;
                    } else {
                        if (oData[0].checkdig != oEmail[0].checkdig){
                            mGetEmail = true;
                        }
                    }
                } // oEmail.errorMsg
            } // !mEmailSigResp
        } // mUserId != localStorage.getItem('userId')


        if (mGetEmail){
            var mURL = this.getWSUrl() + 'cpUsers/getEmailSig'; 
            var oParams = {
                chkDigOnly: false,
                userId: mUserId
            }
            
            var resp = await this.RestClient.getNoCache(mURL, oParams);

            if (mUserId == localStorage.getItem('userId')){
                this.IDB.req('users', 'put', 'emailSig', resp);
            }

            oEmail = this.wsResp2Obj(resp);
            if (oEmail.errorMsg){
                // couldn't get the email sig. Not good!
                this.mbox(oEmail.errorMsg);
                return '';
            }
        }

        //handling it in the users.vue
        // if (oEmail[0].emailapp == 'OL'){
        //     // they send via outlook, that doesn't work on the web!
        //     await this.mbox('Your user email is currently set to send via Outlook. That option is not avaible on the portal. Please send this email on the desktop version instead.');
        //     // this.btnCancelClicked();
        //     return '!CANCEL!';
        // }

        
        var mEmailMsg = oEmail[0].emailmsg;

        
        // if you use v-html you have to do the replaceAll but with the editor we're using we don't. Leave it as is. (do the strtran right before we send it up)
        // mEmailMsg = this.replaceAll(mEmailMsg, '\\\\n', '<br />'); // works in conjection with v-html above
        // mEmailMsg = this.replaceAll(mEmailMsg, '\\\n', '<br />'); // have to check for both... not sure why. Maybe web service sends it back slightly different than when I hard code build the string?


        // Now figure out where to put the logo
        if (!oEmail[0].emaillogobase64){
            
        } else {
            if (!this.contains(mEmailMsg, '<LOGO>') && !this.contains(mEmailMsg, '<img')){
                // Add in my plcaceholder (otherwise the image won't be used)
                if (this.right(mEmailMsg, 10) == '<br /></p>'){
                    mEmailMsg = this.strtran(mEmailMsg, '<br /></p>', '<br /><LOGO></p>', this.occurs(mEmailMsg, '<br /></p>'));
                } else if(this.contains(mEmailMsg, '</p>')){
                    // No extra break. add one in at the end
                    mEmailMsg = this.strtran(mEmailMsg, '</p>', '<br /><LOGO></p>', this.occurs(mEmailMsg, '</p>'));
                }else{
                    //there was no </p> tag. Just add it in at the end
                    mEmailMsg = mEmailMsg + '<br/> <LOGO>';
                }
            }
        }


        var mStr2Replace, mReplacement;
        if (this.contains(mEmailMsg, '<LOGO>')){
            mStr2Replace = '<LOGO>';
        } else if (this.contains(mEmailMsg, '<img)')){
            // <img alt="logo" height="24" src="<<m.imgPath>>" width="24" />
            mStr2Replace = mEmailMsg.substring(mEmailMsg.indexOf('<img') -1);
            mStr2Replace = mStr2Replace.substring(0, mStr2Replace.indexOf('/>') + 1);

        } else {
            mStr2Replace = ''
        }


        if (!oEmail[0].emaillogobase64){
            mReplacement = '';
        } else {
            // m.replacement = '<img alt="logo" height="24" src="' + m.img + '" width="24" />'
            var mHeight, mWidth;
            if (oEmail[0].emaillogod){
                // NOTE: Stored out in widthxheight (to be consistent with how we store out the form positions)
                var mHoldDimen = oEmail[0].emaillogod.trim();
                mWidth = mHoldDimen.substring(0, mHoldDimen.indexOf('x'));
                mHeight = mHoldDimen.substring(mHoldDimen.indexOf('x') + 1);
            } else {
                mHeight = '96';
                mWidth = '96';
            }
            mReplacement = '<img alt="logo" height="' + mHeight + '" src="data:image/png;base64,' + oEmail[0].emaillogobase64 + '" width="' + mWidth + '" />'
            if (oEmail[0].emaillogol){
                mReplacement = '<a href="' + oEmail[0].emaillogol + '">' + mReplacement + '</a>'
            }
        }

        mEmailMsg = this.strtran(mEmailMsg, mStr2Replace, mReplacement);

        return mEmailMsg;


    } // getEmailSig

    //****************************************************************************************************
    //We are getting image height and width multiple times in certain areas, so creating a method that returns the natural height and width of image from base64 string

    Vue.prototype.Sublib.getImgHeightAndWidth = async function(base64Str){

        return new Promise((resolve, reject) => {
            const img = new Image()
            img.crossOrigin = 'Anonymous' // to avoid CORS if used with Canvas
            img.src = base64Str

            img.onload = () => {
                resolve({naturalHeight: img.naturalHeight, naturalWidth: img.naturalWidth, errorMsg: ''})
            }

            img.onerror = e => {
                reject({naturalHeight: 0, naturalWidth: 0, errorMsg: e})
            }
        })

    } // getImgHeightAndWidth


    // *********************************************************************************
    // * This will decide which branch ID to use based on the Branch cbo Value passed in.
	// NOTE: The branches id is used to determine which address / name to print on reports among other things
    Vue.prototype.Sublib.getBranchID = async function(mCboBranchValue, mUseUserDflt){
        if (this.isNumeric(mCboBranchValue))
            return mCboBranchValue;


        var mURL =this.getWSUrl() + 'cpGetUsers/getBranchId';
        var oParams = {
            branchesId: mCboBranchValue,
            useUserDflt: mUseUserDflt
        }
        var resp = await this.RestClient.getNoCache(mURL, oParams);

        var oData =this.wsResp2Obj(resp);
        if (oData.errorMsg){
            this.mbox(oData.errorMsg);
            return '';
        }

        return oData[0].branchesid;

    } // getBranchID

    // *********************************************************************************
    Vue.prototype.Sublib.parseName = function(mFullname, mFLM, retObj) {

        if(!mFullname){
            return '';
        }

        var mFullname = mFullname.trim();
        var mFLM = mFLM.trim().toUpperCase().substr(0,1);

        var mWordCount = this.countWords(mFullname);
        var mX = 0;
        var mCurrWord = '';
        var mNextLetter = '';
        var mOnWord = 1;
        var mWordToFind = 0;
        var mWarning = false;

        if (mWordCount == 4){
            if (mFullname.indexOf(',') == -1)
                mWarning = true;
        }

        mWordToFind = 0;
        switch (mWordCount){
            case 0: //name field must be empty
                return '';
            case 1: //must only be last name
                mWordToFind = 1;
                mWarning = true;
                break;
            case 2: //only first and last name
                switch (mFLM){
                    case 'F':
                        mWordToFind = 1;
                        break;
                    case 'M':
                        mWordToFind = 0;
                        break;
                    case 'L':
                        mWordToFind = 2;
                        break;
                }
                break;
            case 3:
                if (mFullname.indexOf(',') != -1){ //first, last, suffix
                    switch (mFLM){
                        case 'F':
                            mWordToFind = 1;
                            break;
                        case 'M':
                            mWordToFind = 0;
                            break;
                        case 'L':
                            mWordToFind = 2;
                            break;
                    }
                } else { //first, middle, last
                    switch (mFLM){
                        case 'F':
                            mWordToFind = 1;
                            break;

                        case 'M':
                            mWordToFind = 2;
                            break;

                        case 'L':
                            mWordToFind = 3;
                            break;
                    }
                }
                break;
            case 4: //first, middle, last, suffix
                switch (mFLM){
                    case 'F':
                        mWordToFind = 1;
                        break;
                    case 'M':
                        mWordToFind = 2;
                        break;
                    case 'L':
                        mWordToFind = 3;
                        break;
                }
                break;
            default:
                return '';
        }

        //word doesn't exist
        if (mWordToFind == 0)
            return '';

        //pull out commas and periods
        mFullname = mFullname.replace(/\./g, '');
        mFullname = mFullname.replace(/\,/g, '');

        for (mX = 0; mX < mFullname.length; mX++){
            mNextLetter = mFullname.substr(mX, 1);

            if (mNextLetter != ' '){
                mCurrWord = mCurrWord + mNextLetter;
            } else {
                if (mOnWord == mWordToFind && mCurrWord != ''){
                    break;
                }

                if (mCurrWord != ''){
                    mOnWord = mOnWord + 1;
                    mCurrWord = '';
                }

            }
        }

        //if retObj is passed in, then return the object
        if (retObj){
            //split the fullname into an array
            var mFullNameArr = mFullname.trim().split(/\s+/);
            var mRetObj = {
                firstname: '',
                middlename: '',
                lastname: '',
            }

            switch (mWordCount){
                case 1:
                    mRetObj.firstname = mFullNameArr[0];
                    mRetObj.lastname = '';
                    break;
                case 2:
                    mRetObj.firstname = mFullNameArr[0];
                    mRetObj.lastname = mFullNameArr[1];
                    break;
                default:
                    mRetObj.firstname = mFullNameArr[0];
                    mRetObj.middlename = mFullNameArr[1];
                    mRetObj.lastname = mFullNameArr[2];
                    break;
            }

            return mRetObj;
        }


        if (mWarning){
            return 'Warning: ' + mCurrWord;
        } else {
            return mCurrWord;
        }
    } // parseName

    // *********************************************************************************
    //count words method
    Vue.prototype.Sublib.countWords = function(str) {
        return str.trim().split(/\s+/).length;
    }

    // *********************************************************************************
    // Load a script (i.e. stripe.js and wait until it's done)
    // Returns: logical. true if it added it, otherwise false
    // see https://stackoverflow.com/questions/29375510/how-to-know-if-a-javascript-script-was-loaded
    // and https://stackoverflow.com/questions/1293367/how-to-detect-if-javascript-files-are-loaded
    Vue.prototype.Sublib.loadScript =  async function(mScript, mForceFresh){
        // mScript = Char. url to load, i.e. https://js.stripe.com/v3/
        // mForceFresh = Logical. If true, will load even if we already have it loaded

        if (!mScript)
            return false;
        
            
        if (!mForceFresh){
            // see if we already have it
            var oScripts = document.getElementsByTagName('script');
            for (var mx = 0; mx < oScripts.length; mx++) { 
                if (oScripts[mx].src && oScripts[mx].src == mScript){
                    // already loaded, nothing to do
                    return true;
                }
            } // for
        }

        return new Promise((resolve, reject) => {
            //var mStripeScript = "https://js.stripe.com/v3/"
            // var oPmtScript = document.createElement('script');
            // oPmtScript.setAttribute('src', mStripeScript);
            // document.head.appendChild(oPmtScript);   
            
            $.getScript(mScript)
                .done(() => resolve(true))
                //.fail(() => reject())
                .fail(() => resolve(false))
        });
    } // loadScript


    // *********************************************************************************
    // Launch a popup screen if not signed in and let them sign in.
    // Nice if someone emails them a link so they can stay on it. SRR 12/21/2022
    Vue.prototype.Sublib.checkSignIn =  async function(mForceSignIn, token){
        // mForceSignIn = Logical. If true, makes them sign in again even if already signed in
        // token = Char. Resign in this user (i.e. just got done simulating someone and need to now sign back in as the original user). SRR 08/04/2023

        if (window.g_checkingSignIn 
            || (this.getAppTopBarHeight() == 0 && !this.getConnectInfo('token')) // popup won't show right until the app paints
            ) {
            while(window.g_checkingSignIn || (this.getAppTopBarHeight() == 0 && !this.getConnectInfo('token'))){
                await this.sleep(5*1000)
            }
        }


        var oParams = this.routerRef.currentRoute.query;
        if (oParams.token && this.getConnectInfo('token')){     
            if (oParams.token.trim() == this.getConnectInfo('token')){
                // called from the desktop but already signed in, clean up the query string
                
                // if (this.Sublib.inList(key, ['token', 'path'])){ // I need the custcode for invoice links they can open in the office to take a payment over the phone
                // Just account for it on the screens that need it and delete it out for the screens that don't
                this.deleteParamInURL('token', 'custcode', 'path');

            } else {
                // trying to use a different token (i.e. multiple people sharing a computer and called from the desktop)
                // sign them out first and then let the sign in code below run
                await this.signOut(true);
                await this.IDB.init(); // wiped out during the sign out
            }
        } // if (oParams.token)


        // mForceSignIn = Logical. If true, forces them to sign in again
        if (!mForceSignIn && this.getConnectInfo('token')){
            // already signedIn
            return true;

        } else if (this.contains(this.getCurURL(), 'signIn', true)){
            // already on the sign in page, don't show the popup
            return false;
        
        } else {
            // Not signed in, let them
            window.g_checkingSignIn = true;
            var mGoon = await this.showSimplePopUp(this.Vue.extend(SIGNINPOPUP), { 'token': token});
            window.g_checkingSignIn = false;

            if (mGoon == '!CANCEL!'){
                return false;
            } else {
                return true;
            }
        }
    } // checkSignIn


    // *********************************************************************************
    // Verify the password to proceed (can also require an SA password)
    // Returns: Logical, true if you can proceed, otherwise false
    Vue.prototype.Sublib.confirmPwd = async function(mReqSALogin){
        // mReqSALogin = Logical. If .T., will make visible the username and then they must login as somewith with SA rights
        var oParams = {
            reqSALogin: mReqSALogin,
            formCaption: mReqSALogin ? this.getLbl('must enter admin cred to proceed') : this.getLbl('confirm pwd to proceed'),
            verifyOnly: true
        }
        var mGoon = await this.showSimplePopUp(this.Vue.extend(SIGNINPOPUP), oParams);
        
        if (!mGoon || mGoon == '!CANCEL!'){
            return false;
        } else {
            return true;
        }

    } // confirmPwd

    
    // *********************************************************************************
    // Round the time
    // NOTE: This is copied / tweaked from the desktop
    Vue.prototype.Sublib.roundTime =  function(mTm, mRoundUpAt, mRoundInterval){
        // m.tm = Char. 'HH:MM' or 'HHMM'. Something like '7:13' or '0713'
        //		 OR Num. Something like 7.22 (min in dec format)
        // m.roundupat = Num. 
        // m.roundinterval = Char. Optional. Either 'QUARTERHOUR' or 'Q', 'HALFHOUR' or 'H'

        var mHrs, mMin, mRetVal, mAdjRoundUp, mHrLen;

        if (!mRoundInterval){
            mRoundInterval = 'QUARTERHOUR';
        }
        if (!mRoundUpAt){
            mRoundUpAt = 0;
        }

        if (typeof mTm == 'number'){
            if (Math.floor(mTm) == mTm){
                mHrs = mTm;
                mMin = 0;
            } else {
                mHrs = Math.floor(mTm);
                mMin = mTm - mHrs;
                mMin *= 60; // converts from decs to  minutes (.5 -> 30)
            }
        } else {
            if (this.occurs(':', mTm) > 0){
                // In the format of '07:13'
                mHrs = Math.floor(Number(this.left(mTm, this.getIndex(mTm, ':'))));
                mMin = Math.floor(Number(mTm.substring(mTm, this.getIndex(mTm, ':'))));
            } else {
                // In the format of '0713'
                mHrs = Math.floor(Number(this.left(mTm, 2)));
                mMin = Math.floor(Number(this.right(mTm, 2)));
            }
        }

        if (this.inList(mRoundInterval, ['QUARTERHOUR', 'Q'])){
            if (mMin >= 45){
                mAdjRoundUp = 45 + mRoundUpAt
            } else if (mMin >= 30){
                mAdjRoundUp = 30 + mRoundUpAt
            } else if (mMin >= 15){
                mAdjRoundUp = 15 + mRoundUpAt
            } else {
                mAdjRoundUp = 0 + mRoundUpAt
            }

            if (mMin >= mAdjRoundUp){
                // need to round up
                if (mMin >= 45){
                    mHrs++;
                    mMin = 0;

                } else if (mMin >= 30){
                    mMin = 45

                } else if (mMin >= 15){
                    mMin = 30

                } else {
                    mMin = 15
                }

            } else {
                // need to round down
                if (mMin >= 45){
                    mMin = 45;

                } else if (mMin >= 30){
                    mMin = 30

                } else if (mMin >= 15){
                    mMin = 30

                } else {
                    mMin = 0
                }
            }

        } else if (this.inList(mRoundInterval, ['HALFHOUR', 'H']))  {
            if (mMin >= 30){
                mAdjRoundUp = 30 + mRoundUpAt
            } else {
                mAdjRoundUp = 0 + mRoundUpAt
            }

            if (mMin >= mAdjRoundUp){
                // need to round up
                if (mMin >= 30){
                    mHrs++;
                    mMin = 0;

                } else {
                    mMin = 30
                }

            } else {
                // need to round down
                if (mMin >= 30){
                    //mHrs++;
                    mMin = 30;

                } else {
                    mMin = 0
                }
            }
        }

        mHrLen = String(mHrs).length;
        if (mHrLen < 2){
            mHrLen = 2;
        }

        if (mHrs == 24){
            mHrs = 0;
        }

        if (typeof mTm == 'number'){
            mRetVal = mHrs + this.math.round(mMin / 60, 2);
        } else {
            mRetVal = this.padL(String(mHrs), mHrLen, '0') + ':' + this.padL(String(mMin), 2, '0');
            if (this.occurs(':', mTm) == 0){
                // want to return in miltime
                //mRetVal = this.milTime(mRetVal)
                mRetVal = this.strtran(mRetVal, ':', '');
            }
        }

        return mRetVal;


    } // roundTime


    
    // *********************************************************************************
    // Check to see if an update is available
    // NOTE: This checks to see if we released a desktop update so we can update the DB for the free and lite versions. SRR 01/06/2023
    Vue.prototype.Sublib.check4DBUpdt = async function(forceUpdtVer, allowPro){
        // forceUpdtVer = Logical. If true, runs update version even if no update is available (i.e. for a beta app). SRR 08/21/2023
        // allowPro = Logical. If true, will allow the pro version to update the DB. SRR 12/26/2023

        if (this.getVersionType() == '!FULL!' && !this.isTestingIP() && !forceUpdtVer && !allowPro){
            // nothing to do, handled by the desktop
            return;
        }


        var mURL =this.getWSUrl() + 'cpGetUsers/check4DBUpdt';
        let oParams = {
            forceUpdtVer: forceUpdtVer,
            allowPro: allowPro
        }
        var resp = await this.RestClient.getNoCache(mURL, oParams);

        var oData =this.wsResp2Obj(resp);
        if (oData.errorMsg){
            this.mbox(oData.errorMsg);
            return
        }

        if (oData.newversion){
            // updated, launch the help docs? Some things might apply to them?
            // oData.newversion = '217'
            // Since the URL is not actually stored in the DB anywhere, this works on the basis that our URL's are the same except version #! SRR 04/29/2020
            // i.e. https://help.cenpoint.com/docs/update-185
            //this.launchURL('https://help.cenpoint.com/docs/update-' + oData.newversion);
        }


        
    } // check4DBUpdt


    


    // *********************************************************************************
    //get customer aging link
    Vue.prototype.Sublib.getCustomerAgingLink = async function (mBuildersId, mForceSend=false, mIncludeDftStmt=false){
        
        //get the aging link
        var mURL = this.getWSUrl() + 'cpCust/getCustAgingLink';
        var oParams = {
            buildersId: mBuildersId,
            forceSend: mForceSend,
            includeDftStmt: mIncludeDftStmt,
        }

        var resp = await this.RestClient.getNoCache(mURL, oParams);

        var oData = this.wsResp2Obj(resp);

        if (oData.errorMsg){
            if(this.contains(oData.errorMsg, 'not accept links') || oData.errorCode == -953){

                var msg = this.getLbl('customer not set to accept links')
                var mChoice = await this.mbox(msg, this.getLbl('send link anyway'), this.getLbl('cancel'));
    
                if(mChoice == 2){
                    //cancel
                    return '!CANCEL!';
                }
                //call again with forceSend = true
                return this.getCustomerAgingLink(mBuildersId, true, mIncludeDftStmt);  //recursive call
            }else{
                this.mbox(oData.errorMsg);
                return 'ERROR: ' + oData.errorMsg;
            }
           
        }

        if(mIncludeDftStmt){
            //send the whole thing back
            return resp
        }else{
            //just send the link
            return oData[0].link;
        }

    } // getCustomerAgingLink

    // *********************************************************************************
    // Force a waiting service worker (or workers) to skip waiting and take control
    // Returns: Logical. true if it activated a waiting service worker, otherwise false. SRR 02/22/2023
    Vue.prototype.Sublib.activateWaitingSW = function(mNoPageReload){

        if (!this.serviceWorkerReg){
            // nothing to do
            return false;
        } 

        if (!this.serviceWorkerReg.waiting){
            // have a service worker but nothing waiting, force a check for an update? 
            this.serviceWorkerReg.update(); // may call this again via methods that get called with the .update()
            return false;
        }
        

        localStorage.setItem('runAfterUpdt', true); // next page reload will check for this
        //while (this.serviceWorkerReg.waiting){          
            // Force it to activate now so don't have an update loop. SRR 02/22/2023
            this.serviceWorkerReg.waiting.postMessage({action: 'ACTIVATE'});
        //}

        if (!mNoPageReload){
            window.location.reload(true); // true means get from server, NOT Cache
        }

        return true;

    } // activateWaitingSW


    // *********************************************************************************
    // Get the list of languages we support. Moving here since it's not on settings and the sign in page
    // NOTE: If you add a language here, make sure you add it in this.showTranslateMenu() AND this.getSelLang() !!
    Vue.prototype.Sublib.getLangList = function(){
        //This assumes all flag files are named flag__.png where __ = country code (i.e. US or CA)
        return [
            //{ text: 'English', value: 'en' },
            { text: 'English (US)', value: 'en-us', icon: 'flagUS.png'  },
            { text: 'English (Canada)', value: 'en-ca', icon: 'flagCA.png' },
            { text: 'English (UK)', value: 'en-uk', icon: 'flagUK.png' },
            { text: 'English (Australia)', value: 'en-au', icon: 'flagAU.png' },
            { text: 'English (Signapore)', value: 'en-sg', icon: 'flagSG.png' },
            { text: 'Español (México)', value: 'sp-mx', icon: 'flagMX.png' }, // default, no special mx translation
            { text: 'Español (América Latina)', value: 'sp-la', icon: 'flagLA.png' },
            { text: 'Deutsch (Deutschland)', value: 'ge', icon: 'flagGE.png' },
            { text: 'Português (Brasil)', value: 'pt-br', icon: 'flagBR.png'}, // default
            
        ];
    } // getLangList


    // *********************************************************************************
    // Get the current selected language. 
    // 
    // returns char. i.e. 'en-us'
    Vue.prototype.Sublib.getSelLang = function(){

        var mLang = localStorage.getItem('lang');

        var oLangs = this.getLangList();

        // see if we can figure it out from their browser/phone settings. SRR 03/28/2023
        var browserLang = navigator.language; // something like 'en-US' for english US, 'es-US' for espanol US, 'en-CA' for english Canada, etc. 
        var browserCntry = navigator.language
        if (browserLang && !mLang){
            browserLang = this.left(browserLang, 2);
            // try to convert it (i.e. we store out 'sp' for spanish instead of 'es' for espanol)
            if (browserLang == 'en'){
                // nothing to do
            } else if (browserLang == 'es'){
                // spanish
                browserLang = 'sp';
            } else if (browserLang == 'de'){
                // german
                browserLang = 'ge'
            } else if (browserLang == 'pt'){
                // portugese, nothing to do
            } else {
                // not a supported langauge
                browserLang = 'en';
            }
            mLang = browserLang;
        } // browserLang
        if (!mLang){
            mLang = 'en'
        }


        var mLangCntr = localStorage.getItem('langCntry');
        if (!mLangCntr){
            mLangCntr = localStorage.getItem('userBranchCountryCode');
        }
        if (!mLangCntr){
            if (browserCntry){
                browserCntry = this.right(browserCntry, 2).toLowerCase(); // en-US => us

                // see if it's supported
                if (oLangs.find(obj => this.right(obj.value, 2) == browserCntry)){
                    // supported
                    mLangCntr = browserCntry
                } else {
                    browserCntry = '';
                }
            } else {
                mLangCntr = '';
            }
        } // !mLangCntr

        var mRetVal;
        mRetVal = mLang + (mLangCntr ? '-' + mLangCntr : '');
        // make sure it really exists (i.e. we used user branch country code and there's no language override for it)
        
        var oHold = oLangs.find(obj => obj.value == mRetVal);
        if (!oHold){
            // Default to the top one in the list for that language (i.e. US)
            mRetVal = oLangs.find(obj => this.left(obj.value, 2) == mLang).value;
            this.updtLang(mRetVal, false);
            
        } else {
            // make sure we save out the userBranchCountryCode to langCntry 
            this.updtLang(mRetVal, true);
        }

        return mRetVal
    } // getSelLang


    //************************************************************
    // Save out a new language
    Vue.prototype.Sublib.updtLang = function(mNewLang, mNoPageRefresh){
        // mLang = Char. value prop from getLangList
        // mNoPageRefresh = logical. If true, will not refresh the page, just stores out the value
        var mLang, mCountry;  
        if (this.contains(mNewLang, '-')){
            mLang = mNewLang.substring(0, mNewLang.indexOf('-')); // 'en'
            mCountry = mNewLang.substring(mNewLang.indexOf('-') + 1); // 'us' or 'ca'
        } else {
            mLang = mNewLang; // i.e. 'en', 'sp', 'ge'
            mCountry = '';
        }

        localStorage.setItem('lang', mLang);
        localStorage.setItem('langCntry', mCountry);

        this.loadLangPack(mLang);

        if (!mNoPageRefresh){
            // seems to be picking up language changes without a page refresh ever since I moved it to Sublib... Not sure why but I'll take it. SRR 03/28/2023
            //this.router.go(); // refresh the page to reflect the language change
        }
    } // updtLang



    //************************************************************
    // Translate from one langauge to another
    // Returns: Char. either the translated text or '' if it failed 
    Vue.prototype.Sublib.translate = async function(mText2Translate, mNewLang, mOrigLang){
        // mText2Translate = Char. 
        // mNewLang = Char. 2 digit code. (i.e. 'DE' for german or 'ES' for spanish)
        // mOrigLang = Char. 2 digit code. Optional. Figures it out if not passed

        if (this.offline()){
            this.mbox(this.getLbl('not avail offline'));
            return '';
        }

        if (!mOrigLang){
            mOrigLang = ''; // auto detect
        }

        var mURL =this.getWSUrl() + 'cpGetusers/translateText';
        var oBodayParams = {
            text: mText2Translate,
            newLang: mNewLang,
            origLang: mOrigLang
        }

        var resp = await this.RestClient.postNoCache(mURL, {}, oBodayParams);
        var oData =this.wsResp2Obj(resp);
        if (oData.errorMsg){
            this.mbox(oData.errorMsg);
            return '';
        }

        return oData[0].newtext;

    } // translate


    //************************************************************
    // Translate from one langauge to another
    // Show the menu so they can choose what language to translate to / from
    Vue.prototype.Sublib.showTranslateMenu = async function(mText2Translate, copy2ClipboardOpt, onlyReturnCode){
        // mText2Translate = Char.
        // copy2ClipboardOpt = Logical. If true, adds a copy to clipboard option to the mbox
        // onlyReturnCode = Logical. If true, shows the menu (so the language list is only in 1 spot) and returns the language they selected

        var oMenu = [
            { desc: this.getLbl('to') + ' English', code: "EN", icon: '', },
            { desc: this.getLbl('to') + ' Español', code: "SP", icon: '', },
            { desc: this.getLbl('to') + ' Deutsch', code: "GE", icon: '', },
            { desc: this.getLbl('to') + ' Português', code: "PT", icon: '', },
        ];

        var mChoice = await this.showMenu(oMenu);
        mChoice = mChoice.toUpperCase();
        if (!mChoice){
            return;
        }

        if (onlyReturnCode){
            return mChoice
        }

        // var mOrigLang, mNewLang;
        // mOrigLang = this.left(mChoice, 2);
        // mNewLang = this.right(mChoice, 2)
        this.showMsg(this.getLbl('translating'), false, true);
        var mTranslated = await this.translate(mText2Translate, mChoice);
        this.showMsg();

        if (mTranslated){
            if (copy2ClipboardOpt){
                var mChoice = await this.mbox(mTranslated, this.getLbl('copy'), this.getLbl('ok'));
                if (mChoice == 1){
                    // copy to clipboard
                    this.copy2Clipboard(mTranslated);
                    this.showMsg(this.getLbl('copied to clipboard'));
                }
            } else {
                this.mbox(mTranslated)
            }
            
        }

        return mTranslated;
    } // showTranslateMenu


    //************************************************************
    // Get / set a background image based on user settings (either custom picture, random picture, or nothing)
    Vue.prototype.Sublib.getUsersBGImg = async function(mForceNew){
        // mForceNew = Logical. If true, will ignore if it's already in session storage and check again.
        

        if (this.hittingSandbox()){
            // Show the sandbox picture. SRR 09/13/2023
            let sandboxURL = '/img/SandboxLandscape.png';
            sessionStorage.setItem('appBG', sandboxURL);
            this.showBGImg(sandboxURL);
            return;
        }

        if (localStorage.getItem('userType') != 'FULL' || !this.getConnectInfo('token')){
            // for now, only show BG pics to full / office logins
            return;
        }

        if (this.oVuetify.breakpoint.mdAndDown){
            // won't see it any
            return;
        }

        
        // first, check to see if we already have it
        var mBGImg = sessionStorage.getItem('appBG');
        if (mForceNew){
            mBGImg = '';
        }

        if (mBGImg){
            if (mBGImg == 'NONE'){
                // not set to show pictures
                return;
            }

            // see if it still exists on the server
            var mURLExists = await this.RestClient.doesURLExist(mBGImg);
            if (mURLExists){
                this.showBGImg(mBGImg);
                return;
            } else {
                // temp file deleted, get a new one
            }
        }


        if (this.offline()){
            return;
        }

        if (window.gettingBGimg){
            // If this is called twice (i.e. on load from app.vue and home-office.vue) only get 1 pic. SRR 03/30/2023
            return;
        }

        window.gettingBGimg = true;


        // Make a call to the web service to get the URL we need
        var mURL = this.getWSUrl() + 'cpGetusers/getBGImg';
        var oParams = {};

        var resp = await this.RestClient.getNoCache(mURL, oParams);

        window.gettingBGimg = false;

        var oData =this.wsResp2Obj(resp);
        if (oData.errorMsg){
            this.mbox(oData.errorMsg);
            return;
        }

        if (!oData[0].imgurl){
            // not set to use picture backgrounds
            sessionStorage.setItem('appBG', 'NONE');
            return;
        }

        // Have a valid background. Let's show it
        sessionStorage.setItem('appBG', oData[0].imgurl);
        this.showBGImg(oData[0].imgurl);

        return;
        
    } // getUsersBGImg


    //************************************************************
    // Show a global background image or hide it
    Vue.prototype.Sublib.showBGImg = function(mBGImg){
        // mBGImg = Char. Either URL path of image
        //          URL path can be relative '../img/myimage.png' or fullpath 'https://localws.cenpoint.com/tempdocs/testBG1.jpg'
        //          Pass '' or nothing to remove the background image
        var oAppHTML = document.getElementById('app');

        if (!oAppHTML){
            return;
        }

        if (mBGImg){
            //localStorage.setItem('appBG', mBGImg);
            oAppHTML.style.backgroundImage = 'url(' + mBGImg + ')'
            //this.bgImgShowing = true;
        } else {
            oAppHTML.style.backgroundImage = '' // turn off
            //this.bgImgShowing = false;   
        }

        EventBus.$emit('appBGShowing', (mBGImg))
        //this.Vue.nextTick();
    } // showBGImg


    //************************************************************
    // Check to see if we have the global back ground image showing
    // Returns: Logical. True if it's showing, false if it's not
    Vue.prototype.Sublib.bgImgShowing = function(){
        var oAppHTML = document.getElementById('app');

        if (!oAppHTML){
            return false;
        } else {
            return (oAppHTML.style.backgroundImage != '')
        }

    } // bgImgShowing

    //**************************************************************************************************************
    // get the customer logo to replace ours
    // cpInvoice is going to be 1 place to get all logo from
    Vue.prototype.Sublib.getCustLogo = async function(){

        var mURL = this.getWSUrl() + 'cpInvoice/getCustLogo';
        var oParams = {
            url: location.href
        }

        // make the key off of branchesId so I can get it even if we are offline if we have it
        var resp = await this.RestClient.get(mURL, oParams, 'getCustLogo');

        var oData = this.wsResp2Obj(resp);
        if (oData.errorMsg){
            // either an invalid link or no custom logo uploaded. Either way, I'm out
            return; 
        }

        var mDataStr, mFileExt = oData[0].fileext;

        mDataStr = this.getMimeType(mFileExt);
        if (!mDataStr){
            // custom logo not supported
            return;
        }

        var oLogo = document.getElementById('appBarLogo');
        oLogo.src = 'data:' + mDataStr + ';base64,' + oData[0].base64;

        if (oData[0].website){
            // launch a new tab with the customers website                
            var mWebSite = oData[0].website;
            // if (!this.contains(mWebSite, 'www', true) && this.occurs(mWebSite, '.') < 2){
            //     // convert 'cenpoint.com' to 'www.cenpoint.com'
            //     mWebSite = 'www.' + mWebSite
            // }
            if (!this.contains(mWebSite, 'http://') && !this.contains(mWebSite, 'https://')){
                // convert 'cenpoint.com' to 'http://cenpoint.com'
                // NOTE: HAVE to do this or the browser just adds 'cenpoint.com' to the end of the current url!
                // Since it wasn't specified, just to http:// and expect IIS or whatever hosts the website to force https if it wants to
                mWebSite = 'http://' + mWebSite
            }
            oLogo.onclick = function(){
                window.open(mWebSite, '_blank');
            }
        }
        // our logo is 37x35, make it an even 40x40
        
    } // getCustLogo



    //**************************************************************************************************************
    // This will check to see if there is a banner message that we need to display to our customers from us. SRR 04/05/2023
    Vue.prototype.Sublib.getBannerMsg = async function(){

        if (this.offline()){
            // see if there's a cached message
            var mWOCacheKey = 'getBannerMsg';
            var mHold = await this.IDB.req('cachedWSResp', 'get', mWOCacheKey);

            if (mHold){
                var oHold = this.wsResp2Obj(mHold);
                var mNow = await this.getDate(true);
                // NOTE: start/end date are in mountain time but since we're offline, use their local time for comparison in offline mode... 
             
                if (!oHold.errorMsg && oHold[0] &&  mNow < this.newDate(oHold[0].enddt)){
                    // it's still good. return it.
                    return oHold[0];
                }
            }

            return {};
        }


        var mType = (localStorage.getItem('userType') == 'FULL' ? 'OFFICE' : 'TECH');

        var mURL = this.getWSUrl() + 'banner/getMessages';
        var oParams = {
            type: mType
        }

        // make the key off of branchesId so I can get it even if we are offline if we have it
        var resp = await this.RestClient.get(mURL, oParams, 'getBannerMsg');

        var oData = this.wsResp2Obj(resp);
        if (oData.errorMsg){
            if (this.contains(oData.errorMsg, 'No open messages', true)){
                // not really an error
            } else {
                this.mbox(oData.errorMsg)
            }

            return {};
        }

        //oData[0].msg = this.replaceAll(oData[0].msg, '\\\\n', '<br />'); // works in conjection with v-html above

        return oData[0]; // may be multiple messages... for now just show the top 1

    } // getBannerMsg

    

    //**************************************************************************************************************
    // This is a generic method around push notification hanlders like Firebase or something else in the future
    Vue.prototype.Sublib.initPushNotif = async function () {

        //we are using firebase for push notifications MA 04/21/2023
        var pushEnabled = localStorage.getItem('pushNotifs');

        if (pushEnabled == 'false' || (typeof this.convFromStr(pushEnabled) == 'boolean' && !this.convFromStr(pushEnabled))){
            // user has disabled push notifications
            return;

        } else if (this.isTestingIP(false) && this.isProdDB(false)){
            // dev IP on a production database (NOTE: Will still turn on for CPCutting, etc)
            localStorage.setItem('pushNotifs', false);
            return;
        } 


        await this.initFireBase();
    
    } //initPushNotif

    //**************************************************************************************************************
    // Enable FireBase Push notifications
    Vue.prototype.Sublib.initFireBase = async function (forceUpdt) {
        // forceUpdt = Logical. If true, will force an update of the token even if we think it hasn't changed (i.e. got out of sync with the DB)

        var pushToken;



        if (this.usingWebview()) {

            // Define the 'call back' method that the IOS/android webview will call since we can't get a response directly
            window.setFBToken = function (token, mOldToken) {
                localStorage.setItem('fbm_token_hold', token)  //we are just going to save it in localstorage so we can access it later
                window.FBToken = token;
            }
            window.updateFBMToken = this.updateFBMToken; // needed for call back stuff later (webview calls this method so MUST be globlally available WITH this method name!)
            window.g_Sublib = this; // ONLY SET THIS IN THE WEBVIEW, makes window.updateFBMToken work. SRR 05/15/2023
            

            if (this.usingWebview('ios')){
                try {
                    webkit.messageHandlers.getToken.postMessage({}); // tell the webview to get me a dang token
                } catch (error) {
                    // if they do not have the IOS update, make sure that this does not error out MA 05/09/2023
                    return;
                }
            } else if (this.usingWebview('android')){
                try {
                    android.initFBMessage(); // get the token
                } catch (error) {
                    // if they do not have the android update, make sure that this does not error out MA 05/09/2023
                    return;
                }
            }

            //create a saveFBToken global function to handle the response
            //Webkit creates a 'public' window variable as a response since it can't just send it back
            var maxTries = 10, tryNo = 0;
            while (!window.FBToken && tryNo <= maxTries){
                await this.sleep(1000 * 2);
                tryNo++;
            }

            pushToken = window.FBToken;
            if (window.FBToken){
                delete window.FBToken;
            }

            
            if (!pushToken){
                // no update (or it failed?)
                //get it from local storage that we saved earlier
                pushToken = localStorage.getItem('fbm_token_hold');
            }

            if(pushToken){
                //compare if the old token is the same as new token
                var oldToken = localStorage.getItem('fbm_token');
                if (oldToken == pushToken && !forceUpdt){
                    //same token, no need to update
                    // if(this.isTestingIP()){
                    //     await this.mbox('same token, no need to update' + pushToken);
                    // }
                    return;
                }else{
                    //different token, update it
                    localStorage.setItem('pushType', 'fbm');  
                    localStorage.setItem('fbm_token', pushToken);

                    // if(this.isTestingIP()){
                    //     await this.mbox('different token, update it' + pushToken);
                    // }
    
                    await this.updateFBMToken(pushToken, true, oldToken);
                }

            }else{
                // couldn't get it back
                if (this.isTestingIP()){
                    await this.mbox('Push Notifications NOT Enabled! Push Token = ' + pushToken);
                }
            }

            //clear out fbm_token_hold so we don't use it again
            localStorage.removeItem('fbm_token_hold');

            return;
        

        } else {
            // running in the browser / using the service worker for push notifications
            if (!('Notification' in window) && !this.isIOS()) {
                // browser doesn't support notifications. 

                //NOTE: as of 5/8/2023 Safari does not support push notification on their safari browser, but they do on web apps installed on home screen 
                //refer: https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/

                //so for now, we will not show this message if IOS because not sure if they are coming from browser or home app
                //if on browser, it will just not show the push notification 

                this.showMsg(this.getLbl('browser does not support push notification'), 3)

                //update the localstorage so they do not get this message again
                localStorage.setItem('pushNotifs', 'false');
                return;
            }

            localStorage.setItem('pushType', 'fbm');

            if (Notification.permission === "default") { //|| Notification.permission === "denied") { Browser won't prompt again, just don't do anything
                // tell them what we are about to do so they don't blindly say no
                var mMessage = this.getLbl('push notif dialog')

                await this.mbox(mMessage)

                // this will request for a permission
                var permission = await Notification.requestPermission();

                if (permission === 'granted') {
                    // this.mbox('Notification permission granted.')
                } else {
                    //console.log('Unable to get permission to notify.');
                    this.mbox(this.getLbl('push notif permission denied'))
                    return;
                }

                this.actuallyInitFireBase();

            } else if (Notification.permission == 'granted') {
                // if permission has already been granted, won't prompt again.
                //this.mbox('Notification permission granted.')
                this.actuallyInitFireBase();
            }else{
                //denied
                //this.mbox(this.getLbl('push notif permission denied'))
                return
            }
        } //browser

    } // initFireBase

     //**************************************************************************************************************
    // Enable FireBase Push notifications
    Vue.prototype.Sublib.getPushTokens = async function () {

        // MOVE THIS TO pushNotif.prg 
        var mURL = this.getWSUrl() + 'pushNotif/getPushToken';

        var oParams = {
            keyType: 'FIREBASE',
        }

        var resp = await this.RestClient.getNoCache(mURL, oParams);
        
        var oData = this.wsResp2Obj(resp);
        if (oData.errorMsg){
            this.mbox(oData.errorMsg);
            return ''
        }

        var oFBObj = oData[0];

       return oFBObj;

    } // getPushTokens

    //**************************************************************************************************************
    // Enable FireBase Push notifications
    Vue.prototype.Sublib.actuallyInitFireBase = async function () {

        var oFBObj = await this.getPushTokens();

        // Your web app's Firebase configuration
        // For Firebase JS SDK v7.20.0 and later, measurementId is optional
        const firebaseConfig = {
            apiKey: oFBObj.apikey,
            authDomain: "cp-mobile.firebaseapp.com",
            databaseURL: "https://cp-mobile.firebaseio.com",
            projectId: oFBObj.projectid,
            storageBucket: "cp-mobile.appspot.com",
            messagingSenderId: oFBObj.messagingsenderid,
            appId: oFBObj.appid,
            measurementId: oFBObj.measurementId
        };

        var messageChannel = new MessageChannel();

        messageChannel.port1.onmessage = function(event) {
            console.log(event.data);
        };
        // This sends the message data as well as transferring messageChannel.port2 to the service worker.
        // The service worker can then use the transferred port to reply via postMessage(), which
        // will in turn trigger the onmessage handler on messageChannel.port1.
        // See https://html.spec.whatwg.org/multipage/workers.html#dom-worker-postmessage

        navigator.serviceWorker.getRegistrations().then(function(registrations) {
            registrations.forEach(function(v) { 
                // console.log('service worker: ' + JSON.stringify(v)) 

                if(v.active.scriptURL.indexOf('firebase-messaging-sw.js') > -1){
                    //postMessage to the service worker
                    v.active.postMessage(oFBObj, [messageChannel.port2]);
                }
            });
          });

        // navigator.serviceWorker.controller.postMessage({'hello': 'world'}, [messageChannel.port2]);


        const app = fb_initializeApp(firebaseConfig);
        const analytics = fb_getAnalytics(app);

        this.initFireBaseMessaging(oFBObj.clientid);

    } // actuallyInitFireBase

    //************************************************************************************************************************* */
    Vue.prototype.Sublib.initFireBaseMessaging = async function (mClientId) {

        // Get registration token. Initially this makes a network call, once retrieved
        // subsequent calls to getToken will return from cache.
        const mFBMessaging = fb_getMessaging();

        try {
            var currentToken = await fb_getToken(mFBMessaging, { vapidKey: mClientId })

            if (currentToken) {
                // this is called if the user granted permission (runs Asynchrounously first time, pulls from cache after that)
                // called from mFBMessaging.getToken();
                // the token is how we know which device to send messages to
                // NOTE: 'token' is null if we did not call mFBMessaging.getToken() because we already have a token, nothing to save
                var oldToken = localStorage.getItem('fbm_token');

                if (!oldToken) {
                    // set token
                    localStorage.setItem('fbm_token', currentToken);
                    this.updateFBMToken(currentToken);
    
                } else if (currentToken != oldToken) {
                    // update our records
                    localStorage.setItem('fbm_token', currentToken);
                    this.updateFBMToken(currentToken, true);
                }
            }else{
                // Show permission request UI
            }
            
        } catch (error) {

            //on Brave browsers, users need to allow special permission for the push notification to work
            //so find out if the browser they are using is brave. Interestingly, the user agent for brave just reports Chromium so we have to do a little more work MA 06/26/2023
            if(navigator.brave && await navigator.brave.isBrave() || false){
                //brave browser

                var mMsg = this.getLbl('brave browser allow push notification');

                this.mbox(mMsg  + '\n\n' +  '<img src="img/bravePushSetting.jpg" style="max-width:100%" />');

                return;
            }
            console.log('An error occurred while retrieving token. ', error);
            // user denied permission. Tell them they will not get messages and prompt again
            if (error.message.toLowerCase().indexOf('secure origin') > -1) {
                // should never hit this. Firebase messaging only works over https but that's what we use so shouldn't be a problem
                // this.mbox(this.getLbl('failed to initialize push notif') + '\n\n' + error.message);
                this.showMsg(this.getLbl('failed to initialize push notif') + '\n\n' + error.message, 3)
                return;
            } else {
                if (error.message.toLowerCase().indexOf('support') > -1) {
                    // browse doesn't actually support Notifications, switch to text
                    // localStorage.setItem('pushType', 'text');
                    //this.initTextNotifications();
                    return;
                }

                // this.mbox(this.getLbl('failed to initialize push notif') + '\n\n' + error.message);
                this.showMsg(this.getLbl('failed to initialize push notif') + '\n\n' + error.message, 3)
                return;

                // var mMessage = 'You cannot recieve notifications such as new Work Orders or Reschedule Notifications if you do not allow this service.'
                //     + 'Please allow CenPoint Portal to use "Desktop Notifications"'
                //     + 'You will need to manually allow this in your browser settings';
                //     this.mbox(mMessage);

            }
            
        }

       //this is the code that handles token refreshes on browser MA 05/15/2023
       //as per to the documentation, I cannot get this to work MA 05/16/2023
    //    mFBMessaging.onTokenRefresh( async function (){
    //         var _this = this;
    //         // occasionally the FCM server dishes out a new token, watch for this
    //         try {
    //             var currentToken = await fb_getToken(mFBMessaging, { vapidKey: mClientId })
    
    //             if (currentToken) {
    //                 // this is called if the user granted permission (runs Asynchrounously first time, pulls from cache after that)
    //                 // called from mFBMessaging.getToken();
    //                 // the token is how we know which device to send messages to
    //                 // NOTE: 'token' is null if we did not call mFBMessaging.getToken() because we already have a token, nothing to save
    //                 var oldToken = localStorage.getItem('fbm_token');
    
    //                 if (!oldToken) {
    //                     // set token
    //                     localStorage.setItem('fbm_token', currentToken);
    //                     _this.updateFBMToken(currentToken);
        
    //                 } else if (currentToken != oldToken) {
    //                     // update our records
    //                     localStorage.setItem('fbm_token', currentToken);
    //                     _this.updateFBMToken(currentToken, true);
    //                 }
    //             }
                
    //         } catch (error) {
    //             //failed to get the new token, not sure what to do
    //             console.log('An error occurred while refreshing token. ', error);
    //         }
    //     });
        
    } // initFireBaseMessaging

    //************************************************************************************************************************* */

    Vue.prototype.Sublib.updateFBMToken = async function (fbm_token, updateRec, fbm_token_old, activate, deActivate, cellCoId) {
        // token = token to save out (152 char string)
        // updateRec = boolean. if token 'refreshed' and we got a new token, need to update in our recs so we don't keep trying to send messages to old token
        //      Needs both old id and new id
        // activate = turn on active flag for existing rec
        // deactivate = turn off active flag for existing rec
        // NOTE: If only the fbm_token is passed in, it's assumed that we're adding a new rec

        // this.mbox('updateFBMToken: ' + fbm_token + '\n\n' + updateRec + '\n\n' + fbm_token_old + '\n\n' + activate + '\n\n' + deActivate + '\n\n' + cellCoId);

        var oldToken = localStorage.getItem('fbm_token');

        var _this;

        //for some reasons, doing this.getDeviceInfo was throwing errors, so just doing try catch so that when we call from webview, we still have access to the sublib MA 05/15/2023
        try {
            this.getDeviceInfo()
            _this = this;
        } catch (error) {

            _this = window.g_Sublib; // set by initFB]
            //_this.mbox('on webview: ' + fbm_token + '\n\n' + updateRec + '\n\n' + fbm_token_old + '\n\n' + activate + '\n\n' + deActivate + '\n\n' + cellCoId)
        }

        // var _this;
        // if (this.getDeviceInfo()){
        //     _this = this;
        // } else {
        //     _this = window.g_Sublib; // set by initFB
        //     _this.mbox('on webview: ' + fbm_token + '\n\n' + updateRec + '\n\n' + fbm_token_old + '\n\n' + activate + '\n\n' + deActivate + '\n\n' + cellCoId)
        // }


        localStorage.setItem('fbm_token', fbm_token);

        if (!fbm_token) {
            fbm_token = oldToken;
        }

        if (!updateRec) {
            updateRec = false;
        }

        if (!fbm_token_old) {
            fbm_token_old = '';
        }

        if (!activate) {
            activate = false;
        }

        if (!deActivate) {
            deActivate = false;
        }

        var oDevice = _this.getDeviceInfo();
        
        var mDeviceDesc = oDevice.description // i.e. Nexus 7 (Android 6.0.1)

        //shorten mDeviceDesc to 100 chars
        if (mDeviceDesc.length > 100) {
            mDeviceDesc = _this.left(mDeviceDesc, 100);
        }

        if(!fbm_token) {
            // called from android (code that loads webview)
            // but they aren't signed in yet, nothing to do.
            return;
        }

        var oParams = {
            pushProvider : 'FBM',
        }


        var app, _platform;
        if (this.usingWebview()){
            app = 'Native'
        } else {
            app = oDevice.browser.toProperCase();
        }

        if (this.isIOS()){
            _platform = 'iOS';
        } else if (this.isMac()){
            _platform = 'Mac';
        } else if (this.isAndroid()){
            _platform = 'Android'
        } else {
            // Guess windows
            _platform = 'Windows'
        }

        var mBodyParams = {
            'fbm_token': fbm_token,
            'device_desc': mDeviceDesc,
            'update_rec': updateRec,
            'fbm_token_old': fbm_token_old,
            'activate': activate,
            'deactivate': deActivate,
            'platform': _this.left(_platform, 20),
            'app': _this.left(app, 20),
        };

        
        var mURL =_this.getWSUrl() + 'pushNotif/updatePushToken';
        var resp = await _this.RestClient.post(mURL, oParams, mBodyParams, 'updatePushToken');

        // _this.mbox('updateFBMToken: ' + JSON.stringify(resp));

        var oData =_this.wsResp2Obj(resp);
        if (oData.errorMsg){
            _this.mbox(_this.getLbl('failed to save notif token') + '\n\n Error Message: ' + oData.errorMsg);
            return false;
        }

        // save/ update Successful
        var mMsg = '';
        if (activate || !deActivate) {
            mMsg = _this.getLbl('push notif enabled');
        } else {
            mMsg = _this.getLbl('push notif disabled');
        }

        _this.showMsg(mMsg, 3)

    } // updateFBMToken

    //************************************************************************************************************************* */

    Vue.prototype.Sublib.deleteFBMToken = async function (fbm_token) {
        // NOTE: This will delete the rec out of SQL.
        // if all we want is to deactivate this device, call updateFBMToken instead and pass true for 'deactive'

     
        //var mDeviceDesc = getDeviceDtl(false, true) + ' (' + getDeviceDtl(true) + ')'; // i.e. Nexus 7 (Android 6.0.1)
        fbm_token = fbm_token ? fbm_token : localStorage.getItem('fbm_token')

        if(!fbm_token) {
            // called from android (code that loads webview)
            // but they aren't signed in yet, nothing to do.
            return;
        }

        var oParams = {
            pushProvider : 'FBM',
        }

        var mBodyParams = {
            fbm_token: fbm_token,
        };

        var mURL =this.getWSUrl() + 'pushNotif/deletePushToken';
        var resp = await this.RestClient.post(mURL, oParams, mBodyParams, 'deletePushToken');

        var oData =this.wsResp2Obj(resp);
        if (oData.errorMsg){
            if (this.contains(oData.errorMsg, 'no fbm token to delete', true)){
                // Never got saved, nothing to delete, treat it like it worked. SRR 05/26/2023
            } else {
                this.mbox(this.getLbl('failed to delete notif token') + '\n\n Error Message: ' + oData.errorMsg);
                return false;
            }
        }

        localStorage.setItem('fbm_token', '');

        // delete Successful
    } // deleteFBMToken

    //***********************************************************************************************************************************************
    //not used copied from angulare code MA 04/14/2023
    Vue.prototype.Sublib.initTextNotifications = async function (verifyInfo) {
        // use text messages to devices instead of firebase messages
        // only used for iOS and browsers that don't support notifications
        // preferred method is firebase messages

        await this.mbox('Text Notification is not supported yet!') //MA 05/05/2023

        return;

        // params 
        // verifyInfo = show message box / prompt even if token (phone number) is already set.
        verifyInfo = (Sublib.emptyNull(verifyInfo)) ? false : verifyInfo;

        if ((!Sublib.emptyNull(localStorage.getItem('fbm_token')) && !Sublib.emptyNull(localStorage.getItem('cellCoid'))
                || localStorage.getItem('fbm_email') == 'true')
            && !verifyInfo) {
            // nothing to do, already set.
            return;
        }

        var server = localStorage.getItem('login_servername');
        var custcode = localStorage.getItem('login_custcode');
        var token = localStorage.getItem('login_token');

        if (Sublib.emptyNull(server) || Sublib.emptyNull(custcode) || Sublib.emptyNull(token)) {
            // they aren't signed in yet, nothing to do.
            return;
        }

        // open dialog to prompt for phone number and carrier so we can send them messages
        // First, get list of carriers

        var mParams = {
            "custcode": custcode,
            "token": token, // our token
        };

        Restangular.setBaseUrl(server + '/cpmobile/cpgetusers/');
        Restangular.all("getPhoneCarriers").customGET("", mParams).then(function (response) {

            var mStart = response.indexOf(":[{");
            var mEnd = response.lastIndexOf("}]}");

            if (mStart != -1 && mEnd != -1) {
                // actual data returned
                var mUsableData = response.substr(mStart + 1, mEnd + 2 - (mStart + 1));
                try {
                    $rootScope.phoneCarriers = JSON.parse(mUsableData);
                    var mHold = '';

                    // now show UI to have them enter phone number and choose carrier
                    $rootScope.regNumForm = ngDialog.open({
                        template: 'AngularJS/TextNotification/loadRegNum.html'//,
                        //scope: $rootScope,

                    });

                    $rootScope.regNumForm.closePromise.then(function (data) {
                        // make sure they didn't close by clicking 'escape' on keyboard
                        if (data.value == true) {
                            localStorage.setItem('fbm_on', ($rootScope.textPushOn) ? 'true' : 'false');

                            if (!$rootScope.textPushOn) {
                                // they turned off push notifications, nothing to do
                                return;
                            }

                            var mOldToken = localStorage.getItem('fbm_token');
                            mOldToken = (Sublib.emptyNull(mOldToken)) ? '' : mOldToken;

                            //var mUseText = !Sublib.emptyNull($rootScope.phoneNum) && !Sublib.emptyNull($rootScope.carrier);
                            if (!Sublib.emptyNull($rootScope.phoneNum) && !Sublib.emptyNull($rootScope.carrier)) {


                                // make rest call to save number
                                Sublib.updateFBMToken(cleanNumber($rootScope.phoneNum), true, mOldToken, true, '', $rootScope.carrier)
                            }

                            if ($rootScope.recEmail) {
                                // checked email                                
                                Sublib.updateFBMToken('email', true, 'email', $rootScope.recEmail, !$rootScope.recEmail); // web service is looking for 'email'
                            }


                            // save local copy of the phone number and carrier
                            localStorage.setItem('fbm_token', !Sublib.emptyNull($rootScope.phoneNum) ? cleanNumber($rootScope.phoneNum) : '');
                            localStorage.setItem('cellCoid', !Sublib.emptyNull($rootScope.carrier) ? $rootScope.carrier : '');
                            localStorage.setItem('fbm_email', ($rootScope.recEmail) ? 'true' : 'false');

                            // reset values for future calls to this form / method
                            $rootScope.phoneNum = '';
                            $rootScope.carrier = '';
                            $rootScope.recEmail = false;
                        }

                    }); // dialog.closePromise.then()

                } catch (error) {
                    ngDialog.openConfirm({ data: { message: 'Error retreiving phone carriers: ' + response } });
                }
            } else {
                ngDialog.openConfirm({ data: { message: 'Error retreiving phone carriers: ' + response } });
            }

        }).catch(function (response) {
            ngDialog.openConfirm({ data: { message: 'Error retreiving phone carriers: ' + response } });
        });

    } // initTextNotifications


   


    //**************************************************************************************************************
    // Geo code builders
    Vue.prototype.Sublib.geoBldr = async function(blockCnt, throttle, silentMode){
        // m.blocksize = Numeric. How many customers to geo code. If not passed, defaults to 100.
        // m.throttle = Logical. If .F., it does not throttle the coding.
        // m.silentModeType = Numeric. pass 0 for no silent mode (default), 1 for mostly silent (wait windows show but no mboxs), and 2 for completely silent mode.

        if (!blockCnt){
            blockCnt = 250;
        }

        if (!silentMode){
            silentMode = 0;
        }

        var mURL = this.getWSUrl() + 'cpCust/geoBldr';
        var oParams = {
            blockCnt: blockCnt,
            throttle: throttle
        }

        // make the key off of branchesId so I can get it even if we are offline if we have it
        var resp = await this.RestClient.getNoCache(mURL, oParams);

        var oData = this.wsResp2Obj(resp);
        if (oData.errorMsg){
            this.mbox(oData.errorMsg)
            return
        }

        if (silentMode == 0){
            if (oData[0].coded == 0 && oData[0].notcoded == 0){
                this.showMsg(this.getLbl('everything is already geo coded'), 3)
            } else {
                var msg = this.getLbl('done geo coded results');
                msg = msg.replace('<CODED>', String(oData[0].coded));
                msg = msg.replace('<SKIPPED>', String(oData[0].notcoded));
                this.mbox(msg);
            }
        }

        return;

    } // geoBldr


    //**************************************************************************************************************
    // geo code jobs
    Vue.prototype.Sublib.geoJob = async function(blockCnt, throttle, silentMode){
        // m.blocksize = Numeric. How many customers to geo code. If not passed, defaults to 100.
        // m.throttle = Logical. If .F., it does not throttle the coding.
        // m.silentModeType = Numeric. pass 0 for no silent mode (default), 1 for mostly silent (wait windows show but no mboxs), and 2 for completely silent mode.

        if (!silentMode){
            silentMode = 0;
        }

        if (!blockCnt){
            blockCnt = 250;
        }

        var mURL = this.getWSUrl() + 'cpJobs/geoJob';
        var oParams = {
            blockCnt: blockCnt,
            throttle: throttle
        }

        // make the key off of branchesId so I can get it even if we are offline if we have it
        var resp = await this.RestClient.getNoCache(mURL, oParams);

        var oData = this.wsResp2Obj(resp);
        if (oData.errorMsg){
            this.mbox(oData.errorMsg)
            return
        }

        if (silentMode == 0){
            if (oData[0].coded == 0 && oData[0].notcoded == 0){
                this.showMsg(this.getLbl('everything is already geo coded'), 3)
            } else {
                var msg = this.getLbl('done geo coded results');
                msg = msg.replace('<CODED>', String(oData[0].coded));
                msg = msg.replace('<SKIPPED>', String(oData[0].notcoded));
                this.mbox(msg);
            }
        }

        return;

    } // geoJob

   


    
    //**************************************************************************************************************
    // Set focus to an element
    // NOTE: Hard to debug this as it takes focus out of the main window!
    Vue.prototype.Sublib.setFocus = async function(elementId, ctrlAIt, lessSleep){
        // elementId = Char or Object. Char = dom element Id to set focus to, Obj = this.$refs.txtMyField
        // ctrlAIt = Logical. If .T., selects / highlights all text in the input after it calls .focus. SRR 09/11/2023
        // lessSleep = Logical. If T. then instead of sleep for 1 sec, sleep for 0.5s. It was taking longer when focusing on time or date inputs

        if (typeof elementId == 'string'){
            // dom id
            var el = document.querySelector('#' + elementId);
            if(!el){
                //wait 
                if(lessSleep){
                    //on certain fields, it was taking longer to focus
                    await this.sleep(500)
                }else{
                    await this.sleep(1000);
                }
            }
            el = document.querySelector('#' + elementId);

            try {
                el.focus();
                if (ctrlAIt){
                    el.select();
                }
                
            } catch(ignore){
            }

        
        } else if (typeof elementId == 'object' && elementId.tagName && elementId.tagName == 'INPUT'){
            // Vue reference is directly on an 'input' tag (i.e. from dateInput) instead of a vuetify tag
            elementId.focus();
            if (ctrlAIt){
                el.select();
            }

        } else {
            // Vue reference object
            //this.$refs.myRef[0].$el.querySelectorAll('input')[0].focus()
            let el;
            while (true){
                if (elementId.$el){
                    el = elementId.$el;
                    break;
                }

                if (elementId[0]){
                    // drill down for our subclasses
                    elementId = elementId[0]
                } else {
                    // couldn't find it
                    break;
                }
            } // while

            if (!el){
                return;
            }

            // If it's a text box or something else, have hit the HTML element directly
            let oInput = el.querySelectorAll('input');

            if (oInput.length){
                try {
                    oInput[0].focus();
                    if (ctrlAIt){
                        oInput[0].select();
                    }
                } catch(ignore){
                }
            } else {
                try {
                    el.focus();
                    if (ctrlAIt){
                        el.select();
                    }
                } catch(ignore){
                }
            }


            // if(!el){
            //     //sleep for 1 second and try again
            //     await this.sleep(1000);
            //     //el = this.$refs.txtField
            // }
            // if (el){
            //     el.focus();
            // }
        }


    } // setFocus

     //**************************************************************************************************************
     // we are getting branches all over, so just writing a generic method so we can call from everwhere to get brancheslist
    Vue.prototype.Sublib.getBranches = async function(mIncludaAllOpts, mForceBranchesList, mForcedListOnly){

        var oBodyParams = {
            includeAllOpt: mIncludaAllOpts,
            forceBranchesList: mForceBranchesList,
            forceListOnly: mForcedListOnly
        }

        var mURL = this.getWSUrl() + 'cpGetUsers/getBranches'; 
        var oParams = {}

        var resp = await this.RestClient.post(mURL, oParams, oBodyParams, 'getBranches');

        var oData = this.wsResp2Obj(resp);
        if (oData.errorMsg){
            if (this.contains(oData.errorMsg, 'you are offline', true)){
                // load from our template
                var mBranchTemp = await this.getOfflineTemplate('branches');
                oData = this.wsResp2Obj(mBranchTemp);

                if (oData.errorMsg){
                    await this.mbox(oData.errorMsg);
                    return [];    
                }

            } else {
                await this.mbox(oData.errorMsg);
                return [];
            }
        }

        return oData;

    } // getBranches

    //**************************************************************************************************************
    //get valid file types. accepts file type (image, pdf, etc) and returns valid file types for that type. For now we are supporting only this.Sublib.inList(mFileType, ['JPG', 'JPEG', 'PNG', 'PDF', 'HEIC']
    Vue.prototype.Sublib.isValidFileType = function(mFileType, mSilentMode){
        // mFileType = Char. File type to get valid file types for. For now we are supporting only this.Sublib.inList(mFileType, ['JPG', 'JPEG', 'PNG', 'PDF', 'HEIC']
        var supportedFileTypes = ['JPG', 'JPEG', 'PNG', 'PDF', 'HEIC']

        if(this.inList(mFileType, supportedFileTypes)){
            return true;
        }else{
            if (!mSilentMode){
                //we do not support for now MA 05/17/2023
                var mHold = this.getLbl('unsupported file type');
                mHold = mHold.replace('<TYPE>', supportedFileTypes.join(', '));
                this.mbox(mHold);
            }
            return false;
        }
    } // isValidFileType

    //**************************************************************************************************************
    // copied from webservice sublib.invalidExt to check for invalid file type extensions MA 07/26/2023
    Vue.prototype.Sublib.invalidExt = function(mFileType, mSilentMode){

        if(!mFileType){
            return true;
        }

        mFileType = mFileType.toUpperCase(); // make sure it's upper case

        var invalidFileType = this.inList(mFileType, ['EXE', 'MSI', 'DMG', 'BAT', 'PRG', 'FXP', 'APP'])

        if(invalidFileType){
            if (!mSilentMode){
                var msg = this.getLbl('invalid file type')
                msg = msg.replace('<NAME>', mFile.name);
                this.mbox(msg);
            }
        }

        return invalidFileType;

    } // invalidExt


    //**************************************************************************************************************
    // See if EFT/ACH payments have cleared or not (Stripe let us know, Clover we have to check). SRR 05/24/2023
    // Returns: Logical. true if it worked, false if it hit an error
    Vue.prototype.Sublib.checkEFTPmts = async function(silentMode){
        // silentMode = Logical. If .T., hides the counts of what was checked.
		//	            Errors are always shown!

        if (this.offline()){
            return true;
        }

        if (!(this.hasSec(16) || this.hasSec(24))){
            this.mbox(this.getLbl('not authorized'));
            return false;
        }

        var mURL = this.getWSUrl() + 'cpPayments/updtEFTStatus';
        var oParams = {
            devMode: this.isTestingIP(),
            paymentId: '!ALL!'
        }

        // make the key off of branchesId so I can get it even if we are offline if we have it
        var resp = await this.RestClient.getNoCache(mURL, oParams);

        var oData = this.wsResp2Obj(resp);
        if (oData.errorMsg){
            this.mbox(oData.errorMsg)
            return false;
        }


        if (!silentMode){
            var msg = this.getLbl('efts checked');
            msg = msg.replace('<TOT>', String(oData[0].cleared + oData[0].failed + oData[0].nochange));
            msg = msg.replace('<CLEARED>', String(oData[0].cleared));
            msg = msg.replace('<FAILED>', String(oData[0].failed));
            msg = msg.replace('<NOCHANGE>', String(oData[0].nochange));

            this.mbox(msg);
        }
		 
        return true;

    } // getBannerMsg


    //**************************************************************************************************************
    // Get the iFrame key for google maps. NOTE: api key is limited to cenpoint.com
    Vue.prototype.Sublib.getMapIFrameKey = function(forceRefresh){
        // forceRefresh = Logical. If .T., forces a refresh of the key from the server

        var retval = localStorage.getItem('mapIFrameKey');
        
        if (!retval || forceRefresh){
            this.getMapIFrameKeyFromServer(); // async, don't want this method to be so don't wait for it
        }

        if (!retval){
            retval = '';
        }

        return retval;

    } // getMapIFrameKey


    //**************************************************************************************************************
    // Get the iFrame key for google maps. NOTE: api key is limited to cenpoint.com
    Vue.prototype.Sublib.getMapIFrameKeyFromServer = async function(){

        if (this.offline()){
            return
        }

        
        var mURL = this.getWSUrl() + 'cpGetUsers/getMapIFrameKey';
        var oParams = {}

        // make the key off of branchesId so I can get it even if we are offline if we have it
        var resp = await this.RestClient.get(mURL, oParams, 'getMapIFrameKey');

        var oData = this.wsResp2Obj(resp);
        if (oData.errorMsg){
            this.mbox(oData.errorMsg)
            return false;
        }

        localStorage.setItem('mapIFrameKey', oData[0].key);

    } // getMapIFrameKeyFromServer


    //**************************************************************************************************************
    // Get the label for the GL Account type (Asset, Liability, Equity)
    Vue.prototype.Sublib.getGLTypeLbl = function(type){
        // type = Char. 'A', 'E', or 'L'

        if (!type) return '';

        type = type.toUpperCase();
        let retval = '';
        if (type == 'A'){
            retval = this.getLbl('asset');
        } else if (type == 'L'){
            retval = this.getLbl('liability')
        } else if (type == 'E'){
            retval = this.getLbl('equity')
        }

        return retval;


    } // getGLTypeLbl

    //**************************************************************************************************************
    // Get the label for the GL Account suyb type (Bank, Revenue, Expense, Current, Long Term, etc)
    Vue.prototype.Sublib.getGLSubTypeLbl = function(type){
        // type = 3 Char code. 

        if (!type) return '';

        type = type.toUpperCase();
        let retval = '';
        if (type == 'REV'){
            retval = this.getLbl('revenue');

        } else if (type == 'EXP'){
            retval = this.getLbl('expense 2')

        } else if (type == 'BNK'){
            retval = this.getLbl('bank')

        } else if (type == 'RET'){
            retval = this.getLbl('retained earnings')

        } else if (this.inList(type, 'CUR', 'AR_', 'AP_', 'UNR', 'UNF', 'TAX')){
            // UNR = Un-Earned Revenue
            // UNF = 'Undeposited Funds
            retval = this.getLbl('current')

        } else if (type == 'LNG'){
            retval = this.getLbl('long term')

        } else {
            // some sub type that's just used internally
            retval = '';
        }

        return retval;


    } // getGLTypeLbl


    //**************************************************************************************************************
    // Get an '!ADD!' id, must be 10 characters long so parseJSON on the webservice doesn't shrink it down and cause problems. SRR 06/28/2023
    Vue.prototype.Sublib.getAddId = function(noAddPrefix=false){
        let randomgDig =  this.right(String(Math.random()), 5);

        if(noAddPrefix){
            return randomgDig;
        }

        return '!ADD!' + randomgDig;
    } // getAddId


    //**************************************************************************************************************
    // Get a comma seperated list of distinct(unique, do duplicates) Ids from an array of objects
    Vue.prototype.Sublib.getDistinctIds = function(array2Check, idField){
        let retval = '';
        for (var mx = 0; mx < array2Check.length; mx++){
            if (this.contains(retval, array2Check[mx][idField])){
                continue;
            }
            retval += (retval ? ',': '') + array2Check[mx][idField];
        }
        return retval;
    } // getAddId


    //**************************************************************************************************************
    // Format the GL Code. Didn't want this in a ton of places (i.e. multiple grids, glCBO, etc. )
    Vue.prototype.Sublib.formatGL = function(oGL){
        // oGL = Object. GL Code to format. Should have properties of glcode && (gldescript || descript)
        if (!oGL) return '';
        
        if (!oGL.glcode && !(oGL.gldescript || oGL.descript)){
            return '';
        }

        // added glhideno so smaller companies don't have to use GL #s, just descriptions. SRR 01/02/2024
        let retval = (oGL.glcode && !oGL.glhideno ? oGL.glcode + ' - ' : '') + (oGL.gldescript ? oGL.gldescript : oGL.descript)
        return retval;
    } // getAddId


    //**************************************************************************************************************
    // Get the max height for a data table so the OK button would still be visible, etc. 
    // NOTE: This assumes only 1 table per screen!
    // Returns: Char. i.e. '70px'
    Vue.prototype.Sublib.calcTableMaxHeight = function(htmlId, tableTopSet){  
        // htmlId = char. Id of the table so we know the parent element heights. SRR 07/28/2023
        // tableTopSet = Logical. If true, assume the table top is already where it's supposed to go and assume the area above it is off limits
        if (!htmlId){
            return ''; 
        }

        if (!this.left(htmlId) == '#'){
            htmlId = htmlId.replace('#', '');
        }

        let oTable = document.getElementById(htmlId);
        if (!oTable){
            return '';
        }


        let oContainer;
        let oHold = oTable;
        let dialog = false;
        while (!oContainer){
            if (!oHold.parentNode){
                return '';
            }

            oHold = oHold.parentNode;

            if (this.contains(oHold.classList.value, 'v-dialog', true)){
                // found the main container and we are in a popup
                dialog = true;
                oContainer = oHold.childNodes[0];
                break;
            } else if (oHold.id && oHold.id == 'router-view'){ // id=="app"
                // full page and we just hit the top app bar. 
                oContainer = oHold; //.childNodes[0];
                break;
            }
        } // while

        // figure out the height that we want the scroll grid (have to set in pixels, objoxious)  
        var mScrollSecHeight;

        let tableTop = oTable.getBoundingClientRect().top;

        let contentAboveTable = Math.abs((tableTopSet ? 0 : oContainer.getBoundingClientRect().top) - tableTop);  
        let contentBelowTable = Math.abs(oContainer.getBoundingClientRect().bottom - oTable.getBoundingClientRect().bottom);

        if (true || !dialog){
            // see if there is anything with a 'fixed' position that may throw off the getBoundingClientRect() calculations (i.e. findInv)
            // NOTE: this assumes only 1 fixed element at the bottom
            // see: https://stackoverflow.com/questions/35054777/get-all-elements-with-positionfixed-in-an-html-page
            let fixedElements = [...oContainer.getElementsByTagName("*")].filter(
                x => getComputedStyle(x, null).getPropertyValue("position") === "fixed"
            );
            if (fixedElements){
                for (var mx = 0; mx < fixedElements.length; mx++){
                    if (fixedElements[mx].getBoundingClientRect().top <= tableTop || this.contains(fixedElements[mx].classList.value, 'v-navigation-drawer', true)){
                        // above the table, carry on
                        continue;
                    }
                    contentBelowTable += fixedElements[mx].getBoundingClientRect().height;
                }
            }
        } // !dialog

        
        try {         
            var mTopBarHeight = this.getAppTopBarHeight();
            var mBottomBarHeight = this.getAppBottomBarHeight();
            // var vDialogMargins = 50;
            // var vCardActions = 36;
            mScrollSecHeight = window.innerHeight - mTopBarHeight - mBottomBarHeight - contentAboveTable - contentBelowTable;

        } catch (EdgeBug){
            mScrollSecHeight = window.innerHeight - 50 - 70 - 40 - 50 -50;
        }

        mScrollSecHeight = Math.floor(mScrollSecHeight);
        //mScrollSecHeight = Math.max(mScrollSecHeight, 100);

        return mScrollSecHeight - (dialog ? 40 : 0) + 'px';


    } // calcTableMaxHeight


     //**************************************************************************************************************
    // Drop down / open a select box. 
    // Returns: Logical. True if it can try to drop it down, false if it can't find the method to drop it down.
    Vue.prototype.Sublib.select_dropDown = function(oSelect){
        // oSelct = Object. From this.$refs.mySelect
        if (!oSelect) return false;

        let retval = false;
        try {
             // if (this.$refs[this.refId].onClick){
            //     this.$refs[this.refId].onClick();    
            // } else if (this.$refs[this.refId].$children[0].onClick){
            //     this.$refs[this.refId].$children[0].onClick();
            // } else if (this.$refs[this.refId].$children[0].$children[0].onClick){
            //     this.$refs[this.refId].$children[0].$children[0].onClick();
            // } else if (this.$refs[this.refId].$children[0].$children[0].$children[0].onClick){
            //     this.$refs[this.refId].$children[0].$children[0].$children[0].onClick();
            // } else if (this.$refs[this.refId].$children[0].$children[0].$children[0].$children[0].onClick){
            //     this.$refs[this.refId].$children[0].$children[0].$children[0].$children[0].onClick();
            // }
            while (true){
                if (oSelect.onClick){
                    oSelect.onClick(); // drops it down
                    retval = true;
                    break;
                }

                if (oSelect.$children && oSelect.$children[0]){
                    oSelect = oSelect.$children[0];
                } else {
                    break;
                }
            }
           
        } catch(ignore){
        }

        return retval;
        
    } // select_dropDown

      

      //**************************************************************************************************************
      //method to get the just the ext from
      Vue.prototype.Sublib.justExt = function(mFilename, upper){

        if(!mFilename){
            return ''
        }

        let ext = mFilename.substr(mFilename.lastIndexOf('.') + 1)

        if(upper){
            ext = ext.toUpperCase(); 
        }
        
        return ext;
    } // justExt

    //**************************************************************************************************************
    //method to get the filename with no ext
    Vue.prototype.Sublib.justStem = function(mFilename, upper){

        if(!mFilename){
            return ''
        }

        let ext = mFilename.substr(0, mFilename.lastIndexOf('.'))

        if(upper){
            ext = ext.toUpperCase(); 
        }
        
        return ext;
    } // justExt


    //**************************************************************************************************************
    //Format a journal entry reference type
    Vue.prototype.Sublib.formatJournalRefType = function(oJournal){
        // oJournal = Object (matches journal table structure)

        let addId = true;
        let retval = '';

        if (oJournal.refidtype == 'JRN'){
            addId = false;
            retval = this.getLbl('general journal');
            if (!this.contains(oJournal.journalid, '!ADD!', true)){
                retval += ' - ' + this.trimZeros(oJournal.journalid, 5);
            }

        } else if (oJournal.refidtype == 'INV'){
            retval = this.getLbl('invoice');

        } else if (oJournal.refidtype == 'PMT'){
            retval = this.getLbl('payment');

        } else if (oJournal.refidtype == 'REF'){
            retval = this.getLbl('refund');

        } else if (oJournal.refidtype == 'SRW'){
            retval = this.getLbl('surplus withdrawl');

        } else if (oJournal.refidtype == 'BKR'){
            retval = this.getLbl('bank register')

        } else if (oJournal.refidtype == 'VI_'){
            // Vendor Invoice
            retval = this.getLbl('bill')

        } else if (oJournal.refidtype == 'EXP'){
            // Expense
            retval = this.getLbl('expense')

        } else if (oJournal.refidtype == 'STB'){
            // Starting Balance
            retval = this.getLbl('starting balance');

        } else if (oJournal.refidtype == 'CLS'){
            // Closing Entry
            retval = this.getLbl('closing entry');

        } else if (oJournal.refidtype == 'DEP'){
            // Deposit
            retval = this.getLbl('deposit')

        } else if (oJournal.refidtype == 'FT_'){
            // Field Ticket
            retval = this.getLbl('field ticket')

        } else if (oJournal.refidtype == 'ST_'){
            // Service Ticket
            retval = this.getLbl('service ticket')
        }

        if (addId){
            retval += ' - ' + this.trimZeros(oJournal.refid, 5);
        }

        return retval;
    } // formatJournalRefType



    //**************************************************************************************************************
    // View the 'reference' for a journal entry transaction, i.e. the invoice, payment, etc. SRR 08/08/2023
    Vue.prototype.Sublib.viewJournalRefType = async function(oJournal, forceJournalView){
        // oJournal = Object. tied to this.oJournal[mx]
        // forceJournalView = Logical. If .T., forces the journal view even if we know the type of reference. SRR 12/02/2023

        let oParams, retval;

        if (forceJournalView || oJournal.refidtype == 'JRN' || this.left(oJournal.refid, 3) == 'IMP' || this.refidtype == 'STB'){
            //this.btnOptionsClicked(oJournal, 'VIEW');
            let journalId = oJournal.journalid;
            if (this.contains(journalId, '_'))
                journalId = this.left(journalId, 10); // something like '0000359492_9' See journalRef for when it adds this on

            oParams = {
                journalId: journalId
            }
            retval = await this.showSimplePopUp(this.Vue.extend(JRNDTL), oParams);

        } else if (oJournal.refidtype == 'INV'){
            if (oJournal.trantype == 'R'){
                // reversal / deleted the invoice
                oParams = {
                    dfltBranchesId: oJournal.branchesid,
                    dfltInvoiceId: oJournal.refid,
                    dfltStartDt: oJournal.dt,
                    dfltEndDt: oJournal.dt,
                }
                retval = await this.showSimplePopUp(this.Vue.extend(DELINV), oParams);
                                                                
            } else {
                oParams = {
                    invoiceId: oJournal.refid, 
                    branchesId: oJournal.branchesid, 
                    onlyInvWithBal: false, 
                    // startDt: this.DTOC(oJournal.dt), // CC fees, Add/Remove Tax, etc. is this date, we need the invoice date, just don't pass it or do anytime
                    // endDt: this.DTOC(oJournal.dt)
                }
                retval = await this.findInv_popup(oParams);
            }

        } else if (this.inList(oJournal.refidtype, 'PMT', 'SRW')){
            // Reg Payment or Payment FROM surplus
            let paymentId;
            if (oJournal.refidtype == 'SRW'){
                paymentId = 'S' + this.right(oJournal.refid, 9);
            } else {
                paymentId = oJournal.refid;
            }

            oParams = {
                branchesId: oJournal.branchesid, 
                paymentId: paymentId,
                startDt: this.DTOC(oJournal.dt),
                endDt: this.DTOC(oJournal.dt)
            }

            retval = await this.pmtHist_popup(oParams);

        } else if (oJournal.refidtype == 'REF'){
            // show surplus refund
            retval = await this.showSimplePopUp(this.Vue.extend(SURPLUS), {refundId: oJournal.refid, buildersId: oJournal.whonameid, dfltBranchesId: oJournal.branchesid})
            
        } else if (oJournal.refidtype == 'VI_'){
            // vendor invoice

            retval = await this.showSimplePopUp(this.Vue.extend(FINDVENDINVPOPUP), {vendorInvId: oJournal.refid, vendorId: oJournal.whonameid,  dfltBranchesId: oJournal.branchesid})

        }else if (oJournal.refidtype == 'EXP'){
            // expense

            var oFilters = { 
                branchesId: oJournal.branchesid,
                expenseId: oJournal.refid
            }

            retval = await this.showSimplePopUp(this.Vue.extend(FINDEXPENSE), 'oDfltFilters', oFilters);

        } else {
            // just open up the journal detail if we don't know the type. 
            oParams = {
                journalId: oJournal.journalid
            }
            retval = await this.showSimplePopUp(this.Vue.extend(JRNDTL), oParams);
        }

        return retval;

    } // viewJournalRefType


    //**************************************************************************************************************
    // List the GLs in order of hiearchy & how many levels deep they are
    Vue.prototype.Sublib.popGLHiearchy = function(oData, parentId, levelsDeep){
        // oData = Array of object we are playing with
        // parentId = Char. Optional. ParentId we are trying to get all kids for
        // levelsDeep = Numeric. Number deep we are in this crazy recursive stuff

        if (!parentId) parentId = '';
        if (!levelsDeep) levelsDeep = 0;

        let oGLs = [], oGLsHold;
        let tab = '\u0009 ';
        
        for (var mx = 0; mx < oData.length; mx++){
            if (oData[mx].parentgl != parentId) continue;
                
            oData[mx].levelsdeep = levelsDeep
            oGLs.push(oData[mx]);
            // Try to get all of the kids
            oGLsHold = this.popGLHiearchy(oData, oData[mx].glcodesid, levelsDeep+1); // recursive call
            oGLs.appendFrom(oGLsHold);
        } // for

        return oGLs
    } // popGLHiearchy


   



    //**************************************************************************************************************
    // Encrypt a string. see https://www.npmjs.com/package/crypto-js
    Vue.prototype.Sublib.encrypt = function(str2Encrypt, password, algorithm){
        if (!str2Encrypt){
            return '';
        } else if (!password){
            return str2Encrypt;
        }

        if (!algorithm)
            algorithm = 'AES';

debugger
        if (algorithm == 'AES'){
            return this.cryptoJS.AES.encrypt(str2Encrypt, password).toString();
        }
debugger
        
        

    } // encrypt

    

    //**************************************************************************************************************
    // Tell if they are hitting the sandbox
    // Returns: logical
    Vue.prototype.Sublib.hittingSandbox = function(){
        let hold = this.convFromStr(sessionStorage.getItem('useSandbox'));
        return (hold ? true: false); // account for null, etc. 
    }
    


   



    // *********************************************************************************
    // Delete certain params in the query string (i.e. custcode, token, etc.) in case they reload / so they aren't exposed
    // Call like: Sublib.deleteFromCurURL('custcode', 'token', ...)
    Vue.prototype.Sublib.deleteParamInURL = async function(...params){
        // ...params lets there be an large number of params and then you can iterate through them. Basically, make calling it more like VFP. SRR 01/26/2023
        // call
        if (arguments.length < 1){
            return false;
        }

        
        // convert it here to how it used to be passed in
        var mStr, aTestVals, ignoreCase;
        if (typeof arguments[0] == 'object'){
            // passed in the old way (array shows as an object)
            aTestVals = arguments[0];
            
        } else {
            // figure out all of the params I'm testing against
            aTestVals = [];
            for (var mx = 0; mx < arguments.length; mx++ ){
                aTestVals.push(arguments[mx]);
            }
        }


        if (!this.router){
            // on page load, may not be around quite yet if this is called from top of app.vue
            while (!this.router){
                await this.sleep(.1*1000)
            }
        }


        var mHash;
        mHash = this.routerRef.currentRoute.hash;
        var oParams = this.routerRef.currentRoute.query;
        
        var mPath = oParams.path;
        if (!mPath){
            mPath = location.pathname; // '/branches'
            mPath = this.strtran(mPath, '/', '');
        }
        // Keep the rest of the params and pass them on
        var mParamStr = '';
        for (var key in oParams){
            if (this.inList(key, aTestVals, true)){ 
            //if (this.Sublib.inList(key, ['token', 'path'])){ // I need the custcode for invoice links they can open in the office to take a payment over the phone
            // Just account for it on the screens that need it and delete it out for the screens that don't
                delete oParams[key];
            } else {
                mParamStr += (mParamStr ? '&' : '?') + key + '=' + oParams[key];
            }
        }
        if (mHash){
            mParamStr += mHash;
        }

        //this.Sublib.router.replace({ path: mPath, query: oParams, hash: mHash}); // doesn't work have to do it the hard way
        var mURL = this.getCurURL(false, false);                 
        mURL += mParamStr;
        window.history.replaceState(null, '', mURL);

        return true;
            
    } // deleteFromCurURL



    // *********************************************************************************
    // Check to see if they specified in their branch settings that they need to log out every so often if there is no activity
    // If so, create a timer that runs every 5 minutes or so and checks for activity. SRR 09/15/2023
    Vue.prototype.Sublib.startChkActivityTimer = async function(forceGetSetting){
        // forceGetSetting = Logical. If true, will look up the branch setting again to see if it's changed

        let timerMin = 1;
        let maxTimeToReply = 5;
        let mboxShowing = false;
        let mboxShowDtTm;

        if (this.tmrNoActivity || this.isAndroid() || this.isIOS())
            return; // already running or on a phone. I'm out
        

        let noActivityDur = localStorage.getItem('signOutNoA');
        let lastCheck = localStorage.getItem('signOutNoALastGet');
        if (!lastCheck || this.daysBetween(this.convFromStr(lastCheck), this.newDate()) != 0){
            // check once a day to make sure it hasn't changed
            forceGetSetting = true;
        }
        if (!noActivityDur || forceGetSetting){
            // either not set or it's 0. Just make sure they didn't turn it on and we should now be auto signing out. 
            var mURL = this.getWSUrl() + 'cpGetUsers/getNoActivityDur';
            var oParams = {
            }

            var resp = await this.RestClient.getNoCache(mURL, oParams);
            
            var oData = this.wsResp2Obj(resp);
            if (oData.errorMsg){
                this.mbox(oData.errorMsg);
                return;
            }
            
            noActivityDur = oData[0].signoutnoa;

            localStorage.setItem('signOutNoA', noActivityDur);
            localStorage.setItem('signOutNoALastGet', oData[0].datadt);
        }
        
        noActivityDur = this.convFromStr(noActivityDur); // make it a numeric
        if (!noActivityDur)
            return; // 0 minutes, basically it's turned off


        let _this = this;
        this.tmrNoActivity = setInterval(function(){ 
            if (!window.lastClick){
                // this may happen if they open the tab but never click anything
                window.lastClick = new Date();
                return;
            }
            let mNow = new Date(); // this is how window.lastClick is set so stick with it so our calcs are accurate
            let minSinceLastClick = (mNow - window.lastClick) / 1000 / 60;
            let minSinceMbox;
            if (mboxShowDtTm){
                minSinceMbox = (mNow - mboxShowDtTm) / 1000 / 60
            } else {
                minSinceMbox = 0;
            }

            if (minSinceMbox >= maxTimeToReply){
                // It's been several minutes since we showed the mbox. Time to shut it down
                _this.signOut();

            } else if (minSinceLastClick >= noActivityDur){
                // show an mbox asking if they are still there. By clicking on the mbox, it will reset window.lastClick and we'll continue on our merry way. 
                if (!mboxShowing){
                    mboxShowing = true;
                    mboxShowDtTm = mNow;
                    _this.mbox(_this.getLbl('are you still there').replace('<TIME>', _this.AmPm(mNow.addMin(maxTimeToReply))), _this.getLbl('im still here')).then(function(){
                        mboxShowDtTm = null;
                        mboxShowing = false;
                    });
                    
                }
            }
            
        }, 1000 * 60 * timerMin);

    } // startChkActivityTimer



    // *********************************************************************************
    // Convert a number to a 'word' format for check printing
    // see https://codereview.stackexchange.com/questions/90349/changing-number-to-words-in-javascript#:~:text=function%20numToWords%20%28number%29%20%7B%20%2F%2FValidates%20the%20number%20input,%5D%3B%20digitsGroup%20%5Bj%5D%20%3D%200%3B%20%2F%2FSets%20to%20null.
    // Returns: Char. i.e. 25679.3 returns: 'Twenty-Five Thousand Six Hundred Seventy-Nine and 30/100'
    Vue.prototype.Sublib.numToWord = function(number){
        // number = Numeric (will also work with a string). Number to convert
        var ONE_TO_NINETEEN = [
            "one", "two", "three", "four", "five",
            "six", "seven", "eight", "nine", "ten",
            "eleven", "twelve", "thirteen", "fourteen", "fifteen",
            "sixteen", "seventeen", "eighteen", "nineteen"
          ].map((str) => { return str.toProperCase() });
          
        var TENS = [
            "ten", "twenty", "thirty", "forty", "fifty",
            "sixty", "seventy", "eighty", "ninety"
        ].map((str) => { return str.toProperCase() });
          
        var SCALES = ["thousand", "million", "billion", "trillion"].map((str) => { return str.toProperCase() });


        // helper function for use with Array.filter
        var isTruthy = function(item) {
            return !!item;
        }

        var chunk = function(number){
            // convert a number into "chunks" of 0-999
            var thousands = [];

            while(number > 0) {
                thousands.push(number % 1000);
                number = Math.floor(number / 1000);
            }

            return thousands;
        } // chunk


        // translate a number from 1-999 into English
        var inEnglish = function (number) {
            var thousands, hundreds, tens, ones, words = [];
        
            if(number < 20) {
                return ONE_TO_NINETEEN[number - 1]; // may be undefined
            }
        
            if(number < 100) {
                ones = number % 10;
                tens = number / 10 | 0; // equivalent to Math.floor(number / 10)
            
                words.push(TENS[tens - 1]);
                words.push(inEnglish(ones));
            
                return words.filter(isTruthy).join("-");
            }
        
            hundreds = number / 100 | 0;
            words.push(inEnglish(hundreds));
            words.push("Hundred");
            words.push(inEnglish(number % 100));
        
            return words.filter(isTruthy).join(" ");
        } // inEnglish


        // append the word for a scale. Made for use with Array.map
        var appendScale = function (chunk, exp) {
            var scale;
            if(!chunk) {
                return null;
            }
            scale = SCALES[exp - 1];
            return [chunk, scale].filter(isTruthy).join(" ");
        } // appendScale


        let oNumParts = this.getNumberParts(this.cleanNumber(number, true, true));

        let retval = chunk(oNumParts.numB4Dec).map(inEnglish).map(appendScale).reverse().join(' ');
        retval += (retval ? '' : 'Zero') + ' and ' + (oNumParts.decNumStr ? oNumParts.decNumStr : '00') + '/100'
        
        return retval; // Two hundred fifty and 35/100

    } // numToWords



    
    // // *********************************************************************************
    // // Intercept all calls made to the console
    // // see: https://tobyho.com/2012/07/27/taking-over-console-log/
    // Vue.prototype.Sublib.interceptConsole = function(){
    //     var console = window.console
    //     if (!console) return

    //     let intercept = function intercept(method){
    //         var original = console[method]
    //         console[method] = function(){

    //             //debugger

    //             if (original.apply){
    //                 // Do this for normal browsers
    //                 original.apply(console, arguments)
    //             }else{
    //                 // Do this for IE
    //                 var message = Array.prototype.slice.apply(arguments).join(' ')
    //                 original(message)
    //             }
    //         }
    //     } // intercept function

    //     var methods = ['log', 'warn', 'error']
    //     for (var i = 0; i < methods.length; i++)
    //         intercept(methods[i])

    // } // interceptConsole

   

    //**************************************************************************************************************
    // decied to move it here since we are calling it from multiple places MA 11/03/2023
    //returns 0 = needs prompt, 1 = success and -1 if it failed 
    Vue.prototype.Sublib.flagInvSent = async function(mAlreadyPrompted, invoiceIdList){
        //promp them if they want to flas as sent to cust or not
        var mURL = this.getWSUrl() + 'cpInvoice/flagInvSent';

        var oParams = { 
            alreadyPrompted: mAlreadyPrompted
        }

        var oBody = {
            invoiceId: invoiceIdList,
        }

        var resp = await this.RestClient.postNoCache(mURL, oParams, oBody);
        var oData = this.wsResp2Obj(resp);

        if (oData.errorMsg){
            if(this.contains(oData.errorMsg, 'need to prompt', true) && oData.errorCode == -12){
                //need to prompt them
                return 0;
            }else{
                this.mbox(oData.errorMsg);
                return -1;
            }
        }

        return 1;

    } // flagInvSent

    // *********************************************************************************
    // Get a tiny URL for a link we want to send out
    // Returns: Char. Tiny URL, returns original URL if it can't get a tiny URL so you can still send your link out
    Vue.prototype.Sublib.getTinyURL = async function(mURL2Shorten){
        // mURL2Shorten = Char. URL to shorten

        let url = this.getWSUrl() + 'cpGetUsers/getTinyURL';
        let oParams = {
            url: mURL2Shorten
        }
        let resp = await this.RestClient.getNoCache(url, oParams);
        let oData = this.wsResp2Obj(resp);

        if (oData.errorMsg){
            this.mbox(oData.errorMsg);
            return mURL2Shorten;
        }

        return oData[0].tinyurl;

    } // getTinyURL



    // *********************************************************************************
    // Get the next set of results from a paginated result set
    Vue.prototype.Sublib.getResultsNextPage = async function(resultSet, nextRec, maxRecCnt){
        // resultSet = Char. unique id of the result set we are paging through
        // nextRec = Numeric. Next record to get
        // maxRecCnt = Numeric. Optional. Max number of records to get 

        let url = this.getWSUrl() + 'cpGetUsers/getNextPage';
        let oParams = {
            resultSet: resultSet,
            nextRec: nextRec,
            maxRecCnt: maxRecCnt
        }
        let resp = await this.RestClient.getNoCache(url, oParams);
        return resp;

    } // getResultsNextPage

    // *********************************************************************************
    // verify sql dict
    Vue.prototype.Sublib.verifySQLDict = async function(){

        let url = this.getWSUrl() + 'serverUtil/verifySQLDict';
        let oParams = {}

        this.showMsg(this.getLbl('talking to the server please wait'), false, true)

        let resp = await this.RestClient.getNoCache(url, oParams);
        this.showMsg();


        let oData = this.wsResp2Obj(resp);
        if(oData.errorMsg){
            await this.mbox(oData.errorMsg);
            return;
        }

        this.mbox(this.getLbl('your database is up to date'));

    } // verifySQLDict

     // *********************************************************************************
    // update sql stats
    Vue.prototype.Sublib.updtSqlStats = async function(){

        let url = this.getWSUrl() + 'serverUtil/updtSqlStats';
        let oParams = {}

        this.showMsg(this.getLbl('talking to the server please wait'), false, true)

        let resp = await this.RestClient.getNoCache(url, oParams);
        this.showMsg();

        let oData = this.wsResp2Obj(resp);
        if(oData.errorMsg){
            await this.mbox(oData.errorMsg);
            return;
        }

        if(oData.msg){
            await this.mbox(oData.msg);
        }

    } // updtSqlStats


    
    // *********************************************************************************
    //get self picture for the user
    Vue.prototype.Sublib.getSelfPic = async function(userId, forceGet, returnVal){

        if(!userId){
            userId = localStorage.getItem('userId')
        }

        let selfPic = '';
            
        //check if selfPic thumbnail exists in the local storage
        var cachedBase64 = await this.IDB.req('photos', 'get', userId);

        if(cachedBase64 && !forceGet){
            selfPic = cachedBase64;
        }else{
            //need to go get it from server
            var mURL = this.getWSUrl() + 'cpUsers/getSelPic';
            var oParams = {
                userId: userId,
            }

            var resp = await this.RestClient.getNoCache(mURL, oParams); //base64 encoded image

            var oData = this.wsResp2Obj(resp);

            if (oData.errorMsg){
                // this.mbox(oData.errorMsg);
                return '';
            }

            selfPic = 'data:' + this.getMimeType(oData[0].selfpicdesc ? this.justExt(oData[0].selfpicdesc) : 'PNG' ) + ';base64,' + oData[0].thmbase64;

            // Store it out for future use
            this.IDB.req('photos', 'put', userId, selfPic);

        }
        
        if (returnVal){
            return selfPic;
        }
    } // getSelfPic


    // *********************************************************************************
    // Get the public IP address they are on right now. 
    // Returns: object/array (our normal WS response). [{ip: ''... other fields...}, errorMsg: '']
    Vue.prototype.Sublib.getPublicIP = async function(){
        let resp = await this.RestClient.getNoCache('https://api.ipify.org?format=json'); // get the public IP
        let oData = this.wsResp2Obj(resp);
        if (oData.errorMsg){
            return oData;
        }
        //return oData.ip; // 23.88.165.240

        if (!this.getConnectInfo('token')){
            // not signed in, can't get the details, just return the IP
            let oRetVal = [];
            oRetVal.push({ip: oData.ip});
            oRetVal.errorMsg = '';
            return oRetVal;
        }

        // get a few more details about the IP
        let url = this.getWSUrl() + 'Sublib/getIPInfo'
        let oParams = {
            ip: oData.ip
        }
        resp = await this.RestClient.getNoCache(url, oParams);
        oData = this.wsResp2Obj(resp);
        if (oData.errorMsg){
            // make sure we at least still send back the public IP from the previous call, we'll just be missing the rest of the fields. SRR 12/14/2023
            oData.push({ip: oData.ip});
        }
        return oData;

    } // getPublicIP


    // *********************************************************************************
    // Set the app zoom level (doesn't exactly match zooming in with the mouse wheel but doesn't look like we can). SRR 12/15/2023
    Vue.prototype.Sublib.setAppZoom = function(zoomLevel){
        // zoomLevel = Numeric. Optional. 100 = normal, 125 = 125%, etc.
        //              If not passed, pulls from local storage

        if (!zoomLevel)
            zoomLevel = this.convFromStr(localStorage.getItem('appZoomLevel'))
    
        if (!zoomLevel)
            zoomLevel = 100;

        localStorage.setItem('appZoomLevel', zoomLevel)

        try {
            if (zoomLevel == 100 & !document.body.style.zoom)
                return; // default in the browser, just leave it. SRR 12/15/2023
            
            //document.firstElementChild.style.zoom = zoomLevel + '%';
            document.body.style.zoom = zoomLevel + '%';
        } catch(ignore){
        }
    } // setAppZoom



} // install
} // Sublib
 