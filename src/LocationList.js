import React, { Component } from 'react';
import LocationPoint from './LocationPoint';

class LocationList extends Component {
  /**
   * Constructor
   */
   constructor(props) {
     super(props);
     this.state = {
       'locations': '',
       'query': '',
       'suggestions' :true
     };

     this.filterLocations = this.filterLocations.bind(this);
     this.toggleSuggestions = this.toggleSuggestions.bind(this);
   }

    componentWillMount() {
      this.setState({
        'locations': this.props.alllocations
      });
    }

    /**
     * Show and hide suggestions
     */
    toggleSuggestions() {
        this.setState({
            'suggestions': !this.state.suggestions
        });
    }

   /**
    * Filter Locations based on user query
    */
   filterLocations(e) {
     this.props.closeInfoWindow();
     const {value} = e.target;
     var locations = [];
     this.props.alllocations.forEach(function (location) {
       if (location.longname.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
           location.marker.setVisible(true);
           locations.push(location);
       } else {
           location.marker.setVisible(false);
       }
     });

     this.setState({
       'locations': locations,
       'query': value
     });
   }


  render() {
    var locationlist = this.state.locations.map(function (listItem, index) {
        return (
            <LocationPoint
              key={index}
              openInfoWindow={this.props.openInfoWindow.bind(this)}
              data={listItem} />
        );
    }, this);

    return (
      <div className="search">
        <input
          role='search'
          aria-labelledby='filter'
          id='search-field'
          className='search-field'
          type='text'
          placeholder='Search Locations'
          value={this.state.query}
          onChange={this.filterLocations}
        />
      <ul>
          {this.state.suggestions && locationlist}
      </ul>
      <button className='buton' onClick={this.toggleSuggestions}>
        Show or Hide suggestions
      </button>
      </div>
    );
  }
}

export default LocationList;
