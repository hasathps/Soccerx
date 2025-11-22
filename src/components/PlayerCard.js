import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

export default function PlayerCard({
  player,
  onPress,
  isDarkMode,
}) {
  const styles = getStyles(isDarkMode);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
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

        <View style={styles.playerInfo}>
          <Text style={styles.playerName} numberOfLines={1}>
            {player.strPlayer || 'Unknown Player'}
          </Text>
          
          {player.strPosition && (
            <Text style={styles.positionText} numberOfLines={1}>
              {player.strPosition}
            </Text>
          )}

          <View style={styles.detailsRow}>
            {player.strNationality && (
              <View style={styles.detailItem}>
                {player.strFlag && (
                  <Image
                    source={{ uri: player.strFlag }}
                    style={styles.flagImage}
                    resizeMode="contain"
                  />
                )}
                <Text style={styles.detailText} numberOfLines={1}>
                  {player.strNationality}
                </Text>
              </View>
            )}

            {player.strTeam && (
              <Text style={styles.teamText} numberOfLines={1}>
                {player.strTeam}
              </Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.viewDetailsText}>Tap to view details</Text>
      </View>
    </TouchableOpacity>
  );
}

const getStyles = (isDarkMode) =>
  StyleSheet.create({
    card: {
      backgroundColor: isDarkMode ? '#1a1a1a' : '#fff',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDarkMode ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 1,
      borderColor: isDarkMode ? '#333' : '#e0e0e0',
    },
    cardContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    imageContainer: {
      width: 70,
      height: 70,
      borderRadius: 35,
      overflow: 'hidden',
      marginRight: 16,
      backgroundColor: isDarkMode ? '#2a2a2a' : '#f0f0f0',
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
      fontSize: 28,
      fontWeight: 'bold',
      color: isDarkMode ? '#666' : '#999',
    },
    playerInfo: {
      flex: 1,
    },
    playerName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDarkMode ? '#fff' : '#333',
      marginBottom: 4,
    },
    positionText: {
      fontSize: 14,
      color: isDarkMode ? '#87CEEB' : '#1F509A',
      fontWeight: '600',
      marginBottom: 8,
    },
    detailsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 8,
    },
    detailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    flagImage: {
      width: 20,
      height: 15,
      borderRadius: 2,
    },
    detailText: {
      fontSize: 12,
      color: isDarkMode ? '#999' : '#666',
    },
    teamText: {
      fontSize: 12,
      color: isDarkMode ? '#999' : '#666',
      fontStyle: 'italic',
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingTop: 12,
      marginTop: 12,
      borderTopWidth: 1,
      borderTopColor: isDarkMode ? '#333' : '#e0e0e0',
    },
    viewDetailsText: {
      fontSize: 12,
      color: isDarkMode ? '#999' : '#666',
      fontStyle: 'italic',
    },
  });

