import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Feather } from 'react-native-feather';
import MatchCard from '../components/MatchCard';

export default function FavoritesScreen({ navigation }) {
  console.log('[FAVORITES SCREEN] Component rendering...');
  const favorites = useSelector((state) => state.favorites.favorites);
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  
  console.log('[FAVORITES SCREEN] Favorites count:', favorites?.length || 0);
  console.log('[FAVORITES SCREEN] Dark mode:', isDarkMode);
  
  if (favorites && favorites.length > 0) {
    console.log('[FAVORITES SCREEN] Favorite items:', favorites.map(f => ({
      id: f.idEvent || f.id,
      name: f.strEvent || `${f.strHomeTeam} vs ${f.strAwayTeam}`
    })));
  }

  const styles = getStyles(isDarkMode);

  if (favorites.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Feather name="heart" size={64} color="#8B0000" fill="#8B0000" />
        <Text style={styles.emptyTitle}>No Favorites Yet</Text>
        <Text style={styles.emptyText}>
          Start adding matches to your favorites to see them here!
        </Text>
        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => navigation.navigate('Home')}
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
          My Favorites ({favorites.length})
        </Text>
      </View>
      <FlatList
        data={favorites}
        keyExtractor={(item, index) => {
          // Create unique key by combining idEvent with other unique fields and index
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

