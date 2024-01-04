<template>

    <!-- DevExtrme / DevExpress dat table. Virtual scrolling, awesome.  ************************************************************************************************************************** -->
    <!-- Refer to docs: https://js.devexpress.com/Vue/Documentation/23_1/Guide/Vue_Components/DevExtreme_Vue_Components/ -->
    <div v-resize="() => {maxHeight = this.Sublib.calcTableMaxHeight(dataTableId) }">
        <DxDataGrid
            :id="dataTableId"
            :ref="dataGridRefKey"

            :customize-columns="customizeColumns"

            :data-source="items"
            :key-expr="itemKey2Use"

            :column-auto-width="true"
            :allow-column-reordering="!colDragDisabled"
            :allow-column-resizing="true"
            column-resizing-mode="widget"

            :dark="true"

            :show-borders="true"
            :column-min-width="100"

            page-size="100"

            @content-ready="onContentReady"
          

            :showColumnLines = "true"
            :showRowLines = "true"
            :word-wrap-enabled = "true"

            :no-data-text="loading ? '' : Sublib.getLbl('no results found')"

            :background-color="$vuetify.theme.isDark ? '#303030' : 'white'"
            :style="{'min-width': '100%', 'max-height': maxHeight}"
            :height="maxHeight || 200"

            
            @rowDblClick="rowDblClick($event.event, $event.data)"
            @dxclick="rowClick($event.event, $event.data)"
            @dxcontextmenu="rowRightClick($event.event, $event.data)"

            :disable-pagination="true"

            :repaint-changes-only="true"

            v-bind="$attrs"
            v-on="$listeners"
            >
            <!-- 
              @initialized="onInitialized"
            @cell-prepared="onCellPrepared"    
            @focusedCellChanging="onFocusedCellChanging"
            @focusedCellChanged="onFocusedCellChanged"
            @saving="onSaving"
            @saved="onSaved"
            @key-down="onKeyDown" -->
            
            <!-- @rowDblClick="(e) => {$emit('dblclick', e.data)}" -->
            <!-- @cell-prepared="onCellPrepared" -->

                <DxColumn v-for="header in oDataHeaders" :key="header.value"
                    :width="header.width"
                    :min-width="parseInt(header.width, 10)"
                    :data-field="header.value"
                    :caption="header.text"
                    :alignment="header.align || 'center'"
                    :allow-sorting="header.sortable"
                    :allow-fixing="header.fixed"
                    :fixed-position="header.fixed ? 'right' : ''"
                    :allow-reordering="header.reorderable"
                    :allow-resizing="header.resizable"
                    :cell-template="getTemplateName(header)"
                    :allow-filtering="header.sortable"
                    :show-in-column-chooser="header.showInColumnChooser"
                    :fixed="header.fixed"
                    :show-editor-always="header.editInPlace"
                    :edit-cell-template="header.editInPlace ? getTemplateName(header) : ''"
                    :allow-editing="false"
                    >   
                </DxColumn>
                
                <template v-for="header in oDataHeaders" v-slot:[header.value]="{ data }">

                    <span v-if="header.date" :key="header.value"> 
                        {{Sublib.obviousDt(data.data[header.value], true, false, true)}}
                    </span>

                    <span v-else-if="header.datetime" :key="header.value"> 
                        <v-flex>
                            <div>{{Sublib.obviousDt(data.data[header.value], true, false, true)}}</div>
                            {{Sublib.AmPm(Sublib.milTime(data.data[header.value]))}}
                        </v-flex>
                    </span>

                    <span v-else-if="header.int" :key="header.value">
                        {{Sublib.applyInputMask(data.data[header.value], '#,###,###')}}
                    </span>
                    <span v-else-if="header.number" :key="header.value">
                        {{Sublib.applyInputMask(data.data[header.value], '#,###,###.##')}}
                    </span>

                    <span v-else-if="header.currency" :key="header.value">
                        {{Sublib.formatCurrency(data.data[header.value])}}
                    </span>


                    <span v-else-if="header.check" :key="header.value">
                        <cp-check
                            v-model="data.data[header.value]"
                            style="max-height: 20px; max-width: 20px; margin: 0 auto; padding: 0;"
                            :disabled='!header.editable'
                            color="primary"
                        ></cp-check>
                    </span>

                    <span v-else-if="header.phone" :key="header.value">
                        <cp-phone-num :number="data.data[header.value]" :showTexting="false" :showPhone="false" ></cp-phone-num>
                    </span>

                    <span v-else-if="header.avatar" :key="header.value">
                        <v-avatar
                            size="40"
                            >
                                <!-- <cp-selfie
                                    :picUrl="data.data[header.value]"
                                    :imgFilesId="data.data['selfpic']"
                                >
                                </cp-selfie> -->
                        </v-avatar>
                    </span>

                    <span v-else-if="header.trimZeros" :key="header.value">
                        {{Sublib.trimZeros(data.data[header.value], 5)}}
                    </span>

                    <span v-else :key="header.value">
                        {{data.data[header.value]}}
                    </span>

                </template>

                <template v-for="(_, name) in $scopedSlots" v-slot:[name]="{ data }">
                    <slot :name="name" :item="data.data"></slot>
                </template>

                <!-- <template
                    v-for="(_, slot) of $scopedSlots"
                    v-slot:[slot]="scope"
                    >
                    <slot :name="slot" v-bind="scope"/>
                </template> -->

                <!-- <slot />
                <template #name="{ data }">
                    <slot name="name" v-bind:data="data" />
                </template> -->

            <!-- <DxSummary>
                <DxTotalItem
                    :column="itemKey"
                    summary-type="count"
                    :display-format="Sublib.getLbl('count') + ': {0}'"
                />
            </DxSummary> -->

            <!-- loading panel -->
            <DxLoadPanel :enabled="(typeof loading == 'boolean' ? loading: true)"
                        :showPane="(typeof loading == 'boolean' ? loading: true)" 
                />

            <!-- scrolling panel -->
            <DxScrolling
                :mode="renderAll ? 'standard' : 'virtual'"
                :rowRenderingMode="renderAll ? 'standard' : 'virtual'"
                :columnRenderingMode="renderAll ? 'standard' : 'virtual'"
                :preloadEnabled="true"
                :useNative="(Sublib.isMac() || Sublib.isIOS()) ? false : true"
                :disable-pagination="true"
                :pagination-enabled="false"
                show-scrollbar="always"
            />
                <!-- :renderAsync="false" -->

            <DxPaging :page-size="5000"/>
            <DxPager
                :visible="false"
                :show-navigation-buttons="false"
            />

            <!-- soring on headers -->
            <DxSorting mode="single"/>

            <!-- column picker -->
            <DxColumnChooser 
                :enabled="hasActionBtn && !colPickDisabled ? true : false"
                mode="select"
            >
                <DxPosition
                    my="right top"
                    at="right bottom"
                    of=".dx-datagrid-column-chooser-button"
                />

                <DxColumnChooserSearch
                    :enabled="true"
                    :editor-options="{placeholder: Sublib.getLbl('column')}"
                />
                <DxColumnChooserSelection
                    :allow-select-all="false"
                    :select-by-click="true"
                    :recursive="false"
                />
            </DxColumnChooser>

            <!-- column resizing -->
            <DxColumnFixing :enabled="true"/>

            <!-- state storing -->
            <DxStateStoring
                :enabled="((typeof saveGridInfo != 'boolean' || saveGridInfo) && name) ? true : false"
                type="sessionStorage"
                :storage-key="'cpDataTableState-' + (name ? name : '')"
            />
            <DxKeyboardNavigation
                :edit-on-key-press="true"
                :enter-key-action="'moveFocus'"
                :enter-key-direction="'row'"
            />

            <!-- <DxEditing
             Do this or control loses focus as soon as the v-model value updates
                DO NOT set mode='cell' or it starts intercepting stuff. Set allow-___ to false for all to hide their edit button
            <DxEditing
                :allow-updating="false"
                :allow-deleting="false"
                :allow-adding="false"
                mode="row"  
                start-edit-action="none"
            />     -->

        </DxDataGrid>
    </div>
    

</template>
<script>

 import {
    DxDataGrid, DxScrolling, DxSorting, DxLoadPanel,
    DxColumn, DxColumnChooser, DxColumnFixing, DxStateStoring, DxSummary, DxTotalItem, DxPosition, DxButton, 
    DxColumnChooserSearch, DxColumnChooserSelection, DxPager, DxPaging, DxFilterRow, DxHeaderFilter, DxSearch,
    DxExport, DxKeyboardNavigation, DxEditing
} from 'devextreme-vue/data-grid';

export default {
    name: 'cp-data-table',
    data: () => ({
        updtFromParent: false,
        formatValue: '',
        oDataHeaders: [],
        selected: [],  //this will keep track of selected items

        start: 0,
        timeout: null,
        rowHeight: 10,
        perPage: 18,
        dataTableId: '',
        maxHeight: '',
        minHeight: '',
        items2Show: [], // updated as we control the 'pagination'

        scrollWatcherSet: false,

        tableWidth: '100vw',
        cardWidth: '100vw',

        dataGridRefKey: 'dataGridRef',
        prevFocusedCell: new Set(),
    }),
    props: [
        // these can be passed in, the 'data' stuff can't
        'headers', //the headers for the table
        'items', //the items for the table
        'itemsPerPage', // vuejs prop
        'dense', // vuejs prop
        'loading', // vuejs prop
        'loadingText', // vuejs prop
        'hideDefaultFooter', // vuejs prop
        'hideDefaultHeader', // vuejs prop
        'showSelect',
        'selectFld',
        'singleSelect',
        'itemKey', 
        
        //'style', // can't pass style (key word), using 'styles' instead
        'styles',
        'id',
        'itemClass', // style individual 'items',
        'noDfltActionColor', // color of the action buttons (i.e. edit, delete, etc.)
        'itemHeight',
        'linesPerRow', // calcs or passed in
        'noRecycleScroller', // Boolean. If true, don't use the recycle scroller. This is mostly for testing purposes. SRR 12/04/2023
        'width', // String. i.e. '100%' or '500px'
        'useNewDt',
        'name', //string. Used to identify the table for saving the state
        'renderAll', //Boolean. If true, it will render all the rows at once.
        'colDragDisabled', //Boolean. If true, it will disable the column drag and drop
        'colPickDisabled', //Boolean. If true, it will disable the column picker
        'saveGridInfo', // Logical. Optional (defaults to true) if true, saves out how they want the grid to look. Must also pass 'name' prop to save SRR 12/14/2023
    ],

    components: {
        DxDataGrid,
        DxScrolling,
        DxSorting,
        DxLoadPanel,
        DxColumn,
        DxColumnChooser,
        DxColumnFixing,
        DxStateStoring,
        DxSummary,
        DxTotalItem,
        DxPosition,
        DxButton, 
        DxColumnChooserSearch,
        DxColumnChooserSelection,
        DxPager,
        DxPaging,
        DxFilterRow,
        DxHeaderFilter,
        DxSearch,
        DxExport,
        DxKeyboardNavigation,
        DxEditing,
    },

    // **************************************************************************************************************
    computed: {
        itemKey2Use: function(){
            let retval = '';
            if (this.itemKey && !this.items.length){
                retval = this.itemKey;

            } else if (this.itemKey && this.items.length > 0 && this.items[0][this.itemKey]){
                retval = this.itemKey

            } else if (this.items.length > 0){  
                // see if there is an 'id' field in the data.
                let oKeys = Object.keys(this.items[0]);
                for (var mx = 0; mx < oKeys.length; mx++){
                    if (this.Sublib.right(oKeys[mx], 2).toLowerCase() == 'id'){
                        retval = oKeys[mx];
                        break;
                    }
                } // for
            }

            return retval;
        },
        dataHideDfltFooter: function(){
            if(this.hideDefaultFooter === true || this.hideDefaultFooter === false){
                return this.hideDefaultFooter;
            }
            else if(typeof this.hideDefaultFooter == 'string'){
                return true;
            }
            else{
                return true;  //hide by default
            }
            // return (this.hideDefaultFooter || typeof this.hideDefaultFooter == 'string') ? true : false;
        },
        dataHideDfltHeader: function(){
            return (this.hideDefaultHeader || typeof this.hideDefaultHeader == 'string') ? true : false;
        },
        dataItemsPerPage: function(){
            return this.itemsPerPage ? this.itemsPerPage : -1; // -1 means all
        },
        dataDense: function(){
            return (this.dense || typeof this.dense == 'string') ? true : false;
        },
        txtDark: function(){
            return (this.dark || typeof this.dark == 'string') ? true : this.$vuetify.theme.isDark;
        },
        txtLight: function(){
            return (this.light || typeof this.light == 'string') ? true : !this.$vuetify.theme.isDark;
        },
        hasActionBtn: function(){
            return this.headers.length > 0 && this.headers[this.headers.length-1].value == 'action' ? true : false;
        },
        oStyle: function(){
            let maxHeight = this.maxHeight;
            if (!maxHeight)
                maxHeight = '';

            let oDflts = {
                'max-height': maxHeight,
                'min-height': this.minHeight || '',
                'overflow-y':'auto'
            }
            if (this.styles){
                return {...oDflts, ...this.styles}
            } else {
                return oDflts
            }
        },
        linesPerRowComputed: function(){
            let retval;
            if (this.linesPerRow){
                retval = this.linesPerRow;

            } else if (this.headers.find(obj => obj.datetime)){
                retval = 2;
                
            } else {
                retval = 1;
            }
            return retval;
        },
        itemHeight2Use: function(){
            let retval;
            if (this.itemHeight){
                retval = this.itemHeight;
            } else{
                retval = 32 + ((this.linesPerRowComputed -1) * 6);
            }
            return retval;
        },
                    
       
    }, // computed

      //**************************************************************************************************************
    watch: { 
        items: async function(){

            // force it to recalc max height
            this.maxHeight = this.Sublib.calcTableMaxHeight(this.dataTableId);
        }, // items
    }, // watch

    

    // **************************************************************************************************************
    async created(){           

        this.dataTableId = this.id || 'cpDataTable-' + this.Sublib.right(String(Math.random()), 5);

        //if sortable is not set in headers, set it to true in oDataHeaders
        this.oDataHeaders = this.headers.map((header) => {
            if (header.sortable == undefined){
                header.sortable = true;
            }

            //auto figures out word wrapping based on the length of the text
            if(this.Sublib.contains(header.text, '\\n')){
                header.text = header.text.replaceAll(/\\n/g, '\n');
            }

            if(header.check){
                header.align = 'center';
            }else if(header.number || header.currency){
                header.align = 'end';
            }else if(!header.align){
                header.align = 'start';
            }

            if(!header.width){
                header.width = '100px'; //min width
                if (header.check){
                    header.width = '60px'; // min-width
                } else {
                    header.width = '100px'; //min width
                }
            }

            if(header.value == 'action'){
                header.fixed = true;
                header.width = header.width && header.width != '50px' ? header.width : '75px';  //increase the width of the action column

                //by default, this value is true but in this case we want to hide it in the column chooser
                header.showInColumnChooser = false; //this will hide the action column in the column chooser
            }

            if(header.bold){
                //this is not working for now MA 12/14/2023
                // https://js.devexpress.com/Vue/Documentation/17_2/Guide/Widgets/datagrid/Columns/Customize_Cells/
                header.template = 'bold-font'
                header.styles = 'font-weight: bold; font-size: 17px;'

                header.cellTemplate = function(element, info) {
                    element.append("<div>"  + "</div>")
                            .css("color", "red");
                }

            }


            if(header.trimZeros){
                header.align = 'center';
            }

            return header;
        });


    }, // created
    

    // **************************************************************************************************************
    async mounted(){

        await this.Sublib.sleep(500) // wait for the table to render

        await this.$nextTick();
        await this.$forceUpdate();
        

        let boldHeaders = [];
        for (let i = 0; i < this.oDataHeaders.length; i++) {
            if (this.oDataHeaders[i].bold) {
                boldHeaders.push(i);
            }
        }

        boldHeaders = boldHeaders.join(',')

        var headers = document.querySelectorAll('table th');

        //force refresh
        await this.$nextTick();
        await this.$forceUpdate();

        this.maxHeight = this.Sublib.calcTableMaxHeight(this.dataTableId);

        //calculate the height so that it will show no results found in the middle of the table
        //get the table header height
        let tableHeaderHeight = (headers[0] ? headers[0].getBoundingClientRect().height : 48);
        this.minHeight = tableHeaderHeight + 60 + 'px';

        var tableHeaderEl = document.getElementById('tableHeader');

        if(tableHeaderEl){
            //get the width of the table header
            var tableHeaderWidth = tableHeaderEl.getBoundingClientRect().width;
        }

        if(this.width){
            this.tableWidth = this.width;
            this.cardWidth = this.width - 10;
        }else{
            this.tableWidth = tableHeaderWidth ? (tableHeaderWidth + 40) : '100vw';
    
            this.cardWidth = tableHeaderWidth ? (tableHeaderWidth + 40) : '100vw';
        }

        //force refresh
        await this.$nextTick();
        await this.$forceUpdate();

        // this.changeTheme();
    }, //mounted

    // **************************************************************************************************************
    methods: {
        onContentReady(e){
            if (typeof this.loading != 'boolean'){
                e.component.option('loadPanel.enabled', false);
            }
            this.$emit('content-ready', e);
            // console.log('onContentReady', e);
        },

        customizeColumns(columns){
            // console.log('customizeColumns', columns);
            if(!columns || columns.length == 0){
                return;
            }
            // columns[0].width = 70;
        },

        // **************************************************************************************************************

        getTemplateName(header){
            if(header.date){
                return header.value;
            }else if(header.datetime){
                return header.value;
            }else if(header.int){
                return header.value;
            }else if(header.number){
                return header.value;
            }else if(header.currency){
                return header.value;
            }else if(header.format){
                return header.value;
            }else if(header.check){
                return header.value;
            }else if(header.phone){
                return header.value;
            }else if(header.avatar){
                return header.value;
            }else if(header.value == 'action' || header.action){
                return header.value;
            }else if(header.trimZeros){
                return header.value;
            }else{
                // Access the scopedSlots object
                const scopedSlots = this.$scopedSlots;

                // Iterate through the scoped slots
                for (const slotName in scopedSlots) {
                    // console.log(`Scoped Slot '${slotName}'`);
                    if(header.value == slotName){
                        return slotName;
                    }
              
                }

                return '';
            }
        },


        // **************************************************************************************************************
        rowClick(event, value) {
            this.$emit('click', value);

            //when they click, just be nice and select the row
            if(this.showSelect && this.selectFld && this.items.length > 0){
                this.selected.push(value);
                this.handleSelect();
            }
            this.highlightClickedRow(event);
        },

        // **************************************************************************************************************
        rowDblClick(event, value) {
            // console.log('rowDblClick', event);
            //console.log(event)
            this.$emit('dblclick', value, event);
            this.highlightClickedRow(event);
        },

        // **************************************************************************************************************
        rowRightClick(event, value) {
            event.preventDefault(); // stop the default context menu from showing
            // console.log('rowRightClick', value);

            this.$emit('contextmenu', value);
            this.highlightClickedRow(event);
        },

        // **************************************************************************************************************
        async handleSelect() {
            await this.$nextTick();
            await this.$forceUpdate();

            this.$emit('selected', this.selected);
        },

        // **************************************************************************************************************
        async handleSelectAll() {
            await this.$nextTick();
            await this.$forceUpdate();

            this.$emit('selected', this.selected);
        },
        
        //**************************************************************************************************************
        // This is primarily designed to be called from the parent page to force this to recalc it's max height
        calcMaxHeight(tableTopSet){
            // tableTopSet = Logical. If true, assume the table top is already where it's supposed to go and assume the area above it is off limits
            
            this.maxHeight = this.Sublib.calcTableMaxHeight(this.dataTableId, tableTopSet);
        }, // calcMaxHeight

        //**************************************************************************************************************
        // Blank out the max size so stuff can render on the screen and then call calcMaxHeight again when done
        // This is mostly called by a parent when there are 2 data tables with changes (i.e. the bank register screen)
        clearMaxHeight(){
            this.maxHeight = 0;
        }, // clearMaxHeight

      

    } // methods
} // export default
</script>



<!-------------------------------------------------------------------------------------------------------------------------------------------------->
<style scoped>


/* .v-data-table--fixed-header .v-data-table__wrapper {
  overflow-y: auto;
} */


.cpDataTable {
  width: 100%;
  border-spacing: 0;
  overflow-y: hidden;
}
.cpDataTable td, .cpDataTable th {
  padding: 0 16px;
}
.cpDataTable th {
  -webkit-user-select: none;
     -moz-user-select: none;
      -ms-user-select: none;
          user-select: none;
  font-size: 12px;
  height: 48px;
}

.cpDataTable thead th {
  border-bottom: 0px !important;
  position: -webkit-sticky;
  position: sticky;
  top: 0;
  z-index: 2;
}
.cpDataTable thead tr:nth-child(2) th {
  top: 48px;
}
/* .v-application--is-ltr .v-data-table--fixed-header .v-data-footer {
  margin-right: 17px;
}
.v-application--is-rtl .v-data-table--fixed-header .v-data-footer {
  margin-left: 17px;
} */





/* This sets the fixed header */
.v-data-table /deep/ .v-data-table__wrapper {
    overflow: unset;
}

/* Center all headers */
>>>.v-data-table-header th { text-align: center !important }

/* This is how we do the sticky column */
/* >>>table > tbody > tr > td:nth-child(2), 
>>>table > thead > tr > th:nth-child(2) {
    position: sticky !important; 
    left: 0; 
    z-index: 2;
    background: #424242;
}

>>>table > thead > tr > th:nth-child(2) {
    z-index: 3;
} */


/* This is how we do the sticky column */
/* >>>.stickyCol table > tbody > tr > td, 
>>>.stickyCol table > thead > tr > th {
    position: sticky !important; 
    left: 0; 
    z-index: 2;
    background: #424242;
}

>>>table > thead > tr > th:nth-child(2) {
    z-index: 3;
} */


/* This will set the sticky column to the last column: */
/* >>>table th:last-child,
>>>table td:last-child {
    position: sticky;
    right: 0;
    z-index: 2;
    background: #424242;
}

>>>table > thead > tr > th:last-child {
    z-index: 3;
} */

/* Making the first column cursor pointer so they think they can click and select */
/* >>>table th:nth-child(2),
>>>table td:nth-child(2) {
    cursor: pointer;
} */

>>>v-input--checkbox > div{
    margin-top: 0px !important;
}

 /* >>>table > tbody > tr > td{
    border-right: solid 1px grey;
 }  */


/* assign txt center to all text in headers */
>>>table > thead > tr > th{
    line-height: 0.8rem;
    z-index: 3;
}


>>>.v-data-table-header tr th {
    text-align: center !important;
}


  /* >>>table > thead > tr > th{
    border-right: solid 1px grey;
    padding: 0 5px;
    background-color: #dedcdc !important;
  }

>>>table > thead > tr > th span{
    color: black;
  } */


>>>.v-data-table__empty-wrapper td{
    position: absolute;
    margin-top: 15px;
    margin-left: 20px;
    border-right: none;
}

>>> .vue-recycle-scroller__item-view > tr > td {
    border-bottom: 1px solid grey;
}

>>> .vue-recycle-scroller__item-view > tr > td {
    border-right: 1px solid grey;
    vertical-align: middle;
}

>>> .vue-recycle-scroller__item-view > tr > td > span, >>>.vue-recycle-scroller__item-view > tr > td > div{
    white-space: nowrap !important;
    text-overflow: ellipsis !important;
    display: block;
    overflow: hidden;
}

>>> .vue-recycle-scroller__item-view {
}



.v-application .text-start
{
    text-align: start !important;
}
.border-bottom-grey{
    border-bottom: 1px solid grey;
}

.border-top-grey{
    border-top: 1px solid grey;
}

>>>.dx-button-mode-contained{
    text-align: center !important;
    padding: 0;
}

>>>.dx-toolbar-text-auto-hide .dx-button .dx-button-content{
    z-index: 5 !important;
    margin-right: 30px;
}

>>>.dx-datagrid-borders>.dx-datagrid-header-panel{
    display: hidden !important;
    max-height: 0px !important;
}

.dx-datagrid .dx-scrollable-scrollbar.dx-scrollbar-vertical,  
.dx-datagrid .dx-scrollable-scrollbar.dx-scrollbar-vertical .dx-scrollable-scroll {  
    width: 15px;  
}  

.dx-datagrid .dx-scrollable-scrollbar {  
    background-color: rgba(191, 191, 191, 0.2);  
}  

.dx-datagrid .dx-scrollable-scrollbar.dx-scrollbar-horizontal,  
.dx-datagrid .dx-scrollable-scrollbar.dx-scrollbar-horizontal .dx-scrollable-scroll  
{  
    height: 15px;  
}  

>>>.dx-datagrid .dx-data-row > td { padding: 1px 5px; }


>>>.dx-header-row {  
    text-decoration: underline;  
    word-wrap: normal;  
}  

>>>.dx-datagrid-focus-overlay {
  /* display: none */
}


/* >>>.dx-datagrid {  
  background-color:transparent; 
  color: white; 
}   */
/* 
>>>::-webkit-scrollbar {
  -webkit-appearance: none;
  width: 4px;
}

>>>::-webkit-scrollbar-thumb {
  border-radius: 4px;
  background-color: rgba(0, 0, 0, .5);
  box-shadow: 0 0 1px rgba(255, 255, 255, .5);
} */

>>>.dx-scrollbar-vertical.dx-scrollbar-hoverable {  
    width: 10px;  
}  
>>>.dx-scrollbar-vertical .dx-scrollable-scroll {  
    width: 10px;  
}  

>>>.dx-scrollbar-horizontal.dx-scrollbar-hoverable {  
    height: 10px;  
}

>>>.dx-scrollbar-horizontal .dx-scrollable-scroll {  
    height: 10px;  
}

</style>