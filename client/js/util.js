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
