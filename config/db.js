const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoDbUrl');

const connectDb = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log('MongoDb connected...');
  } catch (err) {
    console.log('Db connection error', err.message);
    process.exit(1);
  }
};

module.exports = connectDb;
