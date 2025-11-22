import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Feather } from 'react-native-feather';
import { sportsAPI } from '../services/api';
import { addFavorite, removeFavorite } from '../store/slices/favoritesSlice';
import { toggleTheme } from '../store/slices/themeSlice';
import { logout } from '../store/slices/authSlice';
import MatchCard from '../components/MatchCard';

export default function HomeScreen({ navigation }) {
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
    console.log('[HOME SCREEN] Starting to load matches...');
    try {
      setLoading(true);
      console.log('[HOME SCREEN] Loading state set to true');
      
      // Get popular leagues first (Premier League, La Liga, etc.)
      console.log('[HOME SCREEN] Fetching all leagues from API...');
      const leagues = await sportsAPI.getAllLeagues();
      console.log('[HOME SCREEN] Leagues received:', leagues?.length || 0, 'leagues');
      console.log('[HOME SCREEN] First few leagues:', leagues?.slice(0, 3).map(l => ({ id: l.idLeague, name: l.strLeague })));
      
      // Get matches from popular football leagues
      console.log('[HOME SCREEN] Filtering popular football leagues...');
      const footballLeagues = leagues
        .filter((league) => 
          league.strSport === 'Soccer' && 
          ['4328', '4335', '4331', '4332'].includes(league.idLeague)
        )
        .slice(0, 4);
      console.log('[HOME SCREEN] Football leagues found:', footballLeagues.length);
      console.log('[HOME SCREEN] Football leagues:', footballLeagues.map(l => ({ id: l.idLeague, name: l.strLeague })));

      // Use only football leagues
      const popularLeagues = footballLeagues;
      console.log('[HOME SCREEN] Total popular leagues:', popularLeagues.length);

      let allMatches = [];
      
      console.log('[HOME SCREEN] Fetching events for each league...');
      for (const league of popularLeagues) {
        try {
          console.log('[HOME SCREEN] Fetching events for league:', league.idLeague, '-', league.strLeague, '(' + league.strSport + ')');
          const events = await sportsAPI.getUpcomingEvents(league.idLeague);
          console.log('[HOME SCREEN] Events received for league', league.idLeague, ':', events?.length || 0, 'events');
          
          // Add league info to each match for better display
          const eventsWithLeague = events.map(event => ({
            ...event,
            strSport: league.strSport,
            strLeagueFull: league.strLeague,
          }));
          
          allMatches = [...allMatches, ...eventsWithLeague.slice(0, 5)];
          console.log('[HOME SCREEN] Total matches so far:', allMatches.length);
        } catch (leagueError) {
          console.error('[HOME SCREEN ERROR] Error fetching events for league', league.idLeague, ':');
          console.error('[HOME SCREEN ERROR] League error message:', leagueError.message);
          console.error('[HOME SCREEN ERROR] League error stack:', leagueError.stack);
          // Continue with next league
        }
      }

      console.log('[HOME SCREEN] Total matches fetched from API:', allMatches.length);

      // Remove duplicate matches based on idEvent
      const uniqueMatches = [];
      const seenIds = new Set();
      for (const match of allMatches) {
        const matchId = match.idEvent || match.id;
        if (matchId && !seenIds.has(matchId)) {
          seenIds.add(matchId);
          uniqueMatches.push(match);
        } else if (!matchId) {
          // If no ID, include it anyway (will use index in keyExtractor)
          uniqueMatches.push(match);
        }
      }
      console.log('[HOME SCREEN] After deduplication:', uniqueMatches.length, 'unique matches (removed', allMatches.length - uniqueMatches.length, 'duplicates)');
      allMatches = uniqueMatches;

      // If no matches found, use sample data
      if (allMatches.length === 0) {
        console.warn('[HOME SCREEN] No matches found from API, using sample data');
        allMatches = getSampleMatches();
        console.log('[HOME SCREEN] Sample matches created:', allMatches.length, 'matches');
      }

      console.log('[HOME SCREEN] Setting matches in state...');
      setMatches(allMatches);
      console.log('[HOME SCREEN] Matches loaded successfully! Total:', allMatches.length);
    } catch (error) {
      console.error('===========================================');
      console.error('[HOME SCREEN ERROR] Error loading matches!');
      console.error('[HOME SCREEN ERROR] Error type:', error.constructor.name);
      console.error('[HOME SCREEN ERROR] Error message:', error.message);
      console.error('[HOME SCREEN ERROR] Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      console.error('[HOME SCREEN ERROR] Stack trace:', error.stack);
      console.error('===========================================');
      // Use sample data on error
      console.log('[HOME SCREEN] Using sample data due to error');
      const sampleMatches = getSampleMatches();
      setMatches(sampleMatches);
      console.log('[HOME SCREEN] Sample matches set:', sampleMatches.length, 'matches');
    } finally {
      setLoading(false);
      setRefreshing(false);
      console.log('[HOME SCREEN] Loading and refreshing states set to false');
      console.log('===========================================');
    }
  };

  const getSampleMatches = () => {
    return [
      // Football matches
      {
        idEvent: '1',
        strEvent: 'Manchester United vs Liverpool',
        strLeague: 'Premier League',
        strSport: 'Soccer',
        strLeagueFull: 'Premier League',
        dateEvent: '2024-12-15',
        strTime: '15:00',
        strHomeTeam: 'Manchester United',
        strAwayTeam: 'Liverpool',
        strStatus: 'Not Started',
        strThumb: 'https://www.thesportsdb.com/images/media/event/thumb/abc123.jpg',
        strHomeTeamBadge: 'https://www.thesportsdb.com/images/media/team/badge/manchester-united.png',
        strAwayTeamBadge: 'https://www.thesportsdb.com/images/media/team/badge/liverpool.png',
      },
      {
        idEvent: '2',
        strEvent: 'Barcelona vs Real Madrid',
        strLeague: 'La Liga',
        strSport: 'Soccer',
        strLeagueFull: 'La Liga',
        dateEvent: '2024-12-16',
        strTime: '20:00',
        strHomeTeam: 'Barcelona',
        strAwayTeam: 'Real Madrid',
        strStatus: 'Not Started',
        strThumb: 'https://www.thesportsdb.com/images/media/event/thumb/def456.jpg',
        strHomeTeamBadge: 'https://www.thesportsdb.com/images/media/team/badge/barcelona.png',
        strAwayTeamBadge: 'https://www.thesportsdb.com/images/media/team/badge/real-madrid.png',
      },
      {
        idEvent: '3',
        strEvent: 'Arsenal vs Chelsea',
        strLeague: 'Premier League',
        strSport: 'Soccer',
        strLeagueFull: 'Premier League',
        dateEvent: '2024-12-17',
        strTime: '17:30',
        strHomeTeam: 'Arsenal',
        strAwayTeam: 'Chelsea',
        strStatus: 'Not Started',
        strThumb: 'https://www.thesportsdb.com/images/media/event/thumb/ghi789.jpg',
        strHomeTeamBadge: 'https://www.thesportsdb.com/images/media/team/badge/arsenal.png',
        strAwayTeamBadge: 'https://www.thesportsdb.com/images/media/team/badge/chelsea.png',
      },
    ];
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMatches();
  };

  const isFavorite = (matchId) => {
    const result = favorites.some((fav) => (fav.idEvent || fav.id) === matchId);
    console.log('[HOME SCREEN] Checking if favorite. Match ID:', matchId, 'Is favorite:', result);
    return result;
  };

  const toggleFavorite = (match) => {
    const matchId = match.idEvent || match.id;
    console.log('[HOME SCREEN] Toggle favorite called. Match ID:', matchId);
    console.log('[HOME SCREEN] Match data:', { idEvent: match.idEvent, id: match.id, name: match.strEvent });
    
    if (isFavorite(matchId)) {
      console.log('[HOME SCREEN] Removing from favorites...');
      dispatch(removeFavorite(matchId));
    } else {
      console.log('[HOME SCREEN] Adding to favorites...');
      dispatch(addFavorite(match));
    }
  };

  const handleLogout = () => {
    console.log('[HOME SCREEN] Logout button pressed');
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => console.log('[HOME SCREEN] Logout cancelled'),
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            console.log('[HOME SCREEN] Logout confirmed, dispatching logout action...');
            dispatch(logout());
            console.log('[HOME SCREEN] Logout action dispatched');
          },
        },
      ],
      { cancelable: true }
    );
  };

  const styles = getStyles(isDarkMode);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={isDarkMode ? '#87CEEB' : '#1F509A'} />
        <Text style={styles.loadingText}>Loading matches...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft} />
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.themeButton}
            onPress={() => dispatch(toggleTheme())}
          >
            <Feather
              name={isDarkMode ? 'sun' : 'moon'}
              size={20}
              color={isDarkMode ? '#fff' : '#333'}
            />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={matches}
        keyExtractor={(item, index) => {
          // Create unique key by combining idEvent with other unique fields and index
          const matchId = item.idEvent?.toString() || item.id?.toString() || '';
          const uniqueKey = `${matchId}_${item.dateEvent || ''}_${item.strHomeTeam || ''}_${item.strAwayTeam || ''}_${index}`;
          return uniqueKey;
        }}
        renderItem={({ item }) => (
          <MatchCard
            match={item}
            isFavorite={isFavorite(item.idEvent)}
            onPress={() => navigation.navigate('Details', { match: item })}
            onFavoritePress={() => toggleFavorite(item)}
            isDarkMode={isDarkMode}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="inbox" size={64} color={isDarkMode ? '#666' : '#999'} />
            <Text style={styles.emptyText}>No matches available</Text>
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
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? '#333' : '#e0e0e0',
    },
    headerLeft: {
      flex: 1,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    themeButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: isDarkMode ? '#1a1a1a' : '#e3f2fd',
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 8,
      paddingHorizontal: 12,
      borderRadius: 20,
      backgroundColor: isDarkMode ? '#1a1a1a' : '#ffebee',
      gap: 6,
    },
    logoutText: {
      color: '#f44336',
      fontSize: 14,
      fontWeight: '600',
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

