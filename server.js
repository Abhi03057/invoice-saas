require("dotenv").config();
const express = require("express");

const organizationRoutes = require("./routes/organizations");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");

const app = express();

app.use(express.json());

app.use("/organizations", organizationRoutes);
app.use("/users", userRoutes);
app.use("/auth", authRoutes);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});