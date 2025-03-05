const Food = require("../models/Food");

exports.getFoods = async (req, res) => {
  try {
    const foods = await Food.find();
    res.send(foods);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

exports.createFood = async (req, res) => {
  const { name, price, description } = req.body;
  try {
    const food = new Food({ name, price, description });
    await food.save();
    res.status(201).send(food);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

exports.updateFood = async (req, res) => {
  const { name, price, description } = req.body;
  try {
    const updatedFood = await Food.findByIdAndUpdate(
      req.params.id,
      { name, price, description },
      { new: true }
    );
    res.send(updatedFood);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

exports.deleteFood = async (req, res) => {
  try {
    await Food.findByIdAndDelete(req.params.id);
    res.send("Food deleted successfully");
  } catch (error) {
    res.status(400).send(error.message);
  }
};
