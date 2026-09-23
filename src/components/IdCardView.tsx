import React, { useState, useMemo } from 'react';
import {
  Printer,
  Download,
  Filter,
  Search,
  School,
  QrCode,
  Rotate3d,
  Layers,
  Sparkles,
  Phone,
  MapPin,
  Heart,
  Calendar,
  User,
  ShieldCheck,
} from 'lucide-react';
import { Student, SchoolConfig } from '../types';

interface IdCardViewProps {
  students: Student[];
  config: SchoolConfig;
}

type CardTheme = 'emerald' | 'blue' | 'maroon';

export const IdCardView: React.FC<IdCardViewProps> = ({ students, config }) => {
  const [theme, setTheme] = useState<CardTheme>('emerald');
  const [showBackSide, setShowBackSide] = useState<boolean>(false);
  const [genderFilter, setGenderFilter] = useState<'all' | 'boy' | 'girl'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('all');

  // Themes styling map
  const themeStyles = {
    emerald: {
      headerBg: 'bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900',
      headerText: 'text-emerald-100',
      border: 'border-emerald-700',
      accentBadge: 'bg-emerald-700 text-white',
      accentText: 'text-emerald-800',
      accentBgLight: 'bg-emerald-50',
      ringColor: 'ring-emerald-500',
      ribbonBg: 'bg-emerald-600',
    },
    blue: {
      headerBg: 'bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900',
      headerText: 'text-blue-200',
      border: 'border-blue-700',
      accentBadge: 'bg-blue-800 text-white',
      accentText: 'text-blue-900',
      accentBgLight: 'bg-blue-50',
      ringColor: 'ring-blue-500',
      ribbonBg: 'bg-blue-700',
    },
    maroon: {
      headerBg: 'bg-gradient-to-r from-red-950 via-rose-900 to-amber-950',
      headerText: 'text-rose-200',
      border: 'border-rose-800',
      accentBadge: 'bg-rose-900 text-white',
      accentText: 'text-rose-950',
      accentBgLight: 'bg-rose-50',
      ringColor: 'ring-rose-500',
      ribbonBg: 'bg-rose-800',
    },
  }[theme];

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        if (selectedStudentId !== 'all' && s.id !== selectedStudentId) return false;
        if (genderFilter !== 'all' && s.gender !== genderFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          return (
            s.name.toLowerCase().includes(q) ||
            s.nameEn.toLowerCase().includes(q) ||
            String(s.rollNo) === q ||
            s.grNo.includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => a.rollNo - b.rollNo);
  }, [students, selectedStudentId, genderFilter, searchQuery]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Toolbar (Hidden in print) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3 print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <span>વિદ્યાર્થી સ્માર્ટ આઈ-કાર્ડ (Student Identity Cards)</span>
            </h2>
            <p className="text-xs text-slate-500">
              {config.schoolName} • ધોરણ ૬ • પ્રિન્ટ અને લેમિનેશન માટે તૈયાર કાર્ડ
            </p>
          </div>

          {/* Print & Flip Action */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowBackSide((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-300 transition-colors cursor-pointer"
            >
              <Rotate3d className="w-4 h-4 text-slate-600" />
              <span>{showBackSide ? 'આગળની બાજુ (Front)' : 'પાછળની બાજુ (Back)'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>તમામ આઈ-કાર્ડ પ્રિન્ટ કરો (A4)</span>
            </button>
          </div>
        </div>

        {/* Filters and Customization */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* Theme Color Picker */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">થીમ કલર:</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setTheme('emerald')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-medium ${
                  theme === 'emerald'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-400 font-bold ring-1 ring-emerald-400'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                <span>સરકારી ગ્રીન</span>
              </button>
              <button
                onClick={() => setTheme('blue')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-medium ${
                  theme === 'blue'
                    ? 'bg-blue-50 text-blue-800 border-blue-400 font-bold ring-1 ring-blue-400'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-blue-700 inline-block" />
                <span>રોયલ બ્લુ</span>
              </button>
              <button
                onClick={() => setTheme('maroon')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-medium ${
                  theme === 'maroon'
                    ? 'bg-rose-50 text-rose-900 border-rose-400 font-bold ring-1 ring-rose-400'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-rose-900 inline-block" />
                <span>મરૂન</span>
              </button>
            </div>
          </div>

          {/* Student Selector */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="નામ કે રોલ નં..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 w-36 sm:w-44"
              />
            </div>

            {/* Gender filter */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setGenderFilter('all')}
                className={`px-2 py-1 rounded-md transition-colors ${
                  genderFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                બધા ({students.length})
              </button>
              <button
                onClick={() => setGenderFilter('boy')}
                className={`px-2 py-1 rounded-md transition-colors ${
                  genderFilter === 'boy'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                કુમાર
              </button>
              <button
                onClick={() => setGenderFilter('girl')}
                className={`px-2 py-1 rounded-md transition-colors ${
                  genderFilter === 'girl'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                કન્યા
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ID Cards Display Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 justify-items-center print:grid-cols-2 print:gap-4 print:p-0">
        {filteredStudents.map((student) => {
          const rollFormatted = String(student.rollNo).padStart(2, '0');
          const dobFormatted = student.dob
            ? student.dob.split('-').reverse().join('/')
            : '૧૫/૦૬/૨૦૧૪';

          return (
            <div
              key={student.id}
              className="w-full max-w-[320px] bg-white rounded-2xl border-2 border-slate-300 shadow-md overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-xl relative print:shadow-none print:border-2 print:border-slate-800 print:break-inside-avoid print:mb-4"
              style={{ minHeight: '440px' }}
            >
              {/* Lanyard Hole Clip Indicator (Top Center) */}
              <div className="w-12 h-2.5 bg-slate-200 border border-slate-300 rounded-full mx-auto -mt-1 shadow-inner z-10 print:hidden" />

              {!showBackSide ? (
                /* FRONT SIDE OF ID CARD */
                <div className="flex flex-col h-full justify-between">
                  {/* Card Header */}
                  <div className={`${themeStyles.headerBg} text-white p-3 text-center relative`}>
                    <div className="flex items-center justify-center gap-1.5 text-[10px] text-amber-300 font-semibold tracking-wider uppercase">
                      <School className="w-3.5 h-3.5" />
                      <span>શિક્ષણ વિભાગ • ગુજરાત રાજ્ય</span>
                    </div>

                    {config.payCenterSchool && (
                      <div className="text-[9px] text-amber-200 font-medium">
                        {config.payCenterSchool}
                      </div>
                    )}
                    <h3 className="font-black text-sm leading-tight text-white mt-0.5">
                      {config.schoolName}
                    </h3>

                    <div className="text-[10px] text-emerald-100 opacity-90">
                      તા. {config.taluka}, જિ. {config.district} • DISE: {config.schoolCode}
                    </div>

                    {/* Badge Sub-header */}
                    <div className="mt-1.5 inline-block bg-white text-slate-900 px-3 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase shadow-xs">
                      વિદ્યાર્થી ઓળખપત્ર (ID CARD) • {config.academicYear || '૨૦૨૬-૨૭'}
                    </div>
                  </div>

                  {/* Student Photo & Roll No */}
                  <div className="px-4 pt-3 flex flex-col items-center">
                    <div className="relative">
                      <div className="w-24 h-24 sm:w-26 sm:h-26 rounded-2xl overflow-hidden border-3 border-amber-400 shadow-md bg-slate-100">
                        <img
                          src={student.photoUrl}
                          alt={student.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              student.nameEn
                            )}&background=047857&color=fff&size=256`;
                          }}
                        />
                      </div>
                      {/* Roll No badge on photo corner */}
                      <div
                        className={`absolute -bottom-2 -right-2 ${themeStyles.accentBadge} font-mono font-black text-xs px-2 py-0.5 rounded-md shadow-md border border-white`}
                      >
                        રોલ: #{rollFormatted}
                      </div>
                    </div>

                    {/* Student Name */}
                    <div className="text-center mt-2.5 w-full">
                      <h4 className="font-bold text-slate-900 text-sm leading-tight">
                        {student.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {student.nameEn}
                      </p>
                    </div>
                  </div>

                  {/* Student Details Grid */}
                  <div className="px-4 py-2 space-y-1 text-xs">
                    <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 space-y-1 text-[11px]">
                      <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
                        <span className="text-slate-500 font-medium">ધોરણ / વર્ગ:</span>
                        <span className="font-bold text-slate-900">
                          {config.standard} ({config.division})
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
                        <span className="text-slate-500 font-medium">જનરલ રજીસ્ટર (GR):</span>
                        <span className="font-mono font-bold text-slate-900">
                          {student.grNo}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
                        <span className="text-slate-500 font-medium">જન્મ તારીખ (DOB):</span>
                        <span className="font-medium text-slate-900">{dobFormatted}</span>
                      </div>

                      <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
                        <span className="text-slate-500 font-medium">આધાર ડાયસ નં:</span>
                        <span className="font-mono font-bold text-slate-900 text-[10px]">
                          {student.aadharDiseNo || '-'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
                        <span className="text-slate-500 font-medium">આધાર કાર્ડ નં:</span>
                        <span className="font-mono font-bold text-slate-900 text-[10px]">
                          {student.aadharNo || '-'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
                        <span className="text-slate-500 font-medium">બેંક એકાઉન્ટ:</span>
                        <span className="font-mono font-bold text-emerald-800 text-[10px]">
                          {student.bankAccountNo || '-'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
                        <span className="text-slate-500 font-medium">બ્લડ ગ્રૂપ:</span>
                        <span className="font-bold text-red-600 bg-red-50 px-1.5 rounded border border-red-200">
                          {student.bloodGroup || 'B+'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-0.5">
                        <span className="text-slate-500 font-medium">મોબાઇલ નં:</span>
                        <span className="font-mono font-bold text-slate-900">
                          {student.parentPhone || '-'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer with Signatures & Barcode */}
                  <div className="px-4 pb-3 pt-1">
                    <div className="flex items-end justify-between border-t border-slate-200 pt-2 text-[10px] text-slate-600">
                      <div className="text-center">
                        <div className="font-mono text-[9px] text-slate-400">
                          {config.teacherCode}
                        </div>
                        <div className="font-bold">વર્ગ શિક્ષક સહી</div>
                      </div>

                      {/* Stylized verification QR / Barcode indicator */}
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-0.5 font-mono text-[8px] text-slate-400 tracking-tighter">
                          ||| | |||| | ||| ||||
                        </div>
                        <span className="text-[8px] text-slate-400 font-mono">
                          {student.grNo}
                        </span>
                      </div>

                      <div className="text-center">
                        <div className="w-12 h-3 border-b border-dashed border-slate-400 mx-auto" />
                        <div className="font-bold">આચાર્યશ્રી સહી</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* BACK SIDE OF ID CARD */
                <div className="flex flex-col h-full justify-between p-4 bg-slate-50 text-slate-800">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="text-center pb-2 border-b border-slate-200">
                      <h4 className="font-bold text-xs text-slate-900">
                        {config.schoolName}
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        તા. {config.taluka}, જિ. {config.district}
                      </p>
                    </div>

                    {/* Address & Emergency Info */}
                    <div className="space-y-2 text-[11px]">
                      <div>
                        <span className="text-slate-500 font-medium block">
                          વાલીનું નામ:
                        </span>
                        <span className="font-bold text-slate-900">
                          {student.parentName || student.name.split(' ').slice(1).join(' ')}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500 font-medium block">
                          રહેઠાણનું સરનામું:
                        </span>
                        <span className="text-slate-800">
                          {student.address || `${config.schoolName || 'પે સેન્ટર શાળા ઢીંકવા'}, તા. ${config.taluka || 'હાલોલ'}`}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500 font-medium block">
                          ઈમરજન્સી સંપર્ક:
                        </span>
                        <span className="font-mono font-bold text-emerald-800">
                          +91 {student.parentPhone}
                        </span>
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-[10px] text-slate-600 space-y-1">
                      <div className="font-bold text-slate-800 text-[11px]">
                        શાળાના નિયમો / સૂચના:
                      </div>
                      <p>૧. શાળા સમય દરમિયાન આ કાર્ડ ગળામાં ધારણ કરવું ફરજિયાત છે.</p>
                      <p>૨. કાર્ડ ખોવાઈ જતાં વર્ગ શિક્ષકનો તુરંત સંપર્ક કરવો.</p>
                    </div>

                    {/* Class Teacher Badge on ID Card Back */}
                    <div className="flex items-center gap-2.5 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                      <img
                        src={
                          config.teacherPhotoUrl ||
                          'https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=400&auto=format&fit=crop&q=80'
                        }
                        alt={config.teacherName}
                        className="w-9 h-9 rounded-full object-cover border-2 border-emerald-600 shrink-0"
                      />
                      <div className="text-[10px] leading-tight">
                        <div className="text-slate-500 font-medium">વર્ગ શિક્ષક:</div>
                        <div className="font-bold text-slate-900">{config.teacherName}</div>
                        <div className="font-mono text-emerald-800 font-semibold">
                          શિક્ષક કોડ: {config.teacherCode}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stamp box */}
                  <div className="pt-2 border-t border-slate-200 text-center">
                    <div className="inline-block border-2 border-dashed border-slate-300 rounded-lg py-1 px-3 text-[10px] text-slate-400 font-medium">
                      આચાર્યશ્રી સહી અને સિક્કો
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredStudents.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-sm">
          આ ફિલ્ટર માટે કોઈ વિદ્યાર્થી નથી મળ્યો.
        </div>
      )}
    </div>
  );
};
