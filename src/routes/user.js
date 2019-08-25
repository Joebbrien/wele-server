const express = require("express");
const bodyParsar = require("body-parser");
const user = require("../models/user");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const mail = require("../utils/mailer");
const randomGen = require("../utils/random");

const app = express.Router();

const upload = multer({
  dest: "public/profileImage",
  limits: {
    fileSize: 1000000
  }
});

app.get("/notify", async (req, res) => {
  //notify user with an email
  //try {
  const email = "joebbrian@bongohive.co.zm";
  const text =
    "Your account has been created. Complete your signup by following this link https://ecr.net/complete/registration";
  const subject = "ECR PROCUREMENT SYSTEM ACCESS";
  const notification = await mail.sendMailWithGrid(email, subject, text);
  if (!notification) {
    res.status(200).send("Email sent to " + email);
  } else {
    res.status(500).send("Something went wrong");
  }
  //   } catch (e) {
  //     res.status(500).send(e.message);
  //   }
});

app.post("/upload/profile/:id", upload.single("upload"), async (req, res) => {
  //upload a profile picture
  try {
    const id = req.params.id;
    const fileNameActual = req.file.originalname;
    const filePathActual = req.file.path;
    const fileNameSys = req.file.filename;
    const findUser = await user.findById({ _id: id }).exec();
    if (findUser) {
      findUser.userProfilePicLink = filePathActual;
      findUser.userProfilePicName = fileNameSys;
      findUser.userProfilePicActualName = fileNameActual;

      await findUser.save();
      if (!findUser) {
        res.status(500).send("Something went wrong");
      } else {
        res.status(200).send("Profile picture uploaded successfully");
      }
    } else {
      res.status(404).send("Unable to find user");
    }
  } catch (e) {
    res.status(200).send("something went wrong");
  }
});

app.post("/create", async (req, res) => {
  //create a new user
  try {
    const newUser = req.body;
    //console.log(newUser);
    const createUser = new user(req.body);
    await createUser.save();
    if (!createUser) {
      console.log(createUser);
      res.status(500).send(createUser);
    } else {
      const email = createUser.userEmail;
      const text =
        "Your account has been added to ECR Procurement system by Thandie. Complete your signup by following this link https://ecr.net/complete/registration";
      const subject = "ECR PROCUREMENT SYSTEM ACCESS";
      const notification = await mail.sendMailWithGrid(email, subject, text);
      if (!notification) {
        res
          .status(201)
          .send("user has been saved and access email sent to " + email);
      } else {
        res
          .status(500)
          .send("Error occured when trying to send access email to user");
      }
    }
  } catch (e) {
    console.log(e.message);
    console.log("error occured");
    res.status(500).send(e.message);
  }
});

app.get("/outOfOffice/:id", async (req, res) => {
  //set user to be out of office
  try {
    const token = req.params.id;
    console.log(req.body);
    console.log(token);
    const findUser = await user.findById({ _id: token }).exec();

    if (findUser) {
      //user is found
      findUser.isInOffice = req.body.inOffice;
      await findUser.save();
      if (!findUser) {
        res.status(500).send("Unable to update out of office status");
      } else {
        res.status(200).send("Office status is set to " + req.body.inOffice);
      }
    } else {
      // user not found
      res.status(500).send("wrong credentials");
    }
  } catch (e) {
    //something has gone wrong
    res.status(500).send("Something has gone wrong");
  }
});

app.get("/list", async (req, res) => {
  //get a list of all application users
  try {
    const users = await user.find({}).exec();
    if (!users) {
      res.status(200).send("No users found");
    } else {
      res.status(201).send(users);
    }
  } catch (e) {
    res.status(500).send(e.message);
  }
});

app.patch("/completeSignup/:id", async (req, res) => {
  //complete user sign up with a token that was
  try {
    const token = req.params.id;
    const updates = Object.keys(req.body);

    const findUser = await user.findById({ _id: token }).exec();
    if (!findUser) {
      res.status(500).send("user not found");
    } else {
      //update user password
      //check is user has already completed sign up
      if (findUser.isActive === true) {
        //user completed sign up
        res.status(200).send("You already completed signing up");
      } else {
        //complete user signup
        updates.forEach(update => (findUser[update] = req.body[update]));
        findUser.isActive = true;
        findUser.isInOffice = true;
        await findUser.save();
        if (!findUser) {
          res.status(500).send("Unable to update user");
        } else {
          res.status(200).send(findUser);
        }
      }
    }
  } catch (e) {
    res.status(500).send(e.message);
  }
});
app.patch("/resetPassword/:email", async (req, res) => {
  //reset user password when they have same password reset key
  try {
    const email = req.params.email;
    const findUser = await user.findOne({ userEmail: email }).exec();
    if (!findUser) {
      //user not found with that email address
      res.status(404).send("user not found");
    } else {
      //user has been found
      const token = req.body.token;
      if (findUser.resetPasswordToken === token) {
        //reset password
        findUser.userPassword = req.body.newPassword;
        findUser.resetPasswordToken = "NUll";
        await findUser.save();
        if (!findUser) {
          //unable to save
          res.status(500).send("Something has gone wrong");
        } else {
          res.status(201).send("Password has been reset successfully");
        }
      } else {
        //wrong token
        res.status(404).send("wrong credentials");
      }
    }
  } catch (e) {
    //something has gone wrong
  }
});

app.patch("/forgotPassword/:email", async (req, res) => {
  //generate a link for user to reset password and sent to email
  //const secretToken = "randomkey12322";
  try {
    const email = req.params.email;
    const findUser = await user.findOne({ userEmail: email }).exec();
    if (!findUser) {
      res.status(404).send("user not found");
    } else {
      const secretToken = await randomGen.generateRandom(12);
      console.log(secretToken);
      findUser["resetPasswordToken"] = secretToken;
      console.log(findUser);
      await findUser.save();
      if (!findUser) {
        res.status(500).send("unable to send password reset link");
      } else {
        const email = findUser.userEmail;
        const text =
          "Your password reset-key is " +
          secretToken +
          " ,complete password reset process by following this link https://ecr.net/resetpassword/ ";
        const subject = "ECR PROCUREMENT PASSWORD RESET-KEY";
        const notification = await mail.sendMailWithGrid(email, subject, text);
        if (!notification) {
          res
            .status(201)
            .send("Password reset key has been sent to you email addess");
        } else {
          res
            .status(500)
            .send("Error occured when trying to send access email to user");
        }
      }
    }
  } catch (e) {
    res.status(500).send(e.message);
  }
});

app.post("/login", async (req, res) => {
  //login user to the system
  try {
    const email = req.body.email;
    const password = req.body.password;

    const findUser = await user.findOne({ userEmail: email }).exec();
    if (!findUser) {
      //user not found with that email
      res.status(404).send("wrong credentials");
    } else {
      const isMatch = await bcrypt.compare(password, findUser.userPassword);
      if (isMatch === true) {
        res.status(201).send(findUser);
      } else {
        // user password is not correct
        res.status(404).send("wrong credentials");
      }
    }
  } catch (e) {
    //error occured when login in user
    res.status(500).send(e.message);
  }
});

app.patch("/update/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updates = Object.keys(req.body);
    const findUser = await user.findById({ _id: id }).exec();

    updates.forEach(update => (findUser[update] = req.body[update]));
    await findUser.save();

    if (!findUser) {
      res.status(500).send("Unable to update user");
    } else {
      res.status(200).send("user was updated successfully");
    }
  } catch (e) {
    res.status(500).send("something was wrong");
  }
}); //end user route

module.exports = app;
