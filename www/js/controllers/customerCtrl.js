(function () {
    
    PaCM.controllers.controller('customerCtrl', function ($scope, $state, $stateParams, dbRepository, userSession, searcherPopup) {

        if (!(userSession.isLogged === true)) {
            $state.go('app.login');
        }

        var _priv = {}; //Objeto en el que se declaran todas las funciones, objetos, arrays y demas de uso privado

        $scope.runningProcess = false;
        $scope.showErrors = true;

        _priv.onSqlError = function (err) {
            $scope.runningProcess = false;
            $scope.$digest();
            PaCM.showErrorMessage(err);
            throw err;
        }

        // Create the modal popup searcher
        searcherPopup.initialize($scope);
        
        _priv.filters = {
            countrySearch: null,
            stateSearch: null,
            citySearch: null
        };
        
        $scope.searchCountry = function () {
            dbRepository.find('Country', { orderBy: 'Name' }, function (countries) {
                if ($scope.customer.countryId) {
                    var val = $scope.customer.countryId;
                    PaCM.eachArray(countries, function (inx, c) {
                        if (c.Id == val) {
                            c.Selected = true;
                            return true; //break;
                        }
                    });
                }
                $scope.searcher.open(
                    'Country',
                    'Buscar país',
                    countries,
                    _priv.filters.countrySearch,
                    function (r) {
                        $scope.resetCountry();
                        if (r === $scope.searcher.search) {
                            $scope.customer.countryName = r;
                        } else {
                            $scope.customer.countryId = r.Id;
                            $scope.customer.countryName = r.Name;
                        }
                        _priv.filters.countrySearch = $scope.searcher.search;
                    }, true);
            });

            return false;
        };
        $scope.resetCountry = function () {
            $scope.customer.countryId = null;
            $scope.customer.countryName = null;
            _priv.filters.countrySearch = null;
            $scope.resetState();
        };
        
        $scope.searchState = function () {
            var options = {
                where: {},
                orderBy: 'Name'
            };
            if ($scope.customer.countryName)
                options.where.CountryId = -1;
            if ($scope.customer.countryId)
                options.where.CountryId = $scope.customer.countryId;

            dbRepository.find('State', options, function (states) {
                if ($scope.customer.stateId) {
                    var val = $scope.customer.stateId;
                    PaCM.eachArray(states, function (inx, c) {
                        if (c.Id == val) {
                            c.Selected = true;
                            return true; //break;
                        }
                    });
                }
                $scope.searcher.open(
                    'State',
                    'Buscar departamento',
                    states,
                    _priv.filters.stateSearch,
                    function (r) {
                        $scope.resetState();
                        if (r === $scope.searcher.search) {
                            $scope.customer.stateName = r;
                        } else {
                            $scope.customer.stateId = r.Id;
                            $scope.customer.stateName = r.Name;
                            $scope.customer.countryId = r.CountryId;
                            dbRepository.get('Country', $scope.customer.countryId, function (c) {
                                $scope.customer.countryName = c.Name;
                            });
                        }
                        _priv.filters.stateSearch = $scope.searcher.search;
                    }, true);
            });

            return false;
        };
        $scope.resetState = function () {
            $scope.customer.stateId = null;
            $scope.customer.stateName = null;
            _priv.filters.stateSearch = null;
            $scope.resetCity();
        };
        
        $scope.searchCity = function () {
            var options = {
                where: {},
                orderBy: 'Name'
            };
            if ($scope.customer.countryName)
                options.where.CountryId = -1;
            if ($scope.customer.countryId)
                options.where.CountryId = $scope.customer.countryId;
            if ($scope.customer.stateName)
                options.where.StateId = -1;
            if ($scope.customer.stateId)
                options.where.StateId = $scope.customer.stateId;

            dbRepository.find('City', options, function (cities) {
                if ($scope.customer.cityId) {
                    var val = $scope.customer.cityId;
                    PaCM.eachArray(cities, function (inx, c) {
                        if (c.Id == val) {
                            c.Selected = true;
                            return true; //break;
                        }
                    });
                }
                $scope.searcher.open(
                    'City',
                    'Buscar ciudad',
                    cities,
                    _priv.filters.citySearch,
                    function (r) {
                        $scope.resetCity();
                        if (r === $scope.searcher.search) {
                            $scope.customer.cityName = r;
                        } else {
                            $scope.customer.cityId = r.Id;
                            $scope.customer.cityName = r.Name;
                            $scope.customer.stateId = r.StateId;
                            dbRepository.get('State', $scope.customer.stateId, function (s) {
                                $scope.customer.stateName = s.Name;
                                $scope.customer.countryId = s.CountryId;
                                dbRepository.get('Country', $scope.customer.countryId, function (c) {
                                    $scope.customer.countryName = c.Name;
                                });
                            });
                        }
                        _priv.filters.citySearch = $scope.searcher.search;
                    }, true);
            });

            return false;
        };
        $scope.resetCity = function () {
            $scope.customer.cityId = null;
            $scope.customer.cityName = null;
            _priv.filters.citySearch = null;
        };

        //---------------------------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------------------------

        $scope.customer = {
            identityTypeId: null,
            identity: null,
            name: $stateParams.name,
            shortName: null,
            countryId: null,
            countryName: null,
            stateId: null,
            stateName: null,
            cityId: null,
            cityName: null,
            address: null,
            postalCode: null,
            phoneNumber: null,
            webSite: null,
            contactName: null,
            contactEmailAddress: null
        };
        $scope.saveCustomer = function () {
            var actions = [];

            if (!($scope.customer.countryId))
                actions.push(_priv.saveCountry);

            if (!($scope.customer.stateId))
                actions.push(_priv.saveState);

            if (!($scope.customer.cityId))
                actions.push(_priv.saveCity);

            actions.push(_priv.saveCustomer);
            
            $scope.runningProcess = true;
            PaCM.execute(actions, function () {
                $scope.runningProcess = false;
                _priv.refreshUI();
                alert('Registro guardado con éxito');
                $state.go('app.newByCustomer', {
                    customerId: $scope.customer.id
                });
            });
        }

        _priv.saveCountry = function (onSuccess) {
            var r = {
                Name: $scope.customer.countryName
            };
            dbRepository.insert('Country', /*$scope.customer.countryId,*/ r, function () {
                $scope.customer.countryId = r.Id;
                PaCM.cleaner(r); r = null;
                onSuccess();
            }, _priv.onSqlError);
        }
        _priv.saveState = function (onSuccess) {
            var r = {
                CountryId: $scope.customer.countryId,
                Name: $scope.customer.stateName
            };
            dbRepository.insert('State', /*$scope.customer.stateId,*/ r, function () {
                $scope.customer.stateId = r.Id;
                PaCM.cleaner(r); r = null;
                onSuccess();
            }, _priv.onSqlError);
        }
        _priv.saveCity = function (onSuccess) {
            var r = {
                StateId: $scope.customer.stateId,
                Name: $scope.customer.cityName
            };
            dbRepository.insert('City', /*$scope.customer.cityId,*/ r, function () {
                $scope.customer.cityId = r.Id;
                PaCM.cleaner(r); r = null;
                onSuccess();
            }, _priv.onSqlError);
        }
        _priv.saveCustomer = function (onSuccess) {
            var r = {
                IdentityTypeId: $scope.customer.identityTypeId,
                Identity: $scope.customer.identity,
                Name: $scope.customer.name,
                ShortName: $scope.customer.shortName,
                CityId: $scope.customer.cityId,
                Address: $scope.customer.address,
                PostalCode: $scope.customer.postalCode,
                PhoneNumber: $scope.customer.phoneNumber,
                WebSite: $scope.customer.webSite,
                ContactName: $scope.customer.contactName,
                ContactEmailAddress: $scope.customer.contactEmailAddress,
                Enabled: true
            };
            dbRepository.insert('Customer', /*$scope.customer.id,*/ r, function () {
                $scope.customer.id = r.Id;
                PaCM.cleaner(r); r = null;
                onSuccess();
            }, _priv.onSqlError);
        }


        // Recursos

        $scope.resources = {
            identityTypes: []
        };
        _priv.getResources = function () {
            dbRepository.find('IdentityType', { orderBy: 'ShortName' }, function (identityTypes) {
                PaCM.eachArray(identityTypes, function (inx, it) {
                    $scope.resources.identityTypes.push({
                        id: it.Id,
                        shortName: it.ShortName
                    });
                });
            });

        }
        _priv.getResources();


        // Valores iniciales

        dbRepository.first('IdentityType', { where: 'lower(ShortName) = lower(?)', parameters: ['nit'] }, function (it) {
            if (!(it === null)) {
                $scope.customer.identityTypeId = it.Id;
            }
        });
        dbRepository.first('Country', { where: 'lower(Name) = lower(?)', parameters: [ 'colombia' ] }, function (c) {
            if (!(c === null)) {
                $scope.customer.countryId = c.Id;
                $scope.customer.countryName = c.Name;
            }
        });


        _priv.timeoutRefreshUI = null;
        _priv.onRefreshUI = function () {
            _priv.timeoutRefreshUI = null;
            $scope.$digest();
        }
        _priv.refreshUI = function () {
            if (_priv.timeoutRefreshUI) {
                clearTimeout(_priv.timeoutRefreshUI);
                _priv.timeoutRefreshUI = null;
            }
            _priv.timeoutRefreshUI = setTimeout(_priv.onRefreshUI, 100);
        }
        _priv.refreshUI();

        //---------------------------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------------------------
        
        $scope.$on('$destroy', function() {
            
            if (_priv.timeoutRefreshUI) {
                clearTimeout(_priv.timeoutRefreshUI);
                _priv.timeoutRefreshUI = null;
            }

            $scope.searcher.destroy();
            PaCM.cleaner($scope);
            PaCM.cleaner(_priv); _priv = null;

        });
    });
    
})();