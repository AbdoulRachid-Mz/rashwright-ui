// @/components/ui/safe-area-view.tsx
import { forwardRef } from "react";
import { View } from "react-native";
import {
  SafeAreaView,
  SafeAreaViewProps,
} from "react-native-safe-area-context";

interface ThemedSafeAreaViewProps extends SafeAreaViewProps {
  children?: React.ReactNode;
  className?: string;
}

const ThemedSafeAreaView = forwardRef<React.ElementRef<typeof View>, ThemedSafeAreaViewProps>(
  (props: ThemedSafeAreaViewProps, _ref: React.ForwardedRef<React.ElementRef<typeof View>>) => {
    return <SafeAreaView {...props} />;
  },
);

ThemedSafeAreaView.displayName = "SafeAreaView";

export default ThemedSafeAreaView;
