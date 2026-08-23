import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Svg, { Line, Path, Circle, Rect, Text as SvgText } from 'react-native-svg';
import { Mascot } from '@/components/Mascot';
import { Icon } from '@/components/Icon';
import { ICONS } from '@/theme/icon-map';
import type { AppNavigationProp } from '@/navigation/types';
import { colors } from '@/theme/colors';

const DAYS = [
  { label: 'THU', sub: 'Aug 20' },
  { label: 'FRI', sub: 'Aug 21', active: true },
  { label: 'SAT', sub: 'Aug 22' },
];

const W = 300;
const H = 120;
const POINTS: [number, number][] = [
  [0, 105], [20, 103], [40, 100], [60, 97], [80, 92], [100, 88],
  [120, 83], [140, 75], [160, 60], [180, 40], [200, 22], [220, 10],
  [240, 18], [260, 35], [280, 55], [300, 70],
];
const periodPath = POINTS.slice(0, 3).map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
const fertilePath = POINTS.slice(2).map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');

const ADVICE_SECTIONS = [
  {
    title: 'Nutrition & Hydration',
    items: [
      'Iron-rich foods: red meat, spinach, lentils, whole grains.',
      'Pair with vitamin C (citrus, peppers, kiwi).',
      'Anti-bloating snacks: banana, yogurt, ginger tea.',
      'Hydrate: ~8 glasses water + coconut water / electrolytes.',
    ],
  },
  {
    title: 'Gentle Movement',
    items: ['10–15 minutes walk.', 'Light yoga/stretching; avoid intense core'],
  },
  {
    title: 'Sleep & Rest',
    items: [
      'Dim lights; use white noise or soft music.',
      'Avoid caffeine/alcohol >= 4 hours before bed.',
      'Keep room cool, ventilated.',
    ],
  },
];

const LEGEND = [
  { color: colors.pinkPrimary, label: 'Period day' },
  { color: colors.teal, label: 'Fertile day' },
  { color: colors.muted, label: 'Normal day' },
];

export function CycleInfoScreen() {
  const navigation = useNavigation<AppNavigationProp>();

  return (
    <View className="flex-1 bg-bg">
      <SafeAreaView edges={['top']} className="bg-white">
        <View className="flex-row items-center justify-between px-4 pb-3 pt-2">
          <Pressable onPress={() => navigation.goBack()} className="p-1">
            <Icon name={ICONS.back} size={22} color={colors.text} />
          </Pressable>
          <View className="flex-row items-center gap-1.5">
            <Text className="text-base font-extrabold text-text">Cycle information</Text>
            <Icon name={ICONS.warning} size={16} color="#F59E0B" />
          </View>
          <View className="w-6" />
        </View>
        <View className="flex-row justify-around px-4 pb-3">
          {DAYS.map((d, i) => (
            <View key={i} className="items-center">
              <Text className={`text-xs font-bold ${d.active ? 'text-pink-primary' : 'text-muted'}`}>{d.label}</Text>
              <Text className={`text-sm font-extrabold ${d.active ? 'text-pink-primary' : 'text-text'}`}>{d.sub}</Text>
            </View>
          ))}
        </View>
      </SafeAreaView>

      <ScrollView className="flex-1" contentContainerClassName="pb-4">
        {/* Fertility chart */}
        <View className="bg-white mx-4 mt-3 rounded-2xl p-4 shadow-sm mb-3">
          <Text className="text-xs font-bold text-muted mb-2">Fertility</Text>
          <Svg width="100%" height={140} viewBox={`0 0 ${W} ${H + 20}`} preserveAspectRatio="none">
            {[0, 30, 60, 90].map((y) => (
              <Line key={y} x1={0} y1={y + 10} x2={W} y2={y + 10} stroke="#E5E5E5" strokeWidth={0.5} strokeDasharray="3,3" />
            ))}
            <Path d={periodPath} stroke={colors.pinkPrimary} strokeWidth={2.5} fill="none" strokeLinecap="round" />
            <Path d={fertilePath} stroke={colors.teal} strokeWidth={2.5} fill="none" strokeLinecap="round" />
            <Circle cx={POINTS[1][0]} cy={POINTS[1][1]} r={5} fill="white" stroke={colors.pinkPrimary} strokeWidth={2} />
            <Rect x={0} y={80} width={72} height={30} rx={6} fill={colors.pinkPrimary} />
            <SvgText x={36} y={93} textAnchor="middle" fill="white" fontSize={8} fontWeight="bold">
              Today
            </SvgText>
            <SvgText x={36} y={104} textAnchor="middle" fill="white" fontSize={7}>
              Very low
            </SvgText>
            <Circle cx={POINTS[10][0]} cy={POINTS[10][1]} r={6} fill={colors.teal} stroke="white" strokeWidth={2} />
            <SvgText x={POINTS[10][0] + 6} y={POINTS[10][1] - 6} fill={colors.text} fontSize={7} fontWeight="bold">
              Ovulation dat
            </SvgText>
            <SvgText x={POINTS[10][0] + 6} y={POINTS[10][1] + 4} fill={colors.text} fontSize={7}>
              2/9
            </SvgText>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((d, i) => (
              <SvgText
                key={d}
                x={(i / 13) * W}
                y={H + 18}
                textAnchor="middle"
                fontSize={7}
                fill={d === 2 ? colors.pinkPrimary : colors.muted}
                fontWeight={d === 2 ? 'bold' : 'normal'}
              >
                {d}
              </SvgText>
            ))}
          </Svg>
          <View className="flex-row gap-4 mt-1">
            {LEGEND.map((l) => (
              <View key={l.label} className="flex-row items-center gap-1">
                <View className="w-6 h-0.5 rounded" style={{ backgroundColor: l.color }} />
                <Text className="text-[10px] font-semibold text-muted">{l.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Advice card */}
        <View className="mx-4 rounded-2xl p-4 mb-3" style={{ backgroundColor: '#B2DFDB' }}>
          <Mascot className="absolute right-0 top-2" />
          {ADVICE_SECTIONS.map((section) => (
            <View key={section.title} className="mb-4">
              <View className="flex-row items-center gap-2 mb-1">
                <View className="w-2 h-2 rounded-full bg-teal" />
                <Text className="font-extrabold text-text text-sm">{section.title}</Text>
              </View>
              {section.items.map((item) => (
                <View key={item} className="flex-row gap-1 pl-4">
                  <Text className="text-xs font-semibold text-text">•</Text>
                  <Text className="text-xs font-semibold text-text flex-1">{item}</Text>
                </View>
              ))}
            </View>
          ))}
          <View className="flex-row gap-3 justify-center mt-2">
            <View className="w-12 h-12 rounded-full bg-pink-light items-center justify-center">
              <Icon name={ICONS.stretching} size={22} color={colors.pinkPrimary} />
            </View>
            <View className="w-12 h-12 rounded-full bg-[#E8F5E9] items-center justify-center">
              <Icon name={ICONS.walkOutline} size={22} color="#2E7D32" />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
