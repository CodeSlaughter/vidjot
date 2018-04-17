const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {ensureAuthentificated} = require('../helpers/auth')

//Load Idea model
require('../models/Idea')
const Idea = mongoose.model('ideas')

//Idea index page
router.get('/', ensureAuthentificated, (req, res) => {
    Idea.find({
        user: req.user.id
    })
    .sort({date: 'desc'})
    .then(ideas => {
        res.render('ideas/index', {
            ideas: ideas
        })
    })
    
})

//Add idea form
router.get('/add', ensureAuthentificated, (req, res) => {
    res.render('ideas/add')
})

//Edit idea form
router.get('/edit/:id', ensureAuthentificated, (req, res) =>{ 
    Idea.findOne({
        _id: req.params.id
    })
    .then(idea => {
        if (idea.user != req.user.id) {
            req.flash('error_msg', 'Not authorized');
            res.redirect('/ideas')
        } else {
            res.render('ideas/edit', {
                idea: idea
            });
        }  
    });
})

//Process form
router.post('/', ensureAuthentificated, (req, res) => {
    let errors = [];
    if(!req.body.title){
        errors.push({text: `Please add a title`})
    }
    if(!req.body.details){
        errors.push({text: `Please add some details`})
    }

    if (errors.length > 0){
        res.render('ideas/add', {
            errors: errors,
            title: req.body.title,
            details: req.body.details
        })
    } else {
        const newUser = {
            title: req.body.title,
            details: req.body.details,
            user: req.user.id
        }
        new Idea(newUser)
        .save()
        .then(idea => {
            req.flash('success_msg', 'Video idea added')
            res.redirect('/ideas')
        })
        .catch(error => console.log(error))
    }
})

//Edit form process
router.put('/:id', ensureAuthentificated, (req, res) => {
    Idea.findOne({
        _id: req.params.id
    })
    .then(idea => {
        // new values
        idea.title = req.body.title;
        idea.details = req.body.details;

        idea.save()
        .then(idea => {
            req.flash('success_msg', 'Video idea updated')
            res.redirect('/ideas')
        })
        .catch(error => {
            console.log(error)
        })

    })
    .catch(error => {
        console.log(error)
    })
})

//Delete and idea
router.delete('/:id', ensureAuthentificated, (req, res) => {
    Idea.remove({
        _id: req.params.id
    })
    .then(() => {
        req.flash('success_msg', 'Video idea removed')
        res.redirect('/ideas')
    })
    .catch(error => console.log(error))
})

module.exports = router;