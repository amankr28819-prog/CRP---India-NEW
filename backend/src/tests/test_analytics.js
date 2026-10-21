const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const {
  getDashboardStats,
  getDeletedComplaints,
  formatTurnaroundTime
} = require('../controllers/authorityController');
const {
  getComplaints,
  updateComplaintStatus,
  getComplaintByRefId,
  getMyComplaints
} = require('../controllers/complaintController');
const {
  getAuthorityComplaintScope,
  isComplaintAuthorizedForAuthority,
  categoryDepartmentMap,
  departmentCategoryMap
} = require('../utils/authorityScope');

let mongod;

async function setupDB() {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
}

async function teardownDB() {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
}

function runMockRequest(handler, user, query = {}, params = {}, body = {}) {
  return new Promise((resolve, reject) => {
    const req = { user, query, params, body };
    const res = {
      statusCode: 200,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        resolve({ statusCode: this.statusCode || 200, body: data });
      }
    };
    const next = (err) => {
      if (err) reject(err);
      else resolve({ statusCode: res.statusCode || 200, body: null });
    };
    handler(req, res, next).catch(reject);
  });
}

async function runAllTests() {
  console.log('====================================================');
  console.log('STARTING SCOPED REPORTS & ANALYTICS TEST SUITE (A-T)');
  console.log('====================================================');

  await setupDB();

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // ----------------------------------------------------
    // SETUP: Create Authority and Citizen Users
    // ----------------------------------------------------
    const upperAdmin = await User.create({
      name: 'Dr. Vikramaditya Sen',
      email: 'admin@crp.gov.in',
      password: 'Password123!',
      role: 'authority_admin',
      department: 'Central Municipal Administration',
      designation: 'Municipal Commissioner'
    });

    const roadsAuth = await User.create({
      name: 'Rajeev Nambiar',
      email: 'roads@crp.gov.in',
      password: 'Password123!',
      role: 'authority_category',
      assignedCategory: 'Roads & Potholes',
      department: 'Public Works Department (Roads)',
      designation: 'Superintending Engineer (Roads)'
    });

    const garbageAuth = await User.create({
      name: 'Sunil Ganguly',
      email: 'garbage@crp.gov.in',
      password: 'Password123!',
      role: 'authority_category',
      assignedCategory: 'Garbage & Sanitation',
      department: 'Solid Waste & Sanitation Department',
      designation: 'Chief Sanitation Inspector'
    });

    const waterAuthZero = await User.create({
      name: 'Meenakshi Sundaram',
      email: 'water@crp.gov.in',
      password: 'Password123!',
      role: 'authority_category',
      assignedCategory: 'Water Supply',
      department: 'Water Supply & Jal Board',
      designation: 'Zonal Water Supply Engineer'
    });

    const citizenUser = await User.create({
      name: 'Ramesh Patel',
      email: 'citizen@example.com',
      password: 'Password123!',
      role: 'citizen'
    });

    // ----------------------------------------------------
    // SETUP: Populate Complaints
    // Department A (Roads): 10 complaints
    //   - 3 Resolved (turnaround 2d = 48h, 4d = 96h, 6d = 144h; average = 96.0h)
    //   - 2 In Progress
    //   - 3 Under Review
    //   - 2 Assigned
    // Department B (Garbage): 20 complaints
    //   - 15 Resolved
    //   - 5 In Progress
    // Department C (Water): 2 complaints
    //   - 2 Under Review (0 resolved)
    // ----------------------------------------------------
    const now = Date.now();
    const dayMs = 24 * 3600 * 1000;

    // Roads Resolved (3 complaints)
    await Complaint.create({
      referenceId: 'CRP-2026-R01',
      category: 'Roads & Potholes',
      assignedDepartment: 'Public Works Department (Roads)',
      title: 'Pothole on Main Road',
      description: 'Dangerous crater',
      location: 'MG Road',
      ward: 'Ward 10',
      city: 'Bengaluru',
      latitude: 12.97,
      longitude: 77.59,
      citizen: { name: 'Citizen 1', phone: '9876543210', email: 'c1@test.com' },
      status: 'Resolved',
      createdAt: new Date(now - 10 * dayMs),
      resolvedAt: new Date(now - 8 * dayMs) // duration = 2 days = 48 hrs
    });

    await Complaint.create({
      referenceId: 'CRP-2026-R02',
      category: 'Roads & Potholes',
      assignedDepartment: 'Public Works Department (Roads)',
      title: 'Asphalt cracking on Flyover',
      description: 'Surface crumbling',
      location: 'Residency Road',
      ward: 'Ward 10',
      city: 'Bengaluru',
      latitude: 12.97,
      longitude: 77.59,
      citizen: { name: 'Citizen 2', phone: '9876543210', email: 'c2@test.com' },
      status: 'Resolved',
      createdAt: new Date(now - 12 * dayMs),
      resolvedAt: new Date(now - 8 * dayMs) // duration = 4 days = 96 hrs
    });

    await Complaint.create({
      referenceId: 'CRP-2026-R03',
      category: 'Roads & Potholes',
      assignedDepartment: 'Public Works Department (Roads)',
      title: 'Speed breaker unpainted',
      description: 'Unmarked breaker',
      location: 'Church Street',
      ward: 'Ward 11',
      city: 'Bengaluru',
      latitude: 12.97,
      longitude: 77.59,
      citizen: { name: 'Citizen 3', phone: '9876543210', email: 'c3@test.com' },
      status: 'Resolved',
      createdAt: new Date(now - 14 * dayMs),
      resolvedAt: new Date(now - 8 * dayMs) // duration = 6 days = 144 hrs
    });

    // Roads In Progress (2 complaints)
    for (let i = 4; i <= 5; i++) {
      await Complaint.create({
        referenceId: `CRP-2026-R0${i}`,
        category: 'Roads & Potholes',
        assignedDepartment: 'Public Works Department (Roads)',
        title: `Road Issue ${i}`,
        description: `Description ${i}`,
        location: 'Brigade Road',
        ward: 'Ward 10',
        city: 'Bengaluru',
        latitude: 12.97,
        longitude: 77.59,
        citizen: { name: `Citizen ${i}`, phone: '9876543210', email: `c${i}@test.com` },
        status: 'In Progress',
        createdAt: new Date(now - 5 * dayMs)
      });
    }

    // Roads Under Review (3 complaints)
    for (let i = 6; i <= 8; i++) {
      await Complaint.create({
        referenceId: `CRP-2026-R0${i}`,
        category: 'Roads & Potholes',
        assignedDepartment: 'Public Works Department (Roads)',
        title: `Road Issue ${i}`,
        description: `Description ${i}`,
        location: 'Lavelle Road',
        ward: 'Ward 12',
        city: 'Bengaluru',
        latitude: 12.97,
        longitude: 77.59,
        citizen: { name: `Citizen ${i}`, phone: '9876543210', email: `c${i}@test.com` },
        status: 'Under Review',
        createdAt: new Date(now - 3 * dayMs)
      });
    }

    // Roads Assigned (2 complaints)
    for (let i = 9; i <= 10; i++) {
      await Complaint.create({
        referenceId: `CRP-2026-R${i < 10 ? '0' + i : i}`,
        category: 'Roads & Potholes',
        assignedDepartment: 'Public Works Department (Roads)',
        title: `Road Issue ${i}`,
        description: `Description ${i}`,
        location: 'Richmond Road',
        ward: 'Ward 11',
        city: 'Bengaluru',
        latitude: 12.97,
        longitude: 77.59,
        citizen: { name: `Citizen ${i}`, phone: '9876543210', email: `c${i}@test.com` },
        status: 'Assigned',
        assignedOfficer: 'Rajeev Nambiar',
        createdAt: new Date(now - 2 * dayMs)
      });
    }

    // Department B (Garbage & Sanitation): 20 complaints (15 Resolved, 5 In Progress)
    for (let i = 1; i <= 15; i++) {
      await Complaint.create({
        referenceId: `CRP-2026-G${i < 10 ? '0' + i : i}`,
        category: 'Garbage & Sanitation',
        assignedDepartment: 'Solid Waste & Sanitation Department',
        title: `Garbage Overflow ${i}`,
        description: 'Bin overflowing',
        location: 'Commercial Street',
        ward: 'Ward 20',
        city: 'Bengaluru',
        latitude: 12.98,
        longitude: 77.60,
        citizen: { name: `Citizen G${i}`, phone: '9876543210', email: `cg${i}@test.com` },
        status: 'Resolved',
        createdAt: new Date(now - 8 * dayMs),
        resolvedAt: new Date(now - 4 * dayMs)
      });
    }
    for (let i = 16; i <= 20; i++) {
      await Complaint.create({
        referenceId: `CRP-2026-G${i}`,
        category: 'Garbage & Sanitation',
        assignedDepartment: 'Solid Waste & Sanitation Department',
        title: `Garbage Issue ${i}`,
        description: 'Litter on footpath',
        location: 'Commercial Street',
        ward: 'Ward 20',
        city: 'Bengaluru',
        latitude: 12.98,
        longitude: 77.60,
        citizen: { name: `Citizen G${i}`, phone: '9876543210', email: `cg${i}@test.com` },
        status: 'In Progress',
        createdAt: new Date(now - 1 * dayMs)
      });
    }

    // Department C (Water): 2 complaints (0 Resolved)
    for (let i = 1; i <= 2; i++) {
      await Complaint.create({
        referenceId: `CRP-2026-W0${i}`,
        category: 'Water Supply',
        assignedDepartment: 'Water Supply & Jal Board',
        title: `Water Pipeline Leak ${i}`,
        description: 'Low water pressure',
        location: 'Indiranagar',
        ward: 'Ward 30',
        city: 'Bengaluru',
        latitude: 12.97,
        longitude: 77.64,
        citizen: { name: `Citizen W${i}`, phone: '9876543210', email: `cw${i}@test.com` },
        status: 'Under Review',
        createdAt: new Date(now - 1 * dayMs)
      });
    }

    console.log('\n--- Running Scenario Checks A through T ---');

    // A. Main/Upper Authority Analytics Scope
    const upperRes = await runMockRequest(getDashboardStats, upperAdmin);
    assert(upperRes.statusCode === 200, 'A1: Upper authority dashboard returns HTTP 200');
    assert(upperRes.body.data.stats.total === 32, `A2: Upper authority sees all 32 complaints across departments (got ${upperRes.body.data.stats.total})`);
    assert(upperRes.body.data.authorityScope.isUpperAuthority === true, 'A3: Upper authority metadata correctly identifies isUpperAuthority=true');
    assert(upperRes.body.data.departmentStats.length === 7, `A4: Upper authority sees all 7 departments in breakdown (got ${upperRes.body.data.departmentStats.length})`);

    // B. Lower Authority Analytics Scope
    const roadsRes = await runMockRequest(getDashboardStats, roadsAuth);
    assert(roadsRes.statusCode === 200, 'B1: Lower authority (Roads) dashboard returns HTTP 200');
    assert(roadsRes.body.data.stats.total === 10, `B2: Lower authority (Roads) sees ONLY 10 complaints (got ${roadsRes.body.data.stats.total}, NOT 32)`);
    assert(roadsRes.body.data.departmentStats.length === 1, `B3: Lower authority sees ONLY 1 department in breakdown (got ${roadsRes.body.data.departmentStats.length})`);
    assert(roadsRes.body.data.departmentStats[0].category === 'Roads & Potholes', 'B4: Department breakdown category is strictly Roads & Potholes');

    // C & T. Lower Authority Cannot Access Another Department via Query Manipulation
    const hackAttemptRes = await runMockRequest(getDashboardStats, roadsAuth, { category: 'Garbage & Sanitation' });
    assert(hackAttemptRes.body.data.stats.total === 10, `C/T1: Query-param manipulation (?category=Garbage) blocked, still returns Roads total=10 (got ${hackAttemptRes.body.data.stats.total})`);
    assert(hackAttemptRes.body.data.departmentStats[0].category === 'Roads & Potholes', 'C/T2: DepartmentStats remains strictly Roads & Potholes');

    // D. Total Complaint Count Accuracy
    assert(roadsRes.body.data.stats.total === 10, 'D1: Total complaint count exactly matches scoped dataset');

    // E. Current Status Counts
    const { submitted, underReview, assigned, inProgress, resolved } = roadsRes.body.data.stats;
    assert(submitted === 0, `E1: Submitted = 0 (got ${submitted})`);
    assert(underReview === 3, `E2: Under Review = 3 (got ${underReview})`);
    assert(assigned === 2, `E3: Assigned = 2 (got ${assigned})`);
    assert(inProgress === 2, `E4: In Progress = 2 (got ${inProgress})`);
    assert(resolved === 3, `E5: Resolved = 3 (got ${resolved})`);

    // F. Status Counts Sum Correctly
    const statusSum = submitted + underReview + assigned + inProgress + resolved;
    assert(statusSum === roadsRes.body.data.stats.total, `F1: Status sum (${statusSum}) exactly equals total complaints (${roadsRes.body.data.stats.total})`);

    // G. Resolution Rate
    // Formula: 3 / 10 * 100 = 30.0%
    assert(roadsRes.body.data.stats.resolutionRate === 30, `G1: Resolution rate for Roads is 30.0% (got ${roadsRes.body.data.stats.resolutionRate}%)`);
    // Upper Authority: 18 / 32 * 100 = 56.25% -> 56.3%
    assert(upperRes.body.data.stats.resolutionRate === 56.3, `G2: Resolution rate for Upper Authority is 56.3% (got ${upperRes.body.data.stats.resolutionRate}%)`);

    // H & J. Average Turnaround Time
    // Roads: (48h + 96h + 144h) / 3 = 288h / 3 = 96.0 hrs = 4 days
    assert(roadsRes.body.data.stats.avgTurnaroundHours === 96, `H/J1: Average turnaround for Roads is 96.0 hrs (got ${roadsRes.body.data.stats.avgTurnaroundHours})`);
    assert(roadsRes.body.data.stats.avgTurnaroundDisplay === '4 days', `H/J2: Formatted turnaround display is "4 days" (got "${roadsRes.body.data.stats.avgTurnaroundDisplay}")`);

    // Verify formatTurnaroundTime rules and all required examples
    assert(formatTurnaroundTime(5.4) === '5 hours', 'Formatter: 5.4 hours -> 5 hours');
    assert(formatTurnaroundTime(5.5) === '6 hours', 'Formatter: 5.5 hours -> 6 hours');
    assert(formatTurnaroundTime(23.7) === '24 hours', 'Formatter: 23.7 hours -> 24 hours');
    assert(formatTurnaroundTime(24) === '1 day', 'Formatter: 24 hours -> 1 day');
    assert(formatTurnaroundTime(30.4) === '1 day 6 hours', 'Formatter: 30.4 hours -> 1 day 6 hours');
    assert(formatTurnaroundTime(30.5) === '1 day 7 hours', 'Formatter: 30.5 hours -> 1 day 7 hours');
    assert(formatTurnaroundTime(47.7) === '2 days', 'Formatter: 47.7 hours -> 2 days');
    assert(formatTurnaroundTime(53.4) === '2 days 5 hours', 'Formatter: 53.4 hours -> 2 days 5 hours');
    assert(formatTurnaroundTime(397) === '16 days 13 hours', 'Formatter: 397 hours -> 16 days 13 hours');
    assert(formatTurnaroundTime(397.7) === '16 days 14 hours', 'Formatter: 397.7 hours -> 16 days 14 hours');
    assert(formatTurnaroundTime(1) === '1 hour', 'Formatter: 1 hour singular');
    assert(formatTurnaroundTime(25) === '1 day 1 hour', 'Formatter: 25 hours -> 1 day 1 hour');
    assert(formatTurnaroundTime(48) === '2 days', 'Formatter: 48 hours -> 2 days');
    assert(formatTurnaroundTime(72) === '3 days', 'Formatter: 72 hours -> 3 days');
    assert(formatTurnaroundTime(null) === 'N/A', 'Formatter: null -> N/A');
    assert(formatTurnaroundTime(undefined) === 'N/A', 'Formatter: undefined -> N/A');

    // I. Zero Resolved Complaints
    const waterRes = await runMockRequest(getDashboardStats, waterAuthZero);
    assert(waterRes.body.data.stats.total === 2, `I1: Water authority has 2 complaints (got ${waterRes.body.data.stats.total})`);
    assert(waterRes.body.data.stats.resolved === 0, 'I2: Water authority has 0 resolved complaints');
    assert(waterRes.body.data.stats.avgTurnaroundHours === null, 'I3: Zero resolved turnaround is null (no fake numbers)');
    assert(waterRes.body.data.stats.avgTurnaroundDisplay === 'N/A', `I4: Zero resolved turnaround display is "N/A" (got "${waterRes.body.data.stats.avgTurnaroundDisplay}")`);

    // K. Unresolved Complaints Excluded from Turnaround
    // Roads has 7 unresolved complaints (2 In Progress, 3 Under Review, 2 Assigned), divisor was strictly 3
    assert(roadsRes.body.data.stats.avgTurnaroundHours === 96, 'K1: Unresolved complaints properly excluded from turnaround calculation');

    // L. Backward Status Transition
    // Move CRP-2026-R04 from In Progress back to Under Review
    await Complaint.updateOne({ referenceId: 'CRP-2026-R04' }, { status: 'Under Review' });
    const roadsBackwardRes = await runMockRequest(getDashboardStats, roadsAuth);
    assert(roadsBackwardRes.body.data.stats.inProgress === 1, `L1: In Progress decreased to 1 (got ${roadsBackwardRes.body.data.stats.inProgress})`);
    assert(roadsBackwardRes.body.data.stats.underReview === 4, `L2: Under Review increased to 4 (got ${roadsBackwardRes.body.data.stats.underReview})`);
    assert(roadsBackwardRes.body.data.stats.total === 10, 'L3: Total remains exactly 10 after backward transition');

    // M. Department Change
    // Reassign CRP-2026-R05 from Roads to Garbage
    await Complaint.updateOne(
      { referenceId: 'CRP-2026-R05' },
      { category: 'Garbage & Sanitation', assignedDepartment: 'Solid Waste & Sanitation Department' }
    );
    const roadsDeptChangeRes = await runMockRequest(getDashboardStats, roadsAuth);
    const garbageDeptChangeRes = await runMockRequest(getDashboardStats, garbageAuth);
    assert(roadsDeptChangeRes.body.data.stats.total === 9, `M1: Roads total decreased to 9 (got ${roadsDeptChangeRes.body.data.stats.total})`);
    assert(garbageDeptChangeRes.body.data.stats.total === 21, `M2: Garbage total increased to 21 (got ${garbageDeptChangeRes.body.data.stats.total})`);

    // N. Officer Assignment
    await Complaint.updateOne(
      { referenceId: 'CRP-2026-R09' },
      { assignedOfficer: 'Debabrata Sen' }
    );
    const roadsOfficerRes = await runMockRequest(getDashboardStats, roadsAuth);
    assert(roadsOfficerRes.body.data.stats.assigned === 2, 'N1: Assigned count maintained accurately');

    // O. New Complaint Changes Analytics
    await Complaint.create({
      referenceId: 'CRP-2026-R11',
      category: 'Roads & Potholes',
      assignedDepartment: 'Public Works Department (Roads)',
      title: 'New Pothole',
      description: 'Reported just now',
      location: 'MG Road',
      ward: 'Ward 10',
      city: 'Bengaluru',
      latitude: 12.97,
      longitude: 77.59,
      citizen: { name: 'Citizen New', phone: '9876543210', email: 'cnew@test.com' },
      status: 'Submitted',
      createdAt: new Date()
    });
    const roadsNewRes = await runMockRequest(getDashboardStats, roadsAuth);
    assert(roadsNewRes.body.data.stats.total === 10, `O1: Roads total incremented to 10 after new complaint (got ${roadsNewRes.body.data.stats.total})`);
    assert(roadsNewRes.body.data.stats.submitted === 1, `O2: Submitted incremented to 1 (got ${roadsNewRes.body.data.stats.submitted})`);

    // P. Complaint Resolution Changes Analytics
    await Complaint.updateOne(
      { referenceId: 'CRP-2026-R11' },
      { status: 'Resolved', resolvedAt: new Date(Date.now() + 1000) }
    );
    const roadsResolveRes = await runMockRequest(getDashboardStats, roadsAuth);
    assert(roadsResolveRes.body.data.stats.resolved === 4, `P1: Resolved incremented to 4 (got ${roadsResolveRes.body.data.stats.resolved})`);
    assert(roadsResolveRes.body.data.stats.submitted === 0, `P2: Submitted decremented to 0 (got ${roadsResolveRes.body.data.stats.submitted})`);
    assert(roadsResolveRes.body.data.stats.resolutionRate === 40, `P3: Resolution rate recalculated to 40.0% (got ${roadsResolveRes.body.data.stats.resolutionRate}%)`);

    // Q. Date Filtering
    const todayRes = await runMockRequest(getDashboardStats, roadsAuth, { timeRange: 'Today' });
    assert(todayRes.body.data.stats.total === 1, `Q1: Today filter returns only complaint created today (got ${todayRes.body.data.stats.total})`);
    const weekRes = await runMockRequest(getDashboardStats, roadsAuth, { timeRange: 'This Week' });
    assert(weekRes.body.data.stats.total >= 1, `Q2: This Week filter works properly (got ${weekRes.body.data.stats.total})`);

    // R. No Duplicate Counting
    const wardSum = roadsResolveRes.body.data.wardStats.reduce((acc, w) => acc + w.count, 0);
    assert(wardSum === roadsResolveRes.body.data.stats.total, `R1: Ward distribution sum (${wardSum}) equals total complaints (${roadsResolveRes.body.data.stats.total})`);

    // S. Citizen Access Safeguard
    const citizenScope = getAuthorityComplaintScope(citizenUser);
    assert(citizenScope._id === null, 'S1: Citizen user scope resolves to { _id: null } (completely blocked)');

    // ====================================================
    // REGRESSION SUITE: AUDIT ISSUES 1 - 5 (SCENARIOS A - H)
    // ====================================================
    console.log('\n--- Running Regression Scenarios A through H ---');

    // Setup Parks & Public Amenities Authority user
    const parksAuth = await User.create({
      name: 'Ananya Sharma',
      email: 'parks@crp.gov.in',
      password: 'Password123!',
      role: 'authority_category',
      assignedCategory: 'Public Spaces',
      department: 'Parks & Public Amenities Directorate',
      designation: 'Horticulture & Parks Officer'
    });

    // ----------------------------------------------------
    // TEST A: Reassigned In-Progress Complaint
    // ----------------------------------------------------
    // Create 3 complaints in Parks scope matching the audit prompt example:
    // 1) Reassigned: original category 'Other Issues', but assigned to 'Parks & Public Amenities Directorate', status 'In Progress'
    // 2) Native Resolved 1: category 'Public Spaces', assigned to Parks dept, status 'Resolved'
    // 3) Native Resolved 2: category 'Public Spaces', assigned to Parks dept, status 'Resolved'
    const reassignedComp = await Complaint.create({
      referenceId: 'CRP-2026-REASSIGNED1',
      category: 'Other Issues',
      assignedDepartment: 'Parks & Public Amenities Directorate',
      title: 'Illegal debris dump in community park',
      description: 'Debris dumped in public park zone',
      location: 'Cubbon Park Sector 4',
      ward: 'Ward 25',
      city: 'Bengaluru',
      latitude: 12.97,
      longitude: 77.59,
      citizen: { name: 'Citizen One', phone: '9876543210', email: 'citizen1@test.com', userId: citizenUser._id },
      status: 'In Progress',
      createdAt: new Date(Date.now() - 3600000)
    });

    const nativeParks1 = await Complaint.create({
      referenceId: 'CRP-2026-PARKS-NATIVE1',
      category: 'Public Spaces',
      assignedDepartment: 'Parks & Public Amenities Directorate',
      title: 'Broken park bench near fountain',
      description: 'Bench broken near walking track',
      location: 'Lalbagh Gate 2',
      ward: 'Ward 25',
      city: 'Bengaluru',
      latitude: 12.97,
      longitude: 77.59,
      citizen: { name: 'Citizen Two', phone: '9876543211', email: 'citizen2@test.com', userId: citizenUser._id },
      status: 'Resolved',
      resolvedAt: new Date(),
      resolvedBy: 'Ananya Sharma',
      resolutionPhoto: 'https://example.com/resolved.jpg',
      createdAt: new Date(Date.now() - 7200000)
    });

    const nativeParks2 = await Complaint.create({
      referenceId: 'CRP-2026-PARKS-NATIVE2',
      category: 'Public Spaces',
      assignedDepartment: 'Parks & Public Amenities Directorate',
      title: 'Overgrown thorny shrubs on walking path',
      description: 'Shrubs obstructing pedestrian walkway',
      location: 'Jayanagar 4th Block Park',
      ward: 'Ward 30',
      city: 'Bengaluru',
      latitude: 12.93,
      longitude: 77.58,
      citizen: { name: 'Citizen Three', phone: '9876543212', email: 'citizen3@test.com' },
      status: 'Resolved',
      resolvedAt: new Date(),
      resolvedBy: 'Ananya Sharma',
      resolutionPhoto: 'https://example.com/resolved2.jpg',
      createdAt: new Date(Date.now() - 10800000)
    });

    // Verify Parks dashboard stats: total 3, resolved 2, inProgress 1
    const parksDashRes = await runMockRequest(getDashboardStats, parksAuth);
    assert(parksDashRes.statusCode === 200, 'Test A1: Parks dashboard returns HTTP 200');
    assert(parksDashRes.body.data.stats.total === 3, `Test A2: Parks total is 3 (got ${parksDashRes.body.data.stats.total})`);
    assert(parksDashRes.body.data.stats.resolved === 2, `Test A3: Parks resolved is 2 (got ${parksDashRes.body.data.stats.resolved})`);
    assert(parksDashRes.body.data.stats.inProgress === 1, `Test A4: Parks in-progress count is 1 (got ${parksDashRes.body.data.stats.inProgress})`);

    // Verify Parks complaint list: getComplaints returns ALL 3 complaints
    const parksListRes = await runMockRequest(getComplaints, parksAuth, {});
    assert(parksListRes.statusCode === 200, 'Test A5: Parks complaint list returns HTTP 200');
    assert(parksListRes.body.total === 3, `Test A6: Parks list total count matches stats (3 == ${parksListRes.body.total})`);
    assert(parksListRes.body.complaints.length === 3, `Test A7: Parks list items count matches stats (3 == ${parksListRes.body.complaints.length})`);
    const parksRefIds = parksListRes.body.complaints.map(c => c.referenceId);
    assert(parksRefIds.includes('CRP-2026-REASSIGNED1'), 'Test A8: Reassigned in-progress complaint appears in Parks complaint list');
    assert(parksRefIds.includes('CRP-2026-PARKS-NATIVE1'), 'Test A9: Native resolved complaint 1 appears in list');
    assert(parksRefIds.includes('CRP-2026-PARKS-NATIVE2'), 'Test A10: Native resolved complaint 2 appears in list');

    // Verify no duplicates: native complaints matching BOTH category and department appear exactly once
    const uniqueParksRefIds = new Set(parksRefIds);
    assert(uniqueParksRefIds.size === parksRefIds.length, `Test A11: No duplicate complaints in list (${uniqueParksRefIds.size} unique out of ${parksRefIds.length})`);

    // Verify status filter 'In Progress' returns exactly the reassigned in-progress complaint
    const parksInProgressList = await runMockRequest(getComplaints, parksAuth, { status: 'In Progress' });
    assert(parksInProgressList.body.total === 1, `Test A12: In Progress filter count is 1 (got ${parksInProgressList.body.total})`);
    assert(parksInProgressList.body.complaints[0]?.referenceId === 'CRP-2026-REASSIGNED1', 'Test A13: In Progress filter returns the reassigned complaint');

    // ----------------------------------------------------
    // TEST B: Unauthorized Department Isolation
    // ----------------------------------------------------
    // Roads authority must not be able to list, inspect, or update the Parks complaint
    const roadsListWithParks = await runMockRequest(getComplaints, roadsAuth, { search: 'Cubbon' });
    assert(roadsListWithParks.body.complaints.length === 0, 'Test B1: Roads authority cannot find Parks complaint via search/list');

    // Attempt direct inspection via getComplaintByRefId
    const roadsInspectRes = await runMockRequest(getComplaintByRefId, roadsAuth, {}, { id: 'CRP-2026-REASSIGNED1' });
    assert(roadsInspectRes.statusCode === 403, `Test B2: Roads authority inspecting Parks complaint is blocked (HTTP ${roadsInspectRes.statusCode})`);

    // Attempt direct status update via updateComplaintStatus
    const roadsUpdateRes = await runMockRequest(
      updateComplaintStatus,
      roadsAuth,
      {},
      { id: 'CRP-2026-REASSIGNED1' },
      { status: 'Under Review', remark: 'Unauthorized attempt by roads officer' }
    );
    assert(roadsUpdateRes.statusCode === 403, `Test B3: Roads authority updating Parks complaint status is blocked (HTTP ${roadsUpdateRes.statusCode})`);

    // ----------------------------------------------------
    // TEST C: Status Updates After Reassignment
    // ----------------------------------------------------
    // Authorized receiving department officer (Parks) CAN update status
    const parksUpdateRes = await runMockRequest(
      updateComplaintStatus,
      parksAuth,
      {},
      { id: 'CRP-2026-REASSIGNED1' },
      { status: 'Under Review', remark: 'Inspection scheduled by Horticulture officer' }
    );
    assert(parksUpdateRes.statusCode === 200, `Test C1: Parks officer successfully updates reassigned complaint status (HTTP ${parksUpdateRes.statusCode})`);
    const updatedCompInDb = await Complaint.findOne({ referenceId: 'CRP-2026-REASSIGNED1' });
    assert(updatedCompInDb.status === 'Under Review', `Test C2: DB status verified as Under Review (got ${updatedCompInDb.status})`);
    assert(updatedCompInDb.statusHistory.length > 0, 'Test C3: Status history audit entry recorded');

    // Revert status to In Progress for subsequent tests
    await Complaint.updateOne({ referenceId: 'CRP-2026-REASSIGNED1' }, { status: 'In Progress' });

    // ----------------------------------------------------
    // TEST D: Departmental Analytics Grouping
    // ----------------------------------------------------
    // In upper authority analytics, the reassigned complaint (category 'Other Issues')
    // must be credited to 'Parks & Public Amenities Directorate', NOT 'Central Civic Redressal Cell'
    const adminAnalyticsRes = await runMockRequest(getDashboardStats, upperAdmin);
    assert(adminAnalyticsRes.statusCode === 200, 'Test D1: Admin analytics returns HTTP 200');
    const deptStats = adminAnalyticsRes.body.data.departmentStats;
    const parksDeptMetric = deptStats.find(d => d.department === 'Parks & Public Amenities Directorate');
    assert(Boolean(parksDeptMetric), 'Test D2: Parks & Public Amenities Directorate exists in departmentStats');
    assert(parksDeptMetric.total === 3, `Test D3: Parks department total includes reassigned complaint (got ${parksDeptMetric.total}, expected 3)`);
    assert(parksDeptMetric.inProgress === 1, `Test D4: Parks department inProgress includes reassigned complaint (got ${parksDeptMetric.inProgress}, expected 1)`);
    assert(parksDeptMetric.resolved === 2, `Test D5: Parks department resolved is 2 (got ${parksDeptMetric.resolved}, expected 2)`);

    // Reconcile department breakdown totals with top-level stats
    const deptTotalSum = deptStats.reduce((acc, d) => acc + d.total, 0);
    assert(deptTotalSum === adminAnalyticsRes.body.data.stats.total, `Test D6: Department totals reconcile with top-level stats (${deptTotalSum} == ${adminAnalyticsRes.body.data.stats.total})`);

    // ----------------------------------------------------
    // TEST E: Deleted Complaints Scoping and Reconciliation
    // ----------------------------------------------------
    // Create deleted complaints in different departments
    await Complaint.create({
      referenceId: 'CRP-2026-DEL-PARKS1',
      category: 'Public Spaces',
      assignedDepartment: 'Parks & Public Amenities Directorate',
      title: 'Deleted bench complaint',
      description: 'Citizen withdrew report',
      location: 'Lalbagh',
      ward: 'Ward 25',
      city: 'Bengaluru',
      latitude: 12.97,
      longitude: 77.59,
      citizen: { name: 'Citizen Del', phone: '9876543219', email: 'del@test.com' },
      status: 'Submitted',
      deletedByCitizen: true,
      deletedAt: new Date()
    });

    await Complaint.create({
      referenceId: 'CRP-2026-DEL-REASSIGNED-PARKS',
      category: 'Other Issues',
      assignedDepartment: 'Parks & Public Amenities Directorate',
      title: 'Deleted reassigned park complaint',
      description: 'Citizen withdrew park report',
      location: 'Cubbon Park',
      ward: 'Ward 25',
      city: 'Bengaluru',
      latitude: 12.97,
      longitude: 77.59,
      citizen: { name: 'Citizen Del2', phone: '9876543218', email: 'del2@test.com' },
      status: 'Under Review',
      deletedByCitizen: true,
      deletedAt: new Date()
    });

    await Complaint.create({
      referenceId: 'CRP-2026-DEL-WATER',
      category: 'Water Supply',
      assignedDepartment: 'Water Supply & Jal Board',
      title: 'Deleted water pipeline report',
      description: 'Withdrawn by citizen',
      location: 'Indiranagar',
      ward: 'Ward 12',
      city: 'Bengaluru',
      latitude: 12.98,
      longitude: 77.64,
      citizen: { name: 'Citizen Water', phone: '9876543217', email: 'delwater@test.com' },
      status: 'Submitted',
      deletedByCitizen: true,
      deletedAt: new Date()
    });

    // Verify Parks dashboard deleted count
    const parksDashWithDel = await runMockRequest(getDashboardStats, parksAuth);
    assert(parksDashWithDel.body.data.stats.deletedCount === 2, `Test E1: Parks dashboard deleted count is 2 (got ${parksDashWithDel.body.data.stats.deletedCount})`);

    // Verify Parks getDeletedComplaints list
    const parksDelList = await runMockRequest(getDeletedComplaints, parksAuth, {});
    assert(parksDelList.statusCode === 200, 'Test E2: Parks getDeletedComplaints returns HTTP 200');
    assert(parksDelList.body.total === 2, `Test E3: Deleted complaints total matches dashboard count (2 == ${parksDelList.body.total})`);
    assert(parksDelList.body.complaints.length === 2, `Test E4: Deleted complaints list count is 2 (got ${parksDelList.body.complaints.length})`);
    const delRefIds = parksDelList.body.complaints.map(c => c.referenceId);
    assert(delRefIds.includes('CRP-2026-DEL-PARKS1'), 'Test E5: Includes native deleted parks complaint');
    assert(delRefIds.includes('CRP-2026-DEL-REASSIGNED-PARKS'), 'Test E6: Includes reassigned deleted parks complaint');
    assert(!delRefIds.includes('CRP-2026-DEL-WATER'), 'Test E7: Excludes unrelated Water deleted complaint');

    // Active complaints must never appear in deleted list
    assert(!delRefIds.includes('CRP-2026-PARKS-NATIVE1'), 'Test E8: Active complaints strictly excluded from deleted complaints');

    // Lower authority Roads cannot see Parks deleted complaints
    const roadsDelList = await runMockRequest(getDeletedComplaints, roadsAuth, {});
    const roadsDelIds = roadsDelList.body.complaints.map(c => c.referenceId);
    assert(!roadsDelIds.includes('CRP-2026-DEL-PARKS1'), 'Test E9: Roads authority cannot view Parks deleted complaints');

    // ----------------------------------------------------
    // TEST F: Main Municipal Authority Permissions
    // ----------------------------------------------------
    // Main authority sees complaints organization-wide
    const adminAllComplaints = await runMockRequest(getComplaints, upperAdmin, {});
    assert(adminAllComplaints.statusCode === 200, 'Test F1: Admin getComplaints returns HTTP 200');
    assert(adminAllComplaints.body.total > 15, `Test F2: Admin sees organization-wide complaints (total=${adminAllComplaints.body.total})`);

    // Main authority can filter by category
    const adminWaterList = await runMockRequest(getComplaints, upperAdmin, { category: 'Water Supply' });
    assert(adminWaterList.body.total === 2, `Test F3: Admin category filtering by Water Supply returns 2 complaints (got ${adminWaterList.body.total})`);
    const allWaterCategory = adminWaterList.body.complaints.every(c => c.category === 'Water Supply');
    assert(allWaterCategory, 'Test F4: All returned complaints belong to Water Supply category');

    // ----------------------------------------------------
    // TEST G: Citizen Access & Privacy Safeguards
    // ----------------------------------------------------
    // Citizen myReports filter only returns complaints created by this citizen
    const citizenMyReports = await runMockRequest(getComplaints, citizenUser, { myReports: 'true' });
    assert(citizenMyReports.statusCode === 200, 'Test G1: Citizen myReports returns HTTP 200');
    assert(citizenMyReports.body.total >= 2, `Test G2: Citizen sees own reports (total=${citizenMyReports.body.total})`);
    const citizenRefIds = citizenMyReports.body.complaints.map(c => c.referenceId);
    assert(citizenRefIds.includes('CRP-2026-REASSIGNED1'), 'Test G3: Citizen own complaint present in myReports');

    // Public feed (unauthenticated) excludes deleted complaints and masks citizen PII
    const publicFeed = await runMockRequest(getComplaints, null, {});
    assert(publicFeed.statusCode === 200, 'Test G4: Public complaints feed returns HTTP 200');
    const publicDelPresent = publicFeed.body.complaints.some(c => c.deletedByCitizen === true);
    assert(!publicDelPresent, 'Test G5: Public feed strictly excludes citizen-deleted complaints');

    // Verify PII masking on public inspection
    const publicInspect = await runMockRequest(getComplaintByRefId, null, {}, { id: 'CRP-2026-PARKS-NATIVE1' });
    assert(publicInspect.statusCode === 200, 'Test G6: Public inspection returns HTTP 200');
    assert(publicInspect.body.complaint.citizen.phone.includes('*'), 'Test G7: Citizen phone number is masked for public');
    assert(publicInspect.body.complaint.citizen.email.includes('*'), 'Test G8: Citizen email is masked for public');

    // ----------------------------------------------------
    // TEST H: Pagination and Search Filtering
    // ----------------------------------------------------
    // Pagination: page=1&limit=2 returns 2 items on page, but total is 3
    const parksPaged = await runMockRequest(getComplaints, parksAuth, { page: 1, limit: 2 });
    assert(parksPaged.body.complaints.length === 2, `Test H1: Page 1 limit 2 returns 2 items (got ${parksPaged.body.complaints.length})`);
    assert(parksPaged.body.total === 3, `Test H2: Total count remains complete eligible count 3 (got ${parksPaged.body.total})`);
    assert(parksPaged.body.pages === 2, `Test H3: Calculated pages is 2 (got ${parksPaged.body.pages})`);

    // Search: keyword matching title/description within authority scope
    const parksSearch = await runMockRequest(getComplaints, parksAuth, { search: 'debris' });
    assert(parksSearch.body.total === 1, `Test H4: Scoped search for "debris" returns 1 result (got ${parksSearch.body.total})`);
    assert(parksSearch.body.complaints[0]?.referenceId === 'CRP-2026-REASSIGNED1', 'Test H5: Scoped search matches reassigned complaint');

    // Status filter: 'Resolved' returns 2 resolved complaints
    const parksResolvedList = await runMockRequest(getComplaints, parksAuth, { status: 'Resolved' });
    assert(parksResolvedList.body.total === 2, `Test H6: Status filter "Resolved" returns 2 items (got ${parksResolvedList.body.total})`);
    assert(parksResolvedList.body.complaints.every(c => c.status === 'Resolved'), 'Test H7: All items in resolved filter have status Resolved');

  } catch (err) {
    console.error('Fatal test execution error:', err);
    failed++;
  } finally {
    await teardownDB();
  }

  console.log('====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests();
