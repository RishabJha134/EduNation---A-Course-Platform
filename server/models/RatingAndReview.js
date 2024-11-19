const mongoose = require("mongoose");

const ratingAndReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: "User",
  },
  rating: {
    type: Number,
    required: true,
  },
  review: {
    type: String,
    required: true,
  },
});

const RatingAndReview = mongoose.model(
  "RatingAndReview",
  ratingAndReviewSchema
);

module.exports = { RatingAndReview };
