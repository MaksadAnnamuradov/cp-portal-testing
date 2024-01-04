export default {
    // This is our indexedDB wrapper / functions
    // NOTE: ALL are async as indexedDB is async

    install(Vue, params){
    

    Vue.prototype.IDB = {};
    Vue.prototype.IDB.Sublib; // set before the methods below are called so we have access to the RestClient Methods (can't figure out another way to reference it)

    Vue.prototype.IDB.aDBList = [
        {
            db: 'CenPoint', 
            ver: 14, // Integers only. NOTE: starting at 10 as we need to be higher than the current production portal since we will be using the same domain!
            aTables: [
                        'jobs', 
                        'quote', 
                        'photos', 
                        'cachedWSResp', 
                        'pendingWSSave',
                        'dfltnote', // added 08.26.2019., version 11 SRR
                        'offlineTemplates', // added 08.26.2019, version 12 SRR
                        'hold', // added 08.30.2019, version 13 SRR
                        'users', // added. version 14 (to save users email sig) SRR 10/04/2022
                    ] // If you add a table, you MUST update the version! 

            // NOTE: once we fully roll this out to production, want to add some code for on update to delete 'cdata' and 'sdata' carried over from previous portal!
        },
        // specify additional database(s) / versions here
    ],
        
    //created(){
    Vue.prototype.IDB.init = function(){
        // if this isn't in a function I get 'Cannot assign to read only property 'indexedDB' of object '#<Window>''
        // I think it's a timing problem with the install function. This gets around it. SRR 09.09.2019
        try {
            window.indexedDB = window.indexedDB
                                || window.mozIndexedDB
                                || window.webkitIndexedDB
                                || window.msIndexedDB;

            window.IDBTransaction = window.IDBTransaction 
                                    || window.webkitIDBTransaction
                                    || window.msIDBTransaction;

            window.IDBKeyRange = window.IDBKeyRange
                                    || window.webkitIDBKeyRange
                                    || window.msIDBKeyRange;
        } catch(ignore){
        }
    }
    //}, // created

    
    // *********************************************************************************
    // Open the DB
    Vue.prototype.IDB.openDB = async function(mDB2Open){
        // mDB2Open = Char. Optional. Defaults to 'CenPoint' if not passed
        return new Promise((resolve, reject) => {
            if (!mDB2Open){
                mDB2Open = 'CenPoint';
            }

            // figure out which version I need to call (so I can do the update code if needed)
            var mVer;
            var oDBInfo = this.aDBList.find((obj) => {
                return obj.db.toUpperCase() == mDB2Open.toUpperCase();
            });

            var db;
            if (oDBInfo){
                db = indexedDB.open(mDB2Open, oDBInfo.ver);
            } else {
                db = indexedDB.open(mDB2Open);
            }

            
            db.onsuccess = (event) => {
                resolve(event.target.result);
            } // onsuccess

            db.onupgradeneeded = (event) => {
                resolve(this.isDBUp2Date(event.target.result));
            } // onupgradeneeded

            db.onerror = (event) => {                
                reject(event.target.result);
            } // onerror
        }); // promise
    }, // openIDB


    // *********************************************************************************
    // This is called from openIDB when onupgradeneeded is fired. see this.aDBList for where to define the tables
    Vue.prototype.IDB.isDBUp2Date = async function(oDB){
        // oDB = database to check
        //var oDBInfo = this.aDBList.find((obj) => {
        // NOTE: 'this' seems to go out of scope... Refrence my global object instead.
        var oDBInfo = this.aDBList.find((obj) => {
            return obj.db.toUpperCase() == oDB.name.toUpperCase();
        });

        var aTableList = oDBInfo.aTables; 
        

        for (var mx = 0; mx <aTableList.length; mx++){
            try {
                oDB.createObjectStore(aTableList[mx], { autoIncrement: false });
            } catch (ignore){
                // only errors out if object store already exists
            }
        } // for

        return;
    }, // isDBup2Date


    // *********************************************************************************
    // this makes the 'request' and returns the result so that I can do it using promises. 
    //async IDBReq (mObjStore, mAction, mKey, mData, mDataBase) {
    Vue.prototype.IDB.req = async function (mObjStore, mAction, mKey, mData, mDataBase) {
        // mObjStore = Char. Object store we care about (basically a cursor); 
        // mAction = Char. Either 'get', 'getall', 'getalllike', 'cursor', 'rawcursor', 'put', 'delete', 'deleteAll'
        // mKey = Char. Only required with 'Get', 'put', or 'delete', or 'cursor', key to insert
        //          NOTE: Optional on 'cursor'. If passed, treats it like a 'contains' on the key so you get multiple but not all records back at once. SRR 08/30/2022
        // mData = Any, data to save to IDB, only required with 'Put'
        // mDataBase = Char. Optional. Only needed if NOT using the default of 'CenPoint'

        return new Promise(async (resolve, reject) => {

            mAction = mAction.toUpperCase();
            var aCursor = [];

            var db = await this.openDB(mDataBase);
            var transaction;
            try {
                if (this.Sublib.inList(mAction, ['put', 'delete', 'deleteAll'], true)) {
                    transaction = db.transaction(mObjStore, 'readwrite');
                } else {
                    transaction = db.transaction(mObjStore, 'readonly');
                }
            } catch (error) {
                // Object store doesn't exist. Crap!
                this.Sublib.mbox('Failed to open object store: ' + mObjStore + '!');
                resolve('Failed to open object store: ' + mObjStore + '!');
                return;
            }

            var oStore = transaction.objectStore(mObjStore);

            var request;

            if (mAction == 'GET') {
                request = oStore.get(mKey);

            } else if (mAction == 'GETALL') {
                request = oStore.getAll();

            } else if (mAction == 'CURSOR' || mAction == 'RAWCURSOR') {
                request = oStore.openCursor();

            } else if (mAction == 'PUT') {
                // does both UPDATE and INSERT
                request = oStore.put(mData, mKey);

            } else if (mAction == 'DELETE') {
                request = oStore.delete(mKey);

            } else if (mAction == 'DELETEALL') {
                request = oStore.clear();

            } else {
                this.Sublib.mbox('Unkown action passed to IDBReq: ' + mAction);
                resolve('Unkown action passed to IDBReq: ' + mAction);
                return;
            }


            request.onsuccess = (event) => {    
                if (this.Sublib.inList(mAction, ['get', 'getall'], true)) {
                    resolve(event.target.result);

                } else if (mAction == 'CURSOR' || mAction == 'RAWCURSOR') {
                    // this is a 'cheat' way to return the cursor as an array since I hate the way the async 'cursor' works.
                    var oData = event.target.result;
                    if (oData) {         
                        if (mAction == 'CURSOR') {
                            if (mKey && !this.Sublib.contains(oData.key, mKey, true)){
                                // don't want this record as the key doesn't match our criteria.

                            } else {
                                //oData.value.key = oData.key;
                                //aCursor.push(oData.value);
                                aCursor.push({
                                    key: oData.key,
                                    value: oData.value
                                })
                            }
                            

                        } else { // mActiion = 'RAWCURSOR'
                            // push the entire 'result' (includes keys and all sorts of crap);
                            aCursor.push(oData); 
                        }
                        
                        event.target.result['continue'](); // go to the next rec
                    } else {
                        // basically EOF
                    }
                }
            } // request.onsuccess

            request.onerror = (event) => {   
                if (this.Sublib.inList(mAction, ['get', 'getall', 'cursor'], true)) {
                    try {
                        db.close()
                    } catch (ignore){
                    }
                    resolve(event.target.error);
                }
            } // request.onerror

            transaction.oncomplete = (event) => {
                try {
                    db.close()
                } catch (ignore){
                }
                if (this.Sublib.inList(mAction, ['put', 'delete', 'deleteall'], true)) {
                    resolve('');
                } else if (mAction == 'CURSOR' || mAction == 'RAWCURSOR') {
                    resolve(aCursor);
                }
            } // transaction.oncomplete
            
            transaction.onerror = (event) => {
                try {
                    db.close()
                } catch (ignore){
                }

                if (this.Sublib.inList(mAction, ['put', 'delete'], true)) {
                    resolve(event.target.error);
                }
            } // transaction.onerror

        }); // promise
    }, // IDBReq


    // *********************************************************************************
    // Delete a database. Putting this here so it's easier to await for it. SRR 07/19/2023
    Vue.prototype.IDB.deleteDB = async function (mDataBase, no2ndTry) {    
        // mDataBase = Char. Optional. Database to delete. Defaults to 'CenPoint' if not passed
        // no2ndTry = Logical. If true, will not try again after a block error
        if (!mDataBase){
            mDataBase = 'CenPoint';
        }

        let _this = this;

        return new Promise(async (resolve, reject) => {
            var req = indexedDB.deleteDatabase(mDataBase);
            req.onsuccess = function () {
                console.log("Deleted database: " + mDataBase + " successfully");
                resolve('');
            };
            req.onerror = function (event) {
                console.log("Couldn't delete database");
                resolve('Failed to delete database: ' + mDataBase + "\nError: " + (event.result && event.result.target ? event.result.target : 'Unknown'));

            };
            req.onblocked = async function (event) {
                if (!no2ndTry){
                    // try to close the DB and then try again
                    // NOTE: Can't really close it as we don't have the handle. Just give the garbage collector a second to close the handles (bunch of stuff on stack overflow)
                    // and then try again
                    console.log("Couldn't delete database: " + mDataBase + " as transactions are in use. Waiting and then trying again.");  
                    await _this.Sublib.sleep(1*1000);
                    //return _this.deleteDB(mDataBase, true);
                    //resolve(_this.deleteDB(mDataBase, true));
                    //let mError = await _this.deleteDB(mDataBase, true); // recursive call
                    // Calling delete again just hangs. Just see if we can open it?
                    try {    
                        //let oDB = await _this.openDB(mDataBase);
                        //oDB.close();
                        // can't open a DB for firebase for some reason (just hangs). Instead try to see if it's still in the list of databases?
                        let deleted = false, oDBs;
                        for (var mx = 1; mx <= 5; mx++){
                            if (indexedDB.databases){
                                oDBs = await indexedDB.databases();               
                                if (!oDBs.find(obj => obj.name == mDataBase)){
                                    deleted = true;
                                    break;
                                }

                                await _this.Sublib.sleep(.5*1000);
                            } // if
                        } // for

                        if (deleted){
                            let mRetVal = "Deleted database: " + mDataBase + " successfully";
                            console.log(mRetVal);
                            resolve('');
                        } else {
                            let mRetVal = 'Failed to delete database: ' + mDataBase + "\nError: Cannot delete database due to the DB being in use";
                            console.log(mRetVal);
                            resolve(mRetVal)
                        }
                    } catch (deleted){
                        console.log(deleted);
                        // can't open it because it's really deleted, it worked!
                        let mRetVal = "Deleted database: " + mDataBase + " successfully";
                        console.log(mRetVal);
                        resolve('');
                    }     

                }else {        
                    console.log("Couldn't delete database: " + mDataBase + " due to the operation being blocked");
                    resolve('Failed to delete database: ' + mDataBase + "\nError: " + (event.result && event.result.target ? event.result.target : 'Cannot delete database due to the operation being blocked'));
                }
                
            };
        }) // promise
    } // deleteDB
    



} // install
} // IDB
