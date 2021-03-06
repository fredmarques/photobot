import cloud from 'google-cloud';
import path from 'path';
import download from 'download';
import fs from 'fs';

const gcloud = cloud({
    projectId: process.env.GCLOUD_PROJECT, //eslint-disable-line
    keyFilename: path.join(__dirname, '../../keyfile.json')
});

const gcs = gcloud.storage();

const photoUpload = (ctx, next) => {
    const { telegram } = ctx;
    const fileId = ctx.state.fileId;
    if (fileId) {
        return telegram.getFileLink(fileId).then(fileLink => {
            download(fileLink, '.').then(() => {
                const bucket = gcs.bucket(process.env.STORAGE_BUCKET);
                const fileName = fileLink.slice(fileLink.lastIndexOf('/') + 1);
                const options = {
                    destination: fileId,
                    public: global.activeUsers.has(ctx.state.userId)

                };
                bucket.upload(fileName, options, err => {
                    if (err) {
                        console.log('ERROR::::::', err);
                    }
                    const photoPath = path.join(__dirname, `../../${fileName}`);
                    fs.unlink((photoPath, fileName), e => {
                        if (e) {
                            console.log('Error when deleting file', e);
                        }
                    });
                });
            });
            return next();
        });
    }
    return next();
};

export default photoUpload;
