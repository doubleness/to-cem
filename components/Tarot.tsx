import { View, StyleSheet } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { Card } from "./Card";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const cards = [
  {
    source: require("../assets/images/letak.jpg"),
  },
  {
    source: require("../assets/images/letak.jpg"),
  },
  {
    source: require("../assets/images/letak.jpg"),
  },
  {
    source: require("../assets/images/letak.jpg"),
  },
  {
    source: require("../assets/images/letak.jpg"),
  },
  {
    source: require("../assets/images/letak.jpg"),
  },
  {
    source: require("../assets/images/letak.jpg"),
  },
  {
    source: require("../assets/images/letak.jpg"),
  },
];

export const assets = cards.map((card) => card.source);

export const Tarot = () => {
  const shuffleBack = useSharedValue(false);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {cards.map((card, index) => (
          <Card card={card} key={index} index={index} shuffleBack={shuffleBack} />
        ))}
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "lightblue",
  },
});
