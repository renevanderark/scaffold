var AlchemyProto = function(key) {
	var apiKey = key;
	var container = null;

	this.setContainer = function(c) {
		container = c;
	};

	var showEntity = function(data) {
		if(container && data.length > 1) {
			$.each(container.find("dd"), function(i, elem) {
				if($(elem).html() == data[0]) {
					var lemma = data[1][0];
					if(lemma) {
						var link = $("<a>").attr("href", "http://en.wikipedia.org/wiki/" + lemma.replace(/\s/, "_")).append(lemma);
						$(elem).html(link);
					}
				}
			});
		}
	};

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
					$.ajax("https://en.wikipedia.org/w/api.php", {
						data: {action: "opensearch", search: entity.text, limit: 1, namespace:0, format: "json"},
						dataType: "jsonp",
						success: showEntity
					});

				});
				container.append(list);
			}
		}
	};

	this.sendText = function(text) {
		if(container) {
			container.html("<i>searching named entities</i>");
			$.ajax("http://access.alchemyapi.com/calls/text/TextGetRankedNamedEntities", {
				method: "post",
				data: {apikey: key, text: text, outputMode: "json", jsonp: "alchemy.callback"},
				dataType: "jsonp"
			});
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

