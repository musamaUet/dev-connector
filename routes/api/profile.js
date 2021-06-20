const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @router      GET api/profile/me
// @desc        Get current user profile
// @access      Private

router.get('/me', auth, async (req, res) => {
  try {
    const user_id = req.user.id;
    console.log('req.user.id', user_id);
    const profile = await Profile.findOne({ user: user_id }).populate('user', [
      'name',
      'avatar',
    ]);
    console.log('profile', profile);

    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user' });
    }
    return res.json(profile);
  } catch (error) {
    console.log('err', error);
    return res.status(500).send('server error');
  }
});

module.exports = router;
