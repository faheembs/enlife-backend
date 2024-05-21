const router = require("express").Router();

const authRoute = require("./authRoute");
const moduleRoutes = require('./moduleRoutes')

router.get("/", (req, res) => {
  res.send({
    success: true,
    message: "Enlife' APIs running successfully",
  });
});

router.use("/auth", authRoute);
router.use("/modules", moduleRoutes);

module.exports = router;