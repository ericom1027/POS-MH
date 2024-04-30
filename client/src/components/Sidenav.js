import * as React from "react";
import { useEffect, useState, useContext } from "react";
import { useSelector } from "react-redux";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListIcon from "@mui/icons-material/List";
import FileCopyOutlinedIcon from "@mui/icons-material/FileCopyOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import ExitToAppOutlinedIcon from "@mui/icons-material/ExitToAppOutlined";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";
import Loading from "./Loading";
import UserContext from "../UserContext";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import NextWeekOutlinedIcon from "@mui/icons-material/NextWeekOutlined";
import TodayOutlinedIcon from "@mui/icons-material/TodayOutlined";
import ChecklistIcon from "@mui/icons-material/Checklist";
import EditCalendarOutlinedIcon from "@mui/icons-material/EditCalendarOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import { Col, Row, Container } from "react-bootstrap";

const drawerWidth = 220;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),

  ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

export default function Sidenav() {
  const { cartItems, loading } = useSelector((state) => state.rootReducer);

  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  // To get localstorage data
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (user.id) {
      setOpen(false);
    }
  }, [user.id]);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleSalesReportClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSalesReportClose = () => {
    setAnchorEl(null);
  };

  const handleSubButtonClick = (route) => {
    navigate(route);
    handleSalesReportClose();
  };

  return (
    <Box sx={{ display: "flex" }}>
      {loading && <Loading />}
      <CssBaseline />

      <Drawer variant="permanent" open={open}>
        {open && user.id && (
          <div className="d-flex justify-content-center align-items-center mt-5">
            <Typography>
              {user.id ? (
                <>
                  <Container>
                    <Row className="align-items-center">
                      <Col xs={3} className="d-flex justify-content-start">
                        <Avatar alt={`${user.firstName} ${user.lastName}`}>
                          {user.firstName.charAt(0)}
                        </Avatar>
                      </Col>
                      <Col xs={9} className="d-flex align-items-center">
                        <div>
                          {user.firstName} {user.lastName}
                          <Row>
                            <Col xs={12}>
                              <FiberManualRecordIcon
                                sx={{
                                  color: "green",
                                  fontSize: "small",
                                  marginRight: 1,
                                }}
                              />
                              <span>Online</span>
                            </Col>
                          </Row>
                        </div>
                      </Col>
                    </Row>
                  </Container>
                </>
              ) : (
                ""
              )}
            </Typography>
          </div>
        )}
        <DrawerHeader>
          <IconButton onClick={handleDrawerToggle}>
            {open ? <ChevronLeftIcon /> : <MenuOutlinedIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {[
            (user.id === null || user.isAdmin) && {
              text: "Dashboard",
              icon: <GridViewOutlinedIcon />,
              route: "/dashboard",
            },
            (user.id === null || !user.isAdmin) && {
              text: "Sales",
              icon: <ShoppingCartRoundedIcon />,
              route: "/",
            },
            { text: "Bills", icon: <FileCopyOutlinedIcon />, route: "/bills" },
            (user.id === null || !user.isAdmin) && {
              text: "Close Shift",
              icon: <AccessTimeOutlinedIcon />,
              route: "/closeShift",
            },

            (user.id === null || user.isAdmin) && {
              text: "Items",
              icon: <ListIcon />,
              route: "/items",
            },

            (user.id === null || user.isAdmin) && {
              text: "Reports",
              icon: <AssessmentOutlinedIcon />,
              onClick: handleSalesReportClick,
            },
            (user.id === null || user.isAdmin) && {
              // Conditionally render "Users" button for logged out users or admins
              text: "Manage Users",
              icon: <PeopleAltOutlinedIcon />,
              route: "/users",
            },

            (user.id === null || user.isAdmin) && {
              text: "Logout",
              icon: <ExitToAppOutlinedIcon />,
              route: "/logout",
            },
          ]
            .filter((item) => item) // Filter out null values
            .map((item, index) => (
              <ListItem
                key={index}
                disablePadding
                sx={{ display: "block" }}
                onClick={
                  item.onClick ? item.onClick : () => navigate(item.route)
                }
              >
                <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? "initial" : "center",
                    px: 2.5,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : "auto",
                      justifyContent: "center",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    sx={{ opacity: open ? 1 : 0 }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
        </List>

        <Divider />
      </Drawer>
      <AppBar position="fixed" open={open}>
        <Toolbar className="Toolbar">
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{
              marginRight: 5,
              ...(open && { display: "none" }),
            }}
          ></IconButton>
        </Toolbar>
      </AppBar>

      {!user.isAdmin && (
        <AppBar position="fixed" open={open}>
          <Toolbar className="Toolbar">
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerToggle}
              edge="start"
              sx={{
                marginRight: 5,
                ...(open && { display: "none" }),
              }}
            ></IconButton>
            <Col>
              <h6 id="typing-text">KANTO SIETE PARES MAMI - MH 1 Branch</h6>
            </Col>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginLeft: "auto",
                marginRight: "20px",
              }}
              onClick={() => navigate("/cart")}
            >
              <p className="mb-0 p-2" style={{ margin: "0" }}></p>
              Cart
              <ShoppingCartRoundedIcon />
              {cartItems.length}
            </div>
          </Toolbar>
        </AppBar>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleSalesReportClose}
      >
        <MenuItem
          onClick={() => handleSubButtonClick("/daily-sales")}
          className="dayMenuItem"
        >
          <TodayOutlinedIcon />
          Daily Sales
        </MenuItem>
        <MenuItem
          onClick={() => handleSubButtonClick("/weekly-sales")}
          className="weekMenuItem"
        >
          <NextWeekOutlinedIcon />
          Weekly Sales
        </MenuItem>
        <MenuItem
          onClick={() => handleSubButtonClick("/monthly-sales")}
          className="monthMenuItem"
        >
          <EditCalendarOutlinedIcon />
          Monthly Sales
        </MenuItem>
        <MenuItem
          onClick={() => handleSubButtonClick("/employeeSales")}
          className="EmployeeMenuItem"
        >
          <AccountCircleOutlinedIcon />
          Sales by Employee
        </MenuItem>
        <MenuItem
          onClick={() => handleSubButtonClick("/shift")}
          className="shiftMenuItem"
        >
          <AccessTimeOutlinedIcon />
          Shift by Employee
        </MenuItem>
        <MenuItem
          onClick={() => handleSubButtonClick("/totalSoldItem")}
          className="totalSoldItemMenuItem"
        >
          <ChecklistIcon />
          Daily Items Sold
        </MenuItem>
      </Menu>
      <DrawerHeader />
    </Box>
  );
}
