// Subjects management functionality
let subjects = [];

// Load subjects from API
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

// Add subject via API
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

// Delete subject via API
async function deleteSubjectFromAPI(subjectId) {
  try {
    const response = await fetch(`/subjects/${subjectId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to delete subject');
    subjects = subjects.filter(s => s.id !== subjectId);
    return true;
  } catch (error) {
    console.error('Error deleting subject:', error);
    throw error;
  }
}

// Get subject by ID
function getSubjectById(subjectId) {
  return subjects.find(s => s.id === subjectId);
}

// Get subject name by ID
function getSubjectName(subjectId) {
  const subject = getSubjectById(subjectId);
  return subject ? subject.name : 'Unknown Subject';
}

// Initialize subjects (called from main app)
async function initializeSubjects() {
  try {
    await loadSubjectsFromAPI();
    loadSubjectsToUI();
  } catch (error) {
    console.error('Failed to initialize subjects:', error);
    // Fallback to default subjects if API fails
    subjects = [
      { id: 1, name: 'Mathematics' },
      { id: 2, name: 'Science' },
      { id: 3, name: 'English' },
      { id: 4, name: 'History' }
    ];
    loadSubjectsToUI();
  }
}

// Load subjects to UI dropdown
function loadSubjectsToUI() {
  const subjectSelect = document.getElementById('subjectSelect');
  if (!subjectSelect) return;

  subjectSelect.innerHTML = '<option value="">Select Subject</option>' +
    subjects.map(subject =>
      `<option value="${subject.id}">${subject.name}</option>`
    ).join('');
}

// Add subject (called from UI)
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
    loadSubjectsToUI();
    alert('Subject added successfully!');
  } catch (error) {
    alert('Error adding subject: ' + error.message);
  }
}

// Delete subject (called from UI)
async function deleteSubject(subjectId) {
  if (!confirm('Are you sure you want to delete this subject? This will also delete all grades for this subject.')) return;

  try {
    await deleteSubjectFromAPI(subjectId);
    loadSubjectsToUI();
    alert('Subject deleted successfully!');
  } catch (error) {
    alert('Error deleting subject: ' + error.message);
  }
}

// Export functions for use in other modules
window.SubjectsAPI = {
  loadSubjectsFromAPI,
  addSubjectToAPI,
  deleteSubjectFromAPI,
  getSubjectById,
  getSubjectName,
  initializeSubjects,
  loadSubjectsToUI,
  addSubject,
  deleteSubject
};
