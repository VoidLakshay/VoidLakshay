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
  const leftPanelX = 40;
  const rightPanelX = 480;
  let leftY = 55;
  let rightY = 55;
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

  let leftPanelSVG = '';
  let rightPanelSVG = '';

  const addLeftHeader = (text) => { leftPanelSVG += renderHeaderRow(leftPanelX, leftY, text) + '\n'; leftY += rowHeight; };
  const addLeftRow = (label, value) => { leftPanelSVG += renderRow(leftPanelX, leftY, label, value) + '\n'; leftY += rowHeight; };
  const addLeftBlank = () => { leftY += rowHeight; };
  
  const addRightHeader = (text) => { rightPanelSVG += renderHeaderRow(rightPanelX, rightY, text) + '\n'; rightY += rowHeight; };
  const addRightRow = (label, value) => { rightPanelSVG += renderRow(rightPanelX, rightY, label, value) + '\n'; rightY += rowHeight; };
  const addRightBlank = () => { rightY += rowHeight; };
  const addRightStatsRow = (l1, v1, l2, v2) => { rightPanelSVG += renderStatsRow(rightPanelX, rightY, l1, v1, l2, v2) + '\n'; rightY += rowHeight; };

  // --- Build Left Panel ---
  addLeftHeader("Tech Stack");
  addLeftRow("Frontend", "React, Next.js, Redux, Zustand, Tailwind");
  addLeftRow("Backend", "Node.js, Express, REST APIs, Prisma");
  addLeftRow("Database", "PostgreSQL, MongoDB, Redis");
  addLeftRow("Cloud", "Docker, RabbitMQ, AWS S3, Cloudinary");
  addLeftRow("Languages", "JavaScript, TypeScript");
  
  addLeftBlank();
  
  addLeftHeader("Tools & OS");
  addLeftRow("Environment", "Linux, VS Code, Git");
  addLeftRow("API Testing", "Postman");
  
  addLeftBlank();
  
  addLeftHeader("Currently Learning");
  addLeftRow("Focus", "System Design, AI Agents");
  addLeftRow("Next", "Advanced Data Structures");

  addLeftBlank();
  
  addLeftHeader("Hobbies");
  addLeftRow("Strategy", "Chess");
  addLeftRow("Creative", "Content Creation");
  addLeftRow("Leisure", "Music");

  // --- Build Right Panel ---
  addRightHeader("Education");
  addRightRow("Degree", "BCA @ IITM Murthal");
  addRightRow("Batch", "2025 - 2028");

  addRightBlank();

  addRightHeader("Contact");
  addRightRow("Name", "Lakshay Vashishth");
  addRightRow("Role", "Full Stack Software Engineer");
  addRightRow("Location", "Sonipat, Haryana, India");
  addRightRow("Email", "lakshayvashisth09@gmail.com");
  addRightRow("GitHub", "VoidLakshay");
  addRightRow("LinkedIn", "lakshayvashisth");
  addRightRow("Discord", "voidlakshay");

  addRightBlank();

  addRightHeader("GitHub Statistics");
  addRightStatsRow("Repositories", stats.repositories, "Followers", stats.followers);
  addRightStatsRow("Stars", stats.stars, "Commits", formatNumber(stats.commits));
  addRightStatsRow("Pull Requests", stats.prs, "Contributions", formatNumber(stats.contributions) + "+");
  addRightRow("Lines of Code", formatNumber(stats.loc) + "+");
  addRightRow("Languages Used", languagesText);

  // SVG Height should adapt to the taller panel
  const totalHeight = Math.max(leftY, rightY) + 20;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="920" height="${totalHeight}" viewBox="0 0 920 ${totalHeight}">
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
  <rect width="920" height="${totalHeight}" rx="12" fill="${bg}" stroke="${border}" stroke-width="1"/>
  
  <!-- Terminal Header -->
  <text x="40" y="25" fill="${muted}" class="text header">lakshay@github:~$ neofetch<tspan class="cursor" fill="${value}"> █</tspan></text>
  <text x="880" y="25" fill="${muted}" class="text footer" text-anchor="end">Last Updated: <tspan fill="${value}">${stats.lastUpdated}</tspan></text>

  <!-- LEFT PANEL -->
  ${leftPanelSVG}
  
  <!-- RIGHT PANEL -->
  ${rightPanelSVG}

</svg>`;
}

fs.writeFileSync(darkOutPath, generateSVG('dark'));
console.log('Generated dark.svg');
fs.writeFileSync(lightOutPath, generateSVG('light'));
console.log('Generated light.svg');
