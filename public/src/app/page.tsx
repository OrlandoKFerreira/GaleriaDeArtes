import Header from "../components/Header"
import ArtistCarousel from "../components/ArtistCarousel"
import ArtistList from "../components/ArtistList"
import About from "../components/About"

export default function Home() {
    return (
        <>
      <Header />

      <main>
      <ArtistCarousel />
      <ArtistList />
      <About />
      </main>

      <footer />
      </>
    );
}