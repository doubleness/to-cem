import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Image,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
  runOnJS,
  SharedValue,
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { promotions as promotionsData, Promotion } from '@/data/promotions';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = height * 0.6;
const SWIPE_THRESHOLD = 120;
const CARD_SCALE = 1.4;

const PromotionCard = ({ promotion, isFirst = false, swipe, tiltSign, index }: { 
  promotion: Promotion, 
  isFirst?: boolean, 
  swipe?: SharedValue<number>, 
  tiltSign?: SharedValue<number>,
  index: number 
}) => {
  const cardAnimatedStyle = useAnimatedStyle(() => {
    if (!isFirst || !swipe) return {};
    
    const rotate = interpolate(
      swipe.value,
      [-CARD_WIDTH, 0, CARD_WIDTH],
      [-15, 0, 15],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      Math.abs(swipe.value),
      [0, CARD_WIDTH / 2],
      [1, 0],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX: swipe.value },
        { rotate: `${rotate}deg` }
      ],
      opacity
    };
  });

  const nonFirstCardStyle = useAnimatedStyle(() => {
    if (isFirst || !swipe) return { scale: 0.9, opacity: 0.8 };
    
    const scale = interpolate(
      Math.abs(swipe.value),
      [0, CARD_WIDTH],
      [0.9, 1],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      Math.abs(swipe.value),
      [0, CARD_WIDTH / 2],
      [0.8, 1],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity
    };
  });

  const likeStyle = useAnimatedStyle(() => {
    if (!isFirst || !swipe || !tiltSign) return { opacity: 0 };
    
    const opacity = interpolate(
      swipe.value,
      [20, CARD_WIDTH / 4],
      [0, 1],
      Extrapolate.CLAMP
    );

    return {
      opacity: tiltSign.value === 1 ? opacity : 0,
    };
  });

  const nopeStyle = useAnimatedStyle(() => {
    if (!isFirst || !swipe || !tiltSign) return { opacity: 0 };
    
    const opacity = interpolate(
      -swipe.value,
      [20, CARD_WIDTH / 4],
      [0, 1],
      Extrapolate.CLAMP
    );

    return {
      opacity: tiltSign.value === -1 ? opacity : 0,
    };
  });

  // Background image style with x and y translations
  const backgroundImageStyle = {
    transform: [
      { translateX: -promotion.x * CARD_SCALE + (CARD_WIDTH / 2) },
      { translateY: -promotion.y * CARD_SCALE + (CARD_HEIGHT / 2) }
    ]
  };

  return (
    <Animated.View 
      style={[
        styles.cardContainer,
        isFirst ? cardAnimatedStyle : nonFirstCardStyle,
        { zIndex: 5 - index }
      ]}
    >
      <Image 
        source={require('../assets/images/letak.jpg')}
        style={[styles.backgroundImage, backgroundImageStyle]}
        resizeMode="cover"
      />
      <View style={styles.infoContainer}> 
        <View style={styles.cardOverlay}>
          <View style={styles.badgesContainer}>
            <View style={styles.shopBadge}>
              <Text style={styles.shopText}>{promotion.shop}</Text>
            </View>
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{promotion.discount}</Text>
            </View>
          </View>
          
          <View style={styles.gradientContainer}>
            <Text style={styles.productTitle}>{promotion.product}</Text>
          </View>
        </View>
        
        {isFirst && (
          <>
            <Animated.View style={[styles.likeContainer, likeStyle]}>
              <Text style={styles.likeText}>CEM</Text>
            </Animated.View>
            
            <Animated.View style={[styles.nopeContainer, nopeStyle]}>
              <Text style={styles.nopeText}>NECEM</Text>
            </Animated.View>
          </>
        )}
      </View>
    </Animated.View>
  );
};

const PromotionSwiperScreen = () => {
  const [promotions, setPromotions] = useState(promotionsData);
  const swipe = useSharedValue(0);
  const tiltSign = useSharedValue(0);
  const isAnimating = useSharedValue(false);
  
  const removeTopCard = () => {
    // Reset the swipe value for the new top card
    requestAnimationFrame(() => {
      swipe.value = 0;
      tiltSign.value = 0;
      isAnimating.value = false;
      setPromotions((prevPromotions) => prevPromotions.slice(1));
    });
  };

  const onSwipeLeft = () => {
    console.log('Skipped promotion');
    removeTopCard();
  };

  const onSwipeRight = () => {
    console.log('Saved promotion');
    removeTopCard();
  };
  
  // Create the pan gesture using the new API
  const panGesture = Gesture.Pan()
    .onBegin(() => {
      // Only allow gesture if not currently animating a dismissal
      if (isAnimating.value) return false;
    })
    .onUpdate((event) => {
      if (!isAnimating.value) {
        swipe.value = event.translationX;
        tiltSign.value = Math.sign(event.translationX);
      }
    })
    .onEnd((event) => {
      if (isAnimating.value) return;
      
      const direction = Math.sign(event.velocityX);
      const shouldDismiss = 
        Math.abs(event.velocityX) > 500 || 
        Math.abs(swipe.value) > SWIPE_THRESHOLD;
      
      if (shouldDismiss) {
        // Set animating flag to prevent new gestures
        isAnimating.value = true;
        
        // First trigger the state update (but don't update state yet)
        runOnJS(direction > 0 ? onSwipeRight : onSwipeLeft)();
        
        // Then animate the current card out of view
        swipe.value = withSpring(direction * width * 1.5, {
          velocity: event.velocityX,
          stiffness: 50,
          damping: 10,
          restDisplacementThreshold: 0.01,
          restSpeedThreshold: 0.01,
        });
      } else {
        // Just spring back to center
        swipe.value = withSpring(0, {
          stiffness: 50,
          damping: 10,
        });
      }
    });

  const renderPromotions = () => {
    return promotions.map((promotion, index) => {
      if (index > 2) return null;
      
      return (
        <PromotionCard
          key={`${promotion.product}-${promotion.shop}-${index}`}
          promotion={promotion}
          isFirst={index === 0}
          swipe={swipe}
          tiltSign={tiltSign}
          index={index}
        />
      );
    });
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Grocery Deals</Text>
        </View>
        
        <View style={styles.cardsContainer}>
          {promotions.length > 0 ? (
            <GestureDetector gesture={panGesture}>
              <Animated.View style={styles.cardsWrapper}>
                {renderPromotions()}
              </Animated.View>
            </GestureDetector>
          ) : (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>No more promotions!</Text>
              <Text style={styles.emptyStateSubtext}>Check back later for new deals</Text>
            </View>
          )}
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Swipe right to save, left to skip</Text>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  header: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  cardsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    position: 'relative',
  },
  cardsWrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    overflow: 'hidden',
  },
  infoContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top:0,
    left:0
  },
  backgroundImage: {
    width: 1014*CARD_SCALE,
    height: 1420*CARD_SCALE,
    overflow: 'hidden',
    borderRadius: 20,
  },
  cardOverlay: {
    flex: 1,
    position: 'relative',
  },
  gradientContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingTop: 25,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  badgesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  discountBadge: {
    backgroundColor: '#FF6347',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    zIndex: 10,
  },
  discountText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  shopBadge: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    zIndex: 10,
  },
  shopText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  productTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 8,
  },
  price: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2ecc71',
    marginRight: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  regularPrice: {
    fontSize: 22,
    textDecorationLine: 'line-through',
    color: '#e0e0e0',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  additionalInfo: {
    fontSize: 16,
    color: '#e0e0e0',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  likeContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
    transform: [{ rotate: '-30deg' }],
    borderWidth: 4,
    borderColor: '#2ecc71',
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  likeText: {
    color: '#2ecc71',
    fontSize: 32,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  nopeContainer: {
    position: 'absolute',
    top: 40,
    right: 20,
    transform: [{ rotate: '30deg' }],
    borderWidth: 4,
    borderColor: '#e74c3c',
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  nopeText: {
    color: '#e74c3c',
    fontSize: 32,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#7f8c8d',
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#95a5a6',
    marginTop: 10,
  },
  footer: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
});

export default PromotionSwiperScreen;