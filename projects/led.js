var on = 0;
setWatch(function(e){
  setTimeout(function(){
      on=!on;
      digitalWrite(LED2,on);
  }, 500);
}, BTN, {repeat:true, debounce:50, edge:'both'});
