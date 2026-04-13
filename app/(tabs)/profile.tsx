import { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import {
  Text,
  TextInput,
  Button,
  Chip,
  SegmentedButtons,
} from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, spacing } from "../../constants/theme";
import { supabase } from "../../lib/supabase";
import { useAuthStore } from "../../stores/authStore";
import {
  PERSONALITY_OPTIONS,
  BREED_OPTIONS,
  SIZE_OPTIONS,
} from "../../types";

export default function ProfileScreen() {
  const { session, profile, myDog, fetchProfile, fetchMyDog, signOut } =
    useAuthStore();

  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [ageMonths, setAgeMonths] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [size, setSize] = useState("medium");
  const [personality, setPersonality] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [showBreeds, setShowBreeds] = useState(false);

  useEffect(() => {
    if (session) {
      fetchProfile();
      fetchMyDog();
    }
  }, [session]);

  useEffect(() => {
    if (myDog) {
      setName(myDog.name);
      setBreed(myDog.breed);
      setAgeMonths(String(myDog.age_months));
      setGender(myDog.gender);
      setSize(myDog.size);
      setPersonality(myDog.personality);
      setBio(myDog.bio);
      setPhotos(myDog.photos);
    }
  }, [myDog]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      const ext = uri.split(".").pop();
      const fileName = `${session!.user.id}/${Date.now()}.${ext}`;

      const response = await fetch(uri);
      const blob = await response.blob();

      const { data, error } = await supabase.storage
        .from("dog-photos")
        .upload(fileName, blob, { contentType: `image/${ext}` });

      if (data) {
        const { data: publicUrl } = supabase.storage
          .from("dog-photos")
          .getPublicUrl(data.path);
        setPhotos([...photos, publicUrl.publicUrl]);
      }
    }
  };

  const togglePersonality = (tag: string) => {
    if (personality.includes(tag)) {
      setPersonality(personality.filter((p) => p !== tag));
    } else if (personality.length < 5) {
      setPersonality([...personality, tag]);
    }
  };

  const handleSave = async () => {
    if (!session?.user?.id || !name.trim()) return;
    setSaving(true);

    const dogData = {
      owner_id: session.user.id,
      name: name.trim(),
      breed,
      age_months: parseInt(ageMonths) || 0,
      gender,
      size,
      personality,
      bio: bio.trim(),
      photos,
      is_active: true,
    };

    if (myDog) {
      await supabase.from("dogs").update(dogData).eq("id", myDog.id);
    } else {
      await supabase.from("dogs").insert(dogData);
    }

    await fetchMyDog();
    setSaving(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>
          嗨，{profile?.display_name ?? "主人"}！
        </Text>
        <Button mode="text" textColor={colors.accent} onPress={signOut}>
          登出
        </Button>
      </View>

      <Text style={styles.sectionTitle}>
        {myDog ? "編輯狗狗檔案" : "建立狗狗檔案"}
      </Text>

      {/* Photos */}
      <Text style={styles.label}>照片</Text>
      <ScrollView horizontal style={styles.photoRow} showsHorizontalScrollIndicator={false}>
        {photos.map((uri, i) => (
          <Image key={i} source={{ uri }} style={styles.photo} />
        ))}
        <TouchableOpacity style={styles.addPhoto} onPress={pickImage}>
          <MaterialCommunityIcons name="camera-plus" size={32} color={colors.primary} />
          <Text style={styles.addPhotoText}>新增照片</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Name */}
      <TextInput
        label="狗狗名字"
        value={name}
        onChangeText={setName}
        style={styles.input}
        mode="outlined"
        outlineColor={colors.border}
        activeOutlineColor={colors.primary}
      />

      {/* Breed */}
      <Text style={styles.label}>品種</Text>
      <TouchableOpacity onPress={() => setShowBreeds(!showBreeds)}>
        <TextInput
          label="選擇品種"
          value={breed}
          editable={false}
          style={styles.input}
          mode="outlined"
          outlineColor={colors.border}
          right={<TextInput.Icon icon="chevron-down" />}
        />
      </TouchableOpacity>
      {showBreeds && (
        <View style={styles.breedGrid}>
          {BREED_OPTIONS.map((b) => (
            <Chip
              key={b}
              selected={breed === b}
              onPress={() => {
                setBreed(b);
                setShowBreeds(false);
              }}
              style={[styles.breedChip, breed === b && styles.selectedChip]}
              textStyle={breed === b ? styles.selectedChipText : undefined}
            >
              {b}
            </Chip>
          ))}
        </View>
      )}

      {/* Age */}
      <TextInput
        label="年齡（月）"
        value={ageMonths}
        onChangeText={setAgeMonths}
        keyboardType="numeric"
        style={styles.input}
        mode="outlined"
        outlineColor={colors.border}
        activeOutlineColor={colors.primary}
      />

      {/* Gender */}
      <Text style={styles.label}>性別</Text>
      <SegmentedButtons
        value={gender}
        onValueChange={(v) => setGender(v as "male" | "female")}
        buttons={[
          { value: "male", label: "♂ 公" },
          { value: "female", label: "♀ 母" },
        ]}
        style={styles.segment}
      />

      {/* Size */}
      <Text style={styles.label}>體型</Text>
      <SegmentedButtons
        value={size}
        onValueChange={setSize}
        buttons={SIZE_OPTIONS.map((s) => ({ value: s.value, label: s.label }))}
        style={styles.segment}
      />

      {/* Personality */}
      <Text style={styles.label}>個性標籤（最多 5 個）</Text>
      <View style={styles.tagGrid}>
        {PERSONALITY_OPTIONS.map((tag) => (
          <Chip
            key={tag}
            selected={personality.includes(tag)}
            onPress={() => togglePersonality(tag)}
            style={[
              styles.tagChip,
              personality.includes(tag) && styles.selectedChip,
            ]}
            textStyle={personality.includes(tag) ? styles.selectedChipText : undefined}
          >
            {tag}
          </Chip>
        ))}
      </View>

      {/* Bio */}
      <TextInput
        label="自我介紹"
        value={bio}
        onChangeText={setBio}
        multiline
        numberOfLines={3}
        style={styles.input}
        mode="outlined"
        outlineColor={colors.border}
        activeOutlineColor={colors.primary}
      />

      <Button
        mode="contained"
        onPress={handleSave}
        loading={saving}
        disabled={saving || !name.trim()}
        style={styles.saveBtn}
        buttonColor={colors.primary}
        labelStyle={{ fontSize: 16, fontWeight: "bold" }}
      >
        {myDog ? "儲存變更" : "建立檔案"}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  photoRow: {
    marginBottom: spacing.md,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 16,
    marginRight: spacing.sm,
  },
  addPhoto: {
    width: 100,
    height: 100,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  addPhotoText: {
    fontSize: 11,
    color: colors.primary,
    marginTop: 4,
  },
  breedGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: spacing.md,
  },
  breedChip: {
    backgroundColor: colors.surface,
  },
  tagGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: spacing.md,
  },
  tagChip: {
    backgroundColor: colors.surface,
  },
  selectedChip: {
    backgroundColor: colors.primary,
  },
  selectedChipText: {
    color: "#FFF",
  },
  segment: {
    marginBottom: spacing.sm,
  },
  saveBtn: {
    marginTop: spacing.lg,
    borderRadius: 25,
    paddingVertical: 4,
  },
});
