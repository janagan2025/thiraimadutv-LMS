// Replace this URL with your NEW deployed Web App URL after updating the Apps Script code
export const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxsv5ICBhC4QSpBCr-q6Dj1ZHUo_HoL9jMYa1_PkQH9TdOaEqC6KHsOXd1UqFEbNsXm/exec";

export const LEAVE_LIMITS = {
  CASUAL: 21,
  SICK: 20,
};

export const LEAVE_TYPES = [
  { value: 'Casual', label: 'சாதாரண (Casual)' },
  { value: 'Sick', label: 'மருத்துவ (Sick)' },
  { value: 'Duty', label: 'கடமை (Duty)' },
];

export const INFORM_METHODS = [
  "SMS",
  "Telemail",
  "mail",
  "Call",
  "Early by leave Note",
  "Letter",
  "Late come",
  "No inform"
];