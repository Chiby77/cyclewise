import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '@/components/Icon';
import { Mascot } from '@/components/Mascot';
import { ICONS } from '@/theme/icon-map';
import { colors } from '@/theme/colors';
import { sendGroqChat, ChatMessage } from '@/lib/groq';
import type { AppNavigationProp } from '@/navigation/types';

const QUICK_SUGGESTIONS = [
  'How can I naturally ease cramps?',
  'What foods boost energy during period?',
  'Common signs of ovulation',
  'Why does mood change before period?',
];

export function AIHealthAssistantScreen() {
  const navigation = useNavigation<AppNavigationProp>();
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
    <View className="flex-1 bg-bg">
      <SafeAreaView edges={['top']} className="bg-white border-b border-gray-100">
        <View className="flex-row items-center justify-between px-4 py-3">
          <Pressable onPress={() => navigation.goBack()} className="p-1">
            <Icon name={ICONS.back} size={22} color={colors.text} />
          </Pressable>
          <View className="items-center">
            <View className="flex-row items-center gap-1.5">
              <Text className="text-base font-extrabold text-text">AI Health Assistant</Text>
              <View className="w-2 h-2 rounded-full bg-emerald-500" />
            </View>
            <Text className="text-[10px] font-semibold text-muted">Powered by Groq LLaMA</Text>
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
            className="p-1"
          >
            <Icon name={ICONS.refresh} size={18} color={colors.muted} />
          </Pressable>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4"
          contentContainerClassName="py-4 pb-8"
          keyboardShouldPersistTaps="handled"
        >
          {/* Medical Disclaimer Banner */}
          <View className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 mb-4 flex-row items-start gap-2.5">
            <Icon name={ICONS.warning} size={18} color="#D97706" />
            <Text className="text-xs text-amber-900 flex-1 font-medium leading-relaxed">
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
                  <View className="w-8 h-8 rounded-full bg-pink-light items-center justify-center mr-2 mt-1">
                    <Icon name={ICONS.sparkles} size={16} color={colors.pinkPrimary} />
                  </View>
                )}
                <View
                  className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                    isUser ? 'bg-pink-primary' : 'bg-white border border-gray-100'
                  }`}
                >
                  <Text
                    className={`text-sm leading-relaxed ${
                      isUser ? 'text-white font-medium' : 'text-text'
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
              <View className="w-8 h-8 rounded-full bg-pink-light items-center justify-center mr-2">
                <ActivityIndicator size="small" color={colors.pinkPrimary} />
              </View>
              <View className="bg-white rounded-2xl px-4 py-3 border border-gray-100">
                <Text className="text-xs font-semibold text-muted">CycleWise AI is thinking...</Text>
              </View>
            </View>
          )}

          {/* Quick suggestions when history is short */}
          {messages.length <= 2 && !isLoading && (
            <View className="mt-4">
              <Text className="text-xs font-bold text-muted mb-2">Suggested questions:</Text>
              <View className="flex-row flex-wrap gap-2">
                {QUICK_SUGGESTIONS.map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => handleSend(item)}
                    className="bg-white border border-pink-light rounded-full px-3.5 py-2 active:opacity-80"
                  >
                    <Text className="text-xs font-semibold text-pink-primary">{item}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Bar */}
        <SafeAreaView edges={['bottom']} className="bg-white border-t border-gray-100 px-4 py-2">
          <View className="flex-row items-center gap-2">
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ask about cycle, cramps, mood, nutrition..."
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={500}
              className="flex-1 max-h-24 bg-gray-100 rounded-2xl px-4 py-3 text-sm text-text"
            />
            <Pressable
              onPress={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className={`w-11 h-11 rounded-full items-center justify-center ${
                input.trim() && !isLoading ? 'bg-pink-primary' : 'bg-gray-200'
              }`}
            >
              <Icon
                name={ICONS.send}
                size={18}
                color={input.trim() && !isLoading ? 'white' : '#9CA3AF'}
              />
            </Pressable>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}
