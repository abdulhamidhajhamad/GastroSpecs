/**
 * Every photo used on the site, in one place.
 * Photos of equipment and sites are real photos, or a sharp AI re-render of a real photo the owner
 * chose (same kitchen, same angle). The 3D design render presents a kitchen design (what we deliver
 * at the layout stage), never a real project.
 * To replace a photo (e.g. a licensed iStock photo or a factory photo), put the file in
 * /public/images and set the path here (e.g. "/images/hero/cooking-line.jpg").
 * Alt texts live in messages under "media".
 *
 * Sources:
 * - /images/hero/cooking-line-v2.webp: AI re-render (made by the owner in Canva) of the photo the owner
 *   chose, approved as final. 1600px, square like the hero box.
 *   (A larger version of the real photo exists on Alibaba but carries the factory's watermark, so it must not be used.)
 * - /images/hero/fastfood-v1.webp: chosen by the owner, 736x981 marketing photo; top-aligned square crop
 *   excludes the Vulcan brand badges at the bottom, remaining badge patched out, enlarged to 1600px.
 * - /images/hero/gelato-v2.webp: chosen by the owner, 736x894 marketing photo (D:/GastroSpecs/markiting),
 *   center-cropped square and enlarged to 1600px. Shows a full gelato showcase with "GELATO" sign and lit display.
 * - /images/hero/bakery-v1.webp: chosen by the owner, 735x490 marketing photo (low source → soft when enlarged).
 *   Bakery with spiral mixers, convection oven and trolley rack.
 * - /images/hero/butchery-v1.webp: chosen by the owner, 736x1104 marketing photo, cropped square and enlarged.
 *   Modern butcher shop with hanging meats and display counter.
 * - /images/hero/supermarket-1920.webp: chosen by the owner, original 1080x1440 enlarged to 1920px.
 * - /images/engineering/hotel-kitchen-3d-v3.webp: 3D design render made for GastroSpecs (Seedream).
 * - images.unsplash.com: Unsplash License (free for commercial use), temporary until own photos are ready.
 */
export type Media = { src: string };

const unsplash = (id: string) => `https://images.unsplash.com/${id}`;

export const media = {
  cookingLine: { src: "/images/hero/cooking-line-v2.webp" },
  dishwashingLine: { src: unsplash("photo-1589109807644-924edf14ee09") },
  fastFoodLine: { src: "/images/hero/fastfood-v1.webp" },
  gelatoShowcase: { src: "/images/hero/gelato-v2.webp" },
  bakeryProduction: { src: "/images/hero/bakery-v1.webp" },
  supermarketRefrigeration: { src: "/images/hero/supermarket-1920.webp" },
  butcheryCounter: { src: "/images/hero/butchery-v1.webp" },
  kitchenDesign3d: { src: "/images/engineering/hotel-kitchen-3d-v3.webp" },
} as const satisfies Record<string, Media>;

export type MediaKey = keyof typeof media;
