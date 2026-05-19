export default function ArtistCarousel() {
  return (
    <section className="mb-5">

      <h2 className="mb-3 text-center">
        Artistas em Destaque
      </h2>

      <div
        id="carouselArtistas"
        className="carousel slide"
        data-bs-ride="carousel"
      >

        <div className="carousel-inner">

          <div className="carousel-item active">
            <img
              src="/assets/michelangelo.jpg"
              className="d-block w-100"
              alt="Michelangelo"
            />
          </div>

          <div className="carousel-item">
            <img
              src="/assets/van-gogh.jpg"
              className="d-block w-100"
              alt="Van Gogh"
            />
          </div>

        </div>

        <button
          className="carousel-control-prev"
          type="button"
          data-bs-target="#carouselArtistas"
          data-bs-slide="prev"
        >
          <span className="carousel-control-prev-icon"></span>
        </button>

        <button
          className="carousel-control-next"
          type="button"
          data-bs-target="#carouselArtistas"
          data-bs-slide="next"
        >
          <span className="carousel-control-next-icon"></span>
        </button>

      </div>

    </section>
  );
}