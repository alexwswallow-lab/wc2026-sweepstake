import { useState, useEffect, useCallback } from "react";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const ODDS_API_KEY = "bba1123f7488bfd41099d3997b55c426";
const FOOTBALL_API_KEY = "30a51344dfa9d253dfeba3f35bed440c";
const ODDS_CACHE_KEY = "wc2026_odds_cache";
const ODDS_CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 hours = 12x/day max

// ─── SWEEPSTAKE DATA ──────────────────────────────────────────────────────────
const teams = [
  { pot: 1, team: "Mexico",               group: "A", owner: "Pat Kiell" },
  { pot: 2, team: "South Korea",          group: "A", owner: "Charlie Button" },
  { pot: 3, team: "South Africa",         group: "A", owner: "Weronika Jarvis" },
  { pot: 4, team: "Czechia",              group: "A", owner: "Gavin Medhurst" },
  { pot: 1, team: "Canada",               group: "B", owner: "Philip Robinson" },
  { pot: 2, team: "Switzerland",          group: "B", owner: "Andressa Pires Granado" },
  { pot: 3, team: "Qatar",                group: "B", owner: "Paddy Corkery" },
  { pot: 4, team: "Bosnia & Herzegovina", group: "B", owner: "Chris Dobson" },
  { pot: 1, team: "Brazil",               group: "C", owner: "Jo Brigdale" },
  { pot: 2, team: "Morocco",              group: "C", owner: "Mike Rooney" },
  { pot: 3, team: "Scotland",             group: "C", owner: "Elliot Mawbey" },
  { pot: 4, team: "Haiti",                group: "C", owner: "Ashleigh Bentley" },
  { pot: 1, team: "USA",                  group: "D", owner: "Musa Chunge" },
  { pot: 2, team: "Australia",            group: "D", owner: "Lyndsey McPike" },
  { pot: 3, team: "Paraguay",             group: "D", owner: "Moiz Ul Fazal" },
  { pot: 4, team: "Turkey",               group: "D", owner: "Lilly Halliwell" },
  { pot: 1, team: "Germany",              group: "E", owner: "Alan Saleh" },
  { pot: 2, team: "Ecuador",              group: "E", owner: "James Turner" },
  { pot: 3, team: "Ivory Coast",          group: "E", owner: "Jade Darien" },
  { pot: 4, team: "Curacao",              group: "E", owner: "Harry Edwards" },
  { pot: 1, team: "Netherlands",          group: "F", owner: "Scott Ward" },
  { pot: 2, team: "Japan",                group: "F", owner: "Krunal Danani" },
  { pot: 3, team: "Tunisia",              group: "F", owner: "Jack Wright" },
  { pot: 4, team: "Sweden",               group: "F", owner: "Owain Gibby" },
  { pot: 1, team: "Belgium",              group: "G", owner: "Anthony Sawyers" },
  { pot: 2, team: "Iran",                 group: "G", owner: "David Hoskins" },
  { pot: 3, team: "Egypt",                group: "G", owner: "Paul Devitt" },
  { pot: 4, team: "New Zealand",          group: "G", owner: "Georgie Roy" },
  { pot: 1, team: "Spain",                group: "H", owner: "Duncan Evans" },
  { pot: 2, team: "Uruguay",              group: "H", owner: "Lewis Glock" },
  { pot: 3, team: "Saudi Arabia",         group: "H", owner: "Terri-Ann Sproston" },
  { pot: 4, team: "Cape Verde",           group: "H", owner: "Adrian Millward" },
  { pot: 1, team: "France",               group: "I", owner: "Nick Dawson" },
  { pot: 2, team: "Senegal",              group: "I", owner: "Rachel Ashman" },
  { pot: 3, team: "Norway",               group: "I", owner: "Jeremy Levy" },
  { pot: 4, team: "Iraq",                 group: "I", owner: "Povilas Jurevicius" },
  { pot: 1, team: "Argentina",            group: "J", owner: "Katie Weeds" },
  { pot: 2, team: "Austria",              group: "J", owner: "Mat Sherlock" },
  { pot: 3, team: "Algeria",              group: "J", owner: "Harry Cook" },
  { pot: 4, team: "Jordan",               group: "J", owner: "Marc Long" },
  { pot: 1, team: "Portugal",             group: "K", owner: "Alex Swallow" },
  { pot: 2, team: "Colombia",             group: "K", owner: "Chong Dong" },
  { pot: 3, team: "Uzbekistan",           group: "K", owner: "Lucas Katnoria" },
  { pot: 4, team: "DR Congo",             group: "K", owner: "Aidan Bowden Smith" },
  { pot: 1, team: "England",              group: "L", owner: "Cameron Gilmour" },
  { pot: 2, team: "Croatia",              group: "L", owner: "Luca Coogan" },
  { pot: 3, team: "Panama",               group: "L", owner: "Luke O'Neill" },
  { pot: 4, team: "Ghana",                group: "L", owner: "Raj Vyas" },
];

const players = [
  { id: 1,  name: "Mat Sherlock",           team: "Austria",              goalGuess: 294 },
  { id: 2,  name: "Alex Swallow",           team: "Portugal",             goalGuess: 322 },
  { id: 3,  name: "Pat Kiell",              team: "Mexico",               goalGuess: 276 },
  { id: 4,  name: "Harry Edwards",          team: "Curacao",              goalGuess: 333 },
  { id: 5,  name: "Luke O'Neill",           team: "Panama",               goalGuess: 260 },
  { id: 6,  name: "Musa Chunge",            team: "USA",                  goalGuess: 222 },
  { id: 7,  name: "Lyndsey McPike",         team: "Australia",            goalGuess: 285 },
  { id: 8,  name: "Nick Dawson",            team: "France",               goalGuess: 274 },
  { id: 9,  name: "Alan Saleh",             team: "Germany",              goalGuess: 298 },
  { id: 10, name: "Lilly Halliwell",        team: "Turkey",               goalGuess: 288 },
  { id: 11, name: "Jo Brigdale",            team: "Brazil",               goalGuess: 167 },
  { id: 12, name: "Lucas Katnoria",         team: "Uzbekistan",           goalGuess: 284 },
  { id: 13, name: "Aidan Bowden Smith",     team: "DR Congo",             goalGuess: 307 },
  { id: 14, name: "Paddy Corkery",          team: "Qatar",                goalGuess: 293 },
  { id: 15, name: "Duncan Evans",           team: "Spain",                goalGuess: 319 },
  { id: 16, name: "Owain Gibby",            team: "Sweden",               goalGuess: 278 },
  { id: 17, name: "Jeremy Levy",            team: "Norway",               goalGuess: 255 },
  { id: 18, name: "Jade Darien",            team: "Ivory Coast",          goalGuess: 150 },
  { id: 19, name: "James Turner",           team: "Ecuador",              goalGuess: 272 },
  { id: 20, name: "Marc Long",              team: "Jordan",               goalGuess: 281 },
  { id: 21, name: "Gavin Medhurst",         team: "Czechia",              goalGuess: 220 },
  { id: 22, name: "Mike Rooney",            team: "Morocco",              goalGuess: 291 },
  { id: 23, name: "David Hoskins",          team: "Iran",                 goalGuess: 271 },
  { id: 24, name: "Ashleigh Bentley",       team: "Haiti",                goalGuess: 184 },
  { id: 25, name: "Elliot Mawbey",          team: "Scotland",             goalGuess: 283 },
  { id: 26, name: "Andressa Pires Granado", team: "Switzerland",          goalGuess: 258 },
  { id: 27, name: "Philip Robinson",        team: "Canada",               goalGuess: 292 },
  { id: 28, name: "Terri-Ann Sproston",     team: "Saudi Arabia",         goalGuess: 259 },
  { id: 29, name: "Chong Dong",             team: "Colombia",             goalGuess: 310 },
  { id: 30, name: "Harry Cook",             team: "Algeria",              goalGuess: 213 },
  { id: 31, name: "Chris Dobson",           team: "Bosnia & Herzegovina", goalGuess: 297 },
  { id: 32, name: "Charlie Button",         team: "South Korea",          goalGuess: 255 },
  { id: 33, name: "Paul Devitt",            team: "Egypt",                goalGuess: 275 },
  { id: 34, name: "Jack Wright",            team: "Tunisia",              goalGuess: 264 },
  { id: 35, name: "Weronika Jarvis",        team: "South Africa",         goalGuess: 352 },
  { id: 36, name: "Rachel Ashman",          team: "Senegal",              goalGuess: 277 },
  { id: 37, name: "Adrian Millward",        team: "Cape Verde",           goalGuess: 189 },
  { id: 38, name: "Lewis Glock",            team: "Uruguay",              goalGuess: 280 },
  { id: 39, name: "Povilas Jurevicius",     team: "Iraq",                 goalGuess: 286 },
  { id: 40, name: "Cameron Gilmour",        team: "England",              goalGuess: 212 },
  { id: 41, name: "Luca Coogan",            team: "Croatia",              goalGuess: 246 },
  { id: 42, name: "Scott Ward",             team: "Netherlands",          goalGuess: 273 },
  { id: 43, name: "Georgie Roy",            team: "New Zealand",          goalGuess: 268 },
  { id: 44, name: "Anthony Sawyers",        team: "Belgium",              goalGuess: 289 },
  { id: 45, name: "Katie Weeds",            team: "Argentina",            goalGuess: 115 },
  { id: 46, name: "Moiz Ul Fazal",          team: "Paraguay",             goalGuess: 290 },
  { id: 47, name: "Krunal Danani",          team: "Japan",                goalGuess: 279 },
  { id: 48, name: "Raj Vyas",               team: "Ghana",                goalGuess: 287 },
];

// ─── NAME MATCHING HELPERS ────────────────────────────────────────────────────
// Maps API team names → our sweepstake names
const TEAM_NAME_MAP = {
  "England": "England", "France": "France", "Spain": "Spain", "Germany": "Germany",
  "Brazil": "Brazil", "Argentina": "Argentina", "Portugal": "Portugal",
  "Netherlands": "Netherlands", "Belgium": "Belgium", "USA": "USA",
  "United States": "USA", "Mexico": "Mexico", "Japan": "Japan",
  "South Korea": "South Korea", "Korea Republic": "South Korea",
  "Morocco": "Morocco", "Senegal": "Senegal", "Ecuador": "Ecuador",
  "Uruguay": "Uruguay", "Colombia": "Colombia", "Norway": "Norway",
  "Switzerland": "Switzerland", "Croatia": "Croatia", "Turkey": "Turkey",
  "Türkiye": "Turkey", "Australia": "Australia", "Canada": "Canada",
  "Sweden": "Sweden", "Austria": "Austria", "Scotland": "Scotland",
  "Egypt": "Egypt", "Iran": "Iran", "Ivory Coast": "Ivory Coast",
  "Côte d'Ivoire": "Ivory Coast", "Cote d'Ivoire": "Ivory Coast",
  "Ghana": "Ghana", "Tunisia": "Tunisia", "Saudi Arabia": "Saudi Arabia",
  "Qatar": "Qatar", "Paraguay": "Paraguay", "Algeria": "Algeria",
  "South Africa": "South Africa", "New Zealand": "New Zealand",
  "Panama": "Panama", "Bolivia": "Bolivia", "Iraq": "Iraq",
  "Jordan": "Jordan", "Cape Verde": "Cape Verde", "DR Congo": "DR Congo",
  "Congo DR": "DR Congo", "Bosnia": "Bosnia & Herzegovina",
  "Bosnia and Herzegovina": "Bosnia & Herzegovina",
  "Bosnia & Herzegovina": "Bosnia & Herzegovina",
  "Uzbekistan": "Uzbekistan", "Haiti": "Haiti", "Curacao": "Curacao",
  "Curaçao": "Curacao", "Czech Republic": "Czechia", "Czechia": "Czechia",
};

function normaliseTeam(name) {
  if (!name) return name;
  return TEAM_NAME_MAP[name] || name;
}

function findOwner(teamName) {
  const norm = normaliseTeam(teamName);
  const t = teams.find(t => t.team === norm);
  return t || null;
}

// ─── API HELPERS ──────────────────────────────────────────────────────────────
async function fetchFootball(endpoint) {
  const res = await fetch(`https://v3.football.api-sports.io${endpoint}`, {
    headers: { "x-apisports-key": FOOTBALL_API_KEY }
  });
  if (!res.ok) throw new Error(`API Football ${res.status}`);
  return res.json();
}

async function fetchOddsWithCache() {
  // Only fetch if cache is stale (>2hrs = max 12x/day)
  try {
    const cached = localStorage.getItem(ODDS_CACHE_KEY);
    if (cached) {
      const { ts, data } = JSON.parse(cached);
      if (Date.now() - ts < ODDS_CACHE_DURATION) {
        return { data, fromCache: true, cachedAt: new Date(ts) };
      }
    }
  } catch (e) {}

  const res = await fetch(
    `https://api.the-odds-api.com/v4/sports/soccer_fifa_world_cup/outrights/?apiKey=${ODDS_API_KEY}&regions=uk&markets=outrights&oddsFormat=decimal`
  );
  if (!res.ok) throw new Error(`Odds API ${res.status}`);
  const data = await res.json();

  try {
    localStorage.setItem(ODDS_CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch (e) {}

  return { data, fromCache: false, cachedAt: new Date() };
}

// Convert decimal odds → fractional string for display
function decimalToFractional(dec) {
  if (!dec) return "—";
  const frac = dec - 1;
  if (frac <= 0) return "EVS";
  // find a good fraction
  for (let d = 1; d <= 20; d++) {
    const n = Math.round(frac * d);
    if (Math.abs(n / d - frac) < 0.01) return `${n}/${d}`;
  }
  return `${Math.round(frac * 10)}/10`;
}

// ─── PRIZE CARD COMPONENT ─────────────────────────────────────────────────────
function PrizeCard({ title, prize, rule, leader, leaderTeam, leaderDetail, gradient, loading, error, badge }) {
  return (
    <div style={{ background: "#111e35", borderRadius: 12, overflow: "hidden", border: "1px solid #1e3a5f", display: "flex", flexDirection: "column" }}>
      <div style={{ background: gradient, padding: "12px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>{title}</span>
          <span style={{ background: "rgba(0,0,0,0.35)", color: "#fff", borderRadius: 20, padding: "2px 10px", fontSize: 14, fontWeight: 800, flexShrink: 0, marginLeft: 8 }}>{prize}</span>
        </div>
      </div>
      <div style={{ padding: "12px 16px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 10px", lineHeight: 1.5 }}>{rule}</p>
        <div style={{ background: "#0d1b2e", borderRadius: 8, padding: "10px 12px" }}>
          <div style={{ fontSize: 10, color: "#475569", marginBottom: 4, letterSpacing: 1, fontWeight: 700 }}>
            {badge || "CURRENT LEADER"}
          </div>
          {loading ? (
            <div style={{ color: "#3b82f6", fontSize: 12 }}>⏳ Loading live data…</div>
          ) : error ? (
            <div style={{ color: "#ef4444", fontSize: 12 }}>⚠️ {error}</div>
          ) : leader ? (
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9" }}>{leader}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3, flexWrap: "wrap" }}>
                {leaderTeam && <span style={{ fontSize: 13, color: "#94a3b8" }}>{leaderTeam}</span>}
                {leaderDetail && <span style={{ background: "#1e3a5f", borderRadius: 10, padding: "1px 8px", fontSize: 11, color: "#60a5fa" }}>{leaderDetail}</span>}
              </div>
            </div>
          ) : (
            <div style={{ color: "#475569", fontSize: 13, fontStyle: "italic" }}>No data yet</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("prizes");
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("All");

  // Live data state
  const [oddsData,       setOddsData]       = useState(null);
  const [oddsLoading,    setOddsLoading]    = useState(true);
  const [oddsError,      setOddsError]      = useState(null);
  const [oddsCachedAt,   setOddsCachedAt]   = useState(null);
  const [oddsFromCache,  setOddsFromCache]  = useState(false);

  const [standingsData,  setStandingsData]  = useState(null);
  const [standingsLoad,  setStandingsLoad]  = useState(true);
  const [standingsErr,   setStandingsErr]   = useState(null);

  const [fixturesData,   setFixturesData]   = useState(null);  // all R1 fixtures for red cards + goals
  const [fixturesLoad,   setFixturesLoad]   = useState(true);
  const [fixturesErr,    setFixturesErr]    = useState(null);

  // ── Load Odds API ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetchOddsWithCache()
      .then(({ data, fromCache, cachedAt }) => {
        setOddsData(data);
        setOddsFromCache(fromCache);
        setOddsCachedAt(cachedAt);
      })
      .catch(e => setOddsError(e.message))
      .finally(() => setOddsLoading(false));
  }, []);

  // ── Load API Football: standings + fixtures ────────────────────────────────
  useEffect(() => {
    // Standings (group tables)
    fetchFootball("/standings?league=1&season=2026")
      .then(d => setStandingsData(d))
      .catch(e => setStandingsErr(e.message))
      .finally(() => setStandingsLoad(false));

    // All group stage fixtures (for red cards, goals, discipline)
    fetchFootball("/fixtures?league=1&season=2026&round=Group+Stage&status=FT")
      .then(d => setFixturesData(d))
      .catch(e => setFixturesErr(e.message))
      .finally(() => setFixturesLoad(false));
  }, []);

  // ── Derive: Tournament Winner (lowest decimal odds from Odds API) ───────────
  const tournamentWinner = (() => {
    if (!oddsData || !Array.isArray(oddsData)) return null;
    // Odds API outrights: array of events, each with bookmakers > markets > outcomes
    let best = null;
    for (const event of oddsData) {
      for (const bm of (event.bookmakers || [])) {
        for (const mkt of (bm.markets || [])) {
          for (const outcome of (mkt.outcomes || [])) {
            const teamName = normaliseTeam(outcome.name);
            const entry = findOwner(teamName);
            if (!entry) continue;
            if (!best || outcome.price < best.price) {
              best = { teamName: entry.team, owner: entry.owner, price: outcome.price, bookmaker: bm.title };
            }
          }
        }
      }
    }
    return best;
  })();

  // ── Derive: Third Place (3rd lowest odds) ─────────────────────────────────
  const thirdPlace = (() => {
    if (!oddsData || !Array.isArray(oddsData)) return null;
    const seen = new Map();
    for (const event of oddsData) {
      for (const bm of (event.bookmakers || [])) {
        for (const mkt of (bm.markets || [])) {
          for (const outcome of (mkt.outcomes || [])) {
            const teamName = normaliseTeam(outcome.name);
            const entry = findOwner(teamName);
            if (!entry) continue;
            if (!seen.has(entry.team) || outcome.price < seen.get(entry.team).price) {
              seen.set(entry.team, { teamName: entry.team, owner: entry.owner, price: outcome.price });
            }
          }
        }
      }
    }
    const sorted = [...seen.values()].sort((a, b) => a.price - b.price);
    return sorted[2] || sorted[1] || null; // 3rd favourite
  })();

  // ── Derive: Pot 3 best (lowest odds among pot 3 teams) ───────────────────
  const pot3Best = (() => {
    if (!oddsData || !Array.isArray(oddsData)) return null;
    const pot3Names = new Set(teams.filter(t => t.pot === 3).map(t => t.team));
    const seen = new Map();
    for (const event of oddsData) {
      for (const bm of (event.bookmakers || [])) {
        for (const mkt of (bm.markets || [])) {
          for (const outcome of (mkt.outcomes || [])) {
            const teamName = normaliseTeam(outcome.name);
            if (!pot3Names.has(teamName)) continue;
            const entry = findOwner(teamName);
            if (!entry) continue;
            if (!seen.has(teamName) || outcome.price < seen.get(teamName).price) {
              seen.set(teamName, { teamName, owner: entry.owner, price: outcome.price });
            }
          }
        }
      }
    }
    if (seen.size === 0) return null;
    return [...seen.values()].sort((a, b) => a.price - b.price)[0];
  })();

  // ── Derive: Pot 4 best (lowest odds among pot 4 teams) ───────────────────
  const pot4Best = (() => {
    if (!oddsData || !Array.isArray(oddsData)) return null;
    const pot4Names = new Set(teams.filter(t => t.pot === 4).map(t => t.team));
    const seen = new Map();
    for (const event of oddsData) {
      for (const bm of (event.bookmakers || [])) {
        for (const mkt of (bm.markets || [])) {
          for (const outcome of (mkt.outcomes || [])) {
            const teamName = normaliseTeam(outcome.name);
            if (!pot4Names.has(teamName)) continue;
            const entry = findOwner(teamName);
            if (!entry) continue;
            if (!seen.has(teamName) || outcome.price < seen.get(teamName).price) {
              seen.set(teamName, { teamName, owner: entry.owner, price: outcome.price });
            }
          }
        }
      }
    }
    if (seen.size === 0) return null;
    return [...seen.values()].sort((a, b) => a.price - b.price)[0];
  })();

  // ── Derive: Worst group stage team (lowest pts → GD → GF) ────────────────
  const worstGroup = (() => {
    if (!standingsData) return null;
    const groups = standingsData?.response?.[0]?.league?.standings;
    if (!groups) return null;
    let worst = null;
    for (const group of groups) {
      for (const entry of group) {
        const pts = entry.points ?? 99;
        const gd  = entry.goalsDiff ?? 99;
        const gf  = entry.all?.goals?.for ?? 99;
        const teamName = normaliseTeam(entry.team?.name);
        const sweepEntry = findOwner(teamName);
        if (!sweepEntry) continue;
        if (!worst ||
            pts < worst.pts ||
            (pts === worst.pts && gd < worst.gd) ||
            (pts === worst.pts && gd === worst.gd && gf < worst.gf)) {
          worst = { teamName: sweepEntry.team, owner: sweepEntry.owner, pts, gd, gf, played: entry.all?.played };
        }
      }
    }
    return worst;
  })();

  // ── Derive: Worst disciplinary record (1pt yellow, 3pt red) ──────────────
  const worstDiscipline = (() => {
    if (!standingsData) return null;
    const groups = standingsData?.response?.[0]?.league?.standings;
    if (!groups) return null;
    // API Football standings include yellow/red cards per team
    let worst = null;
    for (const group of groups) {
      for (const entry of group) {
        const yellows = entry.cards?.yellow ?? 0;
        const reds    = entry.cards?.red    ?? 0;
        const score   = yellows * 1 + reds * 3;
        const teamName = normaliseTeam(entry.team?.name);
        const sweepEntry = findOwner(teamName);
        if (!sweepEntry) continue;
        if (!worst || score > worst.score) {
          worst = { teamName: sweepEntry.team, owner: sweepEntry.owner, score, yellows, reds };
        }
      }
    }
    return worst;
  })();

  // ── Derive: Earliest red card in R1 (by minute, not calendar) ─────────────
  const earliestRedCard = (() => {
    if (!fixturesData) return null;
    const fixtures = fixturesData?.response;
    if (!fixtures?.length) return null;
    let best = null;
    for (const fix of fixtures) {
      const events = fix.events || [];
      for (const ev of events) {
        if (ev.type !== "Card" || ev.detail !== "Red Card") continue;
        const minute = ev.time?.elapsed ?? 999;
        const extraTime = ev.time?.extra ?? 0;
        const totalMin = minute + (extraTime || 0);
        const teamName = normaliseTeam(ev.team?.name);
        const sweepEntry = findOwner(teamName);
        if (!sweepEntry) continue;
        if (!best || totalMin < best.totalMin) {
          best = {
            teamName: sweepEntry.team,
            owner: sweepEntry.owner,
            minute,
            extra: extraTime,
            totalMin,
            player: ev.player?.name,
            fixture: `${normaliseTeam(fix.teams?.home?.name)} vs ${normaliseTeam(fix.teams?.away?.name)}`,
          };
        }
      }
    }
    return best;
  })();

  // ── Derive: Total goals scored so far (for goals guess prize) ─────────────
  const totalGoalsSoFar = (() => {
    if (!fixturesData) return null;
    const fixtures = fixturesData?.response;
    if (!fixtures?.length) return 0;
    return fixtures.reduce((sum, fix) => {
      const home = fix.goals?.home ?? 0;
      const away = fix.goals?.away ?? 0;
      return sum + home + away;
    }, 0);
  })();

  const goalsLeader = (() => {
    if (totalGoalsSoFar === null) return null;
    const minDist = Math.min(...players.map(p => Math.abs(p.goalGuess - totalGoalsSoFar)));
    const leaders = players.filter(p => Math.abs(p.goalGuess - totalGoalsSoFar) === minDist);
    return { leaders, minDist, total: totalGoalsSoFar };
  })();

  // ─── Prize definitions ────────────────────────────────────────────────────
  const prizes = [
    {
      id: "winner",
      title: "🏆 Tournament Winner",
      prize: "£120",
      rule: "Team that wins the 2026 World Cup Final",
      gradient: "linear-gradient(135deg, #b45309, #92400e)",
      loading: oddsLoading,
      error: oddsError,
      leader: tournamentWinner?.owner,
      leaderTeam: tournamentWinner?.teamName,
      leaderDetail: tournamentWinner ? `${decimalToFractional(tournamentWinner.price)} (${tournamentWinner.bookmaker})` : null,
      badge: "CURRENT ODDS FAVOURITE",
    },
    {
      id: "third",
      title: "🥉 Third Place",
      prize: "£50",
      rule: "Winner of the 3rd place playoff",
      gradient: "linear-gradient(135deg, #c2410c, #9a3412)",
      loading: oddsLoading,
      error: oddsError,
      leader: thirdPlace?.owner,
      leaderTeam: thirdPlace?.teamName,
      leaderDetail: thirdPlace ? decimalToFractional(thirdPlace.price) : null,
      badge: "3RD FAVOURITE TO WIN",
    },
    {
      id: "redcard",
      title: "🟥 Earliest Red Card (R1)",
      prize: "£40",
      rule: "Earliest red card by minute in Round 1 (not calendar). Rolls to R2 if no R1 reds.",
      gradient: "linear-gradient(135deg, #b91c1c, #7f1d1d)",
      loading: fixturesLoad,
      error: fixturesErr,
      leader: earliestRedCard?.owner,
      leaderTeam: earliestRedCard?.teamName,
      leaderDetail: earliestRedCard
        ? `${earliestRedCard.player} — ${earliestRedCard.minute}'${earliestRedCard.extra ? `+${earliestRedCard.extra}` : ""} (${earliestRedCard.fixture})`
        : null,
      badge: "CURRENT LEADER",
    },
    {
      id: "shootout",
      title: "⚽ First Penalty Shootout Loss",
      prize: "£40",
      rule: "First team eliminated via penalty shootout in the knockouts",
      gradient: "linear-gradient(135deg, #1d4ed8, #1e3a8a)",
      loading: false,
      error: null,
      leader: null,
      leaderTeam: null,
      leaderDetail: "Knockouts not yet started",
      badge: "CURRENT LEADER",
    },
    {
      id: "worstgroup",
      title: "📉 Worst Group Stage Team",
      prize: "£40",
      rule: "Lowest pts → GD → GF across all group stage games",
      gradient: "linear-gradient(135deg, #374151, #1f2937)",
      loading: standingsLoad,
      error: standingsErr,
      leader: worstGroup?.owner,
      leaderTeam: worstGroup?.teamName,
      leaderDetail: worstGroup
        ? `${worstGroup.pts} pts, GD ${worstGroup.gd >= 0 ? "+" : ""}${worstGroup.gd}, GF ${worstGroup.gf} (${worstGroup.played} played)`
        : null,
      badge: "CURRENT WORST",
    },
    {
      id: "discipline",
      title: "🟨 Worst Disciplinary Record",
      prize: "£40",
      rule: "Group stage only — 1pt per yellow, 3pts per red card",
      gradient: "linear-gradient(135deg, #a16207, #713f12)",
      loading: standingsLoad,
      error: standingsErr,
      leader: worstDiscipline?.owner,
      leaderTeam: worstDiscipline?.teamName,
      leaderDetail: worstDiscipline
        ? `${worstDiscipline.score} pts — ${worstDiscipline.yellows}Y ${worstDiscipline.reds}R`
        : null,
      badge: "CURRENT WORST",
    },
    {
      id: "goals",
      title: "🎯 Closest Goals Guess",
      prize: "£70",
      rule: "Closest to total goals scored (shootout pens excluded). Shared if tied.",
      gradient: "linear-gradient(135deg, #15803d, #14532d)",
      loading: fixturesLoad,
      error: fixturesErr,
      leader: goalsLeader?.leaders?.map(l => l.name).join(" & "),
      leaderTeam: goalsLeader?.leaders?.map(l => l.goalGuess).join(" / ") + " goals guessed",
      leaderDetail: goalsLeader
        ? `${goalsLeader.total} goals scored so far · ±${goalsLeader.minDist} away`
        : null,
      badge: "CURRENT CLOSEST",
    },
    {
      id: "pot3",
      title: "⭐ Best Pot 3 Team",
      prize: "£40",
      rule: "Pot 3 team progressing furthest. Tiebreak: GD → GF → Group stage.",
      gradient: "linear-gradient(135deg, #7e22ce, #581c87)",
      loading: oddsLoading,
      error: oddsError,
      leader: pot3Best?.owner,
      leaderTeam: pot3Best?.teamName,
      leaderDetail: pot3Best ? `Best odds at ${decimalToFractional(pot3Best.price)}` : null,
      badge: "BEST ODDS (POT 3)",
    },
    {
      id: "pot4",
      title: "💎 Best Pot 4 Team",
      prize: "£40",
      rule: "Pot 4 team progressing furthest. Same tiebreak as Pot 3.",
      gradient: "linear-gradient(135deg, #be185d, #831843)",
      loading: oddsLoading,
      error: oddsError,
      leader: pot4Best?.owner,
      leaderTeam: pot4Best?.teamName,
      leaderDetail: pot4Best ? `Best odds at ${decimalToFractional(pot4Best.price)}` : null,
      badge: "BEST ODDS (POT 4)",
    },
  ];

  const groups = ["A","B","C","D","E","F","G","H","I","J","K","L"];
  const filteredTeams = teams.filter(t => {
    const s = search.toLowerCase();
    return (t.team.toLowerCase().includes(s) || t.owner.toLowerCase().includes(s))
      && (groupFilter === "All" || t.group === groupFilter);
  });

  const lastUpdated = oddsCachedAt
    ? `Odds ${oddsFromCache ? "cached" : "fetched"} ${oddsCachedAt.toLocaleTimeString()}`
    : "";

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: "#0a1628", minHeight: "100vh", color: "#e2e8f0" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1a3a6e 0%, #0d2040 100%)", padding: "20px 20px 14px", borderBottom: "2px solid #2d4a8a" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <span style={{ fontSize: 34 }}>🌍</span>
            <div style={{ flex: 1 }}>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#fff" }}>World Cup 2026 Sweepstake</h1>
              <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>48 players · £480 prize pool · USA / Canada / Mexico</p>
            </div>
            {lastUpdated && (
              <span style={{ fontSize: 11, color: "#475569", textAlign: "right" }}>{lastUpdated}</span>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            {[["prizes","🏅 Prizes"], ["teams","👥 Teams"], ["goals","🎯 Goals Guesses"]].map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)} style={{
                padding: "6px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13,
                background: tab === id ? "#3b82f6" : "rgba(255,255,255,0.1)",
                color: tab === id ? "#fff" : "#94a3b8",
              }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 16px" }}>

        {/* ── PRIZES TAB ── */}
        {tab === "prizes" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 14 }}>
              {prizes.map(p => <PrizeCard key={p.id} {...p} />)}
            </div>
            <div style={{ marginTop: 14, background: "#111e35", borderRadius: 10, padding: "10px 16px", border: "1px solid #1e3a5f", fontSize: 12, color: "#64748b" }}>
              <strong style={{ color: "#94a3b8" }}>ℹ️</strong> Live data via API-Football & The Odds API. Odds refresh max 12×/day (cached 2hrs). A team can win more than one prize.
            </div>
          </div>
        )}

        {/* ── TEAMS TAB ── */}
        {tab === "teams" && (
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
              <input
                placeholder="Search team or player…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ background: "#111e35", border: "1px solid #1e3a5f", borderRadius: 8, padding: "7px 12px", color: "#e2e8f0", fontSize: 13, width: 200 }}
              />
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {["All", ...groups].map(g => (
                  <button key={g} onClick={() => setGroupFilter(g)} style={{
                    padding: "5px 10px", borderRadius: 6, border: `1px solid ${groupFilter === g ? "#3b82f6" : "#1e3a5f"}`,
                    cursor: "pointer", fontSize: 12, fontWeight: 600,
                    background: groupFilter === g ? "#3b82f6" : "#111e35",
                    color: groupFilter === g ? "#fff" : "#64748b",
                  }}>
                    {g === "All" ? "All" : `Grp ${g}`}
                  </button>
                ))}
              </div>
            </div>
            {groupFilter === "All"
              ? groups.map(g => {
                  const gt = filteredTeams.filter(t => t.group === g);
                  if (!gt.length) return null;
                  return (
                    <div key={g} style={{ marginBottom: 18 }}>
                      <h3 style={{ margin: "0 0 8px", color: "#60a5fa", fontSize: 13, fontWeight: 700, letterSpacing: 1 }}>GROUP {g}</h3>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 7 }}>
                        {gt.map(t => <TeamCard key={t.team} t={t} oddsData={oddsData} />)}
                      </div>
                    </div>
                  );
                })
              : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 7 }}>
                  {filteredTeams.map(t => <TeamCard key={t.team} t={t} oddsData={oddsData} />)}
                </div>
              )
            }
          </div>
        )}

        {/* ── GOALS TAB ── */}
        {tab === "goals" && (
          <GoalsTab
            totalGoalsSoFar={totalGoalsSoFar}
            fixturesLoad={fixturesLoad}
            fixturesErr={fixturesErr}
          />
        )}
      </div>
    </div>
  );
}

// ─── TEAM CARD ────────────────────────────────────────────────────────────────
function TeamCard({ t, oddsData }) {
  // Pull live odds for this team from odds data
  const liveOdds = (() => {
    if (!oddsData || !Array.isArray(oddsData)) return null;
    let best = null;
    for (const event of oddsData) {
      for (const bm of (event.bookmakers || [])) {
        for (const mkt of (bm.markets || [])) {
          for (const outcome of (mkt.outcomes || [])) {
            const norm = normaliseTeam(outcome.name);
            if (norm === t.team) {
              if (!best || outcome.price < best) best = outcome.price;
            }
          }
        }
      }
    }
    return best;
  })();

  const potColours = {
    1: { bg: "#1e3a5f", text: "#60a5fa" },
    2: { bg: "#14532d", text: "#4ade80" },
    3: { bg: "#78350f", text: "#fbbf24" },
    4: { bg: "#4c1d95", text: "#c4b5fd" },
  };
  const pc = potColours[t.pot] || potColours[1];

  return (
    <div style={{ background: "#111e35", borderRadius: 10, padding: "11px 13px", border: "1px solid #1e3a5f", display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 26, height: 26, borderRadius: "50%", background: pc.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: pc.text, flexShrink: 0 }}>
        {t.pot}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: "#f1f5f9", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.team}</div>
        <div style={{ fontSize: 11, color: "#64748b" }}>{t.owner}</div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <span style={{ fontSize: 11, color: "#60a5fa", background: "#0d1b2e", padding: "2px 7px", borderRadius: 8, fontWeight: 600 }}>
          {liveOdds ? decimalToFractional(liveOdds) : "—"}
        </span>
        <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>Grp {t.group}</div>
      </div>
    </div>
  );
}

// ─── GOALS TAB ────────────────────────────────────────────────────────────────
function GoalsTab({ totalGoalsSoFar, fixturesLoad, fixturesErr }) {
  const [manualTotal, setManualTotal] = useState("");

  const effectiveTotal = manualTotal !== "" && !isNaN(parseInt(manualTotal))
    ? parseInt(manualTotal)
    : totalGoalsSoFar;

  const winner = effectiveTotal !== null && effectiveTotal !== undefined
    ? (() => {
        const minDist = Math.min(...players.map(p => Math.abs(p.goalGuess - effectiveTotal)));
        return {
          players: players.filter(p => Math.abs(p.goalGuess - effectiveTotal) === minDist),
          minDist,
        };
      })()
    : null;

  const guesses = [...players].sort((a, b) => a.goalGuess - b.goalGuess);

  return (
    <div>
      <div style={{ background: "#111e35", borderRadius: 10, padding: "14px 16px", marginBottom: 14, border: "1px solid #1e3a5f" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 11, color: "#475569", fontWeight: 700, letterSpacing: 1 }}>GOALS SCORED SO FAR (LIVE)</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: fixturesLoad ? "#3b82f6" : fixturesErr ? "#ef4444" : "#f1f5f9", marginTop: 2 }}>
              {fixturesLoad ? "…" : fixturesErr ? "ERR" : (totalGoalsSoFar ?? "0")}
            </div>
          </div>
          <div style={{ borderLeft: "1px solid #1e3a5f", paddingLeft: 16 }}>
            <div style={{ fontSize: 11, color: "#475569", fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>OVERRIDE (tournament end)</div>
            <input
              type="number"
              placeholder="Enter final total"
              value={manualTotal}
              onChange={e => setManualTotal(e.target.value)}
              style={{ background: "#0d1b2e", border: "1px solid #2d4a8a", borderRadius: 8, padding: "6px 10px", color: "#e2e8f0", fontSize: 14, width: 150 }}
            />
          </div>
          {winner && effectiveTotal !== null && (
            <div style={{ background: "linear-gradient(135deg, #166534, #14532d)", borderRadius: 8, padding: "8px 14px", border: "1px solid #16a34a" }}>
              <div style={{ fontSize: 11, color: "#4ade80", fontWeight: 700, marginBottom: 2 }}>
                {winner.players.length > 1 ? "🤝 SPLIT — £35 EACH" : "🏆 WINNER — £70"}
              </div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>
                {winner.players.map(p => `${p.name} (guessed ${p.goalGuess})`).join(" & ")}
              </div>
              <div style={{ color: "#4ade80", fontSize: 12, marginTop: 2 }}>±{winner.minDist} goals away from {effectiveTotal}</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ background: "#111e35", borderRadius: 10, border: "1px solid #1e3a5f", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#0d1b2e" }}>
              {["GUESS","PLAYER","TEAM","DISTANCE"].map((h, i) => (
                <th key={h} style={{ padding: "9px 12px", textAlign: i === 3 ? "right" : "left", fontSize: 10, color: "#64748b", fontWeight: 700, letterSpacing: 1 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {guesses.map((p, i) => {
              const isLeader = winner?.players.find(w => w.name === p.name);
              const dist = effectiveTotal !== null && effectiveTotal !== undefined
                ? Math.abs(p.goalGuess - effectiveTotal) : null;
              const isClose = dist !== null && dist <= 5;
              return (
                <tr key={p.id} style={{
                  borderTop: "1px solid #1e3a5f",
                  background: isLeader ? "rgba(22,101,52,0.25)" : "transparent",
                }}>
                  <td style={{ padding: "9px 12px", fontWeight: 700, fontSize: 15, color: isLeader ? "#4ade80" : "#60a5fa" }}>{p.goalGuess}</td>
                  <td style={{ padding: "9px 12px", fontSize: 13, color: isLeader ? "#4ade80" : "#f1f5f9", fontWeight: isLeader ? 700 : 400 }}>
                    {isLeader ? "🏆 " : ""}{p.name}
                  </td>
                  <td style={{ padding: "9px 12px", fontSize: 12, color: "#64748b" }}>{p.team}</td>
                  <td style={{ padding: "9px 12px", textAlign: "right", fontSize: 13,
                    color: dist === 0 ? "#4ade80" : isClose ? "#fbbf24" : "#475569",
                    fontWeight: isClose ? 700 : 400 }}>
                    {dist !== null ? (dist === 0 ? "✓ Exact!" : `±${dist}`) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
