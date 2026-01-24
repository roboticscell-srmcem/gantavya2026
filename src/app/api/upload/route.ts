import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'gantavya'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Allowed file types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
      'image/gif'
    ]

    // Check if file type is a document (PDF or Word)
    const isDocument = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ].includes(file.type)

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only PDF, Word documents, and image files (PNG, JPG, WebP, GIF) are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      )
    }

    // Convert file to base64 for Cloudinary upload
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUri = `data:${file.type};base64,${base64}`

    // Determine resource type based on file type (documents = raw, images = image)
    const resourceType = isDocument ? 'raw' : 'image'
    
    // Get file extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'pdf'
    
    // Clean filename (remove special chars)
    const cleanName = file.name
      .replace(/\.[^/.]+$/, '') // Remove extension
      .replace(/[^a-zA-Z0-9-]/g, '_') // Replace special chars with underscore
      .replace(/_+/g, '_') // Remove multiple underscores
      .replace(/^_|_$/g, '') // Remove leading/trailing underscores
    
    // Create a readable filename for the download
    const downloadFilename = `${cleanName}.${fileExtension}`
    
    // For documents, include extension in public_id
    const publicId = isDocument 
      ? `${Date.now()}-${cleanName}.${fileExtension}`
      : `${Date.now()}-${cleanName}`

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: folder,
      resource_type: resourceType,
      public_id: publicId,
    })

    return NextResponse.json({ 
      success: true, 
      url: result.secure_url,
      publicId: result.public_id,
      filename: file.name,
      downloadFilename: downloadFilename,
      resourceType: resourceType,
      fileExtension: fileExtension
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
