/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PageView, TemplateItem, EnquirySubmission } from './types';
import { ALL_TEMPLATES } from './data/servicesData';
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
import { EnquiryFormView } from './components/EnquiryFormView';
import { SuccessView } from './components/SuccessView';

export default function App() {
  const [currentView, setCurrentView] = useState<PageView>('services');
  const [selectedPlatform, setSelectedPlatform] = useState<'android' | 'ios' | 'all'>('android');
  const [selectedCategory, setSelectedCategory] = useState<string>('business');
  const [categoryParentService, setCategoryParentService] = useState<string>('website-development');
  const [activeTemplate, setActiveTemplate] = useState<TemplateItem>(ALL_TEMPLATES[0]);
  const [customizedDesignContext, setCustomizedDesignContext] = useState<any>(null);
  const [submittedEnquiry, setSubmittedEnquiry] = useState<EnquirySubmission | null>(null);

  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [enquiriesModalOpen, setEnquiriesModalOpen] = useState(false);
  const [enquiriesList, setEnquiriesList] = useState<EnquirySubmission[]>([]);
  const [isLoadingEnquiries, setIsLoadingEnquiries] = useState(false);

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

    // LocalStorage fallback if server is unreachable
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

  // Navigation handlers
  const handleNavigate = (view: PageView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenCategory = (catId: string, parent: string = 'website-development') => {
    setSelectedCategory(catId);
    setCategoryParentService(parent);
    if (catId === 'business' || catId === 'business-websites') {
      setCurrentView('business-templates');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (parent === 'web-application') {
      setCurrentView('web-app-category');
    } else if (parent === 'ecommerce') {
      setCurrentView('ecommerce-category');
    } else if (parent === 'custom-websites') {
      setCurrentView('custom-category');
    } else {
      setCurrentView('website-category');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartProject = (initialRequirement?: string) => {
    // Pick or create default template
    if (initialRequirement) {
      const matched = ALL_TEMPLATES.find((t) =>
        initialRequirement.toLowerCase().includes(t.name.toLowerCase()) ||
        initialRequirement.toLowerCase().includes(t.serviceCategory.toLowerCase())
      );
      if (matched) setActiveTemplate(matched);
    }
    setCurrentView('enquiry-form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLivePreview = (template: TemplateItem) => {
    setActiveTemplate(template);
    setCurrentView('live-preview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUseDesign = (template: TemplateItem, customData?: any) => {
    setActiveTemplate(template);
    setCustomizedDesignContext(customData || null);
    setCurrentView('enquiry-form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitSuccess = (enquiry: EnquirySubmission) => {
    setSubmittedEnquiry(enquiry);
    setCurrentView('success');
    fetchEnquiries();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render Live Preview depending on template type
  const renderLivePreviewComponent = () => {
    switch (activeTemplate.previewType) {
      case 'admin-panel':
        return (
          <AdminPanelDemo
            template={activeTemplate}
            onBack={() => handleNavigate('web-application')}
            onUseDesign={handleUseDesign}
          />
        );
      case 'mobile-app':
        return (
          <MobileAppDemo
            template={activeTemplate}
            onBack={() => handleNavigate('app-platform')}
            onUseDesign={handleUseDesign}
          />
        );
      case 'ecommerce':
        return (
          <EcommerceStoreDemo
            template={activeTemplate}
            onBack={() => handleNavigate('ecommerce')}
            onUseDesign={handleUseDesign}
          />
        );
      case 'booking':
        return (
          <BookingSystemDemo
            template={activeTemplate}
            onBack={() => handleNavigate('web-application')}
            onUseDesign={handleUseDesign}
          />
        );
      case 'student':
        return (
          <StudentManagementDemo
            template={activeTemplate}
            onBack={() => handleNavigate('web-application')}
            onUseDesign={handleUseDesign}
          />
        );
      case 'corporate':
        return (
          <CorporateWebsiteDemo
            template={activeTemplate}
            onBack={() => handleNavigate('custom-websites')}
            onUseDesign={handleUseDesign}
          />
        );
      case 'website':
      default:
        return (
          <BusinessProDemo
            template={activeTemplate}
            onBack={() => handleNavigate('website-development')}
            onUseDesign={handleUseDesign}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-800 flex flex-col selection:bg-orange-500 selection:text-white">
      
      {/* Global Navigation Header (hidden on immersive live preview mode for app isolation) */}
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
              handleNavigate('app-platform');
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
            onSwitchPlatform={(newPlatform) => setSelectedPlatform(newPlatform)}
            onLivePreview={handleLivePreview}
            onUseDesign={handleUseDesign}
          />
        )}

        {currentView === 'android-app-templates' && (
          <PlatformTemplatesView
            platform="android"
            onBack={() => handleNavigate('app-development')}
            onSwitchPlatform={(newPlatform) => setSelectedPlatform(newPlatform)}
            onLivePreview={handleLivePreview}
            onUseDesign={handleUseDesign}
          />
        )}

        {currentView === 'ios-app-templates' && (
          <PlatformTemplatesView
            platform="ios"
            onBack={() => handleNavigate('app-development')}
            onSwitchPlatform={(newPlatform) => setSelectedPlatform(newPlatform)}
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
          />
        )}

        {/* Dedicated Category Showcase Page (Variety of templates for selected category) */}
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
            selectedTemplate={activeTemplate}
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
          setActiveTemplate(tmpl);
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
