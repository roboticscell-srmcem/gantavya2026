/**
 * Event Pass Generator - Enhanced Visibility Version
 * 
 * Generates personalized event passes with:
 * - Team details overlaid on template
 * - Dynamic QR code with all team and player data
 * - Enhanced text visibility and contrast
 */

import { createCanvas, loadImage, registerFont } from 'canvas';
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';

// Register fonts for node-canvas
let fontsRegistered = false;
function ensureFontsRegistered() {
  if (fontsRegistered) return;
  
  const fontDir = path.join(process.cwd(), 'public', 'fonts');
  
  const bitcountPath = path.join(fontDir, 'BitcountSingle-VariableFont_CRSV,ELSH,ELXP,slnt,wght.ttf');
  
  if (fs.existsSync(bitcountPath)) {
    registerFont(bitcountPath, { family: 'BitcountSingle' });
  } else {
    console.warn('BitcountSingle font missing');
  }
  
  fontsRegistered = true;
}

// Template dimensions
const TEMPLATE_WIDTH = 591;
const TEMPLATE_HEIGHT = 1004;

// Enhanced text positions - CENTER ALIGNED for better accessibility
const TEXT_POSITIONS = {
  // Team ID - center aligned, highly visible
  teamIdCenter: {
    x: TEMPLATE_WIDTH / 2,  // Perfect center (295.5)
    y: 740,  // Moved up slightly
    fontSize: 48,  // Slightly smaller to fit more text
    fontWeight: 'bold',
    color: '#FFFFFF',
    align: 'center' as CanvasTextAlign,
  },
  // Participant Name - center aligned
  participantName: {
    x: TEMPLATE_WIDTH / 2,
    y: 800,  // Moved up
    fontSize: 32,  // Slightly smaller
    fontWeight: 'bold',
    color: '#FFFFFF',
    align: 'center' as CanvasTextAlign,
  },
  // Team Name - center aligned
  teamName: {
    x: TEMPLATE_WIDTH / 2,
    y: 850,  // New position
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FFFFFF',
    align: 'center' as CanvasTextAlign,
  },
  // Event Name - center aligned
  eventName: {
    x: TEMPLATE_WIDTH / 2,
    y: 900,  // Adjusted
    fontSize: 28,
    fontWeight: 'normal',
    color: '#FFFFFF',
    align: 'center' as CanvasTextAlign,
  },
  // College Name - center aligned, prominent
  collegeName: {
    x: TEMPLATE_WIDTH / 2,
    y: 950,  // Adjusted
    fontSize: 26,  // Smaller to fit
    fontWeight: 'bold',
    color: '#FFFFFF',
    align: 'center' as CanvasTextAlign,
  },
};

// QR code position
const QR_POSITION = {
  x: 295,
  y: 383,
  width: 200,
  height: 200,
};

export interface PassData {
  teamId: string;
  teamName: string;
  eventName: string;
  collegeName: string;
  participantName: string;
  participantEmail?: string;
  participantPhone?: string;
  paymentStatus?: string;
}

/**
 * Create a QR code data string with essential data only (for compact QR)
 */
function createQRData(data: PassData): string {
  // Include comprehensive data for detailed QR codes
  return JSON.stringify({
    teamId: data.teamId,
    name: data.participantName,
    teamName: data.teamName,
    eventName: data.eventName,
    collegeName: data.collegeName,
    participantEmail: data.participantEmail,
    participantPhone: data.participantPhone,
    paymentStatus: data.paymentStatus,
  });
}

/**
 * Generate a QR code image buffer
 */
async function generateQR(text: string): Promise<Buffer> {
  return QRCode.toBuffer(text, {
    width: 200,
    margin: 1,
    errorCorrectionLevel: 'L',  // Low error correction for smaller QR
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  });
}

/**
 * Generate event pass with team details
 */
export async function generateEventPass(data: PassData): Promise<Buffer> {
  ensureFontsRegistered();
  
  const templatePath = path.join(process.cwd(), 'public', 'images', 'pass-template.png');
  
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found at ${templatePath}`);
  }

  const template = await loadImage(templatePath);
  
  const canvas = createCanvas(TEMPLATE_WIDTH, TEMPLATE_HEIGHT);
  const ctx = canvas.getContext('2d');
  
  // Draw the template
  ctx.drawImage(template, 0, 0, TEMPLATE_WIDTH, TEMPLATE_HEIGHT);
  
  // Set up text rendering with better quality
  ctx.textBaseline = 'middle';
  ctx.imageSmoothingEnabled = true;
  
  // Enhanced helper function to draw text with stroke and shadow
  const drawText = (
    text: string,
    x: number,
    y: number,
    fontSize: number,
    color: string,
    fontWeight: string = 'normal',
    align: CanvasTextAlign = 'center'
  ) => {
    ctx.save();
    
    // Set text alignment
    ctx.textAlign = align;
    
    // Use BitcountSingle font with fallback
    ctx.font = `${fontWeight} ${fontSize}px "BitcountSingle", Inter, sans-serif`;
    
    // Add stronger dark background for better contrast
    ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    
    // Draw thick dark stroke for maximum visibility
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.strokeText(text, x, y);
    
    // Add secondary lighter stroke for glow effect
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 8;
    ctx.strokeText(text, x, y);
    
    // Reset shadow for fill
    ctx.shadowColor = 'transparent';
    
    // Draw the main text in bright white
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    
    ctx.restore();
  };
  
  // Draw Team ID - CENTER ALIGNED
  drawText(
    data.teamId,
    TEXT_POSITIONS.teamIdCenter.x,
    TEXT_POSITIONS.teamIdCenter.y,
    TEXT_POSITIONS.teamIdCenter.fontSize,
    TEXT_POSITIONS.teamIdCenter.color,
    TEXT_POSITIONS.teamIdCenter.fontWeight,
    TEXT_POSITIONS.teamIdCenter.align
  );
  
  // Draw Participant Name - CENTER ALIGNED
  drawText(
    data.participantName,
    TEXT_POSITIONS.participantName.x,
    TEXT_POSITIONS.participantName.y,
    TEXT_POSITIONS.participantName.fontSize,
    TEXT_POSITIONS.participantName.color,
    TEXT_POSITIONS.participantName.fontWeight,
    TEXT_POSITIONS.participantName.align
  );
  
  // Draw Team Name - CENTER ALIGNED
  drawText(
    data.teamName,
    TEXT_POSITIONS.teamName.x,
    TEXT_POSITIONS.teamName.y,
    TEXT_POSITIONS.teamName.fontSize,
    TEXT_POSITIONS.teamName.color,
    TEXT_POSITIONS.teamName.fontWeight,
    TEXT_POSITIONS.teamName.align
  );
  
  // Draw Event Name - CENTER ALIGNED
  drawText(
    data.eventName,
    TEXT_POSITIONS.eventName.x,
    TEXT_POSITIONS.eventName.y,
    TEXT_POSITIONS.eventName.fontSize,
    TEXT_POSITIONS.eventName.color,
    TEXT_POSITIONS.eventName.fontWeight,
    TEXT_POSITIONS.eventName.align
  );
  
  // Draw College Name - CENTER ALIGNED
  drawText(
    data.collegeName,
    TEXT_POSITIONS.collegeName.x,
    TEXT_POSITIONS.collegeName.y,
    TEXT_POSITIONS.collegeName.fontSize,
    TEXT_POSITIONS.collegeName.color,
    TEXT_POSITIONS.collegeName.fontWeight,
    TEXT_POSITIONS.collegeName.align
  );
  
  // Generate and draw QR code
  try {
    const qrData = createQRData(data);
    const qrBuffer = await generateQR(qrData);
    const qrImage = await loadImage(qrBuffer);
    
    // Draw QR code with enhanced contrast
    ctx.drawImage(
      qrImage,
      QR_POSITION.x - QR_POSITION.width / 2,
      QR_POSITION.y - QR_POSITION.height / 2,
      QR_POSITION.width,
      QR_POSITION.height
    );
  } catch {
    // QR code generation failed - continue without QR
  }
  
  // Return as JPEG with optimized quality (smaller file size for email)
  return canvas.toBuffer('image/jpeg', { quality: 0.75 });
}

/**
 * Generate event pass and return as base64 for email attachment
 */
export async function generateEventPassBase64(data: PassData): Promise<string> {
  const buffer = await generateEventPass(data);
  return buffer.toString('base64');
}