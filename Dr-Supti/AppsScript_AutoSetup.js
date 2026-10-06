/**
 * Google Apps Script for Dr. Afroza Supti Duty Roster
 * 
 * ফিচার:
 * ১. Shift কলামে (Col C) 'D', 'N', 'OFF' ড্রপডাউন থাকবে।
 * ২. ড্রপডাউন থেকে 'D', 'N', বা 'OFF' সিলেক্ট করার সাথে সাথেই:
 *    - Shift Name (Col D)
 *    - Time (Col E)
 *    - Notes (Col J)
 *    স্বয়ংক্রিয় ফর্মুলার মাধ্যমে তৎক্ষণাৎ চেঞ্জ হয়ে যাবে!
 * ৩. পুরো রো-এর কালারও অটোমেটিক বদলে যাবে (D = Yellow, N = Blue/Indigo, OFF = Gray)!
 * 
 * চালানোর নিয়ম:
 * ১. গুগল শিট ওপেন করুন: https://docs.google.com/spreadsheets/d/11i-Zt99U271ty0zHT9OViGeOcZZO5EUXQbU0UrSaTOY/edit
 * ২. Extensions > Apps Script-এ যান।
 * ৩. সব লেখা মুছে দিয়ে এই সম্পূর্ণ কোডটুকু পেস্ট করুন।
 * ৪. উপরে Save (💾) চাপুন এবং "Run" (▶) বাটনে ক্লিক করুন।
 */

function setupDoctorRoster() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  sheet.setName("October 2026");
  sheet.clear();
  sheet.clearConditionalFormatRules();

  // Initial October 2026 shifts
  var defaultShifts = {
    1: 'D', 2: 'OFF', 3: 'OFF', 4: 'D', 5: 'N', 6: 'OFF', 7: 'D', 8: 'D',
    9: 'N', 10: 'OFF', 11: 'OFF', 12: 'D', 13: 'N', 14: 'OFF', 15: 'OFF',
    16: 'D', 17: 'N', 18: 'OFF', 19: 'D', 20: 'D', 21: 'N', 22: 'OFF',
    23: 'OFF', 24: 'D', 25: 'N', 26: 'OFF', 27: 'OFF', 28: 'D', 29: 'N',
    30: 'OFF', 31: 'OFF'
  };

  // Header row
  var headers = [
    "Date", "Day", "Shift", "Shift Name", "Time", "Ward", "Doctor Name", "Staff ID", "Month", "Notes"
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Style Header Row
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground("#0f766e"); // Teal 700
  headerRange.setFontColor("#ffffff");
  headerRange.setFontWeight("bold");
  headerRange.setFontSize(11);
  headerRange.setHorizontalAlignment("center");
  headerRange.setVerticalAlignment("middle");
  sheet.setRowHeight(1, 38);

  // Build 31 rows with dynamic Google Sheets formulas
  var values = [];
  var formulas = [];

  for (var day = 1; day <= 31; day++) {
    var rowNum = day + 1;
    var initShift = defaultShifts[day];

    // Automatic formulas:
    // Day Name calculates from date
    var dayFormula = '=TEXT(DATE(2026, 10, A' + rowNum + '), "dddd")';
    // Shift Name automatically changes based on Column C
    var nameFormula = '=IF(C' + rowNum + '="D", "Day Shift (☀️)", IF(C' + rowNum + '="N", "Night Shift (🌙)", "Off Duty (🏖️)"))';
    // Time automatically changes based on Column C
    var timeFormula = '=IF(C' + rowNum + '="D", "08:00 - 20:00", IF(C' + rowNum + '="N", "20:00 - 08:00", "-"))';
    // Notes automatically changes based on Column C
    var notesFormula = '=IF(C' + rowNum + '="D", "12 Hours Day Duty", IF(C' + rowNum + '="N", "12 Hours Overnight Duty", "Rest Day"))';

    values.push([
      day,
      dayFormula,
      initShift,
      nameFormula,
      timeFormula,
      "POW Ward",
      "Dr. Afroza Supti",
      "7269766",
      "October 2026",
      notesFormula
    ]);
  }

  // Set values and formulas in sheet
  var dataRange = sheet.getRange(2, 1, values.length, headers.length);
  dataRange.setValues(values);
  dataRange.setFontSize(10);
  dataRange.setVerticalAlignment("middle");

  // Alignments
  sheet.getRange(2, 1, 31, 1).setHorizontalAlignment("center").setFontWeight("bold");
  sheet.getRange(2, 2, 31, 1).setHorizontalAlignment("center");
  sheet.getRange(2, 3, 31, 1).setHorizontalAlignment("center").setFontWeight("bold");
  sheet.getRange(2, 5, 31, 1).setHorizontalAlignment("center");
  sheet.getRange(2, 8, 31, 2).setHorizontalAlignment("center");

  // Set Dropdown validation on Shift column (Col C)
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['D', 'N', 'OFF'], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(2, 3, 31, 1).setDataValidation(rule);

  // Set Row Heights
  for (var r = 2; r <= 32; r++) {
    sheet.setRowHeight(r, 28);
  }

  // Auto-resize columns
  for (var col = 1; col <= headers.length; col++) {
    sheet.autoResizeColumn(col);
  }

  // Set Grid Borders
  sheet.getRange(1, 1, 32, headers.length).setBorder(true, true, true, true, true, true, "#cbd5e1", SpreadsheetApp.BorderStyle.SOLID);

  // --- Dynamic Conditional Formatting (Row Colors change automatically) ---
  var rangeToFormat = sheet.getRange("A2:J32");
  
  // Rule 1: Shift = 'D' (Warm Amber)
  var ruleD = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=$C2="D"')
    .setBackground("#fef3c7")
    .setFontColor("#78350f")
    .setRanges([rangeToFormat])
    .build();

  // Rule 2: Shift = 'N' (Soft Indigo)
  var ruleN = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=$C2="N"')
    .setBackground("#e0e7ff")
    .setFontColor("#312e81")
    .setRanges([rangeToFormat])
    .build();

  // Rule 3: Shift = 'OFF' (Soft Gray)
  var ruleOff = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=$C2="OFF"')
    .setBackground("#f8fafc")
    .setFontColor("#64748b")
    .setRanges([rangeToFormat])
    .build();

  sheet.setConditionalFormatRules([ruleD, ruleN, ruleOff]);

  // Freeze Header Row
  sheet.setFrozenRows(1);

  Logger.log("Dr. Supti duty roster setup complete with automatic formulas!");
}
