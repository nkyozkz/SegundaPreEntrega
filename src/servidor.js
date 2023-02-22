import express from "express";
import handlebars from "express-handlebars";
import { Server } from "socket.io";
import _dirname from "./utils.js";
import productsRouter from "./routes/productos_rutas.js";
import cartsRouter from "./routes/carrito_rutas.js";
import homeHandlebar from "./routes/viewRoutes.js";
import productosEnBd from "./utils/productManager.js";
const productManager = productosEnBd;
let data = await productManager.getProducts();

const app = express();
const port = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(_dirname + `/public`));

const httpServer = app.listen(port, () => {
  console.log("Running in port", port);
});
const socketServer = new Server(httpServer);

app.engine(`handlebars`, handlebars.engine());
app.set(`views`, "src/views");
app.set(`view engine`, `handlebars`);

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", homeHandlebar);

socketServer.on(`connection`, async (socket) => {
  console.log("Cliente conectado");
  socket.emit(`datos`, await data);
});
