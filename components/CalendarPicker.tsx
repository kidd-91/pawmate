import { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, spacing } from "../constants/theme";

interface CalendarPickerProps {
  selected: string;
  onSelect: (date: string) => void;
  minDate?: string;
}

const DAYS = ["日", "一", "二", "三", "四", "五", "六"];

export default function CalendarPicker({ selected, onSelect, minDate }: CalendarPickerProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const min = minDate ? new Date(minDate + "T00:00:00") : today;
  min.setHours(0, 0, 0, 0);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const goToPrev = () => {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1);
      setViewMonth(11);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const goToNext = () => {
    if (viewMonth === 11) {
      setViewYear(viewYear + 1);
      setViewMonth(0);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const toDateStr = (y: number, m: number, d: number) => {
    return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  };

  const canGoPrev = new Date(viewYear, viewMonth, 1) > min;

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPrev} disabled={!canGoPrev} style={styles.navBtn}>
          <MaterialCommunityIcons
            name="chevron-left"
            size={24}
            color={canGoPrev ? colors.text : colors.border}
          />
        </TouchableOpacity>
        <Text style={styles.monthLabel}>
          {viewYear} 年 {viewMonth + 1} 月
        </Text>
        <TouchableOpacity onPress={goToNext} style={styles.navBtn}>
          <MaterialCommunityIcons name="chevron-right" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.weekRow}>
        {DAYS.map((d) => (
          <Text key={d} style={styles.weekDay}>{d}</Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((day, i) => {
          if (day === null) {
            return <View key={`empty-${i}`} style={styles.cell} />;
          }

          const dateStr = toDateStr(viewYear, viewMonth, day);
          const dateObj = new Date(viewYear, viewMonth, day);
          const isPast = dateObj < min;
          const isSelected = dateStr === selected;
          const isToday = dateStr === toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

          return (
            <TouchableOpacity
              key={dateStr}
              style={[
                styles.cell,
                isSelected && styles.selectedCell,
                isToday && !isSelected && styles.todayCell,
              ]}
              onPress={() => !isPast && onSelect(dateStr)}
              disabled={isPast}
            >
              <Text
                style={[
                  styles.dayText,
                  isPast && styles.pastText,
                  isSelected && styles.selectedText,
                ]}
              >
                {day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.sm,
  },
  navBtn: {
    padding: 4,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
  },
  weekRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  weekDay: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cell: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedCell: {
    backgroundColor: colors.primary,
    borderRadius: 20,
  },
  todayCell: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 20,
  },
  dayText: {
    fontSize: 14,
    color: colors.text,
  },
  pastText: {
    color: colors.border,
  },
  selectedText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});
