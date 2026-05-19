export default function Header() {
  return (
    <header className="bg-dark text-white py-4 mb-4 shadow">
      <div className="container-fluid">
        <div className="row align-items-center">

          <div className="col-12 col-md-4 text-center text-md-start mb-3 mb-md-0">
            <h1 className="mb-0">Galeria de Arte</h1>
            <p className="mb-0">Explore os artistas</p>
          </div>

          <div className="col-12 col-md-4 text-center mb-3 mb-md-0">
            <button className="btn btn-warning">
              Ver gráfico de obras
            </button>
          </div>

          <div className="col-12 col-md-4 text-center text-md-end">
            <span className="fw-bold me-2">
              Orlando
            </span>

            <button className="btn btn-sm btn-danger">
              Sair
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}