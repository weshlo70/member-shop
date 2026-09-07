// ========================================
// Apps Script API 網址
// ========================================

const API_URL =
    "https://script.google.com/macros/s/AKfycbzoiQXbZQt12Ez_2yz2aQo4guCJwrmggYgGZr2XhB1N0xXXXH7qLUmp4-9xzDhMCvtN/exec";


// ========================================
// 啟動
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const token =
            localStorage.getItem("memberToken");


        if (!token) {

            window.location.href =
                "index.html";

            return;

        }


        // 預設今天日期與時間
        setDefaultDate();


        // 取得會員餘額
        loadMember(token);


        // 取得儲值紀錄
        loadTopupRequests(token);


        // 送出按鈕
        document
            .getElementById("submitTopupButton")
            .addEventListener(
                "click",
                submitTopup
            );

    }
);


// ========================================
// 預設日期 / 時間
// ========================================

function setDefaultDate() {

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            now.getDate()
        ).padStart(2, "0");


    document.getElementById(
        "transferDate"
    ).value =
        `${year}-${month}-${day}`;


    const hours =
        String(
            now.getHours()
        ).padStart(2, "0");


    const minutes =
        String(
            now.getMinutes()
        ).padStart(2, "0");


    document.getElementById(
        "transferTime"
    ).value =
        `${hours}:${minutes}`;

}


// ========================================
// 取得會員資料
// ========================================

async function loadMember(token) {

    try {

        const response =
            await fetch(
                API_URL +
                "?action=member&token=" +
                encodeURIComponent(token)
            );


        const data =
            await response.json();


        if (!data.success) {

            localStorage.removeItem(
                "memberToken"
            );

            window.location.href =
                "index.html";

            return;

        }


        document.getElementById(
            "memberBalance"
        ).textContent =
            formatMoney(
                data.member.balance
            );

    }
    catch (error) {

        console.error(
            "取得會員資料失敗：",
            error
        );

    }

}


// ========================================
// 取得儲值紀錄
// ========================================

async function loadTopupRequests(token) {

    const list =
        document.getElementById(
            "topupList"
        );


    try {

        const response =
            await fetch(
                API_URL +
                "?action=topupRequests&token=" +
                encodeURIComponent(token)
            );


        const data =
            await response.json();


        if (!data.success) {

            list.innerHTML =
                `
                <div class="topup-empty">
                    無法取得儲值紀錄
                </div>
                `;

            return;

        }


        renderTopupRequests(
            data.requests || []
        );

    }
    catch (error) {

        console.error(
            "取得儲值紀錄失敗：",
            error
        );


        list.innerHTML =
            `
            <div class="topup-empty">
                無法取得儲值紀錄，請稍後再試
            </div>
            `;

    }

}


// ========================================
// 顯示儲值紀錄
// ========================================

function renderTopupRequests(requests) {

    const list =
        document.getElementById(
            "topupList"
        );


    if (!requests.length) {

        list.innerHTML =
            `
            <div class="topup-empty">
                目前沒有儲值申請紀錄
            </div>
            `;

        return;

    }


    list.innerHTML =
        requests
            .map(
                function (request) {

                    return `
                        <div class="topup-item">

                            <div class="topup-item-top">

                                <div>

                                    <div class="topup-request-id">
                                        ${escapeHtml(
                                            request.requestId
                                        )}
                                    </div>

                                    <div class="topup-date">
                                        ${escapeHtml(
                                            request.createdAt
                                        )}
                                    </div>

                                </div>


                                <div class="topup-amount">
                                    ${formatMoney(
                                        request.amount
                                    )}
                                </div>

                            </div>


                            <div class="topup-item-info">

                                <div>
                                    匯款日期：
                                    ${escapeHtml(
                                        formatTransferDate(
                                            request.transferDate
                                        )
                                    )}
                                </div>

                                <div>
                                    匯款時間：
                                    ${escapeHtml(
                                        formatTransferTime(
                                            request.transferTime
                                        )
                                    )}
                                </div>

                                <div>
                                    匯款銀行：
                                    ${escapeHtml(
                                        request.bank
                                    )}
                                </div>

                                <div>
                                    帳號後五碼：
                                    ${escapeHtml(
                                        request.accountLast5
                                    )}
                                </div>

                            </div>


                            <div class="topup-item-bottom">

                                <span
                                    class="${getStatusClass(
                                        request.status
                                    )}"
                                >
                                    ${getStatusText(
                                        request.status
                                    )}
                                </span>

                            </div>

                        </div>
                    `;

                }
            )
            .join("");

}


// ========================================
// 開始提交儲值申請
// ========================================

function submitTopup() {

    const token =
        localStorage.getItem(
            "memberToken"
        );


    if (!token) {

        window.location.href =
            "index.html";

        return;

    }


    const amount =
        document.getElementById(
            "amount"
        ).value.trim();


    const transferDate =
        document.getElementById(
            "transferDate"
        ).value;


    const transferTime =
        document.getElementById(
            "transferTime"
        ).value;


    const bank =
        document.getElementById(
            "bank"
        ).value.trim();


    const accountLast5 =
        document.getElementById(
            "accountLast5"
        ).value.trim();


    const note =
        document.getElementById(
            "note"
        ).value.trim();


    const message =
        document.getElementById(
            "topupMessage"
        );


    message.textContent = "";


    // ========================================
    // 前端驗證
    // ========================================

    if (
        !amount ||
        Number(amount) <= 0 ||
        !Number.isInteger(
            Number(amount)
        )
    ) {

        message.textContent =
            "請輸入正確的匯款金額";

        return;

    }


    if (!transferDate) {

        message.textContent =
            "請選擇匯款日期";

        return;

    }


    if (!transferTime) {

        message.textContent =
            "請選擇匯款時間";

        return;

    }


    if (!bank) {

        message.textContent =
            "請輸入匯款銀行";

        return;

    }


    if (!/^\d{5}$/.test(accountLast5)) {

        message.textContent =
            "請輸入5位數字的匯款帳號後五碼";

        return;

    }


    // ========================================
    // 顯示自訂確認視窗
    // ========================================

    showConfirmModal(
        amount,
        transferDate,
        transferTime,
        bank,
        accountLast5,
        note,
        token
    );

}


// ========================================
// 真正送出儲值申請
// ========================================

async function sendTopupRequest(
    token,
    amount,
    transferDate,
    transferTime,
    bank,
    accountLast5,
    note
) {

    setLoading(true);


    const button =
        document.getElementById(
            "submitTopupButton"
        );


    button.disabled = true;


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
                                "createTopupRequest",

                            token:
                                token,

                            amount:
                                Number(amount),

                            transferDate:
                                transferDate,

                            transferTime:
                                transferTime,

                            bank:
                                bank,

                            accountLast5:
                                accountLast5,

                            note:
                                note

                        })

                }
            );


        const data =
            await response.json();


        // ========================================
        // 後端回傳錯誤
        // ========================================

        if (!data.success) {

            document.getElementById(
                "topupMessage"
            ).textContent =
                data.message ||
                "儲值申請失敗";

            return;

        }


        // ========================================
        // 申請成功
        // ========================================

        showSuccessModal(
            data.request.requestId
        );


        // 清空表單
        document.getElementById(
            "amount"
        ).value = "";


        document.getElementById(
            "bank"
        ).value = "";


        document.getElementById(
            "accountLast5"
        ).value = "";


        document.getElementById(
            "note"
        ).value = "";


        document.getElementById(
            "topupMessage"
        ).textContent =
            "儲值申請已送出，等待確認";


        // 重新載入儲值紀錄
        loadTopupRequests(token);

    }
    catch (error) {

        console.error(
            "送出儲值申請失敗：",
            error
        );


        document.getElementById(
            "topupMessage"
        ).textContent =
            "無法連線到會員系統，請稍後再試";

    }
    finally {

        setLoading(false);

        button.disabled = false;

    }

}


// ========================================
// 儲值申請確認視窗
// ========================================

function showConfirmModal(
    amount,
    transferDate,
    transferTime,
    bank,
    accountLast5,
    note,
    token
) {

    const modal =
        document.createElement(
            "div"
        );


    modal.className =
        "topup-success-modal";


    modal.innerHTML = `

        <div class="topup-success-box">

            <div class="topup-success-title">
                確認送出儲值申請
            </div>


            <div class="topup-confirm-text">

                <div class="confirm-question">
                    確定要送出這筆儲值申請嗎？
                </div>


                <div class="confirm-row">

                    <span>
                        匯款金額
                    </span>

                    <strong>
                        ${formatMoney(amount)}
                    </strong>

                </div>


                <div class="confirm-row">

                    <span>
                        匯款日期
                    </span>

                    <strong>
                        ${escapeHtml(
                            formatTransferDate(
                                transferDate
                            )
                        )}
                    </strong>

                </div>


                <div class="confirm-row">

                    <span>
                        匯款時間
                    </span>

                    <strong>
                        ${escapeHtml(
                            formatTransferTime(
                                transferTime
                            )
                        )}
                    </strong>

                </div>


                <div class="confirm-row">

                    <span>
                        匯款銀行
                    </span>

                    <strong>
                        ${escapeHtml(
                            bank
                        )}
                    </strong>

                </div>


                <div class="confirm-row">

                    <span>
                        帳號後五碼
                    </span>

                    <strong>
                        ${escapeHtml(
                            accountLast5
                        )}
                    </strong>

                </div>


                ${
                    note
                        ? `
                            <div class="confirm-row">

                                <span>
                                    備註
                                </span>

                                <strong>
                                    ${escapeHtml(note)}
                                </strong>

                            </div>
                          `
                        : ""
                }

            </div>


            <div class="confirm-buttons">

                <button
                    class="confirm-cancel-button"
                    id="confirmCancelButton"
                >
                    取消
                </button>


                <button
                    class="primary-button"
                    id="confirmSubmitButton"
                >
                    確定送出
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    // ========================================
    // 取消
    // ========================================

    document
        .getElementById(
            "confirmCancelButton"
        )
        .addEventListener(
            "click",
            function () {

                modal.remove();

            }
        );


    // ========================================
    // 確定送出
    // ========================================

    document
        .getElementById(
            "confirmSubmitButton"
        )
        .addEventListener(
            "click",
            function () {

                modal.remove();


                sendTopupRequest(

                    token,

                    amount,

                    transferDate,

                    transferTime,

                    bank,

                    accountLast5,

                    note

                );

            }
        );

}


// ========================================
// 儲值成功視窗
// ========================================

function showSuccessModal(requestId) {

    const modal =
        document.createElement(
            "div"
        );


    modal.className =
        "topup-success-modal";


    modal.innerHTML = `

        <div class="topup-success-box">

            <div class="topup-success-icon">
                ✓
            </div>


            <div class="topup-success-title">
                儲值申請已送出
            </div>


            <div class="topup-success-text">

                <div class="success-label">
                    申請編號
                </div>


                <div class="success-request-id">
                    ${escapeHtml(
                        requestId
                    )}
                </div>


                <div class="success-label success-status-label">
                    目前狀態
                </div>


                <div class="success-status">
                    ⏳ 等待確認
                </div>

            </div>


            <button
                class="primary-button"
                id="successModalButton"
            >
                確定
            </button>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    document
        .getElementById(
            "successModalButton"
        )
        .addEventListener(
            "click",
            function () {

                modal.remove();

            }
        );

}


// ========================================
// 狀態文字
// ========================================

function getStatusText(status) {

    switch (
        String(status)
            .toLowerCase()
    ) {

        case "pending":

            return "⏳ 等待確認";


        case "approved":

            return "✓ 已入帳";


        case "rejected":

            return "✕ 已拒絕";


        default:

            return status || "未知";

    }

}


// ========================================
// 狀態 CSS
// ========================================

function getStatusClass(status) {

    switch (
        String(status)
            .toLowerCase()
    ) {

        case "pending":

            return "topup-status pending";


        case "approved":

            return "topup-status approved";


        case "rejected":

            return "topup-status rejected";


        default:

            return "topup-status";

    }

}


// ========================================
// HTML 安全處理
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
// 金額格式
// ========================================

function formatMoney(amount) {

    return "$" +
        Number(amount || 0)
            .toLocaleString("zh-TW");

}


// ========================================
// 匯款日期格式
// ========================================

function formatTransferDate(value) {

    if (!value) {

        return "--";

    }


    const date =
        new Date(value);


    if (
        !isNaN(
            date.getTime()
        )
    ) {

        return (
            date.getFullYear() +
            "/" +
            String(
                date.getMonth() + 1
            ).padStart(2, "0") +
            "/" +
            String(
                date.getDate()
            ).padStart(2, "0")
        );

    }


    return String(value);

}


// ========================================
// 匯款時間格式
// ========================================

function formatTransferTime(value) {

    if (!value) {

        return "--";

    }


    const date =
        new Date(value);


    // Google Sheets 時間欄位
    // 例如：
    // Sat Dec 30 1899 17:10:00 GMT+0800
    if (
        !isNaN(
            date.getTime()
        ) &&
        date.getFullYear() <= 1900
    ) {

        return (
            String(
                date.getHours()
            ).padStart(2, "0") +
            ":" +
            String(
                date.getMinutes()
            ).padStart(2, "0")
        );

    }


    // 已經是 HH:mm
    const match =
        String(value).match(
            /^(\d{1,2}):(\d{2})/
        );


    if (match) {

        return (
            String(
                match[1]
            ).padStart(2, "0") +
            ":" +
            match[2]
        );

    }


    return String(value);

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
