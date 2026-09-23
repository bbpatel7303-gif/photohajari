import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Plus,
  Camera,
  Upload,
  Share2,
  Trash2,
  Edit2,
  Tag,
  Sparkles,
  Users,
  Search,
  Filter,
  Check,
  X,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { ClassActivity, ActivityCategory, SchoolConfig } from '../types';
import { formatGujaratiDate, getTodayDateString } from '../utils/storage';

interface ActivitiesViewProps {
  activities: ClassActivity[];
  config: SchoolConfig;
  onAddActivity: (activity: ClassActivity) => void;
  onUpdateActivity: (activity: ClassActivity) => void;
  onDeleteActivity: (activityId: string) => void;
}

const CATEGORY_MAP: Record<
  ActivityCategory,
  { label: string; color: string; badgeBg: string }
> = {
  science: {
    label: 'વિજ્ઞાન પ્રયોગ (Science)',
    color: 'text-blue-700',
    badgeBg: 'bg-blue-50 text-blue-800 border-blue-200',
  },
  academic: {
    label: 'શૈક્ષણિક પ્રવૃત્તિ (Academic)',
    color: 'text-emerald-700',
    badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  balsabha: {
    label: 'બાલસભા / વક્તૃત્વ (Bal Sabha)',
    color: 'text-amber-700',
    badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  sports: {
    label: 'રમત-ગમત (Sports)',
    color: 'text-purple-700',
    badgeBg: 'bg-purple-50 text-purple-800 border-purple-200',
  },
  cleanliness: {
    label: 'સ્વચ્છતા / પર્યાવરણ (Cleanliness)',
    color: 'text-teal-700',
    badgeBg: 'bg-teal-50 text-teal-800 border-teal-200',
  },
  cultural: {
    label: 'સાંસ્કૃતિક / ઉત્સવ (Cultural)',
    color: 'text-rose-700',
    badgeBg: 'bg-rose-50 text-rose-800 border-rose-200',
  },
  other: {
    label: 'અન્ય પ્રવૃત્તિ (Other)',
    color: 'text-slate-700',
    badgeBg: 'bg-slate-50 text-slate-800 border-slate-200',
  },
};

export const ActivityFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (activity: ClassActivity) => void;
  initialData?: ClassActivity | null;
}> = ({ isOpen, onClose, onSave, initialData }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [date, setDate] = useState(initialData?.date || getTodayDateString());
  const [category, setCategory] = useState<ActivityCategory>(
    initialData?.category || 'academic'
  );
  const [description, setDescription] = useState(initialData?.description || '');
  const [studentsCount, setStudentsCount] = useState<number>(
    initialData?.studentsCount || 24
  );
  const [photoUrl, setPhotoUrl] = useState(
    initialData?.photoUrl ||
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80'
  );
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('ફોટો 5MB થી નાનો હોવો જોઈએ.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPhotoUrl(reader.result);
          setError('');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('કૃપા કરીને શીર્ષક અને વિગતવાર નોંધ દાખલ કરો.');
      return;
    }

    const activity: ClassActivity = {
      id: initialData?.id || `act-${Date.now()}`,
      title: title.trim(),
      date,
      category,
      description: description.trim(),
      photoUrl,
      studentsCount: Number(studentsCount) || 24,
      highlight: initialData?.highlight || false,
    };

    onSave(activity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-base">
              {initialData ? 'વર્ગ પ્રવૃત્તિ સુધારો' : 'નવી વર્ગ પ્રવૃત્તિ ઉમેરો'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-2.5 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              પ્રવૃત્તિનું શીર્ષક (નામ) *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="દા.ત. વિજ્ઞાન પ્રયોગ: ચુંબકીય બળ અને દિશા સૂચન"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                તારીખ (Date) *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                પ્રવૃત્તિનો પ્રકાર (Category)
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ActivityCategory)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              >
                {Object.entries(CATEGORY_MAP).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              પ્રવૃત્તિનો ફોટો (Class Activity Photo)
            </label>
            <div className="flex items-center gap-3">
              <img
                src={photoUrl}
                alt="પ્રવૃત્તિ ફોટો"
                className="w-20 h-16 rounded-xl object-cover border border-slate-300 shadow-2xs"
              />
              <label
                htmlFor="activity-photo-upload"
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-emerald-700" />
                <span>ફોટો અપલોડ કરો / કેમેરા</span>
                <input
                  id="activity-photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              વિગતવાર અહેવાલ / નોંધ (Description) *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="પ્રવૃત્તિમાં વિદ્યાર્થીઓએ શું શીખ્યું? કઈ સામગ્રી વાપરી? પ્રત્યક્ષ અનુભવ કેવો રહ્યો તેની નોંધ લખો..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              સહભાગી વિદ્યાર્થીઓની સંખ્યા
            </label>
            <input
              type="number"
              min={1}
              value={studentsCount}
              onChange={(e) => setStudentsCount(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              રદ કરો
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>પ્રવૃત્તિ સાચવો</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ActivitiesView: React.FC<ActivitiesViewProps> = ({
  activities,
  config,
  onAddActivity,
  onUpdateActivity,
  onDeleteActivity,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ClassActivity | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter activities
  const filteredActivities = useMemo(() => {
    return activities
      .filter((act) => {
        if (selectedCategory !== 'all' && act.category !== selectedCategory) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          return (
            act.title.toLowerCase().includes(q) ||
            act.description.toLowerCase().includes(q) ||
            act.date.includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1)); // latest date first
  }, [activities, selectedCategory, searchQuery]);

  // Share activity to WhatsApp
  const handleShareToWhatsApp = (act: ClassActivity) => {
    const message = `*શાળા પ્રવૃત્તિ અહેવાલ*
🏫 *શાળા:* ${config.schoolName} (તા. ${config.taluka}, જિ. ${config.district})
🔢 *DISE:* ${config.schoolCode} | *શિક્ષક કોડ:* ${config.teacherCode}
📚 *વર્ગ:* ${config.standard} (${config.division})
📅 *તારીખ:* ${formatGujaratiDate(act.date)}
📌 *પ્રવૃત્તિ:* ${act.title}
👥 *ભાગ લેનાર બાળકો:* ${act.studentsCount || 24}
---------------------------------
📝 *વિગત:*
${act.description}
---------------------------------
- ${config.teacherName}`;

    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleCopyText = (act: ClassActivity) => {
    const message = `*શાળા પ્રવૃત્તિ અહેવાલ*
🏫 શાળા: ${config.schoolName}
📅 તારીખ: ${formatGujaratiDate(act.date)}
📌 પ્રવૃત્તિ: ${act.title}
📝 વિગત: ${act.description}`;

    navigator.clipboard.writeText(message);
    setCopiedId(act.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Header and Add Button */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-700" />
            <span>ધોરણ ૬ દૈનિક વર્ગ પ્રવૃત્તિઓ (Class Activities Diary)</span>
          </h2>
          <p className="text-xs text-slate-500">
            તારીખ વાઇઝ પ્રવૃત્તિઓની નોંધ, ફોટોગ્રાફ્સ અને રિપોર્ટિંગ (કુલ {activities.length} પ્રવૃત્તિઓ નોંધાયેલી છે)
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>નવી પ્રવૃત્તિ ઉમેરો</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="પ્રવૃત્તિ અથવા તારીખથી શોધો..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-800"
            />
          </div>

          {/* Quick Stats count */}
          <div className="text-xs text-slate-500 font-medium px-1">
            દર્શાવેલ: <strong className="text-slate-800">{filteredActivities.length}</strong> પ્રવૃત્તિ
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-lg font-medium transition-all shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            બધી ({activities.length})
          </button>
          {Object.entries(CATEGORY_MAP).map(([key, val]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-3 py-1 rounded-lg font-medium transition-all shrink-0 ${
                selectedCategory === key
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {val.label.split(' ')[0]} (
              {activities.filter((a) => a.category === key).length})
            </button>
          ))}
        </div>
      </div>

      {/* Activities Timeline / Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredActivities.map((act) => {
          const categoryInfo = CATEGORY_MAP[act.category] || CATEGORY_MAP.academic;

          return (
            <div
              key={act.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group"
            >
              <div>
                {/* Photo if present */}
                {act.photoUrl && (
                  <div className="relative w-full h-48 overflow-hidden bg-slate-100">
                    <img
                      src={act.photoUrl}
                      alt={act.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border shadow-xs backdrop-blur-md ${categoryInfo.badgeBg}`}
                      >
                        {categoryInfo.label}
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[11px] px-2.5 py-0.5 rounded-full backdrop-blur-xs flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3 text-emerald-300" />
                      <span>{formatGujaratiDate(act.date)}</span>
                    </div>
                  </div>
                )}

                <div className="p-4 space-y-2">
                  {!act.photoUrl && (
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${categoryInfo.badgeBg}`}
                      >
                        {categoryInfo.label}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        {formatGujaratiDate(act.date)}
                      </span>
                    </div>
                  )}

                  <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                    {act.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {act.description}
                  </p>

                  <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      <span>{act.studentsCount || 24} વિદ્યાર્થીઓ સહભાગી</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleShareToWhatsApp(act)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>WhatsApp શેર</span>
                  </button>

                  <button
                    onClick={() => handleCopyText(act)}
                    className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs"
                    title="અહેવાલ કોપી કરો"
                  >
                    {copiedId === act.id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingActivity(act)}
                    className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="સુધારો"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('શું તમે આ પ્રવૃત્તિ કાઢી નાખવા માંગો છો?')) {
                        onDeleteActivity(act.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="કાઢી નાખો"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredActivities.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-sm">
          કોઈ પ્રવૃત્તિ મળી નથી. નવી પ્રવૃત્તિ ઉમેરવા માટે ઉપરનું બટન દબાવો.
        </div>
      )}

      {/* Add / Edit Activity Modal */}
      {isAddModalOpen && (
        <ActivityFormModal
          isOpen={true}
          onClose={() => setIsAddModalOpen(false)}
          onSave={onAddActivity}
        />
      )}

      {editingActivity && (
        <ActivityFormModal
          isOpen={true}
          onClose={() => setEditingActivity(null)}
          onSave={onUpdateActivity}
          initialData={editingActivity}
        />
      )}
    </div>
  );
};
