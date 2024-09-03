import React, { useRef, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import { useNavigate } from 'react-router-dom';
import { CognitoUser, AuthenticationDetails } from "amazon-cognito-identity-js";
import UserPool from '../CognitoCli';

var config = require('../config');

function LoginModal(props) {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [touched, setTouched] = useState({email: false, password: false});

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

    const Login = (event) => {
        if (canSubmit(errors)) {
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
                    props.onUsernameChange(email, data.getIdToken().getJwtToken());
                    setEmail('');
                    setPassword('');
                    setTouched({...touched, email: false, password: false})
                    props.handleCloseLogin();
                },

                onFailure: err => {
                    console.log("login failure:", err);
                    alert("Login error! See console log for more details.")
                },

                newPasswordRequired: data => {
                    console.log("login new password required:", data);
                    alert("Login password needs to be renewed!")
                }
            });
        } else {
            alert("Invalid email or password!");
        }

    }

    const errors = validate(email, password);

    return(
        <Dialog open={props.openLoginModal} onClose={props.handleCloseLogin}>
            <DialogTitle>Login</DialogTitle>
            <DialogContent>
                <TextField
                    required
                    margin="dense"
                    id="email"
                    label="Email Address"
                    type="email"
                    fullWidth
                    variant="standard"
                    value={email}
                    onBlur={() => setTouched({...touched, email: true})}
                    onChange={(event) => setEmail(event.target.value)}
                    error={errors.email!==""}
                    helperText={errors.email}
                />
                <TextField
                    required
                    margin="dense"
                    id="password"
                    label="Password"
                    type="password"
                    fullWidth
                    variant="standard"
                    value={password}
                    onBlur={() => setTouched({...touched, password: true})}
                    onChange={(event) => setPassword(event.target.value)}
                    error={errors.password!==""}
                    helperText={errors.password}
                />
            </DialogContent>
            <DialogActions>
                <Button id="modal-submit" onClick={Login} variant="contained" size="large">Login</Button>
                <Button onClick={props.handleCloseLogin}>Cancel</Button>
            </DialogActions>
        </Dialog>
    );
}

export default LoginModal;