// Cart functionality placeholder
console.log('Cart.js loaded');

function clearCart() {
    console.log('Clearing cart...');
    const cartItems = document.getElementById('cartItems');
    if (cartItems) {
        cartItems.innerHTML = '<div class="empty-cart"><i class="fas fa-shopping-basket"></i><h3>Your cart is empty</h3></div>';
    }
}

function printCoupons() {
    console.log('Printing coupons...');
    window.print();
}