// Função para inicializar a aplicação
document.addEventListener('DOMContentLoaded', function () {
  // Armazenamento de dados (simulando um banco de dados)
  let clientes = JSON.parse(localStorage.getItem('clientes')) || [];
  let editingId = null;

  // Elementos DOM
  const formCadastro = document.getElementById('formCadastro');
  const formConsulta = document.getElementById('formConsulta');
  const btnConsultar = document.getElementById('btnConsultar');
  const btnLimpar = document.getElementById('btnLimpar');
  const tabela = document.getElementById('tabela-clientes');
  const notification = document.getElementById('notification');

  // Máscara para CNPJ
  document.getElementById('cnpj').addEventListener('input', function (e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 14) value = value.slice(0, 14);

    if (value.length > 12) {
      value = value.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        '$1.$2.$3/$4-$5'
      );
    } else if (value.length > 8) {
      value = value.replace(/(\d{2})(\d{3})(\d{3})(\d+)/, '$1.$2.$3/$4');
    } else if (value.length > 5) {
      value = value.replace(/(\d{2})(\d{3})(\d+)/, '$1.$2.$3');
    } else if (value.length > 2) {
      value = value.replace(/(\d{2})(\d+)/, '$1.$2');
    }

    e.target.value = value;
  });

  // Máscara para telefone
  document.getElementById('telefone').addEventListener('input', function (e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 10) {
      value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (value.length > 6) {
      value = value.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3');
    } else if (value.length > 2) {
      value = value.replace(/(\d{2})(\d+)/, '($1) $2');
    }

    e.target.value = value;
  });

  // Função para mostrar notificação
  function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.className = `notification ${type} show`;

    setTimeout(() => {
      notification.classList.remove('show');
    }, 3000);
  }

  // Função para gerar ID único
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Função para atualizar a tabela
  function updateTable(filteredClientes = null) {
    const tbody = tabela.querySelector('tbody');
    const data = filteredClientes || clientes;

    tbody.innerHTML = '';

    if (data.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="7" class="empty-row">Nenhum cliente cadastrado</td></tr>';
      return;
    }

    data.forEach((cliente) => {
      const tr = document.createElement('tr');

      tr.innerHTML = `
                        <td>${cliente.nome}</td>
                        <td>${cliente.cnpj}</td>
                        <td>${cliente.email}</td>
                        <td>${cliente.telefone}</td>
                        <td>${cliente.responsavel}</td>
                        <td class="${
                          cliente.situacao === 'ativo'
                            ? 'status-ativo'
                            : 'status-inativo'
                        }">${
        cliente.situacao.charAt(0).toUpperCase() + cliente.situacao.slice(1)
      }</td>
                        <td>
                            <button class="btn-action btn-edit" data-id="${
                              cliente.id
                            }"><i class="fas fa-edit"></i></button>
                            <button class="btn-action btn-delete" data-id="${
                              cliente.id
                            }"><i class="fas fa-trash"></i></button>
                        </td>
                    `;

      tbody.appendChild(tr);
    });

    // Adicionar event listeners para os botões de ação
    document.querySelectorAll('.btn-edit').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        editCliente(id);
      });
    });

    document.querySelectorAll('.btn-delete').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        deleteCliente(id);
      });
    });
  }

  // Função para cadastrar cliente
  function addCliente(cliente) {
    cliente.id = generateId();
    clientes.push(cliente);
    localStorage.setItem('clientes', JSON.stringify(clientes));
    updateTable();
    showNotification('Cliente cadastrado com sucesso!');
  }

  // Função para editar cliente
  function editCliente(id) {
    const cliente = clientes.find((c) => c.id === id);
    if (!cliente) return;

    // Preencher formulário com dados do cliente
    document.getElementById('nome').value = cliente.nome;
    document.getElementById('cnpj').value = cliente.cnpj;
    document.getElementById('email').value = cliente.email;
    document.getElementById('telefone').value = cliente.telefone;
    document.getElementById('endereco').value = cliente.endereco;
    document.getElementById('responsavel').value = cliente.responsavel;
    document.getElementById('situacao').value = cliente.situacao;

    // Remover o cliente antigo
    clientes = clientes.filter((c) => c.id !== id);
    localStorage.setItem('clientes', JSON.stringify(clientes));

    showNotification('Preencha os dados para editar o cliente');
  }

  // Função para excluir cliente
  function deleteCliente(id) {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return;

    clientes = clientes.filter((c) => c.id !== id);
    localStorage.setItem('clientes', JSON.stringify(clientes));
    updateTable();
    showNotification('Cliente excluído com sucesso!');
  }

  // Função para consultar clientes
  function searchClientes(term) {
    if (!term.trim()) {
      updateTable();
      return;
    }

    const filtered = clientes.filter(
      (c) =>
        c.nome.toLowerCase().includes(term.toLowerCase()) ||
        c.cnpj.includes(term) ||
        c.responsavel.toLowerCase().includes(term.toLowerCase())
    );

    updateTable(filtered);

    if (filtered.length === 0) {
      showNotification(
        'Nenhum cliente encontrado com os critérios de busca.',
        'error'
      );
    }
  }

  // Event Listeners
  formCadastro.addEventListener('submit', function (e) {
    e.preventDefault();

    const cliente = {
      nome: document.getElementById('nome').value,
      cnpj: document.getElementById('cnpj').value,
      email: document.getElementById('email').value,
      telefone: document.getElementById('telefone').value,
      endereco: document.getElementById('endereco').value,
      responsavel: document.getElementById('responsavel').value,
      situacao: document.getElementById('situacao').value,
    };

    addCliente(cliente);
    formCadastro.reset();
  });

  btnConsultar.addEventListener('click', function () {
    const term = document.getElementById('consulta-cliente').value;
    searchClientes(term);
  });

  btnLimpar.addEventListener('click', function () {
    document.getElementById('consulta-cliente').value = '';
    updateTable();
  });

  // Inicializar a tabela
  updateTable();
});

