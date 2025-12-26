// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

// Image generation
export default async function Icon() {
  const fallback =
    "https://images.useterra.com/products/80d2e4c5-5959-4e9a-8cfa-26fa740c77f7.png";
  console.log("HERE");
  return fetch(fallback);
}
