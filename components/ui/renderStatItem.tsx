import { UI_Colors } from "@/constants/Colors";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";
import { PlayerStat, WordStat } from "@/app/game/stats";
import { StyleSheet, useColorScheme } from "react-native";

export const renderStatItem = ({ item, index, theme }: { item: WordStat | PlayerStat, index: number, theme: string }) => {

  let bgColor = theme === 'dark' ? UI_Colors.GRAY : UI_Colors.LIGHT_GREEN;
  let color = UI_Colors.WHITE;
  if (index % 2 === 0) {
    bgColor = UI_Colors.WHITE;
    color = UI_Colors.GRAY
  }

  let isWord = 'word' in item;

  return (
    <ThemedView
      className='flex flex-row py-2 justify-between px-4'
      style={{ backgroundColor: bgColor, borderRadius: 4 }}>
      <ThemedText style={{ color }}>#{++index}</ThemedText>
      <ThemedText
        className='font-bold'
        style={{ ...styles.item, color }}>
        {'word' in item ? item.word : item.user}
      </ThemedText>
      <ThemedText
        className='font-bold'
        style={{ ...styles.item, color }}>
        {isWord ? 'Guessed' : 'Wins'}: {'totalGuesses' in item ? item.totalGuesses : item.totalWins}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  item: {
    fontSize: 16,
  }
});