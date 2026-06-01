const mongoose = require(`mongoose`);

const NotificationSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: `User`,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: [`RideRequest`, `RequestAccepted`, `RequestRejected`, `RideCancelled`, `Message`]
    },
    title:   { type: String, required: true },
    message: { type: String, required: true },
    relatedRideID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: `Ride`
    },
    relatedRequestID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: `RideRequest`
    },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date }

}, { timestamps: true });

// Fetch unread notifications for a user fast
NotificationSchema.index({ userID: 1, isRead: 1 });

module.exports = mongoose.model(`Notification`, NotificationSchema);
