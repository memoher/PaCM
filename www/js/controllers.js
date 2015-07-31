(function () {

    angular.module('starter.controllers', [])

            .controller('newCtrl', function ($scope) {

            })

            .controller('recordsCtrl', function ($scope) {

            })

            .controller('toolsCtrl', function ($scope, dbContext) {

                $scope.runningProcess = false;
                
                $scope.installDatabase = function () {
                    $scope.runningProcess = true;
                    dbContext.installDatabase(
                        function (successMessage) {
                            $scope.runningProcess = false;
                            $scope.$apply();
                            alert(successMessage);
                        },
                        function (errorMessage) {
                            $scope.runningProcess = false;
                            $scope.$apply();
                            alert(errorMessage);
                        },
                        false);
                };
                
                $scope.importData = function () {
                    $scope.runningProcess = true;
                    dbContext.importData(
                        function (successMessage) {
                            $scope.runningProcess = false;
                            $scope.$apply();
                            alert(successMessage);
                        },
                        function (errorMessage) {
                            $scope.runningProcess = false;
                            $scope.$apply();
                            alert(errorMessage);
                        },
                        false);
                };
            })

            .controller('homeCtrl', function ($scope, dbContext) {
                $scope.countries = [];
                $scope.getCountries = function () {
                    dbContext.beginTransaction(function (tx) {
                        tx.select('CfgCountries', {
                            successCallback: function (sqlResultSet) {
                                $scope.countries.push({Name: 'Colombia'});
                                $scope.countries.push({Name: 'Venezuela'});
                                for (var i = 0; i < sqlResultSet.rows.length; i++) {
                                    var r = sqlResultSet.rows.item(i);
                                    $scope.countries.push({
                                        Name: r.Name
                                    });
                                }
                                $scope.$apply();
                                //alert('Number of countries ' + $scope.model.countries.length);
                            }
                        });
                    });
                };
            })

            .controller('maintenanceCtrl', function ($scope) {
                $scope.model = {};
            })

            .controller('ChatsCtrl', function ($scope, Chats) {
                // With the new view caching in Ionic, Controllers are only called
                // when they are recreated or on app start, instead of every page change.
                // To listen for when this page is active (for example, to refresh data),
                // listen for the $ionicView.enter event:
                //
                //$scope.$on('$ionicView.enter', function(e) {
                //});

                $scope.chats = Chats.all();
                $scope.remove = function (chat) {
                    Chats.remove(chat);
                };
            })

            .controller('ChatDetailCtrl', function ($scope, $stateParams, Chats) {
                $scope.chat = Chats.get($stateParams.chatId);
            });

})();