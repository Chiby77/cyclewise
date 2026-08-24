import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';

import { CustomTabBar } from './CustomTabBar';
import type { RootStackParamList, TabParamList } from './types';

import { HomeScreen } from '@/screens/HomeScreen';
import { CalendarScreen } from '@/screens/CalendarScreen';
import { StatisticsScreen } from '@/screens/StatisticsScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { SymptomsLogScreen } from '@/screens/SymptomsLogScreen';
import { CycleInfoScreen } from '@/screens/CycleInfoScreen';
import { LogPeriodScreen } from '@/screens/LogPeriodScreen';
import { WidgetsScreen } from '@/screens/WidgetsScreen';
import { LockAppScreen } from '@/screens/LockAppScreen';
import { ExportReportScreen } from '@/screens/ExportReportScreen';
import { LanguageModalScreen } from '@/screens/LanguageModalScreen';
import { AIHealthAssistantScreen } from '@/screens/AIHealthAssistantScreen';
import { SignInScreen } from '@/screens/SignInScreen';
import { SignUpScreen } from '@/screens/SignUpScreen';
import { AccountScreen } from '@/screens/AccountScreen';
import { TermsScreen } from '@/screens/TermsScreen';
import { PrivacyPolicyScreen } from '@/screens/PrivacyPolicyScreen';
import { useAuth } from '@/context/AuthContext';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function LogTabPlaceholder() {
  return <View />;
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="LogTab" component={LogTabPlaceholder} />
      <Tab.Screen name="Statistics" component={StatisticsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { isAuthenticated } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Group>
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="Terms" component={TermsScreen} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        </Stack.Group>
      ) : (
        <Stack.Group>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen
            name="SymptomsLog"
            component={SymptomsLogScreen}
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen name="CycleInfo" component={CycleInfoScreen} />
          <Stack.Screen name="LogPeriod" component={LogPeriodScreen} />
          <Stack.Screen name="Widgets" component={WidgetsScreen} />
          <Stack.Screen name="LockApp" component={LockAppScreen} />
          <Stack.Screen name="ExportReport" component={ExportReportScreen} />
          <Stack.Screen
            name="Language"
            component={LanguageModalScreen}
            options={{ presentation: 'transparentModal', animation: 'fade' }}
          />
          <Stack.Screen name="AIHealthAssistant" component={AIHealthAssistantScreen} />
          <Stack.Screen name="Account" component={AccountScreen} />
          <Stack.Screen name="Terms" component={TermsScreen} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}
