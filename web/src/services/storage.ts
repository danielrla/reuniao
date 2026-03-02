import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from '../lib/firebase';

export interface UploadProgressCallback {
    (progress: number): void;
}

/**
 * Uploads a file to Firebase Storage and returns its public Download URL
 */
export const uploadMeetingAttachment = async (
    meetingId: string,
    file: File,
    onProgress?: UploadProgressCallback
): Promise<string> => {
    // Sanitize filename to prevent issues
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const path = `meetings/${meetingId}/${Date.now()}_${safeName}`;
    const storageRef = ref(storage, path);

    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
        uploadTask.on(
            'state_changed',
            (snapshot) => {
                if (onProgress) {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    onProgress(progress);
                }
            },
            (error) => {
                console.error("Storage upload error:", error);
                reject(error);
            },
            async () => {
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(downloadURL);
                } catch (urlError) {
                    reject(urlError);
                }
            }
        );
    });
};

/**
 * Parses the Storage PATH from a Download URL and deletes the object
 * Optional: Used if we want to delete from Firebase when removing from Meeting
 */
export const deleteAttachmentFromStorage = async (fileUrl: string): Promise<boolean> => {
    try {
        // Simple extraction of path from Firebase Storage URL
        // e.g. https://firebasestorage.googleapis.com/v0/b/bucket/o/meetings%2F123%2Ffile.pdf?alt...
        const decodedUrl = decodeURIComponent(fileUrl);
        const startIndex = decodedUrl.indexOf('/o/') + 3;
        const endIndex = decodedUrl.indexOf('?alt=media');

        if (startIndex > 2 && endIndex > startIndex) {
            const filePath = decodedUrl.substring(startIndex, endIndex);
            const storageRef = ref(storage, filePath);
            await deleteObject(storageRef);
            return true;
        }
        return false;
    } catch (error) {
        console.error("Error deleting from storage:", error);
        return false;
    }
};
