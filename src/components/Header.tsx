import { Image, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Images } from "../theme";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";

export default function Header() {
  const safeAreaInsets = useSafeAreaInsets();
  return (
    <View style={[styles.headerContainer, { paddingTop: safeAreaInsets.top }]}>
      <View style={styles.headerLogoContainer}>
        <Image source={Images.logo} style={styles.headerLogo} />
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Olá,</Text>
          <Text style={styles.headerSubtitle}>Usuário</Text>
        </View>
      </View>
      <View style={styles.headerMenuContainer}>
        <View style={styles.headerMenu}>
          <MaterialDesignIcons
            name="account"
            size={24}
            color={Colors.textPrimary}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Header Styles
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  headerLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 60,
    height: 34,
    marginRight: 12,
  },
  headerTitleContainer: {
    flexDirection: 'column',
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: -4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: 'bold',
  },
  headerMenuContainer: {},
  headerMenu: {
    padding: 8,
  },
});
