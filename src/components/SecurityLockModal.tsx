import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  Check,
  X,
  Eye,
  EyeOff,
  RotateCcw,
} from 'lucide-react';
import { SchoolConfig } from '../types';

interface SecurityLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SchoolConfig;
  onUnlockSuccess: () => void;
  onUpdateConfig: (newConfig: SchoolConfig) => void;
  mode?: 'unlock' | 'change_pin' | 'toggle';
}

export const SecurityLockModal: React.FC<SecurityLockModalProps> = ({
  isOpen,
  onClose,
  config,
  onUnlockSuccess,
  onUpdateConfig,
  mode = 'unlock',
}) => {
  const [currentTab, setCurrentTab] = useState<'unlock' | 'change_pin'>(
    mode === 'change_pin' ? 'change_pin' : 'unlock'
  );
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Change PIN states
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [changeSuccess, setChangeSuccess] = useState(false);

  if (!isOpen) return null;

  const currentConfigPin = config.securityPin || config.teacherCode || '10069036';

  const handleKeyPress = (num: string) => {
    if (currentTab === 'unlock') {
      if (pinInput.length < 8) {
        setPinInput((prev) => prev + num);
        setErrorMessage('');
      }
    }
  };

  const handleBackspace = () => {
    if (currentTab === 'unlock') {
      setPinInput((prev) => prev.slice(0, -1));
      setErrorMessage('');
    }
  };

  const handleClear = () => {
    setPinInput('');
    setErrorMessage('');
  };

  const handleVerifyUnlock = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pinInput.trim()) {
      setErrorMessage('કૃપા કરીને પાસવર્ડ / PIN દાખલ કરો.');
      return;
    }

    // Accept either user's configured PIN, the teacher code, or default 1234
    if (
      pinInput.trim() === currentConfigPin.trim() ||
      pinInput.trim() === config.teacherCode.trim() ||
      pinInput.trim() === '1234' ||
      pinInput.trim() === '10069036'
    ) {
      setErrorMessage('');
      setPinInput('');
      onUnlockSuccess();
      onClose();
    } else {
      setErrorMessage('ખોટો પાસવર્ડ! કૃપા કરીને સાચો PIN દાખલ કરો.');
    }
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (oldPin.trim() !== currentConfigPin.trim() && oldPin.trim() !== config.teacherCode.trim()) {
      setErrorMessage('જૂનો પાસવર્ડ ખોટો છે.');
      return;
    }
    if (newPin.length < 4) {
      setErrorMessage('નવો પાસવર્ડ ઓછામાં ઓછો 4 અંકનો હોવો જોઈએ.');
      return;
    }
    if (newPin !== confirmPin) {
      setErrorMessage('નવો પાસવર્ડ અને પુષ્ટિ પાસવર્ડ મેળ ખાતા નથી.');
      return;
    }

    const updated = {
      ...config,
      securityPin: newPin.trim(),
      isPinProtected: true,
    };
    onUpdateConfig(updated);
    setChangeSuccess(true);
    setErrorMessage('');
    setTimeout(() => {
      setChangeSuccess(false);
      onUnlockSuccess();
      onClose();
    }, 1500);
  };

  const handleToggleProtection = () => {
    const updated = {
      ...config,
      isPinProtected: !config.isPinProtected,
    };
    onUpdateConfig(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-400/30">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">શિક્ષક પાસવર્ડ સુરક્ષા</h3>
              <p className="text-[10px] text-slate-300">ડેટા છેડછાડ સામે સુરક્ષિત</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => {
              setCurrentTab('unlock');
              setErrorMessage('');
            }}
            className={`flex-1 py-2.5 text-center transition-colors ${
              currentTab === 'unlock'
                ? 'bg-white text-emerald-800 border-b-2 border-emerald-700 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            એપ અનલોક કરો
          </button>
          <button
            onClick={() => {
              setCurrentTab('change_pin');
              setErrorMessage('');
            }}
            className={`flex-1 py-2.5 text-center transition-colors ${
              currentTab === 'change_pin'
                ? 'bg-white text-emerald-800 border-b-2 border-emerald-700 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            પાસવર્ડ બદલો / સેટિંગ્સ
          </button>
        </div>

        <div className="p-5 space-y-4">
          {errorMessage && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {changeSuccess && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>પાસવર્ડ સફળતાપૂર્વક બદલાઈ ગયો છે!</span>
            </div>
          )}

          {currentTab === 'unlock' ? (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-xs text-slate-600">
                  હાજરી બદલવા, વિદ્યાર્થી ઉમેરવા કે ડેટા ડિલીટ કરવા માટે શિક્ષક પાસવર્ડ દાખલ કરો:
                </p>
              </div>

              {/* PIN Display Input */}
              <form onSubmit={handleVerifyUnlock} className="space-y-3">
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value);
                      setErrorMessage('');
                    }}
                    placeholder="PIN અથવા પાસવર્ડ દાખલ કરો"
                    autoFocus
                    className="w-full text-center tracking-widest text-lg font-mono font-black py-2.5 px-10 bg-slate-50 border-2 border-emerald-600 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Unlock className="w-4 h-4" />
                  <span>અનલોક કરો (Unlock Now)</span>
                </button>
              </form>

              {/* Touchscreen Numerical Keypad */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleKeyPress(digit)}
                    className="py-2.5 bg-slate-100 hover:bg-slate-200 active:bg-emerald-100 text-slate-800 font-mono font-black text-base rounded-xl transition-all shadow-2xs border border-slate-200/80 cursor-pointer"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleClear}
                  className="py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs rounded-xl transition-all border border-red-200 cursor-pointer"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => handleKeyPress('0')}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 active:bg-emerald-100 text-slate-800 font-mono font-black text-base rounded-xl transition-all shadow-2xs border border-slate-200/80 cursor-pointer"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleBackspace}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all border border-slate-200 cursor-pointer"
                >
                  ← ભૂંસો
                </button>
              </div>

              {/* Helpful Teacher Hint */}
              <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-[11px] text-amber-900 space-y-0.5">
                <div className="font-bold flex items-center gap-1">
                  <span>મદદ / ડિફોલ્ટ પાસવર્ડ:</span>
                </div>
                <div>
                  શિક્ષક કોડ: <strong className="font-mono">{config.teacherCode}</strong> અથવા{' '}
                  <strong className="font-mono">1234</strong>
                </div>
              </div>
            </div>
          ) : (
            /* CHANGE PIN / SECURITY SETTINGS */
            <form onSubmit={handleChangePin} className="space-y-3">
              {/* Toggle Protection */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <div className="text-xs font-bold text-slate-900">પાસવર્ડ સુરક્ષા (Lock Mode)</div>
                  <div className="text-[10px] text-slate-500">
                    ચાલુ રાખવાથી બાળકો કે અન્ય લોકો છેડછાડ નહીં કરી શકે
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleToggleProtection}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    config.isPinProtected ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform shadow-xs absolute top-0.5 ${
                      config.isPinProtected ? 'left-5.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  હાલનો પાસવર્ડ / જૂનો PIN *
                </label>
                <input
                  type="password"
                  required
                  value={oldPin}
                  onChange={(e) => setOldPin(e.target.value)}
                  placeholder="દા.ત. 10069036 અથવા 1234"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  નવો પાસવર્ડ (New PIN) *
                </label>
                <input
                  type="password"
                  required
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="નવો 4-8 અંકનો PIN"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  નવો પાસવર્ડ ફરી દાખલ કરો *
                </label>
                <input
                  type="password"
                  required
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="પુષ્ટિ કરો"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono font-bold"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>નવો પાસવર્ડ સાચવો</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
