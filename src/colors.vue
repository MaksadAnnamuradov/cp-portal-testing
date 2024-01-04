<script>
export default {
    
    // NOTE: This array of objects is basically our data base of descs
    // Since the vuetify stuff requires a specific color and doesn't pull form our css classes, writing this. SRR 07.18.2019
    // NOTE: Color can be something like 'blue' or '#fff'
    aColors : [
        {   
            desc: 'app', color: '#2D4E60' //'#3C6880'
        }, {   
            desc: 'header', color: '#3C6880' //'#9DB3C0' //'#6D8EA0'
        }, {   
            desc: 'subheader', color: '#6D8EA0' //'#9DB3C0'
        }, {   
            desc: '', color: ''
        }, {   
            desc: '', color: ''
        }, {   
            desc: '', color: ''
        }, {   
            desc: '', color: ''
        }, {   
            desc: '', color: ''
        }
    ],
    
    getColor(mdesc) {
        // mdesc = Char. i.e. 'welcome'

        mdesc = mdesc.toLowerCase();

        var mRetVal = '';
       
        var oColor = this.aColors.find((obj) => {
            return obj.desc == mdesc;
        });

        if (!oColor){
            mRetVal = 'Color: ' + mdesc + ' not found';
            return mRetVal;
        }

        mRetVal = oColor.color;
        if (!mRetVal){
            //mRetVal = '';
            mRetVal = "'" + mdesc + "' color not defined";
        }

        return mRetVal;
    } // get desc
    
}
</script>