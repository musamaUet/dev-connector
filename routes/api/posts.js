const express = require("express");
const router = express.Router();

// @router      GET api/post
// @desc        Test route
// @access      Public
router.get("/", (req, res) => {
  res.send("This is post route");
});

module.exports = router;
