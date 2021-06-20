const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
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

// @router      Post api/profile/
// @desc        Create or update user profile
// @access      Private

router.post(
  '/',
  [
    auth,
    [
      check('status', 'Status is required').not().isEmpty(),
      check('skills', 'Skills are required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    let profileFields = {};
    profileFields.user = req.user.id;
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      facebook,
      youtube,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills)
      profileFields.skills = skills.split(',').map((skill) => skill.trim());

    profileFields.social = {};
    if (facebook) profileFields.social.facebook = facebook;
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (instagram) profileFields.social.instagram = instagram;
    if (linkedin) profileFields.social.linkedin = linkedin;

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }
      profile = new Profile(profileFields);
      await profile.save();
      return res.json(profile);
    } catch (error) {
      return res.status(500).send('server error');
    }
  }
);

// @router      Post api/profile/
// @desc        Get all profiles
// @access      Public

router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find({}).populate('user', [
      'company',
      'avatar',
    ]);
    if (!profiles) return res.status(400).json({ msg: 'No profile found' });
    return res.json(profiles);
  } catch (error) {
    return res.status(500).send('server error');
  }
});

// @router      Post api/profile/user/:id
// @desc        Get profile by id
// @access      Public

router.get('/user/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const profile = await Profile.findOne({ user: user_id }).populate('user', [
      'company',
      'avatar',
    ]);
    if (!profile)
      return res.status(400).json({ msg: 'No profile found of this user id' });

    return res.json(profile);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'No profile found of this user id' });
    }
    return res.status(500).send('server error');
  }
});

// @router      Post api/profile/
// @desc        Delete profile, user and its posts
// @access      Private

router.delete('/', auth, async (req, res) => {
  try {
    const user_id = req.user.id;
    await Profile.findOneAndDelete({ user: user_id });
    await User.findOneAndDelete({ _id: user_id });

    return res.json({ msg: 'User deleted' });
  } catch (error) {
    return res.status(500).send('server error');
  }
});

// @router      Post api/profile/experience
// @desc        Add user experience
// @access      Private

router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('company', 'Company is required').not().isEmpty(),
      check('from', 'From Date is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user_id = req.user.id;

    const { title, company, location, from, to, current, description } =
      req.body;

    let newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      let profile = await Profile.findOne({ user: user_id });
      if (!profile) {
        return res.status(400).json({ msg: 'Profile not found' });
      }
      profile.experience.unshift(newExp);
      await profile.save();
      return res.json(profile);
    } catch (error) {
      console.log('error', error);
      return res.status(500).send('server error');
    }
  }
);

// @router      Put api/profile/experience
// @desc        Add user experience
// @access      Private

router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('company', 'Company is required').not().isEmpty(),
      check('from', 'From Date is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user_id = req.user.id;

    const { title, company, location, from, to, current, description } =
      req.body;

    let newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      let profile = await Profile.findOne({ user: user_id });
      if (!profile) {
        return res.status(400).json({ msg: 'Profile not found' });
      }
      profile.experience.unshift(newExp);
      await profile.save();
      return res.json(profile);
    } catch (error) {
      console.log('error', error);
      return res.status(500).send('server error');
    }
  }
);

// @router      Post api/profile/experience/:exp_id
// @desc        Delete User experience
// @access      Private

router.delete('/experience/:exp_id', auth, async (req, res) => {
  const user_id = req.user.id;

  try {
    let profile = await Profile.findOne({ user: user_id });
    if (!profile) {
      return res.status(400).json({ msg: 'Profile not found' });
    }
    console.log('req.params.exp_id', req.params.exp_id);
    let removeIndex;
    profile.experience.map((item, i) => {
      if (item._id == req.params.exp_id) {
        removeIndex = i;
      }
    });

    if (!removeIndex)
      return res.status(400).json({ msg: 'Invalid experience id' });
    profile.experience.splice(removeIndex, 1);
    await profile.save();

    return res.json(profile);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'Invalid experience id' });
    }
    return res.status(500).send('server error');
  }
});

// @router      Put api/profile/school
// @desc        Add user experience
// @access      Private

router.put(
  '/education',
  [
    auth,
    [
      check('school', 'School is required').not().isEmpty(),
      check('degree', 'Degree is required').not().isEmpty(),
      check('fieldofstudy', 'Feild of Study is required').not().isEmpty(),
      check('from', 'from is required').not().isEmpty(),
      check('to', 'to is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      let profile = Profile.findOne({ user: req.user.id });
      if (!profile)
        return res.status(400).json({ msg: 'Profile does not exists' });
      const { school, degree, fieldofstudy, from, to, current, description } =
        req.body;
      const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description,
      };

      profile.education.unshift(newEdu);
      await profile.save();
      return res.json(profile);
    } catch (error) {
      return res.status(500).send('server error');
    }
  }
);

// @router      Post api/profile/education/:edu_id
// @desc        Delete User Education
// @access      Private

router.delete('/education/:edu_id', auth, async (req, res) => {
  const user_id = req.user.id;

  try {
    let profile = await Profile.findOne({ user: user_id });
    if (!profile) {
      return res.status(400).json({ msg: 'Profile not found' });
    }
    let removeIndex;
    profile.education.map((item, i) => {
      if (item._id == req.params.edu_id) {
        removeIndex = i;
      }
    });

    if (!removeIndex)
      return res.status(400).json({ msg: 'Invalid education id' });
    profile.experience.splice(removeIndex, 1);
    await profile.save();

    return res.json(profile);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'Invalid education id' });
    }
    return res.status(500).send('server error');
  }
});

module.exports = router;
