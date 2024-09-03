import React, { useState } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';
import Button from '@mui/material/Button';

import LoginModal from './LoginModalComponent.js';
import RegisterModal from './RegisterModalComponent.js';

import { useNavigate } from "react-router-dom";


function Header(props) {

    const navigate = useNavigate();

    const [openLoginModal, setOpenLoginModal] = useState(false);
    const [openSignupModal, setOpenSignupModal] = useState(false);

    const handleClickOpenLogin = () => {
        setOpenLoginModal(true);
    };

    const handleCloseLogin = () => {
        setOpenLoginModal(false);
    };

    const handleClickOpenSignup = () => {
        setOpenSignupModal(true);
    };

    const handleCloseSignup = () => {
        setOpenSignupModal(false);
    };

    const handleLogout = () => {
        props.onUsernameChange("", "");
        navigate('/');
    }

    return (
        <div id="header">
            <Navbar bg="light" expand="lg">
                <Container fluid>
                    <Navbar.Brand id="brand" onClick={()=> navigate('/')}>Attractions4U</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        {props.username !== '' && (
                            <Nav className="me-auto">
                                <Nav.Link className="navlink" onClick={()=> navigate('/')}>Home</Nav.Link>
                                <Nav.Link className="navlink" onClick={()=> navigate('/search')}>Search</Nav.Link>
                                <Nav.Link className="navlink" onClick={()=> navigate('/profile')}>Profile</Nav.Link>
                            </Nav>
                        )}
                        {props.loading ? '' : (
                            <Nav className='ms-auto'>
                                {props.username === "" ? (
                                    <>
                                        <Button id="login-modal-btn" variant="outlined"  onClick={handleClickOpenLogin}>
                                            Login
                                        </Button>
                                        <Button id="register-modal-btn" variant="outlined" onClick={handleClickOpenSignup}>
                                            Sign Up
                                        </Button>
                                    </>
                                ) : (
                                    <Button id="logout-modal-btn" variant="outlined" onClick={handleLogout}>
                                        Logout
                                    </Button>
                                )}
                            </Nav>
                        )}
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <LoginModal 
                onUsernameChange={props.onUsernameChange} 
                username={props.username} 
                openLoginModal={openLoginModal} 
                handleClickOpenLogin={handleClickOpenLogin} 
                handleCloseLogin={handleCloseLogin} 
            />
            <RegisterModal 
                onUsernameChange={props.onUsernameChange} 
                username={props.username} 
                openSignupModal={openSignupModal}
                handleClickOpenSignup={handleClickOpenSignup} 
                handleCloseSignup={handleCloseSignup}
            />
        </div>
    );
  }
  
export default Header;