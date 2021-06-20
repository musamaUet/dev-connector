const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const User = require('../../models/User');
const config = require('config');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');

// @router      GET api/auth
// @desc        Test route
// @access      Public
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    return res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Internal server error' });
  }
});

router.post(
  '/',
  [
    check('email', 'Email is not exists').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    try {
      const { email, password } = req.body;
      let errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors });
      }
      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User does not exists' }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid credentials' }] });
      }
      req.user = user;
      const payload = {
        user: { id: user.id },
      };
      let token = jwt.sign(payload, config.get('jwtSecret'), {
        expiresIn: 360000,
      });
      console.log('token', token);
      return res.status(200).json(token);
    } catch (err) {
      console.log('err', err);
      res.status(500).json({ msg: 'Internal server error' });
    }
  }
);

module.exports = router;
