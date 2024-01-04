<template>
     <cp-select 
        :menu-props="selMenuProps"
        :class="classId"
        v-model="selItemId"
        :items="items" 
        :item-text="locDescFld" 
        :item-value="locKeyFld"
        :label="locLbl"  
        :height="locHeight"
        :disabled="disabled"
        :returnObj="retObj"

        v-on="$listeners"
        >

        <template v-slot:item="{ item }">
                {{item[locDescFld] + (item.unionno ? ' (' + item.unionno + ')': '')}}
        </template>

        <template v-slot:selection="{ item }">
            {{item[locDescFld] + (item.unionno ? ' (' + item.unionno + ')': '')}}
        </template>
    </cp-select>
</template>


<!-------------------------------------------------------------------------------------------------------------------------------------------------->
<script>
export default {
    name: 'cpSelUnions',
    data: () => ({
        locKeyFld: '',
        locDescFld: '',
        locColorFld: '',
        locLbl: '',
        locHeight: 40,

        classId: '',
    }),
    props: [
        'value', // bound through v-model
        'items',  // this is the cursor that we are working with to populate the list
        'keyFld', // this is the field that we are using as the key
        'descFld', // this is the field in the cursor that we are using as the description
        'menuProps',

        'label', // this is the label for the drop down
        'height', // this is the height of the drop down
        'colorFld', // this is the field in the cursor that we are using as the color
        'disabled', // this matches vuetify disabled
        'retObj', // this is a boolean that tells us if we want to return the object or just the key
    ],

    computed: {
      
        selMenuProps: function(){
            // accepts either string or object, see https://v2.vuetifyjs.com/en/api/v-select/#props
            let retval = this.menuProps;
            if (retval && typeof retval == 'string'){
                if (!this.Sublib.contains(retval, 'auto')){
                    retval+= ',auto';
                }
            } else if (retval && typeof retval == 'object'){
                retval = {...retval, ...{'auto': true}};
            } else {
                retval = 'auto';
            }
            return retval;
        }, // selMenuProps
    },

    watch: {
        value: async function () {
            this.updtFromParent = true; // set for watcher

            this.selItemId = this.value;

            await this.$nextTick();
            await this.$forceUpdate();

            this.updtFromParent = false;
        },

    }, // watch


    async created(){
        if (!this.$vuetify || !this.$vuetify.theme || !this.$vuetify.breakpoint){
            this.$vuetify = this.Sublib.oVuetify;
        }

        //vue complains about mutating props values, so had to create a bunch of local variables and set defaults
        if(!this.descFld){
            this.locDescFld = 'descript';
        }else{
            this.locDescFld = this.descFld;
        }

        if(!this.keyFld){
            this.locKeyFld = 'unionsid';
        }else{
            this.locKeyFld = this.keyFld;
        }

        if(!this.label){
            this.locLbl = this.Sublib.getLbl('union')
        }else{
            this.locLbl = this.label;
        }

        if(!this.height){
            this.locHeight = 40;
        }else{
            this.locHeight = this.height;
        }

        this.updtFromParent = true; // don't want our wather to fire
        this.selItemId = this.value;
        
        await this.$nextTick();
        await this.$forceUpdate();

        this.updtFromParent = false; 

        //assign 5 digit random number to classId
        this.classId = 'SelUnions' + Math.floor(10000 + Math.random() * 90000);
    }, // created

    mounted(){
        //first time mounted, it was not firing for the first time
        // this.$emit('change', this.selItemId);

    }, // mounted


    //**************************************************************************************************************
    methods: {
       

    } // methods
} // export default
</script>

<!-------------------------------------------------------------------------------------------------------------------------------------------------->
<style scoped>
/* Have to do this so it doesn't reserve a bunch of dead space for longer labels and force 2 lines */
>>>.v-select__selections input { display:none }
</style>