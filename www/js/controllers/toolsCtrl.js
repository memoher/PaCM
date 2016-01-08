(function () {
    
    PaCM.controllersModule.controller('toolsCtrl', function ($scope, $state, synchronizer, userSession) {

        if (!(userSession.isLogged === true)) {
            $state.go('app.login');
        }

        var _this = this; //Objeto en el que se declaran todas las funciones, objetos, arrays y demas de uso privado

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
        _this.refreshConsoleLog = function (level, msg) {
            while ($scope.entriesConsoleLog.length > 10) {
                $scope.entriesConsoleLog.splice(0, 1);
            }
            $scope.entriesConsoleLog.push({
                dateTime: new Date(),
                level: level,
                message: msg
            });
        }

        synchronizer.addEventOnRuning(_this.refreshConsoleLog);

        //---------------------------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------------------------
        
        $scope.$on('$destroy', function() {
            
            synchronizer.removeEventOnRuning(_this.refreshConsoleLog);

            PaCM.cleaner($scope);
            PaCM.cleaner(_this); delete _this;

        });
    });
    
})();