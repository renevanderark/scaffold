var PortalSearch = function(key, opts) {
	var apiKey = key;
	var container = opts.resultBox;
	var spinner = opts.spinner;
	var lastSearchQ = null;
	var showResults = function(data) {
		$("#" + spinner).hide();
		if(data && data.totalResults > 0) {
			$(".search-result .resultset").hide();
			var resultsTag = $("<div>").addClass("resultset");
			var descrTag = $("<a>").html(data.description.replace("- Europeana Open Search","") + "(" + data.totalResults + ")").click(function(e) {
				resultsTag.toggle();
			});
			var div = $("<div>").addClass("search-result");
			$.each(data.items, function(i, item) {
				var link = $("<a>").html(item.title);
				var meta = $("<i>").html(item["europeana:dataProvider"]);
				resultsTag.append($("<li>").append(link).append(meta));
			});

			div.append(descrTag).append(resultsTag);
			$("#" + container).prepend(div);
		}
	};

	this.sendSearch = function(q) {
		if(q != lastSearchQ) {
			$("#" + spinner).show();
			lastSearchQ = q;
			$.ajax("http://api.europeana.eu/api/opensearch.json", {
				data: {wskey: apiKey, searchTerms: q},
				dataType: "jsonp",
				success: showResults
			});
		}
	};
}
