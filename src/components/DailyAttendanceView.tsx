import React, { useState, useMemo } from 'react';
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Percent,
  Search,
  CheckCheck,
  RotateCcw,
  LayoutGrid,
  List,
  Sparkles,
  Share2,
  AlertCircle,
  Trash2,
  Lock,
  FileText,
  Download,
  Printer,
} from 'lucide-react';
import { Student, AttendanceStatus, SchoolConfig, AttendanceRecord } from '../types';
import { DEFAULT_TEACHERS, DEFAULT_SCHOOL_CONFIG } from '../data/defaultStudents';
import { StudentCard } from './StudentCard';
import { StandardSwitcherBar } from './StandardSwitcherBar';
import { DailyAttendanceExportModal } from './DailyAttendanceExportModal';
import { downloadDailyAttendanceCSV } from '../utils/exportAttendance';

interface DailyAttendanceViewProps {
  students: Student[];
  currentRecords: Record<string, AttendanceStatus>;
  config?: SchoolConfig;
  onToggleStatus: (studentId: string) => void;
  onSetStatus: (studentId: string, status: AttendanceStatus) => void;
  onMarkAll: (status: AttendanceStatus) => void;
  onClearAttendance?: () => void;
  onEditStudent: (student: Student) => void;
  onViewIdCard?: (studentId: string) => void;
  onOpenWhatsAppShare: () => void;
  currentDateFormatted: string;
  isLocked?: boolean;
  onSelectStandard?: (standard: string) => void;
  onOpenTeachersModal?: () => void;
  onOpenClassSelectorModal?: () => void;
  allStudents?: Student[];
  allRecords?: Record<string, AttendanceRecord>;
  currentDate?: string;
}

type FilterType = 'all' | 'absent' | 'present' | 'leave' | 'boy' | 'girl';
type ViewMode = 'grid' | 'compact' | 'list';

export const DailyAttendanceView: React.FC<DailyAttendanceViewProps> = ({
  students,
  currentRecords,
  config,
  onToggleStatus,
  onSetStatus,
  onMarkAll,
  onClearAttendance,
  onEditStudent,
  onViewIdCard,
  onOpenWhatsAppShare,
  currentDateFormatted,
  isLocked,
  onSelectStandard,
  onOpenTeachersModal,
  onOpenClassSelectorModal,
  allStudents,
  allRecords,
  currentDate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Calculate statistics
  const stats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let leave = 0;
    let boyPresent = 0;
    let girlPresent = 0;
    const absentRolls: number[] = [];

    students.forEach((s) => {
      const status = currentRecords[s.id] || 'present';
      if (status === 'present') {
        present++;
        if (s.gender === 'boy') boyPresent++;
        else girlPresent++;
      } else if (status === 'absent') {
        absent++;
        absentRolls.push(s.rollNo);
      } else if (status === 'leave') {
        leave++;
      }
    });

    const total = students.length;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : '0';

    return {
      total,
      present,
      absent,
      leave,
      boyPresent,
      girlPresent,
      percentage,
      absentRolls,
    };
  }, [students, currentRecords]);

  // Filter and search students
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        const status = currentRecords[s.id] || 'present';

        // Filter type
        if (filter === 'absent' && status !== 'absent') return false;
        if (filter === 'present' && status !== 'present') return false;
        if (filter === 'leave' && status !== 'leave') return false;
        if (filter === 'boy' && s.gender !== 'boy') return false;
        if (filter === 'girl' && s.gender !== 'girl') return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = s.name.toLowerCase().includes(q);
          const matchEn = s.nameEn.toLowerCase().includes(q);
          const matchRoll = String(s.rollNo) === q;
          const matchGr = s.grNo.includes(q);
          return matchName || matchEn || matchRoll || matchGr;
        }

        return true;
      })
      .sort((a, b) => a.rollNo - b.rollNo);
  }, [students, currentRecords, filter, searchQuery]);

  return (
    <div className="space-y-4">
      {/* 8 Standards Switcher & Active Teacher Bar */}
      {config && onSelectStandard && onOpenTeachersModal && allStudents && allRecords && currentDate && (
        <StandardSwitcherBar
          config={config}
          onSelectStandard={onSelectStandard}
          onOpenTeachersModal={onOpenTeachersModal}
          onOpenClassSelectorModal={onOpenClassSelectorModal}
          students={allStudents}
          allRecords={allRecords}
          currentDate={currentDate}
        />
      )}

      {/* Visual Instruction Banner */}
      <div className="bg-emerald-900/90 text-white rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border border-emerald-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <div className="text-xs font-semibold text-emerald-200 tracking-wider">
              ઝડપી ફોટો હાજરી પદ્ધતિ (Click Photo Attendance)
            </div>
            <div className="text-sm font-medium text-white">
              વિધાર્થીના <span className="underline decoration-emerald-400 decoration-2 font-bold">ફોટો પર ક્લિક કરો</span> એટલે સીધી જ હાજરી / ગેરહાજરી પુરાઈ જશે.
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white font-bold rounded-xl text-xs border border-white/20 shadow-xs transition-all active:scale-95 cursor-pointer w-full sm:w-auto"
            title="દૈનિક હાજરી પત્રક PDF અથવા CSV ફાઇલ તરીકે એક્સપોર્ટ કરો"
          >
            <FileText className="w-4 h-4 text-amber-300" />
            <span>પત્રક એક્સપોર્ટ (PDF / CSV)</span>
          </button>

          <button
            onClick={onOpenWhatsAppShare}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all active:scale-95 cursor-pointer w-full sm:w-auto"
          >
            <Share2 className="w-4 h-4" />
            <span>વોટ્સએપ રીપોર્ટ મોકલો</span>
          </button>
        </div>
      </div>

      {/* If App is Locked, show tamper-protection warning banner */}
      {isLocked && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 text-amber-950 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <span>પાસવર્ડ સુરક્ષા સક્રિય છે (છેડછાડ મુક્ત મોડ)</span>
                <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-mono">
                  સુરક્ષિત
                </span>
              </div>
              <div className="text-[11px] text-amber-800">
                બાળકો કે અનધિકૃત વ્યક્તિ હાજરી બદલી ન શકે તે માટે લોક છે. હાજરી પૂરવા માટે ઉપર 'અનલોક' બટન દબાવો.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3">
        {/* Total Students */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">કુલ વિદ્યાર્થી</div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {stats.total}
            </div>
          </div>
        </div>

        {/* Present */}
        <div
          onClick={() => setFilter('present')}
          className={`p-3 sm:p-4 rounded-2xl border shadow-2xs flex items-center gap-3 cursor-pointer transition-all ${
            filter === 'present'
              ? 'bg-emerald-100/70 border-emerald-500 ring-2 ring-emerald-500/20'
              : 'bg-emerald-50/60 border-emerald-200 hover:bg-emerald-100/50'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-emerald-800 font-medium">હાજર સંખ્યા</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-900 leading-tight">
              {stats.present}
            </div>
          </div>
        </div>

        {/* Absent */}
        <div
          onClick={() => setFilter('absent')}
          className={`p-3 sm:p-4 rounded-2xl border shadow-2xs flex items-center gap-3 cursor-pointer transition-all ${
            filter === 'absent'
              ? 'bg-red-100/70 border-red-500 ring-2 ring-red-500/20'
              : 'bg-red-50/60 border-red-200 hover:bg-red-100/50'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-red-800 font-medium">ગેરહાજર</div>
            <div className="text-xl sm:text-2xl font-black text-red-900 leading-tight">
              {stats.absent}
            </div>
          </div>
        </div>

        {/* Leave */}
        <div
          onClick={() => setFilter('leave')}
          className={`p-3 sm:p-4 rounded-2xl border shadow-2xs flex items-center gap-3 cursor-pointer transition-all ${
            filter === 'leave'
              ? 'bg-amber-100/70 border-amber-500 ring-2 ring-amber-500/20'
              : 'bg-amber-50/60 border-amber-200 hover:bg-amber-100/50'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-amber-800 font-medium">રજા (Leave)</div>
            <div className="text-xl sm:text-2xl font-black text-amber-900 leading-tight">
              {stats.leave}
            </div>
          </div>
        </div>

        {/* Attendance Percentage */}
        <div className="col-span-2 sm:col-span-1 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <Percent className="w-5 h-5" />
          </div>
          <div className="w-full">
            <div className="text-xs text-slate-500 font-medium">હાજરી ટકાવારી</div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {stats.percentage}%
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* If any students absent, show quick summary banner */}
      {stats.absent > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs text-red-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>
              આજે <strong>{stats.absent}</strong> વિદ્યાર્થી ગેરહાજર છે (રોલ નં:{' '}
              {stats.absentRolls.join(', ')}).
            </span>
          </div>
          <button
            onClick={() => setFilter('absent')}
            className="font-bold underline hover:text-red-950 cursor-pointer"
          >
            માત્ર ગેરહાજર વિદ્યાર્થીઓ જુઓ →
          </button>
        </div>
      )}

      {/* Quick Toolbar: Mark All, Search, Filter */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="વિદ્યાર્થી શોધો (નામ અથવા રોલ નંબર)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-800 placeholder-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Mark All Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onMarkAll('present')}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
              title="વર્ગના તમામ વિદ્યાર્થીઓને હાજર માર્ક કરો"
            >
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              <span>બધા હાજર કરો</span>
            </button>

            <button
              onClick={() => onMarkAll('absent')}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              title="બધાને ગેરહાજર કરો"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>બધા ગેરહાજર</span>
            </button>

            {onClearAttendance && (
              <button
                onClick={onClearAttendance}
                className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                title="આજની હાજરી સંપૂર્ણ ડિલીટ / ક્લિયર કરો"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>હાજરી ડિલીટ</span>
              </button>
            )}

            {/* Quick Export CSV & PDF Buttons */}
            <button
              type="button"
              onClick={() =>
                downloadDailyAttendanceCSV({
                  students,
                  currentRecords,
                  config: config || DEFAULT_SCHOOL_CONFIG,
                  currentDate: currentDate || '',
                  allStudents,
                  teachers: config?.teachers || DEFAULT_TEACHERS,
                  exportAllStandards: false,
                })
              }
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
              title="આજની હાજરી CSV (Excel) માં ડાઉનલોડ કરો"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>CSV ડાઉનલોડ</span>
            </button>

            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs"
              title="દૈનિક હાજરી પત્રક PDF અથવા પ્રિન્ટ કરો"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>PDF / પ્રિન્ટ</span>
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 ml-1">
              <button
                onClick={() => setViewMode('grid')}
                title="મોટા ફોટા (ગ્રીડ વ્યુ)"
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-emerald-800 shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                title="યાદી (લિસ્ટ વ્યુ)"
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-emerald-800 shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 text-xs">
          <span className="text-slate-400 text-[11px] font-medium mr-1 shrink-0">ફિલ્ટર:</span>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg font-medium transition-all shrink-0 ${
              filter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            બધા ({students.length})
          </button>
          <button
            onClick={() => setFilter('present')}
            className={`px-3 py-1 rounded-lg font-medium transition-all shrink-0 ${
              filter === 'present'
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            હાજર ({stats.present})
          </button>
          <button
            onClick={() => setFilter('absent')}
            className={`px-3 py-1 rounded-lg font-medium transition-all shrink-0 ${
              filter === 'absent'
                ? 'bg-red-700 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ગેરહાજર ({stats.absent})
          </button>
          <button
            onClick={() => setFilter('boy')}
            className={`px-3 py-1 rounded-lg font-medium transition-all shrink-0 ${
              filter === 'boy'
                ? 'bg-blue-700 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            કુમાર ({students.filter((s) => s.gender === 'boy').length})
          </button>
          <button
            onClick={() => setFilter('girl')}
            className={`px-3 py-1 rounded-lg font-medium transition-all shrink-0 ${
              filter === 'girl'
                ? 'bg-purple-700 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            કન્યા ({students.filter((s) => s.gender === 'girl').length})
          </button>
        </div>
      </div>

      {/* Student Cards Grid */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <p className="text-slate-500 text-sm">કોઈ વિદ્યાર્થી મળ્યો નથી.</p>
          <button
            onClick={() => {
              setFilter('all');
              setSearchQuery('');
            }}
            className="mt-3 text-xs font-semibold text-emerald-700 hover:underline"
          >
            બધા વિદ્યાર્થીઓ ફરી બતાવો
          </button>
        </div>
      ) : (
        <div
          className={
            viewMode === 'list'
              ? 'space-y-2'
              : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3'
          }
        >
          {filteredStudents.map((student) => {
            const status = currentRecords[student.id] || 'present';
            return (
              <StudentCard
                key={student.id}
                student={student}
                status={status}
                onToggleStatus={onToggleStatus}
                onSetStatus={onSetStatus}
                onEditStudent={onEditStudent}
                onViewIdCard={onViewIdCard}
                viewMode={viewMode}
                schoolName={config?.schoolName}
                standard={config?.standard}
              />
            );
          })}
        </div>
      )}

      {/* Auto-saved footer info */}
      <div className="text-center py-2 text-xs text-slate-400">
        તારીખ: {currentDateFormatted} • હાજરી આપમેળે સેવ થાય છે (Auto-saved)
      </div>

      {/* Daily Attendance Export Modal (PDF / CSV) */}
      <DailyAttendanceExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        config={config || DEFAULT_SCHOOL_CONFIG}
        students={students}
        currentRecords={currentRecords}
        currentDate={currentDate || ''}
        allStudents={allStudents}
        teachers={config?.teachers || DEFAULT_TEACHERS}
      />
    </div>
  );
};
