/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

export const UI_Colors = {
  LIGHT_GREEN: '#004838',
  DARK_GREEN: '#073127',
  GRAY: '#333F3C',
  YELLOW: '#E2FB6C',
  WHITE: '#EBEDE8',
  RED: '#FB4570',
  ORANGE: '#FD7F20'
}

const tintColorLight = UI_Colors.LIGHT_GREEN;
const tintColorDark = UI_Colors.WHITE;

export const Colors = {
  light: {
    text: UI_Colors.GRAY,
    background: UI_Colors.WHITE,
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    link: UI_Colors.LIGHT_GREEN
  },
  dark: {
    text: UI_Colors.WHITE,
    background: UI_Colors.GRAY,
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    link: UI_Colors.YELLOW
  },
};
