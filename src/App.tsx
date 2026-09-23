import React, { useState, useMemo, useEffect } from 'react';
import {
  Student,
  AttendanceRecord,
  AttendanceStatus,
  SchoolConfig,
  ViewTab,
  ClassActivity,
  StudentResult,
} from './types';
import {
  loadStudents,
  saveStudents,
  loadSchoolConfig,
  saveSchoolConfig,
  loadAllAttendanceRecords,
  saveDayAttendance,
  deleteDayAttendance,
  getTodayDateString,
  formatGujaratiDate,
  loadActivities,
  saveActivities,
  loadResults,
  saveResults,
  deleteResultRecord,
  resetAllResults,
} from './utils/storage';
import { playAttendanceSound } from './utils/audio';
import { Header } from './components/Header';
import { SchoolBanner } from './components/SchoolBanner';
import { DailyAttendanceView } from './components/DailyAttendanceView';
import { MonthlyRegisterView } from './components/MonthlyRegisterView';
import { IdCardView } from './components/IdCardView';
import { ActivitiesView } from './components/ActivitiesView';
import { ResultPatrakView } from './components/ResultPatrakView';
import { WhatsAppShareModal } from './components/WhatsAppShareModal';
import { StudentManagerView, StudentFormModal } from './components/StudentManagerView';
import { SettingsModal } from './components/SettingsModal';
import { ClassSelectorModal } from './components/ClassSelectorModal';
import { SecurityLockModal } from './components/SecurityLockModal';
import { TeachersModal } from './components/TeachersModal';
import { DEFAULT_STUDENTS, DEFAULT_SCHOOL_CONFIG } from './data/defaultStudents';

export default function App() {
  const [config, setConfig] = useState<SchoolConfig>(() => loadSchoolConfig());
  const [students, setStudents] = useState<Student[]>(() => loadStudents());
  const [records, setRecords] = useState<Record<string, AttendanceRecord>>(() =>
    loadAllAttendanceRecords()
  );
  const [activities, setActivities] = useState<ClassActivity[]>(() => loadActivities());
  const [results, setResults] = useState<Record<string, StudentResult>>(() => loadResults());

  const [currentDate, setCurrentDate] = useState<string>(() => getTodayDateString());
  const [activeTab, setActiveTab] = useState<ViewTab>('attendance');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Security & Tamper-proof Lock State
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    const saved = localStorage.getItem('school_app_is_locked');
    return saved !== null ? saved === 'true' : Boolean(config.isPinProtected);
  });

  // Modals
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isClassSelectorOpen, setIsClassSelectorOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isTeachersModalOpen, setIsTeachersModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Sync isLocked state to localStorage
  useEffect(() => {
    localStorage.setItem('school_app_is_locked', String(isLocked));
  }, [isLocked]);

  // Gatekeeper helper for protected actions
  const verifyUnlocked = (): boolean => {
    if (isLocked) {
      setIsSecurityModalOpen(true);
      return false;
    }
    return true;
  };

  // Active Standard Students (e.g. Std 1 to 8)
  const currentStandardStudents = useMemo(() => {
    const list = students.filter((s) => (s.standard || 'ધોરણ ૬') === config.standard);
    return list;
  }, [students, config.standard]);

  // Switch Active Standard and automatically assign class teacher
  const handleSelectStandard = (standard: string) => {
    const teacher = config.teachers?.find((t) => t.standard === standard);
    const updated: SchoolConfig = {
      ...config,
      standard,
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
    setConfig(updated);
    saveSchoolConfig(updated);
  };

  // Get current day's record for active standard or default all present
  const currentDayRecords: Record<string, AttendanceStatus> = useMemo(() => {
    const dayRecords = records[currentDate]?.records || {};
    const fallback: Record<string, AttendanceStatus> = { ...dayRecords };
    currentStandardStudents.forEach((s) => {
      if (!fallback[s.id]) {
        fallback[s.id] = 'present';
      }
    });
    return fallback;
  }, [records, currentDate, currentStandardStudents]);

  // Today attendance percentage for active standard
  const todayPercentage = useMemo(() => {
    if (currentStandardStudents.length === 0) return '100';
    const presentCount = currentStandardStudents.filter(
      (s) => (currentDayRecords[s.id] || 'present') === 'present'
    ).length;
    return ((presentCount / currentStandardStudents.length) * 100).toFixed(0);
  }, [currentStandardStudents, currentDayRecords]);

  // Handle Photo Click: Cycle Present -> Absent -> Leave -> Present
  const handleToggleStatus = (studentId: string) => {
    if (!verifyUnlocked()) return;

    const current = currentDayRecords[studentId] || 'present';
    let next: AttendanceStatus = 'absent';
    if (current === 'present') next = 'absent';
    else if (current === 'absent') next = 'present';
    else next = 'present';

    handleSetStatus(studentId, next);
  };

  // Set explicit status with audio feedback
  const handleSetStatus = (studentId: string, status: AttendanceStatus) => {
    if (!verifyUnlocked()) return;

    playAttendanceSound(status, soundEnabled);

    const updated = {
      ...currentDayRecords,
      [studentId]: status,
    };

    saveDayAttendance(currentDate, updated);
    setRecords((prev) => ({
      ...prev,
      [currentDate]: {
        date: currentDate,
        records: updated,
        lastUpdated: new Date().toISOString(),
      },
    }));
  };

  // Mark all students in current standard present / absent
  const handleMarkAll = (status: AttendanceStatus) => {
    if (!verifyUnlocked()) return;

    playAttendanceSound(status, soundEnabled);

    const existing = records[currentDate]?.records || {};
    const updated: Record<string, AttendanceStatus> = { ...existing };
    currentStandardStudents.forEach((s) => {
      updated[s.id] = status;
    });

    saveDayAttendance(currentDate, updated);
    setRecords((prev) => ({
      ...prev,
      [currentDate]: {
        date: currentDate,
        records: updated,
        lastUpdated: new Date().toISOString(),
      },
    }));
  };

  // Clear / Delete today's attendance for active standard
  const handleClearAttendance = () => {
    if (!verifyUnlocked()) return;

    if (window.confirm(`શું તમે ${config.standard} ની આજની (${formatGujaratiDate(currentDate)}) હાજરી ક્લિયર કરવા માંગો છો?`)) {
      const existing = records[currentDate]?.records || {};
      const updated = { ...existing };
      currentStandardStudents.forEach((s) => {
        delete updated[s.id];
      });

      saveDayAttendance(currentDate, updated);
      setRecords((prev) => ({
        ...prev,
        [currentDate]: {
          date: currentDate,
          records: updated,
          lastUpdated: new Date().toISOString(),
        },
      }));
    }
  };

  // Update school photo on main page
  const handleUpdateSchoolPhoto = (photoUrl: string) => {
    if (!verifyUnlocked()) return;
    const updated = { ...config, schoolPhotoUrl: photoUrl };
    setConfig(updated);
    saveSchoolConfig(updated);
  };

  // Update teacher photo
  const handleUpdateTeacherPhoto = (photoUrl: string) => {
    if (!verifyUnlocked()) return;
    const updated = { ...config, teacherPhotoUrl: photoUrl };
    setConfig(updated);
    saveSchoolConfig(updated);
  };

  // Activity Handlers
  const handleAddActivity = (activity: ClassActivity) => {
    if (!verifyUnlocked()) return;
    const updated = [activity, ...activities];
    setActivities(updated);
    saveActivities(updated);
  };

  const handleUpdateActivity = (activity: ClassActivity) => {
    if (!verifyUnlocked()) return;
    const updated = activities.map((a) => (a.id === activity.id ? activity : a));
    setActivities(updated);
    saveActivities(updated);
  };

  const handleDeleteActivity = (activityId: string) => {
    if (!verifyUnlocked()) return;
    const updated = activities.filter((a) => a.id !== activityId);
    setActivities(updated);
    saveActivities(updated);
  };

  // Result Handlers
  const handleUpdateResult = (result: StudentResult) => {
    if (!verifyUnlocked()) return;
    const updated = {
      ...results,
      [result.studentId]: result,
    };
    setResults(updated);
    saveResults(updated);
  };

  const handleDeleteResult = (studentId: string) => {
    if (!verifyUnlocked()) return;
    deleteResultRecord(studentId);
    setResults((prev) => {
      const next = { ...prev };
      delete next[studentId];
      return next;
    });
  };

  const handleResetAllResults = () => {
    if (!verifyUnlocked()) return;
    resetAllResults();
    setResults({});
  };

  // Student Handlers
  const handleSaveStudent = (student: Student) => {
    if (!verifyUnlocked()) return;
    const withStd: Student = {
      ...student,
      standard: student.standard || config.standard,
      division: student.division || config.division,
    };
    let updated: Student[];
    const exists = students.some((s) => s.id === withStd.id);
    if (exists) {
      updated = students.map((s) => (s.id === withStd.id ? withStd : s));
    } else {
      updated = [...students, withStd];
    }
    setStudents(updated);
    saveStudents(updated);
  };

  const handleDeleteStudent = (studentId: string) => {
    if (!verifyUnlocked()) return;
    const updated = students.filter((s) => s.id !== studentId);
    setStudents(updated);
    saveStudents(updated);
  };

  const handleClearAllStudents = () => {
    if (!verifyUnlocked()) return;
    const remaining = students.filter((s) => (s.standard || 'ધોરણ ૬') !== config.standard);
    setStudents(remaining);
    saveStudents(remaining);
  };

  const handleResetToSampleStudents = () => {
    if (!verifyUnlocked()) return;
    const remaining = students.filter((s) => (s.standard || 'ધોરણ ૬') !== config.standard);
    const sampleForThis = DEFAULT_STUDENTS.filter(
      (s) => (s.standard || 'ધોરણ ૬') === config.standard
    );
    const combined = [...remaining, ...sampleForThis];
    setStudents(combined);
    saveStudents(combined);
  };

  // Reset to default demo data
  const handleResetData = () => {
    if (!verifyUnlocked()) return;
    saveStudents(DEFAULT_STUDENTS);
    saveSchoolConfig(DEFAULT_SCHOOL_CONFIG);
    localStorage.removeItem('guj_attendance_records_v1');
    localStorage.removeItem('guj_school_activities_v1');
    localStorage.removeItem('guj_school_results_v1');
    setStudents(DEFAULT_STUDENTS);
    setConfig(DEFAULT_SCHOOL_CONFIG);
    setRecords(loadAllAttendanceRecords());
    setActivities(loadActivities());
    setResults(loadResults());
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-['Hind_Vadodara','Noto_Sans_Gujarati',system-ui,sans-serif]">
      {/* Official Gujarat Primary School Header */}
      <Header
        config={config}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        isLocked={isLocked}
        onToggleLock={() => {
          if (isLocked) {
            setIsSecurityModalOpen(true);
          } else {
            setIsLocked(true);
          }
        }}
        onOpenClassSelector={() => setIsClassSelectorOpen(true)}
        onOpenTeachersModal={() => setIsTeachersModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 flex-1">
        {/* Main Page School Photo Banner */}
        {activeTab === 'attendance' && (
          <SchoolBanner
            config={config}
            onUpdateSchoolPhoto={handleUpdateSchoolPhoto}
            onUpdateTeacherPhoto={handleUpdateTeacherPhoto}
            onOpenClassSelector={() => setIsClassSelectorOpen(true)}
            onOpenTeachersModal={() => setIsTeachersModalOpen(true)}
            totalStudents={currentStandardStudents.length}
            todayPercentage={todayPercentage}
            activitiesCount={activities.length}
          />
        )}

        {/* Tab 1: Daily Attendance */}
        {activeTab === 'attendance' && (
          <DailyAttendanceView
            students={currentStandardStudents}
            currentRecords={currentDayRecords}
            config={config}
            onToggleStatus={handleToggleStatus}
            onSetStatus={handleSetStatus}
            onMarkAll={handleMarkAll}
            onClearAttendance={handleClearAttendance}
            onEditStudent={(s) => {
              if (verifyUnlocked()) {
                setEditingStudent(s);
              }
            }}
            onViewIdCard={() => setActiveTab('idcards')}
            onOpenWhatsAppShare={() => setIsWhatsAppModalOpen(true)}
            currentDateFormatted={formatGujaratiDate(currentDate)}
            isLocked={isLocked}
            onSelectStandard={handleSelectStandard}
            onOpenTeachersModal={() => setIsTeachersModalOpen(true)}
            onOpenClassSelectorModal={() => setIsClassSelectorOpen(true)}
            allStudents={students}
            allRecords={records}
            currentDate={currentDate}
          />
        )}

        {/* Tab 2: Class Activities Diary */}
        {activeTab === 'activities' && (
          <ActivitiesView
            activities={activities}
            config={config}
            onAddActivity={handleAddActivity}
            onUpdateActivity={handleUpdateActivity}
            onDeleteActivity={handleDeleteActivity}
          />
        )}

        {/* Tab 3: Student Results / Marksheet Patrak */}
        {activeTab === 'results' && (
          <ResultPatrakView
            students={currentStandardStudents}
            config={config}
            results={results}
            onUpdateResult={handleUpdateResult}
            onDeleteResult={handleDeleteResult}
            onResetAllResults={handleResetAllResults}
          />
        )}

        {/* Tab 4: Student ID Cards */}
        {activeTab === 'idcards' && (
          <IdCardView
            students={currentStandardStudents}
            config={config}
          />
        )}

        {/* Tab 5: Monthly Register */}
        {activeTab === 'monthly' && (
          <MonthlyRegisterView
            students={currentStandardStudents}
            records={records}
            config={config}
          />
        )}

        {/* Tab 6: WhatsApp Share */}
        {activeTab === 'share' && (
          <div className="max-w-2xl mx-auto">
            <WhatsAppShareModal
              isOpen={true}
              onClose={() => setActiveTab('attendance')}
              config={config}
              currentDate={currentDate}
              students={currentStandardStudents}
              currentRecords={currentDayRecords}
            />
          </div>
        )}

        {/* Tab 7: Students Management */}
        {activeTab === 'students' && (
          <StudentManagerView
            students={students}
            onAddStudent={handleSaveStudent}
            onUpdateStudent={handleSaveStudent}
            onDeleteStudent={handleDeleteStudent}
            onClearAllStudents={handleClearAllStudents}
            onResetToSampleStudents={handleResetToSampleStudents}
            config={config}
            onOpenClassSelector={() => setIsClassSelectorOpen(true)}
            editingStudent={editingStudent}
            onCloseEdit={() => setEditingStudent(null)}
            onOpenAddModal={() => {
              if (verifyUnlocked()) {
                setIsAddStudentModalOpen(true);
              }
            }}
          />
        )}
      </main>

      {/* WhatsApp Share Modal */}
      <WhatsAppShareModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        config={config}
        currentDate={currentDate}
        students={currentStandardStudents}
        currentRecords={currentDayRecords}
      />

      {/* Settings & Backup Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        config={config}
        onSaveConfig={(newConfig) => {
          setConfig(newConfig);
          saveSchoolConfig(newConfig);
        }}
        onResetData={handleResetData}
      />

      {/* Class & Standard Selector Modal */}
      <ClassSelectorModal
        isOpen={isClassSelectorOpen}
        onClose={() => setIsClassSelectorOpen(false)}
        config={config}
        onSaveConfig={(newConfig) => {
          setConfig(newConfig);
          saveSchoolConfig(newConfig);
        }}
      />

      {/* 8 Teachers & Class Management Modal */}
      <TeachersModal
        isOpen={isTeachersModalOpen}
        onClose={() => setIsTeachersModalOpen(false)}
        config={config}
        onUpdateConfig={(newConfig) => {
          setConfig(newConfig);
          saveSchoolConfig(newConfig);
        }}
        onSelectStandard={(std) => {
          handleSelectStandard(std);
        }}
        students={students}
        todayRecords={records}
        currentDate={currentDate}
      />

      {/* Security PIN Lock Modal */}
      <SecurityLockModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        config={config}
        onUnlockSuccess={() => {
          setIsLocked(false);
        }}
        onUpdateConfig={(newConfig) => {
          setConfig(newConfig);
          saveSchoolConfig(newConfig);
        }}
      />

      {/* Add / Edit Student Form Modal */}
      <StudentFormModal
        isOpen={isAddStudentModalOpen || editingStudent !== null}
        onClose={() => {
          setIsAddStudentModalOpen(false);
          setEditingStudent(null);
        }}
        onSave={handleSaveStudent}
        initialData={editingStudent}
        nextRollNo={
          students.length > 0 ? Math.max(...students.map((s) => s.rollNo)) + 1 : 1
        }
        defaultStandard={config.standard}
        defaultDivision={config.division}
      />
    </div>
  );
}
