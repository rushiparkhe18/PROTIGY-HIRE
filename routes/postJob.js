const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    jobTitle: {
        type: String,
    },
    jobDescription: {
        type: String,
    },
    keyResponsibility: {
        type: String,
    },
    skillExperience: {
        type: String,
    },
    datePosted: {
        type: Date,
        default: Date.now,
    },
    expirationDate: {
        type: Date,
    },
    hours: {
        type: String,
    },
    rate: {
        type: String,
    },
    salary: {
        type: String,
    },
    country: {
        type: String,
    },
    city: {
        type: String,
    },
    completeAddress: {
        type: String,
    },
    findOnMap: {
        type: String,
    },
    latitude: {
        type: Number,
    },
    longitude: {
        type: Number,
    },
    tags: [{
        type: String,
    }],
    companyProfile: [{  // Add this field to reference the CompanyProfile model
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CompanyProfile'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    status:{
        type: String
    },
    applicants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    shortlistedCandidate: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],    
    resumes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resume',
    }]
});

module.exports = mongoose.model('Job', jobSchema);


