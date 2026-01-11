export interface EventData {
  slug: string;
  title: string;
  shortDescription: string;
  category: string;
  fullDescription?: string;
  date?: string;
  time?: string;
  location?: string;
  rulebookUrl?: string;
  content?: string;
  readTime?: string;
  prizePool?: string;
  prizes?: {
    first: string;
    second: string;
    third: string;
  };
  participationFee?: string;
  teamSize?: string;
}

// Mock data - replace with actual data fetching logic
const mockEvents: EventData[] = [
  {
    slug: 'robo-soccer',
    title: 'Robo Soccer',
    shortDescription: 'Build autonomous robots to compete in an intense soccer match. Score goals and defend your territory.',
    category: 'Technology',
    rulebookUrl: '/rulebooks/robo-soccer.pdf',
    date: 'March 15, 2026',
    time: '10:00 AM - 4:00 PM',
    location: 'Main Arena, Tech Hall',
    readTime: '5 min read',
    prizePool: '₹50,000',
    prizes: { first: '₹25,000', second: '₹15,000', third: '₹10,000' },
    participationFee: '₹500',
    teamSize: '2-4',
    content: `## Overview\n\nRobo Soccer is an exciting robotics competition where teams build autonomous robots to play soccer. Your robot must be able to detect the ball, navigate the field, and score goals while defending against opponent robots.\n\n## Rules and Guidelines\n\n### Robot Specifications\n- Maximum dimensions: 25cm x 25cm x 25cm\n- Maximum weight: 5kg\n- Must be autonomous (no remote control during match)\n- Power supply must be onboard\n\n### Match Format\n- 2v2 format\n- 10-minute matches\n- Best of 3 rounds in finals\n\n### Scoring\n- 1 point per goal\n- Penalties for fouls and violations\n\n## Prize Details\n\nWin exciting cash prizes and certificates:\n- 🥇 First Prize: ₹25,000\n- 🥈 Second Prize: ₹15,000\n- 🥉 Third Prize: ₹10,000\n\n## Contact Information\n\nFor queries, contact:\n- Email: robotics@eventhub.com\n- Phone: +91 98765 43210`,
  },
  {
    slug: 'line-follower',
    title: 'Line Follower',
    shortDescription: 'Design a robot that navigates complex tracks autonomously. Speed and precision are key to victory.',
    category: 'Technology',
    rulebookUrl: '/rulebooks/line-follower.pdf',
    date: 'March 16, 2026',
    time: '9:00 AM - 3:00 PM',
    location: 'Track Arena, Building A',
    readTime: '4 min read',
    prizePool: '₹30,000',
    prizes: { first: '₹15,000', second: '₹10,000', third: '₹5,000' },
    participationFee: '₹300',
    teamSize: '1-3',
    content: `## Overview\n\nLine Follower is a classic robotics challenge where your robot must autonomously follow a black line on a white surface at maximum speed.\n\n## Competition Details\n\n### Track Specifications\n- Black line on white background\n- Line width: 2-3cm\n- Multiple turns and intersections\n- Time-based scoring\n\n### Requirements\n- Autonomous navigation\n- Infrared/optical sensors allowed\n- Must complete track without human intervention\n\n## Judging Criteria\n- Completion time\n- Accuracy\n- Number of attempts\n\n## Contact\nroboticsclub@eventhub.com`,
  },
  {
    slug: 'robo-war',
    title: 'Robo War',
    shortDescription: 'Ultimate battle of machines. Build powerful combat robots and fight for supremacy in the arena.',
    category: 'Hackathon',
    rulebookUrl: '/rulebooks/robo-war.pdf',
    date: 'March 17, 2026',
    time: '11:00 AM - 6:00 PM',
    location: 'Battle Arena, Sports Complex',
    readTime: '6 min read',
    prizePool: '₹1,00,000',
    prizes: { first: '₹50,000', second: '₹30,000', third: '₹20,000' },
    participationFee: '₹1000',
    teamSize: '2-5',
    content: `## Overview\n\nRobo War is the ultimate combat robotics competition. Build a powerful fighting machine and battle other robots in an elimination tournament.\n\n## Rules\n\n### Weight Classes\n- Lightweight: Up to 15kg\n- Middleweight: 15-30kg\n- Heavyweight: 30-50kg\n\n### Weapons & Restrictions\n- No projectile weapons\n- No liquid weapons\n- No entanglement devices\n- Pneumatic and electrical weapons allowed\n\n### Arena\n- 20ft x 20ft arena\n- Pit zones and hazards\n- Bulletproof walls\n\n## Tournament Format\n- Single elimination\n- 3-minute battles\n- Judge's decision or knockout\n\n## Safety\nAll participants must wear safety gear. Detailed safety guidelines in rulebook.`,
  },
  {
    slug: 'maze-solver',
    title: 'Maze Solver',
    shortDescription: 'Navigate through intricate mazes using sensors and algorithms. Find the shortest path to win.',
    category: 'Technology',
    rulebookUrl: '/rulebooks/maze-solver.pdf',
    date: 'March 18, 2026',
    time: '10:00 AM - 2:00 PM',
    location: 'Lab Complex, Building C',
    readTime: '4 min read',
    prizePool: '₹40,000',
    prizes: { first: '₹20,000', second: '₹12,000', third: '₹8,000' },
    participationFee: '₹400',
    teamSize: '1-4',
    content: `## Overview\n\nMaze Solver challenges your robot to autonomously navigate and solve complex mazes using sensors and algorithms.\n\n## Maze Specifications\n- Standard micromouse format\n- 16x16 grid\n- Wall height: 5cm\n- Multiple paths to goal\n\n## Scoring\n- Based on time and efficiency\n- Bonus for shortest path\n- Multiple runs allowed\n\n## Requirements\n- Autonomous operation\n- Any sensor type allowed\n- Maximum robot size: 15cm x 15cm\n\n## Get Started\nDownload the rulebook for detailed specifications and prepare your algorithm!`,
  },
  {
    slug: 'drone-race',
    title: 'Drone Race',
    shortDescription: 'High-speed aerial competition through obstacle courses. Master control and precision in three dimensions.',
    category: 'Hackathon',
    rulebookUrl: '/rulebooks/drone-race.pdf',
    date: 'March 19, 2026',
    time: '12:00 PM - 5:00 PM',
    location: 'Open Ground, Sports Area',
    readTime: '5 min read',
    prizePool: '₹60,000',
    prizes: { first: '₹30,000', second: '₹20,000', third: '₹10,000' },
    participationFee: '₹800',
    teamSize: '1-2',
    content: `## Overview\n\nDrone Race is an adrenaline-pumping FPV racing competition through challenging 3D obstacle courses.\n\n## Race Format\n- Time trial qualification\n- Head-to-head elimination rounds\n- 3-lap final race\n\n## Drone Specifications\n- Maximum diagonal: 250mm\n- Battery: 4S LiPo maximum\n- FPV equipment required\n- Safety features mandatory\n\n## Course\n- Gates and obstacles\n- Height variations\n- Technical sections\n- Speed zones\n\n## Safety Requirements\n- All pilots must wear goggles\n- Spotter required\n- Insurance recommended\n\n## Contact\naviation@eventhub.com`,
  },
  {
    slug: 'robotic-arm',
    title: 'Robotic Arm Challenge',
    shortDescription: 'Precision manipulation task using robotic arms. Complete complex tasks with accuracy and efficiency.',
    category: 'Technology',
    rulebookUrl: '/rulebooks/robotic-arm.pdf',
    date: 'March 20, 2026',
    time: '9:00 AM - 1:00 PM',
    location: 'Robotics Lab, Innovation Center',
    readTime: '4 min read',
    prizePool: '₹35,000',
    prizes: { first: '₹18,000', second: '₹10,000', third: '₹7,000' },
    participationFee: '₹350',
    teamSize: '2-3',
    content: `## Overview\n\nThe Robotic Arm Challenge tests your robot's dexterity and precision in completing manipulation tasks.\n\n## Tasks\n- Object sorting by color/shape\n- Precision stacking\n- Pick and place operations\n- Timed challenges\n\n## Specifications\n- Maximum reach: 50cm\n- Minimum 3 degrees of freedom\n- Gripper required\n- Control system of your choice\n\n## Scoring\n- Task completion time\n- Accuracy points\n- Penalty for dropped objects\n\n## Workshop\nFree workshop on arm kinematics day before the event!`,
  },
  {
    slug: 'cultural-night',
    title: 'Cultural Night',
    shortDescription: 'Experience diverse cultures through music, dance, and art. A celebration of global traditions.',
    category: 'Cultural',
    date: 'March 21, 2026',
    time: '6:00 PM - 10:00 PM',
    location: 'Main Auditorium',
    readTime: '3 min read',
    prizePool: '₹20,000',
    prizes: { first: '₹10,000', second: '₹6,000', third: '₹4,000' },
    participationFee: 'Free Entry',
    teamSize: '1-10',
    content: `## Overview\n\nCultural Night celebrates diversity through performances, exhibitions, and interactive experiences.\n\n## Performances\n- Traditional dance\n- Music performances\n- Drama and skits\n- Fashion shows\n\n## Categories\n- Solo performances\n- Group acts\n- Cultural exhibitions\n- Food stalls\n\n## Prizes\nWinning performances in each category will receive prizes and certificates.\n\n## Registration\nOpen to all! Register your performance by March 10.`,
  },
  {
    slug: 'tech-talk',
    title: 'Tech Talk Series',
    shortDescription: 'Industry experts share insights on cutting-edge technologies and career opportunities.',
    category: 'Technology',
    date: 'March 22, 2026',
    time: '2:00 PM - 5:00 PM',
    location: 'Conference Hall, Block D',
    readTime: '3 min read',
    prizePool: 'N/A',
    prizes: { first: 'N/A', second: 'N/A', third: 'N/A' },
    participationFee: 'Free',
    teamSize: 'Individual',
    content: `## Overview\n\nJoin industry leaders and experts for an afternoon of inspiring talks on the latest in technology.\n\n## Topics\n- AI and Machine Learning\n- Web3 and Blockchain\n- IoT and Embedded Systems\n- Career guidance\n\n## Speakers\n- Senior engineers from top tech companies\n- Startup founders\n- Research scientists\n\n## Schedule\n- 2:00 PM - Opening keynote\n- 3:00 PM - Panel discussion\n- 4:00 PM - Q&A session\n\n## Free Event\nNo registration fee. Open seating. Certificates provided.`,
  },
];

export async function getAllEvents(): Promise<EventData[]> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockEvents;
}

export async function getEventBySlug(slug: string): Promise<EventData | null> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockEvents.find(event => event.slug === slug) || null;
}
