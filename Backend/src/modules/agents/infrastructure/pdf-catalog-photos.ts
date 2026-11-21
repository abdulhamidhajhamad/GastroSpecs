import { Injectable } from "@nestjs/common";
import { inflateSync } from "node:zlib";
import { PDFArray, PDFDict, PDFDocument, PDFName, PDFNumber, PDFRawStream } from "pdf-lib";
import sharp from "sharp";

type Sharp = ReturnType<typeof sharp>;
import { CatalogPhotos, type CatalogPhotoReader, type CroppedPhoto, type PhotoBox } from "../domain/catalog-photos";

/** Extra room around the agent's box, as a share of the box size: its boxes are close but not exact. */
const MARGIN = 0.04;
/** Below this average brightness (0-255) the photo's edge isn't a light background. */
const LIGHT_BACKGROUND = 225;
/** Smallest side, in pixels, that still looks sharp on a product page. */
const MIN_SHARP_SIDE = 400;
const WHITE = { r: 255, g: 255, b: 255 };

// One image at a time and no decoded-image cache: the API runs on a small server (512 MB).
sharp.cache(false);
sharp.concurrency(1);

/** A page picture ready for sharp: encoded JPEG bytes, or raw pixels. */
type PagePicture = { width: number; height: number; input: () => Sharp };

const nameOf = (dict: PDFDict, key: string) => dict.get(PDFName.of(key))?.toString();
const numberOf = (dict: PDFDict, key: string) => (dict.get(PDFName.of(key)) as PDFNumber | undefined)?.asNumber() ?? 0;
const areaOf = (stream: PDFRawStream) => numberOf(stream.dict, "Width") * numberOf(stream.dict, "Height");

/** The image's compression filter; filters can be a name or an array with one name. */
function filterOf(dict: PDFDict): string | undefined {
  const filter = dict.get(PDFName.of("Filter"));
  if (filter instanceof PDFArray) return filter.size() === 1 ? filter.get(0).toString() : "multiple";
  return filter?.toString();
}

/** Turns the PDF image object into something sharp can read, without decoding it yet. */
function toPicture(stream: PDFRawStream): PagePicture {
  const dict = stream.dict;
  const width = numberOf(dict, "Width");
  const height = numberOf(dict, "Height");
  const filter = filterOf(dict);
  const bytes = Buffer.from(stream.contents);

  if (filter === "/DCTDecode") return { width, height, input: () => sharp(bytes) };

  const colorSpace = nameOf(dict, "ColorSpace");
  const channels = colorSpace === "/DeviceRGB" ? 3 : colorSpace === "/DeviceGray" ? 1 : 0;
  if (filter === "/FlateDecode" && channels && numberOf(dict, "BitsPerComponent") === 8 && !dict.get(PDFName.of("DecodeParms"))) {
    const pixels = inflateSync(bytes);
    return { width, height, input: () => sharp(pixels, { raw: { width, height, channels: channels as 1 | 3 } }) };
  }
  throw new Error(`This catalog stores its pictures in a format we can't read yet (${filter ?? "none"}, ${colorSpace ?? "?"}).`);
}

/** Average brightness of the outer frame of a region: tells whether the photo's background is light. */
async function edgeBrightness(region: Sharp): Promise<number> {
  const size = 48;
  const { data } = await region.resize(size, size, { fit: "fill" }).greyscale().raw().toBuffer({ resolveWithObject: true });
  let sum = 0;
  let count = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (x > 1 && x < size - 2 && y > 1 && y < size - 2) continue;
      sum += data[y * size + x];
      count++;
    }
  }
  return sum / count;
}

/**
 * Cuts photos out of catalogs whose pages are pictures (the common export of supplier catalogs): it takes
 * the page's largest embedded image and crops it with sharp, which decodes only what the crop needs.
 */
class PdfCatalogPhotoReader implements CatalogPhotoReader {
  private cached: { page: number; picture: PagePicture } | null = null;

  constructor(private readonly pdf: PDFDocument) {}

  async crop(page: number, box: PhotoBox, maxSize = 1600): Promise<CroppedPhoto> {
    const picture = this.pagePicture(page);
    const marginX = (box.right - box.left) * MARGIN;
    const marginY = (box.bottom - box.top) * MARGIN;
    const left = Math.max(0, Math.floor((box.left - marginX) * picture.width));
    const top = Math.max(0, Math.floor((box.top - marginY) * picture.height));
    const width = Math.min(picture.width, Math.ceil((box.right + marginX) * picture.width)) - left;
    const height = Math.min(picture.height, Math.ceil((box.bottom + marginY) * picture.height)) - top;
    if (width < 20 || height < 20) throw new Error(`The photo box on page ${page} is too small.`);

    const region = { left, top, width, height };
    const warnings: string[] = [];
    if ((await edgeBrightness(picture.input().extract(region))) < LIGHT_BACKGROUND) warnings.push("background is not white: needs cleaning");
    if (Math.min(width, height) < MIN_SHARP_SIDE) warnings.push(`low resolution (${width}×${height} px)`);

    // Centre it on a white square with some air around it, like every product photo on the site.
    // Two pipelines on purpose: sharp runs resize before extend whatever order they're written in.
    const cut = await picture.input().extract(region).toColourspace("srgb").flatten({ background: WHITE }).raw().toBuffer({ resolveWithObject: true });
    const scale = Math.min(1, maxSize / (Math.max(width, height) * 1.12));
    const w = Math.round(width * scale);
    const h = Math.round(height * scale);
    const side = Math.round(Math.max(w, h) * 1.12);
    const image = await sharp(cut.data, { raw: cut.info })
      .resize(w, h)
      .extend({ left: Math.floor((side - w) / 2), right: Math.ceil((side - w) / 2), top: Math.floor((side - h) / 2), bottom: Math.ceil((side - h) / 2), background: WHITE })
      .jpeg({ quality: 88, mozjpeg: true })
      .toBuffer();

    return { image, warnings };
  }

  /** The page's largest picture; kept for the next crop on the same page. */
  private pagePicture(pageNumber: number): PagePicture {
    if (this.cached?.page === pageNumber) return this.cached.picture;
    if (pageNumber < 1 || pageNumber > this.pdf.getPageCount()) throw new Error(`The catalog has no page ${pageNumber}.`);
    const page = this.pdf.getPage(pageNumber - 1);

    const xObjects = page.node.Resources()?.lookupMaybe(PDFName.of("XObject"), PDFDict);
    let largest: PDFRawStream | undefined;
    for (const [, ref] of xObjects?.entries() ?? []) {
      const stream = this.pdf.context.lookup(ref);
      if (stream instanceof PDFRawStream && nameOf(stream.dict, "Subtype") === "/Image" && (!largest || areaOf(stream) > areaOf(largest))) {
        largest = stream;
      }
    }
    if (!largest) throw new Error(`Page ${pageNumber} has no picture to cut photos from. Add the photo by hand.`);

    // Page fractions only map onto the picture when it fills the page (same proportions).
    const { width, height } = page.getSize();
    if (Math.abs(numberOf(largest.dict, "Width") / numberOf(largest.dict, "Height") - width / height) > 0.03) {
      throw new Error(`Page ${pageNumber} is not a single picture, so its photos can't be cut automatically. Add the photo by hand.`);
    }

    const picture = toPicture(largest);
    this.cached = { page: pageNumber, picture };
    return picture;
  }
}

@Injectable()
export class PdfCatalogPhotos implements CatalogPhotos {
  async open(catalog: Buffer): Promise<CatalogPhotoReader> {
    const pdf = await PDFDocument.load(catalog, { updateMetadata: false, ignoreEncryption: true });
    return new PdfCatalogPhotoReader(pdf);
  }
}
