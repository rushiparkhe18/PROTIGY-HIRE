var express = require('express');
var router = express.Router();
const userModel = require('./users');
const companyProfileModel = require("./companyProfile");
const candidateProfileModel = require("./candidateProfile");
const postJobModel = require("./postJob");
const resumeSchema = require('./resume');
const passport = require('passport');
const upload = require("./multer");
const path = require('path');
const localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));
const { CronJob } = require('cron');

const fs = require('fs');




router.get('/',async function (req, res, next) {

  const jobs = await postJobModel.find().populate('companyProfile');

  // Define the isActive function
  const isActive = function (currentPath, path) {
    return currentPath === path ? 'active' : '';
  };

  // Pass the successMessage and errorMessage to the template
  const successMessage = req.session.successMessage;
  const errorMessage = req.session.errorMessage;

  // Clear the session variables after displaying them
  req.session.successMessage = null;
  req.session.errorMessage = null;

  // Render the index view with the template variables
  res.render('index', {
    jobs: jobs,
    isActive: isActive,
    successMessage: successMessage,
    errorMessage: errorMessage,
    user: req.user // Pass the user variable to the template
  });
});




const ITEMS_PER_PAGE = 7; // Define the number of items per page

router.get('/joblist', async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Get the current page number from the query parameters
  const skip = (page - 1) * ITEMS_PER_PAGE; // Calculate the number of items to skip

  try {
    const totalJobs = await postJobModel.countDocuments();
    const totalPages = Math.ceil(totalJobs / ITEMS_PER_PAGE); // Calculate the total number of pages
    const posts = await postJobModel
      .find()
      .populate({
        path: 'userId',
        populate: { path: 'companyProfile' }
      })
      .skip(skip)
      .limit(ITEMS_PER_PAGE);

    const user = req.user; // Get the authenticated user from Passport.js
    const successMessage = req.session.successMessage; // Get the success message from session
    const errorMessage = req.session.errorMessage; // Get the error message from session

    // Clear the session variables after displaying them
    req.session.successMessage = null;
    req.session.errorMessage = null;

    res.render('joblist', { posts, totalJobs, totalPages, user, successMessage, errorMessage, currentPage: page }); // Pass totalPages to the template
  } catch (error) {
    console.error('Error fetching job posts:', error);
    res.status(500).send('Internal Server Error');
  }
});




router.get('/login', function (req, res, next) {
  res.render('login', { error: req.flash('error') });
});

router.get('/register', function (req, res, next) {
  res.render('register', { message: req.flash('error') });
});

const ITEMS_PER_PAGE2 = 20; // Define the number of items per page

router.get('/employers', async function (req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1; // Get the current page number from the query parameters
    const skip = (page - 1) * ITEMS_PER_PAGE2; // Calculate the number of items to skip

    // Fetch company profiles from the database with pagination
    const companyProfiles = await companyProfileModel
      .find()
      .populate('userId')
      .skip(skip)
      .limit(ITEMS_PER_PAGE2)
      .exec();

    // Calculate total number of company profiles
    const totalCompanies = await companyProfileModel.countDocuments();
    const totalPages = Math.ceil(totalCompanies / ITEMS_PER_PAGE2); // Calculate the total number of pages

    const user = req.user; // Get the authenticated user from Passport.js
    const successMessage = req.session.successMessage; // Get the success message from session
    const errorMessage = req.session.errorMessage; // Get the error message from session

    res.render('employers', { companyProfiles, user, successMessage, errorMessage, totalPages, currentPage: page });
  } catch (error) {
    next(error);
  }
});



router.get('/candidates', async function (req, res, next) {
  try {
    const user = req.user; // Get the authenticated user from Passport.js
    const successMessage = req.session.successMessage; // Get the success message from session
    const errorMessage = req.session.errorMessage; // Get the error message from session

    // Pagination variables
    const page = req.query.page || 1; // Current page number, default is 1
    const limit = 9; // Number of items per page

    // Count total number of candidates
    const totalCandidates = await candidateProfileModel.countDocuments();

    // Calculate total number of pages
    const totalPages = Math.ceil(totalCandidates / limit);

    // Calculate offset to skip candidates for pagination
    const offset = (page - 1) * limit;

    // Fetch candidate profiles for the current page
    const candidates = await candidateProfileModel.find().skip(offset).limit(limit);

    res.render('candidates', { user, successMessage, errorMessage, candidates, currentPage: page, totalPages });
  } catch (error) {
    console.error('Error fetching candidate profiles:', error);
    req.session.errorMessage = 'Error fetching candidate profiles';
    res.redirect('/candidates'); // Redirect to the candidates page with error message
  }
});



router.get('/job-single/:id', async (req, res) => {
  try {
    const jobId = req.params.id;

    // Fetch the job by ID and populate the companyProfile field
    const job = await postJobModel.findById(jobId).populate('companyProfile');

    if (!job) {
      return res.status(404).send('Job not found');
    }

    const user = req.user; // Get the authenticated user from Passport.js
    const successMessage = req.session.successMessage; // Get the success message from session
    const errorMessage = req.session.errorMessage; // Get the error message from session

    // Clear session variables after reading
    delete req.session.successMessage;
    delete req.session.errorMessage;

    res.render('job-single', { job, user, successMessage, errorMessage });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});



router.get('/employers-single/:id', async function (req, res, next) {
  try {
    const companyProfile = await companyProfileModel.findById(req.params.id);
    if (!companyProfile) {
      return res.status(404).send('Company profile not found');
    }

    // Fetch related jobs for the company
    const relatedJobs = await postJobModel.find({ companyId: req.params.id });

    // Calculate jobs count
    const jobsCount = relatedJobs.length;

    // Assuming you have a createdAt field in your Job schema
    const today = new Date();
    const todayAdded = relatedJobs.filter(job => {
      return job.createdAt.toDateString() === today.toDateString();
    }).length;

    // Total jobs count
    const totalJobs = relatedJobs.length;

    const user = req.user; // Get the authenticated user from Passport.js
    const successMessage = req.session.successMessage; // Get the success message from session
    const errorMessage = req.session.errorMessage; // Get the error message from session

    res.render('employers-single', {
      companyProfile: companyProfile,
      jobsCount: jobsCount,
      totalJobs: totalJobs,
      todayAdded: todayAdded,
      relatedJobs: relatedJobs,  // Pass relatedJobs to the template
      user: user,
      successMessage: successMessage,
      errorMessage: errorMessage
    });
  } catch (err) {
    next(err);
  }
});




router.get('/candidates-single/:id', async (req, res) => {
  try {
    const candidateId = req.params.id;

    // Fetch the candidate profile by ID
    const candidateProfile = await candidateProfileModel.findById(candidateId);

    if (!candidateProfile) {
      req.session.errorMessage = 'Candidate profile not found';
      return res.redirect('/candidates'); // Redirect to candidates page or handle error appropriately
    }

    const user = req.user; // Get the authenticated user from Passport.js
    const successMessage = req.session.successMessage; // Get the success message from session
    const errorMessage = req.session.errorMessage; // Get the error message from session
    res.render('candidates-single', { candidateProfile, user, successMessage, errorMessage });
  } catch (error) {
    console.error(error);
    req.session.errorMessage = 'Internal Server Error';
    res.redirect('/candidates'); // Redirect to candidates page or handle error appropriately
  }
});


router.get('/faq', function (req, res, next) {
  res.render('faq',{    user: req.user // Pass the user variable to the template
});

});

router.get('/contact', function (req, res, next) {
  res.render('contact',{    user: req.user // Pass the user variable to the template
});
});

/////////////////////////////////////////

router.post("/register", async function (req, res, next) {
  const userData = await new userModel({
    username: req.body.username,
    email: req.body.email,
    role: req.body.role,
  });
  userModel.register(userData, req.body.password)
    .then(function () {
      passport.authenticate("local")(req, res, function () {
        if (userData.role === "employer") {
          req.session.successMessage = 'Registered successfully as a employer! Set profile now';
          res.redirect("/");
        }
        else if (userData.role === "candidate") {
          req.session.successMessage = 'Registered successfully as a candidate! Set profile now';
          res.redirect("/");
        }
      })
    })
})

router.post("/login", function (req, res, next) {
  passport.authenticate("local", function (err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.session.errorMessage = 'Invalid username or password.';
      return res.redirect('/');
    }
    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      req.session.successMessage = 'Logged in successfully!';
      return res.redirect('/');
    });
  })(req, res, next);
});


router.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) {
      console.error("Error logging out:", err);
      req.session.errorMessage = 'Error logging out!';
    } else {
      req.session.successMessage = 'Logged out successfully!';
    }
    res.redirect('/');
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    res.locals.user = req.user; // Make user available in views
    return next();
  }

  // If user is not authenticated, set an error message
  // req.session.errorMessage = 'Please log in to access this page.';
  next(); // Continue to the next middleware or route
}

/////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////

router.get('/dashboard', isLoggedIn, function (req, res, next) {
  res.render('employer/dashboard', { path: '/dashboard' });
});


router.get('/dashboard-resumes', isLoggedIn, async function (req, res, next) {
  try {
    // Aggregate to fetch shortlisted candidates along with their profiles and shortlisted job details
    const shortlistedCandidates = await userModel.aggregate([
      // Match documents where shortlistedJobs exists and is not empty
      { $match: { shortlistedJobs: { $exists: true, $not: { $size: 0 } } } },
      // Lookup to populate the candidateProfile field
      {
        $lookup: {
          from: 'candidateprofiles', // Assuming the name of your CandidateProfile model's collection is 'candidateprofiles'
          localField: 'candidateProfile',
          foreignField: '_id',
          as: 'candidateProfile'
        }
      },
      // Unwind the candidateProfile array
      { $unwind: '$candidateProfile' },
      // Lookup to populate the shortlistedJobs field with job details
      {
        $lookup: {
          from: 'jobs', // Assuming the name of your Job model's collection is 'jobs'
          localField: 'shortlistedJobs',
          foreignField: '_id',
          as: 'shortlistedJobs'
        }
      }
    ]);

    let successMessage;
    let errorMessage;

    // Define successMessage
    req.session.successMessage = ""; // Modify this according to your application logic
    req.session.errorMessage = ""; // Modify this according to your application logic

    // Render the "dashboard-resumes" page and pass the shortlisted candidates data and successMessage to the template
    res.render('employer/dashboard-resumes', { path: '/dashboard-resumes', shortlistedCandidates, successMessage, errorMessage });
  } catch (err) {
    console.error('Error fetching shortlisted candidates:', err);
    res.status(500).send('Internal Server Error');
  }
});



router.get('/download-resume/:candidateId/:jobId', async (req, res) => {
  try {
    const candidateId = req.params.candidateId;
    const jobId = req.params.jobId;

    // Find the resume associated with the candidate ID and job ID
    const resume = await resumeSchema.findOne({ user: candidateId, job: jobId });


    if (!resume) {
      // If resume is not found, send an appropriate message
      return res.status(404).send('Resume not found');
    }

    // Serve the resume file for download
    const filePath = path.join(__dirname, '..', resume.file); // Assuming 'file' contains the relative path of the resume file


    res.download(filePath, 'resume.pdf'); // Adjust the file name as needed
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/preview-resume/:candidateId/:jobId', async (req, res) => {
  try {
    const candidateId = req.params.candidateId;
    const jobId = req.params.jobId;

    // Find the resume associated with the candidate ID and job ID
    const resume = await resumeSchema.findOne({ user: candidateId, job: jobId });

    if (!resume) {
      // If resume is not found, send an appropriate message
      return res.status(404).send('Resume not found');
    }

    // Get the file path of the resume
    const filePath = path.join(__dirname, '..', resume.file);

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('Resume file not found');
    }

    // Read the resume file
    const data = fs.readFileSync(filePath);

    // Send the resume file as a response with appropriate content type
    res.setHeader('Content-Type', 'application/pdf');
    res.send(data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


router.get('/dashboard-apply', isLoggedIn, async function (req, res, next) {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user });
    const companyProfile = await companyProfileModel.findOne({ userId: user._id });

    // Fetch jobs related to the companyProfile
    const jobs = await postJobModel.find({ 'companyProfile': companyProfile._id })
      .populate('companyProfile'); // Populate the companyProfile field

    res.render('employer/dashboard-apply', {
      path: '/dashboard-applicants',
      companyProfile,
      jobs,
      successMessage: req.session.successMessage,
      errorMessage: req.session.errorMessage,
    });

    // Clear session messages after displaying them
    req.session.successMessage = null;
    req.session.errorMessage = null;

  } catch (error) {
    console.error('Error fetching data:', error);
    req.session.errorMessage = 'Error fetching data';
    res.redirect('/dashboard-apply');
  }
});

// Dashboard route
router.get('/dashboard-check', isLoggedIn, function (req, res, next) {
  // Check if the logged-in user is an employer or a candidate
  if (req.user.role === 'employer') {
    // If the user is an employer, render the employer dashboard
    res.redirect('/dashboard');
  } else if (req.user.role === 'candidate') {
    // If the user is a candidate, redirect to the candidate dashboard
    res.redirect('/candidate-dashboard');
  } else {
    // If the user's role is not defined or invalid, handle accordingly
    // For example, you can render an error page or redirect to a default dashboard
    res.status(403).send('Forbidden');
  }
});


router.get('/dashboard-company-profile', isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  const companyProfile = await companyProfileModel.findOne({ userId: user._id });

  res.render('employer/dashboard-company-profile', { path: '/dashboard-company-profile', companyProfile });
});

router.get('/dashboard-post-job', isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  const companyProfile = await companyProfileModel.findOne({ userId: user._id });

  // Retrieve flash messages
  const successMessage = req.flash('successMessage');
  const errorMessage = req.flash('errorMessage');

  res.render('employer/dashboard-post-job', {
    path: '/dashboard-post-job',
    companyProfile,
    successMessage,
    errorMessage
  });
});

router.get('/dashboard-manage-job', isLoggedIn, async function (req, res, next) {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user });
    if (!user) {
      req.session.errorMessage = 'User not found';
      return res.redirect('/dashboard-manage-job');
    }
    
    const companyProfile = await companyProfileModel.findOne({ userId: user._id });
    if (!companyProfile) {
      req.session.errorMessage = 'Company profile not found';
      return res.redirect('/dashboard-manage-job');
    }

    // Fetch jobs related to the companyProfile
    const jobs = await postJobModel.find({ 'companyProfile': companyProfile._id })
      .populate('companyProfile'); // Populate the companyProfile field

    // Clear session messages after displaying them
    const successMessage = req.session.successMessage;
    const errorMessage = req.session.errorMessage;
    req.session.successMessage = null;
    req.session.errorMessage = null;

    res.render('employer/dashboard-manage-job', {
      path: '/dashboard-manage-job',
      companyProfile,
      jobs,
      successMessage,
      errorMessage,
    });

  } catch (error) {
    console.error('Error fetching data:', error);
    req.session.errorMessage = 'Error fetching data';
    res.redirect('/dashboard-manage-job');
  }
});

// Display change password page
router.get('/dashboard-change-password', isLoggedIn, function (req, res) {
  res.render('employer/dashboard-change-password', {
    path: '/dashboard-change-password',
    successMessage: req.session.successMessage,
    errorMessage: req.session.errorMessage
  });
});
router.get('/candidate-dashboard-change-password', isLoggedIn, function (req, res) {
  res.render('candidate/candidate-dashboard-change-password', {
    path: '/candidate-dashboard-change-password',
    successMessage: req.session.successMessage,
    errorMessage: req.session.errorMessage
  });
});

router.post("/change-password", isLoggedIn, async function (req, res) {
  try {
    const user = req.user;

    // Check if new password matches confirm password
    if (req.body.newPassword !== req.body.confirmPassword) {
      req.session.errorMessage = 'New password and confirm password do not match';
      return res.redirect('/dashboard-change-password');
    }

    // Check if the old password matches
    const isMatch = await user.authenticate(req.body.oldPassword);
    if (!isMatch) {
      req.session.errorMessage = 'Old password is incorrect';
      return res.redirect('/dashboard-change-password');
    }

    // Change the password
    await user.changePassword(req.body.oldPassword, req.body.newPassword);

    req.session.successMessage = 'Password changed successfully';
    res.redirect('/dashboard-change-password');

  } catch (error) {
    console.error('Error changing password:', error);

    // Handle specific error cases
    if (error.name === 'IncorrectPasswordError') {
      req.session.errorMessage = 'Old password is incorrect';
    } else if (error.name === 'MismatchPasswordError') {
      req.session.errorMessage = 'New password and confirm password do not match';
    } else {
      req.session.errorMessage = 'Error changing password';
    }

    res.redirect('/dashboard-change-password');
  }
});


// Define the route for displaying job applicants
router.get('/dashboard-applicants/:jobId', isLoggedIn, async (req, res) => {
  try {
    const jobId = req.params.jobId;
    // Fetch the job title based on the jobId from the database
    const job = await postJobModel.findById(jobId);
    if (!job) {
      req.session.errorMessage = 'Job not found';
      req.session.save(() => {
        res.redirect('/error-page'); // Redirect to an error page if job not found
      });
      return;
    }
    // Fetch all applicants for the specified job
    const applicants = await userModel.find({ role: 'candidate', appliedJobs: jobId }).populate('candidateProfile');

    // Check if errorMessage is defined in the session
    const errorMessage = req.session.errorMessage;

    // Check if successMessage is defined in the session
    const successMessage = req.session.successMessage;

    res.render('employer/dashboard-applicants', { job, applicants, errorMessage, successMessage });

    // Clear the success and error messages after rendering the page
    req.session.successMessage = '';
    req.session.errorMessage = '';
    req.session.save();
  } catch (err) {
    console.error('Error fetching applicants:', err);
    res.status(500).send('Internal Server Error');
  }
});


router.post('/shortlist-candidate/:jobId/:candidateId', isLoggedIn, async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const candidateId = req.params.candidateId;

    // Fetch the job
    const job = await postJobModel.findById(jobId);

    if (!job) {
      req.session.errorMessage = 'Job not found';
      return res.redirect(`/dashboard-applicants/${jobId}`);
    }

    // Check if candidate is already shortlisted
    if (job.shortlistedCandidate && job.shortlistedCandidate.includes(candidateId)) {
      req.session.errorMessage = 'Candidate already shortlisted';
      return res.redirect(`/dashboard-applicants/${jobId}`);
    }

    // Add candidate to shortlistedCandidate array
    job.shortlistedCandidate.push(candidateId);
    await job.save();

    // Find the candidate user based on the candidateId
    const candidateUser = await userModel.findById(candidateId);

    if (!candidateUser) {
      req.session.errorMessage = 'Candidate not found';
      return res.redirect(`/dashboard-applicants/${jobId}`);
    }

    // Update the shortlistedJobs array in the candidate user's schema
    candidateUser.shortlistedJobs.push(jobId);
    await candidateUser.save();

    // Check if the current user is an employer
    if (req.user.role === 'employer') {
      // Update the employer user's shortlistedJobsMe array
      const currentUser = req.user;
      currentUser.shortlistedJobsMe.push(jobId);
      await currentUser.save();
    }

    req.session.successMessage = 'Candidate shortlisted successfully';
    return res.redirect(`/dashboard-applicants/${jobId}`);
  } catch (err) {
    console.error('Error shortlisting candidate:', err);
    req.session.errorMessage = 'Internal Server Error';
    return res.redirect(`/dashboard-applicants/${jobId}`);
  }
});













///////////////////////////////////////////////////////////////////////////////////

router.post("/company-profile-submit", upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'images1', maxCount: 1 },
  { name: 'images2', maxCount: 1 },
  { name: 'images3', maxCount: 1 },
  { name: 'images4', maxCount: 1 }
]), isLoggedIn, async function (req, res, next) {

  const user = await userModel.findOne({ username: req.session.passport.user });

  const filter = { userId: user._id };

  const existingProfile = await companyProfileModel.findOne(filter);

  // Function to get existing images or default to empty array
  const getExistingImages = () => {
    return existingProfile ? existingProfile.images : [];
  };

  const images = [
    req.files['logo'] ? req.files['logo'][0].filename : existingProfile.logo,
    req.files['images1'] ? req.files['images1'][0].filename : getExistingImages()[0],
    req.files['images2'] ? req.files['images2'][0].filename : getExistingImages()[1],
    req.files['images3'] ? req.files['images3'][0].filename : getExistingImages()[2],
    req.files['images4'] ? req.files['images4'][0].filename : getExistingImages()[3]
  ];

  const update = {
    userId: user._id,
    logo: images[0],
    companyName: req.body.companyName,
    primaryIndustry: req.body.primaryIndustry,
    companySize: req.body.companySize,
    foundedIn: req.body.foundedIn,
    phone: req.body.phone,
    email: req.body.email,
    website: req.body.website,
    aboutCompany: req.body.aboutCompany,
    linkedin: req.body.linkedin,
    twitter: req.body.twitter,
    country: req.body.country,
    city: req.body.city,
    completeAddress: req.body.completeAddress,
    findOnMap: req.body.findOnMap,
    latitude: req.body.latitude,
    longitude: req.body.longitude,
    images: images.slice(1)  // Exclude the logo from the images array
  };

  // Remove undefined fields
  Object.keys(update).forEach(key => update[key] === undefined && delete update[key]);

  const options = { upsert: true, new: true, setDefaultsOnInsert: true };

  const updatedProfile = await companyProfileModel.findOneAndUpdate(filter, update, options);

  // Save profile to user document
  user.companyProfile.push(updatedProfile._id);
  await user.save();

  res.redirect("/dashboard-company-profile");
});




router.post("/post-job-submit", isLoggedIn, async function (req, res, next) {

  // Get the logged-in user
  const user = await userModel.findOne({ username: req.session.passport.user });

  // Get the company profile for the logged-in user
  const companyProfile = await companyProfileModel.findOne({ userId: user._id });

  if (!companyProfile) {
    req.flash('errorMessage', 'Company profile not found.');
    return res.redirect('/dashboard-post-job');
  }


  let tags = [];
  if (req.body['tags[]']) {
    tags = Array.isArray(req.body['tags[]']) ? req.body['tags[]'] : req.body['tags[]'].split(",").map(tag => tag.trim());
  }


  // Add newlines to job description, key responsibility, and skill experience
  const jobDescription = req.body.jobDescription.replace(/\r?\n/g, "\n");
  const keyResponsibility = req.body.keyResponsibility.replace(/\r\n/g, '\n');
  const skillExperience = req.body.skillExperience.replace(/\r\n/g, '\n');




  try {
    const post = await postJobModel.create({
      userId: user._id,
      jobTitle: req.body.jobTitle,
      jobDescription: jobDescription,
      keyResponsibility: keyResponsibility,
      skillExperience: skillExperience,
      expirationDate: req.body.expirationDate,
      hours: req.body.hours,
      rate: req.body.rate,
      salary: req.body.salary,
      country: req.body.country,
      city: req.body.city,
      completeAddress: req.body.completeAddress,
      findOnMap: req.body.findOnMap,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      tags: tags, // Splitting and trimming tags
      companyProfile: companyProfile._id, // Save company profile reference
      status: req.body.status
    });

    // Save job to database
    user.postJobs.push(post._id)
    await user.save();

    // Set success message
    req.flash('successMessage', 'Job posted successfully!');
    res.redirect('/dashboard-post-job');
  } catch (error) {
    req.flash('errorMessage', 'Failed to post job.');
    res.redirect('/dashboard-post-job');
  }
});

// Your route handler
router.get('/dashboard-edit-job/:id', async (req, res) => {
  try {
    const jobId = req.params.id;

    // Retrieve the job data by ID
    const job = await postJobModel.findById(jobId).populate('companyProfile');

    if (!job) {
      req.session.errorMessage = 'Job not found';
      return res.redirect('/dashboard-manage-job');
    }

    // Render the view and pass the job data
    res.render('employer/dashboard-edit-job', {
      path: '/dashboard-edit-job',
      successMessage: req.session.successMessage,
      errorMessage: req.session.errorMessage,
      job: job
    });

  } catch (error) {
    console.error('Error fetching job:', error);
    req.session.errorMessage = 'Error fetching job';
    res.redirect('/dashboard-manage-job');
  }
});

// Update job
router.post('/dashboard-edit-job/:id/update', async (req, res) => {
  try {
    const jobId = req.params.id;

    // Find the job by ID
    const job = await postJobModel.findById(jobId);

    if (!job) {
      req.session.errorMessage = 'Job not found';
      return res.redirect('/dashboard-manage-job');
    }

    let tags = [];
    if (req.body['tags[]']) {
      tags = Array.isArray(req.body['tags[]']) ? req.body['tags[]'] : req.body['tags[]'].split(",").map(tag => tag.trim());
    }

    // Update job fields with form data
    job.jobTitle = req.body.jobTitle;
    job.jobDescription = req.body.jobDescription;
    job.keyResponsibility = req.body.keyResponsibility;
    job.skillExperience = req.body.skillExperience;
    job.expirationDate = req.body.expirationDate;
    job.salary = req.body.salary;
    job.hours = req.body.hours;
    job.rate = req.body.rate;
    job.country = req.body.country;
    job.city = req.body.city;
    job.completeAddress = req.body.completeAddress;
    job.findOnMap = req.body.findOnMap;
    job.latitude = req.body.latitude;
    job.longitude = req.body.longitude;
    job.tags = tags; // Make sure this line correctly updates the tags array
    job.status = req.body.status; // Make sure this line correctly updates the tags array

    // Save the updated job document
    await job.save();

    req.session.successMessage = 'Job updated successfully';
    res.redirect('/dashboard-manage-job');

  } catch (error) {
    console.error('Error updating job:', error);
    req.session.errorMessage = 'Error updating job';
    res.redirect('/dashboard-edit-job/' + jobId); // Redirect back to edit job page with error message
  }
});


// Define a cron job to run every day at midnight
const job = new CronJob('0 0 * * *', async () => {
  try {
    // Find all jobs where expirationDate is less than or equal to the current date
    const expiredJobs = await postJobModel.find({ expirationDate: { $lte: new Date() } });

    // Update the status of expired jobs to "Inactive"
    await Job.updateMany(
      { _id: { $in: expiredJobs.map(job => job._id) } },
      { $set: { status: "Inactive" } }
    );

  } catch (error) {
    console.error('Error updating job status:', error);
  }
});

// Start the cron job
job.start();

// Delete job
router.get('/dashboard-delete-job/:id', async (req, res) => {
  try {
    const jobId = req.params.id;

    // Find the job by ID and delete it
    await postJobModel.findByIdAndDelete(jobId);

    req.session.successMessage = 'Job deleted successfully';
    res.redirect('/dashboard-manage-job'); // Redirect to manage job page

  } catch (error) {
    console.error('Error deleting job:', error);
    req.session.errorMessage = 'Error deleting job';
    res.redirect('/dashboard-manage-job'); // Redirect to manage job page with error message
  }
});


// Delete profile
router.get('/delete-profile', isLoggedIn, async function (req, res, next) {
  try {

    // Delete user and related profile
    await userModel.findByIdAndDelete(req.user._id);
    await companyProfileModel.findOneAndDelete({ userId: req.user._id });

    // Logout the user
    req.logout();


    // Set success message
    req.session.successMessage = 'Profile deleted successfully';

    // Redirect to home page
    res.redirect('/');
  } catch (error) {
    console.error("Error deleting profile:", error.message); // Logging error message
    // Set error message
    req.session.errorMessage = 'Error deleting profile';

    // Redirect to home page
    res.redirect('/');
  }
});




////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
router.get('/candidate-dashboard', isLoggedIn, function (req, res, next) {
  res.render('candidate/candidate-dashboard', { path: '/candidate-dashboard' });
});



router.get('/candidate-dashboard-profile', isLoggedIn, async function (req, res, next) {
  try {
    // Retrieve candidate profile data from the database
    const candidateProfile = await candidateProfileModel.findOne({ userId: req.user._id });

    // Pass successMessage and errorMessage to the template
    const successMessage = req.session.successMessage;
    const errorMessage = req.session.errorMessage;

    // Clear successMessage and errorMessage from the session
    delete req.session.successMessage;
    delete req.session.errorMessage;

    res.render('candidate/candidate-dashboard-profile', {
      path: '/candidate-dashboard-profile',
      successMessage: successMessage, // Pass successMessage to the template
      errorMessage: errorMessage, // Pass errorMessage to the template
      existingProfile: candidateProfile // Pass candidate profile data to the template
    });
  } catch (error) {
    // Handle error
    console.error(error);
    req.session.errorMessage = 'Failed to fetch candidate profile data.';
    res.redirect('/candidate-dashboard-profile');
  }
});


router.get('/candidate-dashboard-resume', isLoggedIn, async function (req, res, next) {
  try {
      // Find the current logged-in user
      const currentUser = await userModel.findOne({ username: req.user.username }).populate({
          path: 'shortlistedJobs',
          populate: {
              path: 'candidateProfile',
              model: 'CandidateProfile',
              options: { strictPopulate: false } // Set strictPopulate to false

          }
      });

      if (!currentUser) {
          req.session.errorMessage = 'User not found';
          return res.redirect('/candidate-dashboard-resume');
      }

      // Extract existingProfile from the current user if available
      const existingProfile = currentUser.candidateProfile || {};

      // Pass successMessage and errorMessage to the template
      const successMessage = req.session.successMessage;
      const errorMessage = req.session.errorMessage;

      // Clear successMessage and errorMessage from the session
      delete req.session.successMessage;
      delete req.session.errorMessage;

      // Render the template with the existingProfile and messages
      res.render('candidate/candidate-dashboard-resume', {
          path: '/candidate-dashboard-resume',
          existingProfile: existingProfile, // Pass existingProfile to the template
          successMessage: successMessage,    // Pass successMessage to the template
          errorMessage: errorMessage         // Pass errorMessage to the template
      });
  } catch (error) {
      // Handle error if fetching data fails
      console.error(error);
      req.session.errorMessage = 'Failed to fetch shortlisted candidates.';
      res.redirect('/candidate-dashboard-resume');
  }
});


router.get('/candidate-dashboard-applied-job', async (req, res) => {
  try {
    // Fetch the user's applied jobs from the database
    const userId = req.user._id; // Assuming you're using Passport and the user is authenticated
    const user = await userModel.findById(userId).populate('appliedJobs');

    // Extract job ids from the user's applied jobs
    const jobIds = user.appliedJobs.map(job => job._id);

    // Fetch jobs with populated company profiles
    const jobs = await postJobModel.find({ _id: { $in: jobIds } }).populate('companyProfile');

    // Get success and error messages from session and clear them
    const successMessage = req.session.successMessage;
    const errorMessage = req.session.errorMessage;
    delete req.session.successMessage;
    delete req.session.errorMessage;


    // Render the EJS template with the fetched data, success message, and error message
    res.render('candidate/candidate-dashboard-applied-job', { jobs, candidateId: userId, successMessage, errorMessage });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/delete-application/:jobId', async (req, res) => {
  try {
    const userId = req.user._id;
    const jobId = req.params.jobId;

    // Remove the job ID from the user's appliedJobs array
    await userModel.findByIdAndUpdate(userId, { $pull: { appliedJobs: jobId } });

    // Remove the user ID from the job's applicants array
    await postJobModel.findByIdAndUpdate(jobId, { $pull: { applicants: userId } });

    // Find the resume associated with the user ID and job ID
    const resume = await resumeSchema.findOne({ user: userId, job: jobId });

    if (resume) {
      // Delete the resume from the database
      await resumeSchema.findByIdAndDelete(resume._id);
    }

    // Set success message
    req.session.successMessage = 'Application deleted successfully';

    // Redirect back to the same page
    res.redirect('/candidate-dashboard-applied-job');
  } catch (error) {
    console.error(error);
    // Set error message
    req.session.errorMessage = 'Failed to delete application';
    res.redirect('/candidate-dashboard-applied-job');
  }
});



router.get('/candidate-dashboard-shortlisted-resume', isLoggedIn, async (req, res) => {
  try {
    // Fetch the user's shortlisted jobs from the database
    const userId = req.user._id; // Assuming you're using Passport and the user is authenticated
    const user = await userModel.findById(userId).populate('shortlistedJobs');

    // Extract job ids from the user's shortlisted jobs
    const jobIds = user.shortlistedJobs.map(job => job._id);

    // Fetch jobs with populated company profiles
    const jobs = await postJobModel.find({ _id: { $in: jobIds } }).populate('companyProfile');

    // Render the EJS template with the fetched data
    res.render('candidate/candidate-dashboard-shortlisted-resume', { jobs, candidateId: userId, path: '/candidate-dashboard-shortlisted-resume' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


///////////////////////////////////////////////////////////////////////////////////

// POST route for candidate profile submission
router.post("/candidate-dashboard-profile-submit", isLoggedIn, upload.fields([
  { name: 'profilePicture', maxCount: 1 } // Specify file upload field
]), async (req, res) => {
  try {
    // Extract data from the request body
    const {
      candidateName,
      title,
      phoneNumber,
      email,
      gender,
      offeredSalary,
      experienceTime,
      age,
      qualification,
      language,
      linkedin,
      city,
      country,
      address
    } = req.body;

    // Access uploaded file(s)
    const profilePicture = req.files['profilePicture'] ? req.files['profilePicture'][0].filename : null;

    // Extract professionalSkills as an array or set it as an empty array if not provided
    const professionalSkills = Array.isArray(req.body.professionalSkills) ? req.body.professionalSkills : [req.body.professionalSkills].filter(Boolean);

    // Find the user by ID
    const user = await userModel.findById(req.user._id);



    // Define the filter to find the candidate profile
    const filter = { userId: user._id };

    // Construct the profile data object
    const profileData = {
      userId: user._id,
      candidateName,
      title,
      phoneNumber,
      email,
      gender,
      offeredSalary,
      experienceTime,
      age,
      qualification,
      language,
      professionalSkills,
      linkedin,
      city,
      country,
      address,
      profilePicture // Include profile picture
    };

    // Find the existing candidate profile
    let existingProfile = await candidateProfileModel.findOne(filter);

    // If profile exists, update; otherwise, create a new one
    if (existingProfile) {
      existingProfile = await candidateProfileModel.findOneAndUpdate(filter, profileData, { new: true });
    } else {
      existingProfile = await candidateProfileModel.create(profileData);
    }

    user.candidateProfile.push(existingProfile._id);
    await user.save();

    // Set success message
    req.session.successMessage = existingProfile ? 'Profile updated successfully.' : 'Profile created successfully.';

    // Redirect to the candidate dashboard profile
    res.redirect("/candidate-dashboard-profile");
  } catch (error) {
    console.error("Error saving candidate profile:", error);
    req.session.errorMessage = 'Error saving candidate profile. Please try again later.';
    res.status(500).send("Internal Server Error");
  }
});


router.post("/candidate-dashboard-resume-submit", upload.fields([
  { name: 'project1', maxCount: 1 },
  { name: 'project2', maxCount: 1 },
  { name: 'project3', maxCount: 1 },
  { name: 'project4', maxCount: 1 }
]), isLoggedIn, async function (req, res, next) {
  try {
    // Find the user based on the session data
    const user = await userModel.findOne({ username: req.session.passport.user });

    // Filter to find the candidate profile based on the user ID
    const filter = { userId: user._id };

    // Retrieve existing candidate profile
    const existingProfile = await candidateProfileModel.findOne(filter);

    // Array to store project filenames
    const projects = [];

    // Loop through uploaded files and handle each individually
    for (let i = 1; i <= 4; i++) {
      const projectFile = req.files[`project${i}`] ? req.files[`project${i}`][0] : null;
      if (projectFile) {
        // If a new file is uploaded, push its filename to the projects array
        projects.push(projectFile.filename);
      } else {
        // If no new file uploaded, retain the existing image URL
        projects.push(existingProfile && existingProfile.projects[i - 1] ? existingProfile.projects[i - 1] : null);
      }
    }

    // Define the update object with all fields to be updated
    const update = {
      userId: user._id,
      // Add other fields here
      aboutMe: req.body.aboutMe,
      etitle1: req.body.etitle1,
      ecollegeUniversity1: req.body.ecollegeUniversity1,
      edescription1: req.body.edescription1,
      eyear1: req.body.eyear1,
      etitle2: req.body.etitle2,
      ecollegeUniversity2: req.body.ecollegeUniversity2,
      edescription2: req.body.edescription2,
      eyear2: req.body.eyear2,
      wtitle1: req.body.wtitle1,
      wcompanyName1: req.body.wcompanyName1,
      wdescription1: req.body.wdescription1,
      wyear1: req.body.wyear1,
      wtitle2: req.body.wtitle2,
      wcompanyName2: req.body.wcompanyName2,
      wdescription2: req.body.wdescription2,
      wyear2: req.body.wyear2,
      htitle1: req.body.htitle1,
      hyear1: req.body.hyear1,
      hdescription1: req.body.hdescription1,
      htitle2: req.body.htitle2,
      hyear2: req.body.hyear2,
      hdescription2: req.body.hdescription2,
      professionalSkills: req.body.professionalSkills,
      projects: projects
    };

    // Options for findOneAndUpdate
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };

    // Update the candidate profile
    const updatedProfile = await candidateProfileModel.findOneAndUpdate(filter, update, options);

    // Set success message in session
    req.session.successMessage = 'Profile updated successfully';

    // Redirect back to candidate dashboard resume page
    res.redirect("/candidate-dashboard-resume");
  } catch (error) {
    // Handle any errors
    console.error(error);
    req.session.errorMessage = 'Failed to update candidate profile.';
    res.redirect("/candidate-dashboard-resume");
  }
});


///////////////////////////////////////////////////////////////////////////////////////
// APPLY

// Route for applying to a job
router.post('/apply/:jobId', isLoggedIn, upload.single('resume'), async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const userId = req.user._id;

    // Check if the job exists
    const job = await postJobModel.findById(jobId);
    if (!job) {
      req.session.errorMessage = 'Job not found';
      return res.redirect(`/job-single/${jobId}`);
    }

    // Check if the user has already applied to this job
    if (job.applicants.includes(userId)) {
      req.session.errorMessage = 'You have already applied to this job';
      return res.redirect(`/job-single/${jobId}`);
    }

    // Create a new Resume document
    const resume = new resumeSchema({
      user: userId,
      job: jobId,
      file: req.file.path, // Path to the uploaded resume file
      // Add other resume information if needed
    });

    await resume.save();

    // Update the job document to add the current user as an applicant
    job.applicants.push(userId);
    await job.save();

    // Update the user document to add the job to their list of applied jobs
    const user = await userModel.findById(userId);
    user.appliedJobs.push(jobId);
    await user.save();

    // Set success message in session
    req.session.successMessage = 'Application successful';

    // Redirect the user back to the job-single page
    return res.redirect(`/job-single/${jobId}`);
  } catch (error) {
    console.error(error);
    // Set error message in session
    req.session.errorMessage = 'Internal server error';
    // Redirect the user back to the job-single page
    return res.redirect(`/job-single/${jobId}`);
  }
});


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



const bodyP = require("body-parser");
const compiler = require("compilex");
const options = { stats: true };


compiler.init(options);

router.use(bodyP.json());

router.use(
  "/codemirror-5.65.16",
  express.static("C:/Users/hp/Desktop/js/codemirror")
);


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const mongoose = require('mongoose');



const MONGODB_URI = 'mongodb://localhost:27017/quizDB';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(error => console.error('MongoDB connection error:', error));


const quizSessionSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
  },
  quizLink: String,
  emails: [String], // Array of email addresses
});

const QuizSession = mongoose.model('QuizSession', quizSessionSchema);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

router.get('/quiz-session-form', isLoggedIn, async (req, res) => {
  try {
      // Fetch quiz sessions associated with the current user
      const quizSessions = await QuizSession.find({ user: req.user._id });

      // Session messages for success and error
      const successMessage = req.session.successMessage;
      const errorMessage = req.session.errorMessage;

      // Clear session variables to prevent them from appearing after a reload
      req.session.successMessage = null;
      req.session.errorMessage = null;

      // Render the form page and pass quiz sessions and session variables
      res.render('quizSessionForm', { path: "/quiz-session-form", quizSessions, successMessage, errorMessage });
  } catch (err) {
      console.error('Error fetching quiz sessions:', err);
      // Handle the error appropriately, maybe render an error page or redirect to another route
      res.status(500).send('Internal Server Error');
  }
});



router.get('/appti', isLoggedIn, async (req, res, next) => {
  try {
    // Retrieve the current user's email from the candidateProfileModel
    const candidateProfile = await candidateProfileModel.findOne({ userId: req.user.id });

    // Check if the candidate profile exists and has an email
    if (candidateProfile && candidateProfile.email) {
      // Fetch quiz sessions associated with the current user's email
      const quizSessions = await QuizSession.find({ emails: candidateProfile.email });

      // Render the 'appti' view and pass the filtered quiz sessions data
      res.render('appti', { path: "/appti", quizSessions });
    } else {
      // If the candidate profile does not exist or does not have an email, handle the error
      throw new Error("Candidate profile not found or does not have an email.");
    }
  } catch (error) {
    next(error); // Pass any errors to the error handler middleware
  }
});


// Define the route handler
router.get('/apptitude/:quizLink', isLoggedIn, async (req, res) => {
  try {
    console.log("Quiz Link:", req.params.quizLink); // Check if quizLink parameter is correct

    // Retrieve the current user's candidate profile
    const candidateProfile = await candidateProfileModel.findOne({ userId: req.user.id });
    console.log("Candidate Profile:", candidateProfile); // Check if candidateProfile is retrieved

    // Check if the candidate profile exists and has an email
    if (candidateProfile && candidateProfile.email) {
      // Perform a findOne query to check if a document with the candidate's email exists in quiz sessions
      const quizData = await QuizSession.findOne({ emails: candidateProfile.email, quizLink: req.params.quizLink });
      console.log("Quiz Data:", quizData); // Check if quizData is retrieved

      if (quizData) {
        // If quizData exists, render the quiz page
        res.render('apptitude', { quizData });
      } else {
        // If quizData does not exist, set a message in the session and redirect to the home page
        res.redirect('no-apptitude');
      }
    } else {
      // If the candidate profile does not exist or does not have an email, redirect to the home page
      res.redirect('/');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});




router.post('/quiz-session',isLoggedIn, async (req, res) => {
  try {
      // Find the user document based on the username stored in the session
      const user = await userModel.findOne({ username: req.session.passport.user });

      if (!user) {
          return res.status(404).send('User not found');
      }

      const { quizLink, emails } = req.body;

      console.log('Received data:', { quizLink, emails, userId: user._id });

      // Create a new QuizSession instance
      const quizSession = new QuizSession({
          user: user._id, // Associate with the user's ID
          quizLink,
          emails: emails.split(',').map(email => email.trim())
      });

      // Save the QuizSession
      await quizSession.save();

      // Update the User to include the QuizSession
      user.quizSessions.push(quizSession._id);
      await user.save();

       // Set success message in session variable
       req.session.successMessage = 'Apptitute test saved successfully';

       // Redirect back to the quiz session form page
       res.redirect('/quiz-session-form');
   } catch (error) {
       console.error('Error saving apptitute test:', error);
       
       // Set error message in session variable
       req.session.errorMessage = 'Error saving apptitute test to database';
       
       // Redirect back to the quiz session form page
       res.redirect('/quiz-session-form');
   }
});

router.post('/delete-quiz-session/:id', isLoggedIn, async (req, res) => {
  try {
      // Extract the quiz session ID from the request parameters
      const { id } = req.params;

      // Find and delete the quiz session by ID and user
      const result = await QuizSession.findOneAndDelete({ _id: id, user: req.user._id });

      // If quiz session is found and deleted
      if (result) {
          req.session.successMessage = 'Quiz session deleted successfully';
      } else {
          req.session.errorMessage = 'Quiz session not found or you do not have permission to delete it';
      }

      // Redirect back to the quiz session form page
      res.redirect('/quiz-session-form');
  } catch (err) {
      console.error('Error deleting quiz session:', err);
      // Handle the error appropriately, maybe render an error page or redirect to another route
      req.session.errorMessage = 'An error occurred while deleting the quiz session';
      res.redirect('/quiz-session-form');
  }
});


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


router.get("/room", function (req, res, next) {
  res.render("room", {path: "/dashboard-video-call"});
});
router.get("/room2", function (req, res, next) {
  res.render("room2", {path: "/dashboard-video-call"});
});

router.get("/join-room", function (req, res) {
  const roomID = req.params.roomId;

  res.render("join-room", { roomID: roomID, path: "/dashboard-video-call" });
});
router.get("/join-room2", function (req, res) {
  const roomID = req.params.roomId;

  res.render("join-room2", { roomID: roomID, path: "/dashboard-video-call" });
});
router.get("/chat", function (req, res, next) {
  res.render("chat");
});
router.get("/ide", function (req, res, next) {
  res.render("ide",{path: "/dashboard-coding-env"});
});


router.post("/compilecode", function (req, res) {
  var code = req.body.code;
  var input = req.body.input;
  var inputRadio = req.body.inputRadio;
  var lang = req.body.lang;
  if (lang === "C" || lang === "C++") {
    if (inputRadio === "true") {
      var envData = { OS: "windows", cmd: "g++", options: { timeout: 10000 } };
      compiler.compileCPPWithInput(envData, code, input, function (data) {
        if (data.error) {
          res.send(data.error);
        } else {
          res.send(data.output);
        }
      });
    } else {
      var envData = { OS: "windows", cmd: "g++", options: { timeout: 10000 } };
      compiler.compileCPP(envData, code, function (data) {
        res.send(data);
        //data.error = error message
        //data.output = output value
      });
    }
  }
  if (lang === "Python") {
    if (inputRadio === "true") {
      var envData = { OS: "windows" };
      compiler.compilePythonWithInput(envData, code, input, function (data) {
        res.send(data);
      });
    } else {
      var envData = { OS: "windows" };
      compiler.compilePython(envData, code, function (data) {
        res.send(data);
      });
    }
  }
  if (lang === "Java") {
    if (inputRadio === "true") {
      var envData = { OS: "windows" };
      compiler.compileJavaWithInput( envData , code , input ,  function(data){
        res.send(data);
    });
    } else {
      var envData = { OS: "windows" };
      compiler.compileJava( envData , code , function(data){
        res.send(data);
    }); 
    }
  }
    
   if (lang === "JavaScript") {
      var envData = { OS: "windows" };
      if (inputRadio === "true") {
        compiler.compileJavaScriptWithInput(envData, code, input, function (data) {
          res.send(data);
        });
      } else {
        compiler.compileJavaScript(envData, code, function (data) {
          res.send(data);
        });
      }
  }
  router.get("/fullStat", function (req, res) {
    compiler.fullStat(function (data) {
    res.send(data);
    });
    });

  compiler.flush(function () {
    console.log("All temporary files flushed !");
  });
});






module.exports = router;
