import React from 'react';
import {
  GraduationCap,
  Users,
  CheckCircle2,
  Phone,
  Mail,
  ChevronRight,
  Sparkles,
  Award,
  Layers,
} from 'lucide-react';
import { SchoolConfig, Teacher, Student, AttendanceRecord } from '../types';

interface StandardSwitcherBarProps {
  config: SchoolConfig;
  onSelectStandard: (standard: string) => void;
  onOpenTeachersModal: () => void;
  onOpenClassSelectorModal?: () => void;
  students: Student[];
  allRecords: Record<string, AttendanceRecord>;
  currentDate: string;
}

export const StandardSwitcherBar: React.FC<StandardSwitcherBarProps> = ({
  config,
  onSelectStandard,
  onOpenTeachersModal,
  onOpenClassSelectorModal,
  students,
  allRecords,
  currentDate,
}) => {
  const availableStandards = config.availableStandards || [
    'ધોરણ ૧',
    'ધોરણ ૨',
    'ધોરણ ૩',
    'ધોરણ ૪',
    'ધોરણ ૫',
    'ધોરણ ૬',
    'ધોરણ ૭',
    'ધોરણ ૮',
  ];

  const teachers: Teacher[] = config.teachers || [];
  const todayRecord = allRecords[currentDate]?.records || {};

  // Current active teacher
  const activeTeacher =
    teachers.find((t) => t.standard === config.standard) || {
      name: config.teacherName,
      phone: config.teacherPhone || '9099662933',
      email: config.teacherEmail || 'bbpatel7303@gmail.com',
      teacherCode: config.teacherCode,
      photoUrl: config.teacherPhotoUrl,
      standard: config.standard,
      division: config.division,
      qualification: 'વર્ગ શિક્ષક',
    };

  // School total statistics
  let totalSchoolStudents = students.length;
  let totalPresentToday = 0;
  let totalMarkedToday = 0;

  students.forEach((s) => {
    if (todayRecord[s.id]) {
      totalMarkedToday++;
      if (todayRecord[s.id] === 'present') totalPresentToday++;
    }
  });

  const overallSchoolPercent =
    totalSchoolStudents > 0
      ? Math.round((totalPresentToday / totalSchoolStudents) * 100)
      : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3.5 sm:p-4 space-y-3">
      {/* Top Bar: Title, Active Teacher Snapshot & Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={
                activeTeacher.photoUrl ||
                'https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=400&auto=format&fit=crop&q=80'
              }
              alt={activeTeacher.name}
              className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-600 shadow-2xs"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
            </span>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-black bg-emerald-700 text-white px-2 py-0.5 rounded-md">
                {config.standard} ({config.division || 'અ'})
              </span>
              <span className="text-xs font-bold text-slate-800">
                {activeTeacher.name}
              </span>
              {activeTeacher.standard === 'ધોરણ ૬' && (
                <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-bold px-1.5 py-0.5 rounded">
                  મુખ્ય શિક્ષક
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-slate-500 mt-0.5 font-medium">
              <a
                href={`tel:${activeTeacher.phone}`}
                className="font-mono text-emerald-800 hover:underline flex items-center gap-1 font-bold"
              >
                <Phone className="w-3 h-3 text-emerald-600" />
                {activeTeacher.phone}
              </a>
              {activeTeacher.email && (
                <a
                  href={`mailto:${activeTeacher.email}`}
                  className="hover:underline flex items-center gap-1 text-slate-600"
                >
                  <Mail className="w-3 h-3 text-teal-600" />
                  {activeTeacher.email}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls & Total School Stats */}
        <div className="flex items-center gap-2 self-start md:self-center">
          {/* Overall School Attendance Badge */}
          <div className="hidden sm:flex flex-col items-end px-3 py-1 bg-slate-50 rounded-xl border border-slate-200 text-right">
            <span className="text-[10px] text-slate-500 font-semibold">
              સમગ્ર શાળા આજની હાજરી:
            </span>
            <span className="text-xs font-black text-emerald-800">
              {totalPresentToday}/{totalSchoolStudents} ({overallSchoolPercent}%)
            </span>
          </div>

          {/* Button: 8 Teachers Directory */}
          <button
            type="button"
            onClick={onOpenTeachersModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-300 transition-colors shadow-2xs cursor-pointer"
            title="શાળાના ૮ શિક્ષકોની વિગતો અને ફોન નંબર જુઓ"
          >
            <Users className="w-3.5 h-3.5 text-emerald-700" />
            <span>૮ શિક્ષકો ડિરેક્ટરી</span>
          </button>

          {/* Button: Change Division / Class */}
          {onOpenClassSelectorModal && (
            <button
              type="button"
              onClick={onOpenClassSelectorModal}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              title="વર્ગ/ધોરણ વિકલ્પો"
            >
              <Layers className="w-3.5 h-3.5 text-slate-600" />
              <span>વિકલ્પો</span>
            </button>
          )}
        </div>
      </div>

      {/* 8 Standards Switcher Pills Grid */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
            ધોરણ પસંદ કરો (૮ ધોરણ ની હાજરી):
          </span>
          <span className="text-[10px] text-slate-400">
            ક્લિક કરીને કોઈપણ ધોરણની હાજરી પૂરો
          </span>
        </div>

        <div className="grid grid-cols-2 xs:grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {availableStandards.map((std) => {
            const isSelected = config.standard === std;
            const teacher = teachers.find((t) => t.standard === std);
            const classStudents = students.filter(
              (s) => (s.standard || 'ધોરણ ૬') === std
            );

            // Compute class attendance
            let presentCount = 0;
            let markedCount = 0;
            classStudents.forEach((s) => {
              if (todayRecord[s.id]) {
                markedCount++;
                if (todayRecord[s.id] === 'present') presentCount++;
              }
            });

            const hasStudents = classStudents.length > 0;
            const isCompleted = markedCount >= classStudents.length && hasStudents;

            return (
              <button
                key={std}
                type="button"
                onClick={() => onSelectStandard(std)}
                className={`p-2 rounded-xl text-left transition-all border flex flex-col justify-between gap-1 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-b from-emerald-700 to-teal-800 text-white border-emerald-900 shadow-md ring-2 ring-emerald-400/40 scale-[1.02]'
                    : 'bg-slate-50 hover:bg-emerald-50/50 hover:border-emerald-300 text-slate-700 border-slate-200'
                }`}
              >
                {/* Standard Label & Status */}
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`font-black text-xs ${
                      isSelected ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {std}
                  </span>
                  {isSelected ? (
                    <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
                  ) : isCompleted ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  )}
                </div>

                {/* Teacher Short Name */}
                <div
                  className={`text-[10px] font-semibold truncate ${
                    isSelected ? 'text-emerald-100' : 'text-slate-500'
                  }`}
                  title={teacher?.name || 'શિક્ષક'}
                >
                  {teacher ? teacher.name.replace('શ્રીમતી ', '').replace('શ્રી ', '') : 'શિક્ષક'}
                </div>

                {/* Attendance Count */}
                <div
                  className={`text-[9px] font-mono font-bold flex items-center justify-between ${
                    isSelected
                      ? 'text-amber-200'
                      : hasStudents
                      ? 'text-emerald-700'
                      : 'text-slate-400'
                  }`}
                >
                  <span>{hasStudents ? `${presentCount}/${classStudents.length}` : '૦ છાત્ર'}</span>
                  <span>{hasStudents ? `${Math.round((presentCount / classStudents.length) * 100)}%` : '-'}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
