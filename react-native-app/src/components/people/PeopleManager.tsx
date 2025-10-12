import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Person, Friend, PersonTotal } from '../../logic/types/person.types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { colors } from '../../theme/colors';
import { styles } from './styles/PeopleManager.styles';

interface PeopleManagerProps {
  people: Person[];
  personTotals: PersonTotal[];
  friends: Friend[];
  onAddPerson: (name: string, venmoId?: string) => void;
  onRemovePerson: (personId: string) => void;
  onChargeVenmo?: (person: Person, total: number) => void;
}

export function PeopleManager({
  people,
  personTotals,
  friends,
  onAddPerson,
  onRemovePerson,
  onChargeVenmo,
}: PeopleManagerProps) {
  const [newPersonName, setNewPersonName] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleAddPerson = () => {
    if (newPersonName.trim()) {
      onAddPerson(newPersonName.trim());
      setNewPersonName('');
      setShowSuggestions(false);
    }
  };

  const handleSelectFriend = (friend: Friend) => {
    onAddPerson(friend.name, friend.venmoId);
    setNewPersonName('');
    setShowSuggestions(false);
  };

  const filteredFriends = friends.filter(
    (friend) =>
      newPersonName &&
      friend.name.toLowerCase().startsWith(newPersonName.toLowerCase()) &&
      !people.some((p) => p.name.toLowerCase() === friend.name.toLowerCase())
  );

  const getPersonTotal = (personId: string): number => {
    const total = personTotals.find((pt) => pt.personId === personId);
    return total?.total || 0;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>People</Text>
        <Text style={styles.headerCount}>{people.length}</Text>
      </View>

      {/* Add Person Input */}
      <Card style={styles.addCard}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Add person..."
            value={newPersonName}
            onChangeText={(text) => {
              setNewPersonName(text);
              setShowSuggestions(text.length > 0);
            }}
            onSubmitEditing={handleAddPerson}
            returnKeyType="done"
          />
          <Button
            title="Add"
            onPress={handleAddPerson}
            disabled={!newPersonName.trim()}
            size="sm"
          />
        </View>

        {/* Friends Suggestions */}
        {showSuggestions && filteredFriends.length > 0 && (
          <View style={styles.suggestionsContainer}>
            {filteredFriends.map((friend) => (
              <TouchableOpacity
                key={friend.name}
                style={styles.suggestion}
                onPress={() => handleSelectFriend(friend)}
              >
                <Ionicons name="person-circle-outline" size={20} color={colors.primary} />
                <Text style={styles.suggestionName}>{friend.name}</Text>
                {friend.venmoId && (
                  <Ionicons name="logo-venmo" size={16} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Card>

      {/* People List */}
      {people.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Ionicons name="people-outline" size={48} color={colors.gray300} />
          <Text style={styles.emptyText}>No people added yet</Text>
          <Text style={styles.emptyDescription}>
            Add people to split the bill with
          </Text>
        </Card>
      ) : (
        <FlatList
          data={people}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => {
            const total = getPersonTotal(item.id);
            return (
              <Card style={styles.personCard}>
                <View style={styles.personHeader}>
                  <View style={styles.personInfo}>
                    <Text style={styles.personName}>{item.name}</Text>
                    {item.venmoId && (
                      <View style={styles.venmoTag}>
                        <Ionicons name="logo-venmo" size={14} color={colors.primary} />
                        <Text style={styles.venmoText}>@{item.venmoId}</Text>
                      </View>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => onRemovePerson(item.id)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="close-circle" size={24} color={colors.destructive} />
                  </TouchableOpacity>
                </View>

                {total > 0 && (
                  <View style={styles.personFooter}>
                    <View style={styles.totalContainer}>
                      <Text style={styles.totalLabel}>Owes:</Text>
                      <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
                    </View>
                    {onChargeVenmo && item.venmoId && (
                      <Button
                        title="Charge on Venmo"
                        onPress={() => onChargeVenmo(item, total)}
                        size="sm"
                        variant="outline"
                        leftIcon={<Ionicons name="logo-venmo" size={16} color={colors.primary} />}
                      />
                    )}
                  </View>
                )}
              </Card>
            );
          }}
        />
      )}
    </View>
  );
}
