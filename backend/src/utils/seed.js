require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Counter = require('../models/Counter');

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
    description: 'A crater-sized pothole has developed following last week heavy rainfall right next to the metro pillar. Multiple two-wheelers have slipped during peak hours. Urgent cold-mix patching required before monsoon intensifies.',
    location: 'Outer Ring Road, Opposite Sector 4 Bus Stop',
    ward: 'Ward 14 (Indiranagar)',
    city: 'Bengaluru',
    latitude: 12.9784,
    longitude: 77.6408,
    images: [],
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
    ]
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
    images: [],
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
    ]
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
    images: [],
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
    remarks: []
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
    title: 'Discolored drinking water supply with low pipeline pressure',
    description: 'Morning municipal water supply had heavy brownish sedimentation and odor. Pipeline pressure was insufficient to reach first-floor storage tanks.',
    location: 'Laxmi Nagar, Lane 3, House 45-B',
    ward: 'Ward 09 (Central Zone)',
    city: 'Jaipur',
    latitude: 26.9124,
    longitude: 75.7873,
    images: [],
    status: 'Resolved',
    assignedDepartment: 'Water Supply & Jal Board',
    assignedOfficer: 'M. K. Singhal (Water Works Engineer)',
    statusHistory: [
      {
        status: 'Submitted',
        changedBy: 'Amit Kumar',
        remark: 'Water contamination report submitted.',
        timestamp: new Date(Date.now() - 6 * 86400000)
      },
      {
        status: 'Assigned',
        changedBy: 'Jal Board Control',
        remark: 'Pipeline inspection team assigned.',
        timestamp: new Date(Date.now() - 5 * 86400000)
      },
      {
        status: 'In Progress',
        changedBy: 'M. K. Singhal',
        remark: 'Detected minor hairline crack in feeder pipeline near junction valve. Repair underway.',
        timestamp: new Date(Date.now() - 3 * 86400000)
      },
      {
        status: 'Resolved',
        changedBy: 'M. K. Singhal',
        remark: 'Feeder pipe replaced, main line flushed and water quality test cleared.',
        timestamp: new Date(Date.now() - 1 * 86400000)
      }
    ],
    remarks: [
      {
        text: 'Flushing complete. Tested potable water sample at PHED laboratory.',
        author: 'M. K. Singhal',
        createdAt: new Date(Date.now() - 1 * 86400000)
      }
    ]
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
    images: [],
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
    remarks: []
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

    console.log('[SEED] Initializing Counter...');
    const currentYear = new Date().getFullYear();
    await Counter.create({
      _id: `complaints_${currentYear}`,
      seq: 105
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
      role: 'citizen'
    });

    console.log('[SEED] Creating sample complaints...');
    await Complaint.insertMany(sampleComplaintsData(citizen1));

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