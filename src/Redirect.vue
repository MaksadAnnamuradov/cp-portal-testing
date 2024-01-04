<template>
    <div class="Redirect_wrapper">
        <h4 v-html="lblBadSignIn"></h4>    
        <cp-btn
            v-if="lblBadSignIn"
            @click="btnTryAgainClicked()"
            >
            {{Sublib.getLbl('try again')}}
        </cp-btn>    
    </div>
</template>
// *****************************************************************************************************
<script>
export default {
data: () => ({ 
    lblBadSignIn: '',
    }), // data
    //************************************************************
    async created () {
        // NOTE: Can't seem to call Sublib directly from the template. Have to set a property and then set it in the init
        EventBus.$emit('updtAppTitleBar', this.Sublib.getLbl('sign in to continue'));
        try {
            document.getElementById('appBarMainMenu').style.display = 'none';
        } catch(ignore){
        }
        

    }, // created
    //************************************************************
    methods: {
        //************************************************************
        // Putting this here instead of the created so the tryagin button can call it
        async verifySignInAndRedirect(){
            // Make sure they are logged in before we redirect (i.e. for our help docs). SRR 12/30/2022
            if (!await this.Sublib.checkSignIn()){
                // not signed in, redirect to home screen
                this.lblBadSignIn = this.Sublib.getLbl('invalid credentials') + " <span style='font-size:20px'>&#128561;</span>" // emoji face code
                return;
            }

            // redirect to the page they want
            var oParams = this.$router.currentRoute.query;
            var mURL = oParams.url;
            if (!mURL){
                this.lblBadSignIn = this.Sublib.getLbl('no redirect url found');
                return;
            }

            this.Sublib.launchURL(mURL, false, true);
        }, // verifySignInAndRedirect


        //************************************************************
        btnTryAgainClicked(){
            this.verifySignInAndRedirect(); 
        }, // btnTryAgainClicked 
    } // methods
}
</script>
// *****************************************************************************************************
<style scoped>
.Redirect_wrapper { margin:0 auto; }
h4 {margin-bottom: 10px; }
</style>