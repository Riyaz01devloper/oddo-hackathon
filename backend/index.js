const path = require('path');
require('dotenv').config();

const app = require('./src/app.js');

const port = process.env.PORT || 3000;
const connectDB = require('./src/services/db.js');
connectDB();

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});