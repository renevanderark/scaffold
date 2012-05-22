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
