const express = require('express');
const router = express.Router();
const AuthService = require('../services/authService');

router.get('/token', (req, res) => {

    AuthService.authorize(req.query.code).then(data => {

        res.redirect('/profile?action=login');

    }).catch(error => {

        console.log(error);
        res.redirect('/');
    });

});

router.post('/upload', (req, res) => {

    AuthService.uploadFile(req, res).then(data => {

        console.log(data.message);
        res.redirect('/profile?action=upload&status=true');

    }).catch(error => {

        console.log(error);
        res.redirect('/profile?action=upload&status=false');
    })
});

router.post('/delete', (req, res) => {

    AuthService.deleteFileById(req.body.fileID).then(data => {

        res.send({message: data.message, data: data.data});

    }).catch(error => {

        res.send({message: error.message});
    })
});






module.exports = router;