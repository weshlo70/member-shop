// ========================================
// 我的訂單
// ========================================


// ========================================
// Apps Script API
// ========================================

const ORDERS_API_URL =
    "你的 Apps Script 網址";


// ========================================
// 啟動
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadOrders();

    }
);


// ========================================
// 載入訂單
// ========================================

async function loadOrders() {

    const token =
        localStorage.getItem(
            "memberToken"
        );


    if (!token) {

        window.location.href =
            "index.html";

        return;

    }


    setLoading(true);


    try {

        const response =
            await fetch(

                ORDERS_API_URL +
                "?action=orders&token=" +
                encodeURIComponent(token)

            );


        const data =
            await response.json();


        if (!data.success) {

            alert(
                data.message ||
                "訂單讀取失敗"
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


        renderOrders(
            data.orders || []
        );

    }
    catch (error) {

        console.error(error);


        document.getElementById(
            "ordersList"
        ).innerHTML = `

            <div class="empty-message">

                無法取得訂單資料<br>
                請稍後再試

            </div>

        `;

    }
    finally {

        setLoading(false);

    }

}


// ========================================
// 顯示訂單
// ========================================

function renderOrders(orders) {

    const container =
        document.getElementById(
            "ordersList"
        );


    if (!orders.length) {

        container.innerHTML = `

            <div class="empty-orders">

                <div class="empty-orders-icon">
                    📦
                </div>

                <div class="empty-orders-title">
                    目前沒有訂單
                </div>

                <div class="empty-orders-text">
                    前往商品商城選購商品
                </div>

                <button
                    class="primary-button small-button"
                    onclick="goProducts()"
                >
                    前往商品商城
                </button>

            </div>

        `;

        return;

    }


    container.innerHTML =
        orders
            .map(
                order => `

                    <div
                        class="order-card"
                        onclick="openOrder(
                            '${escapeHtml(
                                order.orderId
                            )}'
                        )"
                    >

                        <div class="order-card-top">

                            <div>

                                <div
                                    class="order-id"
                                >
                                    ${escapeHtml(
                                        order.orderId
                                    )}
                                </div>

                                <div
                                    class="order-date"
                                >
                                    ${escapeHtml(
                                        order.orderDate
                                    )}
                                </div>

                            </div>


                            <div
                                class="${getStatusClass(
                                    order.status
                                )}"
                            >
                                ${getStatusText(
                                    order.status
                                )}
                            </div>

                        </div>


                        <div
                            class="order-summary"
                        >
                            ${escapeHtml(
                                order.itemSummary ||
                                "商品"
                            )}
                        </div>


                        <div
                            class="order-card-bottom"
                        >

                            <span>
                                ${order.itemCount}
                                件商品
                            </span>


                            <strong>
                                ${formatMoney(
                                    order.totalAmount
                                )}
                            </strong>

                        </div>


                        <div
                            class="order-view"
                        >
                            查看訂單詳情 →
                        </div>

                    </div>

                `
            )
            .join("");

}


// ========================================
// 查看訂單
// ========================================

function openOrder(orderId) {

    window.location.href =
        "order-detail.html?orderId=" +
        encodeURIComponent(
            orderId
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
// 前往商城
// ========================================

function goProducts() {

    window.location.href =
        "products.html";

}


// ========================================
// 狀態
// ========================================

function getStatusText(status) {

    switch (
        String(status)
            .toLowerCase()
    ) {

        case "paid":
            return "已付款";

        case "pending":
            return "待付款";

        case "cancelled":
            return "已取消";

        case "completed":
            return "已完成";

        default:
            return status || "未知";

    }

}


function getStatusClass(status) {

    switch (
        String(status)
            .toLowerCase()
    ) {

        case "paid":
        case "completed":
            return "status-success";

        case "cancelled":
            return "status-cancelled";

        default:
            return "status-pending";

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
