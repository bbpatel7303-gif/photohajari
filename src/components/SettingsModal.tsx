import React, { useState } from 'react';
import {
  Settings,
  X,
  Save,
  Download,
  Upload,
  RotateCcw,
  Check,
  AlertTriangle,
  Camera,
} from 'lucide-react';
import { SchoolConfig } from '../types';
import { exportDataAsJSON, importDataFromJSON } from '../utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SchoolConfig;
  onSaveConfig: (config: SchoolConfig) => void;
  onResetData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onResetData,
}) => {
  const [formData, setFormData] = useState<SchoolConfig>({ ...config });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1000);
  };

  const handleExport = () => {
    const jsonStr = exportDataAsJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = (config.schoolName || 'પે_સેન્ટર_શાળા_ઢીંકવા').replace(/\s+/g, '_');
    a.download = `${safeName}_હાજરી_બેકઅપ_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result;
        if (typeof text === 'string') {
          const ok = importDataFromJSON(text);
          if (ok) {
            setImportStatus('ડેટા સફળતાપૂર્વક રીસ્ટોર થયો! પેજ રિફ્રેશ થશે...');
            setTimeout(() => {
              window.location.reload();
            }, 1200);
          } else {
            setImportStatus('ફાઇલ યોગ્ય નથી. કૃપા કરીને સાચી JSON ફાઇલ પસંદ કરો.');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">શાળા અને શિક્ષક સેટિંગ્સ</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
          {importStatus && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 font-semibold">
              {importStatus}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  શાળાનું નામ (મોટા અક્ષરે)
                </label>
                <input
                  type="text"
                  required
                  value={formData.schoolName}
                  onChange={(e) =>
                    setFormData({ ...formData, schoolName: e.target.value })
                  }
                  placeholder="દા.ત. શાળા વાંઝિયાઆંબા"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-bold text-slate-900"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  પે સેન્ટર શાળા (નાના અક્ષરે)
                </label>
                <input
                  type="text"
                  value={formData.payCenterSchool || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, payCenterSchool: e.target.value })
                  }
                  placeholder="દા.ત. પે સેન્ટર શાળા ઢીંકવા"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  શાળા DISE કોડ
                </label>
                <input
                  type="text"
                  required
                  value={formData.schoolCode}
                  onChange={(e) =>
                    setFormData({ ...formData, schoolCode: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  તાલુકો
                </label>
                <input
                  type="text"
                  value={formData.taluka}
                  onChange={(e) =>
                    setFormData({ ...formData, taluka: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  જિલ્લો
                </label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) =>
                    setFormData({ ...formData, district: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  શિક્ષક કોડ (Teacher Code)
                </label>
                <input
                  type="text"
                  required
                  value={formData.teacherCode}
                  onChange={(e) =>
                    setFormData({ ...formData, teacherCode: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ધોરણ
                </label>
                <input
                  type="text"
                  value={formData.standard}
                  onChange={(e) =>
                    setFormData({ ...formData, standard: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-bold"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  વર્ગ શિક્ષકનું નામ
                </label>
                <input
                  type="text"
                  value={formData.teacherName}
                  onChange={(e) =>
                    setFormData({ ...formData, teacherName: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-bold"
                />
              </div>

              {/* Class Teacher Photo Section */}
              <div className="col-span-2 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      formData.teacherPhotoUrl ||
                      'https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=400&auto=format&fit=crop&q=80'
                    }
                    alt={formData.teacherName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-emerald-600 shadow-2xs"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900">વર્ગ શિક્ષક ફોટો</div>
                    <div className="text-[11px] text-slate-500">
                      આઈ-કાર્ડ અને મેઈન બેનર પર દેખાશે
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="settings-teacher-photo"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold cursor-pointer shadow-2xs"
                  >
                    <Camera className="w-3.5 h-3.5 text-emerald-700" />
                    <span>ફોટો બદલો</span>
                  </label>
                  <input
                    id="settings-teacher-photo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          if (typeof reader.result === 'string') {
                            setFormData({ ...formData, teacherPhotoUrl: reader.result });
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>સેવ થઈ ગયું!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>માહિતી સાચવો</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Backup & Restore section */}
          <div className="border-t border-slate-200 pt-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              ડેટા સુરક્ષા અને બેકઅપ
            </h4>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleExport}
                className="flex items-center justify-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
              >
                <Download className="w-4 h-4 text-emerald-700" />
                <span>બેકઅપ ડાઉનલોડ</span>
              </button>

              <label className="flex items-center justify-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-blue-700" />
                <span>બેકઅપ રીસ્ટોર</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Danger zone: Reset to default */}
          <div className="border-t border-slate-200 pt-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-amber-900">
                    મૂળ ડેટા રીસેટ કરો
                  </div>
                  <div className="text-[11px] text-amber-700 mt-0.5">
                    શાળાના તમામ મૂળ વિદ્યાર્થીઓ અને ડેમો ડેટા ફરીથી લોડ કરો.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm('શું તમે મૂળ ૨૪ વિદ્યાર્થીઓ અને સેટિંગ્સ ફરી રીસેટ કરવા માંગો છો?')) {
                    onResetData();
                    onClose();
                  }
                }}
                className="px-2.5 py-1.5 bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 rounded-lg text-xs font-semibold shrink-0 cursor-pointer"
              >
                રીસેટ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
