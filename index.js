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

// 📥 Load EMI number (number of EMIs already paid)
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

    // ✅ CORRECT LOGIC
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
        <!-- ONLY CHANGES BELOW -->
        <!-- Replaced emiNumber → currentEmi -->
        <!-- Replaced paidEMIs logic -->
        
        <h2>EMI #${currentEmi}</h2>
        <p>Total Paid: ₹${totalPaid}</p>
        <p>Remaining: ₹${totalRemaining}</p>
      `,
    });

    console.log("✅ Email sent:", info.response);

    // 💾 Save next EMI (increment paid count)
    saveEmiNumber(emiNumber + 1);

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
})();
