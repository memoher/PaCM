(function () {

    // PaCM Services

    PaCM.services = angular.module('pacmApp.services', []);


    // PaCM Controllers

    PaCM.controllers = angular.module('pacmApp.controllers', []);
        

    // PaCM App

    angular.module('pacmApp', ['ionic', 'pacmApp.services', 'pacmApp.controllers'])

        .run(function ($ionicPlatform, dbInstaller, dbSynchronizer) {

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
                // Check if database installed, update otherwise
                dbInstaller.checkDatabase(
                    function () {
                        // Initialize dbSynchronizer service
                        dbSynchronizer.start();
                    },
                    function (err) {
                        PaCM.showErrorMessage(err, 'Problemas durante el chequeo a la base de datos');
                    });
            });

        })
        
        .config(function ($ionicConfigProvider) {
            
            // Set the tabs in the bottom position
            $ionicConfigProvider.tabs.position('bottom');
        })

        .config(function ($stateProvider, $urlRouterProvider) {

            // Ionic uses AngularUI Router which uses the concept of states
            // Learn more here: https://github.com/angular-ui/ui-router
            // Set up the various states which the app can be in.
            // Each state's controller can be found in controllers.js
            $stateProvider

                // setup an abstract state for the tabs directive
                // .state('app', {
                //     url: '/app',
                //     abstract: true,
                //     templateUrl: 'templates/menu.html',
                //     controller: 'appCtrl'
                // })

                // Each tab has its own nav history stack:
                
                .state('login', {
                    url: '/',
                    templateUrl: 'templates/login.html',
                    controller: 'loginCtrl',
                    cache: false
                })
                
                .state('home', {
                    url: '/home',
                    templateUrl: 'templates/home.html',
                    controller: 'homeCtrl',
                    cache: true
                })

                .state('records', {
                    url: '/records',
                    templateUrl: 'templates/records.html',
                    controller: 'recordsCtrl',
                    cache: true
                })

                .state('new', {
                    url: '/new',
                    templateUrl: 'templates/new.html',
                    controller: 'newCtrl',
                    cache: false
                })
                // .state('app.newByCustomer', {
                //     url: '/new/:customerId',
                //     views: {
                //         'menuContent': {
                //             templateUrl: 'templates/new.html',
                //             controller: 'newCtrl'
                //         }
                //     }
                // })
                // .state('app.newByCustomerAndElementType', {
                //     url: '/new/:customerId/:elmType/:elmId',
                //     views: {
                //         'menuContent': {
                //             templateUrl: 'templates/new.html',
                //             controller: 'newCtrl'
                //         }
                //     }
                // })

                // .state('app.customer', {
                //     url: '/customer/:name',
                //     views: {
                //         'menuContent': {
                //             templateUrl: 'templates/customer.html',
                //             controller: 'customerCtrl'
                //         }
                //     }
                // })

                // .state('app.details', {
                //     url: '/details/:maintenanceId',
                //     views: {
                //         'menuContent': {
                //             templateUrl: 'templates/new.html',
                //             controller: 'newCtrl'
                //         }
                //     }
                // })

                .state('tools', {
                    url: '/tools',
                    templateUrl: 'templates/tools.html',
                    controller: 'toolsCtrl'
                })

                ;

            // if none of the above states are matched, use this as the fallback
            $urlRouterProvider.otherwise('/tools');

        });

})();
