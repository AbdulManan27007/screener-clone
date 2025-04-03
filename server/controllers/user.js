const jwt = require("jsonwebtoken");
const User = require("../models/User");

const user = {
  register: async (req, res) => {
    try {
      const { username, email, password, logo, role } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser)
        return res.status(400).json({ error: "Email already exists" });

      const newUser = new User({
        username,
        email,
        password,
        logo,
        role: role || "user",
      });
      await newUser.save();

      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
      res.status(201).json({ user: newUser, token });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
      res.json({ user, token });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  update: async (req, res) => {
    try {
      const { username, email, logo } = req.body;
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { username, email, logo },
        { new: true }
      );

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  me: async (req, res) => {
    res.json(req.user);
  },
  users: async (req, res) => {
    const users = await User.find();
    res.json(users);
  },
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      if (req.user.role !== "admin" && id !== req.user._id) {
        return res.status(403).json({ error: "Access denied" });
      }
      await User.findByIdAndDelete(id);

      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = user;
