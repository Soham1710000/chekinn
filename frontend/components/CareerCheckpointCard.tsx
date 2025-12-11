import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../constants/design';

interface CareerCheckpointCardProps {
  learnings: {
    big_rocks?: string[];
    recurring_themes?: string[];
    constraints?: string[];
    decision_tendencies?: string;
  };
  onPress?: () => void;
}

export const CareerCheckpointCard: React.FC<CareerCheckpointCardProps> = ({ learnings, onPress }) => {
  const hasBigRocks = learnings?.big_rocks && learnings.big_rocks.length > 0;
  const hasThemes = learnings?.recurring_themes && learnings.recurring_themes.length > 0;
  
  if (!hasBigRocks && !hasThemes) {
    return null;
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="compass" size={20} color={Colors.accent} />
        </View>
        <Text style={styles.title}>What I know about you so far</Text>
      </View>

      {hasBigRocks && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Your priorities</Text>
          <View style={styles.itemsContainer}>
            {learnings.big_rocks.slice(0, 3).map((rock, index) => (
              <View key={index} style={styles.item}>
                <View style={styles.bullet} />
                <Text style={styles.itemText}>{rock}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {hasThemes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔄 Patterns I've noticed</Text>
          <View style={styles.itemsContainer}>
            {learnings.recurring_themes.slice(0, 2).map((theme, index) => (
              <View key={index} style={styles.item}>
                <View style={styles.bullet} />
                <Text style={styles.itemText}>{theme}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {learnings.decision_tendencies && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🤔 How you approach things</Text>
          <Text style={styles.decisionText}>{learnings.decision_tendencies}</Text>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>I'm building context as we talk</Text>
        <Ionicons name="arrow-forward" size={14} color={Colors.text.tertiary} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F7F5',
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    marginHorizontal: Spacing.screenPadding,
    borderWidth: 1,
    borderColor: '#E8E7E5',
    ...Shadows.soft,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: 6,
  },
  itemsContainer: {
    gap: 6,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.accent,
    marginTop: 7,
    marginRight: 8,
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text.primary,
  },
  decisionText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text.primary,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8E7E5',
    gap: 6,
  },
  footerText: {
    fontSize: 12,
    color: Colors.text.tertiary,
    fontStyle: 'italic',
  },
});
