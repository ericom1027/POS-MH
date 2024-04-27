import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Sidenav from "../components/Sidenav";
import Box from "@mui/material/Box";
import { Button, Table } from "react-bootstrap";
import { useReactToPrint } from "react-to-print";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import PaginationItem from "@mui/material/PaginationItem";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DailySalesTable = () => {
  const [dailySales, setDailySales] = useState([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const componentRef = useRef();

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
          const { cashierName, totalAmount, createdAt } = transaction;
          const transactionDate = new Date(createdAt);
          const day = transactionDate.toLocaleDateString();

          if (!salesByCashier[cashierName]) {
            salesByCashier[cashierName] = { day, totalSales: 0, cashierName };
          }

          salesByCashier[cashierName].totalSales += totalAmount;
        });

        const dailySalesData = Object.values(salesByCashier);

        setDailySales(dailySalesData);
      } catch (error) {
        console.error("Error fetching daily sales:", error);
      }
    };

    fetchDailySales();
  }, [selectedDate]);

  useEffect(() => {
    const total = dailySales.reduce(
      (accumulator, sale) => accumulator + (sale.totalSales || 0),
      0
    );
    setGrandTotal(total);
  }, [dailySales]);

  const paginate = (page) => {
    setCurrentPage(page);
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = dailySales.slice(indexOfFirstItem, indexOfLastItem);
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
        <div className="container-fluid" ref={componentRef}>
          <h4>Daily Sales by Employee</h4>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
          />
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Date</th>
                <th>Cashier Name</th>
                <th>Total Sales</th>
              </tr>
            </thead>
            <tbody>
              {dailySales.length === 0 ? (
                <tr>
                  <td colSpan="3">No sales for the selected date.</td>
                </tr>
              ) : (
                currentItems.map((sale, index) => (
                  <tr key={index}>
                    <td>{sale?.day}</td>
                    <td>{sale?.cashierName}</td>
                    <td>{sale?.totalSales ? sale.totalSales.toFixed(2) : 0}</td>
                  </tr>
                ))
              )}
            </tbody>
            {dailySales.length !== 0 && (
              <tfoot>
                <tr>
                  <td colSpan="2" className="text-end">
                    Grand Total
                  </td>
                  <td>{grandTotal.toFixed(2)}</td>
                </tr>
              </tfoot>
            )}
          </Table>
        </div>
        <Stack spacing={2} alignItems="flex-end">
          <Pagination
            color="primary"
            count={Math.ceil(dailySales.length / itemsPerPage)}
            renderItem={(item) => (
              <PaginationItem
                slots={{ previous: ArrowBackIcon, next: ArrowForwardIcon }}
                {...item}
              />
            )}
            onChange={(event, page) => paginate(page)}
          />
        </Stack>
      </div>
    </Box>
  );
};

export default DailySalesTable;
