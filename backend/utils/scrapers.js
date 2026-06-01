// Real-time Platform Scrapers and API Clients

// ==========================
// LEETCODE GRAPHQL CLIENT
// ==========================

exports.fetchLeetCodeStats = async (handle) => {
  try {
    const url = 'https://leetcode.com/graphql';
    const query = {
      query: `
        query userProblemsSolved($username: String!) {
          matchedUser(username: $username) {
            submitStatsGlobal {
              acSubmissionNum {
                difficulty
                count
              }
            }
          }
        }
      `,
      variables: { username: handle }
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query)
    });
    
    if (response.status !== 200) {
      throw new Error(`LeetCode server error: ${response.status}`);
    }
    
    const data = await response.json();
    if (!data.data || !data.data.matchedUser) {
      throw new Error('LeetCode handle not found or profile is private');
    }
    
    const solvedList = data.data.matchedUser.submitStatsGlobal.acSubmissionNum;
    const solvedObj = {};
    solvedList.forEach(item => {
      solvedObj[item.difficulty.toLowerCase()] = item.count;
    });
    
    return {
      solved: solvedObj['all'] || 0,
      easy: solvedObj['easy'] || 0,
      medium: solvedObj['medium'] || 0,
      hard: solvedObj['hard'] || 0
    };
  } catch (err) {
    throw new Error(err.message || 'Failed to fetch LeetCode statistics');
  }
};

exports.fetchLeetCodeHistory = async (handle) => {
  const url = 'https://leetcode.com/graphql';
  const historyMap = {};
  
  const fetchYear = async (year) => {
    const query = {
      query: `
        query userProfileCalendar($username: String!, $year: Int) {
          matchedUser(username: $username) {
            userCalendar(year: $year) {
              submissionCalendar
            }
          }
        }
      `,
      variables: { username: handle, year }
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query)
    });
    
    if (response.status === 200) {
      const data = await response.json();
      const calendarStr = data?.data?.matchedUser?.userCalendar?.submissionCalendar;
      if (calendarStr) {
        try {
          return JSON.parse(calendarStr);
        } catch (e) {
          return {};
        }
      }
    }
    return {};
  };

  try {
    const currentYear = new Date().getFullYear();
    const thisYearCal = await fetchYear(currentYear);
    const prevYearCal = await fetchYear(currentYear - 1);
    
    const mergeCalendar = (cal) => {
      Object.entries(cal).forEach(([timestamp, count]) => {
        // Convert timestamp (in seconds) to local date string YYYY-MM-DD
        const date = new Date(parseInt(timestamp) * 1000).toISOString().split('T')[0];
        historyMap[date] = (historyMap[date] || 0) + count;
      });
    };
    
    mergeCalendar(thisYearCal);
    mergeCalendar(prevYearCal);
  } catch (err) {
    console.error('Error fetching LeetCode calendar history:', err.message);
  }
  return historyMap;
};

exports.fetchLeetCodeRatingHistory = async (handle) => {
  try {
    const url = 'https://leetcode.com/graphql';
    const query = {
      query: `
        query userContestRankingInfo($username: String!) {
          userContestRankingHistory(username: $username) {
            attended
            rating
            contest {
              title
              startTime
            }
          }
        }
      `,
      variables: { username: handle }
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query)
    });
    
    if (response.status === 200) {
      const data = await response.json();
      const ratingHistory = data?.data?.userContestRankingHistory || [];
      return ratingHistory
        .filter(c => c.attended)
        .map(c => ({
          name: c.contest.title.replace(/Weekly Contest |Biweekly Contest /g, 'WC').slice(0, 15),
          rating: Math.round(c.rating)
        }));
    }
  } catch (err) {
    console.error('Error fetching LeetCode rating history:', err.message);
  }
  return [];
};

exports.fetchLeetCodeRecentSubmissions = async (handle, count = 10) => {
  try {
    const url = 'https://leetcode.com/graphql';
    const query = {
      query: `
        query recentSubmissions($username: String!, $limit: Int) {
          recentSubmissionList(username: $username, limit: $limit) {
            title
            timestamp
            statusDisplay
            lang
          }
        }
      `,
      variables: { username: handle, limit: count }
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query)
    });
    
    if (response.status === 200) {
      const data = await response.json();
      const submissions = data?.data?.recentSubmissionList || [];
      return submissions.map((sub, idx) => ({
        id: `leetcode-${idx}-${sub.timestamp}`,
        problemName: sub.title,
        language: sub.lang,
        status: sub.statusDisplay === 'Accepted' ? 'Accepted' : 'Wrong Answer',
        time: new Date(parseInt(sub.timestamp) * 1000).toLocaleString(),
        runTime: 'N/A'
      }));
    }
  } catch (err) {
    console.error('Error fetching LeetCode recent submissions:', err.message);
  }
  return [];
};


// ==========================
// CODEFORCES API CLIENT
// ==========================

exports.fetchCodeforcesStats = async (handle) => {
  try {
    const infoUrl = `https://codeforces.com/api/user.info?handles=${handle}`;
    const infoRes = await fetch(infoUrl);
    
    if (infoRes.status !== 200) {
      throw new Error(`Codeforces handle not found (${infoRes.status})`);
    }
    
    const infoData = await infoRes.json();
    if (infoData.status !== 'OK' || !infoData.result || infoData.result.length === 0) {
      throw new Error('Codeforces handle not found');
    }
    
    const user = infoData.result[0];
    
    // Fetch submissions to calculate unique solved count
    const statusUrl = `https://codeforces.com/api/user.status?handle=${handle}&from=1&count=5000`;
    const statusRes = await fetch(statusUrl);
    let solvedCount = 0;
    
    if (statusRes.status === 200) {
      const statusData = await statusRes.json();
      if (statusData.status === 'OK' && statusData.result) {
        const solvedProblems = new Set();
        statusData.result.forEach(sub => {
          if (sub.verdict === 'OK') {
            const pKey = `${sub.problem.contestId}-${sub.problem.index}`;
            solvedProblems.add(pKey);
          }
        });
        solvedCount = solvedProblems.size;
      }
    }
    
    return {
      rating: user.rating || 0,
      maxRating: user.maxRating || 0,
      rank: user.rank || 'unrated',
      solved: solvedCount
    };
  } catch (err) {
    throw new Error(err.message || 'Failed to fetch Codeforces statistics');
  }
};

exports.fetchCodeforcesHistory = async (handle) => {
  const historyMap = {};
  try {
    const statusUrl = `https://codeforces.com/api/user.status?handle=${handle}&from=1&count=5000`;
    const statusRes = await fetch(statusUrl);
    
    if (statusRes.status === 200) {
      const statusData = await statusRes.json();
      if (statusData.status === 'OK' && statusData.result) {
        const today = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setDate(today.getDate() - 365);
        
        statusData.result.forEach(sub => {
          const timestamp = sub.creationTimeSeconds * 1000;
          const date = new Date(timestamp);
          if (date >= oneYearAgo) {
            const dateStr = date.toISOString().split('T')[0];
            historyMap[dateStr] = (historyMap[dateStr] || 0) + 1;
          }
        });
      }
    }
  } catch (err) {
    console.error('Error fetching Codeforces calendar history:', err.message);
  }
  return historyMap;
};

exports.fetchCodeforcesRatingHistory = async (handle) => {
  try {
    const ratingUrl = `https://codeforces.com/api/user.rating?handle=${handle}`;
    const ratingRes = await fetch(ratingUrl);
    
    if (ratingRes.status === 200) {
      const ratingData = await ratingRes.json();
      if (ratingData.status === 'OK' && ratingData.result) {
        return ratingData.result.map(entry => ({
          name: entry.contestName.replace(/Codeforces Round |Div\. |Educational /g, '').slice(0, 15),
          rating: entry.newRating
        }));
      }
    }
  } catch (err) {
    console.error('Error fetching Codeforces rating history:', err.message);
  }
  return [];
};

exports.fetchCodeforcesRecentSubmissions = async (handle, count = 10) => {
  try {
    const statusUrl = `https://codeforces.com/api/user.status?handle=${handle}&from=1&count=${count}`;
    const statusRes = await fetch(statusUrl);
    
    if (statusRes.status === 200) {
      const statusData = await statusRes.json();
      if (statusData.status === 'OK' && statusData.result) {
        return statusData.result.map((sub, idx) => ({
          id: `codeforces-${sub.id}-${idx}`,
          problemName: sub.problem.name,
          language: sub.programmingLanguage,
          status: sub.verdict === 'OK' ? 'Accepted' : 'Wrong Answer',
          time: new Date(sub.creationTimeSeconds * 1000).toLocaleString(),
          runTime: sub.timeConsumedMillis !== undefined ? `${sub.timeConsumedMillis} ms` : 'N/A'
        }));
      }
    }
  } catch (err) {
    console.error('Error fetching Codeforces recent submissions:', err.message);
  }
  return [];
};


// ==========================
// CODECHEF PROFILE SCRAPER
// ==========================

exports.fetchCodeChefStats = async (handle) => {
  try {
    const url = `https://www.codechef.com/users/${handle}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    if (response.status !== 200) {
      throw new Error(`CodeChef handle not found (${response.status})`);
    }
    
    const html = await response.text();
    
    // Parse rating
    const ratingRegex = /<div class="rating-number">\s*(\d+)\s*<\/div>/;
    const ratingMatch = html.match(ratingRegex);
    const rating = ratingMatch ? parseInt(ratingMatch[1]) : 0;
    
    if (rating === 0) {
      throw new Error('Could not parse CodeChef user rating. Handle might be invalid.');
    }
    
    // Parse stars count
    const starsBlockRegex = /<div class="rating-star">([\s\S]*?)<\/div>/;
    const starsBlockMatch = html.match(starsBlockRegex);
    let stars = '1★';
    if (starsBlockMatch) {
      const starsMatch = starsBlockMatch[1].match(/&#9733;/g);
      if (starsMatch) {
        stars = `${starsMatch.length}★`;
      }
    }
    
    // Parse global rank
    const globalRankRegex = /<strong>\s*([0-9a-zA-Z]+)\s*<\/strong>\s*<\/a>\s*Global Rank/;
    const globalRankMatch = html.match(globalRankRegex);
    const globalRankStr = globalRankMatch ? globalRankMatch[1] : '0';
    const globalRank = isNaN(globalRankStr) ? 0 : parseInt(globalRankStr);
    
    // Parse unique solved count
    const sectionStart = html.indexOf('class="rating-data-section problems-solved"');
    const sectionEnd = html.indexOf('</section>', sectionStart);
    const sectionHtml = sectionStart !== -1 ? html.slice(sectionStart, sectionEnd) : '';
    
    const problemRegex = /style="font-size:\s*12px";?>\s*([^<]+?)\s*<\/span>/g;
    let match;
    const problems = new Set();
    while ((match = problemRegex.exec(sectionHtml)) !== null) {
      problems.add(match[1].trim());
    }
    
    return {
      rating,
      globalRank,
      stars,
      solved: problems.size
    };
  } catch (err) {
    throw new Error(err.message || 'Failed to fetch CodeChef statistics');
  }
};

exports.fetchCodeChefHistory = async (handle) => {
  const historyMap = {};
  try {
    const url = `https://www.codechef.com/users/${handle}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    if (response.status === 200) {
      const html = await response.text();
      const regex = /var\s+userDailySubmissionsStats\s*=\s*(\[[\s\S]*?\]);/;
      const match = html.match(regex);
      if (match) {
        try {
          const stats = JSON.parse(match[1]);
          stats.forEach(entry => {
            // entry.date format: YYYY-M-D
            const parts = entry.date.split('-');
            if (parts.length === 3) {
              const formattedDate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
              historyMap[formattedDate] = entry.value;
            }
          });
        } catch (e) {
          console.error('Failed to parse CodeChef userDailySubmissionsStats JSON');
        }
      }
    }
  } catch (err) {
    console.error('Error fetching CodeChef daily history:', err.message);
  }
  return historyMap;
};

exports.fetchCodeChefRatingHistory = async (handle) => {
  try {
    const url = `https://www.codechef.com/users/${handle}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    if (response.status === 200) {
      const html = await response.text();
      const ratingHistoryRegex = /"date_versus_rating"\s*:\s*(\{\s*"all"\s*:\s*\[[\s\S]*?\]\s*\})/;
      const match = html.match(ratingHistoryRegex);
      if (match) {
        const historyObj = JSON.parse(match[1]);
        if (historyObj && historyObj.all) {
          return historyObj.all.map(entry => ({
            name: entry.code.slice(0, 15),
            rating: parseInt(entry.rating)
          }));
        }
      }
    }
  } catch (err) {
    console.error('Error fetching CodeChef rating history:', err.message);
  }
  return [];
};

exports.fetchCodeChefRecentSubmissions = async (handle, count = 10) => {
  try {
    const url = `https://www.codechef.com/recent/user?page=0&user_handle=${handle}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    
    if (response.status === 200) {
      const data = await response.json();
      const html = data.content;
      if (!html) return [];
      
      const tbodyStart = html.indexOf('<tbody>');
      const tbodyEnd = html.indexOf('</tbody>');
      if (tbodyStart === -1 || tbodyEnd === -1) return [];
      const tbodyHtml = html.slice(tbodyStart + 7, tbodyEnd);
      
      const rows = tbodyHtml.split('</tr>').map(r => r.trim()).filter(Boolean);
      const parsedSubmissions = [];
      
      rows.slice(0, count).forEach((rowHtml, idx) => {
        const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/g;
        const tds = [];
        let tdMatch;
        while ((tdMatch = tdRegex.exec(rowHtml)) !== null) {
          tds.push(tdMatch[1].trim());
        }
        
        if (tds.length >= 4) {
          const timeMatch = tds[0].match(/class='tooltiptext'>([^<]+)/);
          const timeStr = timeMatch ? timeMatch[1].trim() : 'N/A';
          
          const probMatch = tds[1].match(/>([^<]+)<\/a>/);
          const problemName = probMatch ? probMatch[1].trim() : 'N/A';
          
          const isAccepted = tds[2].includes('accepted') || tds[2].includes('tick-icon.gif');
          const status = isAccepted ? 'Accepted' : 'Wrong Answer';
          
          const language = tds[3].replace(/<[^>]*>/g, '').trim();
          
          parsedSubmissions.push({
            id: `codechef-${idx}-${timeStr.replace(/\s+/g, '-')}`,
            problemName,
            language,
            status,
            time: timeStr,
            runTime: 'N/A'
          });
        }
      });
      return parsedSubmissions;
    }
  } catch (err) {
    console.error('Error fetching CodeChef recent submissions:', err.message);
  }
  return [];
};

exports.fetchUpcomingContests = async () => {
  const contests = [];

  // 1. LeetCode
  try {
    const url = 'https://leetcode.com/graphql';
    const query = {
      query: `
        query {
          upcomingContests {
            title
            startTime
            duration
            titleSlug
          }
        }
      `
    };
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query)
    });
    if (response.status === 200) {
      const data = await response.json();
      const list = data?.data?.upcomingContests || [];
      list.forEach(c => {
        contests.push({
          title: c.title,
          platform: 'leetcode',
          startTime: new Date(c.startTime * 1000).toISOString(),
          duration: c.duration,
          link: `https://leetcode.com/contest/${c.titleSlug}`
        });
      });
    }
  } catch (err) {
    console.error('Failed to fetch upcoming LeetCode contests:', err.message);
  }

  // 2. Codeforces
  try {
    const url = 'https://codeforces.com/api/contest.list?gym=false';
    const response = await fetch(url);
    if (response.status === 200) {
      const data = await response.json();
      if (data.status === 'OK' && data.result) {
        const upcoming = data.result.filter(c => c.phase === 'BEFORE');
        upcoming.forEach(c => {
          contests.push({
            title: c.name,
            platform: 'codeforces',
            startTime: new Date(c.startTimeSeconds * 1000).toISOString(),
            duration: c.durationSeconds,
            link: `https://codeforces.com/contests/${c.id}`
          });
        });
      }
    }
  } catch (err) {
    console.error('Failed to fetch upcoming Codeforces contests:', err.message);
  }

  // 3. CodeChef
  try {
    const url = 'https://www.codechef.com/api/list/contests/all?sortBy=start_date&sortOrder=asc';
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (response.status === 200) {
      const data = await response.json();
      const list = data.future_contests || [];
      list.forEach(c => {
        contests.push({
          title: c.contest_name,
          platform: 'codechef',
          startTime: c.contest_start_date_iso || new Date(c.contest_start_date).toISOString(),
          duration: parseInt(c.contest_duration) * 60, // CodeChef duration is in minutes
          link: `https://www.codechef.com/${c.contest_code}`
        });
      });
    }
  } catch (err) {
    console.error('Failed to fetch upcoming CodeChef contests:', err.message);
  }

  // Sort contests chronologically: nearest start time first
  contests.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  return contests;
};

