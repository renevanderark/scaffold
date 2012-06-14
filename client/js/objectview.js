var ObjectView = function(opts) {
	var containerId = opts.container;
	var titleId = opts.title;
	var wrapperId = opts.wrapper;
	var spinnerId = opts.spinner;
	var tabsId = opts.tabs;
	var defList = null;
	var recordId = null;
	var spinnerNode = $("<img>").attr("src", "img/spinner.gif").attr("id", spinnerId);
	var description = "";

	var renderView = function(data) {
		var container = $("#" + containerId);
		defList = $("<dl>");
		$(".tab.view").addClass("selected");
		$("#" + spinnerId).hide();

		$.each(data, function(key, val) {
			if(key.match(/^dc:/)) {
				key = key.replace("dc:", "");
				key = key.charAt(0).toUpperCase() + key.slice(1);
				var dt = $("<dt>").html(key);
				var dd = $("<dd>");
				if(typeof(val) == "string")
					dd.html(val);
				else 
					$.each(val, function(k, v) { dd.append(v) });
				if(key == "Description") { description = dd.html(); }

				if(key == "Title") { $("#" + titleId).html(val); }	
				defList.append(dt).append(dd);
			}
		});
		container.html(defList).prepend(spinnerNode);
		$("#" + spinnerId).hide();
	};

	this.onView = function() {
		if(defList) {
			var container = $("#" + containerId);
			container.html(defList).prepend(spinnerNode);
		}
	};

	this.onNamedEntities = function(callback) {
		var container = $("#" + containerId);
		callback(description);
		container.prepend(spinnerNode);
	};

	this.onGeolocation = function(callback) {
		var container = $("#" + containerId);
		var mapDiv = $("<div>").css({height: "300px", width: "100%"}).attr("id", "map");
		container.html(mapDiv);

		mapDiv.mapSelect({
			callback: function(a,b) { console.log(a,b);}
		});
	};

	this.onViewEnrichments = function(callback) {
		var container = $("#" + containerId);
		container.html(spinnerNode.hide());
		$.ajax("db/named_entities", {
			async: false,
			data: {recordId: recordId},
			success: function(data) {
				if(data != [null]) {
					container.append($("<b>").html("Named entities")).append("<br>");
					var dl = $("<dl>");
					$.each(data, function(i, info) {
						if(info == null) { return; }
						var dt = $("<dt>").html(info.type);
						var dd = $("<dd>");
						if(info.lemma.length > 0) {
							dd.html($("<a>").attr("target", "_blank").attr("href", "http://en.wikipedia.org/wiki/" + info.lemma).html(info.text));
						} else {
							dd.html($("<b>").html(info.text));
						}
						dl.append(dt).append(dd);
					});
					container.append(dl);
				}
			}
		});
	};

	this.show = function(link) {
		$("#" + containerId + " dl").remove();
		$("#" + tabsId).show();
		$("#" + tabsId + " .tab").removeClass("selected");
		$("#" + wrapperId).show();
		$("#" + spinnerId).show();
		recordId = link.replace("http://www.europeana.eu/portal/record/", "").replace(/\.json.*/, "").replace("/", "_");
		$.ajax(link, {
			dataType: "jsonp",
			success: renderView
		});
	}
}
