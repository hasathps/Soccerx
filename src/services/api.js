import axios from 'axios';

// Sports API - TheSportsDB (Free, no API key needed)
const SPORTS_API_BASE = 'https://www.thesportsdb.com/api/v1/json/3';


// Auth API - DummyJSON
const AUTH_API_BASE = 'https://dummyjson.com';

// Sports API functions
export const sportsAPI = {
  // Get all leagues
  getAllLeagues: async () => {
    try {
      console.log('[API] Fetching all leagues from:', `${SPORTS_API_BASE}/all_leagues.php`);
      const response = await axios.get(`${SPORTS_API_BASE}/all_leagues.php`);
      console.log('[API] Leagues fetched successfully:', response.data?.leagues?.length || 0, 'leagues');
      return response.data.leagues || [];
    } catch (error) {
      console.error('===========================================');
      console.error('[API ERROR] Error fetching leagues:');
      console.error('URL:', `${SPORTS_API_BASE}/all_leagues.php`);
      console.error('Error Message:', error.message);
      console.error('Error Response:', error.response?.data);
      console.error('Error Status:', error.response?.status);
      console.error('Error Headers:', error.response?.headers);
      console.error('Full Error:', JSON.stringify(error, null, 2));
      console.error('Stack Trace:', error.stack);
      console.error('===========================================');
      return [];
    }
  },

  // Get events by league (matches)
  getEventsByLeague: async (leagueId) => {
    try {
      const url = `${SPORTS_API_BASE}/eventsseason.php?id=${leagueId}&s=2024`;
      console.log('[API] Fetching events by league:', leagueId, 'from:', url);
      const response = await axios.get(url);
      console.log('[API] Events fetched successfully:', response.data?.events?.length || 0, 'events');
      return response.data.events || [];
    } catch (error) {
      console.error('===========================================');
      console.error('[API ERROR] Error fetching events by league:');
      console.error('League ID:', leagueId);
      console.error('URL:', `${SPORTS_API_BASE}/eventsseason.php?id=${leagueId}&s=2024`);
      console.error('Error Message:', error.message);
      console.error('Error Response:', error.response?.data);
      console.error('Error Status:', error.response?.status);
      console.error('Full Error:', JSON.stringify(error, null, 2));
      console.error('Stack Trace:', error.stack);
      console.error('===========================================');
      return [];
    }
  },

  // Get upcoming events
  getUpcomingEvents: async (leagueId) => {
    try {
      const url = `${SPORTS_API_BASE}/eventsnextleague.php?id=${leagueId}`;
      console.log('[API] Fetching upcoming events for league:', leagueId, 'from:', url);
      const response = await axios.get(url);
      console.log('[API] Upcoming events fetched:', response.data?.events?.length || 0, 'events');
      return response.data.events || [];
    } catch (error) {
      console.error('===========================================');
      console.error('[API ERROR] Error fetching upcoming events:');
      console.error('League ID:', leagueId);
      console.error('URL:', `${SPORTS_API_BASE}/eventsnextleague.php?id=${leagueId}`);
      console.error('Error Message:', error.message);
      console.error('Error Response:', error.response?.data);
      console.error('Error Status:', error.response?.status);
      console.error('Full Error:', JSON.stringify(error, null, 2));
      console.error('Stack Trace:', error.stack);
      console.error('===========================================');
      return [];
    }
  },

  // Get live/ongoing events (matches currently in progress)
  getLiveEvents: async (leagueId) => {
    try {
      const url = `${SPORTS_API_BASE}/livescore.php?l=${leagueId}`;
      console.log('[API] Fetching live events for league:', leagueId, 'from:', url);
      const response = await axios.get(url);
      console.log('[API] Live events fetched:', response.data?.events?.length || 0, 'live events');
      return response.data.events || [];
    } catch (error) {
      console.error('===========================================');
      console.error('[API ERROR] Error fetching live events:');
      console.error('League ID:', leagueId);
      console.error('URL:', `${SPORTS_API_BASE}/livescore.php?l=${leagueId}`);
      console.error('Error Message:', error.message);
      console.error('Error Response:', error.response?.data);
      console.error('Error Status:', error.response?.status);
      console.error('Full Error:', JSON.stringify(error, null, 2));
      console.error('Stack Trace:', error.stack);
      console.error('===========================================');
      return [];
    }
  },

  // Get all live events across all leagues
  getAllLiveEvents: async () => {
    try {
      const url = `${SPORTS_API_BASE}/livescore.php`;
      console.log('[API] Fetching all live events from:', url);
      const response = await axios.get(url);
      console.log('[API] All live events fetched:', response.data?.events?.length || 0, 'live events');
      return response.data.events || [];
    } catch (error) {
      console.error('===========================================');
      console.error('[API ERROR] Error fetching all live events:');
      console.error('URL:', `${SPORTS_API_BASE}/livescore.php`);
      console.error('Error Message:', error.message);
      console.error('Error Response:', error.response?.data);
      console.error('Error Status:', error.response?.status);
      console.error('Full Error:', JSON.stringify(error, null, 2));
      console.error('Stack Trace:', error.stack);
      console.error('===========================================');
      return [];
    }
  },

  // Get event details
  getEventDetails: async (eventId) => {
    try {
      const url = `${SPORTS_API_BASE}/lookupevent.php?id=${eventId}`;
      console.log('[API] Fetching event details for event:', eventId, 'from:', url);
      const response = await axios.get(url);
      console.log('[API] Event details fetched:', response.data?.events?.[0] ? 'Success' : 'No data');
      return response.data.events?.[0] || null;
    } catch (error) {
      console.error('===========================================');
      console.error('[API ERROR] Error fetching event details:');
      console.error('Event ID:', eventId);
      console.error('URL:', `${SPORTS_API_BASE}/lookupevent.php?id=${eventId}`);
      console.error('Error Message:', error.message);
      console.error('Error Response:', error.response?.data);
      console.error('Error Status:', error.response?.status);
      console.error('Full Error:', JSON.stringify(error, null, 2));
      console.error('Stack Trace:', error.stack);
      console.error('===========================================');
      return null;
    }
  },

  // Get teams in a league
  getTeamsByLeague: async (leagueId) => {
    try {
      const url = `${SPORTS_API_BASE}/lookup_all_teams.php?id=${leagueId}`;
      console.log('[API] Fetching teams for league:', leagueId, 'from:', url);
      const response = await axios.get(url);
      console.log('[API] Teams fetched:', response.data?.teams?.length || 0, 'teams');
      return response.data.teams || [];
    } catch (error) {
      console.error('===========================================');
      console.error('[API ERROR] Error fetching teams:');
      console.error('League ID:', leagueId);
      console.error('URL:', url);
      console.error('Error Message:', error.message);
      console.error('Error Response:', error.response?.data);
      console.error('Error Status:', error.response?.status);
      console.error('Full Error:', JSON.stringify(error, null, 2));
      console.error('Stack Trace:', error.stack);
      console.error('===========================================');
      return [];
    }
  },

  // Get players by team
  getPlayersByTeam: async (teamId) => {
    try {
      const url = `${SPORTS_API_BASE}/lookup_all_players.php?id=${teamId}`;
      console.log('[API] Fetching players for team:', teamId, 'from:', url);
      const response = await axios.get(url);
      console.log('[API] Players fetched:', response.data?.player?.length || 0, 'players');
      return response.data.player || [];
    } catch (error) {
      console.error('===========================================');
      console.error('[API ERROR] Error fetching players:');
      console.error('Team ID:', teamId);
      console.error('URL:', url);
      console.error('Error Message:', error.message);
      console.error('Error Response:', error.response?.data);
      console.error('Error Status:', error.response?.status);
      console.error('Full Error:', JSON.stringify(error, null, 2));
      console.error('Stack Trace:', error.stack);
      console.error('===========================================');
      return [];
    }
  },

  // Search events
  searchEvents: async (query) => {
    try {
      const url = `${SPORTS_API_BASE}/searchevents.php?e=${encodeURIComponent(query)}`;
      console.log('[API] Searching events with query:', query, 'from:', url);
      const response = await axios.get(url);
      console.log('[API] Search results:', response.data?.event?.length || 0, 'events found');
      return response.data.event || [];
    } catch (error) {
      console.error('===========================================');
      console.error('[API ERROR] Error searching events:');
      console.error('Search Query:', query);
      console.error('URL:', url);
      console.error('Error Message:', error.message);
      console.error('Error Response:', error.response?.data);
      console.error('Error Status:', error.response?.status);
      console.error('Full Error:', JSON.stringify(error, null, 2));
      console.error('Stack Trace:', error.stack);
      console.error('===========================================');
      return [];
    }
  },

  // Get player details by player ID
  getPlayerDetails: async (playerId) => {
    try {
      const url = `${SPORTS_API_BASE}/lookupplayer.php?id=${playerId}`;
      console.log('[API] Fetching player details for player:', playerId, 'from:', url);
      const response = await axios.get(url);
      console.log('[API] Player details fetched:', response.data?.players?.[0] ? 'Success' : 'No data');
      return response.data.players?.[0] || null;
    } catch (error) {
      console.error('===========================================');
      console.error('[API ERROR] Error fetching player details:');
      console.error('Player ID:', playerId);
      console.error('URL:', `${SPORTS_API_BASE}/lookupplayer.php?id=${playerId}`);
      console.error('Error Message:', error.message);
      console.error('Error Response:', error.response?.data);
      console.error('Error Status:', error.response?.status);
      console.error('Full Error:', JSON.stringify(error, null, 2));
      console.error('Stack Trace:', error.stack);
      console.error('===========================================');
      return null;
    }
  },

  // Search players by name
  searchPlayers: async (playerName) => {
    try {
      const url = `${SPORTS_API_BASE}/searchplayers.php?p=${encodeURIComponent(playerName)}`;
      console.log('[API] Searching players with query:', playerName, 'from:', url);
      const response = await axios.get(url);
      console.log('[API] Player search results:', response.data?.player?.length || 0, 'players found');
      return response.data.player || [];
    } catch (error) {
      console.error('===========================================');
      console.error('[API ERROR] Error searching players:');
      console.error('Search Query:', playerName);
      console.error('URL:', url);
      console.error('Error Message:', error.message);
      console.error('Error Response:', error.response?.data);
      console.error('Error Status:', error.response?.status);
      console.error('Full Error:', JSON.stringify(error, null, 2));
      console.error('Stack Trace:', error.stack);
      console.error('===========================================');
      return [];
    }
  },

  // Get team details by team ID
  getTeamDetails: async (teamId) => {
    try {
      const url = `${SPORTS_API_BASE}/lookupteam.php?id=${teamId}`;
      console.log('[API] Fetching team details for team:', teamId, 'from:', url);
      const response = await axios.get(url);
      console.log('[API] Team details fetched:', response.data?.teams?.[0] ? 'Success' : 'No data');
      return response.data.teams?.[0] || null;
    } catch (error) {
      console.error('===========================================');
      console.error('[API ERROR] Error fetching team details:');
      console.error('Team ID:', teamId);
      console.error('URL:', `${SPORTS_API_BASE}/lookupteam.php?id=${teamId}`);
      console.error('Error Message:', error.message);
      console.error('Error Response:', error.response?.data);
      console.error('Error Status:', error.response?.status);
      console.error('Full Error:', JSON.stringify(error, null, 2));
      console.error('Stack Trace:', error.stack);
      console.error('===========================================');
      return null;
    }
  },

  // Search teams by name
  searchTeams: async (teamName) => {
    try {
      const url = `${SPORTS_API_BASE}/searchteams.php?t=${encodeURIComponent(teamName)}`;
      console.log('[API] Searching teams with query:', teamName, 'from:', url);
      const response = await axios.get(url);
      console.log('[API] Team search results:', response.data?.teams?.length || 0, 'teams found');
      return response.data.teams || [];
    } catch (error) {
      console.error('===========================================');
      console.error('[API ERROR] Error searching teams:');
      console.error('Search Query:', teamName);
      console.error('URL:', url);
      console.error('Error Message:', error.message);
      console.error('Error Response:', error.response?.data);
      console.error('Error Status:', error.response?.status);
      console.error('Full Error:', JSON.stringify(error, null, 2));
      console.error('Stack Trace:', error.stack);
      console.error('===========================================');
      return [];
    }
  },

  // Get league table/standings
  getLeagueTable: async (leagueId) => {
    try {
      const url = `${SPORTS_API_BASE}/lookuptable.php?l=${leagueId}&s=2024-2025`;
      console.log('[API] Fetching league table for league:', leagueId, 'from:', url);
      const response = await axios.get(url);
      console.log('[API] League table fetched:', response.data?.table?.length || 0, 'teams');
      return response.data.table || [];
    } catch (error) {
      console.error('===========================================');
      console.error('[API ERROR] Error fetching league table:');
      console.error('League ID:', leagueId);
      console.error('URL:', `${SPORTS_API_BASE}/lookuptable.php?l=${leagueId}&s=2024-2025`);
      console.error('Error Message:', error.message);
      console.error('Error Response:', error.response?.data);
      console.error('Error Status:', error.response?.status);
      console.error('Full Error:', JSON.stringify(error, null, 2));
      console.error('Stack Trace:', error.stack);
      console.error('===========================================');
      return [];
    }
  },

  // Get league details
  getLeagueDetails: async (leagueId) => {
    try {
      const url = `${SPORTS_API_BASE}/lookupleague.php?id=${leagueId}`;
      console.log('[API] Fetching league details for league:', leagueId, 'from:', url);
      const response = await axios.get(url);
      console.log('[API] League details fetched:', response.data?.leagues?.[0] ? 'Success' : 'No data');
      return response.data.leagues?.[0] || null;
    } catch (error) {
      console.error('===========================================');
      console.error('[API ERROR] Error fetching league details:');
      console.error('League ID:', leagueId);
      console.error('URL:', `${SPORTS_API_BASE}/lookupleague.php?id=${leagueId}`);
      console.error('Error Message:', error.message);
      console.error('Error Response:', error.response?.data);
      console.error('Error Status:', error.response?.status);
      console.error('Full Error:', JSON.stringify(error, null, 2));
      console.error('Stack Trace:', error.stack);
      console.error('===========================================');
      return null;
    }
  },

  // Get past events/results
  getPastEvents: async (leagueId, season = '2024-2025') => {
    try {
      const url = `${SPORTS_API_BASE}/eventsseason.php?id=${leagueId}&s=${season}`;
      console.log('[API] Fetching past events for league:', leagueId, 'season:', season, 'from:', url);
      const response = await axios.get(url);
      console.log('[API] Past events fetched:', response.data?.events?.length || 0, 'events');
      return response.data.events || [];
    } catch (error) {
      console.error('===========================================');
      console.error('[API ERROR] Error fetching past events:');
      console.error('League ID:', leagueId);
      console.error('Season:', season);
      console.error('URL:', url);
      console.error('Error Message:', error.message);
      console.error('Error Response:', error.response?.data);
      console.error('Error Status:', error.response?.status);
      console.error('Full Error:', JSON.stringify(error, null, 2));
      console.error('Stack Trace:', error.stack);
      console.error('===========================================');
      return [];
    }
  },

};

// Mock authentication for testing (fallback if API fails)
const mockUsers = {
  'kminchelle': { password: '0lelplR', id: 15, firstName: 'Jeanne', lastName: 'Halvorson', email: 'kminchelle@qq.com' },
  'demo': { password: 'demo123', id: 1, firstName: 'Demo', lastName: 'User', email: 'demo@example.com' },
  'test': { password: 'test123', id: 2, firstName: 'Test', lastName: 'User', email: 'test@example.com' },
};

const mockLogin = (username, password) => {
  console.log('[AUTH API] Using MOCK authentication (fallback mode)');
  const user = mockUsers[username];
  
  if (user && user.password === password) {
    console.log('[AUTH API] Mock login successful!');
    return {
      id: user.id,
      username: username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      token: `mock_token_${user.id}_${Date.now()}`,
    };
  }
  
  throw new Error('Invalid credentials');
};

// Auth API functions
export const authAPI = {
  login: async (username, password) => {
    try {
      const url = `${AUTH_API_BASE}/auth/login`;
      const requestData = { username, password };
      console.log('[AUTH API] Attempting login for user:', username);
      console.log('[AUTH API] Login URL:', url);
      console.log('[AUTH API] Request data:', { username, password: '***' });
      
      const response = await axios.post(url, requestData);
      
      console.log('[AUTH API] Login successful!');
      console.log('[AUTH API] Response status:', response.status);
      console.log('[AUTH API] User ID:', response.data?.id);
      console.log('[AUTH API] Token received:', response.data?.token ? 'Yes' : 'No');
      
      return response.data;
    } catch (error) {
      // Silently try mock authentication as fallback
      console.log('[AUTH API] DummyJSON API failed, trying mock authentication fallback...');
      try {
        const mockResponse = mockLogin(username, password);
        console.log('[AUTH API] ✅ Mock authentication successful! Using fallback mode.');
        return mockResponse;
      } catch (mockError) {
        // Only log detailed errors if mock auth also fails
        console.error('===========================================');
        console.error('[AUTH API ERROR] Both DummyJSON and Mock authentication failed');
        console.error('Username:', username);
        console.error('URL:', `${AUTH_API_BASE}/auth/login`);
        console.error('Error Message:', error.message);
        console.error('Error Response Data:', error.response?.data);
        console.error('Error Status:', error.response?.status);
        console.error('Error Status Text:', error.response?.statusText);
        console.error('Request Config:', error.config ? {
          url: error.config.url,
          method: error.config.method,
          headers: error.config.headers,
        } : 'N/A');
        console.error('Full Error Object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        console.error('Stack Trace:', error.stack);
        console.error('===========================================');
        throw error;
      }
    }
  },

  register: async (userData) => {
    try {
      const url = `${AUTH_API_BASE}/users/add`;
      console.log('[AUTH API] Attempting registration for user:', userData.username);
      console.log('[AUTH API] Register URL:', url);
      console.log('[AUTH API] Registration data:', {
        ...userData,
        password: '***',
      });
      
      const response = await axios.post(url, {
        ...userData,
      });
      
      console.log('[AUTH API] Registration successful!');
      console.log('[AUTH API] Response status:', response.status);
      console.log('[AUTH API] New User ID:', response.data?.id);
      
      return response.data;
    } catch (error) {
      console.error('===========================================');
      console.error('[AUTH API ERROR] Registration failed:');
      console.error('Username:', userData.username);
      console.error('Email:', userData.email);
      console.error('URL:', url);
      console.error('Error Message:', error.message);
      console.error('Error Response Data:', error.response?.data);
      console.error('Error Status:', error.response?.status);
      console.error('Error Status Text:', error.response?.statusText);
      console.error('Error Headers:', error.response?.headers);
      console.error('Request Config:', error.config ? {
        url: error.config.url,
        method: error.config.method,
        data: { ...error.config.data, password: '***' },
      } : 'N/A');
      console.error('Full Error Object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      console.error('Stack Trace:', error.stack);
      console.error('===========================================');
      throw error;
    }
  },
};

