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

(function( $ ) {
	$.fn.renderList = function(users) {
		return this.each(function() {
			for(var i = 0; i < users.length - 1; ++i) {
				if(users[i].user)
					$(this).scrollAppend("<span class='user' id='"+users[i].user +"'>" + users[i].user + "</span>");
			}
		});
	}
})(jQuery);

(function( $ ) {
	$.fn.userBox = function(client, opts) {

		/** Observe enter press on login input **/
		var loginOnEnter = function(ev) {
			if(ev.keyCode == 13 && $(this).val().match(/^[a-zA-Z][a-zA-Z0-9][a-zA-Z0-9]+$/)) {
				if($.cookie) {
					$.cookie("userName", $(this).val());
				}
				userName = $(this).val();
				login();
			}
		};

		/** Listen for messages **/
		var receive = function(message) {
			var msg = message.data;
			if(msg.user && $('#' + msg.user).length == 0)
				$(listBox).scrollAppend("<span class='user " + (msg.user == userName ? "self" : "") + "' id='"+msg.user +"'>" + msg.user + "</span>");
			if(msg.logoff)
				$('#' + msg.logoff).remove();
		}

		/** Connection successful, publish username to user channelPath, retrieve and render user list **/
		var onConnect = function() {
			if(!connectionEst) {
				$('#' + userBoxId).html("<a id='" + userListMinifyId + "'>-</a>");
				$('#' + userListMinifyId).click(function() {
					listBox.slideUp();
					$('#foo').show();
				});
				$('#' + userBoxId).append(userBoxConnectedContent);
				$('#' + userListMinifyId).css({"float": "right", cursor: "pointer"});
				client.publish(channel, {user: userName});
				connectionEst = true;
				var callback =  "$('#" + userBoxId + "').renderList";
				$.ajax({
					url: '/db/active_users',
					data: {fields: ["user"], user: {'$ne': userName }},
					dataType: "json",
					async: false,
					success: function(data) { $("#" + userBoxId).renderList(data) } 
				});

				input.hide();
				_this.append("<a id='" + logoutLinkId + "'>" + logoutLinkTxt + "</a>");
				_this.append("&nbsp;<a id='foo'>+</a>");
				$('#foo').click(function() { listBox.slideDown(); $(this).hide()})
				$('#foo').css({fontSize: "10px", fontFamily: "sans, arial", color: "#aaa", cursor: "pointer"});
				$('#foo').hide();
				var llink = $("#" + logoutLinkId);
				llink.css(logoutLinkCss);
				
				llink.click(function(e) {
					logout(this);
					if(logoutTarget)
						location.href = logoutTarget;
				});
				if(callbackFunc)
					callbackFunc(userName);
			}
		}

		var logout = function(llink) {
			client.publish(channel, {logoff: userName});
			client.dropChannel(channel);
			input.show();
			$('#' + userBoxId).html(userBoxInitContent);
			connectionEst = false;
			$(llink).remove();
			$.ajax({
				type: "POST",
				url: '/db/active_users/delete',
				data: {user: userName},
				dataType: "json"
			});
			if(logoutCallback) { logoutCallback(); }
		}

		/** Callback on error connecting **/
		var errConnect = function(msg) {
			listBox.html("connection failure?");
		}

		/** Logging in given a username  **/
		var login = function() {
			$.ajax({
				type: "POST",
				url: '/db/active_users',
				data: {upsert: {user: userName}, set: {user: userName}},
				dataType: "json",
				success: register 
			});

		}

		var register = function(data) {
			if(userName) {
				if(client.isConnected) {
					client.addChannel(channelPath, receive);
					onConnect();
				} else {
					client.connect({onHandshake: function(msg) {
						if(msg.successful) {
							channel = client.addChannel(channelPath, receive);
							onConnect();
						} 
					}});
				}
			}
		}

		var clearInput = function() {
			if($(this).val() == inputInitVal)
				$(this).val("");
			$(this).css(inputFocusCss);
		}

		/** Get settings **/
		var _this = this;
		var subscription = null;
		var connectionEst = false;

		Util.options = opts;
		var userBoxId = Util.readOpt("userBoxId", "userList");
		var userBoxInitContent = Util.readOpt("userBoxInitContent", "Niet ingelogd");
		var userBoxConnectedContent = Util.readOpt("userBoxConnectedContent", "Ingelogd");
		var userBoxCss = Util.readOpt("userBoxCss", {width: "150px", height: "100px", overflowY: "auto", color: "#aaa", border: "1px solid #ddd", fontSize: "10px", fontFamily: "sans, arial", padding: "3px"});
		var inputId = Util.readOpt("inputId", "users_login");
		var inputCss = Util.readOpt("inputCss",  {color: "#aaa", fontStyle: "italic", width: "156px"});
		var inputInitVal = Util.readOpt("inputInitVal", "Gebruikersnaam");
		var inputFocusCss = Util.readOpt("inputFocusCss", {color: "#000", fontStyle: "normal", width: "156px"});
		var channelPath = Util.readOpt("channel", "/burn/users"); 
		var logoutLinkTxt = Util.readOpt("logoutLinkTxt", "Uitloggen"); 
		var logoutLinkId = Util.readOpt("logoutLinkId", "logout_link"); 
		var logoutLinkCss = Util.readOpt("logoutLinkCss", {color: "blue", textDecoration: "none", fontSize: "11px", fontFamily: "sans, arial", cursor: "pointer"});
		var logoutCallback = Util.readOpt("logoutCallback", null);
		var userListMinifyId = Util.readOpt("userListMinifyId", "userListMinify");
		var callbackFunc = Util.readOpt("callback", null);
		var logoutTarget = Util.readOpt("logoutTarget", null);
		var channel = null;
		var userName = opts["userName"];
		var client = client;

		/** Generate user list box **/
		this.append('<div id="'+userBoxId+'">'+userBoxInitContent+'</div>');
		var listBox = $("#"+userBoxId);
		listBox.css(userBoxCss);

		/** Generate user input **/
		this.append('<input id="'+inputId+'" value="'+inputInitVal+'" />');
		var input = $("#"+inputId);
		input.focus(clearInput);
		input.keyup(loginOnEnter);
		input.css(inputCss);

		if(userName)
			login();
			//input.val(userName);

		return this;
	};
})( jQuery );


