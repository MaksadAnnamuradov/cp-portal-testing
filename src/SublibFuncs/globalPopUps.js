// NOTE: because we do Vue.prototype.Sublib.getLbl = GETLBL.bind(Vue.prototype.Sublib); // bind the 'this' to the Sublib object so I can access it's properties
// this in the method below references Sublib!. SRR 11/28/2023

import MBOX from '../components/MsgBoxes/mbox.vue';

// *********************************************************************************
// Got tired of copying/pasting especially when it's simple with no real params (i.e. list management stuff)
// NOTE: in order for this to work, you just call it like: this.Sublib.showSimplePopUp(this.Sublib.Vue.extend(FINDTERMS));
export function showSimplePopUp (mboxInstance, mParam1Name, mParam1Val, mParam2Name, mParam2Val, mParam3Name, mParam3Val, 
                                                                mParam4Name, mParam4Val, mParam5Name, mParam5Val, mParam6Name, mParam6Val, 
                                                                mParam7Name, mParam7Val, mParam8Name, mParam8Val, mParam9Name, mParam9Val, 
                                                                mParam10Name, mParam10Val){
    return new Promise(async (resolve, reject) => {
        // I'm combining a bunch of stuff to make this work.

        // First, create the vue component
        var domID = 'mbox_' + String(Date.now()) + String(Math.random()); // has to be unique
        var oProps = {
            retval: '',
            mBoxBtnId: domID,
        }

        if (typeof mParam1Name == 'object'){
            // Params passed as an object, add them to oProps
            oProps = { ...oProps, ...mParam1Name }

        } else {
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
            if (mParam6Name){
                oProps[mParam6Name] = mParam6Val;
            }
            if (mParam7Name){
                oProps[mParam7Name] = mParam7Val;
            }
            if (mParam8Name){
                oProps[mParam8Name] = mParam8Val;
            }
            if (mParam9Name){
                oProps[mParam9Name] = mParam9Val;
            }
            if (mParam10Name){
                oProps[mParam10Name] = mParam10Val;
            }
        }
        


    
        var oComponent = new mboxInstance({ 
            propsData: oProps
        }).$mount();

        // now add it to the DOM
        var oEl = document.getElementById('app').appendChild(oComponent.$el);
        
        // NOTE: couldn't get it to work without adding a 'button' to activate it
        // progrmatically click it and make the button invisible
        // document.getElementById('mbox_btn_launch').click();
        //var oLuanchBtn = document.getElementById('mbox_btn_launch');


        this.openPopUpCnt++; // started tracking if a popup was open or not so we know if we should auto apply an update on the home screen. SRR 07/18/2023

        var oLuanchBtn = document.getElementById(domID);
        if (oLuanchBtn){
            // the Signin popup for some reason fails to get element by id and won't hit this but it still works. SRR 12/22/2022
            oLuanchBtn.style.display = 'none';
            oLuanchBtn.click();
        }
        
        // Add a listener so we can get the value and return it
        oComponent.$watch('retval', function(newVal, oldVal){
            // this is triggered when they chose an option
            // Delete the component / element now that I'm done
            oEl.remove();
            if (typeof this.Sublib.openPopUpCnt != 'undefined'){
                // different 'this' context here
                this.Sublib.openPopUpCnt--;
            } else if (typeof this.openPopUpCnt != 'undefined'){
                this.openPopUpCnt--;
            }
            
            resolve(newVal);
        })
    }); // promise
} // showSimplePopUp


// *********************************************************************************
export function mbox (mText, mBtnCap1, mBtnCap2, mBtnCap3, mTitle, mTheme, mDfltBtn) {
    // I can access 'this' here but it goes out of scope when I hit the new function in the promise below
    //var _self = this;

    if (!mBtnCap1){
        mBtnCap1 = this.getLbl('ok');
    }
    if (!mTheme){
        mTheme = '';
    }

    var oProps = {
        msg: mText, 
        title: mTitle, 
        btnCap1: mBtnCap1, 
        btnCap2: mBtnCap2, 
        btnCap3: mBtnCap3,
        retval: 0,
        themeColor: mTheme,
        btnDfltFocus: mDfltBtn
    }

    return this.showSimplePopUp(this.Vue.extend(MBOX), oProps);
} // mbox
