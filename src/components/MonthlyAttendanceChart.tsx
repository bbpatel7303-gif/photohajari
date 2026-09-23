import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, Users, Award, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { Student, AttendanceRecord } from '../types';
import { GUJARATI_DAYS, GUJARATI_MONTHS } from '../utils/storage';

interface MonthlyAttendanceChartProps {
  students: Student[];
  records: Record<string, AttendanceRecord>;
  selectedYear: number;
  selectedMonth: number; // 1-12
  daysInMonth: number;
}

type ChartViewMode = 'present_count' | 'percentage' | 'comparison';

interface DailyChartDataPoint {
  day: number;
  dateKey: string;
  dayLabel: string;
  fullDateLabel: string;
  dayOfWeek: string;
  isSunday: boolean;
  hasData: boolean;
  present: number | null;
  absent: number | null;
  leave: number | null;
  totalStudents: number;
  percentage: number | null;
}

export const MonthlyAttendanceChart: React.FC<MonthlyAttendanceChartProps> = ({
  students,
  records,
  selectedYear,
  selectedMonth,
  daysInMonth,
}) => {
  const [viewMode, setViewMode] = useState<ChartViewMode>('present_count');
  const [workingDaysOnly, setWorkingDaysOnly] = useState<boolean>(false);

  const totalClassStudents = students.length;

  // Process data for each day of the month
  const { chartData, stats } = useMemo(() => {
    const rawData: DailyChartDataPoint[] = [];
    let sumPresent = 0;
    let daysWithDataCount = 0;
    let maxPresent = -1;
    let maxPresentDay = -1;
    let minPresent = 99999;
    let minPresentDay = -1;

    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dateObj = new Date(selectedYear, selectedMonth - 1, d);
      const dayOfWeekIndex = dateObj.getDay();
      const isSunday = dayOfWeekIndex === 0;
      const dayOfWeek = GUJARATI_DAYS[dayOfWeekIndex];

      let presentCount = 0;
      let absentCount = 0;
      let leaveCount = 0;
      let recordedCount = 0;

      const dayRecord = records[dateKey];
      if (dayRecord && dayRecord.records) {
        students.forEach((s) => {
          const status = dayRecord.records[s.id];
          if (status === 'present') {
            presentCount++;
            recordedCount++;
          } else if (status === 'absent') {
            absentCount++;
            recordedCount++;
          } else if (status === 'leave') {
            leaveCount++;
            recordedCount++;
          }
        });
      }

      const hasData = recordedCount > 0;
      const pct =
        hasData && totalClassStudents > 0
          ? Number(((presentCount / totalClassStudents) * 100).toFixed(1))
          : null;

      if (hasData) {
        sumPresent += presentCount;
        daysWithDataCount++;

        if (presentCount > maxPresent) {
          maxPresent = presentCount;
          maxPresentDay = d;
        }
        if (presentCount < minPresent) {
          minPresent = presentCount;
          minPresentDay = d;
        }
      }

      rawData.push({
        day: d,
        dateKey,
        dayLabel: `${d}`,
        fullDateLabel: `${d} ${GUJARATI_MONTHS[selectedMonth - 1]} ${selectedYear}`,
        dayOfWeek,
        isSunday,
        hasData,
        present: hasData ? presentCount : null,
        absent: hasData ? absentCount : null,
        leave: hasData ? leaveCount : null,
        totalStudents: totalClassStudents,
        percentage: pct,
      });
    }

    const filteredData = workingDaysOnly
      ? rawData.filter((pt) => !pt.isSunday)
      : rawData;

    const avgPresent =
      daysWithDataCount > 0 ? (sumPresent / daysWithDataCount).toFixed(1) : '0';
    const avgPercentage =
      daysWithDataCount > 0 && totalClassStudents > 0
        ? ((Number(avgPresent) / totalClassStudents) * 100).toFixed(1)
        : '0';

    return {
      chartData: filteredData,
      stats: {
        avgPresent,
        avgPercentage,
        daysWithDataCount,
        maxPresent: maxPresentDay !== -1 ? maxPresent : 0,
        maxPresentDay: maxPresentDay !== -1 ? maxPresentDay : null,
        minPresent: minPresentDay !== -1 ? minPresent : 0,
        minPresentDay: minPresentDay !== -1 ? minPresentDay : null,
      },
    };
  }, [students, records, selectedYear, selectedMonth, daysInMonth, totalClassStudents, workingDaysOnly]);

  // Custom Gujarati Tooltip Component for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = chartData.find((d) => String(d.day) === String(label));
      if (!dataPoint) return null;

      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs backdrop-blur-xs min-w-[190px]">
          <div className="font-bold text-amber-300 border-b border-slate-700 pb-1 mb-1.5 flex items-center justify-between">
            <span>{dataPoint.fullDateLabel}</span>
            <span className="text-[10px] text-slate-300">({dataPoint.dayOfWeek})</span>
          </div>

          {dataPoint.isSunday ? (
            <div className="text-red-300 text-[11px] py-1 font-semibold flex items-center gap-1">
              <span>📅 રવિવાર (શાળા રજા)</span>
            </div>
          ) : !dataPoint.hasData ? (
            <div className="text-slate-400 text-[11px] py-1 italic">
              હાજરી નોંધાયેલ નથી (No Record)
            </div>
          ) : (
            <div className="space-y-1.5 pt-0.5">
              <div className="flex items-center justify-between gap-3 text-emerald-300 font-bold">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>હાજર સંખ્યા:</span>
                </span>
                <span className="font-mono text-sm">
                  {dataPoint.present} / {dataPoint.totalStudents}
                </span>
              </div>

              {dataPoint.absent !== null && (
                <div className="flex items-center justify-between gap-3 text-rose-300">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                    <span>ગેરહાજર સંખ્યા:</span>
                  </span>
                  <span className="font-mono">{dataPoint.absent}</span>
                </div>
              )}

              {dataPoint.leave !== null && dataPoint.leave > 0 && (
                <div className="flex items-center justify-between gap-3 text-amber-300">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span>રજા (Leave):</span>
                  </span>
                  <span className="font-mono">{dataPoint.leave}</span>
                </div>
              )}

              <div className="flex items-center justify-between gap-3 text-blue-200 border-t border-slate-700/80 pt-1 mt-1 text-[11px]">
                <span>હાજરી ટકાવારી:</span>
                <span className="font-mono font-bold text-blue-300">{dataPoint.percentage}%</span>
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-5 space-y-4 print:hidden">
      {/* Chart Title & Mode Selection Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <span>દૈનિક હાજરી ટ્રેન્ડ આલેખ (Attendance Trend Line Chart)</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                Recharts
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              {GUJARATI_MONTHS[selectedMonth - 1]} {selectedYear} - દૈનિક હાજર વિદ્યાર્થીઓની સંખ્યાનો આલેખ
            </p>
          </div>
        </div>

        {/* View Mode & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Working Days Filter */}
          <button
            type="button"
            onClick={() => setWorkingDaysOnly(!workingDaysOnly)}
            className={`px-2.5 py-1 text-xs rounded-xl border transition-all cursor-pointer flex items-center gap-1 ${
              workingDaysOnly
                ? 'bg-slate-900 text-white border-slate-900 font-medium'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title="રવિવારની રજાઓ છુપાવો / બતાવો"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{workingDaysOnly ? 'માત્ર કાર્યકારી દિવસો' : 'બધા દિવસો (૧-૩૧)'}</span>
          </button>

          {/* Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('present_count')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                viewMode === 'present_count'
                  ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              હાજર સંખ્યા
            </button>
            <button
              type="button"
              onClick={() => setViewMode('percentage')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                viewMode === 'percentage'
                  ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              હાજરી %
            </button>
            <button
              type="button"
              onClick={() => setViewMode('comparison')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                viewMode === 'comparison'
                  ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              હાજર vs ગેરહાજર
            </button>
          </div>
        </div>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-emerald-800 text-[11px] font-medium">સરેરાશ દૈનિક હાજર</div>
            <div className="text-base sm:text-lg font-black text-emerald-950 font-mono">
              {stats.avgPresent}{' '}
              <span className="text-xs font-normal text-emerald-700">/ {totalClassStudents}</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="text-blue-800 text-[11px] font-medium">સરેરાશ હાજરી ટકાવારી</div>
            <div className="text-base sm:text-lg font-black text-blue-950 font-mono">
              {stats.avgPercentage}%
            </div>
          </div>
        </div>

        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <div className="text-amber-800 text-[11px] font-medium">સર્વોચ્ચ હાજરી દિવસ</div>
            <div className="text-base sm:text-lg font-black text-amber-950 font-mono">
              {stats.maxPresentDay ? (
                <>
                  તા. {stats.maxPresentDay}{' '}
                  <span className="text-xs font-normal text-amber-700">
                    ({stats.maxPresent} હાજર)
                  </span>
                </>
              ) : (
                '-'
              )}
            </div>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-700 text-white flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-slate-600 text-[11px] font-medium">કુલ નોંધાયેલ દિવસો</div>
            <div className="text-base sm:text-lg font-black text-slate-900 font-mono">
              {stats.daysWithDataCount}{' '}
              <span className="text-xs font-normal text-slate-500">દિવસો</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Recharts Line Chart Container */}
      <div className="w-full pt-1 pb-1">
        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 12, right: 16, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={{ stroke: '#cbd5e1' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickFormatter={(val) => `${val}`}
              />

              <YAxis
                domain={
                  viewMode === 'percentage'
                    ? [0, 100]
                    : [0, Math.max(totalClassStudents, 12)]
                }
                allowDecimals={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={{ stroke: '#cbd5e1' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickFormatter={(val) =>
                  viewMode === 'percentage' ? `${val}%` : `${val}`
                }
              />

              <Tooltip content={<CustomTooltip />} />

              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }}
              />

              {/* Reference line for total student count (benchmark capacity) */}
              {viewMode !== 'percentage' && totalClassStudents > 0 && (
                <ReferenceLine
                  y={totalClassStudents}
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                  label={{
                    value: `કુલ વિદ્યાર્થી ક્ષમતા (${totalClassStudents})`,
                    position: 'insideTopLeft',
                    fill: '#64748b',
                    fontSize: 10,
                  }}
                />
              )}

              {/* Present Count Line */}
              {(viewMode === 'present_count' || viewMode === 'comparison') && (
                <Line
                  type="monotone"
                  dataKey="present"
                  name="હાજર સંખ્યા (Present Count)"
                  stroke="#059669"
                  strokeWidth={3}
                  connectNulls={true}
                  activeDot={{
                    r: 6,
                    fill: '#059669',
                    stroke: '#ffffff',
                    strokeWidth: 2,
                  }}
                  dot={{
                    r: 3.5,
                    fill: '#059669',
                    stroke: '#ffffff',
                    strokeWidth: 1.5,
                  }}
                />
              )}

              {/* Absent Count Line (shown in comparison mode) */}
              {viewMode === 'comparison' && (
                <Line
                  type="monotone"
                  dataKey="absent"
                  name="ગેરહાજર સંખ્યા (Absent Count)"
                  stroke="#e11d48"
                  strokeWidth={2}
                  strokeDasharray="4 2"
                  connectNulls={true}
                  activeDot={{
                    r: 5,
                    fill: '#e11d48',
                    stroke: '#ffffff',
                    strokeWidth: 2,
                  }}
                  dot={{
                    r: 3,
                    fill: '#e11d48',
                    stroke: '#ffffff',
                    strokeWidth: 1,
                  }}
                />
              )}

              {/* Percentage Line */}
              {viewMode === 'percentage' && (
                <Line
                  type="monotone"
                  dataKey="percentage"
                  name="હાજરી ટકાવારી (%)"
                  stroke="#2563eb"
                  strokeWidth={3}
                  connectNulls={true}
                  activeDot={{
                    r: 6,
                    fill: '#2563eb',
                    stroke: '#ffffff',
                    strokeWidth: 2,
                  }}
                  dot={{
                    r: 3.5,
                    fill: '#2563eb',
                    stroke: '#ffffff',
                    strokeWidth: 1.5,
                  }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart Footer Guide */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-600 inline-block rounded-full"></span>
            <span>લીલી લાઇન: દૈનિક હાજર વિદ્યાર્થીઓ</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-b border-dashed border-slate-400 inline-block"></span>
            <span>ડેશ લાઇન: વર્ગની કુલ સંખ્યા</span>
          </span>
        </div>
        <div className="text-slate-400">
          * તારીખ પર કર્સર રાખવાથી તે દિવસની સંપૂર્ણ વિગત દેખાશે.
        </div>
      </div>
    </div>
  );
};
