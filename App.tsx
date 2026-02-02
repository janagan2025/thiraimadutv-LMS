import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { AdminPanel } from './components/AdminPanel';
import { AdminLogin } from './components/AdminLogin';
import { fetchAllData } from './services/api';
import { AppData, LeaveRecord, TeacherSummary } from './types';

// Updated Google Apps Script Code - optimized for auto-discovery
const UPDATED_APPS_SCRIPT_CODE = `
/**
 * 
 * IMPORTANT: COPY THIS CODE TO YOUR GOOGLE APPS SCRIPT EDITOR (Code.gs)
 * AND DEPLOY AS WEB APP (New Version).
 * 
 */
const PRINCIPAL_PASSWORD = "admin2026"; 

function doGet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Get Leave History (Source of Truth for historic data)
  let leaveSheet = ss.getSheetByName("LeaveRecords");
  if (!leaveSheet) {
    leaveSheet = ss.insertSheet("LeaveRecords");
    leaveSheet.appendRow(["Name", "Type", "ApplyDate", "StartDate", "EndDate", "Days", "Method"]);
  }
  const leaveData = leaveSheet.getDataRange().getValues();
  let history = [];
  let teachersFromHistory = new Set();
  
  // Skip header
  for (let i = 1; i < leaveData.length; i++) {
    if(leaveData[i][0]) {
      const name = leaveData[i][0];
      teachersFromHistory.add(name);
      history.push({
        name: name,
        type: leaveData[i][1],
        applyDate: leaveData[i][2],
        startDate: leaveData[i][3],
        endDate: leaveData[i][4],
        days: Number(leaveData[i][5]), 
        method: leaveData[i][6]
      });
    }
  }

  // 2. Get Explicit Teachers List
  let teachersSheet = ss.getSheetByName("Teachers");
  if (!teachersSheet) {
    teachersSheet = ss.insertSheet("Teachers");
    teachersSheet.appendRow(["Name"]); 
  }
  const teacherData = teachersSheet.getDataRange().getValues();
  let explicitTeachers = [];
  for (let i = 1; i < teacherData.length; i++) {
    if(teacherData[i][0]) explicitTeachers.push(teacherData[i][0]);
  }
  
  // 3. Merge Lists (Ensure all teachers in history appear in the list)
  let allTeachers = [...new Set([...explicitTeachers, ...Array.from(teachersFromHistory)])].sort();
  
  const responseData = {
    teachers: allTeachers,
    history: history
  };
  
  return ContentService.createTextOutput(JSON.stringify(responseData))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const requestData = JSON.parse(e.postData.contents);
  const action = requestData.action;
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  if (action === "verifyPassword") {
    return ContentService.createTextOutput(requestData.password === PRINCIPAL_PASSWORD ? "SUCCESS" : "INVALID");
  }

  if (action === "addTeacher") {
    let sheet = ss.getSheetByName("Teachers");
    if(!sheet) sheet = ss.insertSheet("Teachers");
    sheet.appendRow([requestData.name]);
    return ContentService.createTextOutput("SAVED");
  }

  if (action === "saveLeave") {
    let sheet = ss.getSheetByName("LeaveRecords");
    if(!sheet) sheet = ss.insertSheet("LeaveRecords");
    
    // Auto-add teacher to Teachers sheet if not exists (Optional but good for consistency)
    // For performance, we skip checking here and rely on doGet merging.
    
    sheet.appendRow([
      requestData.name, 
      requestData.type, 
      requestData.applyDate, 
      requestData.startDate, 
      requestData.endDate, 
      requestData.days, 
      requestData.method
    ]);
    return ContentService.createTextOutput("SAVED");
  }
  
  if (action === "deleteLeave") {
     const sheet = ss.getSheetByName("LeaveRecords");
     const rowToDelete = requestData.index + 2;
     sheet.deleteRow(rowToDelete);
     return ContentService.createTextOutput("DELETED");
  }
  
  return ContentService.createTextOutput("UNKNOWN_ACTION");
}
`;

function App() {
  const [view, setView] = useState<'dashboard' | 'admin'>('dashboard');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [teachers, setTeachers] = useState<string[]>([]);
  const [leaveHistory, setLeaveHistory] = useState<LeaveRecord[]>([]);
  const [summaries, setSummaries] = useState<TeacherSummary[]>([]);
  const [showScriptInfo, setShowScriptInfo] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const response: any = await fetchAllData();
      
      let fetchedTeachers: string[] = [];
      let fetchedHistory: LeaveRecord[] = [];

      // Case 1: New Script Structure
      if (response && typeof response === 'object' && !Array.isArray(response) && response.teachers) {
        fetchedTeachers = Array.isArray(response.teachers) ? response.teachers : [];
        fetchedHistory = Array.isArray(response.history) ? response.history : [];
      } 
      // Case 2: Legacy Fallback
      else if (Array.isArray(response)) {
        console.warn("Legacy API response detected.");
        fetchedTeachers = response;
        fetchedHistory = []; 
        setShowScriptInfo(true);
      } 

      // CLIENT-SIDE FIX: Merge teachers from history if not in explicit list
      // This ensures that if the "Teachers" sheet is empty but "LeaveRecords" has data, we still show the teachers.
      const teachersFromHistory = Array.from(new Set(fetchedHistory.map(h => h.name)));
      
      // Combine and unique
      const mergedTeachers = Array.from(new Set([...fetchedTeachers, ...teachersFromHistory])).sort();

      // Update State
      setTeachers(mergedTeachers);
      setLeaveHistory(fetchedHistory);

      // Calculate Summaries based on MERGED teachers list
      const calcSummaries: TeacherSummary[] = mergedTeachers.map(name => {
        const teacherLeaves = fetchedHistory.filter(h => h.name === name);
        
        const casualTaken = teacherLeaves
          .filter(l => l.type === 'Casual')
          .reduce((sum, l) => sum + (Number(l.days) || 0), 0);
          
        const sickTaken = teacherLeaves
          .filter(l => l.type === 'Sick')
          .reduce((sum, l) => sum + (Number(l.days) || 0), 0);
          
        const dutyTaken = teacherLeaves
          .filter(l => l.type === 'Duty')
          .reduce((sum, l) => sum + (Number(l.days) || 0), 0);

        return {
          name,
          casualTaken,
          sickTaken,
          dutyTaken
        };
      });

      setSummaries(calcSummaries);
    } catch (e) {
      console.error("Failed to load data", e);
      setShowScriptInfo(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <header className="bg-blue-900 text-white p-6 text-center shadow-lg">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Bt/Bt/Thiraimadu Tamil Vidyalayam</h1>
        <p className="text-blue-200 text-sm md:text-base">ஆசிரியர் விடுப்பு மேலாண்மை - முழுமையான திகதி விபரங்களுடன்</p>
      </header>

      <Navbar 
        currentView={view} 
        setCurrentView={setView} 
        isLoggedIn={isAdminLoggedIn}
        onLogout={() => setIsAdminLoggedIn(false)}
      />

      <main className="flex-grow">
        {showScriptInfo && (
           <div className="max-w-4xl mx-auto m-4 p-4 bg-yellow-50 border border-yellow-200 rounded text-sm shadow-sm">
             <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-yellow-800 text-base">⚠️ Setup Required / Update Script</h3>
                <button onClick={() => setShowScriptInfo(false)} className="text-gray-500 hover:text-gray-800 font-bold px-2">✕</button>
             </div>
             <p className="mb-2 text-yellow-900">
               இணையதளத்தை மேம்படுத்தவும், "No Records Found" பிழையைத் தவிர்க்கவும் கீழே உள்ள குறியீட்டை Google Apps Script இல் புதுப்பிக்கவும்.
             </p>
             <textarea 
                readOnly 
                className="w-full h-32 p-3 border border-yellow-300 rounded text-xs font-mono bg-white focus:outline-none focus:border-yellow-500"
                value={UPDATED_APPS_SCRIPT_CODE} 
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
             />
           </div>
        )}

        {view === 'dashboard' && (
          <Dashboard 
            summaries={summaries} 
            history={leaveHistory} 
            isLoading={isLoading} 
          />
        )}

        {view === 'admin' && (
          !isAdminLoggedIn ? (
            <AdminLogin onLoginSuccess={() => setIsAdminLoggedIn(true)} />
          ) : (
            <AdminPanel 
                teachers={teachers} 
                history={leaveHistory} 
                onRefresh={loadData}
            />
          )
        )}
      </main>

      <footer className="bg-slate-800 text-slate-400 text-center py-4 text-xs mt-auto">
        &copy; 2024 Thiraimadu Tamil Vidyalayam LMS. All rights reserved.
      </footer>
    </div>
  );
}

export default App;