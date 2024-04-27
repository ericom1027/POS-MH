import React from "react";
// import Button from "react-bootstrap/Button";
import { useDispatch } from "react-redux";
import { Card } from "react-bootstrap";
import { toast } from "react-toastify";

const ItemList = ({ item }) => {
  const formattedPrice = item.price.toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
  });
  const dispatch = useDispatch();

  const toastOptions = {
    autoClose: 800,
    pauseOnHover: true,
  };

  //Update cart handler
  const handleAddToCart = () => {
    dispatch({
      type: "ADD_TO_CART",
      payload: { ...item, quantity: 1 },
    });
    toast.success(`${item.name} Added to Cart!`, {
      ...toastOptions,
    });
  };

  return (
    <div className="custom-card-container mt-5">
      <Card onClick={() => handleAddToCart()} className="custom-card">
        <Card.Img className="custom-card-img" variant="top" src={item.image} />
        <Card.Body>
          {/* <div onClick={() => handleAddToCart()}> */}
          <Card.Text>{item.name}</Card.Text>
          <Card.Text>{item.size}</Card.Text>
          <Card.Text>{formattedPrice}</Card.Text>
          {/* </div> */}
          {/* <Button
            onClick={() => handleAddToCart()}
            className="w-100"
            variant="success"
            id="btn"
          >
            Add to Cart
          </Button> */}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ItemList;
