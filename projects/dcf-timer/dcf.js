A5.write(0); // GND
//intervals
var in2;
// dcf variables
var dcf = {
  last: 0,
  status: false,
  errCount: 0,
  shutdown: function(){
    A5.write(0);
    this.status = false;
    this.errCount = 0;
  }
};


// real time clock initalize
I2C1.setup({scl:B6,sda:B7});
var rtc = require("https://github.com/ancienthero/espruino/blob/master/modules/DS3231/DS3231.js").connect(I2C1);

// Formatting
function format(val) {
  return ("0"+val).substr(-2);
}

// dcf sync
function syncDcf(val) {
  if (dcf.status === false && ((rtc.readDateTime("hours") === 2 && rtc.readDateTime("minutes")=== 0) || val === true)) {
    dcf.status = true;
    dcf.errCount = 0;
    dcf.last = 0;
    A5.write(1);
    console.log("syncDcf activated");
  }
}

require("DCF77").connect(A7, function(err, date, info) {
  if (err) {
    digitalPulse(LED1,1,100);
    console.log("Error: " + err);
    dcf.errCount++;
    if (dcf.errCount > 120) {
      dcf.shutdown();
    }
  } else {
    if (dcf.last && (date.getTime() - dcf.last.getTime()) === (60000*(1+dcf.errCount))) {
      // update rtc settings
      rtc.setTime(date.getHours(), date.getMinutes());
      rtc.setDate(date.getDate(), date.getMonth() ,date.getFullYear());
      rtc.setDow(date.getDay());
      dcf.last = date;
      digitalPulse(LED2,1,100);
      console.log("DCF synced! " + date.toString());
      dcf.shutdown();
      return;
    } else {
      dcf.last = date;
      dcf.errCount = 0;
      console.log("DCF first sync " + date.toString());
    }
  }
});

in2 = setInterval(syncDcf, 30000);




