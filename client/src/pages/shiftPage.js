import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Button, Table, Col } from "react-bootstrap";
import Box from "@mui/material/Box";
import Sidenav from "../components/Sidenav";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import { useReactToPrint } from "react-to-print";
import moment from "moment-timezone";
import logo from "../assets/logo.png";

const ShiftPage = () => {
  const [shifts, setShifts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const formatDate = (date) => {
    return moment(date).format("YYYY-MM-DD");
  };

  const fetchShifts = async () => {
    try {
      const formattedDate = formatDate(selectedDate);
      const response = await axios.get(
        `https://pos-mh.onrender.com/shifts/getShift?date=${formattedDate}`
      );
      if (response.status === 200) {
        setShifts(response.data);
      } else {
        toast.error("Error fetching shifts:", response.data);
      }
    } catch (error) {
      console.error("Error fetching shifts:", error);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, [selectedDate]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = shifts
    ? shifts.slice(indexOfFirstItem, indexOfLastItem)
    : [];

  return (
    <Box sx={{ display: "flex" }}>
      <Sidenav />
      <div className="w-100 py-5 mt-5 mb-5 p-3">
        <Button
          className="d-flex mt-2 ms-auto"
          variant="primary"
          onClick={handlePrint}
        >
          Print
        </Button>
        <div className="container-fluid" ref={componentRef}>
          <h4>MH-1 Shift Reports</h4>
          <label>Date:</label>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            maxDate={new Date()}
          />

          <Table className="mt-4 table-responsive" striped bordered hover>
            <thead className="text-center">
              <tr>
                <th>No.</th>
                <th>Cashier name</th>
                <th>Date</th>
                <th>Opening time</th>
                <th>Closing time</th>
                <th className="hidden">Starting cash</th>
                <th>Actual cash amount</th>
                <th>Expected cash amount</th>
                <th>Difference</th>
              </tr>
            </thead>
            <tbody>
              {!currentItems || currentItems.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center">
                    No records found for the selected date.
                  </td>
                </tr>
              ) : (
                currentItems.map((shift, index) => (
                  <tr key={`shift-${index}`}>
                    <td>{index + 1}</td>
                    <td>
                      {shift.user.firstName} {shift.user.lastName}
                    </td>
                    <td>{moment(shift.startTime).format("MM-DD-YYYY")}</td>
                    <td>{moment(shift.startTime).format("hh:mm:ss A")}</td>
                    <td>{moment(shift.endTime).format("hh:mm:ss A")}</td>
                    <td className="hidden">
                      {shift.startingCash !== null &&
                      shift.startingCash !== undefined
                        ? shift.startingCash.toFixed(2)
                        : "0.00"}
                    </td>
                    <td>
                      {shift.endingCash !== null &&
                      shift.endingCash !== undefined
                        ? shift.endingCash.toFixed(2)
                        : "0.00"}
                    </td>
                    <td>
                      {shift.expectedCashAmount !== null &&
                      shift.expectedCashAmount !== undefined
                        ? shift.expectedCashAmount.toFixed(2)
                        : "0.00"}
                    </td>
                    <td>
                      {shift.difference !== null &&
                      shift.difference !== undefined
                        ? shift.difference.toFixed(2)
                        : "0.00"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </div>
      <Col className="col-logo" xs={12}>
        <img className="img-logo" src={logo} alt="Logo" />
        <h6>MH 1 Branch</h6>
      </Col>
    </Box>
  );
};

export default ShiftPage;
