import React, { useState } from 'react';
import { View, Text, ScrollView, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from 'react-native-toast-notifications';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
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
import { styles } from './styles/AIScanScreen.styles';

export default function AIScanScreen() {
  const [activeTab, setActiveTab] = useState<'ai-scan' | 'manual'>('ai-scan');
  const toast = useToast();

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
      // Create new person without venmoId
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
      // For editing, update the internal state and call saveEdit
      const item = billData?.items.find(i => i.id === editingItemId);
      if (item) {
        editItem(item.id, name, price);
        saveEdit();
      }
    } else {
      // For adding, the ItemEditorForm component should handle this
      // But we need to set the values first
      const newItem = {
        id: `item-${Date.now()}`,
        name: name.trim(),
        price: price,
      };

      if (!billData) {
        // Create initial bill
        setBillData({
          items: [newItem],
          subtotal: price,
          tax: 0,
          tip: 0,
          total: price,
        });
      } else {
        // Add to existing bill
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
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteItem(itemId);
            toast.show('Item deleted', { type: 'success' });
          },
        },
      ]
    );
  };

  const handleChargeVenmo = async (person: Person, total: number) => {
    if (!person.venmoId) return;

    // Generate Venmo deep link
    const venmoUrl = `venmo://paycharge?txn=charge&recipients=${person.venmoId}&amount=${total.toFixed(2)}&note=${encodeURIComponent(
      'Bill split'
    )}`;

    try {
      const supported = await Linking.canOpenURL(venmoUrl);
      if (supported) {
        await Linking.openURL(venmoUrl);
      } else {
        // Fallback to web URL
        const webUrl = `https://venmo.com/?txn=charge&recipients=${person.venmoId}&amount=${total.toFixed(2)}`;
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      console.error('Error opening Venmo:', error);
      toast.show('Failed to open Venmo', { type: 'danger' });
    }
  };

  const showFeatureCards = !billData && !imageUri && activeTab === 'ai-scan';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <Text style={styles.title}>Split Your Bill</Text>
          <Text style={styles.subtitle}>
            AI-powered receipt analysis with fair splitting
          </Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <Button
            title="AI Scan"
            variant={activeTab === 'ai-scan' ? 'default' : 'ghost'}
            style={styles.tabButton}
            onPress={() => setActiveTab('ai-scan')}
          />
          <Button
            title="Manual Entry"
            variant={activeTab === 'manual' ? 'default' : 'ghost'}
            style={styles.tabButton}
            onPress={() => setActiveTab('manual')}
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
          <Card>
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
            onChargeVenmo={handleChargeVenmo}
          />
        )}

        {/* Feature Cards (only show when no bill data) */}
        {showFeatureCards && (
          <View style={styles.featuresContainer}>
            <Card style={styles.featureCard}>
              <View style={styles.iconContainer}>
                <Ionicons name="sparkles" size={24} color={colors.primary} />
              </View>
              <Text style={styles.featureTitle}>AI-Powered</Text>
              <Text style={styles.featureDescription}>
                Gemini AI extracts items, tax, and tip automatically
              </Text>
            </Card>

            <Card style={styles.featureCard}>
              <View style={styles.iconContainer}>
                <Ionicons name="people" size={24} color={colors.primary} />
              </View>
              <Text style={styles.featureTitle}>Fair Splitting</Text>
              <Text style={styles.featureDescription}>
                Proportional tax & tip distribution
              </Text>
            </Card>

            <Card style={styles.featureCard}>
              <View style={styles.iconContainer}>
                <Ionicons name="flash" size={24} color={colors.primary} />
              </View>
              <Text style={styles.featureTitle}>Instant Results</Text>
              <Text style={styles.featureDescription}>
                See who owes what in seconds, no manual math needed
              </Text>
            </Card>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
