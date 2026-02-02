import React from 'react';
import { TeacherSummary, LeaveRecord } from '../types';
import { LEAVE_LIMITS } from '../constants';

// Declare jspdf types locally since we are using CDN
declare global {
  interface Window {
    jspdf: any;
  }
}

interface DashboardProps {
  summaries: TeacherSummary[];
  history: LeaveRecord[];
  isLoading: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ summaries, history, isLoading }) => {
  const generatePDF = (summary: TeacherSummary) => {
    if (!window.jspdf) {
      alert("PDF library loading... please try again.");
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Filter history for this teacher
    const teacherHistory = history.filter(h => h.name === summary.name);

    // Title
    doc.setFontSize(16);
    doc.text("Bt/Bt/Thiraimadu Tamil Vidyalayam", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.text(`Leave Report: ${summary.name}`, 14, 35);
    
    // Summary Table
    doc.autoTable({
        startY: 40,
        head: [['Leave Type', 'Taken', 'Limit', 'Balance']],
        body: [
            ['Casual', summary.casualTaken, LEAVE_LIMITS.CASUAL, LEAVE_LIMITS.CASUAL - summary.casualTaken],
            ['Sick', summary.sickTaken, LEAVE_LIMITS.SICK, LEAVE_LIMITS.SICK - summary.sickTaken],
            ['Duty', summary.dutyTaken, '-', '-']
        ],
        theme: 'grid',
        headStyles: { fillColor: [0, 51, 102] }
    });

    doc.text("Leave History (Details):", 14, doc.lastAutoTable.finalY + 15);
    
    // History Table
    doc.autoTable({
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Applied', 'From', 'To', 'Days', 'Type', 'Method']],
        body: teacherHistory.map(h => [
            h.applyDate.split('T')[0], 
            h.startDate.split('T')[0], 
            h.endDate.split('T')[0], 
            h.days, 
            h.type,
            h.method
        ]),
        theme: 'striped'
    });

    doc.save(`${summary.name}_LeaveReport.pdf`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
        <span className="ml-3 text-lg text-blue-900">தரவுகள் பெறப்படுகின்றன...</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-2">ஆசிரியர் விடுப்பு சுருக்கம்</h2>
      
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                ஆசிரியர் பெயர்
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                சாதாரண ({LEAVE_LIMITS.CASUAL})
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                மருத்துவம் ({LEAVE_LIMITS.SICK})
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                கடமை
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                அறிக்கை
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {summaries.length === 0 ? (
               <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                   <div className="flex flex-col items-center">
                     <p className="text-lg font-semibold mb-2">தரவுகள் இல்லை (No Records Found)</p>
                     <p className="text-sm text-gray-400">புதிய ஆசிரியர்களை சேர்க்க 'அதிபர் பகுதி' (Admin Panel) செல்லவும்.</p>
                   </div>
                </td>
               </tr>
            ) : (
                summaries.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {s.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <span className={s.casualTaken > LEAVE_LIMITS.CASUAL ? 'text-red-600 font-bold' : ''}>
                        {s.casualTaken}
                    </span> 
                    <span className="text-gray-400"> / {LEAVE_LIMITS.CASUAL}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <span className={s.sickTaken > LEAVE_LIMITS.SICK ? 'text-red-600 font-bold' : ''}>
                        {s.sickTaken}
                    </span>
                    <span className="text-gray-400"> / {LEAVE_LIMITS.SICK}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {s.dutyTaken}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                        onClick={() => generatePDF(s)}
                        className="text-white bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded text-xs transition shadow-sm"
                    >
                        PDF
                    </button>
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};