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



router.get('/', function (req, res, next) {
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
    isActive: isActive,
    successMessage: successMessage,
    errorMessage: errorMessage,
    user: req.user // Pass the user variable to the template
  });
});




router.get('/joblist', async (req, res) => {
  const posts = await postJobModel.find().populate({
    path: 'userId',
    populate: { path: 'companyProfile' }
  });

  const totalJobs = await postJobModel.countDocuments();
  const user = req.user; // Get the authenticated user from Passport.js
  const successMessage = req.session.successMessage; // Get the success message from session
  const errorMessage = req.session.errorMessage; // Get the error message from session

  // Clear the session variables after displaying them
  req.session.successMessage = null;
  req.session.errorMessage = null;

  res.render('joblist', { posts, totalJobs, user, successMessage, errorMessage }); // Pass successMessage and errorMessage to the template
});





router.get('/login', function (req, res, next) {
  res.render('login', { error: req.flash('error') });
});

router.get('/register', function (req, res, next) {
  res.render('register', { message: req.flash('error') });
});

router.get('/employers', async function (req, res, next) {
  try {
    // Fetch company profiles from the database
    const companyProfiles = await companyProfileModel.find().populate('userId').exec();

    const user = req.user; // Get the authenticated user from Passport.js
    const successMessage = req.session.successMessage; // Get the success message from session
    const errorMessage = req.session.errorMessage; // Get the error message from session

    res.render('employers', { companyProfiles, user, successMessage, errorMessage });
  } catch (error) {
    next(error);
  }
});



router.get('/candidates', async function (req, res, next) {
  try {
    const user = req.user; // Get the authenticated user from Passport.js
    const successMessage = req.session.successMessage; // Get the success message from session
    const errorMessage = req.session.errorMessage; // Get the error message from session

    // Fetch candidate profiles from the database
    const candidates = await candidateProfileModel.find();

    res.render('candidates', { user, successMessage, errorMessage, candidates });
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
  res.render('faq');
});

router.get('/contact', function (req, res, next) {
  res.render('contact');
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
    const companyProfile = await companyProfileModel.findOne({ userId: user._id });

    // Fetch jobs related to the companyProfile
    const jobs = await postJobModel.find({ 'companyProfile': companyProfile._id })
      .populate('companyProfile'); // Populate the companyProfile field

    res.render('employer/dashboard-manage-job', {
      path: '/dashboard-manage-job',
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
    // Fetch candidate profile data from the database
    const candidateProfile = await candidateProfileModel.findOne({ userId: req.user._id });

    // Pass successMessage and errorMessage to the template
    const successMessage = req.session.successMessage;
    const errorMessage = req.session.errorMessage;

    // Clear successMessage and errorMessage from the session
    delete req.session.successMessage;
    delete req.session.errorMessage;

    // Render the template with the candidate profile data and messages
    res.render('candidate/candidate-dashboard-resume', {
      path: '/candidate-dashboard-resume',
      existingProfile: candidateProfile,  // Pass candidate profile data to the template
      successMessage: successMessage,    // Pass successMessage to the template
      errorMessage: errorMessage         // Pass errorMessage to the template
    });
  } catch (error) {
    // Handle error if fetching data fails
    console.error(error);
    req.session.errorMessage = 'Failed to fetch candidate profile data.';
    res.redirect('/candidate-dashboard-resume');
  }
});

router.get('/candidate-dashboard-applied-job', isLoggedIn, function (req, res, next) {
  res.render('candidate/candidate-dashboard-applied-job', { path: '/candidate-dashboard-applied-job' });
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






module.exports = router;
