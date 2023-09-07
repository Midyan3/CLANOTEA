const express = require('express');
const multer = require('multer');
const session = require('express-session');
const path = require('path');
const mongoose = require('mongoose');
const fs = require('fs');
const Dropbox = require('dropbox');
const axios = require('axios');

// Constants and configurations
const PORT = 3000;
const BASE_PATH = "/fall 2023-2024 semester classes";
const ACCESS_TOKEN = 'sl.BlkZ5OL_jPzRKs9E2WsQEIeg7AVpPwkfep_QItiFh0M4kIN05fWfBIIOuglkYi4pswpFs5_eUiA23EszTiSk5Zs5v_bJH-DZfGWS6e8hjuQyYS6-OCVTZEnyIX62rg2FtzppsZeZYlKgQgkmsFuSm6A'; // Remember to keep this secret and safe


const app = express();


if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}


var dbx = new Dropbox.Dropbox({ accessToken: ACCESS_TOKEN, fetch });


// Model Definitions
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});


const PendingUserSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    filePath: { type: String }
});


const User = mongoose.model('User', userSchema);
const PendingUser = mongoose.model('test/PendingUser', PendingUserSchema);


// Dropbox utility functions
function fetchCourses() {
    return dbx.filesListFolder({ path: BASE_PATH });
}


function fetchWeeksForCourse(courseName) {
    return dbx.filesListFolder({ path: `${BASE_PATH}/${courseName}` });
}


function fetchContentForWeek(courseName, weekName) {
    return dbx.filesListFolder({ path: `${BASE_PATH}/${courseName}/${weekName}` });
}
function processEntries(entries) {
  if (entries && entries.length > 0) {
      entries.forEach(entry => {
          console.log("Entry:", entry.name);
      });
  } else {
      console.log("No entries found.");
  }
}

app.get('/api/courses', async (req, res) => {
  try {
      const courses = await fetchCourses();
      res.json(courses.result.entries);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});


app.get('/api/courses/:courseName/weeks', async (req, res) => {
  try {
      const weeks = await fetchWeeksForCourse(req.params.courseName);
      res.json(weeks.result.entries);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});


app.get('/api/courses/:courseName/weeks/:weekName/content', async (req, res) => {
  try {
      const content = await fetchContentForWeek(req.params.courseName, req.params.weekName);
      res.json(content.result.entries);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});




// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: '0a2c3e1f7c6b52940c47ee1a87259c9a34911f3749d0ebfe07c5b6e902f4d8bf',
    resave: false,
    saveUninitialized: false
}));
app.use(express.static(path.join(__dirname, 'public')));


// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Login.html'));
});


app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
        return res.status(400).json({ message: 'Email not found' });
    }
    const isMatch = user && password === user.password ? true : false;
    if (isMatch) {
        req.session.isAuthenticated = true;
        req.session.userId = user._id;
        return res.status(200).json({ message: 'Login successful' });
    } else {
        return res.status(400).json({ message: 'Incorrect Email/Password' });
    }
});


app.get('/admin', (req, res) => {
    res.sendFile(__dirname + 'public/Admin.html');
});


app.get('/getPendingUsers', async (req, res) => {
    const users = await PendingUser.find({});
    res.json(users);
});
app.get('/image/:filename', (req, res) => {
  // Add any authentication or validation logic here
  // to ensure that the user should have access to the image.

  const filename = req.params.filename;
  const filepath = path.join(__dirname, 'uploads', filename);

  fs.stat(filepath, (err, stat) => {
      if (err) {
          if (err.code === 'ENOENT') {
              // File not found
              res.status(404).send('Not Found');
          } else {
              res.status(500).send('Internal Server Error');
          }
      } else {
          // Send the file
          res.sendFile(filepath);
      }
  });
});

app.post('/approveUser', async (req, res) => {
    const userId = req.body.userId;
    const NewMember = await PendingUser.findOne({ email: userId });
    try {
        if (NewMember) {
            const NewUser = new User({
                email: NewMember.email,
                password: NewMember.password
            });
            await NewUser.save();
            res.status(200).json({ message: "User saved successfully and can login now" });
            NewMember.deleteOne({ email: userId });
        } else {
            res.status(500).json({ message: "An error occurred" });
        }
    } catch (error) {
        res.status(500).json({ message: "An error occurred" });
    }
});


app.post('/rejectUser', async (req, res) => {
    const userId = req.body.userId;
    try {
        const NewMember = await PendingUser.findOne({ email: userId });
        if (NewMember) {
            await NewMember.deleteOne();
            res.status(200).json({ message: "User rejected successfully" });
        } else {
            res.status(404).json({ message: "An error occurred" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred" });
    }
});


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        const now = new Date().toISOString();
        const date = now.replace(/:/g, '-');  // replace colons with hyphens
        cb(null, date + file.originalname);
    }
});
const upload = multer({ storage: storage });


app.post('/register', upload.single('idFile'), async (req, res, next) => {
  const { email, password } = req.body; // Destructure email and password from the request body
  const idFilePath = req.file.path; // Multer adds the 'file' object to the request, get the file path
  console.log(idFilePath)
  // Create a new pending user
  const newPendingUser = new PendingUser({
    email: email,
    password: password, // Hash the password before saving, you can use libraries like bcrypt
    filePath: idFilePath
    });
    const existingPendingUser = await PendingUser.findOne({ email: req.body.email });


    if (existingPendingUser) {
      // User already exists
      res.status(409).json({ status: 'error', message: 'User is already pending' });
      return;
    }
  // Save to MongoDB
  try {
    await newPendingUser.save();
    res.status(200).json({ message: "User saved successfully" });
  } catch (err) {
    res.status(500).json({ message: "An error occurred" });
    console.error(err);
  }
});



app.get('/Home.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Home.html'));
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

app.get('/GetVideo', async (req, res) => {
  const path = req.query.path;
  const apiUrl = 'https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings';

  try {
      const response = await axios.post(apiUrl, {
          path: path,
      }, {
          headers: {
              'Authorization': `Bearer ${ACCESS_TOKEN}`,
              'Content-Type': 'application/json',
          },
      });

      if (response.data && response.data.url) {
          const originalUrl = response.data.url;
          const modifiedUrl = originalUrl.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '');
          return res.json({url: modifiedUrl});
      }
  } catch (error) {
      console.error("Error getting shared link:", error.response.data);
      return res.status(500).json({ message: 'An error occurred' });
  }
});

// Connect to MongoDB
mongoose.connect('mongodb+srv://midyan:Midyan2003@cluster0.ntjjym3.mongodb.net/', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log("Failed to connect to database. Error:", err));
