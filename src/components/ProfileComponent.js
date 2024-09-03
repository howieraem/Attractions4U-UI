import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

import { attractionCategories, countries } from '../shared/Signup.js';

var config = require('../config');

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8; 
const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 5 + ITEM_PADDING_TOP,
        width: 300,
      },
    },
};

function getStyles(group, single, theme) {
    return {
      fontWeight:
        single.indexOf(group) === -1
          ? theme.typography.fontWeightRegular
          : theme.typography.fontWeightMedium,
    };
}

function Profile(props) {
    const navigate = useNavigate();
    if (props.token === "" || props.username === "") {
        navigate('/');
    }

    const [loading, setLoading] = useState(true);
    const theme = useTheme();

    const [attractions, setAttractions] = useState([]);
    const [favCty, setFavCty] = useState([]);

    useEffect(() => {
        const params = "/"+ props.username;

        fetch(config.serverUrl+"/profile"+params, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': props.token
            },
        })
        .then(res => res.json())
        .then(data => {
            if (data.length <= 0) alert("Failed to fetch user profile!");
            else {
                setAttractions(data.attractions);
                setFavCty(data.favCty);
                setLoading(false);
            }
        })
        .catch(err => alert("Failed to fetch user profile!"));
    }, [props.token, props.username]);

    const handleChangeAttractions = (event) => {
        const {
          target: { value },
        } = event;
        setAttractions(
          // On autofill we get a stringified value.
          typeof value === 'string' ? value.split(',') : value,
        );
    };

    const handleChangeFavCty = (event) => {
        const {
          target: { value },
        } = event;
        setFavCty(
          // On autofill we get a stringified value.
          typeof value === 'string' ? value.split(',') : value,
        );
    };

    const save = (event) => {
        console.log("username: "+props.username);
        console.log("attractions: "+attractions);
        console.log("favcty: "+favCty);

        event.preventDefault();
        let databody = {
            "username": props.username,
            "attractions": attractions,
            "favCty": favCty
        }
        
        fetch(config.serverUrl+'/update_profile', {
            method: 'POST',
            body: JSON.stringify(databody),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': props.token
            },
        })
        .then(res => res.json())
        .then(data => {
            if(data.success === false) alert(data.status);
            else{
                navigate('/profile');
            }
        })
    }

    if (loading) {
        return <CircularProgress />;
    }

    return(
        <Container fluid>
            <div id="profile" className='left-align'>
                <div id="profile-title">Hi, {props.username} !</div>
                <div className="profile-label">Preference</div>
                <Select
                    required
                    sx={{ height: '60px' }}
                    id="attraction-types"
                    label=""
                    multiple
                    fullWidth
                    variant="standard"
                    value={attractions}
                    onChange={handleChangeAttractions}
                    MenuProps={MenuProps}
                >
                    {attractionCategories.map((attraction) => (
                        <MenuItem
                            key={attraction}
                            value={attraction}
                            style={getStyles(attraction, attractions, theme)}
                            >
                            {attraction}
                        </MenuItem>
                    ))}
                </Select>
                <div className="profile-label">Favorite Countries</div>
                <Select
                    required
                    sx={{ height: '60px' }}
                    labelId="fav-cty-label"
                    id="fav-cty"
                    label="Favorite Countries"
                    multiple
                    fullWidth
                    variant="standard"
                    value={favCty}
                    onChange={handleChangeFavCty}
                    MenuProps={MenuProps}
                >
                    {countries.map((cty) => (
                        <MenuItem
                            key={cty}
                            value={cty}
                            style={getStyles(cty, favCty, theme)}
                            >
                            {cty}
                        </MenuItem>
                    ))}
                </Select>
                <div id="profile-btn">
                    <Button onClick={(ev) => save(ev)} variant="contained" size="large">Save</Button>
                </div>
            </div>
        </Container>
    );
}

export default Profile;