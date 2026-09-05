import type { SessionType } from '../types';

export interface SessionColor {
  bg: string;
  text: string;
  border: string;
  dot: string;
  label: string;
}

export const SESSION_COLORS: Record<SessionType, SessionColor> = {
  endurance: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-300', dot: 'bg-blue-600', label: 'Endurance' },
  tempo: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300', dot: 'bg-amber-500', label: 'Tempo' },
  fractionne: { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-300', dot: 'bg-red-600', label: 'Fractionné' },
  sortie_longue: { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-300', dot: 'bg-green-600', label: 'Sortie longue' },
  repos: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400', label: 'Repos' },
  renfo: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-300', dot: 'bg-purple-600', label: 'Renforcement' },
  velo: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-300', dot: 'bg-purple-600', label: 'Vélo' },
  marche_active: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-300', dot: 'bg-purple-600', label: 'Marche active' },
};
