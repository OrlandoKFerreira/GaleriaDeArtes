// =========================
// CONFIGURAÇÃO BÁSICA
// =========================
const API_BASE = "http://localhost:3000";

// =========================
// FUNÇÕES DE AUTENTICAÇÃO
// =========================
function salvarUsuarioLogado(usuario) {
  localStorage.setItem("usuarioLogado", JSON.stringify(usuario));
}

function obterUsuarioLogado() {
  const dados = localStorage.getItem("usuarioLogado");
  if (!dados) return null;
  try {
    return JSON.parse(dados);
  } catch (e) {
    return null;
  }
}

function limparUsuarioLogado() {
  localStorage.removeItem("usuarioLogado");
}

function exigirLogin() {
  const pageId = document.body.id;
  if (pageId === "login") return; // página de login é livre

  const usuario = obterUsuarioLogado();
  if (!usuario) {
    // não está logado, manda para o login
    window.location.href = "login.html";
  }
}

function initLogin() {
  const form = document.getElementById("form-login");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const emailEl = document.getElementById("email");
    const senhaEl = document.getElementById("senha");

    const email = emailEl.value.trim();
    const senha = senhaEl.value.trim();

    if (!email || !senha) {
      alert("Preencha e-mail e senha.");
      return;
    }

    try {
      // Busca usuário com esse email e senha no JSON Server
      const resp = await fetch(
        `${API_BASE}/usuarios?email=${encodeURIComponent(
          email
        )}&senha=${encodeURIComponent(senha)}`
      );

      if (!resp.ok) {
        throw new Error("Erro ao consultar usuários");
      }

      const usuarios = await resp.json();

      if (!usuarios.length) {
        alert("Usuário ou senha inválidos.");
        return;
      }

      const usuario = usuarios[0];

      // Salva apenas dados básicos (sem senha) na sessão
      salvarUsuarioLogado({
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      });

      // Redireciona para a home
      window.location.href = "index.html";
    } catch (error) {
      console.error("Erro no login:", error);
      alert("Erro ao tentar fazer login. Tente novamente mais tarde.");
    }
  });
}

// =========================
// FUNÇÕES DA HOME
// =========================
function carregarHome() {
  const carouselEl = document.getElementById("carousel-destaques");
  const listaEl = document.getElementById("lista-artistas");

  if (!carouselEl || !listaEl) return;

  fetch(`${API_BASE}/artistas`)
    .then((response) => response.json())
    .then((artistas) => {
      if (!artistas.length) {
        carouselEl.innerHTML = `
          <div class="text-center p-5 text-muted">
            Nenhum artista cadastrado ainda.
            Use o botão <strong>Adicionar artista</strong> para começar.
          </div>
        `;
        listaEl.innerHTML = `
          <div class="col-12">
            <div class="alert alert-secondary text-center">
              Nenhum artista na galeria ainda.
            </div>
          </div>
        `;
        return;
      }

      const destaques = artistas.filter((a) => a.destaque);
      const todos = artistas
        .slice()
        .sort((a, b) => a.nome.localeCompare(b.nome));

      if (!destaques.length) {
        carouselEl.innerHTML = `
          <div class="text-center p-5 text-muted">
            Sem artistas em destaque no momento.
          </div>
        `;
      } else {
        carouselEl.innerHTML = destaques
          .map(
            (artista, i) => `
            <div class="carousel-item ${i === 0 ? "active" : ""}">
              <img src="${
                artista.imagem_principal
              }" class="d-block w-100" alt="${artista.nome}">
              <div class="carousel-caption bg-dark bg-opacity-50 rounded-3 p-3">
                <h5 class="mb-1">${artista.nome}</h5>
                <p class="mb-2">${artista.descricao}</p>
                <a href="detalhes.html?id=${
                  artista.id
                }" class="btn btn-sm btn-primary">Ver detalhes</a>
              </div>
            </div>
          `
          )
          .join("");
      }

      listaEl.innerHTML = todos
        .map(
          (artista) => `
          <div class="col-12 col-sm-6 col-md-4 mb-4">
            <div class="card h-100 shadow-sm">
              <img src="${artista.imagem_principal}" class="card-img-top" alt="${artista.nome}">
              <div class="card-body d-flex flex-column">
                <h5 class="card-title">${artista.nome}</h5>
                <p class="card-text flex-grow-1">${artista.descricao}</p>
                <div class="d-flex flex-wrap gap-2 mt-2">
                  <a href="detalhes.html?id=${artista.id}" class="btn btn-primary btn-sm">Ver detalhes</a>
                  <a href="form_artista.html?id=${artista.id}" class="btn btn-warning btn-sm">Editar</a>
                  <button class="btn btn-danger btn-sm btn-excluir-artista" data-id="${artista.id}">
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          </div>
        `
        )
        .join("");
    })
    .catch((error) => {
      console.error("Erro ao carregar os dados dos artistas:", error);
      carouselEl.innerHTML = `
        <div class="text-center p-5">
          Erro ao carregar dados. Tente novamente mais tarde.
        </div>
      `;
    });
}

// =========================
// DETALHES DO ARTISTA
// =========================
function carregarDetalhes() {
  const container = document.getElementById("conteudo-artista");
  if (!container) return;

  const id = getQueryParam("id");
  if (!id) {
    container.innerHTML = `<div class="alert alert-warning">Nenhum artista encontrado. Verifique o link.</div>`;
    return;
  }

  fetch(`${API_BASE}/artistas/${id}`)
    .then((response) => {
      if (!response.ok) throw new Error("404");
      return response.json();
    })
    .then((artista) => {
      container.innerHTML = `
        <div class="card mb-4 shadow-sm">
          <img src="${artista.imagem_principal}" class="card-img-top" alt="${
        artista.nome
      }">
          <div class="card-body">
            <h2 class="h3">${artista.nome}</h2>
            <p class="mb-1"><strong>País:</strong> ${artista.pais || "-"}</p>
            <p class="mb-3">${artista.biografia || ""}</p>
            <a href="index.html" class="btn btn-outline-secondary btn-sm">⬅ Voltar</a>
            <a href="form_artista.html?id=${
              artista.id
            }" class="btn btn-warning btn-sm ms-2">Editar artista</a>
            <a href="form_obra.html?artistaId=${
              artista.id
            }" class="btn btn-success btn-sm ms-2">Adicionar obra</a>
          </div>
        </div>

        <h3 class="h4 mb-3">Obras de ${artista.nome}</h3>
        <div class="row">
          ${
            artista.obras && artista.obras.length
              ? artista.obras
                  .map(
                    (obra) => `
                <div class="col-12 col-sm-6 col-md-4 mb-4">
                  <div class="card h-100">
                    <img src="${obra.imagem}" class="card-img-top" alt="${obra.titulo}">
                    <div class="card-body">
                      <h5 class="card-title">${obra.titulo}</h5>
                      <p class="card-text">${obra.descricao}</p>
                    </div>
                  </div>
                </div>
              `
                  )
                  .join("")
              : `<div class="col-12"><div class="alert alert-info">Este artista ainda não possui obras cadastradas.</div></div>`
          }
        </div>
      `;
    })
    .catch((error) => {
      console.error("Erro ao carregar os detalhes do artista:", error);
      container.innerHTML = `<div class="alert alert-warning">Erro ao carregar dados do artista. Tente novamente mais tarde.</div>`;
    });
}

// =========================
// FORMULÁRIO DE ARTISTA
// =========================
function initFormArtista() {
  const form = document.getElementById("form-artista-form");
  if (!form) return;

  const id = getQueryParam("id");
  const titleEl = document.getElementById("form-title");
  const btnSalvar = document.getElementById("btn-salvar");

  const idEl = document.getElementById("artista-id");
  const nomeEl = document.getElementById("nome");
  const paisEl = document.getElementById("pais");
  const descEl = document.getElementById("descricao");
  const bioEl = document.getElementById("biografia");
  const imgEl = document.getElementById("imagem");
  const destEl = document.getElementById("destaque");

  let obrasAtual = [];

  if (id) {
    fetch(`${API_BASE}/artistas/${id}`)
      .then((response) => response.json())
      .then((artista) => {
        idEl.value = artista.id;
        nomeEl.value = artista.nome || "";
        paisEl.value = artista.pais || "";
        descEl.value = artista.descricao || "";
        bioEl.value = artista.biografia || "";
        imgEl.value = artista.imagem_principal || "";
        destEl.checked = !!artista.destaque;
        obrasAtual = artista.obras || [];

        titleEl.textContent = "Editar artista";
        btnSalvar.textContent = "Salvar alterações";
      })
      .catch((error) => {
        console.error("Erro ao carregar artista:", error);
      });
  } else {
    titleEl.textContent = "Adicionar artista";
    btnSalvar.textContent = "Salvar";
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const artista = {
      nome: nomeEl.value.trim(),
      descricao: descEl.value.trim(),
      biografia: bioEl.value.trim(),
      pais: paisEl.value.trim(),
      destaque: destEl.checked,
      imagem_principal: imgEl.value.trim(),
      obras: obrasAtual,
    };

    if (id) {
      fetch(`${API_BASE}/artistas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(artista),
      })
        .then(() => {
          window.location.href = "index.html";
        })
        .catch((error) => {
          console.error("Erro ao atualizar artista:", error);
        });
    } else {
      fetch(`${API_BASE}/artistas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(artista),
      })
        .then(() => {
          window.location.href = "index.html";
        })
        .catch((error) => {
          console.error("Erro ao criar artista:", error);
        });
    }
  });
}

// =========================
// FORMULÁRIO DE OBRA
// =========================
function proximoIdObra(obras) {
  if (!obras || !obras.length) return 1;
  const ids = obras.map((o) => o.id || 0);
  return Math.max(...ids) + 1;
}

function initFormObra() {
  const form = document.getElementById("form-obra-form");
  if (!form) return;

  const artistaId = getQueryParam("artistaId");
  const obraId = getQueryParam("obraId");

  const titleEl = document.getElementById("form-obra-title");
  const btnSalvar = document.getElementById("btn-salvar-obra");
  const btnVoltar = document.getElementById("btn-voltar-obra");

  const artistaIdEl = document.getElementById("artista-id");
  const obraIdEl = document.getElementById("obra-id");
  const tituloEl = document.getElementById("titulo");
  const descEl = document.getElementById("descricao");
  const imgEl = document.getElementById("imagem");

  artistaIdEl.value = artistaId || "";
  obraIdEl.value = obraId || "";

  if (btnVoltar && artistaId) {
    btnVoltar.href = `detalhes.html?id=${artistaId}`;
  }

  let artistaAtual = null;

  if (!artistaId) {
    alert("Nenhum artista informado para a obra.");
    return;
  }

  fetch(`${API_BASE}/artistas/${artistaId}`)
    .then((response) => response.json())
    .then((artista) => {
      artistaAtual = artista;

      if (obraId) {
        const obra = (artista.obras || []).find(
          (o) => String(o.id) === String(obraId)
        );
        if (obra) {
          tituloEl.value = obra.titulo || "";
          descEl.value = obra.descricao || "";
          imgEl.value = obra.imagem || "";
          titleEl.textContent = "Editar obra";
          btnSalvar.textContent = "Salvar alterações";
        }
      } else {
        titleEl.textContent = "Adicionar obra";
        btnSalvar.textContent = "Salvar";
      }
    })
    .catch((error) => {
      console.error("Erro ao carregar artista para obra:", error);
    });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!artistaAtual) return;

    const obras = artistaAtual.obras ? [...artistaAtual.obras] : [];

    let idFinal = obraId ? Number(obraId) : proximoIdObra(obras);

    const novaObra = {
      id: idFinal,
      titulo: tituloEl.value.trim(),
      descricao: descEl.value.trim(),
      imagem: imgEl.value.trim(),
    };

    const indexExistente = obras.findIndex(
      (o) => String(o.id) === String(idFinal)
    );
    if (indexExistente >= 0) {
      obras[indexExistente] = novaObra;
    } else {
      obras.push(novaObra);
    }

    const artistaAtualizado = {
      ...artistaAtual,
      obras,
    };

    fetch(`${API_BASE}/artistas/${artistaId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(artistaAtualizado),
    })
      .then(() => {
        window.location.href = `detalhes.html?id=${artistaId}`;
      })
      .catch((error) => {
        console.error("Erro ao salvar obra:", error);
      });
  });
}

// =========================
// GRÁFICO COM CHART.JS
// =========================
function carregarGraficoObras() {
  const ctx = document.getElementById("chartObras");
  if (!ctx) return;

  fetch(`${API_BASE}/artistas`)
    .then((res) => res.json())
    .then((artistas) => {
      const labels = artistas.map((a) => a.nome);
      const valores = artistas.map((a) => (a.obras ? a.obras.length : 0));

      new Chart(ctx, {
        type: "pie",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Número de obras",
              data: valores,
              backgroundColor: [
                "#77B1E7",
                "#B39DDB",
                "#FFAB91",
                "#A5D6A7",
                "#FFE082",
                "#90CAF9",
              ],
            },
          ],
        },
      });
    });
}

// =========================
// UTILITÁRIO DE QUERYSTRING
// =========================
function getQueryParam(nome) {
  const params = new URLSearchParams(window.location.search);
  return params.get(nome);
}

// =========================
// INICIALIZAÇÃO GERAL
// =========================
document.addEventListener("DOMContentLoaded", () => {
  const pageId = document.body.id;

  // Protege todas as páginas, menos o login
  exigirLogin();

  // Botão de logout (se existir no header)
  const btnLogout = document.getElementById("btn-logout");
  if (btnLogout) {
    btnLogout.addEventListener("click", (e) => {
      e.preventDefault();
      limparUsuarioLogado();
      window.location.href = "login.html";
    });
  }

  if (pageId === "login") {
    initLogin();
    return;
  }

  if (pageId === "home") {
    carregarHome();

    const listaEl = document.getElementById("lista-artistas");
    if (listaEl) {
      listaEl.addEventListener("click", (e) => {
        const btn = e.target.closest(".btn-excluir-artista");
        if (!btn) return;
        const id = btn.dataset.id;
        const ok = confirm("Tem certeza que deseja excluir este artista?");
        if (!ok) return;
        fetch(`${API_BASE}/artistas/${id}`, {
          method: "DELETE",
        })
          .then(() => carregarHome())
          .catch((error) => console.error("Erro ao excluir artista:", error));
      });
    }
  }

  if (pageId === "detalhes") carregarDetalhes();
  if (pageId === "form-artista") initFormArtista();
  if (pageId === "form-obra") initFormObra();
  if (pageId === "grafico") carregarGraficoObras();
});
