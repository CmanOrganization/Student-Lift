const mongoose = require(`mongoose`);

// Separate from the User doc because transactions grow unboundedly
// and are queried as a ledger/history — not appropriate to embed

const WalletTransactionSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: `User`,
        required: true
    },
    type: {
        type: String,
        enum: [`Credit`, `Debit`],
        required: true
    },
    amount:        { type: Number, required: true },
    description:   { type: String, maxlength: 300 },
    relatedRideID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: `Ride`
    }

}, { timestamps: true });

// Fetch a user's transaction history sorted by newest first
WalletTransactionSchema.index({ userID: 1, createdAt: -1 });

module.exports = mongoose.model(`WalletTransaction`, WalletTransactionSchema);
