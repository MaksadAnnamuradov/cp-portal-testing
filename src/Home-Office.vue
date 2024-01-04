<template>
    <div class="home-office">
        <v-flex>
            <!-- Dashboard -->
           

            <v-card 
                class="sched-header" 
                :width="cpAccounting && selTab && selTab == 'ar' ?  Sublib.getPopupWidth(1.5) : Sublib.getStyle('cardheader', $vuetify).width +10" 
                :style="{ 'margin-top' : Sublib.getAppTopBarHeight() + 'px' }"
                >
            </v-card>



            <v-card :style="{'background-color': (bgImgShowing && !(selTab && selTab == 'ar' && cpAccounting) ? '' : 'initial'), 
                            'webkit-box-shadow': (bgImgShowing && !(selTab && selTab == 'ar' && cpAccounting) ? '' : 'initial') }"        
                >

            <!-- Show the options -->
            <v-container  v-if="selTab">
                <v-row v-if="selTab == 'home'" class="margin-bottom-20">
                    <v-col>
                        <v-toolbar dense :color="Sublib.getColor('header')" dark >
                        </v-toolbar>
                    </v-col>
                </v-row>

                <span v-else class="margin-top-5">&nbsp;</span>
                
                <v-row v-if="moreTabDesc" class="margin-top-10n margin-bottom-15 title">
                    <!-- <v-col> -->
                        <!-- Show the label for the 'more' category the chose since it's not in the tab name. SRR 04/20/2023 -->
                        <div class="center border-bottom-gray">
                            {{moreTabDesc}}
                        </div>
                        <br />
                    <!-- </v-col> -->
                </v-row>

                <!-- Regular  -->
                <home-menu-opts v-if="!txtSearch || !showSearch || !selTab || selTab != 'home'" :oTabsOptions="oTabsOptions.filter(obj => obj.tab.toLowerCase() == selTab.toLowerCase() && obj.visible)" @btnOptClicked="(x) => btnOptClicked(x.onClick)" @btnSubOptClicked="(x) => btnOptClicked(x.onClick, 'SUBOPT')" ></home-menu-opts>

            </v-container>

            </v-card>
        </v-flex>
    </div>
</template>


<!-------------------------------------------------------------------------------------------------------------------------------------------------->
<script>
import HomeOpt from './components/Home-Opt.vue'; // dumb, but have to explicity import AND declare it in components below
import HomeMenuOpts from './components/HomeMenuOpts.vue';
import EventBus from './components/Event-Bus.vue';

export default {
    name: 'home',
    data: function (){
        return {
            aSched: null,
            showNoWOMsg: false,
            
            oWODayStats: { branchName: '', branchesId: '', 
                            dt: null,
                            woCnt: 0, woTotMin: 0, woTotMinManHrs: 0,
                            errandCnt: 0, errandTotMin: 0, errandTotMinManHrs: 0,
                            qtCnt: 0, qtTotMin: 0, qtTotMinManHrs: 0, 
                        },

            oWeekStats: { branchName: '', branchesId: '', oDay1: [], oDay2: [], oDay3: [], oDay4: [], oDay5: [], oDay6: [], oDay7: [] },

            mCnt2NextAutoRefresh: null,
            mAutoRefreshTimer: null, 
            mLoadingSched: false,
            mPretripReq: false, // shows notification dot
            mPretripReqVeh: '', // currently required vehicleid
            mTrainPassDueCnt: 0,
            mTrainPendCnt: 0,
            maxDaysBack: 3, // set once we get the sched


            // NOTE: Do ALL tabs names as lower case. makes the code way easier to maintain
            //oTabs: { home: true, reports: false, ar: false, listmng: false, datautils: false, tools: false },
            oTabs: [{ tab: '', icon: '', iconSize: '', lbl: '', showOnBar: false, }],
            selTab: 'home',
            // oTabsOptions = Button / options they can click on on that tab so it's easier to maintain / see all in 1 place. SRR 03/08/2023
            oTabsOptions: [{ tab: '', 
                            code: '',
                            lbl: '', 
                            icon: '',  
                            iconSize: 'lg',
                            onClick: {  url: '', // URL to navigate to 
                                        queryParams: '', // really an object but setting to this for simplicty 
                                        method: '', // code to run
                                        popUp: '',
                                     },
                            subMenu: [], // NOTE: subMenu has same format as main menu object
                            subOpts: [], // NOTE: different than sub menu. This will show as a submsg under the icon
                            submsg: '', // sub message to show under the icon
                            showSubMenu: false,
                            style: '', // custom style object
                            visible: true,
                            dividerAfter: false,
                            }], 
            oTabsOptionsSearch: [], // set by applyFilter

            showSearch: false,
            txtSearch: '',

            lblGoodMorning: '',

            versionType: '!FREE!',

            showQuickStart: false,

            appTopBarHeight: 0,

            touchX: null, 
            touchY: null,

            bgImgShowing: false,
            showBGBtnLoading: false,

            oBannerMsg: {},

            moreTabDesc: '',

            lblAccounting: '',

            cpAccounting: false,

        }
    },

    computed: {
        // these will update automatically
        mSchedDt_f: function(){
            return this.Sublib.obviousDt(this.mSchedDt);
        },
    },
    components: {
        HomeOpt,
        HomeMenuOpts,
    },

  
    // *******************************************************************************************************
    async created(){
        //this.$router.replace('/');
        EventBus.$emit('updtAppTitleBar', ''); // use the default

        console.log('home created');

        if (!await this.Sublib.doDefaultCreated()){
            // not signed in, redirect to home screen
            return;
        }

        if (localStorage.getItem('userType') != 'FULL'){
            // shouldn't hit this but doesn't hurt
            this.$router.push('/homeTech');
            return;
        }

        localStorage.setItem('officeView', true); // had a weird bug where it wasn't always set right, doesn't hurt to just make sure here

        this.versionType = this.Sublib.getVersionType();


        if (this.Sublib.hasCPAccounting()){
            this.lblAccounting = this.Sublib.getLbl('accounting');
            this.cpAccounting = true;
        } else {
            this.lblAccounting = this.Sublib.getLbl('ar');
            this.cpAccounting = false;
        }
         
         

        


                    
        this.oTabs.zap();
        this.oTabs.appendBlank({ tab: 'home', icon: this.Sublib.getIcon('home'), iconSize: 'md', lbl: this.Sublib.getLbl('home'), showOnBar: true });

        // Define the options
        var oHold;
        this.setTabOptions(); // moving to a new method as the search is by reference an I might need to reset it


        EventBus.$on('appBGShowing', showing => this.bgImgShowing = showing); 
        this.bgImgShowing = this.Sublib.bgImgShowing();


        // make sure my cached date is correct
        //await this.Sublib.getDate(); 
        this.Sublib.getDate();  // don't await it, make it 'faster' when we jump back to the page they had before.. hope this is okay.. SRR 05/23/2023


    }, // created



    //**************************************************************************************************************
    async mounted(){
        // see if we need to launch something (like a COD pmt)
        this.appTopBarHeight = this.Sublib.getAppTopBarHeight(); // have to do it after the mounted or it's not there yet for some reason on whole app load...

    }, // mounted



    //**************************************************************************************************************
    beforeRouteLeave (to, from, next) {
        next(); // must call or will get stuck on this page!
    },


    //**************************************************************************************************************
    methods: {
        
        //**************************************************************************************************************
        // set the tab options. Moved here so we can reset as needed when doing a search / filter and mess with it
        // Can't breakRef() as we need the reference to the onClick imported modules. SRR 06/30/2023
        setTabOptions(){
            this.oTabsOptions.zap();

            var oHold;

            var subOpts = [
                {
                    code: 'newcust',
                    lbl: this.Sublib.getLbl('new customer'),
                    onClick: { method: 'Sublib.builders_popup("!ADD!")'  },
                }
            ]
        
            // *** Home ***
            this.addTabOpt('home', 'journalregister', this.Sublib.getLbl('bank register'), this.Sublib.getIcon('bank'), 'md', { url: 'journalReg' }, false, this.Sublib.inList(this.versionType, '!FULL!', '!LITE!'), oHold);


        }, // setTabOptions

        //**************************************************************************************************************
        // Add a new record to oTabOptions array
        // NOTE: This is hear mostly so I can add an option in 1 line of code in the created so it's easier to read
        // Returns: Object. So you can call with reference to the one you just did to add a submenu
        addTabOpt(mTab, mCode, mDesc, mIcon, mIconSize, oOnClick, oStyle, visbile, oOpt2Add2, mDividerAfter, oSubArray){
            // mTab = Char. tab it shows up under
            // mCode = Char. Code so we can programatically find this option if needed (mostly used if called from the desktop)
            // mDesc = Char. Already run through Sublib.getLbl('')
            // mIcon = Char. Already run through Sublib.getIcon('')
            // oOnClick = Object. What do do when option is clicked on
            // oStyle = Object. gets set to :style=oStyle
            // visible = Logical. defaults to true if not passed
            // oOpt2Add2 = Object. Reference to a previously added tab opt so you can add a submenu to it
            // mDividerAfter = Logical. If we show a divider line after this option

            //  oTabsOptions: [{ tab: '', 
                            // lbl: '', 
                            // icon: '',  
                            // iconSize: 'lg',
                            // onClick: {  url: '', // URL to navigate to 
                            //             queryParams: {},
                            //             method: '', // code to run
                            //             popUp: null,
                            //          },
                            // subMenu: [], // NOTE: subMenu has same format as main menu object
                            // showSubMenu: false,
                            // style: '', // custom style object
                            // visible: true,
                            // }], 

            var oHold;
            if (!oOpt2Add2){
                oHold = this.oTabsOptions.appendBlank();
            } else {
                oHold = JSON.parse(JSON.stringify(this.oTabsOptions.blankRec));
            }


            if (mCode == 'divider' && !mDesc){
                mDesc = this.Sublib.getAddId(); // just need something unique so vue doesn't throw a fit in the v-for since it's a compound key on code + desc
            }

            // if(mCode == 'sched'){
            //     debugger
            // }

            oHold.tab = mTab;
            oHold.code = mCode,
            oHold.lbl = mDesc;
            oHold.icon = mIcon;
            oHold.iconSize = (mIconSize ? mIconSize : 'lg');
            oHold.onClick = { ...oHold.onClick, ...oOnClick};
            oHold.style = oStyle;
            oHold.visible = (typeof visbile == 'boolean' ? visbile : true);

            if(oSubArray && oSubArray.length){
                oHold.subOpts = oSubArray;
            }

            var oRetVal;
            

            if (oOpt2Add2){
                if (!oOpt2Add2.subMenu || !oOpt2Add2.subMenu.length){
                    oOpt2Add2.subMenu = [];
                }
                oOpt2Add2.subMenu.push(oHold);

                oRetVal = oOpt2Add2.subMenu.find(obj => obj.tab == mTab && obj.desc == mDesc); // send it back by reference so if there's a sub menu of a submenu it works
            } else {
                oRetVal = oHold;
            }

            return oRetVal;

        }, // addTabOpt


        //**************************************************************************************************************
        // divider line style code 
        dividerLineStyle(){
            return {
                'border-bottom' : (this.$vuetify.theme.isDark ? 'rgba(255,255,255,.40)' : 'rgba(0,0,0,.30)') + ' .75px solid',
                'padding-bottom' : '15px'
            }
        }, // dividerLineStyle



        //**************************************************************************************************************
        // Clicked on a main option. Decide what to do / where to go
        async btnOptClicked(oClick, mOptType){

            if (oClick.url){
                // Navigate to a different page
                if (oClick.queryParams){
                    //this.$router.push({ path: 'findUsers', query: { branchesid: localStorage.getItem('userBranchesId')}});
                    this.$router.push({ path: oClick.url, query: oClick.queryParams });

                } else {
                    // this.$router.push('gettingStarted')
                    this.$router.push(oClick.url);
                }

            } else if (oClick.method){
                // Run a method below
                // this.btnFindBranchClicked()
                if (this.Sublib.contains(oClick.method, 'Sublib')){     
                    var method = this.Sublib.strtran(oClick.method, 'Sublib.', '');
                    if (this.Sublib.contains(method, '(')){
                        // have params on it, extract them out
                        // i.e. method = 'builders_pop('!ADD!)
                        let paramStr = method.substr(method.indexOf('('));
                        paramStr = this.Sublib.strtran(paramStr, '\\(', '');
                        paramStr = this.Sublib.strtran(paramStr, '\\)', '');
                        paramStr = this.Sublib.strtran(paramStr, '"', ''); // treats them as strings anyway
                        paramStr = this.Sublib.strtran(paramStr, "'", '');

                        method = method.substring(0, method.indexOf('('));
                        this.Sublib[method].apply(this.Sublib, paramStr.split(',')); // call the method and pass the params

                    } else {
                        this.Sublib[method]();
                    }
                    
                } else {
                    // method exists here
                    this[oClick.method]();
                }
                

            } else if (oClick.popUp){
                // show a popup
                await this.Sublib.showSimplePopUp(this.Sublib.Vue.extend(oClick.popUp), oClick.popUpParams ? JSON.parse(JSON.stringify(oClick.popUpParams)) : false);

                // add the ctrl + f listener back in

            }
            
        }, // btnOptClicked


        //**************************************************************************************************************
        // Clicked on the background button. Give a few options like 'get a new background'
        async btnBackgroundClicked(){

            var oMenuOptions = [
                { desc: this.Sublib.getLbl('save image'), code: 'SAVE', icon: this.Sublib.getIcon('save'), },
                //{ desc: this.Sublib.getLbl('save image and set as background'), code: 'SAVE', icon: this.Sublib.getIcon('wo'), },
                { desc: this.Sublib.getLbl('get a new picture'), code: 'GETNEW', icon: this.Sublib.getIcon('view_pics'), disabled: this.Sublib.hittingSandbox() },
                { isDivider: true },
                { desc: this.Sublib.getLbl('view (hide tabs)'), code: 'VIEW', icon: this.Sublib.getIcon('view'), },
            ];
         

            var choice = await this.Sublib.showMenu(oMenuOptions);
            if (!choice){
                return;
            } else if (choice == 'SAVE'){
                // download a copy of the picture
                var mCurPic = sessionStorage.getItem('appBG');
                let fileName = '';
                if (!mCurPic){
                    // shouldn't hit this
                    this.Sublib.mbox('could not find background picture to download');
                }

                if (mCurPic.contains('?')){
                    // unsplash URL, get rid of the query string
                    // https://images.unsplash.com/photo-1506918565526-a15fdf909f8e?crop=entropy\u0026cs=srgb\u0026fm=jpg\u0026ixid=M3wxODQ0NTR8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MDEyMDk1OTJ8\u0026ixlib=rb-4.0.3\u0026q=85
                    fileName = this.Sublib.justFName(mCurPic); // photo-1506918565526-a15fdf909f8e?crop=entropy\u0026cs=srgb\u0026fm=jpg\u0026ixid=M3wxODQ0NTR8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MDEyMDk1OTJ8\u0026ixlib=rb-4.0.3\u0026q=85
                    let fileExt = (this.Sublib.contains(fileName, 'jpg', true) || this.Sublib.contains(fileName, 'jpeg', true)  ? 'jpg' : 'png');
                    fileName = fileName.substring(0, fileName.indexOf('?')); // photo-1506918565526-a15fdf909f8e
                    fileName += '.' + fileExt; // photo-1506918565526-a15fdf909f8e.jpg
                    
                } else {
                    fileName = this.Sublib.justFName(mCurPic);
                }

                this.showBGBtnLoading = true;
                await this.Sublib.downloadFile(false, fileName, mCurPic, true);
                this.showBGBtnLoading = false;

            } else if (choice == 'GETNEW'){
                // get a new BG picture
                this.showBGBtnLoading = true;
                await this.Sublib.getUsersBGImg(true);
                this.showBGBtnLoading = false;

            } else if (choice == 'VIEW'){
                // hide all tab content so all you see is the background image. Just have to click a tab again and they can see everything again
                this.selTab = '';
            }


        }, // btnBackgroundClicked


        //**************************************************************************************************************
        // apply a filter based on search criteria (shows up as it's own card. )
        applyFilter(filterText){
            // filterText = Char.  v-model may not be updated yet, so passing it through instead. SRR 06/30/2023
            if (!filterText) filterText = '';

            var _this = this;
            var mSearchTxt = this.Sublib.killPunctuation(filterText, true);

            if (!mSearchTxt){
                this.setTabOptions(); // reset / clear out extra labels
                this.oTabsOptionsSearch = [];
                return;
            }

            // NOTE: may come back with multiple recs for the same customer because it's including contacts. Just select one of the customer records

            if (this.oTabsOptions.length){
                // can't do this because of our 'subMenu's 
                // this.oTabsOptionsSearch = this.oTabsOptions.filter(function(obj) {
                //     return (_this.Sublib.contains(_this.Sublib.killPunctuation(obj.lbl, true), mSearchTxt)
                //             || (obj.subMenu && obj.subMenu.))
                // });

                // make sure we keep 'parent' options around so it will render correctly SRR 06/30/2023
                // For now, for simplicity, get rid of 'parent' options and only include items without a submenu
                this.setTabOptions(); // reset this.oTabsOptions
                this.oTabsOptionsSearch = [];
                this.oTabsOptionsSearch = this.applyFilterSearch(this.oTabsOptions, mSearchTxt);
                this.oTabsOptionsSearch.replaceFor({showSubMenu: true}, true);

                // last step, add in options (if applicable) for company / branch info, users, and manage account from the more menu that aren't in this.oTabsOptions
                if ((this.Sublib.hasSec(16) || this.Sublib.hasSec(30)) && this.Sublib.contains(this.Sublib.killPunctuation(this.Sublib.getLbl('company branch info'), true), mSearchTxt)){
                    this.oTabsOptionsSearch.appendBlank({ tab: '', code: 'branch', lbl: this.Sublib.getLbl('company branch info'), icon: this.Sublib.getIcon('branch'), onClick:  { method: 'btnFindBranchClicked'}, visible: true });
                }
                if ((this.Sublib.hasSec(16) || (this.Sublib.hasSec(34) && this.Sublib.hasSec(52))) && this.Sublib.contains(this.Sublib.killPunctuation(this.Sublib.getLbl('users'), true), mSearchTxt)){
                    this.oTabsOptionsSearch.appendBlank({ tab: '', code: 'users', lbl: this.Sublib.getLbl('users'), icon: this.Sublib.getIcon('users'), onClick: { url: 'findUsers' }, visible: true });
                }
                if (this.Sublib.hasSec(16) &&  !(this.Sublib.hasSec(16) && this.Sublib.hasSec(116)) && this.Sublib.contains(this.Sublib.killPunctuation(this.Sublib.getLbl('manage account'), true), mSearchTxt)){
                    this.oTabsOptionsSearch.appendBlank({ tab: '', code: 'mngplan', lbl: this.Sublib.getLbl('manage account'), icon: 'img/CPCircle.png', onClick: { popUp: MNGACCT }, visible: true });
                }

                if (this.oTabsOptionsSearch.length == 0){
                    this.oTabsOptionsSearch.appendBlank({lbl: this.Sublib.getLbl('no results found'), code: '', visible: true});
                }
            }

        }, // applyFilter

        //**************************************************************************************************************
        // This is a seperate method so it can be called in a loop / recursively
        applyFilterSearch(oOptions, filterText){
            //oOptions = oOptions.breakRef(); // just make sure
            let oRetVal = [], oHold, oTabHold;
            for (var mx = 0; mx < oOptions.length; mx++){
                if (!oOptions[mx].visible){
                    continue;
                }

                if (this.Sublib.contains(this.Sublib.killPunctuation(oOptions[mx].lbl, true), filterText) 
                    || (oOptions[mx].subOpts && oOptions[mx].subOpts.length > 0 && oOptions[mx].subOpts.find(obj => this.Sublib.contains(this.Sublib.killPunctuation(obj.lbl, true), filterText)))){
                    // do this first so if it has a submenu we still get it (i.e. searching for 'timecards' picks up 'technician-detailed & summary')     
                    oTabHold = this.oTabs.find(obj => obj.tab == oOptions[mx].tab);
                    if (oTabHold){
                        if (oOptions[mx].subOpts && oOptions[mx].subOpts.length > 0){
                            // debugger
                            oOptions[mx].subOpts[oOptions[mx].subOpts.length -1].lbl += '<br /> <span style="font-size:14px; margin-left:42px; padding-bottom: 20px !important;">(' + oTabHold.lbl + ')</span> <br /> ';
                        }else{
                            oOptions[mx].lbl += '<br /> <span style="font-size:14px; margin-left:42px;"">(' + oTabHold.lbl + ')</span>';
                        }
                    }
                    
                    oRetVal.push(oOptions[mx]);

                } else if (oOptions[mx].subMenu && oOptions[mx].subMenu.length > 0){
                    oHold = this.applyFilterSearch(oOptions[mx].subMenu, filterText); // recursive call
                    if (oHold.length > 0){
                        //oRetVal.appendFrom(oHold);
                        for (var my = 0; my < oHold.length; my++){       
                            // tell them where this came from
                            //oHold[my].lbl += ' (' + oOptions[mx].lbl + ')';
                            oTabHold = this.oTabs.find(obj => obj.tab == oOptions[mx].tab);
                            
                            if (this.Sublib.right(oHold[my].lbl, '</span>'.length) == '</span>'){
                                // tab got added above. Take it out so it's not repeated below
                                if (oTabHold){
                                    // Not the greatest way to strtran() but going with it for now
                                    oHold[my].lbl = this.Sublib.strtran(oHold[my].lbl, '<span style="font-size:14px; margin-left:42px;"">\\(' + oTabHold.lbl + '\\)</span>', '');
                                }
                            }

                            // use an arrow to show where it came from. Can't do -> as it lays out bad
                            // see https://www.w3schools.com/charsets/ref_utf_arrows.asp for the arrow codes
                            oHold[my].lbl += ' <span style="font-size:14px; margin-left:42px;">(' + (oTabHold ? oTabHold.lbl + '<span style="font-size:16px;"> &rarr; </span>' : '') + oOptions[mx].lbl + ')</span>'; 
                            oRetVal.push(oHold[my]);
                        }
                        
                    }
                } 
            } // for

            return oRetVal;
        }, // applyFilterSearch



        // ***** Home Tab *****
        //**************************************************************************************************************
        btnQuickStartClicked(){
            this.$router.push('gettingStarted')
        }, // btnQuickStartClicke()

        //**************************************************************************************************************
        async btnCloseQuickStartClicked(){

            var choice = await this.Sublib.mbox(this.Sublib.getLbl('turn on quick start instruc'), this.Sublib.getLbl('ok'), this.Sublib.getLbl('cancel'));
            if (choice == 2){
                // cancel
                return;
            }

            this.showQuickStart = false;
            // now save it out so we don't show this again the next time they log in. SRR 10/31/2022
            localStorage.setItem('showQuickStart', false); 

        }, // btnCloseQuickStartClicked

        

        //**************************************************************************************************************
        // ***** List Management *****
        // NOTE: Most of these are imported at the top so we don't add even more to sublib since it's getting big with imports
        //**************************************************************************************************************
        btnFindBranchClicked(){
            // For now, only supporting 1 branch
            if (this.Sublib.inList(this.versionType, ['!FREE!', '!LITE!'])){
                // Only allow 1 branch
                this.$router.push({ path: 'branches', query: { branchesid: localStorage.getItem('userBranchesId')}});
            } else {
                // Find branches screen
                this.Sublib.showSimplePopUp(this.Sublib.Vue.extend(FINDBRANCH));
            }
            
        }, // btnFindBranchClicked


        //**************************************************************************************************************
        desktopOnly(){
            this.Sublib.mbox(this.Sublib.getLbl('only available on desktop'));
        }, // desktopOnly

    
    } // methods
}
</script>


<!-------------------------------------------------------------------------------------------------------------------------------------------------->
<!-- Add "scoped" attribute to limit CSS to this component only (also affects components you import on this page!) -->
<style scoped>
 .home-office { margin:0 auto; }

 h2 { margin-bottom:20px; }


.container { padding:0;  }
.container [class*="col"] { padding-top: 0; padding-bottom: 0; }

</style>