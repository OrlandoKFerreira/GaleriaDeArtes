// =========================
// CONFIGURAÇÃO BÁSICA
// =========================
const API_BASE = "http://localhost:3000";

// =========================
// FUNÇÕES DE AUTENTICAÇÃO
// =========================
// =========================
// FUNÇÕES DE AUTENTICAÇÃO (AGORA COM sessionStorage)
// =========================
function salvarUsuarioLogado(usuario) {
  sessionStorage.setItem("usuarioLogado", JSON.stringify(usuario));
}

function obterUsuarioLogado() {
  const dados = sessionStorage.getItem("usuarioLogado");
  if (!dados) return null;
  try {
    return JSON.parse(dados);
  } catch (e) {
    return null;
  }
}

function limparUsuarioLogado() {
  sessionStorage.removeItem("usuarioLogado");
}

function exigirLogin() {
  const pageId = document.body.id;
  // páginas livres: login e cadastro
  if (pageId === "login" || pageId === "cadastro") return;

  const usuario = obterUsuarioLogado();
  if (!usuario) {
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

      salvarUsuarioLogado({
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        admin: usuario.admin,
      });

      window.location.href = "index.html";
    } catch (error) {
      console.error("Erro no login:", error);
      alert("Erro ao tentar fazer login. Tente novamente mais tarde.");
    }
  });
}
function initCadastro() {
  const form = document.getElementById("form-cadastro");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const login = document.getElementById("login").value.trim();
    const senha = document.getElementById("senha").value.trim();

    if (!nome || !email || !login || !senha) {
      alert("Preencha todos os campos.");
      return;
    }

    try {
      // Verifica se já existe usuário com esse e-mail
      const respCheck = await fetch(
        `${API_BASE}/usuarios?email=${encodeURIComponent(email)}`
      );
      const existentes = await respCheck.json();

      if (existentes.length) {
        alert("Já existe um usuário cadastrado com esse e-mail.");
        return;
      }

      const novoUsuario = {
        id: window.crypto?.randomUUID
          ? crypto.randomUUID()
          : String(Date.now()),
        nome,
        email,
        login,
        senha,
        admin: false,
      };

      const resp = await fetch(`${API_BASE}/usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novoUsuario),
      });

      if (!resp.ok) {
        throw new Error("Erro ao cadastrar usuário");
      }

      alert("Cadastro realizado com sucesso! Agora você já pode fazer login.");
      window.location.href = "login.html";
    } catch (error) {
      console.error("Erro no cadastro:", error);
      alert("Erro ao cadastrar usuário. Tente novamente mais tarde.");
    }
  });
}

// =========================
// FAVORITOS (LOCALSTORAGE)
// =========================
function getFavoritos() {
  return JSON.parse(localStorage.getItem("favoritos") || "[]");
}

function salvarFavoritos(lista) {
  localStorage.setItem("favoritos", JSON.stringify(lista));
}

function alternarFavorito(id) {
  // sempre trabalhar com string, independente se o artista.id é número ou string
  id = String(id);

  let favs = getFavoritos(); // pode vir vazio []

  // garante que é um array de strings
  favs = favs.map((x) => String(x));

  if (favs.includes(id)) {
    favs = favs.filter((x) => x !== id);
  } else {
    favs.push(id);
  }

  salvarFavoritos(favs);
}

// =========================
// FUNÇÕES DA HOME
// =========================
function carregarHome() {
  const carouselEl = document.getElementById("carousel-destaques");
  const listaEl = document.getElementById("lista-artistas");

  if (!carouselEl || !listaEl) return;

  // Função auxiliar para renderizar lista (usa favoritos)
  function renderizarLista(arrayArtistas) {
    const favoritos = getFavoritos();

    listaEl.innerHTML = arrayArtistas
      .map((artista) => {
        const favStrings = favoritos.map((x) => String(x));
        const isFavorito = favStrings.includes(String(artista.id));

        const classeFavorito = isFavorito ? "favorito" : "";

        return `
        <div class="col-12 col-sm-6 col-md-4 mb-4">
          <div class="card h-100 shadow-sm">
            <img src="${artista.imagem_principal}" class="card-img-top" alt="${artista.nome}">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title d-flex justify-content-between align-items-center">
                ${artista.nome}
                <button 
                  class="btn-favorito ${classeFavorito}"
                  data-id="${artista.id}"
                  style="background: none; border: none; font-size: 22px;"
                  title="Favoritar"
                >
                  ★
                </button>
              </h5>
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
      `;
      })
      .join("");
  }

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

      // Carrossel
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

      // Lista inicial
      renderizarLista(todos);

      // PESQUISA
      const campoPesquisa = document.getElementById("campo-pesquisa");
      if (campoPesquisa) {
        campoPesquisa.addEventListener("input", () => {
          const termo = campoPesquisa.value.toLowerCase();
          const filtrados = todos.filter((artista) => {
            const nome = artista.nome.toLowerCase();
            const desc = (artista.descricao || "").toLowerCase();
            const bio = (artista.biografia || "").toLowerCase();

            return (
              nome.includes(termo) ||
              desc.includes(termo) ||
              bio.includes(termo)
            );
          });

          renderizarLista(filtrados);
        });
      }

      // FILTRO FAVORITOS (se você tiver um botão com esse id)
      const btnFiltro = document.getElementById("btn-filtrar-favoritos");
      if (btnFiltro) {
        btnFiltro.addEventListener("click", () => {
          const favIds = getFavoritos();
          const filtrados = todos.filter((a) => favIds.includes(a.id));
          renderizarLista(filtrados);
        });
      }
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
function carregarFavoritos() {
  const listaEl = document.getElementById("lista-favoritos");
  if (!listaEl) return;

  const favIds = getFavoritos();

  if (!favIds.length) {
    listaEl.innerHTML = `
      <div class="col-12">
        <div class="alert alert-info text-center">
          Você ainda não marcou nenhum artista como favorito.
        </div>
      </div>
    `;
    return;
  }

  fetch(`${API_BASE}/artistas`)
    .then((res) => res.json())
    .then((artistas) => {
      const favoritos = artistas.filter((a) => favIds.includes(a.id));

      if (!favoritos.length) {
        listaEl.innerHTML = `
          <div class="col-12">
            <div class="alert alert-info text-center">
              Nenhum dos artistas cadastrados corresponde aos seus favoritos.
            </div>
          </div>
        `;
        return;
      }

      listaEl.innerHTML = favoritos
        .map((artista) => {
          return `
          <div class="col-12 col-sm-6 col-md-4 mb-4">
            <div class="card h-100 shadow-sm">
              <img src="${artista.imagem_principal}" class="card-img-top" alt="${artista.nome}">
              <div class="card-body d-flex flex-column">
                <h5 class="card-title d-flex justify-content-between align-items-center">
                  ${artista.nome}
                  <button 
                    class="btn-favorito favorito"
                    data-id="${artista.id}"
                    style="background: none; border: none; font-size: 22px;"
                    title="Remover dos favoritos"
                  >
                    ★
                  </button>
                </h5>
                <p class="card-text flex-grow-1">${artista.descricao}</p>
                <div class="d-flex flex-wrap gap-2 mt-2">
                  <a href="detalhes.html?id=${artista.id}" class="btn btn-primary btn-sm">Ver detalhes</a>
                </div>
              </div>
            </div>
          </div>
        `;
        })
        .join("");
    })
    .catch((error) => {
      console.error("Erro ao carregar favoritos:", error);
      listaEl.innerHTML = `
        <div class="col-12">
          <div class="alert alert-warning text-center">
            Erro ao carregar favoritos. Tente novamente mais tarde.
          </div>
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
      // verifica se este artista já é favorito
      const favIds = getFavoritos().map((x) => String(x));
      const isFavorito = favIds.includes(String(artista.id));
      const classeFavorito = isFavorito ? "favorito" : "";

      container.innerHTML = `
    <div class="card mb-4 shadow-sm">
      <img src="${artista.imagem_principal}" class="card-img-top" alt="${
        artista.nome
      }">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h2 class="h3 mb-0">${artista.nome}</h2>
          <button
            class="btn-favorito ${classeFavorito}"
            data-id="${artista.id}"
            style="background: none; border: none; font-size: 26px;"
            title="Marcar como favorito"
          >
            ★
          </button>
        </div>

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

  // protege páginas (menos login/cadastro)
  exigirLogin();

  // Mostrar nome do usuário logado no header (se existir)
  const usuarioLogado = obterUsuarioLogado();
  const nomeUsuarioEl = document.getElementById("nome-usuario");
  if (usuarioLogado && nomeUsuarioEl) {
    nomeUsuarioEl.textContent = usuarioLogado.nome;
  }

  // Botão de logout (se existir na página)
  const btnLogout = document.getElementById("btn-logout");
  if (btnLogout) {
    btnLogout.addEventListener("click", (e) => {
      e.preventDefault();
      limparUsuarioLogado();
      window.location.href = "login.html";
    });
  }

  // LOGIN ============================
  if (pageId === "login") {
    initLogin();
    return;
  }

  // CADASTRO =========================
  if (pageId === "cadastro") {
    initCadastro();
    return;
  }

  // HOME  ============================
  if (pageId === "home") {
    carregarHome();

    const listaEl = document.getElementById("lista-artistas");
    if (listaEl) {
      listaEl.addEventListener("click", (e) => {
        // EXCLUIR
        const btn = e.target.closest(".btn-excluir-artista");
        if (btn) {
          const id = btn.dataset.id;
          const ok = confirm("Tem certeza que deseja excluir este artista?");
          if (!ok) return;

          fetch(`${API_BASE}/artistas/${id}`, {
            method: "DELETE",
          })
            .then(() => carregarHome())
            .catch((error) => console.error("Erro ao excluir artista:", error));
          return;
        }

        // FAVORITO (estrela na home)
        const favBtn = e.target.closest(".btn-favorito");
        if (favBtn) {
          const id = favBtn.dataset.id;
          alternarFavorito(id);
          favBtn.classList.toggle("favorito");
          return;
        }
      });
    }
  }

  // FAVORITOS  =======================
  if (pageId === "favoritos") {
    carregarFavoritos();

    const listaFavEl = document.getElementById("lista-favoritos");
    if (listaFavEl) {
      listaFavEl.addEventListener("click", (e) => {
        const favBtn = e.target.closest(".btn-favorito");
        if (favBtn) {
          const id = favBtn.dataset.id;
          alternarFavorito(id);
          // recarrega a lista, porque o artista deve sumir quando tirar dos favoritos
          carregarFavoritos();
          return;
        }
      });
    }
  }

  // DETALHES  =======================
  if (pageId === "detalhes") {
    carregarDetalhes();

    const conteudo = document.getElementById("conteudo-artista");
    if (conteudo) {
      conteudo.addEventListener("click", (e) => {
        const favBtn = e.target.closest(".btn-favorito");
        if (favBtn) {
          const id = favBtn.dataset.id;
          alternarFavorito(id);
          favBtn.classList.toggle("favorito");
          return;
        }
      });
    }
  }

  // OUTRAS PÁGINAS ===================
  if (pageId === "form-artista") initFormArtista();
  if (pageId === "form-obra") initFormObra();
  if (pageId === "grafico") carregarGraficoObras();
});
