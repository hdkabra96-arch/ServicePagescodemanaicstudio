import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  active?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex items-center space-x-2 text-xs md:text-sm text-slate-500 py-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
            {item.onClick && !isLast ? (
              <button
                onClick={item.onClick}
                className="hover:text-orange-600 transition-colors font-medium hover:underline focus:outline-hidden"
              >
                {item.label}
              </button>
            ) : (
              <span className={isLast ? 'text-slate-800 font-semibold truncate' : 'text-slate-500'}>
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
