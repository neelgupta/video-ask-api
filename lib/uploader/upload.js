const cloudinary = require("cloudinary").v2;
const { extractPublicId } = require('cloudinary-build-url')
const multer = require('multer');
const { response400 } = require('../response-messages');
const max_file_size = 10;
const { Readable } = require('stream');
const { generateUid } = require("../../utils/constant");

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});
const storage = multer.memoryStorage();

const uploadFile = multer({
    storage: storage,
    limits: { fileSize: max_file_size * 1024 * 1024 }, // size limit
    fileFilter: (req, file, cb) => {
        if (!file) {
            return cb(new Error('No file provided.'));
        }

        const allowedTypes = ['video/mp4', 'video/mov', 'video/mkv', 'video/x-matroska'];
        // console.log("file.mimetype", file.mimetype)
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Invalid file type. Only MP4 and MOV are allowed.'));
        }

        cb(null, true);
    },
});

const uploadVideoToCloudinary = async (file, folderPath) => {
    return new Promise((resolve, reject) => {
        const timestamp = Date.now();
        const uniqueId = generateUid()
        const randomName = `video_${timestamp}_${uniqueId}`;
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: 'video',
                folder: folderPath,
                public_id: randomName,
                use_filename: false,
                eager: [
                    {
                        resource_type: 'image',
                        format: 'jpg',
                        transformation: [
                            { width: 200, height: 113, crop: 'fill' },
                        ],
                    },
                ],
            },
            (error, result) => {
                if (error) {
                    console.error("Error uploading video:", error);
                    reject(error);
                } else {
                    // console.log("Video upload result:", result);
                    // The eager transformation results contain the thumbnail URL
                    const videoUrl = result.secure_url;
                    const thumbnailUrl = result.eager[0].secure_url;
                    resolve({ videoUrl, thumbnailUrl });
                }
            }
        );

        const stream = Readable.from(file.buffer);
        stream.pipe(uploadStream);
    });
};

const deleteImage = async (cloudinaryUrl) => {
    try {

        const publicId = extractPublicId(cloudinaryUrl)
        const result = await cloudinary.uploader.destroy(publicId);

        return { status: 200, message: 'Image deleted successfully' };
    } catch (error) {
        console.log("deleteImage ~ error:", error);
        return { status: 500, message: error.message };
    }
};

// Error-handling middleware for Multer
const multerErrorHandler = (err, req, res, next) => {
    if (err) {
        return response400(res, err.message);
    }
    else {
        next();
    }
};

module.exports = { uploadFile, deleteImage, multerErrorHandler, uploadVideoToCloudinary };