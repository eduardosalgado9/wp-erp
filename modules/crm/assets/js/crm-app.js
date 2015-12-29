// Vue Filter for Formatting Time
Vue.filter('formatAMPM', function (date) {
    date = new Date( date );
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
});

// Vue Filter for formatting date
Vue.filter('formatDate', function ( date, format ) {
    date = new Date( date );
    var month = date.getMonth(),
        day   = date.getDate(),
        year  = date.getFullYear(),
        monthArray = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ],
        monthName = monthArray[date.getMonth()];

    var pattern = {
       Y: year,
       mm: (month+1),
       MM: monthName,
       dd: day,
    };

    dateStr = format.replace(/Y|mm|dd|MM/gi, function(matched){
      return pattern[matched];
    });

    return dateStr;
});

// Vue filter for formatting Feed Header content
Vue.filter('formatFeedHeader', function ( feed ) {
    var header;
    var createdName = ( feed.created_by.ID == wpCRMvue.current_user_id ) ? 'You' : feed.created_by.display_name;

    switch( feed.type ) {
        case 'new_note':
            header = '<span class="timeline-feed-avatar"><img src="'+ feed.created_by.avatar + '"></span><span class="timeline-feed-header-text">' + createdName + ' cerated a note for ' + feed.contact.first_name + ' ' + feed.contact.last_name + '</span>';
            break;

        case 'email':
            header = '<span class="timeline-feed-avatar"><img src="'+ feed.created_by.avatar + '"></span><span class="timeline-feed-header-text">' + createdName + ' sent a email to ' + feed.contact.first_name + ' ' + feed.contact.last_name + '</span>';
            break;

        case 'log_activity':
            header = '<span class="timeline-feed-avatar"><img src="'+ feed.created_by.avatar + '"></span><span class="timeline-feed-header-text">' + createdName + ' created a log for ' + feed.contact.first_name + ' ' + feed.contact.last_name + '</span>';
            break;
    }

    return header;
});

// Vue filter for formatting Feeds as a group by object
Vue.filter('formatFeeds', function ( feeds ) {
    var feedsData = _.groupBy( feeds, function( data ) {
        return data.created_timeline_date;
    });

    return feedsData;
});

// Vue directive for Date picker
Vue.directive( 'datepicker', {
    bind: function () {
        var vm = this.vm;
        var key = this.expression;

        jQuery(this.el).datepicker({
            dateFormat: 'yy-mm-dd',
            changeMonth: true,
            changeYear: true,
            yearRange: '-100:+0',
            onSelect: function (date) {
                vm.$set(key, date);
            }
        });
    },
    update: function (val) {
        jQuery(this.el).datepicker('setDate', val);
    }
});


/**
 * Main Vue instance
 *
 * @param {object} [el, data, method, computed, compiled]
 *
 * @since 1.0
 *
 * @return void
 */
var vm = new Vue({
    el: '#erp-customer-feeds',

    data: {
        tabShow: 'new_note',
        feeds: {},
        validation: {},
        feedData : { 'message' : '' },
        isValid: false,
        customer_id : null,
    },

    compiled: function() {
        this.fetchFeeds()
    },

    methods: {

        /**
         * Add customer feeds
         *
         * @return {void}
         */
        addCustomerFeed: function() {

            vm.progreassStart('erp-crm-feed-nav-content');
            this.feedData._wpnonce = wpCRMvue.nonce;

            if ( this.feedData.type == 'log_activity' ) {
                this.feedData.log_date = this.dt;
            };

            jQuery.post( wpCRMvue.ajaxurl, this.feedData, function( resp ) {
                vm.feeds.splice( 0, 0, resp.data );
                document.getElementById("erp-crm-activity-feed-form").reset();
                vm.feedData.dt = this.dt;
                vm.progreassDone();
            });
        },

        /**
         * Show tab according to his ID
         *
         * @param  {string} id
         */
        showTab: function( id ){
            this.tabShow = id;
        },

        /**
         * Fetch all feeds when page loaded
         *
         * @return {[object]}
         */
        fetchFeeds: function() {
            var data = {
                action : 'erp_crm_get_customer_activity',
                customer_id : this.customer_id
            };

            jQuery.post( wpCRMvue.ajaxurl, data, function( resp ) {
                vm.feeds = resp.data;
            });


        },

        /**
         * Start Progressbar
         *
         * @param  {[string]} id
         */
        progreassStart: function( id ) {
            NProgress.configure({ parent: '#'+id });
            NProgress.start();
        },

        /**
         * Stop Progressbar
         *
         * @param  {[string]} id
         */
        progreassDone: function( id ) {
            NProgress.done();
        },
    },

    computed: {

        /**
         * Set Datepicker current date
         *
         * @return {[string]} [date string]
         */
        dt : function() {
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth()+1;
            var yyyy = today.getFullYear();

            if( dd < 10 ) {
                dd='0'+dd
            }

            if( mm < 10 ) {
                mm='0'+mm
            }

            today = yyyy+'-'+mm+'-'+dd;
            return today;
        },

        /**
         * Apply feed form validation
         *
         * @return {[void]}
         */
        validation: function() {

            if ( this.feedData.type == 'new_note' ) {
                return {
                    message : !!this.feedData.message
                }
            }

            if ( this.feedData.type == 'email' ) {
                return {
                    message : !!this.feedData.message,
                    email_subject : !!this.feedData.email_subject,
                }
            }

            if ( this.feedData.type == 'log_activity' ) {
                return {
                    message : !!this.feedData.message,
                    log_type : !!this.feedData.log_type,
                    log_date : !!this.dt,
                    log_time : !!this.feedData.log_time,
                }
            }

        },

        /**
         * Check whole form is valid or not for form submission
         *
         * @return {Boolean}
         */
        isValid: function() {
            var validation = this.validation

            if ( jQuery.isEmptyObject( validation ) ) return;

            return Object.keys( validation ).every(function(key){
                return validation[key]
            });
        }
    }
});

// Bind trix-editor value with v-model message
document.addEventListener('trix-change', function (e) {
    vm.feedData.message = e.path[0].innerHTML;
});