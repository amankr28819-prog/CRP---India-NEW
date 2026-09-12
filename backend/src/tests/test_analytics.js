const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const {
  getDashboardStats,
  getAuthorityComplaintScope,
  categoryDepartmentMap
} = require('../controllers/authorityController');

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

function runMockRequest(handler, user, query = {}) {
  return new Promise((resolve, reject) => {
    const req = { user, query };
    const res = {
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
      else resolve({ statusCode: 200, body: null });
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
    // Roads: (48h + 96h + 144h) / 3 = 288h / 3 = 96.0 hrs
    assert(roadsRes.body.data.stats.avgTurnaroundHours === 96, `H/J1: Average turnaround for Roads is 96.0 hrs (got ${roadsRes.body.data.stats.avgTurnaroundHours})`);
    assert(roadsRes.body.data.stats.avgTurnaroundDisplay === '96 hrs', `H/J2: Formatted turnaround display is "96 hrs" (got "${roadsRes.body.data.stats.avgTurnaroundDisplay}")`);

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
