
/* ========================================
   Apps Script API 網址
======================================== */

const API_URL = "https://script.google.com/macros/s/AKfycbzoiQXbZQt12Ez_2yz2aQo4guCJwrmggYgGZr2XhB1N0xXXXH7qLUmp4-9xzDhMCvtN/exec";


/* ========================================
   DOM
======================================== */

const loginPage = document.getElementById("loginPage");
const homePage = document.getElementById("homePage");

// 改成手機號碼欄位
const phoneInput = document.getElementById("phone");

const idLast4Input = document.getElementById("idLast4");
const loginButton = document.getElementById("loginButton");
const logoutButton = document.getElementById("logoutButton");
const loginMessage = document.getElementById("loginMessage");
const loading = document.getElementById("loading");


/* ========================================
   啟動
======================================== */

document.addEventListener("DOMContentLoaded", function () {

    const token = localStorage.getItem("memberToken");

    if (token) {
        loadMember(token);
    }

});


/* ========================================
   登入按鈕
======================================== */

loginButton.addEventListener("click", login);


// 在手機號碼欄按 Enter 時登入
phoneInput.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {
        idLast4Input.focus();
    }

});


// 在身分證末4碼欄按 Enter 時登入
idLast4Input.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {
        login();
    }

});


/* ========================================
   會員登入
   登入方式：手機號碼 + 身分證末4碼
======================================== */

async function login() {

    const phone = phoneInput.value.trim();
    const idLast4 = idLast4Input.value.trim();

    loginMessage.textContent = "";

    // 檢查手機號碼
    if (!/^09\d{8}$/.test(phone)) {

        loginMessage.textContent =
            "請輸入正確的10位數手機號碼";

        phoneInput.focus();
        return;

    }

    // 檢查身分證末4碼
    if (!/^\d{4}$/.test(idLast4)) {

        loginMessage.textContent =
            "請輸入4位數字的身分證末4碼";

        idLast4Input.focus();
        return;

    }

    setLoading(true);
    loginButton.disabled = true;

    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },

            body: JSON.stringify({

                action: "login",

                // 改用手機號碼
                phone: phone,

                idLast4: idLast4

            })

        });

        const data = await response.json();

        if (!data.success) {

            loginMessage.textContent =
                data.message || "登入失敗，請確認輸入資料";

            return;

        }

        // 保存登入 Token
        localStorage.setItem(
            "memberToken",
            data.token
        );

        // 顯示會員首頁
        showMember(data.member);

        // 清除登入欄位
        phoneInput.value = "";
        idLast4Input.value = "";

    }
    catch (error) {

        console.error("會員登入錯誤：", error);

        loginMessage.textContent =
            "無法連線到會員系統，請稍後再試";

    }
    finally {

        setLoading(false);
        loginButton.disabled = false;

    }

}


/* ========================================
   取得會員資料
======================================== */

async function loadMember(token) {

    setLoading(true);

    try {

        const response = await fetch(
            API_URL +
            "?action=member&token=" +
            encodeURIComponent(token)
        );

        const data = await response.json();

        if (!data.success) {

            localStorage.removeItem("memberToken");

            showLogin();

            return;

        }

        showMember(data.member);

    }
    catch (error) {

        console.error("取得會員資料錯誤：", error);

        localStorage.removeItem("memberToken");

        showLogin();

    }
    finally {

        setLoading(false);

    }

}


/* ========================================
   顯示會員首頁
======================================== */

function showMember(member) {

    document.getElementById("memberName").textContent =
        member.name || "";

    document.getElementById("memberNameDisplay").textContent =
        member.name || "";

    // 會員編號仍然保留，只用於顯示會員資料
    document.getElementById("memberIdDisplay").textContent =
        member.memberId || "";

    document.getElementById("memberBalance").textContent =
        formatMoney(member.balance);

    loginPage.classList.add("hidden");
    homePage.classList.remove("hidden");

}


/* ========================================
   顯示登入頁
======================================== */

function showLogin() {

    homePage.classList.add("hidden");
    loginPage.classList.remove("hidden");

}


/* ========================================
   會員登出
======================================== */

logoutButton.addEventListener("click", async function () {

    const token = localStorage.getItem("memberToken");

    if (token) {

        try {

            await fetch(API_URL, {

                method: "POST",

                headers: {
                    "Content-Type": "text/plain;charset=utf-8"
                },

                body: JSON.stringify({

                    action: "logout",

                    token: token

                })

            });

        }
        catch (error) {

            console.error("會員登出錯誤：", error);

        }

    }

    localStorage.removeItem("memberToken");

    showLogin();

    phoneInput.value = "";
    idLast4Input.value = "";
    loginMessage.textContent = "";

});


/* ========================================
   金額格式
======================================== */

function formatMoney(amount) {

    return "$" +
        Number(amount || 0).toLocaleString("zh-TW");

}


/* ========================================
   Loading 載入畫面
======================================== */

function setLoading(show) {

    if (show) {

        loading.classList.remove("hidden");

    }
    else {

        loading.classList.add("hidden");

    }

}


/* ========================================
   開啟商品頁
======================================== */

function openProducts() {

    window.location.href = "products.html";

}
