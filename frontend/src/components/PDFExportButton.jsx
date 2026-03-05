import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Download } from 'lucide-react';

const PDFExportButton = ({ targetId, className }) => {
  const exportPDF = async () => {
    const element = document.getElementById(targetId);
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('timetable.pdf');
    } catch (err) {
      console.error("PDF Export failed", err);
    }
  };

  return (
    <button 
      onClick={exportPDF}
      className={className}
    >
      <Download size={18} />
      Export PDF
    </button>
  );
};

export default PDFExportButton;
