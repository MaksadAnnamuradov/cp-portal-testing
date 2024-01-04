
/* eslint-disable no-console */
// see https://levelup.gitconnected.com/vue-pwa-example-298a8ea953c9 
// NOTE: the precache manifest list will be added to the top of this file on build

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */


workbox.core.setCacheNameDetails({prefix: "cplite"});

self.__precacheManifest = [].concat(self.__precacheManifest || []);
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});


//*****************************************************************************************************************************************************
/* The install event fires when the service worker is first installed.
   You can use this event to prepare the service worker to be able to serve
   files while visitors are offline.
*/
self.addEventListener("install", function (event) {
    //console.log('WORKER: install event in progress.');
    /* Using event.waitUntil(p) blocks the installation process on the provided
       promise. If the promise is rejected, the service worker won't be installed.
    */
    //self.skipWaiting(); // register / activate as soon as possible (forces the waiting service worker to become the active service worker.)
    // see https://stackoverflow.com/questions/51715127/what-are-the-downsides-to-using-skipwaiting-and-clientsclaim-with-workbox and vue.config/js

    // if (navigator.onLine) {
    //     event.waitUntil(async function () {
    //         /* The caches built-in is a promise-based API that helps you cache responses,
    //            as well as finding and deleting them.
    //         */
    //         var oCache = await caches.open('cp_' + version);
    //         await oCache.addAll(aFileList);
    //         self.skipWaiting(); // done above
    //         //console.log('WORKER: install completed');
    //         console.log('SW Worker ' + 'cp_' + version + ' install completed');
    //     }()); // event.waitUntil
    // } // if
}); // install






//*****************************************************************************************************************************************************
/* The activate event fires after a service worker has been successfully installed.
   It is most useful when phasing out an older version of a service worker, as at
   this point you know that the new worker was installed correctly. In this example,
   we delete old caches that don't match the version in the worker we just finished
   installing.
*/
self.addEventListener("activate", function (event) {
    /* Just like with the install event, event.waitUntil blocks activate on a promise.
       Activation will fail unless the promise is fulfilled.
    */

    //clients.claim(); // tells it to immediately start processing things it can
    event.waitUntil(async function () {
        var oKeys = await caches.keys();
        await Promise.all(
                oKeys.map(function (key) {    
                    if (navigator.onLine && key.indexOf('cplite') < 0) {
                        return caches.delete(key);
                    }
                }) // oKeys.map
            ); // Promise.all
            
        // take control of all pages within the service workers scope. 
        // "This triggers a "controllerchange" event on navigator.serviceWorker in any clients that become controlled by this service worker." see https://developer.mozilla.org/en-US/docs/Web/API/Clients/claim
        //self.clientInformation.claim(); 
        clients.claim(); 

        // now send a message to the client to update the local storage and apply the update
        sendMsg2Client({ action: 'UPDATE' });
            
    }()); // event.waitUntil
}); // activate



//*****************************************************************************************************************************************************
function sendMsg2Client(oMsg) {
    // this uses the BroadCast Channel API. see https://developers.google.com/web/updates/2016/09/broadcastchannel
    const oChannel = new BroadcastChannel('cp'); // name MUST match name in CPMobileMain.js that listens for messages!
    oChannel.postMessage(oMsg);
    oChannel.close();
}



//*****************************************************************************************************************************************************
// listen for messages from the client
self.addEventListener('message', oMsg => {
    var oClientMsg = oMsg.data;

    if (oClientMsg.action == 'ACTIVATE') {
        self.skipWaiting();
    }

}); 



//*****************************************************************************************************************************************************
/* The fetch event fires whenever a page controlled by this service worker requests
   a resource. This isn't limited to `fetch` or even XMLHttpRequest. Instead, it
   comprehends even the request for the HTML page on first load, as well as JS and
   CSS resources, fonts, any images, etc.
*/
// self.addEventListener("fetch", function (event) {
//     //console.log('WORKER: fetch event in progress.');
//     // NOTE: workbox seems to handle most of them so not much we need to do!
//     return;

//     /* We should only cache GET requests, and deal with the rest of method in the
//        client-side, by handling failed POST,PUT,PATCH,etc. requests.
//     */
//     //if (event.request.method !== 'GET' || event.request.url.indexOf('mobile') > -1) {
//     if (event.request.method !== 'GET'
//         || event.request.url.toLowerCase().indexOf('//ws') > -1
//         || event.request.url.toLowerCase().indexOf('localws') > -1) {
//         //|| event.request.url.toLowerCase() == 'https://portal.cenpoint.com/') {
//         // Don't intercept requests made to the web service
//         // If we don't block the event as shown below, then the request will go to
//         // the network as usual.
//         return;
//     }

//     /* Similar to event.waitUntil in that it blocks the fetch event on a promise.
//        Fulfillment result will be used as the response, and rejection will end in a
//        HTTP response indicating failure.
//     */
//     event.respondWith(async function () {
//         // override the default behavior

//         var oCache = await caches.open('cp_' + version);
//         var cached = await oCache.match(event.request.url);

//         if (!cached && event.request.url.toLowerCase().indexOf('/images/') == -1) {
//             // I've seen where the phone has some app that wipes out website data.
//             // This leads to our service worker being installed, but not having any files cached. 
//             // The user then gets stuck on a loading screen. Try to account for that. SRR 06.25.2018
//             // NOTE: Only do this if it's not cached and it should be as it seems to slow down the app loading to get the cache keys every times. 
//             var aSavedFiles = await oCache.keys();
//             if (aSavedFiles.length == 0) {
//                 if (navigator.onLine) {
//                     await oCache.addAll(aFileList);
//                 } else {
//                     // hope for the best below. Not sure what else to do.
//                     //return;
//                 }
//             }

//             // Now try to get it again
//             cached = await oCache.match(event.request.url);
//         }


//         if (cached && cached.status < 300) {
//             return cached;
//         }

//         // Need to make a call to the network
//         try {
//             var oController = new AbortController();
//             var mSignal = oController.signal;
//             var mURL = new URL(event.request.url);

//             setTimeout(() => oController.abort(), 35 * 1000); // abort the fetch after 35 seconds

//             //var oResp = await fetch(event.request);
//             var oResp = await fetch(mURL, { signal: mSignal });
//             return oResp;

//         } catch (oError) {
//             // If you can't find a reason for the fail and it should be working, it's possible it's a chrome bug.
//             // This bit us on 06.25.2019. We were stuck until chrome released an update... See https://bugs.chromium.org/p/chromium/issues/detail?id=977784
            
//             console.log('SW WORKER: fetch request to network failed.', event.request);

//             // deal with a few scenarios. NOTE: Don't do this above as navigator.onLine isn't always accurate. 
//             // If we tried above and it failed we are offline. SRR 07.04.2019
//             if (!navigator.onLine) { // && !cached) {
//                 //if (event.request.url.toLowerCase().indexOf('localportal') > -1) {
//                 //    // dev mode. Since localPortal is in the office, if I'm outside / on network coverage, may not have it but 
//                 //    // I DO have have service and so the clauses above to catch for being offline to not make a second cache
//                 //    // won't have fired. Instead, do a search among all caches
//                 //    return caches.match(event.request.url).then(function (devCache) {
//                 //        return devCache || caches.match(self.location.origin + '/Images/offline.png');
//                 //    });

//                 if (event.request.url.toLowerCase().indexOf('images') > -1) {
//                     // return our 'offline' picture
//                     return oCache.match(self.location.origin + '/Images/offline.png');
//                 }
//             } else if (false && !cached && event.request.url.toLowerCase().indexOf('localportal') > -1) {
//                 // dev mode. Since localPortal is in the office, if I'm outside / on network coverage, may not have it but 
//                 // I DO have have service and so the clauses above to catch for being offline to not make a second cache
//                 // won't have fired. Instead, do a search among all caches
//                 return fetch(event.request.url).then(function (response) {
//                     return response || oCache.match(event.request.url)
//                 });
//             }


//             /* Here we're creating a response programmatically. The first parameter is the
//                response body, and the second one defines the options for the response.
//             */
//             return new Response('<h1>Offline_sw.js: An error has occured. Please try again.</h1><br><h2>Could not load URL: ' + event.request.url + '</h2>', {
//                 status: 503,
//                 statusText: 'Service Unavailable',
//                 headers: new Headers({
//                     'Content-Type': 'text/html'
//                 })
//             });
//         } // catch
//     }()); // event.respondwith
// }); // fetch




//*****************************************************************************************************************************************************
self.addEventListener('error', function (event) {
    console.log('SW Error', event);
}); // error

//*****************************************************************************************************************************************************
self.addEventListener('statechanged', function (event) {
    console.log('SW State Change', event);
}); // statechanged