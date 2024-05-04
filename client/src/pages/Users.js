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
  firstName: "",
  lastName: "",
  email: "",
  mobileNo: "",
  password: "",
  confirmPassword: "",
  isAdmin: false,
};

const Users = () => {
  const [userData, setUserData] = useState([]);
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState(initialState);
  const [editingUserId, setEditingUserId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);

  const [isActive, setIsActive] = useState(false);
  const dispatch = useDispatch();

  const fetchData = useCallback(async () => {
    try {
      dispatch({ type: "SHOW_LOADING" });

      const token = localStorage.getItem("token");

      // Set the headers with the authentication token
      const conAuth = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.get(
        "https://pos-mh.onrender.com/users/users",
        conAuth
      );

      // console.log("Data received from API:", data);

      if (data && Array.isArray(data)) {
        setUserData(data);
      } else {
        console.error("Data does not contain users:", data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error fetching data");
    } finally {
      dispatch({ type: "HIDE_LOADING" });
    }
  }, [dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleClose = () => {
    setShow(false);
    setEditingUserId(null);
    setFormData(initialState);
  };

  const handleEdit = (user) => {
    setEditingUserId(user._id);

    const { password, ...userDataWithoutPassword } = user;
    setFormData(userDataWithoutPassword);
    setShow(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch({ type: "SHOW_LOADING" });
      console.log("Form data before submitting:", formData);
      const token = localStorage.getItem("token");
      const conAuth = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      if (editingUserId) {
        await axios.put(
          `https://pos-mh.onrender.com/users/users/${editingUserId}`,
          formData,
          conAuth
        );
        toast.success("User Updated Successfully");
      } else {
        await axios.post(
          `https://pos-mh.onrender.com/users/register`,
          formData,
          conAuth
        );
        toast.success("User Added Successfully");
      }
      fetchData();
      handleClose();
    } catch (error) {
      console.error("Error submitting data:", error);
      toast.error("Error submitting data");
    } finally {
      dispatch({ type: "HIDE_LOADING" });
    }
  };

  const handleDelete = async (userId) => {
    try {
      dispatch({ type: "SHOW_LOADING" });
      await axios.delete(`https://pos-mh.onrender.com/users/users/${userId}`);
      toast.success("User Deleted Successfully");
      fetchData();
    } catch (error) {
      console.error("Error deleting User:", error);
      toast.error("Error deleting User");
    } finally {
      dispatch({ type: "HIDE_LOADING" });
    }
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    if (
      formData.firstName !== "" &&
      formData.lastName !== "" &&
      formData.email !== "" &&
      formData.mobileNo !== "" &&
      formData.password !== "" &&
      formData.confirmPassword !== "" &&
      formData.password === formData.confirmPassword
    ) {
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  }, [formData]);

  const indexOfLastItem = currentPage * usersPerPage;
  const indexOfFirstItem = indexOfLastItem - usersPerPage;

  return (
    <Box sx={{ display: "flex" }}>
      <Sidenav />
      <div className="w-100 py-5 mt-5 mb-5 p-3">
        <div className="btn-addUser">
          <h1>Users List</h1>
          <Button
            type="primary"
            onClick={() => {
              setShow(true);
              setEditingUserId(null);
            }}
            className="mt-3 mb-3"
          >
            Add User
          </Button>
        </div>
        <div>
          <Table className="table-responsive" striped bordered hover>
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Mobile No.</th>
                {/* <th>Password</th> */}
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {userData &&
                userData.length > 0 &&
                userData
                  .slice(indexOfFirstItem, indexOfLastItem)
                  .map((user, index) => (
                    <tr key={index}>
                      <td>{user.firstName}</td>
                      <td>{user.lastName}</td>
                      <td>{user.email}</td>
                      <td>{user.mobileNo}</td>
                      <td
                        style={{
                          display: editingUserId ? "table-cell" : "none",
                        }}
                      >
                        {user.password}
                      </td>
                      <td>{user.isAdmin ? "Admin" : "User"}</td>
                      <td>
                        <div className="icons">
                          <EditOutlinedIcon onClick={() => handleEdit(user)} />
                          <DeleteOutlineOutlinedIcon
                            onClick={() => handleDelete(user._id)}
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
              count={Math.ceil(userData.length / usersPerPage)}
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

        <Modal
          className="mt-5 py-5"
          show={show}
          onHide={handleClose}
          backdrop="static"
          keyboard={false}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {editingUserId ? "Edit User" : "Add New User"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <div>
                <Form.Group>
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    className="input-field"
                    type="text"
                    placeholder="Enter First Name"
                    required
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData((prevFormData) => ({
                        ...prevFormData,
                        firstName: e.target.value,
                      }))
                    }
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    className="input-field"
                    type="text"
                    placeholder="Enter Last Name"
                    required
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData((prevFormData) => ({
                        ...prevFormData,
                        lastName: e.target.value,
                      }))
                    }
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    className="input-field"
                    type="text"
                    placeholder="example@gmail.com"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prevFormData) => ({
                        ...prevFormData,
                        email: e.target.value,
                      }))
                    }
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Mobile No</Form.Label>
                  <Form.Control
                    className="input-field"
                    type="text"
                    placeholder="Enter 11 Digit No."
                    required
                    value={formData.mobileNo}
                    onChange={(e) =>
                      setFormData((prevFormData) => ({
                        ...prevFormData,
                        mobileNo: e.target.value,
                      }))
                    }
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    className="input-field"
                    type="password"
                    placeholder="Enter New Password"
                    name="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prevFormData) => ({
                        ...prevFormData,
                        password: e.target.value,
                      }))
                    }
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label>Confirm New Password</Form.Label>
                  <Form.Control
                    className="input-field"
                    type="password"
                    placeholder="Confirm New Password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData((prevFormData) => ({
                        ...prevFormData,
                        confirmPassword: e.target.value,
                      }))
                    }
                  />
                </Form.Group>

                <Form.Group controlId="validationCustom05">
                  <Form.Label>Role</Form.Label>
                  <Form.Check
                    type="checkbox"
                    label="Admin"
                    name="isAdmin"
                    checked={formData.isAdmin}
                    onChange={(e) =>
                      setFormData((prevFormData) => ({
                        ...prevFormData,
                        isAdmin: e.target.checked,
                      }))
                    }
                  />
                </Form.Group>
              </div>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            {isActive ? (
              <Button type="submit" variant="primary" onClick={handleSubmit}>
                {editingUserId ? "Save Changes" : "Add User"}
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                disabled
                onClick={handleSubmit}
              >
                {editingUserId ? "Save Changes" : "Add User"}
              </Button>
            )}
          </Modal.Footer>
        </Modal>
      </div>
    </Box>
  );
};

export default Users;
