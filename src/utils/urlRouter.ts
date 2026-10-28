import { PageView, TemplateItem } from '../types';
import { ALL_TEMPLATES } from '../data/servicesData';
import { BUSINESS_TEMPLATES } from '../data/businessTemplates';

export interface AppRouteState {
  view: PageView;
  category?: string;
  parentService?: string;
  platform?: 'android' | 'ios' | 'all';
  templateCode?: string;
  subpage?: string;
  enquiryId?: string;
  searchOpen?: boolean;
  enquiriesOpen?: boolean;
}

/**
 * Parses the browser's current window.location into a structured AppRouteState.
 */
export function parseLocation(pathname: string, search: string): AppRouteState {
  const cleanPath = pathname.replace(/\/+$/, ''); // Remove trailing slashes
  const segments = cleanPath.split('/').filter(Boolean);
  const searchParams = new URLSearchParams(search);

  const searchOpen = searchParams.get('search') === '1' || searchParams.get('search') === 'true';
  const enquiriesOpen = searchParams.get('enquiries') === '1' || searchParams.get('enquiries') === 'true';
  const queryTemplate = searchParams.get('template') || undefined;
  const queryPage = searchParams.get('page') || undefined;
  const enquiryId = searchParams.get('id') || undefined;

  const seg0 = (segments[0] || '').toLowerCase();
  const seg1 = (segments[1] || '').toLowerCase();
  const seg2 = (segments[2] || '').toLowerCase();

  // 1. Home / Root / Services
  if (!seg0 || seg0 === 'home' || seg0 === 'services') {
    return {
      view: 'services',
      searchOpen,
      enquiriesOpen
    };
  }

  // 2. Enquiries modal direct URL
  if (seg0 === 'enquiries') {
    return {
      view: 'services',
      enquiriesOpen: true,
      searchOpen
    };
  }

  // 3. Website Development / Websites
  if (seg0 === 'websites' || seg0 === 'website-development') {
    if (seg1 === 'business' || seg1 === 'business-websites') {
      return {
        view: 'business-templates',
        templateCode: seg2 || queryTemplate,
        subpage: segments[3] || queryPage,
        searchOpen,
        enquiriesOpen
      };
    }
    if (seg1) {
      return {
        view: 'website-category',
        category: seg1,
        parentService: 'website-development',
        searchOpen,
        enquiriesOpen
      };
    }
    return {
      view: 'website-development',
      searchOpen,
      enquiriesOpen
    };
  }

  // 4. Dedicated Business Website Gallery (20 templates)
  if (seg0 === 'business-websites' || seg0 === 'business-templates') {
    return {
      view: 'business-templates',
      templateCode: seg1 || queryTemplate,
      subpage: seg2 || queryPage,
      searchOpen,
      enquiriesOpen
    };
  }

  // 5. Web Applications
  if (seg0 === 'web-apps' || seg0 === 'web-application' || seg0 === 'web-applications') {
    if (seg1) {
      return {
        view: 'web-app-category',
        category: seg1,
        parentService: 'web-application',
        searchOpen,
        enquiriesOpen
      };
    }
    return {
      view: 'web-application',
      searchOpen,
      enquiriesOpen
    };
  }

  // 6. Mobile App Development / Apps
  if (seg0 === 'apps' || seg0 === 'app-development' || seg0 === 'mobile-apps') {
    if (seg1 === 'android' || seg1 === 'ios' || seg1 === 'all') {
      return {
        view: 'app-platform',
        platform: seg1 as any,
        searchOpen,
        enquiriesOpen
      };
    }
    return {
      view: 'app-development',
      searchOpen,
      enquiriesOpen
    };
  }

  // 7. Platform Templates (Android / iOS)
  if (seg0 === 'platform-templates' || seg0 === 'app-templates') {
    const plat = seg1 === 'ios' ? 'ios' : seg1 === 'all' ? 'all' : 'android';
    return {
      view: 'app-platform',
      platform: plat,
      searchOpen,
      enquiriesOpen
    };
  }

  // 8. E-commerce
  if (seg0 === 'ecommerce' || seg0 === 'e-commerce') {
    if (seg1) {
      return {
        view: 'ecommerce-category',
        category: seg1,
        parentService: 'ecommerce',
        searchOpen,
        enquiriesOpen
      };
    }
    return {
      view: 'ecommerce',
      searchOpen,
      enquiriesOpen
    };
  }

  // 9. Custom Websites & Systems
  if (seg0 === 'custom-websites' || seg0 === 'custom-systems') {
    if (seg1) {
      return {
        view: 'custom-category',
        category: seg1,
        parentService: 'custom-websites',
        searchOpen,
        enquiriesOpen
      };
    }
    return {
      view: 'custom-websites',
      searchOpen,
      enquiriesOpen
    };
  }

  // 10. Generic Category route
  if (seg0 === 'category') {
    if (seg2) {
      return {
        view:
          seg1 === 'web-application'
            ? 'web-app-category'
            : seg1 === 'ecommerce'
            ? 'ecommerce-category'
            : seg1 === 'custom-websites'
            ? 'custom-category'
            : 'website-category',
        parentService: seg1,
        category: seg2,
        searchOpen,
        enquiriesOpen
      };
    }
    if (seg1 === 'business' || seg1 === 'business-websites') {
      return {
        view: 'business-templates',
        searchOpen,
        enquiriesOpen
      };
    }
    return {
      view: 'website-category',
      category: seg1,
      parentService: 'website-development',
      searchOpen,
      enquiriesOpen
    };
  }

  // 11. Live Preview of templates
  if (seg0 === 'preview') {
    return {
      view: 'live-preview',
      templateCode: seg1 || queryTemplate,
      subpage: seg2 || queryPage,
      searchOpen,
      enquiriesOpen
    };
  }

  // 12. Enquiry Form / Start Project
  if (seg0 === 'enquiry' || seg0 === 'start-project' || seg0 === 'contact') {
    return {
      view: 'enquiry-form',
      templateCode: queryTemplate,
      searchOpen,
      enquiriesOpen
    };
  }

  // 13. Success confirmation
  if (seg0 === 'success') {
    return {
      view: 'success',
      enquiryId,
      searchOpen,
      enquiriesOpen
    };
  }

  // Default fallback
  return {
    view: 'services',
    searchOpen,
    enquiriesOpen
  };
}

/**
 * Builds the canonical, clean URL for any given application state.
 */
export function buildUrl(state: AppRouteState): string {
  let path = '/';

  switch (state.view) {
    case 'services':
      path = '/';
      break;

    case 'website-development':
      path = '/websites';
      break;

    case 'business-templates':
      if (state.templateCode && state.subpage) {
        path = `/business-websites/${state.templateCode.toLowerCase()}/${state.subpage.toLowerCase()}`;
      } else if (state.templateCode) {
        path = `/business-websites/${state.templateCode.toLowerCase()}`;
      } else {
        path = '/business-websites';
      }
      break;

    case 'website-category':
      if (state.category === 'business' || state.category === 'business-websites') {
        path = '/business-websites';
      } else if (state.category) {
        path = `/websites/${state.category.toLowerCase()}`;
      } else {
        path = '/websites';
      }
      break;

    case 'web-application':
      path = '/web-apps';
      break;

    case 'web-app-category':
      if (state.category) {
        path = `/web-apps/${state.category.toLowerCase()}`;
      } else {
        path = '/web-apps';
      }
      break;

    case 'app-development':
      path = '/apps';
      break;

    case 'app-platform':
    case 'android-app-templates':
    case 'ios-app-templates':
      if (state.platform === 'ios') {
        path = '/apps/ios';
      } else if (state.platform === 'all') {
        path = '/apps/all';
      } else {
        path = '/apps/android';
      }
      break;

    case 'ecommerce':
      path = '/ecommerce';
      break;

    case 'ecommerce-category':
      if (state.category) {
        path = `/ecommerce/${state.category.toLowerCase()}`;
      } else {
        path = '/ecommerce';
      }
      break;

    case 'custom-websites':
      path = '/custom-websites';
      break;

    case 'custom-category':
      if (state.category) {
        path = `/custom-websites/${state.category.toLowerCase()}`;
      } else {
        path = '/custom-websites';
      }
      break;

    case 'live-preview':
      if (state.templateCode && state.subpage) {
        path = `/preview/${state.templateCode.toLowerCase()}/${state.subpage.toLowerCase()}`;
      } else if (state.templateCode) {
        path = `/preview/${state.templateCode.toLowerCase()}`;
      } else {
        path = '/preview';
      }
      break;

    case 'enquiry-form':
      path = '/enquiry';
      if (state.templateCode) {
        path += `?template=${encodeURIComponent(state.templateCode)}`;
      }
      break;

    case 'success':
      path = '/success';
      if (state.enquiryId) {
        path += `?id=${encodeURIComponent(state.enquiryId)}`;
      }
      break;

    default:
      path = '/';
  }

  // Handle modal query parameters if present on top of the path
  if (state.searchOpen && !path.includes('?')) {
    path += '?search=1';
  } else if (state.searchOpen) {
    path += '&search=1';
  }

  if (state.enquiriesOpen && !path.includes('?')) {
    path += '?enquiries=1';
  } else if (state.enquiriesOpen) {
    path += '&enquiries=1';
  }

  return path;
}

/**
 * Returns a human-friendly, professional document title for the current route.
 */
export function getDocumentTitle(state: AppRouteState): string {
  const brand = 'Codemaniac Studio';

  switch (state.view) {
    case 'services':
      return `${brand} | Premium Website, Web App & Mobile App Development`;

    case 'website-development':
      return `Website Development Solutions | ${brand}`;

    case 'business-templates':
      if (state.templateCode) {
        // Find template title
        const codeClean = state.templateCode.toLowerCase().replace(/[^a-z0-9]/g, '');
        const tmpl = BUSINESS_TEMPLATES.find((t) =>
          t.templateCode.toLowerCase().replace(/[^a-z0-9]/g, '') === codeClean ||
          t.slug.toLowerCase().includes(codeClean) ||
          t.name.toLowerCase().replace(/[^a-z0-9]/g, '') === codeClean
        );
        const tmplName = tmpl ? tmpl.name : state.templateCode.toUpperCase();
        if (state.subpage) {
          const capSubpage = state.subpage.charAt(0).toUpperCase() + state.subpage.slice(1);
          return `${capSubpage} - ${tmplName} | ${brand}`;
        }
        return `${tmplName} Live Demo | ${brand}`;
      }
      return `20 Unique Business Website Demos (4 Tiers) | ${brand}`;

    case 'website-category':
      return `${capitalize(state.category || 'Business')} Websites | ${brand}`;

    case 'web-application':
      return `Web Application Solutions | ${brand}`;

    case 'web-app-category':
      return `${capitalize(state.category || 'Enterprise')} Web App Solutions | ${brand}`;

    case 'app-development':
      return `Mobile App Development (Android & iOS) | ${brand}`;

    case 'app-platform':
    case 'android-app-templates':
    case 'ios-app-templates':
      return `${state.platform === 'ios' ? 'iOS' : state.platform === 'all' ? 'Cross-Platform' : 'Android'} App Templates | ${brand}`;

    case 'ecommerce':
      return `E-Commerce Website Solutions | ${brand}`;

    case 'ecommerce-category':
      return `${capitalize(state.category || 'Storefront')} E-Commerce Solutions | ${brand}`;

    case 'custom-websites':
      return `Custom Digital Systems & Websites | ${brand}`;

    case 'custom-category':
      return `${capitalize(state.category || 'Custom')} Website Architecture | ${brand}`;

    case 'live-preview':
      if (state.templateCode) {
        return `Live Preview: ${state.templateCode.toUpperCase()} | ${brand}`;
      }
      return `Interactive Live Preview | ${brand}`;

    case 'enquiry-form':
      return `Start Your Project - Request a Quote | ${brand}`;

    case 'success':
      return `Enquiry Submitted Successfully | ${brand}`;

    default:
      return `${brand} | Engineering High-Impact Digital Experiences`;
  }
}

function capitalize(str: string): string {
  if (!str) return '';
  return str
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
