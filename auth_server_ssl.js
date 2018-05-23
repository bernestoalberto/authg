var ssl_creds = grpc.credentials.createSsl(root_certs);
var stub = new helloworld.Greeter('myservice.example.com', ssl_creds);
