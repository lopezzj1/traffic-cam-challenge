// List of Seattle Traffic Cameras
// http://data.seattle.gov/resource/65fc-btcc.json

"use strict";

//put your code here to create the map, fetch the list of traffic cameras
//and add them as markers on the map
//when a user clicks on a marker, you should pan the map so that the marker
//is at the center, and open an InfoWindow that displays the latest camera
//image
//you should also write the code to filter the set of markers when the user
//types a search phrase into the search box


function onReady() {

	//creates the location and zoom of map
	var mapOptions = {
		center: {lat: 47.6, lng: -122.3},
		zoom: 12
	}

	var mapElem = document.getElementById('map'); //get 'map' element from page

	var map = new google.maps.Map(mapElem, mapOptions); //create our map

	var newInfoWin = new google.maps.InfoWindow(); //creates a new InfoWindow for camera
	var userInfoWin = new google.maps.InfoWindow();	//creates a InfoWindow for user location

	var currentPos = './img/currentlocation.png'; //customer icon for user location pin

	var infoArray = [];

	//camera locations
	$.getJSON('http://data.seattle.gov/resource/65fc-btcc.json')
		.done(function(data) {
			//success
			createMarker(data);
		})
		.fail(function(error) {
			//error contains error info
		})
		.always(function(){
			//called on either success or error cases
		});

	
	function createMarker(data) {
		
		$.each(data, function(i, cam) {
			var camImg = cam.imageurl.url;
			var camLoc = cam.cameralabel;

			var position = {
				lat: Number(cam.location.latitude),
				lng: Number(cam.location.longitude)
			};

			var markerLocation = new google.maps.Marker({
				position: position,
				map: map,
			});

			var markerInfo = {
				camLoc, position, markerLocation
			};

			infoArray.push(markerInfo);

			//camera info window
			google.maps.event.addListener(markerLocation, 'click', function(){
				markerLocation.setAnimation(google.maps.Animation.BOUNCE);
				newInfoWin.setContent('<p> '
					+ camLoc
					+ '</p>'
					+ '<p> ' 
					+ '<img src=' + camImg + '>'
					+ '</p>'
				);
				map.panTo(markerLocation.getPosition());
				newInfoWin.open(map, markerLocation)
			})

			//closes the info window
			google.maps.event.addListener(map, 'click', function(){
				if (markerLocation.getAnimation() != null) {
					markerLocation.setAnimation(null);
				}
				newInfoWin.close(map, markerLocation);
			})
		})
	};//end of cam locations and markers

	$('#search').bind('search keyup', function(){
		var term = $('#search').val().toLowerCase();
		console.log(term);

		var index;

		$.each(infoArray, function(i, data) {
			var searchTerm = data.camLoc.toLowerCase();
			index = searchTerm.indexOf(term);

			if (index == -1){
				data.markerLocation.setMap(null);
			}

			if (term == ""){
				data.markerLocation.setMap(map);
			}

		})


	});


	//gets the user's geo location
	function onGeoPos(position){
		var myLocPos = {
			lat: position.coords.latitude,
			lng: position.coords.longitude		
		};

		var myLocation = new google.maps.Marker ({
			position: myLocPos,
			map: map,
			icon: currentPos,
			animation: google.maps.Animation.DROP
		});

		//listen for click event on my marker
		google.maps.event.addListener(myLocation, 'click', function() {
			myLocation.setAnimation(google.maps.Animation.BOUNCE);
			userInfoWin.setContent(
				'<p>Your current position is: </p>'
				+ '<p> Lat: ' 
				+ position.coords.latitude 
				+'</p>'
				+ '<p>Long: '
				+ position.coords.longitude 
				+'</p>'
			);
			map.panTo(myLocation.getPosition());
			userInfoWin.open(map, myLocation)
		});

		//close info window
		google.maps.event.addListener(map, 'click', function(){
			if (myLocation.getAnimation() != null) {
				myLocation.setAnimation(null);
			}
			userInfoWin.close(map, myLocation);
		});
	};

	function onGeoErr(error){
		alert("There has been an error.")
	};

	if (navigator.geolocation){
		navigator.geolocation.getCurrentPosition(onGeoPos, onGeoErr,
			{enableHighAccuracy: true, maximumAge: 30000});
	} else {
		console.log("geolocation not supported");
	};

}


$( document ).ready(onReady());