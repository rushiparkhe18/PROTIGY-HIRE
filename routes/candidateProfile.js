const mongoose = require('mongoose');

const candidateProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    candidateName: {
        type: String,
    },
    profilePicture: String, // Profile picture URL
    title: String,
    aboutMe: String,
    offeredSalary: String,
    experienceTime: String,
    gender: String,
    age: String,
    qualification: String,
    language: String,
    linkedin: String,
    email: {
        type: String,
    },
    phoneNumber: String,

////////////////////////////////
    etitle1: String,
    ecollegeUniversity1: String,
    edescription1: String,
    eyear1: String,
    etitle2: String,
    ecollegeUniversity2: String,
    edescription2: String,
    eyear2: String,
    wtitle1: String,
    wcompanyName1: String,
    wdescription1: String,
    wyear1: String,
    wtitle2: String,
    wcompanyName2: String,
    wdescription2: String,
    wyear2: String,
    htitle1: String,
    hdate1: String,
    hdescription1: String,
    hyear1: String,
    htitle2: String,
    hdate2: String,
    hdescription2: String,
    hyear2: String,
////////////////////////////////

    projects: [{
        type: String
    }],
    professionalSkills: [String],
    city: String,
    country: String,
    address: String,
});

module.exports = mongoose.model('CandidateProfile', candidateProfileSchema);
