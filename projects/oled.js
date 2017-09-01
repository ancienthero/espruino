require("Font6x8").add(Graphics);
var s,g;

function draw(){
  var output = rtc.readDateTime().toString();
  g.clear();
  g.drawString(output);
  // write to the screen
  g.flip();
}

function oledInit() {
  g.setContrast(100);
  g.clear();
  g.setFont6x8();
}




I2C1.setup({scl:B6,sda:B7});
var rtc = require("DS3231").connect(I2C1);

// SPI
function onInit() {
  s = new SPI();
  s.setup({mosi: B15 /* D1 */, sck:B13 /* D0 */});
  g = require("SH1106").connectSPI(s, B14 /* DC */, B10 /* RST - can leave as undefined */, oledInit);
}

setInterval(draw,250);
save();