const mongoose = require("mongoose");

const tagsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  course: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  }],
});

const Tags = mongoose.model("Tags", tagsSchema);

module.exports = { Tags };
