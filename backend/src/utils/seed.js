require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Counter = require('../models/Counter');
const Notification = require('../models/Notification');

const sampleComplaintsData = (citizen1) => [
  {
    referenceId: 'CRP-2026-00101',
    citizen: {
      name: citizen1.name,
      phone: citizen1.phone,
      email: citizen1.email,
      userId: citizen1._id
    },
    category: 'Roads & Potholes',
    title: 'Deep pothole causing severe traffic congestion near Metro Pillar 142',
    description: 'A crater-sized pothole has developed following heavy rainfall right next to the metro pillar. Multiple two-wheelers have slipped during peak hours. Urgent cold-mix patching required before monsoon intensifies.',
    location: 'Outer Ring Road, Opposite Sector 4 Bus Stop',
    ward: 'Ward 14 (Indiranagar)',
    city: 'Bengaluru',
    latitude: 12.9784,
    longitude: 77.6408,
    images: ['/uploads/demo-pothole-before.jpg'],
    status: 'In Progress',
    assignedDepartment: 'Public Works Department (Roads)',
    assignedOfficer: 'Rajesh Sharma (Executive Zonal Engineer)',
    statusHistory: [
      {
        status: 'Submitted',
        changedBy: 'Amit Kumar',
        remark: 'Complaint registered via citizen online portal.',
        timestamp: new Date(Date.now() - 4 * 86400000)
      },
      {
        status: 'Under Review',
        changedBy: 'Central Grievance Desk',
        remark: 'Initial verification completed. Categorized under high-priority road hazard.',
        timestamp: new Date(Date.now() - 3 * 86400000)
      },
      {
        status: 'Assigned',
        changedBy: 'Rajesh Sharma',
        remark: 'Assigned to PWD Road Maintenance Crew #4.',
        timestamp: new Date(Date.now() - 2 * 86400000)
      },
      {
        status: 'In Progress',
        changedBy: 'Rajesh Sharma',
        remark: 'Asphalt cold patch mix dispatched. Road cordoned off with safety cones.',
        timestamp: new Date(Date.now() - 1 * 86400000)
      }
    ],
    remarks: [
      {
        text: 'Road maintenance crew scheduled on-site work for 11:00 AM.',
        author: 'Rajesh Sharma',
        createdAt: new Date(Date.now() - 1 * 86400000)
      }
    ],
    agreedToTerms: true
  },
  {
    referenceId: 'CRP-2026-00102',
    citizen: {
      name: 'Sunita Deshmukh',
      phone: '+91 94220 11223',
      email: 'sunita.d@example.com',
      userId: null
    },
    category: 'Garbage & Sanitation',
    title: 'Community garbage dumpster overflowing onto pedestrian footpath',
    description: 'The green waste container at the corner of 5th Main has not been cleared for four consecutive days. Waste is spilling over the walkway and stray animals are scattering bags.',
    location: 'Corner of 5th Main & Market Lane, Near Subhash Chowk',
    ward: 'Ward 07 (Kothrud)',
    city: 'Pune',
    latitude: 18.5074,
    longitude: 73.8077,
    images: ['/uploads/demo-garbage-before.jpg'],
    status: 'Assigned',
    assignedDepartment: 'Solid Waste & Sanitation Department',
    assignedOfficer: 'Priya Varma (Chief Sanitation Inspector)',
    statusHistory: [
      {
        status: 'Submitted',
        changedBy: 'Sunita Deshmukh',
        remark: 'Complaint registered online.',
        timestamp: new Date(Date.now() - 2 * 86400000)
      },
      {
        status: 'Assigned',
        changedBy: 'Priya Varma',
        remark: 'Assigned to Ward 07 compacting truck team for immediate clearance.',
        timestamp: new Date(Date.now() - 1 * 86400000)
      }
    ],
    remarks: [
      {
        text: 'Hydraulic compactor truck route redirected to attend this dumpster by 2 PM.',
        author: 'Priya Varma',
        createdAt: new Date(Date.now() - 1 * 86400000)
      }
    ],
    agreedToTerms: true
  },
  {
    referenceId: 'CRP-2026-00103',
    citizen: {
      name: 'Vikas Malhotra',
      phone: '+91 98101 99887',
      email: 'vikas.m@example.com',
      userId: null
    },
    category: 'Streetlights',
    title: 'Four consecutive streetlights unlit on Main Access Boulevard',
    description: 'Pole numbers SL-41 through SL-44 have been completely dark for over a week. The stretch is poorly lit and poses safety concerns for evening commuters.',
    location: 'Sector 62 Commercial Corridor, opposite Block C Gate',
    ward: 'Ward 22 (Industrial Zone)',
    city: 'Noida',
    latitude: 28.6280,
    longitude: 77.3649,
    images: ['/uploads/demo-streetlight-before.jpg'],
    status: 'Under Review',
    assignedDepartment: 'Municipal Electrical & Lighting Division',
    assignedOfficer: 'Pending Allocation',
    statusHistory: [
      {
        status: 'Submitted',
        changedBy: 'Vikas Malhotra',
        remark: 'Complaint submitted with pole numbers.',
        timestamp: new Date(Date.now() - 1 * 86400000)
      },
      {
        status: 'Under Review',
        changedBy: 'Municipal Control Room',
        remark: 'Feeder line circuit diagnosis initiated.',
        timestamp: new Date(Date.now() - 12 * 3600000)
      }
    ],
    remarks: [],
    agreedToTerms: true
  },
  {
    referenceId: 'CRP-2026-00104',
    citizen: {
      name: citizen1.name,
      phone: citizen1.phone,
      email: citizen1.email,
      userId: citizen1._id
    },
    category: 'Water Supply',
    title: 'Heavy water pipe leakage flooding street and causing water contamination',
    description: 'A municipal water supply pipe junction burst near the street crossing, creating standing water and low water pressure for adjacent households.',
    location: 'Laxmi Nagar, Lane 3, House 45-B',
    ward: 'Ward 09 (Central Zone)',
    city: 'Jaipur',
    latitude: 26.9124,
    longitude: 75.7873,
    images: ['/uploads/demo-water-before.jpg'],
    resolutionPhoto: '/uploads/demo-water-resolved.jpg',
    resolutionNote: 'Main pipeline junction excavated, fractured pipe section replaced with a new industrial cast-iron shutoff valve fitting, and sealed with fresh concrete. Water pressure fully restored and street dried.',
    resolvedAt: new Date(Date.now() - 1 * 86400000),
    resolvedBy: 'M. K. Singhal (Water Works Engineer)',
    status: 'Resolved',
    assignedDepartment: 'Water Supply & Jal Board',
    assignedOfficer: 'M. K. Singhal (Water Works Engineer)',
    statusHistory: [
      {
        status: 'Submitted',
        changedBy: 'Amit Kumar',
        remark: 'Water contamination and pipeline burst report submitted.',
        timestamp: new Date(Date.now() - 6 * 86400000)
      },
      {
        status: 'Assigned',
        changedBy: 'Jal Board Control',
        remark: 'Pipeline emergency response team assigned.',
        timestamp: new Date(Date.now() - 5 * 86400000)
      },
      {
        status: 'In Progress',
        changedBy: 'M. K. Singhal',
        remark: 'Trench excavated, replacement valve assembly positioned.',
        timestamp: new Date(Date.now() - 3 * 86400000)
      },
      {
        status: 'Resolved',
        changedBy: 'M. K. Singhal (Water Works Engineer)',
        remark: 'Resolved: Main pipeline junction excavated, fractured pipe section replaced with a new industrial cast-iron shutoff valve fitting, and sealed with fresh concrete.',
        timestamp: new Date(Date.now() - 1 * 86400000)
      }
    ],
    remarks: [
      {
        text: 'Valve replacement complete. Water quality and pressure verified across all connections.',
        author: 'M. K. Singhal',
        createdAt: new Date(Date.now() - 1 * 86400000)
      }
    ],
    agreedToTerms: true
  },
  {
    referenceId: 'CRP-2026-00105',
    citizen: {
      name: 'Kavita Iyer',
      phone: '+91 94440 33221',
      email: 'kavita.iyer@example.com',
      userId: null
    },
    category: 'Drainage',
    title: 'Stormwater drain grate clogged with plastic and silt runoff',
    description: 'The street level stormwater drain is completely blocked with debris. Even 10 minutes of drizzle causes knee-deep stagnant pooling on the road.',
    location: 'Anna Salai 2nd Cross, Near Post Office',
    ward: 'Ward 31 (T. Nagar)',
    city: 'Chennai',
    latitude: 13.0418,
    longitude: 80.2341,
    images: ['/uploads/demo-drain-before.jpg'],
    status: 'Submitted',
    assignedDepartment: 'Stormwater Drainage & Sewerage Board',
    assignedOfficer: 'Pending Allocation',
    statusHistory: [
      {
        status: 'Submitted',
        changedBy: 'Kavita Iyer',
        remark: 'Complaint registered via civic reporting platform.',
        timestamp: new Date()
      }
    ],
    remarks: [],
    agreedToTerms: true
  },
  {
    referenceId: 'CRP-2026-00106',
    citizen: {
      name: 'Rohan Deshmukh',
      phone: '+91 98230 45678',
      email: 'rohan.d@example.com',
      userId: null
    },
    category: 'Garbage & Sanitation',
    title: 'Overflowing commercial waste bin obstructing pedestrian corner',
    description: 'Large waste container overflowing on the sidewalk with domestic and market refuse. Waste spilling onto the pedestrian walking path and street corner.',
    location: 'Commercial Street Junction, Near Central Market',
    ward: 'Ward 12 (Central Zone)',
    city: 'Pune',
    latitude: 18.5204,
    longitude: 73.8567,
    images: ['/uploads/demo-garbage-before.jpg'],
    resolutionPhoto: '/uploads/demo-garbage-resolved.jpg',
    resolutionNote: 'Dumpster cleared by municipal compacting truck team. Sidewalk completely swept, sanitized, and waste container relocated to designated clean bay.',
    resolvedAt: new Date(Date.now() - 12 * 3600000),
    resolvedBy: 'Priya Varma (Chief Sanitation Inspector)',
    status: 'Resolved',
    assignedDepartment: 'Solid Waste & Sanitation Department',
    assignedOfficer: 'Priya Varma (Chief Sanitation Inspector)',
    statusHistory: [
      {
        status: 'Submitted',
        changedBy: 'Rohan Deshmukh',
        remark: 'Grievance submitted with photo of overflowing dumpster.',
        timestamp: new Date(Date.now() - 3 * 86400000)
      },
      {
        status: 'In Progress',
        changedBy: 'Priya Varma',
        remark: 'Compactor vehicle dispatched for site clearance.',
        timestamp: new Date(Date.now() - 1 * 86400000)
      },
      {
        status: 'Resolved',
        changedBy: 'Priya Varma (Chief Sanitation Inspector)',
        remark: 'Resolved: Dumpster cleared by municipal compacting truck team. Sidewalk completely swept, sanitized, and waste container relocated.',
        timestamp: new Date(Date.now() - 12 * 3600000)
      }
    ],
    remarks: [
      {
        text: 'Sanitation completed. Scheduled twice-daily clearance to prevent recurrence.',
        author: 'Priya Varma',
        createdAt: new Date(Date.now() - 12 * 3600000)
      }
    ],
    agreedToTerms: true
  },
  {
    referenceId: 'CRP-2026-00107',
    citizen: {
      name: 'Ananya Roy',
      phone: '+91 98300 67890',
      email: 'ananya.r@example.com',
      userId: null
    },
    category: 'Public Spaces',
    title: 'Broken concrete bench and damaged infrastructure in municipal park',
    description: 'The concrete bench near the jogging track has collapsed with cracked supports and exposed iron frame, posing safety hazards for senior citizens.',
    location: 'Children Public Park, Sector 5 Jogging Track',
    ward: 'Ward 18 (Green Belt)',
    city: 'Kolkata',
    latitude: 22.5726,
    longitude: 88.3639,
    images: ['/uploads/demo-park-before.jpg'],
    status: 'In Progress',
    assignedDepartment: 'Parks & Public Amenities Directorate',
    assignedOfficer: 'Suresh Sen (Horticulture & Civil Officer)',
    statusHistory: [
      {
        status: 'Submitted',
        changedBy: 'Ananya Roy',
        remark: 'Park damage reported.',
        timestamp: new Date(Date.now() - 2 * 86400000)
      },
      {
        status: 'In Progress',
        changedBy: 'Suresh Sen',
        remark: 'Site inspected. Procurement request initiated for reinforced precast park benches.',
        timestamp: new Date(Date.now() - 1 * 86400000)
      }
    ],
    remarks: [],
    agreedToTerms: true
  },
  {
    referenceId: 'CRP-2026-00108',
    citizen: {
      name: 'Gaurav Patel',
      phone: '+91 97250 12345',
      email: 'gaurav.p@example.com',
      userId: null
    },
    category: 'Other Issues',
    title: 'Construction debris and broken bricks dumped on pedestrian walkway',
    description: 'Demolition waste and masonry rubble dumped along the pavement forcing pedestrians to walk on the busy road with high speed traffic.',
    location: 'Station Road, Near City Post Office',
    ward: 'Ward 05 (East Zone)',
    city: 'Ahmedabad',
    latitude: 23.0225,
    longitude: 72.5714,
    images: ['/uploads/demo-debris-before.jpg'],
    status: 'Under Review',
    assignedDepartment: 'Central Civic Redressal Cell',
    assignedOfficer: 'Pending Allocation',
    statusHistory: [
      {
        status: 'Submitted',
        changedBy: 'Gaurav Patel',
        remark: 'Footpath encroachment reported.',
        timestamp: new Date(Date.now() - 1 * 86400000)
      },
      {
        status: 'Under Review',
        changedBy: 'Encroachment Clearance Cell',
        remark: 'Notice being drafted to property owner adjacent to site.',
        timestamp: new Date(Date.now() - 8 * 3600000)
      }
    ],
    remarks: [],
    agreedToTerms: true
  },
  {
    referenceId: 'CRP-2026-00109',
    citizen: {
      name: citizen1.name,
      phone: citizen1.phone,
      email: citizen1.email,
      userId: citizen1._id
    },
    category: 'Roads & Potholes',
    title: 'Deep road crater and collapsed asphalt near market entrance',
    description: 'Large pothole and surface breakdown on primary commercial market access road causing vehicle damage and traffic hazards.',
    location: 'Main Bazar Road, Near Old Clock Tower',
    ward: 'Ward 25 (West Zone)',
    city: 'Delhi',
    latitude: 28.6139,
    longitude: 77.2090,
    images: ['/uploads/demo-pothole-before.jpg'],
    resolutionPhoto: '/uploads/demo-pothole-resolved.jpg',
    resolutionNote: 'Road crater filled with aggregate sub-base, hot asphalt bituminous mix applied, compacted with roller, and barricades removed. Road fully reopened.',
    resolvedAt: new Date(Date.now() - 2 * 86400000),
    resolvedBy: 'Rajesh Sharma (Executive Zonal Engineer)',
    status: 'Resolved',
    assignedDepartment: 'Public Works Department (Roads)',
    assignedOfficer: 'Rajesh Sharma (Executive Zonal Engineer)',
    statusHistory: [
      {
        status: 'Submitted',
        changedBy: 'Amit Kumar',
        remark: 'Road pothole reported with photos.',
        timestamp: new Date(Date.now() - 5 * 86400000)
      },
      {
        status: 'In Progress',
        changedBy: 'Rajesh Sharma',
        remark: 'PWD Road repair crew mobilized with asphalt mix.',
        timestamp: new Date(Date.now() - 3 * 86400000)
      },
      {
        status: 'Resolved',
        changedBy: 'Rajesh Sharma (Executive Zonal Engineer)',
        remark: 'Resolved: Road crater filled with aggregate sub-base, hot asphalt bituminous mix applied, compacted with roller.',
        timestamp: new Date(Date.now() - 2 * 86400000)
      }
    ],
    remarks: [
      {
        text: 'Repair finished and road inspection approved for traffic safety.',
        author: 'Rajesh Sharma',
        createdAt: new Date(Date.now() - 2 * 86400000)
      }
    ],
    agreedToTerms: true
  }
];

const seedData = async (shouldExit = true) => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0 && !shouldExit) {
      // Already populated, skip automatic seed
      return;
    }

    console.log('[SEED] Clearing existing data...');
    await User.deleteMany({});
    await Complaint.deleteMany({});
    await Counter.deleteMany({});
    await Notification.deleteMany({});

    console.log('[SEED] Initializing Counter...');
    const currentYear = new Date().getFullYear();
    await Counter.create({
      _id: `complaints_${currentYear}`,
      seq: 109
    });

    console.log('[SEED] Creating authority and citizen users...');
    const authority1 = await User.create({
      name: 'Rajesh Sharma',
      email: 'authority@crp.gov.in',
      password: 'Authority@123',
      phone: '+91 98110 12345',
      role: 'authority',
      department: 'Public Works Department (Roads)',
      designation: 'Executive Zonal Engineer'
    });

    await User.create({
      name: 'Priya Varma',
      email: 'sanitation.officer@crp.gov.in',
      password: 'Authority@123',
      phone: '+91 98220 54321',
      role: 'authority',
      department: 'Solid Waste & Sanitation Department',
      designation: 'Chief Sanitation Inspector'
    });

    const citizen1 = await User.create({
      name: 'Amit Kumar',
      email: 'citizen@example.com',
      password: 'Citizen@123',
      phone: '+91 98765 43210',
      voterId: 'ABC1234567',
      role: 'citizen'
    });

    console.log('[SEED] Creating sample complaints with realistic civic photos...');
    await Complaint.insertMany(sampleComplaintsData(citizen1));

    console.log('[SEED] Creating sample notifications for citizen...');
    await Notification.insertMany([
      {
        recipient: citizen1._id,
        title: 'Complaint Registered',
        message: 'Your grievance regarding "Deep pothole causing severe traffic congestion near Metro Pillar 142" has been registered with Reference ID CRP-2026-00101.',
        type: 'submission',
        referenceId: 'CRP-2026-00101',
        isRead: true,
        createdAt: new Date(Date.now() - 4 * 86400000)
      },
      {
        recipient: citizen1._id,
        title: 'Department Assigned',
        message: 'Your grievance CRP-2026-00101 has been assigned to Public Works Department (Roads) (Officer: Rajesh Sharma).',
        type: 'assignment',
        referenceId: 'CRP-2026-00101',
        isRead: true,
        createdAt: new Date(Date.now() - 2 * 86400000)
      },
      {
        recipient: citizen1._id,
        title: 'Status Updated: In Progress',
        message: 'Status of grievance CRP-2026-00101 has been updated to "In Progress". Remark: Asphalt cold patch mix dispatched.',
        type: 'status_change',
        referenceId: 'CRP-2026-00101',
        isRead: false,
        createdAt: new Date(Date.now() - 1 * 86400000)
      },
      {
        recipient: citizen1._id,
        title: 'Complaint Resolved',
        message: 'Your grievance CRP-2026-00109 has been marked as Resolved by municipal authorities. Road crater filled and traffic restored.',
        type: 'resolution',
        referenceId: 'CRP-2026-00109',
        isRead: false,
        createdAt: new Date(Date.now() - 3600000)
      }
    ]);

    console.log('[SEED] Data seeding completed successfully!');
    if (shouldExit) {
      process.exit(0);
    }
  } catch (err) {
    console.error('[SEED] Error during seeding:', err);
    if (shouldExit) process.exit(1);
  }
};

if (require.main === module) {
  connectDB().then(() => seedData(true));
}

module.exports = { seedData };