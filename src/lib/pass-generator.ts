/**
 * Event Pass Generator
 * 
 * Generates personalized event passes with:
 * - Team details overlaid on template
 * - Dynamic barcode with Team ID
 */

import { createCanvas, loadImage, registerFont } from 'canvas';
import bwipjs from 'bwip-js';
import path from 'path';
import fs from 'fs';

// Template dimensions
const TEMPLATE_WIDTH = 2000;
const TEMPLATE_HEIGHT = 647;

// Text positions (adjusted based on feedback)
const TEXT_POSITIONS = {
  // "ID [TEAM_ID]" - center area (keep as is)
  teamIdCenter: {
    x: 950,
    y: 260,
    fontSize: 42,
    fontWeight: 'bold',
    color: '#E8E4DD',
  },
  // "TEAM NAME : [VALUE]" (right 7rem = 112px more from current)
  teamName: {
    x: 850,  // was 729, +112 right (7rem)
    y: 490,
    fontSize: 26,
    fontWeight: 'normal',
    color: '#E8E4DD',
  },
  // "EVENT NAME : [VALUE]" (right 7rem = 112px more)
  eventName: {
    x: 850,  // was 729, +112 right (7rem)
    y: 530,
    fontSize: 26,
    fontWeight: 'normal',
    color: '#E8E4DD',
  },
  // "College Name : [VALUE]" (right 7rem = 112px more)
  collegeName: {
    x: 850,  // was 729, +112 right (7rem)
    y: 570,
    fontSize: 26,
    fontWeight: 'normal',
    color: '#E8E4DD',
  },
  // Vertical "TEAM ID" on right side - positioned to not overlap barcode
  teamIdVertical: {
    x: 1790,  // moved left to avoid barcode overlap
    y: 600,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E8E4DD',
    rotation: -90,
  },
};

// Barcode position (7rem left, 1.5x height increase, 4rem margin from right)
const BARCODE_POSITION = {
  x: 1880,   // 4rem (64px) from right edge (2000 - 64 - barcode_width/2)
  y: 323,
  width: 600,
  height: 100,  // 1.5x increase (150 * 1.5 = 225)
  rotation: -90,
};

export interface PassData {
  teamId: string;        // e.g., "GT-2026-4496"
  teamName: string;      // e.g., "RoboWarriors"
  eventName: string;     // e.g., "Robo Race"
  collegeName: string;   // e.g., "XYZ Engineering College"
}

/**
 * Generate a barcode image buffer
 */
async function generateBarcode(text: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    bwipjs.toBuffer(
      {
        bcid: 'code128',       // Barcode type
        text: text,            // Text to encode
        scale: 3,              // 3x scaling factor
        height: 10,            // Bar height in mm
        includetext: false,    // Don't include text below barcode
        textxalign: 'center',  // Center text
        backgroundcolor: 'ffffff',
        barcolor: 'E8E4DD',    // Match template text color
      },
      (err: Error | string, png: Buffer) => {
        if (err) {
          reject(err);
        } else {
          resolve(png);
        }
      }
    );
  });
}

/**
 * Generate event pass with team details
 */
export async function generateEventPass(data: PassData): Promise<Buffer> {
  // Load the template image
  const templatePath = path.join(process.cwd(), 'public', 'images', 'pass-template.png');
  
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found at ${templatePath}`);
  }

  const template = await loadImage(templatePath);
  
  // Create canvas with template dimensions
  const canvas = createCanvas(TEMPLATE_WIDTH, TEMPLATE_HEIGHT);
  const ctx = canvas.getContext('2d');
  
  // Draw the template
  ctx.drawImage(template, 0, 0, TEMPLATE_WIDTH, TEMPLATE_HEIGHT);
  
  // Set up text rendering
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  
  // Helper function to draw text
  const drawText = (
    text: string,
    x: number,
    y: number,
    fontSize: number,
    color: string,
    fontWeight: string = 'normal',
    rotation?: number
  ) => {
    ctx.save();
    ctx.fillStyle = color;
    ctx.font = `${fontWeight} ${fontSize}px Arial, sans-serif`;
    
    if (rotation) {
      ctx.translate(x, y);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.fillText(text, 0, 0);
    } else {
      ctx.fillText(text, x, y);
    }
    
    ctx.restore();
  };
  
  // Draw Team ID (center) - just the ID value, "ID" is already in template
  drawText(
    data.teamId,
    TEXT_POSITIONS.teamIdCenter.x,
    TEXT_POSITIONS.teamIdCenter.y,
    TEXT_POSITIONS.teamIdCenter.fontSize,
    TEXT_POSITIONS.teamIdCenter.color,
    TEXT_POSITIONS.teamIdCenter.fontWeight
  );
  
  // Draw Team Name - just the value
  drawText(
    data.teamName,
    TEXT_POSITIONS.teamName.x,
    TEXT_POSITIONS.teamName.y,
    TEXT_POSITIONS.teamName.fontSize,
    TEXT_POSITIONS.teamName.color,
    TEXT_POSITIONS.teamName.fontWeight
  );
  
  // Draw Event Name - just the value
  drawText(
    data.eventName,
    TEXT_POSITIONS.eventName.x,
    TEXT_POSITIONS.eventName.y,
    TEXT_POSITIONS.eventName.fontSize,
    TEXT_POSITIONS.eventName.color,
    TEXT_POSITIONS.eventName.fontWeight
  );
  
  // Draw College Name - just the value
  drawText(
    data.collegeName,
    TEXT_POSITIONS.collegeName.x,
    TEXT_POSITIONS.collegeName.y,
    TEXT_POSITIONS.collegeName.fontSize,
    TEXT_POSITIONS.collegeName.color,
    TEXT_POSITIONS.collegeName.fontWeight
  );
  
  // Draw Team ID (vertical on right side) - just the ID value
  drawText(
    data.teamId,
    TEXT_POSITIONS.teamIdVertical.x,
    TEXT_POSITIONS.teamIdVertical.y,
    TEXT_POSITIONS.teamIdVertical.fontSize,
    TEXT_POSITIONS.teamIdVertical.color,
    TEXT_POSITIONS.teamIdVertical.fontWeight,
    TEXT_POSITIONS.teamIdVertical.rotation
  );
  
  // Generate and draw barcode
  try {
    const barcodeBuffer = await generateBarcode(data.teamId);
    const barcodeImage = await loadImage(barcodeBuffer);
    
    // Draw rotated barcode
    ctx.save();
    ctx.translate(BARCODE_POSITION.x, BARCODE_POSITION.y);
    ctx.rotate((BARCODE_POSITION.rotation * Math.PI) / 180);
    
    // Draw barcode (it will be rotated)
    ctx.drawImage(
      barcodeImage,
      -BARCODE_POSITION.width / 2,
      -BARCODE_POSITION.height / 2,
      BARCODE_POSITION.width,
      BARCODE_POSITION.height
    );
    
    ctx.restore();
  } catch (error) {
    console.error('Error generating barcode:', error);
    // Continue without barcode if it fails
  }
  
  // Return as JPEG buffer (smaller file size)
  return canvas.toBuffer('image/jpeg', { quality: 0.85 });
}

/**
 * Generate event pass and return as base64 for email attachment
 */
export async function generateEventPassBase64(data: PassData): Promise<string> {
  const buffer = await generateEventPass(data);
  return buffer.toString('base64');
}
