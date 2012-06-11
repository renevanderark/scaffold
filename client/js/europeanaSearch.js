(function( $ ) {
$.fn.europeanaSearch = function(opts) {
	Util.options = opts;
	var apiKey = Util.readOpt("apiKey", "");
	var labelTxt = Util.readOpt("label", "Search Europeana");
	var label = $("<label>").html(labelTxt);
	var input = $("<input>");
	var onEuropeanaLink = Util.readOpt("callback", function(address) { alert(address) })
	var resultList = $("<ul>");

	var viewRecord = function(data) {
		if(data["dc:description"]) {
			var descr = "";
			$.each(data["dc:description"], function(i, line) { descr += line.replace(/<.+\/?>/, " "); });
			onEuropeanaLink(descr);
		}
	};

	var listResults = function(results) {
		resultList.html("");
		if(results.items && results.items.length > 0) {
			$.each(results.items, function(i, hit) {
				var item = $("<li>").append($("<a>").append(hit.title).click(function() { 
					$.ajax(hit.link, {
						dataType: "jsonp",
						success: viewRecord
					});
				}).css({color: "blue", cursor: "pointer"}));
				resultList.append(item);
			});
		} else {
			resultList.html("<li>no hits</li>");
		}
	};

	var sendSearch = function(q) {
			$.ajax("http://api.europeana.eu/api/opensearch.json", {
				data: {wskey: apiKey, searchTerms: q},
				dataType: "jsonp",
				success: listResults
			});
	};

	this.append(label).append("<br>").append(input).append(resultList);
	input.on("change", function(e) {
		if(this.value.length > 0) {
			sendSearch(this.value);
		}
	});

	input.on("keypress", function(e) {
		if($.browser.msie && e.keyCode == 13 && this.value.length > 0) {
			sendSearch(this.value);
		}
	});
}})(jQuery);
