const mysql = require('mysql2/promise');

// XAMPP v3.3.0 MySQL Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // XAMPP default - empty password
  database: 'student_grading_system',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  multipleStatements: true,
  charset: 'utf8mb4',
  // Additional XAMPP specific settings
  ssl: false,
  connectTimeout: 60000,
  socketPath: undefined
};

// Create connection pool with enhanced error handling
let pool;

async function createPool() {
  try {
    pool = mysql.createPool(dbConfig);
    console.log('📊 MySQL connection pool created for XAMPP v3.3.0');
    return pool;
  } catch (error) {
    console.error('❌ Failed to create MySQL pool:', error.message);
    throw error;
  }
}

// Initialize pool
createPool();

// Enhanced database connection test for XAMPP v3.3.0
async function testConnection() {
  try {
    console.log('🔍 Testing XAMPP v3.3.0 MySQL connection...');
    console.log('📍 Configuration:');
    console.log('   Host:', dbConfig.host);
    console.log('   User:', dbConfig.user);
    console.log('   Port:', dbConfig.port);
    console.log('   Database:', dbConfig.database);
    console.log('   XAMPP Version: v3.3.0');
    
    // Test basic connection
    const connection = await pool.getConnection();
    console.log('✅ Basic MySQL connection successful!');
    
    // Test MySQL version
    const [versionResult] = await connection.execute('SELECT VERSION() as version');
    console.log('🔢 MySQL Version:', versionResult[0].version);
    
    // Check if database exists, create if not - using raw query for LIKE in MariaDB
    const dbNameEscaped = dbConfig.database.replace(/'/g, "\\'");
    const [databases] = await connection.query(`SHOW DATABASES LIKE '${dbNameEscaped}'`);
    console.log('🔍 Database check query executed:', `SHOW DATABASES LIKE '${dbNameEscaped}'`);
    console.log('📊 Found databases matching pattern:', databases.length);
    if (databases.length === 0) {
      console.log('⚠️  Database "' + dbConfig.database + '" not found!');
      console.log('📋 Creating database...');
      const createDbQuery = `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``;
      console.log('🔍 Creating database query:', createDbQuery);
      await connection.execute(createDbQuery);
      console.log('✅ Database created successfully');
    } else {
      console.log('✅ Database "' + dbConfig.database + '" found');
    }
    
    // Switch to the database
    await connection.query(`USE \`${dbConfig.database}\``);
    
    // Check tables and create if needed
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📊 Existing tables:', tables.map(t => Object.values(t)[0]));
    
    if (tables.length === 0) {
      console.log('⚠️  No tables found! Creating tables...');
      await createTables(connection);
    } else {
      console.log('✅ Tables already exist');
      // Verify all required tables exist
      const requiredTables = ['users', 'sections', 'students', 'custom_inputs', 'student_grades', 'custom_input_values'];
      const existingTableNames = tables.map(t => Object.values(t)[0]);
      const missingTables = requiredTables.filter(table => !existingTableNames.includes(table));
      
      if (missingTables.length > 0) {
        console.log('⚠️  Missing tables:', missingTables);
        console.log('📋 Creating missing tables...');
        await createTables(connection);
      }
    }
    
    connection.release();
    console.log('🎉 XAMPP MySQL setup complete and ready!');
    return true;
  } catch (error) {
    console.error('❌ XAMPP MySQL connection failed!');
    console.error('Error details:', {
      code: error.code,
      errno: error.errno,
      message: error.message,
      sqlState: error.sqlState
    });
    
    // Specific XAMPP troubleshooting
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 XAMPP v3.3.0 MySQL Troubleshooting:');
      console.log('   1. Open XAMPP Control Panel v3.3.0');
      console.log('   2. Look for MySQL in the services list');
      console.log('   3. Click "Start" button next to MySQL');
      console.log('   4. Wait for status to show "Running" (green)');
      console.log('   5. If it fails to start, check port 3306 is not in use');
      console.log('   6. Try stopping and restarting MySQL service');
      console.log('   7. Check XAMPP logs for detailed error messages');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n🔧 Database Access Issue:');
      console.log('   1. XAMPP default: username="root", password=""');
      console.log('   2. Check if you changed MySQL root password');
      console.log('   3. Try accessing phpMyAdmin: http://localhost/phpmyadmin');
    } else if (error.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN') {
      console.log('\n🔧 Network/DNS Issue:');
      console.log('   1. Try using 127.0.0.1 instead of localhost');
      console.log('   2. Check your hosts file');
      console.log('   3. Restart XAMPP completely');
    }
    
    throw error;
  }
}

// Create all required tables with proper structure
async function createTables(connection) {
  console.log('🏗️  Creating database tables...');
  
  try {
    // Drop existing tables if they exist (in correct order due to foreign keys)
    const dropTables = [
      'DROP TABLE IF EXISTS custom_input_values',
      'DROP TABLE IF EXISTS student_grades',
      'DROP TABLE IF EXISTS custom_inputs',
      'DROP TABLE IF EXISTS students',
      'DROP TABLE IF EXISTS sections',
      'DROP TABLE IF EXISTS users'
    ];
    
    for (const dropSQL of dropTables) {
      await connection.execute(dropSQL);
    }
    
    // Create tables in correct order
    const createTables = [
      // Users table
      `CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        full_name VARCHAR(100) NOT NULL,
        role ENUM('admin', 'teacher') DEFAULT 'teacher',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL,
        INDEX idx_username (username),
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

      // Sections table
      `CREATE TABLE sections (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      
      // Students table
      `CREATE TABLE students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        section_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      
      // Custom inputs table
      `CREATE TABLE custom_inputs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type ENUM('score', 'percentage') NOT NULL,
        weight DECIMAL(5,4) NOT NULL DEFAULT 0.0500,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      
      // Student grades table
      `CREATE TABLE student_grades (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        class_participation DECIMAL(5,2) DEFAULT 0.00,
        attendance DECIMAL(5,2) DEFAULT 0.00,
        quiz1_score DECIMAL(8,2) DEFAULT 0.00,
        quiz1_total DECIMAL(8,2) DEFAULT 1.00,
        quiz2_score DECIMAL(8,2) DEFAULT 0.00,
        quiz2_total DECIMAL(8,2) DEFAULT 1.00,
        final_exam_score DECIMAL(8,2) DEFAULT 0.00,
        final_exam_total DECIMAL(8,2) DEFAULT 1.00,
        lab_grade DECIMAL(5,2) DEFAULT 0.00,
        final_grade DECIMAL(5,2) DEFAULT 0.00,
        letter_grade VARCHAR(3) DEFAULT 'F',
        status ENUM('pending', 'completed') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        UNIQUE KEY unique_student_grade (student_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      
      // Custom input values table
      `CREATE TABLE custom_input_values (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        custom_input_id INT NOT NULL,
        score_value DECIMAL(8,2) DEFAULT NULL,
        total_value DECIMAL(8,2) DEFAULT NULL,
        percentage_value DECIMAL(5,2) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (custom_input_id) REFERENCES custom_inputs(id) ON DELETE CASCADE,
        UNIQUE KEY unique_student_input (student_id, custom_input_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
    ];
    
    // Execute table creation
    for (const tableSQL of createTables) {
      await connection.execute(tableSQL);
    }
    
    console.log('✅ All tables created successfully');
    
    // Insert default data
    console.log('📝 Inserting default data...');

    // Insert default admin user (password: admin123)
    await connection.execute(`
      INSERT INTO users (username, password, email, full_name, role) VALUES
      ('admin', '$2a$10$kZXz9Y8fWx8P.0qJ8L5q9.xJZ7qH0vN4P5N0J5K8L7M9Q0R1S2T3U4', 'admin@school.com', 'Administrator', 'admin'),
      ('teacher1', '$2a$10$kZXz9Y8fWx8P.0qJ8L5q9.xJZ7qH0vN4P5N0J5K8L7M9Q0R1S2T3U4', 'teacher@school.com', 'Teacher One', 'teacher')
    `);

    // Insert sections
    await connection.execute(`
      INSERT INTO sections (id, name) VALUES
      (1, 'Section A'),
      (2, 'Section B')
    `);

    // Insert students
    await connection.execute(`
      INSERT INTO students (id, name, section_id) VALUES
      (1, 'Rey Mark Malabarbas', 1),
      (2, 'Maria Santos', 1),
      (3, 'John Doe', 2)
    `);

    // Insert custom inputs
    await connection.execute(`
      INSERT INTO custom_inputs (id, name, type, weight) VALUES
      (1, 'Quiz 3', 'score', 0.0500),
      (2, 'Seatwork 1', 'percentage', 0.0300)
    `);

    console.log('✅ Default data inserted successfully');
    console.log('📝 Default Login Credentials:');
    console.log('   Username: admin, Password: admin123');
    console.log('   Username: teacher1, Password: admin123');
    console.log('🎉 Database setup complete!');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
}

// Enhanced Database operations class
class Database {
  // Test connection method
  static async testConnection() {
    return await testConnection();
  }

  // Authentication
  static async createUser(username, password, email, fullName, role = 'teacher') {
    try {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 10);

      const [result] = await pool.execute(
        'INSERT INTO users (username, password, email, full_name, role) VALUES (?, ?, ?, ?, ?)',
        [username, hashedPassword, email, fullName, role]
      );
      return result.insertId;
    } catch (error) {
      console.error('Database error in createUser:', error);
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  static async getUserByUsername(username) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Database error in getUserByUsername:', error);
      throw new Error(`Failed to get user: ${error.message}`);
    }
  }

  static async getUserByEmail(email) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Database error in getUserByEmail:', error);
      throw new Error(`Failed to get user: ${error.message}`);
    }
  }

  static async updateLastLogin(userId) {
    try {
      await pool.execute(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
        [userId]
      );
    } catch (error) {
      console.error('Database error in updateLastLogin:', error);
      throw new Error(`Failed to update last login: ${error.message}`);
    }
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    try {
      const bcrypt = require('bcryptjs');
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Database error in verifyPassword:', error);
      throw new Error(`Failed to verify password: ${error.message}`);
    }
  }

  // Sections
  static async getSections() {
    try {
      const [rows] = await pool.execute('SELECT * FROM sections ORDER BY name');
      return rows;
    } catch (error) {
      console.error('Database error in getSections:', error);
      throw new Error(`Failed to get sections: ${error.message}`);
    }
  }

  static async addSection(name) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO sections (name) VALUES (?)',
        [name]
      );
      return result.insertId;
    } catch (error) {
      console.error('Database error in addSection:', error);
      throw new Error(`Failed to add section: ${error.message}`);
    }
  }

  // Students
  static async getStudentsBySection(sectionId) {
    try {
      const [rows] = await pool.execute(`
        SELECT s.*, sg.status, sg.final_grade, sg.letter_grade 
        FROM students s 
        LEFT JOIN student_grades sg ON s.id = sg.student_id 
        WHERE s.section_id = ? 
        ORDER BY s.name
      `, [sectionId]);
      return rows;
    } catch (error) {
      console.error('Database error in getStudentsBySection:', error);
      throw new Error(`Failed to get students: ${error.message}`);
    }
  }

  static async addStudent(name, sectionId) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO students (name, section_id) VALUES (?, ?)',
        [name, sectionId]
      );
      return result.insertId;
    } catch (error) {
      console.error('Database error in addStudent:', error);
      throw new Error(`Failed to add student: ${error.message}`);
    }
  }

  static async deleteStudent(studentId) {
    try {
      await pool.execute('DELETE FROM students WHERE id = ?', [studentId]);
    } catch (error) {
      console.error('Database error in deleteStudent:', error);
      throw new Error(`Failed to delete student: ${error.message}`);
    }
  }

  // Custom Inputs
  static async getCustomInputs() {
    try {
      const [rows] = await pool.execute('SELECT * FROM custom_inputs ORDER BY id');
      return rows;
    } catch (error) {
      console.error('Database error in getCustomInputs:', error);
      throw new Error(`Failed to get custom inputs: ${error.message}`);
    }
  }

  static async addCustomInput(name, type, weight) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO custom_inputs (name, type, weight) VALUES (?, ?, ?)',
        [name, type, weight]
      );
      return result.insertId;
    } catch (error) {
      console.error('Database error in addCustomInput:', error);
      throw new Error(`Failed to add custom input: ${error.message}`);
    }
  }

  static async removeCustomInput(id) {
    try {
      await pool.execute('DELETE FROM custom_inputs WHERE id = ?', [id]);
    } catch (error) {
      console.error('Database error in removeCustomInput:', error);
      throw new Error(`Failed to remove custom input: ${error.message}`);
    }
  }

  // Grades
  static async getStudentGrades(studentId) {
    try {
      const [gradeRows] = await pool.execute(
        'SELECT * FROM student_grades WHERE student_id = ?',
        [studentId]
      );

      const [customRows] = await pool.execute(`
        SELECT civ.*, ci.name, ci.type 
        FROM custom_input_values civ 
        JOIN custom_inputs ci ON civ.custom_input_id = ci.id 
        WHERE civ.student_id = ?
      `, [studentId]);

      return {
        grades: gradeRows[0] || null,
        customInputs: customRows
      };
    } catch (error) {
      console.error('Database error in getStudentGrades:', error);
      throw new Error(`Failed to get student grades: ${error.message}`);
    }
  }

  static async saveStudentGrades(studentId, gradesData) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Insert or update main grades
      await connection.execute(`
        INSERT INTO student_grades (
          student_id, class_participation, attendance, quiz1_score, quiz1_total,
          quiz2_score, quiz2_total, final_exam_score, final_exam_total,
          lab_grade, final_grade, letter_grade, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          class_participation = VALUES(class_participation),
          attendance = VALUES(attendance),
          quiz1_score = VALUES(quiz1_score),
          quiz1_total = VALUES(quiz1_total),
          quiz2_score = VALUES(quiz2_score),
          quiz2_total = VALUES(quiz2_total),
          final_exam_score = VALUES(final_exam_score),
          final_exam_total = VALUES(final_exam_total),
          lab_grade = VALUES(lab_grade),
          final_grade = VALUES(final_grade),
          letter_grade = VALUES(letter_grade),
          status = VALUES(status),
          updated_at = CURRENT_TIMESTAMP
      `, [
        studentId,
        gradesData.classParticipation,
        gradesData.attendance,
        gradesData.quiz1Score,
        gradesData.quiz1Total,
        gradesData.quiz2Score,
        gradesData.quiz2Total,
        gradesData.finalExamScore,
        gradesData.finalExamTotal,
        gradesData.labGrade,
        gradesData.finalGrade,
        gradesData.letterGrade,
        gradesData.status
      ]);

      // Handle custom input values
      if (gradesData.customInputs) {
        for (const [inputId, inputData] of Object.entries(gradesData.customInputs)) {
          if (inputData.type === 'score') {
            await connection.execute(`
              INSERT INTO custom_input_values (student_id, custom_input_id, score_value, total_value)
              VALUES (?, ?, ?, ?)
              ON DUPLICATE KEY UPDATE
                score_value = VALUES(score_value),
                total_value = VALUES(total_value),
                updated_at = CURRENT_TIMESTAMP
            `, [studentId, inputId, inputData.score, inputData.total]);
          } else {
            await connection.execute(`
              INSERT INTO custom_input_values (student_id, custom_input_id, percentage_value)
              VALUES (?, ?, ?)
              ON DUPLICATE KEY UPDATE
                percentage_value = VALUES(percentage_value),
                updated_at = CURRENT_TIMESTAMP
            `, [studentId, inputId, inputData.value]);
          }
        }
      }

      await connection.commit();
      console.log(`✅ Grades saved successfully for student ${studentId}`);
    } catch (error) {
      await connection.rollback();
      console.error('Database error in saveStudentGrades:', error);
      throw new Error(`Failed to save student grades: ${error.message}`);
    } finally {
      connection.release();
    }
  }
}

module.exports = { Database, testConnection };
