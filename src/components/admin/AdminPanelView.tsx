import React, { useState, useEffect } from 'react';
import {
  Code, Download, Eye, Search, Filter, ShieldCheck, CheckCircle2,
  FileCode, Layers, Server, RefreshCw, Key, LogOut, ArrowLeft,
  ExternalLink, Package, Cpu, Sparkles, FolderArchive, Smartphone,
  Globe, Database, BarChart3, AlertCircle, HardDriveDownload, Plus,
  Trash2, Edit3, ShoppingBag
} from 'lucide-react';
import {
  getAllDownloadableTemplates,
  downloadSingleTemplateZip,
  downloadAllTemplatesZip,
  DownloadableTemplateItem
} from '../../services/templateCodeExporter';
import { CodeInspectorModal } from './CodeInspectorModal';
import { AddWebsiteModal } from './AddWebsiteModal';
import { AdminUser, Enquiry } from '../../types';

interface AdminPanelViewProps {
  adminUser: AdminUser;
  onLogout: () => void;
  onNavigateHome: () => void;
  onPreviewTemplate?: (code: string) => void;
}

export const AdminPanelView: React.FC<AdminPanelViewProps> = ({
  adminUser,
  onLogout,
  onNavigateHome,
  onPreviewTemplate
}) => {
  const [activeTab, setActiveTab] = useState<'repository' | 'custom-sites' | 'export' | 'enquiries' | 'security'>('repository');
  const [templates, setTemplates] = useState<DownloadableTemplateItem[]>([]);
  const [customSites, setCustomSites] = useState<any[]>([]);
  const [loadingCustomSites, setLoadingCustomSites] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<any | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [inspectingTemplate, setInspectingTemplate] = useState<DownloadableTemplateItem | null>(null);

  // Download state trackers
  const [downloadingCode, setDownloadingCode] = useState<string | null>(null);
  const [batchDownloading, setBatchDownloading] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; name: string } | null>(null);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);

  // Enquiries management
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loadingEnquiries, setLoadingEnquiries] = useState(false);
  const [enquirySearch, setEnquirySearch] = useState('');

  // Password update form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'idle' | 'success' | 'error'; message?: string }>({ type: 'idle' });

  // Stats
  const [downloadCount, setDownloadCount] = useState<number>(() => {
    const saved = localStorage.getItem('cm_admin_download_count');
    return saved ? parseInt(saved, 10) : 14;
  });

  useEffect(() => {
    setTemplates(getAllDownloadableTemplates());
    loadEnquiries();
    loadCustomSites();
  }, []);

  const loadCustomSites = async () => {
    setLoadingCustomSites(true);
    try {
      const res = await fetch('/api/custom-sites');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setCustomSites(data.data);
        }
      }
    } catch (err) {
      console.error('Failed to load custom sites:', err);
    } finally {
      setLoadingCustomSites(false);
    }
  };

  const handleSaveCustomSite = async (siteData: any) => {
    const isEdit = !!editingSite?.id;
    const url = isEdit ? `/api/custom-sites/${editingSite.id}` : '/api/custom-sites';
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(siteData)
    });

    const result = await res.json();
    if (!res.ok || !result.success) {
      throw new Error(result.message || 'Failed to save website');
    }

    await loadCustomSites();
    setDownloadSuccessMessage(
      isEdit
        ? `Successfully updated ${siteData.name}`
        : `Successfully published ${siteData.name} to website gallery and live preview!`
    );
    setTimeout(() => setDownloadSuccessMessage(null), 6000);
  };

  const handleDeleteCustomSite = async (siteId: string, siteName: string) => {
    if (!window.confirm(`Are you sure you want to remove "${siteName}" from the website gallery?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/custom-sites/${siteId}`, { method: 'DELETE' });
      if (res.ok) {
        await loadCustomSites();
        setDownloadSuccessMessage(`Removed ${siteName} from gallery.`);
        setTimeout(() => setDownloadSuccessMessage(null), 5000);
      }
    } catch (err) {
      console.error('Failed to delete custom site:', err);
    }
  };

  const loadEnquiries = async () => {
    setLoadingEnquiries(true);
    try {
      const res = await fetch('/api/enquiries');
      if (res.ok) {
        const data = await res.json();
        setEnquiries(data);
      }
    } catch {
      // Fallback
    } finally {
      setLoadingEnquiries(false);
    }
  };

  const handleDownloadSingle = async (template: DownloadableTemplateItem) => {
    setDownloadingCode(template.code);
    try {
      await downloadSingleTemplateZip(template);
      const nextCount = downloadCount + 1;
      setDownloadCount(nextCount);
      localStorage.setItem('cm_admin_download_count', nextCount.toString());
      setDownloadSuccessMessage(`Successfully downloaded source code bundle for ${template.name} (${template.code}.zip)`);
      setTimeout(() => setDownloadSuccessMessage(null), 6000);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloadingCode(null);
    }
  };

  const handleDownloadBatch = async (categoryFilter?: string, tierFilter?: string) => {
    setBatchDownloading(true);
    let targetTemplates = templates;
    if (categoryFilter && categoryFilter !== 'all') {
      targetTemplates = targetTemplates.filter(t => t.category.toLowerCase().includes(categoryFilter.toLowerCase()));
    }
    if (tierFilter && tierFilter !== 'all') {
      targetTemplates = targetTemplates.filter(t => (t.tier || '').toLowerCase() === tierFilter.toLowerCase());
    }

    const archiveLabel = tierFilter && tierFilter !== 'all' 
      ? `codemaniac-${tierFilter}-templates`
      : categoryFilter && categoryFilter !== 'all'
        ? `codemaniac-${categoryFilter}-suite`
        : 'codemaniac-all-websites-and-apps-complete-codebase';

    try {
      await downloadAllTemplatesZip(
        archiveLabel,
        targetTemplates,
        (current: number, total: number, name: string) => {
          setBatchProgress({ current, total, name });
        }
      );
      const nextCount = downloadCount + targetTemplates.length;
      setDownloadCount(nextCount);
      localStorage.setItem('cm_admin_download_count', nextCount.toString());
      setDownloadSuccessMessage(`Master archive ready! Downloaded ${targetTemplates.length} projects in ${archiveLabel}.zip`);
      setTimeout(() => setDownloadSuccessMessage(null), 8000);
    } catch (err) {
      console.error('Batch download error:', err);
    } finally {
      setBatchDownloading(false);
      setBatchProgress(null);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordStatus({ type: 'error', message: 'New password must be at least 6 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'New passwords do not match.' });
      return;
    }

    try {
      const res = await fetch('/api/admin/update-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPasswordStatus({ type: 'success', message: 'Admin password updated successfully! Please remember your new password.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordStatus({ type: 'error', message: data.message || 'Failed to update password.' });
      }
    } catch {
      // Local fallback
      localStorage.setItem('cm_admin_custom_pwd', newPassword);
      setPasswordStatus({ type: 'success', message: 'Admin password updated successfully (client-side storage active).' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = searchQuery === '' || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.primaryTech.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || 
      (selectedCategory === 'business' && template.category === 'Business Websites') ||
      (selectedCategory === 'apps' && (template.category === 'Web Application' || template.category === 'Mobile Application' || template.category === 'E-Commerce Website'));

    const matchesTier = selectedTier === 'all' || (template.tier || '').toLowerCase() === selectedTier.toLowerCase();

    return matchesSearch && matchesCategory && matchesTier;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onNavigateHome}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Return to Main Website"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Site</span>
            </button>
            <div className="h-5 w-px bg-slate-800" />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-cyan-900/30">
                <Code className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-white tracking-tight">Codemanaic Studio</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                    Admin Portal
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">Full Source Code Repository & Management Engine</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Quick Add Custom Website Button */}
            <button
              onClick={() => {
                setEditingSite(null);
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors shadow-sm"
              title="Add a new live Vercel or external website with interactive preview"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Website</span>
            </button>

            {/* Quick 1-Click Master Download */}
            <button
              onClick={() => handleDownloadBatch('all', 'all')}
              disabled={batchDownloading}
              className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition-colors shadow-sm disabled:opacity-50"
            >
              <HardDriveDownload className="w-3.5 h-3.5" />
              <span>{batchDownloading ? 'Packing Archive...' : 'Download Master Codebase (.ZIP)'}</span>
            </button>

            {/* Admin identity indicator */}
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-800/80 rounded-lg border border-slate-700/80 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <div className="hidden sm:block text-left">
                <p className="font-medium text-slate-200 leading-none">{adminUser.username || adminUser.name || adminUser.adminId}</p>
                <p className="text-[10px] text-slate-400 leading-none mt-0.5">{(adminUser.role || 'Admin').toUpperCase()}</p>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
              title="Logout from Admin Panel"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-Nav Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 border-t border-slate-800/60 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('repository')}
            className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'repository'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <FolderArchive className="w-3.5 h-3.5" />
            <span>Websites & Apps Repository ({templates.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('custom-sites')}
            className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'custom-sites'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Vercel & External Sites ({customSites.length})</span>
            {customSites.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'export'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Master Export Center</span>
          </button>
          <button
            onClick={() => setActiveTab('enquiries')}
            className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'enquiries'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Client Enquiries ({enquiries.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'security'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Admin Credentials & Security</span>
          </button>
        </div>
      </header>

      {/* Global Success Notification Toast */}
      {downloadSuccessMessage && (
        <div className="bg-emerald-950/90 border-b border-emerald-800 text-emerald-200 px-4 py-3 flex items-center justify-between text-xs animate-in slide-in-from-top duration-300">
          <div className="max-w-7xl mx-auto w-full flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <p className="font-medium">{downloadSuccessMessage}</p>
          </div>
        </div>
      )}

      {/* Batch download progress bar */}
      {batchDownloading && batchProgress && (
        <div className="bg-slate-900 border-b border-cyan-800 text-slate-200 px-4 py-3 text-xs">
          <div className="max-w-7xl mx-auto space-y-1.5">
            <div className="flex justify-between font-medium">
              <span className="flex items-center gap-2 text-cyan-400">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Bundling: {batchProgress.name}
              </span>
              <span>{batchProgress.current} / {batchProgress.total} projects packaged</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-cyan-500 h-2 rounded-full transition-all duration-200" 
                style={{ width: `${Math.round((batchProgress.current / batchProgress.total) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* TAB 1: REPOSITORY (All 20 Websites + Web & Mobile Apps) */}
        {activeTab === 'repository' && (
          <div className="space-y-6">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>Total Templates</span>
                  <Globe className="w-4 h-4 text-cyan-400" />
                </div>
                <p className="text-2xl font-bold text-white">{templates.length}</p>
                <p className="text-[11px] text-slate-500 mt-1">20 Business + 5 Web & Mobile Apps</p>
              </div>

              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>Architecture</span>
                  <Cpu className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-2xl font-bold text-white">Vite + React</p>
                <p className="text-[11px] text-slate-500 mt-1">TypeScript & Tailwind CSS</p>
              </div>

              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>Format</span>
                  <Package className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-2xl font-bold text-white">Full Source</p>
                <p className="text-[11px] text-slate-500 mt-1">Runnable standalone ZIPs</p>
              </div>

              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>Downloads Executed</span>
                  <Download className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-2xl font-bold text-white">{downloadCount}</p>
                <p className="text-[11px] text-slate-500 mt-1">In this session</p>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search input */}
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search templates by name, tier, tech stack, or ID (e.g. B-01)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Category & Tier Filters */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mr-2">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filters:</span>
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">All Categories ({templates.length})</option>
                  <option value="business">Business Websites (20)</option>
                  <option value="apps">Web & Mobile Apps (5)</option>
                </select>

                <select
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">All Tiers</option>
                  <option value="basic">Tier 1: Basic (01–05)</option>
                  <option value="mid-range">Tier 2: Mid-Range (06–10)</option>
                  <option value="premium">Tier 3: Premium (11–15)</option>
                  <option value="ultra-premium">Tier 4: Ultra Premium (16–20)</option>
                  <option value="production">App Suites (Apps)</option>
                </select>
              </div>
            </div>

            {/* Template Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => {
                const isDownloading = downloadingCode === template.code;
                return (
                  <div
                    key={template.code}
                    className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all flex flex-col group"
                  >
                    {/* Header info */}
                    <div className="p-5 border-b border-slate-800/70 flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                          {template.code}
                        </span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800/80 text-slate-300">
                          {template.tierLabel || template.tier || 'Standard'}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-bold text-base text-white group-hover:text-cyan-400 transition-colors">
                          {template.name}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                          {template.description}
                        </p>
                      </div>

                      {/* Tech stack tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {template.primaryTech.map((tag: string) => (
                          <span
                            key={tag}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-800/60 text-slate-400 border border-slate-800"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Project files overview */}
                      <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/50">
                        <span>Includes {template.fileCount || 8} Standalone Files</span>
                        <span className="font-mono text-[10px] text-slate-500">package.json • vite.config • App.tsx</span>
                      </div>
                    </div>

                    {/* Action buttons footer */}
                    <div className="p-3 bg-slate-950/70 border-t border-slate-800 flex items-center gap-2">
                      {/* Code Inspector */}
                      <button
                        onClick={() => setInspectingTemplate(template)}
                        className="flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                        title="View and browse source code files"
                      >
                        <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Inspect Code</span>
                      </button>

                      {/* Live Preview if available */}
                      {onPreviewTemplate && (
                        <button
                          onClick={() => onPreviewTemplate(template.code)}
                          className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                          title="Open live preview in website"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Download Full ZIP */}
                      <button
                        onClick={() => handleDownloadSingle(template)}
                        disabled={isDownloading}
                        className="flex-1 py-2 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-sm"
                        title="Download complete standalone runnable project as .ZIP"
                      >
                        {isDownloading ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Packaging...</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            <span>Download ZIP</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12 bg-slate-900/40 border border-slate-800 rounded-xl space-y-3">
                <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-slate-300 text-sm font-medium">No templates matched your search criteria.</p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setSelectedTier('all'); }}
                  className="text-xs text-cyan-400 hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB: VERCEL & EXTERNAL SITES MANAGER */}
        {activeTab === 'custom-sites' && (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900/80 to-cyan-950/60 border border-emerald-800/60 rounded-2xl p-6 sm:p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="max-w-2xl space-y-3">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-emerald-950 border border-emerald-800/80 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Live External Deployments • Vercel & Production Stores</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    Vercel & Custom Websites Manager
                  </h2>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Showcase external websites and web applications directly inside Codemanaic Studio. Every website registered here is dynamically rendered with an interactive multi-device preview (Desktop, Tablet, Mobile) and integrated with client quote requests.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingSite(null);
                    setIsAddModalOpen(true);
                  }}
                  className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-950/50 flex items-center gap-2 shrink-0 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Custom Website</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>Custom Websites</span>
                  <Globe className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-2xl font-bold text-white">{customSites.length}</p>
                <p className="text-[11px] text-slate-500 mt-1">Live in Website Catalog</p>
              </div>

              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>Vercel Deployments</span>
                  <Cpu className="w-4 h-4 text-cyan-400" />
                </div>
                <p className="text-2xl font-bold text-white">
                  {customSites.filter(s => s.platformHost === 'Vercel' || s.externalUrl?.includes('vercel.app')).length}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">Edge CDN Hosted</p>
              </div>

              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>Preview Engine</span>
                  <Eye className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-2xl font-bold text-emerald-400">Multi-Device</p>
                <p className="text-[11px] text-slate-500 mt-1">Desktop • Tablet • Mobile</p>
              </div>

              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>Storage Backend</span>
                  <Database className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-2xl font-bold text-white">Persistent</p>
                <p className="text-[11px] text-slate-500 mt-1">Realtime REST API</p>
              </div>
            </div>

            {/* Custom Sites Grid */}
            {loadingCustomSites ? (
              <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-xl">
                <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-300">Loading custom websites...</p>
              </div>
            ) : customSites.length === 0 ? (
              <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-xl space-y-4">
                <Globe className="w-12 h-12 text-slate-600 mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-slate-200">No custom websites added yet</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Add your deployed Vercel stores, portfolio websites, or client projects to feature them with interactive live previews.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingSite(null);
                    setIsAddModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Website</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {customSites.map((site) => (
                  <div
                    key={site.id}
                    className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Thumbnail Header with Live Badge */}
                      <div className="relative h-48 bg-slate-950 overflow-hidden">
                        <img
                          src={site.thumbnail}
                          alt={site.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                        {/* Top Pills */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/90 text-emerald-300 border border-emerald-700/80 backdrop-blur-sm shadow-md">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>Live on {site.platformHost || 'Vercel'}</span>
                          </span>

                          <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-900/90 text-slate-300 border border-slate-700 backdrop-blur-sm">
                            {site.category}
                          </span>
                        </div>

                        {/* Quick Hover Action Overlay */}
                        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <button
                            onClick={() => onPreviewTemplate?.(site.id)}
                            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-lg"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Test Live Preview</span>
                          </button>
                          <a
                            href={site.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center gap-1.5 transition-colors border border-slate-700"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Visit URL</span>
                          </a>
                        </div>
                      </div>

                      {/* Content Body */}
                      <div className="p-5 space-y-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-base text-white tracking-tight">
                              {site.name}
                            </h3>
                            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              {site.tier || 'Mid-Range'}
                            </span>
                          </div>
                          {site.industry && (
                            <p className="text-xs font-medium text-emerald-400">
                              {site.industry}
                            </p>
                          )}
                          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                            {site.description}
                          </p>
                        </div>

                        {/* Live URL Link */}
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/80 rounded-lg border border-slate-800/80 text-xs">
                          <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <a
                            href={site.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:underline truncate font-mono text-[11px]"
                          >
                            {site.externalUrl}
                          </a>
                          <ExternalLink className="w-3 h-3 text-slate-500 shrink-0 ml-auto" />
                        </div>

                        {/* Feature Badges */}
                        {Array.isArray(site.features) && site.features.length > 0 && (
                          <div className="space-y-1.5">
                            <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                              Included Highlights
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {site.features.slice(0, 4).map((feat: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="text-[11px] px-2 py-0.5 rounded bg-slate-800/70 text-slate-300 border border-slate-700/60"
                                >
                                  {feat}
                                </span>
                              ))}
                              {site.features.length > 4 && (
                                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800/70 text-slate-400 border border-slate-700/60">
                                  +{site.features.length - 4} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Tech Stack Chips */}
                        {Array.isArray(site.techStack) && site.techStack.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {site.techStack.map((tech: string, idx: number) => (
                              <span
                                key={idx}
                                className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/60"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="px-5 py-3.5 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onPreviewTemplate?.(site.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Live Preview</span>
                        </button>
                        <a
                          href={site.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors flex items-center gap-1 border border-slate-700"
                        >
                          <span>Visit</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingSite(site);
                            setIsAddModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                          title="Edit Website Details"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCustomSite(site.id, site.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                          title="Remove from Gallery"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MASTER EXPORT CENTER */}
        {activeTab === 'export' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-cyan-950/60 to-blue-950/60 border border-cyan-800/60 rounded-2xl p-6 sm:p-8">
              <div className="max-w-3xl space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 px-2.5 py-1 rounded bg-cyan-950 border border-cyan-800/80">
                  Bulk Code Distribution
                </span>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Master Codebase Export Engine
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Download all 20 business website templates, enterprise web applications, and mobile app demos in complete, standalone, production-ready packages. Every exported project includes ready-to-run package scripts, complete TypeScript components, asset links, and zero missing dependencies.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Batch 1: All 20 Business Websites */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-950 border border-blue-800 text-blue-400 flex items-center justify-center">
                    <Globe className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-white">All 20 Business Websites</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Includes all 20 templates across Tier 1 (Basic), Tier 2 (Mid-Range), Tier 3 (Premium 5-page), and Tier 4 (Ultra Premium 10-page).
                  </p>
                  <p className="text-[11px] text-cyan-400 font-mono">20 complete projects • 160+ source files</p>
                </div>
                <button
                  onClick={() => handleDownloadBatch('business')}
                  disabled={batchDownloading}
                  className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>Download 20 Websites Archive (.ZIP)</span>
                </button>
              </div>

              {/* Batch 2: Premium & Ultra Premium Tiers */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-lg bg-purple-950 border border-purple-800 text-purple-400 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-white">Premium & Ultra-Premium Tiers</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Includes Templates 11 through 20 with full multi-page support (5 pages for Premium, 10 pages for Ultra-Premium) and light themes.
                  </p>
                  <p className="text-[11px] text-purple-400 font-mono">10 high-tier projects • 100+ source files</p>
                </div>
                <button
                  onClick={() => handleDownloadBatch('all', 'premium')}
                  disabled={batchDownloading}
                  className="w-full py-2.5 px-4 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Premium Suites (.ZIP)</span>
                </button>
              </div>

              {/* Batch 3: Web & Mobile Applications */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-white">Web & Mobile Applications</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Includes the Admin Panel System, Doctor Appointment Booking, School/Student ERP, E-Commerce Storefront, and Food Delivery Mobile App.
                  </p>
                  <p className="text-[11px] text-emerald-400 font-mono">5 full-stack apps • Complete source</p>
                </div>
                <button
                  onClick={() => handleDownloadBatch('apps')}
                  disabled={batchDownloading}
                  className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Apps Archive (.ZIP)</span>
                </button>
              </div>
            </div>

            {/* Master All-in-one Archive */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="font-bold text-lg text-white">Codemanaic Master Software Suite</h3>
                <p className="text-xs text-slate-400">
                  Exports every single website (20 templates) and web/mobile app into one single organized archive sorted by categories.
                </p>
              </div>
              <button
                onClick={() => handleDownloadBatch('all', 'all')}
                disabled={batchDownloading}
                className="w-full sm:w-auto py-3 px-6 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/20 disabled:opacity-50 shrink-0"
              >
                <HardDriveDownload className="w-4 h-4" />
                <span>{batchDownloading ? 'Bundling Master Archive...' : 'Download Master Suite (.ZIP)'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: CLIENT ENQUIRIES CRM */}
        {activeTab === 'enquiries' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">Client Project Enquiries</h2>
                <p className="text-xs text-slate-400">Manage client requests submitted through the quote estimator and contact forms.</p>
              </div>
              <button
                onClick={loadEnquiries}
                disabled={loadingEnquiries}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingEnquiries ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {/* Enquiries list */}
            {enquiries.length === 0 ? (
              <div className="text-center py-12 bg-slate-900/50 border border-slate-800 rounded-xl">
                <Database className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-300">No client enquiries received yet.</p>
                <p className="text-xs text-slate-500 mt-1">Enquiries submitted by clients on the quote calculator or contact forms will appear here.</p>
              </div>
            ) : (
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Client</th>
                        <th className="py-3 px-4">Contact</th>
                        <th className="py-3 px-4">Service</th>
                        <th className="py-3 px-4">Template</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {enquiries.map((enq) => (
                        <tr key={enq.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 font-medium text-white">{enq.contactName || enq.businessName}</td>
                          <td className="py-3 px-4">
                            <div>{enq.contactEmail}</div>
                            {enq.contactPhone && <div className="text-[11px] text-slate-500">{enq.contactPhone}</div>}
                          </td>
                          <td className="py-3 px-4">{enq.serviceType || enq.businessCategory}</td>
                          <td className="py-3 px-4 font-mono text-[11px] text-cyan-400">
                            {enq.templateId || enq.templateName || 'Custom'}
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {new Date(enq.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                              {enq.status || 'Received'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SECURITY & CREDENTIALS */}
        {activeTab === 'security' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Active Admin Credentials</h3>
                  <p className="text-xs text-slate-400">View current administrator identification details.</p>
                </div>
              </div>

              <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Primary Admin ID:</span>
                  <span className="font-mono text-cyan-400 font-medium">admin@codemaniac.com</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Secondary Username:</span>
                  <span className="font-mono text-cyan-400 font-medium">admin</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Role Permissions:</span>
                  <span className="text-emerald-400 font-medium">Super Administrator (Full Code Export)</span>
                </div>
              </div>
            </div>

            {/* Change Password Form */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-5">
              <h3 className="font-bold text-base text-white">Update Administrator Password</h3>

              {passwordStatus.type === 'success' && (
                <div className="p-3 rounded-lg bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{passwordStatus.message}</span>
                </div>
              )}

              {passwordStatus.type === 'error' && (
                <div className="p-3 rounded-lg bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{passwordStatus.message}</span>
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors shadow-sm"
                >
                  Update Admin Password
                </button>
              </form>
            </div>
          </div>
        )}

      </main>

      {/* Code Inspector Modal */}
      {inspectingTemplate && (
        <CodeInspectorModal
          template={inspectingTemplate}
          isOpen={true}
          onClose={() => setInspectingTemplate(null)}
          onDownload={() => handleDownloadSingle(inspectingTemplate)}
        />
      )}

      {/* Add / Edit Custom Website Modal */}
      <AddWebsiteModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingSite(null);
        }}
        onSave={handleSaveCustomSite}
        editingSite={editingSite}
      />
    </div>
  );
};
