import React, { useState } from 'react';
import {
  X,
  Phone,
  Mail,
  MessageCircle,
  GraduationCap,
  Award,
  CheckCircle,
  UserCheck,
  Edit2,
  Check,
  Users,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Teacher, SchoolConfig, Student, AttendanceRecord } from '../types';

interface TeachersModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SchoolConfig;
  onUpdateConfig: (updatedConfig: SchoolConfig) => void;
  onSelectStandard: (standard: string) => void;
  students: Student[];
  todayRecords: Record<string, AttendanceRecord>;
  currentDate: string;
}

export const TeachersModal: React.FC<TeachersModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  onSelectStandard,
  students,
  todayRecords,
  currentDate,
}) => {
  const teachers: Teacher[] = config.teachers || [];
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editQualification, setEditQualification] = useState('');
  const [editPhotoUrl, setEditPhotoUrl] = useState('');

  if (!isOpen) return null;

  const handleStartEdit = (t: Teacher) => {
    setEditingTeacher(t);
    setEditName(t.name);
    setEditPhone(t.phone);
    setEditEmail(t.email);
    setEditCode(t.teacherCode);
    setEditQualification(t.qualification || '');
    setEditPhotoUrl(t.photoUrl || '');
  };

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;

    const updatedTeachers = teachers.map((t) => {
      if (t.id === editingTeacher.id) {
        return {
          ...t,
          name: editName.trim() || t.name,
          phone: editPhone.trim() || t.phone,
          email: editEmail.trim() || t.email,
          teacherCode: editCode.trim() || t.teacherCode,
          qualification: editQualification.trim() || t.qualification,
          photoUrl: editPhotoUrl.trim() || t.photoUrl,
        };
      }
      return t;
    });

    const isCurrentActive = editingTeacher.standard === config.standard;
    const updatedConfig: SchoolConfig = {
      ...config,
      teachers: updatedTeachers,
      ...(isCurrentActive
        ? {
            teacherName: editName.trim() || config.teacherName,
            teacherPhone: editPhone.trim() || config.teacherPhone,
            teacherEmail: editEmail.trim() || config.teacherEmail,
            teacherCode: editCode.trim() || config.teacherCode,
            teacherPhotoUrl: editPhotoUrl.trim() || config.teacherPhotoUrl,
          }
        : {}),
    };

    onUpdateConfig(updatedConfig);
    setEditingTeacher(null);
  };

  // Get class statistics for a specific standard
  const getStandardStats = (stdName: string) => {
    const classStudents = students.filter((s) => (s.standard || 'ધોરણ ૬') === stdName);
    const dayRecord = todayRecords[currentDate]?.records || {};
    let present = 0;
    let marked = 0;

    classStudents.forEach((s) => {
      if (dayRecord[s.id]) {
        marked++;
        if (dayRecord[s.id] === 'present') present++;
      }
    });

    const percent = classStudents.length > 0 ? Math.round((present / classStudents.length) * 100) : 0;
    return {
      total: classStudents.length,
      present,
      marked,
      percent,
      isComplete: marked >= classStudents.length && classStudents.length > 0,
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300 border border-white/20 shadow-inner">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base sm:text-lg">શાળાના ૮ શિક્ષકો અને વર્ગ સંચાલન</h2>
                <span className="text-[10px] bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full font-extrabold uppercase">
                  ધોરણ ૧ થી ૮
                </span>
              </div>
              <p className="text-xs text-emerald-100 flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-white">{config.schoolName}</span>
                <span>•</span>
                <span className="text-amber-200">{config.payCenterSchool || 'પે સેન્ટર શાળા ઢીંકવા'}</span>
                <span>•</span>
                <span>DISE: {config.schoolCode}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Head Teacher / Admin Highlight Card */}
          <div className="bg-gradient-to-r from-amber-50 via-emerald-50 to-teal-50 border-2 border-emerald-300/80 rounded-2xl p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <img
                  src={
                    config.teacherPhotoUrl ||
                    'https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=400&auto=format&fit=crop&q=80'
                  }
                  alt={config.teacherName}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-600 shadow-sm"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold bg-emerald-700 text-white px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Award className="w-3 h-3 text-amber-300" />
                      મુખ્ય શિક્ષક / હેડ ટીચર & વર્ગ શિક્ષક (ધોરણ ૬)
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 mt-0.5">
                    {config.teacherName || 'શ્રી બી. બી. પટેલ'}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 mt-1 font-medium">
                    <span className="flex items-center gap-1 font-mono text-emerald-800 font-bold">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      {config.teacherPhone || '9099662933'}
                    </span>
                    <span className="flex items-center gap-1 text-slate-600">
                      <Mail className="w-3.5 h-3.5 text-teal-600" />
                      {config.teacherEmail || 'bbpatel7303@gmail.com'}
                    </span>
                    <span className="text-slate-400">• કોડ: {config.teacherCode || '10069036'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <a
                  href={`tel:${config.teacherPhone || '9099662933'}`}
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>કોલ</span>
                </a>
                <a
                  href={`https://wa.me/91${config.teacherPhone || '9099662933'}?text=${encodeURIComponent(
                    `નમસ્તે શ્રી બી. બી. પટેલ સાહેબ, પે સેન્ટર શાળા ઢીંકવા ડિજિટલ હાજરી સંદર્ભે.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href={`mailto:${config.teacherEmail || 'bbpatel7303@gmail.com'}`}
                  className="p-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl transition-colors"
                  title="ઈમેલ મોકલો"
                >
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Grid of All 8 Teachers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {teachers.map((teacher) => {
              const isCurrentClass = config.standard === teacher.standard;
              const stats = getStandardStats(teacher.standard);

              return (
                <div
                  key={teacher.id}
                  className={`rounded-2xl border transition-all p-4 flex flex-col justify-between ${
                    isCurrentClass
                      ? 'bg-emerald-50/70 border-emerald-500 shadow-md ring-2 ring-emerald-400/30'
                      : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-xs'
                  }`}
                >
                  <div>
                    {/* Top Row: Standard Badge & Active Badge */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black bg-emerald-800 text-white px-2.5 py-0.5 rounded-lg">
                          {teacher.standard} ({teacher.division || 'અ'})
                        </span>
                        {teacher.isHeadTeacher && (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded-md">
                            મુખ્ય શિક્ષક
                          </span>
                        )}
                      </div>
                      {isCurrentClass && (
                        <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" /> હાલ સક્રિય વર્ગ
                        </span>
                      )}
                    </div>

                    {/* Teacher Info */}
                    <div className="flex items-start gap-3">
                      <img
                        src={
                          teacher.photoUrl ||
                          'https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=400&auto=format&fit=crop&q=80'
                        }
                        alt={teacher.name}
                        className="w-13 h-13 rounded-2xl object-cover border border-slate-200 shadow-2xs shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {teacher.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate">
                          {teacher.qualification || 'શિક્ષક'} • કોડ: {teacher.teacherCode}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-700">
                          <span className="font-mono font-bold text-emerald-800 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-emerald-600" />
                            {teacher.phone}
                          </span>
                        </div>
                        {teacher.email && (
                          <div className="text-[10px] text-slate-500 truncate mt-0.5 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {teacher.email}
                          </div>
                        )}
                      </div>

                      {/* Edit Button */}
                      <button
                        onClick={() => handleStartEdit(teacher)}
                        className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                        title="શિક્ષકની વિગત સુધારો"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Attendance Stats & Action */}
                  <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="text-[11px]">
                      <span className="text-slate-500">આજની હાજરી: </span>
                      <strong className={stats.percent >= 80 ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                        {stats.total > 0 ? `${stats.present}/${stats.total} (${stats.percent}%)` : 'વિદ્યાર્થી ઉમેરો'}
                      </strong>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={`tel:${teacher.phone}`}
                        className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg border border-slate-200 transition-colors"
                        title="કોલ કરો"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={`https://wa.me/91${teacher.phone}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-slate-600 hover:text-green-700 hover:bg-green-50 rounded-lg border border-slate-200 transition-colors"
                        title="WhatsApp કરો"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => {
                          onSelectStandard(teacher.standard);
                          onClose();
                        }}
                        className={`text-xs px-2.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          isCurrentClass
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700'
                        }`}
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>હાજરી પૂરો</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>દરેક ધોરણના શિક્ષક પોતાના વર્ગની હાજરી સ્વતંત્ર રીતે પૂરી શકે છે.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold transition-colors"
          >
            બંધ કરો
          </button>
        </div>
      </div>

      {/* Teacher Edit Sub-Modal */}
      {editingTeacher && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-emerald-700" />
                <span>શિક્ષકની વિગતો સુધારો - {editingTeacher.standard}</span>
              </h3>
              <button
                onClick={() => setEditingTeacher(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTeacher} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  શિક્ષકનું પૂરું નામ
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    મોબાઈલ નંબર
                  </label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="10 અંકનો નંબર"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    શિક્ષક કોડ (Code)
                  </label>
                  <input
                    type="text"
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ઈમેલ એડ્રેસ
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  લાયકાત / હોદ્દો (Qualification)
                </label>
                <input
                  type="text"
                  value={editQualification}
                  onChange={(e) => setEditQualification(e.target.value)}
                  placeholder="દા.ત. P.T.C., B.A., B.Ed."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ફોટો URL
                </label>
                <input
                  type="url"
                  value={editPhotoUrl}
                  onChange={(e) => setEditPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-600 font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTeacher(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs"
                >
                  સેવ કરો
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
