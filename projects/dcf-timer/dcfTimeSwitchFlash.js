A5.write(0); // antenna MOSFET gate
A6.write(0); // output MOSFET gate
pinMode(B3, "input_pulldown"); // LEFT
pinMode(B4, "input_pulldown"); // MENU
pinMode(B5, "input_pulldown"); // RIGHT
pinMode(A8, "input_pulldown"); // BOT
pinMode(B1, "input_pulldown"); // TOP
var LEFT = B3,
  MENU = B4,
  RIGHT = B5,
  BOT = A8,
  TOP = B1;

// output State
var outputStatus = false;

// on/off times arrays
var onTimes = [],
  offTimes = [];

// watches id, and watch options
var w1, w2, w3, w4, w5;
var wOptions = {
  repeat: true,
  debounce: 80,
  edge: "falling"
};

// intervals
var in1, in2, in3;

// dcf variables
var dcf = {
  last: 0,
  status: false,
  errCount: 0,
  shutdown: function() {
    A5.write(0);
    this.status = false;
    this.errCount = 0;
  }
};
// import 6x8 pixels font and add to Graphics library
require("Font6x8").add(Graphics);

// library to use Flash memory like "fake EEPROM"
var f = new (require("FlashEEPROM"))();

var s, g, rtc;

var days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT", "ALL"];

var upArrow = {
  width: 5,
  height: 3,
  bpp: 1,
  transparent: 0,
  buffer: E.toArrayBuffer(atob("I74="))
};

var downArrow = {
  width: 5,
  height: 3,
  bpp: 1,
  transparent: 0,
  buffer: E.toArrayBuffer(atob("+4g="))
};

// Formatting
function format(val) {
  return ("0" + val).substr(-2);
}
// clearing watches
function clearW(arr) {
  for (var x in arr) clearWatch(arr[x]);
}
// check if element belongs to an array
function isInArray(value, array) {
  return array.indexOf(value) > -1;
}

// write to build-in flash memory
function writeToFlash(arr, addr) {
  var flashStr = "";
  addr = addr ? addr : 0;
  if(!arr.length) {
    f.write(addr, "");
    return;
  }
  for (var x in arr) {
    flashStr += arr[x].h+"."+arr[x].m+"."+arr[x].d+"."+arr[x].t+".";
  }
  flashStr = flashStr.slice(0,-1);
  f.write(addr, flashStr);
}

// read from build-in flash memory
function readFromFlash(addr) {
  var flashStr = "", arr = [], out = [];
  if (addr === undefined || f.read(addr) === undefined) {return out;}
  flashStr = E.toString(f.read(addr));
  arr = flashStr.split(".");
  for (var i=0;i<arr.length;i+=4) {
    var date = {h:Number(arr[i]),
                m:Number(arr[i+1]),
                d:Number(arr[i+2]),
                t:arr[i+3]};
    out.push(date);
  }
  return out;
}

// turn on/off output device
function output() {
  var i = onTimes.length,
    j = offTimes.length;
  while (i--) {
    if ((onTimes[i].d === 7 || onTimes[i].d === rtc.readDateTime("dow")) && onTimes[i].h === rtc.readDateTime("hours") && onTimes[i].m === rtc.readDateTime("minutes")) {
      outputStatus = true;
      A6.write(1);
    }
  }
  while (j--) {
    if ((offTimes[j].d === 7 || offTimes[j].d === rtc.readDateTime("dow")) && offTimes[j].h === rtc.readDateTime("hours") && offTimes[j].m === rtc.readDateTime("minutes")) {
      outputStatus = false;
      A6.write(0);
    }
  }
}

// init oled
function oledInit() {
  g.setContrast(100);
  g.clear();
  g.setFont6x8();
  g.flip();
  main();
}

// dcf synchronization
function syncDcf(val) {
  if (dcf.status === false && ((isInArray(rtc.readDateTime("hours"), [2, 3, 4]) && rtc.readDateTime("minutes") === 0) || val === true)) {
    dcf.status = true;
    dcf.errCount = 0;
    dcf.last = 0;
    A5.write(1);
  }
}

function singleMessage(msg, callback) {
  g.clear();
  g.drawString(msg, 8, 10);
  g.drawString("BACK", 8, 50);
  g.drawString(">", 0, 50);
  g.flip();
  if (callback) {
    w1 = setWatch(function() {
      clearWatch(w1);
      callback();
    }, MENU, wOptions);
  }
}

function lookUpTimes() {
  var arr = [];
  arr.push.apply(arr, onTimes);
  arr.push.apply(arr, offTimes);
  g.clear();
  if (arr.length === 0) {
    g.drawString("NOTHING TO DISPLAY", 8, 10);
  }
  if (arr.length < 6) {
    g.drawString("BACK", 8, 50);
    g.drawString(">", 0, 50);
  }
  for (var i = 0; i < arr.length; i++) {
    g.drawString(format(arr[i].h) + ":" + format(arr[i].m) + "  " + days[arr[i].d] + "  " + arr[i].t, 8, 10 * i);
  }
  g.flip();
  w1 = setWatch(function() {
    clearWatch(w1);
    mainMenu();
  }, MENU, wOptions);
}

function delOnOffTimeView(date, cursor) {
  g.clear();
  g.drawString(format(date.h) + ":" + format(date.m) + "  " + days[date.d] + "  " + date.t, 8, 10);
  g.drawString("DELETE, QUIT", 8, 40);
  g.drawString("DELETE, QUIT", 8, 40);
  g.drawString("BACK", 8, 50);
  if (cursor >= 1) {
    g.drawString(">", 0, (cursor === 1) ? 40 : 50);
  } else {
    g.drawImage(upArrow, 12, 5);
    g.drawImage(downArrow, 12, 19);
  }
  g.flip();
}

function delOnOffTime() {
  var position = 0;
  var item = 0;
  var arr = [];
  arr.push.apply(arr, onTimes);
  arr.push.apply(arr, offTimes);
  if (arr.length === 0) {
    singleMessage("NOTHING TO DELETE", mainMenu);
    return;
  }
  delOnOffTimeView(arr[0], position);
  w1 = setWatch(function() {
    if (position === 0 && arr.length > 1) {
      item = (item < arr.length - 1) ? item + 1 : 0;
      delOnOffTimeView(arr[item], position);
    }
  }, TOP, wOptions);
  w2 = setWatch(function() {
    if (position === 0 && arr.length > 1) {
      item = (item === 0) ? arr.length - 1 : item - 1;
      delOnOffTimeView(arr[item], position);
    }
  }, BOT, wOptions);
  w3 = setWatch(function() {
    position = (position >= 2) ? 0 : position + 1;
    delOnOffTimeView(arr[item], position);
  }, RIGHT, wOptions);
  w4 = setWatch(function() {
    position = (position === 0) ? 2 : position - 1;
    delOnOffTimeView(arr[item], position);
  }, LEFT, wOptions);
  w5 = setWatch(function() {
    switch (position) {
      case 1:
        if (item <= onTimes.length - 1) {
          onTimes.splice(item, 1);
          writeToFlash(onTimes,0);
        } else if (offTimes.length) {
          offTimes.splice(item - onTimes.length, 1);
          writeToFlash(offTimes,1);
        }
        clearW([w1, w2, w3, w4, w5]);
        mainMenu();
        break;
      case 2:
        clearW([w1, w2, w3, w4, w5]);
        mainMenu();
        break;
    }
  }, MENU, wOptions);
}

// drawing function
function mainView() {
  var date = rtc.readDateTime();
  g.clear();
  g.drawString(format(date.getHours()) + ":" + format(date.getMinutes()) + ":" + format(date.getSeconds()), 0, 0);
  g.drawString(days[date.getDay()] + " " + date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear(), 45, 0);
  g.drawString("DCF status", 0, 20);
  g.drawString("ON", 72, 20);
  g.drawString("OFF", 98, 20);
  if (dcf.status) {
    g.fillCircle(65, 23, 3);
    g.drawCircle(91, 23, 3);
    g.drawString("DCF errors", 0, 40);
    g.drawString(dcf.errCount, 62, 40);
  } else {
    g.drawCircle(65, 23, 3);
    g.fillCircle(91, 23, 3);
  }
  g.drawString("DCF sync", 0, 30);
  if (dcf.last === 0) {
    g.drawString("------", 62, 30);
  } else {
    g.drawString(format(dcf.last.getHours()) + ":" + format(dcf.last.getMinutes()) + " " + dcf.last.getDate() + "/" + (dcf.last.getMonth() + 1), 62, 30);
  }
  //output
  g.drawString("OUT status", 0, 50);
  g.drawString("ON", 72, 50);
  g.drawString("OFF", 98, 50);
  if (outputStatus) {
    g.fillCircle(65, 53, 3);
    g.drawCircle(91, 53, 3);
  } else {
    g.drawCircle(65, 53, 3);
    g.fillCircle(91, 53, 3);
  }
  g.flip();
}

function mainMenuView(cursor) {
  g.clear();
  g.drawString("SYNC DCF77", 8, 0);
  g.drawString("SET DATE TIME", 8, 10);
  g.drawString("ADD ON/OFF TIME", 8, 20);
  g.drawString("DELETE ON/OFF TIME", 8, 30);
  g.drawString("LOOK UP ON/OFF TIMES", 8, 40);
  g.drawString("BACK", 8, 50);
  g.drawString(">", 0, (cursor >= 5) ? 50 : cursor * 10);
  g.flip();
}

function setOnOffTimeView(date, cursor) {
  var curPos = [10, 27, 48, 72];
  g.clear();
  g.drawString(format(date.h), 8, 10);
  g.drawString(":", 21, 10);
  g.drawString(format(date.m), 25, 10);
  g.drawString(days[date.d], 43, 10);
  g.drawString(date.t, 67, 10);
  g.drawString("SAVE, QUIT", 8, 40);
  g.drawString("BACK", 8, 50);
  if (cursor >= 4) {
    g.drawString(">", 0, (cursor === 4) ? 40 : 50);
  } else {
    g.drawImage(upArrow, curPos[cursor], 5);
    g.drawImage(downArrow, curPos[cursor], 19);
  }
  g.flip();
}

function setTimeView(date, cursor) {
  var curPos = [10, 27, 70, 83, 100];
  if (typeof date !== "object") {
    date = rtc.readDateTime();
  }
  g.clear();
  g.drawString(format(date.getHours()), 8, 10);
  g.drawString(":", 21, 10);
  g.drawString(format(date.getMinutes()), 25, 10);
  g.drawString(days[date.getDay()], 43, 10);
  g.drawString(format(date.getDate()), 68, 10);
  g.drawString(format(date.getMonth() + 1), 81, 10);
  g.drawString(date.getFullYear(), 94, 10);
  g.drawString("SAVE, QUIT", 8, 40);
  g.drawString("BACK", 8, 50);
  if (cursor >= 5) {
    g.drawString(">", 0, (cursor === 5) ? 40 : 50);
  } else {
    g.drawImage(upArrow, curPos[cursor], 5);
    g.drawImage(downArrow, curPos[cursor], 19);
  }
  g.flip();
}

function setOnOffTime() {
  var position = 0;
  var date = {
    h: rtc.readDateTime("hours"),
    m: rtc.readDateTime("minutes"),
    d: 7,
    t: "ON"
  };
  setOnOffTimeView(date, position);
  w1 = setWatch(function() {
    switch (position) {
      case 0:
        date.h = (date.h >= 23) ? 0 : date.h + 1;
        break;
      case 1:
        date.m = (date.m >= 59) ? 0 : date.m + 1;
        break;
      case 2:
        date.d = (date.d >= 7) ? 0 : date.d + 1;
        break;
      case 3:
        date.t = (date.t === "ON") ? "OFF" : "ON";
        break;
    }
    setOnOffTimeView(date, position);
  }, TOP, wOptions);
  w2 = setWatch(function() {
    switch (position) {
      case 0:
        date.h = (date.h === 0) ? 23 : date.h - 1;
        break;
      case 1:
        date.m = (date.m === 0) ? 59 : date.m - 1;
        break;
      case 2:
        date.d = (date.d === 0) ? 7 : date.d - 1;
        break;
      case 3:
        date.t = (date.t === "ON") ? "OFF" : "ON";
        break;
    }
    setOnOffTimeView(date, position);
  }, BOT, wOptions);
  w3 = setWatch(function() {
    position = (position >= 5) ? 0 : position + 1;
    setOnOffTimeView(date, position);
  }, RIGHT, wOptions);
  w4 = setWatch(function() {
    position = (position === 0) ? 5 : position - 1;
    setOnOffTimeView(date, position);
  }, LEFT, wOptions);
  w5 = setWatch(function() {
    if (position === 4) {
      if (date.t === "ON") {
        onTimes.unshift(date);
        onTimes.length > 3 ? onTimes.pop() : null;
        writeToFlash(onTimes,0);
      } else {
        offTimes.unshift(date);
        offTimes.length > 3 ? offTimes.pop() : null;
        writeToFlash(offTimes,1);
      }
      clearW([w1, w2, w3, w4, w5]);
      mainMenu();
    } else if (position === 5) {
      clearW([w1, w2, w3, w4, w5]);
      mainMenu();
    }
  }, MENU, wOptions);
}

// draw logic function
function setTime() {
  var position = 0;
  var date = rtc.readDateTime();
  setTimeView(date, position);
  w1 = setWatch(function() {
    switch (position) {
      case 0:
        date.setHours((date.getHours() >= 23) ? 0 : date.getHours() + 1);
        break;
      case 1:
        date.setMinutes((date.getMinutes() >= 59) ? 0 : date.getMinutes() + 1);
        break;
      case 2:
        date.setDate(date.getDate() + 1);
        break;
      case 3:
        date.setMonth(date.getMonth() + 1);
        break;
      case 4:
        date.setFullYear(date.getFullYear() + 1);
        break;
    }
    setTimeView(date, position);
  }, TOP, wOptions);
  w2 = setWatch(function() {
    switch (position) {
      case 0:
        date.setHours((date.getHours() === 0) ? 23 : date.getHours() - 1);
        break;
      case 1:
        date.setMinutes((date.getMinutes() === 0) ? 59 : date.getMinutes() - 1);
        break;
      case 2:
        date.setDate(date.getDate() - 1);
        break;
      case 3:
        date.setMonth(date.getMonth() - 1);
        break;
      case 4:
        date.setFullYear(date.getFullYear() - 1);
        break;
    }
    setTimeView(date, position);
  }, BOT, wOptions);
  w3 = setWatch(function() {
    position = (position >= 6) ? 0 : position + 1;
    setTimeView(date, position);
  }, RIGHT, wOptions);
  w4 = setWatch(function() {
    position = (position === 0) ? 6 : position - 1;
    setTimeView(date, position);
  }, LEFT, wOptions);
  w5 = setWatch(function() {
    if (position === 5) {
      rtc.setTime(date.getHours(), date.getMinutes());
      rtc.setDate(date.getDate(), date.getMonth(), date.getFullYear());
      rtc.setDow(date.getDay());
      clearW([w1, w2, w3, w4, w5]);
      mainMenu();
    } else if (position === 6) {
      clearW([w1, w2, w3, w4, w5]);
      mainMenu();
    }
  }, MENU, wOptions);
}

function mainMenu() {
  var position = 0;
  mainMenuView(position);
  w1 = setWatch(function() {
    position = (position >= 5) ? 0 : position + 1;
    mainMenuView(position);
  }, BOT, wOptions);
  w2 = setWatch(function() {
    position = (position === 0) ? 5 : position - 1;
    mainMenuView(position);
  }, TOP, wOptions);
  w3 = setWatch(function() {
    position = (position >= 5) ? 0 : position + 1;
    mainMenuView(position);
  }, RIGHT, wOptions);
  w4 = setWatch(function() {
    position = (position === 0) ? 5 : position - 1;
    mainMenuView(position);
  }, LEFT, wOptions);
  w5 = setWatch(function() {
    clearW([w1, w2, w3, w4, w5]);
    switch (position) {
      case 0:
        syncDcf(true);
        main();
        break;
      case 1:
        setTime();
        break;
      case 2:
        setOnOffTime();
        break;
      case 3:
        delOnOffTime();
        break;
      case 4:
        lookUpTimes();
        break;
      case 5:
        main();
        break;
    }
  }, MENU, wOptions);
}

function main() {
  in1 = setInterval(mainView, 330);
  w1 = setWatch(function() {
    clearWatch(w1);
    clearInterval(in1);
    mainMenu();
  }, MENU, wOptions);
}

function onInit() {
  // real time clock initalize
  I2C1.setup({
    scl: B6,
    sda: B7
  });
  rtc = require("https://github.com/ancienthero/espruino/blob/master/modules/DS3231/DS3231.js").connect(I2C1);
  //oled init
  s = new SPI();
  s.setup({
    mosi: B15 /* D1 */ ,
    sck: B13 /* D0 */
  });
  g = require("SH1106").connectSPI(s, B14 /* DC */ , B10 /* RST - can leave as undefined */ , oledInit);
  onTimes = readFromFlash(0);
  offTimes = readFromFlash(1);
}

//comment when save
// onInit();

// DCF watch
require("DCF77").connect(A7, function(err, date, info) {
  if (err) {
    // console.log("Error: " + err);
    dcf.errCount++;
    if (dcf.errCount > 30) {
      dcf.shutdown();
    }
  } else {
    if (dcf.last && (date.getTime() - dcf.last.getTime()) === (60000 * (1 + dcf.errCount))) {
      // update rtc settings
      rtc.setTime(date.getHours(), date.getMinutes());
      rtc.setDate(date.getDate(), date.getMonth(), date.getFullYear());
      rtc.setDow(date.getDay());
      dcf.last = date;
      digitalPulse(LED2, 1, 100);
      // console.log("DCF synced! " + date.toString());
      dcf.shutdown();
      return;
    } else {
      dcf.last = date;
      dcf.errCount = 0;
      // console.log("DCF first sync " + date.toString());
    }
  }
});

in2 = setInterval(syncDcf, 30000);
in3 = setInterval(output, 1000);
// uncomment when save to FLASH
save();