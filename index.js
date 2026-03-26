console.log("🔴 testing script run ");
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import fs from "fs";
console.error("Error");
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

// 📥 Load EMI number
const getEmiNumber = () => {
  try {
    const data = fs.readFileSync(FILE_PATH, "utf-8");
    return JSON.parse(data).emiNumber;
  } catch {
    return 1;
  }
};

// 💾 Save EMI number
const saveEmiNumber = (emiNumber) => {
  fs.writeFileSync(FILE_PATH, JSON.stringify({ emiNumber }, null, 2));
};

// 🚀 MAIN FUNCTION (runs once)
(async () => {
  try {
    let emiNumber = getEmiNumber();

    if (emiNumber > TOTAL_TENURE) {
      console.log("✅ All EMIs completed");
      return;
    }

    const today = new Date();

    // 🔥 Last day of current month
    const lastDay = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    ).getDate();
    const emiDay = lastDay >= 30 ? 30 : lastDay;

    // if (today.getDate() !== emiDay) {
    //   console.log("⏳ Not EMI date");
    //   return;
    // }

    // 📅 Due date = 3rd of next month from whenever email is sent
    const dueDate = new Date(today.getFullYear(), today.getMonth() + 1, 3);

    const formattedDate = dueDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const remainingTenure = TOTAL_TENURE - emiNumber + 1;
    const paidEMIs = emiNumber - 1;
    const progressPercent = Math.round((paidEMIs / TOTAL_TENURE) * 100);
    const totalPaid = (paidEMIs * EMI_AMOUNT).toLocaleString("en-IN");
    const totalRemaining = (remainingTenure * EMI_AMOUNT).toLocaleString("en-IN");

    console.log(`📅 EMI #${emiNumber} | Due: ${formattedDate} | Remaining: ${remainingTenure}`);

    const info = await transporter.sendMail({
      from: `"EMI Reminder" <${process.env.EMAIL_USER}>`,
      to: emails,
      subject: `💳 EMI #${emiNumber} Due — ₹${EMI_AMOUNT} on ${formattedDate}`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>EMI Reminder</title>
</head>
<body style="margin:0; padding:0; background-color:#0f0f13; font-family:'Georgia', serif;">

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f13; padding: 40px 16px;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background:#1a1a24; border-radius:20px; overflow:hidden; border: 1px solid #2e2e42;">

          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e1e2e 0%, #12122a 100%); padding: 36px 40px 28px; border-bottom: 1px solid #2e2e42;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0 0 6px; font-size:11px; letter-spacing:3px; text-transform:uppercase; color:#6c6c9a; font-family:Arial,sans-serif;">Monthly Reminder</p>
                    <h1 style="margin:0; font-size:28px; color:#e8e8ff; font-family:'Georgia',serif; font-weight:normal; letter-spacing:-0.5px;">Loan EMI Due</h1>
                  </td>
                  <td align="right" valign="middle">
                    <!-- Badge -->
                    <div style="display:inline-block; background: linear-gradient(135deg, #c9a84c, #f0d080); border-radius:50px; padding:10px 20px;">
                      <span style="font-size:13px; font-weight:bold; color:#1a1200; font-family:Arial,sans-serif; letter-spacing:1px;">EMI #${emiNumber}</span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 32px 40px 0;">
              <p style="margin:0; font-size:16px; color:#9494b8; font-family:Arial,sans-serif; line-height:1.6;">
                Hello <strong style="color:#e8e8ff;">Varshil</strong>, your upcoming EMI is due soon.<br/>Please ensure your bank account has sufficient balance.
              </p>
            </td>
          </tr>

          <!-- Main Amount Card -->
          <tr>
            <td style="padding: 24px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1f1f35 0%, #252538 100%); border-radius:14px; border: 1px solid #3a3a55; overflow:hidden;">
                <tr>
                  <td style="padding: 28px 32px;">
                    <p style="margin:0 0 8px; font-size:11px; letter-spacing:3px; text-transform:uppercase; color:#6c6c9a; font-family:Arial,sans-serif;">Amount Due</p>
                    <p style="margin:0; font-size:46px; font-family:'Georgia',serif; color:#f0d080; letter-spacing:-1px; line-height:1;">
                      &#8377;<strong>${EMI_AMOUNT.toLocaleString("en-IN")}</strong>
                    </p>
                    <p style="margin:10px 0 0; font-size:13px; color:#6c6c9a; font-family:Arial,sans-serif;">Due on &nbsp;<strong style="color:#c8c8e8;">${formattedDate}</strong></p>
                  </td>
                  <td align="right" style="padding: 28px 32px; vertical-align:middle;">
                    <p style="margin:0 0 4px; font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#6c6c9a; font-family:Arial,sans-serif;">Remaining</p>
                    <p style="margin:0; font-size:36px; font-family:'Georgia',serif; color:#e8e8ff; line-height:1;"><strong>${remainingTenure}</strong></p>
                    <p style="margin:4px 0 0; font-size:12px; color:#6c6c9a; font-family:Arial,sans-serif;">months left</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Progress Section -->
          <tr>
            <td style="padding: 0 40px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#1f1f35; border-radius:14px; border: 1px solid #2e2e42;">
                <tr>
                  <td style="padding:22px 28px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <p style="margin:0 0 12px; font-size:11px; letter-spacing:3px; text-transform:uppercase; color:#6c6c9a; font-family:Arial,sans-serif;">Repayment Progress</p>
                        </td>
                        <td align="right">
                          <p style="margin:0 0 12px; font-size:13px; color:#c9a84c; font-family:Arial,sans-serif; font-weight:bold;">${progressPercent}% Complete</p>
                        </td>
                      </tr>
                    </table>
                    <!-- Progress Bar Track -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#2a2a40; border-radius:100px; overflow:hidden; height:10px;">
                      <tr>
                        <td width="${progressPercent}%" style="background: linear-gradient(90deg, #c9a84c, #f0d080); height:10px; border-radius:100px;"></td>
                        <td></td>
                      </tr>
                    </table>
                    <!-- Stats Row -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
                      <tr>
                        <td>
                          <p style="margin:0; font-size:11px; color:#6c6c9a; font-family:Arial,sans-serif;">EMIs Paid</p>
                          <p style="margin:2px 0 0; font-size:15px; color:#e8e8ff; font-family:Arial,sans-serif; font-weight:bold;">${paidEMIs} <span style="font-size:11px; color:#6c6c9a; font-weight:normal;">of ${TOTAL_TENURE}</span></p>
                        </td>
                        <td align="center">
                          <p style="margin:0; font-size:11px; color:#6c6c9a; font-family:Arial,sans-serif;">Total Paid</p>
                          <p style="margin:2px 0 0; font-size:15px; color:#e8e8ff; font-family:Arial,sans-serif; font-weight:bold;">&#8377;${totalPaid}</p>
                        </td>
                        <td align="right">
                          <p style="margin:0; font-size:11px; color:#6c6c9a; font-family:Arial,sans-serif;">Remaining</p>
                          <p style="margin:2px 0 0; font-size:15px; color:#e8e8ff; font-family:Arial,sans-serif; font-weight:bold;">&#8377;${totalRemaining}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Alert Banner -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #2a1a1a, #2e1f1f); border-radius:12px; border: 1px solid #5a2e2e;">
                <tr>
                  <td style="padding:16px 24px;">
                    <p style="margin:0; font-size:13px; color:#ff9a9a; font-family:Arial,sans-serif; line-height:1.6;">
                      &#9888;&#65039; &nbsp;<strong>Action Required:</strong> Please maintain sufficient balance in your <strong>XYZ Bank</strong> account before the due date to avoid late fees or penalties.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <hr style="border:none; border-top:1px solid #2a2a3e; margin:0;" />
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0; font-size:11px; color:#44445a; font-family:Arial,sans-serif; line-height:1.7;">
                      This is an automated reminder. Do not reply to this email.<br/>
                      &copy; ${new Date().getFullYear()} EMI Tracker &nbsp;&middot;&nbsp; All rights reserved.
                    </p>
                  </td>
                  <td align="right" valign="middle">
                    <div style="width:36px; height:36px; background:linear-gradient(135deg,#c9a84c,#f0d080); border-radius:50%; text-align:center; line-height:36px; font-size:16px;">&#8377;</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- End Card -->

      </td>
    </tr>
  </table>

</body>
</html>
      `,
    });

    console.log("✅ Email sent:", info.response);

    // 💾 Save next EMI
    saveEmiNumber(emiNumber + 1);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1); // important for GitHub logs
  }
})();
