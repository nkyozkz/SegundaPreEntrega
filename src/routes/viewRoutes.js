import express from "express";
import mongoose from "mongoose";
const router = express.Router();
//import productosEnBd from "../dao/filesystem/managers/productMananger.js";
import { productsModel } from "../dao/models/productsModel.js";
import { cartsModel } from "../dao/models/cartsModel.js";
import { actualizarPagina } from "../public/js/funcionActualizaLinks.js";
//const productMananger = productosEnBd;

router.get(`/`, async (req, res) => {
  res.render(`home`, {
    style: "inicio.css",
  });
});

router.get(`/products`, async (req, res) => {
  const productos = await productsModel.paginate(
    {},
    { limit: 3, page: 1, lean: true }
  ); //* Buscamos los productos
  if (productos && productos.docs.length > 0) {
    //* Verificamos la existencia de los producto
    if (
      req.query.limit ||
      req.query.page ||
      req.query.sort ||
      req.query.query //* Revisamos si tienen params
    ) {
      let limite = req.query.limit;
      let pagina = req.query.page;
      let orden = req.query.sort;
      let query = req.query.query; //* Guardamos los params

      let filter = {
        //* Creamos una variable para configurar los filtros de la peticion
      };
      let options = {
        //* Creamos una variable para configurar las opciones de la peticion
        limit: limite || 3,
        page: pagina || 1,
        lean: true,
      };

      if (orden == "asc" || orden == "desc" || orden == 1 || orden == -1) {
        //* En caso de que se pida ordenamiento agregamos la opcion
        options = {
          ...options,
          sort: { price: orden },
        };
      }
      if (query == "disponible") {
        //* En caso de que se busque por disponibilidad agregamos el filtro
        filter = {
          status: true,
        };
      }
      if (query == "agotado") {
        //* En caso de que se busque por disponibilidad agregamos el filtro
        filter = {
          status: false,
        };
      }
      const response = await productsModel.paginate(filter, options); //* Hacemos la paginación

      if (filter.status == false && response.docs.length < 1) {
        let mensaje = "No hay productos agotados";
        return res.render(`products`, {
          mensaje,
          style: "listasDeProductos.css",
        });
      }
      if (pagina > response.totalPages || 0 >= pagina) {
        //* En caso de que busque una página inexistente sera informado
        let mensaje = `Página no encontrada, las páginas van de 1 a ${response.totalPages} `;
        return res.render(`products`, {
          mensaje,
          style: "listasDeProductos.css",
        });
      }

      let newGetFormat = {
        status: "Success",
        payload: response.docs,
        totalPages: response.totalPages,
        prevPage: response.prevPage,
        nextPage: response.nextPage,
        page: response.page,
        hasPrevPage: response.hasPrevPage,
        hasNextPage: response.hasNextPage,
        prevLink: actualizarPagina(
          await response.totalPages,
          "anterior",
          req.originalUrl
        ),
        nextLink: actualizarPagina(
          await response.totalPages,
          "siguiente",
          req.originalUrl
        ),
        firstLink: actualizarPagina(
          await response.totalPages,
          "first",
          req.originalUrl
        ),
        ultimateLink: actualizarPagina(
          await response.totalPages,
          "ultimate",
          req.originalUrl
        ),
      };

      let data = newGetFormat.payload;
      let nextLink = newGetFormat.nextLink;
      let prevLink = newGetFormat.prevLink;
      let firstLink = newGetFormat.firstLink;
      let ultimateLink = newGetFormat.ultimateLink;
      let page = newGetFormat.page;
      return res.render(`products`, {
        firstLink,
        ultimateLink,
        prevLink,
        nextLink,
        page,
        data,
        style: "listasDeProductos.css",
      });
    }
    let data = await productos.docs;
    let prevLink = actualizarPagina(
      await productos.totalPages,
      "anterior",
      req.originalUrl
    );
    let nextLink = actualizarPagina(
      await productos.totalPages,
      "siguiente",
      req.originalUrl
    );
    let firstLink = actualizarPagina(
      await productos.totalPages,
      "first",
      req.originalUrl
    );
    let ultimateLink = actualizarPagina(
      await productos.totalPages,
      "ultimate",
      req.originalUrl
    );
    let page = await productos.page;

    return res.render(`products`, {
      firstLink,
      ultimateLink,
      prevLink,
      nextLink,
      page,
      data,
      style: "listasDeProductos.css",
    });
  } else {
    let mensaje = "No se encontro ningun producto";
    return res.render(`products`, {
      mensaje,
      style: "listasDeProductos.css",
    });
  }
});

router.get(`/realtimeproducts`, async (req, res) => {
  res.render(`realtimeProducts`, {
    style: "listasDeProductos.css",
  });
});

router.get(`/chat`, async (req, res) => {
  res.render(`chat`, {
    style: "chat.css",
  });
});

router.get(`/products/:pid`, async (req, res) => {
  let id = req.params.pid;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    let error = "Id no válido";
    return res.render(`detalles`, {
      error,
      style: "detalles.css",
    });
  }
  let producto = await productsModel.findOne({ _id: id });
  if (!producto) {
    let error = "Producto no encontrado";
    return res.render(`detalles`, {
      error,
      style: "detalles.css",
    });
  }
  let { _id, title, description, price, thumbnail, stock } = producto;

  res.render(`detalles`, {
    _id,
    title,
    description,
    price,
    thumbnail,
    stock,
    style: "detalles.css",
  });
});
router.get(`/cart/:cid`, async (req, res) => {
  let id = req.params.cid;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    let error = "Id del carrito no válido";
    return res.render(`detalles`, {
      error,
      style: "detalles.css",
    });
  }
  let carrito = await cartsModel.findOne({ _id: id });
  if (!carrito) {
    let error = "Carrito no encontrado";
    return res.render(`detalles`, {
      error,
      style: "detalles.css",
    });
  }
  let traerProductos = [];
  for(let producto of carrito.products){
    let buscarProducto= await productsModel.findOne({_id:producto._id}).lean().exec()
    let nuevoObjeto={
      ...buscarProducto,
      quantity:producto.quantity
    }
    traerProductos.push(nuevoObjeto)
  }
  
  res.render(`carrito`, {
    traerProductos,
    style: "carrito.css",
  });
});
export default router;
