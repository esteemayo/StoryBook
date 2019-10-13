const express = require('express');
const router = express.Router();
const Story = require('../models/Story');
const { ensureAuthenticated, ensureGuest } = require('../helpers/auth');

// STORY INDEX
router.get('/', (req, res) => {
    Story.find({ status: 'public' })
        .populate('user')
        .sort({ date: 'desc' })
        .then(stories => {
            res.render('stories/index', {
                stories
            });
        });
});

// SHOW SINGLE STORY
router.get('/show/:id', (req, res) => {
    Story.findOne({
        _id: req.params.id
    })
        .populate('user')
        .populate('comments.commentUser')
        .then(story => {
            if (story.status == 'public') {
                res.render('stories/show', {
                    story
                });
            } else {
                if (req.user) {
                    if (req.user.id == story.user._id) {
                        res.render('stories/show', {
                            story
                        });
                    } else {
                        res.redirect('/stories');
                    }
                } else {
                    res.redirect('/stories');
                }
            }
        });
});

// LIST STORIES FROM A USER
router.get('/user/:userId', (req, res) => {
    Story.find({ user: req.params.userId, status: 'public' })
        .populate('user')
        .then(stories => {
            res.render('stories/index', {
                stories
            });
        });
});

// LOGGED IN USERS STORIES
router.get('/my', ensureAuthenticated, (req, res) => {
    Story.find({ user: req.user.id })
        .populate('user')
        .then(stories => {
            res.render('stories/index', {
                stories
            });
        });
});

// ADD STORY FORM
router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('stories/add');
});

// EDIT STORY FORM
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
    Story.findOne({
        _id: req.params.id
    })
        .then(story => {
            if (story.user != req.user.id) {
                res.redirect('/stories');
            } else {
                res.render('stories/edit', {
                    story
                });
            }
        });
});

// PROCESS ADD STORY
router.post('/', (req, res) => {
    let errors = [];

    if (!req.body.title || !req.body.body || !req.body.status) {
        errors.push({ text: 'Please fill the required fields' });
    }

    let allowComments;
    if (req.body.allowComments) {
        allowComments = true;
    } else {
        allowComments = false
    }

    if (errors.length > 0) {
        res.render('stories/add', {
            errors: errors,
            title: req.body.title,
            body: req.body.body,
            status: req.body.status,
            allowComments: req.body.allowComments
        });
    } else {
        const newStory = {
            title: req.body.title,
            body: req.body.body,
            status: req.body.status,
            allowComments: allowComments,
            user: req.user.id
        }

        new Story(newStory)
            .save()
            .then(story => {
                req.flash('success', 'Story successful created!');
                res.redirect(`/stories/show/${story.id}`);
            });
    }
});

// EDIT FORM PROCESS
router.put('/:id', (req, res) => {
    Story.findOne({
        _id: req.params.id
    })
        .then(story => {
            let allowComments;
            if (req.body.allowComments) {
                allowComments = true;
            } else {
                allowComments = false;
            }

            // New value
            story.title = req.body.title;
            story.body = req.body.body;
            story.status = req.body.status;
            story.allowComments = allowComments;

            story.save()
                .then(story => {
                    req.flash('success', 'Story updated successfully!');
                    res.redirect('/dashboard');
                });
        });
});

// DELETE STORY
router.delete('/:id', (req, res) => {
    Story.deleteOne({ _id: req.params.id })
        .then(() => {
            req.flash('success', 'Story successfully removed!');
            res.redirect('/dashboard');
        });
});

// ADD COMMENT
router.post('/comment/:id', (req, res) => {
    Story.findOne({
        _id: req.params.id
    })
        .then(story => {
            const newComment = {
                commentBody: req.body.commentBody,
                commentUser: req.user.id
            }

            // Add to comments array
            story.comments.unshift(newComment);

            story.save()
                .then(story => {
                    req.flash('success', 'Comment Posted!');
                    res.redirect(`/stories/show/${story.id}`);
                });
        });
});






module.exports = router;