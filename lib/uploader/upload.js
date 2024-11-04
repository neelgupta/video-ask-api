const cloudinary = require("cloudinary").v2;
const { extractPublicId } = require('cloudinary-build-url')

// Configure AWS SDK
// AWS.config.update({
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//     region: process.env.AWS_BUCKET_REGION
// });
// const s3 = new AWS.S3();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

const uploadFile = async (file) => {
    try {
        // const { mimetype } = file;
        // const img = mimetype.split("/");
        // let extension = img[1].toLowerCase();

        // if (!['jpeg', 'jpg', 'png'].includes(extension)) {
        //     return res.status(400).json({ message: `${extension} is not allowed..`, errorCode: 30002 });
        // }

        const base64String = file.buffer.toString('base64');

        const result = await cloudinary.uploader.upload(`data:${file.mimetype};base64,${base64String}`, {
            folder: 'lead',
            resource_type: 'auto'
        });
        return result.secure_url;

    } catch (error) {
        console.log("uploadFile ~ error:", error)
        return { status: 500, message: error.message };
    }
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

// const uploadFile = (file, fileName, pathName, extension) => {

//     // for upload in the local
//     return new Promise((resolve, reject) => {
//         const uploadDir = path.join(process.cwd(), 'public', 'photos', pathName);
//         const filePath = path.join(uploadDir, fileName);

//         const writeStream = fs.createWriteStream(filePath);
//         writeStream.write(file);
//         writeStream.end();

//         writeStream.on('finish', () => {
//             resolve({
//                 status: 200,
//                 imageUrl: filePath,
//                 message: 'Image uploaded successfully',
//             });
//         });

//         writeStream.on('error', (err) => {
//             console.error("Error in the multer upload function", err);
//             reject({
//                 status: 400,
//                 message: 'Something went wrong. Please try again',
//             });
//         });
//     });

//     // for upload in to the aws s3 bucket

//     // return new Promise((resolve, reject) => {
//     //     const readableStream = new stream.PassThrough();
//     //     readableStream.end(file);
//     //     const params = {
//     //         Bucket: process.env.AWS_BUCKET_NAME,
//     //         Key: fileName,
//     //         Body: readableStream,
//     //         ContentType: `image/${extension}`,
//     //         ACL: "public-read",
//     //         ResponseContentDisposition: `attachment; filename="${fileName}"`
//     //     };

//     //     s3.upload(params, (err, data) => {
//     //         if (err) {
//     //             console.error(err);
//     //             reject({
//     //                 status: 400,
//     //                 message: 'Something went wrong. Please try again',
//     //             });
//     //         } else {
//     //             resolve({
//     //                 status: 200,
//     //                 imageUrl: data.Location,
//     //                 message: 'Image uploaded successfully',
//     //             });
//     //         }
//     //     });
//     // });
// };

module.exports = { uploadFile, deleteImage };