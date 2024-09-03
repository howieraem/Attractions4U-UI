import React, { useState, useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Header from './HeaderComponent';
import Home from './HomeComponent';
import Search from './SearchComponent';
import Page from './PageComponent';
import Profile from './ProfileComponent';
import { Routes, Route } from "react-router-dom";


var config = require('../config');


function Main(props) {
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState("");
    const [token, setToken] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setLoading(false);
            return;
        }
        const username = localStorage.getItem("username");
        
        // Try fetching the profile to verify the token
        fetch(config.serverUrl+`/profile/${username}`, {
            method: 'GET',
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
        .catch(err => {
            console.log("Invalid token! Please sign in again!");
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            setUsername("");
            setToken("");
            setLoading(false);
        })
        .then(() => {
            setUsername(username);
            setToken(token);
            setLoading(false);
        })
    }, []);

    useEffect(() => {
        return () => {
            window.addEventListener("beforeunload", function(e) {
                sessionStorage.remove('search');
            });
        }
    });

    const onUsernameChange = (cur_username, cur_token) => {
        setUsername(cur_username);
        setToken(cur_token);
        if (cur_username === "" || cur_token === "") {
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            return;
        }
        localStorage.setItem("username", cur_username);
        localStorage.setItem("token", cur_token);
    };

    return (
        <div>
            <Header username={username} onUsernameChange={onUsernameChange} loading={loading} />
            {loading ? (
                <CircularProgress />
            ) : (
                <Routes>
                    <Route exact path="/" element={<Home username={username} token={token}/>} />
                    <Route exact path="/search" element={<Search username={username} token={token}/>} />
                    <Route exact path="/page/:id" element={<Page username={username} token={token} />} />
                    <Route exact path="/profile" element={<Profile username={username} token={token}/>} />
                </Routes>
            )}
        </div>
    );
  }
  
  export default Main;