<template>
    <!-- <v-text-field
        :id="txtDomID"
        v-model="formated" 
        @input="applyMask()"
        @focus="highlightSel()"
        :disabled="disabled"
        :clearable="clearable"
        :label="label"
        :loading="loading"
        >
    </v-text-field>    
    @input="applyMask(true, event)"
    type="tel"-->

    <!-- On the Samsung keyboard on android, it always reports the keypress as 'unidentified' and we can't do our default formatting stuff
        Have to use the keyup event instead so we get the right values at least. SRR 11/16/2020 -->


    <!-- <v-text-field
        :ref="txtDomID"
        v-model="formated" 

        @keydown="keyboardSupported ? applyMask(true, $event): ''"
        @keyup="!keyboardSupported ? applyMask(true, $event) : ''"

        @focus="keyboardSupported ? highlightSel() : formated = Sublib.cleanNumber(formated, allowNeg, Sublib.contains(inputMask2Use, '.'))"
        @click="applyMask(false, { key: 'ArrorLeft'}); highlightSel();"

        @blur="emitBlurEvent ?  handleBlurEvent() : applyMask()"

        :disabled="disabled"
        :clearable="clearable"
        :label="label"
        :loading="loading"

        type="text"
        pattern="[0-9]*"
        inputmode="decimal"

        :messages="message"
        :dark="dark"
        :light="light"
        :autofocus="txtAutofocus"
        :tabindex="tabindex"
        :hide-details="txtHideDetails"

        :suffix="suffix"
        :prefix="prefix"
        >
    </v-text-field>    -->

    <DxTextBox
        :ref="txtDomID"
        class="dx-field-value"
        v-model="formated"
        :labelMode="labelMode || 'floating'"
        :stylingMode="stylingMode || 'underlined'"

        @key-down="keyboardSupported ? applyMask(true, $event): ''"
        @key-up="!keyboardSupported ? applyMask(true, $event) : ''"

        @focus="keyboardSupported ? highlightSel() : formated = Sublib.cleanNumber(formated, allowNeg, Sublib.contains(inputMask2Use, '.'))"
        @click="applyMask(false, { key: 'ArrorLeft'}); highlightSel();"

        @blur="emitBlurEvent ?  handleBlurEvent() : applyMask()"

        :disabled="disabled"
        :clearable="clearable"
        :label="label"
        :loading="loading"

        type="text"
        pattern="[0-9]*"
        inputmode="decimal"

        :messages="message"
        :dark="dark"
        :light="light"
        :autofocus="txtAutofocus"
        :tabIndex="tabindex"
        :hide-details="txtHideDetails"

        :suffix="suffix"
        :prefix="prefix"
        style="min-width: 125px;"
    />


</template>
<script>

import {
    DxTextBox,
} from 'devextreme-vue';


export default {
    name: 'input-mask',
    data: () => ({
        formated: '',
        raw: '',
        inputMask2Use: '',
        allowNeg: false,
        txtDomID: 'input-mask-' + String(Math.random()),
        event: null, // v-text-field doesn't allow you to send the $event on the @input. Dumb. see https://www.reddit.com/r/vuejs/comments/ejdw60/vuetify_not_sending_event_on_input_change/
        typing: false,
        decimalsStored: 0, // Used as they type
        textPart: 'N', // Used as they type
        handledKeyDown: false, // needed for the Samsung KeyBoard since we have to use the keyup event there instead (no bueno)
        keyboardSupported: true, // i.e. Samsung doesn't work right since it doesn't report the key in the keydown event
    }),

    components: {
        DxTextBox,
    },

    props: [
        // these can be passed in, the 'data' stuff can't
        'value', // bound through v-model
        'inputMask',
        'disabled', // vuejs prop
        'clearable', // vuejs prop
        'label', // vuejs prop
        'loading', // vuejs prop
        'message', // vuejs prop
        'emitBlurEvent', // vuejs prop
        'dark', // vuejs prop
        'light', // vuejs prop
        'useBranchPricingDec', // true or false, If .T., will modify the input mask to be more (or less) decimals, based on their branch settings
        'autofocus', //auto focus on the input
        'tabindex',
        'emptyChar', // i.e. show '-' if empty instead of 0.00, can also pass '' to show nothing
        'hideDetails',
        'suffix', // vuejs prop
        'prefix', // vuejs prop
        'labelMode', //dxTextBox prop (static, floating, hidden, outside)
        'stylingMode', //dxTextBox prop (outlined, filled, underlined)
    ],
    computed: {
        txtAutofocus: function(){
            return (this.autofocus || typeof this.autofocus == 'string') ? true : false;
        },
        txtHideDetails: function(){
            return (this.hideDetails || typeof this.hideDetails == 'string') ? true : false;
        },
        
    }, // computed
    watch: {
        value: function(){
            // updated from the parent
            var mNewVal = this.value;
            var mForceUpdt = false;

            if (!this.typing){     
                if (!mNewVal){
                    // account for empty strings / null
                    mNewVal = 0; 
                    mForceUpdt = true; // if it came in as a string, need to update the parent to be a numeric.

                } else if (typeof mNewVal != 'number' && this.Sublib.isNumeric(mNewVal)){
                    mNewVal = Number(mNewVal);
                    mForceUpdt = true;
                }
            } else {
                // we are typing and this.applyInputMask() did an $emit below. don't force stuff updates / manipulate
            }
            

            if (this.raw != mNewVal || mForceUpdt){
                this.raw = mNewVal;
                this.formated = String(mNewVal);

                if (!this.formated || Number(this.formated) == 0 && this.Sublib.contains(this.inputMask2Use, '.')){
                    this.formated = '0.0';
                }

                this.formated = this.Sublib.applyInputMask(this.formated, this.inputMask2Use);
                this.formated = this.Sublib.padL(this.formated, this.inputMask2Use.length, ' '); // VFP auto adds spaces, portal auto strip them off. Need them back for this.


                this.applyMask();
            } else if (this.raw == 0){
                // make sure I show the extra 0s (if they're in the input mask)
                this.applyMask();
            }



        }, // value
        formated: function(mNewVal, mOldVal){
            if (mNewVal == null){ 
                // they clicked the 'x' to clear it
                this.raw = 0;
                this.textPart = 'N'
                this.decimalsStored = 0;

                //this.applyMask();

                this.applyMask(false, { key: 'ArrorLeft'}); 
                //this.highlightSel();
                return;
            }
        }
    }, // watch

    created(){           
        if (!this.inputMask){
            this.inputMask2Use = '#,###,###.##';
        } else {
            this.inputMask2Use = this.inputMask; // passed in
        }

        this.keyboardSupported = this.Sublib.isKeyboardOkay();


        if (this.useBranchPricingDec){
            // Override the input mask to support more decimals for crazy pricing (price each only, totals shouldn't support this). SRR 10/07/2020
            if (this.inputMask2Use){
                // Change '#,###,###.##' to '#,###,###.####'
                var mDecLen = this.Sublib.getPricingDec();
                var mHoldMask = (this.Sublib.contains(this.inputMask2Use, '.') ? this.inputMask2Use.substring(0, this.inputMask2Use.indexOf('.')) : this.inputMask2Use);

                mHoldMask += '.' + '#'.repeat(mDecLen);
                this.inputMask2Use = mHoldMask;

            } else {
                // We got rid of the input mask for some reason, honor us clearing it out.
            }
        }


        if (this.Sublib.contains(this.inputMask2Use, '-')){
            this.allowNeg = true;
        }

        //this.raw = this.$parent[this.property];

        this.raw = this.value;
        this.formated = String(this.value);

        if (!this.formated || Number(this.formated) == 0 && this.Sublib.contains(this.inputMask2Use, '.')){
            this.formated = '0.0';
        }

        this.formated = this.Sublib.applyInputMask(this.formated, this.inputMask2Use);

        this.formated = this.Sublib.padL(this.formated, this.inputMask2Use.length, ' '); // VFP auto adds spaces, portal auto strip them off. Need them back for this.

        this.applyMask();

         if (!this.raw && typeof this.emptyChar == 'string'){
            this.formated = this.emptyChar;
        }

    }, // created

    async mounted(){
        if(this.txtAutofocus){
            var el = this.$refs[this.txtDomID]
            if(!el){
                //sleep for 0.5 second and try again
                await this.Sublib.sleep(500);
                // el = this.$refs[this.txtDomID]

                await this.$nextTick()
                // el.focus();
                this.highlightSel();

                await this.$nextTick()
                this.$forceUpdate();
            }else{
                await this.$nextTick()
                // el.focus();
                this.highlightSel();
                await this.$nextTick()
                this.$forceUpdate();
            }
        }
    }, // mounted

    methods: {
        // **************************************
        // Called when the field gets focus. If the value is 0, highlight the entire selection so the user can just start typing 
        // and doesn't have to about where they're cursor is
        highlightSel(){
            if (this.raw != 0){
                return;
            }

            // highlight the entire selection so the user can just start typing
            //document.getElementById(this.txtDomID).setSelectionRange(0, String(this.formated).length);
            this.$refs[this.txtDomID].$refs.input.setSelectionRange(0, String(this.formated).length);
        }, // highlightSel


        // **************************************
        async applyMask(mTyping, event){
        //applyMask(mTyping, event){
            // mTyping = Logical. Needed so we can set focus back to this element since iOS is changning focus on us
            // Event = event that fired

            // NOTE: This is copied / tweaked from the dssBase.dsTextBox.keyPress()
            var mKeyPressed;
            var mShiftAltCtrl;
            // key the key pressed
            if (event){ 
                event = event.event;
                // if (this.handledKeyDown && this.Sublib.inList(event.type, ['keyup', 'keypress'], true)){
                //     return;
                // } else 
                if (!this.keyboardSupported){
                    // NOTE: On Samsung phones, it always comes through as unidentified and our input mask doesn't really work. Still need to capture the right values though. Really obnoxious. SRR 11/16/2020    
                    if (!event.type || event.type != 'keyup'){
                        return;
                    }

                    // we're on the keyup event so anything before should be handled (i.e. number, backspace, '.', etc)
                    var mShowedPrompt = this.Sublib.convFromStr(localStorage.getItem('inputMask_tryGBoard'));
                    if (!mShowedPrompt){
                        this.Sublib.promptSwitchKeyBoard();
                    }

                    // since we're in the keyDown wevent, this.formatted isn't actually updated yet. 
                    // Go off of what's in the input box
                    //this.formated = event.target.value;

                    this.raw = Number(this.formated);
                    if (isNaN(this.raw)){
                        this.raw = 0.0
                        this.formated = '0';
                    } else {
                        this.formated = String(this.raw); // get rid of possible leading 0s
                    }

                    if (!this.raw && typeof this.emptyChar == 'string'){
                        this.formated = this.emptyChar;
                    }

                
                    if (!mTyping){
                        // not typing / not active element. don't wait for it and don't set the cursor 
                        // NOTE: Only really needed this for safari but works this way on other browsers too so going with it.
                        this.$emit('input', this.raw);
                        return;
                    }

                    this.typing = true;
                    await this.$emit('input', this.raw);
                    this.typing = false;

                    return;



                } else if (event.key){
                    // ideal situation
                    mKeyPressed = event.key;

                } else {
                    mKeyPressed = String.fromCharCode(event.keyCode);
                    if (!mKeyPressed){
                        // deal with a few wierd ones
                        if (event.keyCode == 13){
                            mKeyPressed = 'Enter';
                        } else if (event.keyCode == 16){
                            mKeyPressed = 'Shift';
                        } else if (mKeyPressed == 8){
                            mKeyPressed = 'Tab';
                        } else if (mKeyPressed){

                        }
                    }
                } // event

                
                if (this.Sublib.inList(mKeyPressed, ['Control', 'Shift'])){
                    // the default through so they can highlight multiple or do a 'Ctrl' + 'A'
                    return;
                }


                if (event.ctrlKey){
                    mShiftAltCtrl = 'control';
                } else if (event.shiftKey){
                    mShiftAltCtrl = 'shift';
                } else if (event.altKey){
                    mShiftAltCtrl = 'alt'
                } 

                //event = null; // reset since I have to set it on the keydown, see comments above
            } else {
                mKeyPressed = '';
            }

            // await this.$nextTick();
            // await this.$forceUpdate();


            //var oTxt = document.getElementById(this.txtDomID);
            var oTxt = this.$refs[this.txtDomID]; //;
            if (!oTxt){
                // element not fully rendered yet
                return;
            }

            oTxt = this.$refs[this.txtDomID].$el

            // oTxt = oTxt.$refs.input

            //oTxt is div element, find the input element
            oTxt = oTxt.querySelector('input');


           

            // if (this.Sublib.isIOS() && document.activeElement == (oTxt || this.$refs[this.txtDomID])){
            //     return;
            // }

            var mCurPos = oTxt.selectionStart;
            if (!mCurPos) {
                mCurPos = 0;
            }


            var mPoint, mSeperator;
            var mNumeric, mDecimal, mValue, mCleanText, mTextLength, mDecimalValue, mPointPosition, mOldValue, mOldSetDec;
            var mMaxDecPoints;

            mPoint = '.'; // designed so if we're in european countries it's a ','
            mSeperator = ','; // designed so if we're in european countries it's a '.'

            if (typeof this.formated != 'string'){
                // shouldn't only happen when called from the created
                if (this.formated == null){
                    this.formated = '0';
                } else {
                    this.formated = String(this.formated);
                }
            } else if (this.Sublib.contains(this.formated, '..')){
                // only happens on android once they click the '.'. Can't stop it for whatever reason (see comments below)
                this.formated = this.formated.replace('..', '.');
                //mCurPos++;
                this.textPart = 'D';
            }


            if (!this.formated || Number(this.formated) == 0 && this.Sublib.contains(this.inputMask2Use, mPoint)){
                this.formated = '0.0';
            }

            mCleanText = this.Sublib.applyInputMask(this.formated, this.inputMask2Use);
            mCleanText = this.Sublib.padL(mCleanText, this.inputMask2Use.length, ' '); // VFP auto adds spaces, we auto strip them off. Need them back for this.

            mTextLength = mCleanText.length; // - 1; // account for the fact that everything in JS is 0 based but .length;
            var mMaxHighlightLen = mCleanText.trim().length; // it doesn't always let them highlight the extra spaces, need to account for that.

            mPointPosition = (this.Sublib.contains(mCleanText, mPoint) ? mCleanText.indexOf(mPoint) : mCleanText.length); // don't need to add 1 since JS is 0 based

            mOldValue = this.raw;
            if (!mOldValue){
                mOldValue = 0; // deals with not being a number
            }

            mMaxDecPoints = mTextLength - mPointPosition -1;


            // Get numeric and decimal part
            mNumeric = (mPointPosition < mTextLength ? this.Sublib.left(mCleanText, mPointPosition) : mCleanText).trim();
            mNumeric = this.Sublib.replaceAll(mNumeric, mSeperator, '');
            if (Number(mCleanText.substr(mPointPosition + 1)) == 0 && this.decimalsStored == 0){
                mDecimal = '';
            } else {      
                var oDecHold;
                oDecHold = this.Sublib.getNumberParts(mCleanText);
                mDecimal = oDecHold.decNumStr; // keeps the leading and trailing 0s
            }


// console.log('**********************************************')
// console.log('mTyping: ' + String(mTyping))
// console.log('mKeyPressed: ' + mKeyPressed)
// console.log("mKeyPressed.toLowerCase() == 'unidentified': " + String(mKeyPressed.toLowerCase() == 'unidentified'))
// console.log('isAndroid:' +String(this.Sublib.isAndroid()))
// console.log('. occurs: ' + this.Sublib.occurs(oTxt.value, '.'))
// console.log('oTxt.value: ' + oTxt.value)
// console.log('this.formatted: ' + this.formated)

             if (mTyping && (!mKeyPressed || mKeyPressed.toLowerCase() == 'unidentified') && this.Sublib.isAndroid()){
                // Android (for whatever reason) reports "Unidentified" for both the '.', ',' '-', and possibly a few others (keyboard only shows numbers, '.', ',', '-' and a space)
                // figure out what it really is
             
                // oTxt.value seems to be 1 step behind / doesn't update right away. If it equals this.value, then it had an extra 'step' to update and so they pressed the decimal as no value actually changed
                if (this.Sublib.contains(oTxt.value, '..') || this.Sublib.occurs(oTxt.value, '.') > 1 || oTxt.value == '.' || oTxt.value == this.formated){
                    // pressed the period. Treat it like such
                    // NOTE: Doesn't really work, hvae to account for it on the next key click.

                    if (event){
                        event.preventDefault();
                    }

                    this.textPart = 'D'
                    
                    // oTxt._value = oTxt.value; //.replace('..', '.');

                    await this.$nextTick();
                    await this.$forceUpdate();

                    // oTxt.value = oTxt.value.replace('..', '.');

                    // await this.$nextTick();
                    // await this.$forceUpdate();

                    // oTxt.value = oTxt.value.replace('..', '.');
                    
                    //oTxt._value = oTxt.value;

                    

                    mKeyPressed = '.'


                    //this.formated = this.formated.replace('.', '');

                    // oTxt.value = oTxt.value.replace('..', '.');

                    // // await this.$nextTick();
                    // // await this.$forceUpdate();

                    // this.applyMask(true, { key: '.', preventDefault: function(){} });
                    //return;
// console.log('Changed mKey to "."')                    
//                     mKeyPressed = '.';
                } else{
                    // not worrying about other keys right now. SRR 10/16/2020
                }
            } 






            var mForceCurPos = -1;
            var mKeyCode; // ascii value (so it's easier to copy from the VFP code)
            if (mKeyPressed.length == 1){
                mKeyCode = mKeyPressed.charCodeAt(0); 
            } else {    
                if (mKeyPressed == 'Backspace'){
                    mKeyCode =  127
                } else if (mKeyPressed == 'Delete'){
                    mKeyCode = 7;
                } else if (mKeyPressed == 'ArrowLeft'){
                    mKeyCode = 4
                } else if (mKeyPressed == 'ArrowRight'){
                    mKeyCode = 19
                } else if (mKeyPressed == 'Delete') {
                    mKeyCode = 7;
                }
            }

            if (!mKeyCode){
                mKeyCode = -1;
            }
            if (!mShiftAltCtrl){
                mShiftAltCtrl = '';
            }

            var mSelLength = oTxt.selectionEnd - oTxt.selectionStart;

            if (this.disabled){
            } else if (48 <= mKeyCode && mKeyCode <= 57){
                if (event){
                    event.preventDefault();
                }

                if (mCurPos < mPointPosition){
                    // oesn't always update right and this is the only method that really struggled a lot with it
                    this.textPart = 'N';
                }

                if (mSelLength == mTextLength || mSelLength >= mMaxHighlightLen){
                    // highlighted the whole thing. Wipe it out.
                    this.textPart = 'N'
                    mNumeric = '';
                    mDecimal = '';
                    this.decimalsStored = 0;
                }


                if (this.textPart == 'N'){ 
                    // handle the numeric (whole number) part
                    if (!this.Sublib.contains(this.Sublib.applyInputMask(mNumeric + mKeyPressed, this.inputMask2Use), '*') // check overflow
                        || mSelLength > 0){
                        
                        if (Number(mNumeric) != 0 && mSelLength > 0){
                            // Moved the cursor and highlighted a number and are trying to replace the value(s) now
                            // Figure out what they have highlighted and replace it	
                            var mNewValStr = mCleanText.replace(mCleanText.substr(oTxt.selectionStart, mSelLength), mKeyPressed);
                            mNewValStr = this.Sublib.left(mNewValStr, mNewValStr.indexOf(mPoint));
                            mNewValStr = this.Sublib.replaceAll(mNewValStr, mSeperator, '');

                            mNumeric = mNewValStr;
                            mForceCurPos = mCurPos + mSelLength; //1;

                        } else if (mCurPos != mPointPosition && Number(mNumeric) != 0){
                            // Moved the cursor and are trying to 'insert' a value between other numbers. SRR 10/07/2020
							// i.e. 
							// nPointPosition = 10, this.selStart = 7
							// value was '2|34.00' with the cursor between the 2 and the 3
							// insert in the right spot
							// The tricky thing is that all of the values returned for position are not altrimming the value so you can't just go off of that.
							// Number: 	x	x	x	x	.	x
                            // Pos:		6	7	8	9	10	11	

                            var mPosFromRight = mPointPosition - mCurPos;

                            // VFP auto accounts for the format mask, I have to account for it.
                            var mHoldMask = (this.Sublib.contains(this.inputMask2Use, '.') ? this.inputMask2Use.substring(0, this.inputMask2Use.indexOf('.')) : this.inputMask2Use);
                            var mHoldNumeric = this.Sublib.applyInputMask(mNumeric, mHoldMask);
                            //mHoldNumeric = this.Sublib.padL(mHoldNumeric, mHoldMask.length);

                            mValRightOfCur = this.Sublib.right(mHoldNumeric, mPosFromRight);
                            mValLeftOfCur = this.Sublib.left(mHoldNumeric, mHoldNumeric.length - mValRightOfCur.length);

                            mValLeftOfCur = this.Sublib.replaceAll(mValLeftOfCur, mSeperator, ''); 
                            mValRightOfCur = this.Sublib.replaceAll(mValRightOfCur, mSeperator, '');

                            mNumeric = mValLeftOfCur + mKeyPressed + mValRightOfCur;
                            mForceCurPos = mCurPos; // keep it in the same spot;

                        } else {
                            // they are typing like normal
                            mNumeric += mKeyPressed;
                        }



                    } else {
                        // Test set confirm, stay on textbox and beep if needed
                        // We run with Set Confirm On on the deskto, 
                        if (true){
                            // can't really do the beep, nothing to do (maybe we want to do a toast?)
                        } else {
                            // keyboard '{TAB}'
                        }
                    }


                } else { // this.textPart = 'D'
                    // handle the decimal part          
                    this.decimalsStored = Math.max(mCurPos - mPointPosition, this.decimalsStored + 1); // account for them clicking someplace else and typing

                    if (this.decimalsStored > mMaxDecPoints && mCurPos >= mCleanText.length){
                        // We run with Set Confirm On on the deskto, 
                        if (true){
                            // can't really do the beep, nothing to do (maybe we want to do a toast?)
                        } else {
                            // keyboard '{TAB}'
                        }

                        this.decimalsStored--;

                    } else {
                        if (Number(mDecimal) != 0 && mSelLength > 0){
                            this.decimalsStored--; // didn't actually  increase if we are highlighting and replacing
                            this.decimalsStored = this.decimalsStored - mSelLength + 1; // take off what they're deleting and add 1 for the value they're replacing

                            // Moved the cursor and highlighted a number and are trying to replace the value(s) now
                            // Figure out what they have highlighted and replace it	
                            var mNewValStr
                            mNewValStr = mCleanText.replace(mCleanText.substr(oTxt.selectionStart, mSelLength), mKeyPressed);
                            mNewValStr = this.Sublib.right(mNewValStr, mNewValStr.length - mNewValStr.indexOf(mPoint));
                            mNewValStr = this.Sublib.replaceAll(mNewValStr, mSeperator, '');
                            mNewValStr = this.Sublib.replaceAll(mNewValStr, '\\' + mPoint, '');

                            mDecimal = mNewValStr;

                            mForceCurPos = mCurPos + 1;

                        } else if (mCurPos - mPointPosition < this.decimalsStored -1 || this.decimalsStored > mMaxDecPoints){                           
                            // 'Insert' the value into the correct spot (see notes above in the non-decimal section)
                            var mPosFromLeft = mCurPos - mPointPosition -1;
                            var mValLeftOfCur = this.Sublib.left(mDecimal, mPosFromLeft);
                            var mValRightOfCur = this.Sublib.right(mDecimal, mDecimal.length - mValLeftOfCur.length);

                            mDecimal = mValLeftOfCur + mKeyPressed + mValRightOfCur;
                            mForceCurPos = mCurPos + 1; // set to the next pos (makes more sense as you type)

                            if (this.decimalsStored > mMaxDecPoints){
                                this.decimalsStored--; // didnt' really add
                            }

                            if (mDecimal.length > this.decimalsStored){
                                // Can happen if they have '.4|5' with the cursor between the 4 & 5 and type 6, we now have 465, just want to keep 46
                                mDecimal = this.Sublib.left(mDecimal, this.decimalsStored);
                            }

                        } else {
                             // regular
                             //mDecimal = mDecimal.replace(mDecimal.substr(this.decimalsStored -1), mKeyPressed);                  
                            mDecimal = mDecimal.replaceAt(this.decimalsStored -1, mKeyPressed);
                        }
                    }

                } // this.textPart = 'N' / 'D'

                mValue = mNumeric + mPoint + mDecimal;
                this.raw = Number(mValue);



            } else if (mKeyCode == 43){
                // +
                if (event){
                    event.preventDefault();
                }
                this.raw = this.Sublib.math.abs(this.raw);

            } else if (mKeyCode == 45){
                // -
                if (event){
                    event.preventDefault();
                }
                this.raw = this.Sublib.math.eval(() => this.raw *-1);

            } else if (mKeyPressed == mPoint && this.Sublib.contains(mCleanText, mPoint)){
                // point pressed
                if (event){
                    event.preventDefault();
                }
                this.textPart = 'D';
                mForceCurPos = mPointPosition;

            } else if (this.Sublib.inList(mKeyCode, [9, 15, 5, 24, 18, 3])){
                // Enter, Tab, Backtab, Up Array, Down Arrow, Pg Up, Pg Down - Default behavior

            } else if (this.Sublib.inList(mKeyCode, [1, 6])){
                // Home, end
                if (mKeyCode == 1){
                    // Home
                    this.textPart = 'N';
                } else { // mKeyCode == 6
                    this.textPart = 'D';
                }

            } else if (this.Sublib.inList(mKeyCode, [4, 19])){    
                // Right, left arrows, just update where the cursor is at and which side of the decimal I'm on

                if (mShiftAltCtrl != 'shift'){
                    mForceCurPos = oTxt.selectionStart;
                } else {
                    mForceCurPos = -2; // let the default through
                }
                

                if (mCurPos < mPointPosition){
                    this.textPart = 'N'
                } else {
                    this.textPart = 'D'
                }

            } else if (mKeyCode == 7){
                // Del
                if (event){
                    event.preventDefault();
                }

                if (mCurPos < mPointPosition){
                    // Doesn't always update right and this is the only method that really struggled a lot with it
                    this.textPart = 'N';
                } else {
                    this.textPart = 'D';
                }

                if (mSelLength == mTextLength || mSelLength >= mMaxHighlightLen){
                    // highlighted the whole thing and hit delete
                    mValue = 0;
                    this.textPart = 'N';
                    this.decimalsStored = 0;
                    mNumeric = '0';
                    mDecimal = '0';

                } else if (this.textPart == 'N' && (Number(mNumeric) != 0 || this.Sublib.contains(mNumeric, '00'))){
                    var mPosFromRight, mValRightOfCur, mValLeftOfCur, mHoldVal;

                    mPosFromRight = mPointPosition - mCurPos;

                    mHoldVal = mCleanText.substr(0, mPointPosition);

                    mValRightOfCur = this.Sublib.right(mHoldVal, mPosFromRight);
                    mValLeftOfCur = this.Sublib.left(mHoldVal, mHoldVal.length - mValRightOfCur.length);

                    mValLeftOfCur = this.Sublib.replaceAll(mValLeftOfCur, mSeperator, '').trim();
                    mValRightOfCur = this.Sublib.replaceAll(mValRightOfCur, mSeperator, '').trim();

                    mValRightOfCur = this.Sublib.right(mValRightOfCur, mValRightOfCur.length - 1); // apply the delete

                    mNumeric = mValLeftOfCur + mValRightOfCur;

                    if (Number(mNumeric) != 0){
                        mForceCurPos = oTxt.selectionStart + 1;
                    } else {
                        // let the default kick in
                    }

                    if (this.Sublib.contains(mCleanText, ',') && !this.Sublib.contains(this.Sublib.applyInputMask(mNumeric, this.inputMask2Use)) && mCleanText.substr(mForceCurPos + 1, 1) == ','){
                        // something like '1,234' and now it's '234'
                        mForceCurPos++;
                    }

                } else { // this.textPart = 'D'
                    this.textPart = 'D'; // explicity set since we may have just switched from the whole number side
                    this.decimalsStored--;
                    if (this.decimalsStored < 0){
                        this.decimalsStored = 0;
                    }

                    var mPosFromLeft, mValRightOfCur, mValLeftOfCur;
                    mPosFromLeft = mCurPos - mPointPosition - 1;
                    mValLeftOfCur = this.Sublib.left(mDecimal, mPosFromLeft);
                    mValRightOfCur = this.Sublib.right(mDecimal, mDecimal.length - mValLeftOfCur.length);

                    mValRightOfCur = this.Sublib.right(mValRightOfCur, mValRightOfCur.length - 1); // Must be after the RIGHT() for the right side values;

                    mDecimal = mValLeftOfCur + mValRightOfCur;
                    mForceCurPos = oTxt.selectionStart;
                }

                mValue = mNumeric + mPoint + mDecimal;
                this.raw = Number(mValue);


            } else if (mKeyCode == 127){
                // backspace
                if (event){
                    event.preventDefault();
                }

                if (mCurPos < mPointPosition){
                    // Doesn't always update right and this is the only method that really struggled a lot with it
                    this.textPart = 'N';
                } else {
                    this.textPart = 'D';
                }

                if (mSelLength == mTextLength || mSelLength >= mMaxHighlightLen){
                    mValue = '0' + mPoint + '0';
                    this.decimalsStored = 0;
                    this.textPart = 'N';

                } else if (mSelLength > 0){
                    var mNewValStr;
                    mNewValStr = mCleanText.replace(mCleanText.substr(mCurPos, mSelLength), '');
                    mNewValStr = this.Sublib.replaceAll(mNewValStr, mSeperator, '');

                    mValue = mNewValStr;

                    mForceCurPos = oTxt.selectionStart -1;

                } else {
                    if (this.textPart == 'N'){
                        if (mCurPos != mPointPosition && Number(mNumeric) != 0){
                            // They've moved the cursor, delete where they're at
                            // see notes above for typing
                            var mPosFromRight, mValRightOfCur, mValLeftOfCur;
                            mPosFromRight = mPointPosition - mCurPos;

                            // mValRightOfCur = this.Sublib.right(mNumeric, mPosFromRight);
                            // mValLeftOfCur = this.Sublib.left(mNumeric, mNumeric.length - mValRightOfCur.length);


                            // VFP auto accounts for the input mask, I have to account for it here
                            var mHoldMask = (this.Sublib.contains(this.inputMask2Use, '.') ? this.inputMask2Use.substring(0, this.inputMask2Use.indexOf('.')) : this.inputMask2Use);
                            var mHoldNumeric = this.Sublib.applyInputMask(mNumeric, mHoldMask);
                            //mHoldNumeric = this.Sublib.padL(mHoldNumeric, mHoldMask.length);

                            mValRightOfCur = this.Sublib.right(mHoldNumeric, mPosFromRight);
                            mValLeftOfCur = this.Sublib.left(mHoldNumeric, mHoldNumeric.length - mValRightOfCur.length);

                            mValLeftOfCur = this.Sublib.replaceAll(mValLeftOfCur, mSeperator, ''); 
                            mValRightOfCur = this.Sublib.replaceAll(mValRightOfCur, mSeperator, '');

                            

                            if (!mValLeftOfCur && mCleanText.substr(oTxt.selectionStart, 1)){
                                // For whatever reason, when trying to backspace the far left char, this happens
                                mValLeftOfCur = this.Sublib.left(mValRightOfCur, 1);
                                mValRightOfCur = this.Sublib.right(mValRightOfCur, mValRightOfCur.length -1);
                            }

                            mValLeftOfCur = this.Sublib.left(mValLeftOfCur, mValLeftOfCur.length - 1); // apply the backspace

                            mNumeric = mValLeftOfCur + mValRightOfCur;
                            mForceCurPos = oTxt.selectionStart; // keep it in the same spot

                        } else if (mNumeric.length >= 1){
                            mNumeric = this.Sublib.left(mNumeric, mNumeric.length -1);

                        } else {
                            mNumeric = '';
                        }

                    } else { // this.textPart = 'D'
                        this.decimalsStored--;
                        if (this.decimalsStored < 0){
                            // we need to 'step over' the decimal poitn now
                            this.decimalsStored = 0;
                            this.textPart = 'N';
                            if (mNumeric.length >= 1){
                                mNumeric = this.Sublib.left(mNumeric, mNumeric.length - 1);
                            } else {
                                mNumeric = '';
                            }

                            mDecimal = mDecimal.replace(mDecimal.substr(this.decimalsStored + 1, 1), '');

                        } else if ((mCurPos -1) - mPointPosition < this.decimalsStored + 1){ // subtractred one above, add it back on for our comparison
                            // They've moved the cursor, delete where they're at
                            // see notes above for typing
                            var mPosFromLeft, mValRightOfCur, mValLeftOfCur;
                            mPosFromLeft = mCurPos - mPointPosition - 1;
                            mValLeftOfCur = this.Sublib.left(mDecimal, mPosFromLeft);
                            mValRightOfCur = this.Sublib.right(mDecimal, mDecimal.length - mValLeftOfCur.length);

                            mValLeftOfCur = this.Sublib.left(mValLeftOfCur, mValLeftOfCur.length - 1); // Must be after the RIGHT() for the right side values

                            mDecimal = mValLeftOfCur + mValRightOfCur;
                            mForceCurPos = oTxt.selectionStart -1;

                        } else {
                            mDecimal = mDecimal.replace(mDecimal.substr(this.decimalsStored, 1), ''); // remember, thi.decimalsStored is 1 based, while substr is 0 based
                        }
                    }

                    mValue = mNumeric + mPoint + mDecimal;
                }

                this.raw = Number(mValue);

            } else {
                // some other key. Nothing to do
                if (mTyping && !mShiftAltCtrl && 65 <= mKeyCode && mKeyCode <= 122){
                    event.preventDefault();
                    return;
                } else {
                    // let it through so we can apply the input mask below as we low
                }
            }


            if (isNaN(this.raw)){
                this.raw = 0.0
            }


            this.formated = String(this.raw);
            // Make sure I have the extra padding
            if (!this.formated || Number(this.formated) == 0 && this.Sublib.contains(this.inputMask2Use, mPoint)){
                this.formated = '0.0';
            }


            this.formated = this.Sublib.applyInputMask(this.formated, this.inputMask2Use);
            this.formated = this.Sublib.padL(this.formated, this.inputMask2Use.length, ' '); // VFP auto adds spaces, portal auto strip them off. Need them back for this.

            if (!this.raw && typeof this.emptyChar == 'string' && this.textPart != 'D'){
                this.formated = this.emptyChar;
            }


            // if (typeof this.formated != 'string'){
            //     // shouldn't only happen when called from the created
            //     if (this.formated == null){
            //         this.formated = '0';
            //     } else {
            //         this.formated = String(this.formated);
            //     }
                
            // }


            if (!mTyping){
                // not typing / not active element. don't wait for it and don't set the cursor 
                // NOTE: Only really needed this for safari but works this way on other browsers too so going with it.
                this.$emit('input', this.raw);
                return;
            }

            this.typing = true;
            await this.$emit('input', this.raw);
            this.typing = false;
            



            if (mTyping && document.activeElement != oTxt){
                //await this.$nextTick(); // make sure other elements that may get updated by this value (i.e. price tot) are upated
                oTxt.focus();
            }

//             if (this.Sublib.occurs(this.formated, '.') > 1 || this.Sublib.occurs(oTxt.value, '.') > 1){
// debugger                
//             }


            if (mForceCurPos == -2){
                // Nothing to do, they are in the middle of highlighted multiple, let it through with the defaults
            } else if (mForceCurPos != -1){
                oTxt.setSelectionRange(mForceCurPos, mForceCurPos);
            } else if (this.textPart == 'N'){
                oTxt.setSelectionRange(mPointPosition, mPointPosition);
            } else { // this.textPart = 'D'
                oTxt.setSelectionRange(mPointPosition + this.decimalsStored + 1, mPointPosition + this.decimalsStored + 1);
            }
            

            return;


        }, // applyMask

        handleBlurEvent: function(){
            this.$emit('blur', this.raw);
        },
    } // methods
} // export default
</script>
<style scoped>
>>>input {text-align: right }
</style>