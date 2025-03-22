import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = height * 0.6;
const SWIPE_THRESHOLD = 120;

export type Promotion = {
  product: string;
  price: string;
  regularPrice: string;
  discount: string;
  additionalInfo: string;
  x: number;
  y: number;
  shop: string;
};

const dummyData: Promotion[] = [
  {
    product: "Organic Bananas",
    price: "$0.79",
    regularPrice: "$0.99",
    discount: "20% OFF",
    additionalInfo: "Per pound, non-GMO",
    x: 0,
    y: 0,
    shop: "GreenMart"
  },
  {
    product: "Whole Wheat Bread",
    price: "$2.49",
    regularPrice: "$3.49",
    discount: "29% OFF",
    additionalInfo: "Fresh baked daily",
    x: 0,
    y: 0,
    shop: "Baker's Corner"
  },
  {
    product: "Free Range Eggs",
    price: "$3.99",
    regularPrice: "$5.99",
    discount: "33% OFF",
    additionalInfo: "Dozen, cage-free",
    x: 0,
    y: 0,
    shop: "FarmFresh"
  },
  {
    product: "Almond Milk",
    price: "$2.99",
    regularPrice: "$4.49",
    discount: "33% OFF",
    additionalInfo: "Sugar-free, 64oz",
    x: 0,
    y: 0,
    shop: "GreenMart"
  },
  {
    product: "Ground Coffee",
    price: "$6.99",
    regularPrice: "$9.99",
    discount: "30% OFF",
    additionalInfo: "Fair trade, medium roast",
    x: 0,
    y: 0,
    shop: "Bean & Brew"
  }
];

const PromotionCard = ({ promotion, isFirst = false, swipe, tiltSign, index }: { 
  promotion: Promotion, 
  isFirst?: boolean, 
  swipe?: Animated.SharedValue<number>, 
  tiltSign?: Animated.SharedValue<number>,
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

  return (
    <Animated.View 
      style={[
        styles.cardContainer,
        isFirst ? cardAnimatedStyle : nonFirstCardStyle,
        { zIndex: 5 - index }
      ]}
    >
      <View style={styles.discountBadge}>
        <Text style={styles.discountText}>{promotion.discount}</Text>
      </View>
      
      <View style={styles.shopBadge}>
        <Text style={styles.shopText}>{promotion.shop}</Text>
      </View>
      
      <View style={styles.cardContent}>
        <Text style={styles.productTitle}>{promotion.product}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{promotion.price}</Text>
          <Text style={styles.regularPrice}>{promotion.regularPrice}</Text>
        </View>
        <Text style={styles.additionalInfo}>{promotion.additionalInfo}</Text>
      </View>
      
      {isFirst && (
        <>
          <Animated.View style={[styles.likeContainer, likeStyle]}>
            <Text style={styles.likeText}>SAVE</Text>
          </Animated.View>
          
          <Animated.View style={[styles.nopeContainer, nopeStyle]}>
            <Text style={styles.nopeText}>SKIP</Text>
          </Animated.View>
        </>
      )}
    </Animated.View>
  );
};

const PromotionSwiperScreen = () => {
  const [promotions, setPromotions] = useState(dummyData);
  const swipe = useSharedValue(0);
  const tiltSign = useSharedValue(0);
  
  const removeTopCard = () => {
    setPromotions((prevPromotions) => prevPromotions.slice(1));
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
      // Store the start position (handled by the new API)
    })
    .onUpdate((event) => {
      swipe.value = event.translationX;
      tiltSign.value = Math.sign(event.translationX);
    })
    .onEnd((event) => {
      const direction = Math.sign(event.velocityX);
      const shouldDismiss = 
        Math.abs(event.velocityX) > 500 || 
        Math.abs(swipe.value) > SWIPE_THRESHOLD;
      
      if (shouldDismiss) {
        swipe.value = withSpring(direction * width * 1.5, {
          velocity: event.velocityX,
          stiffness: 50,
          damping: 10,
          restDisplacementThreshold: 0.01,
          restSpeedThreshold: 0.01,
        }, () => {
          runOnJS(direction > 0 ? onSwipeRight : onSwipeLeft)();
        });
      } else {
        swipe.value = withSpring(0);
      }
    });

  const renderPromotions = () => {
    return promotions.map((promotion, index) => {
      if (index > 2) return null;
      
      return (
        <PromotionCard
          key={`${promotion.product}-${index}`}
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
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  discountBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
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
    position: 'absolute',
    top: 15,
    left: 15,
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 15,
  },
  price: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2ecc71',
    marginRight: 10,
  },
  regularPrice: {
    fontSize: 22,
    textDecorationLine: 'line-through',
    color: '#7f8c8d',
  },
  additionalInfo: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
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
  },
  likeText: {
    color: '#2ecc71',
    fontSize: 32,
    fontWeight: 'bold',
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
  },
  nopeText: {
    color: '#e74c3c',
    fontSize: 32,
    fontWeight: 'bold',
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