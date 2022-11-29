
let testData = JSON.parse(JSON.stringify({ x: 5, y: 6 })); // json

console.log("type: json - ");
console.log(testData);

let string = JSON.stringify(testData); // json -> string으로 변환

console.log("type: string - ");
console.log(string);

const toBytes = (string) => Array.from(Buffer.from(string, 'utf8')); // byte array로 변환하는 함수

const bytes = toBytes(string); // string -> bytearray로 변환

console.log("type: byteArray - ");
console.log(bytes);

const bytesString = String.fromCharCode(...bytes) // byte -> string으로 변환

console.log("type: string - ");
console.log(bytesString)

let testData1 = JSON.parse(bytesString); // string -> json으로 변환

console.log("type: json - ");
console.log(testData1);