var express = require("express");
const { route } = require("./users");
var router = express.Router();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const bodyP = require("body-parser");
const compiler = require("compilex");
const options = { stats: true };

compiler.init(options);

router.use(bodyP.json());

router.use(
  "/codemirror-5.65.16",
  express.static("C:/Users/hp/Desktop/js/codemirror")
);

mongoose.connect('mongodb://localhost:27017/quizDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const quizSessionSchema = new mongoose.Schema({
  quizLink: String,
  emails: [String] // Array of email addresses
});

const QuizSession = mongoose.model('QuizSession', quizSessionSchema);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/room", function (req, res, next) {
  res.render("room");
});

router.get("/join-room", function (req, res) {
  const roomID = req.params.roomId;

  res.render("join-room", { roomID: roomID });
});
router.get("/chat", function (req, res, next) {
  res.render("chat");
});
router.get("/ide", function (req, res, next) {
  res.render("ide");
});
router.get('/quiz-session-form', (req, res) => {
  res.render('quizSessionForm');
});

router.get('/apptitude', async (req, res) => {
  try {
      // Perform a findOne query to check if a document with the specified email exists
      const quizData = await QuizSession.findOne({ emails:'dio@gmail.com' }); // Assuming the email is stored in req.user.email

      if (quizData) {
          // If quizData exists (i.e., a document with the specified email is found), render the quiz page
          res.render('apptitude', { quizData });
      } else {
          // If quizData does not exist, set a message in the session and redirect to the home page
          res.redirect('no-apptitude');
      }
  } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
  }
});


router.post('/quiz-session', async (req, res) => {
  const { quizLink, emails } = req.body;

  // Split the comma-separated emails into an array
  const emailArray = emails.split(',').map(email => email.trim());

  const quizSession = new QuizSession({
    quizLink,
  
    emails: emailArray // Store the array of emails
  });

  try {
    await quizSession.save();
    res.status(201).send('Quiz session saved successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error saving quiz session to database');
  }
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
