import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { doc, getDoc } from 'firebase/firestore';
import { useToast } from 'react-native-toast-notifications';
import { db } from '../config/firebase';
import { Group } from '../logic/types/group.types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ReceiptUploader } from '../components/receipt/ReceiptUploader';
import { BillItemsList } from '../components/bill/BillItemsList';
import { ItemEditorForm } from '../components/bill/ItemEditorForm';
import { TaxTipForm } from '../components/bill/TaxTipForm';
import { PeopleManager } from '../components/people/PeopleManager';
import { useBillSplitter } from '../logic/hooks/useBillSplitter';
import { usePeopleManager } from '../logic/hooks/usePeopleManager';
import { useItemEditor } from '../logic/hooks/useItemEditor';
import { useReceiptAnalyzer } from '../logic/hooks/useReceiptAnalyzer';
import { useFileUpload } from '../logic/hooks/useFileUpload';
import { useUserProfile } from '../logic/hooks/useUserProfile';
import { Person } from '../logic/types/person.types';
import { colors } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';
import { styles } from './styles/GroupDetailScreen.styles';

type RouteParams = RouteProp<RootStackParamList, 'GroupDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'GroupDetail'>;

export default function GroupDetailScreen() {
  const route = useRoute<RouteParams>();
  const navigation = useNavigation<NavigationProp>();
  const toast = useToast();
  const { groupId } = route.params;

  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ai-scan' | 'manual'>('ai-scan');

  // Get people first since useBillSplitter needs it
  const {
    people,
    removePerson,
    addFromFriend,
    setPeople,
  } = usePeopleManager();

  // Custom hooks
  const {
    billData,
    itemAssignments,
    personTotals,
    setBillData,
    customTip,
    setCustomTip,
    handleItemAssignment,
    removeItemAssignments,
  } = useBillSplitter(people);

  const {
    editingItemId,
    editItem,
    saveEdit,
    cancelEdit,
    deleteItem,
    isAdding,
    startAdding,
    cancelAdding,
  } = useItemEditor(billData, setBillData, customTip, removeItemAssignments);

  const { analyzeReceipt, isAnalyzing } = useReceiptAnalyzer(setBillData, setPeople, billData);
  const { imageUri, setImageUri } = useFileUpload();
  const { friends } = useUserProfile();

  // Fetch group data
  useEffect(() => {
    const fetchGroup = async () => {
      if (!groupId) return;

      try {
        const groupDoc = await getDoc(doc(db, 'groups', groupId));
        if (groupDoc.exists()) {
          const data = groupDoc.data();
          setGroup({
            id: groupDoc.id,
            name: data.name,
            description: data.description,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            ownerId: data.ownerId,
            memberIds: data.memberIds || [],
          });
        }
      } catch (error) {
        console.error('Error fetching group:', error);
        toast.show('Failed to load group', { type: 'danger' });
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [groupId]);

  // Wrapper function for image selection
  const selectImage = (uri: string) => {
    setImageUri(uri);
  };

  const handleAnalyzeReceipt = async () => {
    if (!imageUri) return;

    try {
      await analyzeReceipt(imageUri);
      toast.show('Receipt analyzed successfully!', { type: 'success' });
    } catch (error) {
      console.error('Error analyzing receipt:', error);
      toast.show('Failed to analyze receipt', { type: 'danger' });
    }
  };

  const handleAddPerson = (name: string, venmoId?: string) => {
    if (venmoId) {
      addFromFriend({ name, venmoId });
    } else {
      const newPerson: Person = {
        id: `person-${Date.now()}`,
        name: name.trim(),
      };
      setPeople([...people, newPerson]);
    }
  };

  const updateTaxAndTip = (tax: number, tip: number) => {
    if (!billData) return;

    const newTotal = billData.subtotal + tax + tip;
    setBillData({
      ...billData,
      tax,
      tip,
      total: newTotal,
    });
    setCustomTip(tip.toString());
  };

  const handleSaveItem = (name: string, price: number) => {
    if (editingItemId) {
      const item = billData?.items.find(i => i.id === editingItemId);
      if (item) {
        editItem(item.id, name, price);
        saveEdit();
      }
    } else {
      const newItem = {
        id: `item-${Date.now()}`,
        name: name.trim(),
        price: price,
      };

      if (!billData) {
        setBillData({
          items: [newItem],
          subtotal: price,
          tax: 0,
          tip: 0,
          total: price,
        });
      } else {
        const updatedItems = [...billData.items, newItem];
        const newSubtotal = updatedItems.reduce((sum, item) => sum + item.price, 0);
        setBillData({
          ...billData,
          items: updatedItems,
          subtotal: newSubtotal,
          total: newSubtotal + billData.tax + (parseFloat(customTip) || billData.tip),
        });
      }
      cancelAdding();
      toast.show('Item added', { type: 'success' });
    }
  };

  const handleEditItem = (item: any) => {
    editItem(item.id, item.name, item.price);
  };

  const handleCancelEdit = () => {
    if (editingItemId) {
      cancelEdit();
    } else {
      cancelAdding();
    }
  };

  const handleAssignmentToggle = (itemId: string, personId: string) => {
    const currentAssignments = itemAssignments[itemId] || [];
    const isAssigned = currentAssignments.includes(personId);
    handleItemAssignment(itemId, personId, !isAssigned);
  };

  const handleDeleteItem = (itemId: string) => {
    deleteItem(itemId);
    toast.show('Item deleted', { type: 'success' });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Loading group...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!group) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Group not found</Text>
          <Button
            title="Back to Groups"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButtonHeader}
        >
          <Ionicons name="arrow-back" size={24} color={colors.gray700} />
          <Text style={styles.backText}>Back to Groups</Text>
        </TouchableOpacity>

        <View style={styles.hero}>
          <Text style={styles.title}>{group.name}</Text>
          {group.description ? (
            <Text style={styles.subtitle}>{group.description}</Text>
          ) : null}
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <Button
            title="AI Scan"
            variant={activeTab === 'ai-scan' ? 'default' : 'ghost'}
            style={styles.tabButton}
            onPress={() => setActiveTab('ai-scan')}
            leftIcon={<Ionicons name="scan" size={18} color={activeTab === 'ai-scan' ? colors.white : colors.gray700} />}
          />
          <Button
            title="Manual Entry"
            variant={activeTab === 'manual' ? 'default' : 'ghost'}
            style={styles.tabButton}
            onPress={() => setActiveTab('manual')}
            leftIcon={<Ionicons name="create" size={18} color={activeTab === 'manual' ? colors.white : colors.gray700} />}
          />
        </View>

        {/* AI Scan Tab */}
        {activeTab === 'ai-scan' && (
          <>
            <ReceiptUploader
              imageUri={imageUri}
              onImageSelected={selectImage}
              onAnalyze={handleAnalyzeReceipt}
              isAnalyzing={isAnalyzing}
            />
          </>
        )}

        {/* Manual Entry Tab */}
        {activeTab === 'manual' && !billData && !isAdding && (
          <Card style={styles.placeholderCard}>
            <Text style={styles.placeholderText}>
              Start by adding items to your bill
            </Text>
            <Button
              title="Add First Item"
              onPress={startAdding}
              leftIcon={<Ionicons name="add" size={20} color={colors.white} />}
              style={styles.addFirstButton}
            />
          </Card>
        )}

        {/* Item Editor Form */}
        {(isAdding || editingItemId) && (
          <ItemEditorForm
            item={editingItemId ? billData?.items.find(i => i.id === editingItemId) : null}
            onSave={handleSaveItem}
            onCancel={handleCancelEdit}
          />
        )}

        {/* Tax & Tip Form */}
        {billData && !editingItemId && !isAdding && (
          <TaxTipForm billData={billData} onUpdate={updateTaxAndTip} />
        )}

        {/* Bill Items List */}
        {billData && !editingItemId && !isAdding && (
          <BillItemsList
            billData={billData}
            people={people}
            itemAssignments={itemAssignments}
            onAssignmentToggle={handleAssignmentToggle}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
            onAddItem={startAdding}
          />
        )}

        {/* People Manager */}
        {billData && !editingItemId && !isAdding && (
          <PeopleManager
            people={people}
            personTotals={personTotals}
            friends={friends}
            onAddPerson={handleAddPerson}
            onRemovePerson={removePerson}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
