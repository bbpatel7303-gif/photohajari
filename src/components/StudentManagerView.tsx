import React, { useState, useMemo } from 'react';
import {
  UserPlus,
  Trash2,
  Edit2,
  Camera,
  Upload,
  User,
  X,
  Check,
  CreditCard,
  Building,
  Phone,
  Calendar,
  Eye,
  Copy,
  Printer,
  FileSpreadsheet,
  Search,
  Filter,
  ShieldCheck,
  RotateCcw,
  GraduationCap,
  AlertTriangle,
} from 'lucide-react';
import { Student, Gender, SchoolConfig } from '../types';
import { formatGujaratiDate } from '../utils/storage';

interface StudentManagerViewProps {
  students: Student[];
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onClearAllStudents?: () => void;
  onResetToSampleStudents?: () => void;
  config?: SchoolConfig;
  onOpenClassSelector?: () => void;
  editingStudent: Student | null;
  onCloseEdit: () => void;
  onOpenAddModal: () => void;
}

const PRESET_AVATARS_BOYS = [
  'https://images.unsplash.com/photo-1544717305-2782549b5136?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80',
];

const PRESET_AVATARS_GIRLS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=240&auto=format&fit=crop&q=80',
];

export const StudentFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Student) => void;
  initialData?: Student | null;
  nextRollNo: number;
  defaultStandard?: string;
  defaultDivision?: string;
}> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  nextRollNo,
  defaultStandard = 'ધોરણ ૬',
  defaultDivision = 'અ',
}) => {
  const [rollNo, setRollNo] = useState<number>(initialData?.rollNo || nextRollNo);
  const [grNo, setGrNo] = useState<string>(initialData?.grNo || '');
  const [name, setName] = useState<string>(initialData?.name || '');
  const [nameEn, setNameEn] = useState<string>(initialData?.nameEn || '');
  const [gender, setGender] = useState<Gender>(initialData?.gender || 'boy');
  const [studentStandard, setStudentStandard] = useState<string>(
    initialData?.standard || defaultStandard
  );
  const [studentDivision, setStudentDivision] = useState<string>(
    initialData?.division || defaultDivision
  );
  const [parentPhone, setParentPhone] = useState<string>(initialData?.parentPhone || '');
  const [parentName, setParentName] = useState<string>(initialData?.parentName || '');
  const [address, setAddress] = useState<string>(initialData?.address || '');
  const [dob, setDob] = useState<string>(initialData?.dob || '2014-06-15');
  const [bloodGroup, setBloodGroup] = useState<string>(initialData?.bloodGroup || 'B+');
  const [photoUrl, setPhotoUrl] = useState<string>(
    initialData?.photoUrl || PRESET_AVATARS_BOYS[0]
  );

  // New government & scholarship fields
  const [bankAccountNo, setBankAccountNo] = useState<string>(
    initialData?.bankAccountNo || ''
  );
  const [bankIfsc, setBankIfsc] = useState<string>(
    initialData?.bankIfsc || 'BARB0DBHALO'
  );
  const [bankName, setBankName] = useState<string>(
    initialData?.bankName || 'બેંક ઓફ બરોડા (હાલોલ)'
  );
  const [aadharDiseNo, setAadharDiseNo] = useState<string>(
    initialData?.aadharDiseNo || '24170302403'
  );
  const [aadharNo, setAadharNo] = useState<string>(initialData?.aadharNo || '');

  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        setError('ફોટો 4MB થી નાનો હોવો જોઈએ.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPhotoUrl(reader.result);
          setError('');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('વિદ્યાર્થીનું નામ દાખલ કરવું ફરજિયાત છે.');
      return;
    }

    const student: Student = {
      id: initialData?.id || `std-${Date.now()}`,
      rollNo: Number(rollNo),
      grNo: grNo.trim() || String(rollNo + 1540),
      name: name.trim(),
      nameEn: nameEn.trim() || name.trim(),
      gender,
      photoUrl,
      parentPhone: parentPhone.trim(),
      parentName: parentName.trim(),
      address: address.trim(),
      dob,
      bloodGroup,
      bankAccountNo: bankAccountNo.trim(),
      bankIfsc: bankIfsc.trim().toUpperCase(),
      bankName: bankName.trim(),
      aadharDiseNo: aadharDiseNo.trim(),
      aadharNo: aadharNo.trim(),
      standard: studentStandard,
      division: studentDivision,
    };

    onSave(student);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-base">
              {initialData ? 'વિદ્યાર્થી માહિતી સુધારો' : 'નવો વિદ્યાર્થી ઉમેરો'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Photo & Presets Section */}
          <div className="flex flex-col items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="relative group">
              <img
                src={photoUrl}
                alt="વિદ્યાર્થી ફોટો"
                className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-600 shadow-sm"
              />
              <label
                htmlFor="photo-upload-input"
                className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="ફોટો અપલોડ કરો"
              >
                <Camera className="w-6 h-6 text-white" />
              </label>
              <input
                id="photo-upload-input"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <div className="flex items-center gap-2">
              <label
                htmlFor="photo-upload-input"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer shadow-2xs"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-700" />
                <span>ફોટો અપલોડ કરો / કેમેરા</span>
              </label>
            </div>

            {/* Quick Preset Avatars */}
            <div className="w-full text-center">
              <span className="text-[11px] text-slate-500 block mb-1">
                અથવા તૈયાર ફોટો પસંદ કરો:
              </span>
              <div className="flex items-center justify-center gap-1.5">
                {(gender === 'boy' ? PRESET_AVATARS_BOYS : PRESET_AVATARS_GIRLS).map(
                  (url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPhotoUrl(url)}
                      className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-transform ${
                        photoUrl === url
                          ? 'border-emerald-600 scale-110 ring-2 ring-emerald-300'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Standard & Division Selector */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ધોરણ (Standard) *
              </label>
              <select
                value={studentStandard}
                onChange={(e) => setStudentStandard(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-bold text-slate-800"
              >
                {[
                  'ધોરણ ૧',
                  'ધોરણ ૨',
                  'ધોરણ ૩',
                  'ધોરણ ૪',
                  'ધોરણ ૫',
                  'ધોરણ ૬',
                  'ધોરણ ૭',
                  'ધોરણ ૮',
                ].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                વર્ગ / શાખા (Division)
              </label>
              <select
                value={studentDivision}
                onChange={(e) => setStudentDivision(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-bold text-slate-800"
              >
                {['અ', 'બ', 'ક', 'ડ'].map((d) => (
                  <option key={d} value={d}>
                    વર્ગ '{d}'
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Core Academic Identifiers */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                રોલ નંબર (Roll No) *
              </label>
              <input
                type="number"
                required
                min={1}
                value={rollNo}
                onChange={(e) => setRollNo(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                જી.આર. નંબર (GR No) *
              </label>
              <input
                type="text"
                required
                value={grNo}
                onChange={(e) => setGrNo(e.target.value)}
                placeholder="દા.ત. 1541"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono font-bold"
              />
            </div>
          </div>

          {/* Names */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              વિદ્યાર્થીનું પૂરું નામ (ગુજરાતીમાં) *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="દા.ત. બારિયા રાજેશકુમાર મહેશભાઈ"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              વિદ્યાર્થીનું નામ (અંગ્રેજીમાં)
            </label>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="e.g. Baria Rajeshkumar Maheshbhai"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium font-sans"
            />
          </div>

          {/* Gender & Mobile Number */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                જાતિ (Gender)
              </label>
              <select
                value={gender}
                onChange={(e) => {
                  const g = e.target.value as Gender;
                  setGender(g);
                  if (g === 'girl' && PRESET_AVATARS_BOYS.includes(photoUrl)) {
                    setPhotoUrl(PRESET_AVATARS_GIRLS[0]);
                  } else if (g === 'boy' && PRESET_AVATARS_GIRLS.includes(photoUrl)) {
                    setPhotoUrl(PRESET_AVATARS_BOYS[0]);
                  }
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium"
              >
                <option value="boy">કુમાર (Boy)</option>
                <option value="girl">કન્યા (Girl)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                બાળક / વાલીનો મોબાઇલ નં. *
              </label>
              <input
                type="tel"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                placeholder="દા.ત. 9825412301"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono font-bold"
              />
            </div>
          </div>

          {/* DOB & Blood Group */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                જન્મ તારીખ (Date of Birth) *
              </label>
              <input
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                બ્લડ ગ્રૂપ (Blood Group)
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-bold"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>

          {/* Official Aadhar & Child Tracking Section */}
          <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-3">
            <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>આધાર અને ચાઈલ્ડ ટ્રેકિંગ (Aadhar Details)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  આધાર ડાયસ નંબર (Child UID - 18 અંક)
                </label>
                <input
                  type="text"
                  maxLength={18}
                  value={aadharDiseNo}
                  onChange={(e) => setAadharDiseNo(e.target.value)}
                  placeholder="241703024031410001"
                  className="w-full px-3 py-2 text-xs bg-white border border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  આધાર કાર્ડ નંબર (12 અંક)
                </label>
                <input
                  type="text"
                  maxLength={14}
                  value={aadharNo}
                  onChange={(e) => setAadharNo(e.target.value)}
                  placeholder="4582 9104 3801"
                  className="w-full px-3 py-2 text-xs bg-white border border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Bank Account Section (DBT / Scholarship) */}
          <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-3">
            <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-blue-700" />
              <span>બેંક ખાતાની વિગત (Bank Account for DBT / શિષ્યવૃત્તિ)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  બેંક એકાઉન્ટ નંબર (Bank A/C No)
                </label>
                <input
                  type="text"
                  value={bankAccountNo}
                  onChange={(e) => setBankAccountNo(e.target.value)}
                  placeholder="દા.ત. 38410001002341"
                  className="w-full px-3 py-2 text-xs bg-white border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  IFSC કોડ
                </label>
                <input
                  type="text"
                  value={bankIfsc}
                  onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                  placeholder="BARB0DBHALO"
                  className="w-full px-3 py-2 text-xs bg-white border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold text-slate-900 uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                બેંકનું નામ અને શાખા (Bank Name)
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="દા.ત. બેંક ઓફ બરોડા (હાલોલ શાખા)"
                className="w-full px-3 py-2 text-xs bg-white border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>

          {/* Parent & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                વાલી / પિતાનું નામ
              </label>
              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="દા.ત. મહેશભાઈ બારિયા"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                સરનામું / રહેઠાણ
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="દા.ત. ઢીંકવા, તા. હાલોલ"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              રદ કરો
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>સાચવો (Save Student)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const StudentManagerView: React.FC<StudentManagerViewProps> = ({
  students,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onClearAllStudents,
  onResetToSampleStudents,
  config,
  onOpenClassSelector,
  editingStudent,
  onCloseEdit,
  onOpenAddModal,
}) => {
  const [viewMode, setViewMode] = useState<'register' | 'cards'>('register');
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'boy' | 'girl'>('all');
  const [standardFilter, setStandardFilter] = useState<string>(config?.standard || 'all');
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<Student | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const nextRollNo =
    students.length > 0 ? Math.max(...students.map((s) => s.rollNo)) + 1 : 1;

  // Filter students
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        if (genderFilter !== 'all' && s.gender !== genderFilter) return false;
        if (standardFilter !== 'all' && (s.standard || 'ધોરણ ૬') !== standardFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          return (
            s.name.toLowerCase().includes(q) ||
            s.nameEn.toLowerCase().includes(q) ||
            s.grNo.includes(q) ||
            String(s.rollNo) === q ||
            s.parentPhone.includes(q) ||
            (s.aadharDiseNo && s.aadharDiseNo.includes(q)) ||
            (s.aadharNo && s.aadharNo.includes(q)) ||
            (s.bankAccountNo && s.bankAccountNo.includes(q))
          );
        }
        return true;
      })
      .sort((a, b) => a.rollNo - b.rollNo);
  }, [students, genderFilter, standardFilter, searchQuery]);

  // Export full General Register to CSV
  const handleExportRegisterCSV = () => {
    let csv =
      'ધોરણ,રોલ નં,GR નં,વિદ્યાર્થીનું નામ,અંગ્રેજી નામ,જાતિ,જન્મ તારીખ,આધાર ડાયસ નં,આધાર કાર્ડ નં,બેંક ખાતા નં,IFSC કોડ,બેંકનું નામ,મોબાઇલ નં,સરનામું\n';
    filteredStudents.forEach((s) => {
      csv += `"${s.standard || config?.standard || 'ધોરણ ૬'}",${s.rollNo},"${s.grNo}","${s.name}","${s.nameEn}","${
        s.gender === 'boy' ? 'કુમાર' : 'કન્યા'
      }","${s.dob || ''}","${s.aadharDiseNo || ''}","${s.aadharNo || ''}","${
        s.bankAccountNo || ''
      }","${s.bankIfsc || ''}","${s.bankName || ''}","${s.parentPhone || ''}","${
        s.address || ''
      }"\n`;
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Dhinkva_${standardFilter === 'all' ? 'All_Standards' : standardFilter}_General_Register.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner and Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-700" />
              <span>વિદ્યાર્થી જનરલ રજીસ્ટર અને પ્રોફાઇલ (Student Master Register)</span>
            </h2>
            <p className="text-xs text-slate-500">
              કુલ <strong>{students.length}</strong> વિદ્યાર્થીઓ (કુમાર:{' '}
              <strong className="text-blue-700">
                {students.filter((s) => s.gender === 'boy').length}
              </strong>
              , કન્યા:{' '}
              <strong className="text-purple-700">
                {students.filter((s) => s.gender === 'girl').length}
              </strong>
              ) • આધાર ડાયસ, બેંક એકાઉન્ટ અને જન્મ તારીખ વિગતવાર પત્રક
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenClassSelector && (
              <button
                type="button"
                onClick={onOpenClassSelector}
                className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-bold border border-amber-300 transition-colors cursor-pointer"
                title="ધોરણ અથવા વર્ગ બદલો"
              >
                <GraduationCap className="w-4 h-4 text-amber-700" />
                <span>{config?.standard || 'ધોરણ ૬'} ({config?.division || 'અ'}) ✎</span>
              </button>
            )}

            {onResetToSampleStudents && students.length === 0 && (
              <button
                type="button"
                onClick={onResetToSampleStudents}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-300 transition-colors cursor-pointer"
                title="નમૂના વિદ્યાર્થીઓની યાદી લાવો"
              >
                <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                <span>નમૂના વિદ્યાર્થીઓ લાવો</span>
              </button>
            )}

            {onClearAllStudents && students.length > 0 && (
              <button
                type="button"
                onClick={() => setShowClearAllConfirm(true)}
                className="flex items-center gap-1.5 px-2.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold border border-rose-200 transition-colors cursor-pointer"
                title="તમામ વિદ્યાર્થીઓની યાદી ખાલી / ડિલીટ કરો"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>બધા ડિલીટ</span>
              </button>
            )}

            <button
              onClick={handleExportRegisterCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-300 transition-colors cursor-pointer"
              title="રજીસ્ટર Excel ડાઉનલોડ કરો"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>Excel પત્રક</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-300 transition-colors cursor-pointer"
              title="A4 રજીસ્ટર પ્રિન્ટ કરો"
            >
              <Printer className="w-4 h-4" />
              <span>પ્રિન્ટ રજીસ્ટર</span>
            </button>

            <button
              onClick={onOpenAddModal}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>નવો વિદ્યાર્થી ઉમેરો</span>
            </button>
          </div>
        </div>

        {/* Search, Filter & View Toggle Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="નામ, રોલ, GR, આધાર, બેંક કે ફોનથી શોધો..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Gender filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setGenderFilter('all')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  genderFilter === 'all'
                    ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                બધા ({students.length})
              </button>
              <button
                onClick={() => setGenderFilter('boy')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  genderFilter === 'boy'
                    ? 'bg-white text-blue-800 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                કુમાર ({students.filter((s) => s.gender === 'boy').length})
              </button>
              <button
                onClick={() => setGenderFilter('girl')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  genderFilter === 'girl'
                    ? 'bg-white text-purple-800 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                કન્યા ({students.filter((s) => s.gender === 'girl').length})
              </button>
            </div>

            {/* Standard filter dropdown */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <select
                value={standardFilter}
                onChange={(e) => setStandardFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 px-2 py-1 outline-none cursor-pointer"
              >
                <option value="all">બધા ધોરણ ({students.length})</option>
                {['ધોરણ ૧', 'ધોરણ ૨', 'ધોરણ ૩', 'ધોરણ ૪', 'ધોરણ ૫', 'ધોરણ ૬', 'ધોરણ ૭', 'ધોરણ ૮'].map((std) => {
                  const cnt = students.filter((s) => (s.standard || 'ધોરણ ૬') === std).length;
                  return (
                    <option key={std} value={std}>
                      {std} ({cnt})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('register')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                viewMode === 'register'
                  ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              જનરલ રજીસ્ટર ટેબલ
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                viewMode === 'cards'
                  ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              કાર્ડ વ્યુ
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: Master General Register Table */}
      {viewMode === 'register' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-900 text-white font-semibold print:bg-slate-200 print:text-black">
                <tr>
                  <th className="p-2.5 text-center w-12">રોલ</th>
                  <th className="p-2.5 w-12 text-center">ફોટો</th>
                  <th className="p-2.5 min-w-[150px]">વિદ્યાર્થીનું પૂરું નામ</th>
                  <th className="p-2.5 w-14">GR નં.</th>
                  <th className="p-2.5 w-14">જાતિ</th>
                  <th className="p-2.5 min-w-[90px]">જન્મ તારીખ</th>
                  <th className="p-2.5 min-w-[150px]">આધાર ડાયસ (18 અંક)</th>
                  <th className="p-2.5 min-w-[120px]">આધાર કાર્ડ (12 અંક)</th>
                  <th className="p-2.5 min-w-[130px]">બેંક એકાઉન્ટ નં.</th>
                  <th className="p-2.5 min-w-[100px]">IFSC કોડ</th>
                  <th className="p-2.5 min-w-[100px]">મોબાઇલ નંબર</th>
                  <th className="p-2.5 text-right w-20 print:hidden">ક્રિયા</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => setSelectedStudentForProfile(student)}
                  >
                    <td className="p-2.5 text-center font-mono font-bold text-slate-800">
                      {String(student.rollNo).padStart(2, '0')}
                    </td>
                    <td className="p-2.5 text-center">
                      <img
                        src={student.photoUrl}
                        alt={student.name}
                        className="w-8 h-8 rounded-lg object-cover border border-slate-200 mx-auto shadow-2xs"
                      />
                    </td>
                    <td className="p-2.5">
                      <div className="font-bold text-slate-900 group-hover:text-emerald-700">
                        {student.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-sans">{student.nameEn}</div>
                    </td>
                    <td className="p-2.5 font-mono text-slate-600 font-medium">
                      {student.grNo}
                    </td>
                    <td className="p-2.5">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          student.gender === 'boy'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-purple-50 text-purple-700'
                        }`}
                      >
                        {student.gender === 'boy' ? 'કુમાર' : 'કન્યા'}
                      </span>
                    </td>
                    <td className="p-2.5 font-mono text-slate-700">
                      {student.dob ? formatGujaratiDate(student.dob) : '-'}
                    </td>
                    <td className="p-2.5 font-mono text-slate-800 font-semibold text-[11px]">
                      {student.aadharDiseNo || '-'}
                    </td>
                    <td className="p-2.5 font-mono text-slate-800 font-semibold text-[11px]">
                      {student.aadharNo || '-'}
                    </td>
                    <td className="p-2.5 font-mono text-emerald-800 font-bold text-[11px]">
                      {student.bankAccountNo || '-'}
                    </td>
                    <td className="p-2.5 font-mono text-slate-600 text-[10px] uppercase">
                      {student.bankIfsc || '-'}
                    </td>
                    <td className="p-2.5 font-mono text-slate-700 font-semibold">
                      {student.parentPhone || '-'}
                    </td>
                    <td className="p-2.5 text-right print:hidden" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedStudentForProfile(student)}
                          className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded"
                          title="સંપૂર્ણ પ્રોફાઈલ જુઓ"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onUpdateStudent(student)}
                          className="p-1 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded"
                          title="સુધારો"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(student.id)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="કાઢી નાખો"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: Student Cards Grid View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 hover:shadow-md transition-all space-y-3"
            >
              <div className="flex items-start gap-3">
                <img
                  src={student.photoUrl}
                  alt={student.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-600 shadow-2xs shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full">
                      રોલ #{student.rollNo}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      GR: {student.grNo}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm truncate mt-1">
                    {student.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 truncate font-sans">
                    {student.nameEn}
                  </p>
                </div>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-100 text-[11px]">
                <div className="text-slate-500">
                  જન્મ તારીખ:{' '}
                  <strong className="text-slate-800 font-mono block">
                    {student.dob ? formatGujaratiDate(student.dob) : '-'}
                  </strong>
                </div>
                <div className="text-slate-500">
                  મોબાઇલ નં:{' '}
                  <strong className="text-slate-800 font-mono block">
                    {student.parentPhone || '-'}
                  </strong>
                </div>
                <div className="text-slate-500">
                  આધાર ડાયસ:{' '}
                  <strong className="text-slate-800 font-mono block text-[10px] truncate">
                    {student.aadharDiseNo || '-'}
                  </strong>
                </div>
                <div className="text-slate-500">
                  બેંક એકાઉન્ટ:{' '}
                  <strong className="text-emerald-800 font-mono block text-[10px] truncate">
                    {student.bankAccountNo || '-'}
                  </strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  onClick={() => setSelectedStudentForProfile(student)}
                  className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-xl cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>સંપૂર્ણ વિગત</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onUpdateStudent(student)}
                    className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    title="સુધારો"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(student.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="કાઢી નાખો"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Student Complete Profile Modal */}
      {selectedStudentForProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="bg-emerald-800 text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-amber-300" />
                <span className="font-bold text-sm">વિદ્યાર્થી સંપૂર્ણ પ્રોફાઈલ વિગત</span>
              </div>
              <button
                onClick={() => setSelectedStudentForProfile(null)}
                className="text-white/80 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Profile Card Header */}
              <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <img
                  src={selectedStudentForProfile.photoUrl}
                  alt={selectedStudentForProfile.name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-600 shadow-sm"
                />
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-700 text-white font-mono font-bold px-2 py-0.5 rounded-md text-[11px]">
                      રોલ #{selectedStudentForProfile.rollNo}
                    </span>
                    <span className="bg-slate-200 text-slate-800 font-mono px-2 py-0.5 rounded-md text-[11px]">
                      GR નં: {selectedStudentForProfile.grNo}
                    </span>
                  </div>
                  <h3 className="font-black text-slate-900 text-base">
                    {selectedStudentForProfile.name}
                  </h3>
                  <p className="text-slate-500 font-sans text-xs">
                    {selectedStudentForProfile.nameEn}
                  </p>
                </div>
              </div>

              {/* Key Details List */}
              <div className="space-y-2">
                {/* Mobile Number */}
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-700" />
                    <div>
                      <div className="text-[10px] text-slate-500">બાળક / વાલીનો મોબાઇલ નંબર</div>
                      <div className="font-mono font-bold text-slate-900 text-sm">
                        {selectedStudentForProfile.parentPhone || 'નોંધાયેલ નથી'}
                      </div>
                    </div>
                  </div>
                  {selectedStudentForProfile.parentPhone && (
                    <button
                      onClick={() =>
                        copyToClipboard(selectedStudentForProfile.parentPhone, 'phone')
                      }
                      className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs flex items-center gap-1 font-semibold"
                    >
                      {copiedKey === 'phone' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>કોપી</span>
                    </button>
                  )}
                </div>

                {/* Date of Birth */}
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-700" />
                    <div>
                      <div className="text-[10px] text-slate-500">જન્મ તારીખ (Date of Birth)</div>
                      <div className="font-mono font-bold text-slate-900 text-sm">
                        {selectedStudentForProfile.dob
                          ? `${formatGujaratiDate(selectedStudentForProfile.dob)} (${
                              selectedStudentForProfile.dob
                            })`
                          : '-'}
                      </div>
                    </div>
                  </div>
                  <div className="text-slate-600 font-bold bg-white px-2 py-1 rounded-lg border border-slate-200">
                    બ્લડ ગ્રૂપ: {selectedStudentForProfile.bloodGroup || 'B+'}
                  </div>
                </div>

                {/* Aadhar DISE Number (18 Digits) */}
                <div className="flex items-center justify-between p-2.5 bg-emerald-50/70 rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-800" />
                    <div>
                      <div className="text-[10px] text-emerald-800 font-bold">
                        આધાર ડાયસ નંબર (Child UID - 18 અંક)
                      </div>
                      <div className="font-mono font-black text-slate-900 text-sm tracking-wide">
                        {selectedStudentForProfile.aadharDiseNo || 'નોંધાયેલ નથી'}
                      </div>
                    </div>
                  </div>
                  {selectedStudentForProfile.aadharDiseNo && (
                    <button
                      onClick={() =>
                        copyToClipboard(selectedStudentForProfile.aadharDiseNo || '', 'dise')
                      }
                      className="px-2 py-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs flex items-center gap-1 font-semibold"
                    >
                      {copiedKey === 'dise' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>કોપી</span>
                    </button>
                  )}
                </div>

                {/* Aadhar Card Number (12 Digits) */}
                <div className="flex items-center justify-between p-2.5 bg-emerald-50/70 rounded-xl border border-emerald-200">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-800" />
                    <div>
                      <div className="text-[10px] text-emerald-800 font-bold">
                        આધાર કાર્ડ નંબર (12 અંક)
                      </div>
                      <div className="font-mono font-black text-slate-900 text-sm tracking-wider">
                        {selectedStudentForProfile.aadharNo || 'નોંધાયેલ નથી'}
                      </div>
                    </div>
                  </div>
                  {selectedStudentForProfile.aadharNo && (
                    <button
                      onClick={() =>
                        copyToClipboard(selectedStudentForProfile.aadharNo || '', 'aadhar')
                      }
                      className="px-2 py-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs flex items-center gap-1 font-semibold"
                    >
                      {copiedKey === 'aadhar' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>કોપી</span>
                    </button>
                  )}
                </div>

                {/* Bank Account Number & IFSC */}
                <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-blue-800" />
                      <div>
                        <div className="text-[10px] text-blue-800 font-bold">
                          બેંક ખાતા નંબર (DBT / શિષ્યવૃત્તિ એકાઉન્ટ)
                        </div>
                        <div className="font-mono font-black text-slate-900 text-sm">
                          {selectedStudentForProfile.bankAccountNo || 'નોંધાયેલ નથી'}
                        </div>
                      </div>
                    </div>
                    {selectedStudentForProfile.bankAccountNo && (
                      <button
                        onClick={() =>
                          copyToClipboard(
                            selectedStudentForProfile.bankAccountNo || '',
                            'bank'
                          )
                        }
                        className="px-2 py-1 bg-white hover:bg-blue-100 text-blue-800 border border-blue-300 rounded-lg text-xs flex items-center gap-1 font-semibold"
                      >
                        {copiedKey === 'bank' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>કોપી</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-blue-200/60 text-[11px]">
                    <div>
                      <span className="text-slate-500">IFSC કોડ: </span>
                      <strong className="font-mono text-slate-900 uppercase">
                        {selectedStudentForProfile.bankIfsc || '-'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500">શાખા: </span>
                      <strong className="text-slate-900">
                        {selectedStudentForProfile.bankName || 'બેંક ઓફ બરોડા'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Parent & Address */}
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div>
                    <span className="text-slate-500">વાલી / પિતાનું નામ: </span>
                    <strong className="text-slate-800">
                      {selectedStudentForProfile.parentName || '-'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500">સરનામું: </span>
                    <strong className="text-slate-800">
                      {selectedStudentForProfile.address || `${config?.schoolName || 'પે સેન્ટર શાળા ઢીંકવા'}, તા. ${config?.taluka || 'હાલોલ'}`}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  onClick={() => {
                    const st = selectedStudentForProfile;
                    setSelectedStudentForProfile(null);
                    onUpdateStudent(st);
                  }}
                  className="flex items-center gap-1 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>વિગતો સુધારો (Edit)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">શું તમે ખાતરી કરો છો?</h3>
              <p className="text-xs text-slate-500 mt-1">
                આ વિદ્યાર્થીની માહિતી અને હાજરીનો રેકોર્ડ કાયમ માટે કાઢી નાખવામાં આવશે.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                રદ કરો
              </button>
              <button
                onClick={() => {
                  onDeleteStudent(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs"
              >
                હા, કાઢી નાખો
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Students Confirmation Modal */}
      {showClearAllConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-red-200 text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">બધા વિદ્યાર્થીઓ ડિલીટ કરવા છે?</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                આ કરવાથી વર્ગના તમામ <strong>{students.length}</strong> વિદ્યાર્થીઓ યાદીમાંથી કાયમ માટે ડિલીટ થઈ જશે. તમે જરૂર પડ્યે ફરીથી નવો વિદ્યાર્થી ઉમેરી શકશો અથવા નમૂના વિદ્યાર્થીઓ લાવી શકશો.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowClearAllConfirm(false)}
                className="px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-300 transition-colors"
              >
                રદ કરો
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onClearAllStudents) onClearAllStudents();
                  setShowClearAllConfirm(false);
                }}
                className="px-5 py-2.5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm transition-colors"
              >
                હા, બધા ડિલીટ કરો
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <StudentFormModal
          isOpen={true}
          onClose={onCloseEdit}
          onSave={onUpdateStudent}
          initialData={editingStudent}
          nextRollNo={nextRollNo}
          defaultStandard={config?.standard}
          defaultDivision={config?.division}
        />
      )}
    </div>
  );
};
