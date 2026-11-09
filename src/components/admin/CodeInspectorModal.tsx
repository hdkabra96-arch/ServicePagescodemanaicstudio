/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  FileCode,
  FileText,
  Package,
  Layers,
  ExternalLink,
  Code2
} from 'lucide-react';
import {
  TemplateCatalogItem,
  getTemplateProjectFiles,
  downloadSingleTemplateZip,
  StandaloneProjectFile
} from '../../services/templateCodeExporter';

interface CodeInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: TemplateCatalogItem | null;
  onOpenPreview?: (template: TemplateCatalogItem) => void;
  onDownload?: () => Promise<void> | void;
}

export const CodeInspectorModal: React.FC<CodeInspectorModalProps> = ({
  isOpen,
  onClose,
  template,
  onOpenPreview,
  onDownload
}) => {
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen || !template) return null;

  const files = getTemplateProjectFiles(template);
  const currentFile: StandaloneProjectFile = files[activeFileIndex] || files[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      if (onDownload) {
        await onDownload();
      } else {
        await downloadSingleTemplateZip(template);
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const getFileIcon = (path: string) => {
    if (path.endsWith('.json')) return <Package className="w-3.5 h-3.5 text-amber-500" />;
    if (path.endsWith('.md')) return <FileText className="w-3.5 h-3.5 text-blue-500" />;
    if (path.endsWith('.html')) return <Code2 className="w-3.5 h-3.5 text-orange-500" />;
    return <FileCode className="w-3.5 h-3.5 text-emerald-500" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-600/20 text-orange-500 border border-orange-500/30 flex items-center justify-center font-mono font-bold text-xs">
              {template.code}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base leading-tight">{template.name}</h3>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  {template.category}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Standalone Project Package &bull; {files.length} Files
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenPreview && (
              <button
                onClick={() => {
                  onClose();
                  onOpenPreview(template);
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-orange-400" />
                <span>Live Preview</span>
              </button>
            )}

            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/20 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloading ? 'Zipping...' : 'Download Full Code (.ZIP)'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-2"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: File Tree + Code Display */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* File Tree Sidebar */}
          <div className="w-64 bg-slate-950/60 border-r border-slate-800 flex flex-col shrink-0">
            <div className="px-4 py-3 border-b border-slate-800/80 text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              Project Manifest ({files.length} files)
            </div>

            <div className="p-2 space-y-1 overflow-y-auto flex-1 font-mono text-xs">
              {files.map((file, idx) => (
                <button
                  key={file.path}
                  onClick={() => setActiveFileIndex(idx)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                    activeFileIndex === idx
                      ? 'bg-orange-600/20 text-orange-400 border border-orange-500/30 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {getFileIcon(file.path)}
                  <span className="truncate">{file.path}</span>
                </button>
              ))}
            </div>

            <div className="p-3 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono">
              Ready for <code className="text-slate-400">npm run dev</code>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-900">
            
            {/* Editor Toolbar */}
            <div className="px-5 py-2.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40 text-xs font-mono">
              <div className="flex items-center gap-2 text-slate-300">
                {getFileIcon(currentFile.path)}
                <span className="font-bold">{currentFile.path}</span>
                <span className="text-slate-500 text-[11px]">
                  ({currentFile.content.split('\n').length} lines)
                </span>
              </div>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy File</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Preformatted Block */}
            <div className="flex-1 overflow-auto p-5 font-mono text-xs text-slate-300 bg-slate-950/80 leading-relaxed selection:bg-orange-500 selection:text-white">
              <pre className="overflow-x-auto whitespace-pre">
                {currentFile.content}
              </pre>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400 font-mono shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>Complete Runnable Source Code Package</span>
          </div>
          <div>
            Click <strong>Download Full Code (.ZIP)</strong> to save to your local computer
          </div>
        </div>

      </div>
    </div>
  );
};
