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

function formatDate(dateString) {
  if (!dateString) return 'To be determined';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  } catch (error) {
    return dateString;
  }
}

function formatTime(timeString) {
  if (!timeString) return 'TBD';
  try {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    if (isNaN(hour)) {
      return timeString;
    }
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes || '00'} ${ampm}`;
  } catch (error) {
    return timeString;
  }
}

export default function DetailsScreen({ route, navigation }) {
  const { match } = route.params;
  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.favorites.favorites);
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  const [homeTeamPlayers, setHomeTeamPlayers] = useState([]);
  const [awayTeamPlayers, setAwayTeamPlayers] = useState([]);
  const [loadingSquads, setLoadingSquads] = useState(false);
  const [eventDetails, setEventDetails] = useState(null);

  const matchId = match.idEvent || match.id;
  const isFavorite = favorites.some((fav) => (fav.idEvent || fav.id) === matchId);

  useEffect(() => {
    loadTeamSquads();
    loadEventDetails();
  }, [match]);

  const loadTeamSquads = async () => {
    setLoadingSquads(true);

    try {
      const homeTeamName = match.strHomeTeam;
      const awayTeamName = match.strAwayTeam;
      const homeTeamId = match.idHomeTeam || match.idHomeTeam;
      const awayTeamId = match.idAwayTeam || match.idAwayTeam;

      const [homeSquad, awaySquad] = await Promise.all([
        fetchTeamSquad(homeTeamId, homeTeamName),
        fetchTeamSquad(awayTeamId, awayTeamName),
      ]);

      setHomeTeamPlayers(homeSquad || []);
      setAwayTeamPlayers(awaySquad || []);
    } catch (error) {
      setHomeTeamPlayers([]);
      setAwayTeamPlayers([]);
    } finally {
      setLoadingSquads(false);
    }
  };

  const fetchTeamSquad = async (teamId, teamName) => {
    try {
      if (teamId) {
        const players = await sportsAPI.getPlayersByTeam(teamId);
        return players || [];
      }

      if (teamName) {
        const teams = await sportsAPI.searchTeams(teamName);
        
        if (teams && teams.length > 0) {
          const team = teams[0];
          const players = await sportsAPI.getPlayersByTeam(team.idTeam);
          return players || [];
        }
      }

      return [];
    } catch (error) {
      return [];
    }
  };

  const loadEventDetails = async () => {
    try {
      const matchId = match.idEvent || match.id;
      if (matchId) {
        const details = await sportsAPI.getEventDetails(matchId);
        if (details) {
          console.log('[DETAILS SCREEN] ✅ Event details fetched from API');
          console.log('[DETAILS SCREEN] API Response:', {
            dateEvent: details.dateEvent,
            strTime: details.strTime,
            dateEventLocal: details.dateEventLocal,
            strTimestamp: details.strTimestamp,
            strStatus: details.strStatus,
            strEvent: details.strEvent,
            strLeague: details.strLeague,
            strHomeTeam: details.strHomeTeam,
            strAwayTeam: details.strAwayTeam,
          });
          setEventDetails(details);
        } else {
          console.log('[DETAILS SCREEN] ⚠️ No event details from API, using match data');
        }
      } else {
        console.log('[DETAILS SCREEN] ⚠️ No match ID, using match data');
      }
    } catch (error) {
      console.log('[DETAILS SCREEN] ❌ Error loading event details:', error.message);
    }
  };

  const toggleFavorite = () => {
    const matchId = match.idEvent || match.id;
    try {
      if (isFavorite) {
        dispatch(removeFavorite(matchId));
      } else {
        dispatch(addFavorite(match));
      }
    } catch (error) {
      // Error handling
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
                {eventDetails?.dateEvent 
                  ? formatDate(eventDetails.dateEvent)
                  : (match.dateEvent ? formatDate(match.dateEvent) : 'To be determined')}
              </Text>
              {eventDetails?.dateEvent && (
                <Text style={styles.dataSourceText}>✓ From API</Text>
              )}
            </View>
          </View>

          {(eventDetails?.strTime || match.strTime) && (
            <View style={styles.detailRow}>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Time</Text>
                <Text style={styles.detailValue}>
                  {eventDetails?.strTime 
                    ? formatTime(eventDetails.strTime)
                    : formatTime(match.strTime)}
                </Text>
                {eventDetails?.strTime && (
                  <Text style={styles.dataSourceText}>✓ From API</Text>
                )}
              </View>
            </View>
          )}

          <View style={styles.detailRow}>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Status</Text>
              <Text style={styles.detailValue}>
                {eventDetails?.strStatus || match.strStatus || 'Not Started'}
              </Text>
              {eventDetails?.strStatus && (
                <Text style={styles.dataSourceText}>✓ From API</Text>
              )}
            </View>
          </View>

          {(eventDetails?.strEvent || match.strEvent) && (
            <View style={styles.detailRow}>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Event</Text>
                <Text style={styles.detailValue}>
                  {eventDetails?.strEvent || match.strEvent}
                </Text>
                {eventDetails?.strEvent && (
                  <Text style={styles.dataSourceText}>✓ From API</Text>
                )}
              </View>
            </View>
          )}

          {eventDetails && (
            <View style={styles.detailRow}>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Data Source</Text>
                <Text style={[styles.detailValue, { color: isDarkMode ? '#87CEEB' : '#1F509A' }]}>
                  ✓ Retrieved from TheSportsDB API
                </Text>
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
    dataSourceText: {
      fontSize: 11,
      color: isDarkMode ? '#87CEEB' : '#1F509A',
      marginTop: 2,
      fontStyle: 'italic',
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


