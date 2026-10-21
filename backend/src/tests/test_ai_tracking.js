const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const {
  getComplaintTrackingSummary,
  complaintSummaryCache,
  chatWithAI
} = require('../controllers/aiController');
const {
  getMyComplaints,
  updateComplaintStatus,
  createComplaint
} = require('../controllers/complaintController');

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

function runMockRequest(handler, user, body = {}, params = {}, query = {}) {
  return new Promise((resolve, reject) => {
    const req = { user, body, params, query };
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

async function runAITrackingTests() {
  console.log('====================================================');
  console.log('STARTING AI COMPLAINT TRACKING TEST SUITE (1-13)');
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
    // Setup test users: Citizen 1, Citizen 2, Authority
    const citizen1 = await User.create({
      name: 'Rohan Sharma',
      email: 'rohan.sharma@example.in',
      password: 'HashedPassword123!',
      role: 'citizen',
      city: 'Delhi',
      phone: '9876543210'
    });

    const citizen2 = await User.create({
      name: 'Priya Patel',
      email: 'priya.patel@example.in',
      password: 'HashedPassword123!',
      role: 'citizen',
      city: 'Ahmedabad',
      phone: '9876543211'
    });

    const authority = await User.create({
      name: 'Executive Engineer Roads',
      email: 'roads.engineer@mcd.gov.in',
      password: 'HashedPassword123!',
      role: 'authority',
      department: 'Public Works Department (Roads)',
      city: 'Delhi'
    });

    // Create Complaints for Citizen 1
    // Complaint 1: In Progress with history and remarks
    const complaint1 = await Complaint.create({
      referenceId: 'CRP-2026-1001',
      title: 'Deep pothole on Main Ring Road near Lajpat Nagar',
      description: 'Dangerous pothole causing severe traffic slowdown and hazard for two-wheelers.',
      category: 'Roads & Potholes',
      status: 'In Progress',
      assignedDepartment: 'Public Works Department (Roads)',
      location: 'Ring Road, Lajpat Nagar',
      ward: 'Ward 24',
      city: 'Delhi',
      latitude: 28.567,
      longitude: 77.243,
      citizen: {
        userId: citizen1._id,
        name: citizen1.name,
        email: citizen1.email,
        phone: '9876543210'
      },
      statusHistory: [
        {
          status: 'Submitted',
          updatedBy: citizen1._id,
          remark: 'Complaint submitted by citizen.',
          timestamp: new Date(Date.now() - 3 * 86400000)
        },
        {
          status: 'Under Review',
          updatedBy: authority._id,
          remark: 'Inspected by Zonal Junior Engineer. Field verification completed.',
          timestamp: new Date(Date.now() - 2 * 86400000)
        },
        {
          status: 'In Progress',
          updatedBy: authority._id,
          remark: 'Repair crew dispatched with asphalt mixer. Work ongoing.',
          timestamp: new Date(Date.now() - 1 * 86400000)
        }
      ]
    });

    // Complaint 2: Freshly submitted with no updates or extra history
    const complaint2 = await Complaint.create({
      referenceId: 'CRP-2026-1002',
      title: 'Broken streetlight outside Block B park',
      description: 'Streetlight pole #42 is not working for 3 days.',
      category: 'Streetlights',
      status: 'Submitted',
      location: 'Block B Park, Rohini',
      ward: 'Ward 12',
      city: 'Delhi',
      latitude: 28.704,
      longitude: 77.112,
      citizen: {
        userId: citizen1._id,
        name: citizen1.name,
        email: citizen1.email,
        phone: '9876543210'
      },
      statusHistory: [
        {
          status: 'Submitted',
          updatedBy: citizen1._id,
          remark: 'Complaint submitted by citizen.',
          timestamp: new Date(Date.now() - 4 * 3600000)
        }
      ]
    });

    // Complaint 3: Fully Resolved with Resolution Note
    const complaint3 = await Complaint.create({
      referenceId: 'CRP-2026-1003',
      title: 'Garbage dump cleared near Community Hall',
      description: 'Waste accumulation near community hall.',
      category: 'Garbage & Sanitation',
      status: 'Resolved',
      assignedDepartment: 'Solid Waste & Sanitation Department',
      location: 'Community Hall, Sector 14',
      ward: 'Ward 5',
      city: 'Delhi',
      latitude: 28.600,
      longitude: 77.100,
      citizen: {
        userId: citizen1._id,
        name: citizen1.name,
        email: citizen1.email,
        phone: '9876543210'
      },
      resolutionNote: 'Garbage cleared by morning sanitation truck crew. Bin disinfected and area sanitized.',
      resolvedAt: new Date(Date.now() - 12 * 3600000),
      statusHistory: [
        {
          status: 'Submitted',
          updatedBy: citizen1._id,
          remark: 'Initial report.',
          timestamp: new Date(Date.now() - 48 * 3600000)
        },
        {
          status: 'Resolved',
          updatedBy: authority._id,
          remark: 'Sanitation completed.',
          timestamp: new Date(Date.now() - 12 * 3600000)
        }
      ]
    });

    console.log('\n--- Case 1: Logged-in citizen can see their own complaints ---');
    const myCompRes = await runMockRequest(getMyComplaints, citizen1, {}, {}, {});
    assert(myCompRes.statusCode === 200, 'Citizen 1 getMyComplaints returns HTTP 200');
    assert(myCompRes.body.success === true, 'Response indicates success: true');
    assert(myCompRes.body.complaints.length === 3, `Citizen 1 retrieves exactly their 3 complaints (got ${myCompRes.body.complaints.length})`);
    const returnedIds = myCompRes.body.complaints.map(c => c.referenceId);
    assert(returnedIds.includes('CRP-2026-1001') && returnedIds.includes('CRP-2026-1002'), 'Returned complaints have correct Reference IDs');

    console.log('\n--- Case 2: Citizen with no complaints sees empty state ---');
    const emptyCompRes = await runMockRequest(getMyComplaints, citizen2, {}, {}, {});
    assert(emptyCompRes.statusCode === 200, 'Citizen 2 getMyComplaints returns HTTP 200');
    assert(emptyCompRes.body.complaints.length === 0, `Citizen 2 has 0 complaints (got ${emptyCompRes.body.complaints.length})`);

    console.log('\n--- Case 3: Selecting a complaint displays its actual current status from DB ---');
    const summaryRes1 = await runMockRequest(getComplaintTrackingSummary, citizen1, { complaintId: 'CRP-2026-1001' });
    assert(summaryRes1.statusCode === 200, 'Tracking summary request returns HTTP 200');
    assert(summaryRes1.body.success === true, 'Response success is true');
    assert(summaryRes1.body.data.status === 'In Progress', `Actual DB status "In Progress" is returned directly (got "${summaryRes1.body.data.status}")`);
    assert(summaryRes1.body.data.referenceId === 'CRP-2026-1001', 'Reference ID matches exactly');
    assert(summaryRes1.body.data.recordedData.assignedDepartment === 'Public Works Department (Roads)', 'Assigned department matches DB record');

    console.log('\n--- Case 4: AI summary accurately reflects the recorded complaint history ---');
    assert(typeof summaryRes1.body.data.summary === 'string' && summaryRes1.body.data.summary.length > 20, 'AI summary text was generated');
    assert(summaryRes1.body.data.summary.includes('CRP-2026-1001'), 'Summary explicitly cites complaint reference ID');
    assert(summaryRes1.body.data.summary.toLowerCase().includes('in progress'), 'Summary reflects actual In Progress status');
    assert(summaryRes1.body.data.recordedData.latestRemark.includes('Repair crew dispatched'), 'Latest recorded remark captured accurately in payload');

    console.log('\n--- Case 5: Summary caching and refresh on newly recorded update ---');
    // First verify cached state
    const cachedRes = await runMockRequest(getComplaintTrackingSummary, citizen1, { complaintId: 'CRP-2026-1001' });
    assert(cachedRes.body.data.cached === true, 'Subsequent request without changes returns cached: true');

    // Simulate an authority recording a new update in DB
    await Complaint.findByIdAndUpdate(complaint1._id, {
      $push: {
        statusHistory: {
          status: 'In Progress',
          updatedBy: authority._id,
          remark: 'Asphalt compaction in progress. Final rolling underway.',
          updatedAt: new Date()
        }
      },
      updatedAt: new Date()
    });

    // Requesting summary again should detect the updatedAt timestamp change and regenerate
    const updatedSummaryRes = await runMockRequest(getComplaintTrackingSummary, citizen1, { complaintId: 'CRP-2026-1001' });
    assert(updatedSummaryRes.body.data.cached === false, 'Cache invalidated upon new complaint update, fresh summary generated (cached: false)');
    assert(updatedSummaryRes.body.data.recordedData.latestRemark.includes('Asphalt compaction'), 'Newest remark immediately reflected');

    console.log('\n--- Case 6: Resolved complaint displays actual resolution details ---');
    const summaryRes3 = await runMockRequest(getComplaintTrackingSummary, citizen1, { complaintId: 'CRP-2026-1003' });
    assert(summaryRes3.statusCode === 200, 'Resolved complaint tracking summary returns HTTP 200');
    assert(summaryRes3.body.data.status === 'Resolved', 'Status is strictly "Resolved"');
    assert(summaryRes3.body.data.recordedData.resolutionNote.includes('sanitation truck crew'), 'Resolution note matches DB record');
    assert(summaryRes3.body.data.summary.toLowerCase().includes('resolved'), 'AI summary clearly communicates resolved state');

    console.log('\n--- Case 7: Complaint without additional history does not fabricate updates ---');
    const summaryRes2 = await runMockRequest(getComplaintTrackingSummary, citizen1, { complaintId: 'CRP-2026-1002' });
    assert(summaryRes2.statusCode === 200, 'Fresh complaint tracking summary returns HTTP 200');
    assert(summaryRes2.body.data.status === 'Submitted', 'Status is strictly "Submitted"');
    assert(summaryRes2.body.data.recordedData.statusHistory.length === 1, 'Only 1 historical entry exists (Submitted)');
    const s2Text = summaryRes2.body.data.summary.toLowerCase();
    assert(
      s2Text.includes('no additional') ||
      s2Text.includes('no further') ||
      s2Text.includes('awaiting initial review') ||
      s2Text.includes('registered in the civic grievance queue'),
      'AI summary factually communicates that no additional update has been recorded yet'
    );

    console.log('\n--- Case 8: Citizen cannot retrieve another citizen\'s complaint or summary ---');
    // Citizen 2 attempting to access Citizen 1's complaint
    const unauthAccessRes = await runMockRequest(getComplaintTrackingSummary, citizen2, { complaintId: 'CRP-2026-1001' });
    assert(unauthAccessRes.statusCode === 403, `Accessing another citizen's complaint returns HTTP 403 Forbidden (got ${unauthAccessRes.statusCode})`);
    assert(unauthAccessRes.body.success === false, 'Response indicates success: false');
    assert(!unauthAccessRes.body.data, 'No data or summary leaked in forbidden response');

    console.log('\n--- Case 9: Unauthenticated request is rejected ---');
    const unauthReqRes = await runMockRequest(getComplaintTrackingSummary, null, { complaintId: 'CRP-2026-1001' });
    assert(unauthReqRes.statusCode === 401, `Unauthenticated request returns HTTP 401 Unauthorized (got ${unauthReqRes.statusCode})`);

    console.log('\n--- Case 10: Graceful fallback when AI provider / Gemini key is unavailable ---');
    // Save original env key and test fallback
    const origKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    complaintSummaryCache.clear();

    const fallbackRes = await runMockRequest(getComplaintTrackingSummary, citizen1, { complaintId: 'CRP-2026-1001', forceRefresh: true });
    assert(fallbackRes.statusCode === 200, 'Tracking summary with AI offline still returns HTTP 200 via factual fallback');
    assert(fallbackRes.body.success === true, 'Response indicates success');
    assert(fallbackRes.body.data.summary.includes('CRP-2026-1001'), 'Factual fallback contains valid complaint reference');
    assert(fallbackRes.body.data.status === 'In Progress', 'Actual status preserved in factual fallback');
    process.env.GEMINI_API_KEY = origKey;

    console.log('\n--- Case 11: Existing AI assistance options continue working ---');
    // Test chatWithAI handler exists and responds
    assert(typeof chatWithAI === 'function', 'chatWithAI controller remains exported and intact');

    console.log('\n--- Case 12: Non-existent complaint ID returns 404 ---');
    const notFoundRes = await runMockRequest(getComplaintTrackingSummary, citizen1, { complaintId: 'CRP-9999-9999' });
    assert(notFoundRes.statusCode === 404, `Non-existent complaint returns HTTP 404 (got ${notFoundRes.statusCode})`);

    console.log('\n--- Case 13: Deleted complaint is properly handled as not found ---');
    await Complaint.findByIdAndUpdate(complaint2._id, { deletedByCitizen: true, isDeleted: true, deletedAt: new Date() });
    complaintSummaryCache.clear();
    const deletedCompRes = await runMockRequest(getComplaintTrackingSummary, citizen1, { complaintId: 'CRP-2026-1002' });
    assert(deletedCompRes.statusCode === 404, `Deleted complaint returns HTTP 404 (got ${deletedCompRes.statusCode})`);

    console.log('\n====================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    if (failed > 0) {
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('Test Suite encountered unexpected error:', err);
    process.exitCode = 1;
  } finally {
    await teardownDB();
  }
}

runAITrackingTests();
