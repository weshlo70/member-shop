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

        // 沒有登入 Token
        if (!token) {

            window.location.href =
                "index.html";

            return;
        }

        loadMember(token);

    }
);


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

            alert(
                data.message ||
                "登入已失效，請重新登入"
            );

            window.location.href =
                "index.html";

            return;
        }


        showMember(data.member);

    }
    catch (error) {

        console.error(error);

        alert(
            "無法取得會員資料，請稍後再試"
        );

    }
    finally {

        setLoading(false);

    }

}


// ========================================
// 顯示會員資料
// ========================================

function showMember(member) {

    document.getElementById(
        "memberId"
    ).textContent =
        member.memberId || "--";


    document.getElementById(
        "memberName"
    ).textContent =
        member.name || "--";


    document.getElementById(
        "memberPhone"
    ).textContent =
        member.phone || "--";


    document.getElementById(
        "memberEmail"
    ).textContent =
        member.email || "--";


    document.getElementById(
        "memberBalance"
    ).textContent =
        formatMoney(member.balance);


    document.getElementById(
        "memberStatus"
    ).textContent =
        member.status === "Active"
            ? "正常"
            : member.status || "--";


    document.getElementById(
        "memberCreatedAt"
    ).textContent =
        member.createdAt || "--";


    document.getElementById(
        "memberLastLogin"
    ).textContent =
        member.lastLogin || "--";

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
// Loading
// ========================================

function setLoading(show) {

    const loading =
        document.getElementById("loading");

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
