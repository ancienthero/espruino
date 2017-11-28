require("Font6x8").add(Graphics);
var s,g;
var onTimes = [{h:3,m:12,d:7,t:"ON"},{h:5,m:12,d:3,t:"ON"},{h:20,m:20,d:3,t:"ON"}];
var offTimes = [{h:5,m:12,d:6,t:"OFF"},{h:20,m:20,d:3,t:"OFF"},{h:10,m:12,d:1,t:"OFF"},{h:21,m:20,d:2,t:"OFF"},{h:11,m:20,d:1,t:"OFF"}];
const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT", "ALL"];

function draw(){
  var output = rtc.readDateTime().toString();
  g.clear();
  g.drawString(output);
  // write to the screen
  g.flip();
}


// Formatting
function format(val) {
  return ("0" + val).substr(-2);
}


function lookUpTimes() {
  var i = 0;
  g.clear();
  if (onTimes.length === 0 && offTimes.length === 0) {
    g.drawString("NOTHING TO DISPLAY", 8, 10);
    g.drawString("BACK", 8, 50);
    g.drawString(">", 0, 50);
  }
  g.drawString("ON TIMES",0,0);
  g.drawString("OFF TIMES",64,0);
  g.drawLine(60,10,60,60);
  for (i = 0; i < onTimes.length; i++) {
    g.drawString(format(onTimes[i].h) + ":" + format(onTimes[i].m) + " " + days[onTimes[i].d], 0, 10 * i + 10);
  }
  for (i = 0; i < offTimes.length; i++) {
    g.drawString(format(offTimes[i].h) + ":" + format(offTimes[i].m) + " " + days[offTimes[i].d], 64, 10 * i + 10);
  }
  g.flip();
  w1 = setWatch(function() {
    clearWatch(w1);
    mainMenu();
  }, MENU, wOptions);
}

function oledInit() {
  g.setContrast(100);
  g.clear();
  g.setFont6x8();
  g.flip();
}




I2C1.setup({scl:B6,sda:B7});
var rtc = require("DS3231").connect(I2C1);

// SPI
function onInit() {
  s = new SPI();
  s.setup({mosi: B15 /* D1 */, sck:B13 /* D0 */});
  g = require("SH1106").connectSPI(s, B14 /* DC */, B10 /* RST - can leave as undefined */, oledInit);
}

onInit();
setTimeout(lookUpTimes,1000);
// save();