const { userController } = require("../controller");
const { validatorMiddleware } = require("../middleware");
const ensureAuthenticated = require("../middleware/ensureAuthenticated");
const { authValidator } = require("../validator");

const router = require("express").Router();

router
  .route("/login")
  .post(validatorMiddleware(authValidator.login), userController.loginUser);

router
  .route("/register")
  .post(validatorMiddleware(authValidator.register), userController.createUser);

router
  .route("/social_login")
  .post(
    validatorMiddleware(authValidator.socialLogin),
    userController.socialLoginUserSession
  );

router
  .route("/update-password")
  .post(validatorMiddleware(authValidator.updatePassword), userController.updatePassword);

router
  .route("/profile")
  .put(ensureAuthenticated, userController.updateProfile);
module.exports = router;
