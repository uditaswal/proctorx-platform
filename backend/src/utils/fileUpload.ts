import { Request } from 'express';
import multer from 'multer';
import path from 'path';
import supabase from './supabaseClient';

// Configure multer to store files in memory
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Allow only image files for snapshots
    if (file.fieldname === 'snapshot') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for snapshots'));
      }
    }
    // Allow common document formats for exam materials
    else if (file.fieldname === 'examFile') {
      const allowedTypes = ['.pdf', '.doc', '.docx', '.txt', '.md'];
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowedTypes.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type for exam materials'));
      }
    } else {
      cb(new Error('Unknown file field'));
    }
  },
});

/**
 * Upload file to Supabase storage bucket
 * @param file Multer file object
 * @param bucket Supabase storage bucket name
 * @param folder Folder name within the bucket
 * @returns Object with public URL and storage path, or null on error
 */
export const uploadToSupabase = async (
  file: Express.Multer.File,
  bucket: string,
  folder: string
): Promise<{ url: string; path: string } | null> => {
  try {
    const fileName = `${folder}/${Date.now()}_${file.originalname}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return {
      url: urlData.publicUrl,
      path: fileName,
    };
  } catch (err) {
    console.error('Unexpected upload error:', err);
    return null;
  }
};
