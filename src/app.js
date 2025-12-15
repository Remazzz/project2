let currentUser = null;
let currentStudentId = null;
let currentSectionId = null;
let customInputCounter = 0;
let sections = [];
let students = [];
let grades = {};

async function initializeApp() {
  const authCheck = await checkAuth();

  if (!authCheck) {
    window.location.href = '/login.html';
    return;
  }

  currentUser = authCheck;

  initializeTheme();
  await initializeData();
  setupEventListeners();
}

async function checkAuth() {
  try {
    const response = await fetch('/api/check-auth', {
      credentials: 'include'
    });
    const data = await response.json();

    if (data.authenticated) {
      return data.user;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    return null;
  }
}

function initializeTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
}

async function initializeData() {
  try {
    const response = await fetch('/sections', {
      credentials: 'include'
    });

    if (response.ok) {
      sections = await response.json();
      loadSections();

      if (sections.length > 0) {
        currentSectionId = sections[0].id;
        document.getElementById('sectionSelect').value = currentSectionId;
        await loadStudents();
      }
    }
  } catch (error) {
    console.error('Failed to load initial data:', error);
  }
}

function setupEventListeners() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  const sectionSelect = document.getElementById('sectionSelect');
  if (sectionSelect) {
    sectionSelect.addEventListener('change', handleSectionChange);
  }

  const addSectionBtn = document.getElementById('addSectionBtn');
  if (addSectionBtn) {
    addSectionBtn.addEventListener('click', addSection);
  }

  const addStudentBtn = document.getElementById('addStudentBtn');
  if (addStudentBtn) {
    addStudentBtn.addEventListener('click', addStudent);
  }

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
  }

  const calculateBtn = document.getElementById('calculateBtn');
  if (calculateBtn) {
    calculateBtn.addEventListener('click', calculateGrade);
  }

  const saveBtn = document.getElementById('saveBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', saveGrade);
  }

  const addAssessmentBtn = document.getElementById('addAssessmentBtn');
  if (addAssessmentBtn) {
    addAssessmentBtn.addEventListener('click', addCustomInput);
  }
}

async function handleLogout() {
  try {
    const response = await fetch('/api/logout', {
      method: 'POST',
      credentials: 'include'
    });

    if (response.ok) {
      window.location.href = '/login.html';
    } else {
      alert('Failed to logout');
    }
  } catch (error) {
    console.error('Logout error:', error);
    alert('Failed to logout');
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';

  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}

function loadSections() {
  const sectionSelect = document.getElementById('sectionSelect');
  if (!sectionSelect) return;

  sectionSelect.innerHTML = '<option value="">Select Section</option>' +
    sections.map(section =>
      `<option value="${section.id}">${section.name}</option>`
    ).join('');

  if (currentSectionId) {
    sectionSelect.value = currentSectionId;
  }
}

async function addSection() {
  const sectionName = prompt('Enter section name:');
  if (!sectionName || sectionName.trim() === '') return;

  try {
    const response = await fetch('/sections', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ name: sectionName.trim() })
    });

    if (response.ok) {
      const data = await response.json();
      sections.push({ id: data.id, name: sectionName.trim() });
      loadSections();
      alert('Section added successfully!');
    } else {
      alert('Failed to add section');
    }
  } catch (error) {
    console.error('Failed to add section:', error);
    alert('Failed to add section');
  }
}

async function handleSectionChange(event) {
  currentSectionId = parseInt(event.target.value) || null;
  await loadStudents();
  clearForm();
  currentStudentId = null;
  updateSelectedStudentInfo();
}

async function loadStudents() {
  const studentsList = document.getElementById('studentsList');
  if (!studentsList || !currentSectionId) {
    if (studentsList) {
      studentsList.innerHTML = '<li style="padding: 1rem; text-align: center; color: var(--text-secondary);">Please select a section</li>';
    }
    return;
  }

  try {
    const response = await fetch(`/students/${currentSectionId}`, {
      credentials: 'include'
    });

    if (response.ok) {
      students = await response.json();

      if (students.length === 0) {
        studentsList.innerHTML = '<li style="padding: 1rem; text-align: center; color: var(--text-secondary);">No students in this section</li>';
        return;
      }

      studentsList.innerHTML = students.map(student => `
        <li class="student-item" data-student-id="${student.id}" onclick="window.selectStudent(${student.id}, '${student.name}')">
          <div class="student-avatar"></div>
          <span class="student-name">${student.name}</span>
          <button class="delete-student-btn" onclick="event.stopPropagation(); window.deleteStudent(${student.id})">×</button>
        </li>
      `).join('');
    }
  } catch (error) {
    console.error('Failed to load students:', error);
    studentsList.innerHTML = '<li style="padding: 1rem; text-align: center; color: var(--text-secondary);">Failed to load students</li>';
  }
}

async function addStudent() {
  if (!currentSectionId) {
    alert('Please select a section first');
    return;
  }

  const studentName = prompt('Enter student name:');
  if (!studentName || studentName.trim() === '') return;

  try {
    const response = await fetch('/students', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        name: studentName.trim(),
        sectionId: currentSectionId
      })
    });

    if (response.ok) {
      await loadStudents();
      alert('Student added successfully!');
    } else {
      alert('Failed to add student');
    }
  } catch (error) {
    console.error('Failed to add student:', error);
    alert('Failed to add student');
  }
}

async function deleteStudent(studentId) {
  if (!confirm('Are you sure you want to delete this student?')) return;

  try {
    const response = await fetch(`/students/${studentId}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (response.ok) {
      await loadStudents();

      if (currentStudentId === studentId) {
        currentStudentId = null;
        clearForm();
        updateSelectedStudentInfo();
      }

      alert('Student deleted successfully!');
    } else {
      alert('Failed to delete student');
    }
  } catch (error) {
    console.error('Failed to delete student:', error);
    alert('Failed to delete student');
  }
}

function selectStudent(studentId, studentName) {
  currentStudentId = studentId;

  document.querySelectorAll('.student-item').forEach(item => {
    item.classList.remove('active');
  });

  const selectedItem = document.querySelector(`.student-item[data-student-id="${studentId}"]`);
  if (selectedItem) {
    selectedItem.classList.add('active');
  }

  updateSelectedStudentInfo(studentName);
  loadStudentGrades(studentId);
}

function updateSelectedStudentInfo(studentName = null) {
  const infoElement = document.getElementById('selectedStudentInfo');
  if (infoElement) {
    infoElement.textContent = studentName ? `Selected: ${studentName}` : 'No student selected';
  }
}

async function loadStudentGrades(studentId) {
  clearForm();

  try {
    const response = await fetch(`/grades/${studentId}`, {
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();

      if (data.grades) {
        document.getElementById('classParticipation').value = data.grades.class_participation || '';
        document.getElementById('attendance').value = data.grades.attendance || '';
        document.getElementById('quiz1').value = data.grades.quiz1_score || '';
        document.getElementById('quiz2').value = data.grades.quiz2_score || '';
        document.getElementById('finalExam').value = data.grades.final_exam_score || '';
        document.getElementById('labGrade').value = data.grades.lab_grade || '';

        if (data.grades.final_grade) {
          document.getElementById('calculatedGrade').textContent = data.grades.final_grade;
        }
      }
    }
  } catch (error) {
    console.error('Failed to load student grades:', error);
  }
}

function handleSearch(event) {
  const searchTerm = event.target.value.toLowerCase();
  const studentItems = document.querySelectorAll('.student-item');

  studentItems.forEach(item => {
    const name = item.querySelector('.student-name')?.textContent.toLowerCase() || '';
    if (name.includes(searchTerm)) {
      item.style.display = 'flex';
    } else {
      item.style.display = 'none';
    }
  });
}

function addCustomInput() {
  const container = document.getElementById('customInputsContainer');
  if (!container) return;

  customInputCounter++;
  const inputId = `custom-input-${customInputCounter}`;

  const customInputHTML = `
    <div class="custom-input-field" id="${inputId}">
      <button type="button" class="remove-btn" onclick="window.removeCustomInput('${inputId}')">×</button>
      <label class="form-label">Assessment ${customInputCounter}</label>
      <input type="text" class="form-input" placeholder="Enter score" data-input-id="${inputId}">
    </div>
  `;

  container.insertAdjacentHTML('beforeend', customInputHTML);
}

function removeCustomInput(inputId) {
  const element = document.getElementById(inputId);
  if (element) {
    element.remove();
  }
}

function calculateGrade() {
  if (!currentStudentId) {
    alert('Please select a student first');
    return;
  }

  const classParticipation = parseFloat(document.getElementById('classParticipation')?.value) || 0;
  const attendance = parseFloat(document.getElementById('attendance')?.value) || 0;
  const quiz1 = parseFloat(document.getElementById('quiz1')?.value) || 0;
  const quiz2 = parseFloat(document.getElementById('quiz2')?.value) || 0;
  const finalExam = parseFloat(document.getElementById('finalExam')?.value) || 0;
  const labGrade = parseFloat(document.getElementById('labGrade')?.value) || 0;

  const grade = (
    (classParticipation * 0.15) +
    (attendance * 0.10) +
    (quiz1 * 0.15) +
    (quiz2 * 0.15) +
    (finalExam * 0.30) +
    (labGrade * 0.15)
  );

  const roundedGrade = Math.round(grade * 100) / 100;

  const gradeDisplay = document.getElementById('calculatedGrade');
  if (gradeDisplay) {
    gradeDisplay.textContent = roundedGrade.toFixed(2);
  }
}

async function saveGrade() {
  if (!currentStudentId) {
    alert('Please select a student first');
    return;
  }

  const gradeDisplay = document.getElementById('calculatedGrade');
  if (!gradeDisplay || gradeDisplay.textContent === '--') {
    alert('Please calculate the grade first');
    return;
  }

  const gradeData = {
    studentId: currentStudentId,
    classParticipation: parseFloat(document.getElementById('classParticipation')?.value) || 0,
    attendance: parseFloat(document.getElementById('attendance')?.value) || 0,
    quiz1Score: parseFloat(document.getElementById('quiz1')?.value) || 0,
    quiz1Total: 100,
    quiz2Score: parseFloat(document.getElementById('quiz2')?.value) || 0,
    quiz2Total: 100,
    finalExamScore: parseFloat(document.getElementById('finalExam')?.value) || 0,
    finalExamTotal: 100,
    labGrade: parseFloat(document.getElementById('labGrade')?.value) || 0,
    finalGrade: parseFloat(gradeDisplay.textContent),
    letterGrade: getLetterGrade(parseFloat(gradeDisplay.textContent)),
    status: 'completed'
  };

  try {
    const response = await fetch('/grades', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(gradeData)
    });

    if (response.ok) {
      alert('Grade saved successfully!');
    } else {
      alert('Failed to save grade');
    }
  } catch (error) {
    console.error('Failed to save grade:', error);
    alert('Failed to save grade');
  }
}

function getLetterGrade(grade) {
  if (grade >= 90) return 'A';
  if (grade >= 80) return 'B';
  if (grade >= 70) return 'C';
  if (grade >= 60) return 'D';
  return 'F';
}

function clearForm() {
  const form = document.getElementById('gradingForm');
  if (form) {
    const inputs = form.querySelectorAll('input[type="text"]');
    inputs.forEach(input => input.value = '');
  }

  const gradeDisplay = document.getElementById('calculatedGrade');
  if (gradeDisplay) {
    gradeDisplay.textContent = '--';
  }

  const customInputsContainer = document.getElementById('customInputsContainer');
  if (customInputsContainer) {
    customInputsContainer.innerHTML = '';
  }

  customInputCounter = 0;
}

window.selectStudent = selectStudent;
window.deleteStudent = deleteStudent;
window.removeCustomInput = removeCustomInput;

initializeApp();
