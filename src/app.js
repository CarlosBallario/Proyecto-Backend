import express from 'express';
import handlebars from 'express-handlebars';
import path from 'path';
import { Server } from 'socket.io';
import http from 'http';
import mongoose from 'mongoose';
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import viewsRouter from './routes/views.router.js';
import userRouter from './routes/user.router.js';
import __dirname from './utils/utils.js';

const app = express();
const PORT = 8080;

// Conexión a MongoDB
mongoose.connect('mongodb+srv://carlosballario:Milanesa2o2o@cluster0.8t59f.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  /*useNewUrlParser: true,
  useUnifiedTopology: true,*/
})
  .then(() => console.log('Conexión a la base de datos establecida'))
  .catch((error) => console.error('Error al conectar a la base de datos:', error));

// Middlewares 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware 
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de Handlebars
app.engine('handlebars', handlebars.engine());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');

// Servidor HTTP
const httpServer = http.createServer(app);

// Socket.IO
const io = new Server(httpServer);

io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');

  socket.on('productData', (data) => {
    console.log('Product data received:', data);
    io.emit('productData', data); 
  });

  socket.on('removeProduct', (data) => {
    console.log('Remove product:', data);
    io.emit('productRemoved', data); 
  });
});

// Routers
app.use('/api/products', productsRouter(io));
app.use('/api/carts', cartsRouter(io));
app.use('/api/users', userRouter);  
app.use('/', viewsRouter);


app.get('/test', (req, res) => {
  res.render('productDetails', { 
      title: 'Test Product', 
      _id: '123', 
      description: 'This is a test description', 
      code: 'TEST123', 
      price: 100, 
      stock: 10, 
      category: 'Test Category' 
  });
});







// Iniciar servidor
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
