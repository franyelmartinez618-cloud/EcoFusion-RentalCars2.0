import "../styles/global.css";

function Home() {
    return (
        <main className="home">
            <section className="hero">
                <div className="hero-content">
                    <p className="hero-label">ECOFUSION RENTALCARS</p>

                    <h1>
                        Your journey starts
                        <span> with the right car.</span>
                    </h1>

                    <p className="hero-description">
                        Reliable Toyota vehicles for business, travel and everyday
                        mobility.
                    </p>

                    <div className="hero-actions">
                        <button className="btn btn-primary">
                            Explore vehicles
                        </button>

                        <button className="btn btn-secondary">
                            Make a reservation
                        </button>
                    </div>
                </div>
            </section>

            <section className="featured">
                <div className="section-heading">
                    <p className="section-label">OUR FLEET</p>
                    <h2>Find the right Toyota for your trip</h2>
                </div>

                <div className="vehicle-grid">
                    <article className="vehicle-card">
                        <div className="vehicle-image">
                            Toyota Corolla
                        </div>

                        <div className="vehicle-info">
                            <h3>Toyota Corolla</h3>
                            <p>Comfortable, efficient and perfect for everyday travel.</p>

                            <div className="vehicle-footer">
                                <strong>$59 / day</strong>
                                <button>View vehicle</button>
                            </div>
                        </div>
                    </article>

                    <article className="vehicle-card">
                        <div className="vehicle-image">
                            Toyota RAV4
                        </div>

                        <div className="vehicle-info">
                            <h3>Toyota RAV4</h3>
                            <p>More space and flexibility for longer journeys.</p>

                            <div className="vehicle-footer">
                                <strong>$79 / day</strong>
                                <button>View vehicle</button>
                            </div>
                        </div>
                    </article>

                    <article className="vehicle-card">
                        <div className="vehicle-image">
                            Toyota Camry
                        </div>

                        <div className="vehicle-info">
                            <h3>Toyota Camry</h3>
                            <p>A refined sedan for a comfortable driving experience.</p>

                            <div className="vehicle-footer">
                                <strong>$69 / day</strong>
                                <button>View vehicle</button>
                            </div>
                        </div>
                    </article>
                </div>
            </section>
        </main>
    );
}

export default Home;