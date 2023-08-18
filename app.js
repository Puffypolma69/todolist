//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { Schema } = mongoose;
const _ = require("lodash");
const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(
  "mongodb+srv://Puffypolma69:FuKiMidc51!@cluster0.qxayiht.mongodb.net/",
  {
    useNewUrlParser: true,
  }
);

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

const itemsSchema = new Schema({
  itemName: String,
});

//This is the collection
const Item = mongoose.model("Item", itemsSchema);

//Creating items
const item1 = new Item({
  itemName: "Welcome to your todo list.",
});

const item2 = new Item({
  itemName: "Hit + button to create a new item.",
});

const item3 = new Item({
  itemName: "<-- Hit this to delete an item.",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema],
};

const List = mongoose.model("List", listSchema);

//Inserting multiple docs into one collection
// const insertToItemCollection = async function () {
//   try {
//     const newItemCollection = await Item.insertMany(defaultItems);
//     console.log(newItemCollection);
//   } catch (err) {
//     console.log(err);
//   }
// };

// insertToItemCollection();

app.get("/", function (req, res) {
  const findItem = async function () {
    // insertOne method is used here to insert the sampleAccount document

    let foundItems = await Item.find({});

    if (foundItems.length === 0) {
      //Inserting multiple docs into one collection
      const insertToItemCollection = async function () {
        try {
          const newItemCollection = await Item.insertMany(defaultItems);
          console.log(newItemCollection);
          res.redirect("/");
        } catch (err) {
          console.log(err);
        }
      };
      insertToItemCollection();
    } else res.render("list", { listTitle: "Today", newListItems: foundItems });
  };

  findItem();
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName })
    .then(function (foundList) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems,
        });

        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    })
    .catch(function (err) {
      console.log(err);
    });
});

app.post("/", async function (req, res) {
  const itemNam = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    itemName: itemNam,
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    await List.findOne({ name: listName })
      .then((foundList) => {
        foundList.items.push(item);
        foundList.save();
        setTimeout(() => {
          res.redirect("/" + listName);
        }, 1000);
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId)
      .then(() => {
        console.log("Succesfully deleted checked item from the database");
        res.redirect("/");
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    List.findOne({ name: listName })
      .then((foundList) => {
        foundList.items.pull({ _id: checkedItemId });
        foundList.save();
        setTimeout(() => {
          res.redirect("/" + listName);
        }, 1000);
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

// app.get("/work", function (req, res) {
//   res.render("list", { listTitle: "Work List", newListItems: workItems });
// });

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
