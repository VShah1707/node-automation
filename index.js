import nodemailer from "nodemailer";
import dotenv from "dotenv";
import fs from "fs";
console.log("debuging")
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

    if (today.getDate() !== emiDay) {
      console.log("⏳ Not EMI date");
      return;
    }

    // 📅 EMI date calculation
    const emiDate = new Date(START_DATE);
    emiDate.setMonth(START_DATE.getMonth() + (emiNumber - 1));

    const emiMonthLastDay = new Date(
      emiDate.getFullYear(),
      emiDate.getMonth() + 1,
      0
    ).getDate();

    const finalDay = emiMonthLastDay >= 30 ? 30 : emiMonthLastDay;
    emiDate.setDate(finalDay);

    const formattedDate = emiDate.toLocaleDateString("en-IN");

    const remainingTenure = TOTAL_TENURE - emiNumber + 1;

    console.log(`📅 EMI #${emiNumber} | Remaining: ${remainingTenure}`);

    const info = await transporter.sendMail({
      from: `"EMI Reminder" <${process.env.EMAIL_USER}>`,
      to: emails,
      subject: `EMI #${emiNumber} Reminder`,
      html: `
<!DOCTYPE html>
<html>
<body style="margin:0; padding:0; background:#eef2f7; font-family:Arial;">
  <div style="max-width:600px; margin:40px auto; background:#fff; padding:20px; border-radius:10px;">
    <h2>📅 EMI Reminder</h2>
    <p>Hi <strong>Varshil</strong>,</p>
    <p>This is your EMI <strong>#${emiNumber}</strong></p>

    <p><strong>Due Date:</strong> ${formattedDate}</p>
    <p><strong>Amount:</strong> ₹ ${EMI_AMOUNT}</p>
    <p><strong>Remaining:</strong> ${remainingTenure} months</p>

    <p style="color:red;">⚠️ Maintain balance in XYZ Bank</p>
  </div>
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
