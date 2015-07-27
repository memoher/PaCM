(function () {

// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

    .config(function ($stateProvider, $urlRouterProvider) {

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider

            // setup an abstract state for the tabs directive
            .state('tab', {
                url: '/tab',
                abstract: true,
                templateUrl: 'templates/tabs.html'
            })

            // Each tab has its own nav history stack:

            .state('tab.new', {
                url: '/new',
                views: {
                    'tab-new': {
                        templateUrl: 'templates/tab-new.html',
                        controller: 'newCtrl'
                    }
                }
            })

            .state('tab.records', {
                url: '/records',
                views: {
                    'tab-records': {
                        templateUrl: 'templates/tab-records.html',
                        controller: 'recordsCtrl'
                    }
                }
            })

            .state('tab.tools', {
                url: '/tools',
                views: {
                    'tab-tools': {
                        templateUrl: 'templates/tab-tools.html',
                        controller: 'toolsCtrl'
                    }
                }
            });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/tab/records');

    })

    .run(function ($ionicPlatform, dbContext) {

        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);

            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleLightContent();
            }
        });
        
        dbContext.beginTransaction(function (tx) {
            tx
            .insert('CfgCountries', { name: 'Colombia', guid: '123' })
            .insert('CfgCountries', { name: 'Perú', guid: '456' })
            .insert('CfgCountries', { name: 'Argentina', guid: '456' })
            .insert('CfgCountries', { name: 'Venezuela', guid: '456' })
            .insert('CfgCountries', { name: 'Panamá', guid: '456' })
            ;
        });

//        dbContext.beginTransaction(function (tx) {
//            console.debug(new Date(), 1);
//            tx
//            .dropTable('LOGS')
//            .createTable('LOGS', [{
//                name: 'id',
//                type: 'integer',
//                primaryKey: true,
//                autoIncrement: true,
//                required: true
//            }, {
//                name: 'log',
//                required: true
//            }])
//            .executeSql('INSERT INTO LOGS (id, log) VALUES (1, "foobar")')
//            .executeSql('INSERT INTO LOGS (id, log) VALUES (2, "foobar")')
//            .executeSql('INSERT INTO LOGS (id, log) VALUES (3, "foobar")')
//            .executeSql('SELECT * FROM LOGS')
//            .select('LOGS')
//            .insert('LOGS', {id: 4, log:'123'})
//            .update('LOGS', {log:'123'}, { where: { conditions: 'id=?', parameters: [3] }})
//            .select('LOGS', { where: { conditions: 'log=?', parameters: ["foobar"] }})
//            .delete('LOGS', { where: { conditions: 'id=?', parameters: [1] }})
//            .select('LOGS');
//            console.debug(new Date(), 2);
//        });
        

    });

})();