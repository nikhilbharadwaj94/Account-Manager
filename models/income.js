var mongoose = require("mongoose"),
passportLocalMongoose = require("passport-local-mongoose");

var incomeSchema = new mongoose.Schema({
   amount : Number,
   category : String,
   timeStamp : {type: Date,default: Date.now}
});

//customerSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Income", incomeSchema);