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

// http://stackoverflow.com/questions/901115/get-query-string-values-in-javascript
// Andy E
var urlParams = {};
(function () {
var e,
a = /\+/g,  // Regex for replacing addition symbol with a space
r = /([^&=]+)=?([^&]*)/g,
d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
q = window.location.search.substring(1);
while (e = r.exec(q))
	urlParams[d(e[1])] = d(e[2]);
})();
