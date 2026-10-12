import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, GraduationCap, Users, BookOpen, Award, CheckCircle2, Search } from 'lucide-react';
import { TemplateItem } from '../../types';

interface StudentManagementDemoProps {
  template: TemplateItem;
  onBack: () => void;
  onUseDesign: (template: TemplateItem) => void;
}

export const StudentManagementDemo: React.FC<StudentManagementDemoProps> = ({
  template,
  onBack,
  onUseDesign
}) => {
  const [students, setStudents] = useState([
    { id: 'STU-101', name: 'Aarav Sharma', grade: 'Grade 10', attendance: '98%', fees: 'Paid', email: 'aarav@school.org' },
    { id: 'STU-102', name: 'Diya Patel', grade: 'Grade 8', attendance: '94%', fees: 'Paid', email: 'diya@school.org' },
    { id: 'STU-103', name: 'Rohan Mehta', grade: 'Grade 12', attendance: '91%', fees: 'Pending', email: 'rohan@school.org' },
    { id: 'STU-104', name: 'Ananya Singh', grade: 'Grade 9', attendance: '99%', fees: 'Paid', email: 'ananya@school.org' },
  ]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <div className="bg-amber-600 text-white text-xs font-semibold py-2 px-4 text-center">
        Live Student Management Portal: Track course registrations, student attendance records, fee collections, and grades.
      </div>

      <div className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-6 py-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Templates</span>
        </button>
        <span className="font-bold text-white text-sm">{template.name} ({template.templateCode})</span>
        <button
          onClick={() => onUseDesign(template)}
          className="bg-[#F95700] hover:bg-[#EA4D00] text-white px-5 py-2 rounded-full font-bold text-xs"
        >
          Use This Concept &rarr;
        </button>
      </div>

      <div className="flex-1 max-w-6xl mx-auto w-full p-6 space-y-6">
        
        {/* KPI strip (matching screenshot 5) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400">Total Students</span>
            <div className="text-2xl font-black font-mono text-white mt-1">320</div>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400">Active Courses</span>
            <div className="text-2xl font-black font-mono text-white mt-1">45</div>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400">Certified Teachers</span>
            <div className="text-2xl font-black font-mono text-white mt-1">28</div>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400">Fee Revenue</span>
            <div className="text-2xl font-black font-mono text-emerald-400 mt-1">₹1,20,000</div>
          </div>
        </div>

        {/* Student Roster Table */}
        <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base">Student Academic Directory</h3>
            <span className="text-xs text-slate-400">Term 2 - 2026</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Grade</th>
                  <th className="p-3">Attendance</th>
                  <th className="p-3">Fee Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-900/60">
                    <td className="p-3 font-mono text-orange-400">{s.id}</td>
                    <td className="p-3 font-bold text-white">{s.name}</td>
                    <td className="p-3 text-slate-300">{s.grade}</td>
                    <td className="p-3 font-mono text-emerald-400">{s.attendance}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.fees === 'Paid' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                      }`}>
                        {s.fees}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              onClick={() => onUseDesign(template)}
              className="bg-[#F95700] hover:bg-[#EA4D00] text-white px-6 py-2.5 rounded-full font-bold text-xs"
            >
              Build This Student Portal &rarr;
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
