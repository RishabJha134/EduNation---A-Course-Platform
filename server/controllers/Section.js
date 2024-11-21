const { Course } = require("../models/Course");
const { Section } = require("../models/Section");

const createSection = async (req, res) => {
  try {
    //1. data fetch
    const { sectionName, courseID } = req.body;
    //2. data validation
    if (!sectionName || !courseID) {
      return res.status(400).json({
        success: false,
        message: "all fields are required",
      });
    }
    //3. create section
    const newSection = await Section.create({
      sectionName,
    });
    //4. update course with this created section id-> matlab course schema ke courseContent me ye created section id daaldo so that we can see that is course ke andar kon kon sa section create hua hai:-
    const updatedCourse = await Course.findByIdAndUpdate(
      {
        _id: courseID, // here courseID is the id of the course in which we want to create a new section.
      },
      {
        $push: {
          courseContent: newSection._id, // here newSection._id is the id of the newly created section.
        },
      },
      {
        new: true, // it will return the updated course document.
      }
    );
    //5. return response
    return res.status(201).json({
      success: true,
      message: "section created successfully",
      updatedCourse,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "error in createSection" + err.message,
    });
  }
};

const updateSection = async (req, res) => {
  try {
    //1. data fetch
    const { sectionName, sectionId } = req.body;
    //2. data validation
    if (!sectionName || !sectionId) {
      return res.status(400).json({
        success: false,
        message: "all fields are required",
      });
    }

    //3. update section
    const updatedSection = await Section.findByIdAndUpdate(
      sectionId,
      {
        sectionName: sectionName,
      },
      {
        new: true, // it will return the updated section document.
      }
    );

    //4. return response
    return res.status(200).json({
      success: true,
      message: "section updated successfully",
      updatedSection,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "error in updateSection" + err.message,
    });
  }
};

const deleteSection = async (req, res) => {
  try {
    //1. data fetch
    const { sectionId } = req.params;
    //2. data validation
    if (!sectionId) {
      return res.status(400).json({
        success: false,
        message: "sectionId is required",
      });
    }
    //3. delete section
    const deletedSection = await Section.findByIdAndDelete(sectionId);
    //4. return response
    return res.status(200).json({
      success: true,
      message: "section deleted successfully",
      deletedSection,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "error in deleteSection" + err.message,
    });
  }
};

module.exports = { createSection, updateSection, deleteSection };
