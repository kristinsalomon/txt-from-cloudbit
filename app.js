require("twilio/lib");
var prompt = require('prompt');
var https = require('https');

// User input properties
var properties = [
	{
		name: 'twilioSid',
		description: 'What is your twilio accountSid?'.cyan,
		required: true
	}, {
		name: 'twilioAuthToken',
		description: 'What is your twilio auth token?'.cyan,
		required: true
	}, {
		name: 'cloudBitDeviceID',
		description: 'What is your cloudBit ID?'.cyan,
		required: true
	}, {
		name: 'cloudBitAuthToken',
		description: 'What is your cloudBit auth token?'.cyan,
		required: true
	}, {
		name: 'phoneNumber',
		description: 'What phone number do you want to send a message to?'.cyan,
		required: true
	}
];

// Set custom properties
prompt.message = "";
prompt.delimiter = "";

// Start prompt
prompt.start();

// Get properties from user
prompt.get(properties, function (err, data) {
	console.log('Input Received.');
	
	// Twilio Credentials
	var client = require('twilio')(data.twilioSid, data.twilioAuthToken);
	
	// cloudBit Credentials
	var cloudBitOptions = {
		hostname: 'api-http.littlebitscloud.cc',
		headers: {
			'Authorization': 'Bearer ' + data.cloudBitAuthToken
		},
		path: '/v3/devices/' + data.cloudBitDeviceID + '/input',
		method: 'GET'
		};
	
	textFromCloudBit(client, data.phoneNumber, cloudBitOptions);
	}
);

function textFromCloudBit(client, phoneNumber, cloudBitOptions){
	// Make a request to GET input values from cloudBit
	var req = https.request( cloudBitOptions, function(cloudResult) {
		cloudResult.setEncoding('utf8');
		cloudResult.on('data', function (data) {
			if( parse_data(data) > 90) { sendText(client, phoneNumber); }
		});

	});

	req.on('error', function(e) {
		console.log('problem with request: ' + e.message)
	});

	req.end();
}

function sendText(client, phoneNumber){
	client.messages.create({   
					body: "hi from the cloud!", 
					//mediaUrl: "http://eecs.wsu.edu/~slong/cpts111/labs/cat.bmp",  
					to: phoneNumber,
					from: "+19084184750"
				}, function(err, message) { 
					//process.stdout.write(message.sid);
					console.log('Message sent!');
				});
}

function parse_data( data ) {
	return JSON.parse( data.replace('data:','') ).percent
}

