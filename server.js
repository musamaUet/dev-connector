const express = require('express');
const connectDb = require('./config/db');
const userRouter = require('./routes/api/users');
const authRouter = require('./routes/api/auth');
const postsRouter = require('./routes/api/posts');
const profileRouter = require('./routes/api/profile');
const auth = require('./middlewares/auth');
const app = express();

connectDb();
app.use(express.json({ extended: true }));

app.use('/api/user', userRouter);
app.use('/api/post', postsRouter);
app.use('/api/profile', profileRouter);
app.use('/api/auth', authRouter);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log('App is running on port ', port);
});
