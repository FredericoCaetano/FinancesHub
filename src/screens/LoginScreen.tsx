import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Images } from '../theme';
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const [isLogin, setIsLogin] = React.useState(true);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const { login } = useAuth();

  //==================================================================================
  // Handlers
  //==================================================================================
  const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value.trim());

  const handleLogin = async () => {
    if (!isValidEmail(email)) {
      Alert.alert('Erro', 'Por favor, insira um email válido.');
      return;
    }
    await login(email);
  };

  const handleCreateAccount = () => {
    console.log('Criar conta');
  };

  const handleBackToLogin = () => {
    setIsLogin(true);
    console.log('Voltar para login');
  };

  const handleBackToCreateAccount = () => {
    setIsLogin(false);
    console.log('Ir para criar conta');
  };

  //==================================================================================
  // Components
  //==================================================================================

  const loginComponent = (
    <View style={styles.inputContainer}>
      <Text style={styles.inputTitle}>Bem-vindo de volta</Text>
      <Text style={styles.inputSubTitle}>
        Entre com suas credenciais para acessar sua conta
      </Text>
      <Text style={styles.inputLabel}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="seu@email.com"
        placeholderTextColor={Colors.textSecondary}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <Text style={styles.inputLabel}>Senha</Text>
      <TextInput
        style={styles.input}
        placeholder="********"
        placeholderTextColor={Colors.textSecondary}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity onPress={handleLogin} style={styles.inputLoginButton} disabled={!email || !password}>
        <Text style={styles.inputLoginButtonText}>Entrar</Text>
      </TouchableOpacity>
      <Text style={[styles.inputSubTitle, { marginTop: 16 }]}>
        Não tem uma conta?{' '}
        <Text
          style={{ color: Colors.primary }}
          onPress={handleBackToCreateAccount}
        >
          Criar conta
        </Text>
      </Text>
    </View>
  );

  const createAccountComponent = (
    <View style={styles.inputContainer}>
      <Text style={styles.inputTitle}>Crie sua conta</Text>
      <Text style={styles.inputSubTitle}>
        Comece a gerenciar suas finanças hoje mesmo
      </Text>
      <Text style={styles.inputLabel}>Nome Completo</Text>
      <TextInput
        style={styles.input}
        placeholder="Seu nome"
        placeholderTextColor={Colors.textSecondary}
        keyboardType="default"
        autoCapitalize="words"
        value={name}
        onChangeText={setName}
      />
      <Text style={styles.inputLabel}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="seu@email.com"
        placeholderTextColor={Colors.textSecondary}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <Text style={styles.inputLabel}>Senha</Text>
      <TextInput
        style={styles.input}
        placeholder="********"
        placeholderTextColor={Colors.textSecondary}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Text style={styles.inputLabel}>Confirmar Senha</Text>
      <TextInput
        style={styles.input}
        placeholder="********"
        placeholderTextColor={Colors.textSecondary}
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <TouchableOpacity
        onPress={handleCreateAccount}
        style={styles.inputLoginButton}
        disabled={!name || !email || !password || !confirmPassword || password !== confirmPassword}
      >
        <Text style={styles.inputLoginButtonText}>Criar Conta</Text>
      </TouchableOpacity>
      <Text style={[styles.inputSubTitle, { marginTop: 16 }]}>
        Já tem uma conta?{' '}
        <Text style={{ color: Colors.primary }} onPress={handleBackToLogin}>
          Entrar
        </Text>
      </Text>
    </View>
  );

  //==================================================================================
  // Main Component
  //==================================================================================
  return (
    <View
      style={styles.container}
    >
      <View style={styles.contentContainer}>
        <View style={styles.logoContainer}>
          <Image
            source={Images.logo}
            resizeMode="contain"
            style={styles.logo}
          />
        </View>
        {isLogin ? loginComponent : createAccountComponent}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  contentContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    width: '80%',
    shadowColor: Colors.overlay,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 100,
    height: 57,
  },
  inputContainer: {
    alignItems: 'center',
  },
  inputTitle: {
    fontSize: 24,
    color: Colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  inputSubTitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  inputLabel: {
    alignSelf: 'flex-start',
    fontSize: 12,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  input: {
    width: '100%',
    height: 40,
    paddingHorizontal: 10,
    marginBottom: 16,
    color: Colors.textPrimary,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 8,
  },
  inputLoginButton: {
    width: '100%',
    height: 40,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  inputLoginButtonText: {
    color: Colors.textInverted,
    fontSize: 16,
    fontWeight: '400',
  },
});
