function format(a){return('0'+a).substr(-2);}function clearW(a){for(var b in a)clearWatch(a[b]);}function isInArray(a,b){return b.indexOf(a)>-1;}function writeToFlash(a,b){var c='';if(b=b?b:0,!a.length){f.write(b,'');return;}for(var d in a)c+=a[d].h+'.'+a[d].m+'.'+a[d].d+'.'+a[d].t+'.';c=c.slice(0,-1),f.write(b,c);}function readFromFlash(d){var e='',a=[],c=[];if(d===undefined||f.read(d)===undefined)return c;e=E.toString(f.read(d)),a=e.split('.');for(var b=0;b<a.length;b+=4){var g={h:Number(a[b]),m:Number(a[b+1]),d:Number(a[b+2]),t:a[b+3]};c.push(g);}return c;}function output(){var a=onTimes.length,b=offTimes.length;while(a--)(onTimes[a].d===7||onTimes[a].d===rtc.readDateTime('dow'))&&onTimes[a].h===rtc.readDateTime('hours')&&onTimes[a].m===rtc.readDateTime('minutes')&&(outputStatus=!0,A6.write(1));while(b--)(offTimes[b].d===7||offTimes[b].d===rtc.readDateTime('dow'))&&offTimes[b].h===rtc.readDateTime('hours')&&offTimes[b].m===rtc.readDateTime('minutes')&&(outputStatus=!1,A6.write(0));}function oledInit(){g.setContrast(100),g.clear(),g.setFont6x8(),g.flip(),main();}function syncDcf(a){dcf.status===!1&&(isInArray(rtc.readDateTime('hours'),[2,3,4])&&rtc.readDateTime('minutes')===0||a===!0)&&(dcf.status=!0,dcf.errCount=0,dcf.last=0,A5.write(1));}function singleMessage(b,a){g.clear(),g.drawString(b,8,10),g.drawString('BACK',8,50),g.drawString('>',0,50),g.flip(),a&&(w1=setWatch(function(){clearWatch(w1),a();},MENU,wOptions));}function lookUpTimes(){var a=[];a.push.apply(a,onTimes),a.push.apply(a,offTimes),g.clear(),a.length===0&&g.drawString('NOTHING TO DISPLAY',8,10),a.length<6&&(g.drawString('BACK',8,50),g.drawString('>',0,50));for(var b=0;b<a.length;b++)g.drawString(format(a[b].h)+':'+format(a[b].m)+'  '+days[a[b].d]+'  '+a[b].t,8,10*b);g.flip(),w1=setWatch(function(){clearWatch(w1),mainMenu();},MENU,wOptions);}function delOnOffTimeView(a,b){g.clear(),g.drawString(format(a.h)+':'+format(a.m)+'  '+days[a.d]+'  '+a.t,8,10),g.drawString('DELETE, QUIT',8,40),g.drawString('DELETE, QUIT',8,40),g.drawString('BACK',8,50),b>=1?g.drawString('>',0,b===1?40:50):(g.drawImage(upArrow,12,5),g.drawImage(downArrow,12,19)),g.flip();}function delOnOffTime(){var a=0;var c=0;var b=[];if(b.push.apply(b,onTimes),b.push.apply(b,offTimes),b.length===0){singleMessage('NOTHING TO DELETE',mainMenu);return;}delOnOffTimeView(b[0],a),w1=setWatch(function(){a===0&&b.length>1&&(c=c<b.length-1?c+1:0,delOnOffTimeView(b[c],a));},TOP,wOptions),w2=setWatch(function(){a===0&&b.length>1&&(c=c===0?b.length-1:c-1,delOnOffTimeView(b[c],a));},BOT,wOptions),w3=setWatch(function(){a=a>=2?0:a+1,delOnOffTimeView(b[c],a);},RIGHT,wOptions),w4=setWatch(function(){a=a===0?2:a-1,delOnOffTimeView(b[c],a);},LEFT,wOptions),w5=setWatch(function(){switch(a){case 1:c<=onTimes.length-1?(onTimes.splice(c,1),writeToFlash(onTimes,0)):offTimes.length&&(offTimes.splice(c-onTimes.length,1),writeToFlash(offTimes,1));clearW([w1,w2,w3,w4,w5]);mainMenu();break;case 2:clearW([w1,w2,w3,w4,w5]);mainMenu();break;}},MENU,wOptions);}function mainView(){var a=rtc.readDateTime();g.clear(),g.drawString(format(a.getHours())+':'+format(a.getMinutes())+':'+format(a.getSeconds()),0,0),g.drawString(days[a.getDay()]+' '+a.getDate()+'/'+(a.getMonth()+1)+'/'+a.getFullYear(),45,0),g.drawString('DCF status',0,20),g.drawString('ON',72,20),g.drawString('OFF',98,20),dcf.status?(g.fillCircle(65,23,3),g.drawCircle(91,23,3),g.drawString('DCF errors',0,40),g.drawString(dcf.errCount,62,40)):(g.drawCircle(65,23,3),g.fillCircle(91,23,3)),g.drawString('DCF sync',0,30),dcf.last===0?g.drawString('------',62,30):g.drawString(format(dcf.last.getHours())+':'+format(dcf.last.getMinutes())+' '+dcf.last.getDate()+'/'+(dcf.last.getMonth()+1),62,30),g.drawString('OUT status',0,50),g.drawString('ON',72,50),g.drawString('OFF',98,50),outputStatus?(g.fillCircle(65,53,3),g.drawCircle(91,53,3)):(g.drawCircle(65,53,3),g.fillCircle(91,53,3)),g.flip();}function mainMenuView(a){g.clear(),g.drawString('SYNC DCF77',8,0),g.drawString('SET DATE TIME',8,10),g.drawString('ADD ON/OFF TIME',8,20),g.drawString('DELETE ON/OFF TIME',8,30),g.drawString('LOOK UP ON/OFF TIMES',8,40),g.drawString('BACK',8,50),g.drawString('>',0,a>=5?50:a*10),g.flip();}function setOnOffTimeView(a,b){var c=[10,27,48,72];g.clear(),g.drawString(format(a.h),8,10),g.drawString(':',21,10),g.drawString(format(a.m),25,10),g.drawString(days[a.d],43,10),g.drawString(a.t,67,10),g.drawString('SAVE, QUIT',8,40),g.drawString('BACK',8,50),b>=4?g.drawString('>',0,b===4?40:50):(g.drawImage(upArrow,c[b],5),g.drawImage(downArrow,c[b],19)),g.flip();}function setTimeView(a,b){var c=[10,27,70,83,100];typeof a!=='object'&&(a=rtc.readDateTime()),g.clear(),g.drawString(format(a.getHours()),8,10),g.drawString(':',21,10),g.drawString(format(a.getMinutes()),25,10),g.drawString(days[a.getDay()],43,10),g.drawString(format(a.getDate()),68,10),g.drawString(format(a.getMonth()+1),81,10),g.drawString(a.getFullYear(),94,10),g.drawString('SAVE, QUIT',8,40),g.drawString('BACK',8,50),b>=5?g.drawString('>',0,b===5?40:50):(g.drawImage(upArrow,c[b],5),g.drawImage(downArrow,c[b],19)),g.flip();}function setOnOffTime(){var b=0;var a={h:rtc.readDateTime('hours'),m:rtc.readDateTime('minutes'),d:7,t:'ON'};setOnOffTimeView(a,b),w1=setWatch(function(){switch(b){case 0:a.h=a.h>=23?0:a.h+1;break;case 1:a.m=a.m>=59?0:a.m+1;break;case 2:a.d=a.d>=7?0:a.d+1;break;case 3:a.t=a.t==='ON'?'OFF':'ON';break;}setOnOffTimeView(a,b);},TOP,wOptions),w2=setWatch(function(){switch(b){case 0:a.h=a.h===0?23:a.h-1;break;case 1:a.m=a.m===0?59:a.m-1;break;case 2:a.d=a.d===0?7:a.d-1;break;case 3:a.t=a.t==='ON'?'OFF':'ON';break;}setOnOffTimeView(a,b);},BOT,wOptions),w3=setWatch(function(){b=b>=5?0:b+1,setOnOffTimeView(a,b);},RIGHT,wOptions),w4=setWatch(function(){b=b===0?5:b-1,setOnOffTimeView(a,b);},LEFT,wOptions),w5=setWatch(function(){b===4?(a.t==='ON'?(onTimes.unshift(a),onTimes.length>3&&onTimes.pop(),writeToFlash(onTimes,0)):(offTimes.unshift(a),offTimes.length>3&&offTimes.pop(),writeToFlash(offTimes,1)),clearW([w1,w2,w3,w4,w5]),mainMenu()):b===5&&(clearW([w1,w2,w3,w4,w5]),mainMenu());},MENU,wOptions);}function setTime(){var b=0;var a=rtc.readDateTime();setTimeView(a,b),w1=setWatch(function(){switch(b){case 0:a.setHours(a.getHours()>=23?0:a.getHours()+1);break;case 1:a.setMinutes(a.getMinutes()>=59?0:a.getMinutes()+1);break;case 2:a.setDate(a.getDate()+1);break;case 3:a.setMonth(a.getMonth()+1);break;case 4:a.setFullYear(a.getFullYear()+1);break;}setTimeView(a,b);},TOP,wOptions),w2=setWatch(function(){switch(b){case 0:a.setHours(a.getHours()===0?23:a.getHours()-1);break;case 1:a.setMinutes(a.getMinutes()===0?59:a.getMinutes()-1);break;case 2:a.setDate(a.getDate()-1);break;case 3:a.setMonth(a.getMonth()-1);break;case 4:a.setFullYear(a.getFullYear()-1);break;}setTimeView(a,b);},BOT,wOptions),w3=setWatch(function(){b=b>=6?0:b+1,setTimeView(a,b);},RIGHT,wOptions),w4=setWatch(function(){b=b===0?6:b-1,setTimeView(a,b);},LEFT,wOptions),w5=setWatch(function(){b===5?(rtc.setTime(a.getHours(),a.getMinutes()),rtc.setDate(a.getDate(),a.getMonth(),a.getFullYear()),rtc.setDow(a.getDay()),clearW([w1,w2,w3,w4,w5]),mainMenu()):b===6&&(clearW([w1,w2,w3,w4,w5]),mainMenu());},MENU,wOptions);}function mainMenu(){var a=0;mainMenuView(a),w1=setWatch(function(){a=a>=5?0:a+1,mainMenuView(a);},BOT,wOptions),w2=setWatch(function(){a=a===0?5:a-1,mainMenuView(a);},TOP,wOptions),w3=setWatch(function(){a=a>=5?0:a+1,mainMenuView(a);},RIGHT,wOptions),w4=setWatch(function(){a=a===0?5:a-1,mainMenuView(a);},LEFT,wOptions),w5=setWatch(function(){clearW([w1,w2,w3,w4,w5]);switch(a){case 0:syncDcf(!0);main();break;case 1:setTime();break;case 2:setOnOffTime();break;case 3:delOnOffTime();break;case 4:lookUpTimes();break;case 5:main();break;}},MENU,wOptions);}function main(){in1=setInterval(mainView,330),w1=setWatch(function(){clearWatch(w1),clearInterval(in1),mainMenu();},MENU,wOptions);}function onInit(){I2C1.setup({scl:B6,sda:B7}),rtc=require('https://github.com/ancienthero/espruino/blob/master/modules/DS3231/DS3231.js').connect(I2C1),s=new SPI(),s.setup({mosi:B15,sck:B13}),g=require('SH1106').connectSPI(s,B14,B10,oledInit),onTimes=readFromFlash(0),offTimes=readFromFlash(1);}Modules.removeAllCached(),Modules.addCached('https://github.com/ancienthero/espruino/blob/master/modules/DS3231/DS3231.js',"function DS3231(a){this.i2c=a;}function dec2bcd(a){return parseInt(a,16);}function bcd2dec(a){return(a>>4)*10+(a&15);}var C={i2c_address:104,dateReg:4,monthReg:5,yearReg:6,secsReg:0,minsReg:1,hourReg:2,dowReg:3};DS3231.prototype.setDow=function(a){this.i2c.writeTo(C.i2c_address,[C.dowReg,dec2bcd(1+a)]);},DS3231.prototype.setDate=function(a,b,c){this.i2c.writeTo(C.i2c_address,[C.dateReg,dec2bcd(a)]),this.i2c.writeTo(C.i2c_address,[C.monthReg,dec2bcd(b+1)]),this.i2c.writeTo(C.i2c_address,[C.yearReg,dec2bcd(c-2000)]);},DS3231.prototype.setTime=function(a,b){this.i2c.writeTo(C.i2c_address,[C.secsReg,0]),this.i2c.writeTo(C.i2c_address,[C.minsReg,dec2bcd(b)]),this.i2c.writeTo(C.i2c_address,[C.hourReg,dec2bcd(a)]);},DS3231.prototype.readDateTime=function(i){this.i2c.writeTo(C.i2c_address,C.secsReg);var a=this.i2c.readFrom(C.i2c_address,7);var g=bcd2dec(a[0]);var b=bcd2dec(a[1]);var c=bcd2dec(a[2]);var h=bcd2dec(a[3]);var d=bcd2dec(a[4]);var e=bcd2dec(a[5]);var f=bcd2dec(a[6]);switch(i){case'hours':return c;case'minutes':return b;case'dow':return h-1;case'date':return d;case'month':return e-1;case'year':return 2000+f;default:return new Date(2000+f,e-1,d,c,b,g);}},exports.connect=function(a){return new DS3231(a);};"),Modules.addCached('SH1106','function h(c){c&&c.height&&(g[4]=c.height-1,g[13]=64==c.height?18:2);c&&c.contrast&&(g[15]=c.contrast)}var g=new Uint8Array([174,213,80,168,63,211,0,64,173,139,161,200,218,18,129,128,217,34,219,53,166,175]);exports.connect=function(c,e,d){h(d);var f=Graphics.createArrayBuffer(128,g[4]+1,1,{vertical_byte:!0}),b=60;d&&d.address&&(b=d.address);g.forEach(function(a){c.writeTo(b,[0,a])});void 0!==e&&setTimeout(e,10);f.flip=function(){var a=176,e=new Uint8Array(129);e[0]=64;for(var d=0;d<128*\ng[4]/8;d+=128)c.writeTo(b,[0,a,2,16]),a++,e.set(new Uint8Array(this.buffer,d,128),1),c.writeTo(b,e)};f.setContrast=function(a){c.writeTo(b,0,129,a)};return f};exports.connectSPI=function(c,e,d,f,b){h(b);var a=b?b.cs:void 0;b=Graphics.createArrayBuffer(128,g[4]+1,1,{vertical_byte:!0});d&&digitalPulse(d,0,10);setTimeout(function(){a&&digitalWrite(a,0);digitalWrite(e,0);c.write(g);digitalWrite(e,1);a&&digitalWrite(a,1);void 0!==f&&setTimeout(f,10)},50);b.flip=function(){var b=176,d=new Uint8Array(128);\na&&digitalWrite(a,0);for(var f=0;f<128*g[4]/8;f+=128)digitalWrite(e,0),c.write([b,2,16]),b++,digitalWrite(e,1),d.set(new Uint8Array(this.buffer,f,128),0),c.write(d);a&&digitalWrite(a,1)};b.setContrast=function(b){a&&a.reset();c.write(129,b,e);a&&a.set()};return b}'),Modules.addCached('DCF77','function c(a){return 1*(0|a[0])+2*(0|a[1])+4*(0|a[2])+8*(0|a[3])}function d(a){for(var c=0,b=0;b<a.length;b++)c^=a[b];return c}function f(a,e){if(d(a.substr(21,7))!=a[28])return e("Bad minutes");var b=c(a.substr(21,4))+10*c(a.substr(25,3));if(d(a.substr(29,6))!=a[35])return e("Bad hours");var g=c(a.substr(29,4))+10*c(a.substr(33,2));if(d(a.substr(36,22))!=a[58])return e("Bad date");var h=c(a.substr(36,4))+10*c(a.substr(40,2));c(a.substr(42,3));var f=c(a.substr(45,4))+10*c(a.substr(49,\n1)),k=c(a.substr(50,4))+10*c(a.substr(54,4));return e(null,new Date(2E3+k,f-1,h,g,b,0,0),{CEST:!!a[17],CET:!!a[18]})}exports.connect=function(a,c){var b={last:getTime(),bits:"",watchId:void 0};b.watchId=setWatch(function(a){var d=.15>a.time-a.lastTime?0:1;1.5<a.time-b.last&&(f(b.bits,c),b.bits="");b.last=a.time;b.bits+=d;59<b.bits.length&&(b.bits=b.bits.substr(-59))},a,{edge:"falling",repeat:!0,debounce:75});return b}'),Modules.addCached('FlashEEPROM','function d(b,c){this.flash=c?c:require("Flash");if(b)this.addr=b;else if(void 0!==this.flash.getFree){var a=this.flash.getFree();if(a.length)this.addr=a[0].addr;else throw"No free flash memory found";}else{a=process.memory();if(!a.flash_start||!a.flash_length)throw"process.memory() didn\'t contain information about flash memory";this.addr=a.flash_start+a.flash_length}a=this.flash.getPage(this.addr);if(!a)throw"Couldn\'t find flash page";this.addr=a.addr;this.endAddr=a.addr+a.length}d.prototype.getAddr=\nfunction(b){for(var c=this.addr,a=this.flash.read(4,c),d=-1;255!=a[3]&&c<this.endAddr;)a[0]==b&&(d=c),c+=(a[1]|a[2]<<8)+7&-4,a=this.flash.read(4,c);return{addr:d,end:c}};d.prototype.read=function(b){b=this.getAddr(b).addr;if(!(0>b))return key=this.flash.read(4,b),this.flash.read(key[1]|key[2]<<8,b+4)};d.prototype.readMem=function(b){b=this.getAddr(b).addr;if(!(0>b))return key=this.flash.read(4,b),E.memoryArea(b+4,key[1]|key[2]<<8)};d.prototype.readAll=function(){for(var b=[],c=this.addr,a=this.flash.read(4,\nc);255!=a[3]&&c<this.endAddr;){var d=a[1]|a[2]<<8;d&&(b[a[0]]=this.flash.read(d,c+4));c+=d+7&-4;a=this.flash.read(4,c)}return b};d.prototype._write=function(b,c,a){this.flash.write(new Uint8Array([c,a.length,a.length>>8,0]),b);b+=4;4!=a.length&&(c=new Uint8Array(a.length+3&-4),c.set(a),a=c);a.length&&this.flash.write(a,b);return b+a.length};d.prototype.write=function(b,c){c=E.toUint8Array(c);var a=this.getAddr(b);if(0<=a.addr&&(key=this.flash.read(4,a.addr),this.flash.read(key[1]|key[2]<<8,a.addr+\n4)==c))return;if(a.end+c.length+4>=this.endAddr&&(a.end=this.cleanup(),a.end+c.length+4>=this.endAddr))throw"Not enough memory!";this._write(a.end,b,c)};d.prototype.cleanup=function(){var b=this.readAll();this.flash.erasePage(this.addr);var c=this.addr,a;for(a in b)void 0!==b[a]&&(c=this._write(c,a,b[a]));return c};d.prototype.erase=function(){this.flash.erasePage(this.addr)};exports=d'),Modules.addCached('Font6x8','var a=atob("AAAAAPoAwADAAFhw2HDQAGSS/5JMAGCW+LzSDAxSolIMEsAAPEKBAIFCPABIMOAwSAAQEHwQEAABBgAQEBAQAAIAAwwwwAB8ipKifABA/gBChoqSYgCEkrLSjAAYKEj+CADkoqKinAA8UpKSDACAgI6wwABskpKSbABgkpKUeAAiAAEmABAoRAAoKCgoKABEKBAAQIqQYAA8WqW9RDgOOMg4DgD+kpKSbAB8goKCRAD+goJEOAD+kpKCAP6QkIAAfIKCklwA/hAQEP4A/gAMAgIC/AD+EChEggD+AgICAP5AIED+AP7AMAz+AHyCgoJ8AP6QkJBgAHyChoN8AP6QmJRiAGSSkpJMAICA/oCAAPwCAgL8AOAYBhjgAPAOMA7wAMYoECjGAMAgHiDAAI6SosIA/4EAwDAMAwCB/wBAgEAAAQEBAQEBEn6SggQABCoqHgD+IiIcABwiIhQAHCIi/gAcKioYACB+oIAAGCUlPgD+ICAeAL4AAQG+AP4IFCIA/AIAPiAeIB4APiAgHgAcIiIcAD8kJBgAGCQkPwA+ECAgABIqKiQAIPwiADwCAjwAIBgGGCAAOAYIBjgAIhQIFCIAIRkGGCAAJioyIgAQboEA5wCBbhAAQIDAQIAAPFqlpUI8"),\nb=atob("BAIEBgYGBgIEBAYGAwUCBQYDBgYGBgYGBgYCAwQGBAUGBgYGBgUFBgYCBgYFBgYGBgYGBgYGBgYGBgUDBQMEBgYFBQUFBQUFBQIEBQMGBQUFBQUFBAUGBgYGBQQCBAYG");exports.add=function(c){c.prototype.setFont6x8=function(){this.setFontCustom(a,32,b,8)}}'),A5.write(0),A6.write(0),pinMode(B3,'input_pulldown'),pinMode(B4,'input_pulldown'),pinMode(B5,'input_pulldown'),pinMode(A8,'input_pulldown'),pinMode(B1,'input_pulldown');var LEFT=B3,MENU=B4,RIGHT=B5,BOT=A8,TOP=B1;var outputStatus=!1;var onTimes=[],offTimes=[];var w1,w2,w3,w4,w5;var wOptions={repeat:!0,debounce:80,edge:'falling'};var in1,in2,in3;var dcf={last:0,status:!1,errCount:0,shutdown:function(){A5.write(0),this.status=!1,this.errCount=0;}};require('Font6x8').add(Graphics);var f=new(require('FlashEEPROM'))();var s,g,rtc;var days=['SUN','MON','TUE','WED','THU','FRI','SAT','ALL'];var upArrow={width:5,height:3,bpp:1,transparent:0,buffer:E.toArrayBuffer(atob('I74='))};var downArrow={width:5,height:3,bpp:1,transparent:0,buffer:E.toArrayBuffer(atob('+4g='))};require('DCF77').connect(A7,function(b,a,c){if(b)dcf.errCount++,dcf.errCount>30&&dcf.shutdown();else if(dcf.last&&a.getTime()-dcf.last.getTime()===60000*(1+dcf.errCount)){rtc.setTime(a.getHours(),a.getMinutes()),rtc.setDate(a.getDate(),a.getMonth(),a.getFullYear()),rtc.setDow(a.getDay()),dcf.last=a,digitalPulse(LED2,1,100),dcf.shutdown();return;}else dcf.last=a,dcf.errCount=0;}),in2=setInterval(syncDcf,30000),in3=setInterval(output,1000),save();