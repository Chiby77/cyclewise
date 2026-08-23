import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Mascot } from '@/components/Mascot';
import { StatCard } from '@/components/StatCard';
import { MultiSelectSection } from '@/components/SectionCard';
import { Icon } from '@/components/Icon';
import { ICONS } from '@/theme/icon-map';
import { colors } from '@/theme/colors';
import type { AppNavigationProp } from '@/navigation/types';
import { useDailyLog } from '@/hooks/useDailyLog';
import { formatDateKey } from '@/hooks/useCycleData';

export function SymptomsLogScreen() {
  const navigation = useNavigation<AppNavigationProp>();
  const todayStr = useMemo(() => formatDateKey(new Date()), []);
  const { dailyLog, updateLog } = useDailyLog(todayStr);

  const [flow, setFlow] = useState<string[]>(dailyLog.flow ? [dailyLog.flow] : ['Light']);
  const [sex, setSex] = useState<string[]>(
    dailyLog.sex_activity.length > 0 ? dailyLog.sex_activity : ['Did not have sex']
  );
  const [mood, setMood] = useState<string[]>(
    dailyLog.moods.length > 0 ? dailyLog.moods : ['Calm']
  );
  const [symptoms, setSymptoms] = useState<string[]>(
    dailyLog.symptoms.length > 0 ? dailyLog.symptoms : ['Cramps', 'Tender breasts']
  );
  const [discharge, setDischarge] = useState<string[]>(
    dailyLog.discharge ? [dailyLog.discharge] : ['No discharge']
  );
  const [digestion, setDigestion] = useState<string[]>(
    dailyLog.digestion.length > 0 ? dailyLog.digestion : ['Diarrhea']
  );
  const [pregnancy, setPregnancy] = useState<string[]>(
    dailyLog.tests?.pregnancy ? [dailyLog.tests.pregnancy] : ["Didn't take tests"]
  );
  const [ovulation, setOvulation] = useState<string[]>(
    dailyLog.tests?.ovulation ? [dailyLog.tests.ovulation] : ["Didn't take tests"]
  );
  const [activity, setActivity] = useState<string[]>(
    dailyLog.physical_activity.length > 0 ? dailyLog.physical_activity : ["Didn't exercise"]
  );
  const [others, setOthers] = useState<string[]>(dailyLog.other_factors || []);
  const [note, setNote] = useState(dailyLog.note || '');

  const toggleSingle = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (label: string) => {
    setter((prev) => (prev.includes(label) ? [] : [label]));
  };

  const toggleMulti = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (label: string) => {
    setter((prev) => (prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]));
  };

  const handleSave = () => {
    updateLog({
      flow: flow[0] || null,
      sex_activity: sex,
      moods: mood,
      symptoms,
      discharge: discharge[0] || null,
      digestion,
      tests: {
        pregnancy: pregnancy[0],
        ovulation: ovulation[0],
      },
      physical_activity: activity,
      other_factors: others,
      note,
    });
    navigation.goBack();
  };

  return (
    <View className="flex-1 bg-bg">
      <SafeAreaView edges={['top']} className="bg-white">
        <View className="flex-row items-center justify-between px-4 pb-3 pt-2">
          <Pressable onPress={() => navigation.goBack()} className="p-1">
            <Icon name={ICONS.back} size={22} color={colors.text} />
          </Pressable>
          <View className="items-center">
            <Text className="text-base font-extrabold text-text">Symptoms Log</Text>
            <Text className="text-xs text-muted font-semibold">
              Today, {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </Text>
          </View>
          <Pressable onPress={() => navigation.navigate('AIHealthAssistant')} className="p-1">
            <Icon name={ICONS.sparkles} size={20} color={colors.pinkPrimary} />
          </Pressable>
        </View>
        <View className="flex-row gap-2 px-4 py-3">
          <StatCard
            label="Weight"
            value={dailyLog.weight ? String(dailyLog.weight) : '45.6'}
            unit="kg"
            icon={ICONS.weight}
          />
          <StatCard
            label="Temperature"
            value={dailyLog.temperature ? String(dailyLog.temperature) : '36.5'}
            unit="C"
            icon={ICONS.temperature}
          />
          <StatCard
            label="Sleep"
            value={dailyLog.sleep_minutes ? String(dailyLog.sleep_minutes) : '480'}
            unit="min"
            icon={ICONS.sleep}
          />
          <StatCard
            label="Drink"
            value={dailyLog.water_ml ? String(dailyLog.water_ml) : '460'}
            unit="ml"
            icon={ICONS.drink}
          />
        </View>
      </SafeAreaView>

      <ScrollView className="flex-1" contentContainerClassName="pb-32">
        <View>
          <Mascot className="absolute right-4 top-2 z-10" />
        </View>

        <MultiSelectSection
          icon={ICONS.flowMedium}
          title="Menstrual flow"
          items={[
            { icon: ICONS.flowLight, label: 'Light' },
            { icon: ICONS.flowMedium, label: 'Medium' },
            { icon: ICONS.flowHeavy, label: 'Heavy' },
            { icon: ICONS.clot, label: 'Blood Clots' },
          ]}
          selected={flow}
          onToggle={toggleSingle(setFlow)}
        />
        <MultiSelectSection
          icon={ICONS.heartOutline}
          title="Sex"
          items={[
            { icon: ICONS.noSex, label: 'Did not have sex' },
            { icon: ICONS.protectedSex, label: 'Protected sex' },
            { icon: ICONS.unprotectedSex, label: 'Unprotected sex' },
            { icon: ICONS.oralSex, label: 'Oral Sex' },
            { icon: ICONS.analSex, label: 'Anal Sex' },
            { icon: ICONS.masturbation, label: 'Masturbation' },
            { icon: ICONS.touch, label: 'Sensual Touch' },
            { icon: ICONS.toys, label: 'Sex Toys' },
            { icon: ICONS.orgasm, label: 'Orgasm' },
            { icon: ICONS.highDrive, label: 'High sex drive' },
            { icon: ICONS.neutralDrive, label: 'Neutral Sex Drive' },
            { icon: ICONS.lowDrive, label: 'Low Sex Drive' },
          ]}
          selected={sex}
          onToggle={toggleMulti(setSex)}
        />
        <MultiSelectSection
          icon={ICONS.happy}
          title="Mood"
          items={[
            { icon: ICONS.calm, label: 'Calm' },
            { icon: ICONS.happy, label: 'Happy' },
            { icon: ICONS.energetic, label: 'Energetic' },
            { icon: ICONS.frisky, label: 'Frisky' },
            { icon: ICONS.moodSwings, label: 'Mood swings' },
            { icon: ICONS.irritated, label: 'Irritated' },
            { icon: ICONS.sad, label: 'Sad' },
            { icon: ICONS.anxious, label: 'Anxious' },
            { icon: ICONS.depressed, label: 'Depressed' },
            { icon: ICONS.guilty, label: 'Feeling guilty' },
            { icon: ICONS.obsessive, label: 'Obsessive thoughts' },
            { icon: ICONS.apathetic, label: 'Apathetic' },
            { icon: ICONS.confused, label: 'Confused' },
            { icon: ICONS.selfCritical, label: 'Very self critical' },
            { icon: ICONS.lowEnergy, label: 'Low Energy' },
          ]}
          selected={mood}
          onToggle={toggleMulti(setMood)}
        />
        <MultiSelectSection
          icon={ICONS.cramps}
          title="Symptoms"
          items={[
            { icon: ICONS.fine, label: 'Everything is fine' },
            { icon: ICONS.cramps, label: 'Cramps' },
            { icon: ICONS.tenderBreasts, label: 'Tender breasts' },
            { icon: ICONS.headache, label: 'Headache' },
            { icon: ICONS.acne, label: 'Acne' },
            { icon: ICONS.backache, label: 'Backache' },
            { icon: ICONS.fatigue, label: 'Fatigue' },
            { icon: ICONS.cravings, label: 'Cravings' },
            { icon: ICONS.insomnia, label: 'Insomnia' },
            { icon: ICONS.abdominalPain, label: 'Abdominal pain' },
            { icon: ICONS.perineumPain, label: 'Perineum pain' },
            { icon: ICONS.swelling, label: 'Swelling' },
            { icon: ICONS.vaginalItching, label: 'Vaginal Itching' },
            { icon: ICONS.vaginalDryness, label: 'Vaginal Dryness' },
          ]}
          selected={symptoms}
          onToggle={toggleMulti(setSymptoms)}
        />
        <View>
          <Mascot className="absolute right-4 top-2 z-10" />
        </View>
        <MultiSelectSection
          icon={ICONS.watery}
          title="Vaginal Discharge"
          items={[
            { icon: ICONS.noDischarge, label: 'No discharge' },
            { icon: ICONS.spotting, label: 'Spotting' },
            { icon: ICONS.sticky, label: 'Sticky' },
            { icon: ICONS.creamy, label: 'Creamy' },
            { icon: ICONS.eggWhite, label: 'Egg White' },
            { icon: ICONS.watery, label: 'Watery' },
            { icon: ICONS.unusual, label: 'Unusual' },
            { icon: ICONS.clumpyWhite, label: 'Clumpy White' },
            { icon: ICONS.gray, label: 'Gray' },
          ]}
          selected={discharge}
          onToggle={toggleSingle(setDischarge)}
        />
        <MultiSelectSection
          icon={ICONS.bloating}
          title="Digestion and stool"
          items={[
            { icon: ICONS.nausea, label: 'Nausea' },
            { icon: ICONS.bloating, label: 'Bloating' },
            { icon: ICONS.constipation, label: 'Constipation' },
            { icon: ICONS.diarrhea, label: 'Diarrhea' },
          ]}
          selected={digestion}
          onToggle={toggleMulti(setDigestion)}
        />
        <MultiSelectSection
          icon={ICONS.eggWhite}
          title="Pregnancy Test"
          items={[
            { icon: ICONS.noTest, label: "Didn't take tests" },
            { icon: ICONS.positive, label: 'Positive' },
            { icon: ICONS.negative, label: 'Negative' },
            { icon: ICONS.faintLine, label: 'Faint Line' },
          ]}
          selected={pregnancy}
          onToggle={toggleSingle(setPregnancy)}
        />
        <MultiSelectSection
          icon={ICONS.ovulationMethod}
          title="Ovulation Test"
          items={[
            { icon: ICONS.noTest, label: "Didn't take tests" },
            { icon: ICONS.positive, label: 'Test: positive' },
            { icon: ICONS.negative, label: 'Test: negative' },
            { icon: ICONS.ovulationMethod, label: 'Ovulation: my method' },
          ]}
          selected={ovulation}
          onToggle={toggleSingle(setOvulation)}
        />
        <MultiSelectSection
          icon={ICONS.gym}
          title="Physical Activity"
          items={[
            { icon: ICONS.noExercise, label: "Didn't exercise" },
            { icon: ICONS.yoga, label: 'Yoga' },
            { icon: ICONS.gym, label: 'Gym' },
            { icon: ICONS.dance, label: 'Aerobics and dancing' },
            { icon: ICONS.swimming, label: 'Swimming' },
            { icon: ICONS.teamSports, label: 'Team sports' },
            { icon: ICONS.running, label: 'Running' },
            { icon: ICONS.cycling, label: 'Cycling' },
            { icon: ICONS.walking, label: 'Walking' },
          ]}
          selected={activity}
          onToggle={toggleMulti(setActivity)}
        />
        <MultiSelectSection
          icon={ICONS.more}
          title="Others"
          items={[
            { icon: ICONS.travel, label: 'Travel' },
            { icon: ICONS.stress, label: 'Stress' },
            { icon: ICONS.disease, label: 'Disease or injury' },
            { icon: ICONS.alcohol, label: 'Alcohol' },
            { icon: ICONS.meditation, label: 'Meditation' },
            { icon: ICONS.journaling, label: 'Journaling' },
            { icon: ICONS.kegel, label: 'Kegel exercises' },
            { icon: ICONS.breathing, label: 'Breathing exercises' },
          ]}
          selected={others}
          onToggle={toggleMulti(setOthers)}
        />

        <View className="bg-white rounded-2xl p-4 shadow-sm mx-4 mb-3">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-2">
              <Icon name={ICONS.note} size={20} color={colors.pinkPrimary} />
              <Text className="text-base font-bold text-text">Note</Text>
            </View>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => setNote('')}
                className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center"
              >
                <Icon name={ICONS.trash} size={16} color="#6B7280" />
              </Pressable>
            </View>
          </View>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Log a symptoms or make a note"
            placeholderTextColor="#C7C7CC"
            multiline
            textAlignVertical="top"
            className="h-24 text-sm text-text font-semibold"
          />
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} className="absolute bottom-0 left-0 right-0 bg-bg px-4 pt-4">
        <Pressable
          onPress={handleSave}
          className="w-full py-4 rounded-full bg-pink-primary items-center shadow-md mb-4 active:opacity-90"
        >
          <Text className="text-white text-base font-bold">Save</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}
