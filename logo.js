document.addEventListener("DOMContentLoaded", function () {

    const logo = document.createElement("a");
    logo.href = "index.html";
    logo.className = "company-logo";

    logo.innerHTML = `
        <img src="images/logo.png"
             alt="日暉國際度假村"
             style="height:80px;width:auto;">
    `;

    // 判斷是不是首頁
    const isIndex =
        location.pathname.endsWith("/index.html") ||
        location.pathname.endsWith("/");

    if (isIndex) {

        // 尋找「樂齡會員專區」標題
        const title = [...document.querySelectorAll("h1, h2, h3")]
            .find(el => el.textContent.includes("樂齡會員專區"));

        if (title) {
            logo.style.display = "block";
            logo.style.textAlign = "center";
            logo.style.marginBottom = "20px";

            title.parentNode.insertBefore(logo, title);
        }

    } else {

        // 其他網頁維持原本方式
        document.body.prepend(logo);

    }

});
