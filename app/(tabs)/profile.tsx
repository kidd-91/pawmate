import { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
  Alert,
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
  const [customBreed, setCustomBreed] = useState("");
  const [ageMonths, setAgeMonths] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [size, setSize] = useState("medium");
  const [personality, setPersonality] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
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

  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setUploading(true);

      try {
        const mimeType = asset.mimeType || "image/jpeg";
        const ext = mimeType.split("/")[1] || "jpg";
        const fileName = `${session!.user.id}/${Date.now()}.${ext}`;

        if (asset.base64) {
          // Use base64 decode — works on both web and native
          const binaryString = atob(asset.base64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          const { data, error } = await supabase.storage
            .from("dog-photos")
            .upload(fileName, bytes.buffer, {
              contentType: mimeType,
              upsert: true,
            });

          if (error) {
            Alert.alert("上傳失敗", error.message);
            setUploading(false);
            return;
          }

          if (data) {
            const { data: publicUrl } = supabase.storage
              .from("dog-photos")
              .getPublicUrl(data.path);
            setPhotos((prev) => [...prev, publicUrl.publicUrl]);
          }
        } else {
          // Fallback: fetch URI as blob
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          const arrayBuffer = await new Response(blob).arrayBuffer();

          const { data, error } = await supabase.storage
            .from("dog-photos")
            .upload(fileName, arrayBuffer, {
              contentType: mimeType,
              upsert: true,
            });

          if (error) {
            Alert.alert("上傳失敗", error.message);
            setUploading(false);
            return;
          }

          if (data) {
            const { data: publicUrl } = supabase.storage
              .from("dog-photos")
              .getPublicUrl(data.path);
            setPhotos((prev) => [...prev, publicUrl.publicUrl]);
          }
        }
      } catch (e: any) {
        Alert.alert("上傳失敗", e.message || "未知錯誤");
      }

      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const togglePersonality = (tag: string) => {
    if (personality.includes(tag)) {
      setPersonality(personality.filter((p) => p !== tag));
    } else if (personality.length < 5) {
      setPersonality([...personality, tag]);
    }
  };

  const addCustomTag = () => {
    const tag = customTag.trim();
    if (!tag) return;
    if (personality.includes(tag)) {
      setCustomTag("");
      return;
    }
    if (personality.length >= 5) return;
    setPersonality([...personality, tag]);
    setCustomTag("");
  };

  const handleSave = async () => {
    if (!session?.user?.id || !name.trim()) return;
    setSaving(true);

    const finalBreed = breed || customBreed.trim();

    const dogData = {
      owner_id: session.user.id,
      name: name.trim(),
      breed: finalBreed,
      age_months: parseInt(ageMonths) || 0,
      gender,
      size,
      personality,
      bio: bio.trim(),
      photos,
      is_active: true,
    };

    if (myDog) {
      const { error } = await supabase.from("dogs").update(dogData).eq("id", myDog.id);
      if (error) Alert.alert("儲存失敗", error.message);
    } else {
      const { error } = await supabase.from("dogs").insert(dogData);
      if (error) Alert.alert("儲存失敗", error.message);
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
          <View key={i} style={styles.photoWrapper}>
            <Image source={{ uri }} style={styles.photo} />
            <TouchableOpacity
              style={styles.removePhoto}
              onPress={() => removePhoto(i)}
            >
              <MaterialCommunityIcons name="close-circle" size={22} color={colors.accent} />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.addPhoto} onPress={pickImage} disabled={uploading}>
          <MaterialCommunityIcons
            name={uploading ? "loading" : "camera-plus"}
            size={32}
            color={uploading ? colors.textSecondary : colors.primary}
          />
          <Text style={styles.addPhotoText}>{uploading ? "上傳中..." : "新增照片"}</Text>
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
          label="選擇或輸入品種"
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
                if (breed === b) {
                  setBreed("");
                } else {
                  setBreed(b);
                  setCustomBreed("");
                }
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
      <TextInput
        label="自行輸入品種"
        value={customBreed}
        onChangeText={(v) => {
          setCustomBreed(v);
          setBreed(v);
        }}
        style={styles.input}
        mode="outlined"
        outlineColor={colors.border}
        activeOutlineColor={colors.primary}
        placeholder="如果上面沒有，在這裡輸入"
      />

      {/* Age */}
      <TextInput
        label="年齡"
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
        {/* Show custom tags that aren't in the preset list */}
        {personality
          .filter((t) => !(PERSONALITY_OPTIONS as readonly string[]).includes(t))
          .map((tag) => (
            <Chip
              key={tag}
              selected
              onPress={() => togglePersonality(tag)}
              style={styles.selectedChip}
              textStyle={styles.selectedChipText}
              closeIcon="close"
              onClose={() => togglePersonality(tag)}
            >
              {tag}
            </Chip>
          ))}
      </View>
      <View style={styles.customTagRow}>
        <TextInput
          label="自訂標籤"
          value={customTag}
          onChangeText={setCustomTag}
          style={styles.customTagInput}
          mode="outlined"
          outlineColor={colors.border}
          activeOutlineColor={colors.primary}
          dense
          onSubmitEditing={addCustomTag}
          placeholder="輸入後按新增"
        />
        <Button
          mode="contained"
          buttonColor={colors.primary}
          onPress={addCustomTag}
          disabled={!customTag.trim() || personality.length >= 5}
          compact
          style={styles.addTagBtn}
        >
          新增
        </Button>
      </View>

      {/* Bio */}
      <Text style={styles.label}>自我介紹</Text>
      <TextInput
        value={bio}
        onChangeText={setBio}
        multiline
        numberOfLines={4}
        style={[styles.input, styles.bioInput]}
        mode="outlined"
        outlineColor={colors.border}
        activeOutlineColor={colors.primary}
        placeholder="介紹一下你的狗狗吧..."
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
  bioInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  photoRow: {
    marginBottom: spacing.md,
  },
  photoWrapper: {
    position: "relative",
    marginRight: spacing.sm,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 16,
  },
  removePhoto: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: colors.surface,
    borderRadius: 11,
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
    marginBottom: spacing.sm,
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
  customTagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  customTagInput: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  addTagBtn: {
    borderRadius: 12,
    marginTop: 4,
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
