import { Promotion } from "@/data/promotions";
import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions, Image } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";

const { width: wWidth, height } = Dimensions.get("window");
const CARD_WIDTH = wWidth - 50;
const CARD_HEIGHT = CARD_WIDTH;
const IMAGE_WIDTH = 1014;
const IMAGE_HEIGHT = 1420;
const IMAGE_SCALE=1.4;
const DURATION = 250;

interface CardProps {
  card:Promotion;
  shuffleBack: Animated.SharedValue<boolean>;
  index: number;
}

export const Card = ({ card, shuffleBack, index }: CardProps) => {
  const offset = useSharedValue({ x: 0, y: 0 });
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(-height);
  const scale = useSharedValue(1);
  const rotateZ = useSharedValue(0);
  const delay = index * DURATION;
  const theta = -10 + Math.random() * 20;

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withTiming(0, { duration: DURATION, easing: Easing.inOut(Easing.ease) })
    );
    rotateZ.value = withDelay(delay, withSpring(theta));
  }, [delay, index, rotateZ, theta, translateY]);

  useAnimatedReaction(
    () => shuffleBack.value,
    (v, prevValue) => {
      if (v) {
        const duration = 150 * index;
        translateX.value = withDelay(
          duration,
          withSpring(0, {}, () => {
            shuffleBack.value = false;
          })
        );
        rotateZ.value = withDelay(duration, withSpring(theta));
      }
    }
  );

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      offset.value = { x: translateX.value, y: translateY.value };
      rotateZ.value = withTiming(0);
      scale.value = withTiming(1.1);
    })
    .onUpdate((event) => {
      translateX.value = offset.value.x + event.translationX;
      translateY.value = offset.value.y + event.translationY;
    })
    .onEnd((event) => {
      const dest = 1000 * Math.sign(event.velocityX);
      translateX.value = withSpring(dest, { velocity: event.velocityX });
      translateY.value = withSpring(0, { velocity: event.velocityY });
      scale.value = withTiming(1, {}, () => {
        const isLast = index === 0;
        const isSwipedLeftOrRight = dest !== 0;
        if (isLast && isSwipedLeftOrRight) {
          shuffleBack.value = true;
        }
      });
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1500 },
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotateY: `${rotateZ.value / 10}deg` },
      { rotateZ: `${rotateZ.value}deg` },
      { scale: scale.value },
    ],
  }));

  const imageTransformStyle = {
    transform: [
      { translateX: -card.x * IMAGE_SCALE + (CARD_WIDTH / 2) },
      { translateY: -card.y * IMAGE_SCALE + (CARD_HEIGHT / 2) }
    ]
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.card, animatedStyle]}>
          <Image
            source={require('../assets/images/letak.jpg')}
            style={[{
              width: IMAGE_WIDTH*IMAGE_SCALE,
              height: IMAGE_HEIGHT*IMAGE_SCALE,
            }, imageTransformStyle]}
            resizeMode="contain"
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    overflow: "hidden",
    backgroundColor: "white",
    borderRadius: 10,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});