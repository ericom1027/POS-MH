import React, { useState } from "react";
import axios from "axios";
import { Form, Button, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { useParams, useNavigate, Link } from "react-router-dom";

export default function ResetPassword() {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `https://pos-mh.onrender.com/users/reset`,
        {
          token,
          newPassword,
        }
      );

      if (response.status === 200) {
        toast.success(response.data.message);
        navigate("/login");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(error.response.data.message);
      } else {
        toast.error("An error occurred. Please try again.");
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="Reset-Password">
      <div className="Form-resetPass">
        <h2>Reset Password</h2>
        <Form onSubmit={handleResetPassword}>
          <Form.Group controlId="newPassword">
            <Form.Label>New Password:</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter your new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </Form.Group>

          <Button
            variant="success"
            className="mt-2 w-100"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" /> Resetting Password...
              </>
            ) : (
              "Reset Password"
            )}
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
