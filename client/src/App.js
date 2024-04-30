import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Bills from "./pages/bills";
import CartPage from "./pages/CartPage";
import ItemPage from "./pages/ItemPage";
import Logout from "./pages/Logout";
import { UserProvider } from "./UserContext";
import axios from "axios";
import DailySales from "./pages/dailySales";
import WeeklySales from "./pages/weeklySales";
import MonthlySales from "./pages/monthlySales";
import UsersPage from "./pages/Users";
import ForgotPassword from "./pages/forgotPassword";
import ResetPassword from "./pages/resetPassword";
import ShiftPage from "./pages/shiftPage";
import Dashboard from "./pages/dashboard";
import ErrorPage from "./pages/Error";
import EmpSales from "./pages/CashierDailySales";
import UserShiftPage from "./pages/userShift";
import TotalSoldItem from "./pages/TotalSoldItem";
import CloseShift from "./pages/CloseShift";

export default function App() {
  const [user, setUser] = useState({
    id: null,
    isAdmin: null,
  });

  const unsetUser = () => {
    localStorage.removeItem("token");
    setUser({ id: null, isAdmin: null });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      const fetchData = async () => {
        try {
          const response = await axios.get(
            "https://pos-mh.onrender.com/users/details",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = response.data;
          if (typeof data.user !== "undefined") {
            setUser({
              id: data.user._id,
              firstName: data.user.firstName,
              lastName: data.user.lastName,
              isAdmin: data.user.isAdmin,
            });
          } else {
            setUser({
              id: null,
              isAdmin: null,
            });
          }
        } catch (error) {
          console.error("Error fetching user details:", error);
        }
      };

      fetchData();
    } else {
      setUser({
        id: null,
        isAdmin: null,
      });
    }
  }, []);

  return (
    <UserProvider value={{ user, setUser, unsetUser }}>
      <Router>
        <ToastContainer position="bottom-right" />
        <Routes>
          {/* Set login page as default route if user is not logged in */}
          <Route
            path="/"
            element={
              user.id ? <Navigate to="/home" /> : <Navigate to="/login" />
            }
          />

          {/* Protect routes that require authentication */}
          {user.id && (
            <>
              <Route path="/home" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/bills" element={<Bills />} />
              <Route path="/items" element={<ItemPage />} />
              <Route path="/daily-sales" element={<DailySales />} />
              <Route path="/weekly-sales" element={<WeeklySales />} />
              <Route path="/monthly-sales" element={<MonthlySales />} />
              <Route path="/employeeSales" element={<EmpSales />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/shift" element={<ShiftPage />} />
              <Route path="/userShift" element={<UserShiftPage />} />
              <Route path="/closeShift" element={<CloseShift />} />
              <Route path="/totalSoldItem" element={<TotalSoldItem />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/logout" element={<Logout />} />
            </>
          )}

          {/* Public routes */}
          <Route path="*" element={<ErrorPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset/:token" element={<ResetPassword />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}
