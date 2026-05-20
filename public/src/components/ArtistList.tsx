export default function ArtistList() {
  return (
    <section className="mb-5">

      <h2 className="mb-3 text-center">
        Artistas
      </h2>

      <div className="row mb-4">

        <div className="col-12 col-md-6 mx-auto">

          <input
            type="text"
            className="form-control form-control-lg"
            placeholder="Pesquisar artistas..."
          />

        </div>

      </div>

      <div className="text-center mb-4">

        <button className="btn btn-outline-secondary">
          Ver favoritos
        </button>

      </div>

      <div className="row">

        <div className="col-md-4 mb-4">

          <div className="card h-100 shadow-sm">

            <img
              src="/assets/michelangelo.jpg"
              className="card-img-top"
              alt="Michelangelo"
            />

            <div className="card-body">

              <h5 className="card-title">
                Michelangelo
              </h5>

              <p className="card-text">
                Pintor e escultor renascentista.
              </p>

              <button className="btn btn-primary">
                Ver perfil
              </button>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}