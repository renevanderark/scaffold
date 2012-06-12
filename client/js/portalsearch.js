var PortalSearch = function(key, opts) {
	var apiKey = key;
	var container = opts.resultBox;
	var spinner = opts.spinner;
	var lastSearchQ = null;

	var paginate = function(q, page, resultsContainer) {
			$.ajax("http://api.europeana.eu/api/opensearch.json", {
				data: {wskey: apiKey, searchTerms: q, startPage: page},
				dataType: "jsonp",
				success: function(data, success, state) {
					showResults(data, success, state, resultsContainer);
				}
			});
	};

	var showResults = function(data, success, state, resultsContainer) {
		$("#" + spinner).hide();
		if(data && data.totalResults > 0) {
			var returnQ = data.description.replace(" - Europeana Open Search","");
			if(!resultsContainer) { $(".search-result .resultset").hide(); }
			var resultsTag = resultsContainer ? resultsContainer.html("") : $("<div>").addClass("resultset");
			var descrTag = $("<a>").html(returnQ + " (" + data.totalResults + ")").click(function(e) {
				resultsTag.toggle();
			});
			var div = $("<div>").addClass("search-result");
			$.each(data.items, function(i, item) {
				var link = $("<a>").html(item.title);
				var meta = $("<i>").html(item["europeana:dataProvider"]);
				resultsTag.append($("<li>").append(link).append(meta));
			});

			if(data.startIndex + data.itemsPerPage < data.totalResults) {
				var pagLink = $("<a>").html("&gt;&gt;").css({"float": "right"}).click(function(e) {
					paginate(returnQ, (data.startIndex / data.itemsPerPage) + 2, resultsTag);
				});
				resultsTag.append(pagLink);
			}
			if(data.startIndex > 0) {
				var pagLink =  $("<a>").html("&lt;&lt;").css({"float": "left"}).click(function(e) {
					paginate(returnQ, (data.startIndex / data.itemsPerPage), resultsTag);
				});
				resultsTag.append(pagLink);
			}
			resultsTag.append($("<div>").css({clear: "both"}));
			if(!resultsContainer) {
				div.append(descrTag).append(resultsTag);
				$("#" + container).prepend(div);
			}
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
