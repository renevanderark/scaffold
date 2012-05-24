var AlchemyProto = function(key) {
	var apiKey = key;
	var container = null;

	this.setContainer = function(c) {
		container = c;
	}

	this.callback = function(data) {
		if(container) { container.html(""); }
		if(container && data && data.entities) {
			if(data.entities.length == 0) { 
				container.html("<i>No named entities found</i>"); 
			} else {
				container.html("<i>Named entities</i>");
				var list = $("<dl>");
				$.each(data.entities, function(i, entity) {
					if(i > 10) return;
					list.append("<dt>" + entity.type + ":</dt><dd>" + entity.text + "</dd>");
				});
				container.append(list);
			}
		}
	};

	this.sendRequest = function(q) {
		if(container) {
			container.html("<i>searching named entities</i>");
			$.ajax("http://access.alchemyapi.com/calls/url/URLGetRankedNamedEntities", {
				data: {apikey: key, url: q, outputMode: "json", jsonp: "alchemy.callback"},
				dataType: "jsonp"
			});
		}
	};
}

