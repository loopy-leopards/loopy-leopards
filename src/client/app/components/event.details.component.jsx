import React from 'react';
import {Tabs, Tab} from 'material-ui/Tabs';
import {GridList, GridTile} from 'material-ui/GridList';
import IconButton from 'material-ui/IconButton';
import Subheader from 'material-ui/Subheader';
import ThumbUp from 'material-ui/svg-icons/action/thumb-up';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import {List, ListItem} from 'material-ui/List';
import Divider from 'material-ui/Divider';
import RaisedButton from 'material-ui/RaisedButton';
import Skycons from 'react-skycons';
import helpers from '../helpers/fetch.helper.jsx';
import Avatar from 'material-ui/Avatar';
import ContentAdd from 'material-ui/svg-icons/content/add';
import ContentRemove from 'material-ui/svg-icons/content/remove';
import Chip from 'material-ui/Chip';


const styles = {
  headline: {
    fontSize: 24,
    paddingTop: 16,
    marginBottom: 12,
    fontWeight: 400,
  },
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    minHeight: '85vh',
    padding: '10pt',
  },
  gridList: {
    width: 727,
    overflowY: 'auto',
  },
  customContentStyle: {
    width: '100%',
    maxWidth: 'none',
  },
  googleMapStyle: {
    width: '720px',
    height: '450px',
  },
  weather: {
    width: '150px',
    height: '100px',
  },
  wrapper: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  chip: {
    margin: 5,
  },
};

export default class EventDetailsPageComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      // userEvents: [],
      // voteStatus: false,
      // eventsDays: [],
      // usersOpen: false,
      eventDetails: {},//////
      googleMapOpen: false,
      directionButton: true,
      directionButtonShowOrHide: true,
      directionDetails: {},
      displaydirectionDetails: false,
      transportationButton: false,
      weather: '',
      temperature: '',
      //invitedUsers: [],//users who has been invited
      //userStatus: [],//for user name and right icon which is + or -
      //userGroupData: [],//this groupdata is only for search bar
      open: true,
      groupUsers: null,

      textMessageOpen: false,
      userPhoneNumber: null,
    }

    // this.handleVote = this.handleVote.bind(this);
    // this.handleEventClick = this.handleEventClick.bind(this);
    this.handleGoogleMapOpen = this.handleGoogleMapOpen.bind(this);
    this.handleGoogleMapClose = this.handleGoogleMapClose.bind(this);
    this.handleGetDirection = this.handleGetDirection.bind(this);
  

    this.handleClose = this.handleClose.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.fetchDatas = this.fetchDatas.bind(this);

    this.handleTextMessageOpen = this.handleTextMessageOpen.bind(this);
    this.handleTextMessageClose = this.handleTextMessageClose.bind(this);
    this.handleUserPhoneNumber = this.handleUserPhoneNumber.bind(this);
  }

  handleTextMessageOpen () {
    this.setState({textMessageOpen: true});
  }

  handleTextMessageClose () {
    this.setState({textMessageOpen: false});
  }

  handleUserPhoneNumber (event) {
    this.setState({userPhoneNumber: event.target.value});
  }

  handleGoogleMapOpen (event) {
    helpers.fetchCoordinatesForEvent(event.address)
    .then(res => {
      const coords = res.results[0].geometry.location;
      const myOptions = { 
        zoom: 14, 
        center: coords,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
      }; 
      const map = new google.maps.Map(document.getElementById("map"), myOptions); 
      const marker = new google.maps.Marker({ 
        position: coords, 
        map: map,
      }); 
      const infoWindow = new google.maps.InfoWindow({ 
        content: event.name,
      }); 
      infoWindow.open(map, marker); 
      this.setState({directionButton: false})
    })
    this.setState({googleMapOpen: true});
  }

  handleGoogleMapClose () {
    this.setState({directionButtonShowOrHide: true});
    this.setState({googleMapOpen: false});
    this.setState({displaydirectionDetails: false});
  }

  handleGetDirection (event, mode) {
    let currentAddress;
    let directionsService;
    let directionsDisplay;
    let originAddress;
    let that;
    let directionDetails;

    that = this
    that.setState({directionButton: true});
    that.setState({transportationButton: true});
    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();

    if (navigator.geolocation) { 
        navigator.geolocation.getCurrentPosition(function (position) { 
          const latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude); 
          helpers.fetchAddressFromCoordinates(position)
          .then(res => {
            currentAddress = res;
            return currentAddress;
          })
          .then(function(address) {
            currentAddress = address;
            var mapOptions = {
              zoom: 7,
              mapTypeId: google.maps.MapTypeId.ROADMAP,
              center: latlng
            }
            const map = new google.maps.Map(document.getElementById("map"), mapOptions);
            directionsDisplay.setMap(map);
            var way = google.maps.TravelMode[mode];
            var request = {
              origin: address,
              destination: event.address,
              travelMode: way,
            };
            directionsService.route(request, function(response, status) {
              if(status === 'OK') {
                directionsDisplay.setDirections(response);
              }
            });
            that.setState({directionButtonShowOrHide: false});
            return address;
          })
          .then(currentAddress => {
            helpers.fetchDirectionData(currentAddress, event.address, mode)
            .then(res => {
              directionDetails = {};
              directionDetails.transportation = mode;
              directionDetails.distance = res.routes[0].legs[0].distance.text;
              directionDetails.time = res.routes[0].legs[0].duration.text;
              directionDetails.currentAddress = currentAddress;
              that.setState({directionDetails: directionDetails});
              that.setState({displaydirectionDetails: true});
              that.setState({transportationButton: false});
            })
          })
        }
      )
    }
  }

  handleClose () {
    this.setState({textMessageOpen: false});
  };

  handleSubmit () {
    this.setState({textMessageOpen: false});
    console.log("User Phone Number: ", this.state.userPhoneNumber)
  };

  fetchDatas () {
    let currentUserFirstName = this.props.profile.first_name || "";
    let currentUserLastName = this.props.profile.last_name || "";

    helpers.fetchGroupData({id: this.props.event.group_id})
    .then(res => {
      let groupUsers = res.members;
      this.props.getGroupUsers(groupUsers);
    })

    helpers.fetchUsersData()
    .then(res => {this.props.getUsersData(res)})//update
    this.setState({eventDetails: this.props.event});
  }

  componentDidMount() {
    this.fetchDatas();
    helpers.fetchWeatherData(event.latitude, event.longitude, event.time)//fix this later
    .then(res => {
      let icon = '' 
      res.currently.icon.split("").forEach(ele => ele === "-" ? icon += '_' : icon += ele.toUpperCase());
      this.setState({weather: {summary: res.currently.summary, temperature: res.currently.temperature, icon: icon}});
    });
  }

  render() {
    const { users } = this.props;
    const {allUsers} = this.props;
    // console.log("GroupUsers: ", this.props.groupUsersData);
    // console.log("All Users: ", allUsers);
    // console.log("Events ", this.props.event);
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={this.handleTextMessageClose}
      />,
      <FlatButton
        label="Submit"
        primary={true}
        keyboardFocused={true}
        onTouchTap={this.handleSubmit}
      />,
    ];

    return this.props.event.creator_id === this.props.profile.id ? (
      <div>
      <Dialog
          title="Event Detail"
          actions={<FlatButton label="Confirm" primary={true} onTouchTap={this.handleClose} />}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose}
          autoScrollBodyContent={true}
        >
        <br/>
        {this.state.eventDetails.img !== '' ? (<img src={this.state.eventDetails.img} alt="eventImg"/>) : null}
        {this.state.weather !== '' ? (<List><div><Subheader>Weather:</Subheader><Skycons color='orange' icon={this.state.weather.icon} autoplay={true} style={styles.weather}/><p>&nbsp;&nbsp;&nbsp;&nbsp;{this.state.weather.summary}</p><p>{this.state.weather.temperature}&#8451;</p></div><Divider/></List>) : null}
        {this.state.eventDetails.name !== '' ? (<List><div><Subheader>Event:</Subheader><p>&nbsp;&nbsp;&nbsp;&nbsp;{this.state.eventDetails.name}</p></div><Divider/></List>) : null}
        {this.state.eventDetails.description !== undefined ? (<List><div><Subheader>Description:</Subheader><p>&nbsp;&nbsp;&nbsp;&nbsp;{this.state.eventDetails.description.length > 100 ? this.state.eventDetails.description.slice(0,100) + '...' : this.state.eventDetails.description }{this.state.eventDetails.url ? (<a href={this.state.eventDetails.url} target="_blank">&nbsp;more details</a>) : null}</p></div><Divider/></List>) : null}
        {this.state.eventDetails.date_Time !== '' ? (<List><div><Subheader>Event start:</Subheader><p>&nbsp;&nbsp;&nbsp;&nbsp;{this.state.eventDetails.date_time}</p></div><Divider/></List>) : null}
        {this.state.eventDetails.address !== '' ? (<List><div><Subheader>Address:</Subheader><p>&nbsp;&nbsp;&nbsp;&nbsp;{this.state.eventDetails.address}</p><RaisedButton label="Map Open" onTouchTap={() => this.handleGoogleMapOpen(this.state.eventDetails)} /></div><br/><Divider/></List>) : null}
        {this.state.eventDetails.city !== '' ? (<List><div><Subheader>City & State:</Subheader><p>&nbsp;&nbsp;&nbsp;&nbsp;{this.state.eventDetails.city}</p></div><Divider/></List>) : null}
        {this.props.event.invitees !== null ? (
          <List><div><Subheader>Group Members:</Subheader>
          <div style={styles.wrapper}>
            {
              this.props.event.invitees.map(user => (
                <Chip
                  key={user.id} 
                  style={styles.chip}
                >
                  <Avatar src={!!user.photo ? user.photo : 'http://sites.austincc.edu/jrnl/wp-content/uploads/sites/50/2015/07/placeholder.gif'} />
                  {user.first_name + " " + user.last_name}
                </Chip>
              ))
            }
          </div>
          </div><Divider/></List>) : null}
        <List>
          <div>
          <Subheader>Invite Friends</Subheader>

          <RaisedButton label="Invite Friends" onTouchTap={this.handleTextMessageOpen} />
            
            <Dialog
              title="Invite your friends"
              actions={actions}
              modal={false}
              open={this.state.textMessageOpen}
              onRequestClose={this.handleTextMessageClose}
              autoScrollBodyContent={true}
            >
              <TextField
                hintText="Hint Text"
                floatingLabelText="Please enter a phone number:"
                onChange={this.handleUserPhoneNumber}
              />
            </Dialog>
          </div>
          <br/>
          <Divider/>
        </List>
      </Dialog>

      <Dialog
        title="The Location Of Your Event"
        actions={<FlatButton label="Cancle" primary={true} onTouchTap={this.handleGoogleMapClose} />}
        modal={false}
        open={this.state.googleMapOpen}
        onRequestClose={this.handleGoogleMapClose}
        autoScrollBodyContent={true}
      >
        <br/>
        { this.state.displaydirectionDetails ? 
          (<div>
            <div>
              <p>Current Address(A): {this.state.directionDetails.currentAddress}</p>
            </div>
            <div>
              <p>Derection Address(B): {this.state.eventDetails.address}</p>
            </div>
            <div>
              <p>Transportation: {this.state.directionDetails.transportation}</p>
            </div>
            <div>
              <p>Distance: {this.state.directionDetails.distance}</p>
            </div>
            <div>
              <p>Time: {this.state.directionDetails.time}</p>
            </div>
          </div>)
          : null
        }
        <div id="map" style={styles.googleMapStyle}></div>
        <br/>
        {this.state.directionButtonShowOrHide ? (<RaisedButton label="Direction" fullWidth="true" disabled={this.state.directionButton} onTouchTap={() => this.handleGetDirection(this.state.eventDetails, 'DRIVING')}/>) : null}
        {this.state.displaydirectionDetails ? (<RaisedButton label="TRANSIT" fullWidth="true" disabled={this.state.transportationButton} onTouchTap={() => this.handleGetDirection(this.state.eventDetails, 'TRANSIT')}/>) : null}
        {this.state.displaydirectionDetails ? (<RaisedButton label="DRIVING" fullWidth="true" disabled={this.state.transportationButton} onTouchTap={() => this.handleGetDirection(this.state.eventDetails, 'DRIVING')}/>) : null}
        {this.state.displaydirectionDetails ? (<RaisedButton label="BICYCLING" fullWidth="true" disabled={this.state.transportationButton} onTouchTap={() => this.handleGetDirection(this.state.eventDetails, 'BICYCLING')}/>) : null}
        {this.state.displaydirectionDetails ? (<RaisedButton label="WALKING" fullWidth="true" disabled={this.state.transportationButton} onTouchTap={() => this.handleGetDirection(this.state.eventDetails, 'WALKING')}/>) : null}
      </Dialog>
      </div>





      ) : (
      <Dialog
          title="Event Detail"
          actions={<FlatButton label="Confirm" primary={true} onTouchTap={this.handleClose} />}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose}
          autoScrollBodyContent={true}
        >
          <p>Hello!!! Guest User!!!</p>
        </Dialog>
      )
  }
}





          // <div style={styles.wrapper}>
          //   {
          //     this.state.invitedUsers.map(user => (
          //       <Chip
          //         key={user.name} 
          //         style={styles.chip}
          //         onRequestDelete={() => this.handleDeleteChip(user.name)}
          //       >
          //         <Avatar src={!!user.photo ? user.photo : 'http://sites.austincc.edu/jrnl/wp-content/uploads/sites/50/2015/07/placeholder.gif'} />
          //         {user.name}
          //       </Chip>
          //     ))
          //   }
          // </div>