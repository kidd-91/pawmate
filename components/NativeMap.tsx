import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import MapView, { Marker, Callout } from "react-native-maps";
import { colors, spacing } from "../constants/theme";

interface MarkerData {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  subtitle: string;
}

interface Props {
  latitude: number;
  longitude: number;
  markers?: MarkerData[];
}

export default function NativeMap({ latitude, longitude, markers = [] }: Props) {
  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude,
        longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
      showsUserLocation
    >
      {markers.map((m) => (
        <Marker
          key={m.id}
          coordinate={{ latitude: m.latitude, longitude: m.longitude }}
        >
          <View style={styles.marker}>
            <Text style={styles.markerEmoji}>🐕</Text>
          </View>
          <Callout>
            <View style={styles.callout}>
              <Text style={styles.calloutName}>{m.title}</Text>
              <Text style={styles.calloutBreed}>{m.subtitle}</Text>
            </View>
          </Callout>
        </Marker>
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  marker: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 6,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  markerEmoji: { fontSize: 20 },
  callout: { padding: spacing.sm, minWidth: 120 },
  calloutName: { fontSize: 16, fontWeight: "bold", color: colors.text },
  calloutBreed: { fontSize: 13, color: colors.textSecondary },
});
