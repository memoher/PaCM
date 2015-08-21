(function () {
    
    PaCM.servicesModule.factory('userSession', function ($rootScope, crytographySHA1, dataContext) {
        
        var userSession = $rootScope.userSession = {
            user: null,
            isLogged: function () {
                var self = this;
                return (self.user);
            },
            sigIn: function (emailAddress, password) {
                var self = this;
                var user = dataContext.first('User', { EmailAddress: emailAddress, Enabled: true });
                if (user == null)
                    throw 'El usuario o la contraseña no es válido';
                
                var pass = dataContext.get('Key', user.PasswordId);
                var hash = crytographySHA1.getHash(password, pass.Salt);
                if (hash != pass.Hash)
                    throw 'El usuario o la contraseña no es válido';
                
                self.user = user;
            },
            sigOut: function () {
                var self = this;
                
                self.user = null;
            }
        };
    
        return userSession;
        
    });
    
})();