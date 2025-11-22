import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addFavorite, removeFavorite } from '../store/slices/favoritesSlice';
import { sportsAPI } from '../services/api';

export default function DetailsScreen({ route, navigation }) {
  console.log('[DETAILS SCREEN] Component rendering...');
  const { match } = route.params;
  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.favorites.favorites);
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  const [homeTeamPlayers, setHomeTeamPlayers] = useState([]);
  const [awayTeamPlayers, setAwayTeamPlayers] = useState([]);
  const [loadingSquads, setLoadingSquads] = useState(false);

  console.log('[DETAILS SCREEN] Match data:', {
    idEvent: match.idEvent,
    id: match.id,
    event: match.strEvent,
    homeTeam: match.strHomeTeam,
    awayTeam: match.strAwayTeam,
  });
  console.log('[DETAILS SCREEN] Favorites count:', favorites?.length || 0);

  const matchId = match.idEvent || match.id;
  const isFavorite = favorites.some((fav) => (fav.idEvent || fav.id) === matchId);
  
  console.log('[DETAILS SCREEN] Is favorite:', isFavorite);
  console.log('[DETAILS SCREEN] Dark mode:', isDarkMode);

  useEffect(() => {
    loadTeamSquads();
  }, [match]);

  const loadTeamSquads = async () => {
    console.log('[DETAILS SCREEN] Loading team squads...');
    setLoadingSquads(true);

    try {
      const homeTeamName = match.strHomeTeam;
      const awayTeamName = match.strAwayTeam;
      const homeTeamId = match.idHomeTeam || match.idHomeTeam;
      const awayTeamId = match.idAwayTeam || match.idAwayTeam;

      console.log('[DETAILS SCREEN] Home team:', homeTeamName, 'ID:', homeTeamId);
      console.log('[DETAILS SCREEN] Away team:', awayTeamName, 'ID:', awayTeamId);

      // Fetch squads for both teams
      const [homeSquad, awaySquad] = await Promise.all([
        fetchTeamSquad(homeTeamId, homeTeamName),
        fetchTeamSquad(awayTeamId, awayTeamName),
      ]);

      setHomeTeamPlayers(homeSquad || []);
      setAwayTeamPlayers(awaySquad || []);

      console.log('[DETAILS SCREEN] Home squad loaded:', homeSquad?.length || 0, 'players');
      console.log('[DETAILS SCREEN] Away squad loaded:', awaySquad?.length || 0, 'players');
    } catch (error) {
      console.error('[DETAILS SCREEN ERROR] Error loading squads:');
      console.error('[DETAILS SCREEN ERROR] Error message:', error.message);
      setHomeTeamPlayers([]);
      setAwayTeamPlayers([]);
    } finally {
      setLoadingSquads(false);
    }
  };

  const fetchTeamSquad = async (teamId, teamName) => {
    try {
      // If we have a team ID, use it directly
      if (teamId) {
        console.log('[DETAILS SCREEN] Fetching squad for team ID:', teamId);
        const players = await sportsAPI.getPlayersByTeam(teamId);
        return players || [];
      }

      // Otherwise, search for team by name
      if (teamName) {
        console.log('[DETAILS SCREEN] Searching for team:', teamName);
        const teams = await sportsAPI.searchTeams(teamName);
        
        if (teams && teams.length > 0) {
          // Use the first matching team
          const team = teams[0];
          console.log('[DETAILS SCREEN] Found team:', team.strTeam, 'ID:', team.idTeam);
          const players = await sportsAPI.getPlayersByTeam(team.idTeam);
          return players || [];
        }
      }

      return [];
    } catch (error) {
      console.error('[DETAILS SCREEN ERROR] Error fetching team squad:');
      console.error('[DETAILS SCREEN ERROR] Team:', teamName);
      console.error('[DETAILS SCREEN ERROR] Error message:', error.message);
      return [];
    }
  };

  const toggleFavorite = () => {
    const matchId = match.idEvent || match.id;
    console.log('[DETAILS SCREEN] Toggle favorite called');
    console.log('[DETAILS SCREEN] Match ID:', matchId);
    console.log('[DETAILS SCREEN] Current favorite status:', isFavorite);
    
    try {
      if (isFavorite) {
        console.log('[DETAILS SCREEN] Removing from favorites...');
        dispatch(removeFavorite(matchId));
        console.log('[DETAILS SCREEN] Favorite removed successfully');
      } else {
        console.log('[DETAILS SCREEN] Adding to favorites...');
        dispatch(addFavorite(match));
        console.log('[DETAILS SCREEN] Favorite added successfully');
      }
    } catch (error) {
      console.error('[DETAILS SCREEN ERROR] Error toggling favorite:');
      console.error('[DETAILS SCREEN ERROR] Error type:', error.constructor.name);
      console.error('[DETAILS SCREEN ERROR] Error message:', error.message);
      console.error('[DETAILS SCREEN ERROR] Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      console.error('[DETAILS SCREEN ERROR] Stack trace:', error.stack);
    }
  };

  const styles = getStyles(isDarkMode);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.leagueContainer}>
            <Text style={styles.leagueText}>{match.strLeague || 'Sports League'}</Text>
          </View>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={toggleFavorite}
          >
            <Text style={[styles.favoriteText, isFavorite && styles.favoriteTextActive]}>♥</Text>
          </TouchableOpacity>
        </View>

        {match.strThumb && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: match.strThumb }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        )}

        <View style={styles.matchSection}>
          <View style={styles.teamSection}>
            <View style={styles.teamRow}>
              {match.homeFlag && (
                <Image
                  source={{ uri: match.homeFlag }}
                  style={styles.teamFlag}
                  resizeMode="contain"
                />
              )}
              <Text style={styles.teamName} numberOfLines={2}>
                {match.strHomeTeam || 'Home Team'}
              </Text>
            </View>
            <Text style={styles.vsText}>VS</Text>
            <View style={styles.teamRow}>
              {match.awayFlag && (
                <Image
                  source={{ uri: match.awayFlag }}
                  style={styles.teamFlag}
                  resizeMode="contain"
                />
              )}
              <Text style={styles.teamName} numberOfLines={2}>
                {match.strAwayTeam || 'Away Team'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>
                {match.dateEvent || 'To be determined'}
              </Text>
            </View>
          </View>

          {match.strTime && (
            <View style={styles.detailRow}>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Time</Text>
                <Text style={styles.detailValue}>{match.strTime}</Text>
              </View>
            </View>
          )}

          <View style={styles.detailRow}>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Status</Text>
              <Text style={styles.detailValue}>
                {match.strStatus || 'Not Started'}
              </Text>
            </View>
          </View>

          {match.strEvent && (
            <View style={styles.detailRow}>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Event</Text>
                <Text style={styles.detailValue}>{match.strEvent}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Team Squads Section */}
        <View style={styles.squadsSection}>
          <Text style={styles.squadsTitle}>Team Squads</Text>
          
          {loadingSquads ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={isDarkMode ? '#87CEEB' : '#1F509A'} />
              <Text style={styles.loadingText}>Loading squads...</Text>
            </View>
          ) : (
            <>
              {/* Home Team Squad */}
              <View style={styles.teamSquadContainer}>
                <View style={styles.teamSquadHeader}>
                  {match.homeFlag && (
                    <Image
                      source={{ uri: match.homeFlag }}
                      style={styles.squadTeamFlag}
                      resizeMode="contain"
                    />
                  )}
                  <Text style={styles.teamSquadTitle}>
                    {match.strHomeTeam || 'Home Team'}
                  </Text>
                  <Text style={styles.playerCount}>
                    ({homeTeamPlayers.length} players)
                  </Text>
                </View>
                
                {homeTeamPlayers.length > 0 ? (
                  <FlatList
                    data={homeTeamPlayers.slice(0, 15)} // Limit to first 15 players
                    scrollEnabled={false}
                    keyExtractor={(item, index) => 
                      `home_${item.idPlayer || item.id || index}`
                    }
                    renderItem={({ item }) => (
                      <View style={styles.playerRow}>
                        <View style={styles.playerInfo}>
                          {item.strThumb && (
                            <Image
                              source={{ uri: item.strThumb }}
                              style={styles.playerThumb}
                              resizeMode="cover"
                            />
                          )}
                          <View style={styles.playerDetails}>
                            <Text style={styles.playerName}>
                              {item.strPlayer || 'Unknown Player'}
                            </Text>
                            {item.strPosition && (
                              <Text style={styles.playerPosition}>
                                {item.strPosition}
                              </Text>
                            )}
                          </View>
                        </View>
                        {item.strNumber && (
                          <Text style={styles.playerNumber}>
                            #{item.strNumber}
                          </Text>
                        )}
                      </View>
                    )}
                  />
                ) : (
                  <Text style={styles.noPlayersText}>No squad information available</Text>
                )}
              </View>

              {/* Away Team Squad */}
              <View style={styles.teamSquadContainer}>
                <View style={styles.teamSquadHeader}>
                  {match.awayFlag && (
                    <Image
                      source={{ uri: match.awayFlag }}
                      style={styles.squadTeamFlag}
                      resizeMode="contain"
                    />
                  )}
                  <Text style={styles.teamSquadTitle}>
                    {match.strAwayTeam || 'Away Team'}
                  </Text>
                  <Text style={styles.playerCount}>
                    ({awayTeamPlayers.length} players)
                  </Text>
                </View>
                
                {awayTeamPlayers.length > 0 ? (
                  <FlatList
                    data={awayTeamPlayers.slice(0, 15)} // Limit to first 15 players
                    scrollEnabled={false}
                    keyExtractor={(item, index) => 
                      `away_${item.idPlayer || item.id || index}`
                    }
                    renderItem={({ item }) => (
                      <View style={styles.playerRow}>
                        <View style={styles.playerInfo}>
                          {item.strThumb && (
                            <Image
                              source={{ uri: item.strThumb }}
                              style={styles.playerThumb}
                              resizeMode="cover"
                            />
                          )}
                          <View style={styles.playerDetails}>
                            <Text style={styles.playerName}>
                              {item.strPlayer || 'Unknown Player'}
                            </Text>
                            {item.strPosition && (
                              <Text style={styles.playerPosition}>
                                {item.strPosition}
                              </Text>
                            )}
                          </View>
                        </View>
                        {item.strNumber && (
                          <Text style={styles.playerNumber}>
                            #{item.strNumber}
                          </Text>
                        )}
                      </View>
                    )}
                  />
                ) : (
                  <Text style={styles.noPlayersText}>No squad information available</Text>
                )}
              </View>
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const getStyles = (isDarkMode) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#121212' : '#f5f5f5',
    },
    content: {
      padding: 20,
    },
    imageContainer: {
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 20,
      backgroundColor: isDarkMode ? '#1a1a1a' : '#e0e0e0',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    image: {
      width: '100%',
      height: 250,
      backgroundColor: isDarkMode ? '#1a1a1a' : '#e0e0e0',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
    },
    leagueContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    leagueText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDarkMode ? '#87CEEB' : '#1F509A',
    },
    favoriteButton: {
      padding: 8,
    },
    favoriteText: {
      fontSize: 24,
      color: isDarkMode ? '#666' : '#999',
    },
    favoriteTextActive: {
      color: '#8B0000',
    },
    matchSection: {
      backgroundColor: isDarkMode ? '#1a1a1a' : '#fff',
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
      alignItems: 'center',
    },
    teamSection: {
      alignItems: 'center',
    },
    teamRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 8,
      gap: 12,
    },
    teamFlag: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDarkMode ? '#1a1a1a' : '#f0f0f0',
    },
    teamName: {
      fontSize: 22,
      fontWeight: 'bold',
      color: isDarkMode ? '#fff' : '#333',
      textAlign: 'center',
    },
    vsText: {
      fontSize: 16,
      color: isDarkMode ? '#999' : '#666',
      fontWeight: '600',
      marginVertical: 8,
    },
    detailsSection: {
      backgroundColor: isDarkMode ? '#1a1a1a' : '#fff',
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 20,
    },
    detailContent: {
      flex: 1,
    },
    detailLabel: {
      fontSize: 12,
      color: isDarkMode ? '#999' : '#666',
      marginBottom: 4,
    },
    detailValue: {
      fontSize: 16,
      color: isDarkMode ? '#fff' : '#333',
      fontWeight: '500',
    },
    squadsSection: {
      marginBottom: 20,
    },
    squadsTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: isDarkMode ? '#fff' : '#333',
      marginBottom: 16,
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      gap: 10,
    },
    loadingText: {
      fontSize: 14,
      color: isDarkMode ? '#999' : '#666',
    },
    teamSquadContainer: {
      backgroundColor: isDarkMode ? '#1a1a1a' : '#fff',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    teamSquadHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      gap: 8,
      flexWrap: 'wrap',
    },
    squadTeamFlag: {
      width: 24,
      height: 18,
      borderRadius: 3,
    },
    teamSquadTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDarkMode ? '#fff' : '#333',
      flex: 1,
    },
    playerCount: {
      fontSize: 14,
      color: isDarkMode ? '#999' : '#666',
    },
    playerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? '#333' : '#e0e0e0',
    },
    playerInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: 12,
    },
    playerThumb: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDarkMode ? '#2a2a2a' : '#f0f0f0',
    },
    playerDetails: {
      flex: 1,
    },
    playerName: {
      fontSize: 15,
      fontWeight: '600',
      color: isDarkMode ? '#fff' : '#333',
      marginBottom: 2,
    },
    playerPosition: {
      fontSize: 12,
      color: isDarkMode ? '#87CEEB' : '#1F509A',
    },
    playerNumber: {
      fontSize: 14,
      fontWeight: 'bold',
      color: isDarkMode ? '#999' : '#666',
    },
    noPlayersText: {
      fontSize: 14,
      color: isDarkMode ? '#666' : '#999',
      textAlign: 'center',
      padding: 20,
      fontStyle: 'italic',
    },
  });


