const mongoose = require('mongoose');

const connectDb = async () => {
    await mongoose.connect(process.env.MONGODB_URL)
        .then(() => {
            console.log("connected to the databse")
        })
        .catch((err) => {
            console.log('error in connecting to the databse', err);
        })
}

module.exports = connectDb;