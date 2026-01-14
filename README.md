# 🎨 Galeria de Arte

Aplicação web desenvolvida como trabalho acadêmico para a disciplina de Engenharia de Software, com o objetivo de aplicar conceitos de desenvolvimento frontend, consumo de API REST simulada e controle de acesso de usuários.

A Galeria de Arte permite o gerenciamento e a visualização de artistas e suas obras, oferecendo funcionalidades como login e cadastro de usuários, sistema de favoritos, pesquisa dinâmica e visualização gráfica de dados.

---

## 📌 Funcionalidades

- Autenticação de usuários (login e cadastro)
- Controle de acesso às páginas da aplicação
- Listagem, cadastro, edição e exclusão de artistas
- Cadastro e visualização de obras por artista
- Sistema de favoritos com persistência no navegador
- Página dedicada para artistas favoritos
- Pesquisa dinâmica por nome de artistas
- Carrossel de artistas em destaque
- Gráfico de quantidade de obras por artista
- Interface responsiva

---

## 🛠️ Tecnologias Utilizadas

- HTML5
- CSS3
- JavaScript (Vanilla JS)
- Bootstrap 5
- JSON Server
- Chart.js

---

## 📂 Estrutura do Projeto

GaleriaDeArtes
│
│
├── public
│ └── assets
│ ├── css
│ │ └── style.css
│ ├── html
│ │ ├── cadastro.html
│ │ ├── detalhes.html
│ │ ├── favoritos.html
│ │ ├── form_artista.html
│ │ ├── form_obra.html
│ │ ├── grafico.html
│ │ └── index.html
│ ├── img
│ │ ├── artistas
│ │ └── obras
│ └── js
│ └── app.js
│
├── .gitignore
├── db.json
├── package.json
└── README.md
