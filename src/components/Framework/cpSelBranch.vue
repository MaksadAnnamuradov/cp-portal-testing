<template>
    <!-- <cp-select 
        menu-props="auto"
        :class="classId"
        v-model="selItemId"
        :items="oItems" 
        :item-text="locDescFld" 
        :item-value="locKeyFld"
        :label="locLbl"  
        :height="locHeight"
        :disabled="disabled"
        :colorFld="locColorFld"
        :returnObj="retObj"
        @blur="cboBlur()"
        @focus="cboFocus()"
        >


        <template v-slot:item="{ item }">
          
            <span 
                :style="{ 'border-left': item[colorFld] ? ('3px solid ' + (rgbColor ? ('rgb(' + item[colorFld] + ')') : item[colorFld])) : '', 'padding-left':'2px' }"
                >
                {{item[locDescFld]}}
            </span>
        </template>
    </cp-select> -->

     <cp-select 
        menu-props="auto"
        :class="classId"
        v-model="selItemId"
        :items="oItems" 
        :item-text="locDescFld" 
        :item-value="locKeyFld"
        :label="locLbl"  
        :height="locHeight"
        :disabled="disabled"
        :returnObj="retObj"
        >

        <!-- NOTE: I think this works to show the border on the selected item but we didn't know about it when we wrote the :style= -->
            <!-- <template v-slot:selection="{ item, index }">
                <img :src="item.image">{{ item.name }}
            </template> -->

        <template v-slot:item="{ item }">
            <!-- Displaying icon with cp-select if we need in the future -->
            <!-- <img :src="Sublib.getWeatherIcon('day_clear', 5)" class="settings-weather-preview-img" /> -->
            <!-- <v-icon v-if="item.icon" class="settings-weather-preview-icon">{{ item.icon.name }}</v-icon> -->
            <span 
                :style="{ 'border-left': item[locColorFld] ? ('3px solid ' + item[locColorFld]) : '', 'padding-left':'2px' }"
                >
                {{item[locDescFld]}}
            </span>
        </template>
    </cp-select>
</template>


<!-------------------------------------------------------------------------------------------------------------------------------------------------->
<script>
export default {
    name: 'BranchesCbo',
    data: () => ({
        locKeyFld: '',
        locDescFld: '',
        locColorFld: '',
        locLbl: '',
        locHeight: 40,

        //selItemId: '',  moved to be computed property so it updates the original value MA 05/31/2023
        classId: '',
    }),
    props: [
        'value', // bound through v-model
        'oItems',  // this is the cursor that we are working with to populate the list
        'keyFld', // this is the field that we are using as the key
        'descFld', // this is the field in the cursor that we are using as the description

        'label', // this is the label for the drop down
        'height', // this is the height of the drop down
        'colorFld', // this is the field in the cursor that we are using as the color
        'disabled', // this matches vuetify disabled
        'retObj', // this is a boolean that tells us if we want to return the object or just the key
    ],

    computed: {
        lblStyle() {
            var style = ''

            //check if oItems.length > 0 and this.selItemId is not empty
            if(this.oItems.length > 0 && this.selItemId && this.selItemId != '') {

                //get the color from the oItems array
                var color = this.oItems.find(obj => obj[this.locKeyFld] == this.selItemId)[this.locColorFld];

                //set the style
                style = 'border: 5px solid transparent' + ';' + 'border-left-color: ' + (color ? color : '') + ';' + 'padding-left : 3px; line-height: 10px;' 
            }
            return style
        },
        selItemId: {
            get() { return this.value },
            set(val) { 
                if (!this.updtFromParent) {
                    this.$emit('input', val); //this will change the value prop on the parent
                    this.$emit('change', val) //this will update the value prop on the parent as well MA 05/31/2023
                }   
            }
        }
    },

    watch: {
        value: async function () {
            this.updtFromParent = true; // set for watcher
            this.selItemId = this.value;

            await this.$nextTick();
            await this.$forceUpdate();

            this.updtFromParent = false; 


            //get element by class name
            var inputSlot = document.querySelector("." + this.classId + ">.v-input__control>.v-input__slot");
            //it was errroring out saying it is null, so if null, then dont do anything MA 03/03/2023

            if(inputSlot){
                //add more style to the input slot
                inputSlot.style.cssText += this.lblStyle;
            }

        },

        
        oItems: function(){
            return this.itemsChanged();
        }
        
    }, // watch


    async created(){
        if (!this.$vuetify || !this.$vuetify.theme || !this.$vuetify.breakpoint){
            this.$vuetify = this.Sublib.oVuetify;
        }

        //vue complains about mutating props values, so had to create a bunch of local variables and set defaults
        if(!this.descFld){
            this.locDescFld = 'branchname';
        }else{
            this.locDescFld = this.descFld;
        }

        if(!this.keyFld){
            this.locKeyFld = 'branchesid';
        }else{
            this.locKeyFld = this.keyFld;
        }

        if(!this.label){
            this.locLbl = this.Sublib.getLbl('branch')
        }else{
            this.locLbl = this.label;
        }

        if(!this.height){
            this.locHeight = 40;
        }else{
            this.locHeight = this.height;
        }

        if(!this.colorFld){
            this.locColorFld = 'branchcolor';
        }else{
            this.locColorFld = this.colorFld;
        }

        this.updtFromParent = true; // don't want our wather to fire
        this.selItemId = this.value;
        
        await this.$nextTick();
        await this.$forceUpdate();

        this.updtFromParent = false; 

        //assign 5 digit random number to classId
        this.classId = 'BranchesCbo' + Math.floor(10000 + Math.random() * 90000);
    }, // created

    mounted(){
        //first time mounted, it was not firing for the first time
        // this.$emit('change', this.selItemId);

    }, // mounted


    //**************************************************************************************************************
    methods: {
       
        //**************************************************************************************************************
        async handleChangeEvent(){
            //emit change event
            this.$emit('change', this.selItemId);
        }, // handleChangeEvent


        //**************************************************************************************************************
        // the watcher doesn't always pick up that we updated the items, making it so we can manually call this to force it to show the branches style stuff. SRR 08/17/2023
        itemsChanged(){
            var inputSlot = document.querySelector("." + this.classId + ">.v-input__control>.v-input__slot");
            if(inputSlot){
                //add more style to the input slot
                inputSlot.style.cssText += this.lblStyle;
            }
        }, // itemsChanged



    } // methods
} // export default
</script>

<!-------------------------------------------------------------------------------------------------------------------------------------------------->
<style scoped>

.settings-weather-preview-img { height:35px; width:35 px; margin-right:10px; }

</style>