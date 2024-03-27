const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    status: 200,
    message: "This is api page!",
  });
});

router.use("/auth", require("./auth/login.route"));
router.use("/masters", require("./masters/master.router"));

module.exports = router;
