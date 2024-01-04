<script>
import colors from './colors.vue';
export default {
    
    // NOTE: This array of objects is basically our data base of descs
    // NOTE: This returns objects so you do :style="getStyle('cardheader')"
    // To properly do the card header, need to do: <v-toolbar :style="getStyle('cardheader')" dark flat :height="getStyle('cardheader').height"> 

    aStyles : [
        {   
            desc: 'cardheader', style: { 
                                    'font-size': '18px;', 
                                    // NOTE: manually apply 'dark' to the tag so it does font white AND any icons white
                                    'background-color': colors.getColor('subheader'), 
                                    height: '30px',
                                    'z-index': 2,
                                    // note: Can't access $vuetify here, coming up with work around
                                    width: 0, //$vuetify.breakpoint.lgAndUp ? $vuetify.breakpoint.width -30 : $vuetify.breakpoint.width - 10
                                    getWidth: (oVuetify) => {    
                                            //return oVuetify.breakpoint.lgAndUp ? oVuetify.breakpoint.width / 3 : oVuetify.breakpoint.width - 20
                                            return oVuetify.breakpoint.lgAndUp ? oVuetify.breakpoint.thresholds.xl / 3 : oVuetify.breakpoint.width - 20
                                        }, // set width
                                    }        
        }, {  
           desc: 'cardheadersub', style: { 
                                    'font-size': '14px;', 
                                    // NOTE: manually apply 'dark' to the tag so it does font white AND any icons white
                                    'background-color': colors.getColor('subheader'), 
                                    opacity: .8,
                                    height: '26px',
                                    // note: Can't access $vuetify here, coming up with work around
                                    //width: 0, //$vuetify.breakpoint.lgAndUp ? $vuetify.breakpoint.width -30 : $vuetify.breakpoint.width - 10
                                    getWidth: (oVuetify) => {
                                            //return oVuetify.breakpoint.lgAndUp ? oVuetify.breakpoint.width / 3 : oVuetify.breakpoint.width - 20
                                            return oVuetify.breakpoint.lgAndUp ? oVuetify.breakpoint.thresholds.xl / 3 : oVuetify.breakpoint.width - 20
                                        }, // set width
                                    }     
        }, {   
            desc: '', color: ''
        }, {   
            desc: '', color: ''
        }, {   
            desc: '', color: ''
        }
    ],


    
    getStyle(mdesc, oVuetify) {
        // mdesc = Char. i.e. 'welcome'

        mdesc = mdesc.toLowerCase();

        var mRetVal = '';
       
        var oStyle = this.aStyles.find((obj) => {
            return obj.desc == mdesc;
        });

        if (!oStyle){
            mRetVal = {};
            return mRetVal;
        }

        mRetVal = oStyle.style;
        if (!mRetVal){
            //mRetVal = '';
            mRetVal = {};
        }

        if (oVuetify && oVuetify.breakpoint){        
            mRetVal.width = mRetVal.getWidth(oVuetify);
        }

        return mRetVal;
    } // getStyle
    
}
</script>