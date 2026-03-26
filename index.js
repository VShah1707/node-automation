console.log("🔴 testing script run ");
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
    return 0; // ✅ start from 0
  }
};

// 💾 Save EMI number
const saveEmiNumber = (emiNumber) => {
  fs.writeFileSync(FILE_PATH, JSON.stringify({ emiNumber }, null, 2) + "\n");
};

// 🚀 MAIN FUNCTION
(async () => {
  try {
    let emiNumber = getEmiNumber();

    if (emiNumber >= TOTAL_TENURE) {
      console.log("✅ All EMIs completed");
      return;
    }

    const today = new Date();

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
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>EMI Reminder</title>
</head>
<body style="margin:0; padding:0; background-color:#0f0f13; font-family:'Georgia', serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f13; padding: 40px 16px;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background:#1a1a24; border-radius:20px; overflow:hidden; border: 1px solid #2e2e42;">

          <!-- Header -->
          <tr>
            <td style="padding: 36px 40px;">
              <h1 style="margin:0; color:#e8e8ff;">Loan EMI Due</h1>
              <p style="color:#aaa;">EMI #${currentEmi}</p>
            </td>
          </tr>

          <!-- Main -->
          <tr>
            <td style="padding: 24px 40px;">
              <h2 style="color:#f0d080;">₹${EMI_AMOUNT.toLocaleString("en-IN")}</h2>
              <p style="color:#ccc;">Due on ${formattedDate}</p>
              <p style="color:#ccc;">Remaining Tenure: ${remainingTenure}</p>
            </td>
          </tr>

          <!-- Progress -->
          <tr>
            <td style="padding: 24px 40px;">
              <p style="color:#ccc;">Progress: ${progressPercent}%</p>
              <p style="color:#ccc;">EMIs Paid: ${paidEMIs} / ${TOTAL_TENURE}</p>
              <p style="color:#ccc;">Total Paid: ₹${totalPaid}</p>
              <p style="color:#ccc;">Remaining Amount: ₹${totalRemaining}</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px;">
              <p style="color:#888;">Automated EMI reminder</p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
      `,
    });

    console.log("✅ Email sent:", info.response);

    // 💾 increment paid EMI
    saveEmiNumber(emiNumber + 1);

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
})();
