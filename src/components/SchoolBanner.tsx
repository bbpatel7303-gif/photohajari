import React, { useState } from 'react';
import {
  School,
  Camera,
  Upload,
  MapPin,
  CheckCircle,
  Users,
  Award,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
} from 'lucide-react';
import { SchoolConfig } from '../types';

interface SchoolBannerProps {
  config: SchoolConfig;
  onUpdateSchoolPhoto: (photoUrl: string) => void;
  onUpdateTeacherPhoto?: (photoUrl: string) => void;
  onOpenClassSelector?: () => void;
  onOpenTeachersModal?: () => void;
  totalStudents: number;
  todayPercentage: string;
  activitiesCount: number;
}

export const SchoolBanner: React.FC<SchoolBannerProps> = ({
  config,
  onUpdateSchoolPhoto,
  onUpdateTeacherPhoto,
  onOpenClassSelector,
  onOpenTeachersModal,
  totalStudents,
  todayPercentage,
  activitiesCount,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [teacherUploadSuccess, setTeacherUploadSuccess] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onUpdateSchoolPhoto(reader.result);
          setUploadSuccess(true);
          setTimeout(() => setUploadSuccess(false), 2500);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTeacherFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpdateTeacherPhoto) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onUpdateTeacherPhoto(reader.result);
          setTeacherUploadSuccess(true);
          setTimeout(() => setTeacherUploadSuccess(false), 2500);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const photoUrl =
    config.schoolPhotoUrl ||
    'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&auto=format&fit=crop&q=80';

  return (
    <div className="relative rounded-3xl overflow-hidden border border-slate-200/80 shadow-md bg-slate-900 text-white mb-5 transition-all">
      {/* Background School Campus Image */}
      <div className="relative w-full h-44 sm:h-56 md:h-64 overflow-hidden">
        <img
          src={photoUrl}
          alt={config.schoolName}
          className="w-full h-full object-cover object-center filter brightness-[0.75] contrast-[1.05] transition-transform duration-700 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/50 to-black/30" />

        {/* Change School Photo Button */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
          {uploadSuccess && (
            <span className="bg-emerald-600 text-white text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 animate-in fade-in">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>ફોટો સેવ થયો!</span>
            </span>
          )}
          <label
            htmlFor="school-photo-upload"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/30 rounded-xl text-xs font-semibold cursor-pointer shadow-lg transition-all active:scale-95"
            title="શાળાનો નવો ફોટો અપલોડ કરો"
          >
            <Camera className="w-3.5 h-3.5 text-emerald-300" />
            <span>શાળાનો ફોટો બદલો</span>
            <input
              id="school-photo-upload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="p-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/30 rounded-xl text-xs transition-colors"
            title={isCollapsed ? 'વિસ્તૃત કરો' : 'સંકોચો'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {/* Overlay Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-emerald-300">
              <span className="bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1 text-[11px]">
                <School className="w-3 h-3 text-emerald-300" />
                <span>શિક્ષણ વિભાગ, ગુજરાત સરકાર</span>
              </span>
              <span>•</span>
              <span className="bg-amber-400/20 text-amber-200 border border-amber-400/40 px-2.5 py-0.5 rounded-full text-[11px] font-medium shadow-2xs">
                {config.payCenterSchool || 'પે સેન્ટર શાળા ઢીંકવા'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-300 text-[11px]">
                <MapPin className="w-3 h-3 text-red-400" />
                <span>તા. {config.taluka}, જિ. {config.district}</span>
              </span>
            </div>

            {/* મોટા અક્ષરે શાળા વાંઝિયાઆંબા */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight drop-shadow-md">
              {config.schoolName}
            </h1>

            {!isCollapsed && (
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {/* Teacher Profile with Photo */}
                <div className="flex items-center gap-2.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
                  <div className="relative group">
                    <img
                      src={
                        config.teacherPhotoUrl ||
                        'https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=400&auto=format&fit=crop&q=80'
                      }
                      alt={config.teacherName}
                      className="w-10 h-10 rounded-full object-cover border-2 border-amber-400 shadow-md"
                    />
                    {onUpdateTeacherPhoto && (
                      <label
                        htmlFor="teacher-photo-upload"
                        className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="શિક્ષકનો ફોટો બદલો"
                      >
                        <Camera className="w-4 h-4 text-white" />
                        <input
                          id="teacher-photo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleTeacherFileUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5 flex-wrap">
                      <span>{config.teacherName}</span>
                      {teacherUploadSuccess && (
                        <span className="text-[10px] text-emerald-400 font-normal">
                          ✓ સેવ થયો
                        </span>
                      )}
                      {config.teacherPhone && (
                        <a
                          href={`tel:${config.teacherPhone}`}
                          className="text-[11px] font-mono text-emerald-300 hover:text-white flex items-center gap-1 bg-white/10 px-1.5 py-0.2 rounded"
                          title="શિક્ષક મોબાઈલ"
                        >
                          <Phone className="w-2.5 h-2.5 text-emerald-400" />
                          <span>{config.teacherPhone}</span>
                        </a>
                      )}
                      {config.teacherEmail && (
                        <a
                          href={`mailto:${config.teacherEmail}`}
                          className="text-[10px] font-mono text-teal-200 hover:text-white flex items-center gap-0.5 hidden md:flex"
                          title="શિક્ષક ઈમેલ"
                        >
                          <Mail className="w-2.5 h-2.5" />
                          <span>{config.teacherEmail}</span>
                        </a>
                      )}
                    </div>
                    <div className="text-[10px] text-amber-300 font-mono flex items-center gap-1.5 flex-wrap mt-0.5">
                      <span>શિક્ષક કોડ: <strong>{config.teacherCode}</strong></span>
                      <span>•</span>
                      {onOpenClassSelector ? (
                        <button
                          type="button"
                          onClick={onOpenClassSelector}
                          className="bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-400/40 px-1.5 py-0.5 rounded cursor-pointer transition-colors font-bold"
                          title="ધોરણ બદલો (Change Standard)"
                        >
                          <span>{config.standard} ({config.division}) ✎ બદલો</span>
                        </button>
                      ) : (
                        <span>{config.standard} ({config.division})</span>
                      )}

                      {onOpenTeachersModal && (
                        <button
                          type="button"
                          onClick={onOpenTeachersModal}
                          className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 px-1.5 py-0.5 rounded cursor-pointer transition-colors font-bold flex items-center gap-1"
                          title="શાળાના ૮ શિક્ષકો"
                        >
                          <Users className="w-2.5 h-2.5 text-emerald-300" />
                          <span>૮ શિક્ષકો</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-300 font-mono hidden sm:block">
                  DISE: <span className="font-bold text-emerald-300">{config.schoolCode}</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Metrics Bar on Banner */}
          {!isCollapsed && (
            <div className="flex items-center gap-2 sm:gap-3 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/15 text-center shrink-0">
              <div className="px-3 py-1">
                <div className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">
                  વિદ્યાર્થીઓ
                </div>
                <div className="text-base sm:text-lg font-black text-white font-mono">
                  {totalStudents}
                </div>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="px-3 py-1">
                <div className="text-[10px] text-emerald-300 uppercase tracking-wider font-semibold">
                  હાજરી %
                </div>
                <div className="text-base sm:text-lg font-black text-emerald-400 font-mono">
                  {todayPercentage}%
                </div>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="px-3 py-1">
                <div className="text-[10px] text-amber-300 uppercase tracking-wider font-semibold">
                  પ્રવૃત્તિઓ
                </div>
                <div className="text-base sm:text-lg font-black text-amber-400 font-mono">
                  {activitiesCount}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
