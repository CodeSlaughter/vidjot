const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');

//Load Idea model
require('../models/User');
const User = mongoose.model('users');

//User login route
router.get('/login', (req,res) => {
    res.render('users/login');
});

//User register route
router.get('/register', (req,res) => {
    res.render('users/register')
});

//Login post
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/ideas',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

//Register post
router.post('/register', (req, res) => {
    let errors = [];
    if (req.body.password !== req.body.password2){
        errors.push({text: 'Passwords do not match'})
    }
    if (req.body.password.length < 4){
        errors.push({text: 'Password length must be greater than 4 characters'})
    }
    if (errors.length > 0){
        res.render('users/register', {
            errors: errors,
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            password2: req.body.password2
        })
    } else {
        User.findOne({email: req.body.email})
        .then(user => {
            if(user){
                req.flash('error_msg', 'Email already registered');
                res.redirect('/users/login');
            }
            else {
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password
                })
                bcrypt.genSalt(10, (er, salt) => {
                     bcrypt.hash(newUser.password, salt, (er, hash) => {
                         if (er) throw er;
                         newUser.password = hash;
                         newUser.save()
                         .then(user => {
                             req.flash('success_msg', 'You are now registered and can login');
                             res.redirect('/users/login')
                         })
                         .catch(err => console.log(err))
                     });
                });
            }
        })
    }
})

//Logout User
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are now logged out');
    res.redirect('/users/login');
})

module.exports = router;
