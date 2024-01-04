// Modify the existing Data Types to add in some functionality that makes it easier to work with them. 
// Moved out of Sublib. SRR 11/28/2023
export default function(){


// *********************************************************************************
// Enhance the Date object class to allow adding days
// see https://stackoverflow.com/questions/563406/add-days-to-javascript-date
Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
} // Date.addDays


// *********************************************************************************
// Enhance the date object class to allow adding minutes
// see https://stackoverflow.com/questions/1197928/how-to-add-30-minutes-to-a-javascript-date-object
Date.prototype.addMin = function(mMin2Add){
    mMin2Add = Number(mMin2Add);
    var date = new Date(this.valueOf());
    date.setTime(date.getTime() + (mMin2Add * (60*1000)));
    return date;
}

// Enhance the Date object class to allow adding month
// see https://stackoverflow.com/questions/563406/add-days-to-javascript-date
Date.prototype.addMonth = function(months) {
    var date = new Date(this.valueOf());
    date.setMonth(date.getMonth() + months);
    return date;
} // Date.addDays

//write a same day function
Date.prototype.isSameDay = function(date2){
    // date2 = Date. date to compare to
    return this.getFullYear() == date2.getFullYear() && this.getMonth() == date2.getMonth() && this.getDate() == date2.getDate();
} // Date.isSameDay


// *********************************************************************************
// Couldn't find a good built in way to do a 'delete for'
// Filter didn't quite do it. writing my own. SRR 01/09/2020
// NOTE: This changes the actual array that calls this!
Array.prototype.deleteFor = function(mFunc){  
    // mFunc = function, i.e. [obj => obj.userid != '456'] (deletes for userId != '456')   
    // NOTE: Can also pass true to delete all recs
    var aRecs2Delete = [], obj;
    for (var mx = 0; mx < this.length; mx++){
        //obj = this[mx];
        if (typeof mFunc == 'boolean'){
            // delete all 
            aRecs2Delete.push(mx);
        } else if (mFunc(this[mx])){
            // real function to evalulate
            aRecs2Delete.push(mx);
        }
    } // for

    // now acctually remove the items. NOTE: This must be done in reverse order so we don't mess up the indexes
    for (mx = aRecs2Delete.length -1; mx >= 0; mx--){
        this.splice(aRecs2Delete[mx], 1);
    }


    return this;
} // Array.deleteFor


// *********************************************************************************
// Couldn't find a good built in way to do a 'delete for'
// Filter didn't quite do it. writing my own. SRR 01/09/2020
// NOTE: This changes the actual array that calls this!
Array.prototype.replaceFor = function(oNewVals, mFunc){  
    // oNewVals = Object, name / value pairs of new values. NOTE: Values MUST exist already on the array! or it will add it to only some records and now it's all out of whack
    //      NOTE: To update a field with a different field value, preface the field with '$' (made up) and we handle it differently
    //      NOTE: With the way this is coded, you can 'swap' values at the same time (i.e. { credit: '$$debit': debit: '$$credit' })
    // mFunc = function, i.e. [obj => obj.userid != '456'] (replaces for userId != '456')   
    // NOTE: Can also pass true to update all recs
    let oNewValsHold, holdStr, aHold, my, hold, caseInsensitive = false, decLen = 0;
    let evalChar = '$$';
    let evalCharLen = evalChar.length;

    let _this = this;

    for (var mx = 0; mx < this.length; mx++){
        //obj = this[mx];
        if (typeof mFunc == 'boolean' || mFunc(this[mx])){
            // update the rec
            //this[mx] = {...this[mx], ...oNewVals }
            oNewValsHold = JSON.parse(JSON.stringify(oNewVals)); // break the reference
            Object.keys(oNewVals).forEach((key) => {
                if (typeof oNewValsHold[key] == 'string' && oNewValsHold[key].indexOf(evalChar) != -1) { // && oNewValsHold[key].substring(0, evalCharLen) == evalChar){ // left(2) = '$$'
                    // value is from a property on the object already (i.e. replace glcodes.debit with glcodes.credit)
                    // oNewValsHold.credit = this[mx]['debit']

                    if (oNewValsHold[key].indexOf('+') == -1 && oNewValsHold[key].indexOf('-') == -1 && oNewValsHold[key].indexOf('*') == -1 && oNewValsHold[key].indexOf('/') == -1 && oNewValsHold[key].indexOf('!') == -1){
                        oNewValsHold[key] = _this[mx][oNewValsHold[key].substring(evalCharLen)]; 
                    } else {
                        // adding, subtracting, etc. field together (i.e. invTotAmt = invAmt + invTaxAmt)
                        // NOTE: also works for strings
                        holdStr = oNewValsHold[key]; // $$invTotAmt + $$invTaxAmt

                        //holdStr = holdStr.replace(new RegExp('\\$\\$', (caseInsensitive ? 'i' : '') + 'g'), 'this[mx].'); // replace all but don't have access to it here      
                        
                        holdStr = holdStr.replace(new RegExp('\\+', (caseInsensitive ? 'i' : '') + 'g'), ' + '); // replace all but don't have access to it here
                        holdStr = holdStr.replace(new RegExp('\\-', (caseInsensitive ? 'i' : '') + 'g'), ' - ');
                        holdStr = holdStr.replace(new RegExp('\\*', (caseInsensitive ? 'i' : '') + 'g'), ' * ');
                        holdStr = holdStr.replace(new RegExp('\\/', (caseInsensitive ? 'i' : '') + 'g'), ' / ');

                        aHold = holdStr.split(' ');
                        holdStr = '';
                        decLen = 0; // reset
                        for (var my = 0; my < aHold.length; my++){
                            if (!aHold[my]) continue; // empty space, may be caused by our replace above

                            if (aHold[my].substring(0, evalCharLen) == evalChar){
                                if (aHold[my].indexOf('!') > -1){
                                    // i.e. $$!visible
                                    hold = !_this[mx][aHold[my].substring(evalCharLen + 1)];

                                } else {
                                    hold = _this[mx][aHold[my].substring(evalCharLen)]; 
                                    if (typeof hold == 'string')
                                        hold = "'" + hold + "'"; // for the add / eval below, need it to look like a string
                                }

                            } else {
                                hold = aHold[my];
                            }

                            if (typeof hold == 'number'){
                                decLen = Math.max(decLen, String(hold).length - (String(hold).indexOf('.') + 1));

                            } else if (typeof hold == 'string' && hold.indexOf('.') != -1){
                                // see if it's '50.153'
                                decLen = Math.max(decLen, hold.length - (hold.indexOf('.') + 1));
                            }

                            

                            holdStr += (holdStr ? ' ' : '') + hold;
                        }

                        
                        oNewValsHold[key] = eval(holdStr);

                        if (typeof oNewValsHold[key] == 'number'){
                            oNewValsHold[key] = oNewValsHold[key].round(decLen); // assume 2 decimals for rounding here when adding fields together?
                        }

                    }
                } else {
                    // leave as is
                }
            });

            this[mx] = {...this[mx], ...oNewValsHold }
        }
    } // for

    return this;
} // Array.replaceFor



// *********************************************************************************
// calc the sum of a field in an array of objects. Don't want to write in multiple places
// Think of this as the VFP equiv of calculate sum 
Array.prototype.calcSum = function(mFunc, mDec){
    // mFunc = function. i.e. [obj => obj.selected ? obj.dur_hrs : 0]
    // mDec = Number. Optional. Number of decimals to round to. Defaults to 2
    if (!mDec)
        mDec = 2;

    var mRunningTot = 0;
    for (var mx = 0; mx < this.length; mx++){
        mRunningTot += mFunc(this[mx]);
    }
    
    return mRunningTot.round(mDec);
} // Array.calcSum

// *********************************************************************************
// calc the sum of a field in an array of objects. Don't want to write in multiple places
// Think of this as the VFP equiv of calculate cnt 
Array.prototype.calcCnt = function(mFunc){
    // mFunc = function. i.e. [obj => obj.selected ? obj.dur_hrs : 0]
    var mRunningTot = 0;
    for (var mx = 0; mx < this.length; mx++){
        //mRunningTot += mFunc(this[mx]);
        if (mFunc(this[mx])){
            mRunningTot++;
        }
        
    }
    return mRunningTot;
} // Array.calcSum

    // *********************************************************************************
// calc the max of a field in an array of objects. Don't want to write in multiple places
// Think of this as the VFP equiv of calculate max 
Array.prototype.calcMax = function(mFunc){
    // mFunc = function. i.e. [obj => obj.selected ? obj.dur_hrs : 0]
    // var mRunningMax = Number.NEGATIVE_INFINITY;
    // for (var mx = 0; mx < this.length; mx++){
    //     if (mFunc(this[mx]) >= mRunningMax){
    //         mRunningMax = mFunc(this[mx]);
    //     }
    // }

    if (this.length == 0){
        return 0;
    } else {
        return Math.max(...this.map(mFunc));
    }
} // Array.calMax


    // *********************************************************************************
// calc the min of a field in an array of objects. Don't want to write in multiple places
// Think of this as the VFP equiv of calculate max 
Array.prototype.calcMin = function(mFunc){
    // mFunc = function. i.e. [obj => obj.selected ? obj.dur_hrs : 0]
    // var mRunningMin = Number.POSITIVE_INFINITY;
    // for (var mx = 0; mx < this.length; mx++){
    //     if (mFunc(this[mx]) <= mRunningMin){
    //         mRunningMin = mFunc(this[mx]);
    //     }
    // }
    return Math.min(...this.map(mFunc));
} // Array.calMin



// *********************************************************************************
// The syntax for adding 1 array to another is weird. Writing this so I can remember it / make it more like VFP
// NOTE: This changes the actual array that calls this!
Array.prototype.appendFrom = function(aArray2Append){
    if (aArray2Append.length == 0){
        return;
    }

    if (this.blankRec){
        // we have a structure, only append fields that match (just like VPF duh ;) )
        var oKeys = Object.keys(this.blankRec);

        // break the reference to the original array or we'll delete properties off it it!
        aArray2Append = JSON.parse(JSON.stringify(aArray2Append));

        // This for loop works but after the for loop aArray2Append is NaN, not sure why.
        // Using the map below fixed it. SRR 09/28/2022
        // for (var mx = 0; mx < aArray2Append.length; aArray2Append ++){
        //     for (var fieldName in aArray2Append[mx]){
        //         if (oKeys.indexOf(fieldName) == -1){
        //             // doesn't exist on array we are appending to, delete it out
        //             delete aArray2Append[mx][fieldName];
        //         }
        //     } // for (fieldName)
        // } // for (mx)    

        aArray2Append = aArray2Append.map(obj => {
            for (var fieldName in obj){
                if (oKeys.indexOf(fieldName) == -1){
                    // doesn't exist on array we are appending to, delete it out
                    delete obj[fieldName];
                }
            } // for (fieldName)
            return obj
        });
    }
    
    this.push.apply(this, aArray2Append);
} // Array.appendFrom


// *********************************************************************************
// For arrays of objects (i.e. JS version of cursors, and in a blank 'object' with all of the name/ value pairs.)
// NOTE: This changes the actual array that calls this!
Array.prototype.appendBlank = function(oNewRecValues){
    // oNewRecValues = Object. Optional. If passed, sets the values on new rec immediately

    var oNewRec = {};
    var oCurRec;

    if (this.length){
        oCurRec = this[0];
    } else if (this.blankRec) {
        oCurRec = this.blankRec; // i.e. from a zap and now has no records
    }

    let fSetDflts = function(oCurRec){
        var oNewRec2 = {};
            for (var attr in oCurRec){
            if (!oCurRec.hasOwnProperty(attr)){
                continue;
            }

            // deal with datatypes (i.e. like VFP would on an append blank)
            if (typeof oCurRec[attr] == 'string'){
                oNewRec2[attr] = '';
            } else if (typeof oCurRec[attr] == 'number'){
                oNewRec2[attr] = 0;
            } else if (typeof oCurRec[attr] == 'boolean'){
                oNewRec2[attr] = false;
            } else if (oCurRec[attr] instanceof Date){
                oNewRec2[attr] = new Date(1900, 1, 1);
            } else if (typeof oCurRec[attr] == 'object'){
                // cycle through all sub properties            
                oNewRec2[attr] = fSetDflts(oCurRec[attr]); // recursive call

            } else {
                // shouldn't really hit this
                oNewRec2[attr] = null;
            }
        } // for

        return oNewRec2;
    } // function 

    oNewRec = fSetDflts(oCurRec);

    if (oNewRecValues){
        oNewRec = { ...oNewRec, ...oNewRecValues }
    }

    this.push(oNewRec);

    if (!this.blankRec){
        this.blankRec = JSON.parse(JSON.stringify(oNewRec)); // break the reference;
    }

    return this[this.length - 1]; // return a reference to it so you can easily update the values

} // Array.appendBlank




// *********************************************************************************
// For arrays of objects (i.e. JS version of cursors, and in a zap that stores the structure so an append blank can work after the zap)
// NOTE: This changes the actual array that calls this!
Array.prototype.zap = function(){
    var oHold = JSON.parse(JSON.stringify(this.appendBlank())); // break the reference;
    //this = []; // reset array 
    this.deleteFor(true); // nuke all recs
    this.blankRec = oHold;

    return;
} // Array.zap



// *********************************************************************************
// For arrays of objects (i.e. JS version of cursors) add in a orderBy so we can order on a certain field. 
// NOTE: This ONLY works for ordering by 1 field (i.e. invoiceid, dt, amount, etc.), CANNOT do multiple orderBys!
// NOTE: This changes the actual array that calls this!
Array.prototype.orderBy = function(mProperty, mAscDesc){
    // mProperty = Char. object property to sort by (i.e. what field)
    //      Enhanced to pass an array so you can sort by multiple values. i.e. ['buildersid', 'invdt', 'bal'] SRR 07/18/2023
    //      Can also pass an array of objects if you want to do asc on one field but desc on another. i.e. [{field (or prop): 'buildersid', desc: true}, {field: 'invdt', desc: false}, {field: 'bal', desc: true}]. SRR 10/25/2023
    //      Currently supports sorting by up to 10 properties / fields
    // mAscDesc = Char. 'A', 'ASC', 'D', or 'DESC', i.e. sort by ascending or descending. Defaults to ascending if not passed

    if (typeof mProperty == 'string'){
        // original sort code / simple 1 property 
    

        if (!mAscDesc){
            mAscDesc = '';
        }

        mAscDesc = mAscDesc.toUpperCase();

        this.sort(function(objA, objB){
            var mRetVal = 0;
            var mValue1, mValue2;

            mValue1 = objA[mProperty];
            mValue2 = objB[mProperty];

            if (typeof mValue1 == 'string'){
                mValue1 = mValue1.toUpperCase();
                mValue2 = mValue2.toUpperCase();
            }

            if (mValue1 > mValue2){
                mRetVal = 1;
            } else if (mValue1 < mValue2){
                mRetVal = -1;
            }

            if (mAscDesc && (mAscDesc == 'D' || mAscDesc == 'DESC')){
                // switch to descending
                mRetVal = mRetVal * -1
            }

            return mRetVal;
        });
    } else {
        // object of multiple properties
        // basically mirroring (.sort(a, b => return a.x < b.x || a.y < b.y || a.z < b.z))

        let sortPropCnt = 0, oVals = [];

        this.sort(function(objA, objB){
            var mRetVal = 0;
            var mValue1, mValue2;
            oVals = []; // reset

            // figure out the sort order
            sortPropCnt = 0;
            mProperty.forEach((key) => {
                sortPropCnt++;
                
                if (typeof key == 'object'){
                    // passed an object with field and desc. SRR 10/25/2023
                    mAscDesc = key.desc ? 'D' : 'A';
                    key = key.field || key.prop; // support both table and object syntax
                }

                mValue1 = objA[key];
                mValue2 = objB[key];

                if (typeof mValue1 == 'string'){
                    mValue1 = mValue1.toUpperCase();
                    mValue2 = mValue2.toUpperCase();
                }

                if (mValue1 > mValue2){
                    mRetVal = 1;
                } else if (mValue1 < mValue2){
                    mRetVal = -1;
                }

                if (mAscDesc && (mAscDesc == 'D' || mAscDesc == 'DESC')){
                    // switch to descending
                    mRetVal = mRetVal * -1
                }

                oVals[sortPropCnt -1] = mRetVal;
            });

            //return mRetVal;
            // Now send it back
            return oVals[0] || oVals[1] || oVals[2] || oVals[3] || oVals[4] || oVals[5] || oVals[6] || oVals[7] || oVals[8] || oVals[9];
        });
    }

    return;

} // Array.orderBy





// *********************************************************************************
// For arrays of objects (i.e. JS version of cursors). Add in props to every object in the field (kind of like adding a new field)
// This will make them reactive in vue. see // see https://stackoverflow.com/questions/56976631/vue-how-to-add-reactive-properties-to-objects-in-an-array-of-objects#:~:text=The%20vue%20docs%20suggests%20to%20use%20Object.assign%20when,this%20is%20how%20you%20would%20initialize%20the%20data
// NOTE: This returns a copy of the array, does NOT change the actual array
Array.prototype.addProps = function(oNewProps){
    // oNewProps = Object of name / value pairs. Value should be the default value
    //      looks like: {selected: false, jobsId: ''}

    // In order to make props reactive in vue, have to add them in. This adds them in a way that makes them reactive.
    var aRetVal; // Can't update this by saying this = this.map. Stinks. 
    aRetVal = this.map(obj => {
        // return Object.assign({}, obj, {
        //     selected: true
        // });
        return Object.assign({}, obj, oNewProps);
    }); // map

    return aRetVal;

} // Array.addProps


// *********************************************************************************
// Since setting 1 array = to another array is by reference, make it easy to get a copy NOT by reference
Array.prototype.breakRef = function(){
    return JSON.parse(JSON.stringify(this));
} // Array.breakRef



// *********************************************************************************
// NOTE: Can't do this because it breaks Vue!
// Since setting 1 object = to another object is by reference, make it easy to get a copy NOT by reference
// Object.prototype.breakRef = function(){
//     return JSON.parse(JSON.stringify(this));
// } // Object.breakRef


String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
}

// *********************************************************************************
// JS has no 'STUFF' command or replace at for strings. Writing this to mirror VFP's 'stuff'
// see https://stackoverflow.com/questions/1431094/how-do-i-replace-a-character-at-a-particular-index-in-javascript
String.prototype.replaceAt = function(index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}

// *********************************************************************************
// JS has no 'toProperCase command. Writing this to mirror VFP's 'proper()'
// see https://www.w3docs.com/snippets/javascript/how-to-convert-string-to-title-case-with-javascript.html
String.prototype.toProperCase = function(){
    return this.toLowerCase().split(' ').map(function (word) {
        return (word.charAt(0).toUpperCase() + word.slice(1));
    }).join(' ');
} // toProperCase


// *********************************************************************************
// Make it so I don't have to call Sublib.contains()
String.prototype.contains = function(searchVal, caseInsensitve){
    let string2Search = this;
    if (typeof string2Search != 'string') {
        return false;
    }
    if (caseInsensitve) {
        string2Search = string2Search.toUpperCase();
        searchVal = searchVal.toUpperCase();
    }

    return string2Search.indexOf(searchVal) > -1;
} // contains


// ********************************************************************************* 
// Don't always have access to this.math.round so build it into Number. SRR 09/11/2023
Number.prototype.round = function(mDec){
    if (!mDec){
        mDec = 0;
    }
    let mNumber = this;

    //return Number(Number(mNumber).toFixed(mDec)); .toFixed rounds up at .6, not .5
    // see https://stackoverflow.com/questions/10015027/javascript-tofixed-not-rounding

    return Number((+(Math.round(+(mNumber + 'e' + mDec)) + 'e' + -mDec)).toFixed(mDec));
} // round


} // export default function()