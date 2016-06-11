(function () {

    // PaCM Services

    PaCM.services = angular.module('pacmApp.services', []);


    // PaCM Controllers

    PaCM.controllers = angular.module('pacmApp.controllers', []);
        

    // PaCM App

    angular.module('pacmApp', ['ionic', 'pacmApp.services', 'pacmApp.controllers'])

        .run(function ($ionicPlatform, $ionicHistory, IONIC_BACK_PRIORITY, dbInstaller, dbSynchronizer) {

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

                $ionicPlatform.registerBackButtonAction(function (e) {
                    var backView = $ionicHistory.backView();
                    if (backView) {
                      // there is a back view, go to it
                      backView.go();
                    } else {
                      // there is no back view, so close the app instead
                      //ionic.Platform.exitApp();
                      e.preventDefault();
                      e.stopPropagation();
                      return false;
                    }
                  },
                  IONIC_BACK_PRIORITY.view
                );

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
                    url: '/login',
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
                    url: '/records/:type',
                    templateUrl: 'templates/records.html',
                    controller: 'recordsCtrl',
                    cache: true
                })

                .state('new-customer', {
                    url: '/new-customer',
                    templateUrl: 'templates/customer.html',
                    controller: 'customerCtrl',
                    cache: false
                })

                .state('new-customer2', {
                    url: '/new-customer/:name/:redirectTo/:redirectParams',
                    templateUrl: 'templates/customer.html',
                    controller: 'customerCtrl',
                    cache: false
                })

                .state('new-assembly', {
                    url: '/new-assembly/:type',
                    templateUrl: 'templates/assembly.html',
                    controller: 'assemblyCtrl',
                    cache: false
                })
                .state('new-assembly2', {
                    url: '/new-assembly/:type/:customerId',
                    templateUrl: 'templates/assembly.html',
                    controller: 'assemblyCtrl',
                    cache: false
                })

                .state('assembly', {
                    url: '/assembly/:assemblyId',
                    templateUrl: 'templates/assembly.html',
                    controller: 'assemblyCtrl',
                    cache: false
                })

                .state('new-maintenance', {
                    url: '/new-maintenance/:type',
                    templateUrl: 'templates/maintenance.html',
                    controller: 'maintenanceCtrl',
                    cache: false
                })
                .state('new-maintenance2', {
                    url: '/new-maintenance/:type/:customerId',
                    templateUrl: 'templates/maintenance.html',
                    controller: 'maintenanceCtrl',
                    cache: false
                })
                .state('new-maintenance3', {
                    url: '/new-maintenance/:type/:customerId/:objectId',
                    templateUrl: 'templates/maintenance.html',
                    controller: 'maintenanceCtrl',
                    cache: false
                })

                .state('maintenance', {
                    url: '/maintenance/:maintenanceId',
                    templateUrl: 'templates/maintenance.html',
                    controller: 'maintenanceCtrl',
                    cache: false
                })

                /*.state('tools', {
                    url: '/tools',
                    templateUrl: 'templates/tools.html',
                    controller: 'toolsCtrl'
                })*/

                ;

            // if none of the above states are matched, use this as the fallback
            $urlRouterProvider.otherwise('/login');

        });

})();
