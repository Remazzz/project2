let currentStudentId = null;
let currentSectionId = null;
let currentSubjectId = null;
let customInputCounter = 0;
let sections = [];
let students = [];
let subjects = [];
let customInputs = [];

document.addEventListener('DOMContentLoaded', () => {
  initializeTheme();
  initializeSubjects();
  initializeData();
  setupEventListeners();
});

function initializeTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
}

async function initializeData() {
  try {
    await loadSectionsFromAPI();
    console.log('Sections loaded:', sections);
    await loadCustomInputsFromAPI();
    // Load all students from all sections
    if (sections.length > 0) {
      for (const section of sections) {
        await loadStudentsFromAPI(section.id);
      }
    }
    console.log('All students loaded:', students);
    console.log('Students by sectionId:', students.reduce((acc, s) => {
      acc[s.sectionId] = (acc[s.sectionId] || 0) + 1;
      return acc;
    }, {}));
    // Set currentSectionId to null to show all students initially
    currentSectionId = null;
    loadStudents();
  } catch (error) {
    console.error('Error initializing data:', error);
    alert('Error loading data from server. Please check your connection.');
  }
}

function setupEventListeners() {
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

  const addSubjectBtn = document.getElementById('addSubjectBtn');
  if (addSubjectBtn) {
    addSubjectBtn.addEventListener('click', addSubject);
  }

  const subjectSelect = document.getElementById('subjectSelect');
  if (subjectSelect) {
    subjectSelect.addEventListener('change', (e) => {
      if (e.target.value) {
        currentSubjectId = parseInt(e.target.value);
        loadSubjects();
        if (currentStudentId) {
          loadStudentGrades(currentStudentId);
        }
      }
    });
  }

  const deleteGradeBtn = document.getElementById('deleteGradeBtn');
  if (deleteGradeBtn) {
    deleteGradeBtn.addEventListener('click', deleteGrade);
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
    sections.map(section => {
      let displayName = section.name;
      if (section.id === 1) {
        displayName = 'Section A';
      } else if (section.id === 2) {
        displayName = 'Section B';
      }
      return `<option value="${section.id}">${displayName}</option>`;
    }).join('');
}

async function addSection() {
  const sectionName = prompt('Enter section name:');
  if (!sectionName || sectionName.trim() === '') return;

  try {
    const result = await addSectionToAPI(sectionName.trim());
    sections.push(result);
    loadSections();
    alert('Section added successfully!');
  } catch (error) {
    alert('Error adding section: ' + error.message);
  }
}

function handleSectionChange(event) {
  console.log('handleSectionChange called with event.target.value:', event.target.value);
  currentSectionId = parseInt(event.target.value) || null;
  console.log('currentSectionId set to:', currentSectionId);
  clearForm();
  loadStudents();
  currentStudentId = null;
  updateSelectedStudentInfo();
}

function loadStudents() {
  console.log('loadStudents called with currentSectionId:', currentSectionId);
  console.log('Students array (first 3):', students.slice(0, 3));

  const studentsList = document.getElementById('studentsList');
  if (!studentsList) return;

  const filteredStudents = currentSectionId
    ? students.filter(s => s.sectionId === currentSectionId)
    : students;

  console.log('Filtered students length:', filteredStudents.length);
  console.log('Filtered students (first 3):', filteredStudents.slice(0, 3));

  // Targeted logging for Section A and B
  if (currentSectionId === 1 || currentSectionId === 2) {
    console.log(`Section ${currentSectionId === 1 ? 'A' : 'B'} filtering details:`);
    console.log('All students with sectionId 1 or 2:', students.filter(s => s.sectionId === 1 || s.sectionId === 2));
    console.log(`Students with sectionId ${currentSectionId}:`, students.filter(s => s.sectionId === currentSectionId));
    console.log(`Type of currentSectionId: ${typeof currentSectionId}, value: ${currentSectionId}`);
    students.forEach(s => {
      if (s.sectionId === 1 || s.sectionId === 2) {
        console.log(`Student ${s.name} has sectionId ${s.sectionId} (type: ${typeof s.sectionId})`);
      }
    });
  }

  if (filteredStudents.length === 0) {
    studentsList.innerHTML = '<li style="padding: 1rem; text-align: center; color: var(--text-secondary);">No students in this section</li>';
    return;
  }

  studentsList.innerHTML = filteredStudents.map(student => `
    <li class="student-item" data-student-id="${student.id}" onclick="selectStudent(${student.id}, '${student.name}')">
      <div class="student-avatar"></div>
      <span class="student-name">${student.name}</span>
      <button class="delete-student-btn" onclick="event.stopPropagation(); deleteStudent(${student.id})">×</button>
    </li>
  `).join('');

  console.log('studentsList.innerHTML updated');
}

async function addStudent() {
  if (!currentSectionId) {
    alert('Please select a section first');
    return;
  }

  const studentName = prompt('Enter student name:');
  if (!studentName || studentName.trim() === '') return;

  try {
    const result = await addStudentToAPI(studentName.trim(), currentSectionId);
    students.push(result);
    loadStudents();
    alert('Student added successfully!');
  } catch (error) {
    alert('Error adding student: ' + error.message);
  }
}

async function deleteStudent(studentId) {
  if (!confirm('Are you sure you want to delete this student?')) return;

  try {
    await deleteStudentFromAPI(studentId);
    students = students.filter(s => s.id !== studentId);

    loadStudents();

    if (currentStudentId === studentId) {
      currentStudentId = null;
      clearForm();
      updateSelectedStudentInfo();
    }

    alert('Student deleted successfully!');
  } catch (error) {
    alert('Error deleting student: ' + error.message);
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
    if (!response.ok) throw new Error('Failed to load grades');
    const gradesData = await response.json();

    if (gradesData && gradesData[currentSubjectId]) {
      const grade = gradesData[currentSubjectId];
      document.getElementById('classParticipation').value = grade.classParticipation || '';
      document.getElementById('attendance').value = grade.attendance || '';
      document.getElementById('quiz1Score').value = grade.quiz1Score || '';
      document.getElementById('quiz1Total').value = grade.quiz1Total || '100';
      document.getElementById('quiz2Score').value = grade.quiz2Score || '';
      document.getElementById('quiz2Total').value = grade.quiz2Total || '100';
      document.getElementById('finalExamScore').value = grade.finalExamScore || '';
      document.getElementById('finalExamTotal').value = grade.finalExamTotal || '100';
      document.getElementById('labScore').value = grade.labScore || '';
      document.getElementById('labTotal').value = grade.labTotal || '100';

      if (grade.customInputs && grade.customInputs.length > 0) {
        grade.customInputs.forEach(input => {
          addCustomInput();
          const container = document.getElementById('customInputsContainer');
          const lastInput = container.lastElementChild;
          if (lastInput) {
            const inputField = lastInput.querySelector('.form-input');
            const labelField = lastInput.querySelector('.form-label');
            if (inputField) inputField.value = input.value || '';
            if (labelField) labelField.textContent = input.label || `Assessment ${customInputCounter}`;
          }
        });
      }

      if (grade.finalGrade) {
        document.getElementById('calculatedGrade').textContent = grade.finalGrade;
      }
    }
  } catch (error) {
    console.error('Error loading student grades:', error);
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
      <button type="button" class="remove-btn" onclick="removeCustomInput('${inputId}')">×</button>
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

  if (!currentSubjectId) {
    alert('Please select a subject first');
    return;
  }

  const classParticipation = parseFloat(document.getElementById('classParticipation')?.value) || 0;
  const attendance = parseFloat(document.getElementById('attendance')?.value) || 0;

  const quiz1Score = parseFloat(document.getElementById('quiz1Score')?.value) || 0;
  const quiz1Total = parseFloat(document.getElementById('quiz1Total')?.value) || 1;
  const quiz1Percentage = (quiz1Score / quiz1Total) * 100;

  const quiz2Score = parseFloat(document.getElementById('quiz2Score')?.value) || 0;
  const quiz2Total = parseFloat(document.getElementById('quiz2Total')?.value) || 1;
  const quiz2Percentage = (quiz2Score / quiz2Total) * 100;

  const finalExamScore = parseFloat(document.getElementById('finalExamScore')?.value) || 0;
  const finalExamTotal = parseFloat(document.getElementById('finalExamTotal')?.value) || 1;
  const finalExamPercentage = (finalExamScore / finalExamTotal) * 100;

  const labScore = parseFloat(document.getElementById('labScore')?.value) || 0;
  const labTotal = parseFloat(document.getElementById('labTotal')?.value) || 1;
  const labPercentage = (labScore / labTotal) * 100;

  const grade = (
    (classParticipation * 0.15) +
    (attendance * 0.10) +
    (quiz1Percentage * 0.15) +
    (quiz2Percentage * 0.15) +
    (finalExamPercentage * 0.30) +
    (labPercentage * 0.15)
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

  if (!currentSubjectId) {
    alert('Please select a subject first');
    return;
  }

  const gradeDisplay = document.getElementById('calculatedGrade');
  if (!gradeDisplay || gradeDisplay.textContent === '--') {
    alert('Please calculate the grade first');
    return;
  }

  const customInputs = [];
  const customInputElements = document.querySelectorAll('.custom-input-field');
  customInputElements.forEach((element, index) => {
    const input = element.querySelector('.form-input');
    const label = element.querySelector('.form-label');
    if (input && label) {
      customInputs.push({
        label: label.textContent,
        value: input.value
      });
    }
  });

  const gradeData = {
    subjectId: currentSubjectId,
    classParticipation: document.getElementById('classParticipation')?.value || '',
    attendance: document.getElementById('attendance')?.value || '',
    quiz1Score: document.getElementById('quiz1Score')?.value || '',
    quiz1Total: document.getElementById('quiz1Total')?.value || '100',
    quiz2Score: document.getElementById('quiz2Score')?.value || '',
    quiz2Total: document.getElementById('quiz2Total')?.value || '100',
    finalExamScore: document.getElementById('finalExamScore')?.value || '',
    finalExamTotal: document.getElementById('finalExamTotal')?.value || '100',
    labScore: document.getElementById('labScore')?.value || '',
    labTotal: document.getElementById('labTotal')?.value || '100',
    customInputs: customInputs,
    finalGrade: gradeDisplay.textContent,
    subjectName: getSubjectName(currentSubjectId)
  };

  try {
    await saveGradeToAPI(currentStudentId, gradeData);
    alert(`Grade saved successfully for ${getSubjectName(currentSubjectId)}!`);
  } catch (error) {
    alert('Error saving grade: ' + error.message);
  }
}

async function deleteGrade() {
  if (!currentStudentId) {
    alert('Please select a student first');
    return;
  }

  if (!currentSubjectId) {
    alert('Please select a subject first');
    return;
  }

  if (!confirm('Are you sure you want to delete this grade? This action cannot be undone.')) {
    return;
  }

  try {
    await deleteGradeToAPI(currentStudentId, currentSubjectId);
    clearForm();
    alert('Grade deleted successfully!');
  } catch (error) {
    alert('Error deleting grade: ' + error.message);
  }
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

function initializeSubjects() {
  // Initialize with default subjects if none exist
  if (subjects.length === 0) {
    subjects = [
      { id: 1, name: 'Mathematics' },
      { id: 2, name: 'Science' },
      { id: 3, name: 'English' },
      { id: 4, name: 'History' }
    ];
  }
  loadSubjects();
}

function loadSubjects() {
  const subjectSelect = document.getElementById('subjectSelect');
  if (!subjectSelect) return;

  subjectSelect.innerHTML = '<option value="">Select Subject</option>' +
    subjects.map(subject =>
      `<option value="${subject.id}">${subject.name}</option>`
    ).join('');
}

function getSubjectName(subjectId) {
  const subject = subjects.find(s => s.id === subjectId);
  return subject ? subject.name : 'Unknown Subject';
}

async function addSubject() {
  const subjectName = prompt('Enter subject name:');
  if (!subjectName || subjectName.trim() === '') return;

  // Check if subject already exists
  if (subjects.some(s => s.name.toLowerCase() === subjectName.trim().toLowerCase())) {
    alert('Subject already exists!');
    return;
  }

  const newId = subjects.length > 0 ? Math.max(...subjects.map(s => s.id)) + 1 : 1;
  subjects.push({ id: newId, name: subjectName.trim() });
  loadSubjects();
  alert('Subject added successfully!');
}

// API Functions
async function loadSectionsFromAPI() {
  try {
    const response = await fetch('/sections', {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to load sections');
    sections = await response.json();
    loadSections();
  } catch (error) {
    console.error('Error loading sections:', error);
    throw error;
  }
}

async function loadStudentsFromAPI(sectionId) {
  try {
    const response = await fetch(`/students/${sectionId}`, {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to load students');
    const studentsData = await response.json();
    // Ensure each student has the correct sectionId
    const studentsWithSectionId = studentsData.map(student => ({
      ...student,
      sectionId: sectionId
    }));
    students.push(...studentsWithSectionId);
  } catch (error) {
    console.error('Error loading students:', error);
    throw error;
  }
}

async function loadStudentGradesFromAPI(studentId) {
  try {
    const response = await fetch(`/grades/${studentId}`, {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to load grades');
    const gradesData = await response.json();
    // Process grades data and populate the form
    if (gradesData && gradesData[currentSubjectId]) {
      const grade = gradesData[currentSubjectId];
      document.getElementById('classParticipation').value = grade.classParticipation || '';
      document.getElementById('attendance').value = grade.attendance || '';
      document.getElementById('quiz1Score').value = grade.quiz1Score || '';
      document.getElementById('quiz1Total').value = grade.quiz1Total || '100';
      document.getElementById('quiz2Score').value = grade.quiz2Score || '';
      document.getElementById('quiz2Total').value = grade.quiz2Total || '100';
      document.getElementById('finalExamScore').value = grade.finalExamScore || '';
      document.getElementById('finalExamTotal').value = grade.finalExamTotal || '100';
      document.getElementById('labScore').value = grade.labScore || '';
      document.getElementById('labTotal').value = grade.labTotal || '100';

      if (grade.finalGrade) {
        document.getElementById('calculatedGrade').textContent = grade.finalGrade;
      }
    }
  } catch (error) {
    console.error('Error loading student grades:', error);
  }
}

async function loadCustomInputsFromAPI() {
  try {
    const response = await fetch('/custom-inputs', {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to load custom inputs');
    customInputs = await response.json();
  } catch (error) {
    console.error('Error loading custom inputs:', error);
  }
}

async function addSectionToAPI(sectionName) {
  try {
    const response = await fetch('/sections', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ name: sectionName })
    });
    if (!response.ok) throw new Error('Failed to add section');
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error adding section:', error);
    throw error;
  }
}

async function addStudentToAPI(studentName, sectionId) {
  try {
    const response = await fetch('/students', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ name: studentName, sectionId })
    });
    if (!response.ok) throw new Error('Failed to add student');
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error adding student:', error);
    throw error;
  }
}

async function deleteStudentFromAPI(studentId) {
  try {
    const response = await fetch(`/students/${studentId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to delete student');
    return true;
  } catch (error) {
    console.error('Error deleting student:', error);
    throw error;
  }
}

async function saveGradeToAPI(studentId, gradeData) {
  try {
    const response = await fetch('/grades', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ studentId, ...gradeData })
    });
    if (!response.ok) throw new Error('Failed to save grade');
    return await response.json();
  } catch (error) {
    console.error('Error saving grade:', error);
    throw error;
  }
}

async function deleteGradeToAPI(studentId, subjectId) {
  try {
    const response = await fetch(`/grades/${studentId}/${subjectId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to delete grade');
    return true;
  } catch (error) {
    console.error('Error deleting grade:', error);
    throw error;
  }
}
