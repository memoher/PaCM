(function () {
    
    PaCM.controllersModule.controller('toolsCtrl', function ($scope, $state, synchronizer, userSession) {

        if (!userSession.isLogged()) {
            $state.go('app.login');
        }

        var _self = {}; //Objeto en el que se declaran todas las funciones, objetos, arrays y demas de uso privado

        $scope.runningProcess = false;

        $scope.sigOut = function () {
            userSession.sigOut();
            $state.go('app.login');
        };

        $scope.synchronizeData = function () {
            $scope.runningProcess = true;
            synchronizer.run(
                function () {
                    $scope.runningProcess = false;
                    $scope.$digest();
                    alert('Data synchronized successfully');
                },
                function (err) {
                    $scope.runningProcess = false;
                    $scope.$digest();
                    PaCM.showErrorMessage(err, 'Fails during data synchronize');
                });
        };

        $scope.entriesConsoleLog = [];
        _self.refreshConsoleLog = function (level, msg) {
            while ($scope.entriesConsoleLog.length > 10) {
                $scope.entriesConsoleLog.splice(0, 1);
            }
            $scope.entriesConsoleLog.push({
                dateTime: new Date(),
                level: level,
                message: msg
            });
        }

        synchronizer.addEventOnRuning(_self.refreshConsoleLog);

        //---------------------------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------------------------
        
        $scope.$on('$destroy', function() {
            
            synchronizer.removeEventOnRuning(_self.refreshConsoleLog);

            PaCM.eachProperties($scope, function (key, value) {
                if (!(key.substring(0, 1) === '$')) {
                    //PaCM.cleaner(value);
                    delete $scope[key];
                }
            });

            PaCM.eachProperties(_self, function (key, value) {
                //PaCM.cleaner(value);
                delete _self[key];
            });
            delete _self;

        });
    });
    
})();