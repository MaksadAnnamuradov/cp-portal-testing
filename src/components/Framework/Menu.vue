<template>
    <v-menu
        :id="menuId"
        v-show="showMenu"
        origin='center center'
        :close-on-content-click='false'
        :offset-x='isOffsetX'
        :offset-y='isOffsetY'
        transition='scale-transition'
        v-model="menuOpened"
        open-delay="300"
        close-delay="500"
        content-class="overflow-hidden"
        style="padding-top:0; padding-bottom:0;"
        :nudge-right="nudgeRight"
        absolute
        :position-x="x"
        :position-y="y"
        bottom
    >


     <template
        v-slot:activator="{ on }"
      >
      <!-- v-slot:activator="{ on }" -->
        <!-- <v-btn :id="mBoxBtnId" style="color: green" display: none v-on="on"></v-btn> -->
        
        <!-- It was used to show the button that calls the menu, but we are not passing it now -->

        <!-- <v-btn v-if='icon && !isSubMenu' small  fab  light  v-on="on" :style="{ 'color': Sublib.getColor('header') }">
            <v-icon>{{ icon }}</v-icon>
        </v-btn> -->

        <!-- This is the parent menu options -->
        <!-- Show menu option that launches a sub menu -->

        <!-- NOTE: Padding right is to make the > arrow to indicate sub menu sit farther to the right -->

        <!-- Couldn't quite get hover to behave like I wanted to commenting out for now. SRR 11/15/2022 -->
        <!-- @mouseenter="hoverTimer('start', $event)"
        @mouseleave="hoverTimer('end', $event)"
        @click="hoverClick = !hoverClick" -->
        <v-list-item 
            v-if='isSubMenu' 
            v-on="on" 
            style="white-space: normal; padding-right: 4px;" 
            ref="Menu_SubMenuItem"
            >
            <img v-if="icon && Sublib.contains(icon, 'img/', true)" 
                :src="icon" 
                :height="imgDimensions('md')" 
                :width="imgDimensions('md')" 
                style="margin-right:10px"
                />
            <v-icon  v-else-if="icon" style="margin-right:10px" medium>{{icon}}</v-icon>
            {{ desc }}
            <v-spacer></v-spacer>
            <v-icon>{{Sublib.getIcon('arrow-right-v')}}</v-icon>
            
        </v-list-item>


        <!-- Regular menu option -->
        <v-btn v-else :id="mBoxBtnId" small  fab  light text :style="{ 'color': Sublib.getColor('header'), 'white-space': 'normal' }" v-on="on">
            {{ desc }}
        </v-btn>

      </template>

      <!-- This part iterates over the list of menu options / subMenus and calls the Menu component recursively -->
      <!-- NOTE: The style on the v-list makes it scrollable if it gets too big -->
      <v-list style="max-height:600px; overflow-y:auto">
            <template v-for="(item, index) in menuOptions">

                <!-- Figure out what to show -->
                <!-- Singe line / divider -->
                <v-divider 
                    v-if='item.isDivider' 
                    :key='index'
                    :style="{'border-color': $vuetify.theme.isDark ? 'rgba(255,255,255,.40)' : 'rgba(0,0,0,.30)' }"
                />

                <!-- Basically a space holder -->
                <v-list-item 
                    v-else-if="item.desc == '' && item.code == ''" 
                    style="min-height:25px; max-height:25px;" 
                    :key='index'
                    >
                </v-list-item>

                <!-- Load a sub menu again-->
                <Menu
                    v-else-if='item.submenu && item.submenu.length > 0'
                    :isOffsetX="true" 
                    :isOffsetY='false'
                    :isSubMenu='true'
                    :key='index'
                    :menuOptions='item.submenu'
                    :desc='item.desc'
                    :icon="item.icon"
                    :nudgeRight="40"
                    @sub-menu-click='emitClickEvent'
                />

                <!-- Regular menu item -->
                <v-list-item
                    v-else
                    :disabled='item.disabled || item.header'
                    @click='emitClickEvent(item)'
                    :key='index'
                    :style="{ 'background-color' : (item.disabled ? ($vuetify.theme.isDark ? '#202020' : '#EFEFEF') : ''),
                               'color' : item.disabled ?  'grey': ''}"
                >
                    <!-- ($vuetify.theme.isDark ? 'grey' : 'grey') : '') -->
                    <!-- Display submenu icon and description -->
                    <v-list-item-action v-if="item.checked" style="margin-right:5px">
                        <!-- This is like vfps set mark -->
                        <v-icon small>{{Sublib.getIcon('check mark')}}</v-icon>
                    </v-list-item-action>

                    <v-list-item-action v-else-if="item.icon" style="margin-right:10px">
                        <!-- Regular icon -->
                         <img v-if="Sublib.contains(item.icon, 'img/', true)" 
                            :src="item.icon" 
                            :height="imgDimensions('md')" 
                            :width="imgDimensions('md')" 
                            />
                        <v-icon v-else medium>{{item.icon}}</v-icon>
                    </v-list-item-action>

                    <v-list-item-title style="white-space: normal"> 
                        <!-- NOTE: The white-space: normal makes it line wrap if it's too big -->
                        <v-btn v-if="item.btn">
                            {{ item.desc }}
                        </v-btn>
                        <span v-else>
                            {{ item.desc }}
                        </span>
                    </v-list-item-title>

                </v-list-item>

            </template>
      </v-list>
    </v-menu>

</template>

<script>

//Code References
//https://codepen.io/Moloth/pen/ZEBOzQP
//https://codesandbox.io/s/vuetify-nested-menu-qlbnv?file=/src/App.vue
//https://github.com/vuetifyjs/vuetify/issues/1877


export default {
    name: 'Menu',
    components: {
        Menu: () => import('./Menu.vue')
    },

    data: () => ({
        showMenu: false,  //drives the main Menu component
        menuOpened: false,  //tracks if the sub menu is open or not
        menuId: '',  //this is the id of the menu that is being shown
        x: 0,  //x position of the menu
        y: 0,  //y position of the menu
        transition: 'scale-transition',  //transition of the menu
        origin: 'center center',  //origin of the menu
        hoverClick: false, // used to 'click' the option on mouse over
        tmrHover: null,
    }),

    props: [
        'menuOptions',  //list of menu items
        'desc',  //desc of the menu
        'icon',  //icon to show on the button that calls the menu
        'isSubMenu',  //is this a subMenu or not
        'isParentMenu', //is this a parent menu or not
        'isOffsetX',  //is the menu offset from the button that calls it (T or F)
        'isOffsetY',  //is the menu offset from the button that calls it (T or F)
        'nudgeRight',  //how much to nudge the menu to the right
        'retval', // Sublib watches this so we know when they clicked something
        'mBoxBtnId', // so we can keep track of multiple mboxs at once
    ],

    //***********************************************************
    created(){

        this.menuId = 'context-menu' + Math.floor(Math.random() * 1000000) + 1;

        //this.$vuetify.breakpoint= {}; // don't have the values but at least it won't error out... 
        if (!this.$vuetify || !this.$vuetify.theme || !this.$vuetify.breakpoint){
            this.$vuetify = this.Sublib.oVuetify;
        }

        // //passed in hide option that will hide the option from menu if passed true, otherwise show default
        // // I did not want to add or remove when I passed in MA 01/27/2023
        // //if hide true, then remove from menuOptions
        // Not doing this, it is causing vue do not chane prop warning error MA 05/09/2023
        // if(this.menuOptions){
        //     this.menuOptions = this.menuOptions.filter(item => !item.hide);
        // }
        
    }, // created

    //***********************************************************
    mounted (){
        if(this.isParentMenu){
            //parent menu, get positions
            this.showContextMenu()
        }
    }, // mounted

    //***********************************************************
    methods: {
        //***********************************************************
        emitClickEvent(item) {
            this.$emit("sub-menu-click", item);  //submenu emits this event to the parent menu
            this.menuOpened = false;
            
            //only set the value on the parent menu
            if(this.isParentMenu){
                this.retval = item;
            }
        },

        //***********************************************************
        imgDimensions: function(imgSize){
            if (imgSize == 'xl'){
                return '45px'
            } else if (imgSize == 'lg'){
                return '35px'
            } else if (!imgSize || imgSize == 'md'){
                return '25px'
            } else if (imgSize == 'sm'){
                return '15px'
            }
        },


        //***********************************************************
        showContextMenu(){

            //below code is not used but still put it for reference in the future
            // var menu = document.getElementById(this.menuId);

            // if(!menu){
            //     //wait
            //     await this.Sublib.sleep(100);
            //     menu = document.getElementById(this.menuId);
            // }

           
            // menu.style.visibility = "hidden";
            // menu.style.display = "block";
            // var contextMenuWidth = menu.offsetWidth;
            // var contextMenuHeight = menu.offsetHeight;

            // // var contextMenuWidth = 160;
            // // var contextMenuHeight = 160;

            // menu.removeAttribute("style");

            // var left
            // var top


            // if((contextMenuWidth + window.mouseX) >= window.innerWidth) {
            //     left = ( window.mouseX - contextMenuWidth/4) ;
            // } else {
            //     left =  window.mouseX ;
            // }

            // if((contextMenuHeight +  window.mouseY) >= window.innerHeight) {
            //     top = (window.mouseY - contextMenuHeight/4) ;
            // } else {
            //     top = window.mouseY ;
            // }

            this.x = window.mouseX;
            this.y = window.mouseY;


            this.showMenu = true;

            this.$forceUpdate();
            this.$nextTick()
        }, // showContextMenu

        
        //***********************************************************
        // Make it so if on the desktop if they 'hover' the mouse over the option it opens the sub menu automatically.
        hoverTimer(mAction, event){
            if (this.hoverClick){
                return; // already ran the code
            }
            mAction = mAction.toUpperCase();
            if (mAction == 'START'){
                if (this.tmrHover){
                    clearTimeout(this.tmrHover);
                }
                this.tmrHover = setTimeout(this.clickSubMenu, 1.2*1000, event); // runs every 2 seconds.
            } else { // mAction == 'END
                if (this.tmrHover){
                    clearTimeout(this.tmrHover)
                }
            }
        }, // hoverTimer


        //***********************************************************
        // Called from timer when hovering over submenu
        clickSubMenu(event){    
            if (this.hoverClick){
                // already clicked, 
                return;
            } 

            this.hoverClick = true; // clicks the submenu to open it
            // couldn't get setting the prop to work. Programatically click the button
            this.$refs.Menu_SubMenuItem.click(event);

        }, // clickSubMenu



    }, //methods

    //***********************************************************
    watch: {
        menuOpened: function () {
            // Watch this so that if they click off of the menu and it shuts down we can still send back a value since v-click-outside doesn't seem to be working.
            //if menuOpened is false and there is no retval and it is a parentMenu then we need to send back a empty retval
            if (!this.menuOpened && !this.retval && this.isParentMenu){
                this.retval = {desc: '', code: ''}
            }
            return
        }
    },
}
</script>

<style scoped>
/* Want these menus to be bigger than the menu that shows in the select (this un-does the style in app.vue). SRR 10/23/2023 */
.v-menu__content { max-height: unset !important; }
</style>