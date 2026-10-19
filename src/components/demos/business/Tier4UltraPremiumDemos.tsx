import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers,
  Sparkles,
  Terminal,
  Activity,
  Compass,
  Cpu,
  Radio,
  Eye,
  Sliders,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Box,
  RotateCw,
  Globe,
  Share2,
  CheckCircle2,
  Send,
  Lock,
  Search,
  ExternalLink,
  ChevronRight,
  Database,
  Satellite,
  Headphones,
  Award,
  Video,
  FileCode,
  Server,
  CloudLightning,
  Workflow
} from 'lucide-react';
import { BusinessTemplateItem } from '../../../types';

interface TemplateDemoProps {
  template: BusinessTemplateItem;
  onUseDesign: (template: BusinessTemplateItem) => void;
  externalActivePage?: string;
  onPageChange?: (page: string) => void;
}

// ============================================================================
// TEMPLATE 16: Immersive 3D (NeuraSpatial Robotics)
// Dominant: Luminous Sky (#F0F9FF) | Electric Cyan (#0284C7)
// Bright luminous spatial canvas with 3D polyhedron & 10 DEDICATED PAGES
// ============================================================================
export const Immersive3DDemo: React.FC<TemplateDemoProps> = ({ template, onUseDesign, externalActivePage, onPageChange }) => {
  const [wireframe, setWireframe] = useState(false);
  const [rotationSpeed, setRotationSpeed] = useState(1);
  const [internalTab, setInternalTab] = useState<string>('model');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const activeTab = externalActivePage || internalTab;

  const navigateTo = (tab: string) => {
    setInternalTab(tab);
    if (onPageChange) onPageChange(tab);
  };

  const pages = [
    { id: 'model', label: '1. 3D Engine' },
    { id: 'specs', label: '2. Telemetry' },
    { id: 'mesh', label: '3. Quantum Mesh' },
    { id: 'kinematics', label: '4. Kinematics' },
    { id: 'sdk', label: '5. Enterprise SDK' },
    { id: 'benchmarks', label: '6. Benchmarks' },
    { id: 'showcase', label: '7. Deployments' },
    { id: 'hardware', label: '8. Sensor Suite' },
    { id: 'sandbox', label: '9. 3D Sandbox' },
    { id: 'licensing', label: '10. Dev Kit' }
  ];

  // Canvas 3D polyhedron interactive rendering on bright sky background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let angleX = 0.3;
    let angleY = 0.5;

    const phi = (1 + Math.sqrt(5)) / 2;
    const scale = 75;
    const vertices: [number, number, number][] = [
      [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
      [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
      [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]
    ].map(([x, y, z]) => [x * scale, y * scale, z * scale] as [number, number, number]);

    const edges: [number, number][] = [
      [0, 11], [0, 5], [0, 1], [0, 7], [0, 10],
      [1, 5], [1, 9], [1, 8], [1, 7],
      [2, 11], [2, 4], [2, 3], [2, 6], [2, 10],
      [3, 4], [3, 9], [3, 8], [3, 6],
      [4, 5], [4, 9], [4, 11],
      [5, 9], [5, 11],
      [6, 7], [6, 8], [6, 10],
      [7, 8], [7, 10],
      [8, 9], [10, 11]
    ];

    const particles = Array.from({ length: 30 }, () => ({
      x: (Math.random() - 0.5) * 320,
      y: (Math.random() - 0.5) * 320,
      z: (Math.random() - 0.5) * 320,
      radius: Math.random() * 2 + 1,
      speed: Math.random() * 0.01 + 0.005
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      angleX += 0.008 * rotationSpeed;
      angleY += 0.012 * rotationSpeed;

      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);

      // Render floating cyan/blue ambient particles
      particles.forEach((p) => {
        const x1 = p.x * cosY - p.z * sinY;
        const z1 = p.z * cosY + p.x * sinY;
        const y1 = p.y * cosX - z1 * sinX;
        const scaleFact = 260 / (260 + z1);
        const px = cx + x1 * scaleFact;
        const py = cy + y1 * scaleFact;

        ctx.beginPath();
        ctx.arc(px, py, p.radius * scaleFact, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(2, 132, 199, 0.45)';
        ctx.fill();
      });

      // Project vertices
      const projected = vertices.map(([x, y, z]) => {
        const x1 = x * cosY - z * sinY;
        const z1 = z * cosY + x * sinY;
        const y1 = y * cosX - z1 * sinX;
        const z2 = z1 * cosX + y * sinX;
        const scaleFact = 260 / (260 + z2);
        return { x: cx + x1 * scaleFact, y: cy + y1 * scaleFact, z: z2 };
      });

      // Draw edges
      edges.forEach(([i, j]) => {
        const p1 = projected[i];
        const p2 = projected[j];
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineWidth = wireframe ? 1 : 2;
        ctx.strokeStyle = wireframe ? 'rgba(2, 132, 199, 0.35)' : 'rgba(37, 99, 235, 0.85)';
        ctx.stroke();
      });

      // Draw nodes
      projected.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, wireframe ? 2.5 : 4.5, 0, Math.PI * 2);
        ctx.fillStyle = '#0284C7';
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [rotationSpeed, wireframe]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0F9FF] via-[#E0F2FE] to-[#FFFFFF] text-[#0F172A] font-sans flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* HUD Wireframe Top Bar */}
      <header className="px-6 py-4 border-b border-sky-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-30 shadow-xs flex items-center justify-between">
        <button onClick={() => navigateTo('model')} className="flex items-center gap-2 text-left">
          <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white font-mono font-bold text-xs shadow-xs">
            3D
          </div>
          <div>
            <span className="font-extrabold text-sm text-sky-950 block">{template.sampleBusinessName}</span>
            <span className="text-[10px] text-sky-600 font-mono tracking-widest uppercase">10 Dedicated Pages</span>
          </div>
        </button>

        {/* 10 Page Navigation Pills */}
        <div className="hidden xl:flex items-center gap-1 overflow-x-auto text-[11px] font-mono font-bold">
          {pages.map((p) => (
            <button
              key={p.id}
              onClick={() => navigateTo(p.id)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeTab === p.id
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-sky-700 hover:bg-sky-100/60'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => navigateTo('licensing')}
          className="bg-sky-600 hover:bg-sky-700 text-white font-mono text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-colors"
        >
          Request Dev Kit &rarr;
        </button>
      </header>

      {/* Mobile Page Navigator Strip */}
      <div className="xl:hidden bg-sky-100/80 px-4 py-2 border-b border-sky-200 flex items-center gap-2 overflow-x-auto text-xs font-mono">
        {pages.map((p) => (
          <button
            key={p.id}
            onClick={() => navigateTo(p.id)}
            className={`px-3 py-1 rounded-md shrink-0 font-bold ${
              activeTab === p.id ? 'bg-sky-600 text-white' : 'bg-white text-slate-700'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* PAGE 1: 3D ENGINE OVERVIEW */}
      {activeTab === 'model' && (
        <main className="flex-1 py-12 px-6 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-in fade-in duration-300">
          <div className="space-y-6">
            <span className="inline-block px-3 py-1 bg-sky-100 text-sky-700 text-xs font-mono font-bold rounded-full border border-sky-200">
              Page 1 of 10 &bull; Spatial Computing Engine
            </span>
            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Real-Time 3D Spatial Geometry &amp; Robotics Guidance.
            </h1>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">{template.tagline}</p>
            <div className="p-4 bg-white/80 rounded-2xl border border-sky-200 shadow-sm flex items-center gap-6 text-xs font-mono">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-sky-900">
                <input type="checkbox" checked={wireframe} onChange={(e) => setWireframe(e.target.checked)} className="rounded text-sky-600" />
                <span>Wireframe Mode</span>
              </label>
              <div className="flex items-center gap-2 text-sky-900">
                <span className="font-bold">Rotation:</span>
                <input type="range" min="0.2" max="3" step="0.2" value={rotationSpeed} onChange={(e) => setRotationSpeed(parseFloat(e.target.value))} className="w-24 accent-sky-600" />
              </div>
            </div>
          </div>

          <div className="relative flex justify-center items-center p-8 bg-white/60 rounded-3xl border border-sky-200/80 shadow-xl backdrop-blur-xs">
            <canvas ref={canvasRef} width={400} height={360} className="max-w-full" />
            <div className="absolute bottom-4 left-6 text-[11px] font-mono text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
              Live WebGL/Canvas Polyhedron Mesh &bull; 60 FPS
            </div>
          </div>
        </main>
      )}

      {/* PAGE 2: SPECS */}
      {activeTab === 'specs' && (
        <main className="flex-1 py-16 px-6 max-w-5xl mx-auto w-full space-y-8 animate-in fade-in duration-300">
          <span className="text-xs font-mono font-bold text-sky-600 uppercase">Page 2 of 10 &bull; Telemetry</span>
          <h2 className="text-3xl font-black text-slate-900">Sub-Millimeter Spatial Accuracy</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono text-xs">
            <div className="p-6 bg-white rounded-2xl border border-sky-200 shadow-xs"><div className="text-3xl font-black text-sky-600">0.08mm</div>Repeatability SLA</div>
            <div className="p-6 bg-white rounded-2xl border border-sky-200 shadow-xs"><div className="text-3xl font-black text-sky-600">120 Hz</div>Refresh Frequency</div>
            <div className="p-6 bg-white rounded-2xl border border-sky-200 shadow-xs"><div className="text-3xl font-black text-sky-600">&lt; 1.2ms</div>Guidance Latency</div>
          </div>
        </main>
      )}

      {/* PAGE 3: MESH */}
      {activeTab === 'mesh' && (
        <main className="flex-1 py-16 px-6 max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-300">
          <span className="text-xs font-mono font-bold text-sky-600 uppercase">Page 3 of 10 &bull; Topology</span>
          <h2 className="text-3xl font-black text-slate-900">Quantum Mesh Topology</h2>
          <p className="text-xs text-slate-600 leading-relaxed font-mono">Dynamic tessellation algorithms running on high-density vertex buffers with automatic LOD scaling.</p>
        </main>
      )}

      {/* PAGE 4: KINEMATICS */}
      {activeTab === 'kinematics' && (
        <main className="flex-1 py-16 px-6 max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-300">
          <span className="text-xs font-mono font-bold text-sky-600 uppercase">Page 4 of 10 &bull; Kinematics</span>
          <h2 className="text-3xl font-black text-slate-900">Inverse Kinematics &amp; Collision Avoidance</h2>
          <p className="text-xs text-slate-600 leading-relaxed">Closed-loop trajectory planning for multi-axis robotic articulators in tight medical and cleanroom environments.</p>
        </main>
      )}

      {/* PAGE 5: SDK */}
      {activeTab === 'sdk' && (
        <main className="flex-1 py-16 px-6 max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-300">
          <span className="text-xs font-mono font-bold text-sky-600 uppercase">Page 5 of 10 &bull; Runtime</span>
          <h2 className="text-3xl font-black text-slate-900">Enterprise SDK: C++, Python &amp; WASM</h2>
          <div className="p-6 bg-white rounded-2xl border border-sky-200 font-mono text-xs text-slate-800">
            <code>npm install @neuraspatial/geometry-runtime</code>
          </div>
        </main>
      )}

      {/* PAGE 6: BENCHMARKS */}
      {activeTab === 'benchmarks' && (
        <main className="flex-1 py-16 px-6 max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-300">
          <span className="text-xs font-mono font-bold text-sky-600 uppercase">Page 6 of 10 &bull; Performance</span>
          <h2 className="text-3xl font-black text-slate-900">Independent Hardware Benchmarks</h2>
          <p className="text-xs text-slate-600">Verified 120 FPS sub-millisecond execution on standard Apple Silicon M-series and Nvidia RTX Ada chips.</p>
        </main>
      )}

      {/* PAGE 7: SHOWCASE */}
      {activeTab === 'showcase' && (
        <main className="flex-1 py-16 px-6 max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-300">
          <span className="text-xs font-mono font-bold text-sky-600 uppercase">Page 7 of 10 &bull; Case Studies</span>
          <h2 className="text-3xl font-black text-slate-900">Industrial Deployments</h2>
          <p className="text-xs text-slate-600">Deployed across 14 surgical operating rooms and 8 aerospace manufacturing cleanrooms globally.</p>
        </main>
      )}

      {/* PAGE 8: HARDWARE */}
      {activeTab === 'hardware' && (
        <main className="flex-1 py-16 px-6 max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-300">
          <span className="text-xs font-mono font-bold text-sky-600 uppercase">Page 8 of 10 &bull; Sensors</span>
          <h2 className="text-3xl font-black text-slate-900">Integrated Optoelectronic Sensor Suite</h2>
          <p className="text-xs text-slate-600">Solid-state FMCW lidar array combined with 4K stereoscopic machine-vision cameras.</p>
        </main>
      )}

      {/* PAGE 9: SANDBOX */}
      {activeTab === 'sandbox' && (
        <main className="flex-1 py-16 px-6 max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-300">
          <span className="text-xs font-mono font-bold text-sky-600 uppercase">Page 9 of 10 &bull; Sandbox</span>
          <h2 className="text-3xl font-black text-slate-900">Interactive Parameter Sandbox</h2>
          <p className="text-xs text-slate-600">Live parameter simulation playground for custom robotics kinematics configurations.</p>
        </main>
      )}

      {/* PAGE 10: LICENSING */}
      {activeTab === 'licensing' && (
        <main className="flex-1 py-16 px-6 max-w-xl mx-auto w-full space-y-6 text-center animate-in fade-in duration-300 font-mono">
          <span className="text-xs font-bold text-sky-600 uppercase">Page 10 of 10 &bull; Production Dev Kit</span>
          <h2 className="text-3xl font-black font-sans text-slate-900">Request Enterprise Dev Kit</h2>
          <button onClick={() => onUseDesign(template)} className="px-8 py-3.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md">
            Transmit Dev Kit Inquiry &rarr;
          </button>
        </main>
      )}

      <footer className="mt-auto py-8 text-center text-xs font-mono text-slate-500 border-t border-sky-200 bg-white/70">
        &copy; {new Date().getFullYear()} {template.sampleBusinessName} &bull; Luminous Sky &amp; Electric Cyan ({template.templateCode}) &bull; 10 Full Dedicated Pages.
      </footer>
    </div>
  );
};

// ============================================================================
// TEMPLATE 17: Cinematic Agency (CineMagna Motion Pictures)
// Dominant: Sunlit Warm Amber (#FFFBEB) | Radiant Coral (#EA580C)
// Bright widescreen cinema aesthetic with 10 DEDICATED PAGES
// ============================================================================
export const CinematicAgencyDemo: React.FC<TemplateDemoProps> = ({ template, onUseDesign, externalActivePage, onPageChange }) => {
  const [internalTab, setInternalTab] = useState<string>('reel');
  const activeTab = externalActivePage || internalTab;

  const navigateTo = (tab: string) => {
    setInternalTab(tab);
    if (onPageChange) onPageChange(tab);
  };

  const pages = [
    { id: 'reel', label: '1. Director Reel' },
    { id: 'commercials', label: '2. Commercials' },
    { id: 'narrative', label: '3. Narrative Films' },
    { id: 'vfx', label: '4. Motion VFX' },
    { id: 'audio', label: '5. Atmos Sound' },
    { id: 'crew', label: '6. Directors & Crew' },
    { id: 'awards', label: '7. Festival Awards' },
    { id: 'roster', label: '8. Brand Roster' },
    { id: 'studios', label: '9. Soundstages' },
    { id: 'commission', label: '10. Direct Booking' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFBEB] via-[#FEF3C7] to-[#FFFFFF] text-[#451A03] font-serif flex flex-col selection:bg-amber-600 selection:text-white">
      <header className="px-8 py-5 border-b border-amber-200 bg-white/90 backdrop-blur-md sticky top-0 z-30 shadow-xs flex items-center justify-between">
        <button onClick={() => navigateTo('reel')} className="font-black text-lg tracking-wider text-amber-900">
          CINEMAGNA
        </button>

        <div className="hidden xl:flex items-center gap-1 font-sans text-xs font-bold">
          {pages.map((p) => (
            <button
              key={p.id}
              onClick={() => navigateTo(p.id)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeTab === p.id ? 'bg-amber-600 text-white' : 'text-amber-900 hover:bg-amber-100'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <button onClick={() => navigateTo('commission')} className="px-4 py-2 bg-amber-600 text-white font-sans text-xs font-bold rounded-lg hover:bg-amber-700">
          Commission &rarr;
        </button>
      </header>

      {/* Mobile Page Navigator Strip */}
      <div className="xl:hidden bg-amber-100/80 px-4 py-2 border-b border-amber-200 flex items-center gap-2 overflow-x-auto text-xs font-sans">
        {pages.map((p) => (
          <button
            key={p.id}
            onClick={() => navigateTo(p.id)}
            className={`px-3 py-1 rounded-md shrink-0 font-bold ${
              activeTab === p.id ? 'bg-amber-600 text-white' : 'bg-white text-stone-800'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {activeTab === 'reel' && (
        <main className="flex-1 py-16 px-8 max-w-6xl mx-auto w-full space-y-8 animate-in fade-in duration-300">
          <span className="font-sans text-xs font-bold tracking-widest text-amber-700 uppercase">Page 1 of 10 &bull; 2.39:1 Anamorphic Hero</span>
          <h1 className="text-4xl sm:text-7xl font-light text-stone-900 leading-tight">
            Cinematic Imagery That Resonates Across Culture.
          </h1>
          <p className="font-sans text-sm text-stone-600 max-w-2xl">{template.tagline}</p>
          <div className="aspect-21/9 rounded-2xl overflow-hidden shadow-2xl border border-amber-200">
            <img src="https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80" alt="Cinematic Agency Reel" className="w-full h-full object-cover" />
          </div>
        </main>
      )}

      {activeTab === 'commercials' && (
        <main className="flex-1 py-16 px-8 max-w-5xl mx-auto w-full space-y-8 animate-in fade-in duration-300 font-sans">
          <span className="text-xs font-bold text-amber-700 uppercase">Page 2 of 10 &bull; Commercial Spots</span>
          <h2 className="text-3xl font-black text-stone-900">Global Commercial Broadcast Campaigns</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { client: 'Porsche AG', campaign: 'Taycan Turbo GT Launch', award: 'Cannes Lions Silver' },
              { client: 'Apple TV+', campaign: 'Original Series Title Sequence', award: 'D&AD Yellow Pencil' },
              { client: 'Rimowa', campaign: 'Never Still Global Documentary', award: 'AICP Winner' }
            ].map((c, i) => (
              <div key={i} className="p-6 bg-white border border-amber-200 rounded-2xl shadow-sm space-y-2">
                <span className="text-xs font-mono font-bold text-amber-700">{c.client}</span>
                <h4 className="font-bold text-base text-stone-900">{c.campaign}</h4>
                <p className="text-xs text-amber-600 font-bold">{c.award}</p>
              </div>
            ))}
          </div>
        </main>
      )}

      {activeTab === 'narrative' && (
        <main className="flex-1 py-16 px-8 max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-300 font-sans">
          <span className="text-xs font-bold text-amber-700 uppercase">Page 3 of 10 &bull; Feature Films</span>
          <h2 className="text-3xl font-black text-stone-900">Narrative &amp; Documentaries</h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            From 65mm large-format anamorphic photography to historical restoration, our feature production wing has premiered at Cannes, Venice, and Telluride.
          </p>
        </main>
      )}

      {activeTab === 'vfx' && (
        <main className="flex-1 py-16 px-8 max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-300 font-sans">
          <span className="text-xs font-bold text-amber-700 uppercase">Page 4 of 10 &bull; In-Camera VFX</span>
          <h2 className="text-3xl font-black text-stone-900">Virtual Production Volume Stages</h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            Real-time parallax tracking driven by Unreal Engine 5.4 on our 360-degree curved LED stage in London.
          </p>
        </main>
      )}

      {activeTab === 'audio' && (
        <main className="flex-1 py-16 px-8 max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-300 font-sans">
          <span className="text-xs font-bold text-amber-700 uppercase">Page 5 of 10 &bull; Spatial Audio</span>
          <h2 className="text-3xl font-black text-stone-900">Dolby Atmos 9.1.4 Mixing Theaters</h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            Certified Dolby Atmos theatrical mastering suites featuring PMC monitoring and bespoke analog mastering chains.
          </p>
        </main>
      )}

      {activeTab === 'crew' && (
        <main className="flex-1 py-16 px-8 max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-300 font-sans">
          <span className="text-xs font-bold text-amber-700 uppercase">Page 6 of 10 &bull; Directors &amp; Cinematographers</span>
          <h2 className="text-3xl font-black text-stone-900">Exclusive Talent Roster</h2>
          <p className="text-sm text-stone-600 leading-relaxed">
            Representing 18 commercial and documentary filmmakers across the US, UK, and Scandinavia.
          </p>
        </main>
      )}

      {activeTab === 'awards' && (
        <main className="flex-1 py-16 px-8 max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-300 font-sans">
          <span className="text-xs font-bold text-amber-700 uppercase">Page 7 of 10 &bull; Recognition</span>
          <h2 className="text-3xl font-black text-stone-900">Festival Honors &amp; Awards</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-6 bg-white rounded-2xl border border-amber-200 shadow-xs"><div className="text-3xl font-bold text-amber-700">14</div>Cannes Lions</div>
            <div className="p-6 bg-white rounded-2xl border border-amber-200 shadow-xs"><div className="text-3xl font-bold text-amber-700">8</div>D&amp;AD Pencils</div>
            <div className="p-6 bg-white rounded-2xl border border-amber-200 shadow-xs"><div className="text-3xl font-bold text-amber-700">3</div>BAFTA Craft</div>
            <div className="p-6 bg-white rounded-2xl border border-amber-200 shadow-xs"><div className="text-3xl font-bold text-amber-700">22</div>Clios</div>
          </div>
        </main>
      )}

      {activeTab === 'roster' && (
        <main className="flex-1 py-16 px-8 max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-300 font-sans">
          <span className="text-xs font-bold text-amber-700 uppercase">Page 8 of 10 &bull; Clients</span>
          <h2 className="text-3xl font-black text-stone-900">Global Brand Collaborations</h2>
          <p className="text-sm text-stone-600 leading-relaxed">Trusted by world-leading creative agencies: Droga5, Wieden+Kennedy, BBDO, and Ogilvy.</p>
        </main>
      )}

      {activeTab === 'studios' && (
        <main className="flex-1 py-16 px-8 max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-300 font-sans">
          <span className="text-xs font-bold text-amber-700 uppercase">Page 9 of 10 &bull; Facilities</span>
          <h2 className="text-3xl font-black text-stone-900">40,000 Sq Ft Stage Facilities</h2>
          <p className="text-sm text-stone-600 leading-relaxed">Equipped with Bolt X high-speed motion control rigs, Phantom 4K Flex cameras, and greenroom suites.</p>
        </main>
      )}

      {activeTab === 'commission' && (
        <main className="flex-1 py-16 px-8 max-w-xl mx-auto w-full space-y-6 text-center animate-in fade-in duration-300 font-sans">
          <span className="text-xs font-bold text-amber-700 uppercase">Page 10 of 10 &bull; Booking</span>
          <h2 className="text-3xl font-serif text-stone-900">Direct Director Commission Desk</h2>
          <button onClick={() => onUseDesign(template)} className="px-8 py-3 bg-amber-600 text-white font-bold text-xs rounded hover:bg-amber-700">
            Initiate Production RFP &rarr;
          </button>
        </main>
      )}

      <footer className="mt-auto py-8 text-center text-xs font-sans text-stone-500 border-t border-amber-200 bg-white/60">
        &copy; {new Date().getFullYear()} {template.sampleBusinessName} &bull; Sunlit Amber &amp; Radiant Coral ({template.templateCode}) &bull; 10 Full Dedicated Pages.
      </footer>
    </div>
  );
};

// ============================================================================
// TEMPLATE 18: Neon Innovation (Krypton Quantum Defense)
// Dominant: Bright Cyber-Mint (#F0FDF4) | Radiant Acid-Lime (#65A30D)
// Luminous high-tech cybersecurity lab with 10 DEDICATED PAGES
// ============================================================================
export const NeonInnovationDemo: React.FC<TemplateDemoProps> = ({ template, onUseDesign, externalActivePage, onPageChange }) => {
  const [internalTab, setInternalTab] = useState<string>('terminal');
  const activeTab = externalActivePage || internalTab;

  const navigateTo = (tab: string) => {
    setInternalTab(tab);
    if (onPageChange) onPageChange(tab);
  };

  const pages = [
    { id: 'terminal', label: '1. Command Center' },
    { id: 'grid', label: '2. Network Grid' },
    { id: 'vault', label: '3. Quantum Vault' },
    { id: 'telemetry', label: '4. Threat Telemetry' },
    { id: 'edge', label: '5. Edge Nodes' },
    { id: 'sla', label: '6. 45s SLA' },
    { id: 'compliance', label: '7. SOC2 Compliance' },
    { id: 'intel', label: '8. Threat Intel' },
    { id: 'api', label: '9. API Docs' },
    { id: 'provision', label: '10. Provision Cluster' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0FDF4] via-[#DCFCE7] to-[#FFFFFF] text-[#064E3B] font-mono flex flex-col selection:bg-emerald-600 selection:text-white">
      {/* Live SLA Header */}
      <div className="bg-[#E6F4EA] px-6 py-2 border-b border-emerald-200 text-[11px] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />LATENCY: <strong>14.2ms</strong></span>
          <span>UPTIME SLA: <strong>99.999%</strong></span>
        </div>
        <span className="text-emerald-700 font-bold hidden sm:inline">ZERO-TRUST ENCLAVE ACTIVE</span>
      </div>

      <header className="px-6 py-4 border-b border-emerald-200 bg-white/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between shadow-xs">
        <button onClick={() => navigateTo('terminal')} className="font-black text-sm text-emerald-800">
          KRYPTON_QUANTUM_DEFENSE
        </button>

        <div className="hidden xl:flex items-center gap-1 text-[11px] font-bold">
          {pages.map((p) => (
            <button
              key={p.id}
              onClick={() => navigateTo(p.id)}
              className={`px-2 py-1 rounded transition-all ${
                activeTab === p.id ? 'bg-emerald-600 text-white' : 'text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <button onClick={() => navigateTo('provision')} className="px-3.5 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded shadow-xs hover:bg-emerald-700">
          Deploy &rarr;
        </button>
      </header>

      {/* Mobile Page Navigator Strip */}
      <div className="xl:hidden bg-emerald-100 px-4 py-2 border-b border-emerald-200 flex items-center gap-2 overflow-x-auto text-xs">
        {pages.map((p) => (
          <button
            key={p.id}
            onClick={() => navigateTo(p.id)}
            className={`px-3 py-1 rounded shrink-0 font-bold ${
              activeTab === p.id ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-900'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {activeTab === 'terminal' && (
        <main className="flex-1 py-16 px-6 max-w-5xl mx-auto w-full space-y-8 animate-in fade-in duration-300">
          <span className="text-xs text-emerald-700 uppercase font-bold">Page 1 of 10 &bull; Real-Time Diagnostics</span>
          <h1 className="text-3xl sm:text-5xl font-black text-emerald-950">
            Post-Quantum Lattice Cryptography &amp; Threat Defense.
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed">{template.tagline}</p>
          <div className="p-6 bg-white border border-emerald-200 rounded-2xl shadow-sm space-y-2 text-xs">
            <div className="text-emerald-700 font-bold">&gt; system_check --all-nodes</div>
            <div className="text-slate-600">[OK] 340 edge points verified. Zero unmitigated anomalies in the last 24h.</div>
          </div>
        </main>
      )}

      {activeTab === 'grid' && (
        <main className="flex-1 py-16 px-6 max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-300">
          <span className="text-xs text-emerald-700 uppercase font-bold">Page 2 of 10 &bull; Topology</span>
          <h2 className="text-2xl font-black text-emerald-950">340 Zero-Trust Global Edge Grid</h2>
          <p className="text-xs text-slate-600">Dynamic routing and automated BGP Anycast mesh with instant failover.</p>
        </main>
      )}

      {activeTab === 'vault' && (
        <main className="flex-1 py-16 px-6 max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-300">
          <span className="text-xs text-emerald-700 uppercase font-bold">Page 3 of 10 &bull; Cryptographic Enclave</span>
          <h2 className="text-2xl font-black text-emerald-950">Kyber-1024 HSM Enclave</h2>
          <p className="text-xs text-slate-600">Hardware security modules rated FIPS 140-3 Level 4 for critical infrastructure.</p>
        </main>
      )}

      {activeTab === 'telemetry' && (
        <main className="flex-1 py-16 px-6 max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-300">
          <span className="text-xs text-emerald-700 uppercase font-bold">Page 4 of 10 &bull; Live Telemetry</span>
          <h2 className="text-2xl font-black text-emerald-950">Terabit-Scale DDoS Mitigation</h2>
          <p className="text-xs text-slate-600">Inline deep packet inspection mitigating Volumetric and Layer-7 HTTP flood attacks.</p>
        </main>
      )}

      {activeTab === 'edge' && (
        <main className="flex-1 py-16 px-6 max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-300">
          <span className="text-xs text-emerald-700 uppercase font-bold">Page 5 of 10 &bull; Edge Compute</span>
          <h2 className="text-2xl font-black text-emerald-950">Low-Latency Wasm Edge Workers</h2>
          <p className="text-xs text-slate-600">Execute zero-trust authorization logic in under 2ms directly on incoming requests.</p>
        </main>
      )}

      {activeTab === 'sla' && (
        <main className="flex-1 py-16 px-6 max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-300">
          <span className="text-xs text-emerald-700 uppercase font-bold">Page 6 of 10 &bull; Service Agreement</span>
          <h2 className="text-2xl font-black text-emerald-950">45-Second Mitigation SLA</h2>
          <p className="text-xs text-slate-600">Backed by financial penalties and contractual 99.999% uptime guarantees.</p>
        </main>
      )}

      {activeTab === 'compliance' && (
        <main className="flex-1 py-16 px-6 max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-300">
          <span className="text-xs text-emerald-700 uppercase font-bold">Page 7 of 10 &bull; Certifications</span>
          <h2 className="text-2xl font-black text-emerald-950">SOC2 Type II &amp; ISO 27001 Certified</h2>
          <p className="text-xs text-slate-600">Continuous automated audit verification with downloadable third-party auditor attestation reports.</p>
        </main>
      )}

      {activeTab === 'intel' && (
        <main className="flex-1 py-16 px-6 max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-300">
          <span className="text-xs text-emerald-700 uppercase font-bold">Page 8 of 10 &bull; Threat Intelligence</span>
          <h2 className="text-2xl font-black text-emerald-950">Global Zero-Day Vulnerability Feed</h2>
          <p className="text-xs text-slate-600">Real-time threat signatures synchronized across all protected clusters every 30 seconds.</p>
        </main>
      )}

      {activeTab === 'api' && (
        <main className="flex-1 py-16 px-6 max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-300">
          <span className="text-xs text-emerald-700 uppercase font-bold">Page 9 of 10 &bull; Developer API</span>
          <h2 className="text-2xl font-black text-emerald-950">REST, gRPC &amp; Terraform Providers</h2>
          <div className="p-4 bg-white border border-emerald-200 rounded-xl text-xs">
            <code>terraform &#123; required_providers &#123; krypton = &#123; source = &quot;krypton/defense&quot; &#125; &#125; &#125;</code>
          </div>
        </main>
      )}

      {activeTab === 'provision' && (
        <main className="flex-1 py-16 px-6 max-w-xl mx-auto w-full space-y-6 text-center animate-in fade-in duration-300">
          <span className="text-xs text-emerald-700 uppercase font-bold">Page 10 of 10 &bull; Gateway</span>
          <h2 className="text-2xl font-black text-emerald-950">Instant Cluster Provisioning</h2>
          <button onClick={() => onUseDesign(template)} className="px-8 py-3 bg-emerald-600 text-white font-bold text-xs rounded hover:bg-emerald-700">
            Initiate Enclave Deployment &rarr;
          </button>
        </main>
      )}

      <footer className="mt-auto py-8 text-center text-xs text-emerald-700 border-t border-emerald-200 bg-white/70">
        &copy; {new Date().getFullYear()} {template.sampleBusinessName} &bull; Bright Cyber-Mint &amp; Acid-Lime ({template.templateCode}) &bull; 10 Full Dedicated Pages.
      </footer>
    </div>
  );
};

// ============================================================================
// TEMPLATE 19: Interactive Orbital (Cosmos Orbital Constellation)
// Dominant: Bright Celestial Sky (#FAF5FF) | Cosmic Rose & Violet (#9333EA)
// Luminous orbital constellation hub with 10 DEDICATED PAGES
// ============================================================================
export const InteractiveOrbitalDemo: React.FC<TemplateDemoProps> = ({ template, onUseDesign, externalActivePage, onPageChange }) => {
  const [internalTab, setInternalTab] = useState<string>('orbit');
  const activeTab = externalActivePage || internalTab;

  const navigateTo = (tab: string) => {
    setInternalTab(tab);
    if (onPageChange) onPageChange(tab);
  };

  const pages = [
    { id: 'orbit', label: '1. Celestial Hub' },
    { id: 'nodes', label: '2. Satellite Fleet' },
    { id: 'constellation', label: '3. Optical Links' },
    { id: 'downlink', label: '4. Laser Downlink' },
    { id: 'command', label: '5. Mission Flight' },
    { id: 'cislunar', label: '6. Cislunar Relay' },
    { id: 'algorithms', label: '7. Edge Space AI' },
    { id: 'ground', label: '8. Ground Stations' },
    { id: 'simulation', label: '9. Orbit Simulator' },
    { id: 'launch', label: '10. Launch Mandate' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF5FF] via-[#F3E8FF] to-[#FFFFFF] text-[#3B0764] font-sans flex flex-col selection:bg-purple-600 selection:text-white">
      <header className="px-8 py-5 border-b border-purple-200 bg-white/90 backdrop-blur-md sticky top-0 z-30 shadow-xs flex items-center justify-between">
        <button onClick={() => navigateTo('orbit')} className="font-extrabold text-sm tracking-widest text-purple-900 uppercase">
          COSMOS_ORBITAL
        </button>

        <div className="hidden xl:flex items-center gap-1 font-mono text-[11px] font-bold">
          {pages.map((p) => (
            <button
              key={p.id}
              onClick={() => navigateTo(p.id)}
              className={`px-2 py-1 rounded transition-all ${
                activeTab === p.id ? 'bg-purple-600 text-white' : 'text-purple-900 hover:bg-purple-100'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <button onClick={() => navigateTo('launch')} className="px-4 py-2 bg-purple-600 text-white font-mono text-xs font-bold rounded-lg hover:bg-purple-700">
          Launch &rarr;
        </button>
      </header>

      {/* Mobile Page Navigator Strip */}
      <div className="xl:hidden bg-purple-100 px-4 py-2 border-b border-purple-200 flex items-center gap-2 overflow-x-auto text-xs font-mono">
        {pages.map((p) => (
          <button
            key={p.id}
            onClick={() => navigateTo(p.id)}
            className={`px-3 py-1 rounded shrink-0 font-bold ${
              activeTab === p.id ? 'bg-purple-600 text-white' : 'bg-white text-purple-900'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {activeTab === 'orbit' && (
        <main className="flex-1 py-16 px-8 max-w-5xl mx-auto w-full space-y-8 animate-in fade-in duration-300 text-center">
          <span className="text-xs font-mono font-bold text-purple-700 uppercase">Page 1 of 10 &bull; Orbital Gravity Hub</span>
          <h1 className="text-4xl sm:text-6xl font-black text-purple-950 tracking-tight leading-tight">
            Low-Earth Orbit Broadband &amp; Optical Satellite Relays.
          </h1>
          <p className="text-sm text-stone-600 max-w-xl mx-auto">{template.tagline}</p>
          <div className="p-8 bg-white border border-purple-200 rounded-3xl shadow-lg max-w-md mx-auto space-y-4">
            <div className="w-20 h-20 rounded-full bg-purple-600 text-white mx-auto flex items-center justify-center font-bold text-xs">
              ORBIT
            </div>
            <div className="text-xs font-mono font-bold text-purple-900">72 Active Constellation Satellites Synchronized</div>
          </div>
        </main>
      )}

      {activeTab === 'nodes' && (
        <main className="flex-1 py-16 px-8 max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-300 font-mono">
          <span className="text-xs text-purple-700 uppercase font-bold">Page 2 of 10 &bull; Satellite Fleet</span>
          <h2 className="text-3xl font-black text-purple-950">72 LEO Micro-Satellites</h2>
          <p className="text-xs text-stone-600 leading-relaxed">Operated in Sun-Synchronous Orbits at 550km altitude with dual Hall-effect plasma thrusters.</p>
        </main>
      )}

      {activeTab === 'constellation' && (
        <main className="flex-1 py-16 px-8 max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-300 font-mono">
          <span className="text-xs text-purple-700 uppercase font-bold">Page 3 of 10 &bull; Cross-Links</span>
          <h2 className="text-3xl font-black text-purple-950">100 Gbps Laser Inter-Satellite Links</h2>
          <p className="text-xs text-stone-600 leading-relaxed">Optical space cross-links eliminating terrestrial routing hops for ultra-low latency worldwide transmission.</p>
        </main>
      )}

      {activeTab === 'downlink' && (
        <main className="flex-1 py-16 px-8 max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-300 font-mono">
          <span className="text-xs text-purple-700 uppercase font-bold">Page 4 of 10 &bull; Direct Downlink</span>
          <h2 className="text-3xl font-black text-purple-950">High-Throughput Ground Downlink</h2>
          <p className="text-xs text-stone-600 leading-relaxed">Ka-band and optical laser ground stations delivering 10 Gbps peak download bandwidth to customer terminals.</p>
        </main>
      )}

      {activeTab === 'command' && (
        <main className="flex-1 py-16 px-8 max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-300 font-mono">
          <span className="text-xs text-purple-700 uppercase font-bold">Page 5 of 10 &bull; Mission Operations</span>
          <h2 className="text-3xl font-black text-purple-950">Autonomous Flight Dynamics</h2>
          <p className="text-xs text-stone-600 leading-relaxed">Automated orbital conjunction avoidance and real-time space debris maneuvering algorithms.</p>
        </main>
      )}

      {activeTab === 'cislunar' && (
        <main className="flex-1 py-16 px-8 max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-300 font-mono">
          <span className="text-xs text-purple-700 uppercase font-bold">Page 6 of 10 &bull; Deep Space</span>
          <h2 className="text-3xl font-black text-purple-950">Cislunar Communications Architecture</h2>
          <p className="text-xs text-stone-600 leading-relaxed">Lunar orbital relay network supporting crewed Artemis lunar base operations and payload telemetry.</p>
        </main>
      )}

      {activeTab === 'algorithms' && (
        <main className="flex-1 py-16 px-8 max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-300 font-mono">
          <span className="text-xs text-purple-700 uppercase font-bold">Page 7 of 10 &bull; Edge AI Payloads</span>
          <h2 className="text-3xl font-black text-purple-950">Radiation-Tolerant Neural Accelerators</h2>
          <p className="text-xs text-stone-600 leading-relaxed">Onboard hyperspectral image filtering and real-time weather pattern detection directly in orbit.</p>
        </main>
      )}

      {activeTab === 'ground' && (
        <main className="flex-1 py-16 px-8 max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-300 font-mono">
          <span className="text-xs text-purple-700 uppercase font-bold">Page 8 of 10 &bull; Global Stations</span>
          <h2 className="text-3xl font-black text-purple-950">18 Earth Ground Stations</h2>
          <p className="text-xs text-stone-600 leading-relaxed">Distributed terrestrial array across Svalbard, Hawaii, Chile, South Africa, and Western Australia.</p>
        </main>
      )}

      {activeTab === 'simulation' && (
        <main className="flex-1 py-16 px-8 max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-300 font-mono">
          <span className="text-xs text-purple-700 uppercase font-bold">Page 9 of 10 &bull; Orbital Mechanics</span>
          <h2 className="text-3xl font-black text-purple-950">Orbital Trajectory Simulation</h2>
          <p className="text-xs text-stone-600 leading-relaxed">Interactive simulation of inclination angle, apogee, perigee, and atmospheric drag decay.</p>
        </main>
      )}

      {activeTab === 'launch' && (
        <main className="flex-1 py-16 px-8 max-w-xl mx-auto w-full space-y-6 text-center animate-in fade-in duration-300 font-mono">
          <span className="text-xs text-purple-700 uppercase font-bold">Page 10 of 10 &bull; Launch Mandate</span>
          <h2 className="text-2xl font-black text-purple-950">Mission Payload Reservation</h2>
          <button onClick={() => onUseDesign(template)} className="px-8 py-3 bg-purple-600 text-white font-bold text-xs rounded hover:bg-purple-700">
            Submit Launch Mandate &rarr;
          </button>
        </main>
      )}

      <footer className="mt-auto py-8 text-center text-xs font-mono text-purple-600 border-t border-purple-200 bg-white/60">
        &copy; {new Date().getFullYear()} {template.sampleBusinessName} &bull; Bright Celestial Sky &amp; Cosmic Rose ({template.templateCode}) &bull; 10 Full Dedicated Pages.
      </footer>
    </div>
  );
};

// ============================================================================
// TEMPLATE 20: Futuristic Spatial (Aether Spatial Environments)
// Dominant: Sun-Drenched Spatial Cream (#FFF7ED) | Warm Copper (#EA580C)
// Bright architectural spatial depth canvas with 10 DEDICATED PAGES
// ============================================================================
export const FuturisticSpatialDemo: React.FC<TemplateDemoProps> = ({ template, onUseDesign, externalActivePage, onPageChange }) => {
  const [internalTab, setInternalTab] = useState<string>('canvas');
  const activeTab = externalActivePage || internalTab;

  const navigateTo = (tab: string) => {
    setInternalTab(tab);
    if (onPageChange) onPageChange(tab);
  };

  const pages = [
    { id: 'canvas', label: '1. Spatial Canvas' },
    { id: 'environments', label: '2. Volumetric Twins' },
    { id: 'haptics', label: '3. Haptic Feedback' },
    { id: 'acoustics', label: '4. Ray-Traced Audio' },
    { id: 'gestures', label: '5. Biometric Gestures' },
    { id: 'industrial', label: '6. Industrial Twins' },
    { id: 'cases', label: '7. Enterprise HQs' },
    { id: 'hardware', label: '8. 6DoF Hardware' },
    { id: 'ergonomics', label: '9. Ergonomics' },
    { id: 'consultation', label: '10. Consultation Desk' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF7ED] via-[#FFEDD5] to-[#FFFFFF] text-[#431407] font-sans flex flex-col selection:bg-orange-600 selection:text-white">
      <header className="px-8 py-5 border-b border-orange-200 bg-white/90 backdrop-blur-md sticky top-0 z-30 shadow-xs flex items-center justify-between">
        <button onClick={() => navigateTo('canvas')} className="font-black text-sm tracking-widest text-orange-950 uppercase font-mono">
          AETHER_SPATIAL
        </button>

        <div className="hidden xl:flex items-center gap-1 font-mono text-[11px] font-bold">
          {pages.map((p) => (
            <button
              key={p.id}
              onClick={() => navigateTo(p.id)}
              className={`px-2 py-1 rounded transition-all ${
                activeTab === p.id ? 'bg-orange-600 text-white' : 'text-orange-900 hover:bg-orange-100'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <button onClick={() => navigateTo('consultation')} className="px-4 py-2 bg-orange-600 text-white font-mono text-xs font-bold rounded-lg hover:bg-orange-700">
          Inquire &rarr;
        </button>
      </header>

      {/* Mobile Page Navigator Strip */}
      <div className="xl:hidden bg-orange-100 px-4 py-2 border-b border-orange-200 flex items-center gap-2 overflow-x-auto text-xs font-mono">
        {pages.map((p) => (
          <button
            key={p.id}
            onClick={() => navigateTo(p.id)}
            className={`px-3 py-1 rounded shrink-0 font-bold ${
              activeTab === p.id ? 'bg-orange-600 text-white' : 'bg-white text-orange-900'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {activeTab === 'canvas' && (
        <main className="flex-1 py-16 px-8 max-w-5xl mx-auto w-full space-y-8 animate-in fade-in duration-300">
          <span className="font-mono text-xs text-orange-700 uppercase font-bold">Page 1 of 10 &bull; Volumetric Architecture</span>
          <h1 className="text-4xl sm:text-6xl font-black text-stone-900 leading-tight">
            Immersive Digital Architecture &amp; Spatial Virtual Headquarters.
          </h1>
          <p className="text-sm text-stone-600 max-w-xl">{template.tagline}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {['Volumetric Headquarters', 'Tactile Multi-User Pavilions', 'Photorealistic Product Twins'].map((card, i) => (
              <div key={i} className="p-6 bg-white border border-orange-200 rounded-2xl shadow-sm space-y-2">
                <span className="font-mono text-xs text-orange-600">ISOMETRIC PLANE 0{i + 1}</span>
                <h4 className="font-bold text-base text-stone-900">{card}</h4>
                <p className="text-xs text-stone-600">Designed for VisionOS and WebXR multi-user spatial presence.</p>
              </div>
            ))}
          </div>
        </main>
      )}

      {activeTab === 'environments' && (
        <main className="flex-1 py-16 px-8 max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-300 font-sans">
          <span className="font-mono text-xs text-orange-700 uppercase font-bold">Page 2 of 10 &bull; Volumetric Twins</span>
          <h2 className="text-3xl font-black text-stone-900">Enterprise Digital Twin Workspaces</h2>
          <p className="text-xs text-stone-600 leading-relaxed">Photorealistic 3D spatial environments allowing distributed global executive teams to collaborate in shared spatial rooms.</p>
        </main>
      )}

      {activeTab === 'haptics' && (
        <main className="flex-1 py-16 px-8 max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-300 font-sans">
          <span className="font-mono text-xs text-orange-700 uppercase font-bold">Page 3 of 10 &bull; Mid-Air Haptics</span>
          <h2 className="text-3xl font-black text-stone-900">Ultrasonic Acoustic Force Feedback</h2>
          <p className="text-xs text-stone-600 leading-relaxed">Feel virtual controls, switches, and textures in mid-air with focused ultrasonic wave transducers without gloves.</p>
        </main>
      )}

      {activeTab === 'acoustics' && (
        <main className="flex-1 py-16 px-8 max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-300 font-sans">
          <span className="font-mono text-xs text-orange-700 uppercase font-bold">Page 4 of 10 &bull; 6DoF Audio</span>
          <h2 className="text-3xl font-black text-stone-900">Ray-Traced Acoustic Physics</h2>
          <p className="text-xs text-stone-600 leading-relaxed">Dynamic binaural sound reflections, room absorption, and Doppler shifts rendered based on exact physical materials.</p>
        </main>
      )}

      {activeTab === 'gestures' && (
        <main className="flex-1 py-16 px-8 max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-300 font-sans">
          <span className="font-mono text-xs text-orange-700 uppercase font-bold">Page 5 of 10 &bull; Micro-Gestures</span>
          <h2 className="text-3xl font-black text-stone-900">Sub-Millimeter Biometric Gesture Tracking</h2>
          <p className="text-xs text-stone-600 leading-relaxed">24-joint optical skeletal tracking supporting discrete micro-pinches, swipes, and wrist rotation commands.</p>
        </main>
      )}

      {activeTab === 'industrial' && (
        <main className="flex-1 py-16 px-8 max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-300 font-sans">
          <span className="font-mono text-xs text-orange-700 uppercase font-bold">Page 6 of 10 &bull; CAD Pipeline</span>
          <h2 className="text-3xl font-black text-stone-900">Direct STEP &amp; IGES CAD Ingestion</h2>
          <p className="text-xs text-stone-600 leading-relaxed">Automated polygon decimation and texture baking for million-part aerospace and automotive assemblies.</p>
        </main>
      )}

      {activeTab === 'cases' && (
        <main className="flex-1 py-16 px-8 max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-300 font-sans">
          <span className="font-mono text-xs text-orange-700 uppercase font-bold">Page 7 of 10 &bull; Deployments</span>
          <h2 className="text-3xl font-black text-stone-900">Fortune 500 Virtual HQs</h2>
          <p className="text-xs text-stone-600 leading-relaxed">Deployed for sovereign wealth funds, pharmaceutical discovery labs, and architectural design institutes.</p>
        </main>
      )}

      {activeTab === 'hardware' && (
        <main className="flex-1 py-16 px-8 max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-300 font-sans">
          <span className="font-mono text-xs text-orange-700 uppercase font-bold">Page 8 of 10 &bull; Device Matrix</span>
          <h2 className="text-3xl font-black text-stone-900">VisionOS, Meta Quest Pro &amp; WebXR</h2>
          <p className="text-xs text-stone-600 leading-relaxed">Cross-platform WebXR standard ensuring seamless access on head-mounted displays, iPads, and standard desktop browsers.</p>
        </main>
      )}

      {activeTab === 'ergonomics' && (
        <main className="flex-1 py-16 px-8 max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-300 font-sans">
          <span className="font-mono text-xs text-orange-700 uppercase font-bold">Page 9 of 10 &bull; Comfort Metrics</span>
          <h2 className="text-3xl font-black text-stone-900">Zero-Motion-Sickness Certification</h2>
          <p className="text-xs text-stone-600 leading-relaxed">Guaranteed motion-to-photon latency under 11ms with fixed horizon reference anchors for long-session comfort.</p>
        </main>
      )}

      {activeTab === 'consultation' && (
        <main className="flex-1 py-16 px-8 max-w-xl mx-auto w-full space-y-6 text-center animate-in fade-in duration-300 font-mono">
          <span className="text-xs text-orange-700 uppercase font-bold">Page 10 of 10 &bull; Spatial Advisory</span>
          <h2 className="text-2xl font-black text-stone-900">Spatial Architecture Consultation</h2>
          <button onClick={() => onUseDesign(template)} className="px-8 py-3 bg-orange-600 text-white font-bold text-xs rounded hover:bg-orange-700">
            Schedule Spatial Discovery &rarr;
          </button>
        </main>
      )}

      <footer className="mt-auto py-8 text-center text-xs font-mono text-orange-700 border-t border-orange-200 bg-white/60">
        &copy; {new Date().getFullYear()} {template.sampleBusinessName} &bull; Sun-Drenched Spatial Cream &amp; Copper ({template.templateCode}) &bull; 10 Full Dedicated Pages.
      </footer>
    </div>
  );
};
