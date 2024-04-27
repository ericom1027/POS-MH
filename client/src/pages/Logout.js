import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from "../UserContext";
import { toast } from "react-toastify";

export default function Logout() {
  const { unsetUser } = useContext(UserContext);
  const navigate = useNavigate();
  const toastOptions = {
    autoClose: 1500,
    pauseOnHover: true,
  };

  toast.success(
    "Successfully logged out. Have a great day and see you soon!",
    toastOptions
  );

  useEffect(() => {
    const handleLogout = async () => {
      unsetUser(null);
      navigate("/login");
    };

    handleLogout();
  }, [navigate, unsetUser]);
  return null;
}
