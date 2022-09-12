import React, { useState, useEffect, useMemo} from "react";

import axios from "axios";
import jwt_decode from 'jwt-decode';
import { Container } from "react-bootstrap";
import BeachResults from "../SearchResult/BeachResults";
import FavoriteCard from '../BeachCard/FavoriteCard'
import './SearchBox.css'

function SearchBox() {
  const [locationName, setLocation]= useState();
  const [beachName, setBeach] = useState();
  // sets to true when specefic beach is selected
  const [result, setResult] = useState(false);
  // sets to true when multiple beaches are selected (beaches carousel)
  const [results, setResults] = useState(false);
  // sets all beaches for selected governorate
  const [governorateArray, setGovernorateArray] = useState([]);
  // sets all beaches from database
  const [beachArray, setBeachArray] = useState([])
  // sets an array of all pinned beaches related to user
  const [pinnedArray, setPinnedArray] = useState([])

  const Handleresults = () => {
    setResult(false);
    setResults(false);
    setBeach('');
  }

  const Handlelocation = (event) => {
    Handleresults();
    let getLocation = event.target.value;
    setLocation(getLocation);
  }

  const Handlebeach = (event) => {
    let getBeach = event.target.value;
    setBeach(getBeach);
    event.preventDefault();
  }

  const handleSubmit = () => {
    // if only a location is selected turn the display to multiple beaches (carousel)
    if (locationName) {
      setResult(false);
      setResults(true);
    }
    // if a beach is selected turn the display to one beach
    if (beachName) {
      setResults(false);
      setResult(true);
    }
  }

  // check if user is logged in
  function checkLogin() {
    const token = localStorage.getItem('accessToken');
    if (token) {
      return true;
    }
  }

  useEffect(() => {
    getAllBeaches()
  }, [])

  // fetch all beaches from database
  const getAllBeaches = () => {
    axios.get('http://localhost:3001/api/v1/beach/allbeaches')
    .then(response => {
      setBeachArray(response.data.beaches.map(data => data))
    })
    .catch(error => {
      if (error) console.error(error)
    })
  }

  // fetch all beaches when a governorate is selected and set the governorateArray state to result
  const getGovernorateBeaches = () => {
    axios.get('http://localhost:3001/api/v1/beach/allbeaches')
    .then(response => {
      const beaches = []
      response.data.beaches.map(
        data => data.governorate.toLowerCase() === locationName.toLowerCase()
         ?
         beaches.push([{
          name: data.name,
          id: data.id,
          location: data.governorate,
          amenities: data.amenities,
          option: <option key={data.id}>{data.name}</option>,
          imagepath: data.imagepath,
          latitude: data.latitude,
          longitude: data.longitude,
    }])
         :
         null
    )
      setGovernorateArray(beaches)
    })
    .catch(error => {
      if (error) console.error(error)
    })
  }

  // get all favorite beaches
  useEffect(() => {
    allPinnedBeaches()
  },[])

  const allPinnedBeaches = () => {
    if (checkLogin()) {
      const token = localStorage.getItem('accessToken');
      const decoded = jwt_decode(token);
      const userId = decoded['id'];
    axios.get(`http://localhost:3001/api/v1/user/allpinnedbeaches/${userId}`)
    .then(response => {
      
      setPinnedArray(response.data.beaches.map(b => [b.beach_id]))
     
    })
    .catch(error => { console.error(error)
    })
    }
    else {
      return
    }
    
  }

  console.log(pinnedArray)

  // Create cards for pinned beaches
  const getAllPinned = () => {
    const pinned = []
    if (pinnedArray) {
        pinnedArray.map(beach => beach.map(b => 
        beachArray.map( beaches => beaches.id === b
           ?
           pinned.push(
            <li>
              <FavoriteCard
              id={beaches.id}
              key={beaches.id}
              beachName={beaches.name}
              beachData={beaches}
              governorateArray={governorateArray}
            />
            </li>
            
          )
          : null 
           
        )
        ))

    }
        return pinned
    
  }

  return (
    <>
      <h2 className="header-text">Time to swim </h2>
      <Container className="content" style={divStyle}>
      <div className="searchbox-row">
        <div className="">
              <div className="searchbox-row align-items-end">
                  <div className="form-group col-md-4">
                  <label className="label mb-2 fw-bold">Location</label>
                  <select id='select' name="location" className="form-control" onClick={locationName? getGovernorateBeaches : null} onChange={Handlelocation} value={locationName}>
                    <option hidden>--Select Location--</option>
                    <option>Tunis</option>
                    <option>Bizerte</option>
                    <option>Nabeul</option>
                    <option>Sousse</option>
                  </select>
                </div>
                <div className="form-group col-md-4">
                <label className="label mb-2 fw-bold">Beach</label>
                <select id ='select' name="beach" className="form-control" onChange={Handlebeach} value={beachName}>
                    <option hidden>--Select Beach--</option>
                    {
                      governorateArray.map(beaches => beaches.map(beach => beach.option))
                    }
                </select>
                </div>

                <div className="form-group col-md-2 mt-4">              
                <button type="submit" className="btn btn-success mt-2" style={btnStyle} onClick={handleSubmit}>Submit</button>               
                </div>
              </div>
        </div>
      </div>
      <div>
      
    </div>
      </Container>
        <div className="beachResults">
          <BeachResults
            governorateArray={governorateArray}
            pinnedArray={pinnedArray}
            locationName={locationName}
            beachName={beachName}
            result={result}
            results={results}
          />
        </div>
        {checkLogin() &&
        <>
        {
          pinnedArray.length
           ?
           <>
           {pinnedArray.length > 1 ? <p className="pin-text">Your pinned beaches</p> : <p>Your pinned beach </p>}
        <ul style={{display: 'flex'}}>
          {getAllPinned()}
        </ul>
        </>
        : null
        }
        
          
        </>
        }
  </>
  );
}

const divStyle = {
  paddingBottom: '4rem'
};
const btnStyle = {
  backgroundColor: '#198754'
}

export default SearchBox;
