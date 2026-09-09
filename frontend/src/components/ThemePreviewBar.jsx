import React, { useState, useEffect } from 'react';
import { Palette, Check, Sparkles, X, Sun, Flame, Droplets } from 'lucide-react';
import './ThemePreviewBar.css';

export const ACCENT_THEMES = [
  {
    id: 'gold',
    name: 'Option 1: Saffron Turmeric Gold',
    shortName: '1. Saffron Gold',
    colorHex: '#F59E0B',
    paleHex: '#FEF3C7',
    borderHex: '#FDE68A',
    textHex: '#92400E',
    shadowHex: 'rgba(245, 158, 11, 0.4)',
    desc: 'Golden Harvest, Curcumin Radiance & Auspicious Spice Glow',
    badge: 'Recommended 🌟',
    icon: Sun
  },
  {
    id: 'terracotta',
    name: 'Option 2: Chettinad Paprika Crimson',
    shortName: '2. Chettinad Crimson',
    colorHex: '#DC2626',
    paleHex: '#FEE2E2',
    borderHex: '#FCA5A5',
    textHex: '#991B1B',
    shadowHex: 'rgba(220, 38, 38, 0.4)',
    desc: 'Earthen Red Clay & Sun-Dried Guntur Chilli Heat',
    badge: 'Authentic Spice 🌶️',
    icon: Flame
  },
  {
    id: 'copper',
    name: 'Option 3: Marachekku Copper Amber',
    shortName: '3. Chekku Copper',
    colorHex: '#B45309',
    paleHex: '#FFEDD5',
    borderHex: '#FED7AA',
    textHex: '#7C2D12',
    shadowHex: 'rgba(180, 83, 9, 0.4)',
    desc: 'Traditional Wood-Pressed Sesame & Heritage Teak',
    badge: 'Heritage Craft 🛢️',
    icon: Droplets
  }
];

export default function ThemePreviewBar() {
  const [activeTheme, setActiveTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('venthulir_accent') || 'gold';
    }
    return 'gold';
  });
  const [minimized, setMinimized] = useState(false);

  const applyThemeTokens = (themeId) => {
    const selected = ACCENT_THEMES.find((t) => t.id === themeId) || ACCENT_THEMES[0];
    const root = document.documentElement;
    root.setAttribute('data-accent', selected.id);
    document.body.setAttribute('data-accent', selected.id);
    
    // Inject directly into root inline styles for immediate 100% cascade override
    root.style.setProperty('--accent-color', selected.colorHex);
    root.style.setProperty('--accent-hover', selected.textHex);
    root.style.setProperty('--accent-pale', selected.paleHex);
    root.style.setProperty('--accent-border', selected.borderHex);
    root.style.setProperty('--accent-text', selected.textHex);
    root.style.setProperty('--accent-shadow', selected.shadowHex);
    root.style.setProperty('--gold', selected.colorHex);
    root.style.setProperty('--gold-light', selected.paleHex);
    
    localStorage.setItem('venthulir_accent', selected.id);
  };

  useEffect(() => {
    applyThemeTokens(activeTheme);
  }, [activeTheme]);

  const handleSelect = (themeId) => {
    setActiveTheme(themeId);
    applyThemeTokens(themeId);
  };

  return (
    <aside className={`theme-preview-floating-bar ${minimized ? 'is-minimized' : ''}`} aria-label="Color theme selector">
      {minimized ? (
        <button 
          className="theme-preview-pill-btn"
          onClick={() => setMinimized(false)}
          title="Open 3rd Accent Color Selector"
        >
          <Palette size={16} />
          <span>🎨 3rd Accent Color: {activeTheme.toUpperCase()}</span>
        </button>
      ) : (
        <div className="theme-preview-card">
          <div className="theme-preview-header">
            <div className="theme-preview-title-wrap">
              <div className="palette-icon-bubble">
                <Palette size={18} />
              </div>
              <div>
                <h4 className="theme-preview-title">Choose 3rd Accent Color (Live Interactive Preview)</h4>
                <p className="theme-preview-subtitle">Green &amp; White kooda sernthu site-la appear aaga vendiya 3rd color-ai select pannunga:</p>
              </div>
            </div>
            <button 
              className="theme-preview-close" 
              onClick={() => setMinimized(true)}
              aria-label="Minimize preview bar"
              title="Minimize"
            >
              <X size={15} />
            </button>
          </div>

          <div className="theme-options-grid">
            {ACCENT_THEMES.map((theme) => {
              const isSelected = activeTheme === theme.id;
              const IconComp = theme.icon;
              return (
                <button
                  key={theme.id}
                  className={`theme-option-card ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => handleSelect(theme.id)}
                  type="button"
                  style={{
                    borderColor: isSelected ? theme.colorHex : undefined,
                    boxShadow: isSelected ? `0 8px 24px ${theme.shadowHex}` : undefined
                  }}
                >
                  <div className="option-color-swatch-row">
                    <div className="swatch-and-icon">
                      <span 
                        className="color-swatch-circle" 
                        style={{ backgroundColor: theme.colorHex }}
                      />
                      <IconComp size={14} style={{ color: theme.colorHex }} />
                    </div>
                    <span 
                      className="theme-badge-pill" 
                      style={{ 
                        color: theme.textHex, 
                        background: theme.paleHex,
                        border: `1px solid ${theme.borderHex}`
                      }}
                    >
                      {theme.badge}
                    </span>
                    {isSelected && <Check size={16} className="selection-check-icon" style={{ color: theme.colorHex }} />}
                  </div>

                  <div className="theme-option-name" style={{ color: isSelected ? theme.textHex : '#113320' }}>
                    {theme.shortName}
                  </div>
                  <div className="theme-color-code" style={{ color: theme.colorHex }}>
                    {theme.colorHex}
                  </div>
                  <div className="theme-desc-text">{theme.desc}</div>
                </button>
              );
            })}
          </div>

          <div className="theme-preview-footer-note">
            <Sparkles size={14} color="var(--accent-color)" />
            <span>Mela irukura buttons-la click pannavudaney <strong>Badges, Offers, Stars, Highlights, Buttons</strong> ellam instant-aa change aagum!</span>
          </div>
        </div>
      )}
    </aside>
  );
}
