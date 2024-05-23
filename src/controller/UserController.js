const { userService } = require("../service");
const httpStatus = require("http-status");
const ApiError = require("../utils/ErrorHandler");
const catchAsync = require("../utils/ApiHandler");
const createToken = require("../utils/createToken");
const bcrypt = require("bcryptjs");

const createUser = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  const isExist = await userService.findUserByEmail(email.toLowerCase());

  if (isExist) {
    throw new ApiError(httpStatus.CONFLICT, "User already exists", true);
  }

  const user = await userService.registerUser({
    firstName,
    lastName,
    email: email.toLowerCase(),
    password,
  });
  if (!user)
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "User not saved successfully",
      true
    );

  res.json({
    data: user,
    token: createToken(user._id),
    success: true,
    message: "User has been created.",
  });
});

// LOGIN USER
const loginUser = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await userService.findUserByEmail(email.toLowerCase());

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found", true);
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect password", true);
  }

  const { password: _, ...userData } = user.toObject();

  return res.json({
    success: true,
    data: userData,
    token: createToken(userData._id),
  });
});

const socialLoginUserSession = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, accessToken } = req.body;

  const userData = await userService.findUserByEmail(email.toLowerCase());

  if (userData) {
    res.json({
      success: true,
      data: userData,
      token: createToken(userData._id),
    });

    return;
  }

  const user = await userService.registerUser({
    firstName,
    lastName,
    email: email.toLowerCase(),
    isSocialAuth: true,
  });
  if (!user)
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "User not saved successfully",
      true
    );
  const { password: _, ...userRecord } = user.toObject();

  res.json({
    data: userRecord,
    token: createToken(userRecord._id),
    success: true,
    message: "User has been created.",
  });
});

const getAllUsers = catchAsync(async (req, res) => {
  if (!req.user) {
    return next(
      new ApiError(httpStatus.UNAUTHORIZED, "Authentication failed.", true)
    );
  }
  const users = await userService.getAllUsers();
  res.json({
    success: true,
    data: users,
  });
});

module.exports = {
  loginUser,
  createUser,
  getAllUsers,
  socialLoginUserSession,
};
