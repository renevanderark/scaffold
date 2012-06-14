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

var PortalSearch = function(key, opts) {
	var apiKey = key;
	var container = opts.resultBox;
	var spinner = opts.spinner;
	var callback = opts.callback ? opts.callback : function(addr) { alert(addr) };
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
			var closeLink = $("<a>").append($("<img>").attr("src", "img/cross.png")).click(function() {
				div.remove();
			}).css({"float": "right"});
			$.each(data.items, function(i, item) {
				var link = $("<a>").html(item.title);
				var meta = $("<i>").html(item["europeana:dataProvider"]);
				resultsTag.append($("<li>").append(link).append(meta).click(function(e) { callback(item.link) }));
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
				div.append(descrTag).append(closeLink).append(resultsTag);
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
