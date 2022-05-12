const ipfsAPI = require('ipfs-api');
const ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'})
const fs = require('fs');
const http = require("https");
const dotenv = require('dotenv');

const dbConfig = require("../config/db.config.js");
const con = dbConfig.con;

exports.store = async (req, res) => {

	con.query("SELECT * FROM user_files where status='Pending'", function (err, result, fields) {
		if (err){
	    	return res.status(500).send({message:"Error!"});
	    }else{

	    	if(result.length === 0){
	    		return res.status(500).send({message:"No files to be uploaded."});
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
					      return res.status(400).send({
					        message: err1
					      });
					    }else{
					    	var sql = "UPDATE user_files SET hash='"+file[0].hash+"', status='Uploaded' WHERE id='"+element.id+"'";
							con.query(sql, async function (err2, result2) {
							    if (err2){
									return res.status(500).send({message:"Error in Files upload."});
								}
							});
					    }
					})
				});
				return res.status(200).send({
			        message: "Files uploaded successfully!"
			    });			
	        }		
	    } 	
	});
};

exports.fetch = async (req, res) => {

	if (!req.body.hash) {
	    return res.status(400).send({
	      message: "Hash can not be empty!"
	    });
	}
	
	var hash = req.body.hash;

  	const options = {
	    "method": "GET",
	    "hostname": "api-us-west1.tatum.io",
	    "port": null,
	    "path": "/v3/ipfs/"+hash,
	    "headers": {
	      "x-api-key": "fe6def09-018c-40d7-95e7-838717108a76"
	    }
  	};

	const req1 = http.request(options, function (res1) {
	    const chunks = [];

	    res1.on("data", function (chunk) {
	      chunks.push(chunk);
	    });

	    res1.on("end", function () {
	      const body = Buffer.concat(chunks);
	      console.log(body.toString());
	      return res.status(200).send({
	        message: "File fetched successfully!",
	        content: body.toString()
	      });
	    });
	});

	req1.end();
};

