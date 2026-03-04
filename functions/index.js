const admin = require("firebase-admin");
const {onRequest} = require("firebase-functions/v2/https");
const cors = require("cors")({origin: true});
const PDFDocument = require("pdfkit");
const nodemailer = require("nodemailer");
const os = require("os");
const path = require("path");

admin.initializeApp();
const db = admin.firestore();
const storage = admin.storage();

// Configuração do Nodemailer para envio de e-mails
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "svtfaculdade@gmail.com", // Seu e-mail
    pass: "zxqi qaoe yxde ecye", // Senha ou chave de app
  },
});

exports.echoInputs = onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(405).send("Método não permitido. Use POST.");
    }

    const {code, requirerName, requirerEmail} = req.body;
    console.log(req.body);
    if (!code || !requirerEmail || !requirerName) {
      // eslint-disable-next-line max-len
      return res.status(400).send("Todos os campos são obrigatórios.");
    }

    try {
      // eslint-disable-next-line max-len
      const documentSnapshot = await db.collection("cadastros").doc(code).get();

      if (!documentSnapshot.exists) {
        return res.status(404).send("Documento não encontrado.");
      }

      const documentData = documentSnapshot.data();

      // Gera o PDF
      // eslint-disable-next-line max-len
      const pdfBuffer = await generatePdf(documentData, requirerName, requirerEmail);

      // Envia o PDF por e-mail
      // eslint-disable-next-line max-len
      await sendEmail(documentData.Nome, pdfBuffer, requirerName, requirerEmail);

      // Retorna o PDF como resposta HTTP
      res.setHeader("Content-Type", "application/pdf");
      // eslint-disable-next-line max-len
      res.setHeader("Content-Disposition", "attachment; filename='documento.pdf'");
      return res.status(200).send(pdfBuffer);
    } catch (error) {
      console.error("Erro no servidor:", error);
      res.status(500).send("Erro interno do servidor.");
    }
  });
});

// Função para gerar o PDF
async function generatePdf(documentData, _requirerName, _requirerEmail) {
  // eslint-disable-next-line max-len
  const doc = new PDFDocument({size: "A4", margins: {top: 50, left: 50, right: 50, bottom: 50}});
  const buffers = [];
  const bucketName = "portaldedeclaracoessvt.firebasestorage.app";
  // eslint-disable-next-line max-len
  const fileName = "assinatura/assinatura.jpeg"; // Caminho da imagem no Storage
  const tempImagePath = path.join(os.tmpdir(), "assinatura.jpeg");
  const fileNameBg = "assinatura/timbrado.png";
  // eslint-disable-next-line max-len
  const tempBackgroundImagePath = path.join(os.tmpdir(), "timbrado.png");

  const bucket = storage.bucket(bucketName);
  const file = bucket.file(fileName);
  await file.download({destination: tempImagePath});
  const fileBg = bucket.file(fileNameBg);
  await fileBg.download({destination: tempBackgroundImagePath});

  return new Promise((resolve, reject) => {
    // eslint-disable-next-line max-len
    doc.image(tempBackgroundImagePath, 0, 0, {width: 595.28, height: 841.89}); // Tamanho A4 (em pontos)
    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    doc.image(tempBackgroundImagePath, 0, 0, {width: 595.28, height: 841.89});
    // Conteúdo fixo do PDF
    doc.moveDown(6)
        .font("Helvetica-Bold")
        .fontSize(16)
        // eslint-disable-next-line max-len
        .text("DECLARAÇÃO DE AUTENTICIDADE", {align: "center", underline: true});

    doc.moveDown(0.2)
        .font("Helvetica")
        .fontSize(11)
        .text(
            // eslint-disable-next-line max-len
            `Declaração referente ao código: ${documentData.Numero}.`, {align: "center"},
        );

    doc.moveDown(3)
        .font("Helvetica")
        .fontSize(13)
        .text(
            `Att: ${_requirerName}.`,
        );

    doc.moveDown(1)
        .font("Helvetica")
        .fontSize(12)
        .text(
            // eslint-disable-next-line max-len
            `A SVT Faculdade inscrita no CNPJ nº 00.467.109/0001-33, instituição de ensino devidamente cadastrada no sistema e-mec sob registro (22405) SVT Faculdade de ensino superior SVT, sediada a Av. Castelo Branco, nº 605, bairro São Francisco, cidade de São Luís – MA, declara para fins de direito e a quem interessar, que o certificado de número único ${documentData.Numero}, referente ao curso de ${documentData.Curso}, expedido em ${formatDate(documentData.DataExpedicao)}, que tem como titular ${documentData.Nome}, matrícula ${documentData.Matricula}, RG ${documentData.RG} estando os dados acima apresentados de forma igual e sem rasuras, afirmamos que se trata de um documento autêntico e condiz com informações do curso e titularidade, de acordo com os dados constantes em nossa base de dados acadêmica.`,
            {align: "justify", lineGap: 10},
        );

    const now = new Date();
    const formatter = new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    const formattedDate = formatter.format(now);

    doc.moveDown(2)
        .text(`São Luís, ${formattedDate}.`, {align: "right"});

    const textY = doc.y;

    const marginBelowText = 20; // Margem abaixo do texto
    const imageWidth = 295;
    const imageHeight = 100;
    const pageWidth = doc.page.width;
    const imageX = (pageWidth - imageWidth) / 2; // Centraliza horizontalmente
    const imageY = textY + marginBelowText; // Posição abaixo do texto


    // Adicionar a imagem ao PDF
    doc.image(tempImagePath, imageX, imageY, {
      width: imageWidth,
      height: imageHeight,
    });

    doc.end();
  });
}

// Função para enviar o e-mail com o PDF em anexo
// eslint-disable-next-line max-len
async function sendEmail(_studentName, _pdfBuffer, _requirerName, _requirerEmail) {
  const mailOptions = {
    from: "svtfaculdade@gmail.com",
    to: "comercial@svtfaculdade.edu.br", // E-mail do destinatário
    subject: "Solicitação Declaração Certificado SVT",
    // eslint-disable-next-line max-len
    text: `O Requisitante: ${_requirerName} de Email: ${_requirerEmail}\n\nSolicitou a declaração de autenticidade do certificado do aluno: ${_studentName}.`,
    attachments: [
      {
        filename: "documento.pdf",
        content: _pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  };

  await transporter.sendMail(mailOptions);
}

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);

  return formattedDate;
};
