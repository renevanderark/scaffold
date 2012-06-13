var ObjectView = function(opts) {
	var containerId = opts.container;
	var wrapperId = opts.wrapper;
	var spinnerId = opts.spinner;
	var tabsId = opts.tabs;
	var defList = null;
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
		container.html("geolocation!");
	};

	this.show = function(link) {
		$("#" + containerId + " dl").remove();
		$("#" + tabsId).show();
		$("#" + tabsId + " .tab").removeClass("selected");
		$("#" + wrapperId).show();
		$("#" + spinnerId).show();
		$.ajax(link, {
			dataType: "jsonp",
			success: renderView
		});
	}
}
