const API_URL =
  "https://script.google.com/macros/s/AKfycbzoiQXbZQt12Ez_2yz2aQo4guCJwrmggYgGZr2XhB1N0xXXXH7qLUmp4-9xzDhMCvtN/exec";


const adminTokenKey =
  "adminToken";


document.addEventListener(
  "DOMContentLoaded",
  function () {

    // 如果已經登入
    const token =
      localStorage.getItem(
        adminTokenKey
      );

    if (token) {

      checkAdminLogin(token);

    }


    const form =
      document.getElementById(
        "adminLoginForm"
      );

    form.addEventListener(
      "submit",
      adminLogin
    );

  }
);


/**
 * 管理員登入
 */
async function adminLogin(event) {

  event.preventDefault();

  const username =
    document
      .getElementById("username")
      .value
      .trim();

  const password =
    document
      .getElementById("password")
      .value;

  const loginBtn =
    document
      .getElementById("loginBtn");

  const message =
    document
      .getElementById("loginMessage");


  if (!username || !password) {

    showMessage(
      "請輸入管理員帳號與密碼",
      "error"
    );

    return;
  }


  loginBtn.disabled = true;

  loginBtn.innerText =
    "登入中...";

  message.innerText = "";


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

          body: JSON.stringify({

            action:
              "adminLogin",

            username:
              username,

            password:
              password

          })
        }
      );


    const result =
      await response.json();


    if (!result.success) {

      throw new Error(
        result.message ||
        "登入失敗"
      );

    }


    // 儲存管理員 Token
    localStorage.setItem(
      adminTokenKey,
      result.token
    );


    // 登入成功
    showMessage(
      "登入成功，正在進入管理後台...",
      "success"
    );


    setTimeout(
      function () {

        window.location.href =
          "admin-dashboard.html";

      },
      500
    );


  } catch (error) {

    console.error(error);

    showMessage(
      error.message ||
      "登入失敗，請稍後再試",
      "error"
    );

  } finally {

    loginBtn.disabled = false;

    loginBtn.innerText =
      "登入";

  }

}


/**
 * 檢查 Token 是否仍然有效
 */
async function checkAdminLogin(token) {

  try {

    const response =
      await fetch(
        API_URL +
        "?action=adminMe&token=" +
        encodeURIComponent(token)
      );


    const result =
      await response.json();


    if (
      result.success &&
      result.admin
    ) {

      window.location.href =
        "admin-dashboard.html";

    } else {

      localStorage.removeItem(
        adminTokenKey
      );

    }

  } catch (error) {

    console.error(error);

  }

}


/**
 * 顯示登入訊息
 */
function showMessage(
  text,
  type
) {

  const message =
    document.getElementById(
      "loginMessage"
    );

  message.innerText =
    text;

  message.className =
    "form-message " +
    type;

}
