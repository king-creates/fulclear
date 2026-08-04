/* Academic departments/programmes at Federal University Lokoja, grouped by faculty */
export const ACADEMIC_DEPARTMENTS = [
  {
    faculty: 'Faculty of Arts',
    departments: [
      'Archaeology',
      'Arabic Studies',
      'Christian Religious Studies',
      'Islamic Studies',
      'English and Literary Studies',
      'French',
      'History and International Studies',
      'Linguistics',
      'Music',
      'Philosophy',
      'Theatre Arts',
    ],
  },
  {
    faculty: 'College of Health Sciences',
    departments: [
      'Medicine and Surgery',
      'Nursing Science',
      'Medical Laboratory Science',
    ],
  },
  {
    faculty: 'Faculty of Education',
    departments: [
      'Economics Education',
      'English Language Education',
      'Geography Education',
      'History Education',
      'Political Science Education',
      'Social Studies',
      'Business Education',
      'Integrated Science',
      'Biology Education',
      'Chemistry Education',
      'Computer Science Education',
      'Mathematics Education',
      'Physics Education',
      'Library and Information Science',
      'Guidance and Counseling',
      'Educational Management and Planning',
    ],
  },
  {
    faculty: 'Faculty of Engineering',
    departments: [
      'Computer Engineering',
      'Electrical Electronics Engineering',
      'Mechanical Engineering',
    ],
  },
  {
    faculty: 'Faculty of Law',
    departments: [
      'Law',
    ],
  },
  {
    faculty: 'Faculty of Management Science',
    departments: [
      'Accounting',
      'Banking and Finance',
      'Business Administration',
      'Public Administration',
    ],
  },
  {
    faculty: 'Faculty of Science',
    departments: [
      'Biochemistry',
      'Biology',
      'Biotechnology',
      'Botany',
      'Microbiology',
      'Zoology',
      'Chemistry',
      'Computer Science',
      'Geology',
      'Industrial Chemistry',
      'Mathematics',
      'Physics',
      'Statistics',
    ],
  },
  {
    faculty: 'Faculty of Social Sciences',
    departments: [
      'Economics',
      'Geography',
      'Mass Communication',
      'Political Science',
      'Sociology',
    ],
  },
  {
    faculty: 'Faculty of Pharmaceutical Science',
    departments: [
      'Pharmacy',
    ],
  },
];

/* Flat list for simple dropdowns that don't need faculty grouping */
export const ACADEMIC_DEPARTMENTS_FLAT = ACADEMIC_DEPARTMENTS.flatMap(f => f.departments);