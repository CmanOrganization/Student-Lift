const mongoose = require(`mongoose`);
const { availableMemory } = require("node:process");

const RideSchema = new mongoose.Schema({
    driverName: {type: String, required:true},
    destination: {type: String, required: true},
    departureTime: {type:Date,required:true},
    availableSeats: {type:Number, required:true},
    passengers: [{type : String}],
    status: {type:  String,default: `open`}
})
module.exports = mongoose.model(`Ride`, RideSchema);