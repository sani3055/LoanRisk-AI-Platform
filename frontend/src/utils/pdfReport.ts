import { jsPDF } from 'jspdf';
import { Result, initialFormState } from '../types';

export function downloadReport(r: Result, form: typeof initialFormState) {
  const pdf = new jsPDF();
  pdf.setFontSize(20);
  pdf.text('Loan Risk Assessment', 20, 20);
  pdf.setFontSize(11);
  pdf.text(`Assessment date: ${new Date().toLocaleString()}`, 20, 32);
  pdf.text(`Final score: ${(r.final_risk_score * 100).toFixed(1)} / 100 (${r.risk_level})`, 20, 44);
  pdf.text(`XGBoost default probability: ${(r.ml_probability * 100).toFixed(1)}%`, 20, 54);
  pdf.text(`FinBERT sentiment: ${r.sentiment.label} (${(r.sentiment.confidence * 100).toFixed(1)}%)`, 20, 64);
  pdf.text('Top risk factors', 20, 78);
  r.shap_explanation.risk_increasing_factors.slice(0, 4).forEach((x, i) => 
    pdf.text(`${x.feature}: ${x.contribution.toFixed(3)}`, 20, 88 + i * 8)
  );
  pdf.save('loan-risk-report.pdf');
}
