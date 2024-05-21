const { UserModel } = require("../model");

const registerUser = async (payload) => {
  return await UserModel.create(payload);
};

const findUserByEmail = async (email) => {
  return await UserModel.findOne({ email });
};

const updateUser = async (_id, payload) => {
  return await UserModel.findByIdAndUpdate(_id, payload, {
    new: true,
  });
};

const deletingUser = async (_id) => {
  return await UserModel.findByIdAndDelete(_id);
};

const findOneUser = async (payload) => {
  try {
    const user = await UserModel.findOne(payload);
    return user;
  } catch (error) {
    console.error("Error:", error);
  }
};

const findUserById = async (_id) => {
  return await UserModel.findById(_id);
};

module.exports = {
  registerUser,
  findUserByEmail,
  findUserById,
  updateUser,
  deletingUser,
  findOneUser,
};
