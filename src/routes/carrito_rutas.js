import { Router } from "express";
const router = Router();
import carrito from "../utils/cartManager.js";
import productosEnBd from "../utils/productManager.js";
const productManager = productosEnBd;

router.post("/", async (req, res) => {
  res.send(await carrito.addCart());
});
router.get("/:cid", async (req, res) => {
  res.send(await carrito.getCart(req.params.cid));
});
router.post("/:cid/products/:pid", async (req, res) => {
  if (req.params.cid && req.params.pid) {
    let idCarrito;
    let idProducto;
    if (
      (await carrito.getCart(req.params.cid)) ==
      `Carrito no encontrado, verifique el id ingresado`
    ) {
      idCarrito = false;
    } else {
      idCarrito = true;
    }
    if (
      (await productManager.getProductById(req.params.pid)) ==
      `Producto no encontrado`
    ) {
      idProducto = false;
    } else {
      idProducto = true;
    }
    if (idProducto && idCarrito) {
      await carrito.addProductInCart(req.params.cid, req.params.pid);
      res.send(`Producto agregado con exito`);
    } else if (idCarrito) {
      res.send(
        `El id del carrito es correcto, pero el del producto es incorrecto.`
      );
    } else if (idProducto) {
      res.send(
        `El id del producto es correcto, pero el del carrito es incorrecto.`
      );
    } else {
      res.send(`Ambos id son incorrectos`);
    }
  } else {
    res.send(
      `Envia todos los parametros para poder agregar al carrito`
    );
  }
});

export default router;
