const express = require('express');
const { signupUser, loginuser, allUsers } = require('../controller/userController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();


// router.route("/").post(signupUser)
router.post("/", signupUser)
router.post("/login", loginuser)
router.route("/").get(protect, allUsers);

module.exports = router;