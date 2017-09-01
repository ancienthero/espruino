I2C1.setup({scl:B6,sda:B7});
var rtc = require("DS3231").connect(I2C1, { DST : true });
var d = rtc.readDateTime();
console.log(d.toString());
