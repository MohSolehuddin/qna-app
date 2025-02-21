import { CldUploadButton } from "next-cloudinary";
import { useState } from "react";

export default function UploadToCloudinary() {
  const [resource, setResource] = useState < any > null;

  return (
    <div>
      <CldUploadButton
        onUpload={(result, widget) => {
          if (result?.event === "success") {
            setResource(result.info);
          }
          widget.close();
        }}
        signatureEndpoint="/api/sign-cloudinary-params"
        uploadPreset="next-cloudinary-signed"
      >
        Upload to Cloudinary
      </CldUploadButton>

      {resource && (
        <div>
          <p>Uploaded Image:</p>
          <img
            src={resource.secure_url}
            alt="Uploaded file"
            style={{ width: 200, height: "auto" }}
          />
        </div>
      )}
    </div>
  );
}
