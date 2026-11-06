document.addEventListener("DOMContentLoaded", function () {

    const logo = document.createElement("a");
    logo.href = "index.html";
    logo.className = "company-logo";

    // 判斷是不是首頁
    const isIndex =
        location.pathname.endsWith("/index.html") ||
        location.pathname.endsWith("/");

    if (isIndex) {

        // 找到登入畫面的「樂齡會員專區」
        const title = document.querySelector(
            "#loginPage .login-card .logo"
        );

        if (title) {

            logo.innerHTML = `
                <img src="images/logo.png"
                     alt="日暉國際度假村"
                     style="height:80px;width:auto;max-width:100%;">
            `;

            logo.style.display = "block";
            logo.style.textAlign = "center";
            logo.style.marginBottom = "20px";

            // 插入在「樂齡會員專區」正上方
            title.parentNode.insertBefore(logo, title);
        }

    } else {

        // 其他網頁維持原本方式
        logo.innerHTML = `
            <img src="images/logo.png"
                 alt="日暉國際度假村"
                 style="height:48px;width:auto;max-width:100%;">
        `;

        document.body.prepend(logo);
    }

});
