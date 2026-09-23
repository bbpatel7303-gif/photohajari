import { StudentResult, SubjectMarks } from '../types';
import { DEFAULT_STUDENTS } from './defaultStudents';

// Sample marks for Grade 6 semester examination
export function generateDefaultResults(): Record<string, StudentResult> {
  const results: Record<string, StudentResult> = {};

  const sampleMarksSeed: SubjectMarks[] = [
    { gujarati: 88, mathematics: 92, science: 85, socialScience: 86, english: 78, hindi: 82, sanskrit: 90 }, // Roll 1
    { gujarati: 92, mathematics: 95, science: 90, socialScience: 91, english: 88, hindi: 90, sanskrit: 94 }, // Roll 2
    { gujarati: 74, mathematics: 78, science: 72, socialScience: 75, english: 68, hindi: 76, sanskrit: 79 }, // Roll 3
    { gujarati: 85, mathematics: 82, science: 84, socialScience: 80, english: 81, hindi: 85, sanskrit: 88 }, // Roll 4
    { gujarati: 68, mathematics: 71, science: 65, socialScience: 70, english: 62, hindi: 72, sanskrit: 70 }, // Roll 5
    { gujarati: 90, mathematics: 89, science: 92, socialScience: 87, english: 86, hindi: 91, sanskrit: 93 }, // Roll 6
    { gujarati: 82, mathematics: 85, science: 80, socialScience: 83, english: 75, hindi: 80, sanskrit: 84 }, // Roll 7
    { gujarati: 94, mathematics: 96, science: 93, socialScience: 92, english: 90, hindi: 93, sanskrit: 97 }, // Roll 8
    { gujarati: 79, mathematics: 84, science: 76, socialScience: 78, english: 72, hindi: 80, sanskrit: 81 }, // Roll 9
    { gujarati: 87, mathematics: 86, science: 88, socialScience: 85, english: 82, hindi: 88, sanskrit: 89 }, // Roll 10
    { gujarati: 72, mathematics: 75, science: 70, socialScience: 74, english: 66, hindi: 75, sanskrit: 77 }, // Roll 11
    { gujarati: 91, mathematics: 90, science: 93, socialScience: 89, english: 87, hindi: 92, sanskrit: 95 }, // Roll 12
    { gujarati: 76, mathematics: 80, science: 74, socialScience: 77, english: 70, hindi: 78, sanskrit: 80 }, // Roll 13
    { gujarati: 89, mathematics: 88, science: 87, socialScience: 86, english: 84, hindi: 89, sanskrit: 91 }, // Roll 14
    { gujarati: 80, mathematics: 83, science: 79, socialScience: 81, english: 74, hindi: 82, sanskrit: 83 }, // Roll 15
    { gujarati: 86, mathematics: 87, science: 85, socialScience: 84, english: 80, hindi: 86, sanskrit: 88 }, // Roll 16
    { gujarati: 75, mathematics: 78, science: 73, socialScience: 76, english: 69, hindi: 77, sanskrit: 78 }, // Roll 17
    { gujarati: 93, mathematics: 94, science: 91, socialScience: 90, english: 89, hindi: 92, sanskrit: 96 }, // Roll 18
    { gujarati: 78, mathematics: 81, science: 77, socialScience: 79, english: 71, hindi: 79, sanskrit: 82 }, // Roll 19
    { gujarati: 88, mathematics: 85, science: 86, socialScience: 87, english: 83, hindi: 87, sanskrit: 90 }, // Roll 20
    { gujarati: 73, mathematics: 76, science: 71, socialScience: 75, english: 67, hindi: 74, sanskrit: 76 }, // Roll 21
    { gujarati: 90, mathematics: 91, science: 89, socialScience: 88, english: 85, hindi: 90, sanskrit: 92 }, // Roll 22
    { gujarati: 84, mathematics: 88, science: 82, socialScience: 83, english: 79, hindi: 84, sanskrit: 87 }, // Roll 23
    { gujarati: 92, mathematics: 93, science: 90, socialScience: 91, english: 88, hindi: 91, sanskrit: 94 }, // Roll 24
  ];

  DEFAULT_STUDENTS.forEach((student, index) => {
    const marks = sampleMarksSeed[index] || {
      gujarati: 80,
      mathematics: 80,
      science: 80,
      socialScience: 80,
      english: 80,
      hindi: 80,
      sanskrit: 80,
    };

    results[student.id] = {
      studentId: student.id,
      examType: 'sem1',
      marks,
      remarks: 'ઉત્તમ પ્રગતિ. વર્ગકાર્યમાં ખૂબ સક્રિય.',
    };
  });

  return results;
}
