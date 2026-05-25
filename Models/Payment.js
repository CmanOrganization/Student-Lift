const mongoose = require(`mongoose`);

const PaymentSchema = new mongoose.Schema({
    requestID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: `RideRequest`,
        required: true
    },
    amount:        { type: Number, required: true },
    paymentMethod: {
        type: String,
        required: true,
        enum: [`Card`, `Bank Transfer`, `Wallet`, `Cash`]
    },
    transactionID: { type: String },
    status: {
        type: String,
        enum: [`Pending`, `Completed`, `Failed`, `Refunded`],
        default: `Pending`
    },
    completedAt: { type: Date }

}, { timestamps: true });

PaymentSchema.index({ status: 1 });
PaymentSchema.index({ createdAt: -1 });

module.exports = mongoose.model(`Payment`, PaymentSchema);
