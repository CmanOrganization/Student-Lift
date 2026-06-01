const mongoose = require(`mongoose`);

const RatingSchema = new mongoose.Schema({
    userID: {           // the person being rated
        type: mongoose.Schema.Types.ObjectId,
        ref: `User`,
        required: true
    },
    ratedByUserID: {    // the person giving the rating
        type: mongoose.Schema.Types.ObjectId,
        ref: `User`,
        required: true
    },
    rideID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: `Ride`,
        required: true
    },
    score:   { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 500 }

}, { timestamps: true });

// One rating per ride per rater — mirrors your SQL CK_UniqueRating constraint
RatingSchema.index({ rideID: 1, ratedByUserID: 1 }, { unique: true });
RatingSchema.index({ userID: 1 });

// After a rating is saved, auto-update the user's ratingSummary
// so you never have to recalculate the average manually
RatingSchema.post(`save`, async function () {
    const stats = await mongoose.model(`Rating`).aggregate([
        { $match: { userID: this.userID } },
        { $group: {
            _id: `$userID`,
            average: { $avg: `$score` },
            count:   { $sum: 1 }
        }}
    ]);

    if (stats.length > 0) {
        await mongoose.model(`User`).findByIdAndUpdate(this.userID, {
            'ratingSummary.average': Math.round(stats[0].average * 10) / 10,
            'ratingSummary.count':   stats[0].count
        });
    }
});

module.exports = mongoose.model(`Rating`, RatingSchema);
