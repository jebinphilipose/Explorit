var foursquare_client_id = "1CMSRWMY3NG253YZ0Z1PMD0Z3KWB1HQHB1CUN2N3E2TOXO4J";
var foursquare_client_secret = "GHW25MTPGC5AJWLMDXQEUJTX0KJE3DAW0IEIXR43BQRLA4EV";
var map, largeInfoWindow, bounds;

var ViewModel = function(loc) {
    var self = this;
    this.categoryList = ko.observableArray(['All', 'Food', 'Coffee', 'Shopping', 'Nightlife']);
    this.currentCategory = ko.observable();
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
    this.openInfoWindow = function (marker) {
        // Check to make sure the infoWindow is not already opened on this marker.
        if (largeInfoWindow.marker != marker) {
            largeInfoWindow.marker = marker;
            largeInfoWindow.setContent('<div><strong>' + marker.name + '</strong></div><br>' + '<div>' + "Rating: " + marker.rating + '</div><br>' + "Address: " + marker.address + '</div>');
            largeInfoWindow.open(map, marker);
            // Make sure the marker property is cleared if the infoWindow is closed.
            largeInfoWindow.addListener('closeclick',function(){
                largeInfoWindow.setMarker = null;
            });
        }
    };
    // Make an ajax request to Foursquare
    $.ajax({
        url: `https://api.foursquare.com/v2/venues/explore?limit=10&range=3000&ll=${loc.lat},${loc.lng}&client_id=${foursquare_client_id}&client_secret=${foursquare_client_secret}&v=20180429&query=`,
        method: 'GET',
        dataType: 'json',
        success: function(result) {
            bounds = new google.maps.LatLngBounds();
            var venues = result.response.groups[0].items;
            venues.forEach(self.addVenue);
            map.fitBounds(bounds);
        },
        error: function() {
            window.alert('Failed to load Foursquare data! Check your network or firewall');
        }        
    })
};

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