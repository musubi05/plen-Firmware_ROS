var bleno = require('bleno');
var rosnodejs = require('rosnodejs');
const std_msgs = rosnodejs.require('std_msgs');

rosnodejs.initNode('bleNode');

const nodehandle = rosnodejs.nh;
const publisher = nodehandle.advertise('/BleToControl', 'std_msgs/String');

var name = 'hoge';
var serviceUUIDs = ['E1F40469-CFE1-43C1-838D-DDBC9DAFDDE6']

bleno.on('stateChange', function(state) {
  console.log('on -> stateChange: ' + state);
  if (state === 'poweredOn') {
    bleno.startAdvertising(name, serviceUUIDs);
  } else {
    bleno.stopAdvertising();
  }
});

bleno.on('advertisingStart', function(error) {
  console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));
  if (!error) {
    bleno.setServices([
      new bleno.PrimaryService( {
        uuid : serviceUUIDs[0],
        characteristics : [
          new bleno.Characteristic( {
            uuid : 'CF70EE7F-2A26-4F62-931F-9087AB12552C',
            properties : ['write','writeWithoutResponse'],
            onWriteRequest : function(data, offset, withoutResponse, callback) {
              const msg = new std_msgs.msg.String();
              msg.data = data;
              publisher.publish(msg);
              console.log('write request: ' + data[0]);
              callback(bleno.Characteristic.RESULT_SUCCESS);
            }
          })
        ]
      })
    ]);
  }
});

bleno.on('advertisingStop', function() {
  console.log('bleno on -> advertisingStop');
});

bleno.on('servicesSet', function() {
  console.log('bleno on -> servicesSet');
});
