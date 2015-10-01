(function () {

    // PaCM Services

    PaCM.servicesModule = angular.module('pacmApp.services', []);


    // PaCM Controllers

    PaCM.controllersModule = angular.module('pacmApp.controllers', [])

        .controller('appCtrl', function ($scope) {
        });
        

    // PaCM App

    angular.module('pacmApp', ['ionic', 'pacmApp.controllers', 'pacmApp.services'])

        .run(function ($ionicPlatform, dbContext, synchronizer, userSession) {

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
                //dbContext.installDatabase(function () {});
                dbContext.checkDatabase(function () {
                    userSession.sigIn('julian_her@hotmail.com', '123456', function () {}, function () {});
                    // Initialize synchronizer service
                    synchronizer.start();
                });
            });

        })
        
        .config(function($ionicConfigProvider) {
            
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
                .state('app', {
                    url: '/app',
                    abstract: true,
                    templateUrl: 'templates/menu.html',
                    controller: 'appCtrl'
                })

                // Each tab has its own nav history stack:
                
                .state('app.login', {
                    url: '/login',
                    views: {
                        'menuContent': {
                            templateUrl: 'templates/login.html',
                            controller: 'loginCtrl'
                        }
                    }
                })

                .state('app.new', {
                    url: '/new',
                    views: {
                        'menuContent': {
                            templateUrl: 'templates/new.html',
                            controller: 'newCtrl'
                        }
                    }
                })
                .state('app.newByCustomer', {
                    url: '/new/:customerId',
                    views: {
                        'menuContent': {
                            templateUrl: 'templates/new.html',
                            controller: 'newCtrl'
                        }
                    }
                })
                .state('app.newByElm', {
                    url: '/new/:customerId/:elmType/:elmId',
                    views: {
                        'menuContent': {
                            templateUrl: 'templates/new.html',
                            controller: 'newCtrl'
                        }
                    }
                })

                .state('app.records', {
                    url: '/records',
                    views: {
                        'menuContent': {
                            templateUrl: 'templates/records.html',
                            controller: 'recordsCtrl'
                        }
                    }
                })

                .state('app.details', {
                    url: '/details/:maintenanceId',
                    views: {
                        'menuContent': {
                            templateUrl: 'templates/new.html',
                            controller: 'newCtrl'
                        }
                    }
                })

                .state('app.tools', {
                    url: '/tools',
                    views: {
                        'menuContent': {
                            templateUrl: 'templates/tools.html',
                            controller: 'toolsCtrl'
                        }
                    }
                });

            // if none of the above states are matched, use this as the fallback
            $urlRouterProvider.otherwise('/app/history');

        });

})();