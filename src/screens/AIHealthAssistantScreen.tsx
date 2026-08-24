import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '@/components/Icon';
import { ICONS } from '@/theme/icon-map';
import { colors } from '@/theme/colors';
import { sendGroqChat, ChatMessage } from '@/lib/groq';
import type { AppNavigationProp } from '@/navigation/types';
import { useTheme } from '@/context/ThemeContext';

const QUICK_SUGGESTIONS = [
  'How can I naturally ease cramps?',
  'What foods boost energy during period?',
  'Common signs of ovulation',
  'Why does mood change before period?',
];

export function AIHealthAssistantScreen() {
  const navigation = useNavigation<AppNavigationProp>();
  const insets = useSafeAreaInsets();
  const { isDark, themeColors } = useTheme();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        "Hello! I'm your CycleWise AI Health Assistant. How can I help you with your cycle, symptoms, or wellness today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );
    return () => showSub.remove();
  }, []);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: query };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const response = await sendGroqChat(query, messages);
      setMessages([...updatedMessages, { role: 'assistant', content: response }]);
    } catch (err: any) {
      setMessages([
        ...updatedMessages,
        {
          role: 'assistant',
          content:
            "I'm having trouble connecting right now. Please check your network connection or try again shortly.",
        },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-card dark:bg-dark-card">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-dark-border bg-card dark:bg-dark-card">
          <Pressable onPress={() => navigation.goBack()} className="p-1 active:opacity-70">
            <Icon name={ICONS.back} size={22} color={colors.pinkPrimary} />
          </Pressable>
          <View className="items-center">
            <View className="flex-row items-center gap-1.5">
              <Text className="text-base font-extrabold text-text dark:text-dark-text">AI Health Assistant</Text>
              <View className="w-2 h-2 rounded-full bg-emerald-500" />
            </View>
            <Text className="text-[10px] font-semibold text-muted dark:text-dark-muted">Powered by Groq LLaMA</Text>
          </View>
          <Pressable
            onPress={() =>
              setMessages([
                {
                  role: 'assistant',
                  content:
                    "Hello! I'm your CycleWise AI Health Assistant. How can I help you with your cycle, symptoms, or wellness today?",
                },
              ])
            }
            className="p-1 active:opacity-70"
          >
            <Icon name={ICONS.refresh} size={18} color={isDark ? themeColors.muted : colors.muted} />
          </Pressable>
        </View>

        {/* Chat History */}
        <View className="flex-1 bg-bg dark:bg-dark-bg">
          <ScrollView
            ref={scrollViewRef}
            className="flex-1 px-4"
            contentContainerClassName="py-4 pb-4"
            keyboardShouldPersistTaps="handled"
          >
            {/* Medical Disclaimer Banner */}
            <View className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl p-3.5 mb-4 flex-row items-start gap-2.5">
              <Icon name={ICONS.warning} size={18} color="#D97706" />
              <Text className="text-xs text-amber-900 dark:text-amber-200 flex-1 font-medium leading-relaxed">
                Medical Disclaimer: Information provided is for educational and wellness guidance only.
                Always consult a physician for medical diagnosis or emergencies.
              </Text>
            </View>

            {/* Message bubbles */}
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <View
                  key={index}
                  className={`mb-3 flex-row ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <View className="w-8 h-8 rounded-full bg-pink-light dark:bg-dark-card-hover items-center justify-center mr-2 mt-1">
                      <Icon name={ICONS.sparkles} size={16} color={colors.pinkPrimary} />
                    </View>
                  )}
                  <View
                    className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                      isUser
                        ? 'bg-pink-primary'
                        : 'bg-card dark:bg-dark-card border border-gray-100 dark:border-dark-border'
                    }`}
                  >
                    <Text
                      className={`text-sm leading-relaxed ${
                        isUser ? 'text-white font-medium' : 'text-text dark:text-dark-text'
                      }`}
                    >
                      {msg.content}
                    </Text>
                  </View>
                </View>
              );
            })}

            {isLoading && (
              <View className="flex-row items-center gap-2 mb-3">
                <View className="w-8 h-8 rounded-full bg-pink-light dark:bg-dark-card-hover items-center justify-center mr-2">
                  <ActivityIndicator size="small" color={colors.pinkPrimary} />
                </View>
                <View className="bg-card dark:bg-dark-card rounded-2xl px-4 py-3 border border-gray-100 dark:border-dark-border">
                  <Text className="text-xs font-semibold text-muted dark:text-dark-muted">CycleWise AI is thinking...</Text>
                </View>
              </View>
            )}

            {/* Quick suggestions when history is short */}
            {messages.length <= 2 && !isLoading && (
              <View className="mt-4">
                <Text className="text-xs font-bold text-muted dark:text-dark-muted mb-2">Suggested questions:</Text>
                <View className="flex-row flex-wrap gap-2">
                  {QUICK_SUGGESTIONS.map((item) => (
                    <Pressable
                      key={item}
                      onPress={() => handleSend(item)}
                      className="bg-card dark:bg-dark-card border border-pink-light dark:border-dark-border rounded-full px-3.5 py-2 active:opacity-80 shadow-sm"
                    >
                      <Text className="text-xs font-semibold text-pink-primary">{item}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Fixed Input Bar above Keyboard */}
        <View
          className="bg-card dark:bg-dark-card border-t border-gray-100 dark:border-dark-border px-4 py-2"
          style={{ paddingBottom: Math.max(insets.bottom, 8) }}
        >
          <View className="flex-row items-center gap-2">
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ask about cycle, cramps, mood, nutrition..."
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={500}
              className="flex-1 max-h-24 bg-gray-100 dark:bg-dark-card-hover rounded-2xl px-4 py-3 text-sm text-text dark:text-dark-text"
            />
            <Pressable
              onPress={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className={`w-11 h-11 rounded-full items-center justify-center ${
                input.trim() && !isLoading ? 'bg-pink-primary active:opacity-90' : 'bg-gray-200 dark:bg-dark-card-hover'
              }`}
            >
              <Icon
                name={ICONS.send}
                size={18}
                color={input.trim() && !isLoading ? 'white' : '#9CA3AF'}
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
