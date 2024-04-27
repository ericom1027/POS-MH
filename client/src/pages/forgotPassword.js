import React, { useState } from "react";
import axios from "axios";
import { Form, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleResetPassword = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "https://pos-mh.onrender.com/users/forgot-password",
        { email },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        toast.success("Password reset email sent successfully");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      console.error(error);
    }
  };

  return (
    <div className="Forgot-Password">
      <div className="Form-resetPass">
        <h2>Forgot Password</h2>
        <Form onSubmit={handleResetPassword}>
          <Form.Group controlId="email">
            <Form.Label>Email:</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Button variant="success" className="mt-2 w-100" type="submit">
            Reset Password
          </Button>
          <p>
            Go back to{" "}
            <Link className="link" to="/login">
              Login page
            </Link>
          </p>
        </Form>
      </div>
    </div>
  );
}
