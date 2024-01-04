<template>
    <v-text-field
        v-if="!dxTextBox"
        v-model="txtVal"
        ref="txtField"
        :hint="hint"
        :label="txtLabel"
        :placeholder="placeholder"
        :color="color2use"
        :dark="txtDark"
        :light="txtLight"
        :filled="txtFilled"
        :outlined="txtOutlined"
        :counter="counter"
        :maxlength="maxlength"
        :disabled="txtDisabled"
        :readonly="txtReadonly"
        :messages="messages"
        :error-messages="errorMessages"
        :rules="rules"
        :clearable="txtClearable"
        :dense="dense"
        :prefix="prefix"
        :suffix="suffix"
        :loading="loading"
        
        v-on="$listeners"

        @click:append="btnAppendIconClicked()"
        @click:clear="btnClearClicked()"

        :hide-details="txtHideDetails"
        :append-icon="btnAppendIcon"
        :type="type"
        :persistent-hint="persistentHint"
        :autofocus="txtAutofocus"
        :tabindex="tabindex"
        :append-outer-icon="appendOuterIcon"
    ></v-text-field>

    <DxTextBox
        v-else-if="dxTextBox"
        class="dx-field-value"
        style="align-items: start; align-content: start; justify-content: start;"
        v-model="txtVal"
        ref="txtField"
        :hint="hint"
        :label="txtLabel"
        :labelMode="labelMode || 'floating'"
        :placeholder="placeholder"
        :stylingMode="stylingMode || 'underlined'"

        :dark="txtDark"
        :light="txtLight"
        :maxLength="maxlength"
        :disabled="txtDisabled"
        :readOnly="txtReadonly"
    />
<!-- 
    all handled by v-on listeners that passes all vue event to parent MA 06/21/2023
        @click.native:append="btnAppendIconClicked()"

        @click:append-outer="btnOuterIconClicked()"
        @blur="onBlur"
        @focus="onFocus"
        @input="onInput"
        @keyup="$emit('keyup', txtVal)"
        @keypress.enter="$emit('keypress.enter', txtVal)" -->
</template>
<script>

import {
    DxTextBox,
} from 'devextreme-vue';

export default {
    // v-on="$listeners" allows us to pass in any event listeners from the parent
    name: 'cp-text',
    data: () => ({
        txtVal: '',
        updtFromParent: false,
        btnAppendIcon: '',
    }),
    props: [
        // these can be passed in, the 'data' stuff can't
        'value', // bound through v-model
        'disabled', // vuejs prop
        'hint', // vuejs prop
        'label', // vuejs prop
        'placeholder', // vuejs prop
        'color', // vuejs prop
        'filled', // vuejs prop
        'outlined', // vuejs prop
        'counter', // vuejs prop
        'maxlength', // vuejs prop
        'readonly', // vuejs prop
        'messages', // vuejs prop
        'errorMessages', // vuejs prop
        'rules', // vuejs prop
        'clearable', // vuejs prop
        'dense', // vuejs prop
        'prefix', // vuejs prop
        'suffix', // vuejs prop
        'loading', // vuejs prop
        'hideDetails',  //hides the messages underneath the field, not used for now because it overlaps with label
        'helpUrl', // url to help page
        'helpMsg', // message to display when help icon is clicked
        'helpIcon', // icon to use for help icon
        'type', // type of text field, default is text, can be password, email, etc.
        'persistentHint', // vuejs prop
        'autofocus', // vuejs prop
        'dark', 
        'light',
        'tabindex',
        'appendIcon', //for icon on right side of text field
        'appendOuterIcon', //for icon on right side of text field
        'labelMode', //dxTextBox prop (static, floating, hidden, outside)
        'stylingMode', //dxTextBox prop (outlined, filled, underlined)
        'dxTextBox', //use dxTextBox instead of v-text-field
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
        txtHideDetails: function(){
            return (this.hideDetails || typeof this.hideDetails == 'string') ? true : false;
        },
        txtReadonly: function(){
            return (this.readonly || typeof this.readonly == 'string') ? true : false;
        },
        txtAutofocus: function(){
            return (this.autofocus || typeof this.autofocus == 'string') ? true : false;
        },
        txtDark: function(){
            return (this.dark || typeof this.dark == 'string') ? true : this.$vuetify.theme.isDark;
        },
        txtLight: function(){
            return (this.light || typeof this.light == 'string') ? true : !this.$vuetify.theme.isDark;
        },

        
    }, // computed
    components: {
        DxTextBox,
    },
    
    watch: {
        value: async function(){
            // updated from the parent
            this.updtFromParent = true; // set for watcher
            this.txtVal = this.value; 

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


        this.updtFromParent = true; // don't want our wather to fire
        this.txtVal = this.value;

        await this.$nextTick();
        await this.$forceUpdate();

        this.updtFromParent = false; 

        if(!this.helpIcon && (this.helpUrl || this.helpMsg)){
            //default to info icon
            this.btnAppendIcon = this.Sublib.getIcon('info');
        }

        if(this.appendIcon){
            this.btnAppendIcon = this.appendIcon;
        }

    }, // created

    async mounted(){
        if(this.txtAutofocus){
            var el = this.$refs.txtField
            if(!el){
                //sleep for 1 second and try again
                await this.Sublib.sleep(1000);
                el = this.$refs.txtField

                await this.$nextTick()
                el.focus();
            }else{
                await this.$nextTick()
                el.focus();
            }
        }
    },

    methods: {

        // onFocus(){
        //     this.$emit('focus', this.txtVal);
        // },

        // onBlur(){
        //     this.$emit('blur', this.txtVal);
        // },

        // onInput(){
        //     this.$emit('input', this.txtVal);
        // },
        // onKeyup(){
        //     this.$emit('keyup', this.txtVal);
        // }, 

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
            this.txtVal = '';
            this.$emit('input', this.txtVal);
            this.$emit('cleared', this.txtVal);
            this.$emit('keyup', this.txtVal);
        },

        // //**************************************************************************** */
        // btnOuterIconClicked(){
        //     this.$emit('click:append-outer', this.txtVal);
        // }

    } // methods
} // export default
</script>
<style scoped>
</style>