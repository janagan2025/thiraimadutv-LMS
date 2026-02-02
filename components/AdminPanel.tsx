import React, { useState } from 'react';
import { LeaveRecord } from '../types';
import { LEAVE_TYPES, INFORM_METHODS } from '../constants';
import { addTeacherToSheet, saveLeaveRecord, deleteLeaveRecord } from '../services/api';

interface AdminPanelProps {
  teachers: string[];
  history: LeaveRecord[];
  onRefresh: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ teachers, history, onRefresh }) => {
  const [newTeacherName, setNewTeacherName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  // Form State
  const [selectedTeacher, setSelectedTeacher] = useState(teachers[0] || '');
  const [leaveType, setLeaveType] = useState('Casual');
  const [applyDate, setApplyDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [days, setDays] = useState('1');
  const [informMethod, setInformMethod] = useState(INFORM_METHODS[0]);

  const handleAddTeacher = async () => {
    if (!newTeacherName.trim()) return;
    setIsSubmitting(true);
    const success = await addTeacherToSheet(newTeacherName.trim());
    if (success) {
      alert('ஆசிரியர் வெற்றிகரமாக சேர்க்கப்பட்டார்!');
      setNewTeacherName('');
      onRefresh(); // Re-fetch to get updated list
    } else {
      alert('ஆசிரியர் சேர்ப்பதில் தவறு ஏற்பட்டது.');
    }
    setIsSubmitting(false);
  };

  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher || !applyDate || !startDate || !endDate || !days) {
      alert('தயவுசெய்து அனைத்து விபரங்களையும் நிரப்புக.');
      return;
    }

    setIsSubmitting(true);
    const record: LeaveRecord = {
      name: selectedTeacher,
      type: leaveType as any,
      applyDate,
      startDate,
      endDate,
      days: parseFloat(days),
      method: informMethod
    };

    const success = await saveLeaveRecord(record);
    if (success) {
      alert('விடுப்பு வெற்றிகரமாக பதிவு செய்யப்பட்டது!');
      // Reset form (keep teacher selected)
      setStartDate('');
      setEndDate('');
      setDays('1');
      onRefresh();
    } else {
      alert('விடுப்பு பதிவில் தவறு ஏற்பட்டது.');
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (index: number) => {
    if (window.confirm('இந்த பதிவை நிச்சயமாக நீக்க வேண்டுமா? (Are you sure?)')) {
        setIsDeleting(index);
        const success = await deleteLeaveRecord(index);
        if (success) {
            onRefresh();
        } else {
            alert("Delete failed. Please try again.");
        }
        setIsDeleting(null);
    }
  }

  // Reverse history for display (newest first)
  // We map original index to allow deletion
  const displayHistory = history.map((item, idx) => ({ item, originalIndex: idx })).reverse();

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Teacher Mgmt & History */}
      <div className="lg:col-span-1 space-y-6">
        
        {/* Add Teacher Card */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">புதிய ஆசிரியர் சேர்த்தல்</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTeacherName}
              onChange={(e) => setNewTeacherName(e.target.value)}
              placeholder="ஆசிரியர் பெயர்"
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddTeacher}
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? '...' : 'Add'}
            </button>
          </div>
        </div>

        {/* History List */}
        <div className="bg-white rounded-lg shadow border border-gray-100 flex flex-col h-[600px]">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="text-lg font-bold text-slate-800">சமீபத்திய விடுப்பு பதிவுகள்</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {displayHistory.length === 0 ? (
                <p className="text-center text-gray-500 text-sm">பதிவுகள் இல்லை</p>
            ) : (
                displayHistory.map(({ item, originalIndex }) => (
                <div key={originalIndex} className="bg-white p-4 rounded shadow-sm border-l-4 border-blue-800 relative group">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-slate-900">{item.name}</p>
                            <span className="text-xs bg-gray-200 px-2 py-0.5 rounded text-gray-700 font-semibold">{item.type}</span>
                        </div>
                        <div className="text-right">
                           <span className="text-lg font-bold text-blue-900">{item.days}</span>
                           <span className="text-xs text-gray-500 block">நாட்கள்</span>
                        </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-600 space-y-1">
                        <p>காலம்: {item.startDate.split('T')[0]} - {item.endDate.split('T')[0]}</p>
                        <p>விண்ணப்பித்தது: {item.applyDate.split('T')[0]}</p>
                        <p>முறை: {item.method}</p>
                    </div>
                    <button 
                        onClick={() => handleDelete(originalIndex)}
                        disabled={isDeleting === originalIndex}
                        className="absolute bottom-2 right-2 text-red-500 hover:text-red-700 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        {isDeleting === originalIndex ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Leave Entry Form */}
      <div className="lg:col-span-2">
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md border border-gray-100 sticky top-24">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span>📝</span> விடுப்பு பதிவு செய்தல்
          </h3>
          
          <form onSubmit={handleLeaveSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Teacher Selection */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">ஆசிரியர் பெயர்</label>
              <select
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">தேர்ந்தெடு...</option>
                {teachers.map((t, i) => (
                  <option key={i} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Leave Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">விடுப்பு வகை</label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500"
              >
                {LEAVE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            {/* Inform Method */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">அறிவித்த விதம்</label>
              <select
                value={informMethod}
                onChange={(e) => setInformMethod(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500"
              >
                {INFORM_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {/* Apply Date */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">விண்ணப்பிக்கும் திகதி (Apply Date)</label>
              <input
                type="date"
                value={applyDate}
                onChange={(e) => setApplyDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Dates Row */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">ஆரம்ப திகதி (Start)</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">முடிவுத் திகதி (End)</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Days Count */}
            <div className="md:col-span-2 bg-yellow-50 p-4 rounded-md border border-yellow-200">
              <label className="block text-sm font-bold text-gray-800 mb-1">மொத்த நாட்கள்</label>
              <p className="text-xs text-gray-500 mb-2">அரை நாள் விடுப்புக்கு 0.5 என உள்ளிடவும் (Use 0.5 for half day)</p>
              <input
                type="number"
                step="0.5"
                min="0"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2.5 text-lg font-bold text-blue-900"
                placeholder="எ.கா: 0.5 அல்லது 1"
              />
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-900 text-white font-bold text-lg py-3 rounded-md hover:bg-blue-800 transition transform active:scale-95 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'சேமிக்கப்படுகிறது...' : 'சேமிக்கவும் (Save)'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};