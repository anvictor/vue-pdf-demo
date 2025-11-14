import chromium from "chrome-aws-lambda";
import nodemailer from "nodemailer";
import fs from "fs/promises";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const { email, data } = req.body;

  // 1. Load template
  const templatePath = path.join(process.cwd(), "src", "template.html");
  let html = await fs.readFile(templatePath, "utf8");

  // 2. Insert data into template
  const tableRows = data.table
    .map((v, i) => `<tr><td>${i + 1}</td><td>${v}</td></tr>`)
    .join("");

  html = html
    .replace("{{number}}", data.number)
    .replace("{{tableRows}}", tableRows);

  // 3. Generate PDF using Chrome AWS Lambda
  const browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({ format: "A4" });
  await browser.close();

  // 4. Email PDF
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Автоматичний PDF",
    text: "Ваш PDF у вкладенні.",
    attachments: [
      {
        filename: "report.pdf",
        content: pdfBuffer,
      },
    ],
  });

  res.status(200).json({ ok: true });
}
