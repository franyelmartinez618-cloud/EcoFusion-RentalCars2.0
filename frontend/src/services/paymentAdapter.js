// Frontend-first payment boundary. No Square secrets live in the browser.
// Later: POST /payments/checkout to FastAPI and receive { checkoutUrl }.
export async function createCheckout({ reservationId }) {
    const demoUrl = import.meta.env.VITE_SQUARE_CHECKOUT_URL;
    if (demoUrl) return { checkoutUrl: demoUrl, mode: "square-configured-demo" };
    return { checkoutUrl: `/account/payments?reservation=${encodeURIComponent(reservationId)}`, mode: "prototype" };
}
