// ========================================
// 確認訂單
// ========================================

let checkoutProducts = [];

let checkoutTotal = 0;


// ========================================
// 啟動
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        const token =
            localStorage.getItem(
                "memberToken"
            );


        if (!token) {

            window.location.href =
                "index.html";

            return;

        }


        await loadCheckout();

    }
);


// ========================================
// 載入確認訂單
// ========================================

async function loadCheckout() {

    const token =
        localStorage.getItem(
            "memberToken"
        );


    const cart =
        JSON.parse(
            localStorage.getItem(
                "cart"
            ) || "{}"
        );


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

        // 同時取得會員與商品

        const [
            memberResponse,
            productResponse
        ] = await Promise.all([

            fetch(
                API_URL +
                "?action=member&token=" +
                encodeURIComponent(token)
            ),

            fetch(
                API_URL +
                "?action=products&token=" +
                encodeURIComponent(token)
            )

        ]);


        const memberData =
            await memberResponse.json();

        const productData =
            await productResponse.json();


        if (
            !memberData.success
        ) {

            localStorage.removeItem(
                "memberToken"
            );

            window.location.href =
                "index.html";

            return;

        }


        if (
            !productData.success
        ) {

            alert(
                productData.message ||
                "商品讀取失敗"
            );

            return;

        }


        const products =
            productData.products;


        checkoutProducts =
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
                            return null;
                        }


                        return {

                            ...product,

                            quantity:
                                Number(quantity),

                            subtotal:
                                product.price *
                                Number(quantity)

                        };

                    }
                )
                .filter(Boolean);


        checkoutTotal =
            checkoutProducts.reduce(

                (
                    total,
                    item
                ) =>
                    total +
                    item.subtotal,

                0

            );


        renderCheckout(
            memberData.member
        );

    }
    catch (error) {

        console.error(error);

        document.getElementById(
            "checkoutMessage"
        ).textContent =
            "無法載入訂單資料";

    }
    finally {

        setLoading(false);

    }

}


// ========================================
// 顯示
// ========================================

function renderCheckout(member) {

    const container =
        document.getElementById(
            "checkoutItems"
        );


    container.innerHTML =
        checkoutProducts
            .map(item => `

                <div class="checkout-item">

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

            `)
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


    document.getElementById(
        "balanceAfter"
    ).textContent =
        formatMoney(
            member.balance -
            checkoutTotal
        );


    // 餘額不足

    if (
        member.balance <
        checkoutTotal
    ) {

        const shortage =
            checkoutTotal -
            member.balance;


        document.getElementById(
            "checkoutMessage"
        ).textContent =
            "餘額不足，還需要 " +
            formatMoney(shortage) +
            "。";


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

    createOrder

);


async function createOrder() {

    const token =
        localStorage.getItem(
            "memberToken"
        );


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
                API_URL,
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


        if (!data.success) {

            document.getElementById(
                "checkoutMessage"
            ).textContent =
                data.message ||
                "下單失敗";


            // 餘額不足

            if (
                data.code ===
                "INSUFFICIENT_BALANCE"
            ) {

                document.getElementById(
                    "checkoutMessage"
                ).textContent =
                    data.message +
                    "，還需要 " +
                    formatMoney(
                        data.shortage
                    ) +
                    "。";

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


        // 3秒回商城

        setTimeout(
            function () {

                window.location.href =
                    "index.html";

            },
            3000
        );


    }
    catch (error) {

        console.error(error);

        document.getElementById(
            "checkoutMessage"
        ).textContent =
            "連線錯誤，請稍後再試";


        button.disabled = false;

    }
    finally {

        setLoading(false);

    }

}


// ========================================
// 工具
// ========================================

function formatMoney(amount) {

    return "$" +
        Number(amount || 0)
            .toLocaleString(
                "zh-TW"
            );

}


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
