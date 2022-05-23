/*const dbConfig = require("../config/db.config.js");
const con = dbConfig.con;*/
const multer  = require('multer');
const path  = require('path');
/*const rootpath = path.resolve("./");
const ipfsAPI = require('ipfs-api');
const ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'});
const fs = require('fs');
const http = require("https");*/

// Image Upload
const storage = multer.diskStorage({
    destination: (req, file, cb ) => {
      cb(null, 'public/uploads/users/images');
    },
    filename: (req, file, cb) => {

/*    	if (!req.body.userId) {
		    return res.status(400).send({
		      message: "User Id can not be empty!"
		    });
		}*/

    	const newDate = Date.now() + "_" + req.body.userId;
    	const newFileName = newDate + path.extname(file.originalname);
    	const newJsonFileName = newDate + ".json";

    	req.newFileName = newFileName;
    	req.newJsonFileName = newJsonFileName;

    	cb(null, newFileName);
    }
});

var upload = multer({storage: storage});

module.exports = app => {
  var router = require("express").Router();
  const ipfsContoller = require("../controllers/ipfs.controller.js");
  router.post("/store", ipfsContoller.store);
  router.get("/fetch", ipfsContoller.fetch);
  router.post("/user-file-upload", upload.single('image'), ipfsContoller.userFileUpload);

/*  router.post("/user-file-upload", upload.single('image'),  (req, res, next) =>
  	{
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
		const newJsonFileName = "public/uploads/users/metadata/"+req.newJsonFileName;

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
											return res.status(500).send({message:'Error in File upload.'});
										}else{

											var tokenId = getRandomToken();

											var obj = {"name":req.body.name,"description":req.body.description,"tokenid":tokenId,"image":"ipfs://"+hash};

											var json = JSON.stringify(obj);

											fs.writeFile(newJsonFileName, json,"utf8",(err5) => {
											    if (err)
											      console.log(err5);
											    else {
											     //console.log(fs.readFileSync(newJsonFileName, "utf8"));

											      let testFile1 = fs.readFileSync(newJsonFileName);
											
												  let testBuffer1 = new Buffer.from(testFile1);

												  ipfs.files.add(testBuffer1, function (err5, file1) {

												   	var sql3 = "UPDATE user_files SET metadata_hash='"+file1[0].hash+"', metadata_status='Uploaded' WHERE id='"+result2.insertId+"'";

												   	con.query(sql3, async function (err5, result4) {
														    if (err5){
																return res.status(500).send({message:'Error in File upload.'});
															}else{
																return res.status(200).send({message:"File uploaded successfully."});
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
		        	});	
		        }		
		    } 	
		});
	});*/

  app.use('/api/ipfs', router);
};

/*function getRandomToken() {  
  var min = 11111111111;
  var max = 99999999999;
  return Math.floor(
    Math.random() * (max - min + 1) + min
  );
}*/