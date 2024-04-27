const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const auth = require("../middlewares/auth");

const emailUsername = process.env.EMAIL_USERNAME;
const emailPassword = process.env.EMAIL_PASSWORD;
const emailHost = process.env.EMAIL_HOST;
const emailPort = process.env.EMAIL_PORT;

module.exports.registerUser = (req, res) => {
  if (!req.body.email.includes("@")) {
    return res.status(400).send({ error: "Email invalid" });
  } else if (!req.body.mobileNo || req.body.mobileNo.length !== 11) {
    // Add a check for the existence of req.body.mobileNo
    return res.status(400).send({ error: "Mobile number invalid" });
  } else if (req.body.password.length < 8) {
    return res
      .status(400)
      .send({ error: "Password must be at least 8 characters" });
  } else {
    let newUser = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      mobileNo: req.body.mobileNo,
      password: bcrypt.hashSync(req.body.password, 10),
      isAdmin: req.body.isAdmin || false,
    });

    return newUser
      .save()
      .then((result) =>
        res.status(201).send({ message: "Registered Successfully" })
      )
      .catch((err) => {
        console.error("Error in saving: ", err);
        return res.status(500).send({ error: "Error in save" });
      });
  }
};

// Get all users
module.exports.getAllUsers = (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({
      error: "Unauthorized: Only admin users can access this endpoint",
    });
  }

  User.find()
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((err) => {
      console.error("Error in retrieving users:", err);

      res
        .status(500)
        .json({ error: "Internal Server Error: Unable to retrieve users" });
    });
};

// Update user details
module.exports.updateUser = async (req, res) => {
  const userId = req.params.userId;
  const updateData = req.body;

  try {
    console.log("Received update data:", updateData);

    if (updateData.password) {
      // Hash the new password
      const hashedPassword = await bcrypt.hash(updateData.password, 10);
      updateData.password = hashedPassword;
    }

    let editUser = {
      firstName: updateData.firstName,
      lastName: updateData.lastName,
      email: updateData.email,
      mobileNo: updateData.mobileNo,
      password: updateData.password,
      isAdmin: updateData.isAdmin || false,
    };

    console.log("Prepared edited user data:", editUser);

    const updatedUser = await User.findByIdAndUpdate(userId, editUser, {
      new: true,
    });

    console.log("Updated user:", updatedUser);

    if (!updatedUser) {
      console.log("User not found.");
      return res.status(404).send({ error: "User not found" });
    }

    console.log("User updated successfully.");
    res
      .status(200)
      .send({ message: "User updated successfully", user: updatedUser });
  } catch (err) {
    console.error("Error in updating user:", err);
    res.status(500).send({ error: "Error in updating user" });
  }
};

// Delete a user
module.exports.deleteUser = (req, res) => {
  const userId = req.params.userId;

  User.findByIdAndDelete(userId)
    .then((deletedUser) => {
      if (!deletedUser) {
        return res.status(404).send({ error: "User not found" });
      }
      res.status(200).send({ message: "User deleted successfully" });
    })
    .catch((err) => res.status(500).send({ error: "Error in deleting user" }));
};

// Update user role (set as admin)
module.exports.updateUserRole = (req, res) => {
  const userId = req.params.userId;

  User.findByIdAndUpdate(userId, { isAdmin: true }, { new: true })
    .then((updatedUser) => {
      if (!updatedUser) {
        return res.status(404).send({ error: "User not found" });
      }
      res
        .status(200)
        .send({ message: "User role updated to admin", user: updatedUser });
    })
    .catch((err) =>
      res.status(500).send({ error: "Error in updating user role" })
    );
};

module.exports.loginUser = (req, res) => {
  if (req.body.email.includes("@")) {
    return User.findOne({ email: req.body.email })
      .then((result) => {
        // User does not exist
        if (result == null) {
          return res.status(404).send({ error: "No Email Found" });
        } else {
          const isPasswordCorrect = bcrypt.compareSync(
            req.body.password,
            result.password
          );
          if (isPasswordCorrect) {
            return res
              .status(200)
              .send({ access: auth.createAccessToken(result) });
            // Password does not match
          } else {
            return res
              .status(401)
              .send({ message: "Email and password do not match" });
          }
        }
      })
      .catch((err) => {
        console.log("Error in find: ", err);
        res.status(500).send({ error: "Error in find" });
      });
  } else {
    return res.status(400).send({ error: "Invalid Email" });
  }
};

module.exports.getProfile = (req, res) => {
  const userId = req.user.id;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(404).send({ error: "User not found" });
      }

      user.password = undefined;

      return res.status(200).send({ user });
    })
    .catch((err) => {
      console.error("Error in fetching user profile", err);
      return res.status(500).send({ error: "Failed to fetch user profile" });
    });
};

// [SECTION] Forgot password
module.exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetURL = `http://localhost:3000/reset/${resetToken}`;

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const transporter = nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      auth: {
        user: emailUsername,
        pass: emailPassword,
      },
    });

    const mailOptions = {
      from: `Support <tribulakay@gmail.com>`,
      to: email,
      subject: "Password Reset",
      text:
        `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
        `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
        `${resetURL}\n\n` +
        `If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Password reset email sent" }); // Sending response once
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// SECTION Reset Password
module.exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Find user by reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10); // 10 is the saltRounds

    // Set new hashed password and clear reset token fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// module.exports.resetPasswordForm = async (req, res) => {
//   try {
//     const { token } = req.params;

//     res.json({ token });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };
