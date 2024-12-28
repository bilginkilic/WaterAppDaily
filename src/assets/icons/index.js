import { SvgXml } from 'react-native-svg';

const dishwasherSvg = `
<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M40 8H8C5.79086 8 4 9.79086 4 12V40C4 42.2091 5.79086 44 8 44H40C42.2091 44 44 42.2091 44 40V12C44 9.79086 42.2091 8 40 8Z" stroke="currentColor" stroke-width="2"/>
  <path d="M4 16H44" stroke="currentColor" stroke-width="2"/>
  <circle cx="10" cy="12" r="1.5" fill="currentColor"/>
  <circle cx="14" cy="12" r="1.5" fill="currentColor"/>
  <circle cx="18" cy="12" r="1.5" fill="currentColor"/>
  <rect x="8" y="20" width="32" height="20" rx="2" stroke="currentColor" stroke-width="2"/>
  <path d="M12 24V36" stroke="currentColor" stroke-width="2"/>
  <path d="M16 24V36" stroke="currentColor" stroke-width="2"/>
  <path d="M20 24V36" stroke="currentColor" stroke-width="2"/>
  <path d="M24 24V36" stroke="currentColor" stroke-width="2"/>
  <path d="M28 24V36" stroke="currentColor" stroke-width="2"/>
  <path d="M32 24V36" stroke="currentColor" stroke-width="2"/>
  <path d="M36 24V36" stroke="currentColor" stroke-width="2"/>
</svg>
`;

const showerSvg = `
<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M24 4V12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <path d="M24 12C30.6274 12 36 17.3726 36 24" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <path d="M36 24C36 30.6274 30.6274 36 24 36" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <path d="M24 36C17.3726 36 12 30.6274 12 24" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <path d="M12 24C12 17.3726 17.3726 12 24 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <circle cx="24" cy="24" r="4" fill="currentColor"/>
  <path d="M24 36V44" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <path d="M20 40L28 40" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>
`;

const laundrySvg = `
<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="6" y="4" width="36" height="40" rx="4" stroke="currentColor" stroke-width="2"/>
  <circle cx="24" cy="28" r="8" stroke="currentColor" stroke-width="2"/>
  <path d="M24 20C26.2091 20 28 18.2091 28 16C28 13.7909 26.2091 12 24 12" stroke="currentColor" stroke-width="2"/>
  <circle cx="14" cy="10" r="2" fill="currentColor"/>
  <circle cx="20" cy="10" r="2" fill="currentColor"/>
</svg>
`;

const plumbingSvg = `
<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 8H36" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <path d="M24 8V16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <path d="M18 16H30" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <path d="M20 16V24" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <path d="M28 16V24" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <path d="M16 24H32" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <path d="M24 24V40" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <circle cx="24" cy="40" r="4" stroke="currentColor" stroke-width="2"/>
</svg>
`;

const dailySvg = `
<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="8" y="4" width="32" height="40" rx="4" stroke="currentColor" stroke-width="2"/>
  <path d="M8 16H40" stroke="currentColor" stroke-width="2"/>
  <path d="M16 8V12" stroke="currentColor" stroke-width="2"/>
  <path d="M32 8V12" stroke="currentColor" stroke-width="2"/>
  <path d="M24 24L24 32" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <path d="M20 28H28" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>
`;

const carSvg = `
<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M8 20L12 8H36L40 20" stroke="currentColor" stroke-width="2"/>
  <path d="M4 32H44" stroke="currentColor" stroke-width="2"/>
  <path d="M8 20H40V32H8V20Z" stroke="currentColor" stroke-width="2"/>
  <circle cx="16" cy="26" r="3" stroke="currentColor" stroke-width="2"/>
  <circle cx="32" cy="26" r="3" stroke="currentColor" stroke-width="2"/>
  <path d="M44 24V36" stroke="currentColor" stroke-width="2"/>
  <path d="M4 24V36" stroke="currentColor" stroke-width="2"/>
  <path d="M40 12H44V20" stroke="currentColor" stroke-width="2"/>
  <path d="M8 12H4V20" stroke="currentColor" stroke-width="2"/>
</svg>
`;

const createIcon = (svg) => ({ width, height, color }) => (
  <SvgXml 
    xml={svg} 
    width={width} 
    height={height} 
    color={color}
  />
);

export const Icons = {
  dishwashing: createIcon(dishwasherSvg),
  shower: createIcon(showerSvg),
  laundry: createIcon(laundrySvg),
  plumbing: createIcon(plumbingSvg),
  daily: createIcon(dailySvg),
  car: createIcon(carSvg),
}; 