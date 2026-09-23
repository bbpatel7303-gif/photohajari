import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  X,
  MessageCircle,
  FileText,
} from 'lucide-react';
import { Student, AttendanceStatus, SchoolConfig } from '../types';
import { formatGujaratiDate } from '../utils/storage';

interface WhatsAppShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SchoolConfig;
  currentDate: string;
  students: Student[];
  currentRecords: Record<string, AttendanceStatus>;
}

export const WhatsAppShareModal: React.FC<WhatsAppShareModalProps> = ({
  isOpen,
  onClose,
  config,
  currentDate,
  students,
  currentRecords,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Calculate statistics
  let totalBoys = 0;
  let totalGirls = 0;
  let presentBoys = 0;
  let presentGirls = 0;
  let absentBoys = 0;
  let absentGirls = 0;
  let leaveCount = 0;

  const absentList: { rollNo: number; name: string }[] = [];

  students.forEach((s) => {
    const isBoy = s.gender === 'boy';
    if (isBoy) totalBoys++;
    else totalGirls++;

    const status = currentRecords[s.id] || 'present';
    if (status === 'present') {
      if (isBoy) presentBoys++;
      else presentGirls++;
    } else if (status === 'absent') {
      if (isBoy) absentBoys++;
      else absentGirls++;
      absentList.push({ rollNo: s.rollNo, name: s.name });
    } else if (status === 'leave') {
      leaveCount++;
    }
  });

  const totalStudents = students.length;
  const totalPresent = presentBoys + presentGirls;
  const totalAbsent = absentBoys + absentGirls;
  const attendanceRate =
    totalStudents > 0 ? ((totalPresent / totalStudents) * 100).toFixed(1) : '0';

  const dateFormatted = formatGujaratiDate(currentDate);

  // Gujarat Primary School Standard WhatsApp Report Template
  const reportText = `*દૈનિક ઓનલાઇન હાજરી રિપોર્ટ*
━━━━━━━━━━━━━━━━━━━━
🏫 *શાળા:* ${config.schoolName}
🏛️ *પે સેન્ટર:* ${config.payCenterSchool || 'પે સેન્ટર શાળા ઢીંકવા'}
📍 *તાલુકો:* ${config.taluka} | *જિલ્લો:* ${config.district}
🔢 *DISE કોડ:* ${config.schoolCode}
👨‍🏫 *વર્ગ શિક્ષક કોડ:* ${config.teacherCode}
📚 *વર્ગ:* ${config.standard} (વર્ગખંડ: ${config.division})
📅 *તારીખ:* ${dateFormatted}
━━━━━━━━━━━━━━━━━━━━
👥 *કુલ સંખ્યા:* ${totalStudents} (કુમાર: ${totalBoys}, કન્યા: ${totalGirls})
✅ *હાજર સંખ્યા:* ${totalPresent} (કુમાર: ${presentBoys}, કન્યા: ${presentGirls})
❌ *ગેરહાજર:* ${totalAbsent} (કુમાર: ${absentBoys}, કન્યા: ${absentGirls})
🟡 *રજા:* ${leaveCount}
📊 *હાજરી ટકાવારી:* ${attendanceRate}%
━━━━━━━━━━━━━━━━━━━━
${
  absentList.length > 0
    ? `🔴 *ગેરહાજર વિદ્યાર્થી યાદી:*\n${absentList
        .map((a, idx) => `${idx + 1}. રોલ નં. ${String(a.rollNo).padStart(2, '0')} - ${a.name}`)
        .join('\n')}\n━━━━━━━━━━━━━━━━━━━━`
    : `✨ *તમામ વિદ્યાર્થીઓ હાજર છે (૧૦૦% હાજરી)*\n━━━━━━━━━━━━━━━━━━━━`
}
📌 નોંધ: વાલી સાથે ટેલિફોનિક સંપર્ક ચાલુ છે.
- ${config.teacherName}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = reportText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleOpenWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(reportText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Share2 className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">વોટ્સએપ હાજરી રીપોર્ટ</h3>
              <p className="text-xs text-emerald-200">CRC / BRC / ગૃપ માટે તૈયાર મેસેજ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Report Preview */}
        <div className="p-5 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-h-72 overflow-y-auto font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed shadow-inner">
            {reportText}
          </div>

          {/* Quick Summary Pill Bar */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-emerald-50 text-emerald-900 border border-emerald-200 p-2 rounded-xl">
              <div className="font-semibold">હાજર</div>
              <div className="text-base font-bold">{totalPresent}</div>
            </div>
            <div className="bg-red-50 text-red-900 border border-red-200 p-2 rounded-xl">
              <div className="font-semibold">ગેરહાજર</div>
              <div className="text-base font-bold">{totalAbsent}</div>
            </div>
            <div className="bg-blue-50 text-blue-900 border border-blue-200 p-2 rounded-xl">
              <div className="font-semibold">ટકાવારી</div>
              <div className="text-base font-bold">{attendanceRate}%</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button
              onClick={handleOpenWhatsApp}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>વોટ્સએપ પર મોકલો</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 rounded-xl font-bold text-sm border border-slate-300 transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">કોપી થઈ ગયું!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-600" />
                  <span>ટેક્સ્ટ કોપી કરો</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
