const express = require('express');
const router = express.Router();
const AuthService = require('../services/authService');

router.get('/token', (req, res, next) => {

    AuthService.authorize(req.query.code).then(data => {

        res.render('profile');

    }).catch(error => {

        console.log(error);
    });

});




module.exports = router;