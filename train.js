$(function () {
  $('[data-toggle="tooltip"]').tooltip();
})

function detectBleApi() {
   if (navigator.bluetooth !== undefined){
       $('#ble-api-status').html("Detected!");
       $('#connect').prop('disabled', false);
       $('#disconnect').prop('disabled', false);
   }
}


function go() {

  console.log("go");

  navigator.bluetooth.requestDevice({
      //acceptAllDevices: true
      filters: [
	{
	  //name: "Train Base", // default name is Train Base but it can be probably changed by user so we should look only for service
	  services: ['00001623-1212-efde-1623-785feabcd123']
	}
      ]
    })
  .then(device => {
      //console.log('device', device);
      window.device = device;
      return device.gatt.connect();
    })
  .then(server => {
      //console.log('server', server);
      window.server = server;
      return server.getPrimaryService('00001623-1212-efde-1623-785feabcd123');
    })
  .then(service => {
      //console.log('service', service);
      window.service = service;
      return service.getCharacteristic('00001624-1212-efde-1623-785feabcd123');
    })
  .then(characteristic => {
      //console.log('characteristic', characteristic);
      window.characteristic = characteristic;
      characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
    });
    $('.commands').prop('disabled', false);
    $('#train-status').html("Connected!");

}
function reverse() {
  var speed = $('#speed').val();
  speed *=-1;
  $('#speed').val(speed);
  drive(speed);
}

function shutdown() {
  var data = Int8Array.of(0x04, 0x00, 0x02, 0x01);
  characteristic.writeValue(data);
}

function drive(speed) {
  if(speed > 100) {
    throw new RangeError("Speed can't be higher then 100.")
  }
  if(speed < -100) {
    throw new RangeError("Speed can't be lower then -100.")
  }

  write([0x81, 0x00, 0x00, 0x51, 0x00, speed]);
}
function beep(number) {	
  write([0x41, 0x01, 0x02, 0x01, 0x00, 0x00, 0x00, 0x01]);	
  write([0x81, 0x01, 0x11, 0x51, 0x02, number]);
}
function light(on) {
  if (!on){	  
      write([0x81, 0x51, 0x00, 0x00]);
  }else{
      write([0x08, 0x51, 0x00, 0x05]);
  }
  
}

function handleCharacteristicValueChanged(event) {
  var value = event.target.value;
  console.log('Received', new Int8Array(value.buffer.slice(2)));
}

function write(data) {
  var message = new Int8Array(2 + data.length);
  message[0] = message.length;
  message.set(data, 2);
  characteristic.writeValue(message);
}

// train's response to invalid command: [5, 0, 5, -127, 5] = size, zero (protocol or high byte of message size), message type = error, probably id of command sent to train, some error code?
//
//write([0x81, 0x00, 0x00, 0x51, 0x00, speed]);
//                   ^ odd numbers are invalid and cause error
//
//
/*
 *
 * function test() {
  console.log(i);
  write([i, 0, 0, 0, 0, 0]);
  i++;
  if(i < 256) setTimeout(test, 200); 
}

VM2108:2 1
train.js:55 Received Int8Array(5) [5, 0, 5, 1, 6]
VM2108:2 2
train.js:55 Received Int8Array(5) [5, 0, 5, 2, 6]
VM2108:2 3
train.js:55 Received Int8Array(5) [5, 0, 5, 3, 6]
VM2108:2 5
VM2108:2 33
train.js:55 Received Int8Array(5) [5, 0, 69, 0, 0]
VM2108:2 34
train.js:55 Received Int8Array(17) [17, 0, 68, 0, 0, 0, 84, 32, 77, 79, 84, 0, 0, 0, 0, 0, 0]
VM2108:2 65
train.js:55 Received Int8Array(10) [10, 0, 71, 0, 0, 0, 0, 0, 0, 0]
VM2108:2 66
train.js:55 Received Int8Array(5) [5, 0, 5, 66, 6]
VM2108:2 97
train.js:55 Received Int8Array(5) [5, 0, 5, 97, 6]
*/
