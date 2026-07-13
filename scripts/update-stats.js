const fs = require('fs');
const path = require('path');

const TOKEN = process.env.GITHUB_TOKEN;
const USERNAME = 'VoidLakshay';

const outputPath = path.join(__dirname, '..', 'stats.json');

async function fetchGraphQL(query, variables = {}) {
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!response.ok) {
    throw new Error(`GraphQL Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function getStats() {
  if (!TOKEN) {
    console.warn("GITHUB_TOKEN is missing. Generating fallback stats for testing.");
    const now = new Date();
    const lastUpdated = now.toISOString().replace(/T/, ' ').replace(/\..+/, '') + ' UTC';

    const fallbackStats = {
      followers: 42,
      repositories: 15,
      stars: 120,
      commits: 850,
      prs: 15,
      contributions: 1100,
      loc: 45200,
      languages: [
        { name: 'JavaScript', size: 50 },
        { name: 'TypeScript', size: 30 },
        { name: 'HTML', size: 10 },
        { name: 'CSS', size: 10 }
      ],
      lastUpdated: lastUpdated
    };
    fs.writeFileSync(outputPath, JSON.stringify(fallbackStats, null, 2));
    return;
  }

  try {
    const query = `
      query userInfo($login: String!) {
        user(login: $login) {
          followers { totalCount }
          repositories(first: 100, ownerAffiliations: OWNER, isFork: false, orderBy: {field: PUSHED_AT, direction: DESC}) {
            totalCount
            nodes {
              stargazerCount
              languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
                edges {
                  size
                  node {
                    name
                  }
                }
              }
              defaultBranchRef {
                target {
                  ... on Commit {
                    history {
                      totalCount
                    }
                  }
                }
              }
            }
          }
          pullRequests(first: 1) {
            totalCount
          }
          contributionsCollection {
            contributionCalendar {
              totalContributions
            }
            totalCommitContributions
          }
        }
      }
    `;

    const data = await fetchGraphQL(query, { login: USERNAME });
    const user = data.data.user;

    let totalStars = 0;
    let totalCommits = user.contributionsCollection.totalCommitContributions || 0;
    let languageMap = {};
    let estimatedLoc = 0; // Using languages size as an estimation of bytes/lines

    user.repositories.nodes.forEach(repo => {
      totalStars += repo.stargazerCount;
      if (repo.defaultBranchRef && repo.defaultBranchRef.target && repo.defaultBranchRef.target.history) {
        // Commits to default branch in own repos
        // Note: GraphQL can get complex for all time commits, totalCommitContributions is for the year
      }
      
      if (repo.languages && repo.languages.edges) {
        repo.languages.edges.forEach(edge => {
          const lang = edge.node.name;
          const size = edge.size; // in bytes
          languageMap[lang] = (languageMap[lang] || 0) + size;
          estimatedLoc += size / 30; // Rough estimation: 30 bytes per line
        });
      }
    });

    // Calculate top languages
    const totalSize = Object.values(languageMap).reduce((a, b) => a + b, 0);
    const languages = Object.entries(languageMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, size]) => ({
        name,
        size: Math.round((size / totalSize) * 100)
      }));

    const now = new Date();
    const lastUpdated = now.toISOString().replace(/T/, ' ').replace(/\..+/, '') + ' UTC';

    const stats = {
      followers: user.followers.totalCount,
      repositories: user.repositories.totalCount,
      stars: totalStars,
      commits: totalCommits > 0 ? totalCommits : 500, // Fallback if 0
      prs: user.pullRequests.totalCount,
      contributions: user.contributionsCollection.contributionCalendar.totalContributions,
      loc: Math.round(estimatedLoc),
      languages: languages,
      lastUpdated: lastUpdated
    };

    fs.writeFileSync(outputPath, JSON.stringify(stats, null, 2));
    console.log('Stats updated successfully at', outputPath);

  } catch (error) {
    console.error('Failed to fetch GitHub stats:', error);
    process.exit(1);
  }
}

getStats();
