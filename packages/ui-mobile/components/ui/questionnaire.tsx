// @/components/ui/questionnaire.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useTheme } from "@/contexts/theme-context";

export interface QuestionnaireChoice {
  value: string;
  label: string;
  shortcut?: string;
}

export interface QuestionnaireQuestion {
  name: string;
  title: string;
  description?: string;
  choices?: QuestionnaireChoice[];
  allowSkip?: boolean;
  allowMultiple?: boolean;
}

export interface QuestionnaireProps {
  questions: QuestionnaireQuestion[];
  onSubmit?: (answers: Record<string, string | string[]>) => void;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

export function Questionnaire({ questions, onSubmit, style }: QuestionnaireProps) {
  const { theme } = useTheme();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});

  const current = questions[index];
  const isLast = index === questions.length - 1;

  const handleChoice = (value: string) => {
    if (current.allowMultiple) {
      const prev = (answers[current.name] as string[]) ?? [];
      const next = prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value];
      setAnswers({ ...answers, [current.name]: next });
    } else {
      setAnswers({ ...answers, [current.name]: value });
    }
  };

  const handleNext = () => {
    if (isLast) {
      onSubmit?.(answers);
    } else {
      setIndex(index + 1);
    }
  };

  const handlePrev = () => {
    if (index > 0) setIndex(index - 1);
  };

  const handleSkip = () => {
    setAnswers({ ...answers, [current.name]: current.allowMultiple ? [] : "" });
    handleNext();
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.progress, { color: theme.colors.mutedForeground }]}>
        {index + 1} / {questions.length}
      </Text>
      <View style={styles.item}>
        <Text style={[styles.title, { color: theme.colors.foreground }]}>
          {current.title}
        </Text>
        {current.description ? (
          <Text style={[styles.description, { color: theme.colors.mutedForeground }]}>
            {current.description}
          </Text>
        ) : null}
        <View style={styles.choices}>
          {current.choices?.map((choice) => {
            const selected = current.allowMultiple
              ? ((answers[current.name] as string[]) ?? []).includes(choice.value)
              : answers[current.name] === choice.value;
            return (
              <TouchableOpacity
                key={choice.value}
                style={[
                  styles.choice,
                  { borderColor: theme.colors.border },
                  selected && { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + "22" },
                ]}
                onPress={() => handleChoice(choice.value)}
              >
                <Text style={[styles.choiceLabel, { color: theme.colors.foreground }]}>
                  {choice.label}
                </Text>
                {choice.shortcut ? (
                  <Text style={[styles.shortcut, { color: theme.colors.mutedForeground }]}>
                    {choice.shortcut}
                  </Text>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      <View style={styles.actions}>
        {index > 0 ? (
          <TouchableOpacity style={styles.button} onPress={handlePrev}>
            <Text style={{ color: theme.colors.foreground }}>Précédent</Text>
          </TouchableOpacity>
        ) : null}
        {current.allowSkip ? (
          <TouchableOpacity style={styles.button} onPress={handleSkip}>
            <Text style={{ color: theme.colors.mutedForeground }}>Ignorer</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity style={[styles.button, styles.primary]} onPress={handleNext}>
          <Text style={{ color: theme.colors.primaryForeground }}>
            {isLast ? "Envoyer" : "Suivant"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  progress: {
    fontSize: 12,
    textAlign: "right",
  },
  item: {
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  description: {
    fontSize: 14,
  },
  choices: {
    gap: 8,
    marginTop: 8,
  },
  choice: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  choiceLabel: {
    fontSize: 15,
  },
  shortcut: {
    fontSize: 12,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 12,
  },
  button: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  primary: {
    backgroundColor: "#2563eb",
  },
});

export default Questionnaire;