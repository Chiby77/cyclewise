import type { CompositeNavigationProp, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

export type TabParamList = {
  Home: undefined;
  Calendar: undefined;
  LogTab: undefined; // dummy tab — pressing it opens the SymptomsLog modal instead
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
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

/**
 * One navigation prop type used by every screen. It's a composite of the
 * tab navigator and the root stack, so both `navigation.navigate('Calendar')`
 * (a tab) and `navigation.navigate('CycleInfo')` (a stack screen pushed on
 * top of the tabs) type-check correctly no matter which screen calls it.
 */
export type AppNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

