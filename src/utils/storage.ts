import {
  Student,
  AttendanceRecord,
  AttendanceStatus,
  SchoolConfig,
  ClassActivity,
  StudentResult,
  Teacher,
} from '../types';
import {
  DEFAULT_STUDENTS,
  DEFAULT_SCHOOL_CONFIG,
  DEFAULT_TEACHERS,
} from '../data/defaultStudents';
import { DEFAULT_ACTIVITIES } from '../data/defaultActivities';
import { generateDefaultResults } from '../data/defaultResults';

const STORAGE_KEYS = {
  STUDENTS: 'guj_attendance_students_v1',
  CONFIG: 'guj_attendance_config_v1',
  RECORDS: 'guj_attendance_records_v1',
  ACTIVITIES: 'guj_attendance_activities_v1',
  RESULTS: 'guj_attendance_results_v1',
};

export const GUJARATI_DAYS = [
  'રવિવાર',
  'સોમવાર',
  'મંગળવાર',
  'બુધવાર',
  'ગુરુવાર',
  'શુક્રવાર',
  'શનિવાર',
];

export const GUJARATI_MONTHS = [
  'જાન્યુઆરી',
  'ફેબ્રુઆરી',
  'માર્ચ',
  'એપ્રિલ',
  'મે',
  'જૂન',
  'જુલાઈ',
  'ઓગસ્ટ',
  'સપ્ટેમ્બર',
  'ઓક્ટોબર',
  'નવેમ્બર',
  'ડિસેમ્બર',
];

export function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatGujaratiDate(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  const dayName = GUJARATI_DAYS[dateObj.getDay()];
  const monthName = GUJARATI_MONTHS[m - 1];
  return `${d} ${monthName} ${y} (${dayName})`;
}

export function formatShortDate(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

export function loadStudents(): Student[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        let updated = false;
        let students = parsed.map((s: Student) => {
          if (s.address && s.address.includes('વાંઝિયાઆંબા')) {
            updated = true;
            return {
              ...s,
              address: s.address.replace(/વાંઝિયાઆંબા/g, 'ઢીંકવા'),
              aadharDiseNo: s.aadharDiseNo?.replace(/24170302403/g, '24170302402'),
            };
          }
          return s;
        });

        // Ensure all standards 1 to 8 have starter students available
        const currentStandards = new Set(students.map((s: Student) => s.standard || 'ધોરણ ૬'));
        const requiredStandards = ['ધોરણ ૧', 'ધોરણ ૨', 'ધોરણ ૩', 'ધોરણ ૪', 'ધોરણ ૫', 'ધોરણ ૬', 'ધોરણ ૭', 'ધોરણ ૮'];
        const missing = requiredStandards.filter((std) => !currentStandards.has(std));

        if (missing.length > 0) {
          const additional = DEFAULT_STUDENTS.filter((ds) => missing.includes(ds.standard || ''));
          students = [...students, ...additional];
          updated = true;
        }

        if (updated) {
          saveStudents(students);
        }
        return students;
      }
    }
  } catch (e) {
    console.error('Error loading students', e);
  }
  saveStudents(DEFAULT_STUDENTS);
  return DEFAULT_STUDENTS;
}

export function saveStudents(students: Student[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  } catch (e) {
    console.error('Error saving students', e);
  }
}

export function loadSchoolConfig(): SchoolConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      let needsSave = false;

      if (!parsed.payCenterSchool || parsed.schoolName !== 'શાળા વાંઝિયાઆંબા') {
        parsed.schoolName = 'શાળા વાંઝિયાઆંબા';
        parsed.payCenterSchool = 'પે સેન્ટર શાળા ઢીંકવા';
        parsed.schoolCode = '24170302402';
        needsSave = true;
      }

      // Ensure updated teacher contact details for Shri B. B. Patel
      if (!parsed.teacherPhone || parsed.teacherPhone === '9825412345') {
        parsed.teacherPhone = '9099662933';
        needsSave = true;
      }
      if (!parsed.teacherEmail) {
        parsed.teacherEmail = 'bbpatel7303@gmail.com';
        needsSave = true;
      }

      // Ensure 8 teachers array exists
      if (!parsed.teachers || !Array.isArray(parsed.teachers) || parsed.teachers.length === 0) {
        parsed.teachers = DEFAULT_TEACHERS;
        needsSave = true;
      } else if (parsed.teachers.length < 8) {
        parsed.teachers = DEFAULT_TEACHERS;
        needsSave = true;
      } else {
        // Ensure teacher 6 has exact requested details
        parsed.teachers = parsed.teachers.map((t: Teacher) => {
          if (t.standard === 'ધોરણ ૬' || t.teacherCode === '10069036') {
            return {
              ...t,
              phone: '9099662933',
              email: 'bbpatel7303@gmail.com',
              isHeadTeacher: true,
            };
          }
          return t;
        });
      }

      if (needsSave) {
        saveSchoolConfig({ ...DEFAULT_SCHOOL_CONFIG, ...parsed });
      }
      return { ...DEFAULT_SCHOOL_CONFIG, ...parsed };
    }
  } catch (e) {
    console.error('Error loading config', e);
  }
  return DEFAULT_SCHOOL_CONFIG;
}

export function saveSchoolConfig(config: SchoolConfig) {
  try {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving config', e);
  }
}

// Generate realistic past attendance history for demo/practice if empty
function createInitialRecords(students: Student[]): Record<string, AttendanceRecord> {
  const result: Record<string, AttendanceRecord> = {};
  const today = new Date();

  for (let i = 0; i <= 10; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    if (d.getDay() === 0) continue;

    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateKey = `${y}-${m}-${day}`;

    const recs: Record<string, AttendanceStatus> = {};
    students.forEach((s) => {
      const rand = Math.random();
      if (i === 0) {
        if (s.rollNo === 5 || s.rollNo === 14) {
          recs[s.id] = 'absent';
        } else {
          recs[s.id] = 'present';
        }
      } else {
        if (rand < 0.88) {
          recs[s.id] = 'present';
        } else if (rand < 0.96) {
          recs[s.id] = 'absent';
        } else {
          recs[s.id] = 'leave';
        }
      }
    });

    result[dateKey] = {
      date: dateKey,
      records: recs,
      lastUpdated: new Date().toISOString(),
    };
  }

  return result;
}

export function loadAllAttendanceRecords(): Record<string, AttendanceRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading attendance records', e);
  }

  const students = loadStudents();
  const initial = createInitialRecords(students);
  saveAllAttendanceRecords(initial);
  return initial;
}

export function saveAllAttendanceRecords(records: Record<string, AttendanceRecord>) {
  try {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  } catch (e) {
    console.error('Error saving records', e);
  }
}

export function saveDayAttendance(
  date: string,
  records: Record<string, AttendanceStatus>,
  note?: string
) {
  const all = loadAllAttendanceRecords();
  all[date] = {
    date,
    records,
    note,
    lastUpdated: new Date().toISOString(),
  };
  saveAllAttendanceRecords(all);
}

export function deleteDayAttendance(date: string) {
  const all = loadAllAttendanceRecords();
  if (all[date]) {
    delete all[date];
    saveAllAttendanceRecords(all);
  }
}

// Activities Storage
export function loadActivities(): ClassActivity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading activities', e);
  }
  saveActivities(DEFAULT_ACTIVITIES);
  return DEFAULT_ACTIVITIES;
}

export function saveActivities(activities: ClassActivity[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  } catch (e) {
    console.error('Error saving activities', e);
  }
}

// Exam Results Storage
export function loadResults(): Record<string, StudentResult> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RESULTS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading results', e);
  }
  const defaults = generateDefaultResults();
  saveResults(defaults);
  return defaults;
}

export function saveResults(results: Record<string, StudentResult>) {
  try {
    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(results));
  } catch (e) {
    console.error('Error saving results', e);
  }
}

export function deleteResultRecord(studentId: string) {
  const all = loadResults();
  if (all[studentId]) {
    delete all[studentId];
    saveResults(all);
  }
}

export function resetAllResults() {
  const empty: Record<string, StudentResult> = {};
  saveResults(empty);
  return empty;
}

export function exportDataAsJSON(): string {
  const data = {
    config: loadSchoolConfig(),
    students: loadStudents(),
    records: loadAllAttendanceRecords(),
    activities: loadActivities(),
    results: loadResults(),
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
}

export function importDataFromJSON(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.students && Array.isArray(data.students)) {
      saveStudents(data.students);
    }
    if (data.config) {
      saveSchoolConfig(data.config);
    }
    if (data.records) {
      saveAllAttendanceRecords(data.records);
    }
    if (data.activities && Array.isArray(data.activities)) {
      saveActivities(data.activities);
    }
    if (data.results) {
      saveResults(data.results);
    }
    return true;
  } catch {
    return false;
  }
}
