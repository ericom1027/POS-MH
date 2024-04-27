import { useState, useEffect, useContext } from "react";
import { Form, Button } from "react-bootstrap";
import UserContext from "../UserContext";
import { Navigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import logo from "../assets/logo.png";
import { toast } from "react-toastify";
import axios from "axios";

export default function Login() {
  const { user, setUser } = useContext(UserContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(true);

  const toastOptions = {
    autoClose: 1500,
    pauseOnHover: true,
  };

  function authenticate(e) {
    e.preventDefault();

    axios
      .post(`https://pos-mh.onrender.com/users/login`, {
        email: email,
        password: password,
      })
      .then((res) => {
        const data = res.data;
        if (typeof data.access !== "undefined") {
          localStorage.setItem("token", data.access);
          // console.log("Token set after login:", data.access);
          retrieveUserDetails(data.access);
        } else {
          toast.info("Authentication failed");
        }
      })
      .catch((error) => {
        console.error("Login Error:", error);
        toast.error("Invalid username or password");
      });

    setEmail("");
    setPassword("");
  }

  const retrieveUserDetails = (token) => {
    axios
      .get(`https://pos-mh.onrender.com/users/details`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setUser({
          id: res.data.user._id,
          isAdmin: res.data.user.isAdmin,
          firstName: res.data.user.firstName,
          lastName: res.data.user.lastName,
        });
        toast.success(`Welcome: ${res.data.user.firstName}`, toastOptions);
      })
      .catch((error) => {
        console.error("Retrieve User Details Error:", error);
        toast.error("An error occurred while retrieving user details");
      });
  };

  useEffect(() => {
    if (email !== "" && password !== "") {
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  }, [email, password]);

  const [showPassword, setShowPassword] = useState(false);

  return user.id !== null ? (
    user.isAdmin ? (
      <Navigate to="/dashboard" />
    ) : (
      <Navigate to="/userShift" />
      // <Navigate to="/home" />
    )
  ) : (
    <div className="login">
      <div className="login-form">
        <img src={logo} alt="logo" className="logo" />
        <Form onSubmit={(e) => authenticate(e)}>
          <Form.Group controlId="email">
            <Form.Label>Email</Form.Label>
            <div className="input-group">
              <Form.Control
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </Form.Group>

          <Form.Group controlId="password" className="mb-3">
            <Form.Label>Password</Form.Label>
            <div className="input-group">
              <Form.Control
                type={showPassword ? "text" : "password"}
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="input-group-append">
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye className="eye" />}
                </Button>
              </div>
            </div>
          </Form.Group>
          <div className="d-flex justify-content-center">
            {isActive ? (
              <Button variant="success" type="submit" className="btn-login">
                Sign in
              </Button>
            ) : (
              <Button
                variant="success"
                type="submit"
                className="btn-login"
                disabled
              >
                Sign in
              </Button>
            )}
          </div>
          <p>
            <Link className="link" to="/forgot-password">
              Forgot password?
            </Link>
          </p>
        </Form>
      </div>
    </div>
  );
}
