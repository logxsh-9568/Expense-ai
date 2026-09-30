import React, { useState } from 'react';
import { X, FileSpreadsheet, FileText, File, Download } from 'lucide-react';
import { storageService } from '../services/storageService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ExportFormat = 'csv' | 'txt' | 'pdf';

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');

  if (!isOpen) return null;

  const handleExport = () => {
    const expenses = storageService.getExpenses();
    let content = '';
    let filename = 'expenseai_export';
    let mimeType = '';

    if (selectedFormat === 'pdf') {
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(18);
      doc.text('ExpenseAI Financial Report', 14, 22);
      
      // Subtitle
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      
      // Table Data
      const tableColumn = ["Date", "Time", "Description", "Category", "Amount", "Method"];
      const tableRows = expenses.map(e => [
        e.date,
        e.time,
        e.description,
        e.category,
        e.amount.toString(),
        e.paymentMethod || 'Cash'
      ]);

      autoTable(doc, {
        startY: 35,
        head: [tableColumn],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] },
        styles: { fontSize: 9, cellPadding: 3 },
      });
      
      doc.save(`${filename}.pdf`);
      onClose();
      return;
    }

    if (selectedFormat === 'csv') {
      content = storageService.exportExpensesToCSV();
      filename += '.csv';
      mimeType = 'text/csv;charset=utf-8;';
    } else if (selectedFormat === 'txt') {
      const header = 'Date\tTime\tDescription\tCategory\tAmount\tPayment\tNotes\n';
      const rows = expenses.map(e => 
        `${e.date}\t${e.time}\t${e.description}\t${e.category}\t${e.amount}\t${e.paymentMethod || 'Cash'}\t${e.notes || ''}`
      ).join('\n');
      content = header + rows;
      filename += '.txt';
      mimeType = 'text/plain;charset=utf-8;';
    }

    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="glass-panel anime-item rounded-xl shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Export Data</h3>
            <p className="text-xs text-slate-500 mt-0.5">Choose your preferred format</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <button
            onClick={() => setSelectedFormat('csv')}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
              selectedFormat === 'csv'
                ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                : 'border-slate-200 hover:border-blue-300 hover:bg-white/30'
            }`}
          >
            <div className={`p-2 rounded-lg ${selectedFormat === 'csv' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className={`font-semibold text-sm ${selectedFormat === 'csv' ? 'text-blue-900' : 'text-slate-700'}`}>Excel (CSV)</div>
              <div className="text-xs text-slate-500 mt-0.5">Best for spreadsheets like Excel or Google Sheets</div>
            </div>
          </button>

          <button
            onClick={() => setSelectedFormat('txt')}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
              selectedFormat === 'txt'
                ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                : 'border-slate-200 hover:border-blue-300 hover:bg-white/30'
            }`}
          >
            <div className={`p-2 rounded-lg ${selectedFormat === 'txt' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className={`font-semibold text-sm ${selectedFormat === 'txt' ? 'text-blue-900' : 'text-slate-700'}`}>Notepad / Word (TXT)</div>
              <div className="text-xs text-slate-500 mt-0.5">Best for Notepad, Word, or plain text readers</div>
            </div>
          </button>

          <button
            onClick={() => setSelectedFormat('pdf')}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
              selectedFormat === 'pdf'
                ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                : 'border-slate-200 hover:border-blue-300 hover:bg-white/30'
            }`}
          >
            <div className={`p-2 rounded-lg ${selectedFormat === 'pdf' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
              <File className="w-5 h-5" />
            </div>
            <div>
              <div className={`font-semibold text-sm ${selectedFormat === 'pdf' ? 'text-blue-900' : 'text-slate-700'}`}>PDF Document</div>
              <div className="text-xs text-slate-500 mt-0.5">Neatly formatted table with perfectly arranged labels</div>
            </div>
          </button>
        </div>

        <div className="p-4 bg-white/30 border-t border-slate-100">
          <button
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Download File</span>
          </button>
        </div>
      </div>
    </div>
  );
};
