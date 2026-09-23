import React, { useState, useMemo } from 'react';
import {
  Printer,
  Download,
  Search,
  Award,
  BookOpen,
  CheckCircle,
  FileSpreadsheet,
  Edit2,
  X,
  Check,
  TrendingUp,
  Sparkles,
  School,
  User,
  GraduationCap,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { Student, SchoolConfig, StudentResult, SubjectMarks } from '../types';

interface ResultPatrakViewProps {
  students: Student[];
  config: SchoolConfig;
  results: Record<string, StudentResult>;
  onUpdateResult: (result: StudentResult) => void;
  onDeleteResult?: (studentId: string) => void;
  onResetAllResults?: () => void;
}

const SUBJECT_KEYS: { key: keyof SubjectMarks; label: string; max: number }[] = [
  { key: 'gujarati', label: 'ગુજરાતી', max: 100 },
  { key: 'mathematics', label: 'ગણિત', max: 100 },
  { key: 'science', label: 'વિજ્ઞાન', max: 100 },
  { key: 'socialScience', label: 'સા. વિજ્ઞાન', max: 100 },
  { key: 'english', label: 'અંગ્રેજી', max: 100 },
  { key: 'hindi', label: 'હિન્દી', max: 100 },
  { key: 'sanskrit', label: 'સંસ્કૃત', max: 100 },
];

export function calculateGrade(percentage: number): { grade: string; color: string; status: string } {
  if (percentage >= 91) return { grade: 'A1', color: 'text-emerald-700 bg-emerald-50 border-emerald-300', status: 'વિશિષ્ટ (Outstanding)' };
  if (percentage >= 81) return { grade: 'A2', color: 'text-teal-700 bg-teal-50 border-teal-300', status: 'ખૂબ ઉત્તમ (Excellent)' };
  if (percentage >= 71) return { grade: 'B1', color: 'text-blue-700 bg-blue-50 border-blue-300', status: 'ઉત્તમ (Very Good)' };
  if (percentage >= 61) return { grade: 'B2', color: 'text-indigo-700 bg-indigo-50 border-indigo-300', status: 'સારું (Good)' };
  if (percentage >= 51) return { grade: 'C1', color: 'text-amber-700 bg-amber-50 border-amber-300', status: 'મધ્યમ (Satisfactory)' };
  if (percentage >= 41) return { grade: 'C2', color: 'text-orange-700 bg-orange-50 border-orange-300', status: 'સાધારણ (Fair)' };
  if (percentage >= 33) return { grade: 'D', color: 'text-slate-700 bg-slate-100 border-slate-300', status: 'પાસ (Pass)' };
  return { grade: 'E', color: 'text-red-700 bg-red-50 border-red-300', status: 'સુધારણા જરૂરી (Needs Improvement)' };
}

export const ResultPatrakView: React.FC<ResultPatrakViewProps> = ({
  students,
  config,
  results,
  onUpdateResult,
  onDeleteResult,
  onResetAllResults,
}) => {
  const [examType, setExamType] = useState<'sem1' | 'sem2' | 'unit_test'>('sem1');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<Student | null>(null);
  const [editingStudentResult, setEditingStudentResult] = useState<StudentResult | null>(null);

  // Compute stats and ranks
  const computedList = useMemo(() => {
    const list = students.map((student) => {
      const res = results[student.id] || {
        studentId: student.id,
        examType,
        marks: {
          gujarati: 75,
          mathematics: 75,
          science: 75,
          socialScience: 75,
          english: 75,
          hindi: 75,
          sanskrit: 75,
        },
        remarks: 'સારી પ્રગતિ.',
      };

      const m = res.marks;
      const totalMarks =
        (m.gujarati || 0) +
        (m.mathematics || 0) +
        (m.science || 0) +
        (m.socialScience || 0) +
        (m.english || 0) +
        (m.hindi || 0) +
        (m.sanskrit || 0);

      const percentage = Number(((totalMarks / 700) * 100).toFixed(1));
      const gradeInfo = calculateGrade(percentage);

      return {
        student,
        marks: m,
        totalMarks,
        percentage,
        gradeInfo,
        remarks: res.remarks || 'નિયમિત હાજર અને ઉત્સાહી.',
      };
    });

    // Assign rank based on totalMarks
    const sortedByMarks = [...list].sort((a, b) => b.totalMarks - a.totalMarks);
    const rankMap = new Map<string, number>();
    sortedByMarks.forEach((item, index) => {
      rankMap.set(item.student.id, index + 1);
    });

    return list
      .map((item) => ({ ...item, rank: rankMap.get(item.student.id) || 0 }))
      .sort((a, b) => a.student.rollNo - b.student.rollNo);
  }, [students, results, examType]);

  // Filtered
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return computedList;
    const q = searchQuery.toLowerCase().trim();
    return computedList.filter(
      (item) =>
        item.student.name.toLowerCase().includes(q) ||
        item.student.nameEn.toLowerCase().includes(q) ||
        String(item.student.rollNo) === q ||
        item.student.grNo.includes(q)
    );
  }, [computedList, searchQuery]);

  // Summary Metrics
  const classAvg = useMemo(() => {
    if (computedList.length === 0) return 0;
    const sum = computedList.reduce((acc, curr) => acc + curr.percentage, 0);
    return (sum / computedList.length).toFixed(1);
  }, [computedList]);

  const top3 = useMemo(() => {
    return [...computedList].sort((a, b) => b.totalMarks - a.totalMarks).slice(0, 3);
  }, [computedList]);

  // Export CSV
  const handleExportCSV = () => {
    let csv =
      'રોલ નં,GR નં,વિદ્યાર્થીનું નામ,ગુજરાતી,ગણિત,વિજ્ઞાન,સા.વિજ્ઞાન,અંગ્રેજી,હિન્દી,સંસ્કૃત,કુલ ગુણ (700),ટકાવારી,ગ્રેડ,વર્ગ ક્રમ\n';
    computedList.forEach((row) => {
      csv += `${row.student.rollNo},"${row.student.grNo}","${row.student.name}",${row.marks.gujarati},${row.marks.mathematics},${row.marks.science},${row.marks.socialScience},${row.marks.english},${row.marks.hindi},${row.marks.sanskrit},${row.totalMarks},${row.percentage}%,${row.gradeInfo.grade},${row.rank}\n`;
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${config.schoolName || 'School'}_${config.standard}_Result_${examType}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const examTitleGujarati = {
    sem1: 'પ્રથમ સત્રાંત પરીક્ષા પરિણામ પત્રક (Sem 1)',
    sem2: 'દ્વિતીય સત્રાંત / વાર્ષિક પરીક્ષા પરિણામ પત્રક (Sem 2)',
    unit_test: 'એકમ કસોટી મૂલ્યાંકન પત્રક (PAT)',
  }[examType];

  return (
    <div className="space-y-4">
      {/* Top Banner and Actions (Hidden in print) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3 print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-emerald-700" />
              <span>વિદ્યાર્થી ગુણ પત્રક / પરિણામ પત્રક (SCE Progress Report)</span>
            </h2>
            <p className="text-xs text-slate-500">
              {config.schoolName} • {config.standard} ({config.division}) • સત્રાંત મૂલ્યાંકન પત્રક
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onResetAllResults && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('શું તમે ખરેખર તમામ પરિણામ / ગુણ રીસેટ/ડિલીટ કરવા માંગો છો?')) {
                    onResetAllResults();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold border border-rose-200 transition-colors cursor-pointer"
                title="તમામ ગુણ રીસેટ / ડિલીટ કરો"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                <span>પરિણામ રીસેટ</span>
              </button>
            )}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-300 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>Excel / CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>પરિણામ પત્રક પ્રિન્ટ કરો (A4)</span>
            </button>
          </div>
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* Exam Type Selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setExamType('sem1')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                examType === 'sem1'
                  ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              પ્રથમ સત્રાંત (Sem 1)
            </button>
            <button
              onClick={() => setExamType('sem2')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                examType === 'sem2'
                  ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              દ્વિતીય સત્રાંત / વાર્ષિક (Sem 2)
            </button>
            <button
              onClick={() => setExamType('unit_test')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                examType === 'unit_test'
                  ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              એકમ કસોટી (PAT)
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="વિદ્યાર્થી શોધો..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 w-48"
            />
          </div>
        </div>
      </div>

      {/* Class Overview Cards (Hidden in print) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:hidden">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium">કુલ વિદ્યાર્થીઓ</div>
          <div className="text-xl font-black text-slate-900 font-mono mt-0.5">
            {students.length}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium">વર્ગ સરેરાશ ટકાવારી</div>
          <div className="text-xl font-black text-emerald-700 font-mono mt-0.5">
            {classAvg}%
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium">પ્રથમ ક્રમાંક (1st Rank)</div>
          <div className="text-xs font-bold text-slate-900 truncate mt-1">
            {top3[0]?.student.name.split(' ')[0]} ({top3[0]?.percentage}%)
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] text-slate-500 font-medium">દ્વિતીય ક્રમાંક (2nd Rank)</div>
          <div className="text-xs font-bold text-slate-900 truncate mt-1">
            {top3[1]?.student.name.split(' ')[0]} ({top3[1]?.percentage}%)
          </div>
        </div>
      </div>

      {/* Printable Sheet Header (Visible in print) */}
      <div className="hidden print:block text-center pb-3 border-b-2 border-slate-800 mb-3">
        {config.payCenterSchool && (
          <p className="text-xs text-slate-600 font-semibold">{config.payCenterSchool}</p>
        )}
        <h2 className="text-xl font-black text-slate-950 uppercase">{config.schoolName}</h2>
        <p className="text-xs text-slate-700">
          તા. {config.taluka}, જિ. {config.district} • શાળા DISE કોડ: {config.schoolCode} • વર્ગ
          શિક્ષક કોડ: {config.teacherCode}
        </p>
        <p className="text-xs font-bold text-slate-900 mt-1">
          {examTitleGujarati} - {config.standard} ({config.division}) - શૈક્ષણિક વર્ષ:{' '}
          {config.academicYear || '૨૦૨૬-૨૭'}
        </p>
      </div>

      {/* Main Result Sheet Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden print:border-none print:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-emerald-800 text-white font-semibold print:bg-slate-200 print:text-black">
                <th className="p-2 text-center w-10">રોલ</th>
                <th className="p-2 w-14">GR નં.</th>
                <th className="p-2 min-w-[160px]">વિદ્યાર્થીનું નામ</th>
                {SUBJECT_KEYS.map((sub) => (
                  <th key={sub.key} className="p-2 text-center w-14 font-medium">
                    {sub.label}
                    <div className="text-[9px] opacity-75">(100)</div>
                  </th>
                ))}
                <th className="p-2 text-center w-16 font-bold">કુલ (700)</th>
                <th className="p-2 text-center w-14 font-bold">ટકા %</th>
                <th className="p-2 text-center w-12 font-bold">ગ્રેડ</th>
                <th className="p-2 text-center w-10 font-bold">ક્રમ</th>
                <th className="p-2 text-center w-24 print:hidden">ક્રિયા</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.map((row) => (
                <tr
                  key={row.student.id}
                  className="hover:bg-slate-50/80 transition-colors print:hover:bg-white"
                >
                  <td className="p-2 text-center font-mono font-bold text-slate-800">
                    {String(row.student.rollNo).padStart(2, '0')}
                  </td>
                  <td className="p-2 font-mono text-slate-500 text-[11px]">{row.student.grNo}</td>
                  <td className="p-2">
                    <div className="font-semibold text-slate-900">{row.student.name}</div>
                    <div className="text-[10px] text-slate-400 font-sans">{row.student.nameEn}</div>
                  </td>

                  {/* Subject Marks */}
                  <td className="p-2 text-center font-mono font-medium text-slate-700">
                    {row.marks.gujarati}
                  </td>
                  <td className="p-2 text-center font-mono font-medium text-slate-700">
                    {row.marks.mathematics}
                  </td>
                  <td className="p-2 text-center font-mono font-medium text-slate-700">
                    {row.marks.science}
                  </td>
                  <td className="p-2 text-center font-mono font-medium text-slate-700">
                    {row.marks.socialScience}
                  </td>
                  <td className="p-2 text-center font-mono font-medium text-slate-700">
                    {row.marks.english}
                  </td>
                  <td className="p-2 text-center font-mono font-medium text-slate-700">
                    {row.marks.hindi}
                  </td>
                  <td className="p-2 text-center font-mono font-medium text-slate-700">
                    {row.marks.sanskrit}
                  </td>

                  {/* Total & Percentage */}
                  <td className="p-2 text-center font-mono font-bold text-slate-900 bg-slate-50/50">
                    {row.totalMarks}
                  </td>
                  <td className="p-2 text-center font-mono font-bold text-emerald-800 bg-slate-50/50">
                    {row.percentage}%
                  </td>
                  <td className="p-2 text-center">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded font-black text-[11px] border ${row.gradeInfo.color}`}
                    >
                      {row.gradeInfo.grade}
                    </span>
                  </td>
                  <td className="p-2 text-center font-mono font-bold text-amber-800">
                    #{row.rank}
                  </td>

                  {/* Action buttons (Hidden in print) */}
                  <td className="p-2 text-center print:hidden">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => setSelectedStudentForModal(row.student)}
                        className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg text-[10px] transition-colors"
                        title="પ્રગતિ પત્રક જુઓ અને પ્રિન્ટ કરો"
                      >
                        પ્રગતિ પત્રક
                      </button>
                      <button
                        onClick={() => {
                          const current = results[row.student.id] || {
                            studentId: row.student.id,
                            examType,
                            marks: row.marks,
                            remarks: row.remarks,
                          };
                          setEditingStudentResult({ ...current, marks: { ...row.marks } });
                        }}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100"
                        title="ગુણ સુધારો"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {onDeleteResult && results[row.student.id] && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`${row.student.name} ના ગુણ / પરિણામ ડિલીટ કરવા છે?`)) {
                              onDeleteResult(row.student.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50"
                          title="આ પરિણામ ડિલીટ કરો"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Teacher / Principal Signatures for Print */}
      <div className="hidden print:flex justify-between items-end pt-12 px-6 text-xs font-semibold">
        <div className="text-center">
          <div className="w-32 border-b border-black mb-1" />
          <div>વર્ગ શિક્ષકની સહી</div>
          <div className="text-[10px] text-slate-600 font-mono">કોડ: {config.teacherCode}</div>
        </div>
        <div className="text-center">
          <div className="w-32 border-b border-black mb-1" />
          <div>આચાર્યશ્રી સહી અને શાળાનો સિક્કો</div>
        </div>
      </div>

      {/* Edit Marks Modal */}
      {editingStudentResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="bg-emerald-800 text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">વિદ્યાર્થી ગુણ સુધારો</h3>
              <button
                onClick={() => setEditingStudentResult(null)}
                className="text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onUpdateResult(editingStudentResult);
                setEditingStudentResult(null);
              }}
              className="p-5 space-y-3"
            >
              <div className="grid grid-cols-2 gap-2 text-xs">
                {SUBJECT_KEYS.map((sub) => (
                  <div key={sub.key}>
                    <label className="block text-slate-700 font-semibold mb-1">
                      {sub.label} (100)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={editingStudentResult.marks[sub.key] ?? 0}
                      onChange={(e) => {
                        const val = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                        setEditingStudentResult({
                          ...editingStudentResult,
                          marks: {
                            ...editingStudentResult.marks,
                            [sub.key]: val,
                          },
                        });
                      }}
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs text-slate-700 font-semibold mb-1">
                  વર્ગ શિક્ષકની નોંધ / રિમાર્ક્સ
                </label>
                <input
                  type="text"
                  value={editingStudentResult.remarks || ''}
                  onChange={(e) =>
                    setEditingStudentResult({
                      ...editingStudentResult,
                      remarks: e.target.value,
                    })
                  }
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingStudentResult(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold"
                >
                  સાચવો
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Individual Student Progress Report Card Modal (વાલી માટે પ્રગતિ પત્રક) */}
      {selectedStudentForModal && (() => {
        const student = selectedStudentForModal;
        const row = computedList.find((r) => r.student.id === student.id);
        if (!row) return null;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="bg-emerald-800 text-white px-5 py-3 flex items-center justify-between print:hidden">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-amber-300" />
                  <span className="font-bold text-sm">વિદ્યાર્થી પ્રગતિ પત્રક (Progress Card)</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1 px-3 py-1 bg-white text-emerald-900 rounded-lg text-xs font-bold hover:bg-emerald-50 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>પ્રિન્ટ કરો</span>
                  </button>
                  <button
                    onClick={() => setSelectedStudentForModal(null)}
                    className="text-white/80 hover:text-white p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Progress Card Content (Printable) */}
              <div className="p-6 overflow-y-auto space-y-4 text-xs">
                {/* Official School Header */}
                <div className="text-center pb-3 border-b-2 border-emerald-800 space-y-0.5">
                  <div className="text-[10px] text-emerald-800 font-bold tracking-widest uppercase">
                    ગુજરાત સરકાર • શિક્ષણ વિભાગ
                  </div>
                  <h3 className="font-black text-lg text-slate-900">{config.schoolName}</h3>
                  <p className="text-[11px] text-slate-600">
                    તા. {config.taluka}, જિ. {config.district} • શાળા DISE કોડ: {config.schoolCode}
                  </p>
                  <div className="inline-block bg-emerald-100 text-emerald-900 px-3 py-0.5 rounded-full font-bold text-xs mt-1">
                    વિદ્યાર્થી સત્રાંત મૂલ્યાંકન પત્રક • {config.academicYear || '૨૦૨૬-૨૭'}
                  </div>
                </div>

                {/* Student Info Box */}
                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <img
                    src={student.photoUrl}
                    alt={student.name}
                    className="w-16 h-16 rounded-xl object-cover border-2 border-emerald-600 shadow-2xs"
                  />
                  <div className="flex-1 space-y-0.5">
                    <div className="font-bold text-sm text-slate-900">{student.name}</div>
                    <div className="text-[11px] text-slate-500 font-sans">{student.nameEn}</div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-700 pt-1">
                      <span>ધોરણ: <strong>{config.standard} ({config.division})</strong></span>
                      <span>રોલ નં: <strong className="font-mono">#{student.rollNo}</strong></span>
                      <span>GR નં: <strong className="font-mono">{student.grNo}</strong></span>
                      <span>વર્ગમાં ક્રમ: <strong className="text-amber-800 font-mono">#{row.rank}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Subject-wise Marks Table */}
                <table className="w-full border-collapse border border-slate-300 text-center text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 font-bold">
                      <th className="border border-slate-300 p-1.5 text-left">અનુ. વિષય</th>
                      <th className="border border-slate-300 p-1.5">કુલ ગુણ</th>
                      <th className="border border-slate-300 p-1.5">પાસિંગ ગુણ</th>
                      <th className="border border-slate-300 p-1.5">મેળવેલ ગુણ</th>
                      <th className="border border-slate-300 p-1.5">ગ્રેડ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SUBJECT_KEYS.map((sub, index) => {
                      const marks = row.marks[sub.key] ?? 0;
                      const subGrade = calculateGrade(marks).grade;
                      return (
                        <tr key={sub.key}>
                          <td className="border border-slate-300 p-1.5 text-left font-medium">
                            {index + 1}. {sub.label}
                          </td>
                          <td className="border border-slate-300 p-1.5 font-mono">100</td>
                          <td className="border border-slate-300 p-1.5 font-mono">33</td>
                          <td className="border border-slate-300 p-1.5 font-mono font-bold text-slate-900">
                            {marks}
                          </td>
                          <td className="border border-slate-300 p-1.5 font-bold">{subGrade}</td>
                        </tr>
                      );
                    })}
                    <tr className="bg-emerald-50 font-bold text-emerald-950">
                      <td className="border border-slate-300 p-1.5 text-left">કુલ ગુણ અને ટકાવારી</td>
                      <td className="border border-slate-300 p-1.5 font-mono">700</td>
                      <td className="border border-slate-300 p-1.5 font-mono">231</td>
                      <td className="border border-slate-300 p-1.5 font-mono text-sm font-black">
                        {row.totalMarks}
                      </td>
                      <td className="border border-slate-300 p-1.5 text-sm font-black">
                        {row.percentage}% ({row.gradeInfo.grade})
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Overall Assessment Remarks */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div className="font-semibold text-slate-800">મૂલ્યાંકન અને નોંધ:</div>
                  <p className="text-slate-600 mt-0.5">{row.remarks}</p>
                </div>

                {/* Signatures */}
                <div className="flex justify-between items-end pt-6 text-[11px] font-semibold text-slate-700">
                  <div className="text-center">
                    <div className="w-28 border-b border-slate-400 mb-1" />
                    <div>વાલીની સહી</div>
                  </div>
                  <div className="text-center">
                    <div className="w-28 border-b border-slate-400 mb-1" />
                    <div>વર્ગ શિક્ષક ({config.teacherCode})</div>
                  </div>
                  <div className="text-center">
                    <div className="w-28 border-b border-slate-400 mb-1" />
                    <div>આચાર્યશ્રી સિક્કો</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
