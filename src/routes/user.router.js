import { Router } from 'express';
import userModel from '../models/user.model.js';

const router = Router();

// Obtener todos los usuarios
router.get("/", async (req, res) => {
    try {
        const users = await userModel.find();
        res.status(200).json({ result: 'Success', payload: users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'Error', error: 'Internal server error' });
    }
});

// Crear un nuevo usuario
router.post("/", async (req, res) => {
    const { name, lastName, email, address } = req.body;
    if (!name || !lastName || !email || !address) {
        return res.status(400).json({ status: 'Error', error: 'Parameters missing' });
    }

    try {
        const result = await userModel.create({ name, lastName, email, address });
        res.status(201).json({ result: 'Success', payload: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'Error', error: 'Internal server error' });
    }
});

// Actualizar un usuario por su ID
router.put("/:uid", async (req, res) => {
    const { uid } = req.params;
    const { name, lastName, email, address } = req.body;
    if (!name || !lastName || !email || !address) {
        return res.status(400).json({ status: 'Error', error: 'Parameters missing' });
    }

    try {
        const result = await userModel.updateOne({ _id: uid }, { name, lastName, email, address });
        res.status(200).json({ result: 'Success', payload: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'Error', error: 'Internal server error' });
    }
});

// Eliminar un usuario por su ID
router.delete("/:uid", async (req, res) => {
    const { uid } = req.params;
    try {
        const result = await userModel.deleteOne({ _id: uid });
        res.status(200).json({ result: 'Success', payload: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'Error', error: 'Internal server error' });
    }
});

export default router;
