const fs = require('fs');
const path = require('path');

const statsPath = path.join(__dirname, '..', 'stats.json');
const darkOutPath = path.join(__dirname, '..', 'assets', 'dark.svg');
const lightOutPath = path.join(__dirname, '..', 'assets', 'light.svg');

let stats = {};
try {
  stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
} catch (e) {
  stats = { followers: 0, repositories: 0, stars: 0, commits: 0, prs: 0, contributions: 0, loc: 0, languages: [], lastUpdated: 'Unknown' };
}

const formatNumber = (num) => num > 999 ? (num/1000).toFixed(1) + 'k' : num;

function generateSVG(theme = 'dark') {
  const isDark = theme === 'dark';
  const bg = isDark ? '#161B22' : '#FFFFFF';
  const border = isDark ? '#30363D' : '#D0D7DE';
  const label = isDark ? '#F59E0B' : '#1F883D'; // Subtle orange in dark, green in light
  const value = isDark ? '#E6EDF3' : '#24292F'; // White in dark, dark gray in light
  const muted = isDark ? '#8B949E' : '#57606A';

  let languagesText = stats.languages
    .map(l => l.name)
    .filter(name => name !== 'HTML' && name !== 'CSS')
    .join(', ');
  if (!languagesText) languagesText = "JavaScript, TypeScript";

  // Helpers
  const rightPanelX = 40;
  let currentY = 55;
  const rowHeight = 18.5;

  const renderRow = (x, y, labelStr, valueStr, totalLen = 61) => {
    const prefix = `. ${labelStr}: `;
    const suffix = ` ${valueStr}`;
    let dotsCount = totalLen - prefix.length - suffix.length;
    if (dotsCount < 1) dotsCount = 1;
    let dots = '';
    for(let i = 0; i < dotsCount; i++) dots += '.';
    return `<text x="${x}" y="${y}" class="text row"><tspan fill="${muted}">. </tspan><tspan fill="${label}">${labelStr}: </tspan><tspan fill="${muted}">${dots}</tspan><tspan fill="${value}"> ${valueStr}</tspan></text>`;
  };

  const renderHeaderRow = (x, y, text, totalLen = 61) => {
    let dashes = '';
    for(let i = 0; i < (totalLen - text.length - 3); i++) dashes += '-';
    return `<text x="${x}" y="${y}" class="text title"><tspan fill="${muted}">- </tspan><tspan fill="${value}">${text} </tspan><tspan fill="${muted}">${dashes}</tspan></text>`;
  };

  const renderStatsRow = (x, y, lbl1, val1, lbl2, val2, totalLen = 61) => {
     const leftPrefix = `. ${lbl1}: `;
     const leftSuffix = ` ${val1} `;
     let leftDotsCount = 30 - leftPrefix.length - leftSuffix.length;
     if (leftDotsCount < 1) leftDotsCount = 1;
     let leftDots = '';
     for(let i = 0; i < leftDotsCount; i++) leftDots += '.';
     
     const rightPrefix = `${lbl2}: `;
     const rightSuffix = ` ${val2}`;
     let rightDotsCount = totalLen - 32 - rightPrefix.length - rightSuffix.length;
     if (rightDotsCount < 1) rightDotsCount = 1;
     let rightDots = '';
     for(let i = 0; i < rightDotsCount; i++) rightDots += '.';
     
     return `<text x="${x}" y="${y}" class="text row"><tspan fill="${muted}">. </tspan><tspan fill="${label}">${lbl1}: </tspan><tspan fill="${muted}">${leftDots}</tspan><tspan fill="${value}"> ${val1} </tspan><tspan fill="${muted}">| </tspan><tspan fill="${label}">${lbl2}: </tspan><tspan fill="${muted}">${rightDots}</tspan><tspan fill="${value}"> ${val2}</tspan></text>`;
  };

  let rightPanelSVG = '';

  const addHeader = (text) => {
     rightPanelSVG += renderHeaderRow(rightPanelX, currentY, text) + '\n';
     currentY += rowHeight;
  };
  const addRow = (label, value) => {
     rightPanelSVG += renderRow(rightPanelX, currentY, label, value) + '\n';
     currentY += rowHeight;
  };
  const addBlank = () => {
     currentY += rowHeight;
  };
  const addStatsRow = (l1, v1, l2, v2) => {
     rightPanelSVG += renderStatsRow(rightPanelX, currentY, l1, v1, l2, v2) + '\n';
     currentY += rowHeight;
  };

  // Build Right Panel
  addHeader("Tech Stack");
  addRow("Frontend", "React, Next.js, Redux, Zustand, Tailwind");
  addRow("Backend", "Node.js, Express, REST APIs, Prisma");
  addRow("Database", "PostgreSQL, MongoDB, Redis");
  addRow("Cloud", "Docker, RabbitMQ, AWS S3, Cloudinary");
  addRow("Languages", "JavaScript, TypeScript");
  
  addBlank();
  
  addHeader("Hobbies");
  addRow("Strategy", "Chess");
  addRow("Creative", "Content Creation");
  addRow("Leisure", "Music");

  addBlank();
  
  addHeader("Contact");
  addRow("Name", "Lakshay Vashishth");
  addRow("Role", "Full Stack Software Engineer");
  addRow("Location", "Sonipat, Haryana, India");
  addRow("Email", "lakshayvashisth09@gmail.com");
  addRow("GitHub", "VoidLakshay");
  addRow("LinkedIn", "lakshayvashisth");
  addRow("Discord", "voidlakshay");

  addBlank();

  addHeader("GitHub Statistics");
  addStatsRow("Repositories", stats.repositories, "Followers", stats.followers);
  addStatsRow("Stars", stats.stars, "Commits", formatNumber(stats.commits));
  addStatsRow("Pull Requests", stats.prs, "Contributions", formatNumber(stats.contributions) + "+");
  addRow("Lines of Code", formatNumber(stats.loc) + "+");
  addRow("Languages Used", languagesText);

  // Adjusted width from 1000 to something like 600
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="580" viewBox="0 0 600 580">
  <defs>
    <style>
      .text { font-family: Consolas, "Courier New", Courier, monospace; }
      .header { font-weight: bold; font-size: 16px; }
      .title { font-weight: bold; font-size: 15px; }
      .name { font-weight: bold; font-size: 26px; }
      .row { font-size: 15px; }
      .footer { font-size: 12px; }
      .status { font-size: 15px; }
      .cursor { animation: blink 1s step-end infinite; }
      @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      text, tspan { white-space: pre; }
    </style>
  </defs>

  <!-- Background -->
  <rect width="600" height="580" rx="12" fill="${bg}" stroke="${border}" stroke-width="1"/>
  
  <!-- Terminal Header -->
  <text x="40" y="25" fill="${muted}" class="text header">lakshay@github:~$ neofetch<tspan class="cursor" fill="${value}"> █</tspan></text>
  <text x="560" y="25" fill="${muted}" class="text footer" text-anchor="end">Last Updated: <tspan fill="${value}">${stats.lastUpdated}</tspan></text>

  <!-- RIGHT PANEL (now single panel) -->
  ${rightPanelSVG}

</svg>`;
}

fs.writeFileSync(darkOutPath, generateSVG('dark'));
console.log('Generated dark.svg');
fs.writeFileSync(lightOutPath, generateSVG('light'));
console.log('Generated light.svg');
