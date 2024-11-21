const { Section } = require("../models/Section");
const { SubSection } = require("../models/SubSection");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

const createSubSection = async (req, res) => {
  try {
    //1. fetch data
    const { sectionId, title, timeDuration, description } = req.body;
    //2. fetch video file media
    const video = req.files.videoFile;
    //2.1 data validation
    if (!sectionId || !title || !timeDuration || !description || !video) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    //3. upload video file to cloudinary
    const uploadDetails = await uploadImageToCloudinary(
      video,
      process.env.FOLDER_NAME
    );
    if (!uploadDetails) {
      return res.status(400).json({
        success: false,
        message: "Failed to upload video",
      });
    }
    //4. create a subSection:-
    const newSubSection = new SubSection.create({
      title: title,
      timeDuration: timeDuration,
      description: description,
      videoUrl: uploadDetails.secure_url,
    });
    //5. update section schema with this created newSubSection id-> matlab section schema ke newSubSection me ye created newSubSection id daaldo so that we can see that is section ke andar kon kon sa newSubSection(video) create hua hai:-
    const updatedSection = new Section.findByIdAndUpdate(
      {
        _id: sectionId,
      },
      {
        $push: {
          subSection: newSubSection._id,
        },
      },
      {
        new: true,
      }
    );
    return res.status(200).json({
      success: true,
      message: "Subsection created successfully",
      updatedSection,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "error in createSubSection" + err.message,
    });
  }
};

const updateSubSection = async (req, res) => {
  try {
    const { subSectionId, title, timeDuration, description } = req.body;
    const video = req.file.videoFile;
    if (!subSectionId || !title || !timeDuration || !description || !video) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const updatedUploadUrl = await uploadImageToCloudinary(
      video,
      process.env.FOLDER_NAME
    );

    if (!updatedUploadUrl) {
      return res.status(400).json({
        success: false,
        message: "Failed to upload video",
      });
    }

    const updatedSubSection = await SubSection.findByIdAndUpdate(
      {
        _id: subSectionId,
      },
      {
        title: title,
        timeDuration: timeDuration,
        description: description,
        videoUrl: updatedUploadUrl.secure_url,
      },
      {
        new: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Subsection updated successfully",
      updatedSubSection,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "error in updateSubSection" + err.message,
    });
  }
};

const deleteSubSection = async (req, res) => {
  try {
    const { subSectionId } = req.params;
    if (!subSectionId) {
      return res.status(400).json({
        success: false,
        message: "Subsection ID is required",
      });
    }
    const deletedSubSection = await SubSection.findByIdAndDelete({
      _id: subSectionId,
    });
    return res.status(200).json({
      success: true,
      message: "Subsection deleted successfully",
      deletedSubSection,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "error in deleteSubSection" + err.message,
    });
  }
};

module.exports = { createSubSection, updateSubSection,deleteSubSection };
