import { Image, StyleSheet, Platform } from 'react-native';

import { AnimatedStyleUpdateExample } from '@/components/HelloWave';
import { View } from 'react-native';
import { Cards } from '@/components/Cards';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Cards />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
