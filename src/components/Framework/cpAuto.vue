<template>
    <v-autocomplete
        v-bind="$attrs"
        v-model="selectVal"
        ref="autoComplete"
        :value="desc"
        :search-input.sync="search"
        :items="items"
        :item-text="desc || itemText"
        :item-value="code || itemValue"
        :label="txtLabel"
        auto-select-first
        cache-items
        :hide-selected="hideSelected"
        :clearable="txtClearable"
        :placeholder="txtPlaceholder"
        :rules="rules"
        :autofocus="txtAutofocus"
        :readonly="txtReadonly"
        :disabled="txtDisabled"
        :color="color2use"
        :loading="loading"
        :multiple="txtMultiple"
        :outlined="txtOutlined"
        :chips="chips"
        :small-chips="chips"
        :deletable-chips="chips"
        hide-no-data
        hide-details
        :return-object="retObj"
        :loader-height="loaderHeight"
        menu-props="auto"
        :filter="txtFilterFunc"
        @focus="onFocus"       
        @focus.native="onFocus" 
        @focus.capture.native="onFocus"
        @blur="onBlur"

        @input="selectVal ? forceLoseFocus() : ''"
        
        v-on="$listeners"

        style="padding-top:4px;"
    >

    <!-- NOTE: All of the focus listeners are required or it doesn't fire in every scenario. Crazy! -->

     <!-- @blur="onBlur()"
        @focus="onFocus()" -->
        <!-- @click.native="() => { !hasFocus ? focusFrom = 'click': ''; hasFocus = true; }"
        @keydown="() => { !hasFocus ? focusFrom = 'keypress': ''; hasFocus = true; }" -->

        <template slot="item" slot-scope="{ active, item, attrs, on }">
            <v-list-item v-on="on" v-bind="attrs" #default="{ active }" :disabled="disabledVal && !item[disabledVal]">
                <v-list-item-action style="margin: 0px; padding-right: 5px;">
                    <cp-check :value="active" :disabled="disabledVal && !item[disabledVal]"></cp-check>
                </v-list-item-action>

                <v-list-item-content>
                    <v-list-item-title>
                        <v-row no-gutters align="center">
                            <span>{{ item[desc]}}</span>
                            <v-chip v-if="disabledVal && !item[disabledVal]" small style="margin-left: 10px;">{{ !item[disabledVal] ? disabledLbl : '' }}</v-chip>
                        </v-row>
                    </v-list-item-title>
                </v-list-item-content>
            </v-list-item>
        </template>

         <!-- Forward all other slots -->
        <template
            v-for="(_, slot) of $scopedSlots"
            v-slot:[slot]="scope"
            >
            <slot :name="slot" v-bind="scope" />
        </template>
    </v-autocomplete>
</template>
<script>
export default {
    name: 'cp-auto',
    data: () => ({
        // selectVal: '',
        search: '',
        updtFromParent: false,
        hasFocus: false,
        focusFrom: '',
    }),
    props: [
        // these can be passed in, the 'data' stuff can't
        'value', // bound through v-model
        'disabled', // vuejs prop
        'label', // vuejs prop
        'placeholder', // vuejs prop
        'readonly', // vuejs prop
        'rules', // vuejs prop
        'clearable', // vuejs prop
        'loading', // vuejs prop
        'autofocus', // vuejs prop
        'items', // vuejs prop
        'desc', // the field to show on the autocomplete
        'code', // the field to return
        'disabledVal', //the field in the array that is disabled
        'disabledLbl', //label to show why the select is disabled
        'hideSelected',
        'multiple',  // allow multiple selections
        'outlined', 
        'retObj',
        'itemText', //to make it so it is backward compatible
        'itemValue', //to make it so it is backward compatible
        'menuProps', //to make it so it is backward compatible
        'loaderHeight', //to make it so it is backward compatible
        'filterFunc',
        'chips',
        'scrollToText', // char. Optional. If passed, tries to scroll to this part of the drop down if no value has been selected yet. SRR 09/27/2023
    ],
    computed: {
        txtClearable: function(){
            return (this.clearable || typeof this.clearable == 'string') ? true : false;
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
        txtPlaceholder: function(){
            return this.placeholder ? this.placeholder : this.Sublib.getLbl('start typing')
        },
        txtMultiple: function(){
            return (this.multiple || typeof this.multiple == 'string') ? true : false;
        },
        txtOutlined: function(){
            return (this.outlined || typeof this.outlined == 'string') ? true : false;
        },
        txtFilterFunc: function(){
            // This is how it 'filters' as you type. 
            let dfltFunc = function(item, filterStr, itemText) {
                return this.Sublib.contains(this.Sublib.killPunctuation(itemText, true), this.Sublib.killPunctuation(filterStr, true)); // make it a more forgiving search
            }
            return this.filterFunc || dfltFunc
        }


        //  v-on="$listeners" fixed this issue MA 06/21/2023
        // selectVal: {
        //     get() { return this.value },
        //     set(val) {
        //         if (!this.updtFromParent) {
        //             this.$emit('change', val) //this will update the value prop on the parent as well MA 05/31/2023
        //         }   
        //     }
        // }
    }, // computed
    watch: {
        value: async function(){
            // updated from the parent
            // this.updtFromParent = true; // set for watcher
            this.selectVal = this.value; 

            await this.$nextTick();
            await this.$forceUpdate();

            // this.updtFromParent = false; 

        },
        // selectVal: function(){
        //     if (!this.updtFromParent){
        //         this.$emit('change', this.selectVal);
        //     }
        //     this.updtFromParent = false;
        // }
        // focusFrom: function(){
        //     debugger
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


        // this.updtFromParent = true; // don't want our wather to fire
        this.selectVal = this.value;

        await this.$nextTick();
        await this.$forceUpdate();

        // this.updtFromParent = false; 

        // if(!this.helpIcon && (this.helpUrl || this.helpMsg)){
        //     //default to info icon
        //     this.btnHelpIcon = this.Sublib.getIcon('info');
        // }else{
        //     this.btnHelpIcon = this.helpIcon;
        // }

    }, // created

    async mounted(){
        if(this.txtAutofocus){
            var el = this.$refs.autoComplete
            if(!el){
                //sleep for 1 second and try again
                await this.Sublib.sleep(1000);
                el = this.$refs.autoComplete

                await this.$nextTick()
                el.focus();
            }else{
                await this.$nextTick()
                el.focus();
            }
        }
    },

    methods: {

        //********************************************************************
        // Make it so on the gotFocus we highlight what they had previously selected and they can just start typing so it fills more like a textbox
        // the Vuetify stuff shows a fancy <span> and has almost an invisible <input />. 
        async onFocus(event){

            let oSpan = this.$refs.autoComplete.$el.querySelectorAll('.auto-comp-text-truncate');

            if (oSpan && oSpan[0]){
                let origText = oSpan[0].textContent.trim();
                //oSpan[0].parentNode.removeChild(oSpan[0]); // delete the span display placeHolder

                // Couldn't quite get this to work how I wanted (worked with a click event but it felt really slow but didn't work with tabbing into the field). SRR 09/12/2023
                // if (!this.hasFocus && !this.focusFrom){
                //     //event.preventDefault();
                //     await this.Sublib.sleep(.0001*1000); // give time for the click or keypress events to fire
                //     // await this.$nextTick(); // give time for the click event to fire
                //     // await this.$forceUpdate();

                //     if (!this.hasFocus){
                //         this.hasFocus = true;
                //         this.focusFrom = 'browser'; // from autofocus or something like that
                //     } 
                // }

                // console.log(this.focusFrom)

                // if (this.focusFrom != 'browser'){
                    oSpan[0].style.display = 'none'; // don't show it. Works better than deleting it
                    this.search = origText;

                    this.Sublib.select_dropDown(this.$refs.autoComplete);
                    await this.$nextTick();
                    await this.$forceUpdate();   
                // }

                this.Sublib.setFocus(this.$refs.autoComplete, true);

                let oInput = this.$refs.autoComplete.$el.querySelectorAll('input');
                //oInput[0].classList.add('v-input--is-label-active'); 
                oInput[0].classList.add('v-input--is-dirty');


                try {
                    // Force it to show all items in the drop down, it may be 'filtered' from previous typing
                    // NOTE: vue DOES NOT like us doing this as it's a computed property (or prop) but I can't figure out what else to set. SRR 09/26/2023
                    // this.$refs.autoComplete.internalSerach = '';
                    // //this.$refs.autoComplete.searchInput = ''
                    // this.$refs.autoComplete.filteredItems = this.$refs.autoComplete.allItems;
                    // this.$refs.autoComplete.computedItems = this.$refs.autoComplete.allItems;

                    this.$refs.autoComplete.noFilter = true;
                    // await this.Sublib.sleep(.1*1000);
                    // this.$refs.autoComplete.noFilter = false;

                } catch (ignore){
                }


            } else {
                if (!this.selectVal && this.scrollToText){
                    // scroll down to the specific section we want (i.e. expenses in GL Codes)
                    await this.Sublib.sleep(.5*1000)
                    try {
                        let oMenuParentHold = document.getElementsByClassName('v-menu__content');
                        let oMenuParent;
                        let offSet = 0;
                        for (var mx = 0; mx < oMenuParentHold.length; mx++){
                            if (oMenuParentHold[mx].checkVisibility()){
                                // Visible. This is the one we want
                                oMenuParent = oMenuParentHold[mx];
                                let oDimen = oMenuParent.getBoundingClientRect();
                                offSet = oDimen.top - 35; // + oDimen.height; // have to go 'crazy' big and say how far below the main page it is
                                break;
                            }
                        } // for  

                        if (oMenuParent){
                            let oMenu = oMenuParent.getElementsByClassName('v-list')[0].childNodes;
                            //this.scrollToText = '\nequity'
                            
                            for (mx = 0; mx < oMenu.length; mx++){
                                // NOTE: oMenu[mx] is an 'element'
                                if (this.Sublib.contains(oMenu[mx].innerText, this.scrollToText, true)){
                                    this.Sublib.scrollTo(oMenu[mx], offSet, oMenuParent);
                                    break;
                                }
                            } // for
                        } // if (oMenuParent)

                    } catch(ignore){
                        //console.log(ignore)      
                    }
                }
            }
            
            this.$emit('focus', event); // pass it on
        },


        //********************************************************************
        // Make sure the span is visible with the display place holder
        onBlur(event){

            this.hasFocus = false;
            this.focusFrom = '';

            let oSpan = this.$refs.autoComplete.$el.querySelectorAll('.auto-comp-text-truncate');
            if (oSpan && oSpan[0]){
                oSpan[0].style.display = ''; // make it visible again since we hid on the got focus
            }

            

            this.$emit('blur', event); // pass it on

           
        },

        // onInput(){
        //     this.$emit('input', this.txtVal);
        // },
        // onChange(){
        //     this.search = '';
        //     this.$emit('change', this.selectVal);
        // }       


        //**************************************************************************************************************
        // Force tab to lose focus on the auto complete
        async forceLoseFocus(){     
            // let tabEvent = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 9, code: 9, charCode: 9 });
            // this.$refs[this.refId].$el.dispatchEvent(tabEvent);

            if (this.multiple) return;

            await this.Sublib.sleep(.1*1000);
            // // this.$refs[this.refId].$el.blur();

            // // Call 'tab' again so the thing actually loses focus. 

            // let tabEvent = new KeyboardEvent("keydown", {
            //     key: "tab",
            //     keyCode: 9, // example values.
            //     //code: "KeyE", // put everything you need in this object.
            //     which: 9,
            //     shiftKey: false, // you don't need to include values
            //     ctrlKey: false,  // if you aren't going to use them.
            //     metaKey: false   // these are here for example's sake.
            // });

            // this.$refs[this.refId].$el.dispatchEvent(tabEvent);

             //add all elements we want to include in our selection


              // force another 'tab' (really focus the next element)         
            var focussableElements = 'a:not([disabled]), button:not([disabled]), input[type=text]:not([disabled]), [tabindex]:not([disabled]):not([tabindex="-1"])';
            if (document.activeElement) {
                var focussable = Array.prototype.filter.call(document.querySelectorAll(focussableElements),
                function (element) {
                    //check for visibility while always include the current activeElement 
                    return element.offsetWidth > 0 || element.offsetHeight > 0 || element === document.activeElement
                });
                var index = focussable.indexOf(document.activeElement);
                if(index > -1) {
                    let origIndex = index;
                    while (true){
                        var nextElement = focussable[index + 1] || focussable[0];

                        if (nextElement.tabIndex == -1){
                            index++;
                            if (index > focussable.length){
                                index = 0;
                            }
                            if (index == origIndex){
                                break;
                            } else {
                                continue;
                            }
                        }
                            
                        try {
                            nextElement.focus();
                            nextElement.select(); // highlight it
                        } catch (ignore){
                        }
                        break;
                    } // while
                    
                } // if index > -1       
            } // document.activeElement
            
            


        }, // forceLoseFocus

    } // methods
} // export default
</script>
<style scoped>
</style>