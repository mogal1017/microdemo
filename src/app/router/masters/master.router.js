const express = require("express");
const router = express.Router();
const master = require("../../controller/masters/masters.controller");

router.get("/", (req, res) => {
  res.json({
    status: 200,
    message: "This is master page!",
  });
});

// master create and update
router.post("/createAndUpdateMaster", master.createAndUpdateMaster);

// get master list
router.post("/getMasterList", master.getMasterList);

module.exports = router;
