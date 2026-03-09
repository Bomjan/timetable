import React from 'react';
import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';
import { Download } from 'lucide-react';

const PDFExportButton = ({ targetId, className }) => {
  const exportPDF = async () => {
    const element = document.getElementById(targetId);
    if (!element) return;

    try {
      const dataUrl = await toPng(element, { 
        pixelRatio: 2, 
        cacheBust: true,
        backgroundColor: '#ffffff'
      });
      
      const width = element.offsetWidth;
      const height = element.offsetHeight;
      
      const pdf = new jsPDF({
        orientation: width > height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [width, height]
      });

      pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
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
