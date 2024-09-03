import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useTheme } from '@mui/material/styles';

import { CognitoUser, AuthenticationDetails } from "amazon-cognito-identity-js";

import { attractionCategories, countries } from '../shared/Signup.js';

import UserPool from '../CognitoCli';


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

function RegisterModal(props) {
    const theme = useTheme();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [attractions, setAttractions] = useState([]);
    const [favCty, setFavCty] = useState([]);
    const [touched, setTouched] = useState({email: false, password: false});

    const handleChangeAttractions = (event) => {
        console.log("attr");
        console.log(JSON.stringify(event.target.value));
        const {
          target: { value },
        } = event;
        setAttractions(
          // On autofill we get a stringified value.
          typeof value === 'string' ? value.split(',') : value,
        );
    };

    const handleChangeFavCty = (event) => {
        console.log("fav cty");
        console.log(JSON.stringify(event.target.value));
        const {
          target: { value },
        } = event;
        setFavCty(
          // On autofill we get a stringified value.
          typeof value === 'string' ? value.split(',') : value,
        );
    };

    const validate = (email, password) => {
        const errors = {
            email: "",
            password: ""
        };
        var emailRe = /\S+@\S+\.\S+/;
        if (touched.email && !emailRe.test(email))
            errors.email = 'Email format invalid!';
            
        if (touched.email && email === "") 
            errors.email = 'Email cannot be empty!';

        if(touched.password && password === "")
            errors.password = 'Password cannot be empty!';


        return errors;
    }

    const canSubmit = (err) => {
        if(!touched.email || !touched.password) return false;
        else if(err.email !== "" || err.password !== "") return false;
        else
            return true;
    }

    const Signup = (event) => {
        if (canSubmit(errors)) {
            console.log(email);
            console.log(password);

            event.preventDefault();
            
            UserPool.signUp(email, password, [], null, (err, data) => {
                if (err) { 
                    alert(err);
                    return;
                }
                console.log("sign up return data", data);

                // Do login for the user (Cognito sign up doesn't return session/tokens)
                const user = new CognitoUser({
                    Username: email,
                    Pool: UserPool
                });
                const authDetails = new AuthenticationDetails({
                    Username: email,
                    Password: password
                });

                user.authenticateUser(authDetails, {
                    onSuccess: data => {
                        console.log("login success:", data);
                        const token = data.getIdToken().getJwtToken();
                        props.onUsernameChange(email, token);

                        let databody = {
                            "username": email,
                            "attractions": attractions,
                            "favCty": favCty,
                        }
                        
                        fetch(config.serverUrl+'/register', {
                            method: 'POST',
                            body: JSON.stringify(databody),
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': token
                            },
                        })
                        .then(res => {
                            if (res.status !== 200) {
                                throw new Error(res.status);
                            }
                            return res.json();
                        })
                        .then(data => {
                            if (data.success === false) { 
                                alert(`User registered, but profile creation failed: ${data.err ? data.err : "unknown error"}`); 
                            }
                            setEmail('');
                            setPassword('');
                            setAttractions([]);
                            setFavCty([]);
                            setTouched({...touched, email: false, password: false});
                            props.handleCloseSignup();
                        })
                        .catch(err => {
                            alert("User registered, but profile creation failed!");
                            setEmail('');
                            setPassword('');
                            setAttractions([]);
                            setFavCty([]);
                            setTouched({...touched, email: false, password: false});
                            props.handleCloseSignup();
                        })
                    },

                    onFailure: err => {
                        console.log("login failure after sign up:", err);
                        alert("Login error after sign up! See console log for more details.")
                    },
    
                    newPasswordRequired: data => {
                        // This shouldn't happen on sign up success
                        console.log("New password required after sign up:", data);
                        alert("New password required after sign up!")
                    }
                });
            });
        } else {
            alert("Invalid email or password!");
        }
    }

    const errors = validate(email, password);

    return(
        <Dialog open={props.openSignupModal} onClose={props.handleCloseSignup} fullWidth>
                <DialogTitle>Signup</DialogTitle>
                <DialogContent>
                    <TextField
                        required
                        margin="dense"
                        id="new-email"
                        label="Email Address"
                        type="email"
                        fullWidth
                        variant="outlined"
                        sx={{ height: '60px', marginBottom: '20px' }}
                        value={email}
                        onBlur={() => setTouched({...touched, email: true})}
                        onChange={(event) => setEmail(event.target.value)}
                        error={errors.email!==""}
                        helperText={errors.email}
                    />
                    <TextField
                        required
                        margin="dense"
                        id="new-password"
                        label="Password"
                        type="password"
                        fullWidth
                        variant="outlined"
                        sx={{ height: '60px', marginBottom: '20px'  }}
                        value={password}
                        onBlur={() => setTouched({...touched, password: true})}
                        onChange={(event) => setPassword(event.target.value)}
                        error={errors.password!==""}
                        helperText={errors.password}
                    />
                    <FormControl fullWidth sx={{ marginTop: '10px' }}>
                        <InputLabel id="attraction-types-label" variant="outlined">Preference</InputLabel>
                        <Select
                            required
                            sx={{ height: '60px' }}
                            labelId="attraction-types-label"
                            id="attraction-types"
                            label="Preference"
                            multiple
                            fullWidth
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
                    </FormControl>
                    <FormControl fullWidth sx={{ marginTop: '15px' }}>
                        <InputLabel id="fav-cty-label" variant="outlined">Favorite Countries</InputLabel>
                        <Select
                            required
                            sx={{ width: "100%", height: '60px' }}
                            labelId="fav-cty-label"
                            id="fav-cty"
                            label="Favorite Countries"
                            multiple
                            fullWidth
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
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button id="modal-submit" onClick={Signup} variant="contained" size="large">Signup</Button>
                    <Button onClick={props.handleCloseSignup} color="info">Cancel</Button>
                </DialogActions>
            </Dialog>
    );
}

export default RegisterModal;