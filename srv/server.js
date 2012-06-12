var http = require('http');
var url = require('url');
var faye = require('faye');
var bayeux = new faye.NodeAdapter({mount: '/feed', timeout: 45});
var static = require("node-static");
var fileServer = new static.Server('../client', {cache: false});
var db = require('mongojs').connect('test');
var fayeClient = new faye.Client('http://localhost:8000/feed');

var httpServer = http.createServer(function (request, response) {
	var path = url.parse(request.url, true).pathname;
	if(path.match(/^\/db*/)) {
		require("./mongo-by-params.js").routeRequest(db, request, response, path, {
			callback: function(data) {
				fayeClient.publish('/main', {user: "database",  msg: data, time: new Date().getTime()});
			}
		});
	} else {
		request.addListener('end', function () {
			fileServer.serve(request, response);
		});
	}
});

bayeux.attach(httpServer);
httpServer.listen(8000);
