import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Feather } from 'react-native-feather';
import { sportsAPI } from '../services/api';
import { addFavorite, removeFavorite } from '../store/slices/favoritesSlice';
import MatchCard from '../components/MatchCard';

export default function FootballScreen({ navigation }) {
  const dispatch = useDispatch();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const favorites = useSelector((state) => state.favorites.favorites);
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    console.log('===========================================');
    console.log('[FOOTBALL SCREEN] Starting to load football matches...');
    try {
      setLoading(true);
      console.log('[FOOTBALL SCREEN] Fetching all leagues from API...');
      const leagues = await sportsAPI.getAllLeagues();
      console.log('[FOOTBALL SCREEN] Leagues received:', leagues?.length || 0, 'leagues');
      
      // Get matches from popular football leagues
      console.log('[FOOTBALL SCREEN] Filtering popular football leagues...');
      const footballLeagues = leagues
        .filter((league) => 
          league.strSport === 'Soccer' && 
          ['4328', '4335', '4331', '4332'].includes(league.idLeague)
        )
        .slice(0, 4);
      console.log('[FOOTBALL SCREEN] Football leagues found:', footballLeagues.length);

      let allMatches = [];
      
      console.log('[FOOTBALL SCREEN] Fetching events for each league...');
      for (const league of footballLeagues) {
        try {
          console.log('[FOOTBALL SCREEN] Fetching events for league:', league.idLeague, '-', league.strLeague);
          const events = await sportsAPI.getUpcomingEvents(league.idLeague);
          console.log('[FOOTBALL SCREEN] Events received for league', league.idLeague, ':', events?.length || 0, 'events');
          console.log('[FOOTBALL SCREEN] ✅ DATA SOURCE: REAL API (TheSportsDB)');
          
          // Log first event to see what fields API returns
          if (events && events.length > 0) {
            console.log('[FOOTBALL SCREEN] Sample event fields:', Object.keys(events[0]));
            console.log('[FOOTBALL SCREEN] Sample event dateEvent:', events[0].dateEvent);
            console.log('[FOOTBALL SCREEN] Sample event strTime:', events[0].strTime);
            console.log('[FOOTBALL SCREEN] Sample event dateEventLocal:', events[0].dateEventLocal);
            console.log('[FOOTBALL SCREEN] Sample event strTimestamp:', events[0].strTimestamp);
          }
          
          // Add league info to each match and fetch team logos
          const eventsWithLeague = await Promise.all(
            events.slice(0, 5).map(async (event) => {
              const matchWithLeague = {
                ...event,
                strSport: 'Soccer',
                strLeagueFull: league.strLeague,
              };
              
              // Ensure date and time are preserved
              if (event.dateEvent) {
                matchWithLeague.dateEvent = event.dateEvent;
              }
              if (event.strTime) {
                matchWithLeague.strTime = event.strTime;
              }
              if (event.dateEventLocal) {
                matchWithLeague.dateEventLocal = event.dateEventLocal;
              }

              // Fetch team logos if team IDs are available
              if (event.idHomeTeam && !matchWithLeague.strHomeTeamBadge) {
                try {
                  const homeTeam = await sportsAPI.getTeamDetails(event.idHomeTeam);
                  if (homeTeam?.strTeamBadge) {
                    matchWithLeague.strHomeTeamBadge = homeTeam.strTeamBadge;
                  }
                } catch (error) {
                  console.log('[FOOTBALL SCREEN] Could not fetch home team logo:', error.message);
                }
              }

              if (event.idAwayTeam && !matchWithLeague.strAwayTeamBadge) {
                try {
                  const awayTeam = await sportsAPI.getTeamDetails(event.idAwayTeam);
                  if (awayTeam?.strTeamBadge) {
                    matchWithLeague.strAwayTeamBadge = awayTeam.strTeamBadge;
                  }
                } catch (error) {
                  console.log('[FOOTBALL SCREEN] Could not fetch away team logo:', error.message);
                }
              }

              return matchWithLeague;
            })
          );
          
          allMatches = [...allMatches, ...eventsWithLeague];
          console.log('[FOOTBALL SCREEN] Total matches so far:', allMatches.length);
        } catch (leagueError) {
          console.error('[FOOTBALL SCREEN ERROR] Error fetching events for league', league.idLeague, ':');
          console.error('[FOOTBALL SCREEN ERROR] League error message:', leagueError.message);
        }
      }

      console.log('[FOOTBALL SCREEN] Total matches fetched from API:', allMatches.length);

      // Remove duplicate matches
      const uniqueMatches = [];
      const seenIds = new Set();
      for (const match of allMatches) {
        const matchId = match.idEvent || match.id;
        if (matchId && !seenIds.has(matchId)) {
          seenIds.add(matchId);
          uniqueMatches.push(match);
        } else if (!matchId) {
          uniqueMatches.push(match);
        }
      }
      console.log('[FOOTBALL SCREEN] After deduplication:', uniqueMatches.length, 'unique matches');
      allMatches = uniqueMatches;

      // Log date/time info for first few matches
      if (allMatches.length > 0) {
        console.log('[FOOTBALL SCREEN] Checking date/time in matches...');
        allMatches.slice(0, 3).forEach((match, index) => {
          console.log(`[FOOTBALL SCREEN] Match ${index + 1}:`, {
            idEvent: match.idEvent,
            strHomeTeam: match.strHomeTeam,
            strAwayTeam: match.strAwayTeam,
            dateEvent: match.dateEvent,
            strTime: match.strTime,
            dateEventLocal: match.dateEventLocal,
            strTimestamp: match.strTimestamp,
          });
        });
      }

      // If no matches found, use sample data
      if (allMatches.length === 0) {
        console.warn('[FOOTBALL SCREEN] ⚠️ No matches found from API, using MOCK/SAMPLE data');
        allMatches = getSampleMatches();
        console.log('[FOOTBALL SCREEN] Sample matches created:', allMatches.length, 'matches');
      } else {
        console.log('[FOOTBALL SCREEN] ✅ Using REAL API data (not mock data)');
      }

      setMatches(allMatches);
      console.log('[FOOTBALL SCREEN] Matches loaded successfully! Total:', allMatches.length);
    } catch (error) {
      console.error('===========================================');
      console.error('[FOOTBALL SCREEN ERROR] Error loading matches!');
      console.error('[FOOTBALL SCREEN ERROR] Error type:', error.constructor.name);
      console.error('[FOOTBALL SCREEN ERROR] Error message:', error.message);
      console.error('===========================================');
      const sampleMatches = getSampleMatches();
      setMatches(sampleMatches);
      console.log('[FOOTBALL SCREEN] Sample matches set:', sampleMatches.length, 'matches');
    } finally {
      setLoading(false);
      setRefreshing(false);
      console.log('[FOOTBALL SCREEN] Loading completed');
      console.log('===========================================');
    }
  };

  const getSampleMatches = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const futureDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const futureTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const futureTimeStr = `${String(futureTime.getHours()).padStart(2, '0')}:${String(futureTime.getMinutes()).padStart(2, '0')}`;
    
    const futureTime2 = new Date(now.getTime() + 26 * 60 * 60 * 1000);
    const futureTimeStr2 = `${String(futureTime2.getHours()).padStart(2, '0')}:${String(futureTime2.getMinutes()).padStart(2, '0')}`;
    
    const pastTime = '15:30';
    const pastTime2 = '18:00';

    return [
      // LIVE MATCH - Shows pulsing dot, animated scores
      {
        idEvent: '1',
        strEvent: 'Manchester United vs Liverpool',
        strLeague: 'Premier League',
        strSport: 'Soccer',
        strLeagueFull: 'Premier League',
        dateEvent: today,
        strTime: '15:00',
        strHomeTeam: 'Manchester United',
        strAwayTeam: 'Liverpool',
        strStatus: 'Live',
        intHomeScore: 2,
        intAwayScore: 1,
        strHomeScore: '2',
        strAwayScore: '1',
        strProgress: "67'",
        strThumb: 'https://www.thesportsdb.com/images/media/event/thumb/abc123.jpg',
        strHomeTeamBadge: 'https://www.thesportsdb.com/images/media/team/badge/manchester-united.png',
        strAwayTeamBadge: 'https://www.thesportsdb.com/images/media/team/badge/liverpool.png',
      },
      // FINISHED MATCH - Shows FT badge, final scores (yesterday's match)
      {
        idEvent: '2',
        strEvent: 'Barcelona vs Real Madrid',
        strLeague: 'La Liga',
        strSport: 'Soccer',
        strLeagueFull: 'La Liga',
        dateEvent: yesterday,
        strTime: pastTime,
        strHomeTeam: 'Barcelona',
        strAwayTeam: 'Real Madrid',
        strStatus: 'Finished',
        intHomeScore: 3,
        intAwayScore: 2,
        strHomeScore: '3',
        strAwayScore: '2',
        strThumb: 'https://www.thesportsdb.com/images/media/event/thumb/def456.jpg',
        strHomeTeamBadge: 'https://www.thesportsdb.com/images/media/team/badge/barcelona.png',
        strAwayTeamBadge: 'https://www.thesportsdb.com/images/media/team/badge/real-madrid.png',
      },
      // UPCOMING MATCH - Shows countdown timer
      {
        idEvent: '3',
        strEvent: 'Arsenal vs Chelsea',
        strLeague: 'Premier League',
        strSport: 'Soccer',
        strLeagueFull: 'Premier League',
        dateEvent: tomorrow,
        strTime: futureTimeStr2,
        strHomeTeam: 'Arsenal',
        strAwayTeam: 'Chelsea',
        strStatus: 'Not Started',
        strThumb: 'https://www.thesportsdb.com/images/media/event/thumb/ghi789.jpg',
        strHomeTeamBadge: 'https://www.thesportsdb.com/images/media/team/badge/arsenal.png',
        strAwayTeamBadge: 'https://www.thesportsdb.com/images/media/team/badge/chelsea.png',
      },
      // LIVE MATCH - Second Half
      {
        idEvent: '4',
        strEvent: 'Bayern Munich vs Borussia Dortmund',
        strLeague: 'Bundesliga',
        strSport: 'Soccer',
        strLeagueFull: 'Bundesliga',
        dateEvent: today,
        strTime: '16:30',
        strHomeTeam: 'Bayern Munich',
        strAwayTeam: 'Borussia Dortmund',
        strStatus: '2H',
        intHomeScore: 1,
        intAwayScore: 1,
        strHomeScore: '1',
        strAwayScore: '1',
        strProgress: "78'",
        strThumb: 'https://www.thesportsdb.com/images/media/event/thumb/jkl012.jpg',
        strHomeTeamBadge: 'https://www.thesportsdb.com/images/media/team/badge/bayern-munich.png',
        strAwayTeamBadge: 'https://www.thesportsdb.com/images/media/team/badge/borussia-dortmund.png',
      },
      // POSTPONED MATCH - Shows PP badge
      {
        idEvent: '5',
        strEvent: 'PSG vs Marseille',
        strLeague: 'Ligue 1',
        strSport: 'Soccer',
        strLeagueFull: 'Ligue 1',
        dateEvent: tomorrow,
        strTime: '19:00',
        strHomeTeam: 'PSG',
        strAwayTeam: 'Marseille',
        strStatus: 'Postponed',
        strThumb: 'https://www.thesportsdb.com/images/media/event/thumb/mno345.jpg',
        strHomeTeamBadge: 'https://www.thesportsdb.com/images/media/team/badge/psg.png',
        strAwayTeamBadge: 'https://www.thesportsdb.com/images/media/team/badge/marseille.png',
      },
      // UPCOMING MATCH - Shows countdown (few hours from now)
      {
        idEvent: '6',
        strEvent: 'AC Milan vs Inter Milan',
        strLeague: 'Serie A',
        strSport: 'Soccer',
        strLeagueFull: 'Serie A',
        dateEvent: today,
        strTime: futureTimeStr,
        strHomeTeam: 'AC Milan',
        strAwayTeam: 'Inter Milan',
        strStatus: 'Not Started',
        strThumb: 'https://www.thesportsdb.com/images/media/event/thumb/pqr678.jpg',
        strHomeTeamBadge: 'https://www.thesportsdb.com/images/media/team/badge/ac-milan.png',
        strAwayTeamBadge: 'https://www.thesportsdb.com/images/media/team/badge/inter-milan.png',
      },
      // FINISHED MATCH - High scoring (yesterday)
      {
        idEvent: '7',
        strEvent: 'Manchester City vs Tottenham',
        strLeague: 'Premier League',
        strSport: 'Soccer',
        strLeagueFull: 'Premier League',
        dateEvent: yesterday,
        strTime: pastTime2,
        strHomeTeam: 'Manchester City',
        strAwayTeam: 'Tottenham',
        strStatus: 'FT',
        intHomeScore: 4,
        intAwayScore: 0,
        strHomeScore: '4',
        strAwayScore: '0',
        strThumb: 'https://www.thesportsdb.com/images/media/event/thumb/stu901.jpg',
        strHomeTeamBadge: 'https://www.thesportsdb.com/images/media/team/badge/manchester-city.png',
        strAwayTeamBadge: 'https://www.thesportsdb.com/images/media/team/badge/tottenham.png',
      },
      // LIVE MATCH - First Half
      {
        idEvent: '8',
        strEvent: 'Juventus vs Roma',
        strLeague: 'Serie A',
        strSport: 'Soccer',
        strLeagueFull: 'Serie A',
        dateEvent: today,
        strTime: '17:00',
        strHomeTeam: 'Juventus',
        strAwayTeam: 'Roma',
        strStatus: '1H',
        intHomeScore: 0,
        intAwayScore: 0,
        strHomeScore: '0',
        strAwayScore: '0',
        strProgress: "32'",
        strThumb: 'https://www.thesportsdb.com/images/media/event/thumb/vwx234.jpg',
        strHomeTeamBadge: 'https://www.thesportsdb.com/images/media/team/badge/juventus.png',
        strAwayTeamBadge: 'https://www.thesportsdb.com/images/media/team/badge/roma.png',
      },
    ];
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMatches();
  };

  const isFavorite = (matchId) => {
    return favorites.some((fav) => (fav.idEvent || fav.id) === matchId);
  };

  const toggleFavorite = (match) => {
    const matchId = match.idEvent || match.id;
    if (isFavorite(matchId)) {
      dispatch(removeFavorite(matchId));
    } else {
      dispatch(addFavorite(match));
    }
  };

  const styles = getStyles(isDarkMode);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={isDarkMode ? '#87CEEB' : '#1F509A'} />
        <Text style={styles.loadingText}>Loading football matches...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={matches}
        keyExtractor={(item, index) => {
          const matchId = item.idEvent?.toString() || item.id?.toString() || '';
          return `${matchId}_${item.dateEvent || ''}_${item.strHomeTeam || ''}_${item.strAwayTeam || ''}_${index}`;
        }}
        renderItem={({ item }) => (
          <MatchCard
            match={item}
            isFavorite={isFavorite(item.idEvent || item.id)}
            onPress={() => navigation.navigate('Details', { match: item })}
            onFavoritePress={() => toggleFavorite(item)}
            isDarkMode={isDarkMode}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>
              Welcome, {user?.firstName || 'User'}!
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="inbox" size={64} color={isDarkMode ? '#666' : '#999'} />
            <Text style={styles.emptyText}>No football matches available</Text>
          </View>
        }
      />
    </View>
  );
}

const getStyles = (isDarkMode) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#121212' : '#f5f5f5',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#121212' : '#f5f5f5',
    },
    loadingText: {
      marginTop: 10,
      color: isDarkMode ? '#999' : '#666',
    },
    list: {
      padding: 15,
    },
    welcomeContainer: {
      paddingVertical: 16,
      paddingHorizontal: 4,
      marginBottom: 8,
    },
    welcomeText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDarkMode ? '#fff' : '#333',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
    },
    emptyText: {
      marginTop: 16,
      fontSize: 16,
      color: isDarkMode ? '#666' : '#999',
    },
  });

