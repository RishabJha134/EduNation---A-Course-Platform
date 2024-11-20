const { Tags } = require("../models/Tags");

const createTag = async (req,res) => {
  try {
    const { name, description } = req.body;
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "all fields are required",
      });
    }
    const tagDetails = await Tags.create({
      name: name,
      description: description,
    });
    console.log(tagDetails);

    return res.status(200).json({
      success: true,
      message: "tag details created",
      //   tagDetails: tagDetails,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "error in createTag" + err,
    });
  }
};

const showAllTags = async (req,res) => {
  try {
    const tags = await Tags.find({},{name:true,description:true});
    if (!tags) {
      return res.status(401).json({
        success: false,
        message: "tags not found",
        tags,
      });
    }
    return res.status(200).json({
      success: true,
      message: "all tags are fetched successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "error in showAllTags" + err,
    });
  }
};

module.exports = { createTag, showAllTags };
