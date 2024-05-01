const mongoose = require('mongoose');
const plm = require("passport-local-mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/prodigyHire");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
    },
    role: {
        type: String,
        enum: ['employer', 'candidate'],
        // required: true
    },
    postJobs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
    }],
    companyProfile: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CompanyProfile',
    }],
    candidateProfile: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CandidateProfile',
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    appliedJobs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
    }],
    shortlistedJobs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job'
    }],    
    resume: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resume',
    }
});


userSchema.plugin(plm);

module.exports = mongoose.model('User', userSchema);
