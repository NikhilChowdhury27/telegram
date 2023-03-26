import { GetSignedUrlConfig, Storage } from '@google-cloud/storage';
const storage = new Storage();

const uploadFile = async (
    buffer: any,
    destFileName: string,
    bucketName: string
) => {
    try {
        const bucket = storage.bucket(bucketName);
        console.log('yes');
        await bucket.file(destFileName).save(buffer);
        await bucket.file(destFileName).makePublic();

        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destFileName}`;
        return publicUrl;
    } catch (err) {
        throw new Error(err);
    }
};
const deleteFile = async (destFileName: string, bucketName: string) => {
    try {
        const bucket = storage.bucket(bucketName);
        console.log('deleting');
        await bucket.file(destFileName).delete();
        return true;
    } catch (err) {
        throw new Error(err);
    }
};

const getSignedUrl = async (
    fileName: string,
    bucketName: string,
    contentType: string
) => {
    try {
        const options: GetSignedUrlConfig = {
            version: 'v4',
            action: 'write',
            expires: Date.now() + 15 * 60 * 1000, // 15 minutes
            contentType: contentType
        };
        const mainUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
        const [url] = await storage
            .bucket(bucketName)
            .file(fileName)
            .getSignedUrl(options);
        console.log(mainUrl, url);
        return {
            url,
            mainUrl
        };
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
};
// const downloadFile = async (fileName: string) => {
//     // Downloads the file into a buffer in memory.
//     const contents = await bucket.file(fileName).download();
//     console.log('con', contents);
//     return contents[0];
// };

export {
 uploadFile, deleteFile, getSignedUrl 
};
