import { useEffect, useState } from "react";
import { Keyboard, Platform } from "react-native";

/**
 * Tracks the on-screen keyboard height in pixels.
 *
 * Why this exists: KeyboardAvoidingView + react-native-paper's <Portal>
 * <Modal> combo doesn't reliably push form inputs above the keyboard
 * on Android (the Modal renders outside the normal view tree, so
 * softwareKeyboardLayoutMode and KeyboardAvoidingView both miss it).
 *
 * Use the returned height as bottom padding on a ScrollView inside the
 * Modal so the user can scroll the focused TextInput into view.
 */
export function useKeyboardHeight(): number {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    // "Will" events fire before the keyboard animates in (iOS only,
    // Android only has Did*). Falling back to Did* on Android gives a
    // slightly later but still-correct height.
    const showEvt = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvt = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvt, (e) => {
      setHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvt, () => {
      setHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return height;
}
