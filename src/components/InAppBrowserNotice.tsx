'use client';

import {useEffect, useState} from 'react';
import {usePathname} from 'next/navigation';

/** In-app browser detection is advisory: user agents vary between app versions. */
export function isSocialInAppBrowser(userAgent: string): boolean {
  return /FBAN|FBAV|FB_IAB|FB4A|FBIOS|Messenger|\bInstagram\b|\bLine\//i.test(userAgent);
}

export default function InAppBrowserNotice({compact = false}: {compact?: boolean}) {
  const [embedded, setEmbedded] = useState(false);
  const [ios, setIos] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const ua = navigator.userAgent;
    setEmbedded(isSocialInAppBrowser(ua));
    setIos(/iPad|iPhone|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
  }, []);

  if (!embedded || dismissed) return null;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      // Clipboard access can be blocked by in-app browsers; show the URL for manual copying.
      setCopied(false);
      const input = document.getElementById('external-browser-url') as HTMLInputElement | null;
      input?.focus();
      input?.select();
    }
  }

  return (
    <aside className={`external-browser-notice ${compact ? 'external-browser-compact' : ''}`} aria-label="Open Kiangan Pickleball in your browser">
      <div className="external-browser-notice-heading">
        <strong>🌐 Open in Chrome or Safari</strong>
        <button type="button" className="external-browser-dismiss" onClick={() => setDismissed(true)} aria-label="Dismiss browser notice">×</button>
      </div>
      <p>You're viewing this site inside Messenger or another social app. For reliable app installation and saved sessions, open it in your regular browser <strong>before creating an Open Play</strong>.</p>
      <p className="external-browser-steps">{ios ? 'On iPhone: tap the Messenger menu (⋯) and choose Open in Browser, or copy the link and paste it into Safari.' : 'On Android: tap the Messenger menu (⋮ or ⋯) and choose Open in Browser or Open in Chrome. If that option is missing, copy the link into Chrome.'}</p>
      <div className="external-browser-actions">
        <button type="button" className="external-browser-copy" onClick={copyLink}>{copied ? '✓ Link copied' : '📋 Copy link'}</button>
        <button type="button" className="external-browser-secondary" onClick={() => setDismissed(true)}>Continue here</button>
      </div>
      <label className="external-browser-url-label" htmlFor="external-browser-url">Website link</label>
      <input id="external-browser-url" readOnly value={typeof window !== 'undefined' ? window.location.href : ''} onFocus={e => e.currentTarget.select()} aria-label="Website URL to copy" />
      {pathname === '/create' && <p className="external-browser-important">Sessions created here may not be accessible in Chrome, Safari, or your installed app.</p>}
    </aside>
  );
}
