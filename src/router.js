import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router);

const router = new Router({
    mode: 'history', // gets rid of the '#' in the url
    routes: [
        {
        // catch all, go to the home component (i.e. 404 not found goes to the home screen)
            path: '/',
            name: 'home',
            component: () => import('./Home-Office.vue')
        },
        {
            path: '/JournalReg',
            component: () => import('./JournalReg.vue')
        },
    ],
    // scrollBehavior
    scrollBehavior(to, from, savedPosition) {   
        if (to.path == from.path && savedPosition) {
            return savedPosition;  // savedPosition is only available for popstate navigations.

        } else if (false && to.hash && to.hash.indexOf('#/') < 0) {
            return {
                // scroll to anchor by returning the selector
                // offset so the fixed top bar doesn't hide part of the div
                selector: to.hash, offset: { x:0, y:60 }
            };
        } else {
            return { x: 0, y: 0 };  // scroll to top
        }
    }

}); // new Router


router.onError(error =>{    

    // see https://blog.francium.tech/vue-lazy-routes-loading-chunk-failed-9ee407bbd58
    // caution, this can result in indefinite reloads.... SRR 01/20/2020
    if (/loading chunk \d* failed./i.test(error.message) && navigator.onLine) {
        window.location.reload()
    } else {
        debugger;
    }


}); // onError

export default router;