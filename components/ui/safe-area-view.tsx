// @/components/ui/safe-area-view.tsx
import { forwardRef } from "react";
import {
  SafeAreaView,
  SafeAreaViewProps,
} from "react-native-safe-area-context";

interface ThemedSafeAreaViewProps extends SafeAreaViewProps {
  children?: React.ReactNode;
  className?: string;
}

const ThemedSafeAreaView = forwardRef<any, ThemedSafeAreaViewProps>(
  (props: ThemedSafeAreaViewProps, _ref: any) => {
    return <SafeAreaView {...props} />;
  },
);

ThemedSafeAreaView.displayName = "SafeAreaView";

export default ThemedSafeAreaView;
