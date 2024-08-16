import fs from 'fs'; 
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(dirname(__filename));

const productsFilePath = path.join(__dirname, 'data', 'products.json');

export function readProducts() {
    if (fs.existsSync(productsFilePath)) { 
        return JSON.parse(fs.readFileSync(productsFilePath, 'utf8')); 
    }
    return []; 
}

export function writeProducts(products) {
    if (!products) { 
        throw new Error('No se puede ingresar este producto'); 
    }
    const data = JSON.stringify(products, null, 2); 
    if (data === undefined) { 
        throw new Error('No se puede ingresar este producto'); 
    }
    fs.writeFileSync(productsFilePath, data, 'utf8'); 
}

const cartsFilePath = path.join(__dirname, 'data', 'carts.json');

export function readCarts() {
    if (fs.existsSync(cartsFilePath)) { 
        return JSON.parse(fs.readFileSync(cartsFilePath, 'utf8')); 
    }
    return []; 
}

export function writeCarts(carts) {
    if (!carts) {
        throw new Error('No se puede ingresar este producto'); 
    }
    const data = JSON.stringify(carts, null, 2); 
    if (data === undefined) { 
        throw new Error('No se puede ingresar este producto'); 
    }
    fs.writeFileSync(cartsFilePath, data, 'utf8'); 
}

export default __dirname;