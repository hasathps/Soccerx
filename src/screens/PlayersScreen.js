import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useSelector } from 'react-redux';
import { sportsAPI } from '../services/api';
import PlayerCard from '../components/PlayerCard';

export default function PlayersScreen({ navigation }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    console.log('===========================================');
    console.log('[PLAYERS SCREEN] Starting to load players...');
    try {
      setLoading(true);
      
      // Get players from popular football teams
      console.log('[PLAYERS SCREEN] Fetching popular teams...');
      const popularTeamIds = ['133602', '133615', '133616', '133617']; // Arsenal, Chelsea, Liverpool, Manchester United
      let allPlayers = [];

      for (const teamId of popularTeamIds) {
        try {
          console.log('[PLAYERS SCREEN] Fetching players for team:', teamId);
          const teamPlayers = await sportsAPI.getPlayersByTeam(teamId);
          console.log('[PLAYERS SCREEN] Players received for team', teamId, ':', teamPlayers?.length || 0, 'players');
          
          if (teamPlayers && teamPlayers.length > 0) {
            allPlayers = [...allPlayers, ...teamPlayers.slice(0, 10)];
          }
        } catch (teamError) {
          console.error('[PLAYERS SCREEN ERROR] Error fetching players for team', teamId, ':');
          console.error('[PLAYERS SCREEN ERROR] Team error message:', teamError.message);
        }
      }

      console.log('[PLAYERS SCREEN] Total players fetched from API:', allPlayers.length);

      // Remove duplicate players
      const uniquePlayers = [];
      const seenIds = new Set();
      for (const player of allPlayers) {
        const playerId = player.idPlayer || player.id;
        if (playerId && !seenIds.has(playerId)) {
          seenIds.add(playerId);
          uniquePlayers.push(player);
        } else if (!playerId) {
          uniquePlayers.push(player);
        }
      }
      console.log('[PLAYERS SCREEN] After deduplication:', uniquePlayers.length, 'unique players');
      allPlayers = uniquePlayers;

      // If no players found, use sample data
      if (allPlayers.length === 0) {
        console.warn('[PLAYERS SCREEN] No players found from API, using sample data');
        allPlayers = getSamplePlayers();
        console.log('[PLAYERS SCREEN] Sample players created:', allPlayers.length, 'players');
      }

      setPlayers(allPlayers);
      console.log('[PLAYERS SCREEN] Players loaded successfully! Total:', allPlayers.length);
    } catch (error) {
      console.error('===========================================');
      console.error('[PLAYERS SCREEN ERROR] Error loading players!');
      console.error('[PLAYERS SCREEN ERROR] Error type:', error.constructor.name);
      console.error('[PLAYERS SCREEN ERROR] Error message:', error.message);
      console.error('===========================================');
      const samplePlayers = getSamplePlayers();
      setPlayers(samplePlayers);
      console.log('[PLAYERS SCREEN] Sample players set:', samplePlayers.length, 'players');
    } finally {
      setLoading(false);
      setRefreshing(false);
      console.log('[PLAYERS SCREEN] Loading completed');
      console.log('===========================================');
    }
  };

  const getSamplePlayers = () => {
    return [
      {
        idPlayer: '1',
        strPlayer: 'Lionel Messi',
        strPosition: 'Forward',
        strNationality: 'Argentina',
        strTeam: 'Inter Miami',
        strThumb: 'https://www.thesportsdb.com/images/media/player/thumb/messi.jpg',
        strFlag: 'https://www.thesportsdb.com/images/flags/ar.png',
      },
      {
        idPlayer: '2',
        strPlayer: 'Cristiano Ronaldo',
        strPosition: 'Forward',
        strNationality: 'Portugal',
        strTeam: 'Al Nassr',
        strThumb: 'https://www.thesportsdb.com/images/media/player/thumb/ronaldo.jpg',
        strFlag: 'https://www.thesportsdb.com/images/flags/pt.png',
      },
      {
        idPlayer: '3',
        strPlayer: 'Kylian Mbappé',
        strPosition: 'Forward',
        strNationality: 'France',
        strTeam: 'Paris Saint-Germain',
        strThumb: 'https://www.thesportsdb.com/images/media/player/thumb/mbappe.jpg',
        strFlag: 'https://www.thesportsdb.com/images/flags/fr.png',
      },
    ];
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (query.trim().length === 0) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    if (query.trim().length < 2) {
      return;
    }

    console.log('[PLAYERS SCREEN] Searching players with query:', query);
    setIsSearching(true);
    
    try {
      const results = await sportsAPI.searchPlayers(query);
      console.log('[PLAYERS SCREEN] Search results:', results?.length || 0, 'players found');
      setSearchResults(results || []);
    } catch (error) {
      console.error('[PLAYERS SCREEN ERROR] Error searching players:');
      console.error('[PLAYERS SCREEN ERROR] Error message:', error.message);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setSearchQuery('');
    setSearchResults([]);
    loadPlayers();
  };

  const displayPlayers = searchQuery.trim().length > 0 ? searchResults : players;
  const showEmptyState = !loading && displayPlayers.length === 0;

  const styles = getStyles(isDarkMode);

  if (loading && players.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={isDarkMode ? '#87CEEB' : '#1F509A'} />
        <Text style={styles.loadingText}>Loading players...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search players..."
          placeholderTextColor={isDarkMode ? '#666' : '#999'}
          value={searchQuery}
          onChangeText={handleSearch}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              setSearchQuery('');
              setSearchResults([]);
            }}
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={displayPlayers}
        keyExtractor={(item, index) => {
          const playerId = item.idPlayer?.toString() || item.id?.toString() || '';
          return `player_${playerId}_${item.strPlayer || ''}_${index}`;
        }}
        renderItem={({ item }) => (
          <PlayerCard
            player={item}
            onPress={() => navigation.navigate('PlayerDetails', { player: item })}
            isDarkMode={isDarkMode}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          showEmptyState ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery.trim().length > 0
                  ? 'No players found'
                  : 'No players available'}
              </Text>
              {searchQuery.trim().length === 0 && (
                <Text style={styles.emptySubtext}>
                  Pull down to refresh
                </Text>
              )}
            </View>
          ) : null
        }
        ListFooterComponent={
          isSearching ? (
            <View style={styles.searchingContainer}>
              <ActivityIndicator size="small" color={isDarkMode ? '#87CEEB' : '#1F509A'} />
              <Text style={styles.searchingText}>Searching...</Text>
            </View>
          ) : null
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
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: isDarkMode ? '#1a1a1a' : '#fff',
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? '#333' : '#e0e0e0',
    },
    searchInput: {
      flex: 1,
      height: 40,
      backgroundColor: isDarkMode ? '#2a2a2a' : '#f0f0f0',
      borderRadius: 20,
      paddingHorizontal: 16,
      color: isDarkMode ? '#fff' : '#333',
      fontSize: 14,
    },
    clearButton: {
      marginLeft: 8,
      padding: 8,
    },
    clearButtonText: {
      fontSize: 18,
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
      fontSize: 16,
      color: isDarkMode ? '#666' : '#999',
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 14,
      color: isDarkMode ? '#555' : '#999',
    },
    searchingContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      gap: 10,
    },
    searchingText: {
      fontSize: 14,
      color: isDarkMode ? '#999' : '#666',
    },
  });

