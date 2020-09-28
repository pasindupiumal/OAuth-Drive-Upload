const express = require('express');
const router = express.Router();
const AuthService = require('../services/authService');

router.get('/token', (req, res) => {

    AuthService.authorize(req.query.code).then(data => {

        res.redirect('/profile');

    }).catch(error => {

        console.log(error);
        res.redirect('/');
    });

});




module.exports = router;