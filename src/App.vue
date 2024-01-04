<template>
  <v-app id="app" :dark="darkMode">

    <!-- Make it so our app is available offline  -->
    <iframe v-if="Sublib.usingWebview('ios')" src="../iosAppCache.html" width="0" height="0" />

    <v-app-bar :color="appColor" dark fixed app height="50" id="appTopBar" :style="{'min-width': 'calc(100% - ' + sideBarWidth + 'px ) !important'}" >  <!--This is the 'top bar' -->
        <v-icon id="appBarBackBtn" @click="backBtn_click">arrow_back</v-icon>
        <!-- <img src="../public/img/CPcircle.png" class="header-logo pointer" @click="goHome" /> -->
        <img id="appBarLogo" :src="getAppBarIcon" class="header-logo pointer" @click="goHome" />
        <!-- <v-toolbar-title :style="{ 'margin-left': '10px'}">{{appBarTitle}}</v-toolbar-title> -->
        <v-toolbar-title :style="{ 'margin-left': '10px'}" v-html="appBarTitle"></v-toolbar-title>
        
        <span v-if="showProdDBWarning" style="color:rgb(255, 128, 0); font-size:24px;" class="margin-left-10">
            {{Sublib.getLbl('dev mode prod db warning')}}
        </span>
        <span v-if="showSandboxDBWarning" style="color:rgb(255, 128, 0); font-size:24px;" class="margin-left-10 text-truncate">
            {{Sublib.getLbl('using sandbox disclaimer')}}
        </span>

        <v-spacer></v-spacer> <!-- Makes the btn go to the right -->
        <v-icon v-if="showNoService || forceOfflineMode" color="red" @click="lblNoServiceClicked" class="no-service-icon">wifi_off</v-icon>

    </v-app-bar>

    <!-- <router-view id="router-view" :style="{ 'margin-top': Sublib.getAppTopBarHeight() + 'px', 'margin-bottom': '2rem' }" /> -->
    <router-view id="router-view" :style="routerViewStyle" />


    <div v-if="showNoService || forceOfflineMode" class="offlineTextOverlay">
        {{Sublib.getLbl('offline')}}
    </div>

  </v-app>
</template>


<script>
// ************************************************************************************************************************************************
    import EventBus from './components/Event-Bus.vue';
    import HomeOpt from './components/Home-Opt.vue';

    import themes from "devextreme/ui/themes";

    export default {
        name: 'app',
        data: () => ({
            mainMenuOpen: false,
            darkMode: false,
            lblStatus: '',
            imgStatus: '',
            newNotifCnt: 0,
            appBarTitle: 'CenPoint Portal',
            showNotifs: false,
            aNotifs: [],
            showNoService: false,
            imgTimeStat: '',
            lblTimeStat: '',
            lblTimeStatStatusLbl: '', // used if lblTimeStatShowWordStatus = false
            lblTimeStatShowWordStatus: true,
            lblUserInitials: '', // pulls from local storage so can't be computed
            lblUserName: '', // pulls from local storage so can't be computed
            // officeView: false, // pulls from local storage so can't be computed
            // fullUser: false, // pulls from local storage so can't be computed
            forceOfflineMode: false,
            tmrNoServer: null,

            versionType: '!FREE!',
            versionMode: 'EXPIRED',

            showProdDBWarning: false,
            showSandboxDBWarning: false,

            routerViewObserver: null,
            routerViewStyle: {},

            tmrNoActivity: null,
            sideBarWidth: '0px', // calculated via JS

            userSelfPic: '', // used for the user avatar. If they have a pic, use it. Otherwise, use their initials.
            
        }), // data


        //***************************************************************
        components: {
            HomeOpt,
            //Sublib
        }, // components


        //***************************************************************
        computed: {
            appColor: function(){
                return this.Sublib.getColor('app');
            },
            getAppBarIcon(){
                return 'img/CPcircle.png'
            }, // getAppBarIcon

        }, // computed


        //***************************************************************
        watch: {

            darkMode: function(){
                this.$vuetify.theme.dark = this.darkMode;
                
                if(this.darkMode){
                    themes.current('material.blue.dark.compact');
                }else{
                    themes.current('material.blue.light.compact');
                }
            },
        }, // watch


        //***************************************************************
        async created() {
            // main init
            // eslint-disable-next-line

            if (!this.Sublib.contains(location.href, 'localhost')){
                this.Sublib.Vue.config.errorHandler = this.Sublib.handleError; // setup my error handler

                // Note: This is for when the Vue error handler doesn't kick in, otherwise, handled by the vue error handler.
                // NOTE: Moved to index.html so if it fails to load originally this will kick in. SRR 02/26/2020
                if (!window.onerror){
                    // didn't catch it on index.html for some reason. Add it here. SRR 03/03/2020
                    window.onerror = function(mMsg, mSource, mLineNo, mColNo, error){
                        if ((mMsg.toLowerCase().indexOf("unexpected token '<'") >-1 || mMsg.toLowerCase().indexOf("unexpected token <") >-1
                                || mMsg.toLowerCase().indexOf("expected expression, got '<'") > -1 || mMsg.toLowerCase().indexOf("expected expression, got <") > -1) 
                            && mMsg.toLowerCase().indexOf('.map') < 0){                                
                            // Chrome throws the 'unexpected token', firefox throws the 'expected expression, go '<'. SRR 02/13/2020
                            // this happens when a new update gets applies but my router.vue file hasn't been pulled down for whatever reason. A page refresh fixes it. SRR 01/29/2020
                            // mSource = 
                            if (navigator.onLine){
                                window.location.reload();
                            }

                            return true; // needed so firefox doesn't handle the error as well and really does my code
                        }

                    }; // window.onerror
                }
            }




            // NOTE: Used to have these lower but it was causing problems where they weren't registered yet by the time code ran on the actual page we were rendering.
            // Moving them up here seemed to fix it. SRR 05/21/2020
            window.EventBus = EventBus;
            // global listener(s) so we can update variables on the master page
            EventBus.$on('updtAppNotifCnt', this.setAppNotifCnt); 
            EventBus.$on('updtAppTitleBar', this.setAppTitleBar); 
            EventBus.$on('refreshAppNotifs', this.refreshAppNotifs);
           
            EventBus.$on('appNotifClicked', () => { this.showNotifs = false }); // // click on a notification. Close down the notification bar
            EventBus.$on('serviceChanged', this.serviceChanged);
            EventBus.$on('updtTimeStatus', (img, lbl) => { 
                this.lblTimeStat = lbl;
                this.imgTimeStat = img;
            });
            EventBus.$on('updtUserAvatar', this.updtUserAvatar);
            EventBus.$on('setDarkMode', (mDarkMode) => { this.darkMode = mDarkMode }); // called from the settings page

            EventBus.$on('updtVersionType', this.getVersionType); // called from the settings page
            EventBus.$on('custCodeChanged', this.showHideDBWarning); // Called from signIn.vue  SRR 05/30/2023



            localStorage.setItem('errorAlreadyRefreshed', false); // see notes in index.html

            this.Sublib.oVuetify = this.$vuetify; // set before calling mbox() or any other method that uses vuetify
            this.Sublib.RestClient = this.RestClient;
            this.Sublib.IDB = this.IDB; // see main.js for how it's available here
            //this.Sublib.router = this.$router; switched so we can intercept the page change better to let certain things through. See Sublib.router = {}. SRR 11/07/2023
            this.Sublib.routerRef = this.$router; 
            this.Sublib.router.SublibRef = this.Sublib;
            //this.Sublib.router.__proto__ = this.Sublib.routerRef;
            
            // This used to be in router.js but I couldn't access Sublib, moving here so I can. sneaky sneaky. SRR 11/07/2023
            let _this = this;
            this.Sublib.routerRef.beforeEach((to, from, next) => {
            // from.meta?.scrollPos && (from.meta.scrollPos.top = window.scrollY)
                // this is a global intercept of the page changing
                if (typeof window.locationOn == 'boolean' && !window.locationOn){    
                    //Sublib.mbox('You must turn on location services before you can proceed.');
                    _this.Sublib.mbox('You must turn on location services before you can proceed.');
                    next(false); // cancel navigation
                    return;
                }

                //if (_this.Sublib.openPopUpCnt > 0 && !_this.Sublib.routeChangedByUs){ // our openPopups is not decreasing correctly for Max. Not sure why yet. For now, do it this other way but still need to figure out why the popupCnt is wrong
                if (document.getElementsByClassName('v-dialog').length > 0 && !_this.Sublib.routeChangedByUs){
                    // make them deal with the popup first. SRR 11/07/2023
                    // make sure the dialog is visible. Got stuck because we had an invisible one. SRR 12/19/2023
                    let oDialogs = document.getElementsByClassName('v-dialog');
                    for (var mx = 0; mx < oDialogs.length; mx++){
                        if (oDialogs[mx].style.display != 'none'){
                            next(false); // cancel navigation
                            return;
                        }
                    }

                    // next(false); // cancel navigation
                    // return;
                }


                next(); //continue to the page they want
            }); // beforeEach



            this.Sublib.math = this.math;
            this.Sublib.cryptoJS = this.$CryptoJS; 

            this.RestClient.Sublib = this.Sublib;
            this.RestClient.IDB = this.IDB;

            this.IDB.Sublib = this.Sublib;
            this.IDB.init();


            this.math.Sublib = this.Sublib;


            if (window.alasql){
                window.sqlExec = window.alasql;
                // make it so we can call Sublib functions inside of a SQL query
                // NOTE: cannot do sql.fn.Sublib = this.Sublib. Won't work. Have to call like: 
                sqlExec.fn = {...sqlExec.fn, ...this.Sublib}; 
            } else {
                if (localStorage.getItem('userType') == 'FULL'){
                    let alaSQlMsg = 'Failed to load required scripts (alasql). You may get random errors throughout the app.';
                    if (this.Sublib.isIOS()){
                        alaSQlMsg += "\n"
                                    + "\nThis could be caused by your iOS version being out of date. Please update your iPhone/iPad to version 16(+) and try again.";
                    } else {
                        alaSQlMsg += "\n"
                                    + "\nThis could be caused by your operating system (OS) or browser version being out of date. Please update your OS / browser and try again.";
                    }
                    await this.Sublib.mbox(alaSQlMsg);
                } else {
                    // alasql is not currently used on the tech side so hide the message as it won't apply to them. 
                }
            }
           

            //if (this.Sublib.isTestingIP()) {
            if (this.Sublib.contains(location.href, 'localhost') || this.Sublib.isTestingIP(true)){
                window.IDB_ = this.IDB; // make it so I can access via the dev tools
                window.Sublib_ = this.Sublib;
                window.Sublib_.afterUpdt = this.afterUpdt; // this is just for testing, cannot reference Sublib.afterUpdt() anyother time. SRR 03/01/2023

                window.math_ = this.math;

                this.Sublib.Vue.config.devtools = true;

            } else if (this.Sublib.isTestingIP(false)){
                // Other testers. Want it to normally error out but still want to be able to run stuff if I need to. SRR 08/17/2022
                window.Sublib_ = this.Sublib;
                this.Sublib.Vue.config.devtools = true;
            }


            localStorage.setItem('techSchedLastDate', ''); // reset on app load

            this.createJQueryFunctions();

            this.getVersionType();

            


            this.setAppTitleBar(); //this.appBarTitle);
            await this.IDB.openDB('CenPoint'); // make sure the DB is ready to go. 

            if (!localStorage.getItem('curServer')){
                // figure out the closest server by geo dist
                await this.Sublib.determineServerOrder(); // sets values in local storage
            } else {
                // make sure our 'server list' includes all of the servers.
                var oHold = localStorage.getItem('prefServerOrder');
                if (oHold){                    
                    oHold = JSON.parse(oHold);
                    if (oHold.length != this.Sublib.getServerList().length){
                        // Added a new server, need to recalc which one people point to. SRR 01/23/2020
                        await this.Sublib.determineServerOrder();
                    }
                }
            }

            var wantAppURL = localStorage.getItem('appURL'); // 'https://portalbeta.cenpoint.com'
            if (wantAppURL && wantAppURL != this.Sublib.getCurURL(false, true)){   
                // loaded portal and want portal beta, switch. SRR 05/16/2023
                // NOTE: appURL is set from settings.vue!           
                var switchAppURL = true;
                // make sure we don't get stuck when we actually want to stay. SRR 05/16/2023
                if (this.$router && this.$router.currentRoute && this.$router.currentRoute.query && this.$router.currentRoute.query.resetappurl){
                    // make it so we don't get stuck on portal beta
                    localStorage.removeItem('appURL');
                    switchAppURL = false;

                } else if (this.Sublib.contains(this.Sublib.getCurURL(true), 'resetappurl', true)){
                    // make it so we don't get stuck on portal beta
                    // this.$router doesn't always have the actual query params. try it this way as well
                    //'http://localhost:8080/settings?custcode=TESTEXT&token=&showadvanced=true&resetappurl=true'
                    localStorage.removeItem('appURL');
                    switchAppURL = false;

                } else if (this.Sublib.contains(this.Sublib.getCurURL(), 'localhost:', true)){
                    // don't get stuck!
                    localStorage.removeItem('appURL');
                    switchAppURL = false;
                }

                if (switchAppURL){
                    var curPage = this.Sublib.getCurURL(); // includes page we are on
                    location.href = this.Sublib.strtran(curPage, this.Sublib.getCurURL(false, true), wantAppURL); // keep params on the URL
                    return;
                }
            }




            // iPhones were having problems with spotty coverage. Let them just force it to act like it's offline. SRR 11/16/2021
            var mForceOffline = localStorage.getItem('forceOffline'); 
            if (!mForceOffline){
                mForceOffline = false;
            } else {
                mForceOffline = this.Sublib.convFromStr(mForceOffline);
            }

            this.forceOfflineMode = mForceOffline;



            var mTheme = localStorage.getItem('appTheme');
            if (!mTheme){
                mTheme = 'system';
                localStorage.setItem('appTheme', mTheme);
            }
   
            if (mTheme == 'dark' || (mTheme == 'system' && this.Sublib.getSystemTheme() == 'dark')){
                this.darkMode = true;
            } else {
                this.darkMode = false;
            }

            if(this.darkMode){
                themes.current('material.blue.dark.compact');
            }else{
                themes.current('material.blue.light.compact');
            }
            
            var oSystemTheme = window.matchMedia('(prefers-color-scheme: dark)');
            oSystemTheme.addListener((newTheme) =>{
                // since I'm watching the dark theme, if it matches, theme is dark, if it doesn't, theme is light
                var mAppTheme = localStorage.getItem('appTheme');
                if (mAppTheme == 'system'){
                    this.darkMode = newTheme.matches;        
                }
                EventBus.$emit('settingsUpdtThemeLbl'); // if they have the settings screen open, need to update the page (since they can turn it on / off from the main menu or settigns)
            });


            var mDevHasDialer = localStorage.getItem('devHasDialer');
            if (typeof mDevHasDialer == 'undefined' || mDevHasDialer == null){
                this.Sublib.setDeviceHasDialer();
            }
            
            var mPrefMap = localStorage.getItem('prefMap');
            if (typeof mPrefMap == 'undefined' || mPrefMap == null){
                if (this.Sublib.isIOS()){
                    localStorage.setItem('prefMap', 'apple');
                } else {
                    localStorage.setItem('prefMap', 'google');
                }
            }


            // Make it so we have the mouse coordinates always so our showMenu has access to them
            // add the mouse for desktop, touch for mobile. SRR 09/30/2022
            var mouseX, mouseY;
            // $(document).mousemove(function(e) {
            //     // see https://stackoverflow.com/questions/4517198/how-to-get-mouse-position-in-jquery-without-mouse-events#:~:text=You%20can%27t%20read%20mouse%20position%20in%20jQuery%20without,variable%20that%20is%20updated%20by%20a%20mousemove%20handler%3A
            //     window.mouseX = e.pageX;
            //     window.mouseY = e.pageY;
            // }).mouseover(); // call the handler immediately

            //$(document).on('touchstart', function(e) {
                // //var t = e.targetTouches && e.targetTouches.length > 0 ? e.targetTouches.item(0) : e.touches.item(0); 
                // var evt = (typeof e.originalEvent === 'undefined') ? e : e.originalEvent;
                // var t = evt.touches[0] || evt.changedTouches[0];
                
                // window.mouseX = t.pageX;
                // window.mouseY = t.pageY;
            //}

            
            $(document).mousedown(function(e){
                // see https://stackoverflow.com/questions/41993176/determine-touch-position-on-tablets-with-javascript
                // This is fired for both mouse and touch!
                if(e.type == 'touchstart' || e.type == 'touchmove' || e.type == 'touchend' || e.type == 'touchcancel'){
                    var evt = (typeof e.originalEvent === 'undefined') ? e : e.originalEvent;
                    var touch = evt.touches[0] || evt.changedTouches[0];
                    window.mouseX = touch.pageX;
                    window.mouseY = touch.pageY;
                    window.lastClick = new Date();
                } else if (e.type == 'mousedown' || e.type == 'mouseup' || e.type == 'mousemove' || e.type == 'mouseover'|| e.type=='mouseout' || e.type=='mouseenter' || e.type=='mouseleave') {
                    window.mouseX = e.clientX;
                    window.mouseY = e.clientY;
                    window.lastClick = new Date();
                }
            });

            
            // MOVED ABOVE!
            // // global listener(s) so we can update variables on the master page
            // EventBus.$on('updtAppNotifCnt', this.setAppNotifCnt); 
            // EventBus.$on('updtAppTitleBar', this.setAppTitleBar); 
            // EventBus.$on('refreshAppNotifs', this.refreshAppNotifs);
           
            // EventBus.$on('appNotifClicked', () => { this.showNotifs = false }); // // click on a notification. Close down the notification bar
            // EventBus.$on('serviceChanged', (status) => { this.showNoService = (status == 'offline') });
            // EventBus.$on('updtTimeStatus', (img, lbl) => { 
            //     this.lblTimeStat = lbl;
            //     this.imgTimeStat = img;
            // });
            // EventBus.$on('updtUserAvatar', this.updtUserAvatar);
            // EventBus.$on('setDarkMode', (mDarkMode) => { this.darkMode = mDarkMode }); // called from the settings page


            if (this.Sublib.contains(location.search, 'cpkey') && !this.Sublib.contains(location.pathname, 'resetPwd')){
                // we sent a link to someone (a customer of our customer) to do something (i.e. sign a field ticket)
                // they don't need location or authentication. SRR 05/18/2020
                // the page they are going to will do additional authentication.

                // NOTE: this if statement is also in Sublib.getLocation() so if you change it make sure you change it there!

                // Hide the clock in status bar (will be blank) and th menu / notifications
                //document.getElementById('appTechTimeStat').style.display = 'none'
                //EventBus.$emit('updtTimeStatus', 'img/CPcircle.png', 'Powered By CenPoint');
                this.lblTimeStatShowWordStatus = false; 
                this.lblTimeStatStatusLbl = this.Sublib.getLbl('powered by'); //'Powered By'
                this.imgTimeStat = 'img/CPcircle.png'
                this.lblTimeStat = 'CenPoint'

                // Make it clickable
                var oPoweredBy = document.getElementById('appTechTimeStat');
                oPoweredBy.onclick = function(){
                    //window.open('https://www.cenpoint.com', '_blank')
                    window.open('https://lnk.cenpoint.com/l?3f40', '_blank') // make it so we can see how many people come to our site from links customers are sent. SRR 06/21/2023
                    
                }
                oPoweredBy.classList.add('pointer');


                document.getElementById('appBarNotifs').style.display = 'none'
                document.getElementById('appBarMainMenu').style.display = 'none'
                document.getElementById('appBarBackBtn').style.display = 'none'

                // make sure I know the current date / time on the customer server so we can accurately show when links expire
                var mURL =this.Sublib.getWSUrl() + 'cpGetUsers/getCustServerDate'; 
                var oParams = {
                    url: location.href
                }
                var resp = await this.RestClient.get(mURL, oParams, 'getServerDate');
                var oData = this.Sublib.wsResp2Obj(resp);                            
                if (oData.errorMsg){
                    // not a valid URL, the page they're trying to hit will take care of.
                } else {
                    // store it out for future use
                    localStorage.setItem('srvDate', JSON.stringify(oData[0]));
                }

                this.Sublib.getSelLang(); // show postal instead of 'zip' for canadian payment links, etc. SRR 06/21/2023

                return;


            } else if (this.Sublib.contains(location.pathname, 'signUp', true) || this.Sublib.contains(location.pathname, 'redirect')){
                // sign up page. Nothing to do. Just let it through now that our libraries are loaded. SRR 03/10/2021
                this.lblTimeStatShowWordStatus = false; 
                //this.lblTimeStatStatusLbl = 'Powered By'
                this.imgTimeStat = 'img/CPcircle.png'
                this.lblTimeStat = 'CenPoint'


                document.getElementById('appBarNotifs').style.display = 'none';
                // document.getElementById('appBarMainMenu').style.display = 'none';
                // document.getElementById('appBarBackBtn').style.display = 'none';

                return; 

            } else if (this.Sublib.contains(location.pathname, 'status', true)){
                if (!this.Sublib.getConnectInfo('token')){
                    // not signed in, just viewing the status
                    // don't want to require location, etc. below
                    return;
                }
            }


            // make sure my cached date is correct
            //await this.Sublib.getDate(); // moved below to make sure we're signed in
            
            if (this.versionMode == 'EXPIRED'){
                // Check to see if they've renew yet or not.
                await this.Sublib.refreshVersionType();
                this.getVersionType(); // Sets this.versionMode
                
                if (this.versionMode == 'EXPIRED'){
                    // still expired. Show the countdown
                    this.Sublib.showExpiredMsg(30);
                }
            }


            //var _this = this; defined above
            window.addEventListener('beforeinstallprompt', function(event){
                // this is for the PWA install prompt
                event.preventDefault();
                _this.Sublib.pwaPrompt = event;
                //_this.addToHomeScreen(); // moved to Sublib
            }); 
            

            //window.Sublib = Sublib; // note the eslint line tells it to not throw a warning that i don't 'use' Sublib (i.e. declared but never used)
            //Vue.mixin(Sublib);
            // eslint-disable-next-line
            //window.RestClient = RestClient;
            // eslint-disable-next-line
            //window.EventBus = EventBus; // moved above
            // eslint-disable-next-line
            //window.IDB = IDB;
           
            // NOTE: since we are using the same domain as our old version, need to un-register it's service worker, make sure our DB version is high enough, etc.
            if ('serviceWorker' in navigator){
                try {
                    var oSWsRegistered = await navigator.serviceWorker.getRegistrations();
                    for (var registration of oSWsRegistered) {                        
                       if (registration.active && this.Sublib.contains(registration.active.scriptURL, 'offline_sw.js', true)) {
                            registration.unregister();
                            break;
                        }
                        
                    } // for
                } catch (ignore){
                }
            } else if (this.Sublib.usingWebview('ios')){
                // ios webview doesn't support service workers. 
                // Relying on appcache (deprecated but still works for now) to get around this so our app will work offline.
                // NOTE: We are using a plugin that works with webpack so it figures out what files we need. See vue.config.js for the file name generated settings. SRR 07/13/2020

                // Done via an 'iFrame' above, can't dynamically set the manifest attribute and have the browser actually do it. 
                //document.getElementsByTagName('html')[0].attributes["manifest"].value = '/cplite.appcache';
            }

            this.registerSW();

            this.Sublib.updtTimeStatus(); // typically fires on page change but Sublib wasn't around when this page loaded and so we need to manually it fire it on app load

            var mHold = localStorage.getItem('pushNotifs');
            if (!mHold){
                // app loading for first time, default to on
                localStorage.setItem('pushNotifs', 'true');
            }

            this.Sublib.setAppZoom(); // SRR 12/15/2023
            
            // Make sure that location services are turned on
            // Don't await this as it make take a second and if it's on (which it should always be) don't want to make the user wait. SRR 07.22.2019
            this.Sublib.getLocation().then((oLoc) => {
                if (!oLoc.locationOn){
                    this.Sublib.mbox(oLoc.errorMsg);
                    return;
                } 
            }); // getLocation



            // figure out how many notifications they haven't looked at yet.
            var aHold = JSON.parse(localStorage.getItem('appNotifs'));
            this.newNotifCnt = 0;
            if (aHold){
                for (var mx = 0; mx < aHold.length; mx++){
                    if (!aHold[mx].read){
                        this.newNotifCnt++;
                    }
                }
            }

            //check if selfPic thumbnail exists in the IDB
            var userId = localStorage.getItem('userId');
            
            await this.Sublib.clearIDB();


            if (this.Sublib.convFromStr(localStorage.getItem('runAfterUpdt'))){
                localStorage.setItem('runAfterUpdt', false);
                this.afterUpdt();
            }

        }, // created


        //***************************************************************
        // Had some reports of the app showing 'offline' if they turned the screen off with the app open
        // and then when they came back to it and turned the screen back on it showed offline. Check here and see if it helps. SRR 03/22/2022
        async mounted(){
            this.Sublib.checkOfflineStatus();

            // The Side bar naviagation was changing the style on our router view tag and causing problems since we need the router top margin, etc. 
            // Watch it for changed
            // see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver?redirectlocale=en-US&redirectslug=DOM%2FMutationObserver
            let routerViewTag = document.getElementById('app'); // document.getLementById('router-view'); // kept going out of scope, listen to it's parent. This is a huge observer but what we have to do
            while (!routerViewTag){
                await this.Sublib.sleep(1*1000);
                routerViewTag = document.getElementById('app');
            }
            this.routerViewStyle = { 'margin-top': this.Sublib.getAppTopBarHeight() + 'px', 'margin-bottom': '2rem' } // have to set it once the page is rendered or it kept returning 0 and causing problems. SRR 09/15/2023
                
            //let routerStyle = this.routerViewStyle;
            let _this = this;

            this.routerViewObserver = new MutationObserver(function(mutationList, observer){
                for (const mutation of mutationList) {          
                    if (mutation.type === "childList") {
                        // console.log("A child node has been added or removed.");
                    } else if (mutation.type === "attributes" || mutation.attributeName == 'style') {
                        // console.log(`The ${mutation.attributeName} attribute was modified.`, mutation.target.id, mutation.target.style);

                        if (mutation.attributeName == 'style' 
                            && (mutation.target && mutation.target.id && mutation.target.id.toLowerCase() == 'router-view')) {

                                 //console.log('router view style changed, setting it back', mutation.target.style.margin);

                            if (!mutation.target.style.margin || mutation.target.style.margin == '0px auto' || mutation.target.style.marginTop == '0px' 
                                || (_this.Sublib.isMac() // The code below was causing an inifinite loop on some (2 out of 50) android devices. Not sure why / the difference. Since we added it for Macs, only do it if it is a mac. SRR 01/04/2024
                                        && _this.Sublib.contains(mutation.target.style.margin, 'auto ' + _this.routerViewStyle['margin-bottom']) 
                                        && mutation.target.style.margin != _this.routerViewStyle['margin-top'] + ' auto ' + _this.routerViewStyle['margin-bottom'] // '50px auto 2rem'
                                    ) 
                            ){
                                // It got changed on us by Vuetify. Set it back!
                                // console.log('router view style changed, setting it back', _this.routerViewStyle);
                                mutation.target.style.marginTop = _this.routerViewStyle['margin-top'];
                                mutation.target.style.marginBottom = _this.routerViewStyle['margin-bottom'];
                                mutation.target.style.margin = _this.routerViewStyle['margin-top'] + ' auto ' + _this.routerViewStyle['margin-bottom']; //'50px auto 2rem'
                                //console.log(mutation)
                            }

                            return;
                        }
                    }
                } // for
            });

            this.routerViewObserver.observe(routerViewTag, {attributes: true, subtree: true,  }) // childList: true, subtree: true, characterData: true
            // it wasn't 'observing' page changes so my code only fired on whatever URL page they loaded first. Watch the body instead (way overkill but I guess that's what's needed)
            //this.routerViewObserver.observe(document.getElementsByTagName('body')[0], {attributes: true }) // childList: true, subtree: true
            
            try {
                this.sideBarWidth = document.getElementById('appMenu').getBoundingClientRect().width;
            } catch(ignore){
            }



        }, // mounted


        //***************************************************************
        methods: {
           
            //***********************************************************
            getVersionType(){
                this.versionType = this.Sublib.getVersionType();
                this.versionMode = this.Sublib.getVersionMode();
            }, // getVersionType



            //***********************************************************
            // Add some functions to jQUery that don't come built in
            createJQueryFunctions(){
                // js has not built in onScrollEnd function (neither does jQuery)
                // got this from https://stackoverflow.com/questions/3701311/event-when-user-stops-scrolling
                $.fn.scrollEnd = function(callback, timeout) {          
                    $(this).scroll(function(){
                        var $this = $(this);
                        if ($this.data('scrollTimeout')) {
                        clearTimeout($this.data('scrollTimeout'));
                        }
                        $this.data('scrollTimeout', setTimeout(callback, timeout));
                    });
                }; // scrollEnd
            }, // createJQueryFunctions


            //***********************************************************
            //btnSignIn: () => { // NOTE: () => functions change the 'this' context!
            btnSignIn: function() {
                //this.$router.push({path: '/signIn', query: { fname: 'Scott'}});
                this.$router.push('/signIn');
                this.mainMenuOpen = false; // sometimes it fails to close the menu. shut it down
            }, // btnSignIn


            //***********************************************************
            btnSignOut: function() {
                this.$router.push('/signOut');
                this.mainMenuOpen = false; // sometimes it fails to close the menu. shut it down
            }, // btnSignout


            //***********************************************************
            toggleDarkMode: function(){
                this.darkMode = !this.darkMode;
                localStorage.setItem('darkMode', String(this.darkMode));
                EventBus.$emit('settingsUpdtDarkMode', this.darkMode); // if they have the settings screen open, need to update the page (since they can turn it on / off from the main menu or settigns)

                this.mainMenuOpen = false;
            }, // toggleDarkMode


            //***********************************************************
            async toggleForceOfflineMode(){
                this.forceOfflineMode = !this.forceOfflineMode;
                localStorage.setItem('forceOffline', String(this.forceOfflineMode));
                
                if (this.forceOfflineMode){
                    EventBus.$emit('serviceChanged', 'offline');
                } else {
                    await this.Sublib.checkOfflineStatus();
                    if (!this.Sublib.offline()){
                        EventBus.$emit('serviceChanged', 'online');
                        // Upload everything saved while they were offline
                        await this.Sublib.sleep(1000 * 3) // 3 seconds
                        this.Sublib.saveWSPendingSave() //(true); //silent mode
                    } else {
                        this.Sublib.mbox(this.Sublib.getLbl('force offline off but still offline no service'))
                    }
                }

                this.mainMenuOpen = false;

            }, // toggleForceOfflineMode


            //***********************************************************
            btnSettingsClicked: function(){
                this.$router.push('/settings');
                this.mainMenuOpen = false;
            }, // btnSettingsClicked


            //***********************************************************
            goHome: function(){
                if (this.Sublib.contains(location.href, 'cpkey')){
                    // the customer got a link to sign the ft and just clicked our customers logo in the top left. Don't do anything here
                    return;
                }

                if (this.Sublib.contains(this.Sublib.getCurURL(), 'home')){
                    // If clicking on the CP icon on the home screen, change the tab to be the main tab. SRR 03/20/2023
                    EventBus.$emit('homeIconClicked', true);
                }

                this.$router.push('/');
                this.mainMenuOpen = false;


            }, // goHome


            //***********************************************************
            backBtn_click: function(){
                if (this.$router.currentRoute.name != 'home'){
                    this.$router.go(-1);    
                }
                this.mainMenuOpen = false;
            }, // backBtn_click


            //***********************************************************
            // Clicked on their name on the menu. SRR 11/15/2022
            btnUserPrefClicked(){
                this.mainMenuOpen = false;

                if (!this.fullUser()){
                    // Techs can't edit user preferences as they don't really have any...
                    return;
                }

                this.$router.push({ path: 'users', query: { userid: localStorage.getItem('userId')}});
            }, // btnUserPrefClicked


            //***********************************************************
            // NOTE: this is called via the '$emit' from the children controllers / EventBus (see this.created() for where we define the listener)
            setAppNotifCnt (mNumber2Add, mReset){
                // mNumber2Add = Numeric. Number of new notifications to add
                // mReset = logical. if true, resets to 0
                if (mReset){
                    this.newNotifCnt = 0;

                } else {
                    this.newNotifCnt += mNumber2Add
                }

            }, // setAppNotifCnt


            //***********************************************************
            setAppTitleBar (mTitle){

                if (!mTitle){
                    var oVersions = this.Sublib.getVersionOptions();
                    var oVersion = oVersions.find(obj => obj.value == this.versionType);
                    var mVersion;

                    if (oVersion){
                        mVersion = oVersion.text;
                    } else {
                        mVersion = ' Portal'; // what we used to show
                    }
                    mTitle = 'CenPoint ' + mVersion;  //Portal';
                }

                var mRegTradeMark = '<span style="font-size:10px; vertical-align:top;">&reg</span>';
                //® keyboard short cut: 'Alt' + '0174'
                if (this.Sublib.contains(mTitle, 'CenPoint')){
                    mTitle = mTitle.replace('CenPoint', 'CenPoint' + mRegTradeMark);
                }

                this.appBarTitle = mTitle;

                // also update the 'tab' label (if you have multiple tabs open (even between different sites)
                // It helps to know what is what.
                // NOTE: this DOES NOT touch the icon, just the text
                //document.title = 'CP - ' + mTitle.replace(mRegTradeMark, '');
                // Got rid of the 'CP - ' in front. No other sites do this (i.e. youtube, trello, etc). It's branded with our logo. Good enough and gives more space for the job id. SRR 07/19/2021
                document.title = mTitle.replace(mRegTradeMark, ''); 

            },


            //***********************************************************
            btnNotifsClicked() {
                this.showNotifs = !this.showNotifs;

                if (!this.showNotifs){
                    this.aNotifs = [];
                    return;
                }

                var aHold = this.getAppNotifs();
 
                this.aNotifs = aHold;

            }, // btnNotifsClicked


            //***********************************************************
            // called from the Notifs component after a notif has been cleared
            refreshAppNotifs() {            
                var aHold = this.getAppNotifs();

                this.aNotifs = [];    
                this.aNotifs = aHold;
                
                
            }, // refreshAppNotifs


            //***********************************************************
            // Pull the notifications from localStorage and filter the list
            // Returns: Array
            getAppNotifs(){          
                var aHold = JSON.parse(localStorage.getItem('appNotifs'));
                if (!aHold){
                    aHold = [];
                }

                aHold = aHold.filter(obj => {
                    return !obj.cleared
                });

                if (!aHold || aHold.length == 0) {
                    var oNot = this.Sublib.goodNotifObj();
                    oNot.msg = this.Sublib.getLbl('no notifs');
                    oNot.time = Date();
                    
                    aHold = [];
                    aHold.push(oNot);
                }

                // put the newest on top (stored with newest added to the bottom);
                aHold.reverse(); 

                return aHold;
            }, // getAppNotifs


            //***********************************************************
            // Cycle through and clear out all app notifications
            async clearAllNotifs(){
                for (var mx = 0; mx < this.aNotifs.length; mx++){
                    await this.Sublib.clearAppNotif(this.aNotifs[mx]);
                }

                this.refreshAppNotifs();
                
                // close down the notifications window
                this.showNotifs = false;

            }, // clearAllNotifs


            //***********************************************************
            // They clicked the no-wifi symbol. Tell them what it means
            async lblNoServiceClicked(){
                //this.Sublib.mbox('You are currently offline. Data will automatically be uploaded when you return to the modern era ;)');

                // see https://www.w3schools.com/charsets/ref_emoji_smileys.asp for emoji codes. SRR 10.11.2019
                this.Sublib.mbox("You are currently offline. Data will automatically be uploaded when you return to the modern era <span style='font-size:20px'>&#128521;</span>");

                // do a double check and see if they somehow have service now. SRR 04/06/2022
                await this.Sublib.checkOfflineStatus();
                if (!this.Sublib.offline()){
                    EventBus.$emit('serviceChanged', 'online');
                    // Upload everything saved while they were offline
                    this.Sublib.saveWSPendingSave() //(true); //silent mode
                }
            }, // lblNoServiceClicked


            //***********************************************************
            // user clicked the clock in / out button. Luanch our modal dialog box
            async btnClockInOutClicked(){
                if (this.Sublib.offline()){
                    await this.Sublib.mbox(this.Sublib.getLbl('not avail offline'));
                    return;
                }
                var mDflt2ClockOut = (this.lblClockIn == this.Sublib.getLbl('clock out'));
                var mGoOn = await this.Sublib.showClockInOut(mDflt2ClockOut);

                if (mGoOn == '!CANCEL!'){
                    return;
                }

                this.Sublib.updtTimeStatus();
            }, //btnClockInOutClicked


            //***********************************************************
            // set the user avatar to the users initials
            updtUserAvatar(){
                if (!localStorage.getItem('token')){
                    // not signed in. Don't display anything
                    this.lblUserInitials = '';
                    this.lblUserName = '';
                    return;
                }

                var mFirst = localStorage.getItem('userFName');
                if (!mFirst){
                    mFirst = '';
                }
                var mLast = localStorage.getItem('userLName');
                if (!mLast){
                    mLast = '';
                }
                this.lblUserInitials = this.Sublib.left(mFirst, 1).toUpperCase() + this.Sublib.left(mLast, 1).toUpperCase();
                this.lblUserName = mFirst + ' ' + mLast;
            }, //updtUserAvatar


            //***********************************************************
            fullUser(){
                return localStorage.getItem('userType') == 'FULL'
            }, // fullUser


            //***********************************************************
            officeView(){
                return this.Sublib.convFromStr(localStorage.getItem('officeView'))
            }, // officeView


            //***********************************************************
            btnAboutClicked(){
                this.$router.push('/about');
                this.mainMenuOpen = false;
            }, // btnAboutClicked


            //***********************************************************
            // Switch between office and tech modes
            btnSwitchModesClicked(mMode){
                if (mMode == 'OFFICE'){
                    localStorage.setItem('officeView', true);
                    this.$router.push('/homeOffice');
                } else { // mMode == 'TECH'
                    localStorage.setItem('officeView', false);
                    this.$router.push('/homeTech');
                }
                
            }, // btnSwitchModesClicked


            //***********************************************************
            // NOTE: This is ONLY for the live chat in the Main Menu slide out
            btnLiveChatClicked(){
                // have to really dive down to click the button myself. 
                return; // took out live chat as it wasn't really notifying us and we would miss them. SRR 12/14/2020
                try {
                    document.getElementById('menu-live-chat').shadowRoot.lastElementChild.getElementsByTagName('button')[0].click();
                } catch(oError){
                    this.Sublib.mbox('Live chat is not currently available');
                }
                this.mainMenuOpen = false;
            }, // btnLiveChatClicked


            //***********************************************************
            // Network service changed
            serviceChanged(mNewStatus){
                // mNewStatus = char. either 'offline' or 'online';
    
                this.showNoService = (mNewStatus == 'offline' || this.forceOfflineMode);
                if (this.showNoService){
                    // had a problem where the event handler doesn't fire when we re-get service. 
                    // Set a timer that runs every 30 seconds or so and double checks. Stupid we have to do this. SRR 01/17/2023
                    if (this.tmrNoServer)
                        return

                    var _this = this;

                    this.tmrNoServer = setInterval(function(){
                        var mNoService = _this.Sublib.checkOfflineStatus();
                        if (!mNoService){
                            // we have service people
                            clearInterval(_this.tmrNoServer);
                            _this.tmrNoServer = null;
                        }
                    }, 1000 * 30);

                } else {
                    // Online
                    if (this.tmrNoServer){
                        clearInterval(this.tmrNoServer);
                        this.tmrNoServer = null;
                    }
                }

            }, // serviceChanged


            //***********************************************************
            // Register the SW / listen for updates
            // NOTE: This used to be in registerServiceWorker.js but I couldn't listen for udpates or reference Sublib so moving it here
            registerSW(_Sublib){
                //import { register } from 'register-service-worker' // done above
                if (!_Sublib){
                    _Sublib = this.Sublib;
                }

                if (_Sublib.serviceWorkerReg){
                    // already registered, just check for an update

                    // if (_Sublib.serviceWorkerReg && _Sublib.serviceWorkerReg.waiting){
                    //     // Force it to activate now so don't have an update loop. SRR 02/22/2023
                    //     _Sublib.serviceWorkerReg.waiting.postMessage({action: 'ACTIVATE'});

                    // } else {
                    //     _Sublib.serviceWorkerReg.update(); // check for an update
                    // }
                    _Sublib.activateWaitingSW(); // checks for an update if no waiting service worker.

                    return;
                }
                

                // NOTE: path to register-service-worker code is C:\Source\CenPoint\cplite\node_modules\register-service-worker\src\index.js
                if (process.env.NODE_ENV === 'production') {
                    var oSWOptions = {
                        registrationOptions: {
                            // see https://developers.google.com/web/updates/2019/09/fresher-sw
                            updateViaCache: 'imports',
                        },
                        ready () {
                            console.log(
                                'App is being served from cache by a service worker.\n' +
                                'For more details, visit https://goo.gl/AFskqB'
                            )
                        },
                        registered () {
                            console.log('Service worker has been registered.')
                        },
                        cached () {
                            console.log('Content has been cached for offline use.')
                        },
                        updatefound () {
                            console.log('New content is downloading.')
                        },
                        updated () {
                            console.log('New content is available; please refresh.')

                            localStorage.setItem('runAfterUpdt', true); // next page reload will check for this

                            var mCurURL = _Sublib.getCurURL();
                            if (_Sublib.contains(mCurURL, 'signin', true) || _Sublib.contains(mCurURL, 'home', true)){
                                // On the home screen, just force the update right now. SRR 02/22/2023      
                                if (_Sublib.openPopUpCnt == 0 && !window.lastClick) {
                                    if (_Sublib.activateWaitingSW()){
                                        return;
                                    }
                                } else {
                                    // have a popup open or started doing something. Don't force the update as we'll close the popup. SRR 07/18/2023
                                }
                            }
                                

                            var oNotif = _Sublib.goodNotifObj();
                            oNotif.msg = _Sublib.getLbl('update avail');
                            oNotif.img = _Sublib.getIcon('app update');
                            
                            oNotif.onClick.applyUpdt = true;
                            oNotif.clearOnClick = true;
                            oNotif.clearPermanent = true;

                            _Sublib.addAppNotif(oNotif);
                        },
                        offline () {
                            console.log('No internet connection found. App is running in offline mode.')
                        },
                        error (error) {
                            console.error('Error during service worker registration:', error)
                        }
                    } // oSWOptions



                    if ('serviceWorker' in navigator){
                        // NOTE: the code from register-service-worker.js didn't provide a way for me to check for updates / get access to the registration option
                        // copied / tweaked the code and not using their's any more. SRR 10.16.2019
                        //registerValidSW(`${process.env.BASE_URL}service-worker.js`, emit, oSWOptions.registrationOptions);
                            
                            var registrationOptions = oSWOptions.registrationOptions;
                            var swUrl = `${process.env.BASE_URL}service-worker.js`;

                            // NOTE: This code is copied / tweaked form register-service-worker.registerValidSW() so I can manally call a method to check for updates
                            var hooks = oSWOptions;
                            var emit = function (hook) {
                                var args = [], len = arguments.length - 1;
                                while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

                                if (hooks && hooks[hook]) {
                                hooks[hook].apply(hooks, args)
                                }
                            }

                            // check for updates
                            navigator.serviceWorker
                                .register(swUrl, registrationOptions)
                                .then(registration => {
                                    _Sublib.serviceWorkerReg = registration;

                                    _Sublib.activateWaitingSW(); // only activates if there is one pending

                                    // set a time so I check for an update every so often
                                    setInterval(function(){
                                        if (_Sublib.serviceWorkerReg){
                                            _Sublib.serviceWorkerReg.update();
                                        }
                                    }, 60*60*1000); // checks every hour

                                    emit('registered', registration)

                                    if (registration.waiting) {
                                        emit('updated', registration)
                                        return
                                    }

                                    registration.update(); // checks for an update

                                    registration.onupdatefound = () => {
                                        emit('updatefound', registration)
                                        const installingWorker = registration.installing
                                        installingWorker.onstatechange = () => {
                                        if (installingWorker.state === 'installed') {
                                            if (navigator.serviceWorker.controller) {
                                            // At this point, the old content will have been purged and
                                            // the fresh content will have been added to the cache.
                                            // It's the perfect time to display a "New content is
                                            // available; please refresh." message in your web app.
                                            emit('updated', registration)
                                            } else {
                                            // At this point, everything has been precached.
                                            // It's the perfect time to display a
                                            // "Content is cached for offline use." message.
                                            emit('cached', registration)
                                            }
                                        }
                                        }
                                    }
                                })
                                .catch(error => {
                                    emit('error', error)
                                })
                            
                    } // serviceworker in navigatoin
                    // else {
                    //     // standard register (also does a check for udpates be default)
                    //     // NOTE: this only checks for updates on window.load via event listener
                    //     register(`${process.env.BASE_URL}service-worker.js`, oSWOptions); 
                    // }
                    
                } // production
                
            }, // registerSW


            //***********************************************************
            // Run all of our code for after an update
            async afterUpdt(){


                this.Sublib.showMsg(this.Sublib.getLbl('applying update'), false, true);

                // clear out the notification saying an update is available
                var mx;
                var aCurNotifs = JSON.parse(localStorage.getItem('appNotifs'));
                var aNotifs2Clear
                if (aCurNotifs){
                    var mUpdtAvailMsg = this.Sublib.getLbl('update avail');
                    var mAppUpdtMsg = this.Sublib.getLbl('app updated').replace('(<VER>)', ''); // don't want it to mess with the contains

                    aNotifs2Clear = aCurNotifs.filter(obj => !obj.cleared && (obj.msg == mUpdtAvailMsg || this.Sublib.contains(obj.msg, mAppUpdtMsg, true)));
                    if (aNotifs2Clear){
                        for (mx = 0; mx < aNotifs2Clear.length; mx++){
                            await this.Sublib.clearAppNotif(aNotifs2Clear[mx]);
                        } // for
                    }
                    
                    // var oNotifUpdtAvail = aCurNotifs.find(obj => obj.msg == mAppUpdtMsg && !obj.cleared);

                    // if (oNotifUpdtAvail){
                    //     await this.Sublib.clearAppNotif(oNotifUpdtAvail);
                    // }                   

                    // // also see if they never cleared out the last message that said they've been updated (since notifcations have to be unique, delete it out)
                    // mAppUpdtMsg = this.Sublib.getLbl('app udpated');
                    // oNotifUpdtAvail = aCurNotifs.find(obj => obj.msg == mAppUpdtMsg && !obj.cleared);

                    // if (oNotifUpdtAvail){
                    //     await this.Sublib.clearAppNotif(oNotifUpdtAvail);
                    // } 
                }
                
        
                // tell the user they have been updated
                var oCurVer = await this.Sublib.getAppVer();
                var oNotif = this.Sublib.goodNotifObj();
                oNotif.msg = this.Sublib.getLbl('app updated').replace('<VER>', oCurVer.version);
                oNotif.img = this.Sublib.getIcon('app updated');
                oNotif.onClick.url = 'about'; 
                oNotif.clearOnClick = true;
                oNotif.clearPermanent = true;
                
                await this.Sublib.addAppNotif(oNotif);


                await this.Sublib.determineServerOrder(); // if we updated the server list (i.e. just moved a server, didn't add one), recalc which one we should be on. SRR 07/06/2023
                


                // set the default to true. SRR 06/16/2022
                // Scratch that, default to false since the edits take up more disk space. They can click on edit if they want to. SRR 08/24/2022
                var mHold =  this.Sublib.convFromStr(localStorage.getItem('editPhotoCamera'));
                if (mHold == null || oCurVer.version == '1.0.5.6'){
                    localStorage.setItem('editPhotoCamera', false);
                }

                if (oCurVer.version == '1.0.7.4'){
                    // blanket turn it on for this update. Future updates don't
                    localStorage.setItem('showQuickStart', true); // SRR 03/20/2023
                }
                if (oCurVer.version == '1.0.8.0'){
                    // blanket turn on for this update. Future updates don't
                    localStorage.setItem('pushNotifs', true); // SRR 05/03/2023
                }

                //if (oCurVer.version > '1.0.8.6'){
                if (localStorage.getItem('popDataOnLoad') == null && this.$vuetify.breakpoint.lgAndUp){
                    // blanket turn on for this update. Future updates don't
                    localStorage.setItem('popDataOnLoad', true); // MA 06/27/2023
                }

                //window.location.reload(true);

                this.Sublib.showMsg();

            }, // afterUpdt


            //***********************************************************
            // Show a warning if we are on a production DB on a testing IP
            // Want to show the warning on alphaportal as well. 
            showHideDBWarning(){
                if (this.Sublib.isTestingIP() && this.Sublib.isProdDB()){
                    this.showProdDBWarning = true; 
                } else {
                    this.showProdDBWarning = false; 
                }
            }, // showHideDBWarning

            
            //***********************************************************
            // Show a warning if we are hitting a sandbox database
            // Want to show the warning on alphaportal as well. 
            showHideSandboxDBWarning(){
                if (this.Sublib.hittingSandbox()){
                    this.showSandboxDBWarning = true; 
                } else {
                    this.showSandboxDBWarning= false; 
                }
            }, // showHideDBWarning


            //***********************************************************
            async btnSandboxClicked(){
                var mGoOn = await this.Sublib.showSimplePopUp(this.Sublib.Vue.extend(Sandbox));
            }, // btnSandboxClicked



        } // methods
    } // export default
</script>



// ************************************************************************************************************************************************
<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* text-align: center; */
  /* color: #2c3e50; */
  /* background: URL('../img/testBG.jpg'), 0, 0, no-repeat fixed; */
  background-image: ''; /*URL('../img/testBG.jpg'); set via Sublib */ 
  background-repeat: no-repeat;
  background-size: cover;
  background-position: top;
  background-attachment: fixed;
}

/* @media screen and (min-width: 100vh) {
  /* landscape 
  #app {
    background-size: 100% 100%;
  }
} */


/* #router-view {
    background-image: URL('../img/CPcircle.png'); 
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center; 
 }  */


#wrapper { clear:both; width:100%; margin:0px auto;}
/* #wrapper { clear:both; width:1150px; margin:0px auto;} */
/* .width-100 { width: 1150px; } */
.width-100 { width: 100%; }

.header-logo { width:37px; height:35px; margin-left:15px; }
/* #topBar_btnBack { float:left; margin-left:.5rem; margin-top:.75rem; width:4rem; image-rendering:optimizeSpeed; } */

.app-bg-color { background-color: #3C6880 } /* Set here so I can reference other places*/

.header-lbl { float:left; font-size:1.5rem; margin-top:.5rem; margin-bottom: 0; }
.header-lbl-font-small { font-size:1.5rem; margin-top:1rem; margin-bottom: 0; }

/* #router-view { margin-top: 3.8rem; margin-bottom: 2rem;  } */

.v-bottom-navigation .container { padding-top: 0; padding-bottom: 0; }
.v-bottom-navigation .container .col { padding-top: 6px; padding-bottom: 0;}


.text-white { color:white; color:#fff; }
.text-red { color:red; }
.text-black { color:black; }
.text-gray { color:gray; }
.text-hyperlinkblue { color:#2196f3; } /* #0645AD */
.text-labelblue { color:#42C0FB; }

.font-bold { font-weight:bold; }


.pointer { cursor:pointer; }

.float-right { float:right; }
.float-left { float:left; }

.clear-both { clear:both; }
.clear-right { clear:right; }
.clear-left { clear:left; }

.border-top-black { border-top:.2rem solid black; }
.border-bottom-black { border-bottom: .2rem solid black; }
.border-bottom-black-thin { border-bottom: 1px solid black; }
/* .border-bottom-gray { border-bottom: .1rem solid gray; } */
.border-bottom-gray { border-bottom: 1px solid gray; }
.border-top-gray { border-top: .1rem solid gray; }
.border-left-gray {border-left: .1rem solid gray; }
.border-right-gray {border-right: .1rem solid gray; }
.border-all-gray { border: .1rem solid gray; }
.border-top-btn-color { border-top: .2rem solid #0EAEFB; }
.border-bottom-btn-color { border-bottom: .2rem solid #0EAEFB; }


.btn_hor_3 tr { width:100%; }
.btn_hor_3 td { width:33%; margin:auto; vertical-align:middle; text-align:center; }
.btn_hor button, .btn_hor md-button { margin:0; padding:0; height:2rem; width:9rem; font-size:1rem; } 

.app-bar-notifications { margin-right:10px; }
#appBarNotifs .v-badge__badge { height:15px; min-width:15px; }

.app-notifs-clear-all { font-size:12px; }

.no-service-icon { margin-right : 10px; }
/* This is for our 'notifications' bubble that can go after an element 
(i.e  <p class="canHaveNotif' [notifCnt="3" OR :notifCnt="mVueVariable"]></p> tag) */
.canHaveNotif {
    position: relative;
}

.app-bar-notifications.canHaveNotif[notifCnt]:after{
    content: attr(notifCnt);
    position: absolute;
    top: -5px;
    right: -8px;
    font-size: 15px;
    background: red;
    color: white;
    width: 20px;
    height: 20px;
    text-align: center;
    line-height: 20px;
    border-radius: 50%;
    box-shadow: 0 0 1px #333;
}

.app-bar-notifications.canHaveNotif[notifCnt="0"]:after{
    content: none;
}

.canHaveNotif[notifCnt]:after {
    content: attr(notifCnt);
    position: absolute;
    top: 3px;
    right: attr(margin-right) * -1;
    font-size: 15px;
    background: red;
    color: white;
    width: 20px;
    height: 20px;
    text-align: center;
    line-height: 20px;
    border-radius: 50%;
    box-shadow: 0 0 1px #333;
}
.canHaveNotif[notifCnt="0"]:after {
    content:none;
}


.center { margin:0 auto; }
.rowInCol { display:flex; flex-wrap:wrap }

.sticky {
    position: -webkit-sticky;
    position: sticky;
    top: 50px;
}


/* .honor-line-return { white-space: pre-wrap; } NOTE: Pre-wrap adds extra spaces at beginning of first lines.. (see ftick safety for example) NOTE: This works for '\n' or '<br>' but NOT '\r' */
.honor-line-return { white-space: pre-line; } /* NOTE: This works for '\n' or '<br>' but NOT '\r' */


.app-tech-time-stat { align-content: top; font-size: 14px;  margin-top: -2px; }
.app-tech-time-stat img { vertical-align: middle; margin-left: 5px; margin-right: 5px; height:22px; width:22px; }
.app-tech-time-stat-btn { padding: 5px; border: white 1px solid; font-size:18px;  }

/* .cbo-wrapper::after { content: ''; display:block; clear:both;  } */
.cbo-branches { width: 150px; margin-right:10px; }
/* .cbo-users { width:150px;  } */

.btn-icon { margin-left: 10px; }
.avatar-icon { margin-right: 10px; }

.margin-left-5 { margin-left: 5px; }
.margin-left-10 { margin-left: 10px; }
.margin-left-15 { margin-left: 15px; }
.margin-left-20 { margin-left: 20px; }
.margin-left-25 { margin-left: 25px; }
.margin-left-30 { margin-left: 30px; }
.margin-left-35 { margin-left: 35px; }
.margin-left-40 { margin-left: 40px; }
.margin-left-45 { margin-left: 45px; }
.margin-left-50 { margin-left: 50px; }
.margin-left-55 { margin-left: 55px; }
.margin-left-60 { margin-left: 60px; }
.margin-left-65 { margin-left: 65px; }
.margin-left-70 { margin-left: 70px; }
.margin-left-75 { margin-left: 75px; }
.margin-left-80 { margin-left: 80px; }
.margin-left-85 { margin-left: 85px; }
.margin-left-90 { margin-left: 90px; }
.margin-left-95 { margin-left: 95px; }
.margin-left-100 { margin-left: 100px; }

.margin-left-5n { margin-left: -5px; }
.margin-left-10n { margin-left: -10px; }
.margin-left-15n { margin-left: -15px; }
.margin-left-20n { margin-left: -20px; }
.margin-left-25n { margin-left: -25px; }
.margin-left-30n { margin-left: -30px; }
.margin-left-35n { margin-left: -35px; }
.margin-left-40n { margin-left: -40px; }
.margin-left-45n { margin-left: -45px; }
.margin-left-50n { margin-left: -50px; }

.margin-right-5 { margin-right: 10px; }
.margin-right-10 { margin-right: 10px; }
.margin-right-15 { margin-right: 15px; }
.margin-right-20 { margin-right: 20px; }
.margin-right-25 { margin-right: 25px; }
.margin-right-30 { margin-right: 30px; }
.margin-right-35 { margin-right: 35px; }
.margin-right-40 { margin-right: 40px; }
.margin-right-45 { margin-right: 45px; }
.margin-right-50 { margin-right: 50px; }

.margin-right-5n { margin-right: -10px; }
.margin-right-10n { margin-right: -10px; }
.margin-right-15n { margin-right: -15px; }
.margin-right-20n { margin-right: -20px; }

.margin-top-0 { margin-top: 0; }
.margin-top-5 { margin-top: 5px; }
.margin-top-10 { margin-top: 10px; }
.margin-top-15 { margin-top: 15px; }
.margin-top-20 { margin-top: 20px; }
.margin-top-25 { margin-top: 25px; }
.margin-top-30 { margin-top: 30px; }
.margin-top-35 { margin-top: 35px; }
.margin-top-40 { margin-top: 40px; }
.margin-top-45 { margin-top: 45px; }
.margin-top-50 { margin-top: 50px; }
.margin-top-55 { margin-top: 55px; }
.margin-top-60 { margin-top: 60px; }
.margin-top-65 { margin-top: 65px; }
.margin-top-70 { margin-top: 70px; }
.margin-top-75 { margin-top: 75px; }
.margin-top-80 { margin-top: 80px; }
.margin-top-85 { margin-top: 85px; }
.margin-top-90 { margin-top: 90px; }
.margin-top-95 { margin-top: 95px; }
.margin-top-100 { margin-top: 100px; }

.margin-top-5n { margin-top: -5px; }
.margin-top-10n { margin-top: -10px; }
.margin-top-15n { margin-top: -15px; }
.margin-top-20n { margin-top: -20px; }
.margin-top-25n { margin-top: -25px; }
.margin-top-30n { margin-top: -30px; }
.margin-top-35n { margin-top: -35px; }
.margin-top-40n { margin-top: -40px; }
.margin-top-45n { margin-top: -45px; }
.margin-top-50n { margin-top: -50px; }

.margin-bottom-5 { margin-bottom: 5px; }
.margin-bottom-10 { margin-bottom: 10px; }
.margin-bottom-15 { margin-bottom: 15px; }
.margin-bottom-20 { margin-bottom: 20px; }
.margin-bottom-25 { margin-bottom: 25px; }
.margin-bottom-30 { margin-bottom: 30px; }
.margin-bottom-35 { margin-bottom: 35px; }
.margin-bottom-40 { margin-bottom: 40px; }
.margin-bottom-45 { margin-bottom: 45px; }
.margin-bottom-50 { margin-bottom: 50px; }

.margin-bottom-5n { margin-bottom: -5px; }
.margin-bottom-10n { margin-bottom: -10px; }
.margin-bottom-15n { margin-bottom: -15px; }
.margin-bottom-20n { margin-bottom: -20px; }

.margin-0 {margin: 0px !important}
.padding-0 {padding: 0px !important}


#appMenu .v-list-item__action { margin-right:-5px; }

.aging-background-white{ background-color: white; color: black; }
.aging-background-lightblue { background-color: #80FFFF; color: black; }
.aging-background-green { background-color: #00FF00; color: black; }
.aging-background-yellow { background-color: #FFFF00; color: black; }
.aging-background-red { background-color: #FF0000; color: white; }
.aging-background-purple { background-color: #FF80FF; color: black; }
.aging-background-gray { background-color:#f1f1f1; }

/* This will stop combo boxes from overflowing their size (some text may not be shown but it will look better (and work better) than overflowing) */
.v-select__selections { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Make it so the text areas don't break up the words and line wrap like expected instead */
.v-textarea { overflow-wrap: normal; word-break: normal;}

.offlineTextOverlay {
    position: fixed;
    top:82%;
    left:65%;
    color: red;
    font-size:50px; 
    /* Rotate the text */
    transform: rotate(-45deg);
}

.col-padding-0{
    padding-top: 0px !important;
    padding-bottom: 0px !important;
}


.auto-comp-text-truncate {
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    width:calc(100% - 7px);
}

/* This makes it show we show up to 7 rows (50px/row) at a time on the vuetify drop downs (VFP shows 7 so matching that for now. SRR 09/26/2023) */
.v-menu__content { max-height: 350px !important; }

/* People said they couldn't see the 'disabled' color in the sun on their phones. Make it look more like a regular text box (will still have the dotted line instead of the solid) SRR 10/17/2023 */
.theme--light.v-input--is-disabled .v-label, .theme--light.v-input--is-disabled input, .theme--light.v-input--is-disabled textarea { color: gray !important }

</style>
