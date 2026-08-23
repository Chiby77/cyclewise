import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import Svg, { Ellipse, Circle, Path, Text as SvgText } from 'react-native-svg';

type Props = {
  style?: StyleProp<ViewStyle>;
  className?: string;
};

/** The little bunny/mouse mascot that shows up on several cards throughout the app. */
export function Mascot({ style, className }: Props) {
  return (
    <View style={style} className={className} pointerEvents="none">
      <Svg width={60} height={68} viewBox="0 0 60 68" fill="none">
        <SvgText x={39} y={9} fontSize={9} fill="#F06292">
          ✦
        </SvgText>
        <SvgText x={49} y={17} fontSize={6} fill="#F06292">
          ✦
        </SvgText>
        <Ellipse cx={26} cy={47} rx={21} ry={19} fill="#F48FB1" />
        <Ellipse cx={9} cy={34} rx={7} ry={9} fill="#F48FB1" />
        <Ellipse cx={43} cy={34} rx={7} ry={9} fill="#F48FB1" />
        <Ellipse cx={9} cy={34} rx={4} ry={6} fill="#F8BBD0" />
        <Ellipse cx={43} cy={34} rx={4} ry={6} fill="#F8BBD0" />
        <Circle cx={20} cy={45} r={4} fill="white" />
        <Circle cx={32} cy={45} r={4} fill="white" />
        <Circle cx={21} cy={46} r={2.5} fill="#1C1C1E" />
        <Circle cx={33} cy={46} r={2.5} fill="#1C1C1E" />
        <Circle cx={22} cy={45} r={1} fill="white" />
        <Circle cx={34} cy={45} r={1} fill="white" />
        <Circle cx={15} cy={51} r={3} fill="#F06292" opacity={0.4} />
        <Circle cx={37} cy={51} r={3} fill="#F06292" opacity={0.4} />
        <Path d="M22 54 Q26 58 30 54" stroke="#1C1C1E" strokeWidth={1.5} fill="none" strokeLinecap="round" />
        <Path d="M47 47 Q55 41 53 33" stroke="#F48FB1" strokeWidth={4.5} fill="none" strokeLinecap="round" />
        <Circle cx={53} cy={31} r={3.5} fill="#F48FB1" />
      </Svg>
    </View>
  );
}
