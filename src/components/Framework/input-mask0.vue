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
    </v-text-field>    -->
    <v-text-field
        :ref="txtDomID"
        v-model="formated" 
        @input="applyMask(true, event)"
        @keydown="event = $event"
        @focus="highlightSel()"
        :disabled="disabled"
        :clearable="clearable"
        :label="label"
        :loading="loading"
        type="tel"
        :messages="message"
        :dark="dark"
        :light="light"
        >
    </v-text-field>   
</template>
<script>
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
    }),
    props: [
        // these can be passed in, the 'data' stuff can't
        'value', // bound through v-model
        'inputMask',
        'disabled', // vuejs prop
        'clearable', // vuejs prop
        'label', // vuejs prop
        'loading', // vuejs prop
        'message', // vuejs prop
        'dark', // vuejs prop
        'light', // vuejs prop
    ],
    computed: {
        
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
                this.applyMask();
            }
        }
    },
    created(){           
        if (!this.inputMask){
            this.inputMask2Use = '#,###,###.##';
        } else {
            this.inputMask2Use = this.inputMask; // passed in
        }

        if (this.Sublib.contains(this.inputMask2Use, '-')){
            this.allowNeg = true;
        }

        //this.raw = this.$parent[this.property];
        this.raw = this.value;
        this.formated = String(this.value);
        this.applyMask();
    }, // created


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
            // mTyping = Logical. Needed so we can set focus back to this element since iOS is changning focus on us
            // Event = event that fired

            var mKeyPressed;
            if (event){  
                if (event.key){
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
                        }
                    }
                }

                event = null; // reset since I have to set it on the keydown, see comments above
            } else {
                mKeyPressed = '';
            }

            await this.$nextTick();
            await this.$forceUpdate();


            //var oTxt = document.getElementById(this.txtDomID);
            var oTxt = this.$refs[this.txtDomID]; //;
            if (!oTxt){
                // element not fully rendered yet
                return;
            }
  
            oTxt = oTxt.$refs.input

            // if (this.Sublib.isIOS() && document.activeElement == (oTxt || this.$refs[this.txtDomID])){
            //     return;
            // }

            var mCurCursor = oTxt.selectionStart;
            if (!mCurCursor) {
                mCurCursor = 0;
            }
    
            // If they are hitting backspace it works perfectly until the cursor is touching the decimal and they hit backspace and it clears out the decimal
            // If the number was 600.00 it now becomes 60000, really just need to move the cursor 1 to the left... SRR 01/28/2020
            if (mKeyPressed == 'Backspace' && this.Sublib.contains(this.inputMask2Use, '.') && !this.Sublib.contains(this.formated, '.') && mCurCursor == this.raw.toString().length){
                // just hit the backspace by the decimal, account for that
                this.formated = String(this.raw);
            }


            //oTxt.selectionEnd = mCurCursor; // clear any 'highlight' now that they started typing
            //oTxt.setSelectionRange(mCurCursor, mCurCursor -1);

            if (typeof this.formated != 'string'){
                // shouldn't only happen when called from the created
                if (this.formated == null){
                    this.formated = '0';
                } else {
                    this.formated = String(this.formated);
                }
                
            }

            // if we moved the cursor position and then they type '.', there may now be 2 '..'
            var mPressedPeriod = false;
            if (this.Sublib.contains(this.formated, '..')){
                this.formated = this.formated.replace('..', '.');
                // move the cursor back one so our code below moves it to the right place
                mCurCursor--;
                mPressedPeriod = true;

            } else if (this.Sublib.occurs(this.formated, '.') > 1){
                // something like 9.0.00 (i.e. formatted was 00.00, starting typeing '9.' so now it's 9.0.00), take out anything between the 2 decimals
                this.formated = this.formated.substring(0, this.formated.indexOf('.')) + this.formated.substring(this.formated.lastIndexOf('.'));

            }
            
            var mOldCommaCnt = this.Sublib.occurs(this.formated, ',');

            var mDecIndex;

            this.raw = Number(this.Sublib.cleanNumber(this.formated, this.allowNeg, true));
            var mHighlightAfterEmit = false;
            var mNoHighlightOverride = false;
            if (isNaN(this.raw)){
                this.raw = 0;
                if (mTyping){
                    if (mKeyPressed == '.'){
                        // it was highlighted and they clicked '.' to type something like '.25'
                        // don't re-highlight
                        mNoHighlightOverride = true;
                        mCurCursor++; // move over one so it starts typing where they expect
                    } else {
                        // clicked the 'x' to clear it out, want to highlight it
                        mHighlightAfterEmit = true;
                    }
                }

            }
            
            //if (mCurCursor == 1){
            if (mCurCursor <= this.inputMask2Use.length) {
                // starting typing from the left, input mask may get rid of the number, move the decimal if we need to
                // i.e. input mask = '##.##'
                // number was '72.50'
                // placed cursor before '|7' and typed '1' so it's now '172.50',
                // 1 is getting cut off by applyInputmask,
                // make it '17.250' so as they type it does more of what they are expecting

                // NOTE Change this to be the getNumberParts and do cases based on that
                // This works great if I'm typing BEFORE the decimal but starts acting weird if we're typing after the decimal. SRR 12/21/2019
                var oNumDtl = this.Sublib.getNumberParts(this.raw);
                mDecIndex = this.Sublib.replaceAll(this.inputMask2Use, ',', '').indexOf('.');
                var mBeforeDecLen2Big = false;
                if (mDecIndex && oNumDtl.lenB4Dec > mDecIndex){
                    mBeforeDecLen2Big = true;
                } else if (!mDecIndex){
                    mBeforeDecLen2Big = true;
                }

                // var mAfterDecLen2Big = false;
                // if (mDecIndex && oNumDtl.decLen > (this.inputMask2Use.lenB4Dec - mDecIndex - 1)){
                //     mAfterDecLen2Big = true;
                // }
                if (this.formated.length >= this.inputMask2Use.length && mBeforeDecLen2Big){
                    this.raw *= .1
                    this.raw = Number(String(this.raw).substring(0, this.inputMask2Use.length)); // make '31.725' => '31.72', otherwise input mask will move the value back to the pre *.1 valeu
                } 
            }

            this.formated = this.Sublib.applyInputMask(this.raw, this.inputMask2Use);

            if (Number(this.Sublib.cleanNumber(this.formated, this.allowNeg, this.Sublib.contains(this.inputMask2Use, '.'))) != this.raw){
                // something like this.raw = 12345678, input mask = '#,###,###'
                // and so this.formatted turned into '2,345,678' (strips from the left)
                // make the raw match the formatted (match what we show the user)
                this.raw = Number(this.Sublib.cleanNumber(this.formated, this.allowNeg, this.Sublib.contains(this.inputMask2Use, '.')));
            }

            //await this.$emit('input-mask-value-change', this.raw);
            if (!mTyping){
                // not typing / not active element. don't wait for it and don't set the cursor 
                // NOTE: Only really needed this for safari but works this way on other browsers too so going with it.
                this.$emit('input', this.raw);
                return;
            }

            this.typing = true;
            await this.$emit('input', this.raw);
            this.typing = false;


            if (this.Sublib.occurs(this.formated, ',') > mOldCommaCnt){
                // input mask added a comma, move the cursor 1 to the right
                mCurCursor++;
            }            

            var mNextChar = this.formated.substr(mCurCursor, 1);
            
            if (mNextChar == '.' || mNextChar ==  ','){
                // next char is a '.' or ','
                // move the cursor accordingly
                // make sure they didn't type '7' and the input mask is '##.##', want them to be able to type '73' before we switch to after the decimal
                var oNum = this.Sublib.getNumberParts(this.raw);
                mDecIndex = this.Sublib.replaceAll(this.inputMask2Use, ',', '').indexOf('.');

                if (oNum.lenB4Dec >= mDecIndex || mPressedPeriod){
                    mCurCursor+= 1;
                }
            }

            // if (!this.Sublib.isIOS()){
            //     oTxt.selectionStart = mCurCursor;
            //     oTxt.selectionEnd = mCurCursor;
            // } else {
  
            if (mTyping && document.activeElement != oTxt){
                await this.$nextTick(); // make sure other elements that may get updated by this value (i.e. price tot) are upated
                oTxt.focus();
            }

            oTxt.setSelectionRange(mCurCursor, mCurCursor);

            if (!mNoHighlightOverride && (mHighlightAfterEmit || (mTyping && this.raw == 0))){
                this.highlightSel();
            }
            
            
            
            
            //oTxt.focus();
        }, // applyMask
    } // methods
} // export default
</script>
<style scoped>
</style>