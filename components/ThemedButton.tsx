import React from 'react';
import { StyleSheet, Button, ButtonProps, View, Text, type ViewProps, type TextProps } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedButtonProps = ButtonProps & {
  lightColor?: string;
  darkColor?: string;
  themedStyle?: StyleSheet;
  containerStyle?: ViewProps['style'];
  titleStyle?: TextProps['style'];
  title?: string;
};

export function ThemedButton({
  lightColor,
  darkColor,
  themedStyle,
  containerStyle,
  titleStyle,
  title,
  ...rest
}: ThemedButtonProps) {
  return (
    <View style={[styles.defaultButtonContainer, containerStyle]}>
      <Button
        title={title || 'Button'}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  defaultButtonContainer: {
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    lineHeight: 24,
  },
});