require('dotenv').config();
const mongoose    = require('mongoose');
const connectDB    = require('../config/db');
const User         = require('../models/User');
const Department   = require('../models/Department');
const Clearance     = require('../models/Clearance');
const Document      = require('../models/Document');
const Notification  = require('../models/Notification');
const AuditLog       = require('../models/AuditLog');

const {
  departments,
  adminUser,
  registrarUser,
  officerUsers,
  studentUsers,
} = require('./seedData');

const seed = async () => {
  try {
    await connectDB();
    console.log('\n🌱 Starting database seed...\n');

    /* ── Clear existing data ── */
    await Promise.all([
      User.deleteMany(),
      Department.deleteMany(),
      Clearance.deleteMany(),
      Document.deleteMany(),
      Notification.deleteMany(),
      AuditLog.deleteMany(),
    ]);
    console.log('🗑️  Cleared existing collections');

    /* ── Create departments ── */
    const createdDepartments = await Department.insertMany(departments);
    console.log(`✅ Created ${createdDepartments.length} departments`);

    /* ── Create admin ── */
    const admin = await User.create(adminUser);
    console.log(`✅ Created admin: ${admin.email}`);

    /* ── Create registrar ── */
    const registrar = await User.create(registrarUser);
    console.log(`✅ Created registrar: ${registrar.email}`);

    /* ── Create officers and link to departments ── */
    const createdOfficers = [];
    for (const officerData of officerUsers) {
      const { deptCode, ...userFields } = officerData;
      const officer = await User.create({ ...userFields, role: 'officer', isEmailVerified: true });
      createdOfficers.push(officer);

      const dept = createdDepartments.find(d => d.code === deptCode);
      if (dept) {
        dept.officers.push(officer._id);
        dept.headOfficer = officer._id;
        officer.department = dept.name;
        await officer.save();
        await dept.save();
      }
    }
    console.log(`✅ Created ${createdOfficers.length} officers and linked to departments`);

    /* ── Create students ── */
    const createdStudents = [];
    for (const studentData of studentUsers) {
      const student = await User.create({ ...studentData, role: 'student' });
      createdStudents.push(student);
    }
    console.log(`✅ Created ${createdStudents.length} students`);

    /* ── Create a sample clearance request for the first student ── */
    const firstStudent = createdStudents[0];
    const clearanceDepartments = createdDepartments.map((dept, i) => ({
      department:     dept._id,
      departmentName: dept.name,
      status: i < 3 ? 'approved' : i === 3 ? 'in_review' : 'pending',
      officer: i < 3 ? createdOfficers[i]._id : undefined,
      comment: i < 3 ? 'All requirements met.' : undefined,
      reviewedAt: i < 3 ? new Date() : undefined,
    }));

    const clearance = await Clearance.create({
      student:           firstStudent._id,
      status:            'in_progress',
      graduationYear:    '2025',
      programme:         firstStudent.programme,
      sessionCompleted:  '2020/2021 - 2024/2025',
      departments:       clearanceDepartments,
      submittedAt:       new Date(),
    });
    console.log(`✅ Created sample clearance request: ${clearance.requestId}`);

    /* ── Create sample notifications ── */
    await Notification.insertMany([
      {
        recipient: firstStudent._id,
        type: 'success',
        title: 'Library Clearance Approved',
        message: 'Your library clearance has been approved.',
        read: false,
      },
      {
        recipient: firstStudent._id,
        type: 'info',
        title: 'Welcome to SOCS',
        message: 'Your account has been created successfully.',
        read: true,
      },
    ]);
    console.log('✅ Created sample notifications');

    /* ── Create a sample audit log ── */
    await AuditLog.create({
      user:     admin._id,
      userName: admin.fullName,
      userRole: admin.role,
      action:   'SYSTEM_SEEDED',
      detail:   'Database seeded with initial data',
      status:   'success',
    });
    console.log('✅ Created initial audit log');

    /* ── Summary ── */
    console.log('\n════════════════════════════════════');
    console.log('🎉 SEED COMPLETE');
    console.log('════════════════════════════════════');
    console.log('\n📋 Login Credentials:\n');
    console.log(`ADMIN      → ${adminUser.email} / ${adminUser.password}`);
    console.log(`REGISTRAR  → ${registrarUser.email} / ${registrarUser.password}`);
    console.log(`OFFICER    → ${officerUsers[0].email} / ${officerUsers[0].password}`);
    console.log(`STUDENT    → ${studentUsers[0].email} / ${studentUsers[0].password}`);
    console.log('\n════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seed();