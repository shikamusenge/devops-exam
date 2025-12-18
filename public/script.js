// API Configuration
const API_BASE = 'http://localhost:3000';
let currentSection = 'dashboard';
let currentUser = {
    name: 'Intore mu Ikoranabuhanga',
    role: 'facilitator',
    sector: 'Kibungo'
};

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', function() {
    loadSection('dashboard');
    loadDashboardStats();
    setupEventListeners();
});

// Section Loading
async function loadSection(section) {
    currentSection = section;
    updateActiveNav();
    
    const contentArea = document.getElementById('contentArea');
    
    switch(section) {
        case 'dashboard':
            await loadDashboard();
            break;
        case 'families':
            await loadFamilies();
            break;
        case 'members':
            await loadMembers();
            break;
        case 'performance':
            await loadPerformance();
            break;
        case 'reports':
            await loadReports();
            break;
        case 'assisted':
            await loadAssistedRegistration();
            break;
        case 'self':
            await loadSelfRegistration();
            break;
        case 'settings':
            await loadSettings();
            break;
    }
}

// Dashboard Section
async function loadDashboard() {
    const content = `
        <div class="row mb-4">
            <div class="col-12">
                <h2 class="mb-3"><i class="bi bi-speedometer2 me-2"></i>Dashboard Overview</h2>
                <p class="text-muted">Monitor family performance contracts in real-time</p>
            </div>
        </div>
        
        <!-- Stats Cards -->
        <div class="row mb-4" id="statsCards">
            <div class="col-md-3 mb-3">
                <div class="stat-card bg-primary text-white p-4">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 class="mb-2">Total Families</h5>
                            <h2 class="mb-0" id="totalFamilies">0</h2>
                        </div>
                        <i class="bi bi-people fs-1 opacity-50"></i>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="stat-card bg-success text-white p-4">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 class="mb-2">Active Members</h5>
                            <h2 class="mb-0" id="totalMembers">0</h2>
                        </div>
                        <i class="bi bi-person-check fs-1 opacity-50"></i>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="stat-card bg-warning text-white p-4">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 class="mb-2">Performance Duties</h5>
                            <h2 class="mb-0" id="totalDuties">0</h2>
                        </div>
                        <i class="bi bi-clipboard-check fs-1 opacity-50"></i>
                    </div>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="stat-card bg-info text-white p-4">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 class="mb-2">Completion Rate</h5>
                            <h2 class="mb-0" id="completionRate">0%</h2>
                        </div>
                        <i class="bi bi-graph-up fs-1 opacity-50"></i>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Charts -->
        <div class="row mb-4">
            <div class="col-md-6 mb-4">
                <div class="chart-container">
                    <h5>Performance by Category</h5>
                    <canvas id="performanceChart"></canvas>
                </div>
            </div>
            <div class="col-md-6 mb-4">
                <div class="chart-container">
                    <h5>Monthly Progress</h5>
                    <canvas id="progressChart"></canvas>
                </div>
            </div>
        </div>
        
        <!-- Recent Activity -->
        <div class="row">
            <div class="col-12">
                <div class="table-container">
                    <h5>Recent Family Activities</h5>
                    <div id="recentActivities"></div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('contentArea').innerHTML = content;
    await loadDashboardStats();
    createCharts();
    loadRecentActivities();
}

// Family Management Section
async function loadFamilies() {
    const content = `
        <div class="row mb-4">
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center">
                    <h2><i class="bi bi-people me-2"></i>Family Management</h2>
                    <button class="btn btn-primary" onclick="showAddFamilyModal()">
                        <i class="bi bi-plus-circle me-2"></i>Add New Family
                    </button>
                </div>
                <p class="text-muted">Manage all registered families and their information</p>
            </div>
        </div>
        
        <!-- Filters -->
        <div class="row mb-4">
            <div class="col-md-4">
                <input type="text" class="form-control" placeholder="Search families..." id="familySearch">
            </div>
            <div class="col-md-3">
                <select class="form-select" id="filterSector">
                    <option value="">All Sectors</option>
                    <option value="Kibungo">Kibungo</option>
                </select>
            </div>
            <div class="col-md-3">
                <select class="form-select" id="filterStatus">
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>
            <div class="col-md-2">
                <button class="btn btn-outline-primary w-100" onclick="filterFamilies()">Filter</button>
            </div>
        </div>
        
        <!-- Families Table -->
        <div class="table-container">
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Family ID</th>
                            <th>Family Name</th>
                            <th>Sector</th>
                            <th>Members</th>
                            <th>Performance Score</th>
                            <th>Last Updated</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="familiesTable">
                        <!-- Families will be loaded here -->
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    document.getElementById('contentArea').innerHTML = content;
    await loadFamiliesData();
}

// Assisted Registration Section
async function loadAssistedRegistration() {
    const content = `
        <div class="row mb-4">
            <div class="col-12">
                <h2><i class="bi bi-person-check me-2"></i>Assisted Family Registration</h2>
                <p class="text-muted">Register families with assistance from Intore mu Ikoranabuhanga</p>
            </div>
        </div>
        
        <div class="row">
            <div class="col-lg-8">
                <div class="form-card">
                    <h4 class="mb-4">Step 1: Family Information</h4>
                    <form id="assistedFamilyForm">
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label class="form-label">Family Name *</label>
                                <input type="text" class="form-control" name="family_name" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Family Head</label>
                                <input type="text" class="form-control" name="family_head">
                            </div>
                        </div>
                        
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label class="form-label">Sector *</label>
                                <select class="form-control" name="sector" required>
                                    <option value="Kibungo">Kibungo Sector</option>
                                    <option value="Bumbogo">Bumbogo District</option>
                                    <option value="Other">Other Sector</option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Cell/Village</label>
                                <input type="text" class="form-control" name="village">
                            </div>
                        </div>
                        
                        <h4 class="mb-4 mt-5">Step 2: Family Members</h4>
                        <div id="familyMembersSection">
                            <!-- Family members will be added here -->
                        </div>
                        
                        <button type="button" class="btn btn-outline-primary mb-4" onclick="addFamilyMemberRow()">
                            <i class="bi bi-plus-circle me-2"></i>Add Family Member
                        </button>
                        
                        <h4 class="mb-4 mt-5">Step 3: Performance Duties</h4>
                        <div id="performanceDutiesSection">
                            <!-- Performance duties will be added here -->
                        </div>
                        
                        <button type="button" class="btn btn-outline-primary mb-4" onclick="addPerformanceDutyRow()">
                            <i class="bi bi-plus-circle me-2"></i>Add Performance Duty
                        </button>
                        
                        <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                            <button type="submit" class="btn btn-primary btn-lg px-5">
                                <i class="bi bi-check-circle me-2"></i>Complete Registration
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            
            <div class="col-lg-4">
                <div class="card border-0 shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title">Registration Guide</h5>
                        <div class="list-group list-group-flush">
                            <div class="list-group-item border-0">
                                <i class="bi bi-1-circle text-primary me-3"></i>
                                <strong>Collect Family Information</strong>
                                <p class="small text-muted mb-0">Gather all family member details</p>
                            </div>
                            <div class="list-group-item border-0">
                                <i class="bi bi-2-circle text-primary me-3"></i>
                                <strong>Enter Member Details</strong>
                                <p class="small text-muted mb-0">Add each family member with their information</p>
                            </div>
                            <div class="list-group-item border-0">
                                <i class="bi bi-3-circle text-primary me-3"></i>
                                <strong>Set Performance Duties</strong>
                                <p class="small text-muted mb-0">Define family and individual performance goals</p>
                            </div>
                            <div class="list-group-item border-0">
                                <i class="bi bi-4-circle text-primary me-3"></i>
                                <strong>Review & Submit</strong>
                                <p class="small text-muted mb-0">Verify information and complete registration</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="card border-0 shadow-sm mt-4">
                    <div class="card-body">
                        <h5 class="card-title">Required Documents</h5>
                        <ul class="list-unstyled">
                            <li class="mb-2"><i class="bi bi-check-circle text-success me-2"></i>National ID Copies</li>
                            <li class="mb-2"><i class="bi bi-check-circle text-success me-2"></i>Family Composition</li>
                            <li class="mb-2"><i class="bi bi-check-circle text-success me-2"></i>Contact Information</li>
                            <li><i class="bi bi-check-circle text-success me-2"></i>Performance Goals</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('contentArea').innerHTML = content;
    initializeAssistedRegistration();
}

// Self Registration Section
async function loadSelfRegistration() {
    const content = `
        <div class="row mb-4">
            <div class="col-12">
                <h2><i class="bi bi-phone me-2"></i>Self Registration Portal</h2>
                <p class="text-muted">Register your family directly through this portal</p>
            </div>
        </div>
        
        <div class="row justify-content-center">
            <div class="col-lg-8">
                <div class="form-card">
                    <div class="text-center mb-5">
                        <i class="bi bi-house-heart text-primary" style="font-size: 4rem;"></i>
                        <h3 class="mt-3">Register Your Family</h3>
                        <p class="text-muted">Complete the form below to register your family in the system</p>
                    </div>
                    
                    <!-- Progress Steps -->
                    <div class="mb-5">
                        <div class="d-flex justify-content-between">
                            <div class="text-center">
                                <div class="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                                    1
                                </div>
                                <div class="mt-2">Family Info</div>
                            </div>
                            <div class="text-center">
                                <div class="rounded-circle bg-light text-muted d-inline-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                                    2
                                </div>
                                <div class="mt-2">Members</div>
                            </div>
                            <div class="text-center">
                                <div class="rounded-circle bg-light text-muted d-inline-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                                    3
                                </div>
                                <div class="mt-2">Duties</div>
                            </div>
                            <div class="text-center">
                                <div class="rounded-circle bg-light text-muted d-inline-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                                    4
                                </div>
                                <div class="mt-2">Review</div>
                            </div>
                        </div>
                    </div>
                    
                    <form id="selfRegistrationForm">
                        <div class="mb-4">
                            <h5>Family Information</h5>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Family Name *</label>
                                    <input type="text" class="form-control" name="family_name" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Family Head Name *</label>
                                    <input type="text" class="form-control" name="head_name" required>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Phone Number *</label>
                                    <input type="tel" class="form-control" name="phone" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Email Address</label>
                                    <input type="email" class="form-control" name="email">
                                </div>
                            </div>
                        </div>
                        
                        <div class="mb-4">
                            <h5>Location Information</h5>
                            <div class="row">
                                <div class="col-md-4 mb-3">
                                    <label class="form-label">Province</label>
                                    <select class="form-control" name="province">
                                        <option value="Eastern">Eastern Province</option>
                                        <option value="Kigali">Kigali City</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <label class="form-label">District</label>
                                    <input type="text" class="form-control" name="district" value="Bumbogo">
                                </div>
                                <div class="col-md-4 mb-3">
                                    <label class="form-label">Sector *</label>
                                    <select class="form-control" name="sector" required>
                                        <option value="Kibungo">Kibungo</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div class="d-grid gap-2">
                            <button type="submit" class="btn btn-primary btn-lg">
                                <i class="bi bi-send me-2"></i>Submit Registration
                            </button>
                            <button type="button" class="btn btn-outline-secondary" onclick="saveDraft()">
                                <i class="bi bi-save me-2"></i>Save as Draft
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('contentArea').innerHTML = content;
    initializeSelfRegistration();
}

// Performance Management Section
async function loadPerformance() {
    const content = `
        <div class="row mb-4">
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center">
                    <h2><i class="bi bi-clipboard-check me-2"></i>Performance Management</h2>
                    <div>
                        <button class="btn btn-primary me-2" onclick="assignFamilyDuty()">
                            <i class="bi bi-plus-circle me-2"></i>Assign Family Duty
                        </button>
                        <button class="btn btn-success" onclick="assignIndividualDuty()">
                            <i class="bi bi-person-plus me-2"></i>Assign Individual Duty
                        </button>
                    </div>
                </div>
                <p class="text-muted">Manage performance duties for families and individual members</p>
            </div>
        </div>
        
        <!-- Performance Tabs -->
        <ul class="nav nav-tabs mb-4" id="performanceTabs">
            <li class="nav-item">
                <button class="nav-link active" onclick="showPerformanceTab('family')">Family Duties</button>
            </li>
            <li class="nav-item">
                <button class="nav-link" onclick="showPerformanceTab('individual')">Individual Duties</button>
            </li>
            <li class="nav-item">
                <button class="nav-link" onclick="showPerformanceTab('categories')">By Category</button>
            </li>
        </ul>
        
        <!-- Family Duties -->
        <div id="familyDutiesTab" class="performance-tab">
            <div class="row">
                <div class="col-md-4 mb-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Family Performance Summary</h5>
                            <div id="familyPerformanceStats"></div>
                        </div>
                    </div>
                </div>
                <div class="col-md-8">
                    <div class="table-container">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>Family</th>
                                    <th>Duty Description</th>
                                    <th>Category</th>
                                    <th>Progress</th>
                                    <th>Due Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="familyDutiesTable">
                                <!-- Family duties will be loaded here -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Individual Duties (hidden by default) -->
        <div id="individualDutiesTab" class="performance-tab d-none">
            <div class="table-container">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Member</th>
                            <th>Family</th>
                            <th>Duty Description</th>
                            <th>Status</th>
                            <th>Assigned Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="individualDutiesTable">
                        <!-- Individual duties will be loaded here -->
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    document.getElementById('contentArea').innerHTML = content;
    await loadPerformanceData();
}

// API Functions
async function loadDashboardStats() {
    try {
        const response = await fetch(`${API_BASE}/stats`);
        const stats = await response.json();
        
        document.getElementById('totalFamilies').textContent = stats.totalFamilies || 0;
        document.getElementById('totalMembers').textContent = stats.totalMembers || 0;
        document.getElementById('totalDuties').textContent = stats.totalDuties || 0;
        
        if (stats.totalDuties && stats.pendingDuties) {
            const completed = stats.totalDuties - stats.pendingDuties;
            const rate = Math.round((completed / stats.totalDuties) * 100);
            document.getElementById('completionRate').textContent = `${rate}%`;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function loadFamiliesData() {
    try {
        const response = await fetch(`${API_BASE}/families`);
        const families = await response.json();
        
        const tbody = document.getElementById('familiesTable');
        tbody.innerHTML = '';
        
        for (const family of families) {
            // Get members count for this family
            const membersResponse = await fetch(`${API_BASE}/members/family/${family.id}`);
            const members = await membersResponse.json();
            
            const row = `
                <tr>
                    <td>FAM-${family.id.toString().padStart(4, '0')}</td>
                    <td><strong>${family.family_name}</strong></td>
                    <td>${family.sector}</td>
                    <td>${members.length}</td>
                    <td>
                        <div class="progress progress-custom">
                            <div class="progress-bar bg-success" style="width: 75%"></div>
                        </div>
                    </td>
                    <td>${new Date().toLocaleDateString()}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary me-2" onclick="viewFamily(${family.id})">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-warning me-2" onclick="editFamily(${family.id})">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteFamily(${family.id})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        }
    } catch (error) {
        console.error('Error loading families:', error);
    }
}

// Utility Functions
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
}

function updateActiveNav() {
    document.querySelectorAll('.sidebar .nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

function changeSector(sector) {
    document.getElementById('currentSector').textContent = sector;
    alert(`Switched to ${sector}. This feature would load sector-specific data in a production environment.`);
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        window.location.href = 'index.html';
    }
}

function showAddFamilyModal() {
    // Implementation for adding family modal
    alert('Add Family modal would open here');
}

// Chart Creation
function createCharts() {
    // Performance Chart
    const performanceCtx = document.getElementById('performanceChart')?.getContext('2d');
    if (performanceCtx) {
        new Chart(performanceCtx, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'In Progress', 'Pending', 'Not Started'],
                datasets: [{
                    data: [45, 25, 20, 10],
                    backgroundColor: ['#28a745', '#17a2b8', '#ffc107', '#dc3545']
                }]
            }
        });
    }
    
    // Progress Chart
    const progressCtx = document.getElementById('progressChart')?.getContext('2d');
    if (progressCtx) {
        new Chart(progressCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Performance Score',
                    data: [65, 70, 75, 80, 85, 90],
                    borderColor: '#1e3c72',
                    backgroundColor: 'rgba(30, 60, 114, 0.1)',
                    fill: true
                }]
            }
        });
    }
}

// Initialize Assisted Registration
function initializeAssistedRegistration() {
    // Add initial family member row
    addFamilyMemberRow();
    addPerformanceDutyRow();
    
    // Setup form submission
    document.getElementById('assistedFamilyForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        await submitAssistedRegistration();
    });
}

function addFamilyMemberRow() {
    const section = document.getElementById('familyMembersSection');
    const rowCount = section.children.length + 1;
    
    const row = `
        <div class="card mb-3" id="memberRow${rowCount}">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h6 class="mb-0">Family Member ${rowCount}</h6>
                    <button type="button" class="btn btn-sm btn-outline-danger" onclick="removeMemberRow(${rowCount})">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
                <div class="row">
                    <div class="col-md-4 mb-3">
                        <label class="form-label">Full Name *</label>
                        <input type="text" class="form-control" name="member_name_${rowCount}" required>
                    </div>
                    <div class="col-md-4 mb-3">
                        <label class="form-label">Relationship *</label>
                        <select class="form-control" name="member_relationship_${rowCount}" required>
                            <option value="">Select...</option>
                            <option value="Head">Head of Family</option>
                            <option value="Spouse">Spouse</option>
                            <option value="Child">Child</option>
                            <option value="Parent">Parent</option>
                            <option value="Other">Other Relative</option>
                        </select>
                    </div>
                    <div class="col-md-4 mb-3">
                        <label class="form-label">Date of Birth</label>
                        <input type="date" class="form-control" name="member_dob_${rowCount}">
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-4 mb-3">
                        <label class="form-label">National ID</label>
                        <input type="text" class="form-control" name="member_id_${rowCount}">
                    </div>
                    <div class="col-md-4 mb-3">
                        <label class="form-label">Phone Number</label>
                        <input type="tel" class="form-control" name="member_phone_${rowCount}">
                    </div>
                    <div class="col-md-4 mb-3">
                        <label class="form-label">Occupation</label>
                        <input type="text" class="form-control" name="member_occupation_${rowCount}">
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Education Level</label>
                        <select class="form-control" name="member_education_${rowCount}">
                            <option value="">Select...</option>
                            <option value="Primary">Primary</option>
                            <option value="Secondary">Secondary</option>
                            <option value="University">University</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Health Status</label>
                        <select class="form-control" name="member_health_${rowCount}">
                            <option value="">Select...</option>
                            <option value="Good">Good</option>
                            <option value="Fair">Fair</option>
                            <option value="Poor">Poor</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    section.innerHTML += row;
}

function addPerformanceDutyRow() {
    const section = document.getElementById('performanceDutiesSection');
    const rowCount = section.children.length + 1;
    
    const row = `
        <div class="card mb-3" id="dutyRow${rowCount}">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h6 class="mb-0">Performance Duty ${rowCount}</h6>
                    <button type="button" class="btn btn-sm btn-outline-danger" onclick="removeDutyRow(${rowCount})">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Duty Type *</label>
                        <select class="form-control" name="duty_type_${rowCount}" required>
                            <option value="">Select...</option>
                            <option value="family">Family Duty (Shared)</option>
                            <option value="individual">Individual Duty</option>
                            <option value="collective">Collective Responsibility</option>
                        </select>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Assigned To</label>
                        <select class="form-control" name="duty_assigned_${rowCount}" id="dutyAssigned${rowCount}">
                            <option value="all">All Family Members</option>
                            <option value="specific">Specific Member</option>
                        </select>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-12 mb-3">
                        <label class="form-label">Duty Description *</label>
                        <textarea class="form-control" name="duty_description_${rowCount}" rows="2" required></textarea>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-4 mb-3">
                        <label class="form-label">Category *</label>
                        <select class="form-control" name="duty_category_${rowCount}" required>
                            <option value="">Select...</option>
                            <option value="economic">Economic Development</option>
                            <option value="education">Education</option>
                            <option value="health">Health & Hygiene</option>
                            <option value="social">Social Welfare</option>
                            <option value="environment">Environment</option>
                        </select>
                    </div>
                    <div class="col-md-4 mb-3">
                        <label class="form-label">Target Date</label>
                        <input type="date" class="form-control" name="duty_target_date_${rowCount}">
                    </div>
                    <div class="col-md-4 mb-3">
                        <label class="form-label">Priority Level</label>
                        <select class="form-control" name="duty_priority_${rowCount}">
                            <option value="high">High</option>
                            <option value="medium" selected>Medium</option>
                            <option value="low">Low</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    section.innerHTML += row;
}

async function submitAssistedRegistration() {
    // This would collect all form data and submit to the API
    alert('Registration submitted successfully! This would save all family data to the database.');
    // In production, you would collect form data and make API calls
}

// Setup Event Listeners
function setupEventListeners() {
    // Sector selection change
    document.getElementById('sectorSelect')?.addEventListener('change', function(e) {
        const sector = e.target.value;
        alert(`Switching to ${sector} view. In production, this would filter all data.`);
    });
    
    // Family search
    document.getElementById('familySearch')?.addEventListener('input', function(e) {
        filterFamilies();
    });
}

// Export functionality for future scalability
window.DuhigureSystem = {
    loadSection,
    changeSector,
    toggleSidebar,
    logout,
    showAddFamilyModal,
    addFamilyMemberRow,
    addPerformanceDutyRow
};