const regex = {
  password:
    /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d][A-Za-z\d!@#$%^&*()_+]{8,24}$/,
  phone: /^\d{7,15}$/,
  alpha: /^[a-zA-Z ]*$/,
  objectId: /^[0-9a-fA-F]{24}$/,
};
const message = {
  password:
    "password must be 8 to 24 characters, must include at least 1 upper case character, must include at least 1 lower case character, must include special character !@#$%^&*() ",
  alpha: "Only alphabetic characters are allowed",
  objectId: "Object Id is required field",
  field: function (field) {
    return `${field} is required`;
  },
};
module.exports = { regex, message };
