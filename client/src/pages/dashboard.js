import React from "react";
import { Box, Typography, Card, CardContent } from "@mui/material";
import { Row, Col } from "react-bootstrap";
import Sidenav from "../components/Sidenav";
import DailySales from "../components/DailySales";
import WeeklySales from "../components/WeeklySales";
import MonthlySales from "../components/monthlySales";
import HomeIcon from "@mui/icons-material/Home";

export default function DashboardPage() {
  return (
    <>
      <Box sx={{ display: "flex", height: "100vh", width: "100%" }}>
        <Sidenav />

        <Box
          className="py-5 mt-5 w-100"
          component="main"
          sx={{ flexGrow: 1, p: 3 }}
        >
          <Row>
            <Col xs="auto">
              <HomeIcon />
            </Col>
            <Col>
              <h4>Dashboard</h4>
            </Col>
          </Row>
          <Row>
            <Col md={3}>
              <Box sx={{ pt: 2.25 }}>
                <Card className="rounded" variant="outlined">
                  <CardContent className="Card-Sales1">
                    <Typography variant="h6" component="div">
                      Daily Sales
                    </Typography>
                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                      <DailySales />
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Col>
            <Col md={3}>
              <Box sx={{ pt: 2.25 }}>
                <Card className="rounded" variant="outlined">
                  <CardContent className="Card-Sales2">
                    <Typography variant="h6" component="div">
                      Weekly Sales
                    </Typography>
                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                      <WeeklySales />
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Col>
            <Col md={3}>
              <Box sx={{ pt: 2.25 }}>
                <Card className="rounded" variant="outlined">
                  <CardContent className="Card-Sales3">
                    <Typography variant="h6" component="div">
                      Monthly Sales
                    </Typography>
                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                      <MonthlySales />
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Col>
          </Row>
        </Box>
      </Box>
    </>
  );
}
