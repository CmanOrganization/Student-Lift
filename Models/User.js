const mongoose = require(`mongoose`);

const UserSchema = new mongoose.Schema({
    firstName:    { type: String, required: true },
    lastName:     { type: String, required: true },
    email:        { type: String, required: true, unique: true, lowercase: true },
    phoneNumber:  { type: String, required: true },
    passwordHash: { type: String, required: true },
    campus: {
        type: String,
        required: true,
        enum: [`Stellenbosch`, `Pretoria`, `Kempton Park`]
    },
    studentID:  { type: String, required: true, unique: true },
    avatar:     { type: String },
    bio:        { type: String, maxlength: 500 },
    isVerified: { type: Boolean, default: false },
    isActive:   { type: Boolean, default: true },
    lastLogin:  { type: Date },

    // Wallet is 1:1 with user — embed it directly
    wallet: {
        balance:     { type: Number, default: 200.00 },
        totalAdded:  { type: Number, default: 0.00 },
        totalSpent:  { type: Number, default: 0.00 },
        lastUpdated: { type: Date, default: Date.now }
    },

    // Pre-calculated so we don't AVG on every profile load
    ratingSummary: {
        average: { type: Number, default: 0 },
        count:   { type: Number, default: 0 }
    }

}, { timestamps: true }); // auto-adds createdAt + updatedAt

// Indexes — same as your SQL IX_Users_* indexes
UserSchema.index({ campus: 1 });
UserSchema.index({ isActive: 1 });

module.exports = mongoose.model(`User`, UserSchema);
