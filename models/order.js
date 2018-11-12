var mongoose = require("mongoose"),
  passportLocalMongoose = require("passport-local-mongoose");

var orderSchema = new mongoose.Schema({
  name : String,
  breakfast_number : Number,
  lunch_number : Number,
  order_cost : Number,
  created : {type: Date,default: Date.now}
});

// orderSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Order", orderSchema);
