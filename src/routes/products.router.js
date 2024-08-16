import { Router } from "express";
import productModel from '../models/products.model.js';
import cartModel from '../models/carts.model.js';

const configureRouter = (io) => {
    const router = Router();

    // Ruta para obtener los productos por paginación y filtros
    router.get('/', async (req, res) => {
        const { limit = 5, page = 1, sort, query } = req.query;

        let filter = {};
        if (query) {
            const queryParts = query.split('=');
            if (queryParts.length === 2 && queryParts[0] === 'category') {
                filter.category = { $regex: queryParts[1], $options: 'i' };
            } else if (queryParts.length === 2 && queryParts[0] === 'status') {
                filter.status = queryParts[1] === 'true';
            }
        }

        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            sort: sort ? { price: sort === 'asc' ? 1 : -1 } : {}
        };

        try {
            const result = await productModel.paginate(filter, options);

            res.status(200).json({
                status: 'success',
                payload: result.docs,
                totalPages: result.totalPages,
                prevPage: result.prevPage,
                nextPage: result.nextPage,
                page: result.page,
                hasPrevPage: result.hasPrevPage,
                hasNextPage: result.hasNextPage,
                prevLink: result.hasPrevPage ? `/api/products?page=${result.prevPage}&limit=${limit}&sort=${sort}&query=${query}` : null,
                nextLink: result.hasNextPage ? `/api/products?page=${result.nextPage}&limit=${limit}&sort=${sort}&query=${query}` : null
            });
        } catch (err) {
            res.status(500).json({ status: 'error', msg: err.message });
        }
    });

    // Ruta para obtener un producto por su Id
    router.get('/:pid', async (req, res) => {
        try {
            const product = await productModel.findById(req.params.pid);
            if (product) {
                res.status(200).json(product);
            } else {
                res.status(404).json({ msg: "Product not found" });
            }
        } catch (err) {
            res.status(500).json({ msg: err.message });
        }
    });

    // Ruta para agregar un nuevo producto
    router.post('/', async (req, res) => {
        const { title, description, code, price, stock, category } = req.body;
        const newProduct = new productModel({
            title, description, code, price, status: req.body.status !== undefined ? req.body.status : true, stock, category
        });

        try {
            const savedProduct = await newProduct.save();
            res.status(201).json(savedProduct);
            io.emit('productData', savedProduct);
        } catch (err) {
            res.status(500).json({ msg: err.message });
        }
    });

    // Ruta para actualizar un producto por su Id
    router.put('/:pid', async (req, res) => {
        try {
            const updatedProduct = await productModel.findByIdAndUpdate(req.params.pid, req.body, { new: true });
            if (updatedProduct) {
                res.status(200).json(updatedProduct);
                io.emit('productData', updatedProduct); 
            } else {
                res.status(404).json({ msg: 'Product not found' });
            }
        } catch (err) {
            res.status(500).json({ msg: err.message });
        }
    });

    // Ruta para eliminar un producto por su Id
    router.delete('/:pid', async (req, res) => {
        try {
            const removedProduct = await productModel.findByIdAndDelete(req.params.pid);
            if (removedProduct) {
                await cartModel.updateMany({}, { $pull: { products: { product: req.params.pid } } });
                io.emit('productRemoved', { id: req.params.pid }); 
                io.emit('cartUpdated'); 
                res.status(200).json({ msg: `Id product: ${req.params.pid} successfully erased` });
            } else {
                res.status(404).json({ msg: 'Product not found' });
            }
        } catch (err) {
            res.status(500).json({ msg: err.message });
        }
    });

    // Ruta para ver los detalles del producto con renderizado
    router.get('/details/:pid', async (req, res) => {
        try {
            const product = await productModel.findById(req.params.pid);
            if (product) {
                res.render('productDetails', product.toObject());
            } else {
                res.status(404).json({ msg: "Product not found" });
            }
        } catch (err) {
            res.status(500).json({ msg: err.message });
        }
    });

    return router;
};

export default configureRouter;
