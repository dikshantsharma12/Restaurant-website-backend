var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({

//username and passport automatically included by passport
firstname:{
    type: String,
    default:''
},
lastname:{
    type: String,
    default:''

},
facebookId:String,
admin:{
        type:Boolean,
        default:false
    }

});
User.plugin(passportLocalMongoose);
module.exports= mongoose.model('User',User);