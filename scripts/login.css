document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.getElementById('loginForm');
  const errorMessage = document.getElementById('errorMessage');

  // Lista de usuários autorizados (em um sistema real, isso viria de um backend seguro)
  const authorizedUsers = [
    'joanne.neves',
    'pedro.veloso',
    'mirian.lima',
    'patricia.fagundes',
    'samira.silva',
    'ana.pereira',
  ];

  // Para cada usuário, a senha é o próprio nome de usuário (em um sistema real, usaríamos hash e sal)
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    // Verificar se o usuário está na lista de autorizados e se a senha corresponde
    if (authorizedUsers.includes(username) && password === username) {
      // Login bem-sucedido - redirecionar para a página inicial
      window.location.href = 'Home.html';
    } else {
      // Login falhou - mostrar mensagem de erro
      errorMessage.style.display = 'block';

      // Esconder a mensagem de erro após 3 segundos
      setTimeout(() => {
        errorMessage.style.display = 'none';
      }, 3000);
    }
  });
});

