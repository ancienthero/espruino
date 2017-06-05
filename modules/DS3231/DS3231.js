/* Copyright (c) 2017 Paweł Hajduk, based on Peter Clarke module */
/*
Module is to set date time and read date time from a DS3231 over I2C.
For the daylight saving to work the time must be read at least every second so that when it occurs we write back to the module the shifted time.
*/

function DS3231(i2c, options) {
  this.i2c = i2c;
  this.options = options || {};
  // are we doing daylight saving time calcs?
  if (this.options.DST===undefined)
    this.options.DST = true;
  // current state of daylight saving
  this.dstStatus = false;
}

//private
var C = {
  i2c_address: 0x68,
  dateReg : 0x04,
  monthReg : 0x05,
  yearReg : 0x06,
  secsReg : 0x00,
  minsReg : 0x01,
  hourReg : 0x02,
  dowReg : 0x03
};

//private functions
// Convert Decimal value to BCD
function dec2bcd(val) {
  return parseInt(val, 16);
}

// Convert BCD value to decimal
function bcd2dec(val) {
  return ((val >> 4)*10+(val & 0x0F));
}

// Return whether the supplied date is part of daylight saving time or not
DS3231.prototype.isDST = function(day,month,dow) {
  if (!this.options.DST) return false;
  if ((month === 3) && (dow === 1) && (day > 23)) {
    return true;
  }
  if ((month === 10) && (dow === 1) && (day > 23)) {
    return false;
  }
  if ((month > 3) && (month < 11)) {
    return true;
  }
  else {
    return false;
  }
}

// Public functions
// Set the day of the week, Sunday first day of the week
DS3231.prototype.setDow = function(day) {
  var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  var idx = days.indexOf(day);
  if (idx<0) {
    print("Not a valid day");
  }
  else {
    this.i2c.writeTo(C.i2c_address,[C.dowReg, (dec2bcd(1+idx))]);
 }
};

// Set the date
DS3231.prototype.setDate = function(date,month,year) {
  this.i2c.writeTo(C.i2c_address,[C.dateReg, (dec2bcd(date))]);
  this.i2c.writeTo(C.i2c_address,[C.monthReg, (dec2bcd(month))]);
  this.i2c.writeTo(C.i2c_address,[C.yearReg, (dec2bcd(year))]);
  this.dstStatus = this.isDST(date,month,year);
};

// Set the time
DS3231.prototype.setTime = function(hour,minute) {
  this.i2c.writeTo(C.i2c_address,[C.secsReg, 0]);
  this.i2c.writeTo(C.i2c_address,[C.minsReg, (dec2bcd(minute))]);
  this.i2c.writeTo(C.i2c_address,[C.hourReg, (dec2bcd(hour))]);
};

// Read the current date & time
DS3231.prototype.readDateTime = function (select) {
  this.i2c.writeTo(C.i2c_address, C.secsReg/* address*/);
  var data = this.i2c.readFrom(C.i2c_address, 7/* bytes */); //read number of bytes from address
  var seconds = bcd2dec(data[0]);
  var minutes = bcd2dec(data[1]);
  var hours = bcd2dec(data[2]);
  var dow = bcd2dec(data[3]);
  var date = bcd2dec(data[4]);
  var month = bcd2dec(data[5]);
  var year = bcd2dec(data[6]);

  if (hours === 2 && minutes === 0 && seconds === 0 && this.isDST(date,month,dow) === true && this.dstStatus === false) {
    // clocks go forward, CEST
    this.i2c.writeTo(C.i2c_address,[C.hourReg, (dec2bcd(2))]);
    hours = 3;
    this.dstStatus = true;
  }

  if (hours === 3 && minutes === 0 && seconds === 0 && this.isDST(date,month,dow) === false && this.dstStatus === true) {
    // clocks go back, CET
    this.i2c.writeTo(C.i2c_address,[C.hourReg, (dec2bcd(1))]);
    hours = 2;
    this.dstStatus = false;
  }

  switch (select) {
    case "hours": return hours;
    case "minutes" : return minutes;
    case "dow" : return dow;
    case "date" : return date;
    case "month" : return month;
    case "year" : return year;
    default: {
      return new Date(2000+year, month-1, date, hours, minutes, seconds);
    }
  }
};

exports.connect = function(i2c, options) {
  return new DS3231(i2c, options);
};