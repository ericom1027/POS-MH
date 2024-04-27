const express = require("express");
const userController = require("../controllers/user");

const { verify, verifyAdmin } = require("../middlewares/auth");

const router = express.Router();

router.post("/register", userController.registerUser);

router.get("/users", verify, verifyAdmin, userController.getAllUsers);

// Route to update a user
router.put("/users/:userId", verify, verifyAdmin, userController.updateUser);

// Route to delete a user
router.delete("/users/:userId", userController.deleteUser);

// Route to update user role (set as admin)
router.put("/users/:userId/admin", userController.updateUserRole);

router.post("/login", userController.loginUser);

router.get("/details", verify, userController.getProfile);

router.post("/forgot-password", userController.forgotPassword);

router.post("/reset", userController.resetPassword);

// router.get("/reset/:token", userController.resetPasswordForm);

module.exports = router;
