var mongoose = require("mongoose"),
passportLocalMongoose = require("passport-local-mongoose");

var customerSchema = new mongoose.Schema({
    name : String,
    mobile_no : String,
    breakfast_cost: String,
    lunch_cost : String,
    breakfast_default: String,
    lunch_default : String,
    orders: [
        {
           type: mongoose.Schema.Types.ObjectId,
           //ref here should contain the name of the model which we are refering
           ref: "Order"
        }
    ]
});

//customerSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Customer", customerSchema);