(function () {
    "use strict";

    // Servicio que mantiene la sesión de los usuarios activa
    
    PaCM.services.factory('userSession', function ($rootScope, crytographySHA1, dbRepository) {
        
        return $rootScope.userSession = {
            user: null,
            isLogged: false,
            isAdminUser: false,
            isEscolUser: false,
            sigIn: function (emailAddress, password, onSuccess, onError) {
                var self = this;

                dbRepository.first('User', { where: 'lower(EmailAddress) = lower(?) and Enabled = ?', parameters: [emailAddress, true] }, function (user) {
                    if (user == null)
                        throw 'El usuario o la contraseña no es válido';
                    
                    dbRepository.get('Key', user.PasswordId, function (pass) {
                        if (crytographySHA1.getHash(password, pass.Salt) != pass.Hash)
                            throw 'El usuario o la contraseña no es válido';

                        self.user = user;
                        self.isLogged = true;
                        self.isAdminUser = (user.Administrator) ? true : false;
                        self.isEscolUser = (user.CustomerId) ? false : true;
                        onSuccess();
                    }, onError);
                    
                }, onError);
            },
            sigOut: function () {
                var self = this;
                
                self.user = null;
                self.isLogged = false;
                self.isAdminUser = false;
                self.isEscolUser = false;
            }
        };
        
    });
    
})();