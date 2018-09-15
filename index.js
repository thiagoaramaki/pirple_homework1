/*
* Arquivo primário para a API
*
*/

// Dependencias
var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');

// O servidor deve responder a todas as requisições com string
var httpServer = http.createServer(function(req,res) {
		
	unifiedServer(req,res);	

});


// Inicia o servidor e faz com que escute na porta configurada pelo config.js
httpServer.listen(config.httpPort, function() {
	console.log("O servidor está escutando na porta "+ config.httpPort + " no modo "+ config.envName);
});

var httpsServerOptions = {
	'key' : fs.readFileSync('./https/key.pem'),
	'cert' : fs.readFileSync('./https/cert.pem')
};

// InstatnitacertHTTPS SERVEfs.readFileSync('./https/cert.pem');R
var httpsServer = https.createServer(httpsServerOptions, function(req,res) {
		
	unifiedServer(req,res);	

});


// Inicia o servidor e faz com que escute na porta configurada pelo config.js
httpsServer.listen(config.httpsPort, function() {
	console.log("O servidor está escutando na porta "+ config.httpsPort + " no modo "+ config.envName);
});




// All the server logic for both http and https
var unifiedServer = function(req,res) {


	// Pega a url e faz um parse
	var parsedUrl = url.parse(req.url, true);

	// Pega o caminho
	var path = parsedUrl.pathname;
	var trimmedPath = path.replace(/^\/+|\/+$/g, '');

	// Pega a query string como objeto
	var queryStringObject = parsedUrl.query;

	// Pega o método HTTP
	var method = req.method.toLowerCase();

	// Pega os headers como objeto
	var headers = req.headers;

	//pega o payload, se tiver
	var decoder = new StringDecoder('utf-8');
	var buffer = '';
	req.on('data', function(data){
		buffer += decoder.write(data);
	});
	req.on('end', function() {
		buffer += decoder.end();

		// Choose the handler this request should go to.
		var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;
		// Construct the data object to send to the handler

		var data = {
			'trimmedPath' : trimmedPath,
			'queryStringObject' : queryStringObject,
			'method' : method,
			'headers' : headers,
			'payload' : buffer
		};

		// Route the request to the handler specified
		chosenHandler(data, function(statusCode,payload) {
			// Use the status code called back by the handler
			statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

			payload = typeof(payload) == 'object' ? payload : {};

			var payloadString = JSON.stringify(payload);
			// Use the payload called back by the handler 
			// Envia uma resposta
			res.setHeader('Content-Type','application/json');
			res.writeHead(statusCode);
			res.end(payloadString);

			// Loga os requests
			console.log('Returning Response', statusCode, payloadString);
		});

	});

};

// definir os handlers
var handlers = {};

// hello handler
handlers.hello = function(data, callback) {
	callback(213, {'hello' : 'Welcome to my simple REST application.'});
};

// ping handler
handlers.ping = function(data,callback) {
	// Callback a http status code and a a payload object
	callback(200);
};

// not found handler
handlers.notFound = function(data,callback) {
	callback(404);
};

// definir o roteador de requests
var router = {
	'ping' : handlers.ping,
	'hello' : handlers.hello
};