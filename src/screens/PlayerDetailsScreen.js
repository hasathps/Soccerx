import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import { sportsAPI } from '../services/api';

export default function PlayerDetailsScreen({ route, navigation }) {
  console.log('[PLAYER DETAILS SCREEN] Component rendering...');
  const { player: initialPlayer } = route.params;
  const [player, setPlayer] = useState(initialPlayer);
  const [loading, setLoading] = useState(false);
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  useEffect(() => {
    // Fetch full player details if we have an ID
    if (initialPlayer?.idPlayer && !initialPlayer.strDescriptionEN) {
      loadPlayerDetails();
    }
  }, [initialPlayer?.idPlayer]);

  const loadPlayerDetails = async () => {
    if (!initialPlayer?.idPlayer) return;

    console.log('[PLAYER DETAILS SCREEN] Loading full player details for:', initialPlayer.idPlayer);
    setLoading(true);
    
    try {
      const fullPlayerDetails = await sportsAPI.getPlayerDetails(initialPlayer.idPlayer);
      if (fullPlayerDetails) {
        console.log('[PLAYER DETAILS SCREEN] Full player details loaded');
        setPlayer(fullPlayerDetails);
      }
    } catch (error) {
      console.error('[PLAYER DETAILS SCREEN ERROR] Error loading player details:');
      console.error('[PLAYER DETAILS SCREEN ERROR] Error message:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const styles = getStyles(isDarkMode);

  return (
    <ScrollView style={styles.container}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={isDarkMode ? '#87CEEB' : '#1F509A'} />
          <Text style={styles.loadingText}>Loading details...</Text>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.imageContainer}>
            {player.strThumb ? (
              <Image
                source={{ uri: player.strThumb }}
                style={styles.playerImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>
                  {player.strPlayer?.charAt(0)?.toUpperCase() || '?'}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.nameContainer}>
            <Text style={styles.playerName}>
              {player.strPlayer || 'Unknown Player'}
            </Text>
            
            {player.strPosition && (
              <View style={styles.positionBadge}>
                <Text style={styles.positionText}>{player.strPosition}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.detailsSection}>
          {player.strNationality && (
            <View style={styles.detailRow}>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Nationality</Text>
                <View style={styles.nationalityRow}>
                  {player.strFlag && (
                    <Image
                      source={{ uri: player.strFlag }}
                      style={styles.flagImage}
                      resizeMode="contain"
                    />
                  )}
                  <Text style={styles.detailValue}>{player.strNationality}</Text>
                </View>
              </View>
            </View>
          )}

          {player.strTeam && (
            <View style={styles.detailRow}>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Team</Text>
                <Text style={styles.detailValue}>{player.strTeam}</Text>
              </View>
            </View>
          )}

          {player.dateBorn && (
            <View style={styles.detailRow}>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Date of Birth</Text>
                <Text style={styles.detailValue}>{player.dateBorn}</Text>
              </View>
            </View>
          )}

          {player.strBirthLocation && (
            <View style={styles.detailRow}>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Birth Location</Text>
                <Text style={styles.detailValue}>{player.strBirthLocation}</Text>
              </View>
            </View>
          )}

          {player.strHeight && (
            <View style={styles.detailRow}>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Height</Text>
                <Text style={styles.detailValue}>{player.strHeight}</Text>
              </View>
            </View>
          )}

          {player.strWeight && (
            <View style={styles.detailRow}>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Weight</Text>
                <Text style={styles.detailValue}>{player.strWeight}</Text>
              </View>
            </View>
          )}

          {player.strSigning && (
            <View style={styles.detailRow}>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Signing</Text>
                <Text style={styles.detailValue}>{player.strSigning}</Text>
              </View>
            </View>
          )}

          {player.strWage && (
            <View style={styles.detailRow}>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Wage</Text>
                <Text style={styles.detailValue}>{player.strWage}</Text>
              </View>
            </View>
          )}

          {player.strDescriptionEN && (
            <View style={styles.detailRow}>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Biography</Text>
                <Text style={styles.biographyText}>{player.strDescriptionEN}</Text>
              </View>
            </View>
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
    loadingContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
      gap: 10,
    },
    loadingText: {
      fontSize: 14,
      color: isDarkMode ? '#999' : '#666',
    },
    content: {
      padding: 20,
    },
    header: {
      alignItems: 'center',
      marginBottom: 24,
    },
    imageContainer: {
      width: 150,
      height: 150,
      borderRadius: 75,
      overflow: 'hidden',
      marginBottom: 16,
      backgroundColor: isDarkMode ? '#2a2a2a' : '#e0e0e0',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    },
    playerImage: {
      width: '100%',
      height: '100%',
    },
    placeholderImage: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#2a2a2a' : '#e0e0e0',
    },
    placeholderText: {
      fontSize: 60,
      fontWeight: 'bold',
      color: isDarkMode ? '#666' : '#999',
    },
    nameContainer: {
      alignItems: 'center',
    },
    playerName: {
      fontSize: 28,
      fontWeight: 'bold',
      color: isDarkMode ? '#fff' : '#333',
      textAlign: 'center',
      marginBottom: 12,
    },
    positionBadge: {
      backgroundColor: isDarkMode ? '#87CEEB' : '#1F509A',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    positionText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
    detailsSection: {
      backgroundColor: isDarkMode ? '#1a1a1a' : '#fff',
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
    },
    detailRow: {
      marginBottom: 20,
    },
    detailContent: {
      flex: 1,
    },
    detailLabel: {
      fontSize: 12,
      color: isDarkMode ? '#999' : '#666',
      marginBottom: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    detailValue: {
      fontSize: 16,
      color: isDarkMode ? '#fff' : '#333',
      fontWeight: '500',
    },
    nationalityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    flagImage: {
      width: 24,
      height: 18,
      borderRadius: 3,
    },
    biographyText: {
      fontSize: 14,
      color: isDarkMode ? '#ccc' : '#555',
      lineHeight: 22,
    },
  });

