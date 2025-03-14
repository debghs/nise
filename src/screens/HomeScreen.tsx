import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Animated, Dimensions } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../utils/theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  // Create animated values for button press effects
  const buttonScales = [
    React.useRef(new Animated.Value(1)).current,
    React.useRef(new Animated.Value(1)).current,
    React.useRef(new Animated.Value(1)).current
  ];

  // Animation for button press
  const animateButtonPress = (index: number, pressed: boolean) => {
    Animated.spring(buttonScales[index], {
      toValue: pressed ? 0.95 : 1,
      friction: 5,
      tension: 300,
      useNativeDriver: true
    }).start();
  };

  // Button press handlers with animations
  const handleButtonPress = (index: number, screenName: string, params?: any) => {
    animateButtonPress(index, true);
    setTimeout(() => {
      animateButtonPress(index, false);
      navigation.navigate(screenName, params);
    }, 100);
  };

  return (
    <View style={styles.container}>
      {/* <Text style={styles.title}>Nise</Text> */}
      
      <Animated.View style={[styles.buttonContainer, { transform: [{ scale: buttonScales[0] }] }]}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => handleButtonPress(0, 'Gallery')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>View Gallery</Text>
        </TouchableOpacity>
      </Animated.View>
      
      <Animated.View style={[styles.buttonContainer, { transform: [{ scale: buttonScales[1] }] }]}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => handleButtonPress(1, 'Search')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Search by Tags</Text>
        </TouchableOpacity>
      </Animated.View>
      
      <Animated.View style={[styles.buttonContainer, { transform: [{ scale: buttonScales[2] }] }]}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => handleButtonPress(2, 'TagManager', { mediaId: undefined })}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Manage Tags</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: typography.fontSizes.xxxl,
    fontWeight: '700', // Using string value instead of typography.fontWeights.bold
    color: colors.text,
    marginBottom: spacing.xxl,
    textAlign: 'center',
  },
  buttonContainer: {
    width: width * 0.85,
    maxWidth: 400,
    marginVertical: spacing.md,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    ...shadows.medium,
  },
  buttonText: {
    color: 'white',
    fontSize: typography.fontSizes.lg,
    textAlign: 'center',
    fontWeight: '600', // Using string value instead of typography.fontWeights.semiBold
  },
});
