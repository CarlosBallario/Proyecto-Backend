const socket = io();

const productForm = document.querySelector("#productForm");

function renderProducts(products) {
    const productsList = document.getElementById("products");
    if (!productsList) {
        console.error('Elemento de productos no encontrado');
        return;
    }
    productsList.innerHTML = "";  

    products.forEach((product) => {
        const col = document.createElement("div");
        col.className = "col-md-4";
        col.innerHTML = `
            <div class="card mb-4" id="product-${product._id}">
                <div class="card-body">
                    <h5 class="card-title">${product.title}</h5>
                    <p class="card-text">${product.description}</p>
                    <p class="card-text">Price: $${product.price}</p>
                    <p class="card-text">Stock: <span id="stock-${product._id}">${product.stock}</span></p>
                    <p class="card-text">Category: ${product.category}</p>
                    <button class="btn btn-primary" onclick="viewDetails('${product._id}')">Detalles</button>
                    <button class="btn btn-success" onclick="promptAddToCart('${product._id}')">Agregar al carrito</button>
                    <button class="btn btn-danger delete-btn" data-id="${product._id}">Eliminar</button>
                </div>
            </div>
        `;
        productsList.appendChild(col);
    });

    document.querySelectorAll(".delete-btn").forEach(button => {
        button.addEventListener("click", () => {
            const productId = button.getAttribute("data-id");
            socket.emit("deleteProduct", productId);
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    fetchProducts();
    fetch('/api/carts')
        .then(response => response.json())
        .then(cart => {
            if (cart) {
                updateCartList(cart);
            } else {
                updateCartList({ products: [] });
            }
        })
        .catch(err => console.error('Error carrito:', err));
});

socket.on("updateProducts", (products) => {
    renderProducts(products);
});

socket.on("productRemoved", (data) => {
    const productItem = document.getElementById(`product-${data.id}`);
    if (productItem) {
        productItem.remove();
    }
});

socket.on("productData", (data) => {
    addProductToList(data);
});

socket.on("productUpdated", (product) => {
    updateProductStock(product._id, product.stock);
});

socket.on("cartUpdated", (cart) => {
    updateCartList(cart);
});

socket.on("cartCleared", () => {
    clearCartUI();
});

productForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(productForm);
    const product = {
        title: formData.get("title"),
        description: formData.get("description"),
        code: formData.get("code"),
        price: parseFloat(formData.get("price")),
        stock: parseInt(formData.get("stock")),
        category: formData.get("category"),
        status: document.getElementById("status").checked
    };
    fetch('/api/products', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
    })
    .then(response => response.json())
    .then(newProduct => {
        console.log('Product added:', newProduct);
        addProductToList(newProduct);
    })
    .catch(err => console.error('Error al agregar un producto:', err));

    productForm.reset();
});

function addProductToList(product) {
    const productsList = document.getElementById("products");
    if (!productsList) {
        console.error('Elemento de un productos no encontrado');
        return;
    }
    const col = document.createElement("div");
    col.className = "col-md-4";
    col.innerHTML = `
        <div class="card mb-4" id="product-${product._id}">
            <div class="card-body">
                <h5 class="card-title">${product.title}</h5>
                <p class="card-text">${product.description}</p>
                <p class="card-text">Price: $${product.price}</p>
                <p class="card-text">Stock: <span id="stock-${product._id}">${product.stock}</span></p>
                <p class="card-text">Category: ${product.category}</p>
                <button class="btn btn-primary" onclick="viewDetails('${product._id}')">Detalles</button>
                <button class="btn btn-success" onclick="promptAddToCart('${product._id}')">Agregar al carrito</button>
                <button class="btn btn-danger delete-btn" data-id="${product._id}">ELiminar</button>
            </div>
        </div>
    `;
    productsList.appendChild(col);

    document.querySelectorAll(".delete-btn").forEach(button => {
        button.addEventListener("click", () => {
            const productId = button.getAttribute("data-id");
            socket.emit("deleteProduct", productId);
        });
    });
}

function updateProductStock(productId, newStock) {
    const stockElement = document.getElementById(`stock-${productId}`);
    if (stockElement) {
        stockElement.textContent = newStock;
    }
}

function updateCartList(cart) {
    const cartList = document.getElementById('cart-items');
    const emptyCartMessage = document.getElementById('empty-cart');
    if (!cartList) {
        console.error('Elemento del carrito no encontrado');
        return;
    }
    cartList.innerHTML = '';

    if (!cart || !cart.products || cart.products.length === 0) {
        emptyCartMessage.style.display = 'block';
    } else {
        emptyCartMessage.style.display = 'none';
        cart.products.forEach(item => {
            const product = item.product;
            const cartItem = document.createElement('li');
            cartItem.className = 'list-group-item';
            cartItem.id = `cart-${product._id}`;
            cartItem.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>Title:</strong> ${product.title || 'undefined'} <br>
                        <strong>Quantity:</strong> <span id="cart-quantity-${product._id}">${item.quantity}</span>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-danger" onclick="promptRemoveFromCart('${product._id}')">Remove</button>
                    </div>
                </div>`;
            cartList.appendChild(cartItem);
        });
    }
}

function updateCartQuantity(productId, newQuantity) {
    const quantityElement = document.getElementById(`cart-quantity-${productId}`);
    if (quantityElement) {
        quantityElement.textContent = newQuantity;
    }
}

function promptAddToCart(productId) {
    Swal.fire({
        title: 'Ingresar la cantidad',
        input: 'number',
        inputAttributes: {
            min: 1
        },
        showCancelButton: true,
        confirmButtonText: 'Agregar al carrito',
        preConfirm: (quantity) => {
            return addToCart(productId, parseInt(quantity, 10));
        }
    });
}

function promptRemoveFromCart(productId) {
    Swal.fire({
        title: 'Ingrese la cantidad a eliminar',
        input: 'number',
        inputAttributes: {
            min: 1
        },
        showCancelButton: true,
        confirmButtonText: 'Remover del carrito',
        preConfirm: (quantity) => {
            return removeFromCart(productId, parseInt(quantity, 10));
        }
    });
}

function viewDetails(productId) {
    window.location.href = `/api/products/details/${productId}`;
}

function confirmRemoveProduct(productId) {
    Swal.fire({
        title: 'Estas seguro que quieres elimianr este procto?',
        showCancelButton: true,
        confirmButtonText: 'Si, Eliminar',
        cancelButtonText: 'No,Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            removeProduct(productId);
        }
    });
}

function addToCart(productId, quantity) {
    fetch(`/api/carts/add/${productId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity: quantity })
    })
    .then(response => response.json())
    .then(cart => {
        console.log('Producto agregado:', cart);
        socket.emit('cartUpdated', cart);
    })
    .catch(err => console.error('Error al agregar al carrito:', err));
}

function removeProduct(id) {
    fetch(`/api/products/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(result => {
        console.log('Producto eliminado:', result);
        const productItem = document.getElementById(`product-${id}`);
        if (productItem) {
            productItem.remove();
        }
        socket.emit('cartUpdated');
    })
    .catch(err => console.error('Error al eliminar el producto:', err));
}

function removeFromCart(productId, quantity) {
    if (!productId) {
        console.error('Producto no encontrado');
        return;
    }

    fetch(`/api/carts/remove/${productId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity: quantity })
    })
    .then(response => response.json())
    .then(cart => {
        console.log('Producto eliminado:', cart);
        socket.emit('cartUpdated', cart);
    })
    .catch(err => console.error('Error al eliminar el producto:', err));
}

function clearCart() {
    fetch('/api/carts/clear', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(cart => {
        console.log('Cart cleared:', cart);
        updateCartList(cart);
        socket.emit('cartCleared');
        cart.products.forEach(item => {
            socket.emit('productUpdated', item.product);
        });
    })
    .catch(err => console.error('Error:', err));
}

function clearCartUI() {
    const cartList = document.getElementById('cart-items');
    if (!cartList) {
        console.error('Carrito no encontrado');
        return;
    }
    cartList.innerHTML = '';
    const emptyCartMessage = document.getElementById('empty-cart');
    emptyCartMessage.style.display = 'block';
}

function fetchProducts(page = 1, limit = 10, sort = '', query = '') {
    fetch(`/api/products?page=${page}&limit=${limit}&sort=${sort}&query=${query}`)
        .then(response => response.json())
        .then(response => {
            if (response.status === 'success') {
                renderProducts(response.payload);

                const paginationControls = document.getElementById('pagination-controls');
                if (paginationControls) {
                    paginationControls.innerHTML = `
                        <nav>
                            <ul class="pagination">
                                ${response.hasPrevPage ? `<li class="page-item"><a class="page-link" href="#" onclick="fetchProducts(${response.prevPage}, ${limit}, '${sort}', '${query}')">Previous</a></li>` : ''}
                                <li class="page-item active"><a class="page-link" href="#">${response.page}</a></li>
                                ${response.hasNextPage ? `<li class="page-item"><a class="page-link" href="#" onclick="fetchProducts(${response.nextPage}, ${limit}, '${sort}', '${query}')">Next</a></li>` : ''}
                            </ul>
                        </nav>
                    `;
                } else {
                    console.error('Error paginación');
                }
            } else {
                console.error('Error productos:', response.msg);
            }
        })
        .catch(err => console.error('Error productos:', err));
}
