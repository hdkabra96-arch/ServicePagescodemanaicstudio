import React from 'react';
import { SiteSettings } from '../types';

interface WhatsAppButtonProps {
  settings: SiteSettings;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({ settings }) => {
  const cleanDigits = (settings.whatsappNumber || '').replace(/[^\d]/g, '');

  if (!settings.whatsappEnabled || cleanDigits.length < 7) {
    return null;
  }

  const message = settings.whatsappMessage?.trim();
  const href = message
    ? `https://wa.me/${cleanDigits}?text=${encodeURIComponent(message)}`
    : `https://wa.me/${cleanDigits}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      title="Chat with us on WhatsApp"
      className="fixed bottom-6 left-6 z-40 group flex items-center gap-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white pl-3.5 pr-4 py-3 rounded-full shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/45 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        className="w-6 h-6 fill-current shrink-0"
        aria-hidden="true"
      >
        <path d="M16.004 3C8.833 3 3 8.832 3 16.002c0 2.293.6 4.53 1.74 6.5L3 29l6.678-1.714A12.94 12.94 0 0 0 16.004 29C23.173 29 29 23.17 29 16.002 29 8.832 23.173 3 16.004 3zm0 23.62c-1.99 0-3.94-.535-5.643-1.546l-.405-.24-3.963 1.017 1.058-3.864-.263-.42a10.573 10.573 0 0 1-1.622-5.565c0-5.853 4.763-10.616 10.62-10.616 2.836 0 5.502 1.105 7.506 3.11a10.55 10.55 0 0 1 3.112 7.506c0 5.856-4.763 10.618-10.4 10.618zm5.826-7.953c-.32-.16-1.888-.932-2.18-1.038-.293-.107-.506-.16-.72.16-.213.32-.826 1.038-1.013 1.252-.187.213-.373.24-.693.08-.32-.16-1.35-.498-2.573-1.588-.952-.85-1.594-1.9-1.78-2.22-.187-.32-.02-.493.14-.652.144-.143.32-.373.48-.56.16-.187.213-.32.32-.533.106-.213.053-.4-.027-.56-.08-.16-.72-1.733-.986-2.373-.26-.624-.524-.54-.72-.55-.186-.009-.4-.011-.613-.011-.213 0-.56.08-.853.4-.293.32-1.12 1.093-1.12 2.666 0 1.573 1.147 3.093 1.307 3.307.16.213 2.256 3.446 5.466 4.832.764.33 1.36.527 1.825.674.767.244 1.464.21 2.016.127.615-.092 1.888-.772 2.154-1.518.266-.747.266-1.387.186-1.52-.08-.133-.293-.213-.613-.373z" />
      </svg>
      <span className="text-sm font-semibold tracking-tight hidden sm:inline">
        WhatsApp
      </span>
    </a>
  );
};
