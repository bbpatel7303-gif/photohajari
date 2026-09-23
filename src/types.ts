export type Gender = 'boy' | 'girl';

export type AttendanceStatus = 'present' | 'absent' | 'leave';

export interface Student {
  id: string;
  rollNo: number;
  grNo: string;
  name: string; // Gujarati
  nameEn: string; // English
  gender: Gender;
  photoUrl: string;
  parentPhone: string;
  parentName?: string;
  address?: string;
  dob?: string;
  bloodGroup?: string;
  bankAccountNo?: string; // બેંક ખાતા નંબર
  bankIfsc?: string; // IFSC કોડ
  bankName?: string; // બેંકનું નામ
  aadharDiseNo?: string; // આધાર ડાયસ નંબર (18 digits)
  aadharNo?: string; // આધાર કાર્ડ નંબર (12 digits)
  standard?: string; // ધોરણ (e.g. 'ધોરણ ૬')
  division?: string; // વર્ગ/શાખા (e.g. 'અ')
}

export interface AttendanceRecord {
  date: string; // YYYY-MM-DD
  records: Record<string, AttendanceStatus>; // studentId -> status
  note?: string;
  lastUpdated?: string;
}

export interface Teacher {
  id: string;
  name: string; // ગુજરાતી નામ
  nameEn: string;
  teacherCode: string;
  phone: string;
  email: string;
  photoUrl?: string;
  standard: string; // 'ધોરણ ૧', 'ધોરણ ૨', ... 'ધોરણ ૮'
  division: string;
  qualification?: string;
  isHeadTeacher?: boolean;
}

export interface SchoolConfig {
  schoolName: string; // શાળાનું નામ (મોટા અક્ષરે - e.g. શાળા વાંઝિયાઆંબા)
  payCenterSchool?: string; // પે સેન્ટર શાળા (નાના અક્ષરે - e.g. પે સેન્ટર શાળા ઢીંકવા)
  schoolCode: string; // DISE Code
  taluka: string;
  district: string;
  teacherCode: string;
  teacherName: string;
  teacherPhone?: string; // 9099662933
  teacherEmail?: string; // bbpatel7303@gmail.com
  teacherPhotoUrl?: string; // ક્લાસ ટીચરનો ફોટો
  standard: string;
  division: string;
  academicYear?: string;
  schoolPhotoUrl?: string;
  // સુરક્ષા અને પાસવર્ડ (PIN Protection)
  securityPin?: string; // ડિફોલ્ટ: '10069036' અથવા '1234'
  isPinProtected?: boolean; // પાસવર્ડ લોક સક્ષમ છે કે નહીં
  availableStandards?: string[]; // ઉપલબ્ધ ધોરણોની યાદી
  teachers?: Teacher[]; // બધા ૮ ધોરણના શિક્ષકો
}

export type ActivityCategory =
  | 'academic'
  | 'science'
  | 'sports'
  | 'cultural'
  | 'balsabha'
  | 'cleanliness'
  | 'other';

export interface ClassActivity {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  category: ActivityCategory;
  description: string;
  photoUrl?: string;
  studentsCount?: number;
  highlight?: boolean;
}

export interface SubjectMarks {
  gujarati: number;
  mathematics: number;
  science: number;
  socialScience: number;
  english: number;
  hindi: number;
  sanskrit: number;
}

export interface StudentResult {
  studentId: string;
  examType: 'sem1' | 'sem2' | 'unit_test';
  marks: SubjectMarks;
  remarks?: string;
}

export type ViewTab =
  | 'attendance'
  | 'activities'
  | 'results'
  | 'idcards'
  | 'monthly'
  | 'students'
  | 'share';
