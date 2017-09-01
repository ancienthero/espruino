A5.write(0); // GND

// pulldonw
pinMode(B3, "input_pulldown"); // LEFT
pinMode(B4, "input_pulldown"); // MENU
pinMode(B5, "input_pulldown"); // RIGHT
pinMode(A8, "input_pulldown"); // BOT
pinMode(B1, "input_pulldown"); // UP

// button watch
setWatch(function() {
  syncDcf(true);
}, B4, { repeat: true, debounce : 50, edge: "rising" });

setWatch(function() {
  digitalWrite(A6,1);
}, A5, { repeat: true, debounce : 50, edge: "rising" });

setWatch(function() {
  digitalWrite(A6,0);
}, A8, { repeat: true, debounce : 50, edge: "rising" });

require("Font6x8").add(Graphics);
var s,g, rtc;
var B = [];

// dcf variables
var dcf = {
  last: 0,
  status: false,
  errCount: 0,
  shutdown: function(){
    B1.write(0);
    this.status = false;
    this.errCount = 0;
  }
};

function oledPrint(line) {
  var lines = 6, x0 = 0;
  B.unshift(line);
  if (lines < B.length)
    B.splice(-1);
  g.clear();
  for (var i=0; i < B.length; i++) {
    g.drawString(B[i],0,(10*i)+x0);
  }
  g.flip();
}

function oledInit() {
  g.setContrast(100);
  g.clear();
  g.setFont6x8();
  g.flip();
}


// SPI
function onInit() {
  s = new SPI();
  s.setup({mosi: B15 /* D1 */, sck:B13 /* D0 */});
  g = require("SH1106").connectSPI(s, B14 /* DC */, B10 /* RST - can leave as undefined */, oledInit);
//}

//onInit();

// real time clock initalize
I2C1.setup({scl:B6,sda:B7});
rtc = require("https://github.com/ancienthero/espruino/blob/master/modules/DS3231/DS3231.js").connect(I2C1);

}

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
    B1.write(1);
    console.log("syncDcf activated");
    return;
  }
}

require("DCF77").connect(A7, function(err, date, info) {
  if (err) {
    digitalPulse(LED1,1,100);
    oledPrint("Error: " + err);
    dcf.errCount++;
    if (dcf.errCount > 120) {
      dcf.shutdown();
    }
  } else {
    digitalPulse(LED2,1,100);
    if (dcf.last && (date.getTime() - dcf.last.getTime()) === (60000*(1+dcf.errCount))) {
      // update rtc settings
      rtc.setTime(date.getHours(), date.getMinutes());
      rtc.setDate(date.getDate(), date.getMonth() ,date.getFullYear());
      rtc.setDow(date.getDay());
      oledPrint(date.toString().substring(0,24));
      oledPrint("DCF synced!:");
      dcf.shutdown();
      return;
    } else {
      dcf.last = date;
      dcf.errCount = 0;
      oledPrint(date.toString().substring(0,24));
      oledPrint("DCF first sync:");
    }
  }
});

var in1 = setInterval(syncDcf, 30000);
save();
