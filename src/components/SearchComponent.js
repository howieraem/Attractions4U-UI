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
import StarRatingComponent from 'react-star-rating-component';
import { useNavigate } from "react-router-dom";

var config = require('../config');

function Search(props) {

    const navigate = useNavigate();

    const [keyword, setKeyword] = useState("");
    const [searchAttr, setSearchAttr] = useState([]);

    const search = useCallback((query) => {
        sessionStorage.setItem('search', query);

        if (query === "") {
            alert("Keyword cannot be empty!");
        } else {
            const params = `/${query}`;

            fetch(config.serverUrl+"/search"+params, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': props.token,
                },
            })
            .then(res => res.json())
            .then(data => {
                setSearchAttr(data);
                if (!data.length) {
                    alert("Unable to find any attractions with your query!");
                }
            });
        }
    }, [])

    useEffect(() => {
        const stored_kw = sessionStorage.getItem('search');
        // console.log("useEffect kw: "+stored_kw);
        if(stored_kw !== "" && stored_kw != null){
            setKeyword(sessionStorage.getItem('search'));
            search(sessionStorage.getItem('search'));
        }
    }, [props.token, search]);

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

    const searchAttrValid = searchAttr !== undefined 
        && searchAttr !== null 
        && Object.prototype.toString.call(searchAttr) === '[object Array]' 
        && searchAttr.length > 0;

    return (
        <Container>
            <Box sx={{display: 'inline-flex', width: '85%', marginTop: "20px"}}>
                <SearchBar
                    style={{ width: "100%" }}
                    value={keyword}
                    onChange={(newValue) => {
                        if (!newValue) {
                            sessionStorage.removeItem('search');
                        }
                        setKeyword(newValue);
                    }}
                    onCancelSearch={() => { sessionStorage.removeItem('search'); setKeyword("") }}
                    onRequestSearch={() => search(keyword)}
                    placeholder="Search..."
                />
            </Box>
            <Box sx={{display: 'inline-flex', width: '15%'}}> 
                <Button id="search" variant="contained" onClick={() => search(keyword)}>Search</Button>
            </Box>
            {searchAttrValid && (
                <>
                    <div className="title">Search Results</div>
                    <Grid container spacing={2} style={{marginTop: "20px"}}>
                        {makeList(searchAttr)}
                    </Grid>
                </>
            )}
      </Container>
    );
}

export default Search;