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
  const [expectedCash, setExpectedCash] = useState(null);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [selectedDate] = useState(new Date());
  const [dailySalesPerCashier, setDailySalesPerCashier] = useState({});
  const toastOptions = {
    autoClose: 900,
    pauseOnHover: true,
  };

  useEffect(() => {
    const fetchDailySales = async () => {
      try {
        const timestamp = selectedDate.getTime();
        const response = await axios.get(
          "https://pos-mh.onrender.com/bills/daily-sales",
          {
            params: {
              createdAt: timestamp,
            },
          }
        );

        const salesByCashier = {};
        response.data.forEach((transaction) => {
          const { cashierName, totalAmount } = transaction;
          salesByCashier[cashierName] =
            (salesByCashier[cashierName] || 0) + totalAmount;
        });

        setDailySalesPerCashier(salesByCashier);
      } catch (error) {
        console.error("Error fetching daily sales:", error);
        toast.error(
          "Error fetching daily sales. Please try again later.",
          toastOptions
        );
      }
    };

    fetchDailySales();
  }, [selectedDate]);

  useEffect(() => {
    if (user.firstName && dailySalesPerCashier[user.firstName] !== undefined) {
      const expectedCashAmount = dailySalesPerCashier[user.firstName];
      setExpectedCash(expectedCashAmount);
    }
  }, [dailySalesPerCashier, user.firstName]);

  const handleCloseShift = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No token found.", toastOptions);
        return;
      }

      if (
        closingShift.endingCash === "" ||
        isNaN(parseFloat(closingShift.endingCash))
      ) {
        toast.error("Please enter a valid ending cash amount.", toastOptions);
        return;
      }

      const shiftData = {
        firstName: user.firstName,
        lastName: user.lastName,
        startingCash: user.startingCash,
        endingCash: parseFloat(closingShift.endingCash).toFixed(2),
        expectedCashAmount:
          expectedCash !== null ? expectedCash.toFixed(2) : "",
      };

      await axios.put(
        "https://pos-mh.onrender.com/shifts/closeShift",
        shiftData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Shift closed successfully!", toastOptions);
      setClosingShift({ endingCash: "" });
      navigate("/logout");
    } catch (error) {
      console.error("Error closing shift:", error);
      toast.error(
        "Failed to close shift. Please try again later.",
        toastOptions
      );
    }
  };

  const handleEndingCashChange = (e) => {
    const endingCashValue = e.target.value;
    setClosingShift({ endingCash: endingCashValue });
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Sidenav />
      <div className="Close-Form">
        <div className="Close-border">
          <Form className="mt-4 text-center">
            <h4>Close Shift</h4>
            <Form.Group className="mb-2 hidden">
              {/* <Form.Label>{`${user.firstName} ${user.lastName} - Expected Cash Amount`}</Form.Label> */}
              <Form.Control
                type="text"
                readOnly
                value={expectedCash !== null ? expectedCash.toFixed(2) : ""}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>
                Ending Cash<span className="required">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Ending Cash"
                value={closingShift.endingCash}
                onChange={handleEndingCashChange}
              />
            </Form.Group>

            <Button variant="primary" onClick={handleCloseShift}>
              Confirm Close Shift
            </Button>
          </Form>
        </div>
      </div>
    </Box>
  );
};

export default CloseShift;
