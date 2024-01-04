<template>
    <v-dialog fullscreen="" persistent v-if="showMbox">
        <template v-slot:activator="{on}">
            <v-btn :id="mBoxBtnId" v-on="on"></v-btn>
        </template>

        <v-app-bar :color="Sublib.getColor('app')" dark fixed app height="50" id="appTopBar" > <!-- This is the 'top bar' -->
            <img src="../../public/img/CPcircle.png" class="header-logo pointer" />
            <v-toolbar-title :style="{ 'margin-left': '10px'}">CenPoint® Portal</v-toolbar-title>
        </v-app-bar>
        
        <v-card id="no-loc-card">
            <v-card id="no-loc-card-dtls" :width="Sublib.getStyle('cardheader', $vuetify).width"> 
                <v-toolbar :style="Sublib.getStyle('cardheader')" dark flat :height="Sublib.getStyle('cardheader').height"> 
                    <v-toolbar-title>
                        <span v-if="title" class="headline">{{title}}</span>
                    </v-toolbar-title>
                </v-toolbar>
                <v-card-text>
                    <div v-if="clockOutMsg != ''" class="mbox_msg headline">{{clockOutMsg}}</div>
                    <div v-if="clockOutMsg2 != ''" class="mbox_msg title">{{clockOutMsg2}}</div>
                    <br v-if="clockOutMsg != ''" />
                    
                    <div class="mbox_msg title">{{msg}}</div>
                    <div class="mbox_msg subtitle-1">{{instructions}}</div>

                    <v-container>
                            <v-row>
                                <v-col>
                                    <span 
                                        class="pointer text-hyperlinkblue"
                                        @click="Sublib.outRept(helpDocAndroid)"
                                        >
                                        <v-icon class="pointer">{{Sublib.getIcon('android')}}</v-icon>
                                        Android Instructions
                                    </span>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col>
                                    <span 
                                        class="pointer text-hyperlinkblue"
                                        @click="Sublib.outRept(helpDocIOS)"
                                        >
                                        <v-icon class="pointer">{{Sublib.getIcon('ios')}}</v-icon>
                                        iOS (iPhone / iPad) Instructions
                                    </span>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col>
                                    <span 
                                        class="pointer text-hyperlinkblue"
                                        @click="Sublib.outRept(helpDocWinBrowser)"
                                        >
                                        <v-icon class="pointer">{{Sublib.getIcon('chrome')}}</v-icon>
                                        <!-- <v-icon class="pointer">{{Sublib.getIcon('edge')}}</v-icon>
                                        <v-icon class="pointer">{{Sublib.getIcon('firefox')}}</v-icon> -->
                                        Browser (Chrome / Edge / Firefox) Instructions
                                    </span>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col>
                                    <span 
                                        class="pointer text-hyperlinkblue"
                                        @click="Sublib.outRept(helpDocWindows)"
                                        >
                                        <v-icon class="pointer">{{Sublib.getIcon('windows')}}</v-icon>
                                        Windows Instructions
                                    </span>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col>
                                    <span 
                                        class="pointer text-hyperlinkblue"
                                        @click="Sublib.outRept(helpDocMac)"
                                        >
                                        <v-icon class="pointer">{{Sublib.getIcon('apple')}}</v-icon>
                                        Mac / Safari Instructions
                                    </span>
                                </v-col>
                            </v-row>
                    </v-container>

                    <!-- <div class="mbox_msg subtitle-1" v-html="instructions"></div> -->
                </v-card-text>
                <v-card-actions>
                    <v-layout align-center justify-center>
                        <cp-btn 
                            v-if="btnCap1" 
                            :color="btnColor" dark 
                            @click="tryLocAgain()"
                            :label="btnCap1"
                            :loading="checkingLoc"
                        >
                            <!-- <span v-if="!checkingLoc">{{btnCap1}}</span>
                            <v-progress-linear v-if="checkingLoc" :indeterminate="true"></v-progress-linear> -->
                        </cp-btn>
                    </v-layout>
                </v-card-actions>
            </v-card>
            <br />
            <br />
        </v-card>
    </v-dialog>
</template>
<script>
export default {
    name: 'mbox',
    data: () => ({
        showMbox: true, 
        title: '',
        btnCap1: '',
        instructions: '',
        checkingLoc: false,
        clockOutMsg: '',
        clockOutMsg2: '',

        helpDocWindows: 'https://help.cenpoint.com/docs/turn-on-location-service-windows',
        helpDocWinBrowser: 'https://help.cenpoint.com/docs/en/turn-on-location-in-edge-chrome-and-firefox',
        helpDocIOS: 'https://help.cenpoint.com/docs/turn-on-location-services-iphoneipad',
        helpDocAndroid: 'https://help.cenpoint.com/docs/turn-on-location-services-android',
        helpDocMac: 'https://help.cenpoint.com/docs/turn-location-services-on-safari-and-mac',

    }),
    props: [
        // these can be passed in, the 'data' stuff can't
        'msg',
        'retval', // this.Sublib watches this so we know when they clicked something
        'mBoxBtnId' // so we can keep track of multiple mboxs at once
    ],
    async created(){
        // don't put anything here
        if (!this.$vuetify || !this.$vuetify.theme || !this.$vuetify.breakpoint){
            this.$vuetify = this.Sublib.oVuetify;
        }
        
        // NOTE: I'm assuming that this status is fairly up to date (refreshes on every page change so should be)
        var mStatus = await this.IDB.req('cachedWSResp', 'get', 'getCurStatus');
        var oData = this.Sublib.wsResp2Obj(mStatus);

        if (!oData.errorMsg){
            if (oData[0].type == 'FT'){
                // Ftick
                this.clockOutMsg = 'You have been clocked out of FT ' + this.Sublib.trimZeros(oData[0].ftickid, 5);
                this.clockOutMsg2 = 'You must contact the office to have them fix your time once you turn location back on!';

                
            } else if (oData[0].type == 'ER'){
                // errand
                this.clockOutMsg = 'You have been clocked out of Errand ' + this.Sublib.trimZeros(oData[0].ftickid, 5);
                this.clockOutMsg2 = 'You must contact the office to have them fix your time once you turn location back on!';
                
            } else if (oData[0].type == 'CL'){
                // clocked in
                this.clockOutMsg = 'You have been clocked out';

            } else { // oData[0].type == ''
                // clocked out
                this.clockOutMsg = '';
            }
            
            
            if (oData[0].type){
                // clock them out!
                var mNow = await this.Sublib.getDate(true);
                var mURL = this.Sublib.getWSUrl() + 'cpGetUsers/forceClockOut'; 
                var oParams = {
                    dt: this.Sublib.DTOC(mNow),
                    time: this.Sublib.milTime(mNow),
                }
                
                var mKey = 'forceClockOut~dt=' + oParams.dt + '~time=' + oParams.time;
                var resp = await this.RestClient.get(mURL, oParams, mKey, true);

                oData = this.Sublib.wsResp2Obj(resp);
                if (oData.errorMsg){

                }
            }


        } // !oData.errorMsg


        this.showMbox = true;
        this.btnCap1 = 'Try Again';
        this.title = "Location Services Are Off!"
        //this.msg = this.Sublib.replaceAll(this.msg, '\n', '<br />');

        var mTab = '\t' //'    '; // '&#9';
        // based on the OS / device, give different instructions
        this.instructions = 'To enable location services, please try to the following steps:' + '\n\n';
        // if (this.Sublib.isIOS()){
        //     this.instructions += '1. Verify location services are on for your device in general:'
        //                         + '\n'
        //                         + '\n' + mTab + 'a) Go to Settings -> Privacy -> Location Services and make sure that Location Services is turned on.'
        //                         + '\n'
        //                         + "\n" + mTab + "b) Click on 'Safari Websites' and make sure 'While Using the App' is selected."
        //                         + '\n'
        //                         + '\n'
        //                         + '\n2. Verify CenPoint Portal is granted permissions:'
        //                         + '\n'
        //                         + '\n' + mTab + "a) Go to Settings -> General -> Reset -> Click 'Reset Location & Privacy'"
        //                         + '\n\n' + mTab + "Now click 'Try Again' on this page and then 'Refresh' to refresh this page and grant CenPoint Portal location permissions."
                                
        // } else if (this.Sublib.isAndroid()){
        //     this.instructions += '1. Verify location services are on for your device in general:'
        //                         + '\n'
        //                         + '\n' + mTab + 'a) Go to Settings -> Security & location -> Location and make sure that Use Location is turned on.'
        //                         + '\n'
        //                         + '\n'
        //                         + '\n2. Verify CenPoint is granted permissions:'
        //                         + '\n'
        //                         + '\n' + mTab + "a) Go to Settings -> Apps & notifications (may be called 'Apps' or 'Application manager' depending on Android version) -> CenPoint Mobile -> "
        //                         +       "Permissions -> Make sure Location is On"
        //                         + '\n\n' + mTab + "Now click 'Try Again' on this page."
                                
        // } else {
        //     // windows browser
        //     this.instructions += '1. Verify location services are on for your computer in general:'
        //                         + '\n'
        //                         + '\n' + mTab + 'a) Click the Notification icon (just right of the date and time in the bottom right corner) and make sure that Location is turned on.'
        //                         + '\n'
        //                         + '\n'
        //                         + '\n2. Verify CenPoint is granted permissions in your browser:'
        //                         + '\n'
        //                         + '\n' + mTab + "a) This varies by browser. Typically this is under something like: "
        //                         + '\n' + mTab + " Settings -> Site Permisissions -> Location. Please check your browser to be sure "
        //                         + '\n\n' + mTab + "Now click 'Try Again' on this page."
        // }


    }, 
    computed: {
        btnColor: function(){
            return this.Sublib.getColor('header');
        }
    }, 

    methods: {
        btnClicked: function(mBtnClicked){
            // mBtnClicked = Char. Has to be a character in order for it to pass it in. Not sure why, numerics didn't work
            mBtnClicked = Number(mBtnClicked);
            this.retval = mBtnClicked; // watcher in this.Sublib will detect this value has changed
            this.showMbox = false;
        }, // btnClicked

        async tryLocAgain(){
            this.checkingLoc = true;

            var oLoc = await this.Sublib.getLocation(true);

            this.checkingLoc = false;

            if (oLoc.locationOn){
                this.retval = true; // watcher in this.Sublib will detect this value has changed
                this.showMbox = false;
                return;
            } 

            // it still failed!
            var mChoice = await this.Sublib.mbox('Location services are still off.'
                                        + '\nA Page refresh may be required. Would you like to refresh?', 'Refresh', 'Close');
 
            if (mChoice == 1) {
                // refresh the page (some browsers require this after the location settings change)
                //this.$router.go(); // no params = refresh
                window.location.reload(true);
            }
        }, // tryLocAgain

    } // methods
} // export default
</script>
<style scoped>
/* .mbox_msg { word-break: break-all; white-space: pre-line; } */
#no-loc-card { margin:0 auto; }
#no-loc-card-dtls { margin:0 auto; margin-top: 3.2rem;  }
.mbox_msg { white-space: pre-wrap; }
</style>