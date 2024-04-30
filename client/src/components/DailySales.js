import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment-timezone";

function DailySales() {
  const [totalSales, setTotalSales] = useState(0);

  useEffect(() => {
    const fetchDailySales = async () => {
      try {
        const timezone = "Asia/Manila";
        const startOfDay = moment.tz(moment(), timezone).startOf("day");
        const endOfDay = moment.tz(moment(), timezone).endOf("day");

        const response = await axios.post(
          "https://pos-mh.onrender.com/bills/day-sales",
          {
            startOfDay: startOfDay.toDate(),
            endOfDay: endOfDay.toDate(),
          }
        );

        const dailySales = response.data.dailySales;

        let total = 0;
        for (const date in dailySales) {
          total += dailySales[date];
        }

        setTotalSales(total);
      } catch (error) {
        console.error("Error fetching daily sales:", error);
      }
    };

    fetchDailySales();
  }, []);

  return (
    <div>
      <h5>PHP {totalSales.toFixed(2)}</h5>
      <p>Total Sales for the Day</p>
    </div>
  );
}

export default DailySales;
