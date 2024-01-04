<template>
    <span>
        <span v-if="!showPhone && this.number" @click="Sublib.callNumber(number)" class="pointer text-hyperlinkblue">{{number_f}}</span>
        <span v-if="showPhone && this.number" @click="Sublib.callNumber(number)" class="pointer phone-number-text-icon" :style="{ 'margin-right': '10px' }">
            <v-icon color="blue">{{Sublib.getIcon('call')}}</v-icon>
        </span>
        <span v-if="showTexting_calced" @click="Sublib.textNumber(number)" class="pointer phone-number-text-icon">
            <v-icon color="blue">{{Sublib.getIcon('text msg')}}</v-icon>
        </span>
    </span>
</template>
<script>
export default {
    name: 'phone-number',
    data: () => ({
    }),
    props: [
        // these can be passed in, the 'data' stuff can't
        'number',
        'showTexting',
        'showPhone'
    ],
    computed: {
        // vue doesn't like you changing variables passed in (props) and recommends a computed value instead. SRR 07.22.2019
        number_f: function(){
            var mHold = this.number;
             if (this.Sublib.isNumeric(mHold)){
                // no formatting, default it in
                mHold = this.Sublib.applyPhoneMask(mHold);
            }

            return mHold;
        }, // number_f
        showTexting_calced: function(){
            return this.number && this.showTexting;
        }
    }, // computed
    created(){           
    }, // created

    methods: {
    } // methods
} // export default
</script>
<style scoped>
.phone-number-text-icon { margin-left:10px; }
</style>