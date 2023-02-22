import express from "express";
const router = express.Router();
import productosEnBd from "../utils/productManager.js";
const productManager = productosEnBd;
export let data = await productManager.getProducts();

router.get(`/`, async (req, res) => {
  res.render(`home`, {
    data,
    style: "container.css",
  });
});

router.get(`/realtimeproducts`, async (req, res) => {
  res.render(`realtimeProducts`, {
    style: "container.css",
  });
});
export default router;
