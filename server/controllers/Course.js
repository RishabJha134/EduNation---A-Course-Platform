const { Course } = require("../models/Course");
const { Tags } = require("../models/Tags");
const { User } = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const createCourse = async (req, res) => {
  try {
    //1. fetch data:-
    const { courseName, courseDescription, whatYouWillLearn, price, tag } =
      req.body; // here tag means a tagId.
    //2. get thumbnail:-
    const thumbnail = req.files.thumbnailImage;

    //3. validation:-
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !tag ||
      !thumbnail
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    //4. check for instructor:-
    const userId = req.user.id; // ye user instructor hai toh yeh instructor ka id hai:-
    const instructorDetails = await User.findById(userId); // now we have instructor ka object id.
    console.log("instructorDetails" + instructorDetails);
    if (!instructorDetails) {
      return res.status(404).json({
        success: false,
        message: "instructor not found",
      });
    }

    //5. check given tag valid or not:-
    const tagDetails = await Tags.findById(tag); // now we have tag ka object id.
    if (!tagDetails) {
      return res.status(404).json({
        success: false,
        message: "Tag not found",
      });
    }

    // upload image to cloudinary:-
    const thumbnailImage = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    );

    // create an entry for new course:-
    const newCourse = await Course.create({
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      thumbnail: thumbnailImage.secure_url,
      tag: tagDetails._id,
      instructor: instructorDetails._id,
    });

    // add this new course to the user schema of instructor-> is instructor ne kon kon se course create kare hai isiliye:-
    const updatedInstructorDetails = await User.findByIdAndUpdate(
      {
        _id: instructorDetails._id,
      },
      {
        $push: {
          courses: newCourse._id, // here newCourse._id is the id of the newly created course.
        },
      },
      { new: true }
    );

    // add this new course to the tags schema -> is tag me kon kon se course create kare hai isiliye:-
    const updatedTagsDetails = await Tags.findByIdAndUpdate(
      {
        _id: tagDetails._id,
      },
      {
        $push: {
          course: newCourse._id,
        },
      },
      { new: true }
    );

    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: newCourse,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "error in createCourse" + err.message,
    });
  }
};

const showAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.find(
      {},
    //   {
    //     courseName: true,
    //     price: true,
    //     thumbnail: true,

    //     instructor: true,
    //     ratingAndReviews: true,
    //     studentEnrolled: true,
    //   }
    )
      .populate("instructor")
      .exec();

    return res.status(200).json({
      success: true,
      message: "All courses fetched successfully",
      data: allCourses,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "error in showAllCourses" + err.message,
    });
  }
};

module.exports = { createCourse, showAllCourses };
