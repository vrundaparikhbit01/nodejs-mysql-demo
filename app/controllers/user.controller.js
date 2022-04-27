const bcrypt = require('bcryptjs');
const emailCheck = require('email-check');
const nodemailer = require('nodemailer');
const dbConfig = require("../config/db.config.js");
const con = dbConfig.con;

exports.register = async (req, res) => {
	  // Validate request
	  if (!req.body.name) {
	    return res.status(400).send({
	      message: "Name can not be empty!"
	    });
	  }
	  if (!req.body.email) {
	    return res.status(400).send({
	      message: "Email can not be empty!"
	    });
	  }
	  if (!req.body.password) {
	    return res.status(400).send({
	      message: "Password can not be empty!"
	    });
	  }

	  emailCheck(req.body.email)
	  	.then(async function (result) {
		  	if(!result){
		  		return res.status(500).send({message:"Email is not available."});
		  	}else{
		  		//Check email
		  		con.query("SELECT * FROM users where email='"+req.body.email+"'", async function (err, result, fields) {
			    	if (err){
			    		return res.status(500).send({message:"Error in User Registration."});
			    	}else{
			    		if(result.length === 0){
			    			//Encrypt user password
			  				encryptedPassword = await bcrypt.hash(req.body.password, 10);

			  				//Create User	
				    		var sql = "INSERT INTO users (name, email, password) VALUES ('"+req.body.name+"', '"+req.body.email+"', '"+encryptedPassword+"')";
							con.query(sql,async function (err2, result2) {
							    if (err){
			    					return res.status(500).send({message:"Error in User Registration."});
			    				}else{
							    	res.status(200).send({message:"User registered successfully."});
			    				}	
							});
				    	}else{
				    		return res.status(500).send({message:"Email already exists."});
				    	}
			    	}
			  	});
			}
		})
	  	.catch(function (err) {
		    if (err.message === 'refuse') {
		      return res.status(500).send({message:err.message});
		    } else {
		      return res.status(500).send({message:err.message});
		    }
	  	});
};

exports.getOtp = async (req, res) => {

	// Validate request
	if (!req.body.email) {
	    return res.status(400).send({
	      message: "Email can not be empty!"
	    });
	}

  	con.query("SELECT * FROM users where email='"+req.body.email+"'", function (err, result, fields) {
	    	if (err){
	    		return res.status(500).send({message:"Error!"});
	    	}else{
	    		if(result.length === 1){

	    			//Generate Otp 
	    			var otp = getRandomNumber();
	    			var otpTime = getOtpExpiryTime(5);

	  				//Update User	
		    		var sql = "UPDATE users SET otp='"+otp+"', otp_expire_time='"+otpTime+"' WHERE email='"+req.body.email+"'";
					con.query(sql,async function (err2, result2) {
					    if (err){
	    					return res.status(500).send({message:"Error in Otp Generation."});
	    				}else{

	    					let transporter = nodemailer.createTransport({
						        host: process.env.MAIL_HOST,
					            port: process.env.MAIL_PORT,
					            auth: {
					                 user: process.env.MAIL_USERNAME,
					                 pass: process.env.MAIL_PASSWORD
					            }
						    });

						    mailOptions = {
						        from: process.env.MAIL_FROM_ADDRESS,
						        to: req.body.email,
						        subject: "Node App Otp",
						        text: "Your Node App Otp is: "+otp
						    };

						    transporter.sendMail(mailOptions, function(error, info){
						        if (error) {
						          res.status(500).send({
						            message:
						              error || "Some error occurred while sending otp to User."
						          });
						        } else {
						          res.status(200).send({message:"Otp generated and sent successfully."});
						        }
						    });
	    				}	
					});
		    	}else{
		    		return res.status(500).send({message:"User doesn't exist."});
		    	}
	    	}
	});
};

exports.verifyOtp = (req, res) => {

	// Validate request
	if (!req.body.email) {
	    return res.status(400).send({
	      message: "Email can not be empty!"
	    });
	}
	if (!req.body.otp) {
	    return res.status(400).send({
	      message: "Otp can not be empty!"
	    });
	}

	con.query("SELECT * FROM users where email='"+req.body.email+"'", function (err, result, fields) {
	    	if (err){
	    		return res.status(500).send({message:"Error!"});
	    	}else{
	    		if(result.length === 1){

	  				//Check Otp	
		    		var sql = "SELECT * FROM users WHERE email='"+req.body.email+"' AND otp='"+req.body.otp+"'";
					con.query(sql, function (err2, result2) {
					    if (err){
	    					return res.status(500).send({message:"Error in verifying Otp."});
	    				}else{
	    					var current_time = getCurrentTime();
	    					if(result2.length === 1 && current_time <= result2[0].otp_expire_time){
						    	res.status(200).send({message:"Otp verified successfully.", "user" : result2});
							}else{
								return res.status(500).send({message:"Otp expired / doesn't match."});
							}
	    				}	
					});
		    	}else{
		    		return res.status(500).send({message:"User doesn't exist."});
		    	}
	    	}
	});
}	

function getRandomNumber() {  
  var min = 1111;
  var max = 9999;
  return Math.floor(
    Math.random() * (max - min + 1) + min
  );
}

function getCurrentTime() {  
	var currentDate = new Date();
	return currentDate.getTime();
}

function getOtpExpiryTime(minutesToAdd) {  
	var currentDate = new Date();
	var futureDate = new Date(currentDate.getTime() + minutesToAdd*60000);
	return futureDate.getTime();
}