import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Box from "@mui/material/Box";
import Sidenav from "../components/Sidenav";
import { Table, Button } from "react-bootstrap";
import { useReactToPrint } from "react-to-print";

const MonthlySales = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [monthlySales, setMonthlySales] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMonthlySales = async () => {
      try {
        setLoading(true);
        const response = await axios.post(
          "https://pos-cbfa.onrender.com/bills/monthly-sales",
          { startDate: startDate.toISOString(), endDate: endDate.toISOString() }
        );
        setMonthlySales(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching monthly sales:", error);
        setLoading(false);
      }
    };

    fetchMonthlySales();
  }, [startDate, endDate]);

  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const grandTotal = monthlySales
    .reduce((total, sale) => total + sale.totalAmount, 0)
    .toFixed(2);

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
              className="form-control"
              maxDate={new Date()}
            />
          </div>
          <div className="date-picker">
            <label>Select End Date:</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
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
              <h4 className="text-center mt-3">Monthly Sales Report</h4>
              <Table className="mt-2" striped bordered hover>
                <thead className="text-center">
                  <tr>
                    <th>Date Order</th>
                    <th>Customer</th>
                    <th>Invoice Number</th>
                    <th>Vatbale</th>
                    <th>VAT</th>
                    <th>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlySales.length > 0 ? (
                    monthlySales.map((sale, index) => (
                      <tr key={index}>
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
                      <td colSpan="6">No sales for the selected Month.</td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="5" className="text-end">
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

export default MonthlySales;
