import React from 'react';
import { BusinessTemplateItem } from '../../../types';
import {
  CleanStarterDemo,
  LocalBusinessDemo,
  CreativeStudioDemo,
  ProfessionalServicesDemo,
  MinimalConsultantDemo
} from './Tier1BasicDemos';
import {
  SplitHeroBusinessDemo,
  BoldTypographyDemo,
  EditorialBusinessDemo,
  GradientStartupDemo,
  GeometricCorporateDemo
} from './Tier2MidRangeDemos';
import {
  LuxuryConsultantDemo,
  ExecutiveDarkDemo,
  EditorialLuxuryDemo,
  ArchitecturalBusinessDemo,
  GlassBusinessDemo
} from './Tier3PremiumDemos';
import {
  Immersive3DDemo,
  CinematicAgencyDemo,
  NeonInnovationDemo,
  InteractiveOrbitalDemo,
  FuturisticSpatialDemo
} from './Tier4UltraPremiumDemos';

interface BusinessTemplateRendererProps {
  template: BusinessTemplateItem;
  onUseDesign: (template: BusinessTemplateItem) => void;
  activePage?: string;
  onPageChange?: (page: string) => void;
}

export const BusinessTemplateRenderer: React.FC<BusinessTemplateRendererProps> = ({
  template,
  onUseDesign,
  activePage,
  onPageChange
}) => {
  const code = (template.templateNumber || template.templateCode || '').replace(/\D/g, '');
  const num = parseInt(code, 10);

  const sharedProps = {
    template,
    onUseDesign,
    externalActivePage: activePage,
    onPageChange
  };

  switch (num) {
    case 1:
      return <CleanStarterDemo {...sharedProps} />;
    case 2:
      return <LocalBusinessDemo {...sharedProps} />;
    case 3:
      return <CreativeStudioDemo {...sharedProps} />;
    case 4:
      return <ProfessionalServicesDemo {...sharedProps} />;
    case 5:
      return <MinimalConsultantDemo {...sharedProps} />;
    case 6:
      return <SplitHeroBusinessDemo {...sharedProps} />;
    case 7:
      return <BoldTypographyDemo {...sharedProps} />;
    case 8:
      return <EditorialBusinessDemo {...sharedProps} />;
    case 9:
      return <GradientStartupDemo {...sharedProps} />;
    case 10:
      return <GeometricCorporateDemo {...sharedProps} />;
    case 11:
      return <LuxuryConsultantDemo {...sharedProps} />;
    case 12:
      return <ExecutiveDarkDemo {...sharedProps} />;
    case 13:
      return <EditorialLuxuryDemo {...sharedProps} />;
    case 14:
      return <ArchitecturalBusinessDemo {...sharedProps} />;
    case 15:
      return <GlassBusinessDemo {...sharedProps} />;
    case 16:
      return <Immersive3DDemo {...sharedProps} />;
    case 17:
      return <CinematicAgencyDemo {...sharedProps} />;
    case 18:
      return <NeonInnovationDemo {...sharedProps} />;
    case 19:
      return <InteractiveOrbitalDemo {...sharedProps} />;
    case 20:
      return <FuturisticSpatialDemo {...sharedProps} />;
    default:
      return <CleanStarterDemo {...sharedProps} />;
  }
};
