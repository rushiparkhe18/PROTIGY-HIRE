const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
    },
    file: String, // Store the file path or URL
    // Add any other fields you need, such as upload date, file name, etc.
});
module.exports = mongoose.model('Resume', resumeSchema);
