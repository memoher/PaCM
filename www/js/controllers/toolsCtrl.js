(function () {
    
    PaCM.controllersModule.controller('toolsCtrl', function ($scope, $state, synchronizer, userSession) {

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
                    _this.refreshUI();
                    alert('Data synchronized successfully');
                },
                function (err) {
                    $scope.runningProcess = false;
                    _this.refreshUI();
                    PaCM.showErrorMessage(err, 'Fails during data synchronize');
                });
        };

        $scope.entriesConsoleLog = [];
        _this.refreshConsoleLog = function (level, msg) {
            $scope.entriesConsoleLog.push({
                dateTime: new Date(),
                level: level,
                message: msg
            });
            if ($scope.entriesConsoleLog.length > 10) {
                $scope.entriesConsoleLog.shift();
            }
            _this.refreshUI();
        }

        synchronizer.addEventOnRuning(_this.refreshConsoleLog);


        _this.timeoutRefreshUI = null;
        _this._onRefreshUI = function () {
            _this.timeoutRefreshUI = null;
            $scope.$digest();
        };
        _this.refreshUI = function () {
            if (_this.timeoutRefreshUI) {
                clearTimeout(_this.timeoutRefreshUI);
                _this.timeoutRefreshUI = null;
            }
            _this.timeoutRefreshUI = setTimeout(_this._onRefreshUI, 100);
        }
        _this.refreshUI();

        //---------------------------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------------------------
        
        $scope.$on('$destroy', function() {
            
            synchronizer.removeEventOnRuning(_this.refreshConsoleLog);

            PaCM.cleaner($scope);
            PaCM.cleaner(_this); _this = null;

        });
    });
    
})();