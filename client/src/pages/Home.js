import { useState, useEffect } from "react";
import Sidenav from "../components/Sidenav";
import Box from "@mui/material/Box";
import { Row } from "react-bootstrap";
import axios from "axios";
import ItemList from "../components/itemList";
import { Col } from "react-bootstrap";
import { useDispatch } from "react-redux";

export default function Home() {
  const [itemsData, setItemsData] = useState([]);
  const [selectCategory, setSelectCategory] = useState("All");
  const dispatch = useDispatch();

  const categories = [
    {
      name: "All",
      imageUrl: "https://cdn-icons-png.flaticon.com/128/9411/9411889.png",
    },
    {
      name: "Drinks",
      imageUrl: "https://cdn-icons-png.flaticon.com/128/4329/4329538.png",
    },
    {
      name: "Pares",
      imageUrl: "https://cdn-icons-png.flaticon.com/128/3547/3547146.png",
    },
    {
      name: "Rice",
      imageUrl: "https://cdn-icons-png.flaticon.com/128/129/129356.png",
    },
    {
      name: "Noodles",
      imageUrl: "https://cdn-icons-png.flaticon.com/128/2276/2276941.png",
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({
          type: "SHOW_LOADING",
        });
        const { data } = await axios.get(
          "https://pos-cbfa.onrender.com/items/get-item"
        );

        if (data && Array.isArray(data.items)) {
          setItemsData(data.items);
          dispatch({ type: "HIDE_LOADING" });
        } else {
          console.error("Data does not contain an array of items:", data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [dispatch]);

  return (
    <>
      <div className="d-flex justify-content-center align-items-center flex-wrap py-5 mt-5">
        {categories.map((category) => (
          <div
            key={category.name}
            className={`d-flex flex-column align-items-center mx-4 category ${
              selectCategory === category.name && "category-active"
            }`}
            onClick={() => setSelectCategory(category.name)}
          >
            <h4>{category.name}</h4>
            <img
              className="img-category"
              src={category.imageUrl}
              alt={category.name}
            />
          </div>
        ))}
      </div>
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          width: "100%",
        }}
      >
        <Sidenav />
        <Box
          className="py-0 w-100 top"
          component="main"
          sx={{ flexGrow: 1, p: 3 }}
        >
          <Row className="align-items-start">
            {itemsData

              .filter((item) => {
                const itemCategory = item.category.toLowerCase();
                const selectedCategory = selectCategory.toLowerCase();

                return (
                  selectedCategory === "all" ||
                  itemCategory === selectedCategory
                );
              })
              .map((item) => (
                <Col key={item._id} xs={3} md={3}>
                  <ItemList item={item} />
                </Col>
              ))}
          </Row>
        </Box>
      </Box>
    </>
  );
}
