// Authenticating with Google // Authenticating with Google
const {OAuth2Client} = require('google-auth-library');
var path    = require('path');
var fs = require('fs');
const http = require('http');
const url = require('url');
const querystring = require('querystring');
const opn = require('opn');
var PROTO_PATH = path.resolve(__dirname + '/protos/embedded_assistant.proto');
var grpc = require('grpc');
var authProto = grpc.load(PROTO_PATH);
var cert = path.resolve(__dirname, 'ca-crt.pem'),
    key = path.resolve(__dirname, 'ca-key.pem'),
    keys = require('./credentials.json'),
    root_certs = {
        key: fs.readFileSync(key) ,
        cert: fs.readFileSync(cert)
    } ,
    ssl_creds = grpc.credentials.createSsl(root_certs.keys),
    scope = 'https:/'+'/www.googleapis.com/auth/grpc-testing';

// Download your OAuth2 configuration from the Google
//const keys = require('./keys.json');
/*(new GoogleAuth()).getApplicationDefault(function(err, auth) {
            if(err){
            console.log(err);
}

          console.log(auth + ' Auth');
           if(auth){
           if (auth.createScopeRequired()) {
               auth = auth.createScoped(scope);
                 }
  var call_creds = grpc.credentials.createFromGoogleCredential(auth);
  var combined_creds = grpc.credentials.combineChannelCredentials(ssl_creds, call_creds);
  var stub = new authProto.Greeter('greeter.googleapis.com', combined_credentials);
}});

*/
/**
 * Create a new OAuth2Client, and go through the OAuth2 content
 * workflow.  Return the full client to the callback.
 */
function getAuthenticatedClient() {
    return new Promise((resolve, reject) => {
        // create an oAuth client to authorize the API call.  Secrets are kept in a `keys.json` file,
        // which should be downloaded from the Google Developers Console.
//    console.log(keys);
        console.log('Attempt to login on Google');
        const oAuth2Client = new OAuth2Client(
            keys.installed.client_id,
            keys.installed.client_secret,
            //'https:/'+'/console.dialogflow.com/api-client/'
            'https://proven-audio-203200.firebaseapp.com/__/auth/handler'
            // 'https:/'+'/console.actions.google.com/u/0/project/proven-audio-203200/overview'
//     'https:/' + '/proven-audio-203200.firebaseapp.com/__/auth/handler'
            //keys.redirect_uris[0]
        );

        // Generate the url that will be used for the consent dialog.
        const authorizeUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scope
        });

        // Open an http server to accept the oauth callback. In this simple example, the
        // only request to our webserver is to /oauth2callback?code=<code>
        const server = http.createServer(async (req, res) => {
            if (req.url.indexOf('/oauth2callback') > -1) {
                // acquire the code from the querystring, and close the web server.
                const qs = querystring.parse(url.parse(req.url).query);
                console.log(`Code is ${qs.code}`);
                res.end('Authentication successful! Please return to the console.');
                server.close();

                // Now that we have the code, use that to acquire tokens.
                const r = await oAuth2Client.getToken(qs.code)
                // Make sure to set the credentials on the OAuth2 client.
                oAuth2Client.setCredentials(r.tokens);
                console.info('Tokens acquired.');
                resolve(oAuth2Client);
            }
        }).listen(4000, () => {
            // open the browser to the authorize url to start the workflow
            opn(authorizeUrl);
        });
    });
}


/**
 * Start by acquiring a pre-authenticated oAuth2 client.
 */
async function main() {
    try {
        const oAuth2Client = await getAuthenticatedClient();
        // Make a simple request to the Google Plus API using our pre-authenticated client. The `request()` method
        // takes an AxiosRequestConfig object.  Visit https://github.com/axios/axios#request-config.
        // const url = 'https://www.googleapis.com/plus/v1/people?query=pizza';

        console.log(oAuth2Client);
        var call_creds = grpc.credentials.createFromGoogleCredential(oAuth2Client);
        var combined_creds = grpc.credentials.combineChannelCredentials(ssl_creds, call_creds);
        var stub = new authProto.Greeter('greeter.googleapis.com', combined_credentials);
        const res = await oAuth2Client.request({scope})
        console.log(res.data);
    } catch (e) {
        console.error(e);
    }
    process.exit();
}

main();
