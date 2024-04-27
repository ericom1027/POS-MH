import React, { useState, useEffect, useContext } from "react";
import Sidenav from "../components/Sidenav";
import Box from "@mui/material/Box";
import { useSelector, useDispatch } from "react-redux";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import RemoveCircleOutlinedIcon from "@mui/icons-material/RemoveCircleOutlined";
import { Table, Button, Modal, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import UserContext from "../UserContext";
import { generateSalesInvoiceNumber } from "../utils/invoiceNum";

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems } = useSelector((state) => state.rootReducer);
  const { user } = useContext(UserContext);
  const [subTotal, setSubTotal] = useState(0);
  const [popUpBill, setPopUpBill] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    customerNumber: "",
    paymentMode: "",
    cash: "",
    isSeniorOrPWD: false, // Added a state to track if customer is eligible for discount
  });

  useEffect(() => {
    let total = 0;
    cartItems.forEach((item) => {
      total += item.price * item.quantity;
    });
    setSubTotal(total);
  }, [cartItems]);

  const handleIncrement = (record) => {
    dispatch({
      type: "UPDATE_CART",
      payload: { ...record, quantity: record.quantity + 1 },
    });
  };

  const handleDecrement = (record) => {
    if (record.quantity !== 1) {
      dispatch({
        type: "UPDATE_CART",
        payload: { ...record, quantity: record.quantity - 1 },
      });
    }
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: newValue,
    }));

    if (name === "paymentMode") {
      document.getElementById("cashInput").disabled = value === "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const vatRate = 0.12; // VAT rate is 12%
      const vatAmount = subTotal * vatRate; // Calculate VAT amount
      const vatSales = subTotal - vatAmount; // Calculate VAT sales

      const cashAmount = parseFloat(formData.cash) || 0;
      let grandTotal = subTotal; // Grand total without VAT for now
      const change = cashAmount - grandTotal;

      if (cashAmount < 0) {
        toast.error("Cash amount cannot be negative");
        return;
      }

      if (cashAmount < grandTotal) {
        toast.error("Cash Tendered Insufficient");
        return;
      }

      // Apply discount if customer is eligible (senior or PWD)
      if (formData.isSeniorOrPWD) {
        // Apply 20% discount
        grandTotal *= 0.8;
      }

      // Generate a sales invoice number
      const salesInvoiceNo = generateSalesInvoiceNumber();

      // Separate item and quantity
      const cartItemsWithQuantity = cartItems.map((item) => ({
        item: item.name,
        qty: item.quantity,
        price: item.price,
      }));

      const newBill = {
        ...formData,
        cashierName: user.firstName,
        cash: cashAmount,
        change: change,
        subTotal: subTotal.toFixed(2),
        vatSales: vatSales.toFixed(2),
        vatAmount: vatAmount.toFixed(2),
        totalAmount: grandTotal.toFixed(2),
        cartItems: cartItemsWithQuantity,
        userId: user.id,
        invoiceNumber: salesInvoiceNo,
      };

      await axios.post("https://pos-mh.onrender.com/bills/add-bills", newBill);
      toast.success("Bill generated successfully");

      dispatch({ type: "CLEAR_CART" });
      navigate("/bills");
    } catch (error) {
      toast.error("Failed to generate bill");
      console.error(error);
    }
  };

  const columns = [
    { title: "Name", dataIndex: "name" },
    {
      title: "Image",
      dataIndex: "image",
      render: (image, record) => (
        <img
          className="cart-img"
          src={image}
          alt={record.name}
          style={{ width: 50, height: 50 }}
        />
      ),
    },
    { title: "Price", dataIndex: "price" },
    {
      title: "Quantity",
      dataIndex: "_id",
      render: (id, record) => (
        <div>
          <AddCircleOutlineOutlinedIcon
            className="mx-3"
            onClick={() => handleIncrement(record)}
          />
          <b>{record.quantity}</b>
          <RemoveCircleOutlinedIcon
            className="mx-3"
            onClick={() => handleDecrement(record)}
          />
        </div>
      ),
    },
    {
      title: "Actions",
      render: (text, record) => (
        <DeleteOutlineOutlinedIcon
          onClick={() =>
            dispatch({
              type: "DELETE_FROM_CART",
              payload: record,
            })
          }
        />
      ),
    },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <Sidenav />
      <div className="w-100 py-5 mt-5 mb-5 p-3">
        <h1>Cart Order List</h1>
        <Table striped bordered hover>
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th key={index}>{column.title}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item, index) => (
              <tr key={index}>
                {columns.map((column, colIndex) => (
                  <td key={colIndex}>
                    {column.render
                      ? column.render(item[column.dataIndex], item)
                      : column.dataIndex === "_id"
                      ? item.quantity
                      : column.dataIndex === "price"
                      ? `PHP ${item[column.dataIndex].toFixed(2)}`
                      : item[column.dataIndex]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
        <p>Total Price: PHP {subTotal.toFixed(2)}</p>
        <Button variant="primary" onClick={() => setPopUpBill(true)}>
          Proceed to Check Out
        </Button>
        <Modal
          className="mt-5"
          title="Proceed to Check Out"
          show={popUpBill}
          onHide={() => setPopUpBill(false)}
          footer={null}
        >
          <Modal.Header closeButton>
            <Modal.Title className="text-center mt-2">
              Invoice Details
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="d-flex  justify-content-center mt-2">
            <Form onSubmit={handleSubmit}>
              <div>
                <Form.Group controlId="customer-name">
                  <Form.Label>Customer Name</Form.Label>
                  <Form.Control
                    className="input-field"
                    type="customer-name"
                    placeholder="Enter Customer Name"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Form.Group controlId="customer-no">
                  <Form.Label>Customer Number</Form.Label>
                  <Form.Control
                    className="input-field"
                    type="customer-no"
                    placeholder="Enter Mobile No."
                    name="customerNumber"
                    value={formData.customerNumber}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Form.Group controlId="payment-mode">
                  <Form.Label>Payment Mode</Form.Label>
                  <Form.Select
                    className="input-field"
                    type="payment-mode"
                    name="paymentMode"
                    value={formData.paymentMode}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Payment Method</option>
                    <option value="Cash">Cash</option>
                    {/* <option value="Card">Card</option> */}
                  </Form.Select>
                </Form.Group>
                <Form.Group>
                  <Form.Control
                    className="input-field mt-3"
                    type="text"
                    placeholder="Enter Amount"
                    name="cash"
                    id="cashInput"
                    value={formData.cash}
                    onChange={handleChange}
                    required
                    disabled={!formData.paymentMode}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Check
                    type="checkbox"
                    label="Senior Citizen/PWD"
                    name="isSeniorOrPWD"
                    checked={formData.isSeniorOrPWD}
                    onChange={handleChange}
                    className="mt-2"
                  />
                </Form.Group>
                <div className="bill">
                  {cartItems.map((item, index) => (
                    <div key={index}>
                      <h5 className="mt-3">{item.name}</h5>
                      <h6>Qty: {item.quantity}</h6>
                      <h6>Price: {item.price}</h6>
                      <h6>
                        Total Amount: {(item.quantity * item.price).toFixed(2)}
                      </h6>
                    </div>
                  ))}
                  <h5 className="mt-3">
                    Sub Total : <p>{subTotal.toFixed(2)}</p>
                  </h5>
                  <h6>
                    VATable Sales: <p>{((subTotal / 100) * 88).toFixed(2)}</p>
                  </h6>
                  <h6>
                    VAT AMOUNT: <p>{((subTotal / 100) * 12).toFixed(2)}</p>
                  </h6>
                  <h6>
                    Tendered CASH:{" "}
                    <p>{parseFloat(formData.cash || 0).toFixed(2)}</p>
                  </h6>
                  <h6>
                    Change:{" "}
                    <p>
                      {(parseFloat(formData.cash || 0) - subTotal).toFixed(2)}
                    </p>
                  </h6>
                  <h5>
                    TOTAL AMOUNT: <p>{subTotal.toFixed(2)}</p>
                  </h5>
                </div>
                <hr />
                <div className="d-flex justify-content-end">
                  <Button className="mt-3" variant="success" type="submit">
                    Check Out
                  </Button>
                </div>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </Box>
  );
}
