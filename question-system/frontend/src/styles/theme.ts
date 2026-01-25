export const lightTheme = {
  body: '#FFFFFF',
  text: '#212529',
  subtleText: '#6c757d',
  headerBg: '#FFFFFF',
  headerColor: '#212529',
  columnBg: '#f8f9fa',
  formBg: '#FFFFFF',
  border: '#ced4da',
  hoverBorder: '#ced4da',
  inputBg: '#FFFFFF',
  inputBorder: '#ced4da',
  
  // Buttons
  primary: '#007bff',
  primaryText: '#FFFFFF',
  success: '#198754',
  successText: '#FFFFFF',
  danger: '#dc3545',
  dangerText: '#FFFFFF',
  disabled: '#e9ecef',
  
  // Specific components
  badgeResolvedBg: '#d1e7dd',
  badgeResolvedText: '#0f5132',
  badgeUnresolvedBg: '#fff3cd',
  badgeUnresolvedText: '#664d03',
  answerBg: '#e9ecef',
  tagBg: '#e3f2fd',
  tagText: '#1565c0',
  teacherBadgeBg: '#6c757d',
  teacherBadgeText: '#FFFFFF',
};

export const darkTheme = {
  body: '#1c1c1e',
  text: '#f5f5f7',
  subtleText: '#8d8d93',
  headerBg: '#1c1c1e',
  headerColor: '#f5f5f7',
  columnBg: '#2c2c2e',
  formBg: '#2c2c2e',
  border: '#636366',
  hoverBorder: '#7d7d80',
  inputBg: '#3a3a3c',
  inputBorder: '#545458',

  // Buttons
  primary: '#0a84ff',
  primaryText: '#FFFFFF',
  success: '#30d158',
  successText: '#FFFFFF',
  danger: '#ff453a',
  dangerText: '#FFFFFF',
  disabled: '#3a3a3c',

  // Specific components
  badgeResolvedBg: '#284a38',
  badgeResolvedText: '#30d158',
  badgeUnresolvedBg: '#4f4223',
  badgeUnresolvedText: '#ffd60a',
  answerBg: '#3a3a3c',
  tagBg: '#192c48',
  tagText: '#52a6ff',
  teacherBadgeBg: '#545458',
  teacherBadgeText: '#f5f5f7',
};

export type Theme = typeof lightTheme;