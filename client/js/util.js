var Util = {
	options: {},
	/** Read out override setting **/
	readOpt: function(setting, defaultOpt) {
		return Util.options[setting] ? Util.options[setting] : defaultOpt 
	},

	timeFormat: function(timeStamp) {
		var time = new Date(timeStamp);
		var aTime = [
			"" + time.getHours(),
		 	"" + time.getMinutes(),
			"" + time.getSeconds()
		];
		$.each(aTime, function(i, x) {
			if(x.length == 1) { aTime[i] = "0" + x; }
		});
		return aTime[0] + ":" + aTime[1] + ":" + aTime[2];
	}
}
