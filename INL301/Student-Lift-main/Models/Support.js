const mongoose = require(`mongoose`);

// =============================================================================
// REPORTS — covers the SQL Reports table
// =============================================================================
const ReportSchema = new mongoose.Schema({
    reportingUserID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: `User`,
        required: true
    },
    reportedUserID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: `User`,
        required: true
    },
    rideID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: `Ride`
    },
    reason: {
        type: String,
        required: true,
        enum: [`Behavior`, `Payment`, `Safety`, `Other`]
    },
    description: { type: String, required: true, maxlength: 500 },
    evidence:    { type: String },   // URL to image or document
    status: {
        type: String,
        enum: [`Submitted`, `Under Review`, `Resolved`, `Closed`],
        default: `Submitted`
    },
    resolution: { type: String, maxlength: 500 },
    resolvedAt: { type: Date }

}, { timestamps: true });

// =============================================================================
// SUPPORT TICKETS — covers the SQL SupportTickets table
// =============================================================================
const SupportTicketSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: `User`,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: [`Bug`, `Feature Request`, `General Support`, `Payment`]
    },
    subject:     { type: String, required: true, maxlength: 200 },
    description: { type: String, required: true },
    status: {
        type: String,
        enum: [`Open`, `In Progress`, `Resolved`, `Closed`],
        default: `Open`
    },
    priority: {
        type: Number,
        enum: [1, 2, 3],   // 1 = High, 2 = Medium, 3 = Low
        default: 3
    },
    resolution: { type: String },
    resolvedAt: { type: Date }

}, { timestamps: true });

// =============================================================================
// DIRECT MESSAGES — covers the SQL DirectMessages table
// =============================================================================
const DirectMessageSchema = new mongoose.Schema({
    senderID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: `User`,
        required: true
    },
    receiverID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: `User`,
        required: true
    },
    relatedRideID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: `Ride`
    },
    message: { type: String, required: true, maxlength: 1000 },
    isRead:  { type: Boolean, default: false },
    readAt:  { type: Date }

}, { timestamps: true }); // createdAt = sentAt

// Indexes
DirectMessageSchema.index({ receiverID: 1, isRead: 1 });
DirectMessageSchema.index({ senderID: 1, receiverID: 1 });

// =============================================================================
// EXPORTS
// =============================================================================
module.exports = {
    Report:        mongoose.model(`Report`, ReportSchema),
    SupportTicket: mongoose.model(`SupportTicket`, SupportTicketSchema),
    DirectMessage: mongoose.model(`DirectMessage`, DirectMessageSchema)
};
