const router = require("express").Router();

const authRoute = require("./authRoute");
const moduleRoutes = require('./moduleRoutes')
const feedbackRoutes = require('./feedbackRoute')

router.get("/", (req, res) => {
  res.send({
    success: true,
    message: "Enlife' APIs running successfully",
  });
});

router.use("/auth", authRoute);
router.use("/modules", moduleRoutes);
router.use("/feedback", feedbackRoutes);

module.exports = router;