import { GOOGLE_SCRIPT_URL } from '../constants';
import { AppData, LeaveRecord } from '../types';

/**
 * Fetches all data (Teachers + History) from the Google Sheet.
 * This solves the multi-device sync issue by getting the source of truth.
 */
export const fetchAllData = async (): Promise<AppData> => {
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

/**
 * Sends a POST request to Google Apps Script.
 * We use text/plain to avoid CORS preflight issues with simple GAS web apps.
 */
export const sendAction = async (payload: any): Promise<string> => {
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const text = await response.text();
    return text;
  } catch (error) {
    console.error('Error sending action:', error);
    return "ERROR";
  }
};

export const verifyPassword = async (password: string): Promise<boolean> => {
  const result = await sendAction({ action: "verifyPassword", password });
  return result.includes("SUCCESS");
};

export const addTeacherToSheet = async (name: string): Promise<boolean> => {
  const result = await sendAction({ action: "addTeacher", name });
  return result.includes("SAVED");
};

export const saveLeaveRecord = async (record: LeaveRecord): Promise<boolean> => {
  const result = await sendAction({ action: "saveLeave", ...record });
  return result.includes("SAVED");
};

export const deleteLeaveRecord = async (index: number): Promise<boolean> => {
    // Note: Deleting by index is risky in a concurrent environment, 
    // but without unique IDs in the original sheet structure, it's the best attempt.
    // The updated GAS script should handle "deleteLeave" action.
    const result = await sendAction({ action: "deleteLeave", index });
    return result.includes("DELETED");
};