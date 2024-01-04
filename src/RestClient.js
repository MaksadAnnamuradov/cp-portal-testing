import axios from 'axios'; // actual rest client. See https://github.com/axios/axios
import Sublib from './Sublib';
//import Sublib from './this.Sublib.vue';

export default {
    
    install(Vue, params){


    Vue.prototype.RestClient = {};

    Vue.prototype.RestClient.Sublib; // set before the methods below are called so we have access to the RestClient Methods (can't figure out another way to reference it)
    Vue.prototype.RestClient.IDB; // set before the methods below are called so we have access to the RestClient Methods (can't figure out another way to reference it)

    Vue.prototype.RestClient.defaultTimeOut = 30*1000; // miliseconds
    Vue.prototype.RestClient.maxTimeOut = 110*1000; // I think web connect has a timeout of 120 seconds, so go 110

    // *********************************************************************************
    Vue.prototype.RestClient.client =  axios.create({
        //baseURL: 'https://localws.cenpoint.com/'
        timeout: this.defaultTimeOut,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        validateStatus: function(status){
            return true; // I want all statuses to come through and then I can handle them. //status >= 200 && status < 300; // default
        }
    }),
        
        

    // *********************************************************************************
    // Standard 'get' rest call but WILL cache records in the localDB / pull them out of there if we are offline
    Vue.prototype.RestClient.get = async function (mURL, oParams, mKey, mSaveMode, useMaxTimeout){
        // mURL = Char. 
        // oParams = Object, name value pairs for params
        // mKey = Char. Key to use when storing / getting resp local.
        // mSaveMode = Logical. If true, calls this.saveData() instead of this.getData
        // useMaxTimeout = Logical. If true, changes timeout to max possible (i.e. expecting a long call)

        var mRetVal;
        if (mSaveMode){
            mRetVal = await this.saveData(mURL, oParams, null, mKey);
        } else {
            mRetVal = await this.getData(mURL, oParams, null, mKey);
        }

        this.Sublib.switchToPrefWS(); // if already using just kicks out. no harm in calling

        return mRetVal;

    }, // get


    // *********************************************************************************
    // Standard 'post' rest call but WILL cache records in the localDB / pull them out of there if we are offline
    Vue.prototype.RestClient.post = async function (mURL, oParams, oBodyParams, mKey, mSaveMode, useMaxTimeout) {
        // mURL = Char. 
        // oParams = Object, name value pairs for params
        // oBodyParams = Object. name value pairs for params
        // mKey = Char. Key to use when storing / getting resp local.
        // mSaveMode = Logical. If true, calls this.saveData() instead of this.getData()
        // useMaxTimeout = Logical. If true, changes timeout to max possible (i.e. expecting a long call)

        if (mSaveMode){
            return this.saveData(mURL, oParams, oBodyParams, mKey, useMaxTimeout);       
        } else {
            return this.getData(mURL, oParams, oBodyParams, mKey, useMaxTimeout);
        }
        
    }, // post


    // *********************************************************************************
    // This gets called from this.get() and this.post(). 
    // Just one place to do both of the duplicate code that would have been in both methods. 
    // Basically, does a get / post (if online)
    // Updates the localDB (if online)
    // and then returns from the localDB
    Vue.prototype.RestClient.getData = async function(mURL, oParams, oBodyParams, mKey, useMaxTimeout) {
        // mURL = Char. 
        // oParams = Object, name value pairs for params
        // oBodyParams = Object, name value pairs for params
        // mKey = Char. Key to use when storing / getting resp local.
        // useMaxTimeout = Logical. If true, changes timeout to max possible (i.e. expecting a long call)

        if (!mKey){
            // see if I can figure it out
            //mKey = this.determineKey(mURL, oParams);
            return JSON.stringify({ 'errorDesc': 'Rest Client: key not passed!' 
                                                + '\n\nURL: ' + mURL
                                                + '\n\nParams: ' + JSON.stringify(oParams)
                                                + '\n\nKey: ' + mKey
                                                + '\n\nOffline: ' + (this.Sublib.offline() ? 'true': 'false')
                                    });
        }

        if (!this.Sublib.offline()){
            // we are online, go get it fresh
            var response;
            if (oBodyParams){
                // post
                response = await this.postNoCache(mURL, oParams, oBodyParams, false, useMaxTimeout);
            } else {
                // get
                response = await this.getNoCache(mURL, oParams, false, useMaxTimeout);
            }

            // Now write it out to the local DB
            // Remember: 'put' does an update OR insert
            var mGoOn = await this.IDB.req('cachedWSResp', 'put', mKey, response);
            
        } 


        var resp = await this.IDB.req('cachedWSResp', 'get', mKey);

        if (!resp && !this.Sublib.offline()){
            // crap! Don't have the data. No bueno!
            resp = JSON.stringify({ 'errorDesc': 'Data not found!' 
                                                + '\n\nURL: ' + mURL
                                                + '\n\nParams: ' + JSON.stringify(oParams)
                                                + '\n\nKey: ' + mKey
                                                + '\n\nOffline: ' + (this.Sublib.offline() ? 'true': 'false')
                                    });
        } else if (!resp || (this.Sublib.contains(resp, 'network error', true) && this.Sublib.offline())){
            //resp = JSON.stringify({ 'errorDesc': 'You are offline and the data you are looking for was not saved before going offline :('});
            
            // Remember, the emoji dec code works because mbox is treating it as raw html
            // see https://www.w3schools.com/charsets/ref_emoji_smileys.asp for emoji codes. SRR 10.11.2019
            // 128533 // Confused face
            // 128561 // Face screaming in fear
            resp = JSON.stringify({ 'errorDesc': "You are offline and the data you are looking for was not saved before going offline <span style='font-size:20px'>&#128561;</span>"});
        }

        return resp;
    }, // getData



    // *********************************************************************************
    // This gets called from this.get() and this.post(). 
    // Just one place to do both of the duplicate code that would have been in both methods. 
    // Basically, it writes the request to the local DB
    // Sends it up to the Web Service (if online)
    // deletes from local DB (if online and no error message)
    // returns result
    Vue.prototype.RestClient.saveData = async function(mURL, oParams, oBodyParams, mKey, useMaxTimeout) {
        // mURL = Char. 
        // oParams = Object, name value pairs for params
        // oBodyParams = Object, name value pairs for params
        // mKey = Char. Key to use when storing / getting resp local.
        // useMaxTimeout = Logical. If true, changes timeout to max possible (i.e. expecting a long call)

        if (!mKey){
            // see if I can figure it out
            //mKey = this.determineKey(mURL, oParams);
            return JSON.stringify({ 'errorDesc': 'Rest Client: key not passed!' 
                                                + '\n\nURL: ' + mURL
                                                + '\n\nParams: ' + JSON.stringify(oParams)
                                                + '\n\nKey: ' + mKey
                                                + '\n\nOffline: ' + (this.Sublib.offline() ? 'true': 'false')
                                    });
        }


        // first, write it out        
        // Remember: 'put' does an update OR insert
        var mNow = await (this.Sublib.getDate(true));
        var mGoOn = await this.IDB.req('pendingWSSave', 'put', mKey, JSON.stringify({url: mURL, query: oParams, body: oBodyParams, datadt: mNow}));

        var mRetVal;

        if (!this.Sublib.offline()){
            // we are online, send it up
            var response;
            if (oBodyParams){
                // post
                response = await this.postNoCache(mURL, oParams, oBodyParams, false, useMaxTimeout);
            } else {
                // get
                response = await this.getNoCache(mURL, oParams, false, useMaxTimeout);
            }
     
            // see if it was successful
            var oData = this.Sublib.wsResp2Obj(response);
            if (!oData.errorMsg){
                // success, delete it out of the local cache
                await this.IDB.req('pendingWSSave', 'delete', mKey);

            // } else if (this.Sublib.contains(mKey, 'saveBreadCrumb', true) && this.Sublib.contains(oData.errorMsg, 'clocked out', true)){
            //     // Trying to save a bread crumb but they are clocked out, don't try to send it up again.. SRR 07/23/2020
            //     await this.IDB.req('pendingWSSave', 'delete', mKey);
            }

            mRetVal = response;

        } else {
            // offline, just assume it will go up right when we go to upload it
            mRetVal = JSON.stringify({ errorDesc: '', errorCode: ''});
        }

       return mRetVal;
    }, // saveData


    // *********************************************************************************
    // Standard 'get' rest call (will NOT cache the results or look for results in indexedDB)
    Vue.prototype.RestClient.getNoCache = async function(mURL, oParams, mNo2ndTry, useMaxTimeout) {
        // mURL = Char. 
        // oParams = Object, name value pairs for params
        // mNo2ndTry = Logical. If true, does NOT try to connect to a different web service server and try again (provides an exit point for recursive calls)
        // useMaxTimeout = Logical. If true, changes timeout to max possible (i.e. expecting a long call)

        var oURL = this.verifyURL(mURL, oParams);
        if (oURL.errorMsg){
            return this.fixLineReturns(JSON.stringify({ 'errorDesc': oURL.errorMsg}));
        }

        //var oResp = this.client.get(mURL, { params: oParams });

        // If we are 'determining webservice', don't shoot of the request yet or we may get caught in an infinite loop. SRR 01.28.2019
        if (window.g_findingWS && !this.Sublib.contains(mURL, 'isWCUp', true)){
            var mError = await this.waitForWS(oURL);
            if (mError){
                return mError;
            }
        } // if


        var mTimeOut;
        if (useMaxTimeout){
            mTimeOut = this.maxTimeOut;

        } else if (oURL.oURLParams.prg && oURL.oURLParams.prg.toUpperCase() == 'GETDOC'){
            // give it more time to get a picture
            mTimeOut = this.maxTimeOut;
        
        } else if (oURL.oURLParams.prg && oURL.oURLParams.prg.toUpperCase() == 'VIEWFTTM'){
            // these reports can take a bit
            mTimeOut = this.maxTimeOut;

        } else if (oURL.oURLParams.prg && oURL.oURLParams.prg.toUpperCase() == 'SANDBOX'){
            // Can take a bit to create the sandbox
            mTimeOut = this.maxTimeOut;
        
        } else {
            mTimeOut = this.defaultTimeOut; 
        }


        var response;
        var oCrap; 
        try {
            var oResp = await this.client.get(oURL.url, { params: oURL.oURLParams }, { timeout: mTimeOut});            
            response = oResp.request.responseText; // oResp.data = already converted to JSON, no bueno, // oResp.request.response (Not sure how this is different that responseText, look the same in debug window)
        } catch (oError){
            //console.log(JSON.stringify(oError));    
            //oCrap = oError; // Can't look at oError in the debugger (weird) but can look at oCrap
            response = JSON.stringify({errorDesc: oError.message});
            //response = JSON.stringify({errorDesc: oError.response});
        }

        if (!oURL.url){
            debugger
        }
  
        if (this.Sublib.contains(response, 'network error', true) && !this.Sublib.offline()){
            // they may have just lost service and we don't know it yet. SRR 11/16/2021
            await this.Sublib.checkOfflineStatus(); // Updates Sublib.offline() if we really are offline / can't talk to our server
            if (!this.Sublib.offline()){
                // we are online but still had the network error. I guess try to switch servers and try again?
                // NOTE: Mostly hit this in development when we didn't have all servers defined in our local IIS but doesn't hurt to have it here
                // if we take out a server or one goes down.
                await this.Sublib.determineWS();
                if (!mNo2ndTry){
                    return this.getNoCache(mURL, oParams, true, useMaxTimeout); // recursive call
                }
            }

        } else if (!mNo2ndTry && this.Sublib.contains(response, 'all requests are on hold', true) && !this.Sublib.offline()){
            // "We're running maintenance requests at the moment and all requests are on hold. Please check back in a minute"
            // In the middle of updating the webservice, just wait for a bit and try again? SRR 06/02/2023

            this.Sublib.showMsg(this.Sublib.getLbl('ws update in progress'));

            var onHoldResp, onHoldoData, onHoldUrl, backUp;
            var onHoldUrl = this.Sublib.getWSUrl() + 'cpGetUsers/isWCUp'; 

            for (var mx = 1; mx <= (5*4); mx++){ // shouldn't take more than 20 seconds to update a server
                await this.Sublib.sleep(5*1000); 

                onHoldResp = await this.getNoCache(onHoldUrl, {}, true); 
                //onHoldoData = this.Sublib.wsResp2Obj(onHoldResp);
                if (!this.Sublib.contains(onHoldResp, 'all requests are on hold', true)){
                    // Update is done
                    backUp = true;
                    break;
                }
            } // for

            this.Sublib.showMsg();
            if (backUp){
                return this.getNoCache(mURL, oParams, mNo2ndTry, useMaxTimeout); // recursive call   
            }




        } else if (!mNo2ndTry && this.respHasError(response, oURL.url, oURL.oURLParams)){
            // switch web servers and try again
            if (await this.Sublib.determineWS()){
                return this.getNoCache(mURL, oParams, true, useMaxTimeout); // recursive call         
            }
        }

        response = this.fixLineReturns(response);

        

        if (!response || (this.Sublib.contains(response, 'network error', true) && this.Sublib.offline())){
            response = JSON.stringify({ 'errorDesc': 'You are offline and the data you are looking for was not saved before going offline :('});
        }

        return response;
    }, // getNoCache


    // *********************************************************************************
    // Standard 'post' rest call
    Vue.prototype.RestClient.postNoCache = async function(mURL, oQueryParams, oBodyParams, mNo2ndTry, useMaxTimeout) {
        // mURL = Char. 
        // oQueryParams = Object, name value pairs for params
        // oBodyParams = Object, name value pairs for params
        // mNo2ndTry = Logical. If true, does NOT try to connect to a different web service server and try again (provides an exit point for recursive calls)
        // useMaxTimeout = Logical. If true, changes timeout to max possible (i.e. expecting a long call)

        // NOTE: For the post, add the query string params to the url
        var oURL = this.verifyURL(mURL, oQueryParams, oBodyParams);
        if (oURL.errorMsg){
            return this.fixLineReturns(JSON.stringify({ 'errorDesc': oURL.errorMsg}));
        }

        mURL = oURL.url;
        if (oURL.oURLParams){
            mURL+= '?' + this.convBodyObj2Str(oURL.oURLParams);
        }


        // If we are 'determining webservice', don't shoot of the request yet or we may get caught in an infinite loop. SRR 01.28.2019
        if (window.g_findingWS && !this.Sublib.contains(mURL, 'isWCUp', true)){
            var mError = await this.waitForWS(oURL);
            if (mError){
                return mError;
            }
        } // if


        var mTimeOut
        if (useMaxTimeout){
            mTimeOut = this.maxTimeOut;
            
        } else if (oURL.oURLParams.proc && this.Sublib.inList(oURL.oURLParams.proc.toUpperCase(), ['GETCSVCUST', 'CREATEACCOUNTANDDB'])){
            // importing customers from a csv file. Can take a bit while we parse and save
            // Creating a CenPoint Database. Normally is really fast (< 10 sec) but just in case, wait a little longer
            mTimeOut = this.maxTimeOut;

        } else if (oURL.oURLParams.prg && oURL.oURLParams.prg.toUpperCase() == 'CPDOCS'){
            // Uploading pictures (depending on size) can take a bit. Give it a little longer. SRR 11/10/2022
            mTimeOut = this.maxTimeOut;

        } else if (oURL.oURLParams.prg && oURL.oURLParams.prg.toUpperCase() == 'VIEWFTTM'){
            // these reports can take a bit
            mTimeOut = this.maxTimeOut;

        } else if (oURL.oURLParams.prg && oURL.oURLParams.prg.toUpperCase() == 'QBOPUSH'){
            // QB online push. Can take a bit longer when talking to QB. SRR 03/29/2023
            mTimeOut = this.maxTimeOut;

        } else {
            mTimeOut = this.defaultTimeOut; 
        }



        var response;
        try {
            var oResp = await this.client.post(mURL, this.convBodyObj2Str(oBodyParams), { timeout: mTimeOut});
            response = oResp.request.responseText; // oResp.data = already converted to JSON, no bueno, // oResp.request.response (Not sure how this is different that responseText, look the same in debug window)
        } catch (oError){         
            response = JSON.stringify({errorDesc: oError.message});
        }

        if (this.Sublib.contains(response, 'network error', true) && !this.Sublib.offline()){
            // they may have just lost service and we don't know it yet. SRR 11/16/2021
            await this.Sublib.checkOfflineStatus(); // Updates Sublib.offline() if we really are offline / can't talk to our server


        } else if (!mNo2ndTry && this.Sublib.contains(response, 'all requests are on hold', true) && !this.Sublib.offline()){
            // "We're running maintenance requests at the moment and all requests are on hold. Please check back in a minute"
            // In the middle of updating the webservice, just wait for a bit and try again? SRR 06/02/2023

            this.Sublib.showMsg(this.Sublib.getLbl('ws update in progress'));
            
            var onHoldResp, onHoldoData, onHoldUrl, backUp;
            var onHoldUrl = this.Sublib.getWSUrl() + 'cpGetUsers/isWCUp'; 

            for (var mx = 1; mx <= (5*4); mx++){ // shouldn't take more than 20 seconds to update a server
                await this.Sublib.sleep(5*1000); 

                onHoldResp = await this.getNoCache(onHoldUrl, {}, true); 
                //onHoldoData = this.Sublib.wsResp2Obj(onHoldResp);
                if (!this.Sublib.contains(onHoldResp, 'all requests are on hold', true)){
                    // Update is done
                    backUp = true;
                    break;
                }
            } // for

            this.Sublib.showMsg();
            if (backUp){      
                return this.postNoCache(mURL, oQueryParams, oBodyParams, mNo2ndTry, useMaxTimeout); // recursive call
            }


        } else if (!mNo2ndTry && this.respHasError(response, oURL.url, oURL.oURLParams, oBodyParams)){
            // switch web servers and try again
            if (await this.Sublib.determineWS()){
                return this.postNoCache(mURL, oQueryParams, oBodyParams, true, useMaxTimeout); // recursive call
            }
        }

        response = this.fixLineReturns(response);

        if (!response || (this.Sublib.offline() && this.Sublib.contains(response, 'network error', true))){
            response = JSON.stringify({ 'errorDesc': 'You are offline and the data you are looking for was not saved before going offline :('});
        }


        return response;
    }, // postNoCache


    // *********************************************************************************
    // this checks to see if we got an 'error' message back that means that the web service is down or having problems.
    Vue.prototype.RestClient.respHasError = function(mResp, mURL, oURLParams, oBodyParams){
        if (!mResp){
            return false; // this.Sublib.converWSResp2Obj() deals with it not being a string. SRR 08.05.2019
        }
        if (!mURL){
            debugger
        }

        // NOTE: From axios.js on 'network error', seems to be the only time they use 'network error'. SRR 07/06/2021
        
        // Handle low level network errors
	    // request.onerror = function handleError() {
        //     // Real errors are hidden from us by the browser
        //     // onerror should only fire if it's a network error
        //     reject(createError('Network Error', config, null, request));
  
        //     // Clean up request
        //     request = null;
        //   };
  
  
        if (this.Sublib.contains(mResp, 'network error', true)){
            // No service / error but don't want to log just because they had no service. SRR 07/26/2021
            return true;

        } else if (this.Sublib.contains(mResp, 'isCallBackError', true)){
            // Web connect error!
            // Looks something like '{"isCallbackError":true,"message":Alias is not found."}'
            // Moved here from Sublib.wsResp2Obj so we have access to the URL they are trying to hit to help us track it down. SRR 08/16/2023

            if (oURLParams 
                && oURLParams.proc 
                && this.Sublib.inList(oURLParams.proc.toUpperCase(), ['SAVECPPIC', 'SAVECPPICEDITED'])
                ){
                // dont add the picture to the error log. SRR 08/03/2021
                if (oBodyParams && (oBodyParams.image || oBodyParams.base64)){
                    // Remember, JS passes objects by reference, don't want to change the actual picture we're trying to save. 
                    // Make a copy of oBodyParams / break the reference
                    oBodyParams = JSON.parse(JSON.stringify(oBodyParams));
                    oBodyParams.image = '[Base64Pic]'
                    oBodyParams.base64 = '[Base64]'
    
                } else if (oBodyParams && oBodyParams[0] && (oBodyParams[0].image || oBodyParams[0].base64)){
                    // Remember, JS passes objects by reference, don't want to change the actual picture we're trying to save. 
                    // Make a copy of oBodyParams / break the reference
                    oBodyParams = JSON.parse(JSON.stringify(oBodyParams));
                    oBodyParams[0].image = '[Base64Pic]'
                    oBodyParams[0].base64 = '[Base64]'
                }
            }
            if (oURLParams && oURLParams.token){
                oURLParams.token = '*****'
            }


            this.Sublib.handleError('Error (18) Web Connect Error: "' + mResp
                                    + '\n\URL: ' + mURL
                                    + "\n\nQuery Params: " + this.convBodyObj2Str(oURLParams) 
                                    + '\n\nBody Params: ' + this.convBodyObj2Str(oBodyParams)
                                    )

            return false; // don't treat it as an error where the restclient tries again. SRR 08/16/2023




        } else if ((false && this.Sublib.contains(mResp, 'network error', true)) // no service or url doesn't exist // added check for offline, only want to log real errors. SRR 07/06/2021 // Stopped logging 'network error' as it just means they are offline. SRR 07/22/2021
            || this.Sublib.contains(mResp, 'Caught .NET exception', true) // iis error (typically)
            || this.Sublib.contains(mResp, 'all requests are on hold', true) // web connect com servers on hold (most likely to apply an update)
            || this.Sublib.contains(mResp, 'An error has occured. Please try again', true) // not sure where this comes from but I've seen it
            || (this.Sublib.contains(mResp, 'timeout of', true) && this.Sublib.contains(mResp, 'exceeded', true)) // timeout of 30000ms exceeded
            || (this.Sublib.contains(mResp, 'Request Timeout', true) && this.Sublib.contains(mResp, 'request took longer than the alotted timeout interval', true)) // "This request took longer than the alotted timeout interval and was aborted"
            || this.Sublib.contains(mResp, "404 - File or directory not found", true) // '404 - File or directory not found \r\n The resource you are looking for might have been removed, had its name changed, or is temporarily unavailable'. Hit this when Vultr was having network issues and it was partly working, switch servers! SRR 10/06/2021
            || this.Sublib.contains(mResp, 'unable to retrieve a server instance', true) // 'We were unable to retrieve a server instance from the server pool. Server cpmobile.cpmobileServer[<<someNumber>>] failed to start in time' - Our com servers are down on this server! SRR 02/09/2022
            ){

                if (this.Sublib.contains(mResp, 'Request Timeout', true) && this.Sublib.contains(mResp, 'request took longer than the alotted timeout interval', true)){
                    // Actually comes through as an HTML page response but these are contained in it. SRR 11/13/2020
                    // Shrink it down for logging as I don't need the whole HTML page, just the timeout
                    mResp = JSON.stringify({errorDesc: "This request took longer than the alotted timeout interval and was aborted" });

                } else if (this.Sublib.contains(mResp, 'unable to retrieve a server instance', true)){
                    // Comes through as an HTML page response. 
                    // Shrink it down for the logging. 
                    // also need to send us an email so we can fix our servers being down! Switch web servers and have that server send us the email
                    var mServerURL = mURL;
                    var mMsg = mResp.substring(mResp.toLowerCase().indexOf('we were unable')); // mayve return back too much but it's better than too little. 

                    this.Sublib.alertSupport(mServerURL, mMsg);
                }

                // log it so we can save out errors for debugging purposes. SRR 07/10/2020
                this.logConnnectError(mResp, mURL, oURLParams, oBodyParams);
                return true;
                
        } else if (this.Sublib.contains(mResp, 'Invalid user credentials', true)){
            // Shouldn't really hit this but might in testing if we're restoring different data
            if (!this.Sublib.contains(location.href, '/signIn', true) && !this.Sublib.contains(location.href, 'cpkey=')){
                this.Sublib.signOut();                
            }
        }

        return false;
    }, //respHasError


    // *********************************************************************************
    // strtran() out '\r' for '\n'. CSS line wrap only honors '\n'. 
    // this way I don't have to do it on every method
    Vue.prototype.RestClient.fixLineReturns = function (mResp){
        if (!mResp){
            return mResp;
        }

        mResp = this.Sublib.replaceAll(mResp, '\\\\r\\\\n', '\\n');
        mResp = this.Sublib.replaceAll(mResp, '\\\\r', '\\n');

        return mResp;
    }, // fixLineReturns


    // *********************************************************************************
    // we are currently trying to find a web service we can use
    // This will return '' if one was one (by this.Sublib.determineWS()) or an error message
    // NOTE: This should ONLY be called by RestClient.getNoCache() and RestClient.postNoCache() and ONLY if window.g_findingWS
    Vue.prototype.RestClient.waitForWS = async function(oURL){
        // oURL = Object. URL we're trying to hit (only used if we need to show an error message)
        while(window.g_findingWS){
            // wait 1ish seconds and see if we were able to find one. Don't want to end up shooting off mutliple 'find the server' calls
            // Note: This assumes that we will find a server fairly quick... SRR 01.28.2019
            await this.Sublib.sleep((Math.random() + 1) * 1000);
        }; // while

        var mRetVal = '';

        if (!window.g_foundWS){
            mRetVal = JSON.stringify({
                        errorDesc: 'Error: (27) Could not communicate with Server!'
                                + '\nPlease check your internet connection and then close the app and try again.'
                                + '\nURL: ' + oURL.url
                                + '\nMethod: ' + (oURL.oURLParams.prg ? oURL.oURLParams.prg + '.' + oURL.oURLParams.proc : '')
                                + '\nCP Status: ' + (this.Sublib.offline() ? 'Offline' : 'Online')
            });
        } // if

        return mRetVal;
    }, // waitForWS


    // *********************************************************************************
    // this will make sure our URL / params are correct (i.e. avfp vs webconnect)
    Vue.prototype.RestClient.verifyURL = function (mURL, oURLParams, oBodyParams){
        // mURL = Char. 
        // oURLParams = Object
        // oBodyParams = Object. Optional. Only used to see if custcode / token are already in the body so we don't need to add them to the query string

        if (!oURLParams){
            oURLParams = {};
        }

        if (!oBodyParams){
            oBodyParams = {};
        }

        var oRetVal = {
            'url': '',
            'oURLParams': {},
            'errorMsg': ''
        }

        /****** Begin Error Checking *****/
        if (!mURL){
            // I've seen where the URL is blank. I can't find where it's coming from (yet);
            oRetVal.errorMsg = 'Destination URL is not defined!'
                            + '\nRest Call aborted!'
                            + '\n'
                            + '\nPlease contact support and describe what you were doing when you recieved this message to get this resolved.'
                            + '\n'
                            + '\nCall (Best Option): <span class="font-bold">801.478.6822 opt.4</span> (8am - 5pm MDT, Mon - Fri)'
                            + '\nEmail (if phone is closed): support@cenpoint.com';
            return oRetVal;
        }

        if (this.Sublib.contains(mURL, 'https://ows.cenpoint.com', true)){ 
            // nothing to do. Hitting our office web service. Stuff is formatted differently. SRR 04/15/2021
            oRetVal.url = mURL;
            oRetVal.oURLParams = oURLParams;
            return oRetVal;

        } else if (!this.Sublib.contains(mURL, 'cenpoint.com', true) && !this.Sublib.contains(mURL, '192.168.')){
            // not our web service (either production or internal testing)
            oRetVal.url = mURL;
            oRetVal.oURLParams = oURLParams;
            return oRetVal;

        } else if (this.Sublib.contains(mURL, 'cenpoint.com/cpwc.wc', true) || this.Sublib.contains(mURL, 'cenpoint.com/tempdocs', true)){
            // already formatted, mostly like from a repeated call after another webservice was done. SRR 07/01/2021
            oRetVal.url = mURL;
            oRetVal.oURLParams = oURLParams;
            return oRetVal;
        }


        // I've seen where the url / custcode that's stored per class get 'lost' if they are running through android webview and they had
        // their screen off for a while. Try to catch for this so they don't get a 'server did not respond' error erroneously. SRR 04.25.2018
        // NOTE: this is based off of the assumption that we only make calls to our server... for now, safe assumption. SRR 04.25.2018        
        var mCanStripOffToken;
        if (!oURLParams.custcode && !oBodyParams.custcode){
            oURLParams.custcode = this.Sublib.getConnectInfo('custcode');
        }
        if (!oURLParams.token && !oBodyParams.token){
            mCanStripOffToken = true;
            oURLParams.token = this.Sublib.getConnectInfo('token');
        }
        if (!oURLParams.useSandBoxDB && !oBodyParams.useSandBoxDB){
            // SRR 09/13/2023)
            if (this.Sublib.hittingSandbox()){
                oURLParams.useSandBoxDB = true;
            }
        }
        

        // Web service now logs logins once per day per device. Pass in the current date. Web service
        // NOTE: Can't use my normal Sublib.getDate(true) as it's async... don't think it will be a big deal here to just use new Date()
        // Only do this if they are logged in. Don't want to set our flag if they are trying to log in sa that code is different...
        if (typeof(oURLParams.logLogin) != 'boolean' && typeof(oBodyParams.logLogin) != 'boolean' && oURLParams.token){
            var mLastLogin = localStorage.getItem('lastLoginDt');
            var mWant2Log = false;
            if (!mLastLogin){
                mWant2Log = true;
            } else if (this.Sublib.daysBetween(mLastLogin, new Date()) != 0){
                mWant2Log = true;
            }

            //oURLParams.logLogin = mWant2Log;
            localStorage.setItem('lastLoginDt', this.Sublib.DTOC(new Date()));

            if (mWant2Log){
                // Switched to a seperate call so we can pass in the lat / long and get those async. SRR 03/12/2021
                this.Sublib.logLogin(); // async, just let it go
            }

        }
        if (typeof(oURLParams.product) != 'string') {
            oURLParams.product = this.Sublib.getDeviceInfo().product;
        }
        if (typeof(oURLParams.deviceType) != 'string') {
            // 'P' = Phone, 'T' = Tablet, 'D' = Desktop
            oURLParams.deviceType = (this.Sublib.deviceIsPhone() ? 'P' : (this.Sublib.isAndroid() || this.Sublib.isIOS()) ? 'T' : 'D');
        }
        /***** End Error Checking *****/

        
        // webconnect looks like https://wschicago.cenpoint.com/cpwc.wc?prg=cpauth&proc=loginssl&custcode=test

        if (!oURLParams.proc || !this.Sublib.contains(mURL, 'cpwc.wc', true)){
            // since oURLParams is passed by reference, if we have to make the same call twice because we swtiched web servers, don't need it again. SRR 07/01/2021
            
            // had a few calls where oURLParams.proc was set but the URL hadn't been formatted yet like it needed to be, still showed something like: 'https://localws.cenpoint.com/cpwo/getDailyTasks'
            // if that's the case, still need to run through this logic. NOTE: mProc SHOULD equil oURLParams.proc if this is the case! SRR 04/05/2022
            
            var mProc = mURL.substring(mURL.lastIndexOf('/') + 1);
            mURL = mURL.substring(0, mURL.lastIndexOf('/')) //+ '.wc'
            oURLParams.proc = mProc;
        }
        if (!oURLParams.prg || !this.Sublib.contains(mURL, 'cpwc.wc', true)){
            var mPrg = mURL.substring(mURL.lastIndexOf('/') + 1);
            mURL = this.Sublib.addFS(mURL.substring(0, mURL.lastIndexOf('/'))) + 'cpwc.wc'
            oURLParams.prg = mPrg;
        }



        if (oURLParams.prg && oURLParams.prg.toLowerCase() == 'cpauth' 
            && oURLParams.proc && oURLParams.proc.toLowerCase() == 'loginssl'
            && mCanStripOffToken){
            // hitting the login screen, don't add in stuff from local storage. 
            // i.e. called from Sublib.confirmPwd and need an admin login to proceed, don't want to send token for logged in user. SRR 02/10/2023
            oURLParams.token = '';
        }


        mURL = this.Sublib.replaceAll(mURL, '/cpmobile', '', true);
            

        // Figure out which subdomain (sever) to hit
        if (!this.Sublib.contains(mURL, 'jamie')
            && !this.Sublib.contains(mURL, 'alphaws')
            && !this.Sublib.contains(location.href, '192.168.10.')) {
            
            var oCurServer;
            try {
               oCurServer = JSON.parse(localStorage.getItem('curServer'));
            } catch (error){
                // not set yet, will get set below
                oCurServer = null;
            }
             
            if (!oCurServer){
                // since this method isn't async (can't await (and don't want to))
                // shoot it off and then default to the top one in our list
                this.Sublib.determineServerOrder(); // async....
                // oRetVal.errorMsg = 'Determing Web Service';
                // return oRetVal;
                oCurServer = this.Sublib.getServerList()[0];
            }

            //var mMainSubDomain = mURL.substring('https://'.length, mURL.indexOf('.cenpoint'));
            //mURL = this.Sublib.replaceAll(mURL, mMainSubDomain, oCurServer.subdomain);

            // this way it works with both ws.cenpoint.com and localws.cenpoint.com
            // NOTE: Replace ONLY replaces the first instance of the search criteria! That's why this works! SRR 01.15.2019
            mURL = mURL.replace('ws', oCurServer.subdomain); // should only do first instance which will be in 'https://ws.cenpoint.com'
        } else {
            // leave it how it is. Don't switch when I'm testing 
            // against jamie's computer or on a phone
        }

        // add Portal identifier for logging purposes
        var mIOS = this.Sublib.isIOS() 
        var mAndroid = this.Sublib.isAndroid(); 
        

        if (mIOS) {
            oURLParams.platform = 'PI';
        } else if (mAndroid) {
            if (!this.Sublib.usingWebview()) {
                oURLParams.platform = 'PA';
            } else {
                oURLParams.platform = 'MA'; // MA for Mobile Android (Android App). Using PW for Portal through Android WebView
            }

        } else {
            // Portal Other
            oURLParams.platform = 'PO';  // P for Portal. M for CP Mobile (Android), etc.
        }

        if (this.Sublib.contains(location.href, 'portalbeta', true) 
            || this.Sublib.contains(location.href, '192.168.10.116')
            || this.Sublib.contains(location.href, 'localhost')){
            // designate that it's beta so we can keep track of who's using it
            oURLParams.platform = 'B' + this.Sublib.right(oURLParams.platform, 1);
        }

        oRetVal.url = mURL;
        oRetVal.oURLParams = oURLParams;

        return oRetVal;
    }, // verifyURL


    // *********************************************************************************
    // this converts an object to a string so it gets passed the way we want (i.e. each name/value pair is a seperate param in the body)
    Vue.prototype.RestClient.convBodyObj2Str = function (oParams) {
        //oParams = object, name value pairs to be added to body. i.e. {'name': 'Scott', 'lname': 'Rindlisbacher}
        //          translates to name=Scott&lname=Rindlisbacher
        var mParamStr = '';
        var mName, mVal;

        //see if I need to add a param list
        if (typeof oParams == 'object') {
            for (var key in oParams) {
                if (oParams.hasOwnProperty(key)) {
                    mName = key;
                    mVal = oParams[key];

                    // 'encode' the params
                    // Browsers started acting funny with our %and%. Since we should only do it one way anyways, just switching to always use ~~xxx~~. SRR 05.23.2018
                    // escape key characters
                    if (typeof mVal != 'string') {
                        mVal = String(mVal);
                    }

                    // if (mVal.indexOf('&') > -1) {
                    if (this.Sublib.contains(mVal, '&')) {
                        // can't reference this.Sublib.Replaceall()
                        mVal = this.Sublib.replaceAll(mVal, '&', '~~and~~', true);
                        //mVal = mVal.replace(new RegExp('&', 'g'), '~~and~~');
                    }
                    // if (mVal.indexOf('+') > -1) {
                    if (this.Sublib.contains(mVal, '+')) {
                        // need '\\' or RegExp tried to do addition with the '+' instead of replace
                        mVal = this.Sublib.replaceAll(mVal, '\\+', '~~plus~~', true);
                        //mVal = mVal.replace(new RegExp('\\+', 'g'), '~~plus~~');
                    }
                    // if (mVal.indexOf('=') > -1) {
                    if (this.Sublib.contains(mVal, '=')) {
                        mVal = this.Sublib.replaceAll(mVal, '=', '~~equals~~', true);
                        //mVal = mVal.replace(new RegExp('=', 'g'), '~~equals~~');
                    }
                    
                    mParamStr += (mParamStr ? '&' : '') + mName + '=' + mVal;
                }
            } // for
        } // if

        return mParamStr
    } // convBodyObj2Str




    // *********************************************************************************
    // Couldn't connect to our server or request was severed in the middle. Log it / save it up to their database in the error log
    Vue.prototype.RestClient.logConnnectError = async function(mResp, mURLFailed, oURLParamsFailed, oBodyParamsFailed) {
        // mResp = Char. string we got back. See this.respHasError()
        // mURL = Char. URL we are trying to hit. 
        // oURLParams = Object. Optional.
        // oBodyParams = Object. Optional

        if (false && this.Sublib.isTestingIP(true)){
            return;
        }
        
        if (oURLParamsFailed 
            && oURLParamsFailed.proc 
            && this.Sublib.inList(oURLParamsFailed.proc.toUpperCase(), ['SAVECPPIC', 'SAVECPPICEDITED'])
            ){
            // dont add the picture to the error log. SRR 08/03/2021
            if (oBodyParamsFailed && (oBodyParamsFailed.image || oBodyParamsFailed.base64)){
                // Remember, JS passes objects by reference, don't want to change the actual picture we're trying to save. 
                // Make a copy of oBodyParamsFailed / break the reference
                oBodyParamsFailed = JSON.parse(JSON.stringify(oBodyParamsFailed));
                oBodyParamsFailed.image = '[Base64Pic]'
                oBodyParamsFailed.base64 = '[Base64]'

            } else if (oBodyParamsFailed && oBodyParamsFailed[0] && (oBodyParamsFailed[0].image || oBodyParamsFailed[0].base64)){
                // Remember, JS passes objects by reference, don't want to change the actual picture we're trying to save. 
                // Make a copy of oBodyParamsFailed / break the reference
                oBodyParamsFailed = JSON.parse(JSON.stringify(oBodyParamsFailed));
                oBodyParamsFailed[0].image = '[Base64Pic]'
                oBodyParamsFailed[0].base64 = '[Base64]'
            }
        }


        var mTimeStamp = await this.Sublib.getDate(true);
        var oCurVer = await this.Sublib.getAppVer();


        // if (!mURLFailed || mURLFailed.toUpperCase() == 'UNDEFINED'){
        //     // get the call stack so we can figure out where these are coming from! SRR 11/13/2020
        // }

        // this is based on the how we determine oURLParams.platform. SRR 11/19/2020
        var mDevice;
        if (this.Sublib.isAndroid()){
            if (this.Sublib.usingWebview()){
                mDevice = 'android_wv'
            } else {
                mDevice = 'android';
            }
        } else if (this.Sublib.isIOS()){
            mDevice = 'ios';
        } else {
            mDevice = 'other';
        }

        var mNotes =  'CP Portal Rest Client Error (version: ' + oCurVer.version + ')'
                    + '\nUser: ' + (localStorage.getItem('userFName') ? localStorage.getItem('userFName').trim() + ' ' + localStorage.getItem('userLName').trim() + ' (' + localStorage.getItem('userId') + ')' : '<Unknown / Not Signed In>')
                    + '\nURL: ' + mURLFailed 
                    + '\nURL Params: ' + this.convBodyObj2Str(oURLParamsFailed) 
                    + '\nBody Params: ' + this.convBodyObj2Str(oBodyParamsFailed)
                    + '\nhtmlPage: ' + location.href // SRR 11/13/2020
                    + '\nDevice: ' + mDevice // SRR 11/19/2020
                    + '\nDevice Detail: ' + JSON.stringify(this.Sublib.getDeviceInfo()) // SRR 11/19/2020

        var mURL = this.Sublib.getWSUrl() + 'cpError/logError'; 
        var oBodyParams = {
            errorNo: 999, // made up
            errorMsg: mResp,
            notes: mNotes,
            timeStamp: mTimeStamp,
        }

        var resp = await this.saveData(mURL, {}, oBodyParams, 'logError~timeStamp=' + oBodyParams.timeStamp);
        var oData = this.Sublib.wsResp2Obj(resp);
        if (oData.errorMsg){
        }

    } // logConnnectError


    // *********************************************************************************
    // Check to see if a URL is valid / exists (i.e. for our photos page) before trying to download it
    // Note: This makes the call WITHOUT actually grabbing the picture
    Vue.prototype.RestClient.doesURLExist = async function(mURL2Check){
        try {
            var resp = await fetch(mURL2Check, { method: "HEAD"});
        } catch (oError){
            // blocked by cors come here, report as we does not exist since, for all intents and purposes, we can't talk to it. 
            return false;
        }
        // resp looks like:
        // {
        // body: ReadableStream
        // bodyUsed: false
        // headers: Headers {}
        // ok: true
        // redirected: false
        // status: 200
        // statusText: ""
        // type: "cors"
        // url: "https://localws.cenpoint.com/"
        // }

        var mRetVal;
        if (resp.ok){
            mRetVal = true;
        } else {
            mRetVal = false;
        }

        return mRetVal;
    } // doesURLExist



} // install
} // Export
