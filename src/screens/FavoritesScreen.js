import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Feather } from 'react-native-feather';
import MatchCard from '../components/MatchCard';

export default function FavoritesScreen({ navigation }) {
  const favorites = useSelector((state) => state.favorites.favorites);
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const [refreshing, setRefreshing] = useState(false);
  const [updatedFavorites, setUpdatedFavorites] = useState(favorites);

  useEffect(() => {
    // Simply use favorites as-is (same as matches list)
    // No API calls to avoid rate limiting issues
    setUpdatedFavorites(favorites);
  }, [favorites]);

  const onRefresh = () => {
    setRefreshing(true);
    setUpdatedFavorites(favorites);
    setTimeout(() => setRefreshing(false), 500);
  };

  const styles = getStyles(isDarkMode);

  if (updatedFavorites.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Feather name="heart" size={64} color="#8B0000" fill="#8B0000" />
        <Text style={styles.emptyTitle}>No Favorites Yet</Text>
        <Text style={styles.emptyText}>
          Start adding matches to your favorites to see them here!
        </Text>
        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => navigation.navigate('Football')}
        >
          <Text style={styles.browseButtonText}>Browse Matches</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          My Favorites ({updatedFavorites.length})
        </Text>
      </View>
      <FlatList
        data={updatedFavorites}
        keyExtractor={(item, index) => {
          const matchId = item.idEvent?.toString() || item.id?.toString() || '';
          const uniqueKey = `${matchId}_${item.dateEvent || ''}_${item.strHomeTeam || ''}_${item.strAwayTeam || ''}_${index}`;
          return uniqueKey;
        }}
        renderItem={({ item }) => (
          <MatchCard
            match={item}
            isFavorite={true}
            onPress={() => navigation.navigate('Details', { match: item })}
            onFavoritePress={() => {}}
            isDarkMode={isDarkMode}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? '#333' : '#e0e0e0',
    },
    headerText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDarkMode ? '#fff' : '#333',
    },
    list: {
      padding: 15,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
      backgroundColor: isDarkMode ? '#121212' : '#f5f5f5',
    },
    emptyTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDarkMode ? '#fff' : '#333',
      marginTop: 20,
    },
    emptyText: {
      fontSize: 16,
      color: isDarkMode ? '#999' : '#666',
      textAlign: 'center',
      marginTop: 12,
      marginBottom: 30,
    },
    browseButton: {
      backgroundColor: isDarkMode ? '#87CEEB' : '#1F509A',
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    browseButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

