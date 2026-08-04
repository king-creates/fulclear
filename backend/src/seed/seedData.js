/* Master list of clearance departments — must match frontend DEPARTMENTS constant */
const departments = [
  { name: 'Library',                 code: 'LIB', order: 1 },
  { name: 'Bursary / Finance',       code: 'BUR', order: 2 },
  { name: 'Hostel Affairs',          code: 'HOS', order: 3 },
  { name: 'Alumni Relations',        code: 'ALU', order: 4 },
  { name: 'Academic Affairs',        code: 'ACA', order: 5 },
  { name: 'Student Affairs',         code: 'STU', order: 6 },
  { name: 'Medical Centre',          code: 'MED', order: 7 },
  { name: 'Sports & Recreation',     code: 'SPO', order: 8 },
  { name: 'Departmental Clearance',  code: 'DEP', order: 9 },
  { name: 'ICT Unit',                code: 'ICT', order: 10 },
];

/* Default admin account */
const adminUser = {
  firstName: 'Kola',
  lastName:  'Adesanya',
  email:     'admin@ful.edu.ng',
  password:  'Admin@12345',
  role:      'admin',
  department: 'ICT Unit',
  isEmailVerified: true,
};

/* Default registrar account */
const registrarUser = {
  firstName: 'Segun',
  lastName:  'Adeyemi',
  email:     'registrar@ful.edu.ng',
  password:  'Registrar@12345',
  role:      'registrar',
  department: 'Registrar Office',
  isEmailVerified: true,
};

/* One officer per department */
const officerUsers = [
  { firstName: 'Adaeze', lastName: 'Eze',      email: 'library@ful.edu.ng',    password: 'Officer@12345', deptCode: 'LIB' },
  { firstName: 'James',  lastName: 'Obi',      email: 'bursary@ful.edu.ng',    password: 'Officer@12345', deptCode: 'BUR' },
  { firstName: 'Ngozi',  lastName: 'Bello',    email: 'hostel@ful.edu.ng',     password: 'Officer@12345', deptCode: 'HOS' },
  { firstName: 'Seun',   lastName: 'Babs',     email: 'alumni@ful.edu.ng',     password: 'Officer@12345', deptCode: 'ALU' },
  { firstName: 'Kalu',   lastName: 'Eze',      email: 'academic@ful.edu.ng',   password: 'Officer@12345', deptCode: 'ACA' },
  { firstName: 'Dele',   lastName: 'Bello',    email: 'studentaff@ful.edu.ng', password: 'Officer@12345', deptCode: 'STU' },
  { firstName: 'Amaka',  lastName: 'Obi',      email: 'medical@ful.edu.ng',    password: 'Officer@12345', deptCode: 'MED' },
  { firstName: 'Taiwo',  lastName: 'Adeyemi',  email: 'sports@ful.edu.ng',     password: 'Officer@12345', deptCode: 'SPO' },
  { firstName: 'Prof.',  lastName: 'Adamu',    email: 'department@ful.edu.ng',password: 'Officer@12345', deptCode: 'DEP' },
  { firstName: 'Chidi',  lastName: 'Nwosu',    email: 'ict@ful.edu.ng',        password: 'Officer@12345', deptCode: 'ICT' },
];

/* Sample students */
const studentUsers = [
  {
    firstName: 'Ada', lastName: 'Okonkwo', email: 'ada.student@ful.edu.ng',
    password: 'Student@12345', matricNumber: 'FUL/CS/2020/001',
    department: 'Computer Science', programme: 'B.Sc. Computer Science',
    isEmailVerified: true,
  },
  {
    firstName: 'Emeka', lastName: 'Nwachukwu', email: 'emeka.student@ful.edu.ng',
    password: 'Student@12345', matricNumber: 'FUL/EE/2020/014',
    department: 'Electrical Engineering', programme: 'B.Eng. Electrical Engineering',
    isEmailVerified: true,
  },
];

module.exports = { departments, adminUser, registrarUser, officerUsers, studentUsers };