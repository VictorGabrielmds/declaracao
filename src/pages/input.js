import React, { useState } from "react";
import * as XLSX from "xlsx";
import { db } from "../services/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

import logo from "../assets/images/Logo Svt copiar.png";

const Input = () => {
  const [excelData, setExcelData] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [expeditionDate, setExpeditionDate] = useState("");
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [statusMsg, setStatusMsg] = useState("");

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const workbook = XLSX.read(event.target.result, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      setExcelData(XLSX.utils.sheet_to_json(sheet));
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSubmit = async () => {
    if (!selectedCourse || !expeditionDate) {
      setStatus("error"); setStatusMsg("Selecione o curso e a data de expedição."); return;
    }
    if (excelData.length === 0) {
      setStatus("error"); setStatusMsg("Nenhum dado carregado da planilha."); return;
    }
    setStatus("loading"); setStatusMsg("Enviando dados...");
    const filteredData = excelData.map((item) => ({
      Curso: selectedCourse, DataExpedicao: expeditionDate,
      Numero: item["Número"] || "", Matricula: item["Matricula"] || "",
      Nome: item["Nome"] || "", RG: item["RG"] || "",
    }));
    try {
      await Promise.all(filteredData.map(async (item) => {
        await setDoc(doc(db, "cadastros", String(item.Numero)), item);
      }));
      setStatus("success"); setStatusMsg(`${filteredData.length} registros inseridos com sucesso!`);
    } catch (error) {
      setStatus("error"); setStatusMsg("Erro ao inserir documentos. Verifique o console.");
    }
  };

  const handleDownload = () => {
    if (excelData.length === 0) { setStatus("error"); setStatusMsg("Nenhum dado carregado."); return; }
    const exportData = excelData.map((item) => {
      const row = { Numero: item["Número"] || "", Matricula: item["Matricula"] || "", Nome: item["Nome"] || "", RG: item["RG"] || "" };
      if (item["Título de TCC"]) row["Título de TCC"] = item["Título de TCC"];
      if (item["Nome do orientador"]) row["Nome do orientador"] = item["Nome do orientador"];
      Object.keys(item).forEach((key) => { if (key.toLowerCase().includes("nota")) row[key] = item[key]; });
      return row;
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(exportData), "Dados Exportados");
    XLSX.writeFile(wb, "dados_exportados.xlsx");
  };

  const filteredData = excelData.map((item) => ({
    Numero: item["Número"] || "", Matricula: item["Matricula"] || "",
    Nome: item["Nome"] || "", RG: item["RG"] || "",
  }));

  const s = styles;

  return (
    <div style={s.page}>
      {/* Sidebar */}
      <aside style={s.sidebar}>
        <div style={s.sidebarLogo}>
          <img style={{width:"180px", filter: "brightness(100)"}} src={logo} alt="Logo" />
          <span style={s.logoSub}>Painel Administrativo</span>
        </div>
        <nav style={s.nav}>
          <div style={{...s.navItem, ...s.navItemActive}}>
            <span style={s.navIcon}>⊞</span> Importar Dados
          </div>
        </nav>
        <div style={s.sidebarFooter}>Portal de Declarações</div>
      </aside>

      {/* Main content */}
      <main style={s.main}>
        <header style={s.header}>
          <div>
            <h1 style={s.pageTitle}>Importar Dados de Alunos</h1>
            <p style={s.pageSubtitle}>Carregue uma planilha Excel e envie os dados para o Firestore</p>
          </div>
        </header>

        {/* Status banner */}
        {status && status !== "loading" && (
          <div style={{...s.banner, ...(status === "success" ? s.bannerSuccess : s.bannerError)}}>
            <span style={s.bannerIcon}>{status === "success" ? "✓" : "!"}</span>
            {statusMsg}
            <button style={s.bannerClose} onClick={() => setStatus(null)}>×</button>
          </div>
        )}
        {status === "loading" && (
          <div style={{...s.banner, ...s.bannerLoading}}>
            <span style={s.spinner} /> {statusMsg}
          </div>
        )}

        {/* Form card */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <span style={s.cardStep}>01</span>
            <div>
              <h2 style={s.cardTitle}>Configuração da Importação</h2>
              <p style={s.cardDesc}>Selecione o arquivo e preencha os campos obrigatórios</p>
            </div>
          </div>

          <div style={s.fields}>
            {/* File upload */}
            <div style={s.field}>
              <label style={s.label}>Planilha Excel</label>
              <label style={s.fileLabel}>
                <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} style={{display:"none"}} />
                <span style={s.fileIcon}>📄</span>
                <span style={fileName ? s.fileNameActive : s.fileNamePlaceholder}>
                  {fileName || "Clique para selecionar o arquivo..."}
                </span>
                <span style={s.fileBadge}>Selecionar</span>
              </label>
            </div>

            {/* Course select */}
            <div style={s.field}>
              <label style={s.label}>Curso</label>
              <select style={s.select} value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
                <option value="">Selecione o curso</option>
                <option value="Pós Graduação em Advocacia Trabalhista">Pós Graduação em Advocacia Trabalhista</option>
                <option value="Pós Graduação em Advocacia Criminal">Pós Graduação em Advocacia Criminal</option>
                <option value="Pós Graduação em Advocacia Eleitoral">Pós Graduação em Advocacia Eleitoral</option>
              </select>
            </div>

            {/* Date */}
            <div style={s.field}>
              <label style={s.label}>Data de Expedição</label>
              <input style={s.input} type="date" value={expeditionDate} onChange={(e) => setExpeditionDate(e.target.value)} />
            </div>
          </div>

          {/* Actions */}
          <div style={s.actions}>
            <button style={s.btnPrimary} onClick={handleSubmit}>
              ↑ Enviar para Firestore
            </button>
            <button style={s.btnSecondary} onClick={handleDownload}>
              ↓ Download Excel
            </button>
          </div>
        </div>

        {/* Preview table */}
        {filteredData.length > 0 && (
          <div style={s.card}>
            <div style={s.cardHeader}>
              <span style={s.cardStep}>02</span>
              <div>
                <h2 style={s.cardTitle}>Pré-visualização</h2>
                <p style={s.cardDesc}>{filteredData.length} registros carregados · Curso: {selectedCourse || "—"} · Data: {expeditionDate || "—"}</p>
              </div>
            </div>
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {["Número", "Matrícula", "Nome", "RG"].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row, i) => (
                    <tr key={i} style={i % 2 === 0 ? s.trEven : s.trOdd}>
                      <td style={s.td}>{row.Numero}</td>
                      <td style={s.td}>{row.Matricula}</td>
                      <td style={{...s.td, fontWeight: 600}}>{row.Nome}</td>
                      <td style={s.td}>{row.RG}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const BORDÔ = "#63141B";
const BORDÔ_DARK = "#4a0f14";
const BORDÔ_LIGHT = "#f9f0f1";

const styles = {
  page: { display: "flex", minHeight: "100vh", background: "#F2F3F5", fontFamily: "'MontserratRegular', Arial, sans-serif" },

  // Sidebar
  sidebar: { width: 240, background: BORDÔ_DARK, display: "flex", flexDirection: "column", padding: "32px 0", flexShrink: 0 },
  sidebarLogo: { padding: "0 24px 32px", borderBottom: "1px solid rgba(255,255,255,0.1)" },
  logoMark: { fontFamily: "'MontserratBold', Arial, sans-serif", fontSize: 28, color: "#fff", letterSpacing: 4 },
  logoSub: { fontSize: 10, color: "rgba(255,255,255,0.5)", letterSpacing: 2, textTransform: "uppercase", display: "block", marginTop: 4 },
  nav: { padding: "24px 0", flex: 1 },
  navItem: { display: "flex", alignItems: "center", gap: 10, padding: "12px 24px", fontSize: 13, color: "rgba(255,255,255,0.6)", cursor: "pointer", letterSpacing: 0.5 },
  navItemActive: { background: "rgba(255,255,255,0.12)", color: "#fff", borderLeft: "3px solid #fff" },
  navIcon: { fontSize: 16 },
  sidebarFooter: { padding: "16px 24px", fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 1, textTransform: "uppercase" },

  // Main
  main: { flex: 1, padding: "40px 48px", overflowY: "auto" },
  header: { marginBottom: 32 },
  pageTitle: { fontFamily: "'MontserratBold', Arial, sans-serif", fontSize: 28, color: "#1a1a1a", margin: 0 },
  pageSubtitle: { fontSize: 13, color: "#888", marginTop: 6 },

  // Status banners
  banner: { display: "flex", alignItems: "center", gap: 10, padding: "14px 20px", borderRadius: 10, marginBottom: 24, fontSize: 13, position: "relative" },
  bannerSuccess: { background: "#f0faf0", border: "1px solid #b2dfb2", color: "#2e7d32" },
  bannerError: { background: BORDÔ_LIGHT, border: `1px solid #e8a0a5`, color: BORDÔ },
  bannerLoading: { background: "#f0f4ff", border: "1px solid #b3c6ff", color: "#1a3fbf" },
  bannerIcon: { fontWeight: "bold", fontSize: 16 },
  bannerClose: { background: "none", border: "none", cursor: "pointer", fontSize: 18, position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "inherit", opacity: 0.6 },
  spinner: { width: 14, height: 14, border: "2px solid #b3c6ff", borderTop: "2px solid #1a3fbf", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" },

  // Card
  card: { background: "#fff", borderRadius: 16, padding: "32px", marginBottom: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 20px rgba(0,0,0,0.04)" },
  cardHeader: { display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 28, paddingBottom: 20, borderBottom: "1px solid #f0f0f0" },
  cardStep: { fontFamily: "'MontserratBold', Arial, sans-serif", fontSize: 32, color: "#e8e8e8", lineHeight: 1, flexShrink: 0 },
  cardTitle: { fontFamily: "'MontserratBold', Arial, sans-serif", fontSize: 16, color: "#1a1a1a", margin: 0 },
  cardDesc: { fontSize: 12, color: "#999", marginTop: 4 },

  // Fields
  fields: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 28 },
  field: { display: "flex", flexDirection: "column", gap: 8 },
  label: { fontFamily: "'MontserratSemibold', Arial, sans-serif", fontSize: 12, color: "#444", letterSpacing: 0.5, textTransform: "uppercase" },

  // File upload
  fileLabel: { display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", border: "2px dashed #ddd", borderRadius: 10, cursor: "pointer", background: "#fafafa", transition: "border-color 0.2s" },
  fileIcon: { fontSize: 18, flexShrink: 0 },
  fileNamePlaceholder: { fontSize: 12, color: "#bbb", flex: 1 },
  fileNameActive: { fontSize: 12, color: "#444", flex: 1, fontFamily: "'MontserratSemibold', Arial, sans-serif" },
  fileBadge: { fontSize: 11, background: BORDÔ, color: "#fff", padding: "4px 10px", borderRadius: 6, flexShrink: 0, fontFamily: "'MontserratBold', Arial, sans-serif", letterSpacing: 0.5 },

  select: { padding: "10px 14px", border: "2px solid #e8e8e8", borderRadius: 10, fontSize: 13, background: "#fafafa", color: "#333", outline: "none", width: "100%", boxSizing: "border-box" },
  input: { padding: "10px 14px", border: "2px solid #e8e8e8", borderRadius: 10, fontSize: 13, background: "#fafafa", color: "#333", outline: "none", width: "100%", boxSizing: "border-box" },

  // Buttons
  actions: { display: "flex", gap: 12 },
  btnPrimary: { padding: "12px 28px", background: BORDÔ, color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontFamily: "'MontserratBold', Arial, sans-serif", letterSpacing: 1, cursor: "pointer" },
  btnSecondary: { padding: "12px 28px", background: "#f4f4f4", color: "#444", border: "2px solid #e8e8e8", borderRadius: 10, fontSize: 13, fontFamily: "'MontserratBold', Arial, sans-serif", letterSpacing: 1, cursor: "pointer" },

  // Table
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: { padding: "12px 16px", textAlign: "left", fontFamily: "'MontserratSemibold', Arial, sans-serif", fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 1, borderBottom: "2px solid #f0f0f0" },
  trEven: { background: "#fff" },
  trOdd: { background: "#fafafa" },
  td: { padding: "12px 16px", color: "#333", borderBottom: "1px solid #f5f5f5" },
};

export default Input;