import { Promotion } from "@/data/promotions";
import React, { useEffect, useState } from "react";
import { View, StyleSheet, Dimensions, Image, Text } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { width: wWidth, height } = Dimensions.get("window");
const CARD_WIDTH = wWidth - 100;
const CARD_HEIGHT = CARD_WIDTH;
const IMAGE_WIDTH = 1014;
const IMAGE_HEIGHT = 1420;
const IMAGE_SCALE=1.23;
const DURATION = 250;
const SWIPE_THRESHOLD = 100;

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
  const theta = -5 + Math.random() * 5;
  const swipedStatus = useSharedValue(0);
  const [swipeStatusText, setSwipeStatusText] = useState('');

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
      swipedStatus.value = 0;
      offset.value = { x: translateX.value, y: translateY.value };
      rotateZ.value = withTiming(0);
      scale.value = withTiming(1.2);
    })
    .onUpdate((event) => {
      translateX.value = offset.value.x + event.translationX;
      translateY.value = offset.value.y + event.translationY;
    })
    .onEnd((event) => {
      swipedStatus.value = translateX.value > SWIPE_THRESHOLD ? 1 : translateX.value < -SWIPE_THRESHOLD ? -1 : 0;
      const dest = 500 * Math.sign(event.velocityX) * Math.abs(swipedStatus.value);
      translateX.value = withSpring(dest, { velocity: event.velocityX });
      translateY.value = withSpring(0, { velocity: event.velocityY });
      scale.value = withTiming(1, {}, () => {
        const isLast = index === 0;
        const isSwipedLeftOrRight = swipedStatus.value !== 0;
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

  const swipeStatusStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    top: 0,
    left: 0,
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: translateX.value > 0 ? 'green' : 'red',
    opacity: Math.abs(translateX.value / CARD_WIDTH * 1.2),
    zIndex: 100,
  }));

  useAnimatedReaction(
    () => translateX.value,
    (v) => {
      if (v && v > 0) {
        runOnJS(setSwipeStatusText)('Cem!           ');
      } else {
        runOnJS(setSwipeStatusText)('         Necem...');
      }
    }
  );

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
          <View style={styles.badgesContainer}>
            <View style={styles.shopBadge}>
              <Text style={styles.badgeText}>{card.shop}</Text>
            </View>
            <View style={styles.discountBadge}>
              <Text style={styles.badgeText}>{card.discount}</Text>
            </View>
          </View>
          <Animated.View style={swipeStatusStyle}>
            <Text style={styles.statusText}>{swipeStatusText}</Text>
          </Animated.View>
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
    paddingTop: 120,
  },
  card: {
    position: "relative",
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
  badgesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    padding: 15,
  },
  discountBadge: {
    backgroundColor: 'red',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,

  },
  shopBadge: {
    backgroundColor: 'darkblue',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 5,
  },
  badgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  statusText: {
    color: 'white',
    fontFamily: 'MiniStoryBold',
    fontSize: 45,
  },
});