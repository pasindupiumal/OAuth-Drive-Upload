const express = require('express');
const router = express.Router();
const AuthService = require('../services/authService');


router.get('/', (req, res) => {

    AuthService.getAuthenticationUrl().then(data => {
        
        res.render('index', {authUrl: data.data});

    }).catch(error => {
        
        console.log(error);
        res.render('error', {message: error.message, status: error.status});
    });
       
});

module.exports = router;
