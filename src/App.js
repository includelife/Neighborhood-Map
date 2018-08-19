import React, {Component} from 'react';
import LocationList from './LocationList';
import './App.css';

class App extends Component {
    /**
     * Constructor
     */
    constructor(props) {
        super(props);
        this.state = {
            'alllocations': [
                {
                    'name': 'United Nations Headquarters',
                    'type': 'Oganization',
                    'latitude': 40.749367,
                    'longitude': -73.967869,
                    'address': '405 E 42nd St New York, NY 10017 USA'
                },
                {
                    'name': 'Washington Square Park',
                    'type': 'Park',
                    'latitude': 40.730872,
                    'longitude': -73.997321,
                    'address': 'New York, NY 10012 USA'
                },
                {
                  'name': 'Whitney Museum of American Art',
                  'type': 'Modern art museum',
                  'latitude': 40.742920,
                  'longitude': -74.008675,
                  'address': '99 Gansevoort St, New York, NY 10014 USA'
                },
                {
                  'name': 'Baruch College',
                  'type': 'Acadecmy',
                  'latitude': 40.741269,
                  'longitude': -73.983119,
                  'address': '55 Lexington Ave, New York, NY 10010 USA'
                },
                {
                  'name': 'Times Square',
                  'type': 'Square',
                  'latitude': 40.759215,
                  'longitude': -73.985135,
                  'address': 'Manhattan, NY 10036 USA'
                },
                {
                  'name': 'AMC Kips Bay 15',
                  'type': 'Cinema',
                  'latitude': 40.743150,
                  'longitude': -73.976693,
                  'address': '570 2nd Ave, New York, NY 10016 USA'
                }
            ],
            'map': '',
            'infowindow': '',
            'prevmarker': ''
        };

        // retain object instance when used in the function
        this.initMap = this.initMap.bind(this);
        this.openInfoWindow = this.openInfoWindow.bind(this);
        this.closeInfoWindow = this.closeInfoWindow.bind(this);
    }

    /**
     *Init Google Map
     */
    componentDidMount() {
        window.initMap = this.initMap;
        loadMapJS('https://maps.googleapis.com/maps/api/js?key=AIzaSyCEznLTN7DKZFvv1bISwlxv_HjAW7Pt1u0&callback=initMap')
    }

    /**
     * Initialise the map once the google map script is loaded
     */
    initMap() {
        var self = this;

        var mapview = document.getElementById('map');
        mapview.style.height = window.innerHeight + "px";
        var map = new window.google.maps.Map(mapview, {
            center: {lat: 40.7413549, lng: -73.9980244},
            zoom: 14,
            mapTypeControl: true
        });

        var InfoWindow = new window.google.maps.InfoWindow({});

        window.google.maps.event.addListener(InfoWindow, 'closeclick', function () {
            self.closeInfoWindow();
        });

        this.setState({
            'map': map,
            'infowindow': InfoWindow
        });

        window.google.maps.event.addDomListener(window, "resize", function () {
            var center = map.getCenter();
            window.google.maps.event.trigger(map, "resize");
            self.state.map.setCenter(center);
        });

        window.google.maps.event.addListener(map, 'click', function () {
            self.closeInfoWindow();
        });

        var alllocations = [];
        this.state.alllocations.forEach(function (location) {
            var longname = location.name + ' - ' + location.type;
            var marker = new window.google.maps.Marker({
                position: new window.google.maps.LatLng(location.latitude, location.longitude),
                animation: window.google.maps.Animation.DROP,
                map: map
            });

            marker.addListener('click', function () {
                self.openInfoWindow(marker);
            });

            location.longname = longname;
            location.marker = marker;
            location.display = true;
            alllocations.push(location);
        });
        this.setState({
            'alllocations': alllocations
        });
    }

    /**
     * Open the infowindow for the marker
     */
    openInfoWindow(marker) {
        this.closeInfoWindow();
        this.state.infowindow.open(this.state.map, marker);
        marker.setAnimation(window.google.maps.Animation.BOUNCE);
        this.setState({
            'prevmarker': marker
        });
        this.state.infowindow.setContent('Loading Data...');
        this.state.map.setCenter(marker.getPosition());
        this.state.map.panBy(0, -200);
        this.getMarkerInfo(marker);
    }

    /**
     * Retrive the location data from the foursquare api for the marker and display it in the infowindow
     */
    getMarkerInfo(marker) {
        var self = this;
        var clientId = "DPA2DDZNUQYBJNOCLCP11XMZ2NPIS2TNZ53VCJMGYO11BFL5";
        var clientSecret = "BAXVPE3RQIWSW5K1RRHP0WRDEF1GEWRSTYAN3PPRGI12YU1W";
        var url = "https://api.foursquare.com/v2/venues/search?client_id=" + clientId + "&client_secret=" + clientSecret + "&v=20180323&ll=" + marker.getPosition().lat() + "," + marker.getPosition().lng() + "&limit=1";
        fetch(url)
            .then(
                function (response) {
                    if (response.status !== 200) {
                        self.state.infowindow.setContent("Sorry data can't be loaded");
                        return;
                    }

                    // Examine the text in the response
                    response.json().then(function (data) {
                        var location_data = data.response.venues[0];
                        var verified = '<b>Verified Location: </b>' + (location_data.verified ? 'Yes' : 'No') + '<br>';
                        var checkinsCount = '<b>Number of CheckIn: </b>' + location_data.stats.checkinsCount + '<br>';
                        var usersCount = '<b>Number of Users: </b>' + location_data.stats.usersCount + '<br>';
                        var tipCount = '<b>Number of Tips: </b>' + location_data.stats.tipCount + '<br>';
                        var readMore = '<a href="https://foursquare.com/v/'+ location_data.id +'" target="_blank">Read More on Foursquare Website</a>'
                        self.state.infowindow.setContent(checkinsCount + usersCount + tipCount + verified + readMore);
                    });
                }
            )
            .catch(function (err) {
                self.state.infowindow.setContent("Sorry data can't be loaded");
            });
    }

    /**
     * Close the infowindow for the marker
     */
    closeInfoWindow() {
        if (this.state.prevmarker) {
            this.state.prevmarker.setAnimation(null);
        }
        this.setState({
            'prevmarker': ''
        });
        this.state.infowindow.close();
    }

    /**
     * Render function of App
     */
    render() {
        return (
            <div>
                <LocationList
                  key="100"
                  alllocations={this.state.alllocations}
                  openInfoWindow={this.openInfoWindow}
                  closeInfoWindow={this.closeInfoWindow}/>
                <div id="map"></div>
            </div>
        );
    }
}

export default App;

/**
 * Load the google maps Asynchronously
 */
function loadMapJS(src) {
    var ref = window.document.getElementsByTagName("script")[0];
    var script = window.document.createElement("script");
    script.src = src;
    script.async = true;
    script.onerror = function () {
        document.write("Google Maps can't be loaded");
    };
    ref.parentNode.insertBefore(script, ref);
}
