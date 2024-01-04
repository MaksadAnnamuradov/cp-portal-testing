<script>
export default {
    
    // NOTE: This array of objects is basically our data base of descs
    // NOTE: img is from material io. See https://material.io/tools/icons/?icon=call&style=baseline
    //      OR from font-awesome. See https://fontawesome.com/icons?from=io
    //      OR from material design. See https://materialdesignicons.com/
    // Material IO have no preface
    // Font awesome start with 'fa-'
    // Material Design start with 'mdi-
    aIcons : [
        {   
            desc: 'pretrip', img: 'local_shipping'
        }, {
            desc: 'comp train', img: 'fa-graduation-cap'//'school'
        },{
            desc: 'time card', img: 'folder'
        }, {
            desc: 'sign in', img: 'person'
        }, {
            desc: 'person', img: 'person'
        }, {
            desc: 'time', img: 'schedule' //'access_time'
        }, {
            desc: 'map', img:  'place' //'near_me' //'map' // 'explore'
        }, {
            desc: 'directions', img: 'directions'
        }, {
            desc: 'cust', img: 'account_circle' //'face'
        }, {
            desc: 'notes', img: 'notes'
        }, {
            desc: 'equip', img: 'build'
        }, {
            desc: 'tasks', img: 'fa-tasks' //'check_box'
        }, {
            desc: 'ftick', img: 'mdi-file-document-edit' //'fa-file-signature' //'insert_drive_file'
        }, {
            desc: 'wo', img: 'fa-file-alt' //'insert_drive_file'
        }, {
            desc: 'jsa', img: 'fa-clipboard-list' //'format_list_numbered'
        }, {
            desc: 'insp', img: 'fa-clipboard-list' //'format_list_numbered'
        }, {
            desc: 'auth to proc', img: 'border_color'
        }, {
            desc: 'view_pics', img: 'photo'
        }, {
            desc: 'take_pics', img: 'photo_camera'
        }, {
            desc: 'safety plan', img: 'fa-hard-hat'
        }, {
            desc: 'techs', img: 'fa-users'
        }, {
            desc: 'users', img: 'fa-users'
        }, {
            desc: 'user', img: 'fa-user'
        }, {
            desc: 'pre ticket opts', img: 'bubble_chart' //'fa-cubes'
        }, {
            desc: 'info', img: 'info'
        }, {
            desc: 'materials', img: 'fa-book'
        }, {
            desc: 'download', img: 'fa-download'
        }, {
            desc: 'url', img: 'fa-external-link-alt'
        }, {
            desc: 'quiz', img: 'fa-question-circle'
        }, {
            desc: 'signature', img: 'fa-signature'
        }, {
            desc: 'cancel', img: 'clear'
        }, {
            desc: 'clear', img: 'clear_all'
        }, {
            desc: 'ok', img: 'check'
        }, {
            desc: 'refresh', img: 'refresh'
        }, {
            desc: 'happy', img: 'fa-smile'
        }, {
            desc: 'sad', img: 'fa-sad-tear'
        }, {
            desc: 'frown', img: 'fa-frown'
        }, {
            desc: 'settings', img: 'settings'
        }, {
            desc: 'refresh-alt', img: 'autorenew'
        }, {
            desc: 'warning', img: 'fa-exclamation-triangle'
        }, {
            desc: 'history', img: 'history'
        }, {
            desc: 'upcoming', img: 'fa-angle-double-right'
        }, {
            desc: 'arrow-left', img: 'arrow_back'
        }, {
            desc: 'arrow-right', img: 'arrow_forward'
        }, {
            desc: 'arrow-down', img: 'arrow_downward'
        }, {
            desc: 'arrow-up', img: 'arrow_upward'
        }, {
            desc: 'arrow-left-v', img: 'keyboard_arrow_left'
        }, {
            desc: 'arrow-right-v', img: 'keyboard_arrow_right'
        }, {
            desc: 'arrow-down-v', img: 'keyboard_arrow_down'
        }, {
            desc: 'arrow-up-v', img: 'keyboard_arrow_up'
        }, {
            desc: 'arrow-left-circle', img: 'fa-arrow-alt-circle-left'
        }, {
            desc: 'arrow-right-circle', img: 'fa-arrow-alt-circle-right'
        }, {
            desc: 'arrow-down-circle', img: 'fa-arrow-alt-circle-down'
        }, {
            desc: 'arrow-up-circle', img: 'fa-arrow-alt-circle-up'
        }, {
            desc: 'arrow-left-circle-v', img: 'fa-chevron-circle-left'
        }, {
            desc: 'arrow-right-circle-v', img: 'fa-chevron-circle-right'
        }, {
            desc: 'arrow-down-circle-v', img: 'fa-chevron-circle-down'
        }, {
            desc: 'arrow-up-circle-v', img: 'fa-chevron-circle-up'
        }, {
            desc: 'breaks', img: 'fastfood'
        }, {
            desc: 'add', img: 'fa-plus'
        }, {
            desc: 'add user', img: 'fa-user-plus'
        }, {
            desc: 'notes', img: 'fa-sticky-note'
        }, {
            desc: 'addl info', img: 'mdi-rhombus-split'
        }, {
            desc: 'parts', img: 'fa-dolly-flatbed'
        }, {
            desc: 'submit', img: 'fa-clipboard-check'
        }, {
            desc: 'errand', img: 'fa-running'
        }, {
            desc: 'call', img: 'call'
        }, {
            desc: 'remote support', img: 'mdi-remote-desktop' //'mdi-face-agent'//'mdi-teamviewer'
        }, {
            desc: 'version', img: 'fa-code-branch'
        }, {
            desc: 'space used', img: 'fa-sim-card' // fa-hdd
        }, {
            desc: 'help feedback', img: 'fa-comments'
        }, {
            desc: 'app update', img: 'system_update'
        }, {
            desc: 'app updated', img: 'mdi-check-decagram'
        }, {
            desc: 'update', img: 'mdi-update'
        }, {
            desc: 'office opts', img: 'fa-mail-bulk'
        }, {
            desc: 'tech opts', img: 'fa-tools'
        }, {
            desc: 'schedule', img: 'fa-calendar-alt'
        }, {
            desc: 'filters', img: 'fa-filter'
        }, {
            desc: 'pop out', img: ''
        }, {
            desc: 'options', img: 'fa-cogs' //'fa-bezier-curve' //'fa-balance-scale-right'
        }, {
            desc: 'alert', img: 'fa-exclamation-circle'
        }, {
            desc: 'switch', img: 'fa-exchange-alt'
        }, {
            desc: 'job', img: 'home_work'
        }, {
            desc: 'search', img: 'fa-search'
        }, {
            desc: 'email', img: 'fa-envelope'
        }, {
            desc: 'undo', img: 'undo'
        }, {
            desc: 'contacts', img: 'fa-address-book'
        }, {
            desc: 'contact', img: 'fa-address-card'
        }, {
            desc: 'aging', img: 'fa-file-invoice-dollar'
        }, {
            desc: 'device', img: 'mdi-monitor-cellphone-star' //'fa-mobile' // fa-tablet // fa-desktop // fa-laptop
        }, {
            desc: 'driver', img: 'mdi-steering'
        }, {
            desc: 'dpart chk', img: 'fa-check-double'
        }, {
            desc: 'pricing', img: 'fa-tag' // 'fa-money-bill-wave'
        }, {
            desc: 'payroll', img: 'fa-money-check'
        }, {
            desc: 'money', img: 'fa-dollar-sign'
        }, {
            desc: 'pay method', img: 'fa-money-check-alt'
        }, {
            desc: 'po', img: 'fa-shopping-cart' // purchase order
        }, {
            desc: 'audit log', img: 'fa-list-ul'
        }, {
            desc: 'link', img: 'fa-link'
        }, {
            desc: 'debug', img: 'fa-bug'
        }, {
            desc: 'quote', img: 'mdi-comment-quote-outline' //'mdi-quora' // 'fa-quoara' NOTE: Can't use the one from font-awesome as it's a 'brand', but I can access the same thing on MDI! // 'fa-funnel-dollar' //'fa-briefcase' // 'fa-archway' // 'fa-comments-dollar' // 'fa-handshake'
        }, {
            desc: 'crow', img: 'fa-crow' // fa-dove // fa-dragon
        }, {
            desc: 'text msg', img: 'fa-comment' //'chat_bubble' //'fa-sms'
        }, {
            desc: 'upload', img: 'fa-upload'
        }, {
            desc: 'help', img: 'fa-question-circle'
        }, {
            desc: 'send', img: 'fa-paper-plane'
        }, {
            desc: 'terms', img: 'fa-money-bill-alt'
        }, {
            desc: 'warehouse', img: 'fa-warehouse'
        }, {
            desc: 'shop', img: 'fa-store-alt'
        }, {
            desc: 'unassigned wo', img: 'fa-user-alt-slash'
        }, {
            desc: 'branch', img: 'fa-building'
        }, {
            desc: 'payment', img: 'fa-credit-card'
        }, {
            desc: 'adjustment', img: 'fa-tag' //'fa-sliders-h'
        }, {
            desc: 'collections', img: 'fa-search-dollar'
        }, {
            desc: 'license', img: 'fa-id-badge'
        }, {
            desc: 'locale', img: 'fa-globe-americas'
        }, {
            desc: 'question', img: 'fa-question-circle'
        }, {
            desc: '1 time conv', img: 'mdi-database-import' //'fa-sync-alt' //'mdi-numeric-1-circle'
        }, {
            desc: 'excel', img: 'fa-file-excel' // 'mdi-microsoft-excel'
        }, {
            desc: 'csv', img: 'fa-file-csv'
        }, {
            desc: 'import', img: 'fa-file-import'
        }, {
            desc: 'check mark', img: 'fa-check'
        }, {
            desc: 'check mark circle', img: 'fa-check-circle'
        }, {
            desc: 'check mark square', img: 'fa-check-square'
        }, {
            desc: 'print', img: 'mdi-printer' //'fa-print'
        }, {
            desc: 'file_upload', img: 'file-upload'
        }, {
            desc: 'edit', img: 'edit'
        }, {
            desc: 'undo-img', img: 'fas fa-undo-alt fa-lg'
        }, {
            desc: 'redo', img: 'fas fa-redo-alt fa-lg'
        }, {
            desc: 'trash', img: 'fas fa-trash-alt fa-lg'
        }, {
            desc: 'pencil', img: 'fas fa-pencil-alt fa-lg'
        }, {
            desc: 'text', img: 'fas fa-font fa-lg'
        }, {
            desc: 'square-empty', img: 'far fa-square fa-lg'
        }, {
            desc: 'drag', img: 'fas fa-arrows-alt fa-lg'
        }, {
            desc: 'circle', img: 'far fa-circle fa-lg'
        },{
            desc: 'crop', img: 'fas fa-crop-alt fa-lg'
        }, {
            desc: 'point', img: 'fas fa-hand-point-left'
        }, {
            desc: 'save', img: 'fa-save'
        }, {
            desc: 'move', img: 'mdi-drag-variant'
        }, {
            desc: 'arrow-angle-right-up', img: 'call_made'
        }, {
            desc: 'arrow-upside-down', img: 'fas fa-long-arrow-alt-down fa-lg'
        }, {
            desc: 'eraser', img: 'fas fa-eraser'
        }, {
            desc: 'drop-down', img: 'arrow_drop_down'
        }, {
            desc: 'shapes', img: 'fas fa-shapes'
        }, {
            desc: 'ellipsis', img: 'fas fa-ellipsis-h'
        }, {
            desc: 'mobile device', img: 'fa-mobile'
        }, {
            desc: 'invoice', img: 'fa-file-invoice-dollar'
        }, {
            desc: 'insp cat', img: 'fa-list-alt'
        }, {
            desc: 'grip', img: 'fas fa-grip-lines'
        }, {
            desc: 'quick start', img: 'fa-bolt'
        }, {
            desc: 'barcode', img: 'mdi-barcode-scan'
        }, {
            desc: 'double check', img: 'fa-check-double'
        }, {
            desc: 'database', img: 'fa-database'
        }, {
            desc: 'server', img: 'fa-server'
        }, {
            desc: 'menu', img: 'fa-bars'
        }, {
            desc: 'location', img: 'my_location'
        }, {
            desc: 'stripe', img: 'fa-stripe'
        }, {
            desc: 'credit card', img: 'fa-credit-card'
        }, {
            desc: 'bank', img: 'mdi-bank'
        }, {
            desc: 'multi select', img: 'fas fa-check-double'
        }, {
            desc: 'flag', img: 'fa-flag'
        }, {
            desc: 'user_preferences', img: 'mdi-tune'
        }, {
            desc: 'color legend', img: 'fa-palette'
        }, {
            desc: 'translate', img: 'fa-language'
        }, {
            desc: 'data push', img: 'mdi-database-export'
        }, {
            desc: 'home', img: 'home'
        }, {
            desc: 'reports', img: 'mdi-chart-line' // mdi-chart-bar
        }, {
            desc: 'ar', img: 'fa-coins'
        }, {
            desc: 'list mng', img: 'fa-list'
        }, {
            desc: 'tools', img: 'fa-tools'
        }, {
            desc: 'data util', img: 'mdi-folder-move'
        }, {
            desc: 'addl', img: ''
        }, {
            desc: 'view', img: 'mdi-eye-outline'
        }, {
            desc: 'no view', img: 'mdi-eye-off-outline'
        }, {
            desc: 'log', img: 'fa-list-ul' //'mdi-math-log'
        }, {
            desc: 'status', img: 'fa fa-hourglass'
        }, {
            desc: 'category', img: 'fas fa-boxes'
        }, {
            desc: 'notification', img: 'fa fa-bell'
        }, {
            desc: 'map marker', img: 'fa-map-marker-alt'
        }, {
            desc: 'manual journal', img: 'fa-book'
        }, {
            desc: 'geo', img: 'fa-map-marker-alt'
        }, {
            desc: 'map marker crossed out', img: 'location_off'//'mdi-map-marker-off'
        }, {
            desc: 'more opts', img: 'mdi-dots-horizontal-circle-outline'
        }, {
            desc: 'percent', img: 'fas fa-percent'
        }, {
            desc: 'cancel-circle-solid', img: 'fas fa-times-circle'
        }, {
            desc: 'cancel-circle-white', img: 'far fa-times-circle'
        }, {
            desc: 'times', img: 'fas fa-times'
        }, {
            desc: 'close', img: 'close'
        }, {
            desc: 'geo region', img: 'mdi-map-marker-radius'
        }, {
            desc: 'credit check', img: 'mdi-account-credit-card'
        }, {
            desc: 'gl codes', img: 'fa-book'
        }, {
            desc: 'revenue acct', img: 'fa-money-bill'
        }, {
            desc: 'expense acct', img: 'fa-receipt'
        }, {
            desc: 'asset acct', img: 'local_shipping'
        }, {
            desc: 'liability acct', img: 'money_off'
        }, {
            desc: 'equity acct', img: 'fa-hand-holding-usd'
        }, {
            desc: 'bank acct', img: 'mdi-bank'
        }, {
            desc: 'unions', img: 'mdi-alpha-u-circle-outline'
        }, {
            desc: 'my docs', img: 'fas fa-id-card alt'
        }, {
            desc: 'minus', img: 'fa-minus'
        }, {
            desc: 'surplus', img: 'mdi-cash-plus'
        },{
            desc: 'calendar', img: 'fa-calendar-alt'
        }, {
            desc: 'vendor', img: 'fa-store-alt'
        }, {
            desc: 'user sec', img: 'fa-user-lock'
        }, {
            desc: 'rate of pay', img: 'mdi-cash-usd'
        }, {
            desc: 'sandbox', img: 'mdi-package-variant'
        }, {
            desc: 'checks', img: 'fa-money-check'
        }, {
            desc: 'bills', img: 'fa-receipt'
        }, {
            desc: 'sched week', img: 'fas fa-calendar-week'
        }, {
            desc: 'time card mode', img: 'fas fa-user-clock'
        }, {
            desc: 'bal sheet', img: 'fa-balance-scale'
        }, {
            desc: 'pnl', img: 'mdi-finance'
            // Profit & Loss
        }, {
            desc: 'graph', img: 'fa-chart-bar'
        }, {
            desc: 'group', img: 'mdi-group'
        }, {
            desc: 'android', img: 'mdi-android'
        }, {
            desc: 'ios', img: 'mdi-apple-ios' // couldn't find anything good for this one... SRR 12/04/2023
        }, {
            desc: 'apple', img: 'mdi-apple'
        }, {
            desc: 'windows', img: 'mdi-microsoft-windows'
        }, {
            desc: 'edge', img: 'fa-edge' // doesn't seem to work but can't find one that does... SRR 12/04/2023
        }, {
            desc: 'firefox', img: 'mdi-firefox'
        }, {
            desc: 'chrome', img: 'mdi-google-chrome'
        }, {
            desc: 'safari', img: 'mdi-apple-safari'
        }, {
            desc: 'backup database', img: 'mdi-database-arrow-down'
        }, {
            desc: 'switch camera', img: 'fa-solid fa-camera-rotate'
        }, {
            desc: 'reset', img: 'fa-solid fa-arrows-rotate'
        }, {
            desc: '', img: ''
        }, {
            desc: '', img: ''
        }, {
            desc: '', img: ''
        }, {
            desc: '', img: ''
        }, {
            desc: '', img: ''
        }

    ],
    

    //***************************************************************
    getIcon(mdesc) {
        // mdesc = Char. i.e. 'welcome'

        mdesc = mdesc.toLowerCase();

        var mRetVal = '';
       
        var oIcon = this.aIcons.find((obj) => {
            return obj.desc == mdesc;
        });

        if (!oIcon){
            mRetVal = 'Icon: ' + mdesc + ' not found';
            return mRetVal;
        }

        mRetVal = oIcon.img;
        if (!mRetVal){
            //mRetVal = '';
            mRetVal = "'" + mdesc + "' icon not defined";
        }

        return mRetVal;
    } // get desc
    
}
</script>