<template>
    <!-- NOTE: Because we have to have v-model.number to make sure it doesn't come back as a string, can't re-use the subclass for cpTxt -->
    <v-text-field
        v-model.number="numVal"
        ref="txtNumField"
        :hint="hint"
        :label="txtLabel"
        :color="color2use"
        :dark="$vuetify.theme.isDark"
        :light="!$vuetify.theme.isDark"
        :filled="txtFilled"
        :outlined="txtOutlined"
        :disabled="txtDisabled"
        :readonly="txtReadonly"
        :messages="messages"
        :error-messages="errorMessages"
        :rules="numberRules"
        :prefix="prefix"
        :suffix="suffix"
        :loading="loading"
        :hide-details="txtHideDetails"

        @blur="onBlur"
        @focus="onFocus"
        @input="onInput"
        @click:append="btnAppendIconClicked()"
        @click:clear="btnClearClicked()"

        :append-icon="btnAppendIcon"
        :persistent-hint="persistentHint"
        type="number"
        :placeholder="placeholder"
        :clearable="txtClearable"
        :autofocus="txtAutofocus"
        :tabindex="tabindex"
        ></v-text-field>
        
        <!-- v-on="$listeners" -->
     <!-- @blur="onBlur"
        @focus="onFocus"
        @input="onInput"
        @click:append="helpMsg ? Sublib.mbox(helpMsg) : Sublib.launchHelp(helpUrl)" -->
</template>
<script>
export default {
    name: 'cp-text-num',
    data: () => ({
        numVal: '',
        updtFromParent: false,
        btnAppendIcon: '',
        numberRules: [],
        keyboardSupported: true,
    }),
    props: [
        // these can be passed in, the 'data' stuff can't
        'value', // bound through v-model
        'disabled', // vuejs prop
        'hint', // vuejs prop
        'label', // vuejs prop
        'color', // vuejs prop
        'filled', // vuejs prop
        'outlined', // vuejs prop
        'readonly', // vuejs prop
        'messages', // vuejs prop
        'errorMessages', // vuejs prop
        'rules', // vuejs prop
        'prefix', // vuejs prop
        'suffix', // vuejs prop
        'loading', // vuejs prop
        'helpUrl', // url to help page
        'helpMsg', // message to display when help icon is clicked
        'helpIcon', // icon to use for help icon
        'min', // min value
        'max', // max value
        'required', // is this field required
        'persistentHint', // vuejs prop
        'placeholder', // vuejs prop
        'clearable', // vuejs prop
        'autofocus', // vuejs prop
        'tabindex', // vuejs prop
        'appendIcon', // vuejs prop
        'hideDetails',
    ],
    computed: {
        txtClearable: function(){
            return (this.clearable || typeof this.clearable == 'string') ? true : false;
        }, 
        txtOutlined: function(){
            return (this.outlined || typeof this.outlined == 'string') ? true : false;
        },
        txtFilled: function(){
            return (this.filled || typeof this.filled == 'string') ? true : false;
        },
        txtLabel: function(){
            return this.label ? this.label : ''
        },
        txtDisabled: function(){
            return (this.disabled || typeof this.disabled == 'string') ? true : false;
        },
        txtReadonly: function(){
            return (this.readonly || typeof this.readonly == 'string') ? true : false;
        },
        txtAutofocus: function(){
            return (this.autofocus || typeof this.autofocus == 'string') ? true : false;
        },
        txtHideDetails: function(){
            return (this.hideDetails || typeof this.hideDetails == 'string') ? true : false;
        },
      
    }, // computed
    watch: {
        value: async function(){
            // updated from the parent
            this.updtFromParent = true; // set for watcher

            this.numVal = this.value; 

            await this.$nextTick();
            await this.$forceUpdate();

            this.updtFromParent = false; 

        },
    },
    async created(){           

        if (!this.$vuetify || !this.$vuetify.theme || !this.$vuetify.breakpoint){
            this.$vuetify = this.Sublib.oVuetify;
        }

        if (!this.color){
            this.color2use = 'primary';
        } else {
            this.color2use = this.color;
        }

        this.keyboardSupported = this.Sublib.isKeyboardOkay();


        this.updtFromParent = true; // don't want our wather to fire
        this.numVal = this.value;

        await this.$nextTick();
        await this.$forceUpdate();

        this.updtFromParent = false; 

        if(!this.helpIcon && (this.helpUrl || this.helpMsg)){
            //default to info icon
            this.btnAppendIcon = this.Sublib.getIcon('info');
        }else{
            this.btnAppendIcon = this.appendIcon;
        }

        if(this.required || typeof this.required == 'string'){
            this.numberRules.push(v => !!v || this.Sublib.getLbl('required field'));
        }

        if(this.min){
            var minNumMsg = this.Sublib.getLbl('number must be above')
            minNumMsg = minNumMsg.replace('<NUMBER>', this.min);
            this.numberRules.push(v => v >= this.min || minNumMsg);
        }

        if(this.max){
            var maxNumMsg = this.Sublib.getLbl('number must be below')
            maxNumMsg = maxNumMsg.replace('<NUMBER>', this.max);

            this.numberRules.push(v => v <= this.max || maxNumMsg);
        }

    }, // created

    async mounted(){
        var el = this.$refs.txtNumField
        if(!el){
            //sleep for 1 second and try again
            await this.Sublib.sleep(1000);
            el = this.$refs.txtNumField
        }

        if(this.txtAutofocus){
            await this.$nextTick()
            el.focus();
        }

        // right align the stupid thing since I can't get it to work anyother way
        try {
            let oInput = el.$el.querySelectorAll('input')[0];
            oInput.style.textAlign = 'right'
        } catch (ignore){
        }
    },

    methods: {
        //v-on="$listeners" was causing problem by send string instead of number, not sure why, but manually handling like this fixed that issue
        onFocus(){
            if(this.checkInput()){
                this.$emit('focus', this.numVal);
            }

            // this.$refs.txtNumField.focus();
            // this.$refs.txtNumField.$el.select()

            if(this.numVal == 0){
                //this method is sweeet! It worked right on! MA 11/02/2023
                this.Sublib.setFocus(this.$refs.txtNumField, true)
            }
          
        },

        onBlur(){
            if(this.checkInput()){
                this.$emit('blur', this.numVal);
            }
        },

        onInput(){
            if(this.checkInput()){
                this.$emit('input', this.numVal);
            }
        },

        checkInput(){
            // check if this.numVal is between min and max
            if(this.min && this.numVal < this.min){
                return false;
            }

            if(this.max && this.numVal > this.max){
                return false;
            }

            //check required
            if((this.required || typeof this.required == 'string') && !this.numVal){
                return false
            }

            return true;
        },

        //**************************************************************************** */
        btnAppendIconClicked(){
            if((this.helpUrl || this.helpMsg)){
                this.helpMsg ? this.Sublib.mbox(this.helpMsg) : this.Sublib.launchHelp(this.helpUrl)
            }else{
                // this.$emit('click:append', this.txtVal);  //fired already by v-on="$listeners"
            }
        },

        //**************************************************************************** */
        btnClearClicked(){
            this.numVal = 0;
            this.$emit('input', this.numVal);
            this.$emit('cleared', this.numVal);
            this.$emit('keyup', this.numVal);
        },

    } // methods
} // export default
</script>
<style scoped>
>>>.v-input input { text-align: right; }
</style>