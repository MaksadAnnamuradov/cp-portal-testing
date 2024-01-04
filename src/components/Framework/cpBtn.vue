<template>
    <!-- @click="btnClicked()" handled by v-on="$listeners"-->
    <v-btn
        v-on="$listeners"
        ref="btn"
        :dark="btnDark"
        :light="btnLight"
        :color="color"
        :disabled="btnDisabled"
        :x-small="btnSize == 'xs'"
        :small="btnSize == 'sm'"
        :medium="!btnSize || btnSize == 'md'"
        :large="btnSize == 'lg'"
        :x-large="btnSize == 'xl'"
        :id="btnId"
        :right="btnRight"
        :left="btnLeft"
        :bottom="btnBottom"
        :top="btnTop"
        :fixed="btnFixed"
        :absolute="btnAbsolute"
        :text="btnText"
        :fab="btnFab"
        :style="{'min-width': btnMinWidth, 
                'background-color': (btnstandalone && btnDisabled && $vuetify.theme.isDark ? 'rgba(33,33,33, .5)!important': (btnstandalone && btnDisabled && !$vuetify.theme.isDark ? 'rgba(245,245,245, .5)!important' : (color ? color : ''))) }"
        class="center cp-btn"
        :tabindex="tabindex"
        :data-title="tooltip"
        :plain="btnPlain"
        >

        <!-- If they pass in an icon, then show it. If they pass in an image, then show it. If they pass in a slot, then show it. -->

        <span v-if="!loading && label && btnIconRight" :style="{'margin-right': icon ? '10px': '0px'}" v-html="btnLabel"></span> 

        <img v-if="icon && Sublib.contains(icon, 'img/', true) && !loading" 
            :src="icon" 
            :height="imgDimensions" 
            :width="imgDimensions" 
        />

        <v-icon v-if="icon && !Sublib.contains(icon, 'img/', true) && !loading" :x-small="iconSize == 'xs'" :small="iconSize == 'sm'"  :large="iconSize == 'lg'" :color="iconColor"> {{icon}}</v-icon>

        <span v-if="!loading && label && !btnIconRight" :style="{'margin-left': icon ? '10px': '0px'}" v-html="btnLabel"></span> 

        <!-- If they pass in a slot, then show it. Makes it easier to pass custom things in -->
        <slot v-if="!loading"></slot>

        <cp-loading v-if="loading" :linear="btnLinearLoading" :size="btnSize == 'xs' ? '18' : ''" ></cp-loading>
        <!-- <v-progress-circular v-if="loading" :indeterminate="true" size="25" width="3" color="primary"></v-progress-circular> -->
    </v-btn>
</template>


<!-------------------------------------------------------------------------------------------------------------------------------------------------->
<script>
  // v-on="$listeners" allows us to pass in any event listeners from the parent
export default {
    name: 'Button',
    data: () => ({
        // In order for it to be re-active / update correctly, making it a computed property since the prop that gets updated is not what's used to drive html above
        //btnLabel: '',
        btnId: 'btn_' + (Math.random() * 1000).toString(),
        btnMinWidth: '',
        btnAbsolute: false,
    }),
    props: [
        // these can be passed in, the 'data' stuff can't
        'label', // vuejs prop
        'icon', // vuejs prop
        'iconColor', 
        'loading', // loading
        'disabled', // disabled
        'tooltip', // show tooltop
        'color', // color override
        'size',  //btn size
        'iconSize', // Default unit is px. Can also use the following predefined sizes: x-small, small, default, large, and x-large.
        'right',
        'left', 
        'absolute', //position absolute
        'text', //makes the button background transparent and just only show the text
        'fab', //floating action button
        'dark', //overrides the theme dark setting
        'light', //overrides the theme light setting
        'iconRight', //if true, icon will be on the right / after the words, otherwise on the left / first
        'linear', //linear loading
        'bottom', // position bottom
        'top', // position top
        'standalone', // if true, is NOT on a card and just straight on the HTML page, handles disabled colors differrently (future etc)
        'small', // size small
        'xSmall', // size x-small
        'large', // size large
        'fixed', // position fixed
        'tabindex',
        'autofocus', // set focus to the button (i.e. used on the mbox, etc.)
        'plain', // no background color
    ],

     computed: {
        imgDimensions: function(){
            if (this.xLarge){
                return '45px'
            } else if (this.large){
                return '35px'
            } else if (this.medium){
                return '25px'
            } else if (this.small){
                return '15px'
            } else {
                // default to medium
                return '25px'
            }
        },
        btnLabel: function(){
            // works in conjection with v-html above
            return this.label ? this.Sublib.replaceAll(this.label, '\\\\n', '<br/>') : ''
        },
        btnDark: function(){
            // || (!(this.light || typeof this.light == 'string') && this.$vuetify.theme.isDark)
            // if(this.icon == 'fa-plus'){
            //     debugger
            // }
            return (this.dark || typeof this.dark == 'string') ? true : false;
        },
        btnLight: function(){
            // || (!(this.dark || typeof this.dark == 'string') && !this.$vuetify.theme.isDark)
            return (this.light || typeof this.light == 'string') ? true : false;
        },
        btnRight: function(){
            return (this.right || typeof this.right == 'string') ? true : false;
        },
        btnLeft: function(){
            return (this.left || typeof this.left == 'string') ? true : false;
        },
        btnText: function(){
            return (this.text || typeof this.text == 'string') ? true : false;
        },
        btnFab: function(){
            return (this.fab || typeof this.fab == 'string') ? true : false;
        },
        btnIconRight: function(){
            return (this.iconRight || typeof this.iconRight == 'string') ? true : false;
        },
        btnLinearLoading: function(){
            return (this.linear || typeof this.linear == 'string') ? true : false;
        },
        btnBottom: function(){
            return (this.bottom || typeof this.bottom == 'string') ? true : false;
        },
        btnTop: function(){
            return (this.top || typeof this.top == 'string') ? true : false;
        },
        btnFixed: function(){
            return (this.fixed || typeof this.fixed == 'string') ? true : false;
        },
        btnSize: function(){
            if(this.small || typeof this.small == 'string') return 'sm';
            if(this.xSmall || typeof this.xSmall == 'string') return 'xs';
            if(this.large || typeof this.large == 'string') return 'lg';
            else return this.size ? this.size : 'md';
        },
        btnDisabled: function(){
            return (this.disabled || typeof this.disabled == 'string' || this.loading) ? true : false;
        },
        btnstandalone: function(){
            return (this.standalone || typeof this.standalone == 'string') ? true : false;
        },
        btnPlain: function(){
            return (this.plain || typeof this.plain == 'string') ? true : false;
        },
    },

    watch: {
        loading: async function(){
            // updated from the parent\
    
            await this.$nextTick();
            await this.$forceUpdate();
        },
    },


    async created(){
        if (!this.$vuetify || !this.$vuetify.theme || !this.$vuetify.breakpoint){
            this.$vuetify = this.Sublib.oVuetify;
        }

        // //if absolute is not passed but left or right is true, then set absolute to true
        if(!this.absolute && ( this.btnLeft || this.btnRight)){
            this.btnAbsolute = true;
        }

        // if(this.label){
        //     this.btnLabel = this.Sublib.replaceAll(this.label, '\\n', '<br/>'); // works in conjection with v-html above
        // }else{
        //     this.btnLabel = '';
        // }

        // if(this.size){
        //     this.btnSize = this.size;
        // }else{
        //     //default to md
        //     this.btnSize = 'md';
        // }

        // //check for left or right
        // //this case will handle if they do left="true" or left="false"
        // if(this.left == '' || this.left){  //passed in without a value just like 'left'
        //     this.btnLeft = true;
        // }

        // if(this.right == '' || this.right){ //passed in without a value just like 'left'
        //     this.btnRight = true;
        // }

    
        // if(this.text == '' || this.text){ //passed in without a value just like 'left'
        //     this.btnText = true;
        // }

        // if(this.fab == '' || this.fab){ //passed in without a value just like 'left'
        //     this.btnFab = true;
        // }

        // if(this.light == '' || this.light){ //passed in without a value just like 'left'
        //     this.btnLight = true;
        // }

        // if(this.dark == '' || this.dark){ //passed in without a value just like 'left'
        //     this.btnDark = true;
        // }
        // if(this.linear == '' || this.linear){ //passed in without a value just like 'left'
        //     this.btnLinearLoading = true;
        // }

        // if(this.iconRight == '' || this.iconRight){ //passed in without a value just like 'left'
        //     this.btnIconRight = true;
        // }

        // if (this.bottom || typeof this.bottom == 'string'){
        //     this.btnBottom = true;
        // }
        // if (this.top || typeof this.top == 'string'){
        //     this.btnTop = true;
        // }

    }, // created

    mounted(){
        var oBtn = document.getElementById(this.btnId);

        if (oBtn){
            var oDimen = oBtn.getBoundingClientRect();

            if(this.Sublib.inList(this.btnSize, ['xs', 'sm'])){
                this.btnMinWidth = Math.max(Math.round(oDimen.width) + 2, (this.btnFab ? 0 : 32)) + 'px'; // Vuetify had a min-width of 32px and that looks nice so going with it. SRR 04/12/2023
            }else{
                this.btnMinWidth = Math.max(Math.round(oDimen.width) + 2, (this.btnFab ? 0 : 64)) + 'px'; // Vuetify had a min-width of 64px and that looks nice so going with it. SRR 04/12/2023
            }

            if (this.autofocus){
                // NOTE: This may not work depending on the browser
                this.Sublib.sleep(.1*1000).then(() => {
                    // only works with a delay. what the heck?
                    oBtn.focus();
                }); // sleep
            }
        }

        // if (this.autofocus){
        //     //console.log('trying to focus')
        //     this.Sublib.setFocus(this.$refs.btn, true)
        // }


    }, // mounted


    //**************************************************************************************************************
    methods: {
        //**************************************************************************************************************
        async btnClicked(){
            //emit the click event
            this.$emit('click');

            return;

        }, // btnOKClicked

    } // methods
} // export default
</script>

<!-------------------------------------------------------------------------------------------------------------------------------------------------->
<style scoped>

.cp-btn-img { 
    vertical-align:middle; 
    /* text-align: center; */
    /* border: 1px solid black;  */
    margin-right:10px; 
    /* background-color: #3C6880; */
}


/* It ignores all these even with !important */
/* >>>.v-btn--disabled {
  color: #e1e1e1;
}

button:disabled,
button[disabled]{
  color: #aa2323;
} */

/* .v-btn--disabled .theme--light {
    color: rgb(66, 169, 45) !important;
}

.v-btn--disabled .theme--dark {
    color: rgb(78, 155, 47) !important;
} */

/* button:disabled,
button[disabled]{
  border: 1px solid #514f4f !important;
} */





[data-title]:hover:after {
    opacity: 1;
    transition: all 0.1s ease 0.5s;
    visibility: visible;
}

[data-title]:after {
    content: attr(data-title);
    background-color: rgb(133, 133, 133);
    font-size: 16px;
    position: absolute;
    padding: 5px;
    top: -1.2em;
    left: 100%;
    white-space: nowrap;
    box-shadow: 1px 1px 3px #222222;
    opacity: 1;
    z-index: 1;
    visibility: hidden;
    border-radius: 3px;
    color: white;
    text-transform: none;
    cursor: help;
}

</style>