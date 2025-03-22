import { Image, StyleSheet, Platform } from 'react-native';

import { AnimatedStyleUpdateExample } from '@/components/HelloWave';
import { View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <AnimatedStyleUpdateExample />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    flex: 1,
  },
});
