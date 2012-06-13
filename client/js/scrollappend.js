(function( $ ) {
	/** Append to scrollable div and scroll down **/
	$.fn.scrollAppend = function(innerds, opts) {
		return this.each(function() {
			$(this).append(innerds, opts);
			this.scrollTop = this.scrollHeight;
		});
	}
})(jQuery);
