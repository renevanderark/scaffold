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

function BayeuxClient(host, port, path, logLevel) {
	var url = "http://" + host + ":" + port + "/" + path.replace(/^\//, "");
	var logLevel = logLevel;
	var comet = $.cometd;
	this.isConnected = false;
	var subscriptions = {};
	
	this.connect = function(callbacks) {
		comet.websocketEnabled = true;
		comet.configure({
			url: url, // "http://192.168.0.102:8000/bayeux/",
			logLevel: logLevel ? logLevel : 'info'
		});
		if(callbacks.onHandshake)
			comet.addListener('/meta/handshake', callbacks.onHandshake);
		
		var _this = this;
		comet.addListener('/meta/connect', function(msg) {
			if(msg.successful === true)
				_this.isConnected = true;
			else
				_this.isConnected = false;
			if(callbacks.onConnect)
				callbacks.onConnect(_this.isConnected);
		});
		comet.handshake();
	}

	this.disconnect = function() {
		for(var sub in subscriptions) {
			comet.unsubscribe(subscriptions[sub]);
		}
		comet.disconnect();
	},
	
	this.addChannel = function(channel, listener) {
		var channelId = channel.replace(/\//g, "_");
		if(!subscriptions[channelId]) {
			var sub = comet.subscribe(channel, listener);
			subscriptions[channelId] = sub;
		}
		return channelId;
	}

	this.dropChannel = function(channelId) {
		if(subscriptions[channelId]) {
			comet.unsubscribe(subscriptions[channelId]);
			subscriptions[channelId] = null;
		}
	}

	this.hasChannel = function(channelPath) {
		var channelId = channelPath.replace(/\//g, "_");
		return subscriptions[channelId] != null;
	}
	
	this.publish = function(channelId, data) {
		comet.batch(function() {
			comet.publish(channelId.replace(/_/g, "/"), data);
		});
	}
}
