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
  Portal,
  Modal,
} from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, spacing } from "../../constants/theme";
import { supabase } from "../../lib/supabase";
import { api } from "../../lib/api";
import { useAuthStore } from "../../stores/authStore";
import {
  PERSONALITY_OPTIONS,
  BREED_OPTIONS,
  SIZE_OPTIONS,
  WALKING_LOCATION_OPTIONS,
  WALKING_TIME_OPTIONS,
  WALKING_FREQUENCY_OPTIONS,
} from "../../types";
import { TAIWAN_LOCATIONS, CITIES } from "../../constants/locations";
import DogCard from "../../components/DogCard";
import PawBackground from "../../components/PawBackground";

export default function ProfileScreen() {
  const { session, profile, myDog, fetchProfile, fetchMyDog, signOut } =
    useAuthStore();

  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [customBreed, setCustomBreed] = useState("");
  const [ageMonths, setAgeMonths] = useState("");
  const [ageUnit, setAgeUnit] = useState<"months" | "years">("months");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [size, setSize] = useState("medium");
  const [personality, setPersonality] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [walkingLocations, setWalkingLocations] = useState<string[]>([]);
  const [walkingSpots, setWalkingSpots] = useState<string[]>([]);
  const [walkingTimes, setWalkingTimes] = useState<string[]>([]);
  const [walkingFrequency, setWalkingFrequency] = useState("");
  const [newSpotName, setNewSpotName] = useState("");
  const [showCities, setShowCities] = useState(false);
  const [showDistricts, setShowDistricts] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [showBreeds, setShowBreeds] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    if (session) {
      fetchProfile();
      fetchMyDog();
    }
  }, [session]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name);
    }
  }, [profile]);

  useEffect(() => {
    if (myDog) {
      setName(myDog.name);
      setBreed(myDog.breed);
      if (myDog.age_months >= 12 && myDog.age_months % 12 === 0) {
        setAgeMonths(String(myDog.age_months / 12));
        setAgeUnit("years");
      } else {
        setAgeMonths(String(myDog.age_months));
        setAgeUnit("months");
      }
      setGender(myDog.gender);
      setSize(myDog.size);
      setPersonality(myDog.personality);
      setBio(myDog.bio);
      setCity(myDog.city || "");
      setDistrict(myDog.district || "");
      setWalkingLocations(myDog.walking_locations || []);
      setWalkingSpots(myDog.walking_spots || []);
      setWalkingTimes(myDog.walking_times || []);
      setWalkingFrequency(myDog.walking_frequency || "");
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

  const computeAgeMonths = () => {
    const val = parseInt(ageMonths) || 0;
    return ageUnit === "years" ? val * 12 : val;
  };

  const handleSave = async () => {
    if (!session?.user?.id || !name.trim()) return;
    setSaving(true);

    const finalBreed = breed || customBreed.trim();

    const dogData = {
      name: name.trim(),
      breed: finalBreed,
      age_months: computeAgeMonths(),
      gender,
      size,
      personality,
      bio: bio.trim(),
      city,
      district,
      walking_locations: walkingLocations,
      walking_spots: walkingSpots,
      walking_times: walkingTimes,
      walking_frequency: walkingFrequency,
      photos,
      is_active: true,
    };

    try {
      if (myDog) {
        await api.put(`/api/dogs/${myDog.id}`, dogData);
      } else {
        await api.post("/api/dogs", dogData);
      }
    } catch (e: any) {
      Alert.alert("儲存失敗", e.message);
    }

    await fetchMyDog();
    setSaving(false);
  };

  const handleUpdateDisplayName = async () => {
    if (!session?.user?.id || !displayName.trim()) return;
    try {
      await api.put("/api/profiles", { display_name: displayName.trim() });
    } catch {}
    await fetchProfile();
    setEditingName(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <PawBackground />
      {/* Header Card */}
      <View style={styles.headerCard}>
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        />
        <View style={styles.headerTop}>
          <View style={styles.headerAvatarWrap}>
            {myDog?.photos?.[0] ? (
              <Image source={{ uri: myDog.photos[0] }} style={styles.headerAvatar} />
            ) : (
              <View style={styles.headerAvatarPlaceholder}>
                <Text style={{ fontSize: 32 }}>🐶</Text>
              </View>
            )}
          </View>
          <View style={styles.headerInfo}>
            {editingName ? (
              <View style={styles.editNameRow}>
                <TextInput
                  value={displayName}
                  onChangeText={setDisplayName}
                  style={styles.editNameInput}
                  mode="outlined"
                  outlineColor="rgba(255,255,255,0.5)"
                  activeOutlineColor="#FFF"
                  textColor="#FFF"
                  dense
                />
                <TouchableOpacity onPress={handleUpdateDisplayName} style={styles.editNameBtn}>
                  <MaterialCommunityIcons name="check" size={20} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setEditingName(false)} style={styles.editNameBtn}>
                  <MaterialCommunityIcons name="close" size={20} color="rgba(255,255,255,0.7)" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={() => setEditingName(true)} style={styles.greetingRow}>
                <Text style={styles.greeting}>
                  嗨，{profile?.display_name ?? "主人"}！
                </Text>
                <MaterialCommunityIcons name="pencil" size={14} color="rgba(255,255,255,0.8)" />
              </TouchableOpacity>
            )}
            <Text style={styles.headerSub}>
              {myDog ? `${myDog.name} 的主人` : "還沒有建立狗狗檔案"}
            </Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          {myDog && (
            <TouchableOpacity onPress={() => setShowPreview(true)} style={styles.headerActionBtn}>
              <MaterialCommunityIcons name="eye-outline" size={18} color="#FFF" />
              <Text style={styles.headerActionText}>預覽卡片</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={signOut} style={styles.headerActionBtn}>
            <MaterialCommunityIcons name="logout" size={18} color="rgba(255,255,255,0.8)" />
            <Text style={[styles.headerActionText, { opacity: 0.8 }]}>登出</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Section Title */}
      <View style={styles.sectionHeader}>
        <MaterialCommunityIcons name="dog" size={22} color={colors.primary} />
        <Text style={styles.sectionTitle}>
          {myDog ? "編輯狗狗檔案" : "建立狗狗檔案"}
        </Text>
      </View>

      {/* Photos */}
      <View style={styles.formCard}>
      <Text style={styles.label}>📷 照片</Text>
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
      </View>

      {/* Basic Info Card */}
      <View style={styles.formCard}>
      <Text style={styles.label}>🐕 品種</Text>
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
      <Text style={styles.label}>年齡</Text>
      <View style={styles.ageRow}>
        <TextInput
          label={ageUnit === "years" ? "幾歲" : "幾個月"}
          value={ageMonths}
          onChangeText={setAgeMonths}
          keyboardType="numeric"
          style={styles.ageInput}
          mode="outlined"
          outlineColor={colors.border}
          activeOutlineColor={colors.primary}
        />
        <SegmentedButtons
          value={ageUnit}
          onValueChange={(v) => setAgeUnit(v as "months" | "years")}
          buttons={[
            { value: "years", label: "歲" },
            { value: "months", label: "個月" },
          ]}
          style={styles.ageUnitSegment}
        />
      </View>

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

      </View>

      {/* Personality Card */}
      <View style={styles.formCard}>
      <Text style={styles.label}>✨ 個性標籤（最多 5 個）</Text>
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

      </View>

      {/* Location & Bio Card */}
      <View style={styles.formCard}>
      <Text style={styles.label}>📍 所在地區</Text>
      <View style={styles.locationRow}>
        <View style={styles.locationField}>
          <TouchableOpacity onPress={() => { setShowCities(!showCities); setShowDistricts(false); }}>
            <TextInput
              label="縣市"
              value={city}
              editable={false}
              style={styles.input}
              mode="outlined"
              outlineColor={colors.border}
              right={<TextInput.Icon icon="chevron-down" />}
            />
          </TouchableOpacity>
          {showCities && (
            <View style={styles.dropdown}>
              <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                {CITIES.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.dropdownItem, city === c && styles.dropdownItemActive]}
                    onPress={() => {
                      setCity(c);
                      setDistrict("");
                      setShowCities(false);
                    }}
                  >
                    <Text style={[styles.dropdownText, city === c && styles.dropdownTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        <View style={styles.locationField}>
          <TouchableOpacity onPress={() => { if (city) { setShowDistricts(!showDistricts); setShowCities(false); } }}>
            <TextInput
              label="區域"
              value={district}
              editable={false}
              style={styles.input}
              mode="outlined"
              outlineColor={colors.border}
              right={<TextInput.Icon icon="chevron-down" />}
            />
          </TouchableOpacity>
          {showDistricts && city && TAIWAN_LOCATIONS[city] && (
            <View style={styles.dropdown}>
              <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                {TAIWAN_LOCATIONS[city].map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.dropdownItem, district === d && styles.dropdownItemActive]}
                    onPress={() => {
                      setDistrict(d);
                      setShowDistricts(false);
                    }}
                  >
                    <Text style={[styles.dropdownText, district === d && styles.dropdownTextActive]}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      {/* Bio */}
      <Text style={styles.label}>📝 自我介紹</Text>
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

      </View>

      {/* Walking Habits Card */}
      <View style={styles.formCard}>
        <Text style={styles.label}>🐾 遛狗地點類型（可複選）</Text>
        <View style={styles.tagGrid}>
          {WALKING_LOCATION_OPTIONS.map((loc) => (
            <Chip
              key={loc}
              selected={walkingLocations.includes(loc)}
              onPress={() => {
                if (walkingLocations.includes(loc)) {
                  setWalkingLocations(walkingLocations.filter((l) => l !== loc));
                } else {
                  setWalkingLocations([...walkingLocations, loc]);
                }
              }}
              style={[
                styles.tagChip,
                walkingLocations.includes(loc) && styles.selectedChip,
              ]}
              textStyle={walkingLocations.includes(loc) ? styles.selectedChipText : undefined}
            >
              {loc}
            </Chip>
          ))}
        </View>

        <Text style={styles.label}>📍 常去的具體地點</Text>
        <Text style={styles.labelHint}>填入具體名稱，配對時能找到去同一個地方的狗友！</Text>
        {walkingSpots.length > 0 && (
          <View style={styles.spotsList}>
            {walkingSpots.map((spot, i) => (
              <View key={i} style={styles.spotItem}>
                <MaterialCommunityIcons name="map-marker" size={16} color={colors.primary} />
                <Text style={styles.spotName}>{spot}</Text>
                <TouchableOpacity onPress={() => setWalkingSpots(walkingSpots.filter((_, j) => j !== i))}>
                  <MaterialCommunityIcons name="close-circle" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
        <View style={styles.customTagRow}>
          <TextInput
            label="地點名稱"
            value={newSpotName}
            onChangeText={setNewSpotName}
            style={styles.customTagInput}
            mode="outlined"
            outlineColor={colors.border}
            activeOutlineColor={colors.primary}
            dense
            onSubmitEditing={() => {
              const s = newSpotName.trim();
              if (s && !walkingSpots.includes(s)) {
                setWalkingSpots([...walkingSpots, s]);
              }
              setNewSpotName("");
            }}
            placeholder="例：大安森林公園"
          />
          <Button
            mode="contained"
            buttonColor={colors.primary}
            onPress={() => {
              const s = newSpotName.trim();
              if (s && !walkingSpots.includes(s)) {
                setWalkingSpots([...walkingSpots, s]);
              }
              setNewSpotName("");
            }}
            disabled={!newSpotName.trim()}
            compact
            style={styles.addTagBtn}
          >
            新增
          </Button>
        </View>

        <Text style={styles.label}>🕐 遛狗時間（可複選）</Text>
        <View style={styles.tagGrid}>
          {WALKING_TIME_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              selected={walkingTimes.includes(opt.value)}
              onPress={() => {
                if (walkingTimes.includes(opt.value)) {
                  setWalkingTimes(walkingTimes.filter((t) => t !== opt.value));
                } else {
                  setWalkingTimes([...walkingTimes, opt.value]);
                }
              }}
              style={[
                styles.tagChip,
                walkingTimes.includes(opt.value) && styles.selectedChip,
              ]}
              textStyle={walkingTimes.includes(opt.value) ? styles.selectedChipText : undefined}
            >
              {opt.label}
            </Chip>
          ))}
        </View>

        <Text style={styles.label}>📅 遛狗頻率</Text>
        <SegmentedButtons
          value={walkingFrequency}
          onValueChange={setWalkingFrequency}
          buttons={WALKING_FREQUENCY_OPTIONS.map((f) => ({ value: f.value, label: f.label }))}
          style={styles.segment}
        />
      </View>

      <Button
        mode="contained"
        onPress={handleSave}
        loading={saving}
        disabled={saving || !name.trim()}
        style={styles.saveBtn}
        buttonColor={colors.primary}
        labelStyle={{ fontSize: 16, fontWeight: "bold" }}
        icon={myDog ? "content-save" : "plus-circle"}
      >
        {myDog ? "儲存變更" : "建立檔案"}
      </Button>

      {/* Preview Modal */}
      <Portal>
        <Modal
          visible={showPreview}
          onDismiss={() => setShowPreview(false)}
          contentContainerStyle={styles.previewModal}
        >
          <Text style={styles.previewTitle}>別人看到的卡片</Text>
          <DogCard
            dog={{
              id: myDog?.id ?? "",
              owner_id: session?.user?.id ?? "",
              name: name || "你的狗狗",
              breed: breed || customBreed,
              age_months: computeAgeMonths(),
              gender,
              size: size as "small" | "medium" | "large",
              personality,
              bio,
              city,
              district,
              walking_locations: walkingLocations,
              walking_spots: walkingSpots,
              walking_times: walkingTimes,
              walking_frequency: walkingFrequency,
              photos,
              is_active: true,
              created_at: "",
              owner: profile ?? undefined,
            }}
          />
          <Button
            mode="text"
            onPress={() => setShowPreview(false)}
            style={{ marginTop: spacing.md }}
          >
            關閉
          </Button>
        </Modal>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl * 2,
    paddingTop: spacing.sm,
  },
  // Header card
  headerCard: {
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: spacing.lg,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  headerGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  headerAvatarWrap: {},
  headerAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.5)",
  },
  headerAvatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerInfo: {
    flex: 1,
  },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFF",
  },
  headerSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  editNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  editNameInput: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  editNameBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerActions: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.lg,
  },
  headerActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerActionText: {
    fontSize: 13,
    color: "#FFF",
    fontWeight: "600",
  },
  // Section headers
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
  },
  // Form cards
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.md,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  previewModal: {
    alignItems: "center",
    padding: spacing.lg,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  ageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  ageInput: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  ageUnitSegment: {
    flex: 1,
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
  labelHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: -4,
  },
  spotsList: {
    gap: 6,
    marginBottom: spacing.sm,
  },
  spotItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,140,105,0.08)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  spotName: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  segment: {
    marginBottom: spacing.sm,
  },
  locationRow: {
    flexDirection: "row",
    gap: spacing.sm,
    zIndex: 10,
  },
  locationField: {
    flex: 1,
    position: "relative",
  },
  dropdown: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    zIndex: 100,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  dropdownItemActive: {
    backgroundColor: "rgba(255,140,105,0.1)",
  },
  dropdownText: {
    fontSize: 15,
    color: colors.text,
  },
  dropdownTextActive: {
    color: colors.primary,
    fontWeight: "bold",
  },
  saveBtn: {
    marginTop: spacing.md,
    borderRadius: 25,
    paddingVertical: 6,
    elevation: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
