import React, { useState, useEffect } from "react";
import axios from "axios";

function DailySales() {
  const [totalSales, setTotalSales] = useState(0);

  useEffect(() => {
    const fetchDailySales = async () => {
      try {
        // Get the start and end of the current day
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // Make a POST request to fetch the daily sales
        const response = await axios.post(
          "https://pos-mh.onrender.com/bills/day-sales",
          {
            startOfDay: startOfDay,
            endOfDay: endOfDay,
          }
        );

        // Extract daily sales data from the response
        const dailySales = response.data.dailySales;

        // Calculate total sales from the daily sales data
        let total = 0;
        for (const date in dailySales) {
          total += dailySales[date];
        }

        // Update state with the total sales
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
