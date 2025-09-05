// Espera o DOM carregar completamente
document.addEventListener("DOMContentLoaded", function () {
  // Elementos da sidebar
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");
  const closeBtn = document.getElementById("closeBtn");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const dropdownCadastro = document.getElementById("dropdownCadastro");
  const dropdownContainer = document.getElementById("dropdownContainer");

  // Elementos da pré-visualização
  const prevPageBtn = document.getElementById("prevPage");
  const nextPageBtn = document.getElementById("nextPage");
  const currentPageElement = document.getElementById("currentPage");
  const zoomInBtn = document.getElementById("zoomIn");
  const zoomOutBtn = document.getElementById("zoomOut");
  const zoomLevelElement = document.querySelector(".zoom-level");

  // Elementos do formulário
  const gerarPDFBtn = document.getElementById("gerarPDF");
  const salvarRascunhoBtn = document.getElementById("salvarRascunho");

  // Elementos da pré-visualização
  const previewContent = document.querySelector(".preview-content");
  const previewPlaceholder = document.querySelector(".preview-placeholder");

  // Variáveis de estado
  let currentPage = 1;
  let totalPages = 2;
  let zoomLevel = 100;

  // Controle da Sidebar
  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      sidebar.classList.add("open");
      sidebarOverlay.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeSidebar);
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", closeSidebar);
  }

  function closeSidebar() {
    sidebar.classList.remove("open");
    sidebarOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  // Dropdown do menu Cadastros
  if (dropdownCadastro && dropdownContainer) {
    dropdownCadastro.addEventListener("click", function (e) {
      e.preventDefault();
      dropdownCadastro.classList.toggle("open");

      if (dropdownContainer.style.display === "block") {
        dropdownContainer.style.display = "none";
      } else {
        dropdownContainer.style.display = "block";
      }
    });
  }

  // Navegação entre páginas
  if (prevPageBtn) {
    prevPageBtn.addEventListener("click", function () {
      if (currentPage > 1) {
        currentPage--;
        updatePageNavigation();
        updatePreview();
      }
    });
  }

  if (nextPageBtn) {
    nextPageBtn.addEventListener("click", function () {
      if (currentPage < totalPages) {
        currentPage++;
        updatePageNavigation();
        updatePreview();
      }
    });
  }

  function updatePageNavigation() {
    // Atualiza o indicador de página
    if (currentPageElement) {
      currentPageElement.textContent = currentPage;
    }

    // Mostra/oculta páginas do PDF
    const pagina1 = document.getElementById("pagina1");
    const pagina2 = document.getElementById("pagina2");

    if (pagina1) pagina1.style.display = currentPage === 1 ? "block" : "none";
    if (pagina2) pagina2.style.display = currentPage === 2 ? "block" : "none";

    // Atualiza estado dos botões de navegação
    if (prevPageBtn) {
      prevPageBtn.disabled = currentPage === 1;
      prevPageBtn.style.opacity = currentPage === 1 ? "0.5" : "1";
    }

    if (nextPageBtn) {
      nextPageBtn.disabled = currentPage === totalPages;
      nextPageBtn.style.opacity = currentPage === totalPages ? "0.5" : "1";
    }
  }

  // Controles de Zoom
  if (zoomInBtn) {
    zoomInBtn.addEventListener("click", function () {
      if (zoomLevel < 150) {
        zoomLevel += 10;
        updateZoom();
        updatePreview();
      }
    });
  }

  if (zoomOutBtn) {
    zoomOutBtn.addEventListener("click", function () {
      if (zoomLevel > 50) {
        zoomLevel -= 10;
        updateZoom();
        updatePreview();
      }
    });
  }

  function updateZoom() {
    if (zoomLevelElement) {
      zoomLevelElement.textContent = zoomLevel + "%";
    }

    // Aplica o zoom ao conteúdo de pré-visualização
    if (previewContent) {
      previewContent.style.transform = `scale(${zoomLevel / 100})`;
      previewContent.style.transformOrigin = "center";
    }
  }

  // Função para gerar PDF (AJUSTADA PARA CAPTURA COMPLETA)
  function gerarPDF() {
    console.log("Gerando PDF do formulário...");

    // Mostrar loading
    const gerarPDFBtn = document.getElementById("gerarPDF");
    const originalText = gerarPDFBtn.innerHTML;
    gerarPDFBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Gerando PDF...';
    gerarPDFBtn.disabled = true;

    // SALVAR ESTADO ATUAL COMPLETO
    const pagina1 = document.getElementById("pagina1");
    const pagina2 = document.getElementById("pagina2");
    const displayOriginalPagina1 = pagina1.style.display;
    const displayOriginalPagina2 = pagina2.style.display;
    const originalScroll = window.scrollY;

    // SALVAR ESTADO DA NAVEGAÇÃO ATUAL
    const currentPageBeforePDF = currentPage;

    // MOSTRAR TODAS AS PÁGINAS E POSICIONAR NO TOPO
    pagina1.style.display = "block";
    pagina2.style.display = "block";

    // TEMPORARIAMENTE RESTAURAR A NAVEGAÇÃO PARA MOSTRAR AMBAS AS PÁGINAS
    currentPage = 0; // Forçar mostrar todas as páginas

    // Scroll para o topo para garantir que tudo seja capturado
    window.scrollTo(0, 0);

    // Capturar a div do formulário (left-side)
    const formularioDiv = document.querySelector(".left-side");

    // Configurações do html2canvas melhoradas
    const options = {
      scale: 2, // Maior qualidade
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: "#ffffff",
      scrollX: 0, // Forçar scroll X para 0
      scrollY: 0, // Forçar scroll Y para 0
      windowWidth: formularioDiv.scrollWidth,
      windowHeight: formularioDiv.scrollHeight,
      onclone: function (clonedDoc) {
        // Garantir que no clone também todas as páginas estejam visíveis
        const clonedPagina1 = clonedDoc.getElementById("pagina1");
        const clonedPagina2 = clonedDoc.getElementById("pagina2");
        if (clonedPagina1) clonedPagina1.style.display = "block";
        if (clonedPagina2) clonedPagina2.style.display = "block";

        // Remover qualquer transform/zoom que possa estar afetando
        const clonedPreview = clonedDoc.querySelector(".preview-content");
        if (clonedPreview) {
          clonedPreview.style.transform = "none";
          clonedPreview.style.overflow = "visible";
        }
      },
    };

    // Dar tempo para o DOM atualizar e renderizar completamente
    setTimeout(() => {
      html2canvas(formularioDiv, options)
        .then((canvas) => {
          // RESTAURAR ESTADO ORIGINAL COMPLETO
          pagina1.style.display = displayOriginalPagina1;
          pagina2.style.display = displayOriginalPagina2;
          window.scrollTo(0, originalScroll);
          currentPage = currentPageBeforePDF; // Restaurar página atual
          updatePageNavigation(); // Atualizar navegação para estado anterior

          // Ajustar o canvas se necessário (às vezes precisa de correção de altura)
          const ctx = canvas.getContext("2d");
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

          // Verificar se há conteúdo cortado
          let contentBottom = 0;
          for (let y = canvas.height - 1; y >= 0; y--) {
            for (let x = 0; x < canvas.width; x++) {
              const alpha = imageData.data[(y * canvas.width + x) * 4 + 3];
              if (alpha > 0) {
                contentBottom = y;
                break;
              }
            }
            if (contentBottom > 0) break;
          }

          // Criar novo canvas com altura ajustada se necessário
          let finalCanvas = canvas;
          if (contentBottom < canvas.height * 0.9) {
            const newCanvas = document.createElement("canvas");
            newCanvas.width = canvas.width;
            newCanvas.height = contentBottom + 50; // Margem de 50px
            const newCtx = newCanvas.getContext("2d");
            newCtx.drawImage(canvas, 0, 0);
            finalCanvas = newCanvas;
          }

          // Criar o PDF
          const { jsPDF } = window.jspdf;
          const doc = new jsPDF("p", "mm", "a4");

          const imgData = finalCanvas.toDataURL("image/png", 1.0);
          const imgWidth = 210; // Largura A4 em mm
          const imgHeight = (finalCanvas.height * imgWidth) / finalCanvas.width;

          // Calcular posicionamento para centralizar melhor
          const pageHeight = doc.internal.pageSize.height;
          const yPosition = (pageHeight - imgHeight) / 2;

          // Adicionar a imagem do formulário ao PDF
          doc.addImage(
            imgData,
            "PNG",
            0,
            yPosition > 0 ? yPosition : 0,
            imgWidth,
            imgHeight
          );

          // Salvar o PDF
          const nomeEmpresa =
            document.getElementById("nomeEmpresaRelatorio")?.value ||
            "relatorio";
          const nomeArquivo = `relatorio-auditoria-${nomeEmpresa.replace(
            /\s+/g,
            "-"
          )}.pdf`;

          doc.save(nomeArquivo);

          // Restaurar botão
          gerarPDFBtn.innerHTML = originalText;
          gerarPDFBtn.disabled = false;

          console.log("PDF gerado com sucesso!");
        })
        .catch((error) => {
          console.error("Erro ao gerar PDF:", error);

          // Restaurar estado original em caso de erro
          pagina1.style.display = displayOriginalPagina1;
          pagina2.style.display = displayOriginalPagina2;
          window.scrollTo(0, originalScroll);
          currentPage = currentPageBeforePDF; // Restaurar página atual
          updatePageNavigation(); // Atualizar navegação para estado anterior

          // Restaurar botão
          gerarPDFBtn.innerHTML = originalText;
          gerarPDFBtn.disabled = false;
          alert("Erro ao gerar PDF. Por favor, tente novamente.");
        });
    }, 300); // Aumentei o delay para 300ms para garantir renderização completa
  }
});

document.querySelectorAll(".clickable-option").forEach((option) => {
  option.addEventListener("click", function () {
    const isMarked = this.innerHTML.includes("X"); // verifica se já tem X

    if (isMarked) {
      // Se já tem X, volta para ( )
      this.innerHTML = this.innerHTML.replace(/\(.*?\)/, "( )");
    } else {
      // Caso contrário, marca X e reseta os irmãos da mesma pergunta
      const parent = this.closest("h2");
      parent.querySelectorAll(".clickable-option").forEach((o) => {
        o.innerHTML = o.innerHTML.replace(/\(.*?\)/, "( )");
      });

      this.innerHTML = this.innerHTML.replace(
        /\(.*?\)/,
        '(<span style="color:red; font-weight:bold;">X</span>)'
      );
    }
  });
});

if (gerarPDFBtn) {
  gerarPDFBtn.addEventListener("click", gerarPDF);
}
