(function( $ ) {
$.fn.chatBox = function(opts) {
	Util.options = opts;
	var userName = opts["userName"];
	var client = opts["client"];
	var chatLabel = Util.readOpt("chatLabel", "Chatbericht");
	var chatLabelId = Util.readOpt("chatLabelId", "chat_label");
	var chatLabelCss = Util.readOpt("chatLabelCss", {
		fontWeight: "bold",
		fontSize: "11px",
		fontFamily: "sans, arial"
	});
	var channelPath = Util.readOpt("channel", "/burn/chat");
	var inputId = Util.readOpt("inputId", "chatMessageInput");
	var chatMsgBoxId = Util.readOpt("chatMsgBoxId", "chatMessageBox");
	var chatMsgBoxCss = Util.readOpt("chatMsgBoxCss", {
		height: "100px",
		overflowY: "auto",
		fontSize: "11px",
		fontFamily: "arial, sans",
		backgroundColor: "#eee",
		border: "1px solid"
	});
	var channel = null;
	var receive = function(message) {
		if(message.data && message.data.msg && message.data.user) {
			$("#" + chatMsgBoxId).append("<b>" + message.data.user + "</b>: ");
			$("#" + chatMsgBoxId).scrollAppend(message.data.msg + "<br />");
		}
	};
	if(client && userName) {
		if(!client.hasChannel(channelPath)) {
			this.html("<span id='" + chatLabelId + "'>" + chatLabel + ":</span>&nbsp;&nbsp;");
			this.append("<input id='" + inputId + "' type='text' />");
			this.append("<div id='" + chatMsgBoxId + "'></div>");
			$("#" + chatLabelId).css(chatLabelCss);
			$("#" + chatMsgBoxId).css(chatMsgBoxCss);
			channel = client.addChannel(channelPath, receive);
			$("#" + inputId).keyup(function(e) {
				if(e.keyCode == 13 && $(this).val().length > 0) {
					client.publish(channel, {
						user: userName,
						msg: $(this).val().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
					});
					$(this).val("");
				}
			});
		}
	} else {
		this.html("niet verbonden")
	}
	return this;			
}})(jQuery);		
