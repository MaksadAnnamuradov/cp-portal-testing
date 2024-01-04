<template>
    <span>
        <v-select
            v-if="true || $vuetify.breakpoint.mdAndDown" 
            v-bind="$attrs"
            v-model="selectVal" 
            :items="items" 
            :item-text="desc || itemText" 
            :item-value="code || itemValue"
            :label="selLabel" 
            :disabled="selDisabled"
            :height="height"

            v-on="$listeners"

            :return-object="returnObj"
            :loading="selLoading"
            :tabindex="tabindex"
            :error-messages="errorMessages"
            :menu-props="selMenuProps"
            :ref="refId"
        >
        <!-- Forward all other slots -->
            <template
                v-for="(_, slot) of $scopedSlots"
                v-slot:[slot]="scope"
                >
                <slot :name="slot" v-bind="scope"/>
            </template>

            <!-- <slot></slot> -->
            <!-- Note: v-bind $attrs is used to pass all the attributes from the parent to the child -->

    </v-select>

     <cp-auto
        v-else
         v-bind="$attrs"
        v-model="selectVal" 
        :items="items" 
        :item-text="desc || itemText" 
        :item-value="code || itemValue"
        :label="selLabel" 
        :disabled="selDisabled"
        :height="height"

        :return-object="returnObj"
        :loading="selLoading"
        :tabindex="tabindex"
        :error-messages="errorMessages"
        :menu-props="selMenuProps"
        :ref="refId"
        v-on="$listeners"
        style="margin-top:-20px;"
        >

        <template
            v-for="(_, slot) of $scopedSlots"
            v-slot:[slot]="scope"
            >
            <slot :name="slot" v-bind="scope"/>
        </template>
    </cp-auto>


    
    </span>

     <!-- @blur="cboBlur()"
        @focus="cboFocus()" -->
</template>

<!-------------------------------------------------------------------------------------------------------------------------------------------------->
<script>
export default {
    name: 'cpSelect',
    data: () => ({
        updtFromParent: false,
        refId: '',
    }),
    props: [
        // these can be passed in, the 'data' stuff can't
        'value', // bound through v-model
        'items', // vuejs prop
        'desc', // vuejs prop
        'code', // vuejs prop
        'label', // vuejs prop
        'disabled', // vuejs prop
        'color', // vuejs prop
        'height', // vuejs prop
        'returnObj', // vuejs prop
        'loading', // vuejs prop
        'tabindex', // vuejs prop
        'itemText',  //just to make this backwards compatible with vuetify, 
        'itemValue', //just to make this backwards compatible with vuetify,
        'errorMessages',
        'menuProps',

    ],

    //**************************************************************************************************************
    computed: {
        selDisabled: function(){
            return (this.disabled || typeof this.disabled == 'string') ? true : false;
        },
        selLabel: function(){
            return this.label ? this.label : '';
        },
        selLoading: function(){
            return this.loading ? true : false;
        },
        //  v-on="$listeners" fixed this issue MA 06/21/2023
        // selectVal: {
        //     get() { return this.value },
        //     set(val) { 
        //         if (!this.updtFromParent) {
        //             this.$emit('input', val); //this will change the value prop on the parent
        //             this.$emit('change', val) //this will update the value prop on the parent as well MA 05/31/2023
        //         }   
        //     }
        // }
        selMenuProps: function(){
            // accepts either string or object, see https://v2.vuetifyjs.com/en/api/v-select/#props
            let retval = this.menuProps;

            let ourDflts = {'auto': true, 'maxHeight': 400 };
            if (retval && typeof retval == 'string'){
                // if (!this.Sublib.contains(retval, 'auto')){
                //     retval+= ',auto';
                // }

                let oHold = retval.split(',');
                retval = {};
                oHold.forEach(string => retval[string] = true );
                
                retval = {...retval, ...ourDflts};

            } else if (retval && typeof retval == 'object'){
                retval = {...retval, ...ourDflts};

            } else {
                retval = ourDflts;
            }
            return retval;
            
        }, // selMenuProps
    }, // computed


    //**************************************************************************************************************
    watch: {
        value: async function(){
            // updated from the parent
            this.selectVal = this.value; 
            await this.$nextTick();
            await this.$forceUpdate();

        },
        items: async function(){
            // updated from the parent
            this.selectVal = this.value; 
            await this.$nextTick();
            await this.$forceUpdate();

        },
        // selectVal: function(){
        //     if (!this.updtFromParent){
        //         this.$emit('change', this.selectVal);
        //     }
        //     this.updtFromParent = false;
        // }
    },

    //**************************************************************************************************************
    async created(){    
        if (!this.$vuetify || !this.$vuetify.theme || !this.$vuetify.breakpoint){
            this.$vuetify = this.Sublib.oVuetify;
        }

        this.selectVal = this.value;

        this.refId = 'cpSelect-' + this.Sublib.right(String(Math.random()), 5);

        await this.$nextTick();
        await this.$forceUpdate();


    }, // created


    //**************************************************************************************************************
    methods: {
        //**************************************************************************************************************
        cboFocus(){
            this.$emit('focus', this.selectVal);
        },

        //**************************************************************************************************************
        cboBlur(){
            this.$emit('blur', this.selectVal);
        },

        //**************************************************************************************************************
        // Force the select to drop down and show the options
        dropDown(){
            this.Sublib.select_dropDown(this.$refs[this.refId]);
            //  try {
            //     // try a few levels deep
            //     if (this.$refs[this.refId].onClick){
            //         this.$refs[this.refId].onClick();    
            //     } else if (this.$refs[this.refId].$children[0].onClick){
            //         this.$refs[this.refId].$children[0].onClick();
            //     } else if (this.$refs[this.refId].$children[0].$children[0].onClick){
            //         this.$refs[this.refId].$children[0].$children[0].onClick();
            //     } else if (this.$refs[this.refId].$children[0].$children[0].$children[0].onClick){
            //         this.$refs[this.refId].$children[0].$children[0].$children[0].onClick();
            //     } else if (this.$refs[this.refId].$children[0].$children[0].$children[0].$children[0].onClick){
            //         this.$refs[this.refId].$children[0].$children[0].$children[0].$children[0].onClick();
            //     }
            // } catch(ignore){
            // }
        }, // dropDown

        // cboChange(){
        //     this.$emit('change', this.selectVal);
        // },

    } // methods
} // export default
</script>
<style scoped>
.cpSelect { max-height: 400px !important ;}
</style>