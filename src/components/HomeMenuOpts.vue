<template>
    <!-- This shows menu options / sub menu options used on the home screen. Had to put it in a few places so moved it to 1 common place. Define tabs on main screen and then pass to this component and it will show them
    * NOTE: Parent page handles click events -->
    <span>
        <span v-for="x in oTabsOptions" :key="x.lbl + x.code">
            <v-row style="padding-bottom: 5px;">
                <v-col style="align-self: center; padding-right: 0;">
                    <v-icon v-if="x.subMenu && x.subMenu.length" @click="x.showSubMenu = !x.showSubMenu" class="float-right" :style="x.style">{{x.showSubMenu ? Sublib.getIcon('arrow-down-v') : Sublib.getIcon('arrow-right-v')}}</v-icon>
                </v-col>
                <v-col cols="8" :md="true || (x.subMenu && x.subMenu.length) || oTabsOptions.find(obj => obj.tab.toLowerCase() == selTab.toLowerCase() && obj.visible && obj.subMenu && obj.subMenu.length) ? 6 : 4">
                    <div v-if="x.code == 'divider'" :style="dividerStyleFull()"></div>
                    <!-- @click.native="x.subMenu && x.subMenu.length ? x.showSubMenu = !x.showSubMenu : $emit('btnOptClicked', x)" -->
                    <home-opt 
                        v-else
                        @keypress.enter.native="x.subMenu && x.subMenu.length ? x.showSubMenu = !x.showSubMenu : $emit('btnOptClicked', x)" 
                        @clicked="x.subMenu && x.subMenu.length ? x.showSubMenu = !x.showSubMenu : $emit('btnOptClicked', x)" 
                        @clickedSub="(oSubOpts) => $emit('btnSubOptClicked', oSubOpts)" 
                        :img="x.icon" 
                        :lbl="x.lbl" 
                        :size="x.iconSize" 
                        :style="x.style"
                        tabindex="0"
                        :submsg="x.submsg"
                        :oSubOpts="x.subOpts"
                        >
                    </home-opt>
                </v-col>
                <v-col></v-col>
            </v-row>
            <span v-if="x.subMenu && x.subMenu.length && x.showSubMenu && x.subMenu.filter(obj => obj.visible).length">
                <span v-for="y in x.subMenu.filter(obj => obj.visible)" :key="y.lbl + y.code" >
                    <v-row align-content="center">
                        <v-col md="3"></v-col>
                        <v-col cols="8" :class="{ 'border-bottom-gray': y.dividerAfter }">
                            <div v-if="y.code == 'divider'" :style="dividerStyle()"></div>
                            <home-opt 
                                v-else
                                @click.native="$emit('btnOptClicked', y)" 
                                @keypress.enter.native="$emit('btnOptClicked', y)" 
                                :img="y.icon" 
                                :lbl="y.lbl" 
                                :size="y.iconSize" 
                                :style="y.style"
                                tabindex="0"
                                class="margin-left-25"
                                >
                            </home-opt>
                        </v-col>
                        <v-col></v-col>
                    </v-row>
                    <!-- <v-divider v-if="y.dividerAfter" class="margin-bottom-15"></v-divider> -->
                </span>
                <!-- little gap between sub menu options -->
                <span style="padding: 1px;"></span> 
            </span>
            <!-- <v-divider v-if="x.dividerAfter" class="margin-bottom-15"></v-divider> Use style object instead, see home-office.vue --> 
        </span>
    </span>
</template>


<!-------------------------------------------------------------------------------------------------------------------------------------------------->
<script>
import HomeOpt from './Home-Opt.vue'; // dumb, but have to explicity import AND declare it in components below
export default {
    // to show a notif with a number, pass notifCnt, to show just a blank red circle, pass showNotif=true
    props: [
        'oTabsOptions', 
    ],
    components: {
        HomeOpt,
    },
    created(){
        
    }, // created
    mounted(){
        
    }, // mounted

    computed: {
        
    },

    methods: {
        dividerStyle(){
             return {
                'border-bottom' : (this.$vuetify.theme.isDark ? 'rgba(255,255,255,.40)' : 'rgba(0,0,0,.30)') + ' .75px solid',
                'max-width': '80%',
                'margin': 'auto',
                'margin-top' : '2px'
            }
        }, 
        dividerStyleFull(){
            let oRetVal = this.dividerStyle();
            delete oRetVal['max-width'];
            return oRetVal;
        }
    }, // methods
}
</script>


<!-------------------------------------------------------------------------------------------------------------------------------------------------->
<style scoped>

.row [class*="col"] { padding-top: 0; padding-bottom: 0; }
</style>