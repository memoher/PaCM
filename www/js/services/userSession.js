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
                    throw '1 - El usuario o la contraseña no es válido';
                
                var pass = dataContext.get('Key', user.PasswordId);
                var hash = crytographySHA1.getHash(password, pass.Salt);
                alert(hash + '   ' + pass.Hash);
                if (hash != pass.Hash)
                    throw '2 - El usuario o la contraseña no es válido';
                
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