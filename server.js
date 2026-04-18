const express = require("express");
const multer = require("multer");
const crypto = require("crypto");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");

const app = express();
const upload = multer({ dest: "uploads/" });

// 🔑 Yaha apni keys daal
const host = "identify-ap-southeast-1.acrcloud.com";
const accessKey = "3d765bdf71e11d23094e2410af90f1fa";
const accessSecret = "fvnwvQ3e0tqXgLjpXF3QmBWxxo6UghHTywfNLwn8";

app.post("/identify", upload.single("file"), async (req, res) => {
    try {
        const fileBuffer = fs.readFileSync(req.file.path);
        const timestamp = Math.floor(Date.now() / 1000);

        const stringToSign = `POST\n/v1/identify\n${accessKey}\naudio\n1\n${timestamp}`;

        const signature = crypto
            .createHmac("sha1", accessSecret)
            .update(stringToSign)
            .digest("base64");

        const formData = new FormData();
        formData.append("sample", fileBuffer);
        formData.append("access_key", accessKey);
        formData.append("data_type", "audio");
        formData.append("signature_version", "1");
        formData.append("signature", signature);
        formData.append("timestamp", timestamp);

        const response = await axios.post(
            `https://${host}/v1/identify`,
            formData,
            { headers: formData.getHeaders() }
        );

        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: "Error" });
    }
});

app.listen(3000, () => console.log("Server running"));
