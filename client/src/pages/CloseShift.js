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
  const [selectedDate] = useState(new Date());
  const [dailySalesPerCashier, setDailySalesPerCashier] = useState({});
  const [difference, setDifference] = useState("");
  const toastOptions = {
    autoClose: 900,
    pauseOnHover: true,
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const fetchDailySales = async () => {
      try {
        const formattedDate = formatDate(selectedDate);
        const response = await axios.get(
          `https://pos-mh.onrender.com/bills/dailyShift?date=${formattedDate}`
        );

        const { cashierSales } = response.data;
        console.log(cashierSales); // Log the data
        setDailySalesPerCashier(cashierSales);
      } catch (error) {
        console.error("Error fetching daily sales:", error);
      }
    };

    fetchDailySales();
  }, [selectedDate]);

  useEffect(() => {
    const expectedCashAmount =
      dailySalesPerCashier[user.firstName] !== undefined
        ? dailySalesPerCashier[user.firstName]
        : 0;
    const diff = expectedCashAmount - parseFloat(closingShift.endingCash || 0);
    setDifference(diff.toFixed(2));
  }, [
    closingShift.endingCash,
    dailySalesPerCashier,
    user.firstName,
    difference,
  ]);

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

      const expectedCashAmount =
        dailySalesPerCashier[user.firstName] !== undefined
          ? dailySalesPerCashier[user.firstName]
          : 0;

      const difference =
        expectedCashAmount - parseFloat(closingShift.endingCash);

      const shiftData = {
        _id: user.shiftId,
        firstName: user.firstName,
        lastName: user.lastName,
        startingCash: user.startingCash,
        endingCash: parseFloat(closingShift.endingCash).toFixed(2),
        expectedCashAmount: parseFloat(expectedCashAmount).toFixed(2),
        difference: difference.toFixed(2),
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
    setClosingShift((prevState) => ({
      ...prevState,
      endingCash: endingCashValue,
    }));

    const expectedCashAmount =
      dailySalesPerCashier[user.firstName] !== undefined
        ? dailySalesPerCashier[user.firstName]
        : 0;
    const difference = expectedCashAmount - parseFloat(endingCashValue || 0);
    setDifference(difference.toFixed(2));
  };

  const expectedCash =
    user && dailySalesPerCashier[user.firstName]
      ? dailySalesPerCashier[user.firstName]
      : null;

  return (
    <Box sx={{ display: "flex" }}>
      <Sidenav />
      <div className="Close-Form">
        <div className="Close-border">
          <Form className="mt-4 text-center">
            <h4>Close Shift</h4>
            <Form.Group className="mb-2 hidden">
              <Form.Control
                type="text"
                readOnly
                value={expectedCash !== null ? expectedCash.toFixed(2) : ""}
              />
            </Form.Group>

            <Form.Group className="mb-2 hidden">
              <Form.Label>
                Difference<span className="required">*</span>
              </Form.Label>
              <Form.Control type="text" readOnly value={difference} />
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
