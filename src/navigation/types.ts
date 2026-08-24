import type { CompositeNavigationProp, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

export type TabParamList = {
  Home: undefined;
  Calendar: undefined;
  LogTab: undefined;
  Statistics: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  MainTabs: NavigatorScreenParams<TabParamList>;
  SymptomsLog: undefined;
  CycleInfo: undefined;
  LogPeriod: undefined;
  Widgets: undefined;
  LockApp: undefined;
  ExportReport: undefined;
  Language: undefined;
  AIHealthAssistant: undefined;
  Account: undefined;
  Terms: undefined;
  PrivacyPolicy: undefined;
};

declare global {

  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type AppNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

