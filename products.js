// ========================================
// Apps Script API
// ========================================

const API_URL =
    "https://script.google.com/macros/s/AKfycbzoiQXbZQt12Ez_2yz2aQo4guCJwrmggYgGZr2XhB1N0xXXXH7qLUmp4-9xzDhMCvtN/exec";

// ========================================
// 商品商城
// ========================================


let products = [];


// ========================================
// 購物車
// ========================================

let cart =
    JSON.parse(
        localStorage.getItem("cart") || "{}"
    );


// ========================================
// 啟動
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const token =
            localStorage.getItem(
                "memberToken"
            );


        // 沒登入
        if (!token) {

            window.location.href =
                "index.html";

            return;

        }


        updateCartCount();

        loadProducts();

    }
);


// ========================================
// 取得商品
// ========================================

async function loadProducts() {

    const token =
        localStorage.getItem(
            "memberToken"
        );


    try {

        const response =
            await fetch(

                API_URL +
                "?action=products&token=" +
                encodeURIComponent(token)

            );


        const data =
            await response.json();


        if (!data.success) {

            alert(
                data.message ||
                "商品載入失敗"
            );


            if (
                data.message &&
                data.message.includes(
                    "登入"
                )
            ) {

                localStorage.removeItem(
                    "memberToken"
                );

                window.location.href =
                    "index.html";

            }

            return;

        }


        products =
            data.products || [];


        renderProducts();

    }
    catch (error) {

        console.error(error);

        document.getElementById(
            "productList"
        ).innerHTML = `

            <div class="empty-message">

                無法載入商品<br>
                請稍後再試

            </div>

        `;

    }

}


// ========================================
// 顯示商品
// ========================================

function renderProducts() {

    const container =
        document.getElementById(
            "productList"
        );


    if (!products.length) {

        container.innerHTML = `

            <div class="empty-message">

                目前沒有商品

            </div>

        `;

        return;

    }


    container.innerHTML =
        products.map(
            product => {

                const soldOut =
                    product.stock <= 0;


                const image =
                    product.imageUrl
                        ? `

                            <img
                                src="${escapeHtml(
                                    product.imageUrl
                                )}"
                                alt="${escapeHtml(
                                    product.name
                                )}"
                            >

                          `
                        : `

                            <div class="product-placeholder">
                                🛍️
                            </div>

                          `;


                return `

                    <div
                        class="product-card"
                    >

                        <div
                            class="product-image"
                        >

                            ${image}

                        </div>


                        <div
                            class="product-info"
                        >

                            <div
                                class="product-name"
                            >
                                ${escapeHtml(
                                    product.name
                                )}
                            </div>


                            <div
                                class="product-description"
                            >
                                ${escapeHtml(
                                    product.description
                                )}
                            </div>


                            <div
                                class="product-bottom"
                            >

                                <div>

                                    <div
                                        class="product-price"
                                    >
                                        ${formatMoney(
                                            product.price
                                        )}
                                    </div>


                                    <div
                                        class="product-stock"
                                    >
                                        ${
                                            soldOut
                                                ? "已售罄"
                                                : "庫存 " +
                                                  product.stock
                                        }
                                    </div>

                                </div>


                                ${
                                    soldOut

                                    ?

                                    `<button
                                        class="add-button disabled"
                                        disabled
                                    >
                                        已售罄
                                    </button>`

                                    :

                                    `<button
                                        class="add-button"
                                        onclick="addToCart('${escapeHtml(
                                            product.productId
                                        )}')"
                                    >
                                        加入購物車
                                    </button>`
                                }

                            </div>

                        </div>

                    </div>

                `;

            }
        ).join("");

}


// ========================================
// 加入購物車
// ========================================

function addToCart(productId) {

    const product =
        products.find(
            p =>
                p.productId ===
                productId
        );


    if (!product) {

        alert("找不到商品");

        return;

    }


    if (product.stock <= 0) {

        alert("此商品已售罄");

        return;

    }


    if (!cart[productId]) {

        cart[productId] = 1;

    }
    else {

        cart[productId]++;

    }


    // 不允許超過庫存

    if (
        cart[productId] >
        product.stock
    ) {

        cart[productId] =
            product.stock;

        alert(
            "已達目前庫存上限"
        );

    }


    saveCart();

    updateCartCount();

}


// ========================================
// 購物車數量
// ========================================

function updateCartCount() {

    const count =
        Object.values(cart)
            .reduce(
                (
                    total,
                    quantity
                ) =>
                    total + quantity,
                0
            );


    document.getElementById(
        "cartCount"
    ).textContent = count;

}


// ========================================
// 開啟購物車
// ========================================

function openCart() {

    renderCart();

    document
        .getElementById(
            "cartOverlay"
        )
        .classList.remove(
            "hidden"
        );

}


// ========================================
// 關閉購物車
// ========================================

function closeCart() {

    document
        .getElementById(
            "cartOverlay"
        )
        .classList.add(
            "hidden"
        );

}


// ========================================
// 顯示購物車
// ========================================

function renderCart() {

    const container =
        document.getElementById(
            "cartItems"
        );


    const items =
        Object.entries(cart)
            .map(
                ([productId, quantity]) => {

                    const product =
                        products.find(
                            p =>
                                p.productId ===
                                productId
                        );


                    if (!product) {
                        return "";
                    }


                    const subtotal =
                        product.price *
                        quantity;


                    return `

                        <div
                            class="cart-item"
                        >

                            <div>

                                <div
                                    class="cart-product-name"
                                >
                                    ${escapeHtml(
                                        product.name
                                    )}
                                </div>

                                <div
                                    class="cart-product-price"
                                >
                                    ${formatMoney(
                                        product.price
                                    )}
                                </div>

                            </div>


                            <div
                                class="cart-controls"
                            >

                                <button
                                    onclick="changeQuantity(
                                        '${escapeHtml(
                                            productId
                                        )}',
                                        -1
                                    )"
                                >
                                    −
                                </button>


                                <span>
                                    ${quantity}
                                </span>


                                <button
                                    onclick="changeQuantity(
                                        '${escapeHtml(
                                            productId
                                        )}',
                                        1
                                    )"
                                >
                                    ＋
                                </button>

                            </div>


                            <strong>
                                ${formatMoney(
                                    subtotal
                                )}
                            </strong>

                        </div>

                    `;

                }
            )
            .join("");


    if (!items) {

        container.innerHTML = `

            <div class="empty-cart">

                🛒

                <div>
                    購物車目前是空的
                </div>

            </div>

        `;

    }
    else {

        container.innerHTML =
            items;

    }


    document.getElementById(
        "cartTotal"
    ).textContent =
        formatMoney(
            getCartTotal()
        );

}


// ========================================
// 修改數量
// ========================================

function changeQuantity(
    productId,
    change
) {

    const product =
        products.find(
            p =>
                p.productId ===
                productId
        );


    if (!product) {
        return;
    }


    let quantity =
        Number(
            cart[productId] || 0
        );


    quantity += change;


    if (quantity <= 0) {

        delete cart[productId];

    }
    else {

        if (
            quantity >
            product.stock
        ) {

            quantity =
                product.stock;

        }

        cart[productId] =
            quantity;

    }


    saveCart();

    updateCartCount();

    renderCart();

}


// ========================================
// 購物車總額
// ========================================

function getCartTotal() {

    return Object.entries(cart)
        .reduce(
            (
                total,
                [productId, quantity]
            ) => {

                const product =
                    products.find(
                        p =>
                            p.productId ===
                            productId
                    );


                if (!product) {
                    return total;
                }


                return total +
                    product.price *
                    quantity;

            },
            0
        );

}


// ========================================
// 儲存購物車
// ========================================

function saveCart() {

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );

}


// ========================================
// 回首頁
// ========================================

function goHome() {

    window.location.href =
        "index.html";

}


// ========================================
// 確認購物車
// ========================================

function goCheckout() {

    if (
        Object.keys(cart).length === 0
    ) {

        alert(
            "購物車目前是空的"
        );

        return;

    }


    window.location.href =
        "checkout.html";

}


// ========================================
// 金額
// ========================================

function formatMoney(amount) {

    return "$" +
        Number(amount || 0)
            .toLocaleString(
                "zh-TW"
            );

}


// ========================================
// HTML 防注入
// ========================================

function escapeHtml(value) {

    return String(value || "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}
