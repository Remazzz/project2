let currentStudentId = null;
let currentSectionId = null;
let currentSubjectId = null;
let customInputCounter = 0;
let sections = [];
let students = [];
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
    // Load all students at once to avoid duplicates
    await loadAllStudentsFromAPI();
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
    addStudentBtn.addEventListener('click', changeSection);
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

  // Change section event listeners
  const sectionSearchInput = document.getElementById('sectionSearchInput');
  if (sectionSearchInput) {
    sectionSearchInput.addEventListener('input', handleSectionSearch);
  }

  const sectionSearchBtn = document.getElementById('sectionSearchBtn');
  if (sectionSearchBtn) {
    sectionSearchBtn.addEventListener('click', () => {
      const searchTerm = document.getElementById('sectionSearchInput').value;
      populateSectionStudentList(searchTerm);
    });
  }

  const cancelSectionBtn = document.getElementById('cancelSectionBtn');
  if (cancelSectionBtn) {
    cancelSectionBtn.addEventListener('click', closeSection);
  }

  const changeSectionBtn = document.getElementById('changeSectionBtn');
  if (changeSectionBtn) {
    changeSectionBtn.addEventListener('click', changeSelectedStudentSection);
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
        displayName = 'Assign Section';
      } else if (section.id === 2) {
        displayName = 'Section A';
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

async function changeSection() {
  console.log('changeSection called');

  // Show the change section section
  const section = document.getElementById('changeSectionSection');
  if (section) {
    section.style.display = 'block';
    populateSectionStudentList();
    populateSectionSelect();
    console.log('Change section section shown and populated');

    // Ensure the change button is disabled when section opens
    const changeBtn = document.getElementById('changeSectionBtn');
    if (changeBtn) {
      changeBtn.disabled = true;
    }
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

  if (!currentSubjectId) {
    return; // No subject selected, nothing to load
  }

  try {
    const response = await fetch(`/grades/${studentId}`, {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to load grades');
    const gradesData = await response.json();

    if (gradesData && gradesData.grades && gradesData.grades[currentSubjectId]) {
      const grade = gradesData.grades[currentSubjectId];
      document.getElementById('classParticipation').value = grade.class_participation || '';
      document.getElementById('attendance').value = grade.attendance || '';
      document.getElementById('quiz1Score').value = grade.quiz1_score || '';
      document.getElementById('quiz1Total').value = grade.quiz1_total || '100';
      document.getElementById('quiz2Score').value = grade.quiz2_score || '';
      document.getElementById('quiz2Total').value = grade.quiz2_total || '100';
      document.getElementById('finalExamScore').value = grade.final_exam_score || '';
      document.getElementById('finalExamTotal').value = grade.final_exam_total || '100';
      document.getElementById('labScore').value = grade.lab_score || '';
      document.getElementById('labTotal').value = grade.lab_total || '100';

      // Handle custom assessments stored as JSON
      if (grade.custom_assessments) {
        let customAssessments;
        try {
          customAssessments = JSON.parse(grade.custom_assessments);
        } catch (e) {
          customAssessments = [];
        }

        if (customAssessments && customAssessments.length > 0) {
          customAssessments.forEach(assessment => {
            addCustomInput();
            const container = document.getElementById('customInputsContainer');
            const lastInput = container.lastElementChild;
            if (lastInput) {
              const inputField = lastInput.querySelector('.form-input');
              const labelField = lastInput.querySelector('.form-label');
              if (inputField) inputField.value = assessment.value || '';
              if (labelField) labelField.textContent = assessment.label || `Assessment ${customInputCounter}`;
            }
          });
        }
      }

      if (grade.final_grade) {
        document.getElementById('calculatedGrade').textContent = grade.final_grade;
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

function handleModalSearch(event) {
  const searchTerm = event.target.value;
  populateModalStudentList(searchTerm);
}

function populateModalStudentList(searchTerm = '') {
  const modalStudentList = document.getElementById('modalStudentList');
  if (!modalStudentList) return;

  // Show all students for section change
  const allStudents = students;

  // Apply search filter
  const filteredStudents = allStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filteredStudents.length === 0) {
    modalStudentList.innerHTML = '<div style="padding: 1rem; text-align: center; color: var(--text-secondary);">No students found</div>';
    return;
  }

  modalStudentList.innerHTML = filteredStudents.map(student => `
    <div class="modal-student-item" data-student-id="${student.id}" onclick="selectModalStudent(${student.id})">
      <div class="student-avatar"></div>
      <span class="student-name">${student.name}</span>
    </div>
  `).join('');
}

function populateModalSectionSelect() {
  const modalSectionSelect = document.getElementById('modalSectionSelect');
  if (!modalSectionSelect) return;

  modalSectionSelect.innerHTML = '<option value="">Select Section</option>' +
    sections.map(section => {
      let displayName = section.name;
      if (section.id === 1) {
        displayName = 'Assign Section';
      } else if (section.id === 2) {
        displayName = 'Section A';
      }
      return `<option value="${section.id}">${displayName}</option>`;
    }).join('');
}

let selectedModalStudentId = null;

function selectModalStudent(studentId) {
  selectedModalStudentId = studentId;

  // Remove active class from all modal student items
  document.querySelectorAll('.modal-student-item').forEach(item => {
    item.classList.remove('active');
  });

  // Add active class to selected student
  const selectedItem = document.querySelector(`.modal-student-item[data-student-id="${studentId}"]`);
  if (selectedItem) {
    selectedItem.classList.add('active');
  }

  // Enable/disable the add button based on selection
  const addBtn = document.getElementById('addSelectedStudentBtn');
  if (addBtn) {
    addBtn.disabled = !selectedModalStudentId;
  }
}

function closeModal() {
  const modal = document.getElementById('addStudentModal');
  if (modal) {
    modal.style.display = 'none';
  }
  selectedModalStudentId = null;

  // Disable the add button when modal is closed
  const addBtn = document.getElementById('addSelectedStudentBtn');
  if (addBtn) {
    addBtn.disabled = true;
  }
}

async function addSelectedStudentToSection() {
  if (!selectedModalStudentId) {
    alert('Please select a student from the list');
    return;
  }

  const modalSectionSelect = document.getElementById('modalSectionSelect');
  const newSectionId = parseInt(modalSectionSelect.value);

  if (!newSectionId) {
    alert('Please select a section');
    return;
  }

  try {
    await addStudentToSectionAPI(selectedModalStudentId, newSectionId);

    // Update the student's sectionId in the local array
    const student = students.find(s => s.id === selectedModalStudentId);
    if (student) {
      student.sectionId = newSectionId;
    }

    // Close the modal
    closeModal();

    // Refresh the student list
    loadStudents();

    alert('Student section changed successfully!');
  } catch (error) {
    alert('Error changing student section: ' + error.message);
  }
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
  const quiz1Percentage = quiz1Total === 0 ? 0 : (quiz1Score / quiz1Total) * 100;

  const quiz2Score = parseFloat(document.getElementById('quiz2Score')?.value) || 0;
  const quiz2Total = parseFloat(document.getElementById('quiz2Total')?.value) || 1;
  const quiz2Percentage = quiz2Total === 0 ? 0 : (quiz2Score / quiz2Total) * 100;

  const finalExamScore = parseFloat(document.getElementById('finalExamScore')?.value) || 0;
  const finalExamTotal = parseFloat(document.getElementById('finalExamTotal')?.value) || 1;
  const finalExamPercentage = finalExamTotal === 0 ? 0 : (finalExamScore / finalExamTotal) * 100;

  const labScore = parseFloat(document.getElementById('labScore')?.value) || 0;
  const labTotal = parseFloat(document.getElementById('labTotal')?.value) || 1;
  const labPercentage = labTotal === 0 ? 0 : (labScore / labTotal) * 100;

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

  // Calculate letter grade based on final grade
  const finalGrade = parseFloat(gradeDisplay.textContent);
  let letterGrade = 'F';
  if (finalGrade >= 90) letterGrade = 'A';
  else if (finalGrade >= 80) letterGrade = 'B';
  else if (finalGrade >= 70) letterGrade = 'C';
  else if (finalGrade >= 60) letterGrade = 'D';

  // Helper function to safely parse float values
  const safeParseFloat = (value, defaultValue = 0) => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  };

  const gradeData = {
    classParticipation: safeParseFloat(document.getElementById('classParticipation')?.value, 0),
    attendance: safeParseFloat(document.getElementById('attendance')?.value, 0),
    quiz1Score: safeParseFloat(document.getElementById('quiz1Score')?.value, 0),
    quiz1Total: safeParseFloat(document.getElementById('quiz1Total')?.value, 100),
    quiz2Score: safeParseFloat(document.getElementById('quiz2Score')?.value, 0),
    quiz2Total: safeParseFloat(document.getElementById('quiz2Total')?.value, 100),
    finalExamScore: safeParseFloat(document.getElementById('finalExamScore')?.value, 0),
    finalExamTotal: safeParseFloat(document.getElementById('finalExamTotal')?.value, 100),
    labScore: safeParseFloat(document.getElementById('labScore')?.value, 0),
    labTotal: safeParseFloat(document.getElementById('labTotal')?.value, 100),
    customInputs: customInputs,
    finalGrade: finalGrade,
    letterGrade: letterGrade,
    status: 'completed'
  };

  // Validate that totals are not zero to prevent division by zero
  if (gradeData.quiz1Total === 0) gradeData.quiz1Total = 100;
  if (gradeData.quiz2Total === 0) gradeData.quiz2Total = 100;
  if (gradeData.finalExamTotal === 0) gradeData.finalExamTotal = 100;
  if (gradeData.labTotal === 0) gradeData.labTotal = 100;

  try {
    await saveGradeToAPI(currentStudentId, currentSubjectId, gradeData);
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

async function initializeSubjects() {
  try {
    await loadSubjectsFromAPI();
    loadSubjects();
  } catch (error) {
    console.error('Failed to load subjects from API, using defaults:', error);
    // Fallback to default subjects if API fails
    subjects = [
      { id: 1, name: 'Mathematics' },
      { id: 2, name: 'Science' },
      { id: 3, name: 'English' },
      { id: 4, name: 'History' }
    ];
    loadSubjects();
  }
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

  try {
    await addSubjectToAPI(subjectName.trim());
    loadSubjects();
    alert('Subject added successfully!');
  } catch (error) {
    alert('Error adding subject: ' + error.message);
  }
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

async function loadAllStudentsFromAPI() {
  try {
    const response = await fetch('/students', {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to load all students');
    const studentsData = await response.json();
    // Map section_id to sectionId for consistency with code expectations
    students = studentsData.map(student => ({
      ...student,
      sectionId: student.section_id
    }));
  } catch (error) {
    console.error('Error loading all students:', error);
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

async function saveGradeToAPI(studentId, subjectId, gradeData) {
  try {
    const response = await fetch('/grades', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ studentId, subjectId, ...gradeData })
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

// Subjects API Functions
async function loadSubjectsFromAPI() {
  try {
    const response = await fetch('/subjects', {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to load subjects');
    subjects = await response.json();
    console.log('Subjects loaded from API:', subjects);
    return subjects;
  } catch (error) {
    console.error('Error loading subjects:', error);
    throw error;
  }
}

async function addSubjectToAPI(subjectName, teacherId = null) {
  try {
    const response = await fetch('/subjects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ name: subjectName, teacherId })
    });
    if (!response.ok) throw new Error('Failed to add subject');
    const result = await response.json();
    subjects.push(result);
    return result;
  } catch (error) {
    console.error('Error adding subject:', error);
    throw error;
  }
}

async function addStudentToSectionAPI(studentId, sectionId) {
  try {
    const response = await fetch('/students/add-to-section', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ studentId, sectionId })
    });
    if (!response.ok) throw new Error('Failed to add student to section');
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error adding student to section:', error);
    throw error;
  }
}

// Change section functions
function handleSectionSearch(event) {
  const searchTerm = event.target.value;
  populateSectionStudentList(searchTerm);
}

function populateSectionStudentList(searchTerm = '') {
  const sectionStudentList = document.getElementById('changeSectionStudentList');
  if (!sectionStudentList) return;

  // Show all students for section change
  const allStudents = students;

  // Apply search filter
  const filteredStudents = allStudents.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filteredStudents.length === 0) {
    sectionStudentList.innerHTML = '<div style="padding: 1rem; text-align: center; color: var(--text-secondary);">No students found</div>';
    return;
  }

  sectionStudentList.innerHTML = filteredStudents.map(student => `
    <div class="section-student-item" data-student-id="${student.id}" onclick="selectSectionStudent(${student.id})">
      <div class="student-avatar"></div>
      <span class="student-name">${student.name}</span>
    </div>
  `).join('');
}

function populateSectionSelect() {
  const sectionSelect = document.getElementById('changeSectionSelect');
  if (!sectionSelect) return;

  sectionSelect.innerHTML = '<option value="">Select Section</option>' +
    sections.map(section => {
      let displayName = section.name;
      if (section.id === 1) {
        displayName = 'Assign Section';
      } else if (section.id === 2) {
        displayName = 'Section A';
      }
      return `<option value="${section.id}">${displayName}</option>`;
    }).join('');
}

let selectedSectionStudentId = null;

function selectSectionStudent(studentId) {
  selectedSectionStudentId = studentId;

  // Remove active class from all section student items
  document.querySelectorAll('.section-student-item').forEach(item => {
    item.classList.remove('active');
  });

  // Add active class to selected student
  const selectedItem = document.querySelector(`.section-student-item[data-student-id="${studentId}"]`);
  if (selectedItem) {
    selectedItem.classList.add('active');
  }

  // Enable/disable the change button based on selection
  const changeBtn = document.getElementById('changeSectionBtn');
  if (changeBtn) {
    changeBtn.disabled = !selectedSectionStudentId;
  }
}

function closeSection() {
  const section = document.getElementById('changeSectionSection');
  if (section) {
    section.style.display = 'none';
  }
  selectedSectionStudentId = null;

  // Disable the change button when section is closed
  const changeBtn = document.getElementById('changeSectionBtn');
  if (changeBtn) {
    changeBtn.disabled = true;
  }
}

async function changeSelectedStudentSection() {
  if (!selectedSectionStudentId) {
    alert('Please select a student from the list');
    return;
  }

  const sectionSelect = document.getElementById('changeSectionSelect');
  const newSectionId = parseInt(sectionSelect.value);

  if (!newSectionId) {
    alert('Please select a section');
    return;
  }

  try {
    await addStudentToSectionAPI(selectedSectionStudentId, newSectionId);

    // Update the student's sectionId in the local array
    const student = students.find(s => s.id === selectedSectionStudentId);
    if (student) {
      student.sectionId = newSectionId;
    }

    // Close the section
    closeSection();

    // Refresh the student list
    loadStudents();

    alert('Student section changed successfully!');
  } catch (error) {
    alert('Error changing student section: ' + error.message);
  }
}
