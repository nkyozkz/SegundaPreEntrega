import express from "express";
import handlebars from "express-handlebars";
import { Server } from "socket.io";
import mongoose from "mongoose";
import _dirname from "./utils.js";
import productsRouter from "./routes/productRoutes.js";
import cartsRouter from "./routes/cartRoutes.js";
import homeHandlebar from "./routes/viewRoutes.js";
import dotenv from "dotenv";

import { productsModel } from "./dao/models/productsModel.js";
import { messagesModel } from "./dao/models/messagesModel.js";
dotenv.config();

// import productosEnBd from "./dao/filesystem/managers/productMananger.js";
// const productosEnBd = productosEnEmpresa;
// let data = await productMananger.getProducts();

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(_dirname + `/public`));

mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Conectado a Mongo Atlas"))
  .catch((err) =>
    console.error("Cannot connect to Mongo Atlas")
  );

const httpServer = app.listen(port, () => {
  console.log(`servidor escuchando en el puerto 8080`);
});
const io = new Server(httpServer);

app.engine(`handlebars`, handlebars.engine());
app.set(`views`, "src/views");
app.set(`view engine`, `handlebars`);

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", homeHandlebar);

io.on(`connection`, async (socket) => {
  console.log(`Nuevo cliente conectado`);
  socket.emit(`datos`, await productsModel.find());
  socket.emit("messages", await messagesModel.find());
  socket.on("newMessage", async (data) => {
    await messagesModel.insertMany([data]);
    io.emit("messages", await messagesModel.find());
  });
});
