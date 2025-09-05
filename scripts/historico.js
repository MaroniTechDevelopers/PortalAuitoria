// Substituição do localStorage por IndexedDB para suporte a arquivos grandes
document.addEventListener("DOMContentLoaded", function () {
  const uploadForm = document.getElementById("uploadForm");
  const relatorioFileInput = document.getElementById("relatorioFile");
  const relatoriosBody = document.getElementById("relatorios-body");

  let db;
  const DB_NAME = "RelatoriosDB";
  const DB_VERSION = 1;
  const STORE_NAME = "relatorios";

  // Inicializar o IndexedDB
  function initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = function (event) {
        console.error("Erro ao abrir o banco de dados:", event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = function (event) {
        db = event.target.result;
        console.log("Banco de dados aberto com sucesso");
        resolve(db);
      };

      request.onupgradeneeded = function (event) {
        const db = event.target.result;

        // Verificar se o object store já existe
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          // Criar um object store para relatórios
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: "id",
            autoIncrement: true,
          });

          // Criar índices para busca
          store.createIndex("nome", "nome", { unique: false });
          store.createIndex("data", "data", { unique: false });
          store.createIndex("tamanho", "tamanho", { unique: false });

          console.log("Object store criado com sucesso");
        }
      };
    });
  }

  // Carregar relatórios ao iniciar a página
  initDB().then(() => {
    carregarRelatorios();
  });

  // Evento de envio do formulário
  uploadForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const file = relatorioFileInput.files[0];
    if (!file) {
      mostrarNotificacao("Por favor, selecione um arquivo.", "error");
      return;
    }

    // Verificar se é PDF
    if (file.type !== "application/pdf") {
      mostrarNotificacao("Por favor, selecione apenas arquivos PDF.", "error");
      return;
    }

    // Fazer upload do arquivo
    fazerUpload(file);
  });

  function fazerUpload(file) {
    const reader = new FileReader();

    reader.onload = function (e) {
      const arquivo = {
        nome: file.name,
        data: new Date().toISOString(),
        tamanho: file.size,
        conteudo: e.target.result.split(",")[1], // Remove o prefixo data:application/pdf;base64,
      };

      // Salvar no IndexedDB
      salvarRelatorio(arquivo)
        .then(() => {
          // Atualizar a tabela
          carregarRelatorios();

          // Limpar o input
          relatorioFileInput.value = "";

          mostrarNotificacao("Arquivo enviado com sucesso!", "success");
        })
        .catch((error) => {
          console.error("Erro ao salvar relatório:", error);
          mostrarNotificacao("Erro ao salvar o arquivo.", "error");
        });
    };

    reader.onerror = function () {
      mostrarNotificacao("Erro ao ler o arquivo.", "error");
    };

    reader.readAsDataURL(file);
  }

  function salvarRelatorio(arquivo) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      const request = store.add(arquivo);

      request.onsuccess = function () {
        resolve();
      };

      request.onerror = function (event) {
        reject(event.target.error);
      };
    });
  }

  function carregarRelatorios() {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = function () {
      const relatorios = request.result;

      if (relatorios.length === 0) {
        relatoriosBody.innerHTML =
          '<tr><td colspan="4" class="empty-row">Nenhum relatório salvo</td></tr>';
        return;
      }

      relatoriosBody.innerHTML = "";

      // Ordenar relatórios por data (mais recente primeiro)
      relatorios.sort((a, b) => new Date(b.data) - new Date(a.data));

      relatorios.forEach((relatorio, index) => {
        const tr = document.createElement("tr");

        // Formatar data
        const data = new Date(relatorio.data);
        const dataFormatada = data.toLocaleDateString("pt-BR");

        // Formatar tamanho
        const tamanhoFormatado = formatarTamanho(relatorio.tamanho);

        tr.innerHTML = `
          <td>${relatorio.nome}</td>
          <td>${dataFormatada}</td>
          <td>${tamanhoFormatado}</td>
          <td>
            <button class="btn-action btn-download" data-id="${relatorio.id}">
              <i class="fas fa-download"></i>
            </button>
            <button class="btn-action btn-delete" data-id="${relatorio.id}">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        `;

        relatoriosBody.appendChild(tr);
      });

      // Adicionar event listeners para os botões
      document.querySelectorAll(".btn-download").forEach((btn) => {
        btn.addEventListener("click", function () {
          const id = parseInt(this.getAttribute("data-id"));
          downloadRelatorio(id);
        });
      });

      document.querySelectorAll(".btn-delete").forEach((btn) => {
        btn.addEventListener("click", function () {
          const id = parseInt(this.getAttribute("data-id"));
          excluirRelatorio(id);
        });
      });
    };

    request.onerror = function () {
      relatoriosBody.innerHTML =
        '<tr><td colspan="4" class="empty-row">Erro ao carregar relatórios</td></tr>';
    };
  }

  function downloadRelatorio(id) {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = function () {
      const relatorio = request.result;

      if (relatorio) {
        // Converter base64 para blob
        const byteCharacters = atob(relatorio.conteudo);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });

        // Criar link para download
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = relatorio.nome;
        document.body.appendChild(a);
        a.click();

        // Limpar
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);

        mostrarNotificacao("Download iniciado!", "success");
      } else {
        mostrarNotificacao("Relatório não encontrado.", "error");
      }
    };

    request.onerror = function () {
      mostrarNotificacao("Erro ao fazer download do relatório.", "error");
    };
  }

  function excluirRelatorio(id) {
    if (!confirm("Tem certeza que deseja excluir este relatório?")) return;

    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = function () {
      carregarRelatorios();
      mostrarNotificacao("Relatório excluído com sucesso!", "success");
    };

    request.onerror = function () {
      mostrarNotificacao("Erro ao excluir o relatório.", "error");
    };
  }

  function formatarTamanho(bytes) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  function mostrarNotificacao(mensagem, tipo) {
    // Criar elemento de notificação
    const notificacao = document.createElement("div");
    notificacao.className = `notification ${tipo}`;
    notificacao.textContent = mensagem;

    // Estilos para a notificação
    notificacao.style.position = "fixed";
    notificacao.style.top = "20px";
    notificacao.style.right = "20px";
    notificacao.style.padding = "15px 25px";
    notificacao.style.borderRadius = "8px";
    notificacao.style.color = "white";
    notificacao.style.fontWeight = "600";
    notificacao.style.zIndex = "1000";
    notificacao.style.opacity = "0";
    notificacao.style.transform = "translateX(100%)";
    notificacao.style.transition = "all 0.3s";

    if (tipo === "success") {
      notificacao.style.background =
        "linear-gradient(135deg, #28a745, #20c997)";
    } else {
      notificacao.style.background =
        "linear-gradient(135deg, #dc3545, #c82333)";
    }

    document.body.appendChild(notificacao);

    // Mostrar notificação
    setTimeout(() => {
      notificacao.style.opacity = "1";
      notificacao.style.transform = "translateX(0)";
    }, 100);

    // Ocultar notificação após 3 segundos
    setTimeout(() => {
      notificacao.style.opacity = "0";
      notificacao.style.transform = "translateX(100%)";

      // Remover notificação após a animação
      setTimeout(() => {
        document.body.removeChild(notificacao);
      }, 300);
    }, 3000);
  }
});

