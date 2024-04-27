import React, { useState, useEffect } from "react";
import axios from "axios";

function MonthlySales() {
  const [totalSales, setTotalSales] = useState(0);

  useEffect(() => {
    const fetchMonthlySales = async () => {
      try {
        const currentDate = new Date();
        const firstDayOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        );
        const lastDayOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0
        );

        const response = await axios.post(
          "https://pos-cbfa.onrender.com/bills/monthly",
          {
            startDate: firstDayOfMonth.toISOString(),
            endDate: lastDayOfMonth.toISOString(),
          }
        );

        const { monthlySales } = response.data;

        const total = monthlySales.reduce((acc, sale) => {
          return !sale.voided ? acc + sale.totalAmount : acc;
        }, 0);

        setTotalSales(total);
      } catch (error) {
        console.error("Error fetching monthly sales:", error);
      }
    };

    fetchMonthlySales();
  }, []);

  return (
    <div>
      <h5> PHP {totalSales.toFixed(2)}</h5>
      <p>Total Sales for the Month</p>
    </div>
  );
}

export default MonthlySales;
