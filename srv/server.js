/*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

var http = require('http');
var url = require('url');
var faye = require('faye');
var bayeux = new faye.NodeAdapter({mount: '/feed', timeout: 45});
var static = require("node-static");
var fileServer = new static.Server('../client');
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
