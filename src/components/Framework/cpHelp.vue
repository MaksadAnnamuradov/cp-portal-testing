<template>
    <cp-btn
        :right="btnRight"
        :left="btnLeft"
        :absolute="btnAbsolute"
        :dark="iconDark"
        :light="iconLight"
        size="sm"
        text
    >
        <v-icon 
            class="pointer" 
            :dark="iconDark"
            :light="iconLight"
            :color="helpColor"
            :size="size"
            @click="iconHelpClicked()"
        >
            {{helpIcon}}
        </v-icon>
    </cp-btn>
</template>
<script>
export default {
    name: 'cp-help',
    data: () => ({
        helpIcon: '',
        iconLight: false,
        iconDark: false,
        helpColor: 'white',
        btnRight: false,
        btnLeft: false,
        btnAbsolute: false,

    }),
    props: [
        // these can be passed in, the 'data' stuff can't
        'icon',
        'size', // vuejs prop
        'color', // vuejs prop
        'url', // vuejs prop
        'msg', // if this passed, we just want to show a popup with this message
        'dark',
        'light',
        'right',
        'left',
    ],
    computed: {
        
    }, // computed

    watch: {
    
    },
    async created(){           

        if (!this.$vuetify || !this.$vuetify.theme || !this.$vuetify.breakpoint){
            this.$vuetify = this.Sublib.oVuetify;
        }

        if (this.color){
            this.helpColor = this.color;
        }

        if(!this.icon){
            this.helpIcon = this.Sublib.getIcon('info');
        } else {
            this.helpIcon = this.icon;
        }

        if(this.light == '' || this.light || !this.$vuetify.theme.isDark){ //passed in without a value just like 'left'
            this.iconLight = true;
        }

        if(this.dark == '' || this.dark || this.$vuetify.theme.isDark){ //passed in without a value just like 'left'
            this.iconDark = true;
        }

          //check for left or right
        //this case will handle if they do left="true" or left="false"
        if(this.left == '' || this.left){  //passed in without a value just like 'left'
            this.btnLeft = true;
        }

        if(this.right == '' || this.right){ //passed in without a value just like 'left'
            this.btnRight = true;
        }

        //if absolute is not passed but left or right is true, then set absolute to true
        if(!this.absolute && ( this.btnLeft || this.btnRight)){
            this.btnAbsolute = true;
        }


        this.$nextTick();
        this.$forceUpdate();


    }, // created

    methods: {

        async iconHelpClicked(){
            if (this.msg){
                await this.Sublib.mbox(this.msg)
            } else {
                //link passed, open in new window
                this.Sublib.launchHelp(this.url)
            }
        },

    } // methods
} // export default
</script>
<style scoped>
</style>