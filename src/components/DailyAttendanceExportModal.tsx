import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Printer,
  X,
  CheckCircle2,
  XCircle,
  Clock,
  School,
  Building2,
  Calendar,
  Layers,
  Check,
  Share2,
} from 'lucide-react';
import { Student, AttendanceStatus, SchoolConfig, Teacher } from '../types';
import { formatGujaratiDate } from '../utils/storage';
import { downloadDailyAttendanceCSV } from '../utils/exportAttendance';

interface DailyAttendanceExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SchoolConfig;
  students: Student[];
  currentRecords: Record<string, AttendanceStatus>;
  currentDate: string;
  allStudents?: Student[];
  teachers?: Teacher[];
}

export const DailyAttendanceExportModal: React.FC<DailyAttendanceExportModalProps> = ({
  isOpen,
  onClose,
  config,
  students,
  currentRecords,
  currentDate,
  allStudents = [],
  teachers = [],
}) => {
  const [exportScope, setExportScope] = useState<'current' | 'all'>('current');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('is-printing-attendance-sheet');
      return () => {
        document.body.classList.remove('is-printing-attendance-sheet');
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formattedDate = formatGujaratiDate(currentDate);

  // Statistics for current standard
  const total = students.length;
  let present = 0;
  let absent = 0;
  let leave = 0;
  let boysCount = 0;
  let girlsCount = 0;
  let boysPresent = 0;
  let girlsPresent = 0;
  const absentStudents: Student[] = [];

  students.forEach((s) => {
    const isBoy = s.gender === 'boy';
    if (isBoy) boysCount++;
    else girlsCount++;

    const st = currentRecords[s.id] || 'present';
    if (st === 'present') {
      present++;
      if (isBoy) boysPresent++;
      else girlsPresent++;
    } else if (st === 'absent') {
      absent++;
      absentStudents.push(s);
    } else if (st === 'leave') {
      leave++;
    }
  });

  const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : '0';

  // Standards list for all-standards view
  const standardsList = [
    'ધોરણ ૧',
    'ધોરણ ૨',
    'ધોરણ ૩',
    'ધોરણ ૪',
    'ધોરણ ૫',
    'ધોરણ ૬',
    'ધોરણ ૭',
    'ધોરણ ૮',
  ];

  // Overall school statistics for all 8 standards
  let schoolTotal = 0;
  let schoolPresent = 0;
  let schoolAbsent = 0;
  let schoolLeave = 0;

  const standardsSummary = standardsList.map((std) => {
    const stdStudents = allStudents.filter((s) => s.standard === std);
    const teacher = teachers.find((t) => t.standard === std);

    let p = 0;
    let a = 0;
    let l = 0;

    stdStudents.forEach((s) => {
      const st = currentRecords[s.id] || 'present';
      if (st === 'present') p++;
      else if (st === 'absent') a++;
      else if (st === 'leave') l++;
    });

    const stdTot = stdStudents.length;
    const pct = stdTot > 0 ? ((p / stdTot) * 100).toFixed(1) : '0';

    schoolTotal += stdTot;
    schoolPresent += p;
    schoolAbsent += a;
    schoolLeave += l;

    return {
      standard: std,
      teacher: teacher?.name || 'વર્ગ શિક્ષક',
      phone: teacher?.phone || '',
      total: stdTot,
      present: p,
      absent: a,
      leave: l,
      percentage: pct,
    };
  });

  const schoolPercentage =
    schoolTotal > 0 ? ((schoolPresent / schoolTotal) * 100).toFixed(1) : '0';

  const handleExportCSV = () => {
    downloadDailyAttendanceCSV({
      students,
      currentRecords,
      config,
      currentDate,
      allStudents,
      teachers,
      exportAllStandards: exportScope === 'all',
    });
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:overflow-visible">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Modal Top Bar (Hidden in Print) */}
        <div className="p-4 bg-emerald-900 text-white flex items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <FileText className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">દૈનિક હાજરી પત્રક એક્સપોર્ટ</h3>
                <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded-full">
                  PDF & CSV રેકોર્ડ
                </span>
              </div>
              <p className="text-xs text-emerald-200">
                {config.schoolName} • {config.payCenterSchool || 'પે સેન્ટર શાળા ઢીંકવા'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-emerald-100 hover:text-white transition-colors cursor-pointer"
            title="બંધ કરો"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls & Scope Selection (Hidden in Print) */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          {/* Scope Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">પત્રક પ્રકાર:</span>
            <div className="flex items-center bg-white border border-slate-200 p-0.5 rounded-xl text-xs font-medium shadow-2xs">
              <button
                type="button"
                onClick={() => setExportScope('current')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  exportScope === 'current'
                    ? 'bg-emerald-800 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>હાલનું ધોરણ ({config.standard})</span>
              </button>
              <button
                type="button"
                onClick={() => setExportScope('all')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  exportScope === 'all'
                    ? 'bg-emerald-800 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <School className="w-3.5 h-3.5" />
                <span>તમામ ૮ ધોરણ (સંપૂર્ણ શાળા)</span>
              </button>
            </div>
          </div>

          {/* Export Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer ${
                downloadSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300'
              }`}
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>CSV ડાઉનલોડ થઈ ગયું!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-emerald-700" />
                  <span>CSV (Excel) ડાઉનલોડ</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>PDF / પ્રિન્ટ કરો</span>
            </button>
          </div>
        </div>

        {/* Printable Muster Body (Scrollable in modal, full in print) */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100 print:bg-white print:p-0 print:overflow-visible">
          <div className="printable-attendance-register bg-white rounded-xl border border-slate-200 p-6 sm:p-8 max-w-3xl mx-auto shadow-sm print:shadow-none print:border-none print:p-4 print:max-w-none">
            {/* Official Gujarat Header */}
            <div className="text-center pb-4 border-b-2 border-slate-800 space-y-1">
              <div className="text-[11px] font-semibold text-slate-600 tracking-wider">
                શિક્ષણ વિભાગ, ગુજરાત રાજ્ય
              </div>

              {config.payCenterSchool && (
                <div className="text-xs font-bold text-amber-800 tracking-wide">
                  {config.payCenterSchool}
                </div>
              )}

              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 uppercase tracking-tight">
                {config.schoolName}
              </h1>

              <p className="text-xs text-slate-700">
                તા. {config.taluka}, જિ. {config.district} • શાળા DISE કોડ: {config.schoolCode}
              </p>

              <div className="pt-2">
                <span className="inline-block bg-slate-900 text-white px-4 py-1 rounded-md text-xs font-bold tracking-wider uppercase">
                  દૈનિક વિદ્યાર્થી હાજરી પત્રક (DAILY ATTENDANCE REGISTER)
                </span>
              </div>
            </div>

            {/* Metadata Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-3 border-b border-slate-200 text-xs text-slate-800 font-medium">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>
                  <strong>તારીખ:</strong> {formattedDate}
                </span>
              </div>

              <div>
                <strong>ધોરણ:</strong>{' '}
                {exportScope === 'current'
                  ? `${config.standard} (${config.division})`
                  : 'ધોરણ ૧ થી ૮ (સંયુક્ત)'}
              </div>

              <div>
                <strong>વર્ગ શિક્ષક:</strong>{' '}
                {exportScope === 'current'
                  ? config.teacherName || 'શ્રી બી. બી. પટેલ'
                  : 'તમામ ૮ વર્ગ શિક્ષકો'}
              </div>

              {exportScope === 'current' && (
                <>
                  <div>
                    <strong>શિક્ષક કોડ:</strong> {config.teacherCode}
                  </div>
                  <div>
                    <strong>મોબાઇલ:</strong> {config.teacherPhone || '9099662933'}
                  </div>
                  <div>
                    <strong>શૈક્ષણિક વર્ષ:</strong> {config.academicYear || '૨૦૨૬-૨૭'}
                  </div>
                </>
              )}
            </div>

            {/* Attendance Summary KPIs */}
            {exportScope === 'current' ? (
              <div className="my-4 grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
                  <div className="text-slate-500 text-[11px]">કુલ સંખ્યા</div>
                  <div className="text-lg font-black text-slate-900 font-mono mt-0.5">{total}</div>
                  <div className="text-[10px] text-slate-500">
                    (કુ: {boysCount}, કન્યા: {girlsCount})
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg">
                  <div className="text-emerald-700 text-[11px] font-semibold">હાજર સંખ્યા</div>
                  <div className="text-lg font-black text-emerald-800 font-mono mt-0.5">
                    {present}
                  </div>
                  <div className="text-[10px] text-emerald-600">
                    (કુ: {boysPresent}, કન્યા: {girlsPresent})
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 p-2.5 rounded-lg">
                  <div className="text-red-700 text-[11px] font-semibold">ગેરહાજર</div>
                  <div className="text-lg font-black text-red-800 font-mono mt-0.5">{absent}</div>
                  <div className="text-[10px] text-red-600">
                    {absent > 0 ? `રોલ: ${absentStudents.map((s) => s.rollNo).join(', ')}` : '૦'}
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg">
                  <div className="text-amber-700 text-[11px] font-semibold">રજા (Leave)</div>
                  <div className="text-lg font-black text-amber-800 font-mono mt-0.5">{leave}</div>
                  <div className="text-[10px] text-amber-600">મંજૂર રજા</div>
                </div>

                <div className="col-span-2 sm:col-span-1 bg-blue-50 border border-blue-200 p-2.5 rounded-lg">
                  <div className="text-blue-700 text-[11px] font-semibold">હાજરી ટકાવારી</div>
                  <div className="text-lg font-black text-blue-900 font-mono mt-0.5">
                    {percentage}%
                  </div>
                  <div className="text-[10px] text-blue-600">દૈનિક સરેરાશ</div>
                </div>
              </div>
            ) : (
              /* All 8 Standards Consolidated Summary */
              <div className="my-4 space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
                    <div className="text-slate-500 text-[11px]">શાળાના કુલ વિદ્યાર્થી</div>
                    <div className="text-xl font-black text-slate-900 font-mono">
                      {schoolTotal}
                    </div>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg">
                    <div className="text-emerald-700 text-[11px]">શાળા કુલ હાજર</div>
                    <div className="text-xl font-black text-emerald-800 font-mono">
                      {schoolPresent}
                    </div>
                  </div>
                  <div className="bg-red-50 border border-red-200 p-2.5 rounded-lg">
                    <div className="text-red-700 text-[11px]">શાળા કુલ ગેરહાજર</div>
                    <div className="text-xl font-black text-red-800 font-mono">
                      {schoolAbsent}
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-lg">
                    <div className="text-blue-700 text-[11px]">શાળા હાજરી સરેરાશ</div>
                    <div className="text-xl font-black text-blue-800 font-mono">
                      {schoolPercentage}%
                    </div>
                  </div>
                </div>

                {/* Table for Standard 1 to 8 Summary */}
                <div className="border border-slate-300 rounded-lg overflow-hidden">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-slate-800 text-white font-bold text-[11px]">
                      <tr>
                        <th className="p-2 border border-slate-700">ધોરણ</th>
                        <th className="p-2 border border-slate-700">વર્ગ શિક્ષક</th>
                        <th className="p-2 border border-slate-700">મોબાઇલ</th>
                        <th className="p-2 border border-slate-700 text-center">કુલ</th>
                        <th className="p-2 border border-slate-700 text-center">હાજર</th>
                        <th className="p-2 border border-slate-700 text-center">ગેરહાજર</th>
                        <th className="p-2 border border-slate-700 text-center">રજા</th>
                        <th className="p-2 border border-slate-700 text-center">હાજરી %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800">
                      {standardsSummary.map((row) => (
                        <tr key={row.standard} className="hover:bg-slate-50">
                          <td className="p-2 border border-slate-200 font-bold">{row.standard}</td>
                          <td className="p-2 border border-slate-200">{row.teacher}</td>
                          <td className="p-2 border border-slate-200 font-mono text-[11px]">
                            {row.phone}
                          </td>
                          <td className="p-2 border border-slate-200 text-center font-mono">
                            {row.total}
                          </td>
                          <td className="p-2 border border-slate-200 text-center font-mono font-bold text-emerald-700">
                            {row.present}
                          </td>
                          <td className="p-2 border border-slate-200 text-center font-mono font-bold text-red-600">
                            {row.absent}
                          </td>
                          <td className="p-2 border border-slate-200 text-center font-mono text-amber-600">
                            {row.leave}
                          </td>
                          <td className="p-2 border border-slate-200 text-center font-mono font-bold">
                            {row.percentage}%
                          </td>
                        </tr>
                      ))}
                      {/* Grand Total Row */}
                      <tr className="bg-slate-100 font-black">
                        <td colSpan={3} className="p-2 border border-slate-300 text-slate-900">
                          કુલ (સમગ્ર શાળા)
                        </td>
                        <td className="p-2 border border-slate-300 text-center font-mono">
                          {schoolTotal}
                        </td>
                        <td className="p-2 border border-slate-300 text-center font-mono text-emerald-800">
                          {schoolPresent}
                        </td>
                        <td className="p-2 border border-slate-300 text-center font-mono text-red-700">
                          {schoolAbsent}
                        </td>
                        <td className="p-2 border border-slate-300 text-center font-mono text-amber-700">
                          {schoolLeave}
                        </td>
                        <td className="p-2 border border-slate-300 text-center font-mono text-blue-900">
                          {schoolPercentage}%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Detailed Student Attendance Table (For Current Standard) */}
            {exportScope === 'current' && (
              <div className="mt-4 border border-slate-300 rounded-lg overflow-hidden">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-slate-800 text-white font-bold text-[11px]">
                    <tr>
                      <th className="p-2 border border-slate-700 text-center w-12">ક્રમ</th>
                      <th className="p-2 border border-slate-700 text-center w-14">રોલ નં</th>
                      <th className="p-2 border border-slate-700 text-center w-16">G.R. નં</th>
                      <th className="p-2 border border-slate-700">વિદ્યાર્થીનું પૂરું નામ</th>
                      <th className="p-2 border border-slate-700 text-center w-14">જાતિ</th>
                      <th className="p-2 border border-slate-700 text-center w-24">મોબાઇલ નં</th>
                      <th className="p-2 border border-slate-700 text-center w-24">હાજરી સ્થિતિ</th>
                      <th className="p-2 border border-slate-700 text-center w-28">નોંધ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-900">
                    {students.map((student, idx) => {
                      const st = currentRecords[student.id] || 'present';
                      return (
                        <tr
                          key={student.id}
                          className={
                            st === 'absent'
                              ? 'bg-red-50/60'
                              : st === 'leave'
                              ? 'bg-amber-50/60'
                              : idx % 2 === 0
                              ? 'bg-white'
                              : 'bg-slate-50/40'
                          }
                        >
                          <td className="p-1.5 border border-slate-200 text-center font-mono text-slate-500">
                            {idx + 1}
                          </td>
                          <td className="p-1.5 border border-slate-200 text-center font-mono font-bold">
                            {student.rollNo}
                          </td>
                          <td className="p-1.5 border border-slate-200 text-center font-mono text-slate-600">
                            {student.grNo}
                          </td>
                          <td className="p-1.5 border border-slate-200 font-medium">
                            <div>{student.name}</div>
                            {student.nameEn && (
                              <div className="text-[10px] text-slate-400 font-sans">
                                {student.nameEn}
                              </div>
                            )}
                          </td>
                          <td className="p-1.5 border border-slate-200 text-center text-[11px]">
                            {student.gender === 'boy' ? 'કુમાર' : 'કન્યા'}
                          </td>
                          <td className="p-1.5 border border-slate-200 text-center font-mono text-[11px] text-slate-600">
                            {student.parentPhone || '-'}
                          </td>
                          <td className="p-1.5 border border-slate-200 text-center font-bold">
                            {st === 'present' ? (
                              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[11px] inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>હાજર</span>
                              </span>
                            ) : st === 'absent' ? (
                              <span className="text-red-700 font-bold bg-red-100 px-2 py-0.5 rounded text-[11px] inline-flex items-center gap-1">
                                <XCircle className="w-3 h-3 text-red-600" />
                                <span>ગેરહાજર</span>
                              </span>
                            ) : (
                              <span className="text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded text-[11px] inline-flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-700" />
                                <span>રજા</span>
                              </span>
                            )}
                          </td>
                          <td className="p-1.5 border border-slate-200 text-center text-slate-400 text-[10px]">
                            -
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Official Certification & Signature Block */}
            <div className="mt-8 pt-4 border-t-2 border-slate-300 space-y-6">
              <p className="text-[11px] text-slate-600 italic">
                * પ્રમાણપત્ર: પ્રમાણિત કરવામાં આવે છે કે આજની તારીખે ઉપર દર્શાવેલ વિદ્યાર્થીઓની હાજરી
                ચકાસીને સંપૂર્ણ સત્યતાપૂર્વક ડિજિટલ મસ્ટર પત્રકમાં નોંધ કરવામાં આવેલ છે.
              </p>

              <div className="grid grid-cols-3 gap-6 text-center text-xs text-slate-800 pt-6">
                <div>
                  <div className="border-b border-dotted border-slate-400 pb-8 mb-1.5"></div>
                  <div className="font-bold">વર્ગ શિક્ષકની સહી</div>
                  <div className="text-[10px] text-slate-500">
                    {exportScope === 'current' ? config.teacherName : 'વર્ગ શિક્ષક'}
                  </div>
                </div>

                <div>
                  <div className="border-b border-dotted border-slate-400 pb-8 mb-1.5"></div>
                  <div className="font-bold">મુખ્ય શિક્ષકની સહી અને સિક્કો</div>
                  <div className="text-[10px] text-slate-500">
                    શ્રી બી. બી. પટેલ (પે સેન્ટર શાળા ઢીંકવા)
                  </div>
                </div>

                <div>
                  <div className="border-b border-dotted border-slate-400 pb-8 mb-1.5"></div>
                  <div className="font-bold">C.R.C. કો-ઓર્ડિનેટર સહી</div>
                  <div className="text-[10px] text-slate-500">C.R.C. ક્લસ્ટર, હાલોલ</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls (Hidden in Print) */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 shrink-0 print:hidden">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>PDF સેવ કરવા માટે પ્રિન્ટ ડાયલોગમાં 'Save as PDF' પસંદ કરો.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV ફાઇલ</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PDF / પ્રિન્ટ</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl font-medium transition-all cursor-pointer"
            >
              બંધ કરો
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
