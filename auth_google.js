// Authenticating with Google // Authenticating with Google 
var GoogleAuth = require('google-auth-library'); // from https://www.npmjs.com/package/google-auth-library 
var path    = require('path');
var fs = require('fs');
 var grpc = require('grpc');
 var authProto = grpc.load('assistant.proto');
 var cert = path.resolve(__dirname, 'ca-ctr.pem'),
    key = path.resolve(__dirname, 'ca-key.pem');
   var root_certs = {
   key: fs.readFileSync(key) ,
   cert: fs.readFileSync(cert)
} ;
var ssl_creds = grpc.credentials.createSsl(root_certs.keys);
(new GoogleAuth()).getApplicationDefault(function(err, auth) {
  var call_creds = grpc.credentials.createFromGoogleCredential(auth);
  var combined_creds = grpc.credentials.combineChannelCredentials(ssl_creds, call_creds);
  var stub = new authProto.Greeter('greeter.googleapis.com', combined_credentials);
});
