import React from 'react';
import { TemplateItem } from '../../types';
import { CategoryShowcaseView } from './CategoryShowcaseView';

interface WebsiteCategoryViewProps {
  categoryId: string;
  onBack: () => void;
  onSelectCategory: (categoryId: string) => void;
  onLivePreview: (template: TemplateItem) => void;
  onUseDesign: (template: TemplateItem) => void;
  onStartProject: (context?: string) => void;
}

export const WebsiteCategoryView: React.FC<WebsiteCategoryViewProps> = ({
  categoryId,
  onBack,
  onSelectCategory,
  onLivePreview,
  onUseDesign,
  onStartProject
}) => {
  return (
    <CategoryShowcaseView
      categoryId={categoryId}
      parentService="website-development"
      onBack={onBack}
      onSelectCategory={onSelectCategory}
      onLivePreview={onLivePreview}
      onUseDesign={onUseDesign}
      onStartProject={onStartProject}
    />
  );
};
