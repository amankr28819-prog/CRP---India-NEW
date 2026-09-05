require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Counter = require('../models/Counter');
const Notification = require('../models/Notification');

// Precomputed bcrypt hashes for all 9 demo citizens (salt = 10)
// No plaintext passwords stored in source code
const demoCitizensData = [
  {
    name: 'Amit Kumar',
    email: 'citizen@example.com',
    password: '$2a$10$ofxM4GxhdE8mJS6w3RP5run6ANdoOzjDXaZ4j2RgOtHjqt9DjcChi',
    phone: '+91 98765 43210',
    voterId: 'ABC1234567',
    role: 'citizen'
  },
  {
    name: 'Sunita Deshmukh',
    email: 'sunita.d@example.com',
    password: '$2a$10$S.oCZGe9769A7DmmkA8ahelprJ3yVwGn82tl5FwOH/bkE7ZYXzu4i',
    phone: '+91 94220 11223',
    voterId: 'SND2345678',
    role: 'citizen'
  },
  {
    name: 'Vikas Malhotra',
    email: 'vikas.m@example.com',
    password: '$2a$10$jEzvzOzNjjs0wJVJMN8ROuhSQOoYlgxqBElcfJCX5MsXB8qyqAfbC',
    phone: '+91 98101 99887',
    voterId: 'VKM3456789',
    role: 'citizen'
  },
  {
    name: 'Kavita Iyer',
    email: 'kavita.i@example.com',
    password: '$2a$10$badpqO0OjL.wOY7EidcUk.M3uhQnvLdR0nRXuMOnwav1GXGIn8Adq',
    phone: '+91 94441 22334',
    voterId: 'KVI4567890',
    role: 'citizen'
  },
  {
    name: 'Rohan Deshmukh',
    email: 'rohan.d@example.com',
    password: '$2a$10$feFZoLop3Kp5FR2NFZDlauNPxtdnDiZsmN2/MLWZYZSB.ea6B46Me',
    phone: '+91 98230 44556',
    voterId: 'RHD5678901',
    role: 'citizen'
  },
  {
    name: 'Ananya Roy',
    email: 'ananya.r@example.com',
    password: '$2a$10$FCg8xo5PzEASpatVMxquwuoX8KpgXmBYirdSKK7FQpmdUbbiyV1oK',
    phone: '+91 98300 77889',
    voterId: 'ANR6789012',
    role: 'citizen'
  },
  {
    name: 'Gaurav Patel',
    email: 'gaurav.p@example.com',
    password: '$2a$10$auVntDLQgIyHRO//uhLlmezikfX6DjFznNepZlUCCwqZhDNyeHIkW',
    phone: '+91 97250 12345',
    voterId: 'GVP7890123',
    role: 'citizen'
  },
  {
    name: 'Priya Sharma',
    email: 'priya.s@example.com',
    password: '$2a$10$rPbjATMp/zZvUhdeqp6sJu1WRrvPjxCNMC3BBMaf3p3n4Waeo/rcC',
    phone: '+91 98200 55443',
    voterId: 'PYS8901234',
    role: 'citizen'
  },
  {
    name: 'Rajesh Verma',
    email: 'rajesh.v@example.com',
    password: '$2a$10$PQXiB1B8UHkYoDPZPSSX0e3kJ5rTKAo6t6MGWnNEBCo3P./5rg66S',
    phone: '+91 98110 33221',
    voterId: 'RJV9012345',
    role: 'citizen'
  }
];

const sampleComplaintsData = (cMap) => [
  {
    referenceId: 'CRP-2026-00101',
    citizen: {
      name: cMap['citizen@example.com'].name,
      phone: cMap['citizen@example.com'].phone,
      email: cMap['citizen@example.com'].email,
      userId: cMap['citizen@example.com']._id
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
      name: cMap['sunita.d@example.com'].name,
      phone: cMap['sunita.d@example.com'].phone,
      email: cMap['sunita.d@example.com'].email,
      userId: cMap['sunita.d@example.com']._id
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
      name: cMap['vikas.m@example.com'].name,
      phone: cMap['vikas.m@example.com'].phone,
      email: cMap['vikas.m@example.com'].email,
      userId: cMap['vikas.m@example.com']._id
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
        remark: 'Submitted with photo evidence.',
        timestamp: new Date(Date.now() - 1 * 86400000)
      },
      {
        status: 'Under Review',
        changedBy: 'Central Grievance Desk',
        remark: 'Sent to Electrical Department for circuit breaker diagnostic inspection.',
        timestamp: new Date(Date.now() - 12 * 3600000)
      }
    ],
    remarks: [],
    agreedToTerms: true
  },
  {
    referenceId: 'CRP-2026-00104',
    citizen: {
      name: cMap['kavita.i@example.com'].name,
      phone: cMap['kavita.i@example.com'].phone,
      email: cMap['kavita.i@example.com'].email,
      userId: cMap['kavita.i@example.com']._id
    },
    category: 'Water Supply',
    title: 'Low water pressure and intermittent contamination in municipal supply line',
    description: 'Residents of 3rd Cross have experienced muddy water and very weak pressure during morning supply hours for three consecutive days. Requires inspection of local junction valve.',
    location: '3rd Cross, Malleshwaram West',
    ward: 'Ward 09 (Malleshwaram)',
    city: 'Bengaluru',
    latitude: 13.0031,
    longitude: 77.5643,
    images: ['/uploads/demo-water-before.jpg'],
    status: 'In Progress',
    assignedDepartment: 'Water Supply & Jal Board',
    assignedOfficer: 'K. S. Narayanan (Assistant Engineer - Water)',
    statusHistory: [
      {
        status: 'Submitted',
        changedBy: 'Kavita Iyer',
        remark: 'Water issue reported.',
        timestamp: new Date(Date.now() - 3 * 86400000)
      },
      {
        status: 'Under Review',
        changedBy: 'Central Grievance Desk',
        remark: 'Forwarded to Water Supply maintenance sub-division.',
        timestamp: new Date(Date.now() - 2 * 86400000)
      },
      {
        status: 'In Progress',
        changedBy: 'K. S. Narayanan',
        remark: 'Pipeline flush scheduled; sample sent for water quality test.',
        timestamp: new Date(Date.now() - 12 * 3600000)
      }
    ],
    remarks: [
      {
        text: 'Valve replacement underway; regular supply expected by tomorrow morning.',
        author: 'K. S. Narayanan',
        createdAt: new Date(Date.now() - 12 * 3600000)
      }
    ],
    agreedToTerms: true
  },
  {
    referenceId: 'CRP-2026-00105',
    citizen: {
      name: cMap['rohan.d@example.com'].name,
      phone: cMap['rohan.d@example.com'].phone,
      email: cMap['rohan.d@example.com'].email,
      userId: cMap['rohan.d@example.com']._id
    },
    category: 'Drainage',
    title: 'Open stormwater drain clogged with plastic waste causing backflow onto road',
    description: 'The open drain along Anna Salai service lane is choked with debris and plastic bags. Waste water is overflowing onto the road creating foul smell and mosquito breeding hazard.',
    location: 'Service Lane, Anna Salai, near Guindy Flyover',
    ward: 'Ward 17 (Guindy)',
    city: 'Chennai',
    latitude: 13.0067,
    longitude: 80.2025,
    images: ['/uploads/demo-drainage-before.jpg'],
    status: 'In Progress',
    assignedDepartment: 'Stormwater Drainage & Sewerage Board',
    assignedOfficer: 'M. Balaji (Drainage Maintenance Inspector)',
    statusHistory: [
      {
        status: 'Submitted',
        changedBy: 'Rohan Deshmukh',
        remark: 'Drainage blockage reported with location marker.',
        timestamp: new Date(Date.now() - 3 * 86400000)
      },
      {
        status: 'Assigned',
        changedBy: 'Central Grievance Desk',
        remark: 'Assigned to Stormwater Drainage Zone 5 maintenance team.',
        timestamp: new Date(Date.now() - 2 * 86400000)
      },
      {
        status: 'In Progress',
        changedBy: 'M. Balaji',
        remark: 'De-silting machinery dispatched to the site.',
        timestamp: new Date(Date.now() - 6 * 3600000)
      }
    ],
    remarks: [
      {
        text: 'Suction machine deployed. Work in progress to clear plastic blockages.',
        author: 'M. Balaji',
        createdAt: new Date(Date.now() - 6 * 3600000)
      }
    ],
    agreedToTerms: true
  },
  {
    referenceId: 'CRP-2026-00106',
    citizen: {
      name: cMap['ananya.r@example.com'].name,
      phone: cMap['ananya.r@example.com'].phone,
      email: cMap['ananya.r@example.com'].email,
      userId: cMap['ananya.r@example.com']._id
    },
    category: 'Public Spaces',
    title: 'Children playground slide broken with exposed sharp edges at Tagore Park',
    description: 'The spiral slide in the children play section of Tagore Park has cracked along the seam with jagged plastic edges exposed. Children risk severe cuts. Urgent replacement needed.',
    location: 'Rabindra Sarobar / Tagore Park, South Section',
    ward: 'Ward 12 (Ballygunge)',
    city: 'Kolkata',
    latitude: 22.5126,
    longitude: 88.3637,
    images: ['/uploads/demo-park-before.jpg'],
    status: 'Assigned',
    assignedDepartment: 'Parks & Public Amenities Directorate',
    assignedOfficer: 'Debabrata Sen (Parks Superintendent)',
    statusHistory: [
      {
        status: 'Submitted',
        changedBy: 'Ananya Roy',
        remark: 'Park equipment hazard reported.',
        timestamp: new Date(Date.now() - 2 * 86400000)
      },
      {
        status: 'Assigned',
        changedBy: 'Central Grievance Desk',
        remark: 'Assigned to Parks Maintenance Division for immediate inspection.',
        timestamp: new Date(Date.now() - 1 * 86400000)
      }
    ],
    remarks: [
      {
        text: 'Hazard tape applied around broken slide. Replacement section requisitioned.',
        author: 'Debabrata Sen',
        createdAt: new Date(Date.now() - 1 * 86400000)
      }
    ],
    agreedToTerms: true
  },
  {
    referenceId: 'CRP-2026-00107',
    citizen: {
      name: cMap['gaurav.p@example.com'].name,
      phone: cMap['gaurav.p@example.com'].phone,
      email: cMap['gaurav.p@example.com'].email,
      userId: cMap['gaurav.p@example.com']._id
    },
    category: 'Garbage & Sanitation',
    title: 'Biomedical and unsegregated medical waste dumped behind primary health center',
    description: 'Discarded syringes, saline bottles, and open medical waste bags dumped near the PHC compound wall accessible to children and stray dogs. Urgent containment and safe disposal needed.',
    location: 'Behind Primary Health Center, Gandhi Nagar',
    ward: 'Ward 04 (Civil Lines)',
    city: 'Nagpur',
    latitude: 21.1458,
    longitude: 79.0882,
    images: ['/uploads/demo-garbage-before.jpg'],
    status: 'Submitted',
    assignedDepartment: 'Solid Waste & Sanitation Department',
    assignedOfficer: 'Pending Allocation',
    statusHistory: [
      {
        status: 'Submitted',
        changedBy: 'Gaurav Patel',
        remark: 'High priority biomedical waste hazard reported.',
        timestamp: new Date(Date.now() - 4 * 3600000)
      }
    ],
    remarks: [],
    agreedToTerms: true
  },
  {
    referenceId: 'CRP-2026-00108',
    citizen: {
      name: cMap['priya.s@example.com'].name,
      phone: cMap['priya.s@example.com'].phone,
      email: cMap['priya.s@example.com'].email,
      userId: cMap['priya.s@example.com']._id
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
        changedBy: 'Priya Sharma',
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
      name: cMap['citizen@example.com'].name,
      phone: cMap['citizen@example.com'].phone,
      email: cMap['citizen@example.com'].email,
      userId: cMap['citizen@example.com']._id
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
  },
  {
    referenceId: 'CRP-2026-00110',
    citizen: {
      name: cMap['sunita.d@example.com'].name,
      phone: cMap['sunita.d@example.com'].phone,
      email: cMap['sunita.d@example.com'].email,
      userId: cMap['sunita.d@example.com']._id
    },
    category: 'Streetlights',
    title: 'Non-functional high-mast lighting creating security concerns at market square',
    description: 'The central high-mast lighting pole near the vegetable market has been unlit for 5 days, causing severe inconvenience to vendors and pedestrians after sunset.',
    location: 'APMC Market Yard Gate 2, Ring Road',
    ward: 'Ward 11 (Market Yard)',
    city: 'Pune',
    latitude: 18.4984,
    longitude: 73.8654,
    images: ['/uploads/demo-streetlight-before.jpg'],
    status: 'Submitted',
    assignedDepartment: 'Municipal Electrical & Lighting Division',
    assignedOfficer: 'Pending Allocation',
    statusHistory: [
      {
        status: 'Submitted',
        changedBy: 'Sunita Deshmukh',
        remark: 'High-mast failure reported online with photo.',
        timestamp: new Date(Date.now() - 1 * 86400000)
      }
    ],
    remarks: [],
    agreedToTerms: true
  },
  {
    referenceId: 'CRP-2026-00111',
    citizen: {
      name: cMap['vikas.m@example.com'].name,
      phone: cMap['vikas.m@example.com'].phone,
      email: cMap['vikas.m@example.com'].email,
      userId: cMap['vikas.m@example.com']._id
    },
    category: 'Water Supply',
    title: 'Underground municipal water pipeline burst with heavy drinking water leakage',
    description: 'A municipal clean water supply pipe cracked near the community water booth. Thousands of liters of potable water are being wasted and water pressure in nearby homes is severely reduced.',
    location: 'Block B Main Road, Near Jal Nigam Pump House',
    ward: 'Ward 18 (Central Zone)',
    city: 'Noida',
    latitude: 28.5839,
    longitude: 77.3197,
    images: ['/uploads/demo-water-before.jpg'],
    status: 'In Progress',
    assignedDepartment: 'Water Supply & Jal Board',
    assignedOfficer: 'K. S. Narayanan (Assistant Engineer - Water)',
    statusHistory: [
      {
        status: 'Submitted',
        changedBy: 'Vikas Malhotra',
        remark: 'Pipeline rupture reported.',
        timestamp: new Date(Date.now() - 2 * 86400000)
      },
      {
        status: 'In Progress',
        changedBy: 'K. S. Narayanan',
        remark: 'Emergency shutoff valve engaged. Repair team on site.',
        timestamp: new Date(Date.now() - 12 * 3600000)
      }
    ],
    remarks: [
      {
        text: 'Pipe section replacement under progress; completion expected by evening.',
        author: 'K. S. Narayanan',
        createdAt: new Date(Date.now() - 12 * 3600000)
      }
    ],
    agreedToTerms: true
  },
  {
    referenceId: 'CRP-2026-00112',
    citizen: {
      name: cMap['kavita.i@example.com'].name,
      phone: cMap['kavita.i@example.com'].phone,
      email: cMap['kavita.i@example.com'].email,
      userId: cMap['kavita.i@example.com']._id
    },
    category: 'Drainage',
    title: 'Silt-clogged roadside stormwater drain causing road overflow during rainfall',
    description: 'Stormwater conduit running alongside the main market road is heavily blocked with plastic waste and silt, resulting in immediate waterlogging even during brief showers.',
    location: 'Gandhi Nagar 3rd Cross, Near Community Health Center',
    ward: 'Ward 33 (South Zone)',
    city: 'Chennai',
    latitude: 13.0112,
    longitude: 80.2234,
    images: ['/uploads/demo-drainage-before.jpg'],
    status: 'Assigned',
    assignedDepartment: 'Stormwater Drainage & Sewerage Board',
    assignedOfficer: 'M. Balaji (Drainage Maintenance Inspector)',
    statusHistory: [
      {
        status: 'Submitted',
        changedBy: 'Kavita Iyer',
        remark: 'Stormwater blockage reported.',
        timestamp: new Date(Date.now() - 2 * 86400000)
      },
      {
        status: 'Assigned',
        changedBy: 'Central Grievance Desk',
        remark: 'Assigned to drainage desilting contractor crew.',
        timestamp: new Date(Date.now() - 1 * 86400000)
      }
    ],
    remarks: [],
    agreedToTerms: true
  },
  {
    referenceId: 'CRP-2026-00113',
    citizen: {
      name: cMap['rohan.d@example.com'].name,
      phone: cMap['rohan.d@example.com'].phone,
      email: cMap['rohan.d@example.com'].email,
      userId: cMap['rohan.d@example.com']._id
    },
    category: 'Public Spaces',
    title: 'Damaged children play equipment and broken benches in municipal park',
    description: 'Multiple swings have rusted and snapped chains, and two park benches have cracked concrete slabs. Poses a physical safety risk for young children and senior citizens.',
    location: 'Shivaji Childrens Park, Off Link Road',
    ward: 'Ward 08 (Garden Suburb)',
    city: 'Pune',
    latitude: 18.5204,
    longitude: 73.8567,
    images: ['/uploads/demo-park-before.jpg'],
    status: 'In Progress',
    assignedDepartment: 'Parks & Public Amenities Directorate',
    assignedOfficer: 'Debabrata Sen (Parks Superintendent)',
    statusHistory: [
      {
        status: 'Submitted',
        changedBy: 'Rohan Deshmukh',
        remark: 'Broken park infrastructure reported.',
        timestamp: new Date(Date.now() - 3 * 86400000)
      },
      {
        status: 'In Progress',
        changedBy: 'Debabrata Sen',
        remark: 'Maintenance contractor issued repair order for swings and benches.',
        timestamp: new Date(Date.now() - 1 * 86400000)
      }
    ],
    remarks: [
      {
        text: 'New swing chains delivered. Welding work scheduled for 3 PM.',
        author: 'Debabrata Sen',
        createdAt: new Date(Date.now() - 1 * 86400000)
      }
    ],
    agreedToTerms: true
  },
  {
    referenceId: 'CRP-2026-00114',
    citizen: {
      name: cMap['ananya.r@example.com'].name,
      phone: cMap['ananya.r@example.com'].phone,
      email: cMap['ananya.r@example.com'].email,
      userId: cMap['ananya.r@example.com']._id
    },
    category: 'Other Issues',
    title: 'Dangerous hanging telecommunication and power cables across pedestrian crossing',
    description: 'Loose overhead utility cables have unfastened and are dangling barely 5 feet above the pedestrian zebra crossing, posing an immediate electrocution and collision hazard.',
    location: 'College Road, Near City Central Library',
    ward: 'Ward 16 (College Square)',
    city: 'Kolkata',
    latitude: 22.5726,
    longitude: 88.3639,
    images: ['/uploads/demo-debris-before.jpg'],
    status: 'Under Review',
    assignedDepartment: 'Central Civic Redressal Cell',
    assignedOfficer: 'Pending Allocation',
    statusHistory: [
      {
        status: 'Submitted',
        changedBy: 'Ananya Roy',
        remark: 'Hazardous hanging cables reported with photo.',
        timestamp: new Date(Date.now() - 18 * 3600000)
      },
      {
        status: 'Under Review',
        changedBy: 'Central Grievance Desk',
        remark: 'Notice sent to telecom utility provider to secure loose lines.',
        timestamp: new Date(Date.now() - 6 * 3600000)
      }
    ],
    remarks: [],
    agreedToTerms: true
  },
  {
    referenceId: 'CRP-2026-00115',
    citizen: {
      name: cMap['rajesh.v@example.com'].name,
      phone: cMap['rajesh.v@example.com'].phone,
      email: cMap['rajesh.v@example.com'].email,
      userId: cMap['rajesh.v@example.com']._id
    },
    category: 'Garbage & Sanitation',
    title: 'Secondary waste collection bins damaged with garbage strewn on service lane',
    description: 'Two 240L wheelie bins have cracked bases and broken wheels. Wet garbage is scattered across the service road by stray cattle, generating foul odor and hygiene concerns.',
    location: 'Service Road, Near City Bus Terminal',
    ward: 'Ward 03 (Transport Nagar)',
    city: 'Delhi',
    latitude: 28.6502,
    longitude: 77.2301,
    images: ['/uploads/demo-garbage-before.jpg'],
    status: 'Under Review',
    assignedDepartment: 'Solid Waste & Sanitation Department',
    assignedOfficer: 'Pending Allocation',
    statusHistory: [
      {
        status: 'Submitted',
        changedBy: 'Rajesh Verma',
        remark: 'Broken bin and litter reported on service lane.',
        timestamp: new Date(Date.now() - 8 * 3600000)
      },
      {
        status: 'Under Review',
        changedBy: 'Central Grievance Desk',
        remark: 'Work ticket generated for replacement bin delivery.',
        timestamp: new Date(Date.now() - 2 * 3600000)
      }
    ],
    remarks: [],
    agreedToTerms: true
  }
];

const demoAuthorityAccounts = [
  {
    name: 'Dr. Vikramaditya Sen',
    email: 'admin.authority@crp.gov.in',
    password: '$2a$10$ogAf5y8DmTAmi/xrTc67x.l2jEU.YJqXMORQtPhUdz9tmtuYIW9xu',
    phone: '+91 98110 00001',
    role: 'authority_admin',
    assignedCategory: '',
    department: 'Central Municipal Administration',
    designation: 'Municipal Commissioner / Chief Administrator'
  },
  {
    name: 'Rajeev Nambiar',
    email: 'roads.authority@crp.gov.in',
    password: '$2a$10$du8pbfwLNnA3LThHeXTyZufk6IWWqnK8e93c.TIn/2Gb6dRJRpDXu',
    phone: '+91 98110 00002',
    role: 'authority_category',
    assignedCategory: 'Roads & Potholes',
    department: 'Public Works Department (Roads)',
    designation: 'Superintending Engineer (Roads)'
  },
  {
    name: 'Sunil Ganguly',
    email: 'garbage.authority@crp.gov.in',
    password: '$2a$10$guHVvj3/xg2EFGFh31yuMO5JN6EyLEl7vlEh.aZOOluUzMm2ZxYya',
    phone: '+91 98110 00003',
    role: 'authority_category',
    assignedCategory: 'Garbage & Sanitation',
    department: 'Solid Waste & Sanitation Department',
    designation: 'Chief Sanitation Inspector'
  },
  {
    name: 'Farhan Siddiqui',
    email: 'lighting.authority@crp.gov.in',
    password: '$2a$10$oOjX/mTfxkdYZ2NWs77UtOfi9Nh8lIqcGYByz4v/sENnugS7e.FQO',
    phone: '+91 98110 00004',
    role: 'authority_category',
    assignedCategory: 'Streetlights',
    department: 'Municipal Electrical & Lighting Division',
    designation: 'Assistant Executive Engineer (Electrical)'
  },
  {
    name: 'Meenakshi Sundaram',
    email: 'water.authority@crp.gov.in',
    password: '$2a$10$3U0i0kufxzjpq3jtwNyIYew2/zFDoPYKN0i1DnWImqnJ7lfyDnaSW',
    phone: '+91 98110 00005',
    role: 'authority_category',
    assignedCategory: 'Water Supply',
    department: 'Water Supply & Jal Board',
    designation: 'Zonal Water Supply Engineer'
  },
  {
    name: 'Deepak Kulkarni',
    email: 'drainage.authority@crp.gov.in',
    password: '$2a$10$rZu4pCHNkH/JVM7t4e9sme7sSLFOpU1gLlW.OwCBOpqixVXEv9cQm',
    phone: '+91 98110 00006',
    role: 'authority_category',
    assignedCategory: 'Drainage',
    department: 'Stormwater Drainage & Sewerage Board',
    designation: 'Divisional Drainage Engineer'
  },
  {
    name: 'Shalini Menon',
    email: 'parks.authority@crp.gov.in',
    password: '$2a$10$2THS96RHPgZsU2fjuuYtBOO1PAhf4yhoe2GPfcXK17mcD/ghyE6L2',
    phone: '+91 98110 00007',
    role: 'authority_category',
    assignedCategory: 'Public Spaces',
    department: 'Parks & Public Amenities Directorate',
    designation: 'Public Spaces Directorate Officer'
  },
  {
    name: 'Harish Chandra Joshi',
    email: 'other.authority@crp.gov.in',
    password: '$2a$10$.mSK09moX5FqXVav/X1LquqxGxNwqBbR4mQlmINEThFSl3TnbmLGy',
    phone: '+91 98110 00008',
    role: 'authority_category',
    assignedCategory: 'Other Issues',
    department: 'Central Civic Redressal Cell',
    designation: 'Civic Redressal Grievance Officer'
  }
];

const seedAuthorityAccounts = async () => {
  console.log('[SEED] Ensuring Main and Category Authority demo accounts exist...');
  for (const acc of demoAuthorityAccounts) {
    const existing = await User.findOne({ email: acc.email });
    if (!existing) {
      await User.create(acc);
      console.log(`[SEED] Created authority account: ${acc.email} (${acc.role} - ${acc.assignedCategory || 'ALL'})`);
    } else {
      existing.name = acc.name;
      existing.role = acc.role;
      existing.assignedCategory = acc.assignedCategory;
      existing.department = acc.department;
      existing.designation = acc.designation;
      existing.password = acc.password;
      await existing.save();
      console.log(`[SEED] Updated existing authority account: ${acc.email} (${acc.name} - ${acc.assignedCategory || 'ALL'})`);
    }
  }
};

const seedCitizenAccountsAndComplaints = async () => {
  console.log('[SEED] Ensuring 9 demo citizen accounts and 15 complaints exist...');
  const citizensMap = {};
  for (const citizenData of demoCitizensData) {
    let citizen = await User.findOne({ email: citizenData.email });
    if (!citizen) {
      citizen = await User.create(citizenData);
      console.log(`[SEED] Created demo citizen: ${citizenData.email} (${citizenData.name})`);
    } else {
      citizen.name = citizenData.name;
      citizen.phone = citizenData.phone;
      citizen.voterId = citizenData.voterId;
      citizen.password = citizenData.password;
      citizen.role = 'citizen';
      await citizen.save();
      console.log(`[SEED] Verified demo citizen: ${citizenData.email} (${citizenData.name})`);
    }
    citizensMap[citizenData.email] = citizen;
  }

  // Ensure all 15 demo complaints exist with proper ownership and no null userId
  const complaints = sampleComplaintsData(citizensMap);
  for (const complaintData of complaints) {
    const existing = await Complaint.findOne({ referenceId: complaintData.referenceId });
    if (!existing) {
      await Complaint.create(complaintData);
      console.log(`[SEED] Created complaint: ${complaintData.referenceId} -> ${complaintData.citizen.email}`);
    } else {
      // Ensure ownership points to the correct citizen account
      existing.citizen = complaintData.citizen;
      existing.category = complaintData.category;
      existing.title = complaintData.title;
      existing.description = complaintData.description;
      existing.location = complaintData.location;
      existing.ward = complaintData.ward;
      existing.city = complaintData.city;
      await existing.save();
      console.log(`[SEED] Updated complaint ownership: ${complaintData.referenceId} -> ${complaintData.citizen.email}`);
    }
  }

  // Ensure Counter sequence is at least 115
  const currentYear = new Date().getFullYear();
  const counterId = `complaints_${currentYear}`;
  const counter = await Counter.findById(counterId);
  if (!counter) {
    await Counter.create({ _id: counterId, seq: 115 });
  } else if (counter.seq < 115) {
    counter.seq = 115;
    await counter.save();
  }
};

const seedData = async (shouldExit = true) => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0 && !shouldExit) {
      // Already populated, ensure authority and citizen demo accounts/complaints exist
      await seedAuthorityAccounts();
      await seedCitizenAccountsAndComplaints();
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
      seq: 115
    });

    console.log('[SEED] Creating standard authority users...');
    await User.create({
      name: 'Rajesh Sharma',
      email: 'authority@crp.gov.in',
      password: '$2a$10$SHuduxRhUFjbw9zY9Zuzu.tK3LYG9wCdz6YmF9.mtCr5QtmR8bntu',
      phone: '+91 98110 12345',
      role: 'authority',
      department: 'Public Works Department (Roads)',
      designation: 'Executive Zonal Engineer'
    });

    await User.create({
      name: 'Priya Varma',
      email: 'sanitation.officer@crp.gov.in',
      password: '$2a$10$HGt58HiptHqdzaSoB8Bq4.sDMzLvle4ZUtoQSEPcoMW5CWi2H9816',
      phone: '+91 98220 54321',
      role: 'authority',
      department: 'Solid Waste & Sanitation Department',
      designation: 'Chief Sanitation Inspector'
    });

    console.log('[SEED] Creating 9 dedicated demo citizen accounts...');
    const citizensMap = {};
    for (const citizenData of demoCitizensData) {
      const citizen = await User.create(citizenData);
      citizensMap[citizenData.email] = citizen;
      console.log(`[SEED] Created demo citizen: ${citizenData.email} (${citizenData.name})`);
    }

    console.log('[SEED] Creating 15 sample complaints distributed among citizens...');
    const complaints = sampleComplaintsData(citizensMap);
    await Complaint.insertMany(complaints);

    const amitKumar = citizensMap['citizen@example.com'];
    console.log('[SEED] Creating sample notifications for citizen Amit Kumar...');
    await Notification.insertMany([
      {
        recipient: amitKumar._id,
        title: 'Complaint Registered',
        message: 'Your grievance regarding "Deep pothole causing severe traffic congestion near Metro Pillar 142" has been registered with Reference ID CRP-2026-00101.',
        type: 'submission',
        referenceId: 'CRP-2026-00101',
        isRead: true,
        createdAt: new Date(Date.now() - 4 * 86400000)
      },
      {
        recipient: amitKumar._id,
        title: 'Department Assigned',
        message: 'Your grievance CRP-2026-00101 has been assigned to Public Works Department (Roads) (Officer: Rajesh Sharma).',
        type: 'assignment',
        referenceId: 'CRP-2026-00101',
        isRead: true,
        createdAt: new Date(Date.now() - 2 * 86400000)
      },
      {
        recipient: amitKumar._id,
        title: 'Status Updated: In Progress',
        message: 'Status of grievance CRP-2026-00101 has been updated to "In Progress". Remark: Asphalt cold patch mix dispatched.',
        type: 'status_change',
        referenceId: 'CRP-2026-00101',
        isRead: false,
        createdAt: new Date(Date.now() - 1 * 86400000)
      },
      {
        recipient: amitKumar._id,
        title: 'Complaint Resolved',
        message: 'Your grievance CRP-2026-00109 has been marked as Resolved by municipal authorities. Road crater filled and traffic restored.',
        type: 'resolution',
        referenceId: 'CRP-2026-00109',
        isRead: false,
        createdAt: new Date(Date.now() - 3600000)
      }
    ]);

    console.log('[SEED] Creating category authority demo accounts...');
    await seedAuthorityAccounts();

    console.log('[SEED] Data seeding completed successfully! 9 demo citizens and 15 complaints active.');
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

module.exports = { seedData, seedAuthorityAccounts, seedCitizenAccountsAndComplaints };
