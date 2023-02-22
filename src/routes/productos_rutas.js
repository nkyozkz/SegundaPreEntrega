import { Router } from "express";
import productosEnBd from "../utils/productManager.js";
const router = Router();
const productManager = productosEnBd;

router.get("/", async (req, res) => {
  const productos = await productManager.getProducts();
  if (productos) {
    if (req.query.limit <= productos.length && req.query.limit > 0) {
      res.send(productos.slice(0, req.query.limit));
    } else if (req.query.limit) {
      res.send(`<h1>El limite de productos no puede ser nulo ni mayor a los productos dados, productos actuales: </h1><br>
      ${productos.map((p) => `<h2>${p.title}</h2>`)}`);
    } else {
      res.send(productos);
    }
  } else {
    res.send(`No se encontro ningun producto`);
  }
});

router.post("/", async (req, res) => {
  let nuevoProducto = req.body;
  const response = await productManager.addProduct(nuevoProducto);
  if (!response.success) {
    return res.status(400).send(response.message);
  }
  res.status(200).send(response.message);
});

router.get("/:pid", async (req, res) => {
  let producto = await productManager.getProductById(req.params.pid);
  producto ? res.send(producto) : res.send("El id del producto no existe");
});

router.put("/:pid", async (req, res) => {
  let producto = await productManager.getProductById(req.params.pid);
  if (producto) {
    let nuevaInformacion = req.body;
    if (nuevaInformacion) {
      await productManager.uptadeProduct(req.params.pid, nuevaInformacion);
      res.send(`Actualizado correctamente`);
    } else {
      res.send(`Coloca la información a cambiar`);
    }
  } else {
    res.send("El id del producto no existe");
  }
});

router.delete("/:pid", async (req, res) => {
  let producto = await productManager.getProductById(req.params.pid);
  if (producto) {
    res.send(await productManager.deleteProduct(req.params.pid));
  } else {
    res.send("El id del producto no existe");
  }
});

export default router;
