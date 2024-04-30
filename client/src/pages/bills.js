import React, { useState, useEffect, useContext } from "react";
import { useDispatch } from "react-redux";
import { Table, Modal, Button } from "react-bootstrap";
import { useReactToPrint } from "react-to-print";
import Sidenav from "../components/Sidenav";
import axios from "axios";
import Box from "@mui/material/Box";
import UserContext from "../UserContext";
import { toast } from "react-toastify";
import Pagination from "@mui/material/Pagination";
import PaginationItem from "@mui/material/PaginationItem";
import Stack from "@mui/material/Stack";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PrintIcon from "@mui/icons-material/Print";
import DatePicker from "react-datepicker";

function formattedDate(date) {
  return new Date(date).toLocaleString("en-PH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function BillModal({ bill, show, onHide, onVoid }) {
  const componentRef = React.useRef();
  const { user } = React.useContext(UserContext);

  // Use this for ReactToPrint
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  return (
    <Modal className="mt-5" show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Invoice Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {bill && (
          <div className="thermal-paper-content" ref={componentRef}>
            <div className="text-center mb-2">
              <h3>Kanto Siete Pares Mami</h3>
              <p>
                {" "}
                Address: 142 MA, CLARA, Barangay 111, DISTRICT 2, CALOOCAN CITY
              </p>
              {/* <p>Contact No. 12345678901 | Address: Manila, Philippines</p> */}
              {/* <p>VAT Reg TIN: 240-000-000-000-00000</p> */}
              <h6 className="text-center">SALES INVOICE</h6>
              <hr />
            </div>
            <div className="text-left">
              <p>
                <strong>Sales Invoice # :</strong> {bill.invoiceNumber || ""}
              </p>
              <p>
                <strong>Cashier: </strong> {bill.cashierName || ""}
              </p>
              <p>
                <strong>Customer Name:</strong> {bill.customerName || ""}
              </p>
              <p>
                <strong>Customer Number:</strong> {bill.customerNumber || ""}
              </p>
              <p>
                <strong>Payment Mode:</strong> {bill.paymentMode || ""}
              </p>
              <hr />
              <p>
                <strong>Items:</strong>{" "}
                {bill.cartItems &&
                  bill.cartItems.map((item, index) => (
                    <span key={index}>
                      {item.item} - Qty: {item.qty} Price:
                      {item.price.toFixed(2)}
                      {index !== bill.cartItems.length - 1 && ", "}
                    </span>
                  ))}
              </p>
              <p>
                <strong>Sub Total:</strong>{" "}
                {bill.subTotal ? bill.subTotal.toFixed(2) : ""}
              </p>
              <p>
                <strong>VATable Sales:</strong>{" "}
                {bill.vatSales ? bill.vatSales.toFixed(2) : ""}
              </p>
              <p>
                <strong>VAT Amount:</strong>{" "}
                {bill.vatAmount ? bill.vatAmount.toFixed(2) : ""}
              </p>
              <hr />
              <p>
                <strong>Tendered Cash:</strong>{" "}
                {bill.cash ? bill.cash.toFixed(2) : ""}
              </p>
              <p>
                <strong>Change:</strong>{" "}
                {bill.change ? bill.change.toFixed(2) : ""}
              </p>
              <p>
                <strong>Discount:</strong>{" "}
                {bill.discount ? bill.discount.toFixed(2) : "0.00"}
              </p>
              <hr />
              <p>
                <strong>Total Amount:</strong>{" "}
                {bill.totalAmount ? bill.totalAmount.toFixed(2) : ""}
              </p>
              <div className="mt-4 text-center">
                <p>{formattedDate(bill.createdAt)}</p>
                <p>Thank you for your order!</p>
                <p>
                  'NOT VALID AS <b>OFFICIAL RECEIPT</b>
                </p>
                <p>EMD IT Solutions. | All rights reserved </p>
              </div>
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        {user.isAdmin && (
          <Button variant="danger" onClick={onVoid}>
            Void
          </Button>
        )}
        <Button variant="success" onClick={handlePrint}>
          Print
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default function BillsPage() {
  const [billsData, setBillsData] = useState([]);
  const [filteredBillsData, setFilteredBillsData] = useState([]);
  const dispatch = useDispatch();
  const [popupModal, setPopupModal] = useState(false);
  const [selectBill, setSelectBill] = useState(null);
  const { user } = useContext(UserContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [billPerPage] = useState(10);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: "SHOW_LOADING" });
        const response = await axios.get(
          `https://pos-mh.onrender.com/bills/get-bills`,
          {
            params: {
              date: selectedDate.toISOString(),
            },
          }
        );
        if (response.data && Array.isArray(response.data.bills)) {
          const sortedBills = response.data.bills.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setBillsData(sortedBills);
          setFilteredBillsData(sortedBills);
          dispatch({ type: "HIDE_LOADING" });
        } else {
          toast.error("No Data", response.data);
        }
      } catch (error) {
        toast.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [dispatch, selectedDate]);

  const handleVoid = async () => {
    const token = localStorage.getItem("token");
    const invoiceNumber = selectBill?.invoiceNumber;

    if (!token || !invoiceNumber) {
      toast.error("Token or invoice number is missing.");
      return;
    }

    // Check if the user is an admin
    if (!user.isAdmin) {
      toast.error("Only admin user can access the void transaction.");
      return;
    }

    try {
      const response = await axios.post(
        "https://pos-mh.onrender.com/bills/void",
        { invoiceNumber },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Invoice voided successfully:", response.data);

      // Remove the voided invoice from billsData and filteredBillsData
      const updatedBillsData = billsData.filter(
        (bill) => bill.invoiceNumber !== invoiceNumber
      );
      const updatedFilteredBillsData = filteredBillsData.filter(
        (bill) => bill.invoiceNumber !== invoiceNumber
      );

      // Update the state with the updated arrays
      setBillsData(updatedBillsData);
      setFilteredBillsData(updatedFilteredBillsData);

      setPopupModal(false);
    } catch (error) {
      toast.error("Error voiding invoice:", error);
    }
  };

  const indexOfLastItem = currentPage * billPerPage;
  const indexOfFirstItem = indexOfLastItem - billPerPage;

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Function to filter bills data based on selected date
  const filterBillsByDate = () => {
    const filteredData = billsData.filter(
      (bill) =>
        new Date(bill.createdAt).toLocaleDateString() ===
        selectedDate.toLocaleDateString()
    );
    setFilteredBillsData(filteredData);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Sidenav />
      <div className="w-100 py-5 mt-5 mb-5 p-3">
        <h1>Invoice List</h1>
        {user.isAdmin && (
          <div className="mb-3">
            <DatePicker
              selected={selectedDate}
              onChange={(date) => {
                setSelectedDate(date);
                filterBillsByDate();
              }}
              maxDate={new Date()}
            />
          </div>
        )}
        <div className="table-responsive">
          <Table striped bordered hover>
            <thead className="text-center">
              <tr>
                <th>Date Time</th>
                <th>Invoice No.</th>
                <th className={user.isAdmin ? "" : "hidden"}>Description</th>
                <th className={user.isAdmin ? "" : "hidden"}>Sub Total</th>
                <th className={user.isAdmin ? "" : "hidden"}>Cashier Name</th>
                <th className={user.isAdmin ? "" : "hidden"}>Payment Mode</th>
                <th className={user.isAdmin ? "" : "hidden"}>Tendered Cash</th>
                <th className={user.isAdmin ? "" : "hidden"}>Change</th>
                <th className={user.isAdmin ? "" : "hidden"}>Discount</th>
                <th>Total Amount</th>
                <th className={user.isAdmin ? "" : "hidden"}>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBillsData.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center">
                    No invoices for the selected date.
                  </td>
                </tr>
              ) : (
                filteredBillsData
                  .slice(indexOfFirstItem, indexOfLastItem)
                  .map((bill, index) => (
                    <tr key={index}>
                      <td>{formattedDate(bill.createdAt)}</td>
                      <td>{bill.invoiceNumber || ""}</td>
                      <td className={user.isAdmin ? "" : "hidden"}>
                        {bill.cartItems &&
                          bill.cartItems.map((item, idx) => (
                            <div key={idx}>
                              {item.item} - Qty: {item.qty} - Price:{" "}
                              {item.price.toFixed(2)}
                            </div>
                          ))}
                      </td>
                      <td className={user.isAdmin ? "" : "hidden"}>
                        {bill.subTotal ? bill.subTotal.toFixed(2) : ""}
                      </td>
                      <td className={user.isAdmin ? "" : "hidden"}>
                        {bill.cashierName || ""}
                      </td>
                      <td className={user.isAdmin ? "" : "hidden"}>
                        {bill.paymentMode || ""}
                      </td>
                      <td className={user.isAdmin ? "" : "hidden"}>
                        {bill.cash ? bill.cash.toFixed(2) : ""}
                      </td>
                      <td className={user.isAdmin ? "" : "hidden"}>
                        {bill.change ? bill.change.toFixed(2) : ""}
                      </td>
                      <td className={user.isAdmin ? "" : "hidden"}>
                        {bill.discount ? bill.discount.toFixed(2) : "0.00"}
                      </td>
                      <td>
                        {bill.totalAmount ? bill.totalAmount.toFixed(2) : ""}
                      </td>
                      <td className={user.isAdmin ? "" : "hidden"}>
                        {bill.voided ? "voided" : ""}
                      </td>
                      <td>
                        <div className="icons">
                          <PrintIcon
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              setSelectBill(bill);
                              setPopupModal(true);
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </Table>
        </div>
        {user.isAdmin ? (
          <Stack spacing={2} alignItems="flex-end">
            <Pagination
              color="primary"
              count={Math.ceil(filteredBillsData.length / billPerPage)}
              renderItem={(item) => (
                <PaginationItem
                  slots={{ previous: ArrowBackIcon, next: ArrowForwardIcon }}
                  {...item}
                />
              )}
              onChange={(event, page) => paginate(page)}
            />
          </Stack>
        ) : null}
        <BillModal
          bill={selectBill}
          show={popupModal}
          onHide={() => setPopupModal(false)}
          onVoid={handleVoid}
        />
      </div>
    </Box>
  );
}
