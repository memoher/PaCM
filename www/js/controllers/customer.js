(function () {
    
    PaCM.controllersModule.controller('customerCtrl', function ($scope, $state, $stateParams, searcherPopup, dataContext, userSession) {

        if (!(userSession.isLogged === true)) {
            $state.go('app.login');
        }

        var _this = this; //Objeto en el que se declaran todas las funciones, objetos, arrays y demas de uso privado

        $scope.runningProcess = false;
        $scope.showErrors = true;

        _this.onSqlError = function (err) {
            $scope.runningProcess = false;
            $scope.$digest();
            PaCM.showErrorMessage(err);
            throw err;
        }

        // Create the modal popup searcher
        searcherPopup.initialize($scope);
        
        $scope.filters = {
            countrySearch: null,
            stateSearch: null,
            citySearch: null
        };
        
        $scope.searchCountry = function () {
            dataContext.find('Country', { orderBy: 'Name' }, function (countries) {
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
                    $scope.filters.countrySearch,
                    function (r) {
                        $scope.resetCountry();
                        if (r === $scope.searcher.search) {
                            $scope.customer.countryName = r;
                        } else {
                            $scope.customer.countryId = r.Id;
                            $scope.customer.countryName = r.Name;
                        }
                        $scope.filters.countrySearch = $scope.searcher.search;
                    }, true);
            });
        };
        $scope.resetCountry = function () {
            $scope.customer.countryId = null;
            $scope.customer.countryName = null;
            $scope.filters.countrySearch = null;
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

            dataContext.find('State', options, function (states) {
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
                    $scope.filters.stateSearch,
                    function (r) {
                        $scope.resetState();
                        if (r === $scope.searcher.search) {
                            $scope.customer.stateName = r;
                        } else {
                            $scope.customer.stateId = r.Id;
                            $scope.customer.stateName = r.Name;
                            $scope.customer.countryId = r.CountryId;
                            dataContext.get('Country', $scope.customer.countryId, function (c) {
                                $scope.customer.countryName = c.Name;
                            });
                        }
                        $scope.filters.stateSearch = $scope.searcher.search;
                    }, true);
            });
        };
        $scope.resetState = function () {
            $scope.customer.stateId = null;
            $scope.customer.stateName = null;
            $scope.filters.stateSearch = null;
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

            dataContext.find('City', options, function (cities) {
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
                    $scope.filters.citySearch,
                    function (r) {
                        $scope.resetCity();
                        if (r === $scope.searcher.search) {
                            $scope.customer.cityName = r;
                        } else {
                            $scope.customer.cityId = r.Id;
                            $scope.customer.cityName = r.Name;
                            $scope.customer.stateId = r.StateId;
                            dataContext.get('State', $scope.customer.stateId, function (s) {
                                $scope.customer.stateName = s.Name;
                                $scope.customer.countryId = s.CountryId;
                                dataContext.get('Country', $scope.customer.countryId, function (c) {
                                    $scope.customer.countryName = c.Name;
                                });
                            });
                        }
                        $scope.filters.citySearch = $scope.searcher.search;
                    }, true);
            });
        };
        $scope.resetCity = function () {
            $scope.customer.cityId = null;
            $scope.customer.cityName = null;
            $scope.filters.citySearch = null;
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
            actions.push(_this.saveCountry);
            actions.push(_this.saveState);
            actions.push(_this.saveCity);
            actions.push(_this.saveCustomer);
            
            $scope.runningProcess = true;
            PaCM.execute(actions, function () {
                $scope.runningProcess = false;
                _this.refreshUI();
                alert('Registro guardado con éxito');
                $state.go('app.newByCustomer', {
                    customerId: $scope.customer.id
                });
            });
        }

        _this.saveCountry = function (onSuccess) {
            var r = {
                Name: $scope.customer.countryName
            };
            dataContext.save('Country', $scope.customer.countryId, r, function () {
                $scope.customer.countryId = r.Id;
                PaCM.cleaner(r); r = null;
                onSuccess();
            }, _this.onSqlError);
        }
        _this.saveState = function (onSuccess) {
            var r = {
                CountryId: $scope.customer.countryId,
                Name: $scope.customer.stateName
            };
            dataContext.save('State', $scope.customer.stateId, r, function () {
                $scope.customer.stateId = r.Id;
                PaCM.cleaner(r); r = null;
                onSuccess();
            }, _this.onSqlError);
        }
        _this.saveCity = function (onSuccess) {
            var r = {
                StateId: $scope.customer.stateId,
                Name: $scope.customer.cityName
            };
            dataContext.save('City', $scope.customer.cityId, r, function () {
                $scope.customer.cityId = r.Id;
                PaCM.cleaner(r); r = null;
                onSuccess();
            }, _this.onSqlError);
        }
        _this.saveCustomer = function (onSuccess) {
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
            dataContext.save('Customer', $scope.customer.id, r, function () {
                $scope.customer.id = r.Id;
                PaCM.cleaner(r); r = null;
                onSuccess();
            }, _this.onSqlError);
        }

        $scope.resources = {
            identityTypes: []
        };
        _this.getResources = function () {
            dataContext.find('IdentityType', { orderBy: 'Name' }, function (identityTypes) {
                PaCM.eachArray(identityTypes, function (inx, it) {
                    $scope.resources.identityTypes.push({
                        id: it.Id,
                        shortName: it.ShortName
                    });
                });
            });

            //Valores iniciales
            dataContext.first('IdentityType', { where: 'lower(ShortName) = lower(?)', parameters: ['nit'] }, function (it) {
                if (!(it === null)) {
                    $scope.customer.identityTypeId = it.Id;
                }
            });
            dataContext.first('Country', { where: 'lower(Name) = lower(?)', parameters: [ 'colombia' ] }, function (c) {
                if (!(c === null)) {
                    $scope.customer.countryId = c.Id;
                    $scope.customer.countryName = c.Name;
                }
            });
        }

        _this.getResources();


        _this.timeoutRefreshUI = null;
        _this.onRefreshUI = function () {
            _this.timeoutRefreshUI = null;
            $scope.$digest();
        }
        _this.refreshUI = function () {
            if (_this.timeoutRefreshUI) {
                clearTimeout(_this.timeoutRefreshUI);
                _this.timeoutRefreshUI = null;
            }
            _this.timeoutRefreshUI = setTimeout(_this.onRefreshUI, 100);
        }
        _this.refreshUI();

        //---------------------------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------------------------
        
        $scope.$on('$destroy', function() {
            
            if (_this.timeoutRefreshUI) {
                clearTimeout(_this.timeoutRefreshUI);
                _this.timeoutRefreshUI = null;
            }

            $scope.searcher.destroy();
            PaCM.cleaner($scope);
            PaCM.cleaner(_this); _this = null;

        });
    });
    
})();