// ========================================
// 訂單詳情
// ========================================


const ORDER_DETAIL_API_URL =
    "https://script.google.com/macros/s/AKfycbzoiQXbZQt12Ez_2yz2aQo4guCJwrmggYgGZr2XhB1N0xXXXH7qLUmp4-9xzDhMCvtN/exec";


// ========================================
// 啟動
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadOrderDetail();

    }
);


// ========================================
// 載入訂單
// ========================================

async function loadOrderDetail() {

    const token =
        localStorage.getItem(
            "memberToken"
        );


    if (!token) {

        window.location.href =
            "index.html";

        return;

    }


    const params =
        new URLSearchParams(
            window.location.search
        );


    const orderId =
        params.get(
            "orderId"
        );


    if (!orderId) {

        showError(
            "找不到訂單編號"
        );

        return;

    }


    setLoading(true);


    try {

        const response =
            await fetch(

                ORDER_DETAIL_API_URL +
                "?action=orderDetail" +
                "&token=" +
                encodeURIComponent(token) +
                "&orderId=" +
                encodeURIComponent(orderId)

            );


        const data =
            await response.json();


        if (!data.success) {

            showError(
                data.message ||
                "訂單讀取失敗"
            );

            return;

        }


        renderOrder(
            data.order
        );

    }
    catch (error) {

        console.error(error);

        showError(
            "無法取得訂單資料"
        );

    }
    finally {

        setLoading(false);

    }

}


// ========================================
// 顯示訂單
// ========================================

function renderOrder(order) {

    const container =
        document.getElementById(
            "orderDetail"
        );


    const itemsHtml =
        order.items
            .map(
                item => `

                    <div
                        class="detail-item"
                    >

                        <div>

                            <div
                                class="detail-product-name"
                            >
                                ${escapeHtml(
                                    item.productName
                                )}
                            </div>

                            <div
                                class="detail-product-info"
                            >
                                ${formatMoney(
                                    item.unitPrice
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


    container.innerHTML = `

        <div class="detail-title">

            訂單詳情

        </div>


        <div class="order-detail-card">


            <div
                class="detail-header"
            >

                <div>

                    <div
                        class="detail-order-id"
                    >
                        ${escapeHtml(
                            order.orderId
                        )}
                    </div>

                    <div
                        class="detail-date"
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


        </div>


        <div class="order-detail-card">


            <div class="card-title">
                商品明細
            </div>


            <div
                class="detail-items"
            >

                ${itemsHtml}

            </div>


            <div
                class="detail-total"
            >

                <span>
                    訂單總額
                </span>

                <strong>
                    ${formatMoney(
                        order.totalAmount
                    )}
                </strong>

            </div>


        </div>


        <div class="order-detail-card">


            <div class="card-title">
                訂單資訊
            </div>


            <div class="info-row">

                <span>
                    訂單編號
                </span>

                <strong>
                    ${escapeHtml(
                        order.orderId
                    )}
                </strong>

            </div>


            <div class="info-row">

                <span>
                    訂單日期
                </span>

                <strong>
                    ${escapeHtml(
                        order.orderDate
                    )}
                </strong>

            </div>


            <div class="info-row">

                <span>
                    訂單狀態
                </span>

                <strong>
                    ${getStatusText(
                        order.status
                    )}
                </strong>

            </div>


            <div class="info-row">

                <span>
                    付款方式
                </span>

                <strong>
                    儲值餘額
                </strong>

            </div>


        </div>


        <button
            class="primary-button"
            onclick="goBack()"
        >
            返回我的訂單
        </button>

    `;

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
// 返回
// ========================================

function goBack() {

    window.location.href =
        "orders.html";

}


// ========================================
// 錯誤
// ========================================

function showError(message) {

    document.getElementById(
        "orderDetail"
    ).innerHTML = `

        <div class="empty-message">

            ${escapeHtml(message)}

        </div>

    `;

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
