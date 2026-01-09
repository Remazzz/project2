// Students don't need to load subjects list - they only see their own grades
// Subjects are handled in the grades data response

function setupEventListeners() {
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

function showError(message) {
  console.error(message);
  // You could implement a more sophisticated error display here
  alert(message);
}

async function loadStudentGrades(userId) {
  try {
    // First, get the student's own info to get their student ID
    const studentInfoResponse = await fetch('/api/my-student-info', {
      credentials: 'include'
    });

    if (!studentInfoResponse.ok) {
      console.error('Failed to fetch student info');
      document.getElementById('gradesContainer').innerHTML =
        '<p class="no-data-message">Failed to load student information. Please try again.</p>';
      return;
    }

    const student = await studentInfoResponse.json();

    // Update student info
    updateStudentInfo(student);

    // Now fetch grades using the actual student ID
    const gradesResponse = await fetch(`/grades/${student.id}`, {
      credentials: 'include'
    });

    if (gradesResponse.ok) {
      const gradesData = await gradesResponse.json();
      const studentGrades = gradesData.grades || {};

      if (Object.keys(studentGrades).length === 0) {
        document.getElementById('gradesContainer').innerHTML =
          '<p class="no-data-message">No Records Yet.</p>';
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

  if (nameEl) nameEl.textContent = student.name || 'Student';
  if (idEl) idEl.textContent = `ID: ${student.id || 'N/A'}`;

  if (sectionEl) {
    const sectionName = student.section_name || 'N/A';
    sectionEl.textContent = `Section: ${sectionName}`;
  }

  if (avatarEl) {
    const initials = student.name
      ? student.name.split(' ').map(n => n[0]).join('').toUpperCase()
      : 'ST';
    avatarEl.textContent = initials;
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
  try {
    // First, get the student's own info to get their student ID
    const studentInfoResponse = await fetch('/api/my-student-info', {
      credentials: 'include'
    });

    if (!studentInfoResponse.ok) {
      alert('Failed to fetch student information');
      return;
    }

    const student = await studentInfoResponse.json();

    // Now fetch grades using the actual student ID
    const response = await fetch(`/grades/${student.id}`, {
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
    csvContent += `Student Name,${document.getElementById('studentName').textContent}\n`;
    csvContent += `Student ID,${student.id}\n`;
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
    link.setAttribute('download', `grade_report_${document.getElementById('studentName').textContent.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading grade report:', error);
    alert('Error downloading grade report. Please try again.');
  }
}
