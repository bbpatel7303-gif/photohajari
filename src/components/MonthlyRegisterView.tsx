import React, { useState, useMemo } from 'react';
import {
  Printer,
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Student, AttendanceRecord, SchoolConfig } from '../types';
import { GUJARATI_MONTHS, GUJARATI_DAYS } from '../utils/storage';

interface MonthlyRegisterViewProps {
  students: Student[];
  records: Record<string, AttendanceRecord>;
  config: SchoolConfig;
}

export const MonthlyRegisterView: React.FC<MonthlyRegisterViewProps> = ({
  students,
  records,
  config,
}) => {
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth() + 1); // 1-12
  const [genderFilter, setGenderFilter] = useState<'all' | 'boy' | 'girl'>('all');

  // Days in selected month
  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth, 0).getDate();
  }, [selectedYear, selectedMonth]);

  // Generate array of day numbers: [1, 2, ..., 30/31]
  const daysArray = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }, [daysInMonth]);

  // Navigate months
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  // Filter students
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => (genderFilter === 'all' ? true : s.gender === genderFilter))
      .sort((a, b) => a.rollNo - b.rollNo);
  }, [students, genderFilter]);

  // Print register
  const handlePrint = () => {
    window.print();
  };

  // Export CSV
  const handleExportCSV = () => {
    const monthName = GUJARATI_MONTHS[selectedMonth - 1];
    let csv = `રોલ નં.,જી.આર. નં.,વિદ્યાર્થીનું નામ,જાતિ,`;

    // Days header
    daysArray.forEach((d) => {
      csv += `દિવસ ${d},`;
    });
    csv += `કુલ હાજર દિવસ,કુલ ગેરહાજર દિવસ,હાજરી %\n`;

    filteredStudents.forEach((s) => {
      let presentCount = 0;
      let absentCount = 0;
      let dayCols = '';

      daysArray.forEach((d) => {
        const dateKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const dayRecord = records[dateKey]?.records?.[s.id];
        const dateObj = new Date(selectedYear, selectedMonth - 1, d);
        const isSunday = dateObj.getDay() === 0;

        if (isSunday) {
          dayCols += 'રવિવાર,';
        } else if (dayRecord === 'present') {
          dayCols += 'P,';
          presentCount++;
        } else if (dayRecord === 'absent') {
          dayCols += 'A,';
          absentCount++;
        } else if (dayRecord === 'leave') {
          dayCols += 'L,';
        } else {
          dayCols += '-,';
        }
      });

      const totalWorkingDays = presentCount + absentCount;
      const rate =
        totalWorkingDays > 0 ? ((presentCount / totalWorkingDays) * 100).toFixed(1) : '0';

      csv += `${s.rollNo},${s.grNo},"${s.name}",${s.gender === 'boy' ? 'કુમાર' : 'કન્યા'},${dayCols}${presentCount},${absentCount},${rate}%\n`;
    });

    const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csv], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `હાજરી_પત્રક_${config.schoolName}_${monthName}_${selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        {/* Month Selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700"
            title="અગાઉનો મહિનો"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl">
            <Calendar className="w-4 h-4 text-emerald-700" />
            <span className="font-bold text-slate-900 text-sm">
              {GUJARATI_MONTHS[selectedMonth - 1]} {selectedYear}
            </span>
          </div>

          <button
            onClick={handleNextMonth}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700"
            title="આગામી મહિનો"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Filter & Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-1" />
            <button
              onClick={() => setGenderFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                genderFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              બધા
            </button>
            <button
              onClick={() => setGenderFilter('boy')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                genderFilter === 'boy'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              કુમાર
            </button>
            <button
              onClick={() => setGenderFilter('girl')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                genderFilter === 'girl'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              કન્યા
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Excel / CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>પ્રિન્ટ / PDF</span>
          </button>
        </div>
      </div>

      {/* Official Gujarat School Register Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Printable Official School Header */}
        <div className="p-4 border-b border-slate-200 text-center bg-slate-50/60">
          <div className="text-xs text-slate-500 font-medium flex items-center justify-center gap-2 flex-wrap">
            <span>શિક્ષણ વિભાગ, ગુજરાત રાજ્ય</span>
            <span>•</span>
            <span className="text-amber-800 font-semibold">{config.payCenterSchool || 'પે સેન્ટર શાળા ઢીંકવા'}</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
            {config.schoolName}
          </h2>
          <div className="text-xs font-bold text-slate-700">માસિક વિદ્યાર્થી હાજરી પત્રક</div>
          <div className="text-xs text-slate-600 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-1 font-mono">
            <span>DISE કોડ: {config.schoolCode}</span>
            <span>વર્ગ: {config.standard}</span>
            <span>શિક્ષક કોડ: {config.teacherCode}</span>
            <span>
              માસ: {GUJARATI_MONTHS[selectedMonth - 1]} {selectedYear}
            </span>
          </div>
        </div>

        {/* Attendance Grid Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-semibold">
                <th className="p-2 border-r border-slate-200 w-10 text-center sticky left-0 bg-slate-100 z-10">
                  રોલ
                </th>
                <th className="p-2 border-r border-slate-200 min-w-[180px] sticky left-10 bg-slate-100 z-10">
                  વિદ્યાર્થીનું નામ
                </th>
                {daysArray.map((day) => {
                  const dateObj = new Date(selectedYear, selectedMonth - 1, day);
                  const isSunday = dateObj.getDay() === 0;
                  const dayName = GUJARATI_DAYS[dateObj.getDay()][0]; // First letter (ર, સો, મં...)
                  return (
                    <th
                      key={day}
                      className={`p-1 border-r border-slate-200 text-center min-w-[26px] ${
                        isSunday ? 'bg-red-50 text-red-700 font-bold' : ''
                      }`}
                    >
                      <div className="text-[10px] text-slate-400">{dayName}</div>
                      <div>{day}</div>
                    </th>
                  );
                })}
                <th className="p-2 border-r border-slate-200 text-center bg-emerald-50 text-emerald-900 font-bold min-w-[50px]">
                  હાજર
                </th>
                <th className="p-2 border-r border-slate-200 text-center bg-red-50 text-red-900 font-bold min-w-[50px]">
                  ગેરહાજર
                </th>
                <th className="p-2 text-center bg-blue-50 text-blue-900 font-bold min-w-[55px]">
                  %
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredStudents.map((student) => {
                let presentCount = 0;
                let absentCount = 0;

                return (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    {/* Roll No */}
                    <td className="p-2 border-r border-slate-200 font-mono font-bold text-center sticky left-0 bg-white group-hover:bg-slate-50">
                      {String(student.rollNo).padStart(2, '0')}
                    </td>

                    {/* Student Name */}
                    <td className="p-2 border-r border-slate-200 font-medium text-slate-900 sticky left-10 bg-white group-hover:bg-slate-50">
                      <div className="flex items-center gap-1.5">
                        <img
                          src={student.photoUrl}
                          alt=""
                          className="w-5 h-5 rounded-full object-cover shrink-0 print:hidden"
                        />
                        <span className="truncate">{student.name}</span>
                      </div>
                    </td>

                    {/* Days 1 to 31 */}
                    {daysArray.map((day) => {
                      const dateKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const dayRecord = records[dateKey]?.records?.[student.id];
                      const dateObj = new Date(selectedYear, selectedMonth - 1, day);
                      const isSunday = dateObj.getDay() === 0;

                      if (dayRecord === 'present') presentCount++;
                      if (dayRecord === 'absent') absentCount++;

                      return (
                        <td
                          key={day}
                          className={`p-1 border-r border-slate-200 text-center font-mono text-xs ${
                            isSunday
                              ? 'bg-red-50/50 text-red-400'
                              : dayRecord === 'present'
                              ? 'text-emerald-700 font-bold bg-emerald-50/20'
                              : dayRecord === 'absent'
                              ? 'text-red-600 font-bold bg-red-100/50'
                              : dayRecord === 'leave'
                              ? 'text-amber-600 font-bold bg-amber-50'
                              : 'text-slate-300'
                          }`}
                        >
                          {isSunday
                            ? 'ર'
                            : dayRecord === 'present'
                            ? '✓'
                            : dayRecord === 'absent'
                            ? '✗'
                            : dayRecord === 'leave'
                            ? 'L'
                            : '-'}
                        </td>
                      );
                    })}

                    {/* Total Present */}
                    <td className="p-2 border-r border-slate-200 text-center font-bold text-emerald-800 bg-emerald-50/40">
                      {presentCount}
                    </td>

                    {/* Total Absent */}
                    <td className="p-2 border-r border-slate-200 text-center font-bold text-red-800 bg-red-50/40">
                      {absentCount}
                    </td>

                    {/* % */}
                    <td className="p-2 text-center font-bold text-slate-800 bg-slate-50/40">
                      {presentCount + absentCount > 0
                        ? `${((presentCount / (presentCount + absentCount)) * 100).toFixed(0)}%`
                        : '0%'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="font-bold text-emerald-700">✓</span> હાજર (Present)
            </span>
            <span className="flex items-center gap-1">
              <span className="font-bold text-red-600">✗</span> ગેરહાજર (Absent)
            </span>
            <span className="flex items-center gap-1">
              <span className="font-bold text-amber-600">L</span> રજા (Leave)
            </span>
            <span className="flex items-center gap-1">
              <span className="font-bold text-red-400">ર</span> રવિવાર (Sunday)
            </span>
          </div>
          <div className="font-medium text-slate-500">
            વર્ગ શિક્ષકની સહી: ______________ &nbsp;&nbsp;&nbsp;&nbsp; આચાર્યની સહી: ______________
          </div>
        </div>
      </div>
    </div>
  );
};
