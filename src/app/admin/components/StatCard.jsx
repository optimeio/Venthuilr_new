'use client';

import React from 'react';

export default function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  colorScheme = 'gold', // 'gold', 'green', 'terracotta', 'amber', 'red'
  badgeText,
  onClick
}) {
  return (
    <div
      className={`admin-stat-card ${colorScheme}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="admin-stat-top">
        <span className="admin-stat-label">{label}</span>
        {Icon && (
          <div className={`admin-stat-icon-wrap ${colorScheme}`}>
            <Icon size={18} />
          </div>
        )}
      </div>

      <div className="admin-stat-value">{value}</div>

      {(subtext || badgeText) && (
        <div className="admin-stat-subtext">
          {badgeText && (
            <span className={`admin-badge ${colorScheme === 'green' ? 'success' : colorScheme === 'red' ? 'danger' : 'gold'}`} style={{ marginRight: '4px' }}>
              {badgeText}
            </span>
          )}
          <span>{subtext}</span>
        </div>
      )}
    </div>
  );
}
