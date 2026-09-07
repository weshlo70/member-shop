// ========================================
// Apps Script API 網址
// ========================================

const API_URL = "https://script.google.com/macros/s/AKfycbzoiQXbZQt12Ez_2yz2aQo4guCJwrmggYgGZr2XhB1N0xXXXH7qLUmp4-9xzDhMCvtN/exec";


// ========================================
// DOM
// ========================================

const loginPage =
    document.getElementById("loginPage");

const homePage =
    document.getElementById("homePage");

const memberIdInput =
    document.getElementById("memberId");

const idLast4Input =
    document.getElementById("idLast4");

const loginButton =
    document.getElementById("loginButton");

const logoutButton =
    document.getElementById("logoutButton");

const loginMessage =
    document.getElementById("loginMessage");

const loading =
    document.getElementById("loading");


// ========================================
// 啟動
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const token =
            localStorage.getItem("memberToken");

        if (token) {

            loadMember(token);

        }

    }
);


// ========================================
// 登入
// ========================================

loginButton.addEventListener(
    "click",
    login
);


idLast4Input.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {
            login();
        }

    }
);


async function login() {

    const memberId =
        memberIdInput.value
            .trim()
            .toUpperCase();

    const idLast4 =
        idLast4Input.value.trim();


    loginMessage.textContent = "";


    if (!memberId) {

        loginMessage.textContent =
            "請輸入會員編號";

        return;
    }


    if (!/^\d{4}$/.test(idLast4)) {

        loginMessage.textContent =
            "請輸入4位數字的身分證末4碼";

        return;
    }


    setLoading(true);


    loginButton.disabled = true;


    try {

        const response =
            await fetch(API_URL, {

                method: "POST",

                headers: {

                    "Content-Type":
                        "text/plain;charset=utf-8"

                },

                body: JSON.stringify({

                    action: "login",

                    memberId: memberId,

                    idLast4: idLast4

                })

            });


        const data =
            await response.json();


        if (!data.success) {

            loginMessage.textContent =
                data.message ||
                "登入失敗";

            return;
        }


        // 保存 Token

        localStorage.setItem(
            "memberToken",
            data.token
        );


        // 顯示會員資料

        showMember(data.member);

    }
    catch (error) {

        console.error(error);

        loginMessage.textContent =
            "無法連線到會員系統，請稍後再試";

    }
    finally {

        setLoading(false);

        loginButton.disabled = false;

    }

}


// ========================================
// 取得會員資料
// ========================================

async function loadMember(token) {

    setLoading(true);


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

            showLogin();

            return;
        }


        showMember(data.member);

    }
    catch (error) {

        console.error(error);

        localStorage.removeItem(
            "memberToken"
        );

        showLogin();

    }
    finally {

        setLoading(false);

    }

}


// ========================================
// 顯示會員首頁
// ========================================

function showMember(member) {

    document.getElementById(
        "memberName"
    ).textContent =
        member.name;


    document.getElementById(
        "memberNameDisplay"
    ).textContent =
        member.name;


    document.getElementById(
        "memberIdDisplay"
    ).textContent =
        member.memberId;


    document.getElementById(
        "memberBalance"
    ).textContent =
        formatMoney(member.balance);


    loginPage.classList.add(
        "hidden"
    );

    homePage.classList.remove(
        "hidden"
    );

}


// ========================================
// 顯示登入頁
// ========================================

function showLogin() {

    homePage.classList.add(
        "hidden"
    );

    loginPage.classList.remove(
        "hidden"
    );

}


// ========================================
// 登出
// ========================================

logoutButton.addEventListener(
    "click",
    async function () {

        const token =
            localStorage.getItem(
                "memberToken"
            );


        if (token) {

            try {

                await fetch(API_URL, {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "text/plain;charset=utf-8"

                    },

                    body: JSON.stringify({

                        action: "logout",

                        token: token

                    })

                });

            }
            catch (error) {

                console.error(error);

            }

        }


        localStorage.removeItem(
            "memberToken"
        );


        showLogin();


        memberIdInput.value = "";

        idLast4Input.value = "";

        loginMessage.textContent = "";

    }
);


// ========================================
// 金額格式
// ========================================

function formatMoney(amount) {

    return "$" +
        Number(amount || 0)
            .toLocaleString("zh-TW");

}


// ========================================
// Loading
// ========================================

function setLoading(show) {

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
function openProducts() {

    window.location.href =
        "products.html";

}
