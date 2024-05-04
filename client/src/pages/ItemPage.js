import { useCallback, useEffect, useState } from "react";
import Sidenav from "../components/Sidenav";
import Box from "@mui/material/Box";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { Table, Button, Modal, Form } from "react-bootstrap";
import { useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import Pagination from "@mui/material/Pagination";
import PaginationItem from "@mui/material/PaginationItem";
import Stack from "@mui/material/Stack";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const initialState = {
  name: "",
  size: "",
  price: "",
  image: "",
  category: "",
};

const ItemPage = () => {
  const [itemsData, setItemsData] = useState([]);
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState(initialState);
  const [editingItemId, setEditingItemId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const dispatch = useDispatch();

  const fetchData = useCallback(async () => {
    try {
      dispatch({ type: "SHOW_LOADING" });
      const { data } = await axios.get(
        "https://pos-mh.onrender.com/items/get-item"
      );

      if (data && Array.isArray(data.items)) {
        setItemsData(data.items);
      } else {
        console.error("Data does not contain items:", data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      dispatch({ type: "HIDE_LOADING" });
    }
  }, [dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleClose = () => {
    setShow(false);
    setEditingItemId(null);
    setFormData(initialState);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const handleEdit = (item) => {
    setEditingItemId(item._id);
    setFormData(item);
    setShow(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch({ type: "SHOW_LOADING" });
      if (editingItemId) {
        await axios.put(
          `https://pos-mh.onrender.com/items/${editingItemId}/edit`,
          formData
        );
        toast.success("Item Updated Successfully");
      } else {
        await axios.post(
          "https://pos-mh.onrender.com/items/add-item",
          formData
        );
        toast.success("Item Added Successfully");
      }
      fetchData();
      handleClose();
    } catch (error) {
      console.error("Error submitting data:", error);
      if (error.response && error.response.data.error) {
        toast.error(error.response.data.error);
      }
    } finally {
      dispatch({ type: "HIDE_LOADING" });
    }
  };

  const handleDelete = async (itemId) => {
    try {
      dispatch({ type: "SHOW_LOADING" });
      await axios.delete(`https://pos-mh.onrender.com/items/${itemId}`);
      toast.success("Item Deleted Successfully");
      fetchData();
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Error deleting item");
    } finally {
      dispatch({ type: "HIDE_LOADING" });
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <Box sx={{ display: "flex" }}>
      <Sidenav />
      <div className="w-100 py-5 mt-5 mb-5 p-3">
        <div className="btn-addItem">
          <h1>Items List</h1>
          <Button
            type="primary"
            onClick={() => {
              setShow(true);
              setEditingItemId(null);
            }}
            className="mt-3 mb-3"
          >
            Add Item
          </Button>
        </div>
        <Table className="table-responsive" striped bordered hover>
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Size</th>
              <th>Image</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {itemsData
              .slice(indexOfFirstItem, indexOfLastItem)
              .map((item, index) => (
                <tr key={index}>
                  <td>{item?.name || ""}</td>
                  <td>{item?.size || ""}</td>
                  <td>
                    <img
                      className="cart-img"
                      src={item?.image || ""}
                      alt={item?.name || ""}
                      style={{ width: 50, height: 50 }}
                    />
                  </td>
                  <td>{parseFloat(item?.price).toFixed(2) || ""}</td>
                  <td>
                    <div className="icons">
                      <EditOutlinedIcon onClick={() => handleEdit(item)} />
                      <DeleteOutlineOutlinedIcon
                        onClick={() => handleDelete(item._id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </Table>
        <Stack spacing={2} alignItems="flex-end">
          <Pagination
            color="primary"
            count={Math.ceil(itemsData.length / itemsPerPage)}
            renderItem={(item) => (
              <PaginationItem
                slots={{ previous: ArrowBackIcon, next: ArrowForwardIcon }}
                {...item}
              />
            )}
            onChange={(event, page) => paginate(page)}
          />
        </Stack>
        <Modal
          className="mt-5 py-5"
          show={show}
          onHide={handleClose}
          backdrop="static"
          keyboard={false}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {editingItemId ? "Edit Item" : "Add New Item"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <div>
                <Form.Group>
                  <Form.Label>Item Name</Form.Label>
                  <Form.Control
                    className="input-field"
                    type="text"
                    placeholder="Enter Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    className="input-field"
                    aria-label="Category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Drinks">Drinks</option>
                    <option value="Rice">Rice</option>
                    <option value="Pares">Pares</option>
                    <option value="Noodles">Noodles</option>
                  </Form.Select>
                </Form.Group>
                {formData.category !== "Rice" &&
                  formData.category !== "Pares" &&
                  formData.category !== "Noodles" && (
                    <Form.Group>
                      <Form.Label>Size</Form.Label>
                      <Form.Select
                        className="selectedSize"
                        aria-label="Size"
                        name="size"
                        value={formData.size}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Size</option>
                        <option value="Small">Small</option>
                        <option value="Medium">Medium</option>
                        <option value="Large">Large</option>
                      </Form.Select>
                    </Form.Group>
                  )}
                <Form.Group>
                  <Form.Label>Price</Form.Label>
                  <Form.Control
                    className="input-field"
                    type="number"
                    step="0.01"
                    placeholder="Enter Price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Image</Form.Label>
                  <Form.Control
                    className="input-field"
                    type="text"
                    placeholder="Enter Image URL"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </div>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button type="submit" variant="primary" onClick={handleSubmit}>
              Save
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </Box>
  );
};

export default ItemPage;
