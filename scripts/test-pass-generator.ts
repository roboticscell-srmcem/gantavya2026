/**
 * Test script to generate a sample event pass
 * Run with: npx ts-node scripts/test-pass-generator.ts
 */

import { generateEventPass } from '../src/lib/pass-generator';
import fs from 'fs';
import path from 'path';

async function testPassGeneration() {
  console.log('🎟️  Generating test event pass...\n');

  // Example: Generate passes for multiple team members
  const teamMembers = [
    {
      participantName: 'John Doe',
      participantEmail: 'john@example.com',
      participantPhone: '9876543210',
    },
    {
      participantName: 'Kate Marlowe',
      participantEmail: 'kate@example.com',
      participantPhone: '9876543211',
    },
    {
      participantName: 'Alex Johnson',
      participantEmail: 'alex@example.com',
      participantPhone: '9876543212',
    }
  ];

  // Generate pass for first participant (you can loop through all)
  const testData = {
    teamId: 'GT-2026-4496',
    teamName: 'RoboWarriors',
    eventName: 'Robo Race',
    collegeName: 'SRM College of Engineering',
    ...teamMembers[1], // Spread participant data
    paymentStatus: 'PAID',
  };

  console.log('Test Data:');
  console.log('  Team ID:', testData.teamId);
  console.log('  Team Name:', testData.teamName);
  console.log('  Event Name:', testData.eventName);
  console.log('  College Name:', testData.collegeName);
  console.log('  Participant Name:', testData.participantName);
  console.log('  Participant Email:', testData.participantEmail);
  console.log('  Participant Phone:', testData.participantPhone);
  console.log('  Payment Status:', testData.paymentStatus);
  console.log('');
  console.log('💡 To generate passes for all team members, loop through teamMembers array:');
  console.log('   for (const member of teamMembers) {');
  console.log('     const passData = { teamId, teamName, eventName, collegeName, paymentStatus, ...member };');
  console.log('     await generateEventPass(passData);');
  console.log('   }');
  console.log('');

  try {
    const passBuffer = await generateEventPass(testData);
    
    // Save to public/images for easy viewing
    const outputPath = path.join(process.cwd(), 'public', 'images', 'test-pass-output.png');
    fs.writeFileSync(outputPath, passBuffer);
    
    console.log('✅ Pass generated successfully!');
    console.log(`📁 Saved to: ${outputPath}`);
    console.log('\nOpen this file to verify text positions are correct.');
  } catch (error) {
    console.error('❌ Error generating pass:', error);
  }
}

testPassGeneration();
