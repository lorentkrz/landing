import { useNavigation } from "@react-navigation/native";
import type { NavigationProp } from "@react-navigation/native";

type GenericParamList = Record<string, object | undefined>;

export const useAppNavigation = () => useNavigation<NavigationProp<GenericParamList>>();
