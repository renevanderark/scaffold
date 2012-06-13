var ObjectView = function(opts) {
	var containerId = opts.container;
	var wrapperId = opts.wrapper;
	var spinnerId = opts.spinner;

	var renderView = function(data) {
		var container = $("#" + containerId);
		var defList = $("<dl>");
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
				
				defList.append(dt).append(dd);
			}
		});
		container.html(defList).prepend($("<img>").attr("src", "img/spinner.gif").attr("id", spinnerId));
		$("#" + spinnerId).hide();
	}

	this.show = function(link) {
		$("#" + containerId + " dl").remove();
		$("#" + wrapperId).show();
		$("#" + spinnerId).show();
		$.ajax(link, {
			dataType: "jsonp",
			success: renderView
		});
	}
}
