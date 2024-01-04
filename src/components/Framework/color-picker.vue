<template>
    <v-dialog
        v-model="showColorPicker"
        persistent
        
        width="350px"
        :color="Sublib.getColor('header')" >
        
        <v-card id="colorPicker">
            <v-card-text>
                <v-color-picker
                    v-model="oColor"
                    hide-canvas
                    hide-inputs
                    hide-mode-switch
                    show-swatches
                    :swatches="oColors"
                    mode="rgba"
                >
                </v-color-picker>
            </v-card-text>
            <v-card-actions>
                <cp-btn v-if="showSameAsJobBtn" :color="Sublib.getColor('header')" dark @click="btnSameAsJobClicked()" :label="Sublib.getLbl('same as job')"></cp-btn>
                <v-spacer></v-spacer>
                <cp-btn :color="Sublib.getColor('header')" dark @click="btnOKClicked()" :label="Sublib.getLbl('OK')"></cp-btn>
                <cp-btn :color="Sublib.getColor('header')" dark @click="btnCancelClicked()" :label="Sublib.getLbl('cancel')"></cp-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script>
export default {
    name: 'color-picker',
    data: () => ({
        showColorPicker: true,
        oColor: {},   
        oColors: [
            ['#FFFFFF', '#AAAAAA', '#000000'], // black to white
            ['#FF0000', '#AA0000', '#550000'], // red shades
            ['#FFFF00', '#AAAA00', '#555500'], // yellow shades
            ['#00FF00', '#00AA00', '#005500'], // green shades
            ['#00FFFF', '#00AAAA', '#005555'], // light blue shades
            ['#0000FF', '#0000AA', '#000055'], // dark blue shades
            ['#FF00FF', '#AA00AA', '#550055'] // pink shades
        ],
    }),
    props: [
        // these can be passed in, the 'data' stuff can't
        'oDfltColor', // { r: 0, g: 0, b: 0, a: 1 }
        'showSameAsJobBtn',
        'retval'
    ],

    created(){    
        //this.date = this.date.toISOString().substr(0, 10); // converts to UTC, don't want that.    
        if (!this.$vuetify || !this.$vuetify.theme || !this.$vuetify.breakpoint){
            this.$vuetify = this.Sublib.oVuetify;
        }
        //this.time = this.Sublib.AmPm(this.time);

        if (typeof this.oDfltColor != 'object'){
            this.oColor = { r: 0, g: 0, b: 0, a: 1 };
        } else {
            this.oColor = this.oDfltColor;
        }
        

        this.showColorPicker = true;

    }, 

    computed: {

    }, // computed

    methods: {
        btnCancelClicked(){
            this.retval = '!CANCEL!'; // watcher in Sublib will detect this value has changed
            this.showColorPicker = false;
        }, // btnCancelClicked

        btnSameAsJobClicked(){
            this.retval = '!JOB!';
            this.showColorPicker = false; 
        }, // btnSameAsJobClicked

        btnOKClicked (){
            // time is returned in hh:mm but it's miltime, just strip out the ':'  
            this.retval = JSON.stringify(this.oColor);
            this.showColorPicker = false;
        }, // btnOKClicked

    } // methods
} // export default
</script>
<style scoped>
/* Hide the alpha stuff sinec we don't support it */
>>>#colorPicker .v-color-picker__alpha { display:none; }

/* Now 'Center' the other slider since the alpha is gone */
>>>#colorPicker .v-color-picker__hue { margin-bottom:0px;  }
</style>