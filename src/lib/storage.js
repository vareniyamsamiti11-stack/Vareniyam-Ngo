import { supabase } from './supabase'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_MB = 5
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

/**
 * Validates an image file before upload
 * @param {File} file
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateImageFile(file) {
  if (!file) return { valid: false, error: 'No file selected.' }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: `Invalid file format (${file.type}). Allowed formats: JPG, PNG, WEBP.` }
  }
  if (file.size > MAX_SIZE_BYTES) {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1)
    return { valid: false, error: `File too large (${sizeInMb}MB). Maximum allowed size is ${MAX_SIZE_MB}MB.` }
  }
  return { valid: true }
}

/**
 * Uploads an image to the 'public-uploads' Supabase Storage bucket
 * @param {File} file
 * @param {string} folder - subfolder path (e.g. 'events', 'programs', 'gallery', 'site')
 * @returns {Promise<{ url: string | null, error?: string }>}
 */
export async function uploadImage(file, folder = 'uploads') {
  const validation = validateImageFile(file)
  if (!validation.valid) return { url: null, error: validation.error }

  try {
    const fileExt = file.name.split('.').pop()
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${folder}/${Date.now()}_${cleanName}`

    const { error: uploadError } = await supabase.storage
      .from('public-uploads')
      .upload(fileName, file, { cacheControl: '3600', upsert: true })

    if (uploadError) {
      // If bucket doesn't exist yet or offline, provide a fallback warning
      console.warn('Storage upload error:', uploadError.message)
      return { url: null, error: uploadError.message }
    }

    const { data } = supabase.storage
      .from('public-uploads')
      .getPublicUrl(fileName)

    return { url: data.publicUrl, error: null }
  } catch (err) {
    return { url: null, error: err.message || 'Image upload failed.' }
  }
}
