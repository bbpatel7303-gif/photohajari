import React from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  MessageCircle,
  Edit2,
  Sparkles,
  CreditCard,
} from 'lucide-react';
import { Student, AttendanceStatus } from '../types';

interface StudentCardProps {
  student: Student;
  status: AttendanceStatus;
  onToggleStatus: (studentId: string) => void;
  onSetStatus: (studentId: string, status: AttendanceStatus) => void;
  onEditStudent: (student: Student) => void;
  onViewIdCard?: (studentId: string) => void;
  viewMode?: 'grid' | 'compact' | 'list';
  schoolName?: string;
  standard?: string;
}

export const StudentCard: React.FC<StudentCardProps> = ({
  student,
  status,
  onToggleStatus,
  onSetStatus,
  onEditStudent,
  onViewIdCard,
  viewMode = 'grid',
  schoolName = 'પે સેન્ટર શાળા ઢીંકવા',
  standard,
}) => {
  const isPresent = status === 'present';
  const isAbsent = status === 'absent';
  const isLeave = status === 'leave';

  const rollFormatted = String(student.rollNo).padStart(2, '0');

  // Handle direct photo tap
  const handlePhotoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleStatus(student.id);
  };

  if (viewMode === 'list') {
    return (
      <div
        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
          isPresent
            ? 'bg-emerald-50/50 border-emerald-300'
            : isAbsent
            ? 'bg-red-50/60 border-red-300'
            : 'bg-amber-50/60 border-amber-300'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Clickable Photo in List */}
          <button
            type="button"
            onClick={handlePhotoClick}
            className="relative group shrink-0 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-full"
            title="હાજરી બદલવા ફોટો પર ક્લિક કરો"
          >
            <img
              src={student.photoUrl}
              alt={student.name}
              className={`w-12 h-12 rounded-full object-cover border-2 shadow-xs transition-transform group-hover:scale-105 active:scale-95 ${
                isPresent
                  ? 'border-emerald-500 ring-2 ring-emerald-300/60'
                  : isAbsent
                  ? 'border-red-500 grayscale-30 ring-2 ring-red-300/60'
                  : 'border-amber-500 ring-2 ring-amber-300/60'
              }`}
            />
            <div className="absolute -bottom-1 -right-1 rounded-full bg-white shadow-xs p-0.5">
              {isPresent && <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />}
              {isAbsent && <XCircle className="w-4 h-4 text-red-600 fill-red-100" />}
              {isLeave && <Clock className="w-4 h-4 text-amber-600 fill-amber-100" />}
            </div>
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-slate-200/80 text-slate-800 px-1.5 py-0.5 rounded">
                #{rollFormatted}
              </span>
              <span className="text-sm font-semibold text-slate-900 truncate">
                {student.name}
              </span>
            </div>
            <div className="text-xs text-slate-500 truncate flex items-center gap-2">
              <span>{student.nameEn}</span>
              <span>•</span>
              <span>જી.આર. {student.grNo}</span>
              <span>•</span>
              <span>{student.gender === 'boy' ? 'કુમાર' : 'કન્યા'}</span>
            </div>
          </div>
        </div>

        {/* Quick status switcher */}
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          <button
            type="button"
            onClick={() => onSetStatus(student.id, 'present')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              isPresent
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700'
            }`}
          >
            હાજર
          </button>
          <button
            type="button"
            onClick={() => onSetStatus(student.id, 'absent')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              isAbsent
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-red-50 hover:text-red-700'
            }`}
          >
            ગેરહાજર
          </button>
          <button
            type="button"
            onClick={() => onSetStatus(student.id, 'leave')}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              isLeave
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-amber-50 hover:text-amber-700'
            }`}
          >
            રજા
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group relative rounded-2xl border transition-all duration-200 bg-white flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
        isPresent
          ? 'border-emerald-300 ring-1 ring-emerald-400/40 bg-gradient-to-b from-emerald-50/40 to-white'
          : isAbsent
          ? 'border-red-300 ring-1 ring-red-400/40 bg-gradient-to-b from-red-50/40 to-white'
          : 'border-amber-300 ring-1 ring-amber-400/40 bg-gradient-to-b from-amber-50/40 to-white'
      }`}
    >
      {/* Top Header: Roll No & Edit Button */}
      <div className="flex items-center justify-between px-3.5 pt-3 pb-1">
        <div className="flex items-center gap-1.5">
          <span
            className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
              isPresent
                ? 'bg-emerald-100 text-emerald-800'
                : isAbsent
                ? 'bg-red-100 text-red-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            રોલ નં. {rollFormatted}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            GR: {student.grNo}
          </span>
        </div>

        <div className="flex items-center gap-0.5">
          {onViewIdCard && (
            <button
              type="button"
              onClick={() => onViewIdCard(student.id)}
              title="આઈ-કાર્ડ જુઓ / પ્રિન્ટ"
              className="text-slate-400 hover:text-emerald-700 p-1 rounded-md hover:bg-emerald-50 transition-colors"
            >
              <CreditCard className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onEditStudent(student)}
            title="વિદ્યાર્થી માહિતી / ફોટો બદલો"
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* CORE FEATURE: CLICKABLE PHOTO FOR ONE-TAP ATTENDANCE */}
      <div className="px-4 py-2 flex flex-col items-center">
        <button
          type="button"
          onClick={handlePhotoClick}
          className="relative focus:outline-none focus:ring-4 focus:ring-emerald-400/50 rounded-2xl cursor-pointer select-none transition-transform active:scale-95 group/photo"
          aria-label={`રોલ નંબર ${student.rollNo} ${student.name} ની હાજરી બદલો`}
        >
          <div className="relative overflow-hidden rounded-2xl w-28 h-28 sm:w-32 sm:h-32 shadow-sm border-2">
            <img
              src={student.photoUrl}
              alt={student.name}
              className={`w-full h-full object-cover transition-all duration-300 group-hover/photo:scale-105 ${
                isPresent
                  ? 'brightness-100 contrast-105'
                  : isAbsent
                  ? 'brightness-75 grayscale-40'
                  : 'brightness-90'
              }`}
              onError={(e) => {
                // High-quality fallback avatar with student initials
                const target = e.target as HTMLImageElement;
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  student.nameEn
                )}&background=047857&color=fff&size=256`;
              }}
            />

            {/* Click-to-toggle overlay hint on hover */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-medium backdrop-blur-[1px]">
              <span>ક્લિક કરી બદલો</span>
            </div>

            {/* Prominent Status Badge on Top of Photo */}
            <div className="absolute top-2 right-2 drop-shadow-md">
              {isPresent && (
                <div className="bg-emerald-600 text-white rounded-full p-1 flex items-center justify-center animate-in zoom-in-50 duration-200">
                  <CheckCircle2 className="w-5 h-5 fill-emerald-600 text-white" />
                </div>
              )}
              {isAbsent && (
                <div className="bg-red-600 text-white rounded-full p-1 flex items-center justify-center animate-in zoom-in-50 duration-200">
                  <XCircle className="w-5 h-5 fill-red-600 text-white" />
                </div>
              )}
              {isLeave && (
                <div className="bg-amber-500 text-white rounded-full p-1 flex items-center justify-center animate-in zoom-in-50 duration-200">
                  <Clock className="w-5 h-5 fill-amber-500 text-white" />
                </div>
              )}
            </div>

            {/* Quick click hint icon */}
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-xs flex items-center gap-1 opacity-90">
              <Sparkles className="w-2.5 h-2.5 text-yellow-300" />
              <span>ફોટો ટેપ કરો</span>
            </div>
          </div>
        </button>

        {/* Student Name & Meta */}
        <div className="mt-2.5 text-center w-full">
          <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-1">
            {student.name}
          </h3>
          <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
            {student.nameEn}
          </p>
          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 mt-1">
            <span>{student.gender === 'boy' ? 'કુમાર' : 'કન્યા'}</span>
            <span>•</span>
            <span
              className={`font-semibold ${
                isPresent
                  ? 'text-emerald-700'
                  : isAbsent
                  ? 'text-red-700'
                  : 'text-amber-700'
              }`}
            >
              {isPresent ? 'હાજર' : isAbsent ? 'ગેરહાજર' : 'રજા'}
            </span>
          </div>

          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
            {student.dob && <span>જન્મ: {student.dob.split('-').reverse().join('/')}</span>}
            {student.parentPhone && (
              <>
                <span>•</span>
                <span>મો: {student.parentPhone}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action Section */}
      <div className="px-3 pb-3 pt-1 border-t border-slate-100 bg-slate-50/50">
        {/* Tri-state buttons */}
        <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-xl border border-slate-200/80 shadow-2xs">
          <button
            type="button"
            onClick={() => onSetStatus(student.id, 'present')}
            className={`py-1 text-xs font-semibold rounded-lg transition-all ${
              isPresent
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
            }`}
          >
            હાજર
          </button>
          <button
            type="button"
            onClick={() => onSetStatus(student.id, 'absent')}
            className={`py-1 text-xs font-semibold rounded-lg transition-all ${
              isAbsent
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-red-50 hover:text-red-700'
            }`}
          >
            ગેરહાજર
          </button>
          <button
            type="button"
            onClick={() => onSetStatus(student.id, 'leave')}
            className={`py-1 text-xs font-semibold rounded-lg transition-all ${
              isLeave
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-amber-50 hover:text-amber-700'
            }`}
          >
            રજા
          </button>
        </div>

        {/* If absent, provide one-click contact option to parent */}
        {isAbsent && student.parentPhone && (
          <div className="mt-2 flex items-center justify-between gap-1 text-[11px] bg-red-50 text-red-700 border border-red-200/80 px-2 py-1 rounded-lg animate-in fade-in duration-200">
            <span className="truncate">વાલી: {student.parentPhone}</span>
            <div className="flex items-center gap-1 shrink-0">
              <a
                href={`tel:${student.parentPhone}`}
                title="વાલીને ફોન કરો"
                className="p-1 bg-white rounded text-slate-700 hover:text-emerald-600 border border-slate-200 shadow-2xs"
              >
                <Phone className="w-3 h-3" />
              </a>
              <a
                href={`https://wa.me/91${student.parentPhone}?text=${encodeURIComponent(
                  `નમસ્તે, ${schoolName} તરફથી જણાવવાનું કે આજે આપનો પુત્ર/પુત્રી ${student.name} (${standard || student.standard || 'ધોરણ ૬'}) શાળામાં ગેરહાજર છે. અચૂક સંપર્ક કરવા વિનંતી.`
                )}`}
                target="_blank"
                rel="noreferrer"
                title="વાલીને વોટ્સએપ મેસેજ"
                className="p-1 bg-white rounded text-slate-700 hover:text-green-600 border border-slate-200 shadow-2xs"
              >
                <MessageCircle className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
