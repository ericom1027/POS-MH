import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Sidenav from "../components/Sidenav";
import Box from "@mui/material/Box";
import { Button, Table } from "react-bootstrap";
import { useReactToPrint } from "react-to-print";
import DatePicker from "react-datepicker";

const TotalSoldItem = () => {
  const [dailySales, setDailySales] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [grandTotal, setGrandTotal] = useState(0);

  const componentRef = useRef();

  useEffect(() => {
    const fetchDailySales = async () => {
      try {
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        const response = await axios.post(
          "https://pos-mh.onrender.com/bills/sales",
          {
            startOfDay: startOfDay.toISOString(),
            endOfDay: endOfDay.toISOString(),
          }
        );
        setDailySales(response.data.data);
      } catch (error) {
        console.error("Error fetching daily sales:", error);
      }
    };

    fetchDailySales();
  }, [selectedDate]);

  useEffect(() => {
    const total = dailySales.reduce(
      (accumulator, sale) => accumulator + sale.totalPrice,
      0
    );
    setGrandTotal(total);
  }, [dailySales]);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const aggregatedItems = dailySales.reduce((acc, sale) => {
    const { item, price, totalQuantity, totalPrice, createdAt } = sale;
    const saleDate = new Date(createdAt).toLocaleDateString("en-PH");
    const key = `${item}-${saleDate}`;
    if (!acc[key]) {
      acc[key] = { item, price, totalQuantity, totalPrice, date: saleDate };
    } else {
      acc[key].totalQuantity += totalQuantity;
      acc[key].totalPrice += totalPrice;
    }
    return acc;
  }, {});

  return (
    <Box sx={{ display: "flex" }}>
      <Sidenav />

      <div className="w-100 py-5 mt-5 mb-5 p-3">
        <Button
          className="d-flex ms-auto"
          variant="success"
          onClick={handlePrint}
        >
          Print
        </Button>
        <div className="date-picker-container">
          <div className="date-picker">
            <div>
              <label>Date:</label>
              <DatePicker
                placeholderText="Select Date"
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                className="form-control"
                maxDate={new Date()}
              />
            </div>
          </div>
        </div>
        <div className="container-fluid" ref={componentRef}>
          <h4>Daily Items Sold</h4>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Date Order</th>
                <th>Items Sold</th>
                <th>Price</th>
                <th>Total Quantity</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(aggregatedItems).map((key, index) => {
                const { item, price, totalQuantity, totalPrice, date } =
                  aggregatedItems[key];
                return (
                  <tr key={index}>
                    <td>{date}</td>
                    <td>{item}</td>
                    <td>{price.toFixed(2)}</td>
                    <td>{totalQuantity}</td>
                    <td>{totalPrice.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>

            <tfoot>
              <tr>
                <td colSpan="4" className="text-end">
                  Grand Total
                </td>
                <td>{grandTotal.toFixed(2)}</td>
              </tr>
            </tfoot>
          </Table>
        </div>
      </div>
    </Box>
  );
};

export default TotalSoldItem;
