<template>
    <!-- NOTE: There's ducmented bugs with checkboxes not always updating right because
        browsers don't fire events in the same order. This subclass is a way around that. 
        see https://github.com/vuejs/vue/issues/6709 SRR 01/10/2020 -->
    <v-checkbox
        v-model="chkBoxVal"
        :label="label"
        :color="color2use"
        :disabled="disabled"
        :messages="messages"
        :error-messages="errorMessages"
        :tabindex="tabindex"
        :dark="dark"
        :readonly="readOnly"
        >
    </v-checkbox>
</template>
<script>
export default {
    name: 'check-box',
    data: () => ({
        chkBoxVal: false,
        updtFromParent: false,
    }),
    props: [
        // these can be passed in, the 'data' stuff can't
        'value', // bound through v-model
        'disabled', // vuejs prop
        'label', // vuejs prop
        'color', // vuejs prop
        'messages', // vuejs prop
        'errorMessages', // vuejs prop (kind of, had to change from 'error-messages')
        'tabindex', // vuejs prop
        'dark',
        'readOnly', // vuejs prop
    ],
    computed: {
        
    }, // computed
    watch: {
        value: async function(){
            // updated from the parent
            this.updtFromParent = true; // set for watcher
            this.chkBoxVal = this.value; 
            await this.$nextTick();
            await this.$forceUpdate();

            this.updtFromParent = false; 

        },
        chkBoxVal: function(){
            if (!this.updtFromParent){
                this.$emit('input', this.chkBoxVal);
            }
            this.updtFromParent = false;
            
        }
    },
    async created(){           
        if (!this.color){
            this.color2use = 'primary';
        } else {
            this.color2use = this.color;
        }


        this.updtFromParent = true; // don't want our wather to fire
        this.chkBoxVal = this.value;

        await this.$nextTick();
        await this.$forceUpdate();

        this.updtFromParent = false; 
        
        

    }, // created

    methods: {
    } // methods
} // export default
</script>
<style scoped>
/* >>>.v-messages { margin-top: -10px; margin-left: 35px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } */
>>>.v-messages { margin-left: 35px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style>