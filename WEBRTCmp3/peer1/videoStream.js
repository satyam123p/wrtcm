const ffmpeg = require('fluent-ffmpeg');
const { PassThrough } = require('stream');

async function getVideoStream(videoPath) {
    return new Promise((resolve, reject) => {
        const stream = new PassThrough();

        ffmpeg(videoPath)
            .outputFormat('rawvideo')
            .videoCodec('rawvideo')
            .noAudio()
            .on('start', () => console.log(`FFmpeg started processing ${videoPath}`))
            .on('error', (err) => {
                console.error('FFmpeg error:', err);
                reject(err);
            })
            .on('end', () => console.log(`FFmpeg finished processing ${videoPath}`))
            .pipe(stream);

        resolve(stream);
    });
}

async function sendVideoFrames(videoPath, peerConnection) {
    try {
        const videoStream = await getVideoStream(videoPath);

        videoStream.on('data', (chunk) => {
            console.log(`Peer 1 streaming chunk from ${videoPath}: ${chunk.length} bytes`);
            // Placeholder for real frame injection (e.g., RTP to WebRTC)
        });

        videoStream.on('end', () => {
            console.log(`Peer 1 finished streaming ${videoPath}`);
        });
    } catch (error) {
        console.error(`Peer 1 error streaming video from ${videoPath}:`, error);
    }
}

module.exports = { sendVideoFrames };