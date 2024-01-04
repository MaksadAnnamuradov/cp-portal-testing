export default {
    // This whole thing is to account for floating point precision crap in JS.
    // There's a few libraries out there but didn't really like any of them.
    name: 'math',

    install(Vue, params){
    

    Vue.prototype.math = {};
    Vue.prototype.math.Sublib; // set once the app loads so I can reference it
    Vue.prototype.math.setDec = 2; // equivalent to VFP's set decimals
    
    
    Vue.prototype.math.eval = function(mMathFunc, mRoundAtEnd){
        // mMathFunc = function, call this like: math.eval(() => mHold*2 + 3) //Experssion, i.e. '2+2', have to pass as a string so it doesn't auto evaluate it
        if (typeof mMathFunc == 'number'){
            // forgot to pass it as a function and JS already evalualted it, nothing to do
            return mMathFunc;
        }

        var mMathStr = String(mMathFunc);
        if (this.Sublib.contains(mMathStr, '() =>')){
            // comes through in either the es6 syntax or standard
            mMathStr = mMathStr.substr(mMathStr.indexOf('() =>') + '() =>'.length); 
        } else {
            mMathStr = mMathStr.replace('function ()', '');
            mMathStr = mMathStr.replace('function()', '');
        }

        mMathStr = mMathStr.replace('{', '');
        mMathStr = mMathStr.replace('}', '');
        mMathStr = mMathStr.replace('return', '');
        mMathStr = mMathStr.replace(';', '');

//         // convert the variables to values
            // DON"T NEED TO DO THIS! the eval() below handles it automatically! Wahoo!
//         var aVariableEndDeliminators = ['+', '-', '/', '*', '^', '(', ')'];
//         var mHold_math, mValue, mChar, mHoldMathStr, mStartIndex, mEndIndex;
//         mHoldMathStr = mMathStr;
//         mHold_math = '';
//         var mFinishedWholeStr = false;
// debugger        

//         while(true){
//             for (var mx = 0; mx < mMathStr.length; mx++){
//                 mChar = mMathStr.substr(mx, 1);
                
//                 if (mHold_math && !this.Sublib.inList(mChar, aVariableEndDeliminators) && mChar != ' ') {
//                     mHold_math += mChar;

//                 } else if (mHold_math && (this.Sublib.inList(mChar, aVariableEndDeliminators) || mChar == ' ')) {
//                     // we were figuring out a variable name and now it's over
//                     mEndIndex = mx;

//                     mValue = eval(mHold_math);
//                     mHold_math = ''; // reset

//                     mMathStr = mMathStr.replace(mMathStr.substring(mStartIndex, mEndIndex), String(mValue));
                    
//                     break; // start over for the next variable

//                 } else if (!mHold_math && !this.Sublib.inList(mChar, aVariableEndDeliminators) && !this.Sublib.isNumeric(mChar) && mChar != ' '){
//                     // found a variable, start to track it
//                     mStartIndex = mx;
//                     mHold_math = '';
//                     mHold_math = mChar;

//                 } else {
//                     // nothing to do, regular math expression or a space
//                 }


//                 if (mx + 1 == mMathStr.length){
//                     mFinishedWholeStr = true;
//                     break;
//                 }
//             } // for

//             if (mFinishedWholeStr){
//                 break;
//             }
//         } // do while true // convert variables to value


        if (typeof mMathStr != 'string'){
            return Number(mMathStr); // something like passed in 2+2 and JS evalualted it already to 4
        }

        // Convert regular math to stupid JS math;
        // i.e. 5^2 => Math.abs(5, 2)
        // This is a pain, but makes reading / debugging so much better
        var mRunLine = mMathStr;

        // Deal with exponents, the below code worked great, so keeping it around for when I support sin, cos, tan, etc.
        mRunLine = this.Sublib.replaceAll(mRunLine, '\\^', '**');

        // var mOrig, mNew, mExponent, mHold, mHold2, mClosingParen, mOpeningParen, mChar, mExpCount;
        // mExpCount = this.Sublib.occurs(mRunLine, '^');
        // for (var mx = 1; mx <= mExpCount; mx++){
        //     // This gets really tricky as I may have to account for multiple (), 
        //     // i.e. "2 * ((5*3) + 6*(2+3))^2" => "2 * Math.pow((5*3) + 6*(2+3), 2)"
        //     // OR "2 * ((5*3)^2 + 6*(2+3))^2" => "2 * Math.pow((Math.pow((5*3), 2) + 6*(2+3)), 2)"
        //     // Math.abs(mValue, mExp)

        //     mOrig = mRunLine.substring(mRunLine.indexOf('('), mRunLine.indexOf('^') + 4); // + 2 gives you 1 exponent, + 3 gives you 2 exponents, + 4 gives you 4 exponents
        //     if (!this.Sublib.isNumeric(this.Sublib.right(mOrig, 1))){
        //         // strip extra spaces or anything else we grabed
        //         mOrig = mOrig.substring(0, mOrig.lastIndexOf( ' ')); // ((5*3) + 6*(2+3))^2
        //     }

        //     mExponent = mOrig.substr(mOrig.indexOf('^') + 1); // '2'

        //     mHold = mOrig.substring(0, mOrig.indexOf('^')); // ((5*3) + 6*(2+3))

        //     mClosingParen = 0;
        //     mOpeningParen = 0;
        //     // figure out what parantheses is the opening one for the exponents
        //     mHold2 = '';
        //     mHold = mHold.split('').reverse().join(''); // work backwards
        //     for (var my = 1; my <= mHold.length; my++){
        //         mChar = mHold.substr(my - 1, 1);
        //         if (mChar == ')'){
        //             mClosingParen++;
        //         } else if (mChar == '('){
        //             mOpeningParen++;
        //         }

        //         mHold2 += mChar;
        //         if (mClosingParen == mOpeningParen && mClosingParen != 0){
        //             // found it!, I'm out
        //             break;
        //         }
        //     }

        //     mHold2 = mHold2.split('').reverse().join(''); // put it back in the right order
        //     mNew = 'Math.pow(' + mHold2 +', ' + mExponent + ')';
        //     mRunLine = mRunLine.replace(mHold2 + '^' + mExponent, mNew);
        // } // mx, expononets

        
        var mRetVal;
        try {
            mRetVal = eval(mRunLine);
        } catch (crap){
            try {
                mRetVal = mMathFunc(); // may have better luck evaluating the variables passed in
                mRoundAtEnd = true;
            } catch(crap2){
                mRetVal = -123
            }
        }

        if (mRoundAtEnd){
            mRetVal = this.round(mRetVal, this.setDec); // round the final result
        } else {
            mRetVal = this.round(mRetVal, 8); // should be big enough but still fixes floating point problems
        }

        return mRetVal;

    }; // realMath


    // *****************************************************************
    // Make it more intuitve to round
    Vue.prototype.math.round = function(mNumber, mDec){
        if (!mDec){
            mDec = 0;
        }

        //return Number(Number(mNumber).toFixed(mDec)); .toFixed rounds up at .6, not .5
        // see https://stackoverflow.com/questions/10015027/javascript-tofixed-not-rounding

        return Number((+(Math.round(+(mNumber + 'e' + mDec)) + 'e' + -mDec)).toFixed(mDec));
    }; // round


    // *****************************************************************
    // this is a just a wrapper around the standard Math.abs so everything's in this library
    Vue.prototype.math.abs = function(mNumber){
        return Math.abs(mNumber);
    }; // abs


    

} // install
} // math
