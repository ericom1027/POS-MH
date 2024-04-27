import React, { useState, useEffect } from "react";
import axios from "axios";

function WeeklySales() {
  const [totalSales, setTotalSales] = useState(0);

  useEffect(() => {
    const fetchWeeklySales = async () => {
      try {
        const currentDate = new Date();
        const firstDayOfWeek = new Date(currentDate);
        firstDayOfWeek.setDate(
          firstDayOfWeek.getDate() - firstDayOfWeek.getDay()
        );
        const startOfWeekTimestamp = firstDayOfWeek.toISOString();

        const response = await axios.post(
          "https://pos-cbfa.onrender.com/bills/weekly",
          {
            startDate: startOfWeekTimestamp,
            endDate: currentDate.toISOString(),
          }
        );

        const { grandTotalSales } = response.data;

        setTotalSales(grandTotalSales);
      } catch (error) {
        console.error("Error fetching weekly sales:", error);
      }
    };

    fetchWeeklySales();
  }, []);

  return (
    <div>
      <h5>PHP {totalSales.toFixed(2)}</h5>
      <p>Total Sales for the Week</p>
    </div>
  );
}

export default WeeklySales;
