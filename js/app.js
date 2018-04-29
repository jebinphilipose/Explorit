var foursquare_client_id = "1CMSRWMY3NG253YZ0Z1PMD0Z3KWB1HQHB1CUN2N3E2TOXO4J";
var foursquare_client_secret = "GHW25MTPGC5AJWLMDXQEUJTX0KJE3DAW0IEIXR43BQRLA4EV";

var ViewModel = function(loc) {
    var self = this;
    this.categoryList = ko.observableArray(['All', 'Food', 'Coffee', 'Shopping', 'Nightlife']);
    this.currentCategory = ko.observable();
    this.venueList = ko.observableArray([]);
    $.ajax({
        url: `https://api.foursquare.com/v2/venues/search?query=food&limit=10&ll=${loc.lat},${loc.lng}&client_id=${foursquare_client_id}&client_secret=${foursquare_client_secret}&v=20180429`,
        method: 'GET',
        dataType: 'json',
        success: function() {

        },
        error: function() {
            window.alert('Permission denied! Using default location Noida');
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
            window.alert('Permission denied! Using default location Noida');
            map(defaultLocation);
        }
    );
}

function map(location) {
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: location,
        mapTypeControl: false
    });
    var marker = new google.maps.Marker({
        position: location,
        map: map
    });

    ko.applyBindings(new ViewModel(location));

    var elem2 = document.querySelector('select');
    var instance2 = M.FormSelect.init(elem2, {});
}