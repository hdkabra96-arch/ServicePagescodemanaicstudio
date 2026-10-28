import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, GraduationCap, Users, BookOpen, Award, CheckCircle2, Search, Sliders, Calendar, DollarSign, FileText, Check } from 'lucide-react';
import { TemplateItem } from '../../types';
import {
  useThemeCustomizer,
  DemoControlBar,
  DemoCustomizerDrawer,
  FloatingCustomizeButton,
  ThemeCustomizerState
} from './DemoThemeCustomizer';

interface StudentManagementDemoProps {
  template: TemplateItem;
  onBack: () => void;
  onUseDesign: (template: TemplateItem, customData?: ThemeCustomizerState) => void;
}

type EduTab = 'directory' | 'courses' | 'grades' | 'fees';

export const StudentManagementDemo: React.FC<StudentManagementDemoProps> = ({
  template,
  onBack,
  onUseDesign
}) => {
  const [activeTab, setActiveTab] = useState<EduTab>('directory');
  const [searchStudent, setSearchStudent] = useState('');
  const [students, setStudents] = useState([
    { id: 'STU-101', name: 'Aarav Sharma', grade: 'Grade 10-A', attendance: '98%', gpa: '3.92', fees: 'Paid', email: 'aarav@school.org' },
    { id: 'STU-102', name: 'Diya Patel', grade: 'Grade 8-B', attendance: '94%', gpa: '3.85', fees: 'Paid', email: 'diya@school.org' },
    { id: 'STU-103', name: 'Rohan Mehta', grade: 'Grade 12-Science', attendance: '91%', gpa: '3.70', fees: 'Pending', email: 'rohan@school.org' },
    { id: 'STU-104', name: 'Ananya Singh', grade: 'Grade 9-A', attendance: '99%', gpa: '4.00', fees: 'Paid', email: 'ananya@school.org' },
  ]);

  const courses = [
    { code: 'CS-401', title: 'Advanced Algorithms & Data Structures', instructor: 'Prof. Vikram Rao', students: 48, schedule: 'Mon/Wed 10:00 AM' },
    { code: 'MATH-302', title: 'Multivariable Calculus & Linear Algebra', instructor: 'Dr. Sunita Sen', students: 62, schedule: 'Tue/Thu 11:30 AM' },
    { code: 'ENG-201', title: 'Technical Writing & Public Speaking', instructor: 'Prof. David Vance', students: 35, schedule: 'Fri 02:00 PM' }
  ];

  const {
    customization,
    drawerOpen,
    setDrawerOpen,
    applyPalette,
    randomizeTopography,
    updateField,
    resetToDefault,
    getRadiusClass,
    getFontFamilyClass,
    getFontSizeScaleClass,
    getCardClasses,
    getCardStyle,
    getPrimaryButtonStyle,
    getBadgeStyle,
    calculateEstimate
  } = useThemeCustomizer(template, {
    brandName: template.name.includes('Academy') || template.name.includes('Campus') ? template.name : 'EduPulse Global Academy'
  });

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
    s.id.toLowerCase().includes(searchStudent.toLowerCase()) ||
    s.grade.toLowerCase().includes(searchStudent.toLowerCase())
  );

  return (
    <div className={`min-h-screen bg-slate-900 text-slate-100 flex flex-col ${getFontFamilyClass()}`}>
      
      {/* Top Banner */}
      {customization.showPromoBanner && (
        <div
          className="text-white text-xs font-semibold py-2 px-4 text-center flex items-center justify-center gap-2 transition-colors sticky top-0 z-40"
          style={{ backgroundColor: customization.primaryColor }}
        >
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>
            Live Student Portal Demo: <strong>{customization.brandName}</strong> • Academic rosters, grade tracking & customized topography.
          </span>
        </div>
      )}

      {/* Control Bar */}
      <DemoControlBar
        template={template}
        customization={customization}
        onBack={onBack}
        onOpenCustomizer={() => setDrawerOpen(true)}
        onApplyPalette={applyPalette}
        onUpdateField={updateField}
        onUseDesign={onUseDesign}
      />

      {/* Slide-over Theme Customizer Drawer */}
      <DemoCustomizerDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        template={template}
        customization={customization}
        onApplyPalette={applyPalette}
        onRandomize={randomizeTopography}
        onUpdateField={updateField}
        onReset={resetToDefault}
        onUseDesign={onUseDesign}
      />

      {/* Floating Customize Button */}
      <FloatingCustomizeButton
        onOpen={() => setDrawerOpen(true)}
        primaryColor={customization.primaryColor}
      />

      {/* Sub-navigation Tab Bar */}
      <div className="border-b border-slate-800 bg-slate-950/70 px-6 py-2.5 flex items-center justify-between overflow-x-auto text-xs">
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-bold text-[11px] uppercase tracking-wider text-slate-400">
            Portal Sections:
          </span>
          <div className="flex items-center gap-1">
            {[
              { id: 'directory' as EduTab, label: '🎓 Student Directory' },
              { id: 'courses' as EduTab, label: '📚 Courses & Batches' },
              { id: 'grades' as EduTab, label: '🏆 GPA & Attendance' },
              { id: 'fees' as EduTab, label: '💳 Fee Collection' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-md font-bold text-xs transition-all ${
                  activeTab === tab.id ? 'text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
                style={{
                  backgroundColor: activeTab === tab.id ? customization.primaryColor : undefined
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          className="hidden sm:flex items-center gap-1 font-bold text-[11px] hover:underline shrink-0"
          style={{ color: customization.primaryColor }}
        >
          <Sliders className="w-3 h-3" />
          <span>Customize Theme</span>
        </button>
      </div>

      <div className="flex-1 max-w-6xl mx-auto w-full p-6 space-y-6">
        
        {/* KPI strip */}
        {customization.showStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`bg-slate-950 p-4 border border-slate-800 ${getRadiusClass('input')}`}>
              <span className="text-xs text-slate-400">Total Enrolled</span>
              <div className="text-2xl font-black font-mono text-white mt-1">320</div>
            </div>
            <div className={`bg-slate-950 p-4 border border-slate-800 ${getRadiusClass('input')}`}>
              <span className="text-xs text-slate-400">Active Batches</span>
              <div className="text-2xl font-black font-mono text-white mt-1">45</div>
            </div>
            <div className={`bg-slate-950 p-4 border border-slate-800 ${getRadiusClass('input')}`}>
              <span className="text-xs text-slate-400">Faculty Members</span>
              <div className="text-2xl font-black font-mono text-white mt-1">28</div>
            </div>
            <div className={`bg-slate-950 p-4 border border-slate-800 ${getRadiusClass('input')}`}>
              <span className="text-xs text-slate-400">Term Fee Collection</span>
              <div className="text-2xl font-black font-mono mt-1" style={{ color: customization.primaryColor }}>
                $120,000
              </div>
            </div>
          </div>
        )}

        {/* VIEW 1: STUDENT DIRECTORY */}
        {activeTab === 'directory' && (
          <div className={`bg-slate-950 p-6 border border-slate-800 space-y-4 animate-in fade-in duration-200 ${getRadiusClass('card')}`}>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="font-bold text-white text-base">
                  {customization.brandName} - Academic Directory
                </h3>
                <p className="text-xs text-slate-400">Active student enrollments and academic records.</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Filter student by name or ID..."
                    value={searchStudent}
                    onChange={(e) => setSearchStudent(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 text-xs rounded-lg text-white"
                  />
                </div>
                <span
                  className="text-xs font-bold px-2 py-1 rounded-md"
                  style={{
                    color: customization.primaryColor,
                    backgroundColor: `${customization.primaryColor}20`
                  }}
                >
                  Term 2 &bull; 2026
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Grade</th>
                    <th className="p-3">Attendance</th>
                    <th className="p-3">GPA</th>
                    <th className="p-3">Fee Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-900/60">
                      <td className="p-3 font-mono font-bold" style={{ color: customization.primaryColor }}>
                        {s.id}
                      </td>
                      <td className="p-3 font-bold text-white">{s.name}</td>
                      <td className="p-3 text-slate-300">{s.grade}</td>
                      <td className="p-3 font-mono text-emerald-400">{s.attendance}</td>
                      <td className="p-3 font-mono font-bold text-amber-400">{s.gpa}</td>
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

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3">
              <button
                onClick={() => setDrawerOpen(true)}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold hover:bg-slate-800 text-slate-300 transition-colors flex items-center gap-1.5"
              >
                <Sliders className="w-3.5 h-3.5 text-orange-400" />
                <span>Customize Portal Branding</span>
              </button>
              <button
                onClick={() => onUseDesign(template, customization)}
                className={`text-white px-6 py-2.5 font-bold text-xs shadow-lg transition-transform hover:scale-105 ${getRadiusClass('btn')}`}
                style={{ backgroundColor: customization.primaryColor }}
              >
                Build This Student Portal for {customization.brandName} &rarr;
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: COURSES */}
        {activeTab === 'courses' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h3 className="text-xl font-bold text-white">Active Curriculum & Course Catalog</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {courses.map((c) => (
                <div
                  key={c.code}
                  className={getCardClasses('p-5 space-y-3')}
                  style={getCardStyle()}
                >
                  <span
                    className="text-[10px] font-black px-2 py-0.5 rounded-md inline-block uppercase"
                    style={{ backgroundColor: `${customization.primaryColor}20`, color: customization.primaryColor }}
                  >
                    {c.code}
                  </span>
                  <h4 className="font-bold text-sm text-white">{c.title}</h4>
                  <p className="text-xs text-slate-400">{c.instructor}</p>
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>{c.students} Students</span>
                    <span className="text-slate-300">{c.schedule}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 3: GRADES */}
        {activeTab === 'grades' && (
          <div className={`p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-4 animate-in fade-in duration-200`}>
            <h3 className="text-lg font-bold text-white">Midterm Exam Evaluations & GPA Roster</h3>
            <div className="space-y-2">
              {students.map((st) => (
                <div key={st.id} className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white">{st.name}</span>
                    <span className="text-slate-400 ml-2">({st.grade})</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-400">Attendance: <strong className="text-emerald-400">{st.attendance}</strong></span>
                    <span className="font-mono font-bold text-sm" style={{ color: customization.primaryColor }}>
                      GPA: {st.gpa}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 4: FEES */}
        {activeTab === 'fees' && (
          <div className={`p-6 bg-slate-950 border border-slate-800 rounded-xl space-y-4 animate-in fade-in duration-200`}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Fee Settlement Gateway</h3>
              <span className="text-xs text-emerald-400 font-bold">● Automatic UPI & Stripe Sync Active</span>
            </div>
            <div className="space-y-2">
              {students.map((st) => (
                <div key={st.id} className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">{st.name}</div>
                    <div className="text-[11px] text-slate-400">Student ID: {st.id}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      st.fees === 'Paid' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                    }`}>
                      {st.fees === 'Paid' ? 'Settled (Invoice #8492)' : 'Due: $1,250'}
                    </span>
                    {st.fees !== 'Paid' && (
                      <button
                        onClick={() => {
                          setStudents(students.map(s => s.id === st.id ? { ...s, fees: 'Paid' } : s));
                        }}
                        className="px-3 py-1 text-[11px] font-bold text-white rounded-md shadow-xs"
                        style={{ backgroundColor: customization.primaryColor }}
                      >
                        Mark as Paid
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
