const app = require('./src/app.js');

const port = process.env.PORT || 3000;

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${port}`);
});