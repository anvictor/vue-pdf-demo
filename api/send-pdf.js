import chromium from "chrome-aws-lambda";
import nodemailer from "nodemailer";
import fs from "fs/promises";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  try {
    const { email, data } = req.body;
    if (!email) return res.status(400).send("No email");

    // 1) Load template
    const templatePath = path.join(process.cwd(), "src", "template.html");
    let html = await fs.readFile(templatePath, "utf8");

    // 2) Prepare table rows
    const tableRows = (data.table || [])
      .map((v, i) => `<tr><td>${i + 1}</td><td>${String(v)}</td></tr>`)
      .join("");

    html = html
      .replace("{{number}}", data.number ?? "")
      .replace("{{tableRows}}", tableRows);

    // 3) Launch chrome (chrome-aws-lambda)
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

    // 4) Send email with attachment
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
      text: "Вкладено PDF зі звітом.",
      attachments: [
        {
          filename: "report.pdf",
          content: pdfBuffer,
        },
      ],
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("send-pdf error:", err);
    return res.status(500).send("Internal Server Error");
  }
}
