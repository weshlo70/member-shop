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
            window.location.href = "index.html";
            return;
        }

        setDefaultDateTime();
        bindPaymentMethodEvents();
        updatePaymentMethodFields();
        loadMember(token);
        loadTopupRequests(token);

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

function setDefaultDateTime() {

    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    const dateValue = `${year}-${month}-${day}`;
    const timeValue = `${hours}:${minutes}`;

    document.getElementById("transferDate").value = dateValue;
    document.getElementById("transferTime").value = timeValue;
    document.getElementById("faxDate").value = dateValue;
    document.getElementById("faxTime").value = timeValue;
}


// ========================================
// 儲值方式切換
// ========================================

function bindPaymentMethodEvents() {

    document
        .querySelectorAll('input[name="paymentMethod"]')
        .forEach(
            radio => {
                radio.addEventListener(
                    "change",
                    updatePaymentMethodFields
                );
            }
        );
}


function getPaymentMethod() {

    const selected =
        document.querySelector(
            'input[name="paymentMethod"]:checked'
        );

    return selected
        ? selected.value
        : "BankTransfer";
}


function updatePaymentMethodFields() {

    const paymentMethod =
        getPaymentMethod();

    const bankFields =
        document.getElementById(
            "bankTransferFields"
        );

    const faxFields =
        document.getElementById(
            "faxCardFields"
        );

    const help =
        document.getElementById(
            "paymentMethodHelp"
        );

    if (paymentMethod === "FaxCard") {

        bankFields.classList.add("hidden");
        faxFields.classList.remove("hidden");

        help.textContent =
            "請依飯店提供的刷卡授權書完成傳真，再填寫傳真日期、時間與信用卡末四碼。";

    }
    else {

        faxFields.classList.add("hidden");
        bankFields.classList.remove("hidden");

        help.textContent =
            "請先完成匯款，再填寫下方匯款資料。";
    }
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

            list.innerHTML = `
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

        list.innerHTML = `
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

        list.innerHTML = `
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

                    const paymentMethod =
                        normalizePaymentMethod(
                            request.paymentMethod
                        );

                    const methodText =
                        paymentMethod === "FaxCard"
                            ? "傳真刷卡"
                            : "銀行匯款";

                    const detailHtml =
                        paymentMethod === "FaxCard"
                            ? `
                                <div>
                                    傳真日期：
                                    ${escapeHtml(
                                        formatTransferDate(
                                            request.faxDate
                                        )
                                    )}
                                </div>

                                <div>
                                    傳真時間：
                                    ${escapeHtml(
                                        formatTransferTime(
                                            request.faxTime
                                        )
                                    )}
                                </div>

                                <div>
                                    信用卡末四碼：
                                    ${escapeHtml(
                                        request.cardLast4 || "--"
                                    )}
                                </div>
                              `
                            : `
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
                                        request.bank || "--"
                                    )}
                                </div>

                                <div>
                                    帳號後五碼：
                                    ${escapeHtml(
                                        request.accountLast5 || "--"
                                    )}
                                </div>
                              `;

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
                                    儲值方式：
                                    ${escapeHtml(methodText)}
                                </div>

                                ${detailHtml}

                                ${
                                    request.note
                                        ? `
                                            <div>
                                                備註：
                                                ${escapeHtml(request.note)}
                                            </div>
                                          `
                                        : ""
                                }

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
        window.location.href = "index.html";
        return;
    }

    const amount =
        document.getElementById(
            "amount"
        ).value.trim();

    const paymentMethod =
        getPaymentMethod();

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

    const faxDate =
        document.getElementById(
            "faxDate"
        ).value;

    const faxTime =
        document.getElementById(
            "faxTime"
        ).value;

    const cardLast4 =
        document.getElementById(
            "cardLast4"
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

    if (
        !amount ||
        Number(amount) <= 0 ||
        !Number.isInteger(Number(amount))
    ) {
        message.textContent =
            "請輸入正確的儲值金額";
        return;
    }

    if (paymentMethod === "FaxCard") {

        if (!faxDate) {
            message.textContent =
                "請選擇傳真日期";
            return;
        }

        if (!faxTime) {
            message.textContent =
                "請選擇傳真時間";
            return;
        }

        if (!/^\d{4}$/.test(cardLast4)) {
            message.textContent =
                "請輸入4位數字的信用卡末四碼";
            return;
        }
    }
    else {

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
    }

    showConfirmModal({
        token,
        amount,
        paymentMethod,
        transferDate,
        transferTime,
        bank,
        accountLast5,
        faxDate,
        faxTime,
        cardLast4,
        note
    });
}


// ========================================
// 真正送出儲值申請
// ========================================

async function sendTopupRequest(formData) {

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
                                formData.token,
                            amount:
                                Number(formData.amount),
                            paymentMethod:
                                formData.paymentMethod,
                            transferDate:
                                formData.paymentMethod === "BankTransfer"
                                    ? formData.transferDate
                                    : "",
                            transferTime:
                                formData.paymentMethod === "BankTransfer"
                                    ? formData.transferTime
                                    : "",
                            bank:
                                formData.paymentMethod === "BankTransfer"
                                    ? formData.bank
                                    : "",
                            accountLast5:
                                formData.paymentMethod === "BankTransfer"
                                    ? formData.accountLast5
                                    : "",
                            faxDate:
                                formData.paymentMethod === "FaxCard"
                                    ? formData.faxDate
                                    : "",
                            faxTime:
                                formData.paymentMethod === "FaxCard"
                                    ? formData.faxTime
                                    : "",
                            cardLast4:
                                formData.paymentMethod === "FaxCard"
                                    ? formData.cardLast4
                                    : "",
                            note:
                                formData.note
                        })
                }
            );

        const data =
            await response.json();

        if (!data.success) {

            document.getElementById(
                "topupMessage"
            ).textContent =
                data.message ||
                "儲值申請失敗";

            return;
        }

        showSuccessModal(
            data.request.requestId
        );

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
            "cardLast4"
        ).value = "";

        document.getElementById(
            "note"
        ).value = "";

        setDefaultDateTime();

        document.getElementById(
            "topupMessage"
        ).textContent =
            "儲值申請已送出，等待確認";

        loadTopupRequests(
            formData.token
        );
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

function showConfirmModal(formData) {

    const modal =
        document.createElement(
            "div"
        );

    modal.className =
        "topup-success-modal";

    const isFaxCard =
        formData.paymentMethod === "FaxCard";

    const detailHtml =
        isFaxCard
            ? `
                <div class="confirm-row">
                    <span>儲值方式</span>
                    <strong>傳真刷卡</strong>
                </div>

                <div class="confirm-row">
                    <span>傳真日期</span>
                    <strong>
                        ${escapeHtml(
                            formatTransferDate(
                                formData.faxDate
                            )
                        )}
                    </strong>
                </div>

                <div class="confirm-row">
                    <span>傳真時間</span>
                    <strong>
                        ${escapeHtml(
                            formatTransferTime(
                                formData.faxTime
                            )
                        )}
                    </strong>
                </div>

                <div class="confirm-row">
                    <span>信用卡末四碼</span>
                    <strong>
                        ${escapeHtml(
                            formData.cardLast4
                        )}
                    </strong>
                </div>
              `
            : `
                <div class="confirm-row">
                    <span>儲值方式</span>
                    <strong>銀行匯款</strong>
                </div>

                <div class="confirm-row">
                    <span>匯款日期</span>
                    <strong>
                        ${escapeHtml(
                            formatTransferDate(
                                formData.transferDate
                            )
                        )}
                    </strong>
                </div>

                <div class="confirm-row">
                    <span>匯款時間</span>
                    <strong>
                        ${escapeHtml(
                            formatTransferTime(
                                formData.transferTime
                            )
                        )}
                    </strong>
                </div>

                <div class="confirm-row">
                    <span>匯款銀行</span>
                    <strong>
                        ${escapeHtml(
                            formData.bank
                        )}
                    </strong>
                </div>

                <div class="confirm-row">
                    <span>帳號後五碼</span>
                    <strong>
                        ${escapeHtml(
                            formData.accountLast5
                        )}
                    </strong>
                </div>
              `;

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
                    <span>儲值金額</span>
                    <strong>
                        ${formatMoney(formData.amount)}
                    </strong>
                </div>

                ${detailHtml}

                ${
                    formData.note
                        ? `
                            <div class="confirm-row">
                                <span>備註</span>
                                <strong>
                                    ${escapeHtml(formData.note)}
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

    document
        .getElementById(
            "confirmSubmitButton"
        )
        .addEventListener(
            "click",
            function () {
                modal.remove();
                sendTopupRequest(formData);
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
                    ${escapeHtml(requestId)}
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
// 儲值方式
// ========================================

function normalizePaymentMethod(value) {

    const method =
        String(value || "")
            .trim();

    // 舊資料沒有 PaymentMethod，視為銀行匯款
    if (!method) {
        return "BankTransfer";
    }

    return method;
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
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
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
// 日期格式
// ========================================

function formatTransferDate(value) {

    if (!value) {
        return "--";
    }

    const date =
        new Date(value);

    if (!isNaN(date.getTime())) {

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
// 時間格式
// ========================================

function formatTransferTime(value) {

    if (!value) {
        return "--";
    }

    const date =
        new Date(value);

    if (
        !isNaN(date.getTime()) &&
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
        loading.classList.remove("hidden");
    }
    else {
        loading.classList.add("hidden");
    }
}
