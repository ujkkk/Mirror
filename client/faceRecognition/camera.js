// importing OpenCv library
const cv = require('opencv4nodejs');
const path = require('path')


// We will now create a video capture object.
const wCap = new cv.VideoCapture(0);

//Setting the height and width of object
wCap.set(cv.CAP_PROP_FRAME_WIDTH, 300);
wCap.set(cv.CAP_PROP_FRAME_HEIGHT, 300);

// // Creating get request simple route
// app.get('/', (req, res)=>{
// 	res.sendFile(path.join(__dirname, 'index.html'));
// });

// // Using setInterval to read the image every one second.
// setInterval(()=>{

// 	// Reading image from video capture device
// 	const frame = wCap.read();
	
// 	// Encoding the image with base64.
// 	const image = cv.imencode('.jpg', frame).toString('base64');
// 	io.emit('image', image);

// }, 1000)

