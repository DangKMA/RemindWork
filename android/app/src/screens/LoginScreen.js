import React, {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const LoginScreen = ({navigation}) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  useEffect(() => {
    const loadAccountData = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem('email');
        const storedToken = await AsyncStorage.getItem('token');
        if (storedEmail && storedToken) {
          setEmail(storedEmail);
          navigation.navigate('MainScreen');
        }
      } catch (error) {
        console.error('Lỗi khi tải thông tin tài khoản:', error);
      }
    };

    loadAccountData();
  }, []);

  const validateEmail = email => {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return re.test(String(email).toLowerCase());
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Thông báo', 'Vui lòng nhập email và mật khẩu!');
      return;
    }
    try {
      const response = await fetch('http://172.20.10.2:3001/auth/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password}),
      });

      const data = await response.json();
      console.log();
      if (response.ok) {
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('email', email);
        console.log(data);
        Alert.alert('Thông báo', 'Đăng nhập thành công!');
        navigation.navigate('MainScreen');
      } else {
        Alert.alert(
          'Thông báo',
          'Thông tin tài khoản và mật khẩu chưa chính xác!',
        );
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi đăng nhập.');
      console.error('Lỗi xảy ra:', error);
    }
  };

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin!');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('Thông báo', 'Định dạng email không hợp lệ!');
      return;
    }
    try {
      const response = await fetch('http://172.20.10.2:3001/auth/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password}),
      });

      const data = await response.json();
      console.log(data);
      if (response.ok) {
        Alert.alert('Thông báo', 'Đăng ký thành công!');
      } else {
        Alert.alert(
          'Thông báo',
          'Tài khoản đã được sử dụng, hãy thay đổi tài khoản khác',
        );
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi đăng ký.');
      console.error('Lỗi xảy ra:', error);
    }
  };

  const handleSwitchTab = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setIsPasswordVisible(false);
    setIsLogin(!isLogin);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isLogin ? 'Đăng nhập' : 'Đăng ký'}</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.inputPassword}
          placeholder="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!isPasswordVisible}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={styles.icon}
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
          <Icon
            name={isPasswordVisible ? 'eye-slash' : 'eye'}
            size={15}
            color="gray"
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={isLogin ? handleLogin : handleRegister}>
        <Text style={styles.buttonText}>
          {isLogin ? 'Đăng nhập' : 'Đăng ký'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleSwitchTab}>
        <Text style={styles.switchText}>
          {isLogin ? (
            <>
              Chưa có tài khoản?{' '}
              <Text style={styles.highlightText}>Đăng ký</Text>
            </>
          ) : (
            <>
              Đã có tài khoản?{' '}
              <Text style={styles.highlightText}>Đăng nhập</Text>
            </>
          )}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  inputPassword: {
    flex: 1,
    paddingHorizontal: 10,
  },
  icon: {
    padding: 10,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: 'blue',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  switchText: {
    marginTop: 20,
    color: '#007BFF',
    fontSize: 16,
  },
  highlightText: {
    color: 'blue',
  },
});

export default LoginScreen;
