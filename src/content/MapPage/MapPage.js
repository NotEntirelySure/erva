import React, { Component } from "react";
import { Button, Result} from 'antd';
import { Navigate } from 'react-router-dom';
//import { getVenue, showVenue, E_SDK_EVENT } from '@mappedin/mappedin-js';
//import '@mappedin/mappedin-js/lib/index.css';import {
 
import GlobalHeader from '../../components/GlobalHeader'

class MapPage extends Component {

  constructor(props) {
    super(props)
    this.state = {
      loginRedirect:false,
      userInfo: [],
      isAuth:false,
      startPointListening:false,
      startPointId:"",
      startButtonText:"Select Start Location",
      endPointListening:false,
      endPointId:"",
      endButtonText:"Select End Location",
      mapview: {},
      venue: {}
    }
  }

  componentDidMount(){
    if (sessionStorage.getItem("jwt")){
      this.setState({jwtToken: sessionStorage.getItem("jwt")}, () => {this.VerifyJwt();});
    }
    const options = {
      mapview: {
        antialias: "AUTO",
        mode: window.Mappedin.modes.TEST,
        onDataLoaded: this.initializeMapOptions
      },
      venue: {
        clientId: "5eab30aa91b055001a68e996",
        clientSecret: "RJyRXKcryCMy4erZqqCbuB1NbR66QTGNXVE0x3Pg6oCIlUR1",
        perspective: "Website",
        things: {
          venue: ["slug", "name"],
          categories: ["name"],
          maps: ["name", "elevation", "shortName"],
        },
        venue: "mappedin-demo-mall",
      },
    };
  
    const div = document.getElementById("mapView");
   
    window.Mappedin.initialize(options, div).then((data) => {
      this.setState({mapview:data.mapview, venue:data.venue})
    });
    
    //this.initMap()
  }

  VerifyJwt = async() => {
    this.setState({
      tabsLoading:true,
      loadingMessage:"Getting Offices",
      loadingDescription:"Getting offices assigned to you."
    })
    const verifyRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/verifyjwt`, {
      method:'POST',
      mode:'cors',
      headers:{'Content-Type':'application/json'},
      body:`{"token":"${this.state.jwtToken}"}`
    });
    const verifyResponse = await verifyRequest.json();
    if (verifyResponse.error) {console.log("error",verifyResponse.error)}
    if (verifyResponse.result) {
      this.setState({
        isAuth:true,
        userInfo:{
          "id":verifyResponse.result.id,
          "fname":verifyResponse.result.fname,
          "lname":verifyResponse.result.lname,
          "email":verifyResponse.result.email,
          "type":verifyResponse.result.type
        }
      })
    }
  }

  getDirections = () => {
  
    const locationIDs = [this.state.startPointId, this.state.endPointId];

    const locations = locationIDs.map((id) =>
    this.state.venue.locations.find((item) => item.id === id)
    );

    locations[0].directionsTo(
      locations[1],
      {
        accessible: false,
        directionsProvider: "offline",
      },
      (error, directions) => {
        if (error) {
          return console.error("DirectionsError: ", error);
        }

        this.state.mapview.navigator.showOverview(directions);

      }
    );
  }

  initializeMapOptions = () => {
    this.state.mapview.addInteractivePolygonsForAllLocations();
    this.state.mapview.onPolygonClicked = this.onPolygonClicked;
    this.state.mapview.labelAllLocations({ smartLabels: false });
  }

  onPolygonClicked = (polygonId) => {
    
    const location = this.getLocationForPolygonId(polygonId);
    if (this.state.startPointListening) {
      this.setState({
        startPointListening:false,
        startPointId:location.id
      })
      document.getElementById("buttonStartLocation").classList.add("ant-btn-primary");
      this.setState({startButtonText: location.name})
    }

    if (this.state.endPointListening) {
      this.setState({
        endPointListening:false,
        endPointId:location.id
      })
      document.getElementById("buttonEndLocation").classList.add("ant-btn-primary");
      this.setState({endButtonText: location.name})
    }

    if (location) {
      const detailsContainer = document.getElementById("location-details");
      detailsContainer.innerHTML = "";

      const title = document.createElement("h3");
      title.textContent = location.name;
      detailsContainer.append(title);

      const logoSrc = location?.logo?.original;
      if (logoSrc) {
        const logo = document.createElement("img");
        logo.src = logoSrc;
        detailsContainer.append(logo);
      }

      const description = document.createElement("p");
      description.textContent = location.description;
      detailsContainer.append(description);
    }
  }

  getLocationForPolygonId = (polygonId) => {
    return this.state.venue.locations.find((location) =>
      location.polygons.some((polygon) => polygon.id === polygonId)
    );
  }

  render() {
    return (
      <>
         <GlobalHeader isAuth={this.state.isAuth} userInfo={this.state.userInfo}/>
        <div id='mapbody'></div>
        <div className="container">
          <div id="sidebar">
            <div>
              <div>
                <h2>Wayfind</h2>
                <hr/>
                <p>Start: </p>
                <Button 
                  id="buttonStartLocation" 
                  type="primary"
                  onClick={() => {
                    if (this.state.startPointListening) { 
                      document.getElementById("buttonStartLocation").classList.add("ant-btn-primary");
                      this.setState({startPointListening:false})
                    }
                    if (!this.state.startPointListening) {
                      document.getElementById("buttonStartLocation").classList.remove("ant-btn-primary");
                      this.setState({startPointListening:true})
                    }
                    
                  }}
                  >{this.state.startButtonText}</Button>
                </div>
                <div style={{display:"inline-block"}}>
                  <p>End: </p>
              <Button 
                id="buttonEndLocation" 
                type="primary"
                onClick={() => {
                  if (this.state.endPointListening) {
                    document.getElementById("buttonEndLocation").classList.add("ant-btn-primary");
                    this.setState({endPointListening:false})
                  }
                  if (!this.state.endPointListening) {
                    document.getElementById("buttonEndLocation").classList.remove("ant-btn-primary");
                    this.setState({endPointListening:true})
                  }
                  
                }}
                >{this.state.endButtonText}</Button>
                </div>
              <div>
                <br/>
                <Button onClick={() => this.getDirections()} type="primary">Wayfind</Button>
                </div>
              </div>
              <br></br>
              <h2>Selected Location:</h2>
              <hr/>
              <div id="location-details"></div>
          </div>
          <div id="mapView" />
        </div>
        <div>
          {
            this.state.isAuth ? null:<>
              {this.state.loginRedirect ? <Navigate to="/login"/>:null}
              <Result
                status="403"
                title="403"
                subTitle="Sorry, you are not authorized to access this page."
                extra={<Button onClick={() => this.setState({loginRedirect:true})} type="primary">Login</Button>}
              />
            </>
          }
        </div>
      </>
    )
  }
}

export default MapPage;