import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '@/components/Icon';
import { ICONS } from '@/theme/icon-map';
import type { AppNavigationProp } from '@/navigation/types';
import { colors } from '@/theme/colors';

const LANGUAGES = [
  'Auto',
  'Isindebele (North Ndebele)',
  'English (English)',
  'Afrikaans (Afrikaans)',
  'Azərbaycan (Azerbaijani)',
  'Català (Catalan)',
  'Dansk (Danish)',
  'Deutsch (German)',
  'Eesti (Estonian)',
  'Español (Spanish)',
  'Euskara (Basque)',
  'Français (French)',
  'Gaeilge (Irish)',
  'Hrvatski (Croatian)',
  'Italiano (Italian)',
  'Magyar (Hungarian)',
];

export function LanguageModalScreen() {
  const navigation = useNavigation<AppNavigationProp>();
  const [selected, setSelected] = useState('Auto');

  return (
    <View className="flex-1 bg-black/40 justify-end">
      <View className="w-full bg-white rounded-t-3xl overflow-hidden" style={{ maxHeight: '85%' }}>
        <View className="flex-row items-center justify-between px-5 py-4" style={{ backgroundColor: colors.pinkPrimary }}>
          <View style={{ width: 20 }} />
          <Text className="text-base font-extrabold text-white">Select Language</Text>
          <Pressable onPress={() => navigation.goBack()}>
            <Icon name={ICONS.close} size={20} color="white" />
          </Pressable>
        </View>

        <ScrollView className="px-5" style={{ maxHeight: 320 }}>
          {LANGUAGES.map((lang) => (
            <Pressable
              key={lang}
              onPress={() => setSelected(lang)}
              className="flex-row items-center gap-3 py-3 border-b border-gray-100"
            >
              <View
                className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                  selected === lang ? 'border-pink-primary' : 'border-gray-300'
                }`}
              >
                {selected === lang && <View className="w-2.5 h-2.5 rounded-full bg-pink-primary" />}
              </View>
              <Text className="text-sm font-semibold text-text">{lang}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <SafeAreaView edges={['bottom']} className="flex-row gap-3 px-5 pt-4 border-t border-gray-100">
          <Pressable onPress={() => navigation.goBack()} className="flex-1 py-3 rounded-full items-center">
            <Text className="text-sm font-bold text-muted">Cancel</Text>
          </Pressable>
          <Pressable onPress={() => navigation.goBack()} className="flex-1 py-3 rounded-full bg-pink-primary items-center">
            <Text className="text-sm font-bold text-white">Done</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    </View>
  );
}
