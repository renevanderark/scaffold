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
$.fn.mapSelect = function(opts) {
	Util.options = opts ? opts : {};
	var callback = Util.readOpt("callback", function(ll) { alert(ll.lat + "/" + ll.lon); } );
	var recordId = opts.recordId;
	var map = null;
	var curMarker = null;
	var markers= null;
	var hitMarkers = [];
	var existingMarkerMap = [];

	markers = new OpenLayers.Layer.Markers("Markers");
	map = new OpenLayers.Map(this.attr("id"));
	map.addLayer(new OpenLayers.Layer.OSM());
	var lonLat = new OpenLayers.LonLat(13.411007, 52.521642).transform(
		new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
		map.getProjectionObject() // to Spherical Mercator Projection
	);

	map.addLayer(markers);
	map.setCenter(lonLat);
	map.zoomTo(3);
	map.events.register('click', map, function (e) {
			var lonLat = map.getLonLatFromPixel(e.xy);
			var llOut = new OpenLayers.LonLat(lonLat.lon, lonLat.lat).transform(
					map.getProjectionObject(), // from Spherical Mercator Projection
					new OpenLayers.Projection("EPSG:4326") // transform to WGS 1984
			);

			var icon = new OpenLayers.Icon('http://mapdroid.googlecode.com/files/marker.png');
			if(!curMarker) {
				curMarker = new OpenLayers.Marker(lonLat, icon);
			} else {
				curMarker.lonlat = lonLat;
				markers.removeMarker(curMarker);
			}
			markers.addMarker(curMarker);
			callback({lat: llOut.lat, lon: llOut.lon});
	});
	console.log(recordId);
	if(recordId) {
		$.ajax("db/geolocations", {
			async: false,
			data: {recordId: recordId},
			success: function(data) {
				$.each(data, function(i, info) {
					if(info == null) { return; }
					var lonLat = new OpenLayers.LonLat(info.geo.lon, info.geo.lat).transform(new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject());
					var icon = new OpenLayers.Icon('http://mapdroid.googlecode.com/files/marker.png');
					var marker = new OpenLayers.Marker(lonLat, icon);

					markers.addMarker(marker);
				});
			}
		});
	}

}})(jQuery);
