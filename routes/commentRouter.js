const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');
const Comments = require('../models/comments');
const Dishes = require('../models/dishes');

const commentRouter = express.Router();

commentRouter.use(bodyParser.json());

commentRouter.route('/')

.options(cors.corsWithOptions, (req,res)=>{
    res.sendStatus(200);
})
    .get(cors.cors,(req, res, next) => {
        Comments.find(req.query).populate('author').then((comments) => {
           
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(comments);
        
            
        }, (err) => next(err)).catch((err) => next(err));
    })

    .post(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
       if(req.nody!=null){
            req.body.author = req.user._id;
           Dishes.findById(req.params.dishId)
           Comments.create(req.body)
           .then((comment)=>{
               Comments.findById(comment._id)
               .populate('auhtor')

               
              
           }, (err) => next(err)).catch((err) => next(err));
        }
        else{
            err = new Error("Comment not found in request Body");
            err.status=404;
            return next(err);

        }
    })

    .put(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation is not supported on /Comments/' );
    })

    .delete(cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Comments.remove({}) 
        .then((res)=>{

        },  (err) => next(err)).catch((err) => next(err));
            
    
    })

commentRouter.route('/:dishId/comments/:commentId')
.options(cors.corsWithOptions, (req,res)=>{
    res.sendStatus(200);
})
    .get(cors.cors,(req, res, next) => {
        Comments.findById(req.params.dishId).populate('comments.author').then((dish) => {
            if (dish != null && dish.comments.id(req.params.commentId)) {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(dish.comments.id(req.params.commentId));
            } else if (dish == null) {
                err = new Error('Dish ' + req.params.dishId + ' not found');
                err.status = 404;
                return next(err);
            } else {
                err = new Error('Comment ' + req.params.commentId + ' not found');
                err.status = 404;
                return next(err);
            }
        }, (err) => next(err)).catch((err) => next(err));
    })

    .post(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation is not supported on /Comments/' + req.params.dishId + '/comments/' + req.params.commentId);
    })

    .put(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
        Comments.findById(req.params.dishId).then((dish) => {
            if (dish != null && dish.comments.id(req.params.commentId)) {
                if (dish.comments.id(req.params.commentId).author.toString() != req.user._id.toString()) {
                    err = new Error('You are not authorized to edit this comment');
                    err.status = 403;
                    return next(err);
                }
                if (req.body.rating) {
                    dish.comments.id(req.params.commentId).rating = req.body.rating;
                }

                if (req.body.comment) {
                    dish.comments.id(req.params.commentId).comment = req.body.comment;
                }
                dish.save().then((dish) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(dish);
                }, (err) => next(err)).catch((err) => next(err));
            } else if (dish == null) {
                err = new Error('Dish ' + req.params.dishId + ' not found');
                err.status = 404;
                return next(err);
            } else {
                err = new Error('Comment ' + req.params.commentId + ' not found');
                err.status = 404;
                return next(err);
            }
        }, (err) => next(err)).catch((err) => next(err));
    })

    .delete(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
        Comments.findById(req.params.dishId).then((dish) => {
            if (dish != null && dish.comments.id(req.params.commentId)) {
                if (dish.comments.id(req.params.commentId).author.toString() != req.user._id.toString()) {
                    err = new Error('You are not authorized to edit this comment');
                    err.status = 403;
                    return next(err);
                }
                dish.comments.id(req.params.commentId).remove();
                dish.save().then((dish) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(dish);
                }, (err) => next(err)).catch((err) => next(err));
            } else if (dish == null) {
                err = new Error('Dish ' + req.params.dishId + ' not found');
                err.status = 404;
                return next(err);
            } else {
                err = new Error('Comment ' + req.params.commentId + ' not found');
                err.status = 404;
                return next(err);
            }
        }, (err) => next(err)).catch((err) => next(err));
    });
module.exports= commentRouter;