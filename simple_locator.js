/**
 * simple_locator
 * http://roman.tao.at
 *
 * Copyright (c) 2010, Roman Weinberger
 * Licensed under the MIT License.
 */
var simple_locator = function(usr_options) {
	// default options
	var options = {
		threshold : 50,
		google_geocoding : false, // needs included google api
		running_callback : false,
		finished_callback : false,
		error_callback : false,
		unknown_location_string : "unknown location",
		set_from : function(usr_options) {	for( var key in usr_options ) this[key] = usr_options[key]; }
	};
	
	options.set_from(usr_options);
	
	var run_callbacks = function(coords, location, watch_id) {
		if( options.threshold > coords.accuracy ) {
			options.finished_callback(coords, location);
			navigator.geolocation.clearWatch(watch_id);
		} else {
			options.running_callback(coords, location);
		}
	};
	
	var init_locator = function() {
		var watch_id = navigator.geolocation.watchPosition(
			function(loc) {
				if( options.google_geocoding ) {
					(new google.maps.Geocoder()).geocode({ 
							'latLng' : new google.maps.LatLng(loc.coords.latitude, loc.coords.longitude)
						}, function(res, x) {
							var loc_found = options.unknown_location_string;
							if( x == google.maps.GeocoderStatus.OK ) {
								if( typeof res[0] != "undefined" ) {
									var loc_found = res[0].formatted_address;	              	              
								}
							}
							run_callbacks(loc.coords, loc_found, watch_id);
						}
					);
				} else {
					run_callbacks(loc.coords, options.unknown_location_string, watch_id);
				}
			}, function(error) { // oops something bad happende
				if( options.error_callback ) options.error_callback(error);
			}
		);
	};
	
	// check if browser supports the geolocation api
	if( typeof navigator.geolocation != "undefined" ) {
		init_locator();
		return true;
	} else {
		return false;
	}
};