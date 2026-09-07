// ========================================
// 結帳頁
// ========================================

let checkoutProducts = [];
let checkoutTotal = 0;


// ========================================
// Apps Script API
// ========================================

const CHECKOUT_API_URL =
    "你的 Apps Script 網址";


// ========================================
// 啟動
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadCheckout();

    }
);


// ========================================
// 載入結帳資料
// ========================================

async function loadCheckout() {

    const token =
        localStorage.getItem(
            "memberToken"
        );


    // 沒有登入 Token
    if (!token) {

        alert(
            "登入資訊已失效，請重新登入"
        );

        window.location.href =
            "index.html";

        return;

    }


    const cart =
        JSON.parse(
            localStorage.getItem(
                "cart"
            ) || "{}"
        );


    // 購物車是空的
    if (
        Object.keys(cart).length === 0
    ) {

        alert(
            "購物車目前是空的"
        );

        window.location.href =
            "products.html";

        return;

    }


    setLoading(true);


    try {

        // ====================================
        // 取得會員資料
        // ====================================

        const memberResponse =
            await fetch(

                CHECKOUT_API_URL +
                "?action=member&token=" +
                encodeURIComponent(token)

            );


        const memberData =
            await memberResponse.json();


        // Token 無效
        if (
            !memberData.success
        ) {

            localStorage.removeItem(
                "memberToken"
            );

            alert(
                "登入已失效，請重新登入"
            );

            window.location.href =
                "index.html";

            return;

        }


        // ====================================
        // 取得商品
        // ====================================

        const productResponse =
            await fetch(

                CHECKOUT_API_URL +
                "?action=products&token=" +
                encodeURIComponent(token)

            );


        const productData =
            await productResponse.json();


        if (
            !productData.success
        ) {

            alert(
                productData.message ||
                "商品資料讀取失敗"
            );

            return;

        }


        const products =
            productData.products || [];


        // ====================================
        // 整理購物車
        // ====================================

        checkoutProducts = [];


        Object.entries(cart)
            .forEach(
                ([productId, quantity]) => {

                    const product =
                        products.find(
                            p =>
                                p.productId ===
                                productId
                        );


                    if (!product) {
                        return;
                    }


                    const qty =
                        Number(quantity);


                    if (
                        !Number.isInteger(qty) ||
                        qty <= 0
                    ) {
                        return;
                    }


                    checkoutProducts.push({

                        productId:
                            product.productId,

                        name:
                            product.name,

                        price:
                            Number(
                                product.price
                            ),

                        stock:
                            Number(
                                product.stock
                            ),

                        quantity:
                            qty,

                        subtotal:
                            Number(
                                product.price
                            ) * qty

                    });

                }
            );


        if (
            checkoutProducts.length === 0
        ) {

            alert(
                "購物車內沒有有效商品"
            );

            window.location.href =
                "products.html";

            return;

        }


        // ====================================
        // 計算總額
        // ====================================

        checkoutTotal =
            checkoutProducts.reduce(

                (
                    total,
                    item
                ) => {

                    return total +
                        item.subtotal;

                },

                0

            );


        // ====================================
        // 顯示畫面
        // ====================================

        renderCheckout(
            memberData.member
        );

    }
    catch (error) {

        console.error(
            "Checkout Error:",
            error
        );


        document.getElementById(
            "checkoutMessage"
        ).textContent =
            "無法連線到會員系統，請稍後再試";

    }
    finally {

        setLoading(false);

    }

}


// ========================================
// 顯示訂單
// ========================================

function renderCheckout(member) {

    const container =
        document.getElementById(
            "checkoutItems"
        );


    container.innerHTML =
        checkoutProducts
            .map(
                item => `

                    <div
                        class="checkout-item"
                    >

                        <div>

                            <div
                                class="checkout-product-name"
                            >
                                ${escapeHtml(
                                    item.name
                                )}
                            </div>

                            <div
                                class="checkout-product-detail"
                            >
                                ${formatMoney(
                                    item.price
                                )}
                                ×
                                ${item.quantity}
                            </div>

                        </div>


                        <strong>
                            ${formatMoney(
                                item.subtotal
                            )}
                        </strong>

                    </div>

                `
            )
            .join("");


    document.getElementById(
        "currentBalance"
    ).textContent =
        formatMoney(
            member.balance
        );


    document.getElementById(
        "orderTotal"
    ).textContent =
        formatMoney(
            checkoutTotal
        );


    const balanceAfter =
        Number(member.balance) -
        checkoutTotal;


    document.getElementById(
        "balanceAfter"
    ).textContent =
        formatMoney(
            balanceAfter
        );


    // ====================================
    // 餘額不足
    // ====================================

    if (
        Number(member.balance) <
        checkoutTotal
    ) {

        const shortage =
            checkoutTotal -
            Number(member.balance);


        document.getElementById(
            "checkoutMessage"
        ).textContent =
            "餘額不足，還需要 " +
            formatMoney(
                shortage
            );


        document.getElementById(
            "confirmOrderButton"
        ).disabled = true;

    }

}


// ========================================
// 確認付款
// ========================================

document.getElementById(
    "confirmOrderButton"
).addEventListener(

    "click",

    submitOrder

);


async function submitOrder() {

    const token =
        localStorage.getItem(
            "memberToken"
        );


    if (!token) {

        alert(
            "登入已失效，請重新登入"
        );

        window.location.href =
            "index.html";

        return;

    }


    const cart =
        JSON.parse(
            localStorage.getItem(
                "cart"
            ) || "{}"
        );


    const items =
        Object.entries(cart)
            .map(
                ([productId, quantity]) => ({

                    productId:
                        productId,

                    quantity:
                        Number(quantity)

                })
            );


    if (!items.length) {

        alert(
            "購物車目前是空的"
        );

        return;

    }


    const button =
        document.getElementById(
            "confirmOrderButton"
        );


    button.disabled = true;


    setLoading(true);


    try {

        const response =
            await fetch(
                CHECKOUT_API_URL,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "text/plain;charset=utf-8"

                    },

                    body:
                        JSON.stringify({

                            action:
                                "createOrder",

                            token:
                                token,

                            items:
                                items

                        })

                }
            );


        const data =
            await response.json();


        // ====================================
        // 下單失敗
        // ====================================

        if (!data.success) {

            document.getElementById(
                "checkoutMessage"
            ).textContent =
                data.message ||
                "下單失敗";


            if (
                data.code ===
                "INSUFFICIENT_BALANCE"
            ) {

                document.getElementById(
                    "checkoutMessage"
                ).textContent =
                    "儲值餘額不足，還需要 " +
                    formatMoney(
                        data.shortage
                    );

            }


            button.disabled = false;

            return;

        }


        // ====================================
        // 下單成功
        // ====================================

        localStorage.removeItem(
            "cart"
        );


        document.getElementById(
            "checkoutItems"
        ).innerHTML = `

            <div class="order-success">

                <div class="success-icon">
                    ✓
                </div>

                <div class="success-title">
                    訂單成立
                </div>

                <div class="success-order">
                    訂單編號：
                    ${escapeHtml(
                        data.order.orderId
                    )}
                </div>

            </div>

        `;


        document.getElementById(
            "currentBalance"
        ).textContent =
            formatMoney(
                data.order.balanceBefore
            );


        document.getElementById(
            "orderTotal"
        ).textContent =
            formatMoney(
                data.order.totalAmount
            );


        document.getElementById(
            "balanceAfter"
        ).textContent =
            formatMoney(
                data.order.balanceAfter
            );


        document.getElementById(
            "checkoutMessage"
        ).textContent =
            "付款成功，已從儲值餘額扣款。";


        button.style.display =
            "none";


        // 3 秒後回首頁

        setTimeout(
            function () {

                window.location.href =
                    "index.html";

            },
            3000
        );


    }
    catch (error) {

        console.error(
            "Create Order Error:",
            error
        );


        document.getElementById(
            "checkoutMessage"
        ).textContent =
            "系統連線錯誤，訂單尚未建立";


        button.disabled = false;

    }
    finally {

        setLoading(false);

    }

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
// 防止 HTML 注入
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


// ========================================
// Loading
// ========================================

function setLoading(show) {

    const loading =
        document.getElementById(
            "loading"
        );


    if (show) {

        loading.classList.remove(
            "hidden"
        );

    }
    else {

        loading.classList.add(
            "hidden"
        );

    }

}
