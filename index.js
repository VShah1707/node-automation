import nodemailer from "nodemailer";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

// ✅ Safe email parsing
const emails = process.env.EMAIL_TO?.split(",") || [];

// 📧 Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 🧠 EMI CONFIG
const START_DATE = new Date("2025-03-30");
const EMI_AMOUNT = 7563;
const TOTAL_TENURE = 60;

// 📂 File path
const FILE_PATH = "./emi.json";

// 📥 Load EMI number (EMIs already paid)
const getEmiNumber = () => {
  try {
    const data = fs.readFileSync(FILE_PATH, "utf-8");
    return JSON.parse(data).emiNumber;
  } catch {
    return 0;
  }
};

// 💾 Save EMI number
const saveEmiNumber = (emiNumber) => {
  fs.writeFileSync(FILE_PATH, JSON.stringify({ emiNumber }, null, 2) + "\n");
};

// 🚀 MAIN FUNCTION
(async () => {
  try {
    // 🗓️ Only run on the last day of the month
    const today = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    if (today.getDate() !== lastDay) {
      console.log(`⏭️ Today is ${today.getDate()}. Last day is ${lastDay}. Skipping.`);
      return;
    }

    let emiNumber = getEmiNumber();

    if (emiNumber >= TOTAL_TENURE) {
      console.log("✅ All EMIs completed");
      return;
    }

    // 📅 Due date = 3rd of next month
    const dueDate = new Date(today.getFullYear(), today.getMonth() + 1, 3);

    const formattedDate = dueDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    // ✅ CORRECT EMI LOGIC
    const paidEMIs = emiNumber;
    const currentEmi = paidEMIs + 1;
    const remainingTenure = TOTAL_TENURE - paidEMIs;

    const progressPercent = Math.round((paidEMIs / TOTAL_TENURE) * 100);
    const totalPaid = (paidEMIs * EMI_AMOUNT).toLocaleString("en-IN");
    const totalRemaining = (remainingTenure * EMI_AMOUNT).toLocaleString("en-IN");

    console.log(
      `📅 EMI #${currentEmi} | Paid: ${paidEMIs} | Remaining: ${remainingTenure}`
    );

    const info = await transporter.sendMail({
      from: `"EMI Reminder" <${process.env.EMAIL_USER}>`,
      to: emails,
      subject: `💳 EMI #${currentEmi} Due — ₹${EMI_AMOUNT} on ${formattedDate}`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>EMI Reminder</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 16px;">
  <tr><td align="center">

    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:0;overflow:hidden;">

      <!-- HERO BLOCK - BIG COLOR SPLIT -->
      <tr>
        <td style="background:#6366f1;padding:0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <!-- LEFT: Text -->
              <td style="padding:40px 0 40px 44px;width:60%;">
                <p style="margin:0 0 6px;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#a5b4fc;font-family:Arial,sans-serif;">Monthly Notice</p>
                <h1 style="margin:0 0 4px;font-size:32px;color:#ffffff;font-family:Arial,sans-serif;font-weight:900;line-height:1.1;">EMI Due</h1>
                <p style="margin:0;font-size:14px;color:#c7d2fe;font-family:Arial,sans-serif;">Installment #${currentEmi} of ${TOTAL_TENURE}</p>
              </td>
              <!-- RIGHT: Amount box -->
              <td style="padding:0;background:#4f46e5;width:40%;">
                <table width="100%" height="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:36px 32px;text-align:center;vertical-align:middle;">
                      <p style="margin:0 0 4px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#a5b4fc;font-family:Arial,sans-serif;">Pay Now</p>
                      <p style="margin:0;font-size:36px;color:#ffffff;font-family:Arial,sans-serif;font-weight:900;line-height:1;letter-spacing:-1px;">&#8377;${EMI_AMOUNT.toLocaleString("en-IN")}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- DUE DATE BANNER -->
      <tr>
        <td style="background:#4f46e5;padding:14px 44px;border-top:1px solid #6366f1;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <p style="margin:0;font-size:13px;color:#e0e7ff;font-family:Arial,sans-serif;">
                  &#128197;&nbsp; <strong style="color:#ffffff;">Due Date:</strong> ${formattedDate}
                </p>
              </td>
              <td align="right">
                <p style="margin:0;font-size:13px;color:#e0e7ff;font-family:Arial,sans-serif;">
                  &#9201;&nbsp; <strong style="color:#ffffff;">${remainingTenure}</strong> months remaining
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- GREETING -->
      <tr>
        <td style="padding:32px 44px 20px;">
  <p style="margin:0;font-size:15px;color:#374151;font-family:Arial,sans-serif;line-height:1.7;">
    Hi <strong style="color:#111827;">Jay</strong>, the auto-debit for your loan is scheduled on <strong>${formattedDate}</strong>. 
    Please ensure the EMI amount is available before the due date to avoid any issues.
  </p>
</td>
      </tr>

      <!-- 3 STAT BOXES -->
      <tr>
        <td style="padding:0 44px 28px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="width:33%;padding-right:8px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#eef2ff;border-radius:12px;border-top:4px solid #6366f1;">
                  <tr>
                    <td style="padding:18px 16px;text-align:center;">
                      <p style="margin:0 0 6px;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#6366f1;font-family:Arial,sans-serif;">EMIs Paid</p>
                      <p style="margin:0;font-size:28px;color:#111827;font-family:Arial,sans-serif;font-weight:900;line-height:1;">${paidEMIs}</p>
                      <p style="margin:4px 0 0;font-size:11px;color:#6b7280;font-family:Arial,sans-serif;">of ${TOTAL_TENURE}</p>
                    </td>
                  </tr>
                </table>
              </td>
              <td style="width:33%;padding:0 4px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border-radius:12px;border-top:4px solid #22c55e;">
                  <tr>
                    <td style="padding:18px 16px;text-align:center;">
                      <p style="margin:0 0 6px;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#16a34a;font-family:Arial,sans-serif;">Total Paid</p>
                      <p style="margin:0;font-size:18px;color:#111827;font-family:Arial,sans-serif;font-weight:900;line-height:1;">&#8377;${totalPaid}</p>
                      <p style="margin:4px 0 0;font-size:11px;color:#6b7280;font-family:Arial,sans-serif;">so far</p>
                    </td>
                  </tr>
                </table>
              </td>
              <td style="width:33%;padding-left:8px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed;border-radius:12px;border-top:4px solid #f97316;">
                  <tr>
                    <td style="padding:18px 16px;text-align:center;">
                      <p style="margin:0 0 6px;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#ea580c;font-family:Arial,sans-serif;">Outstanding</p>
                      <p style="margin:0;font-size:18px;color:#111827;font-family:Arial,sans-serif;font-weight:900;line-height:1;">&#8377;${totalRemaining}</p>
                      <p style="margin:4px 0 0;font-size:11px;color:#6b7280;font-family:Arial,sans-serif;">left</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- PROGRESS BAR -->
      <tr>
        <td style="padding:0 44px 28px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td><p style="margin:0 0 8px;font-size:12px;color:#6b7280;font-family:Arial,sans-serif;font-weight:bold;">Loan Completion &mdash; <span style="color:#6366f1;">${progressPercent}%</span></p></td>
            </tr>
            <tr>
              <td>
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#e5e7eb;border-radius:999px;height:10px;overflow:hidden;">
                  <tr>
                    <td width="${progressPercent}%" style="background:linear-gradient(90deg,#6366f1,#818cf8);height:10px;border-radius:999px;"></td>
                    <td></td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- ALERT -->
      <tr>
        <td style="padding:0 44px 36px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border-radius:10px;border:1px solid #fca5a5;">
            <tr>
             <td style="padding:14px 22px;">
  <p style="margin:0;font-size:13px;color:#dc2626;font-family:Arial,sans-serif;line-height:1.6;font-weight:bold;">
    &#9888; <strong>Varshil!</strong> Please ensure sufficient balance is maintained in your ICICI Bank account before ${formattedDate} to avoid penalties.
  </p>
</td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td style="padding:20px 44px;background:#f9fafb;border-top:1px solid #e5e7eb;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <p style="margin:0;font-size:11px;color:#9ca3af;font-family:Arial,sans-serif;line-height:1.7;">Do not reply &middot; Ref: EMI-${String(currentEmi).padStart(4,"0")} &middot; &copy; ${new Date().getFullYear()} EMI Tracker</p>
              </td>
              <td align="right">
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="background:#6366f1;width:32px;height:32px;border-radius:8px;text-align:center;line-height:32px;color:#ffffff;font-weight:900;font-size:14px;font-family:Arial,sans-serif;">&#8377;</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>

    </table>

  </td></tr>
</table>

</body>
</html>
      `,
    });

    console.log("✅ Email sent:", info.response);
    saveEmiNumber(emiNumber + 1);

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
})();
