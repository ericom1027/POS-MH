import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { Button, Form } from "react-bootstrap";
import UserContext from "../UserContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Sidenav from "../components/Sidenav";

const CloseShift = () => {
  const [closingShift, setClosingShift] = useState({ endingCash: "" });
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
        .get(`https://pos-cbfa.onrender.com/shifts/getShift`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => console.log(response.data))
        .catch((error) => toast.error("Error fetching user data:", error));
    }
  }, [user]);

  const handleCloseShift = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No token found.", toastOptions);
        return;
      }

      await axios.put(
        "https://pos-cbfa.onrender.com/shifts/closeShift",
        { firstName: user.firstName, endingCash: closingShift.endingCash },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Shift closed successfully!", toastOptions);
      setClosingShift({ endingCash: "" });
      // Redirect to home page after closing shift
      navigate("/logout");
    } catch (error) {
      toast.error(
        "You need to open a shift before closing it:",
        error,
        toastOptions
      );
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Sidenav />
      <div className="Close-Form">
        <div className="Close-border">
          <Form className="mt-4 text-center">
            <h4>Close Shift</h4>
            <Form.Group className="mb-2">
              <Form.Label>Ending Cash</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Ending Cash"
                value={closingShift.endingCash}
                onChange={(e) =>
                  setClosingShift({
                    ...closingShift,
                    endingCash: e.target.value,
                  })
                }
              />
            </Form.Group>

            <Button variant="primary" onClick={handleCloseShift}>
              Close Shift
            </Button>
          </Form>
        </div>
      </div>
    </Box>
  );
};

export default CloseShift;
