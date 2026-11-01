/**
 * Google Apps Script for Dr. Afroza Supti Duty Roster
 * 
 * ফিচার:
 * ১. November 2026, December 2026, January 2027, February 2027 - সব মাসের ট্যাব তৈরি বা আপডেট করবে।
 * ২. প্রতিটি ট্যাবে Shift কলামে (Col C) 'D', 'N', 'OFF' ড্রপডাউন থাকবে।
 * ৩. ড্রপডাউন থেকে 'D', 'N', বা 'OFF' সিলেক্ট করলেই:
 *    - Shift Name (Col D)
 *    - Time (Col E)
 *    - Notes (Col J)
 *    - Day (Col B)
 *    স্বয়ংক্রিয় ফর্মুলার মাধ্যমে তৎক্ষণাৎ চেঞ্জ হবে!
 * ৪. পুরো রো-এর কালারও অটোমেটিক বদলে যাবে (D = Yellow, N = Blue/Indigo, OFF = Gray)!
 * 
 * চালানোর নিয়ম:
 * ১. গুগল শিট ওপেন করুন: https://docs.google.com/spreadsheets/d/11i-Zt99U271ty0zHT9OViGeOcZZO5EUXQbU0UrSaTOY/edit
 * ২. Extensions > Apps Script-এ যান।
 * ৩. সব লেখা মুছে দিয়ে এই সম্পূর্ণ কোডটুকু পেস্ট করুন।
 * ৪. উপরে Save (💾) চাপুন এবং "setupAllMonths" সিলেক্ট করে "Run" (▶) বাটনে চাপ দিন।
 */

function setupAllMonths() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Setup December 2026 (31 days)
  setupSingleMonth(ss, "December 2026", 2026, 12, 31);
  
  // Setup January 2027 (31 days)
  setupSingleMonth(ss, "January 2027", 2027, 1, 31);
  
  // Setup February 2027 (28 days)
  setupSingleMonth(ss, "February 2027", 2027, 2, 28);
  
  // Make sure November 2026 is properly formatted as well
  setupSingleMonth(ss, "November 2026", 2026, 11, 30);
  
  Logger.log("All months (Nov 2026, Dec 2026, Jan 2027, Feb 2027) successfully created & formatted!");
}

function setupSingleMonth(ss, sheetTitle, year, monthNumber, totalDays) {
  var sheet = ss.getSheetByName(sheetTitle);
  var isNew = false;
  if (!sheet) {
    sheet = ss.insertSheet(sheetTitle);
    isNew = true;
  }
  
  // Headers
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

  // If new sheet or empty, populate with default rotation
  var existingLastRow = sheet.getLastRow();
  var needValues = (isNew || existingLastRow < 2);

  // Default shift rotation: D, N, OFF, OFF, D, D, N...
  var defaultShifts = ['D', 'N', 'OFF', 'OFF', 'D', 'D', 'N', 'OFF', 'OFF', 'D', 'N', 'OFF'];

  var values = [];
  for (var day = 1; day <= totalDays; day++) {
    var rowNum = day + 1;
    var initShift = defaultShifts[(day - 1) % defaultShifts.length];

    // Read existing shift if already set
    if (!needValues) {
      try {
        var existingVal = sheet.getRange(rowNum, 3).getValue();
        if (existingVal) initShift = existingVal;
      } catch (e) {}
    }

    var dayFormula = '=TEXT(DATE(' + year + ', ' + monthNumber + ', A' + rowNum + '), "dddd")';
    var nameFormula = '=IF(C' + rowNum + '="D", "Day Shift (☀️)", IF(C' + rowNum + '="N", "Night Shift (🌙)", "Off Duty (🏖️)"))';
    var timeFormula = '=IF(C' + rowNum + '="D", "08:00 - 20:00", IF(C' + rowNum + '="N", "20:00 - 08:00", "-"))';
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
      sheetTitle,
      notesFormula
    ]);
  }

  var dataRange = sheet.getRange(2, 1, values.length, headers.length);
  dataRange.setValues(values);
  dataRange.setFontSize(10);
  dataRange.setVerticalAlignment("middle");

  // Alignments
  sheet.getRange(2, 1, totalDays, 1).setHorizontalAlignment("center").setFontWeight("bold");
  sheet.getRange(2, 2, totalDays, 1).setHorizontalAlignment("center");
  sheet.getRange(2, 3, totalDays, 1).setHorizontalAlignment("center").setFontWeight("bold");
  sheet.getRange(2, 5, totalDays, 1).setHorizontalAlignment("center");
  sheet.getRange(2, 8, totalDays, 2).setHorizontalAlignment("center");

  // Set Dropdown validation on Shift column (Col C)
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['D', 'N', 'OFF'], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(2, 3, totalDays, 1).setDataValidation(rule);

  // Set Row Heights
  for (var r = 2; r <= totalDays + 1; r++) {
    sheet.setRowHeight(r, 28);
  }

  // Auto-resize columns
  for (var col = 1; col <= headers.length; col++) {
    sheet.autoResizeColumn(col);
  }

  // Set Grid Borders
  sheet.getRange(1, 1, totalDays + 1, headers.length).setBorder(true, true, true, true, true, true, "#cbd5e1", SpreadsheetApp.BorderStyle.SOLID);

  // --- Dynamic Conditional Formatting (Row Colors change automatically) ---
  sheet.clearConditionalFormatRules();
  var rangeToFormat = sheet.getRange(2, 1, totalDays, headers.length);
  
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
  sheet.setFrozenRows(1);

  Logger.log(sheetTitle + " setup completed!");
}

// Quick individual runners:
function setupDecember() {
  setupSingleMonth(SpreadsheetApp.getActiveSpreadsheet(), "December 2026", 2026, 12, 31);
}

function setupJanuary() {
  setupSingleMonth(SpreadsheetApp.getActiveSpreadsheet(), "January 2027", 2027, 1, 31);
}

function setupFebruary() {
  setupSingleMonth(SpreadsheetApp.getActiveSpreadsheet(), "February 2027", 2027, 2, 28);
}
