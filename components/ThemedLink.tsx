import React from 'react';
import { StyleSheet, Text, type TextStyle, View, type ViewStyle } from 'react-native';
import { Link } from 'expo-router';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedLinkProps = React.ComponentProps<typeof Link> & {
  lightColor?: string;
  darkColor?: string;
  linkTextStyle?: TextStyle;
  linkContainerStyle?: ViewStyle;
};

export function ThemedLink({
  style,
  lightColor,
  darkColor,
  linkTextStyle,
  linkContainerStyle,
  children,
  ...rest
}: ThemedLinkProps) {
  const linkColor = useThemeColor({ light: lightColor, dark: darkColor }, 'link');

  return (
    <Link
      href={rest.href}
      style={[styles.linkText, { color: linkColor }, style]}
      {...rest}
    >
      {children}
    </Link>
  );
}

const styles = StyleSheet.create({
  linkText: {
    lineHeight: 30,
    fontSize: 16,
    // Color will be applied dynamically
  },
});