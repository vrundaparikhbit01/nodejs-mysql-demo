const cron = require('node-cron');

const ipfsAPI = require('ipfs-api');
const ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'})
const fs = require('fs');
const http = require("https");
const dotenv = require('dotenv');

dotenv.config();

const dbConfig = require("./app/config/db.config.js");
const con = dbConfig.con;

cron.schedule('* * * * *', function() {
  //console.log('running a task every minute');

  con.query("SELECT * FROM user_files where status='Pending'", function (err, result, fields) {
		if (err){
			console.log('Error!');
	    }else{

	    	if(result.length === 0){
	    		console.log('No files to be uploaded.');
	        }else{

	        	result.forEach(element => {
			  
			    	const fileName = element.file_name;
		  			const filePath =  process.env.USERS_UPLOADED_FILES_PATH + fileName;

					//Reading file from computer
					let testFile = fs.readFileSync(filePath);
					//Creating buffer for ipfs function to add file to the system
					let testBuffer = new Buffer.from(testFile);

					ipfs.files.add(testBuffer, function (err1, file) {
					    if (err1) {
					      console.log('err1');
					    }else{
					    	var sql = "UPDATE user_files SET hash='"+file[0].hash+"', status='Uploaded' WHERE id='"+element.id+"'";
							con.query(sql, async function (err2, result2) {
							    if (err2){
									console.log('Error in Files upload.');
								}
							});
					    }
					})
				});
			    console.log('Files uploaded successfully!');		
	        }		
	    } 	
	});
});