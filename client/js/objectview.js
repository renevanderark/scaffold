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
					$.each(val, function(k, v) { dd.append(v).append("<br>"); });
				if(key == "Description") { description = dd.html(); }

				if(key == "Title") { $("#" + titleId).html(dd.html()); }	
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
			recordId: recordId,
			callback: function(latLon) { 
				if(confirm("Are you sure you wish to add this location?")) {
					$.ajax({
						type: "POST",
						url: "db/geolocations",
						data: {
							upsert: {recordId: recordId, geo: latLon },
							set: {recordId: recordId, geo: latLon }
						}
					});
				}			
			}
		});
	};

	this.onViewEnrichments = function(callback) {
		var container = $("#" + containerId);
		container.html(spinnerNode.hide());
		$.ajax("db/geolocations", {
			async: false,
			data: {recordId: recordId},
			success: function(data) {
				if(data[0] != null) {
					container.append($("<b>").html("Geolocations")).append("<br>");
					var dl = $("<ul>");
					$.each(data, function(i, info) {
						if(info == null) { return; }
						var item = $("<li>").html("Latitude: " + info.geo.lat + "<br>Longitude: " + info.geo.lon);
						dl.append(item);
					});
					container.append(dl);
				}
			}
		});
		$.ajax("db/named_entities", {
			async: false,
			data: {recordId: recordId},
			success: function(data) {
				if(data[0] != null) {
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
