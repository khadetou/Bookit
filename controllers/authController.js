import User from "../models/user";
import bcryptjs from "bcryptjs";
import asyncHandler from "../middlewares/asyncHandler";
import cloudinary from "cloudinary";
import crypto from "crypto";
import absoluteUrl from "next-absolute-url";
import sendEmail from "../utils/sendEmail";
import ErrorHandler from "../utils/errorHandler";

//Setting up cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINAR_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//@desc register user
//@route post/api/auth/register

export const registerUser = asyncHandler(async (req, res) => {
  console.log(req.body.avatar);
  const result = await cloudinary.v2.uploader.upload(
    req.body.avatar,
    {
      folder: "bookit/avatars",
      width: "150",
      crop: "scale",
    },
    (err, result) => {
      if (err) {
        console.log(err);
      }
      return result;
    }
  );

  let { name, email, password } = req.body;

  //Encrypt Password
  const salt = await bcryptjs.genSalt(10);
  password = await bcryptjs.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: result.public_id,
      url: result.secure_url,
    },
  });

  res.status(200).json({
    success: true,
    message: "Account registered successfully",
  });
});

//@desc get user
//@route get/api/me

export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    user,
  });
});

//@desc get All user
//@route get/api/admin/users

export const getAdminUsers = asyncHandler(async (req, res) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});

//@desc Update user profile
//@route put/api/me

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  const { name, email, password, avatar } = req.body;

  if (user) {
    user.name = name;
    user.email = email;
    if (password) user.password = password;
  }

  //Update the avatar
  if (avatar !== "") {
    const image_id = user.avatar.public_id;

    //Delete user previous image/avatar
    await cloudinary.v2.uploader.destroy(image_id);

    const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "bookit/avatars",
      width: "150",
      crop: "scale",
    });

    user.avatar = {
      public_id: result.public_id,
      url: result.secure_url,
    };
  }

  await user.save();

  res.status(200).json({
    success: true,
  });
});

//@desc Forgot password
//@route put/api/password/forgot

export const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("User not found with this email", 404));
  }

  //Get resetToken
  //Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");

  //Hash and set to reset password field
  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  //Set token expire time
  user.resetPasswordExpired = Date.now() + 30 * 60 * 1000;

  await user.save({ validateBeforeSave: false });

  //Get origin
  const { origin } = absoluteUrl(req);
  //Create a reset password url
  const resetUrl = `${origin}/password/reset/${resetToken}`;

  const message = `Your password reset url is as follow: \n\n${resetUrl} \n\n If you have not requested this email then ignore it.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Bookit Password Reset",
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email}`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpired = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
});

//@desc reset password token
//@route put/api/password/reset/:token
export const resetPassword = asyncHandler(async (req, res, next) => {
  //Hash and set to reset password field
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.query.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpired: { $gt: Date.now() },
  });

  let { password, confirmPassword } = req.body;

  if (!user) {
    return next(
      new ErrorHandler(
        "Password reset token is invalid or has been expired",
        400
      )
    );
  }

  if (password !== confirmPassword) {
    return next(new ErrorHandler("Password doesn't match", 400));
  }

  //Set up the new password
  const salt = await bcryptjs.genSalt(10);
  password = await bcryptjs.hash(password, salt);

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpired = undefined;

  await user.save();
  res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
});
