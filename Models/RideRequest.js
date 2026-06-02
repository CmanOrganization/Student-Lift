const mongoose = require(`mongoose`);

const RideRequestSchema = new mongoose.Schema({
    rideID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: `Ride`,
        required: true
    },
    passengerID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: `User`,
        required: true
    },
    numberOfSeats: { type: Number, required: true, min: 1 },
    status: {
        type: String,
        enum: [`Pending`, `Accepted`, `Rejected`, `Cancelled`],
        default: `Pending`
    },
    notes:       { type: String, maxlength: 300 },
    respondedAt: { type: Date }

}, { timestamps: true }); // createdAt = requestedAt

// Indexes — mirrors your SQL IX_RideRequests_* indexes
RideRequestSchema.index({ rideID: 1 });
RideRequestSchema.index({ passengerID: 1 });
RideRequestSchema.index({ status: 1 });

module.exports = mongoose.model(`RideRequest`, RideRequestSchema);
