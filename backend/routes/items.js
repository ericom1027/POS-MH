const express = require("express");
const {
  addItemController,
  getItems,
  EditItem,
  DeleteItem,
} = require("../controllers/items");

const router = express.Router();

router.post("/add-item", addItemController);

router.get("/get-item", getItems);

router.put("/:itemId/edit", EditItem);

router.delete("/:itemId", DeleteItem);

module.exports = router;
