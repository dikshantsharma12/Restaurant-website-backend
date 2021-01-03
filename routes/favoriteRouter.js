// var express = require('express');
// var bodyParser = require('body-parser');
// var mongoose = require('mongoose');

// var Favorite = require('../models/favorite');
// var Dish = require('../models/dishes');
// var verify = require('./verify');

// var favoriteRouter = express.Router();
// favoriteRouter.use(bodyParser.json());

// favoriteRouter.route('/')
//     .all(verify.verifyOrdinaryUser)
//     .get(function (req, res, next) {
//         Favorite.find({'postedBy': req.decoded._doc._id})
//             .populate('postedBy')
//             .populate('dishes')
//             .exec(function (err, favorites) {
//                 if (err) return err;
//                 res.json(favorites);
//             });
//     })

//     .post(function (req, res, next) {

//         Favorite.find({'postedBy': req.decoded._doc._id})
//             .exec(function (err, favorites) {
//                 if (err) throw err;
//                 req.body.postedBy = req.decoded._doc._id;

//                 if (favorites.length) {
//                     var favoriteAlreadyExist = false;
//                     if (favorites[0].dishes.length) {
//                         for (var i = (favorites[0].dishes.length - 1); i >= 0; i--) {
//                             favoriteAlreadyExist = favorites[0].dishes[i] == req.body._id;
//                             if (favoriteAlreadyExist) break;
//                         }
//                     }
//                     if (!favoriteAlreadyExist) {
//                         favorites[0].dishes.push(req.body._id);
//                         favorites[0].save(function (err, favorite) {
//                             if (err) throw err;
//                             console.log('Um somethings up!');
//                             res.json(favorite);
//                         });
//                     } else {
//                         console.log('Setup!');
//                         res.json(favorites);
//                     }

//                 } else {

//                     Favorite.create({postedBy: req.body.postedBy}, function (err, favorite) {
//                         if (err) throw err;
//                         favorite.dishes.push(req.body._id);
//                         favorite.save(function (err, favorite) {
//                             if (err) throw err;
//                             console.log('Something is up!');
//                             res.json(favorite);
//                         });
//                     })
//                 }
//             });
//     })

//     .
//     delete(function (req, res, next) {
//         Favorite.remove({'postedBy': req.decoded._doc._id}, function (err, resp) {
//             if (err) throw err;
//             res.json(resp);
//         })
//     });

// favoriteRouter.route('/:dishId')
//     .all(verify.verifyOrdinaryUser)
//     .delete(function (req, res, next) {

//         Favorite.find({'postedBy': req.decoded._doc._id}, function (err, favorites) {
//             if (err) return err;
//             var favorite = favorites ? favorites[0] : null;

//             if (favorite) {
//                 for (var i = (favorite.dishes.length - 1); i >= 0; i--) {
//                     if (favorite.dishes[i] == req.params.dishId) {
//                         favorite.dishes.remove(req.params.dishId);
//                     }
//                 }
//                 favorite.save(function (err, favorite) {
//                     if (err) throw err;
//                     console.log('Here you go!');
//                     res.json(favorite);
//                 });
//             } else {
//                 console.log('No favourites!');
//                 res.json(favorite);
//             }

//         });
//     });

// module.exports = favoriteRouter;
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var authenticate = require('../authenticate');
const Favorites = require('../models/favorite');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,(req,res,next) => {
    Favorites.find({user:req.user._id})
    .populate('user dishes')
    .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Favorites.find({user:req.user._id})
    .then((favorite) => {
        if(favorite ==null){
    favorites.create({user:req.user._id},{dishes:req.body})
    .then((favorite) => {
        console.log('favorite Created ', favorite);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    }, (err) => next(err))
    .catch((err) => next(err));
}
else{
    Favorites.findOneAndUpdate(
        {user: req.user._id},
        {$addToSet: { dishes: req.body._id } },
        {upsert: true,  returnNewDocument: true}
    )
    .then((user_favorite) => {

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(user_favorite);
    }, (err) => next(err))
    .catch((err) => next(err));
}
})
})
.delete(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
    Favorites.remove({user: req.user._id})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));    
});


favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.post(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    var conditions = {
        user: req.user._id,
        'dishes._id': { $ne: req.params.dishId }
    };
    
    var update = {
        $addToSet: { dishes: req.params.dishId }
    }
    Favorites.findOneAndUpdate(
        conditions,
        update,
        {upsert: true,  returnNewDocument: true}
    )
    .then((user_favorite) => {

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(user_favorite);
    }, (err) => next(err))
    .catch((err) => next(err));
})

.delete(cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
  
    Favorites.update(
        {user: req.user._id},
        {$pull: {dishes: req.params.dishId } }
    )
    .then((user_favorite) => {

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(user_favorite);
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = favoriteRouter;