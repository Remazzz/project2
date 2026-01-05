const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const { Database, testConnection } = require('./Database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  secret: 'student-grading-system-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Serve static files
app.use(express.static(path.join(__dirname, '..')));

// Test database connection on startup with retry logic
async function startServer() {
  let retries = 3;
  let connected = false;
  
  while (retries > 0 && !connected) {
    try {
      console.log(`\n🔄 Attempting to connect to XAMPP MySQL... (${4 - retries}/3)`);
      await testConnection();
      connected = true;
      console.log('✅ XAMPP MySQL connection successful!');
      console.log('📊 Connected to database: student_grading_system');
      console.log('🔗 MySQL running on port 3306');
      console.log('🚀 Student Grading System is ready!\n');
    } catch (error) {
      retries--;
      console.error(`❌ Connection attempt failed (${4 - retries}/3)`);
      
      if (retries > 0) {
        console.log('⏳ Retrying in 3 seconds...\n');
        await new Promise(resolve => setTimeout(resolve, 3000));
      } else {
        console.error('\n❌ All connection attempts failed!');
        console.error('🔧 XAMPP MySQL Troubleshooting Guide:');
        console.error('   1. Open XAMPP Control Panel');
        console.error('   2. Make sure MySQL shows "Running" (green status)');
        console.error('   3. If MySQL is stopped, click "Start" button');
        console.error('   4. Wait for MySQL to fully start');
        console.error('   5. Restart this Node.js server');
        console.error('   6. Check phpMyAdmin: http://localhost/phpmyadmin');
        console.error('\n⚠️  Server will continue running but database features will not work.\n');
      }
    }
  }
}

// Initialize server
startServer();

// Authentication middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    next();
  } else {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Please login to access this resource'
    });
  }
}

// Role-based authorization middleware
function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.session || !req.session.role) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Please login to access this resource'
      });
    }

    if (!allowedRoles.includes(req.session.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to access this resource'
      });
    }

    next();
  };
}

// Specific role middleware
const requireAdmin = requireRole(['admin']);
const requireTeacher = requireRole(['admin', 'teacher']);
const requireStudent = requireRole(['student']);

// API Routes with error handling

// Authentication Routes
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, email, fullName, role } = req.body;

    if (!username || !password || !email || !fullName || !role) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Please provide username, password, email, full name, and role'
      });
    }

    // Validate role
    if (!['teacher', 'student'].includes(role)) {
      return res.status(400).json({
        error: 'Invalid role',
        message: 'Role must be either teacher or student'
      });
    }

    const existingUsername = await Database.getUserByUsername(username);
    if (existingUsername) {
      return res.status(400).json({
        error: 'Username already exists',
        message: 'Please choose a different username'
      });
    }

    const existingEmail = await Database.getUserByEmail(email);
    if (existingEmail) {
      return res.status(400).json({
        error: 'Email already exists',
        message: 'Please use a different email address'
      });
    }

    const userId = await Database.createUser(username, password, email, fullName, role);
    console.log(`New user registered: ${username} (Role: ${role}, ID: ${userId})`);

    res.json({
      success: true,
      message: 'Registration successful! You can now login.',
      userId
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({
      error: 'Registration failed',
      message: error.message
    });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Please provide username and password'
      });
    }

    const user = await Database.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Username or password is incorrect'
      });
    }

    const isValidPassword = await Database.verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Username or password is incorrect'
      });
    }

    await Database.updateLastLogin(user.id);

    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.role = user.role;
    req.session.fullName = user.full_name;

    console.log(`User logged in: ${username} (Role: ${user.role})`);

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({
      error: 'Login failed',
      message: error.message
    });
  }
});

app.post('/api/logout', (req, res) => {
  const username = req.session.username;
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({
        error: 'Logout failed',
        message: err.message
      });
    }
    console.log(`User logged out: ${username}`);
    res.json({
      success: true,
      message: 'Logout successful'
    });
  });
});

app.get('/api/check-auth', (req, res) => {
  if (req.session && req.session.userId) {
    res.json({
      authenticated: true,
      user: {
        id: req.session.userId,
        username: req.session.username,
        fullName: req.session.fullName,
        role: req.session.role
      }
    });
  } else {
    res.json({
      authenticated: false
    });
  }
});

// Get all sections
app.get('/sections', requireTeacher, async (req, res) => {
  try {
    console.log('📋 Fetching sections...');
    const sections = await Database.getSections();
    console.log(`✅ Found ${sections.length} sections`);
    res.json(sections);
  } catch (error) {
    console.error('❌ Error fetching sections:', error.message);
    res.status(500).json({
      error: 'Failed to fetch sections',
      message: 'Make sure XAMPP MySQL is running'
    });
  }
});

// Add new section
app.post('/sections', requireTeacher, async (req, res) => {
  try {
    const { name } = req.body;
    console.log(`📝 Adding new section: ${name}`);
    const sectionId = await Database.addSection(name);
    console.log(`✅ Section added with ID: ${sectionId}`);
    res.json({ id: sectionId, name, message: 'Section added successfully' });
  } catch (error) {
    console.error('❌ Error adding section:', error.message);
    res.status(500).json({
      error: 'Failed to add section',
      message: error.message
    });
  }
});

// Get all students
app.get('/students', requireTeacher, async (req, res) => {
  try {
    console.log('👥 Fetching all students...');
    const allStudents = await Database.getAllStudents();
    console.log(`✅ Found ${allStudents.length} students total`);
    res.json(allStudents);
  } catch (error) {
    console.error('❌ Error fetching all students:', error.message);
    res.status(500).json({
      error: 'Failed to fetch students',
      message: error.message
    });
  }
});

// Get students by section
app.get('/students/:sectionId', requireTeacher, async (req, res) => {
  try {
    const { sectionId } = req.params;
    console.log(`👥 Fetching students for section ${sectionId}...`);
    const students = await Database.getStudentsBySection(sectionId);
    console.log(`✅ Found ${students.length} students`);
    res.json(students);
  } catch (error) {
    console.error('❌ Error fetching students:', error.message);
    res.status(500).json({
      error: 'Failed to fetch students',
      message: error.message
    });
  }
});

// Add new student
app.post('/students', requireTeacher, async (req, res) => {
  try {
    const { name, sectionId } = req.body;
    console.log(`👤 Adding new student: ${name} to section ${sectionId}`);
    const studentId = await Database.addStudent(name, sectionId);
    console.log(`✅ Student added with ID: ${studentId}`);
    res.json({ id: studentId, name, sectionId, message: 'Student added successfully' });
  } catch (error) {
    console.error('❌ Error adding student:', error.message);
    res.status(500).json({
      error: 'Failed to add student',
      message: error.message
    });
  }
});

// Delete student
app.delete('/students/:studentId', requireTeacher, async (req, res) => {
  try {
    const { studentId } = req.params;
    console.log(`🗑️  Deleting student ID: ${studentId}`);
    await Database.deleteStudent(studentId);
    console.log(`✅ Student deleted`);
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting student:', error.message);
    res.status(500).json({
      error: 'Failed to delete student',
      message: error.message
    });
  }
});

// Get custom inputs
app.get('/custom-inputs', requireAuth, async (req, res) => {
  try {
    console.log('🔧 Fetching custom inputs...');
    const customInputs = await Database.getCustomInputs();
    console.log(`✅ Found ${customInputs.length} custom inputs`);
    res.json(customInputs);
  } catch (error) {
    console.error('❌ Error fetching custom inputs:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch custom inputs',
      message: error.message 
    });
  }
});

// Add custom input
app.post('/custom-inputs', requireAuth, async (req, res) => {
  try {
    const { name, type, weight } = req.body;
    console.log(`➕ Adding custom input: ${name} (${type}, weight: ${weight})`);
    const inputId = await Database.addCustomInput(name, type, weight);
    console.log(`✅ Custom input added with ID: ${inputId}`);
    res.json({ id: inputId, name, type, weight, message: 'Custom input added successfully' });
  } catch (error) {
    console.error('❌ Error adding custom input:', error.message);
    res.status(500).json({ 
      error: 'Failed to add custom input',
      message: error.message 
    });
  }
});

// Remove custom input
app.delete('/custom-inputs/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️  Removing custom input ID: ${id}`);
    await Database.removeCustomInput(id);
    console.log(`✅ Custom input removed`);
    res.json({ message: 'Custom input removed successfully' });
  } catch (error) {
    console.error('❌ Error removing custom input:', error.message);
    res.status(500).json({ 
      error: 'Failed to remove custom input',
      message: error.message 
    });
  }
});

// Get student grades
app.get('/grades/:studentId', requireAuth, async (req, res) => {
  try {
    const { studentId } = req.params;
    console.log(`📊 Fetching grades for student ID: ${studentId}`);
    const gradesData = await Database.getStudentGrades(studentId);

    // For student users, also fetch their own information
    let studentInfo = null;
    if (req.session.role === 'student') {
      studentInfo = await Database.getStudentByUserId(req.session.userId);
    }

    const responseData = {
      ...gradesData,
      student: studentInfo
    };

    console.log(`✅ Grades fetched for student ${studentId}`);
    res.json(responseData);
  } catch (error) {
    console.error('❌ Error fetching grades:', error.message);
    res.status(500).json({
      error: 'Failed to fetch grades',
      message: error.message
    });
  }
});

// Save student grades
app.post('/grades', requireTeacher, async (req, res) => {
  try {
    const { studentId, subjectId, ...gradesData } = req.body;
    console.log(`💾 Saving grades for student ID: ${studentId}, subject ID: ${subjectId}`);
    await Database.saveStudentGrades(studentId, subjectId, gradesData);
    console.log(`✅ Grades saved for student ${studentId}, subject ${subjectId}`);
    res.json({ message: 'Grades saved successfully' });
  } catch (error) {
    console.error('❌ Error saving grades:', error.message);
    res.status(500).json({
      error: 'Failed to save grades',
      message: error.message
    });
  }
});

// Delete student grade for specific subject
app.delete('/grades/:studentId/:subjectId', requireTeacher, async (req, res) => {
  try {
    const { studentId, subjectId } = req.params;
    console.log(`🗑️  Deleting grades for student ID: ${studentId}, subject ID: ${subjectId}`);
    await Database.deleteStudentGrade(studentId, subjectId);
    console.log(`✅ Grades deleted for student ${studentId}, subject ${subjectId}`);
    res.json({ message: 'Grades deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting grades:', error.message);
    res.status(500).json({
      error: 'Failed to delete grades',
      message: error.message
    });
  }
});

// Get student's own grades (for student users)
app.get('/my-grades/:studentId', requireStudent, async (req, res) => {
  try {
    const { studentId } = req.params;
    console.log(`📊 Student fetching their own grades for student ID: ${studentId}`);
    const gradesData = await Database.getStudentGrades(studentId);
    console.log(`✅ Grades fetched for student ${studentId}`);
    res.json(gradesData);
  } catch (error) {
    console.error('❌ Error fetching student grades:', error.message);
    res.status(500).json({
      error: 'Failed to fetch grades',
      message: error.message
    });
  }
});

// Get all subjects
app.get('/subjects', requireTeacher, async (req, res) => {
  try {
    console.log('📚 Fetching subjects...');
    const subjects = await Database.getSubjects();
    console.log(`✅ Found ${subjects.length} subjects`);
    res.json(subjects);
  } catch (error) {
    console.error('❌ Error fetching subjects:', error.message);
    res.status(500).json({
      error: 'Failed to fetch subjects',
      message: 'Make sure XAMPP MySQL is running'
    });
  }
});

// Add new subject
app.post('/subjects', requireTeacher, async (req, res) => {
  try {
    const { name, teacherId } = req.body;
    console.log(`📝 Adding new subject: ${name}`);
    const subjectId = await Database.addSubject(name, teacherId);
    console.log(`✅ Subject added with ID: ${subjectId}`);
    res.json({ id: subjectId, name, teacherId, message: 'Subject added successfully' });
  } catch (error) {
    console.error('❌ Error adding subject:', error.message);
    res.status(500).json({
      error: 'Failed to add subject',
      message: error.message
    });
  }
});

// Delete subject
app.delete('/subjects/:subjectId', requireTeacher, async (req, res) => {
  try {
    const { subjectId } = req.params;
    console.log(`🗑️  Deleting subject ID: ${subjectId}`);
    await Database.deleteSubject(subjectId);
    console.log(`✅ Subject deleted`);
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting subject:', error.message);
    res.status(500).json({
      error: 'Failed to delete subject',
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Server is running',
    timestamp: new Date().toISOString(),
    message: 'Student Grading System API is operational'
  });
});

// Serve the main HTML file
app.get('/', (req, res) => {
  if (req.session && req.session.userId) {
    console.log('🌐 Serving main application page');
    res.sendFile(path.join(__dirname, '..', 'public', 'Sample.html'));
  } else {
    res.redirect('/login.html');
  }
});

app.get('/Sample.html', (req, res) => {
  if (req.session && req.session.userId) {
    res.sendFile(path.join(__dirname, '..', 'public', 'Sample.html'));
  } else {
    res.redirect('/login.html');
  }
});

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
});

app.get('/register.html', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'register.html'));
});

app.get('/student-grades.html', (req, res) => {
  if (req.session && req.session.userId) {
    res.sendFile(path.join(__dirname, '..', 'public', 'student-grades.html'));
  } else {
    res.redirect('/login.html');
  }
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: `The requested route ${req.originalUrl} was not found`
  });
});

// Error handling middleware (must be after all routes)
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Student Grading System is ready!`);
  console.log(`🌐 Open your browser and go to: http://localhost:${PORT}`);
  console.log(`🔧 API Health Check: http://localhost:${PORT}/api/health\n`);
});

// Handle server shutdown gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Server shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Server terminated gracefully...');
  process.exit(0);
});

module.exports = app;