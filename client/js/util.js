var Util = {
	options: {},
	/** Read out override setting **/
	readOpt: function(setting, defaultOpt) {
		return Util.options[setting] ? Util.options[setting] : defaultOpt 
	}
}
