(function () {

angular.module('starter.controllers', [])

    .controller('homeCtrl', function ($scope, dbContext) {
        $scope.countries = [];
        $scope.getCountries = function () {
            dbContext.beginTransaction(function (tx) {
                tx.select('CfgCountries', {
                    successCallback: function (sqlResultSet) {
                        $scope.countries.push({ Name: 'Colombia' });
                        $scope.countries.push({ Name: 'Venezuela' });
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

    .controller('maintenanceCtrl', function ($scope, dbContext) {
        $scope.model = {};
    })

    .controller('settingsCtrl', function ($scope, dbContext, synchronizeDataService) {
        $scope.synchronizeData = function () {
            synchronizeDataService.run();
        };
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