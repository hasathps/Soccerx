import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { chatWithGemini, isGeminiConfigured } from '../services/geminiService';

export default function ChatAIScreen() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const flatListRef = useRef(null);
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  useEffect(() => {
    setIsConfigured(isGeminiConfigured());
    
    // Add welcome message
    if (isGeminiConfigured()) {
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: "Hi! I'm your AI sports assistant. I can help you with football matches, players, teams, and more. What would you like to know?",
          timestamp: new Date(),
        },
      ]);
    } else {
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: "⚠️ API key not configured. Please add your Gemini API key in 'src/config/gemini.config.js' to use the AI assistant.",
          timestamp: new Date(),
        },
      ]);
    }
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || loading || !isConfigured) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      console.log('[CHAT AI SCREEN] Sending message to Gemini...');
      const response = await chatWithGemini(userMessage.content, messages);

      if (response.success) {
        const assistantMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.message,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const errorMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Sorry, I encountered an error: ${response.error}. Please try again.`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('[CHAT AI SCREEN ERROR] Error sending message:', error.message);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';
    const styles = getStyles(isDarkMode);

    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.assistantMessage,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.assistantBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isUser ? styles.userText : styles.assistantText,
            ]}
          >
            {item.content}
          </Text>
          <Text style={styles.timestamp}>
            {item.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

  const styles = getStyles(isDarkMode);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        ListFooterComponent={
          loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={isDarkMode ? '#87CEEB' : '#1F509A'} />
              <Text style={styles.loadingText}>AI is thinking...</Text>
            </View>
          ) : null
        }
      />

      {!isConfigured && (
        <View style={styles.warningContainer}>
          <Ionicons name="warning" size={20} color="#ff9800" />
          <Text style={styles.warningText}>
            API key not configured. Add your Gemini API key to use AI assistant.
          </Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Ask me about football, players, matches..."
          placeholderTextColor={isDarkMode ? '#666' : '#999'}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
          editable={!loading && isConfigured}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputText.trim() || loading || !isConfigured) && styles.sendButtonDisabled,
          ]}
          onPress={sendMessage}
          disabled={!inputText.trim() || loading || !isConfigured}
        >
          <Ionicons
            name="send"
            size={20}
            color={!inputText.trim() || loading || !isConfigured ? '#999' : '#fff'}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const getStyles = (isDarkMode) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#121212' : '#f5f5f5',
    },
    messagesList: {
      padding: 16,
      paddingBottom: 20,
    },
    messageContainer: {
      marginBottom: 16,
      flexDirection: 'row',
    },
    userMessage: {
      justifyContent: 'flex-end',
    },
    assistantMessage: {
      justifyContent: 'flex-start',
    },
    messageBubble: {
      maxWidth: '75%',
      padding: 12,
      borderRadius: 16,
    },
    userBubble: {
      backgroundColor: isDarkMode ? '#1F509A' : '#1F509A',
      borderBottomRightRadius: 4,
    },
    assistantBubble: {
      backgroundColor: isDarkMode ? '#1a1a1a' : '#fff',
      borderBottomLeftRadius: 4,
      borderWidth: 1,
      borderColor: isDarkMode ? '#333' : '#e0e0e0',
    },
    messageText: {
      fontSize: 15,
      lineHeight: 20,
    },
    userText: {
      color: '#fff',
    },
    assistantText: {
      color: isDarkMode ? '#fff' : '#333',
    },
    timestamp: {
      fontSize: 10,
      color: isDarkMode ? '#999' : '#666',
      marginTop: 4,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      padding: 12,
      backgroundColor: isDarkMode ? '#1a1a1a' : '#fff',
      borderTopWidth: 1,
      borderTopColor: isDarkMode ? '#333' : '#e0e0e0',
      gap: 8,
    },
    textInput: {
      flex: 1,
      minHeight: 40,
      maxHeight: 100,
      backgroundColor: isDarkMode ? '#2a2a2a' : '#f0f0f0',
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 10,
      color: isDarkMode ? '#fff' : '#333',
      fontSize: 15,
    },
    sendButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDarkMode ? '#87CEEB' : '#1F509A',
      justifyContent: 'center',
      alignItems: 'center',
    },
    sendButtonDisabled: {
      backgroundColor: isDarkMode ? '#2a2a2a' : '#e0e0e0',
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      gap: 10,
    },
    loadingText: {
      fontSize: 14,
      color: isDarkMode ? '#999' : '#666',
    },
    warningContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? '#2a2a00' : '#fff3cd',
      padding: 12,
      gap: 8,
      borderTopWidth: 1,
      borderTopColor: isDarkMode ? '#333' : '#e0e0e0',
    },
    warningText: {
      flex: 1,
      fontSize: 12,
      color: isDarkMode ? '#ff9800' : '#856404',
    },
  });

