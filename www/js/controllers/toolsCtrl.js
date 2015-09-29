(function () {
    
    PaCM.controllersModule.controller('toolsCtrl', function ($scope, dbContext, synchronizer) {

        var debugMode = 1;
        
        $scope.runningProcess = false;

        $scope.installDatabase = function () {
            $scope.runningProcess = true;
            dbContext.installDatabase(
                function () {
                    $scope.runningProcess = false;
                    $scope.$digest();
                    alert('Database installed successfully');
                },
                function (err) {
                    $scope.runningProcess = false;
                    $scope.$digest();
                    PaCM.showErrorMessage(err, 'Failure during installation of the database');
                },
                debugMode);
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
        var refreshConsoleLog = function (level, msg) {
            while ($scope.entriesConsoleLog.length > 10) {
                $scope.entriesConsoleLog.splice(1, 1);
            }
            $scope.entriesConsoleLog.push({
                dateTime: new Date().toLocaleString(),
                level: level,
                message: msg
            });
            if ($scope.runningProcess === false) {
                $scope.$digest();
            }
        }

        synchronizer.addEventOnRuning(refreshConsoleLog);
    });
    
})();