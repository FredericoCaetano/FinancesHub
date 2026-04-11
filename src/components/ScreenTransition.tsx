import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useIsFocused, useNavigationState } from '@react-navigation/native';

let lastTabIndex = 0;

type ScreenTransitionProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function ScreenTransition({
  children,
  style,
}: ScreenTransitionProps) {
  const isFocused = useIsFocused();
  const currentIndex = useNavigationState(state => state.index ?? 0);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    if (!isFocused) return;

    const direction = currentIndex >= lastTabIndex ? 1 : -1;
    lastTabIndex = currentIndex;
    const startOffset = direction * Math.max(16, screenWidth * 0.12);

    opacity.setValue(0);
    translateX.setValue(startOffset);

    let animation: Animated.CompositeAnimation | null = null;
    const frame = requestAnimationFrame(() => {
      animation = Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: 0,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]);
      animation.start();
    });

    return () => {
      cancelAnimationFrame(frame);
      if (animation) animation.stop();
    };
  }, [currentIndex, isFocused, opacity, screenWidth, translateX]);

  return (
    <Animated.View
      style={[
        { flex: 1, opacity, transform: [{ translateX }] },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}
