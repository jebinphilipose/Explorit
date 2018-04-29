var foursquareClientId = "1CMSRWMY3NG253YZ0Z1PMD0Z3KWB1HQHB1CUN2N3E2TOXO4J";
var foursquareClientSecret = "GHW25MTPGC5AJWLMDXQEUJTX0KJE3DAW0IEIXR43BQRLA4EV";
var googleKey = "AIzaSyC3aeY6RPu35aJQ5z3KInmv_l9W_A-pIuA";
var map, largeInfoWindow, bounds, flag;

// Knockout ViewModel
var ViewModel = function(loc) {
    var self = this;
    this.categoryList = ko.observableArray(['Food', 'Coffee', 'Shopping', 'Nightlife']);
    this.venueList = ko.observableArray([]);
    // Function to add venues retreived from the API to the list and make its markers on the map
    this.addVenue = function (item) {
        var marker = new google.maps.Marker({
            position: {lat: item.venue.location.lat, lng: item.venue.location.lng},
            map: map,
            name: item.venue.name,
            rating: item.venue.rating,
            address: item.venue.location.formattedAddress,
            animation: google.maps.Animation.DROP
        });
        if(!item.venue.hasOwnProperty('rating')) {
            marker.rating = 'Not Available!';
        }
        self.venueList.push(marker);
        marker.addListener('click', function() {
            self.openInfoWindow(this);
        });
        bounds.extend(marker.position);
    };
    // Opens up infoWindow, sets marker Animation and adds content to it
    this.openInfoWindow = function (marker) {
            if(flag && flag.getAnimation() !== null) {
                flag.setAnimation(null);
            }
            largeInfoWindow.marker = marker;
            largeInfoWindow.setContent('<div><strong>' + marker.name + '</strong></div><br>' + '<div>' + "Rating: " + marker.rating + '</div><br>' + "Address: " + marker.address + '</div>');
            largeInfoWindow.open(map, marker);
            marker.setAnimation(google.maps.Animation.BOUNCE);
            flag = marker;
            largeInfoWindow.addListener('closeclick',function(){
                marker.setAnimation(null);
            });
    };
    // Hides all venue markers when called
    this.hideAllMarkers = function() {
        for (var i = 0; i < self.venueList().length; i++) {
            self.venueList()[i].setMap(null);
        }
    };
    // Makes request to Foursquare for searched location and category
    this.makeRequest = function(lat, lng, cat) {
        loc.lat = lat;
        loc.lng = lng;
        self.hideAllMarkers();
        self.venueList([]);
        self.requestFoursquare(cat);
    };
    // Geocodes the address in the search box
    this.search = function() {
        var c = $('#categoryList').val();
        var l = $('#location').val();
        l = l.replace(/ /g, "+");
        var url = `https://maps.googleapis.com/maps/api/geocode/json?address=${l}&key=${googleKey}`;
        $.ajax({
            url: url,
            method: 'GET',
            dataType: 'json',
            success: function(response) {
                var lat = response.results[0].geometry.location.lat;
                var lng = response.results[0].geometry.location.lng;
                self.makeRequest(lat, lng, c);
            },
            error: function() {
                window.alert('Failed to load Google Geocode API! Check your network or firewall');
            }        
        });
    };
    // Make an ajax request to Foursquare
    this.requestFoursquare = function (cat='') {
        bounds = new google.maps.LatLngBounds();
        $.ajax({
            url: `https://api.foursquare.com/v2/venues/explore?limit=10&range=3000&ll=${loc.lat},${loc.lng}&client_id=${foursquareClientId}&client_secret=${foursquareClientSecret}&v=20180429&query=` + cat,
            method: 'GET',
            dataType: 'json',
            success: function(result) {
                var venues = result.response.groups[0].items;
                venues.forEach(self.addVenue);
                map.fitBounds(bounds);
            },
            error: function() {
                window.alert('Failed to load Foursquare data! Check your network or firewall');
            }        
        });
    };
    this.requestFoursquare();
};

// Map Callback function
function initMap() {
    var defaultLocation = {lat: 28.5355, lng: 77.3910};
    var locationAutoComplete = new google.maps.places.Autocomplete(document.getElementById('location'));
    navigator.geolocation.getCurrentPosition(
        function (pos) {
            var location = {};
            location.lat = pos.coords.latitude;
            location.lng = pos.coords.longitude;
            map(location);
        },
        function (err) {
            window.alert('Permission denied! Using default location "Noida, IN"');
            map(defaultLocation);
        }
    );
}

// Makes a map for the location
function map(location) {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: location,
        mapTypeControl: false
    });
    
    largeInfoWindow = new google.maps.InfoWindow();

    ko.applyBindings(new ViewModel(location));

    var elem2 = document.querySelector('select');
    var instance2 = M.FormSelect.init(elem2, {});
}