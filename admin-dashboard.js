const API_URL =
  "https://script.google.com/macros/s/AKfycbzoiQXbZQt12Ez_2yz2aQo4guCJwrmggYgGZr2XhB1N0xXXXH7qLUmp4-9xzDhMCvtN/exec";


const ADMIN_TOKEN_KEY =
  "adminToken";


let adminData = null;

let pendingAction = null;


/**
 * ========================================
 * 啟動
 * ========================================
 */
document.addEventListener(
  "DOMContentLoaded",
  function () {

    const token =
      localStorage.getItem(
        ADMIN_TOKEN_KEY
      );


    if (!token) {

      window.location.href =
        "admin.html";

      return;
    }


    document
      .getElementById("refreshBtn")
      .addEventListener(
        "click",
        loadDashboard
      );


    document
      .getElementById("logoutBtn")
      .addEventListener(
        "click",
        logout
      );


    document
      .getElementById("confirmCancel")
      .addEventListener(
        "click",
        closeConfirm
      );


    document
      .getElementById("confirmOk")
      .addEventListener(
        "click",
        executePendingAction
      );


    loadDashboard();

  }
);


/**
 * ========================================
 * 取得首頁資料
 * ========================================
 */
async function loadDashboard() {

  const token =
    localStorage.getItem(
      ADMIN_TOKEN_KEY
    );


  if (!token) {

    redirectToLogin();

    return;
  }


  const list =
    document.getElementById(
      "requestList"
    );


  list.innerHTML =
    `<div class="loading">
      載入中...
    </div>`;


  try {

    const response =
      await fetch(
        API_URL +
        "?action=adminDashboard&token=" +
        encodeURIComponent(token)
      );


    const result =
      await response.json();


    if (!result.success) {

      throw new Error(
        result.message ||
        "無法取得管理員資料"
      );
    }


    adminData =
      result.admin;


    renderAdminInfo(
      result.admin
    );


    renderStatistics(
      result.statistics
    );


    renderRequests(
      result.requests || []
    );


  } catch (error) {

    console.error(error);


    if (
      error.message.includes(
        "登入"
      )
    ) {

      localStorage.removeItem(
        ADMIN_TOKEN_KEY
      );

      redirectToLogin();

      return;
    }


    list.innerHTML =
      `<div class="empty">
        無法取得資料，請重新整理
      </div>`;

  }

}


/**
 * ========================================
 * 管理員資料
 * ========================================
 */
function renderAdminInfo(admin) {

  document.getElementById(
    "adminName"
  ).textContent =
    admin.name +
    "（" +
    admin.username +
    "）";


  document.getElementById(
    "adminRole"
  ).textContent =
    "權限：" +
    getRoleName(admin.role);

}


/**
 * ========================================
 * 統計
 * ========================================
 */
function renderStatistics(
  statistics
) {

  document.getElementById(
    "pendingCount"
  ).textContent =
    Number(
      statistics.pendingCount || 0
    );


  document.getElementById(
    "pendingAmount"
  ).textContent =
    formatMoney(
      statistics.pendingAmount || 0
    );

}


/**
 * ========================================
 * 儲值申請列表
 * ========================================
 */
function renderRequests(
  requests
) {

  const list =
    document.getElementById(
      "requestList"
    );


  if (!requests.length) {

    list.innerHTML =
      `<div class="empty">
        目前沒有儲值申請
      </div>`;

    return;
  }


  list.innerHTML =
    requests.map(
      function(request) {

        const isPending =
          request.status ===
          "Pending";


        let actions = "";


        if (isPending) {

          if (
            adminData &&
            (
              adminData.role ===
              "SuperAdmin" ||
              adminData.role ===
              "Admin"
            )
          ) {

            actions = `
              <div class="request-actions">

                <button
                  class="approve-btn"
                  onclick="confirmApprove('${escapeAttr(request.requestId)}')"
                >
                  ✅ 核准儲值
                </button>

                <button
                  class="reject-btn"
                  onclick="confirmReject('${escapeAttr(request.requestId)}')"
                >
                  ❌ 駁回
                </button>

              </div>
            `;

          } else {

            actions = `
              <div
                style="
                  margin-top:15px;
                  color:#888;
                  font-size:13px;
                "
              >
                您目前只有檢視權限
              </div>
            `;
          }
        }


        return `

          <div class="request-card">

            <div class="request-top">

              <div>

                <div class="request-id">
                  ${escapeHtml(request.requestId)}
                </div>

                <div
                  style="
                    margin-top:6px;
                    color:#777;
                    font-size:13px;
                  "
                >
                  申請時間：
                  ${escapeHtml(request.createdAt)}
                </div>

              </div>


              <div class="request-amount">
                ${formatMoney(request.amount)}
              </div>

            </div>


            <div
              style="
                margin-top:12px;
              "
            >

              <span
                class="status ${getStatusClass(request.status)}"
              >
                ${getStatusText(request.status)}
              </span>

            </div>


            <div class="request-info">

              <div>
                👤 會員：
                <strong>
                  ${escapeHtml(request.memberId)}
                </strong>
              </div>

              <div>
                🏦 銀行：
                ${escapeHtml(request.bank)}
              </div>

              <div>
                📅 匯款日期：
                ${escapeHtml(request.transferDate)}
              </div>

              <div>
                🕐 匯款時間：
                ${escapeHtml(request.transferTime)}
              </div>

              <div>
                💳 帳號後五碼：
                ${escapeHtml(request.accountLast5)}
              </div>

              <div>
                👨‍💼 處理人：
                ${escapeHtml(request.processedBy || "-")}
              </div>

            </div>


            ${
              request.note
                ? `
                  <div class="request-note">
                    備註：
                    ${escapeHtml(request.note)}
                  </div>
                `
                : ""
            }


            ${
              request.processedAt
                ? `
                  <div
                    style="
                      margin-top:10px;
                      font-size:13px;
                      color:#777;
                    "
                  >
                    處理時間：
                    ${escapeHtml(request.processedAt)}
                  </div>
                `
                : ""
            }


            ${actions}

          </div>

        `;

      }
    ).join("");

}


/**
 * ========================================
 * 核准確認
 * ========================================
 */
function confirmApprove(
  requestId
) {

  const request =
    findRequest(
      requestId
    );


  pendingAction = {
    type: "approve",
    requestId: requestId
  };


  document.getElementById(
    "confirmTitle"
  ).textContent =
    "確認核准儲值";


  document.getElementById(
    "confirmText"
  ).innerHTML =
    `
      確定要核准這筆儲值嗎？<br><br>
      儲值申請：
      <strong>
        ${escapeHtml(requestId)}
      </strong><br>
      金額：
      <strong>
        ${formatMoney(request.amount)}
      </strong><br><br>
      核准後會員餘額會立即增加。
    `;


  openConfirm();

}


/**
 * ========================================
 * 駁回確認
 * ========================================
 */
function confirmReject(
  requestId
) {

  const request =
    findRequest(
      requestId
    );


  pendingAction = {
    type: "reject",
    requestId: requestId
  };


  document.getElementById(
    "confirmTitle"
  ).textContent =
    "確認駁回儲值";


  document.getElementById(
    "confirmText"
  ).innerHTML =
    `
      確定要駁回這筆儲值嗎？<br><br>
      儲值申請：
      <strong>
        ${escapeHtml(requestId)}
      </strong><br>
      金額：
      <strong>
        ${formatMoney(request.amount)}
      </strong>
    `;


  openConfirm();

}


/**
 * ========================================
 * 執行確認操作
 * ========================================
 */
async function executePendingAction() {

  if (!pendingAction) {
    return;
  }


  closeConfirm();


  const token =
    localStorage.getItem(
      ADMIN_TOKEN_KEY
    );


  try {

    const action =
      pendingAction.type ===
      "approve"
        ? "approveTopup"
        : "rejectTopup";


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
              action,

            token:
              token,

            requestId:
              pendingAction.requestId

          })
        }
      );


    const result =
      await response.json();


    if (!result.success) {

      throw new Error(
        result.message ||
        "操作失敗"
      );
    }


    // 成功後重新載入
    await loadDashboard();


  } catch (error) {

    console.error(error);


    if (
      error.message.includes(
        "登入"
      )
    ) {

      localStorage.removeItem(
        ADMIN_TOKEN_KEY
      );

      redirectToLogin();

      return;
    }


    // 使用頁面內訊息，不使用 alert
    showTemporaryMessage(
      error.message ||
      "操作失敗"
    );

  }


  pendingAction = null;

}


/**
 * ========================================
 * 登出
 * ========================================
 */
async function logout() {

  const token =
    localStorage.getItem(
      ADMIN_TOKEN_KEY
    );


  try {

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
            "adminLogout",

          token:
            token

        })
      }
    );

  } catch (error) {

    console.error(error);

  }


  localStorage.removeItem(
    ADMIN_TOKEN_KEY
  );


  redirectToLogin();

}


/**
 * ========================================
 * 導向登入
 * ========================================
 */
function redirectToLogin() {

  window.location.href =
    "admin.html";

}


/**
 * ========================================
 * 找申請
 * ========================================
 */
function findRequest(
  requestId
) {

  const cards =
    window.currentRequests || [];


  for (
    let i = 0;
    i < cards.length;
    i++
  ) {

    if (
      cards[i].requestId ===
      requestId
    ) {

      return cards[i];

    }

  }


  return {
    requestId: requestId,
    amount: 0
  };

}


/**
 * ========================================
 * 角色名稱
 * ========================================
 */
function getRoleName(
  role
) {

  switch (role) {

    case "SuperAdmin":
      return "最高管理員";

    case "Admin":
      return "管理員";

    case "Viewer":
      return "檢視者";

    default:
      return role || "-";
  }

}


/**
 * ========================================
 * 狀態文字
 * ========================================
 */
function getStatusText(
  status
) {

  switch (status) {

    case "Pending":
      return "待審核";

    case "Approved":
      return "已核准";

    case "Rejected":
      return "已駁回";

    default:
      return status || "-";

  }

}


/**
 * ========================================
 * 狀態 CSS
 * ========================================
 */
function getStatusClass(
  status
) {

  switch (status) {

    case "Pending":
      return "status-pending";

    case "Approved":
      return "status-approved";

    case "Rejected":
      return "status-rejected";

    default:
      return "";

  }

}


/**
 * ========================================
 * 金額格式
 * ========================================
 */
function formatMoney(
  amount
) {

  return "$" +
    Number(amount || 0)
      .toLocaleString(
        "zh-TW"
      );

}


/**
 * ========================================
 * HTML 安全
 * ========================================
 */
function escapeHtml(
  value
) {

  return String(
    value ?? ""
  )
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


function escapeAttr(
  value
) {

  return String(
    value ?? ""
  )
    .replace(
      /\\/g,
      "\\\\"
    )
    .replace(
      /'/g,
      "\\'"
    );

}


/**
 * ========================================
 * 確認視窗
 * ========================================
 */
function openConfirm() {

  document.getElementById(
    "confirmModal"
  ).style.display =
    "flex";

}


function closeConfirm() {

  document.getElementById(
    "confirmModal"
  ).style.display =
    "none";

}


/**
 * ========================================
 * 暫時訊息
 * ========================================
 */
function showTemporaryMessage(
  message
) {

  const list =
    document.getElementById(
      "requestList"
    );


  const old =
    list.innerHTML;


  list.innerHTML =
    `
      <div
        style="
          padding:12px;
          margin-bottom:10px;
          background:#fdeaea;
          border-radius:9px;
          color:#a33;
        "
      >
        ${escapeHtml(message)}
      </div>
    ` +
    old;

}


/**
 * ========================================
 * 改寫 renderRequests
 * 同時保存 requests 給操作使用
 * ========================================
 */

const originalRenderRequests =
  renderRequests;

renderRequests =
  function(requests) {

    window.currentRequests =
      requests;

    originalRenderRequests(
      requests
    );

  };
