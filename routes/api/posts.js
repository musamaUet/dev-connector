const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');
const Post = require('../../models//Post');
const Profile = require('../../models/Profile');

// @router      POST api/post
// @desc        create user post
// @access      Private

router.post(
  '/',
  [auth, [check('text', 'Text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    try {
      const user = await User.findById(req.user.id).select('-password');
      if (!user)
        return res.status(400).json({ msg: 'No user found with this id' });

      let newPost = {
        test: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };

      const post = new Post(newPost);
      await post.save();
      return res.json(post);
    } catch (error) {
      return res.status(500).send('server error');
    }
  }
);

// @router      GET api/post
// @desc        get user posts
// @access      Private

router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user)
      return res.status(400).json({ msg: 'No user found with this id' });

    const posts = await Post.find({}).sort({ date: -1 });
    if (!posts) return res.status(400).json({ msg: 'No post found' });

    return res.json(posts);
  } catch (error) {
    return res.status(500).send('server error');
  }
});

// @router      GET api/post/:post_id
// @desc        get post by id
// @access      Private

router.get('/:post_id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user)
      return res.status(400).json({ msg: 'No user found with this id' });

    const post = await Post.findById({ _id: req.params.post_id });
    if (!post) return res.status(400).json({ msg: 'No post found' });

    return res.json(post);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'No post found' });
    }
    return res.status(500).send('server error');
  }
});

// @router      DELETE api/post/:post_id
// @desc        delete post by id
// @access      Private

router.delete('/:post_id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user)
      return res.status(400).json({ msg: 'No user found with this id' });

    const post = await Post.findById({ _id: req.params.post_id });
    if (!post) return res.status(400).json({ msg: 'No post found' });
    if (post.user.toString() !== req.body.user)
      return res.status(400).json({ msg: 'User not authorized' });

    await post.remove();
    return res.json({ msg: 'Post deleted successfully' });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'No post found' });
    }
    return res.status(500).send('server error');
  }
});

// @router      GET api/post/:post_id
// @desc        get post by id
// @access      Private

router.get('/:post_id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user)
      return res.status(400).json({ msg: 'No user found with this id' });

    const post = await Post.findById({ _id: req.params.post_id });
    if (!post) return res.status(400).json({ msg: 'No post found' });

    return res.json(post);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'No post found' });
    }
    return res.status(500).send('server error');
  }
});

// @router      PUT api/post/like/:post_id
// @desc        delete post by id
// @access      Private

router.put('/like/:post_id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(400).json({ msg: 'User is not authorized' });

    const post = await Post.findById({ _id: req.params.post_id });
    if (!post) return res.status(400).json({ msg: 'No post found' });
    if (post.user.toString() !== req.user.id)
      return res.status(400).json({ msg: 'User not authorized' });

    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res
        .status(400)
        .json({ msg: 'This post is already liked by this user' });
    } else {
      post.likes.unshift({ user: req.user.id });
      await post.save();
      return res.json(post.likes);
    }
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'No post found' });
    }
    return res.status(500).send('server error');
  }
});

// @router      PUT api/post/unlike/:post_id
// @desc        delete post by id
// @access      Private

router.put('/unlike/:post_id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user)
      return res.status(400).json({ msg: 'No user found with this id' });

    const post = await Post.findById({ _id: req.params.post_id });
    if (!post) return res.status(400).json({ msg: 'No post found' });
    if (post.user.toString() !== req.user.id)
      return res.status(400).json({ msg: 'User not authorized' });

    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    )
      return res.status(400).json('Post is not liked by user');
    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);
    await post.save();
    return res.json({ msg: 'Post disliked successfully' });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'No post found' });
    }
    return res.status(500).send('server error');
  }
});

// @router      PUT api/post/comment/:post_id
// @desc        Comment on a post
// @access      Private

router.put(
  '/comment/:post_id',
  [auth, [check('text', 'Text field is required').not().isEmpty()]],
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('-password');
      if (!user)
        return res.status(400).json({ msg: 'No user found with this id' });

      const post = await Post.findById({ _id: req.params.post_id });
      if (!post) return res.status(400).json({ msg: 'No post found' });
      if (post.user.toString() !== req.user.id)
        return res.status(400).json({ msg: 'User not authorized' });

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };

      post.comments.unshift(newComment);

      await post.save();
      return res.json(post.comments);
    } catch (error) {
      console.log(error);
      if (error.kind === 'ObjectId') {
        return res.status(400).json({ msg: 'No post found' });
      }
      return res.status(500).send('server error');
    }
  }
);

// @router      DELETE api/post/comment/:post_id/:comment_id
// @desc        Delete comment
// @access      Private

router.delete('/comment/:post_id/:comment_id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user)
      return res.status(400).json({ msg: 'No user found with this id' });

    let post = await Post.findById({ _id: req.params.post_id });
    if (!post) return res.status(404).json({ msg: 'No post found' });
    // await post.save();
    console.log('posts', post);
    let comment = post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );
    console.log('comment', comment);

    if (!comment) {
      return res.status(404).json({ msg: 'No comment found' });
    }
    if (comment.user.toString() !== req.user.id.toString())
      return res.status(401).json({ msg: 'Unauthorized user' });

    let removeIndex = post.comments
      .map((comment) => comment.user.toString())
      .indexOf(req.user.id);
    console.log('removeIndex', removeIndex);
    post.comments.splice(removeIndex, 1);
    await post.save();
    return res.json({ msg: 'comment deleted' });
  } catch (error) {
    console.log(error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'No post found' });
    }
    return res.status(500).send('server error');
  }
});

module.exports = router;
