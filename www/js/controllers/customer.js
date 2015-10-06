(function () {
    
    PaCM.controllersModule.controller('customerCtrl', function ($scope, $state, $ionicModal, dataContext, userSession) {

        if (!userSession.isLogged) {
            $state.go('app.login');
        }

        var _self = {}; //Objeto en el que se declaran todas las funciones, objetos, arrays y demas de uso privado

        $scope.runningProcess = false;
        $scope.showErrors = false;

        _self.onSqlError = function (err) {
            $scope.runningProcess = false;
            $scope.$digest();
            PaCM.showErrorMessage(err);
            throw err;
        }

        // Create the modal popup searcher
        $scope.searcher = {};
        $ionicModal.fromTemplateUrl('templates/searcher.html', {
            scope: $scope,
            focusFirstInput: false
        }).then(function(modal) {
            $scope.modal = modal;
            $scope.searcher.open = function (type, title, data, search, onSelect) {
                var self = this;
                
                self.type = type;
                self.title = title;
                self.data = data;
                self.search = search ? search : PaCM.getStringEmpty();
                self.selectRecord = onSelect;
                
                $scope.modal.show();
            };
            $scope.searcher.close = function () {
                var self = this;
                
                delete self.type;
                delete self.title;
                PaCM.cleaner(self.data); delete self.data;
                delete self.search;
                delete self.selectRecord;
                
                $scope.modal.hide();
            };
        });
        
        $scope.filters = {
            countrySearch: null,
            stateSearch: null,
            citySearch: null
        };
        
        $scope.searchCountry = function () {
            dataContext.find('Country', { orderBy: 'Name' }, function (countries) {
                if ($scope.customer.countryId != null) {
                    PaCM.eachArray(countries, function (inx, c) {
                        if (c.Id == $scope.customer.countryId) {
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
                        $scope.customer.countryId = r.Id;
                        $scope.customer.countryName = r.Name;
                        $scope.filters.countrySearch = $scope.searcher.search;
                        $scope.resetState();
                        $scope.searcher.close();
                    });
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
            if ($scope.customer.countryId != null)
                options.where.CountryId = $scope.customer.countryId;

            dataContext.find('State', options, function (states) {
                if ($scope.customer.stateId != null) {
                    PaCM.eachArray(states, function (inx, c) {
                        if (c.Id == $scope.customer.stateId) {
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
                        $scope.customer.stateId = r.Id;
                        $scope.customer.stateName = r.Name;
                        $scope.customer.countryId = r.CountryId;
                        $scope.filters.stateSearch = $scope.searcher.search;
                        dataContext.get('Country', $scope.customer.countryId, function (c) {
                            $scope.customer.countryName = c.Name;
                        });
                        $scope.resetCity();
                        $scope.searcher.close();
                    });
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
            if ($scope.customer.stateId != null)
                options.where.StateId = $scope.customer.stateId;

            dataContext.find('City', options, function (cities) {
                if ($scope.customer.cityId != null) {
                    PaCM.eachArray(cities, function (inx, c) {
                        if (c.Id == $scope.customer.cityId) {
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
                        $scope.customer.cityId = r.Id;
                        $scope.customer.cityName = r.Name;
                        $scope.customer.stateId = r.StateId;
                        $scope.filters.citySearch = $scope.searcher.search;
                        dataContext.get('State', $scope.customer.stateId, function (s) {
                            $scope.customer.stateName = s.Name;
                            $scope.customer.countryId = s.CountryId;
                            dataContext.get('Country', $scope.customer.countryId, function (c) {
                                $scope.customer.countryName = c.Name;
                            });
                        });
                        $scope.searcher.close();
                    });
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
            name: null,
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
        $scope.saveCustomer = function (customerValid) {

            if (!(customerValid === true)) {
                $scope.showErrors = true;
                return false;
            }

            var actions = [];
            actions.push(_self.saveCountry);
            actions.push(_self.saveState);
            actions.push(_self.saveCity);
            actions.push(_self.saveCustomer);
            
            $scope.runningProcess = true;
            PaCM.execute(actions, function () {
                $scope.runningProcess = false;
                _self.refreshUI();
                alert('Registro guardado con éxito');
            });
        }

        _self.saveCountry = function (onSuccess) {
            var r = {
                Name: $scope.customer.countryName
            };
            dataContext.save('Country', $scope.customer.countryId, r, function () {
                $scope.customer.countryId = r.Id;
                PaCM.cleaner(r); delete r;
                onSuccess();
            }, _self.onSqlError);
        }
        _self.saveState = function (onSuccess) {
            var r = {
                CountryId: $scope.customer.countryId,
                Name: $scope.customer.stateName
            };
            dataContext.save('State', $scope.customer.stateId, r, function () {
                $scope.customer.stateId = r.Id;
                PaCM.cleaner(r); delete r;
                onSuccess();
            }, _self.onSqlError);
        }
        _self.saveCity = function (onSuccess) {
            var r = {
                StateId: $scope.customer.stateId,
                Name: $scope.customer.cityName
            };
            dataContext.save('City', $scope.customer.cityId, r, function () {
                $scope.customer.cityId = r.Id;
                PaCM.cleaner(r); delete r;
                onSuccess();
            }, _self.onSqlError);
        }
        _self.saveCustomer = function (onSuccess) {
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
                PaCM.cleaner(r); delete r;
                onSuccess();
            }, _self.onSqlError);
        }

        $scope.resources = {
            identityTypes: []
        };
        _self.getResources = function () {
            dataContext.find('IdentityType', { orderBy: 'Name' }, function (identityTypes) {
                PaCM.eachArray(identityTypes, function (inx, it) {
                    $scope.resources.identityTypes.push({
                        id: it.Id,
                        shortName: it.ShortName
                    });
                });
            });
        }

        _self.timeoutRefreshUI = null;
        _self.refreshUI = function () {
            if (_self.timeoutRefreshUI != null) {
                clearTimeout(_self.timeoutRefreshUI);
                _self.timeoutRefreshUI = null;
            }
            _self.timeoutRefreshUI = setTimeout(function () {
                _self.timeoutRefreshUI = null;
                $scope.$digest();
            }, 200);
        }

        _self.getResources();
        _self.refreshUI();

        //---------------------------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------------------------
        //---------------------------------------------------------------------------------------------------------
        
        $scope.$on('$destroy', function() {
            
            if (_self.timeoutRefreshUI != null) {
                clearTimeout(_self.timeoutRefreshUI);
                _self.timeoutRefreshUI = null;
            }

            $scope.searcher.close();
            $scope.modal.remove();

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