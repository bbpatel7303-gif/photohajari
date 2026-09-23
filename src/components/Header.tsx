import React from 'react';
import {
  Calendar,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  School,
  UserCheck,
  CalendarDays,
  Users,
  Share2,
  Settings as SettingsIcon,
  CreditCard,
  Sparkles,
  GraduationCap,
  Lock,
  Unlock,
  Phone,
  Mail,
} from 'lucide-react';
import { SchoolConfig, ViewTab } from '../types';
import { formatGujaratiDate, getTodayDateString } from '../utils/storage';

interface HeaderProps {
  config: SchoolConfig;
  currentDate: string;
  onDateChange: (date: string) => void;
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenSettings: () => void;
  isLocked: boolean;
  onToggleLock: () => void;
  onOpenClassSelector: () => void;
  onOpenTeachersModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  currentDate,
  onDateChange,
  activeTab,
  onTabChange,
  soundEnabled,
  onToggleSound,
  onOpenSettings,
  isLocked,
  onToggleLock,
  onOpenClassSelector,
  onOpenTeachersModal,
}) => {
  const isToday = currentDate === getTodayDateString();

  const handlePrevDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    onDateChange(`${y}-${m}-${day}`);
  };

  const handleNextDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    onDateChange(`${y}-${m}-${day}`);
  };

  const handleSetToday = () => {
    onDateChange(getTodayDateString());
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Gujarat School Identification Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white px-4 py-2.5 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0 text-emerald-300">
              <School className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-emerald-200">
                <span className="bg-white/15 px-2 py-0.5 rounded text-[10px] text-amber-200 font-medium">
                  {config.payCenterSchool || 'પે સેન્ટર શાળા ઢીંકવા'}
                </span>
                <span>•</span>
                <span>તા. {config.taluka}, જિ. {config.district}</span>
              </div>
              <h1 className="text-base sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                <span>{config.schoolName}</span>
                <button
                  type="button"
                  onClick={onOpenClassSelector}
                  title="ધોરણ / વર્ગ બદલો (Change Standard)"
                  className="text-xs bg-emerald-500/40 hover:bg-emerald-400/50 text-emerald-100 px-2.5 py-0.5 rounded-lg font-mono border border-emerald-400/40 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                >
                  <GraduationCap className="w-3 h-3 text-amber-300" />
                  <span>{config.standard} ({config.division})</span>
                  <span className="text-[10px] text-amber-300 ml-0.5">▼ બદલો</span>
                </button>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 backdrop-blur-xs">
            {/* Class Teacher Photo & Name */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-amber-300 bg-slate-800 shrink-0">
                <img
                  src={
                    config.teacherPhotoUrl ||
                    'https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=400&auto=format&fit=crop&q=80'
                  }
                  alt={config.teacherName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left leading-tight">
                <div className="text-[11px] font-bold text-white flex items-center gap-1">
                  <span>{config.teacherName}</span>
                </div>
                <div className="text-[10px] text-amber-300 font-mono flex items-center gap-2">
                  <span>કોડ: {config.teacherCode}</span>
                  {config.teacherPhone && (
                    <a
                      href={`tel:${config.teacherPhone}`}
                      className="text-white hover:text-emerald-200 hover:underline flex items-center gap-0.5"
                      title="શિક્ષક મોબાઈલ પર કોલ કરો"
                    >
                      <Phone className="w-2.5 h-2.5 text-emerald-300" />
                      <span>{config.teacherPhone}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {onOpenTeachersModal && (
              <button
                type="button"
                onClick={onOpenTeachersModal}
                className="hidden lg:flex items-center gap-1 px-2.5 py-1 bg-white/15 hover:bg-white/25 text-amber-300 hover:text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer border border-white/20 shadow-2xs"
                title="શાળાના તમામ ૮ શિક્ષકો"
              >
                <Users className="w-3.5 h-3.5" />
                <span>૮ શિક્ષકો</span>
              </button>
            )}

            <span className="text-white/25 hidden sm:inline">|</span>

            <div className="hidden sm:block text-right leading-tight">
              <div className="text-[10px] text-emerald-200/90 font-medium">શાળા DISE કોડ</div>
              <div className="font-mono font-bold text-xs text-white">{config.schoolCode}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Control Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Date Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            <button
              onClick={handlePrevDay}
              title="અગાઉનો દિવસ"
              className="p-1.5 rounded-md hover:bg-white text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="relative flex items-center px-2 py-1 gap-2">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <input
                type="date"
                value={currentDate}
                onChange={(e) => e.target.value && onDateChange(e.target.value)}
                className="text-xs font-semibold text-slate-800 bg-transparent border-0 focus:outline-none cursor-pointer"
              />
            </div>
            <button
              onClick={handleNextDay}
              title="આગામી દિવસ"
              className="p-1.5 rounded-md hover:bg-white text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {!isToday && (
            <button
              onClick={handleSetToday}
              className="text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              આજની તારીખ
            </button>
          )}

          <span className="hidden md:inline-block text-xs font-medium text-slate-600 ml-1">
            {formatGujaratiDate(currentDate)}
          </span>
        </div>

        {/* Navigation Tabs and Quick Tools */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => onTabChange('attendance')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'attendance'
                  ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>દૈનિક હાજરી</span>
            </button>
            <button
              onClick={() => onTabChange('activities')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'activities'
                  ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>વર્ગ પ્રવૃત્તિઓ</span>
            </button>
            <button
              onClick={() => onTabChange('results')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'results'
                  ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>પરિણામ પત્રક</span>
            </button>
            <button
              onClick={() => onTabChange('monthly')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'monthly'
                  ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>માસિક પત્રક</span>
            </button>
            <button
              onClick={() => onTabChange('idcards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'idcards'
                  ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>આઈ-કાર્ડ (ID Card)</span>
            </button>
            <button
              onClick={() => onTabChange('share')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'share'
                  ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>વોટ્સએપ રીપોર્ટ</span>
            </button>
            <button
              onClick={() => onTabChange('students')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'students'
                  ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>વિદ્યાર્થીઓ</span>
            </button>
          </div>

          {/* Sound toggle button */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'અવાજ બંધ કરો' : 'અવાજ ચાલુ કરો'}
            className={`p-2 rounded-lg border transition-colors ${
              soundEnabled
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Security Lock / Unlock button */}
          <button
            onClick={onToggleLock}
            title={
              isLocked
                ? 'એપ લોક છે - અનલોક કરવા પાસવર્ડ દાખલ કરો'
                : 'એપ અનલોક છે - લોક કરવા માટે ક્લિક કરો'
            }
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs ${
              isLocked
                ? 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100 ring-1 ring-rose-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
            }`}
          >
            {isLocked ? (
              <>
                <Lock className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                <span className="hidden sm:inline">લોક (સુરક્ષિત)</span>
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">અનલોક</span>
              </>
            )}
          </button>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            title="સેટિંગ્સ અને શાળા માહિતી"
            className="p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
