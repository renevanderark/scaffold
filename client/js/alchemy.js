var AlchemyProto = function(key) {
	var apiKey = key;
	var container = null;
	var recordId = null;

	this.setRecordId = function(rId) {
		recordId = rId;
	};

	this.setContainer = function(c) {
		container = c;
	};

	var showEntity = function(data) {
		if(container && data.length > 1) {
			$.each(container.find("dd b"), function(i, elem) {
				if($(elem).html() == data[0]) {
					var lemma = data[1][0];
					if(lemma) {
						var link = $("<a>").attr("href", "http://en.wikipedia.org/wiki/" + lemma.replace(/\s/, "_")).append(lemma).attr("target", "_blank");
						$(elem).prepend("&nbsp;(").prepend(link).append(")");
					}
				}
			});
		}
	};
	
	var saveEntity = function(entity, elem, saveButton) {
		var link = elem.find("a").attr("href");
		var data = {
			recordId: recordId.replace("http://www.europeana.eu/portal/record/", "").replace(/\.json.*/, "").replace("/", "_"),
			lemma: link.replace(/.+\//, ""),
			type: entity.type,
			text: entity.text
		};
		$.ajax({
			type: "POST",
			url: "db/named_entities",
			data: {upsert: data, set: data},
			success: function(data) { 
				saveButton.attr("disabled", "true");
				saveButton.html("Enrichment saved");
			}
		});
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
					var dt = $("<dt>").html(entity.type);
					var dd = $("<dd>").html($("<b>").html(entity.text));
					var saveButton = $("<button>").click(function(e) {
						saveEntity(entity, dd, $(this));
					}).html("Save enrichment").css({"float": "right"});
					dd.append(saveButton);
					list.append(dt).append(dd); 
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

