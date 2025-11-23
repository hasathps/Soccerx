import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Animated } from 'react-native';
import { Feather } from 'react-native-feather';

// Animated Pulsing Dot Component for Live Matches
function LiveDot() {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.5,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const dotStyles = StyleSheet.create({
    liveDotContainer: {
      position: 'relative',
      width: 8,
      height: 8,
      marginRight: 6,
    },
    liveDot: {
      position: 'absolute',
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#f44336',
    },
    liveDotInner: {
      position: 'absolute',
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#f44336',
    },
  });

  return (
    <View style={dotStyles.liveDotContainer}>
      <Animated.View
        style={[
          dotStyles.liveDot,
          {
            transform: [{ scale: pulseAnim }],
            opacity: pulseAnim.interpolate({
              inputRange: [1, 1.5],
              outputRange: [1, 0.3],
            }),
          },
        ]}
      />
      <View style={dotStyles.liveDotInner} />
    </View>
  );
}

// Countdown Timer Component
function CountdownTimer({ dateEvent, strTime, isDarkMode }) {
  const [timeRemaining, setTimeRemaining] = useState(null);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      if (!dateEvent || !strTime) return null;

      try {
        // Handle time format with or without seconds (e.g., "15:00:00" or "15:00")
        const timeOnly = strTime.split(':').slice(0, 2).join(':');
        const matchDateTime = new Date(`${dateEvent}T${timeOnly}`);
        const now = new Date();
        const diff = matchDateTime - now;

        if (diff <= 0) return null;

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        if (days > 0) {
          return `${days}d ${hours}h`;
        } else if (hours > 0) {
          return `${hours}h ${minutes}m`;
        } else {
          return `${minutes}m ${seconds}s`;
        }
      } catch (error) {
        return null;
      }
    };

    setTimeRemaining(calculateTimeRemaining());

    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);
      if (!remaining) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [dateEvent, strTime]);

  if (!timeRemaining) return null;

  return (
    <Text style={[sharedStyles.countdownText, { color: isDarkMode ? '#87CEEB' : '#1F509A' }]}>
      Starts in: {timeRemaining}
    </Text>
  );
}

// Animated Score Component
function AnimatedScore({ score, isDarkMode }) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const prevScoreRef = useRef(score);

  useEffect(() => {
    if (prevScoreRef.current !== score && score !== null && score !== undefined) {
      // Animate when score changes
      Animated.parallel([
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0.5,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.3,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
    prevScoreRef.current = score;
  }, [score]);

  return (
    <Animated.Text
      style={[
        sharedStyles.scoreText,
        {
          color: isDarkMode ? '#fff' : '#333',
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {score !== null && score !== undefined ? score : '-'}
    </Animated.Text>
  );
}

// Animated Status Badge Component
function AnimatedStatusBadge({ status, isDarkMode }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getStatusColor = (status) => {
    if (status === 'Live' || status === '1H' || status === '2H' || status === 'HT') {
      return '#f44336';
    }
    if (status === 'Finished' || status === 'FT') {
      return '#87CEEB';
    }
    if (status === 'Postponed' || status === 'Canceled') {
      return '#ff9800';
    }
    return isDarkMode ? '#666' : '#999';
  };

  const getStatusText = (status) => {
    if (status === 'Live' || status === '1H' || status === '2H' || status === 'HT') {
      return 'LIVE';
    }
    if (status === 'Finished' || status === 'FT') {
      return 'FT';
    }
    if (status === 'Postponed' || status === 'Canceled') {
      return 'PP';
    }
    return 'UPCOMING';
  };

  const isLive = status === 'Live' || status === '1H' || status === '2H' || status === 'HT';

  return (
    <Animated.View
      style={[
        sharedStyles.statusBadge,
        {
          backgroundColor: getStatusColor(status),
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {isLive && <LiveDot />}
      <Text style={sharedStyles.statusText}>{getStatusText(status)}</Text>
    </Animated.View>
  );
}

export default function MatchCard({
  match,
  isFavorite,
  onPress,
  onFavoritePress,
  isDarkMode,
}) {
  const styles = getStyles(isDarkMode);
  const isLive = match.strStatus === 'Live' || match.strStatus === '1H' || match.strStatus === '2H' || match.strStatus === 'HT';
  const isFinished = match.strStatus === 'Finished' || match.strStatus === 'FT';
  const isUpcoming = !isLive && !isFinished;

  // Get scores (support multiple field names from API)
  const homeScore = match.intHomeScore !== null && match.intHomeScore !== undefined 
    ? match.intHomeScore 
    : match.strHomeScore !== null && match.strHomeScore !== undefined 
    ? match.strHomeScore 
    : null;
  const awayScore = match.intAwayScore !== null && match.intAwayScore !== undefined 
    ? match.intAwayScore 
    : match.strAwayScore !== null && match.strAwayScore !== undefined 
    ? match.strAwayScore 
    : null;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.leagueContainer}>
          <Text style={styles.leagueText} numberOfLines={1}>
            {match.strLeague || match.strLeagueFull || 'Sports League'}
          </Text>
        </View>
        <AnimatedStatusBadge status={match.strStatus} isDarkMode={isDarkMode} />
      </View>

      <View style={styles.matchInfo}>
        <View style={styles.teamsRow}>
          {/* Home Team - Left Side */}
          <View style={styles.teamSide}>
            {(match.strHomeTeamBadge || match.homeBadge) && (
              <Image
                source={{ uri: match.strHomeTeamBadge || match.homeBadge }}
                style={styles.teamLogo}
                resizeMode="contain"
              />
            )}
            {!match.strHomeTeamBadge && !match.homeBadge && match.homeFlag && (
              <Image
                source={{ uri: match.homeFlag }}
                style={styles.teamLogo}
                resizeMode="contain"
              />
            )}
            <Text style={styles.teamName} numberOfLines={2}>
              {match.strHomeTeam || 'Home Team'}
            </Text>
            {(isLive || isFinished) && (
              <AnimatedScore score={homeScore} isDarkMode={isDarkMode} />
            )}
          </View>

          {/* Score/VS Text in Middle */}
          <View style={styles.vsContainer}>
            {(isLive || isFinished) ? (
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreSeparator}>-</Text>
              </View>
            ) : (
              <Text style={styles.vsText}>VS</Text>
            )}
          </View>

          {/* Away Team - Right Side */}
          <View style={styles.teamSide}>
            {(match.strAwayTeamBadge || match.awayBadge) && (
              <Image
                source={{ uri: match.strAwayTeamBadge || match.awayBadge }}
                style={styles.teamLogo}
                resizeMode="contain"
              />
            )}
            {!match.strAwayTeamBadge && !match.awayBadge && match.awayFlag && (
              <Image
                source={{ uri: match.awayFlag }}
                style={styles.teamLogo}
                resizeMode="contain"
              />
            )}
            <Text style={styles.teamName} numberOfLines={2}>
              {match.strAwayTeam || 'Away Team'}
            </Text>
            {(isLive || isFinished) && (
              <AnimatedScore score={awayScore} isDarkMode={isDarkMode} />
            )}
          </View>
        </View>

        <View style={styles.matchDetails}>
          {isLive && match.strProgress && (
            <Text style={[styles.liveProgressText, { color: isDarkMode ? '#87CEEB' : '#1F509A' }]}>
              {match.strProgress}
            </Text>
          )}
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
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    leagueContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginRight: 10,
    },
    leagueText: {
      fontSize: 12,
      color: isDarkMode ? '#87CEEB' : '#1F509A',
      fontWeight: '600',
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
      minWidth: 60,
      justifyContent: 'center',
    },
    statusText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: 'bold',
    },
    matchInfo: {
      marginBottom: 12,
    },
    teamsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
      gap: 12,
    },
    teamSide: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    teamLogo: {
      width: 50,
      height: 50,
      marginBottom: 8,
      backgroundColor: isDarkMode ? '#2a2a2a' : '#f0f0f0',
      borderRadius: 25,
    },
    teamName: {
      fontSize: 13,
      fontWeight: 'bold',
      color: isDarkMode ? '#fff' : '#333',
      textAlign: 'center',
    },
    vsContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 8,
    },
    vsText: {
      fontSize: 14,
      color: isDarkMode ? '#999' : '#666',
      fontWeight: '700',
    },
    matchDetails: {
      alignItems: 'center',
    },
    dateTimeText: {
      fontSize: 12,
      color: isDarkMode ? '#999' : '#666',
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: isDarkMode ? '#333' : '#e0e0e0',
    },
    viewDetailsText: {
      fontSize: 12,
      color: isDarkMode ? '#999' : '#666',
      fontStyle: 'italic',
    },
    countdownText: {
      fontSize: 12,
      fontWeight: '600',
      textAlign: 'center',
    },
    scoreText: {
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: 4,
    },
    scoreContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    scoreSeparator: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#999',
    },
    liveProgressText: {
      fontSize: 11,
      fontWeight: '600',
      marginTop: 4,
    },
  });

// Shared styles for child components (used outside getStyles)
const sharedStyles = StyleSheet.create({
  countdownText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    minWidth: 60,
    justifyContent: 'center',
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  scoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreSeparator: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
  },
  liveProgressText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
});
