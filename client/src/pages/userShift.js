import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { Button, Form } from "react-bootstrap";
import UserContext from "../UserContext";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";

const ShiftPage = () => {
  const [newShift, setNewShift] = useState({ firstName: "", startingCash: "" });
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const toastOptions = {
    autoClose: 900,
    pauseOnHover: true,
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !user) {
      axios
        .get(`https://pos-mh.onrender.com/shifts/getShift`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => console.log(response.data))
        .catch((error) => {
          console.error("Error fetching user data:", error);
          toast.error(
            "Error fetching user data. Please try again later.",
            toastOptions
          );
        });
    }
  }, [user]);

  const handleOpenShift = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No token found.", toastOptions);
        return;
      }

      // Validate starting cash input
      const startingCash = parseFloat(newShift.startingCash);
      if (isNaN(startingCash) || startingCash < 0) {
        toast.error(
          "Please enter a valid non-negative starting cash amount.",
          toastOptions
        );
        return;
      }

      await axios.post(
        "https://pos-mh.onrender.com/shifts/openShift",
        { firstName: user.firstName, startingCash: startingCash },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Shift opened successfully!", toastOptions);
      setNewShift({ firstName: user.firstName, startingCash: "" });
      // Redirect to home page after opening shift
      navigate("/home");
    } catch (error) {
      console.error("Error opening shift:", error);
      toast.error(
        "Failed to open shift. Please try again later.",
        toastOptions
      );
    }
  };

  return (
    <div className="Shift-Form">
      <div className="shift-border">
        <Form className="mt-4 text-center">
          <h4>Open Shift</h4>
          <Form.Group className="mb-2">
            <Form.Label>Starting Cash</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Starting Cash"
              value={newShift.startingCash}
              onChange={(e) =>
                setNewShift({ ...newShift, startingCash: e.target.value })
              }
              required
            />
          </Form.Group>
          <Button variant="primary" onClick={handleOpenShift}>
            Open Shift
          </Button>
          <p>
            Go back to <Link to="/logout">Login page</Link>
          </p>
        </Form>
      </div>
    </div>
  );
};

export default ShiftPage;
