import React, { useState } from 'react';
import {
  GraduationCap,
  Check,
  X,
  Plus,
  Edit3,
  Layers,
  Sparkles,
} from 'lucide-react';
import { SchoolConfig } from '../types';

interface ClassSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SchoolConfig;
  onSaveConfig: (updatedConfig: SchoolConfig) => void;
}

const DEFAULT_STANDARDS = [
  'ધોરણ ૧',
  'ધોરણ ૨',
  'ધોરણ ૩',
  'ધોરણ ૪',
  'ધોરણ ૫',
  'ધોરણ ૬',
  'ધોરણ ૭',
  'ધોરણ ૮',
];

const DIVISIONS = ['અ', 'બ', 'ક', 'ડ'];

export const ClassSelectorModal: React.FC<ClassSelectorModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const availableStandards = config.availableStandards || DEFAULT_STANDARDS;
  const [selectedStandard, setSelectedStandard] = useState(config.standard || 'ધોરણ ૬');
  const [selectedDivision, setSelectedDivision] = useState(config.division || 'અ');
  const [customStandardName, setCustomStandardName] = useState('');
  const [showAddCustom, setShowAddCustom] = useState(false);

  if (!isOpen) return null;

  const handleApply = (std: string, div: string) => {
    const teacher = config.teachers?.find((t) => t.standard === std);
    const updated: SchoolConfig = {
      ...config,
      standard: std,
      division: div,
      ...(teacher
        ? {
            teacherName: teacher.name,
            teacherCode: teacher.teacherCode,
            teacherPhone: teacher.phone,
            teacherEmail: teacher.email,
            teacherPhotoUrl: teacher.photoUrl,
          }
        : {}),
    };
    onSaveConfig(updated);
    onClose();
  };

  const handleAddCustomStandard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customStandardName.trim()) return;
    const std = customStandardName.trim();
    const updatedList = Array.from(new Set([...availableStandards, std]));
    const updated: SchoolConfig = {
      ...config,
      standard: std,
      division: selectedDivision,
      availableStandards: updatedList,
    };
    onSaveConfig(updated);
    setSelectedStandard(std);
    setCustomStandardName('');
    setShowAddCustom(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-4.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-amber-300 border border-white/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">ધોરણ અને વર્ગ પસંદ કરો</h3>
              <p className="text-[10px] text-emerald-200">
                {config.schoolName} • {config.payCenterSchool || 'પે સેન્ટર શાળા ઢીંકવા'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Active Class Highlight */}
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">
                હાલ પસંદ કરેલ વર્ગખંડ:
              </span>
              <div className="font-black text-slate-900 text-base flex items-center gap-2">
                <span>{config.standard}</span>
                <span className="bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-md">
                  વર્ગ: {config.division}
                </span>
              </div>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {config.academicYear || '૨૦૨૬-૨૭'}
            </span>
          </div>

          {/* Quick Standards Grid (ધોરણ ૧ થી ૮) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              ધોરણ પસંદ કરો (Select Standard):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {availableStandards.map((std) => {
                const isSelected = selectedStandard === std;
                const teacher = config.teachers?.find((t) => t.standard === std);
                return (
                  <button
                    key={std}
                    type="button"
                    onClick={() => {
                      setSelectedStandard(std);
                      handleApply(std, selectedDivision);
                    }}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 border cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-700 text-white border-emerald-800 shadow-md ring-2 ring-emerald-400/40 scale-[1.02]'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span>{std}</span>
                      {isSelected && (
                        <span className="text-[9px] bg-white/20 text-white px-1.5 rounded-full">
                          સક્રિય
                        </span>
                      )}
                    </div>
                    {teacher && (
                      <span
                        className={`text-[10px] truncate max-w-full font-medium ${
                          isSelected ? 'text-emerald-100' : 'text-slate-500'
                        }`}
                      >
                        {teacher.name.replace('શ્રીમતી ', '').replace('શ્રી ', '')}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Division Selector */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 block">
              વર્ગ / શાખા (Division):
            </label>
            <div className="flex items-center gap-2">
              {DIVISIONS.map((div) => {
                const isSelected = selectedDivision === div;
                return (
                  <button
                    key={div}
                    type="button"
                    onClick={() => {
                      setSelectedDivision(div);
                      handleApply(selectedStandard, div);
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    વર્ગ '{div}'
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add custom standard toggle */}
          <div className="pt-2 border-t border-slate-100">
            {!showAddCustom ? (
              <button
                type="button"
                onClick={() => setShowAddCustom(true)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>અન્ય નવું ધોરણ ઉમેરો (દા.ત. બાલવાટિકા, ધોરણ ૯)</span>
              </button>
            ) : (
              <form onSubmit={handleAddCustomStandard} className="space-y-2">
                <input
                  type="text"
                  required
                  placeholder="નવા ધોરણનું નામ (દા.ત. બાલવાટિકા / પ્રી-પ્રાયમરી)"
                  value={customStandardName}
                  onChange={(e) => setCustomStandardName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddCustom(false)}
                    className="flex-1 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-xl"
                  >
                    રદ કરો
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-1.5 bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-emerald-800 cursor-pointer"
                  >
                    ઉમેરો અને લાગુ કરો
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
