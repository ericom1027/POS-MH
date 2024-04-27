const itemModel = require("../models/Items");

// Add Items
module.exports.addItemController = (req, res) => {
  let newItemData = {
    name: req.body.name,
    price: req.body.price,
    category: req.body.category,
    image: req.body.image,
  };

  // Only set size if category is not "rice" or "noodles"
  if (req.body.category !== "rice" && req.body.category !== "noodles") {
    newItemData.size = req.body.size;
  }

  let newItem = new itemModel(newItemData);

  itemModel
    .findOne({ name: req.body.name })
    .then((existingItem) => {
      if (existingItem) {
        return res.status(409).send({ error: "Item already exists" });
      }

      return newItem
        .save()
        .then((savedItem) => {
          res.status(201).send(savedItem);
        })
        .catch((saveErr) => {
          console.error("Error in saving item: ", saveErr);
          res.status(500).send({ error: "Failed to save the item" });
        });
    })
    .catch((findErr) => {
      console.error("Error in finding the item: ", findErr);
      return res.status(500).send({ error: "Error finding the item" });
    });
};

// Get Items
module.exports.getItems = (req, res) => {
  return itemModel
    .find({})
    .then((items) => {
      if (items.length > 0) {
        return res.status(200).send({ items });
      } else {
        return res.status(200).send({ message: "No items found." });
      }
    })
    .catch((err) => {
      console.error("Error in finding all items:", err);
      return res.status(500).send({ error: "Error finding items." });
    });
};

// Update Items
module.exports.EditItem = (req, res) => {
  const itemId = req.params.itemId;
  console.log(itemId);
  let editItem = {
    name: req.body.name,
    size: req.body.size,
    price: req.body.price,
    category: req.body.category,
    image: req.body.image,
  };

  itemModel
    .findByIdAndUpdate(itemId, editItem, { new: true })
    .then((updatedItem) => {
      if (!updatedItem) {
        return res.status(404).send({ error: "Item not found" });
      }
      return res.status(200).send({
        message: "Item updated successfully",
        updatedItem: updatedItem,
      });
    })
    .catch((err) => {
      console.error("Error in updating an item: ", err);
      return res.status(500).send({ error: "Error in updating an item." });
    });
};

// Delete ITEM

module.exports.DeleteItem = (req, res) => {
  const itemId = req.params.itemId;

  itemModel
    .findByIdAndDelete(itemId)
    .then((deletedItem) => {
      if (!deletedItem) {
        return res.status(404).send({ error: "Item not found" });
      }
      return res.status(200).send({
        message: "Item deleted successfully",
        deletedItem: deletedItem,
      });
    })
    .catch((err) => {
      console.error("Error in deleting an item: ", err);
      return res.status(500).send({ error: "Error in deleting an item." });
    });
};
