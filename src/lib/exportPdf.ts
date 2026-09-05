import { jsPDF } from 'jspdf';
import { PHASE_LABELS } from './phaseLabels';
import type { TrainingPlan } from '../types';

const LINE_HEIGHT = 5.5;
const MARGIN = 14;
const PAGE_HEIGHT = 297;

export function exportPlanToPdf(plan: TrainingPlan): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  let y = MARGIN;

  function ensureSpace(lines = 1) {
    if (y + lines * LINE_HEIGHT > PAGE_HEIGHT - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  }

  function text(str: string, size: number, bold = false) {
    doc.setFontSize(size);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    const wrapped = doc.splitTextToSize(str, 210 - MARGIN * 2) as string[];
    ensureSpace(wrapped.length);
    doc.text(wrapped, MARGIN, y);
    y += wrapped.length * LINE_HEIGHT;
  }

  text('Programme de préparation — Semi-marathon', 16, true);
  text(`Généré le ${new Date(plan.generatedAt).toLocaleDateString('fr-FR')}`, 10);
  text(`Course visée : ${plan.profile.raceDate} — ${plan.weeksAvailable} semaines de préparation`, 10);
  y += 3;

  for (const week of plan.weeks) {
    ensureSpace(3);
    y += 2;
    text(
      `Semaine ${week.number} (${week.startDate} → ${week.endDate}) — ${PHASE_LABELS[week.phase]}${
        week.isRecoveryWeek ? ' · récupération' : ''
      }${week.isTaperWeek ? ' · affûtage' : ''} — ${week.totalVolumeKm} km`,
      12,
      true,
    );

    for (const session of week.sessions) {
      if (session.type === 'repos') {
        text(`  ${session.date} — Repos`, 10);
        continue;
      }
      const meta = [
        session.distanceKm ? `${session.distanceKm} km` : null,
        session.durationMin ? `${session.durationMin} min` : null,
        session.optional ? 'facultatif' : null,
      ]
        .filter(Boolean)
        .join(' · ');
      text(`  ${session.date} — ${session.title}${meta ? ` (${meta})` : ''}`, 10, true);
      text(`    ${session.description}`, 9);
    }
  }

  doc.save(`programme-semi-marathon-${plan.profile.raceDate}.pdf`);
}
