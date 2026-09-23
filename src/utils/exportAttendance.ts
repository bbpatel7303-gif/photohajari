import { Student, AttendanceStatus, SchoolConfig, Teacher } from '../types';
import { formatGujaratiDate } from './storage';

export interface DailyExportData {
  students: Student[];
  currentRecords: Record<string, AttendanceStatus>;
  config: SchoolConfig;
  currentDate: string;
  allStudents?: Student[];
  allRecords?: Record<string, { studentId: string; status: AttendanceStatus }>;
  teachers?: Teacher[];
  exportAllStandards?: boolean;
}

/**
 * Generates and downloads a CSV file for daily attendance.
 * Uses UTF-8 BOM (\uFEFF) to ensure Gujarati font displays properly in MS Excel and Google Sheets.
 */
export function downloadDailyAttendanceCSV(data: DailyExportData): void {
  const {
    students,
    currentRecords,
    config,
    currentDate,
    allStudents = [],
    teachers = [],
    exportAllStandards = false,
  } = data;

  const formattedDate = formatGujaratiDate(currentDate);
  let csv = '';

  // 1. School & Pay Center Header
  csv += `"${config.schoolName || 'શાળા વાંઝિયાઆંબા'}"\n`;
  if (config.payCenterSchool) {
    csv += `"પે સેન્ટર: ${config.payCenterSchool}"\n`;
  }
  csv += `"શિક્ષણ વિભાગ, ગુજરાત રાજ્ય"\n`;
  csv += `"તાલુકો: ${config.taluka || 'હાલોલ'}", "જિલ્લો: ${config.district || 'પંચમહાલ'}", "શાળા DISE કોડ: ${config.schoolCode || '24170302402'}"\n`;
  csv += `"તારીખ: ${formattedDate} (${currentDate})"\n`;

  if (!exportAllStandards) {
    // Single Standard CSV
    csv += `"ધોરણ: ${config.standard || 'ધોરણ ૬'} (${config.division || 'અ'})", "વર્ગ શિક્ષક: ${config.teacherName || 'શ્રી બી. બી. પટેલ'}", "શિક્ષક કોડ: ${config.teacherCode || '10069036'}", "મોબાઇલ: ${config.teacherPhone || '9099662933'}", "ઈમેલ: ${config.teacherEmail || 'bbpatel7303@gmail.com'}"\n\n`;

    // Attendance Summary
    const total = students.length;
    let present = 0;
    let absent = 0;
    let leave = 0;
    let boysPresent = 0;
    let girlsPresent = 0;
    let boysTotal = 0;
    let girlsTotal = 0;
    const absentRolls: number[] = [];

    students.forEach((s) => {
      const isBoy = s.gender === 'boy';
      if (isBoy) boysTotal++;
      else girlsTotal++;

      const st = currentRecords[s.id] || 'present';
      if (st === 'present') {
        present++;
        if (isBoy) boysPresent++;
        else girlsPresent++;
      } else if (st === 'absent') {
        absent++;
        absentRolls.push(s.rollNo);
      } else if (st === 'leave') {
        leave++;
      }
    });

    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : '0';

    csv += `"-- દૈનિક હાજરી સારાંશ --"\n`;
    csv += `"કુલ વિદ્યાર્થીઓ: ${total}", "હાજર સંખ્યા: ${present}", "ગેરહાજર સંખ્યા: ${absent}", "રજા સંખ્યા: ${leave}", "હાજરી ટકાવારી: ${percentage}%"\n`;
    csv += `"કુમાર હાજર: ${boysPresent}/${boysTotal}", "કન્યા હાજર: ${girlsPresent}/${girlsTotal}", "ગેરહાજર રોલ નં: ${absentRolls.join(', ') || 'કોઈ નહીં'}"\n\n`;

    // Table Data
    csv += `"ક્રમ","રોલ નં","G.R. નં","વિદ્યાર્થીનું નામ","અંગ્રેજી નામ","જાતિ","મોબાઇલ નંબર","આજની હાજરી સ્થિતિ","શિક્ષકની નોંધ"\n`;

    students.forEach((s, idx) => {
      const st = currentRecords[s.id] || 'present';
      const statusText =
        st === 'present' ? 'હાજર (Present)' : st === 'absent' ? 'ગેરહાજર (Absent)' : 'રજા (Leave)';
      const genderText = s.gender === 'boy' ? 'કુમાર' : 'કન્યા';

      csv += `${idx + 1},${s.rollNo},"${s.grNo || ''}","${s.name.replace(/"/g, '""')}","${(s.nameEn || '').replace(/"/g, '""')}","${genderText}","${s.parentPhone || ''}","${statusText}",""\n`;
    });

    csv += `\n"પ્રમાણપત્ર: પ્રમાણિત કરવામાં આવે છે કે આજની તારીખે ઉપર દર્શાવેલ વિદ્યાર્થીઓની હાજરી ચકાસીને નોંધ કરેલ છે."\n`;
    csv += `"વર્ગ શિક્ષકની સહી: ________________________", "મુખ્ય શિક્ષકની સહી અને સિક્કો: ________________________"\n`;
  } else {
    // All 8 Standards Consolidated CSV
    csv += `"સંપૂર્ણ શાળા હાજરી અહેવાલ (ધોરણ ૧ થી ૮)"\n\n`;

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

    csv += `"-- ધોરણવાર હાજરી સારાંશ (Standard-wise Summary) --"\n`;
    csv += `"ધોરણ","વર્ગ શિક્ષક","મોબાઇલ નંબર","કુલ સંખ્યા","હાજર","ગેરહાજર","રજા","હાજરી ટકાવારી"\n`;

    let grandTotal = 0;
    let grandPresent = 0;
    let grandAbsent = 0;
    let grandLeave = 0;

    standardsList.forEach((std) => {
      const stdStudents = allStudents.filter((s) => s.standard === std);
      const teacher = teachers.find((t) => t.standard === std);
      const tName = teacher?.name || 'વર્ગ શિક્ષક';
      const tPhone = teacher?.phone || '';

      let stdPresent = 0;
      let stdAbsent = 0;
      let stdLeave = 0;

      stdStudents.forEach((s) => {
        const st = currentRecords[s.id] || 'present';
        if (st === 'present') stdPresent++;
        else if (st === 'absent') stdAbsent++;
        else if (st === 'leave') stdLeave++;
      });

      const stdTotal = stdStudents.length;
      const stdPct = stdTotal > 0 ? ((stdPresent / stdTotal) * 100).toFixed(1) : '0';

      grandTotal += stdTotal;
      grandPresent += stdPresent;
      grandAbsent += stdAbsent;
      grandLeave += stdLeave;

      csv += `"${std}","${tName}","${tPhone}",${stdTotal},${stdPresent},${stdAbsent},${stdLeave},"${stdPct}%"\n`;
    });

    const grandPct = grandTotal > 0 ? ((grandPresent / grandTotal) * 100).toFixed(1) : '0';
    csv += `"કુલ (સંપૂર્ણ શાળા)","--","--",${grandTotal},${grandPresent},${grandAbsent},${grandLeave},"${grandPct}%"\n\n`;

    // Detailed lists for each standard
    standardsList.forEach((std) => {
      const stdStudents = allStudents.filter((s) => s.standard === std);
      if (stdStudents.length === 0) return;

      const teacher = teachers.find((t) => t.standard === std);
      csv += `"-- ${std} વિગતવાર હાજરી (વર્ગ શિક્ષક: ${teacher?.name || ''}) --"\n`;
      csv += `"ક્રમ","રોલ નં","G.R. નં","વિદ્યાર્થીનું નામ","જાતિ","મોબાઇલ","આજની હાજરી"\n`;

      stdStudents.forEach((s, idx) => {
        const st = currentRecords[s.id] || 'present';
        const statusText =
          st === 'present' ? 'હાજર' : st === 'absent' ? 'ગેરહાજર' : 'રજા';
        const genderText = s.gender === 'boy' ? 'કુમાર' : 'કન્યા';
        csv += `${idx + 1},${s.rollNo},"${s.grNo || ''}","${s.name.replace(/"/g, '""')}","${genderText}","${s.parentPhone || ''}","${statusText}"\n`;
      });
      csv += `\n`;
    });

    csv += `"મુખ્ય શિક્ષક: ${config.teacherName || 'શ્રી બી. બી. પટેલ'}", "મોબાઇલ: ${config.teacherPhone || '9099662933'}"\n`;
    csv += `"મુખ્ય શિક્ષકની સહી અને સિક્કો: ________________________", "તારીખ: ${currentDate}"\n`;
  }

  // UTF-8 BOM \uFEFF to preserve Gujarati script in MS Excel
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;

  const schoolClean = (config.schoolName || 'School').replace(/\s+/g, '_');
  const scopeClean = exportAllStandards
    ? 'સંપૂર્ણ_શાળા_ધોરણ_૧થી૮'
    : (config.standard || 'Std').replace(/\s+/g, '_');

  link.download = `${schoolClean}_${scopeClean}_દૈનિક_હાજરી_${currentDate}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
