/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PageView, TemplateItem, EnquirySubmission, BusinessTemplateItem } from './types';
import { ALL_TEMPLATES } from './data/servicesData';
import { BUSINESS_TEMPLATES, getBusinessTemplatePages } from './data/businessTemplates';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HeroServices } from './components/HeroServices';
import { CoreServicesSection } from './components/CoreServicesSection';
import { MoreWaysSection } from './components/MoreWaysSection';
import { TechStackSection } from './components/TechStackSection';
import { ProjectsBuiltSection } from './components/ProjectsBuiltSection';
import { CtaBanner } from './components/CtaBanner';
import { SearchModal } from './components/SearchModal';
import { EnquiriesModal } from './components/EnquiriesModal';
import { WebsiteDevelopmentView } from './components/views/WebsiteDevelopmentView';
import { WebApplicationView } from './components/views/WebApplicationView';
import { AppDevelopmentView } from './components/views/AppDevelopmentView';
import { PlatformTemplatesView } from './components/views/PlatformTemplatesView';
import { EcommerceView } from './components/views/EcommerceView';
import { CustomWebsitesView } from './components/views/CustomWebsitesView';
import { BusinessProDemo } from './components/demos/BusinessProDemo';
import { AdminPanelDemo } from './components/demos/AdminPanelDemo';
import { MobileAppDemo } from './components/demos/MobileAppDemo';
import { EcommerceStoreDemo } from './components/demos/EcommerceStoreDemo';
import { CorporateWebsiteDemo } from './components/demos/CorporateWebsiteDemo';
import { BookingSystemDemo } from './components/demos/BookingSystemDemo';
import { StudentManagementDemo } from './components/demos/StudentManagementDemo';
import { CategoryShowcaseView } from './components/views/CategoryShowcaseView';
import { BusinessTemplateGalleryView } from './components/website-gallery/BusinessTemplateGalleryView';
import { PreviewToolbar, ViewportMode } from './components/website-gallery/PreviewToolbar';
import { BusinessTemplateRenderer } from './components/demos/business/BusinessTemplateRenderer';
import { EnquiryFormView } from './components/EnquiryFormView';
import { SuccessView } from './components/SuccessView';

// Helper to look up any template by id, code, or slug
function lookupTemplate(identifier: string): (TemplateItem | BusinessTemplateItem) | undefined {
  if (!identifier) return undefined;
  const clean = identifier.toLowerCase().replace(/[^a-z0-9]/g, '');

  const biz = BUSINESS_TEMPLATES.find(
    (t) =>
      t.id.toLowerCase().replace(/[^a-z0-9]/g, '') === clean ||
      t.slug.toLowerCase().replace(/[^a-z0-9]/g, '') === clean ||
      t.templateCode.toLowerCase().replace(/[^a-z0-9]/g, '') === clean ||
      t.name.toLowerCase().replace(/[^a-z0-9]/g, '') === clean
  );
  if (biz) return biz;

  return ALL_TEMPLATES.find(
    (t) =>
      t.id.toLowerCase().replace(/[^a-z0-9]/g, '') === clean ||
      t.templateCode.toLowerCase().replace(/[^a-z0-9]/g, '') === clean ||
      t.name.toLowerCase().replace(/[^a-z0-9]/g, '') === clean
  );
}

export default function App() {
  const [currentView, setCurrentView] = useState<PageView>('services');
  const [selectedPlatform, setSelectedPlatform] = useState<'android' | 'ios' | 'all'>('android');
  const [selectedCategory, setSelectedCategory] = useState<string>('business');
  const [categoryParentService, setCategoryParentService] = useState<string>('website-development');
  const [activeTemplate, setActiveTemplate] = useState<TemplateItem | BusinessTemplateItem>(ALL_TEMPLATES[0]);
  const [activeTemplateSubpage, setActiveTemplateSubpage] = useState<string>('');
  const [previewViewport, setPreviewViewport] = useState<ViewportMode>('desktop');
  const [customizedDesignContext, setCustomizedDesignContext] = useState<any>(null);
  const [submittedEnquiry, setSubmittedEnquiry] = useState<EnquirySubmission | null>(null);

  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [enquiriesModalOpen, setEnquiriesModalOpen] = useState(false);
  const [enquiriesList, setEnquiriesList] = useState<EnquirySubmission[]>([]);
  const [isLoadingEnquiries, setIsLoadingEnquiries] = useState(false);

  // Determine canonical URL from application state
  const computeUrl = useCallback(
    (
      view: PageView,
      category?: string,
      parentService?: string,
      platform?: 'android' | 'ios' | 'all',
      template?: TemplateItem | BusinessTemplateItem,
      subpage?: string
    ): string => {
      switch (view) {
        case 'services':
          return '/';
        case 'website-development':
          return '/website';
        case 'web-application':
          return '/web-app';
        case 'app-development':
          return '/app';
        case 'android-app-templates':
          return '/app/android';
        case 'ios-app-templates':
          return '/app/ios';
        case 'app-platform':
          return platform && platform !== 'all' ? `/app/${platform}` : '/app';
        case 'ecommerce':
          return '/ecommerce';
        case 'custom-websites':
          return '/custom-websites';
        case 'business-templates':
          return '/website/business';
        case 'website-category':
          if (category === 'business' || category === 'business-websites') {
            return '/website/business';
          }
          return `/website/${category || 'corporate'}`;
        case 'web-app-category':
          return `/web-app/${category || 'admin-panel'}`;
        case 'ecommerce-category':
          return `/ecommerce/${category || 'store'}`;
        case 'custom-category':
          return `/custom-websites/${category || 'custom'}`;
        case 'live-preview': {
          const tmpl = template || activeTemplate;
          const slug = (tmpl as any)?.slug || tmpl?.id || 'preview';
          return subpage ? `/preview/${slug}/${subpage}` : `/preview/${slug}`;
        }
        case 'enquiry-form':
          return '/start-project';
        case 'success':
          return '/success';
        default:
          return '/';
      }
    },
    [activeTemplate]
  );

  // Push URL without reloading
  const pushUrl = useCallback((newUrl: string) => {
    if (typeof window !== 'undefined' && window.location.pathname !== newUrl) {
      window.history.pushState(null, '', newUrl);
    }
  }, []);

  // Parse window.location.pathname and restore matching state
  const parseCurrentUrl = useCallback(() => {
    if (typeof window === 'undefined') return;
    const path = window.location.pathname.replace(/\/+$/, '') || '/';
    const segments = path.split('/').filter(Boolean);

    if (segments.length === 0) {
      setCurrentView('services');
      return;
    }

    const first = segments[0]?.toLowerCase();
    const second = segments[1]?.toLowerCase();
    const third = segments[2]?.toLowerCase();

    // 1. Live preview route: /preview/:templateSlug or /preview/:templateSlug/:subpage
    if (first === 'preview') {
      if (second) {
        const found = lookupTemplate(second);
        if (found) {
          setActiveTemplate(found);
          const pages = getBusinessTemplatePages(found);
          const sub = third || (pages[0]?.id ?? '');
          setActiveTemplateSubpage(sub);
          setCurrentView('live-preview');
          return;
        }
      }
      setCurrentView('website-development');
      return;
    }

    // 2. Enquiry / Start Project
    if (first === 'start-project' || first === 'enquiry') {
      setCurrentView('enquiry-form');
      return;
    }

    // 3. Success page
    if (first === 'success') {
      setCurrentView('success');
      return;
    }

    // 4. Business Templates gallery: /website/business or /business-templates
    if (first === 'business-templates' || (first === 'website' && (second === 'business' || second === 'business-websites'))) {
      setSelectedCategory('business');
      setCategoryParentService('website-development');
      setCurrentView('business-templates');
      return;
    }

    // 5. Website development & categories
    if (first === 'website' || first === 'website-development') {
      if (second) {
        const cat = second === 'category' ? third : second;
        if (cat === 'business' || cat === 'business-websites') {
          setSelectedCategory('business');
          setCategoryParentService('website-development');
          setCurrentView('business-templates');
          return;
        }
        setSelectedCategory(cat || 'corporate');
        setCategoryParentService('website-development');
        setCurrentView('website-category');
        return;
      }
      setCurrentView('website-development');
      return;
    }

    // 6. Web Applications & categories
    if (first === 'web-app' || first === 'web-application') {
      if (second) {
        const cat = second === 'category' ? third : second;
        setSelectedCategory(cat || 'admin-panel');
        setCategoryParentService('web-application');
        setCurrentView('web-app-category');
        return;
      }
      setCurrentView('web-application');
      return;
    }

    // 7. App Development & platforms
    if (first === 'app' || first === 'app-development') {
      if (second === 'android') {
        setSelectedPlatform('android');
        setCurrentView('android-app-templates');
        return;
      }
      if (second === 'ios') {
        setSelectedPlatform('ios');
        setCurrentView('ios-app-templates');
        return;
      }
      setCurrentView('app-development');
      return;
    }

    // 8. E-commerce
    if (first === 'ecommerce') {
      if (second) {
        const cat = second === 'category' ? third : second;
        setSelectedCategory(cat || 'store');
        setCategoryParentService('ecommerce');
        setCurrentView('ecommerce-category');
        return;
      }
      setCurrentView('ecommerce');
      return;
    }

    // 9. Custom Websites
    if (first === 'custom-websites' || first === 'custom') {
      if (second) {
        const cat = second === 'category' ? third : second;
        setSelectedCategory(cat || 'custom');
        setCategoryParentService('custom-websites');
        setCurrentView('custom-category');
        return;
      }
      setCurrentView('custom-websites');
      return;
    }

    // Default fallback
    setCurrentView('services');
  }, []);

  // Initial mount: restore route & listen to popstate
  useEffect(() => {
    parseCurrentUrl();

    const handlePopState = () => {
      parseCurrentUrl();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [parseCurrentUrl]);

  // Fetch saved enquiries from backend API
  const fetchEnquiries = async () => {
    setIsLoadingEnquiries(true);
    try {
      const res = await fetch('/api/enquiries');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setEnquiriesList(json.data);
          return;
        }
      }
    } catch (e) {
      console.warn('Could not fetch from /api/enquiries, checking localStorage backup:', e);
    } finally {
      setIsLoadingEnquiries(false);
    }

    try {
      const local = JSON.parse(localStorage.getItem('cm_enquiries') || '[]');
      if (local.length > 0) {
        setEnquiriesList(local);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  // Navigation handlers with real browser URL sync
  const handleNavigate = (view: PageView) => {
    setCurrentView(view);
    const newUrl = computeUrl(view, selectedCategory, categoryParentService, selectedPlatform, activeTemplate);
    pushUrl(newUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenCategory = (catId: string, parent: string = 'website-development') => {
    setSelectedCategory(catId);
    setCategoryParentService(parent);

    if (catId === 'business' || catId === 'business-websites') {
      setCurrentView('business-templates');
      pushUrl('/website/business');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    let targetView: PageView = 'website-category';
    let targetUrl = `/website/${catId}`;

    if (parent === 'web-application') {
      targetView = 'web-app-category';
      targetUrl = `/web-app/${catId}`;
    } else if (parent === 'ecommerce') {
      targetView = 'ecommerce-category';
      targetUrl = `/ecommerce/${catId}`;
    } else if (parent === 'custom-websites') {
      targetView = 'custom-category';
      targetUrl = `/custom-websites/${catId}`;
    }

    setCurrentView(targetView);
    pushUrl(targetUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartProject = (initialRequirement?: string) => {
    if (initialRequirement) {
      const matched = ALL_TEMPLATES.find((t) =>
        initialRequirement.toLowerCase().includes(t.name.toLowerCase()) ||
        initialRequirement.toLowerCase().includes(t.serviceCategory.toLowerCase())
      );
      if (matched) setActiveTemplate(matched);
    }
    setCurrentView('enquiry-form');
    pushUrl('/start-project');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLivePreview = (template: TemplateItem | BusinessTemplateItem, initialSubpage?: string) => {
    setActiveTemplate(template);
    const pages = getBusinessTemplatePages(template);
    const sub = initialSubpage || (pages[0]?.id ?? '');
    setActiveTemplateSubpage(sub);
    setCurrentView('live-preview');

    const slug = (template as any).slug || template.id;
    const url = sub ? `/preview/${slug}/${sub}` : `/preview/${slug}`;
    pushUrl(url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPreviewSubpage = (subpageId: string) => {
    setActiveTemplateSubpage(subpageId);
    const slug = (activeTemplate as any).slug || activeTemplate.id;
    const url = `/preview/${slug}/${subpageId}`;
    pushUrl(url);
  };

  const handleUseDesign = (template: TemplateItem | BusinessTemplateItem, customData?: any) => {
    setActiveTemplate(template);
    setCustomizedDesignContext(customData || null);
    setCurrentView('enquiry-form');
    pushUrl('/start-project');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitSuccess = (enquiry: EnquirySubmission) => {
    setSubmittedEnquiry(enquiry);
    setCurrentView('success');
    pushUrl('/success');
    fetchEnquiries();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Check if active template is one of the 20 Business Templates
  const isBusinessTemplate = useMemo(() => {
    if (!activeTemplate) return false;
    const tmplId = activeTemplate.id?.toLowerCase() || '';
    const tmplCode = ((activeTemplate as any).templateCode || '').toLowerCase();
    return (
      tmplId.startsWith('biz-') ||
      tmplCode.startsWith('biz-') ||
      BUSINESS_TEMPLATES.some((b) => b.id === activeTemplate.id || b.templateCode === (activeTemplate as any).templateCode)
    );
  }, [activeTemplate]);

  // Available pages for current active template
  const currentTemplatePages = useMemo(() => {
    return getBusinessTemplatePages(activeTemplate);
  }, [activeTemplate]);

  // Active page ID for current template
  const currentActivePageId = activeTemplateSubpage || currentTemplatePages[0]?.id || 'home';

  // Render Live Preview depending on template type
  const renderLivePreviewComponent = () => {
    // If it's one of the 20 Business Website Templates, render with multi-page toolbar & live pages bar
    if (isBusinessTemplate) {
      const bizTemplate = (BUSINESS_TEMPLATES.find(
        (t) => t.id === activeTemplate.id || t.templateCode === (activeTemplate as any).templateCode
      ) || activeTemplate) as BusinessTemplateItem;

      return (
        <div className="min-h-screen bg-slate-950 flex flex-col animate-in fade-in duration-200">
          <PreviewToolbar
            template={bizTemplate}
            viewport={previewViewport}
            onViewportChange={(vp) => setPreviewViewport(vp)}
            onBackToGallery={() => handleNavigate('business-templates')}
            onUseDesign={(tmpl) => handleUseDesign(tmpl)}
          />

          {/* Interactive Multi-Page Navigation Bar */}
          <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-8 py-2.5 flex items-center justify-between text-xs overflow-x-auto gap-4 shrink-0 shadow-lg">
            <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px] shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-slate-200 uppercase tracking-wider">LIVE PAGES:</span>
              <span className="text-[10px] text-orange-400 bg-orange-950/60 border border-orange-800/80 px-2 py-0.5 rounded-full font-bold">
                {bizTemplate.tier === 'basic'
                  ? 'SINGLE-PAGE (ANCHOR SECTIONS)'
                  : bizTemplate.tier === 'premium'
                  ? '5 DEDICATED PAGES'
                  : bizTemplate.tier === 'ultra-premium'
                  ? '10 DEDICATED PAGES'
                  : 'MULTI-PAGE'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
              {currentTemplatePages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => handleSelectPreviewSubpage(page.id)}
                  className={`px-3 py-1 rounded-lg font-bold transition-all whitespace-nowrap text-xs flex items-center gap-1.5 cursor-pointer ${
                    currentActivePageId === page.id
                      ? 'bg-orange-600 text-white shadow-md ring-2 ring-orange-500/40'
                      : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <span>{page.label}</span>
                  {currentActivePageId === page.id && <span className="text-[10px] text-orange-200">●</span>}
                </button>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-400 font-mono shrink-0">
              <span className="text-emerald-400 font-bold">● URL:</span>
              <span className="text-slate-300">
                /preview/{(bizTemplate as any).slug || bizTemplate.id}/{currentActivePageId}
              </span>
            </div>
          </div>

          {/* Viewport Render Area */}
          <div className="flex-1 overflow-auto flex justify-center items-start p-0 sm:p-4 bg-slate-950">
            <div
              className={`w-full transition-all duration-300 shadow-2xl ${
                previewViewport === 'desktop'
                  ? 'max-w-full'
                  : previewViewport === 'tablet'
                  ? 'max-w-[768px] my-6 rounded-2xl overflow-hidden border-8 border-slate-800'
                  : 'max-w-[390px] my-6 rounded-[36px] overflow-hidden border-[10px] border-slate-800'
              }`}
            >
              <BusinessTemplateRenderer
                template={bizTemplate}
                activePage={currentActivePageId}
                onPageChange={(page) => handleSelectPreviewSubpage(page)}
                onUseDesign={(tmpl) => handleUseDesign(tmpl)}
              />
            </div>
          </div>
        </div>
      );
    }

    // Other template types (admin, app, ecommerce, corporate, booking, student)
    switch (activeTemplate.previewType) {
      case 'admin-panel':
        return (
          <AdminPanelDemo
            template={activeTemplate as TemplateItem}
            onBack={() => handleNavigate('web-application')}
            onUseDesign={handleUseDesign}
          />
        );
      case 'mobile-app':
        return (
          <MobileAppDemo
            template={activeTemplate as TemplateItem}
            onBack={() => handleNavigate('app-platform')}
            onUseDesign={handleUseDesign}
          />
        );
      case 'ecommerce':
        return (
          <EcommerceStoreDemo
            template={activeTemplate as TemplateItem}
            onBack={() => handleNavigate('ecommerce')}
            onUseDesign={handleUseDesign}
          />
        );
      case 'booking':
        return (
          <BookingSystemDemo
            template={activeTemplate as TemplateItem}
            onBack={() => handleNavigate('web-application')}
            onUseDesign={handleUseDesign}
          />
        );
      case 'student':
        return (
          <StudentManagementDemo
            template={activeTemplate as TemplateItem}
            onBack={() => handleNavigate('web-application')}
            onUseDesign={handleUseDesign}
          />
        );
      case 'corporate':
        return (
          <CorporateWebsiteDemo
            template={activeTemplate as TemplateItem}
            onBack={() => handleNavigate('custom-websites')}
            onUseDesign={handleUseDesign}
          />
        );
      case 'website':
      default:
        return (
          <BusinessProDemo
            template={activeTemplate as TemplateItem}
            onBack={() => handleNavigate('website-development')}
            onUseDesign={handleUseDesign}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-800 flex flex-col selection:bg-orange-500 selection:text-white">
      {/* Global Navigation Header (hidden on immersive live preview mode for isolation) */}
      {currentView !== 'live-preview' && (
        <Header
          currentView={currentView}
          onNavigate={handleNavigate}
          onOpenSearch={() => setSearchModalOpen(true)}
          onOpenEnquiries={() => setEnquiriesModalOpen(true)}
          enquiriesCount={enquiriesList.length}
        />
      )}

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'services' && (
          <div className="animate-in fade-in duration-200">
            <HeroServices
              onStartProject={() => handleStartProject('Website & Web App Project')}
              onExploreServices={() => {
                const el = document.getElementById('core-services');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            />
            <CoreServicesSection onSelectService={handleNavigate} />
            <MoreWaysSection onStartWithService={handleStartProject} />
            <TechStackSection />
            <ProjectsBuiltSection onStartProject={handleStartProject} />
            <CtaBanner
              onStartProject={() => handleStartProject('General Digital Project')}
              onTalkToUs={() => handleNavigate('enquiry-form')}
            />
          </div>
        )}

        {currentView === 'website-development' && (
          <WebsiteDevelopmentView
            onBack={() => handleNavigate('services')}
            onSelectCategory={(catId) => handleOpenCategory(catId, 'website-development')}
            onLivePreview={handleLivePreview}
            onUseDesign={handleUseDesign}
            onStartProject={handleStartProject}
          />
        )}

        {currentView === 'web-application' && (
          <WebApplicationView
            onBack={() => handleNavigate('services')}
            onSelectCategory={(catId) => handleOpenCategory(catId, 'web-application')}
            onLivePreview={handleLivePreview}
            onUseDesign={handleUseDesign}
            onStartProject={handleStartProject}
          />
        )}

        {currentView === 'app-development' && (
          <AppDevelopmentView
            onBack={() => handleNavigate('services')}
            onSelectPlatform={(platform) => {
              setSelectedPlatform(platform);
              handleNavigate(platform === 'android' ? 'android-app-templates' : platform === 'ios' ? 'ios-app-templates' : 'app-platform');
            }}
            onLivePreview={handleLivePreview}
            onUseDesign={handleUseDesign}
            onStartProject={handleStartProject}
          />
        )}

        {currentView === 'app-platform' && (
          <PlatformTemplatesView
            platform={selectedPlatform}
            onBack={() => handleNavigate('app-development')}
            onSwitchPlatform={(newPlatform) => {
              setSelectedPlatform(newPlatform);
              pushUrl(`/app/${newPlatform}`);
            }}
            onLivePreview={handleLivePreview}
            onUseDesign={handleUseDesign}
          />
        )}

        {currentView === 'android-app-templates' && (
          <PlatformTemplatesView
            platform="android"
            onBack={() => handleNavigate('app-development')}
            onSwitchPlatform={(newPlatform) => {
              setSelectedPlatform(newPlatform);
              pushUrl(`/app/${newPlatform}`);
            }}
            onLivePreview={handleLivePreview}
            onUseDesign={handleUseDesign}
          />
        )}

        {currentView === 'ios-app-templates' && (
          <PlatformTemplatesView
            platform="ios"
            onBack={() => handleNavigate('app-development')}
            onSwitchPlatform={(newPlatform) => {
              setSelectedPlatform(newPlatform);
              pushUrl(`/app/${newPlatform}`);
            }}
            onLivePreview={handleLivePreview}
            onUseDesign={handleUseDesign}
          />
        )}

        {currentView === 'ecommerce' && (
          <EcommerceView
            onBack={() => handleNavigate('services')}
            onSelectCategory={(catId) => handleOpenCategory(catId, 'ecommerce')}
            onLivePreview={handleLivePreview}
            onUseDesign={handleUseDesign}
            onStartProject={handleStartProject}
          />
        )}

        {currentView === 'custom-websites' && (
          <CustomWebsitesView
            onBack={() => handleNavigate('services')}
            onSelectCategory={(catId) => handleOpenCategory(catId, 'custom-websites')}
            onLivePreview={handleLivePreview}
            onUseDesign={handleUseDesign}
            onStartProject={handleStartProject}
          />
        )}

        {/* Dedicated Business Website 20-Template Gallery */}
        {(currentView === 'business-templates' ||
          (currentView === 'website-category' && (selectedCategory === 'business' || selectedCategory === 'business-websites'))) && (
          <BusinessTemplateGalleryView
            onBack={() => handleNavigate('website-development')}
            onUseDesign={handleUseDesign}
            onStartProject={handleStartProject}
            initialTemplateCode={(activeTemplate as any)?.templateCode || ''}
            initialPageId={activeTemplateSubpage}
            onStateChange={(templateCode, pageId) => {
              if (templateCode) {
                const tmpl = BUSINESS_TEMPLATES.find((t) => t.templateCode === templateCode);
                const slug = tmpl?.slug || tmpl?.id || templateCode.toLowerCase();
                const url = pageId ? `/preview/${slug}/${pageId}` : `/preview/${slug}`;
                pushUrl(url);
              } else {
                pushUrl('/website/business');
              }
            }}
          />
        )}

        {/* Dedicated Category Showcase Page */}
        {((currentView === 'website-category' && selectedCategory !== 'business' && selectedCategory !== 'business-websites') ||
          currentView === 'web-app-category' ||
          currentView === 'ecommerce-category' ||
          currentView === 'custom-category') && (
          <CategoryShowcaseView
            categoryId={selectedCategory}
            parentService={categoryParentService}
            onBack={() => {
              if (categoryParentService === 'web-application') {
                handleNavigate('web-application');
              } else if (categoryParentService === 'ecommerce') {
                handleNavigate('ecommerce');
              } else if (categoryParentService === 'custom-websites') {
                handleNavigate('custom-websites');
              } else {
                handleNavigate('website-development');
              }
            }}
            onSelectCategory={(newCatId) => {
              if (newCatId === 'business' || newCatId === 'business-websites') {
                handleOpenCategory('business', 'website-development');
              } else {
                setSelectedCategory(newCatId);
                const baseUrl =
                  categoryParentService === 'web-application'
                    ? `/web-app/${newCatId}`
                    : categoryParentService === 'ecommerce'
                    ? `/ecommerce/${newCatId}`
                    : categoryParentService === 'custom-websites'
                    ? `/custom-websites/${newCatId}`
                    : `/website/${newCatId}`;
                pushUrl(baseUrl);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            onLivePreview={handleLivePreview}
            onUseDesign={handleUseDesign}
            onStartProject={handleStartProject}
          />
        )}

        {currentView === 'live-preview' && (
          <div className="animate-in fade-in duration-200">
            {renderLivePreviewComponent()}
          </div>
        )}

        {currentView === 'enquiry-form' && (
          <EnquiryFormView
            selectedTemplate={activeTemplate as TemplateItem}
            customizationContext={customizedDesignContext}
            onChangeTemplateClick={() => setSearchModalOpen(true)}
            onSubmitSuccess={handleSubmitSuccess}
            onBack={() => handleNavigate('services')}
          />
        )}

        {currentView === 'success' && submittedEnquiry && (
          <SuccessView
            enquiry={submittedEnquiry}
            onGoHome={() => handleNavigate('services')}
            onViewMoreDesigns={() => handleNavigate('website-development')}
          />
        )}
      </main>

      {/* Global Footer (hidden in live preview mode) */}
      {currentView !== 'live-preview' && (
        <Footer onNavigate={handleNavigate} />
      )}

      {/* Search Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectTemplate={(tmpl) => {
          handleLivePreview(tmpl);
        }}
        onSelectService={handleNavigate}
      />

      {/* Enquiries Log Modal */}
      <EnquiriesModal
        isOpen={enquiriesModalOpen}
        onClose={() => setEnquiriesModalOpen(false)}
        enquiries={enquiriesList}
        isLoading={isLoadingEnquiries}
        onRefresh={fetchEnquiries}
      />
    </div>
  );
}
