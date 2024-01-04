<template>
    <v-switch
        v-bind="$attrs"
        v-model="switchVal"
        :hint="hint"
        :label="txtLabel"
        :color="color2use"
        :dark="$vuetify.theme.isDark"
        :light="!$vuetify.theme.isDark"
        :disabled="disabled"
        :readonly="readonly"
        :error-messages="errorMessages"
        :messages="messages"
        :tabindex="tabindex"
        @blur="onBlur"
        @focus="onFocus"
        :true-value="trueValue"
        :false-value="falseValue"
    ></v-switch>
        <!-- v-on="$listeners"  causing @change to fire twice so taking it out-->
</template>
<script>
export default {
    name: 'cp-switch',
    data: () => ({
        updtFromParent: false,
        //switchVal: false,
    }),
    props: [
        // these can be passed in, the 'data' stuff can't
        'value', // bound through v-model
        'disabled', // vuejs prop
        'readonly', // vuejs prop
        'hint', // vuejs prop
        'label', // vuejs prop
        'color', // vuejs prop
        'messages', // vuejs prop
        'errorMessages', // vuejs prop
        'tabindex', // vuejs prop
        'trueValue', // vuejs prop
        'falseValue', // vuejs prop
    ],
    computed: {
        txtLabel: function(){
            return this.label ? this.label : ''
        },

        //  v-on="$listeners" did not fix this issue, so putting this back MA 06/23/2023
        switchVal: {
            get() { return this.value },
            set(val) { 
                if (!this.updtFromParent) {
                    this.$emit('input', val); //this will change the value prop on the parent
                    this.$emit('change', val)
                }   
            }
        }

    }, // computed
    watch: {
        value: async function(){
            // updated from the parent
            this.updtFromParent = true; // set for watcher
            this.switchVal = this.value; 
            await this.$nextTick();
            await this.$forceUpdate();

            this.updtFromParent = false; 

        },

        // switchVal: function(){
        //     if (!this.updtFromParent){
        //         this.$emit('change', this.switchVal);
        //     }
        //     this.updtFromParent = false;
        // }
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
        this.switchVal = this.value;

        await this.$nextTick();
        await this.$forceUpdate();

        this.updtFromParent = false; 
        
        

    }, // created

    methods: {
        onFocus(){
            this.$emit('focus', this.switchVal);
        },

        onBlur(){
            this.$emit('blur', this.switchVal);
        },

        // onChange(){
        //     this.$emit('change', this.switchVal);
        // },

    } // methods
} // export default
</script>
<style scoped>


</style>