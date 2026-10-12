import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, GraduationCap, Users, BookOpen, Award, CheckCircle2, Search, Sliders } from 'lucide-react';
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

  const {
    customization,
    drawerOpen,
    setDrawerOpen,
    applyPalette,
    updateField,
    resetToDefault,
    getRadiusClass,
    getFontFamilyClass,
    calculateEstimate
  } = useThemeCustomizer(template, {
    brandName: 'EduPulse Academy',
    primaryColor: '#D97706',
    accentColor: '#FBBF24',
    paletteId: 'gold'
  });

  return (
    <div className={`min-h-screen bg-slate-900 text-slate-100 flex flex-col ${getFontFamilyClass()}`}>
      
      {/* Top Banner */}
      {customization.showPromoBanner && (
        <div
          className="text-white text-xs font-semibold py-2 px-4 text-center flex items-center justify-center gap-2 transition-colors"
          style={{ backgroundColor: customization.primaryColor }}
        >
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>
            Live Student Portal Demo: {customization.brandName} - Real-time color switcher, grade rosters & attendance telemetry.
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
        onUseDesign={onUseDesign}
      />

      {/* Slide-over Theme Customizer Drawer */}
      <DemoCustomizerDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        template={template}
        customization={customization}
        onApplyPalette={applyPalette}
        onUpdateField={updateField}
        onReset={resetToDefault}
        onUseDesign={onUseDesign}
      />

      {/* Floating Customize Button */}
      <FloatingCustomizeButton
        onOpen={() => setDrawerOpen(true)}
        primaryColor={customization.primaryColor}
      />

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
                ₹1,20,000
              </div>
            </div>
          </div>
        )}

        {/* Student Roster Table */}
        <div className={`bg-slate-950 p-6 border border-slate-800 space-y-4 ${getRadiusClass('card')}`}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base">
              {customization.brandName} - Academic Directory
            </h3>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{
                color: customization.primaryColor,
                backgroundColor: `${customization.primaryColor}20`
              }}
            >
              Term 2 - 2026
            </span>
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
                    <td className="p-3 font-mono font-bold" style={{ color: customization.primaryColor }}>
                      {s.id}
                    </td>
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

      </div>
    </div>
  );
};
