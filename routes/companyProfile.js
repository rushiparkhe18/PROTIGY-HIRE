const mongoose = require('mongoose');

const companyProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    logo: {
        type: String,
    },
    companyName: {
        type: String,
    },
    primaryIndustry: {
        type: String,
    },
    companySize: {
        type: String,
    },
    foundedIn: {
        type: String,
    },
    phone: {
        type: Number,
    },
    email: {
        type: String,
        lowercase: true
    },
    website: {
        type: String,
    },
    aboutCompany: {
        type: String,
    },
    linkedin: {
        type: String,
    },
    twitter: {
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
    images: [{
        type: String
    }]
});

const CompanyProfile = mongoose.model('CompanyProfile', companyProfileSchema);

module.exports = CompanyProfile;
