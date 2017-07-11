/* Copyright (c) 2017 Paweł Hajduk, based on Peter Clarke module */
/*
Module is to set date time and read date time from a DS3231 over I2C.
*/

function DS3231(i2c) {
  this.i2c = i2c;
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

// Public functions
// Set the day of the week, Sunday = 0, Monday = 1 etc..
DS3231.prototype.setDow = function(day) {
  this.i2c.writeTo(C.i2c_address,[C.dowReg, (dec2bcd(1+day))]);
};

// Set the date, date (1-31), month (0-11), year (eg: 2017)
DS3231.prototype.setDate = function(date,month,year) {
  this.i2c.writeTo(C.i2c_address,[C.dateReg, (dec2bcd(date))]);
  this.i2c.writeTo(C.i2c_address,[C.monthReg, (dec2bcd(month+1))]);
  this.i2c.writeTo(C.i2c_address,[C.yearReg, (dec2bcd(year-2000))]);
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

  switch (select) {
    case "hours": return hours;
    case "minutes" : return minutes;
    case "dow" : return dow-1;
    case "date" : return date;
    case "month" : return month-1;
    case "year" : return 2000+year;
    default: {
      return new Date(2000+year, month-1, date, hours, minutes, seconds);
    }
  }
};

exports.connect = function(i2c) {
  return new DS3231(i2c);
};