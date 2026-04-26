import { Alert, Platform } from "react-native";

/**
 * Cross-platform confirm dialog.
 *
 * React Native's Alert.alert with multiple buttons doesn't render on web —
 * the polyfill collapses to window.alert (one OK button), so destructive flows
 * silently fall through. This helper uses window.confirm on web and Alert.alert
 * on native, giving the same shape to callers.
 */
export function confirmAction(opts: {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}) {
  const {
    title,
    message,
    confirmText = "確認",
    cancelText = "取消",
    destructive = false,
    onConfirm,
    onCancel,
  } = opts;

  if (Platform.OS === "web") {
    const text = message ? `${title}\n\n${message}` : title;
    if (typeof window !== "undefined" && window.confirm(text)) {
      void onConfirm();
    } else {
      onCancel?.();
    }
    return;
  }

  Alert.alert(title, message, [
    { text: cancelText, style: "cancel", onPress: onCancel },
    {
      text: confirmText,
      style: destructive ? "destructive" : "default",
      onPress: () => {
        void onConfirm();
      },
    },
  ]);
}
