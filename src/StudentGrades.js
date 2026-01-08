let allStudents = [];
let currentSelectedStudent = null;

document.addEventListener('DOMContentLoaded', () => {
  initializeTheme();
  initializeSubjects();
  initializeStudentView();
  setupEventListeners();
});

function initializeTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
}

async function initializeSubjects() {
  try {
    const response = await fetch('/subjects', {
      credentials: 'include'
    });
    if (response.ok) {
      subjects = await response.json();
      console.log('Subjects loaded:', subjects);
    } else {
      console.error('Failed to load subjects');
      // Fallback to default subjects
      subjects = [
        { id: 1, name: 'Mathematics' },
        { id: 2, name: 'Science' },
        { id: 3, name: 'English' },
        { id: 4, name: 'History' }
      ];
    }
  } catch (error) {
    console.error('Error loading subjects:', error);
    // Fallback to default subjects
    subjects = [
      { id: 1, name: 'Mathematics' },
      { id: 2, name: 'Science' },
      { id: 3, name: 'English' },
      { id: 4, name: 'History' }
    ];
  }
}

async function initializeStudentView() {
  try {
    // Fetch all students from API
    const response = await fetch('/students', {
      credentials: 'include'
    });

    if (response.ok) {
      allStudents = await response.json();
      loadStudentsList();
    } else {
      console.error('Failed to fetch students');
      showError('Failed to load students. Please try again.');
    }
  } catch (error) {
    console.error('Error fetching students:', error);
    showError('Error loading students. Please check your connection.');
  }
}

function setupEventListeners() {
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      alert('Logged out successfully');
      window.location.href = 'login.html';
    });
  }

  const studentSelect = document.getElementById('studentSelect');
  if (studentSelect) {
    studentSelect.addEventListener('change', (e) => {
      if (e.target.value) {
        const studentId = parseInt(e.target.value);
        displayStudentGrades(studentId);
      }
    });
  }

  const downloadBtn = document.getElementById('downloadBtn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', downloadGradeReport);
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';

  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}

function loadStudentsList() {
  const studentSelect = document.getElementById('studentSelect');
  if (!studentSelect || allStudents.length === 0) return;

  studentSelect.innerHTML = '<option value="">Select Student</option>' +
    allStudents.map(student =>
      `<option value="${student.id}">${student.name}</option>`
    ).join('');
}

function showError(message) {
  console.error(message);
  // You could implement a more sophisticated error display here
  alert(message);
}

async function displayStudentGrades(studentId) {
  currentSelectedStudent = allStudents.find(s => s.id === studentId);

  if (!currentSelectedStudent) {
    document.getElementById('gradesContainer').innerHTML =
      '<p class="no-data-message">Student not found</p>';
    return;
  }

  updateStudentInfo(currentSelectedStudent);

  try {
    // Fetch grades for the selected student
    const response = await fetch(`/grades/${studentId}`, {
      credentials: 'include'
    });

    if (response.ok) {
      const gradesData = await response.json();
      const studentGrades = gradesData.grades || {};

      if (Object.keys(studentGrades).length === 0) {
        document.getElementById('gradesContainer').innerHTML =
          '<p class="no-data-message">No grades available for this student</p>';
        return;
      }

      renderGradesTable(studentGrades);
    } else {
      console.error('Failed to fetch grades');
      document.getElementById('gradesContainer').innerHTML =
        '<p class="no-data-message">Failed to load grades. Please try again.</p>';
    }
  } catch (error) {
    console.error('Error fetching grades:', error);
    document.getElementById('gradesContainer').innerHTML =
      '<p class="no-data-message">Error loading grades. Please check your connection.</p>';
  }
}

function updateStudentInfo(student) {
  const nameEl = document.getElementById('studentName');
  const idEl = document.getElementById('studentId');
  const sectionEl = document.getElementById('studentSection');
  const avatarEl = document.querySelector('.student-avatar-large');

  if (nameEl) nameEl.textContent = student.name;
  if (idEl) idEl.textContent = `ID: ${student.id}`;

  const section = allStudents.find(s => s.id === student.id)?.section_id;
  if (sectionEl && section) {
    sectionEl.textContent = `Section: ${section}`;
  }

  if (avatarEl) {
    const initials = student.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
    avatarEl.textContent = initials || 'ST';
  }
}

function renderGradesTable(studentGrades) {
  let tableHTML = `
    <table class="grades-table">
      <thead>
        <tr>
          <th>Subject</th>
          <th>Letter Grade</th>
          <th>Score</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
  `;

  Object.entries(studentGrades).forEach(([subjectId, gradeData]) => {
    const subjectName = gradeData.subject_name || getSubjectName(parseInt(subjectId));
    const score = parseFloat(gradeData.final_grade) || 0;
    const letterGrade = getLetterGrade(score);
    const status = score >= 75 ? 'Passed' : 'Failed';
    const statusClass = status === 'Passed' ? 'status-passed' : 'status-failed';

    tableHTML += `
      <tr>
        <td class="subject-name">${subjectName}</td>
        <td class="grade-letter">${letterGrade}</td>
        <td class="score-value">${score.toFixed(2)}</td>
        <td><span class="status-badge ${statusClass}">${status}</span></td>
      </tr>
    `;
  });

  tableHTML += `
      </tbody>
    </table>
  `;

  const container = document.getElementById('gradesContainer');
  if (container) {
    container.innerHTML = tableHTML;
  }
}

function getLetterGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 85) return 'A-';
  if (score >= 80) return 'B+';
  if (score >= 75) return 'B';
  if (score >= 70) return 'B-';
  if (score >= 65) return 'C+';
  if (score >= 60) return 'C';
  if (score >= 55) return 'C-';
  if (score >= 50) return 'D';
  return 'F';
}

function getSubjectName(subjectId) {
  const subject = subjects.find(s => s.id === subjectId);
  return subject ? subject.name : `Subject ${subjectId}`;
}

async function downloadGradeReport() {
  if (!currentSelectedStudent) {
    alert('Please select a student first');
    return;
  }

  try {
    // Fetch grades for the selected student
    const response = await fetch(`/grades/${currentSelectedStudent.id}`, {
      credentials: 'include'
    });

    if (!response.ok) {
      alert('Failed to fetch grades for download');
      return;
    }

    const gradesData = await response.json();
    const studentGrades = gradesData.grades || {};

    if (Object.keys(studentGrades).length === 0) {
      alert('No grades available to download');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,';

    csvContent += 'Student Grade Report\n';
    csvContent += `Student Name,${currentSelectedStudent.name}\n`;
    csvContent += `Student ID,${currentSelectedStudent.id}\n`;
    csvContent += `Generated Date,${new Date().toLocaleDateString()}\n\n`;

    csvContent += 'Subject,Letter Grade,Score,Status\n';

    Object.entries(studentGrades).forEach(([subjectId, gradeData]) => {
      const subjectName = gradeData.subject_name || getSubjectName(parseInt(subjectId));
      const score = parseFloat(gradeData.final_grade) || 0;
      const letterGrade = getLetterGrade(score);
      const status = score >= 75 ? 'Passed' : 'Failed';

      csvContent += `"${subjectName}","${letterGrade}",${score.toFixed(2)},"${status}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `grade_report_${currentSelectedStudent.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading grade report:', error);
    alert('Error downloading grade report. Please try again.');
  }
}
