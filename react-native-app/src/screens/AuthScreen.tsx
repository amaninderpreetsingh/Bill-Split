import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/colors';
import { styles } from './styles/AuthScreen.styles';

export default function AuthScreen() {
  const { signInWithGoogle } = useAuth();

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons name="receipt" size={64} color={colors.primary} />
          </View>

          <Text style={styles.title}>Welcome to Bill Split</Text>
          <Text style={styles.description}>
            Sign in with Google to access your bills, friends, and groups
          </Text>

          <Button
            title="Sign in with Google"
            onPress={handleSignIn}
            leftIcon={<Ionicons name="logo-google" size={20} color={colors.white} />}
            style={styles.signInButton}
          />

          <View style={styles.features}>
            <View style={styles.feature}>
              <Ionicons name="camera" size={20} color={colors.primary} />
              <Text style={styles.featureText}>AI Receipt Scanning</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="people" size={20} color={colors.primary} />
              <Text style={styles.featureText}>Group Bill Splitting</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="logo-venmo" size={20} color={colors.primary} />
              <Text style={styles.featureText}>Venmo Integration</Text>
            </View>
          </View>
        </Card>
      </View>
    </SafeAreaView>
  );
}
