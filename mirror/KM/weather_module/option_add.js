const readLine = require('readline');
const f = require('fs');
const weather = require('./weather');
var file = './city.txt';
var rl = readLine.createInterface({
    input : f.createReadStream(file),
    output : process.stdout,
    terminal: false
});
rl.on('line', function (text) {
    var value = text.split(' ');
    console.log(value[1]);
    var city = document.getElementById("city");
    var option = document.createElement("option");
    option.innerText = value[1];
    option.value = value[0];
    city.appendChild(option);
});