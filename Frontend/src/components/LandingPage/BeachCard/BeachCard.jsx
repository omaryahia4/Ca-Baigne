import React, {useState, useEffect} from 'react'

import { v4 as uuidv4 } from "uuid";

import ReactStars from "react-rating-stars-component";
import BasicModal from './Modal/BeachCardModal';
import axios from "axios";
import jwt_decode from 'jwt-decode';
import FavoriteCard from './FavoriteCard';
import getbeachState from '../../../Utils/WindyApiCall';

import './BeachCard.css'


function BeachCard(props) {
  
  const [rate, setRate]= useState();
  const [open, setOpen] = useState(false);
  const [check, setCheck] = useState(false);
  const [weather, setWeather] = useState('')
  const [weatherDescription, setWeatherDescription] = useState('')
  const [weatherIcon, setWeatherIcon] = useState('')
  const [beachState, setBeachState] = useState('');

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  

  useEffect(() => {
    getWeather(props.beachData.latitude, props.beachData.longitude)
  },[])


  const getWeather = (lat, long) => {
    axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${process.env.WEATHER_API_KEY}&units=metric`)
    .then(response => {
        const { main, weather } = response.data;
        setWeatherIcon(`http://openweathermap.org/img/w/${
          weather[0]["icon"]}.png`)
          setWeather(main.temp.toFixed())
          setWeatherDescription(weather[0].description)
    })
    .catch(error => console.log(error))

}

  async function getFlag(la, lo) {
    const flag = await getbeachState(la, lo);
    setBeachState(flag);
  }

  // Pin a favorite beach
  const pinBeach = (id) => {
      const token = localStorage.getItem('accessToken');
      const decoded = jwt_decode(token);
      const userId = decoded['id'];
      axios.post(process.env.API_BASE_URL + 'api/v1/user/pinned/',
        {
          user_id: userId,
          beach_id: id
        },
      {
        headers: {
        'Authorization': 'bearer ' + token,
        'content-type': 'application/json'
        }
      }
      ).then(() => {
        console.log(`beach with id ${id} has been pinned to user ${userId}`)
      })
      .catch((err) => {
        console.error(err);
    })

  }


  const ratingChanged = (newRating) => {
    setRate(newRating)
  };


  const handleClick = () => {
    handleOpen()
  }

  function getAmenities() {
    let amenities = [];
    for (const [key, value] of Object.entries(props.beachData.amenities)) {
      amenities.push(<li key={uuidv4()}>{value}</li>)
    }
    return amenities;
  }
 

  function checkLogin() {
    const token = localStorage.getItem('accessToken');
    if (token) {
      return true;
    }
  }

  const found = () => {
    for (let i=0; i<props.pinnedArray.length; i++) {
      for (let j=0; j<props.pinnedArray[i].length; j++) {
        if (props.pinnedArray[i][j] === props.id) {
          return true
        }
      }
    }
    return false
  }

  if (found()) {
      return (
        <>
        <FavoriteCard
        id={props.id}
        key={props.id}
        beachName={props.beachName}
        beachData={props.beachData}
        governorateArray={props.governorateArray}
      />
      {
        open ? <BasicModal
         open={open}
         handleClose={handleClose} 
         beachName={props.beachName} 
         image={props.beachData.imagepath}
         /> : null
       }
       </>
      )
    }

    else if(!found()) {
      return (
        <>
          <div className='f p-5' >
            <div className="beach-card bg-dark card text-white" >
            {checkLogin() && 
            
              <button className='pin' onClick={() => {
                setCheck(prevCheck => !prevCheck)
                pinBeach(props.id)
                window.location.reload();
                
                }}>

                  {check ? <i className="fas fa-heart text-danger" ></i> : <i className="far fa-heart"></i>}
                  
              </button>

            }
            <div className='overflow'>
              <img className="card-img-top" src={props.beachData.imagepath} alt="Card image cap"  />
              <div className="image-button">
                {
                  checkLogin()
                   ?
                   <a onClick={handleClick} href="#"> Check reviews </a>
                   :
                   <a href="/login"> Check reviews </a>
                }
                
              </div>
            </div>
            <div className="card-body">
              <div className="card-title">
                <h5 >{props.beachName}</h5>
              </div>
              
            </div>
            <ul className="list-group list-group-flush">
              <li key={uuidv4()} className="weather-data list-group-item text-dark">
              <span className='card-list-title'>Current weather :</span>
                <div style={{display: 'flex', alignItems: 'center'}}>
                
                {weather} <sup>°C</sup>
                <img className="weather-icon" src={weatherIcon} /> 
                </div>
                <p>{weatherDescription}</p>
                </li>
                <li key={uuidv4()} className="list-group-item text-dark"><span className='card-list-title'>Beach state : </span> {getFlag(props.beachData.latitude, props.beachData.longitude) && beachState === "green"
            ?
            <> 
              <i className="green-flag fas fa-solid fa-flag"> Green flag</i>
              <p>Low hazard ~ Calm conditions, exercise caution.</p>
            </>
              : 
            beachState === "orange"
             ?
            <>
              <i className="orange-flag fas fa-solid fa-flag"> Orange flag</i>
              <p>Medium hazard ~ Ocean conditions are rough (moderate surf and/or currents).</p>
            </>
            : 
            <>
              <i className="red-flag fas fa-solid fa-flag"> Red flag</i>
              <p>High Hazard ~ Rough conditions (strong surf and/or currents) are present.</p>
            </>
          }
          </li>
              <li key={uuidv4()} className="list-group-item text-dark"><span className='card-list-title'>Amenities :</span> <ul>{getAmenities()}</ul></li>
            </ul>
            {checkLogin() &&
            <>
              <div className='stars-div'>
              <ReactStars
                count={5}
                onChange={ratingChanged}
                size={24}
                isHalf={true}
                emptyIcon={<i className="far fa-star"></i>}
                halfIcon={<i className="fa fa-star-half-alt"></i>}
                fullIcon={<i className="fa fa-star"></i>}
                activeColor="#ffd700"
              />       
              {
                rate ? <div style={{fontFamily: 'Amiri'}}><p>Your rate ({rate}) has been received</p><p>Thank you !</p></div> : null
              }
            </div>
            </>
            }
            </div>
          </div>
          {
            open ? <BasicModal
            open={open}
            handleClose={handleClose} 
            beachName={props.beachName} 
            image={props.beachData.imagepath}
            /> : null
          }
        </>
      )
    }
  
}

export default BeachCard