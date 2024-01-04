<template>
     <cp-auto
       :menu-props="selMenuProps"
        :class="classId"
        v-model="selItemId"
        :items="items2Use" 
        :item-text="locDescFld" 
        :item-value="locKeyFld"
        :label="locLbl"  
        :height="locHeight"
        :disabled="disabled"
        :returnObj="retObj"
        :autofocus="txtAutofocus"
        :scrollToText="scrollToText"

        :ref="refId"

        v-on="$listeners"

        :filterFunc="function(item, filterStr, itemText) {
            return this.Sublib.contains(this.Sublib.killPunctuation(Sublib.formatGL(item), true), this.Sublib.killPunctuation(filterStr, true)); // make it a more forgiving search
        }"
    >
        <template v-slot:selection="{ item }">
            <!-- NOTE: Need the width calc() so if it's too long it doesn't go onto 2 lines -->
            <span class="auto-comp-text-truncate">
                {{Sublib.formatGL(item)}}
            </span>
        </template>

        <template v-slot:item="{ item }">   
                <!-- {{ (item.levelsdeep && item.levelsdeep > 0  ? tab.repeat(item.levelsdeep) : '') + Sublib.formatGL(item)}}          -->
                <v-container style="padding:0">
                    <v-row style="padding:0">
                        <v-col style="padding:0">
                            {{ (item.levelsdeep && item.levelsdeep > 0  ? tab.repeat(item.levelsdeep) : '') + Sublib.formatGL(item)}}
                        </v-col>
                        <v-col v-if="item.gltype" cols="2" style="padding:0">
                            <span v-if="item.gltype == 'A' && item.glsubtype == 'BNK'">
                                {{Sublib.getLbl('bank')}}
                            </span>
                            <span v-else-if="item.gltype == 'A'">
                                {{Sublib.getLbl('asset')}}
                            </span>
                            <span v-else-if="item.gltype == 'L'">
                                {{Sublib.getLbl('liabilities')}}
                            </span>
                            <span v-else-if="item.gltype == 'E' && Sublib.inList(item.glsubtype, 'REV', 'CRV')">
                                {{Sublib.getLbl('revenue')}}
                            </span>
                            <span v-else-if="item.gltype == 'E' && item.glsubtype == 'EXP'">
                                {{Sublib.getLbl('expense 2')}}
                            </span>
                            <span v-else-if="item.gltype == 'E'">
                                {{Sublib.getLbl('equity')}}
                            </span>
                        </v-col>
                    </v-row>
                </v-container>     
        </template>
    </cp-auto>

</template>




<!-------------------------------------------------------------------------------------------------------------------------------------------------->
<script>
export default {
    name: 'GLCodesCbo',
    data: () => ({
        locKeyFld: '',
        locDescFld: '',
        locColorFld: '',
        locLbl: '',
        locHeight: 40,
        tab: '\xA0\xA0\xA0\xA0\xA0\xA0\xA0\xA0', //'\u0009 ', '\xA0' // see https://stackoverflow.com/questions/66774858/vuetify-select-append-indent-in-front-of-item
        items2Use: [],

        selItemId: '',  //moved to be computed property so it updates the original value MA 05/31/2023
        classId: '',
        refId: '',
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
        'autofocus', // vuejs prop
        'scrollToText', // char. Optional. If passed, tries to scroll to this part of the drop down if no value has been selected yet. SRR 09/27/2023
    ],

    computed: {
        // selItemId: {
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
        txtAutofocus: function(){
            return (this.autofocus || typeof this.autofocus == 'string') ? true : false;
        },
    },

    watch: {
        value: async function () {
            this.updtFromParent = true; // set for watcher

            this.selItemId = this.value;

            await this.$nextTick();
            await this.$forceUpdate();

            this.updtFromParent = false;
        },

        items: function(){
            this.setItems2Use();
        }

    }, // watch


    async created(){
        if (!this.$vuetify || !this.$vuetify.theme || !this.$vuetify.breakpoint){
            this.$vuetify = this.Sublib.oVuetify;
        }

         this.refId = 'cpSelect-' + this.Sublib.right(String(Math.random()), 5);

        //vue complains about mutating props values, so had to create a bunch of local variables and set defaults
        if(!this.descFld){
            this.locDescFld = 'descript';
        }else{
            this.locDescFld = this.descFld;
        }

        if(!this.keyFld){
            this.locKeyFld = 'glcodesid';
        }else{
            this.locKeyFld = this.keyFld;
        }

        if(!this.label && typeof this.label != 'string'){
            this.locLbl = this.Sublib.getLbl('gl code') // this.Sublib.getLbl('gl code)
        }else{
            this.locLbl = this.label;
        }

        if(!this.height){
            this.locHeight = 40;
        }else{
            this.locHeight = this.height;
        }

        this.setItems2Use();

        // if(!this.colorFld){
        //     this.locColorFld = 'branchcolor';
        // }else{
        //     this.locColorFld = this.colorFld;
        // }

        this.updtFromParent = true; // don't want our wather to fire
        this.selItemId = this.value;
        
        await this.$nextTick();
        await this.$forceUpdate();

        this.updtFromParent = false; 

        //assign 5 digit random number to classId
        this.classId = 'GLCodesCbo' + Math.floor(10000 + Math.random() * 90000);
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
        // Force the select to drop down and show the options
        dropDown(){
            this.Sublib.select_dropDown(this.$refs[this.refId])
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


        //**************************************************************************************************************
        // set this.items2Use
        setItems2Use(){
            let oData = this.items.breakRef();

            oData = oData.addProps({levelsdeep: 0});
            oData = oData.replaceFor({parentgl: 'A'}, obj => !obj.parentgl && obj.gltype == 'A');
            oData = oData.replaceFor({parentgl: 'L'}, obj => !obj.parentgl && obj.gltype == 'L');
            oData = oData.replaceFor({parentgl: 'E'}, obj => !obj.parentgl && obj.gltype == 'E');

            let deleteMainCats = false;
            if (!oData.find(obj => this.Sublib.inList(obj.glcodesid, 'A', 'L', 'E'))){
                // This is purely for formatting / letting them choose asset / liability / equity. Have to strip off when we go to save if they save it under a 'root' (i.e. just Assets, not current assets)
                oData.appendBlank({glcodesid: 'A', descript: this.Sublib.getLbl('assets'), parentgl: '', gltype: 'A' });
                oData.appendBlank({glcodesid: 'L', descript: this.Sublib.getLbl('liabilities'), parentgl: '', gltype: 'L' });
                oData.appendBlank({glcodesid: 'E', descript: this.Sublib.getLbl('equity'), parentgl: '', gltype: 'E' });
                deleteMainCats = true;
            }

            this.items2Use = this.Sublib.popGLHiearchy(oData);
            if (this.items2Use.length < this.items.length || (deleteMainCats && this.items2Use.length == 3)){
                // Parents weren't around, just use what we have
                this.items2Use = this.items;
            }

            if (deleteMainCats){
                this.items2Use.deleteFor(obj => this.Sublib.inList(obj.glcodesid, 'A', 'L', 'E', true));
                this.items2Use.replaceFor({levelsdeep: '$$levelsdeep -1'}, true);
            }
        }, //  setItems2Use


        // //**************************************************************************************************************
        // // List the GLs in order of hiearchy & how many levels deep they are
        // popGLHiearchy(oData, parentId, levelsDeep){
        //     // oData = Array of object we are playing with
        //     // parentId = Char. Optional. ParentId we are trying to get all kids for
        //     // levelsDeep = Numeric. Number deep we are in this crazy recursive stuff

        //     if (!parentId) parentId = '';
        //     if (!levelsDeep) levelsDeep = 0;

        //     let oGLs = [], oGLsHold;
        //     let tab = '\u0009 ';
            
        //     for (var mx = 0; mx < oData.length; mx++){
        //         if (oData[mx].parentgl != parentId) continue;
                    
        //         oData[mx].levelsdeep = levelsDeep
        //         oGLs.push(oData[mx]);
        //         // Try to get all of the kids
        //         oGLsHold = this.popGLHiearchy(oData, oData[mx].glcodesid, levelsDeep+1); // recursive call
        //         oGLs.appendFrom(oGLsHold);
        //     } // for

        //     return oGLs
        // }, // popGLHiearchy


        


    } // methods
} // export default
</script>

<!-------------------------------------------------------------------------------------------------------------------------------------------------->
<style scoped>
/* Have to do this so it doesn't reserve a bunch of dead space for longer labels and force 2 lines */
/* >>>.v-select__selections input { display:none } */
</style>