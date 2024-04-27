import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import Box from "@mui/material/Box";
import Sidenav from "../components/Sidenav";
import { Table, Button } from "react-bootstrap";
import { useReactToPrint } from "react-to-print";

const WeeklySales = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [weeklySales, setWeeklySales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [grandTotal, setGrandTotal] = useState(0);

  useEffect(() => {
    const fetchWeeklySales = async () => {
      try {
        setLoading(true);
        const response = await axios.post(
          "https://pos-cbfa.onrender.com/bills/weekly-sales",
          { start: startDate, end: endDate }
        );
        setWeeklySales(response.data);
        calculateGrandTotal(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching weekly sales:", error);
        setLoading(false);
      }
    };

    if (startDate && endDate) {
      fetchWeeklySales();
    }
  }, [startDate, endDate]);

  const calculateGrandTotal = (data) => {
    let total = 0;
    data.forEach((sale) => {
      total += sale.totalAmount;
    });
    setGrandTotal(total.toFixed(2));
  };

  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  return (
    <Box sx={{ display: "flex" }}>
      <Sidenav />
      <div className="w-100 py-5 mt-5 mb-5 p-3">
        <div className="date-picker-container">
          <div className="date-picker">
            <label>Select Start Date:</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              className="form-control"
              maxDate={new Date()}
            />
          </div>
          <div className="date-picker">
            <label>Select End Date:</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              className="form-control"
              maxDate={new Date()}
            />
          </div>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div>
            <Button
              className="d-flex ms-auto"
              variant="success"
              onClick={handlePrint}
            >
              Print
            </Button>
            <div className="container-fluid" ref={componentRef}>
              <h4 className="text-center mt-3">Weekly Sales Report</h4>
              <Table className="mt-2" striped bordered hover>
                <thead className="text-center">
                  <tr>
                    <th>No.</th>
                    <th>Date Order</th>
                    <th>Customer</th>
                    <th>Invoice Number</th>
                    <th>Vatable</th>
                    <th>VAT</th>
                    <th>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {weeklySales.length > 0 ? (
                    weeklySales.map((sale, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>

                        {/* <td>
                          {sale.cartItems &&
                            sale.cartItems.map((item, idx) => (
                              <div key={idx}>
                                {item.item} - Qty: {item.qty} - Price:{" "}
                                {item.price.toFixed(2)}
                              </div>
                            ))}
                        </td> */}
                        <td>
                          {new Date(sale.createdAt).toLocaleString("en-PH", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          })}
                        </td>
                        <td>{sale.customer}</td>
                        <td>{sale.invoiceNumber}</td>
                        <td>{sale.vatSales}</td>
                        <td>{sale.vatAmount}</td>
                        <td>{sale.totalAmount.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7">No sales for the selected Week.</td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="6" className="text-end">
                      Grand Total:
                    </td>
                    <td>{grandTotal}</td>
                  </tr>
                </tfoot>
              </Table>
            </div>
          </div>
        )}
      </div>
    </Box>
  );
};

export default WeeklySales;
