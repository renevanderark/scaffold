(function( $ ) {
$.fn.mapSelect = function(opts) {
	Util.options = opts ? opts : {};
	var callback = Util.readOpt("callback", function(ll) { alert(ll.lat + "/" + ll.lon); } );
	var map = null;
	var curMarker = null;
	var markers= null;
	var hitMarkers = [];
	var existingMarkerMap = [];

	markers = new OpenLayers.Layer.Markers("Markers");
	map = new OpenLayers.Map(this.attr("id"));
	map.addLayer(new OpenLayers.Layer.OSM());
	var lonLat = new OpenLayers.LonLat(5.7585505631481, 52.207025814801).transform(
		new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
		map.getProjectionObject() // to Spherical Mercator Projection
	);

	map.addLayer(markers);
	map.setCenter(lonLat);
	map.zoomTo(4);
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
}})(jQuery);
