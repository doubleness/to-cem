import { View, StyleSheet, Text } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { Card } from "./Card";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { promotions } from "@/data/promotions";

export const Tarot = () => {
  const shuffleBack = useSharedValue(false);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>To cem!</Text>
        {promotions.map((card, index) => (
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
  title: {
    fontFamily: 'MiniStory',
    fontSize: 70,
    textAlign: "center",
    marginTop: 140,
    color: 'white'
  },
});
