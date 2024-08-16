import express from 'express'; 
import { readProducts } from '../utils/utils.js'; 

const router = express.Router(); 
const getProducts = () => readProducts();

router.get('/', (req, res) => {
    const products = getProducts(); 
    res.render('home', { products }); 
});

router.get('/realtimeproducts', (req, res) => {
    const products = readProducts(); 
    res.render('realTimeProducts', { products }); 
});

export default router; 
