document.getElementById("gerarPDF").addEventListener("click", async () => {
  const { jsPDF } = window.jspdf;

  // Cria o documento PDF no formato A4 (milímetros)
  const pdf = new jsPDF("p", "mm", "a4");

  // Função para capturar cada página
  async function addPageToPDF(elementId, isFirstPage = false) {
    const element = document.getElementById(elementId);

    // Renderiza a página como imagem
    const canvas = await html2canvas(element, {
      scale: 2, // qualidade da captura
    });

    const imgData = canvas.toDataURL("image/png");

    // Dimensões do A4 em mm
    const pdfWidth = 210;
    const pdfHeight = 297;

    // Adiciona a imagem ao PDF
    if (!isFirstPage) pdf.addPage(); // adiciona nova página se não for a primeira
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  }

  // Adiciona as páginas
  await addPageToPDF("pagina1", true);
  await addPageToPDF("pagina2");

  // Baixa o PDF
  pdf.save("Relatorio_Auditoria.pdf");
});

// Função para tabela com (X)
document.querySelectorAll("#clickableTableBody td.editable").forEach((cell) => {
  cell.addEventListener("dblclick", function () {
    this.setAttribute("contenteditable", "true");
    this.focus();
  });

  cell.addEventListener("blur", function () {
    this.removeAttribute("contenteditable");
  });

  cell.addEventListener("click", function () {
    const text = this.innerHTML;

    if (text.includes("X")) {
      this.innerHTML = text.replace(/\(.*?\)/, "( )");
    } else {
      this.innerHTML = text.replace(
        /\(.*?\)/,
        '(<span style="color:red; font-weight:bold;">X</span>)'
      );
    }
  });
});

// Função para tabela livre
document.querySelectorAll("#editableTableBody td.free-edit").forEach((cell) => {
  cell.addEventListener("dblclick", function () {
    this.setAttribute("contenteditable", "true");
    this.focus();
  });

  cell.addEventListener("blur", function () {
    this.removeAttribute("contenteditable");
  });
});

document
  .querySelectorAll("#clickableTableBody td.clickable")
  .forEach((cell) => {
    cell.addEventListener("click", function () {
      const text = this.innerHTML;

      if (text.includes("X")) {
        // Se já tem X → volta para ( )
        this.innerHTML = text.replace(/\(.*?\)/, "( )");
      } else {
        // Marca com X vermelho em negrito
        this.innerHTML = text.replace(
          /\(.*?\)/,
          '(<span style="color:red; font-weight:bold;">X</span>)'
        );
      }
    });
  });

