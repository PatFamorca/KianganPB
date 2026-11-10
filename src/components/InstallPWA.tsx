'use client';

import {useEffect, useState} from 'react';

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{outcome: 'accepted' | 'dismissed'; platform: string}>;
};

export default function InstallPWA() {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [help, setHelp] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in navigator && (navigator as Navigator & {standalone?: boolean}).standalone === true);
    setInstalled(standalone);
    setIos(/iPad|iPhone|iPod/.test(navigator.userAgent));
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
      setHelp(false);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (installed) return null;

  const install = async () => {
    if (!promptEvent) {
      setHelp(value => !value);
      return;
    }
    const event = promptEvent;
    setPromptEvent(null);
    try {
      await event.prompt();
      const choice = await event.userChoice;
      if (choice.outcome !== 'accepted') setHelp(true);
    } catch {
      setHelp(true);
    }
  };

  return (
    <div className="home-install" aria-label="Install Kiangan Pickleball">
      <button type="button" className="home-action-link home-install-button" onClick={install}>
        <span aria-hidden="true">⬇</span> Install App
      </button>
      {help && (
        <p className="home-install-help" role="status">
          {ios
            ? 'On iPhone or iPad, open this page in Safari, tap Share, then Add to Home Screen.'
            : 'On Android, open this page in Chrome, tap the ⋮ menu, then Install app or Add to Home screen. Installation may not be available in every browser.'}
        </p>
      )}
    </div>
  );
}
