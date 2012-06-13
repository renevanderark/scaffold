(function( $ ) {
$.fn.wikiSearch = function(opts) {
	Util.options = opts;
	var labelTxt = Util.readOpt("label", "Search Wikipedia");
	var lang = Util.readOpt("lang", "en");
	var label = $("<label>").html(labelTxt);
	var input = $("<input>");
	var onLink = Util.readOpt("callback", function(lemma, language) { location.href = "http://" + language + ".wikipedia.org/wiki/" + lemma; })
	var resultList = $("<ul>");
	var listResults = function(results) {
		resultList.html("");
		if(results.length > 1 && results[1].length > 0) {
			$.each(results[1], function(i, hit) {
				var item = $("<li>").append($("<a>").append(hit).click(function() { onLink(hit, lang); }).css({color: "blue", cursor: "pointer"}) );
				resultList.append(item);
			});
		} else {
			resultList.html("<li>no hits</li>");
		}
	};

	var flagLink = $("<a>").append($("<img>").attr("src", "img/" + lang + ".png")).css({"float": "right", cursor: "pointer"});
	var flagPicker = $("<div>").css({"float": "right", display: "none"});
	flagLink.click(function(e) { flagPicker.show(); $(this).hide();});
	$.each(["nl", "en", "fr", "de"], function(i, language) {
		var flagSetter = $("<a>").append($("<img>").attr("src", "img/" + language + ".png")).css({cursor: "pointer"});
		flagSetter.click(function(e) {
			lang = language;
			flagLink.html($("<img>").attr("src", "img/" + language + ".png"));
			input.val("");
			flagPicker.hide();
			flagLink.show();
		});
		flagPicker.append(flagSetter);
	});

	var sendSearch = function(q) {
			$.ajax("https://" + lang + ".wikipedia.org/w/api.php", {
				data: {action: "opensearch", search: q, limit: 10, namespace:0, format: "json"},
				dataType: "jsonp",
				success: listResults
			});
		
	};
	this.append(flagPicker).append(flagLink).append(label).append("<br>").append(input).append(resultList);
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
