import React from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedInputProps = TextInputProps & {
  lightColor?: string;
  darkColor?: string;
  themedStyle?: StyleSheet;
};

export function ThemedInput({
  style,
  lightColor,
  darkColor,
  themedStyle,
  ...rest
}: ThemedInputProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  const color = useThemeColor({ light: darkColor, dark: lightColor }, 'text');
  const borderColor = color;
  const placeholderColor = useThemeColor({ light: '#888', dark: '#bbb' }, 'text');

  return (
    <TextInput
      style={[
        styles.defaultInput,
        { backgroundColor, color, borderColor },
        style,
      ]}
      placeholderTextColor={placeholderColor}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  defaultInput: {
    borderWidth: 1,
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
  },
});