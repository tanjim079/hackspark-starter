const mongoose = require('mongoose');

mongoose.connect('mongodb://mongo:27017/rentpi-chat', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

module.exports = mongoose;