const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @router      GET api/profile/me
// @desc        Get current user profile
// @access      Private

router.get('/me', auth, (req, res) => {
  try {
    const user_id = req.user.id;
    const profile = Profile.findOne({ user: user_id }).populate('user', [
      'name',
      'avatar',
    ]);
    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user' });
    }
    return res.json(profile);
  } catch (error) {
    return res.status(500).send('server error');
  }
});

module.exports = router;
