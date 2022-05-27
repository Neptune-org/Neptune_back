const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: 'dkqbdhbrp',
    api_key: '454655294366238',
    api_secret: '0I3BpiO5mxwyuXMU0ieY6jWvpA8',
    secure: true,
});
module.exports = { cloudinary };    