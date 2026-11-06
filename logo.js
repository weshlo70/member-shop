document.addEventListener("DOMContentLoaded", function () {

    const logo = document.createElement("a");
    logo.href = "index.html";
    logo.className = "company-logo";

    logo.innerHTML = `
        <img src="images/logo.png"
             alt="日暉國際度假村"
             style="height:48px;width:auto;">
    `;

    document.body.prepend(logo);
});
