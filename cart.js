document.addEventListener("DOMContentLoaded", function () {
    if (!localStorage.getItem("wallet_balance")) {
        localStorage.setItem("wallet_balance", "4200.00");
    }

    updateBalanceDisplay();
    updateCartCount();

    if (document.querySelector(".checkout-wrapper")) {
        renderCartPage();
    }

    const headerContainer = document.querySelector(".header-container");
    if (headerContainer && !document.querySelector(".burger-menu-btn")) {
        const burger = document.createElement("div");
        burger.className = "burger-menu-btn";
        burger.innerHTML = "<span></span><span></span><span></span>";
        headerContainer.appendChild(burger);

        burger.addEventListener("click", function () {
            const navRight = document.querySelector(".nav-right");
            if (navRight) {
                navRight.classList.toggle("active");
                burger.classList.toggle("active");
            }
        });
    }

    const buyButtons = document.querySelectorAll(".add-to-cart-btn");
    buyButtons.forEach(button => {
        button.addEventListener("click", function () {
            const id = this.getAttribute("data-id");
            const name = this.getAttribute("data-name");
            const price = parseFloat(this.getAttribute("data-price"));
            const img = this.getAttribute("data-img");

            addToCart(id, name, price, img);
        });
    });

    const payButtons = document.querySelectorAll(".btn-checkout-action");
    payButtons.forEach(button => {
        if (button.textContent.trim() === "Оплатить") {
            button.addEventListener("click", function (e) {
                e.preventDefault();
                const cart = getCart();
                if (cart.length === 0) {
                    alert("Ваша корзина пуста!");
                    return;
                }

                const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                const currentBalance = parseFloat(localStorage.getItem("wallet_balance"));

                if (currentBalance < total) {
                    alert("Недостаточно средств на балансе! Пожалуйста, пополните кошелёк.");
                    window.location.href = "wallet.html";
                    return;
                }

                const newBalance = currentBalance - total;
                localStorage.setItem("wallet_balance", newBalance.toFixed(2));
                
                localStorage.removeItem("cart");
                updateCartCount();
                updateBalanceDisplay();
                window.location.href = "success.html";
            });
        }
    });
});

function updateBalanceDisplay() {
    const currentBalance = parseFloat(localStorage.getItem("wallet_balance") || "4200.00").toFixed(2);
    const balanceSpans = document.querySelectorAll(".balance, #wallet-current-amount");
    
    balanceSpans.forEach(el => {
        if (el.id === "wallet-current-amount") {
            el.textContent = currentBalance + " р.";
        } else if (el.tagName === "SPAN") {
            const balanceLink = document.createElement("a");
            balanceLink.className = "balance";
            balanceLink.href = "wallet.html";
            balanceLink.textContent = "Баланс (" + currentBalance + " р.)";
            el.parentNode.replaceChild(balanceLink, el);
        } else {
            el.textContent = "Баланс (" + currentBalance + " р.)";
        }
    });
}

function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const cartCountElement = document.getElementById("cart-count");
    if (cartCountElement) {
        const cart = getCart();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems;
    }
}

function addToCart(id, name, price, img) {
    let cart = getCart();
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id, name, price, img, quantity: 1 });
    }

    saveCart(cart);
}

function renderCartPage() {
    const checkoutWrapper = document.querySelector(".checkout-wrapper");
    const checkoutColumns = document.querySelector(".checkout-columns");
    
    let cartContainer = document.getElementById("cart-items-container");
    if (!cartContainer) {
        cartContainer = document.createElement("div");
        cartContainer.id = "cart-items-container";
        cartContainer.style.width = "100%";
        cartContainer.style.marginBottom = "30px";
        checkoutWrapper.insertBefore(cartContainer, checkoutColumns);
    }

    const cart = getCart();
    cartContainer.innerHTML = "";

    if (cart.length === 0) {
        cartContainer.innerHTML = "<p style='text-align:center; font-size:18px;'>Корзина пуста</p>";
        updateTotalPrice(0);
        return;
    }

    let total = 0;

    cart.forEach(item => {
        const itemPriceTotal = item.price * item.quantity;
        total += itemPriceTotal;

        const itemRow = document.createElement("div");
        itemRow.className = "checkout-item-card";
        itemRow.style.marginBottom = "20px"; 

        itemRow.innerHTML = `
            <div class="checkout-item-left">
                <img src="${item.img}" alt="${item.name}" class="checkout-item-img">
            </div>
            <div class="checkout-item-right">
                <div>
                    <h3>${item.name} (x${item.quantity})</h3>
                    <p class="checkout-item-price">${itemPriceTotal} р.</p>
                </div>
                <div style="margin-top: 15px;">
                    <button class="btn-edition-cart" onclick="changeQuantity('${item.id}', 1)" style="padding: 5px 15px; margin-right: 10px; cursor: pointer;">Добавить</button>
                    <button class="btn-edition-cart" onclick="changeQuantity('${item.id}', -1)" style="padding: 5px 15px; cursor: pointer;">Удалить</button>
                </div>
            </div>
        `;
        cartContainer.appendChild(itemRow);
    });

    updateTotalPrice(total);
}

function changeQuantity(id, amount) {
    let cart = getCart();
    const item = cart.find(item => item.id === id);

    if (item) {
        item.quantity += amount;
        if (item.quantity <= 0) {
            cart = cart.filter(item => item.id !== id);
        }
        saveCart(cart);
        renderCartPage();
    }
}

function updateTotalPrice(total) {
    const totalPriceElement = document.getElementById("total-price");
    if (totalPriceElement) {
        totalPriceElement.textContent = total + " р.";
    }
}