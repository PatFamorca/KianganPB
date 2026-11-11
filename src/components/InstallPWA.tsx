'use client';

import {useEffect, useState} from 'react';

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{outcome: 'accepted' | 'dismissed'; platform: string}>;
};
type Platform = 'ios' | 'android' | 'other';

export default function InstallPWA() {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [help, setHelp] = useState(false);
  const [platform, setPlatform] = useState<Platform>('other');
  const [safari, setSafari] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const isIos = /iPad|iPhone|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setPlatform(isIos ? 'ios' : /Android/i.test(ua) ? 'android' : 'other');
    setSafari(isIos && /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua));
    setInstalled(window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in navigator && (navigator as Navigator & {standalone?: boolean}).standalone === true));
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
      <button type="button" className="home-action-link home-install-button" onClick={install} aria-expanded={help} aria-controls="install-help">
        <span aria-hidden="true">⬇</span> Install App
      </button>
      {help && (
        <div id="install-help" className="home-install-help" role="status">
          {platform === 'ios' ? (
            <>
              <strong>Install on iPhone or iPad</strong>
              {!safari && <p>Open this website in Safari first for the most reliable installation experience.</p>}
              <ol>
                <li>In Safari, tap <strong>Share</strong> (square with an upward arrow).</li>
                <li>Scroll and choose <strong>Add to Home Screen</strong> (or <strong>Open as Web App</strong> if shown).</li>
                <li>Tap <strong>Add</strong>, then open Kiangan Pickleball from your Home Screen.</li>
              </ol>
              <p>Apple does not provide a direct install popup for this button.</p>
            </>
          ) : platform === 'android' ? (
            <>
              <strong>Install on Android</strong>
              <ol><li>Open this site in Chrome.</li><li>Tap the <strong>⋮</strong> browser menu.</li><li>Choose <strong>Install app</strong> or <strong>Add to Home screen</strong>.</li></ol>
            </>
          ) : (
            <>
              <strong>Install on your device</strong>
              <p>Use your browser menu and choose <strong>Install app</strong> or <strong>Add to Home Screen</strong>, if supported.</p>
            </>
          )}
          <p className="install-storage-note">Saved sessions are tied to this browser or installed app. Create sessions inside the installed app to keep them accessible there.</p>
        </div>
      )}
    </div>
  );
}
