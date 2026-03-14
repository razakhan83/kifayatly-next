import sharp from "sharp";

function getBufferFromDataUrl(dataUrl) {
  const matches = dataUrl.match(/^data:([\w/+.-]+);base64,(.+)$/);

  if (!matches) {
    throw new Error("Invalid image data URL");
  }

  return Buffer.from(matches[2], "base64");
}

export async function generateBlurDataURLFromDataUrl(dataUrl) {
  const inputBuffer = getBufferFromDataUrl(dataUrl);

  const outputBuffer = await sharp(inputBuffer)
    .resize(24, 24, { fit: "inside" })
    .blur(0.6)
    .jpeg({ quality: 40, mozjpeg: true })
    .toBuffer();

  return `data:image/jpeg;base64,${outputBuffer.toString("base64")}`;
}
