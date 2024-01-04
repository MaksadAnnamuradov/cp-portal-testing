<template>
    <div>
        <p v-if="false" id="homeOpt">
            <v-badge overlap color="red" v-model="showNotif_calc" id="homeOptNotif">
                <span slot="badge">{{notifCnt}}</span>
                <span class="home-opt-img">
                    <img v-if="Sublib.contains(img, 'img/', true)" 
                        :src="img" 
                        :height="imgDimensions" 
                        :width="imgDimensions" 
                        @click="$emit('clicked')"
                        class="pointer"
                        />
                    <v-icon v-else 
                        :x-large="xLarge" 
                        :large="large" 
                        :medium="medium" 
                        :small="small"
                        @click="$emit('clicked')"
                        class="pointer"
                        >
                        {{img}}
                    </v-icon>
                </span>
            </v-badge>
            
            <!-- <span class="home-opt-lbl">{{ lbl }}</span> -->
            <span class="home-opt-lbl pointer" v-html="lbl" @click="$emit('clicked')"></span>

            <!-- create a submessage  -->
            <!-- <span class="submsg" v-if="submsg" @click="$emit('clickedSub')">{{ submsg }}</span> -->

            <!-- create a submessage by iterating over oSubOpts  -->
            <span class="submsg" v-if="oSubOpts && oSubOpts.length">
                <div v-for="x in oSubOpts" :key="x.lbl" @click="$emit('clickedSub', x)" class="pointer">{{ x.lbl }}</div>
            </span>

        </p>
        <v-container :style="{'padding': '3px 0px', 'font-size': '18px', 'padding-bottom': hasSubOpts(1) ? '10px' : hasSubOpts(2) ? '40px' : this.$vuetify.breakpoint.mdAndUp ? '0px': '10px'}">
            <v-row>
                <v-col v-if="img" cols="2" style="padding: 0px 5px; align-self: center; text-align: center; max-width: 55px;">
                    <v-badge overlap color="red" v-model="showNotif_calc" id="homeOptNotif">
                        <span slot="badge">{{notifCnt}}</span>
                        <span class="home-opt-img">
                            <img v-if="Sublib.contains(img, 'img/', true)" 
                                :src="img" 
                                :height="imgDimensions" 
                                :width="imgDimensions" 
                                @click="$emit('clicked')"
                                class="pointer"
                                />
                            <v-icon v-else 
                                :x-large="xLarge" 
                                :large="large" 
                                :medium="medium" 
                                :small="small"
                                @click="$emit('clicked')"
                                class="pointer"
                                >
                                {{img}}
                            </v-icon>
                        </span>
                    </v-badge>
                </v-col>
                <v-col cols="9" style="padding: 0px;">
                    <v-row dense>
                        <v-col style="padding-top: 0;">
                            <span class="home-opt-lbl pointer" v-html="lbl" @click="$emit('clicked')"></span>

                            <span class="submsg" v-if="oSubOpts && oSubOpts.length && $vuetify.breakpoint.mdAndUp">
                                <div v-for="x in oSubOpts" :key="x.lbl" @click="$emit('clickedSub', x)" class="pointer" v-html="x.lbl"></div>
                            </span>
                        </v-col>
                    </v-row>
                </v-col>

            </v-row>
        </v-container>
    </div>
</template>


<!-------------------------------------------------------------------------------------------------------------------------------------------------->
<script>
export default {
    // to show a notif with a number, pass notifCnt, to show just a blank red circle, pass showNotif=true
    props: ['img', 'lbl', 'notifCnt', 'size', 'showNotif', 'submsg', 'oSubOpts'],
    computed: {
        showNotif_calc: function() {
            return this.notifCnt > 0 || this.showNotif == true;
        },
        xLarge: function(){
            return (this.size == 'xl');
        },
        large: function(){
            return (this.size == 'lg');
        },
        medium: function(){
            return (!this.size || this.size == 'md');
        },
        small: function(){
            return (this.size == 'sm');
        },
        imgDimensions: function(){
            if (this.xLarge){
                return '45px'
            } else if (this.large){
                return '35px'
            } else if (this.medium){
                return '25px'
            } else if (this.small){
                return '15px'
            }
        },
       
    },

    methods: {
        hasSubOpts: function(numberOfSubOpts){
            return this.oSubOpts && this.oSubOpts.length == numberOfSubOpts && this.$vuetify.breakpoint.mdAndUp;
        },
    },

}
</script>


<!-------------------------------------------------------------------------------------------------------------------------------------------------->
<style scoped>
#homeOpt { display:table; align-content:top; font-size:18px; }
/* span { vertical-align: middle; } */
.home-opt-img { 
    /* vertical-align:middle;  */
    /* text-align: center; */
    /* border: 1px solid black;  */
    /* margin-right:10px;  */
    /* background-color: #3C6880; */
}

#homeOptNotif .v-badge__badge { height:18px; min-width:18px; font-size:12px; }

.submsg { 
    font-size:14px;
    /* margin-left: 45px; */
    /* margin-top: -5px; */
    display: block;
    width: 100%;
    max-height: 10px;
}


</style>