const cloudinary = require("cloudinary").v2;
const { extractPublicId } = require('cloudinary-build-url')
const multer = require('multer');
const { response400 } = require('../response-messages');
const max_file_size = 10;
const { Readable } = require('stream');
const { generateUid } = require("../../utils/constant");
const axios = require('axios');

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

        const allowedTypes = [
            'video/mp4', 
            'video/mov', 
            'video/mkv', 
            'audio/wav', 
            'video/x-matroska', 
            'application/pdf',           // PDF files
            'application/msword',        // Microsoft Word (.doc)
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // Microsoft Word (.docx)
            'application/vnd.ms-excel',  // Microsoft Excel (.xls)
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // Microsoft Excel (.xlsx)
            'text/plain',                 // Text files (.txt)
            'audio/mpeg'
          ];
          
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
                resource_type: 'auto',
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

const copyVideoInCloudinary = async (sourcePath, destinationFolderPath) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Fetch the source file URL
            const sourceUrl = cloudinary.url(sourcePath, { resource_type: 'video' });

            // Fetch the video as a buffer
            const response = await axios.get(sourceUrl, { responseType: 'arraybuffer' });
            const videoBuffer = Buffer.from(response.data);

            // Set a unique name for the copied file
            const timestamp = Date.now();
            const uniqueId = generateUid();
            const randomName = `video_${timestamp}_${uniqueId}`;

            // Upload the video to the destination folder
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'video',
                    folder: destinationFolderPath,
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
                        console.error('Error copying video:', error);
                        reject(error);
                    } else {
                        const videoUrl = result.secure_url;
                        const thumbnailUrl = result.eager[0].secure_url;
                        resolve({ videoUrl, thumbnailUrl });
                    }
                }
            );

            // Use a readable stream to upload the file
            const stream = Readable.from(videoBuffer);
            stream.pipe(uploadStream);
        } catch (error) {
            console.error('Error fetching or uploading video:', error);
            reject(error);
        }
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

module.exports = { uploadFile, deleteImage, multerErrorHandler, uploadVideoToCloudinary,copyVideoInCloudinary };