let allStudents = [];
let allGrades = {};
let currentSelectedStudent = null;

document.addEventListener('DOMContentLoaded', () => {
  initializeTheme();
  initializeStudentView();
  setupEventListeners();
});

function initializeTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
}

function initializeStudentView() {
  const savedStudents = localStorage.getItem('students');
  const savedGrades = localStorage.getItem('grades');

  if (savedStudents) {
    allStudents = JSON.parse(savedStudents);
  }

  if (savedGrades) {
    allGrades = JSON.parse(savedGrades);
  }

  loadStudentsList();
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

function displayStudentGrades(studentId) {
  currentSelectedStudent = allStudents.find(s => s.id === studentId);

  if (!currentSelectedStudent) {
    document.getElementById('gradesContainer').innerHTML =
      '<p class="no-data-message">Student not found</p>';
    return;
  }

  updateStudentInfo(currentSelectedStudent);

  const studentGrades = allGrades[studentId] || {};

  if (Object.keys(studentGrades).length === 0) {
    document.getElementById('gradesContainer').innerHTML =
      '<p class="no-data-message">No grades available for this student</p>';
    return;
  }

  renderGradesTable(studentGrades);
}

function updateStudentInfo(student) {
  const nameEl = document.getElementById('studentName');
  const idEl = document.getElementById('studentId');
  const sectionEl = document.getElementById('studentSection');
  const avatarEl = document.querySelector('.student-avatar-large');

  if (nameEl) nameEl.textContent = student.name;
  if (idEl) idEl.textContent = `ID: ${student.id}`;

  const section = allStudents.find(s => s.id === student.id)?.sectionId;
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
    const subjectName = gradeData.subjectName || getSubjectName(parseInt(subjectId));
    const score = parseFloat(gradeData.finalGrade) || 0;
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

function downloadGradeReport() {
  if (!currentSelectedStudent) {
    alert('Please select a student first');
    return;
  }

  const studentGrades = allGrades[currentSelectedStudent.id] || {};

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
    const subjectName = gradeData.subjectName || getSubjectName(parseInt(subjectId));
    const score = parseFloat(gradeData.finalGrade) || 0;
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
}
