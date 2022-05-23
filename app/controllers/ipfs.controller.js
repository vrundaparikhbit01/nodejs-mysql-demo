const ipfsAPI = require('ipfs-api');
const ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'})
const fs = require('fs');
const http = require("https");
const dotenv = require('dotenv');

const dbConfig = require("../config/db.config.js");
const con = dbConfig.con;

const path = require('path');
const rootpath = path.resolve("./");

exports.userFileUpload = async (req, res, next) => {
	if (!req.body.userId) {
	    return res.status(400).send({
	      message: "User Id can not be empty!"
	    });
	}
	if (!req.file) {
	    return res.status(400).send({
	      message: "Image can not be empty!"
	    });
	}
	if (!req.body.name) {
	    return res.status(400).send({
	      message: "Name can not be empty!"
	    });
	}
	if (!req.body.description) {
	    return res.status(400).send({
	      message: "Description can not be empty!"
	    });
	}

	const newFilePath = "public/uploads/users/images/"+req.newFileName;
	//const newJsonFileName = "public/uploads/users/metadata/"+req.newJsonFileName;
	const newJsonFileName = "public/uploads/users/metadata/metadata.json";

	con.query("SELECT * FROM users where id='"+req.body.userId+"'", function (err, result, fields) {
		if (err){
	    	return res.status(500).send({message:"Error!"});
	    }else{
	    	if(result.length === 0){
	    		return res.status(500).send({message:"User doesn't exist."});
	        }else{
	        	var sql = "INSERT INTO user_files (user_id, file_name) VALUES ('"+req.body.userId+"','"+newFilePath+"')";
	        	con.query(sql,async function (err2, result2) {
	        		if (err2){
    					return res.status(500).send({message:"Error!!"});
    				}else{

    					//Ipfs upload
			  			const filePath =  rootpath +'\\'+newFilePath;

						//Reading file from computer
						let testFile = fs.readFileSync(filePath);
						//Creating buffer for ipfs function to add file to the system
						let testBuffer = new Buffer.from(testFile);

						ipfs.files.add(testBuffer, function (err3, file) {
						    if (err3) {
						      return res.status(500).send({message:err3});
						    }else{

						    	var hash = file[0].hash;
						    	var sql2 = "UPDATE user_files SET hash='"+hash+"', status='Uploaded' WHERE id='"+result2.insertId+"'";
								con.query(sql2, async function (err4, result3) {
								    if (err4){
										return res.status(500).send({message:'Error in File upload1.'});
									}else{

										var tokenId = getRandomToken();

										fs.readFile(newJsonFileName,"utf8",function (err5, data) {

										    var obj = JSON.parse(data);
										
											obj.push({"name":req.body.name,"description":req.body.description,"tokenid":tokenId,"image":"ipfs://"+hash});
										
											var json = JSON.stringify(obj);

											fs.writeFile(newJsonFileName, json,"utf8",(err6) => {
											    if (err6)
											      return res.status(500).send({message:'Error in File upload2.'});
											    else {
											     //console.log(fs.readFileSync(newJsonFileName, "utf8"));

											      let testFile1 = fs.readFileSync(newJsonFileName);
											
												  let testBuffer1 = new Buffer.from(testFile1);

												  ipfs.files.add(testBuffer1, function (err7, file1) {

												   	var sql3 = "UPDATE user_files SET name='"+req.body.name+"', description='"+req.body.description+"', token_id='"+tokenId+"', metadata_hash='"+file1[0].hash+"', metadata_status='Uploaded' WHERE id='"+result2.insertId+"'";

												   	con.query(sql3, async function (err8, result4) {
														    if (err8){
																return res.status(500).send({message:'Error in File upload2.'});
															}else{
																return res.status(200).send({message:"File uploaded successfully."});
															}
														});			
													});	
											    }
											});		
										});   
									}
								});
						    }
						});
    				}		
	        	});	
	        }		
	    } 	
	});
};

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
		  			const filePath =  rootpath +'\\'+fileName;

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

    ipfs.files.get(hash, function (err, files) {
        files.forEach((file) => {
          //console.log(file.path);
          //console.log(file.content.toString('utf8'));
          return res.status(200).send({
	        message: "File fetched successfully!",
	        content: file.content.toString('utf8')
	      });
        })
    });
};

function getRandomToken() {  
  var min = 11111111111;
  var max = 99999999999;
  return Math.floor(
    Math.random() * (max - min + 1) + min
  );
}

