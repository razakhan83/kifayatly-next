export async function uploadImageDataUrl(dataUrl, folder = "kifayatly_products") {
  const signRes = await fetch("/api/cloudinary-sign");
  const signData = await signRes.json();
  if (!signRes.ok) {
    throw new Error(signData.error || "Failed to get upload signature");
  }

  const uploadFormData = new FormData();
  uploadFormData.append("file", dataUrl);
  uploadFormData.append("api_key", signData.apiKey);
  uploadFormData.append("timestamp", signData.timestamp);
  uploadFormData.append("signature", signData.signature);
  uploadFormData.append("folder", folder);

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`,
    {
      method: "POST",
      body: uploadFormData,
    },
  );
  const uploadData = await uploadRes.json();
  if (!uploadRes.ok || !uploadData.secure_url) {
    throw new Error(uploadData.error?.message || "Cloudinary upload failed");
  }

  return {
    url: uploadData.secure_url,
    publicId: uploadData.public_id || "",
  };
}
