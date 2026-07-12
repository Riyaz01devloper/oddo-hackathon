const path = require('path');
require('dotenv').config();

const app = require('./src/app.js');

const port = process.env.PORT || 8000;
const connectDB = require('./src/services/db.js');

connectDB().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}).catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});