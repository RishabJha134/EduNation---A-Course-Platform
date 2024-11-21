const { Profile } = require("../models/Profile");
const { User } = require("../models/User");

const updateProfile = async (req, res) => {
  try {
    //1. get data:-
    const { dateOfBirth = "", about = "", contactNumber, gender } = req.body;
    //2. get user id:-
    const id = req.user.id;
    //3. validation:-
    if (!contactNumber || !gender) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    //4.find profile:-
    const userDetails = await User.findById(id);
    const profileId = userDetails.additionalDetails;
    // const profileDetails = await Profile.findByIdAndUpdate(
    //   {
    //     _id: profileId,
    //   },
    //   {
    //     dateOfBirth,
    //     about,
    //     contactNumber,
    //     gender,
    //   },
    //   {
    //     new: true,
    //   }
    // );/

    const profileDetails = await Profile.findById(profileId);
    profileDetails.dateOfBirth = dateOfBirth;
    profileDetails.about = about;
    profileDetails.contactNumber = contactNumber;
    profileDetails.gender = gender;
    await profileDetails.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profileDetails,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "error in updateProfile" + err.message,
    });
  }
};

// pehle profile delete hoga then user delete hoga because user ke andar profile hai toh hum inner to outer delete karenge for maintin the consistency
// this is also known as referential integrity.
const deleteAccount = async (req, res) => {
  try {
    //1. get id:-
    const id = req.user.id;
    //2. validation:-
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User id is required",
      });
    }

    const userDetails = await User.findById(id);
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    //3. delete profile:-
    await Profile.findByIdAndDelete({ _id: userDetails.additionalDetails });

    // todo-> remove user from enrolled courses from the Course schema in this field:-
    // studentEnrolled: [
    //     {
    //       type: mongoose.Schema.Types.ObjectId,
    //       required: true,
    //       ref: "User",
    //     },
    //   ],
    // we need course id

    //4. delete user:-
    await User.findByIdAndDelete({ _id: id });

    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "error in deleteAccount" + err.message,
    });
  }
};

const getAllUserDetails = async (req, res) => {
  try {
    const id = req.user.id;
    const userDetails = await User.findById(id).populate("additionalDetails").exec();
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User details fetched successfully",
      userDetails,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "error in getAllUserDetails" + err.message,
    });
  }
};

module.exports = { updateProfile, deleteAccount, getAllUserDetails };
