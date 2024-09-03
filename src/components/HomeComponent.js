import React, { useState, useEffect, useCallback } from 'react';
import Container from 'react-bootstrap/Container';
import SearchBar from "material-ui-search-bar";
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import StarRatingComponent from 'react-star-rating-component';
import { useNavigate } from "react-router-dom";

var config = require('../config');

function Home(props) {

    const navigate = useNavigate();

    const [recAttr, setRecAttr] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Recommendation requires user login
        if (props.token !== "" && props.username !== "") {
            fetch(config.serverUrl+"/feed", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': props.token
                },
            })
            .then(res => {
                if (res.status !== 200) {
                    throw new Error(res.status);
                }
                return res.json();
            })
            .catch(err => {
                console.log(err);
                alert("Failed to fetch recommendation!");
            })
            .then(data => {
                // console.log("feed data:", data);
                if (data === undefined || data === null || data.length === 0) return;  // alert("No recommendation returned!");
                else {
                    setRecAttr(data);
                }
            })
        } else {
            setRecAttr([]);
        }
        setLoading(false);
    }, [props.token, props.username]);

    if (loading) {
        return <CircularProgress />;
    }

    const makeList = (list) => {
        return (
            list.map((attr) => {
                return(
                    <Grid key={attr.attractionId} item xs={12} sm={4}>
                        <Card key={attr.attractionId} style={{ height: '100%' }}>
                            <CardMedia
                                component="img"
                                alt={attr.attractionName}
                                image={attr.photos[0]}
                                style={{
                                    width: "100%",
                                    height: "300px"
                                }}
                            />
                            <CardContent>
                                <Typography gutterBottom variant="h4" component="div">
                                    {attr.attractionName}
                                </Typography>
                                <Typography gutterBottom variant="h6" component="div" align="right">  
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
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {attr.description}
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button id="more" size="medium" onClick={() => navigate('/page/'+ attr.attractionId)}>More</Button>
                            </CardActions>
                        </Card>
                    </Grid>
                );
            })
        );
    }


    return (
        <Container>
            {props.token && props.username && (
                <>
                    <div id="rec-title" className="title">Recommendations for You!</div>
                    <Grid container spacing={2} style={{marginTop: "20px"}}>
                        {makeList(recAttr)}
                    </Grid>
                </>
            )}
      </Container>
    );
}

export default Home;