import { useLocation } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import StarRatingComponent from 'react-star-rating-component';

var config = require('../config');

function Page(props) {
    const [loading, setLoading] = useState(true);

    const location = useLocation();
    const id = location.pathname.split("/")[2];
    const [attr, setAttr] = useState({
        "attractionId": 0,
        "attractionName": "",
        "attractionType": "",
        "description": "",
        "photos": [],
        "rating": 0.0,
        "reviews_cnt": 0,
        "address": "",
        "opening_hours": {"weekday_text": []},
        "restaurants": []
    });

    useEffect(() => {
        const params = `/${id}`;

        fetch(config.serverUrl+"/attraction"+params, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': props.token,
            },
        })
        .then(res => {
            if (res.status !== 200) {
                throw new Error(res.status);
            }
            return res.json();
        })
        .catch(err => alert("An error occurred!"))
        .then(data => {
            if (data.length <= 0) alert(data.status);
            else {
                setAttr(data);
                setLoading(false);
            }
        })
    }, [id, props.token]);

    const images = attr.photos.map((photo, index) => {
        return(
            <img className="attr-photo" key={index} src={photo} alt={attr.attractionName}/>
        );
    });

    const open_hrs = attr.opening_hours.weekday_text.length > 0 ? attr.opening_hours.weekday_text.map((hr, index) => {
        return (
            <p key={index}>{hr}</p>
        );
    }) : 'Unknown'; 

    console.log(attr.restaurants);
    const rests = attr.restaurants.length > 0 ? attr.restaurants.map((rest) => {
        return(
            <div key={rest.id}>
                <h5 className='bold-text'>{rest.name} <span className='p-text'>{rest.price} {makeCate(rest.categories)}</span></h5>
                <p>{rest.review_count} review(s) {rest.rating} star(s)</p>
                <p>Phone: {rest.phone}</p>
                <p>Address: {rest.location.address1}, {rest.location.city}, {rest.location.state}-{rest.location.zip_code}, {rest.location.country}</p>
            </div>
        );
    }) : '(None found)';

    function makeCate(categories){
        let res = [];
        for(let index = 0; index < categories.length; index++){
            res.push(categories[index].title);
        }
        return res.join(", ");
    }

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Grid id="page" container spacing={4} style={{marginTop: "20px"}}>
            <Grid item xs={12} sm={4}>{images}</Grid>
            <Grid item xs={12} sm={7} className='left-align'>
                <h1>{attr.attractionName}</h1>
                <h3>{attr.attractionType}
                    <span id="attr-cnt">
                        <StarRatingComponent 
                            name="rate" 
                            starCount={10}
                            value={attr.rating}
                            isHalf={true}
                            starColor={"#e06666"}
                            emptyStarColor={"white"}
                            renderStarIcon={() => <i className="fa fa-star" aria-hidden="true"></i>}
                            renderStarIconHalf={() =><i className="fa fa-star-half" aria-hidden="true" style={{color:"#e06666"}}></i> }
                            />
                    </span>
                </h3>
                <p>{attr.description}</p>
                <h4>Address: </h4>
                <p>{attr.address}</p>
                <h4>Opening Hours: </h4>
                {open_hrs}
                <div id="rest">
                    <h4>Nearby Restaurants</h4>
                    {rests}
                </div>
            </Grid>
        </Grid>
    );
}

export default Page;