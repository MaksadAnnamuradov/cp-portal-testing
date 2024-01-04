import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './registerServiceWorker'

import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css' // Ensure you are using css-loader
import 'material-design-icons-iconfont'
import '@mdi/font/css/materialdesignicons.css'
import '@fortawesome/fontawesome-free/css/all.css'


import DataTypeAddOns from './DataTypeAddOns.js';
DataTypeAddOns(); // add in the custom data type functions

import Sublib from './Sublib.js'

import RestClient from './RestClient.js'
import IDB from './IDB.js'
import math from './RealMath.js';

import VueVirtualScroller from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

import * as VueGoogleMaps from 'vue2-google-maps' // $7 per 1000 loads


//Global Components to register 
import cpbtn from './components/Framework/cpBtn.vue'
import cpCheckBox from './components/Framework/cpCheckBox.vue'
import cpInputMask from './components/Framework/cpInputMask.vue'
import cpSelect from './components/Framework/cpSelect.vue'
import cpSelBranch from './components/Framework/cpSelBranch.vue'
import cpTxt from './components/Framework/cpTxt.vue'
import cpTxtArea from './components/Framework/cpTxtArea.vue'
import cpHelp from './components/Framework/cpHelp.vue'
import cpTxtNum from './components/Framework/cpTxtNum.vue'
import cpLoading from './components/Framework/cpLoading.vue'
import cpAuto from './components/Framework/cpAuto.vue'
import cpPhoneNum from './components/Framework/phone-number.vue';
import cpDateRange from './components/Framework/Dates-from-to.vue';
import cpSwitch from './components/Framework/cpSwitch.vue';
import cpDataTable from './components/Framework/cpDataTable.vue';
import cpDate from './components/Framework/DateInput.vue';
import cpTime from './components/Framework/TimeInput.vue';

import cpGLCodes from './components/Framework/cpSelGLCodes.vue';
import cpDialog from './components/Framework/cpDialog2.vue';


//doing this was not working for changing the theme on the fly MA 12/14/2023
// import 'devextreme/dist/css/dx.light.css';
// import 'devextreme/dist/css/dx.dark.css';
// import 'devextreme/dist/css/dx.material.blue.dark.compact.css';
// import 'devextreme/dist/css/dx.material.blue.light.compact.css';


Vue.config.devtools = false;  // true = make it so I can use the Vue dev tools debugging Jamie's box, false = hide on builds
Vue.config.productionTip = false
Vue.use(Vuetify);

//Vue.use(VueCryptojs);

// NOTE: Plugins can't see other plugins by default. Pass them to each other (done in app.vue)
Vue.use(Sublib)

Vue.use(VueGoogleMaps); // api key set in GoogleMap.vue
// Vue.use(VueGoogleMaps, {
//     // load: {
//     //   key: '', // set in GoogleMap.vue
//     //   libraries: 'Maps JavaScript API',
//     // }
//   });

Vue.use(RestClient);
Vue.use(IDB);

Vue.use(math);

Vue.use(VueVirtualScroller);


// export default new Vuetify({
//     iconfont: 'md' || 'fa' || 'mdi',
//     breakpoint: {
//         thresholds: {
//             // NOTE: if you update these, update them in src\sass\main.scss as well!
//             xs: 400, //600
//             sm: 600, //960
//             md: 960, //1280
//             lg: 1280, //1920
//             xl: 1920 // not defined
//         }
//     },
//     theme: { dark: false }
// })


// Globally register your component
Vue.component('cp-btn', cpbtn);
Vue.component('cp-check', cpCheckBox);
Vue.component('cp-input-mask', cpInputMask);
Vue.component('cp-select', cpSelect);
Vue.component('cp-sel-branch', cpSelBranch);
Vue.component('cp-txt', cpTxt);
Vue.component('cp-txt-area', cpTxtArea);
Vue.component('cp-txt-num', cpTxtNum);
Vue.component('cp-help', cpHelp);
Vue.component('cp-loading', cpLoading);
Vue.component('cp-auto', cpAuto);
Vue.component('cp-phone-num', cpPhoneNum);
Vue.component('cp-date-range', cpDateRange);
Vue.component('cp-switch', cpSwitch);
Vue.component('cp-data-table', cpDataTable);
Vue.component('cp-gl-codes', cpGLCodes);
Vue.component('cp-date', cpDate);
Vue.component('cp-time', cpTime);
Vue.component('cp-dialog', cpDialog);

new Vue({
  router,
  vuetify: new Vuetify({
        iconfont: 'md' || 'fa' || 'mdi',
        breakpoint: {
            thresholds: {
                // NOTE: if you update these, update them in src\sass\main.scss as well!
                xs: 425, // switched SRR 12/02/2019. //400, //600
                sm: 600, //960
                md: 960, //1280
                lg: 1280, //1920
                xl: 1920 // not defined
            }
        },
        theme: { 
            dark: false, // load light theme by default
            // themes: {
            //     dark: {
            //         primary: '#3f51b5',
            //         secondary: '#b0bec5',
            //         accent: '#8c9eff',
            //         error: '#b71c1c',
            //     }
            //}
        },
        //customVariables: ['~/sass/variables.scss'],
    }),
  render: h => h(App),
}).$mount('#app');

// add in a properCase option 
