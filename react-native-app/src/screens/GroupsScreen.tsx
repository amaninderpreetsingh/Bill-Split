import React, { useState } from 'react';
import { View, Text, FlatList, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useToast } from 'react-native-toast-notifications';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { GroupCard } from '../components/groups/GroupCard';
import { CreateGroupModal } from '../components/groups/CreateGroupModal';
import { useGroupManager } from '../logic/hooks/useGroupManager';
import { colors } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';
import { styles } from './styles/GroupsScreen.styles';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Groups'>;

export default function GroupsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const toast = useToast();
  const [modalVisible, setModalVisible] = useState(false);
  const { groups, loading, createGroup } = useGroupManager();

  const handleCreateGroup = async (name: string, description: string) => {
    try {
      await createGroup(name, description);
      setModalVisible(false);
      toast.show('Group created successfully!', { type: 'success' });
    } catch (error) {
      console.error('Error creating group:', error);
      toast.show('Failed to create group', { type: 'danger' });
    }
  };

  const handleGroupPress = (groupId: string) => {
    navigation.navigate('GroupDetail', { groupId });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Loading groups...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Groups & Events</Text>
            <Text style={styles.subtitle}>
              Create groups to organize and track multiple bills
            </Text>
          </View>
          {groups.length > 0 && (
            <Button
              title="New"
              leftIcon={<Ionicons name="add" size={20} color={colors.white} />}
              onPress={() => setModalVisible(true)}
              size="sm"
            />
          )}
        </View>

        {/* Empty State */}
        {groups.length === 0 ? (
          <Card style={styles.emptyCard}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="people" size={64} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No groups yet</Text>
            <Text style={styles.emptyDescription}>
              Create your first group to start organizing bills with roommates, friends, or
              for events.
            </Text>
            <Button
              title="Create First Group"
              leftIcon={<Ionicons name="add" size={20} color={colors.white} />}
              onPress={() => setModalVisible(true)}
              style={styles.emptyButton}
            />
          </Card>
        ) : (
          /* Groups List */
          <FlatList
            data={groups}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <GroupCard group={item} onPress={() => handleGroupPress(item.id)} />
            )}
            scrollEnabled={false}
          />
        )}

        {/* Feature Cards */}
        <View style={styles.featuresContainer}>
          <Card style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="people" size={24} color={colors.primary} />
            </View>
            <Text style={styles.featureTitle}>Organize by Group</Text>
            <Text style={styles.featureDescription}>
              Keep roommate bills separate from vacation expenses
            </Text>
          </Card>

          <Card style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="document-text" size={24} color={colors.accent} />
            </View>
            <Text style={styles.featureTitle}>Transaction History</Text>
            <Text style={styles.featureDescription}>
              See all past bills and payments for each group
            </Text>
          </Card>

          <Card style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="people-circle" size={24} color={colors.primary} />
            </View>
            <Text style={styles.featureTitle}>Shared Members</Text>
            <Text style={styles.featureDescription}>
              Add members once, reuse across all group transactions
            </Text>
          </Card>
        </View>
      </ScrollView>

      {/* Create Group Modal */}
      <CreateGroupModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreateGroup={handleCreateGroup}
      />
    </SafeAreaView>
  );
}
