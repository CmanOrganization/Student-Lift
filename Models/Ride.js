const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
    driverID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    campus: {
        type: String,
        required: true,
        enum: ['Stellenbosch', 'Pretoria', 'Kempton Park']
    },
    fromLocation: {
        type: String,
        required: true
    },
    toLocation: {
        type: String,
        required: true
    },
    departureDate: {
        type: Date,
        required: true
    },
    departureTime: {
        type: String,
        required: true
    },
    estimatedDuration: {
        type: Number,
        required: true
    },
    availableSeats: {
        type: Number,
        required: true
    },
    totalSeats: {
        type: Number,
        required: true
    },
    costPerSeat: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Active', 'Completed', 'Cancelled'],
        default: 'Active'
    },
    vehicle: {
        type: { type: String, required: true },
        plate: { type: String, required: true },
        color: { type: String, required: true }
    },
    preferences: {
        luggageAccepted: { type: Boolean, default: false },
        petFriendly: { type: Boolean, default: false },
        musicInCar: { type: Boolean, default: false }
    },
    additionalNotes: {
        type: String,
        default: ''
    },
    completionDetails: {
        actualPassengers: { type: Number },
        totalCost: { type: Number },
        completionStatus: { type: String, enum: ['Completed', 'Cancelled'] },
        completedAt: { type: Date }
    }
}, { timestamps: true });

module.exports = mongoose.model('Ride', rideSchema);