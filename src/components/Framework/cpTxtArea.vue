<template>
    <v-textarea
        v-model="txtVal"
        ref="txtArea"
        :hint="hint"
        :label="txtLabel"
        :placeholder="placeholder"
        :color="color2use"
        :dark="$vuetify.theme.isDark"
        :light="!$vuetify.theme.isDark"
        :filled="txtFilled"
        :outlined="txtOutlined"
        :counter="counter"
        :disabled="disabled"
        :readonly="readonly"
        :messages="messages"
        :clearable="txtClearable"
        :prefix="prefix"
        :suffix="suffix"
        :loading="loading"

        v-on="$listeners"

        :rows="rows"
        :auto-grow="txtAutogrow"
        :persistent-hint="persistentHint"
        :tabindex="tabindex"
        style="overflow-wrap: normal;"
        no-resize
    ></v-textarea>
  <!-- @blur="onBlur"
        @focus="onFocus"
        @input="onInput" -->
</template>
<script>
export default {
    name: 'cp-text-area',
    data: () => ({
        txtVal: '',
        updtFromParent: false,
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
        'rules', // vuejs prop
        'clearable', // vuejs prop
        'dense', // vuejs prop
        'prefix', // vuejs prop
        'suffix', // vuejs prop
        'loading', // vuejs prop
        'hideDetails',  //hides the messages underneath the field, not used for now because it overlaps with label
        'autoGrow', // vuejs prop
        'rows', // vuejs prop
        'persistentHint', // vuejs prop
        'tabindex', // vuejs prop
        'autofocus', // vuejs prop
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
        txtAutogrow: function(){
            return (this.autoGrow || typeof this.autoGrow == 'string') ? true : false;
        },
        txtAutofocus: function(){
            return (this.autofocus || typeof this.autofocus == 'string') ? true : false;
        },
        
    }, // computed
    watch: {
        value: async function(){
            // updated from the parent
            // this.updtFromParent = true; // set for watcher
            this.txtVal = this.value; 
            await this.$nextTick();
            await this.$forceUpdate();

            // this.updtFromParent = false; 

        },
          //  v-on="$listeners" fixed this issue MA 06/21/2023
        // txtVal: function(){
        //     if (!this.updtFromParent){
        //         this.$emit('input', this.txtVal);
        //     }
        //     this.updtFromParent = false;
            
        // }
    },

    async mounted(){
        if(this.txtAutofocus){
            var el = this.$refs.txtArea
            if(!el){
                //sleep for 1 second and try again
                await this.Sublib.sleep(1000);
                el = this.$refs.txtArea

                await this.$nextTick()
                el.focus();
            }else{
                await this.$nextTick()
                el.focus();
            }
        }
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

        // this.updtFromParent = true; // don't want our wather to fire
        this.txtVal = this.value;

        await this.$nextTick();
        await this.$forceUpdate();

        // this.updtFromParent = false; 
    }, // created

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

    } // methods
} // export default
</script>
<style scoped>

.v-textarea {
  resize: none !important;
}

 .textarea {
    resize: none !important;
  }


</style>