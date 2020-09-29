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

router.post('/upload', (req, res) => {

    AuthService.uploadFile(req, res).then(data => {

        console.log(data);

    }).catch(error => {

        console.log(error);
    })
})




module.exports = router;