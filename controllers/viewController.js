const express = require('express');
const router = express.Router();
const AuthService = require('../services/authService');
const configs = require('../config');

//Setup redirect methods
const redirectToLogin = (req, res, next) => {

    req.session.reload(function(err) {
        
        console.log('Redirecting to login: Status: ' + req.session.isLogged);
        console.log(req.session);
        if(!req.session.isLogged){

            res.redirect('/');
        }
        else{
            next();
        }
    });
}

const redirectToHome = (req, res, next) => {


    req.session.reload(function(err) {
        
        console.log('Redirecting to home: Status: ' + req.session.isLogged);
        console.log(req.session);
        if(req.session.isLogged === true){

            res.redirect('/profile/');
        }
        else{
            next();
        }
    
    });
    
}

router.get('/', (req, res) => {

    AuthService.getAuthenticationUrl().then(data => {
        
        res.render('index', {authUrl: data.data});

    }).catch(error => {
        
        console.log(error);
        res.render('error', {message: error.message, status: error.status});
    });
       
});

router.get('/profile', (req, res) => {

    res.render('profile');
});

module.exports = router;
