const express = require('express');
const multer = require('multer');
const session = require('express-session');
const path = require('path');
const mongoose = require('mongoose');
const fs = require('fs');
const Dropbox = require('dropbox');
const cors = require('cors');
const axios = require('axios');
const { compareSync } = require('bcrypt');
require('dotenv').config();
const app = express();
app.use(cors({
    origin: 'http://localhost:3000', 
    credentials: true
}));
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        const now = new Date().toISOString();
        const date = now.replace(/:/g, '-');  
        cb(null, date + file.originalname);
    }
});

app.use(session({
    secret: "mytestsecret",
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: false,
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000 
    }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/Upload.html', Authentication, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Upload.html'));
});
app.get('/Home.html', Authentication, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Home.html'));
});

app.get('/Upload.html', Authentication, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Upload.html'));
});


app.get('/HomeScreen.html', Authentication, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Home.html'));
});

function Authentication(req, res, next) {
    console.log('Session ID:', req.sessionID);
    console.log('Session data:', req.session);
    console.log('isAuthenticated:', req.session.isAuthenticated);
    
    if (req.session.isAuthenticated) {
        return next();  
    } else {
        res.redirect('/Login.html');  
    }
}


const upload = multer({ storage: storage });
// Constants and configurations
const PORT = 3000;
const BASE_PATH = process.env.BASE_PATH;
const ACCESS_TOKEN = process.env.API_KEY;
console.log(process.env.API_KEY);


app.use('/uploads', express.static('uploads'));

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

const Upload = new mongoose.Schema({
    ClassName: { type: String, required: true },
    Title: { type: String, required: true },
    WeekName: { type: String, required: true },
    Description :{type: String, required: true},
    filePath: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);
const PendingUser = mongoose.model('test/PendingUser', PendingUserSchema);
const Uploads = mongoose.model('Uploads', Upload);


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
    console.error("Error getting courses:", error);
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

app.post('/Upload', upload.single('file'), (req, res) => {
    try{
        console.log(req.body);
        const ClassName = req.body.ClassName;
        const WeekName = req.body.WeekName || 'Week 1';
        const description = req.body.description;
        const Title = req.body.Title;
        const file = req.file;
        const filePath = file.path;
        const upload = new Uploads({
            ClassName: ClassName,
            WeekName: WeekName,
            Description: description,
            Title: Title,
            filePath: file.path
        });
        upload.save();
        return res.status(200).json({message: 'File uploaded successfully'});
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Failed to upload. Error: " + error});
    } 
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: process.env.SECRET_KEY,
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
        req.session.save(err => {
            if (err) {
                console.error("Error saving session:", err);
                return res.status(500).json({ message: 'Internal Server Error' });
            }
            return res.status(200).json({ message: 'Login successful' });
        });
        console.log('Session ID:', req.sessionID);
    }else {
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

app.get('/GetUploads', async (req, res) => {
    try {
        const uploads = await Uploads.find({});
        res.json(uploads);
    } catch (error) {
        console.error("Error fetching uploads:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
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

app.post('/rejectUpload', async (req, res) => {
    try{
        Path = req.body.filePath;
        await Uploads.deleteOne({filePath: Path});
        res.status(200).json({message: "Upload rejected successfully"});
    }catch(error){
        console.error(error);
        res.status(500).json({message: "An error occurred"});
    }

});

app.post('/approveUpload', async (req, res) => {
    try {
        let path = req.body.filePath;
        console.log(path);
        const pathRegex = new RegExp("^" + path.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') + "$", "i");
        console.log(pathRegex);

        const upload = await Uploads.findOne({filePath: pathRegex});
        console.log(upload);
        if (!upload) {
            res.status(404).json({message: "Upload not found"});
            return;
        }

        const coursesData = await fetchCourses();
        console.log('Raw coursesData:', coursesData);
        const courseExists = coursesData.result.entries.some(entry => entry.name === upload.ClassName);
        if (!courseExists) {
            await dbx.filesCreateFolderV2({path: `${BASE_PATH}/${upload.ClassName}`});
        }

        const weeksData = await fetchWeeksForCourse(upload.ClassName);
        const weekExists = weeksData.result.entries.some(entry => entry.name === upload.WeekName);
        if (!weekExists) {
            await dbx.filesCreateFolderV2({path: `${BASE_PATH}/${upload.ClassName}/${upload.WeekName}`});
        }

        // Upload the file
        const fileContents = fs.readFileSync(upload.filePath); 
        const fileExtension = "." + path.split('.').pop().toLowerCase();
        await dbx.filesUpload({
            path: `${BASE_PATH}/${upload.ClassName}/${upload.WeekName}/${upload.Title}${fileExtension}`,
            contents: fileContents
        });
        upload.deleteOne();
        res.status(200).json({message: "Upload successful!"});

    } catch (error) {
        console.error(error);
        res.status(500).json({message: "An error occurred"});
    }
});


app.post('/register', upload.single('idFile'), async (req, res, next) => {
  const { email, password } = req.body; // Destructure email and password from the request body
  const idFilePath = req.file.path;
  console.log(idFilePath)
  // Create a new pending user
  const newPendingUser = new PendingUser({
    email: email,
    password: password, 
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

app.get('/GetContent', async (req, res) => {
    const path = req.query.path;
    const apiUrl = 'https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings';
    console.log("Path:", path);
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
        if (error.response && error.response.data && error.response.data.error_summary && error.response.data.error_summary.startsWith("shared_link_already_exists")) {
            const existingLink = error.response.data.error.shared_link_already_exists.metadata.url;
            console.log("Existing shared link:", existingLink);
            const modifiedExistingLink = existingLink.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '');
            return res.json({url: modifiedExistingLink});
        }
        console.error("Error getting shared link:", error.response.data);
        return res.status(500).json({ message: 'An error occurred' });
    }
});



// Connect to MongoDB
mongoose.connect(process.env.MONGOL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log("Failed to connect to database. Error:", err));